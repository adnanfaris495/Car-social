import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();
    
    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username and password are required' },
        { status: 400 }
      );
    }

    const cookieStore = await cookies();

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
          set(name: string, value: string, options: any) {
            try {
              cookieStore.set({ name, value, ...options });
            } catch (error) {
              // The `set` method was called from a Server Component.
              // This can be ignored if you have middleware refreshing
              // user sessions.
            }
          },
          remove(name: string, options: any) {
            try {
              cookieStore.set({ name, value: '', ...options });
            } catch (error) {
              // The `delete` method was called from a Server Component.
              // This can be ignored if you have middleware refreshing
              // user sessions.
            }
          },
        },
      }
    );

    console.log('Working username login attempt for:', username);

    // First, find the user by username to get their ID
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('username', username)
      .single();

    if (userError || !userData) {
      console.log('Username not found:', userError);
      return NextResponse.json(
        { error: 'Invalid username or password' },
        { status: 401 }
      );
    }

    console.log('Found user ID:', userData.id);

    // Use a raw SQL query to get the email from auth.users
    // This requires the database function to exist
    const { data: authData, error: authError } = await supabase
      .rpc('get_user_email_by_id', { user_id: userData.id });

    console.log('Auth lookup result:', { authData, authError });

    if (authError || !authData) {
      console.log('Auth lookup failed:', authError);
      
      // If the function doesn't exist, provide a helpful error
      if (authError && authError.message.includes('function')) {
        return NextResponse.json(
          { 
            error: 'Username login requires database setup. Please use your email address for now.',
            suggestion: 'Run the SQL script: scripts/create-username-login-function.sql'
          },
          { status: 401 }
        );
      }
      
      return NextResponse.json(
        { error: 'Invalid username or password' },
        { status: 401 }
      );
    }

    // Extract email from the array response
    const email = Array.isArray(authData) && authData.length > 0 ? authData[0].email : authData?.email;
    
    if (!email) {
      console.log('No email found for user');
      return NextResponse.json(
        { error: 'Invalid username or password' },
        { status: 401 }
      );
    }

    console.log('Found email:', email);

    // Now sign in with the actual email using the route handler client
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email,
      password
    });

    if (error) {
      console.log('Sign in failed:', error);
      return NextResponse.json(
        { error: 'Invalid username or password' },
        { status: 401 }
      );
    }

    console.log('Sign in successful');
    
    // The session should be automatically set in cookies by the route handler client
    // Just return success - the client will get the session from cookies
    return NextResponse.json({ 
      success: true, 
      user: data.user
    });
  } catch (error) {
    console.error('Username login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 
import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
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

    const supabase = createRouteHandlerClient({ cookies });

    console.log('Direct username login attempt for:', username);

    // Try to sign in directly with the username as email
    // This will fail, but we'll catch the error and provide a helpful message
    const { data, error } = await supabase.auth.signInWithPassword({
      email: username,
      password
    });

    if (error) {
      console.log('Direct login failed:', error.message);
      
      // Check if the username exists in our users table
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id')
        .eq('username', username)
        .single();

      if (userError || !userData) {
        return NextResponse.json(
          { error: 'Invalid username or password' },
          { status: 401 }
        );
      }

      // Username exists but direct login failed
      // This means the user needs to use their email address
      return NextResponse.json(
        { 
          error: 'Please use your email address to sign in. Username login requires additional setup.',
          suggestion: 'Try signing in with your email address instead.'
        },
        { status: 401 }
      );
    }

    console.log('Direct login successful');
    return NextResponse.json({ success: true, user: data.user });
  } catch (error) {
    console.error('Username login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 
'use client';

import { useEffect, useState } from 'react';
import { useSession } from '@supabase/auth-helpers-react';
import { supabase } from '@/lib/supabase';

export default function SessionPersistence() {
  const session = useSession();
  const [hasInitialized, setHasInitialized] = useState(false);

  useEffect(() => {
    // Only refresh session once on mount if we don't have one
    const refreshSession = async () => {
      if (hasInitialized || session) return;
      
      try {
        const { data, error } = await supabase.auth.getSession();
        console.log('SessionPersistence: Session refreshed', { data, error });
        setHasInitialized(true);
      } catch (error) {
        console.error('Error refreshing session:', error);
        setHasInitialized(true);
      }
    };

    refreshSession();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.id);
      }
    );

    return () => subscription.unsubscribe();
  }, [hasInitialized, session]);

  return null; // This component doesn't render anything
} 
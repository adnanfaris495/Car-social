import { useEffect, useState } from 'react';
import { useSession } from '@supabase/auth-helpers-react';
import { supabase } from '@/lib/supabase';

export function useSessionRefresh() {
  const session = useSession();
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    // Only refresh session if we don't have one and we're not already refreshing
    const refreshSession = async () => {
      if (isRefreshing || session) return;
      
      setIsRefreshing(true);
      try {
        const { data, error } = await supabase.auth.getSession();
        console.log('useSessionRefresh: Session data', { data, error });
        if (error) {
          console.error('Error refreshing session:', error);
        }
      } catch (error) {
        console.error('Error in session refresh:', error);
      } finally {
        setIsRefreshing(false);
      }
    };

    refreshSession();
  }, [isRefreshing, session]);

  return session;
} 
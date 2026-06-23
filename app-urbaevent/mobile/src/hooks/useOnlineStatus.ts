import { useCallback, useEffect, useRef, useState } from 'react';
import { supabase } from '../lib/supabase';

export function useOnlineStatus(pollMs = 30000) {
  const [online, setOnline] = useState(true);
  const cancelledRef = useRef(false);

  const check = useCallback(async () => {
    try {
      const { error } = await supabase.from('users').select('id', { head: true, count: 'exact' });
      if (!cancelledRef.current) setOnline(!error);
    } catch {
      if (!cancelledRef.current) setOnline(false);
    }
  }, []);

  useEffect(() => {
    cancelledRef.current = false;
    check();
    const timer = setInterval(check, pollMs);
    return () => {
      cancelledRef.current = true;
      clearInterval(timer);
    };
  }, [check, pollMs]);

  return online;
}

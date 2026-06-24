import * as Linking from 'expo-linking';
import { router } from 'expo-router';
import { useEffect } from 'react';
import { peekPendingAuthDeepLink, stashAuthDeepLink } from '../lib/pendingAuthDeepLink';

/** Capture le deep link auth avant qu'Expo Router ne perde la query (Android). */
export function AuthDeepLinkCapture() {
  useEffect(() => {
    const capture = (url: string | null) => {
      stashAuthDeepLink(url);
      if (peekPendingAuthDeepLink()) {
        setTimeout(() => router.replace('/(auth)/auth-callback' as never), 0);
      }
    };
    Linking.getInitialURL().then(capture);
    const sub = Linking.addEventListener('url', ({ url }) => capture(url));
    return () => sub.remove();
  }, []);
  return null;
}

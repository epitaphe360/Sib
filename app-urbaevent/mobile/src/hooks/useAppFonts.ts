import { Ionicons } from '@expo/vector-icons';
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from '@expo-google-fonts/inter';
import {
  PlayfairDisplay_600SemiBold,
  PlayfairDisplay_700Bold,
} from '@expo-google-fonts/playfair-display';
import { useFonts } from 'expo-font';
import { useEffect, useState } from 'react';

const FONT_TIMEOUT_MS = 2500;

export function useAppFonts() {
  const [loaded] = useFonts({
    ...Ionicons.font,
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    PlayfairDisplay_600SemiBold,
    PlayfairDisplay_700Bold,
  });
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (loaded) {
      setReady(true);
      return;
    }
    const timer = setTimeout(() => setReady(true), FONT_TIMEOUT_MS);
    return () => clearTimeout(timer);
  }, [loaded]);

  return ready;
}

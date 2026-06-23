import { Audio } from 'expo-av';

let ready = false;

async function ensureAudio() {
  if (ready) return;
  await Audio.setAudioModeAsync({ playsInSilentModeIOS: true });
  ready = true;
}

/** Bip court — succès (granted) */
export async function playScanSuccess(): Promise<void> {
  try {
    await ensureAudio();
    const { sound } = await Audio.Sound.createAsync(
      { uri: 'https://actions.google.com/sounds/v1/cartoon/pop.ogg' },
      { shouldPlay: true, volume: 0.8 }
    );
    sound.setOnPlaybackStatusUpdate((s) => {
      if (s.isLoaded && s.didJustFinish) sound.unloadAsync();
    });
  } catch {
    // Audio optionnel
  }
}

/** Bip grave — refus (denied) */
export async function playScanError(): Promise<void> {
  try {
    await ensureAudio();
    const { sound } = await Audio.Sound.createAsync(
      { uri: 'https://actions.google.com/sounds/v1/cartoon/clang_and_wobble.ogg' },
      { shouldPlay: true, volume: 0.8 }
    );
    sound.setOnPlaybackStatusUpdate((s) => {
      if (s.isLoaded && s.didJustFinish) sound.unloadAsync();
    });
  } catch {
    // Audio optionnel
  }
}

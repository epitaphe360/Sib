import { Audio, ResizeMode, Video } from 'expo-av';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { WebView } from 'react-native-webview';
import { buildEmbedHtml, resolveMediaSource } from '../../lib/mediaUrl';
import { useI18n } from '../../i18n/I18nProvider';
import { colors, fonts, radius, spacing } from '../../theme';

type Props = {
  videoUrl?: string | null;
  audioUrl?: string | null;
  thumbnailUrl?: string | null;
  title?: string;
};

export function MediaNativePlayer({ videoUrl, audioUrl, thumbnailUrl, title }: Props) {
  const { t } = useI18n();
  const videoRef = useRef<Video>(null);
  const soundRef = useRef<Audio.Sound | null>(null);
  const [audioLoading, setAudioLoading] = useState(false);
  const [audioPlaying, setAudioPlaying] = useState(false);
  const { url, kind } = resolveMediaSource(videoUrl, audioUrl);

  useEffect(() => {
    return () => {
      soundRef.current?.unloadAsync().catch(() => undefined);
    };
  }, []);

  useEffect(() => {
    soundRef.current?.unloadAsync().catch(() => undefined);
    soundRef.current = null;
    setAudioPlaying(false);
  }, [url]);

  if (!url) {
    return (
      <View style={styles.empty}>
        {thumbnailUrl ? <Image source={{ uri: thumbnailUrl }} style={styles.poster} /> : null}
        <Text style={styles.emptyText}>{t('media.noStream')}</Text>
      </View>
    );
  }

  if (kind === 'youtube' || kind === 'vimeo') {
    const html = buildEmbedHtml(url);
    if (!html) {
      return (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>{t('media.invalidStream')}</Text>
        </View>
      );
    }
    return (
      <View style={styles.player}>
        <WebView
          source={{ html }}
          style={styles.webview}
          allowsFullscreenVideo
          allowsInlineMediaPlayback
          mediaPlaybackRequiresUserAction={false}
          javaScriptEnabled
          domStorageEnabled
        />
      </View>
    );
  }

  if (kind === 'audio') {
    const toggleAudio = async () => {
      try {
        if (soundRef.current) {
          const status = await soundRef.current.getStatusAsync();
          if (status.isLoaded && status.isPlaying) {
            await soundRef.current.pauseAsync();
            setAudioPlaying(false);
            return;
          }
          if (status.isLoaded) {
            await soundRef.current.playAsync();
            setAudioPlaying(true);
            return;
          }
        }
        setAudioLoading(true);
        await Audio.setAudioModeAsync({ playsInSilentModeIOS: true });
        const { sound } = await Audio.Sound.createAsync({ uri: url }, { shouldPlay: true });
        soundRef.current = sound;
        setAudioPlaying(true);
      } finally {
        setAudioLoading(false);
      }
    };

    return (
      <View style={styles.audioWrap}>
        {thumbnailUrl ? <Image source={{ uri: thumbnailUrl }} style={styles.audioPoster} /> : null}
        {title ? <Text style={styles.audioTitle}>{title}</Text> : null}
        <Text style={styles.audioHint}>{t('media.podcastHint')}</Text>
        <Pressable style={styles.audioBtn} onPress={toggleAudio} disabled={audioLoading}>
          {audioLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.audioBtnText}>
              {audioPlaying ? t('media.pause') : t('media.play')}
            </Text>
          )}
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.player}>
      <Video
        ref={videoRef}
        source={{ uri: url }}
        style={styles.video}
        useNativeControls
        resizeMode={ResizeMode.CONTAIN}
        posterSource={thumbnailUrl ? { uri: thumbnailUrl } : undefined}
        shouldPlay={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  player: {
    width: '100%',
    aspectRatio: 16 / 9,
    backgroundColor: '#000',
    borderRadius: radius.lg,
    overflow: 'hidden',
    marginBottom: spacing.md,
  },
  video: { width: '100%', height: '100%' },
  webview: { flex: 1, backgroundColor: '#000' },
  empty: {
    width: '100%',
    aspectRatio: 16 / 9,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  poster: { ...StyleSheet.absoluteFillObject, opacity: 0.35 },
  emptyText: {
    fontFamily: fonts.body,
    color: colors.textMuted,
    textAlign: 'center',
    paddingHorizontal: spacing.lg,
    fontSize: 14,
  },
  audioWrap: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  audioPoster: {
    width: '100%',
    height: 160,
    borderRadius: radius.md,
    marginBottom: spacing.md,
  },
  audioTitle: {
    fontFamily: fonts.bodyBold,
    fontSize: 16,
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  audioHint: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.textMuted,
    marginBottom: spacing.md,
  },
  audioBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    minWidth: 140,
    alignItems: 'center',
  },
  audioBtnText: {
    fontFamily: fonts.bodyBold,
    fontSize: 15,
    color: '#fff',
  },
});

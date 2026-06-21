import { router } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Easing,
  Image,
  LayoutChangeEvent,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { fetchExhibitors } from '../../services/exhibitors';
import { useI18n } from '../../i18n/I18nProvider';
import type { Exhibitor } from '../../types';
import { PressableScale } from '../PressableScale';
import { colors, fonts, radius, shadows, spacing } from '../../theme';

const LOGO_SIZE = 56;
const TILE_WIDTH = 88;
const TILE_GAP = 12;
const SCROLL_SPEED = 40;

function sortExhibitors(items: Exhibitor[]): Exhibitor[] {
  return [...items].sort((a, b) => {
    const aScore = (a.featured ? 2 : 0) + (a.logoUrl ? 1 : 0);
    const bScore = (b.featured ? 2 : 0) + (b.logoUrl ? 1 : 0);
    return bScore - aScore || a.companyName.localeCompare(b.companyName);
  });
}

function LogoTile({ exhibitor }: { exhibitor: Exhibitor }) {
  return (
    <PressableScale
      style={styles.tile}
      onPress={() => router.push(`/exhibitor/${exhibitor.id}`)}
      accessibilityRole="button"
      accessibilityLabel={exhibitor.companyName}
    >
      {exhibitor.logoUrl ? (
        <Image source={{ uri: exhibitor.logoUrl }} style={styles.logo} resizeMode="contain" />
      ) : (
        <View style={[styles.logo, styles.logoPlaceholder]}>
          <Text style={styles.logoLetter}>{exhibitor.companyName.charAt(0).toUpperCase()}</Text>
        </View>
      )}
      <Text style={styles.name} numberOfLines={1}>
        {exhibitor.companyName}
      </Text>
    </PressableScale>
  );
}

export function ExhibitorLogoMarquee() {
  const { t } = useI18n();
  const [exhibitors, setExhibitors] = useState<Exhibitor[]>([]);
  const [loading, setLoading] = useState(true);
  const [trackWidth, setTrackWidth] = useState(0);
  const scrollX = useRef(new Animated.Value(0)).current;
  const animRef = useRef<Animated.CompositeAnimation | null>(null);

  useEffect(() => {
    fetchExhibitors()
      .then(({ items }) => setExhibitors(sortExhibitors(items)))
      .catch(() => setExhibitors([]))
      .finally(() => setLoading(false));
  }, []);

  const loopItems = useMemo(() => {
    if (exhibitors.length === 0) return [];
    return [...exhibitors, ...exhibitors];
  }, [exhibitors]);

  const onTrackLayout = (e: LayoutChangeEvent) => {
    const half = e.nativeEvent.layout.width / 2;
    if (half > 0) setTrackWidth(half);
  };

  useEffect(() => {
    animRef.current?.stop();
    if (trackWidth <= 0 || exhibitors.length < 2) return;

    scrollX.setValue(0);
    const duration = (trackWidth / SCROLL_SPEED) * 1000;
    animRef.current = Animated.loop(
      Animated.timing(scrollX, {
        toValue: -trackWidth,
        duration,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );
    animRef.current.start();
    return () => animRef.current?.stop();
  }, [trackWidth, exhibitors.length, scrollX]);

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  if (exhibitors.length === 0) {
    return <Text style={styles.empty}>{t('home.exhibitorsMarqueeEmpty')}</Text>;
  }

  return (
    <View style={styles.wrap}>
      <Animated.View
        style={[styles.track, { transform: [{ translateX: scrollX }] }]}
        onLayout={onTrackLayout}
      >
        {loopItems.map((exhibitor, index) => (
          <LogoTile key={`${exhibitor.id}-${index}`} exhibitor={exhibitor} />
        ))}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    overflow: 'hidden',
    marginHorizontal: -spacing.xs,
  },
  track: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: TILE_GAP,
    paddingHorizontal: spacing.xs,
  },
  tile: {
    width: TILE_WIDTH,
    alignItems: 'center',
  },
  logo: {
    width: LOGO_SIZE,
    height: LOGO_SIZE,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderLight,
    ...shadows.sm,
  },
  logoPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
  logoLetter: {
    fontFamily: fonts.display,
    fontSize: 22,
    color: colors.primary,
  },
  name: {
    marginTop: 6,
    fontSize: 10,
    fontFamily: fonts.bodyMedium,
    color: colors.textMuted,
    textAlign: 'center',
    width: TILE_WIDTH,
  },
  loader: {
    paddingVertical: spacing.lg,
    alignItems: 'center',
  },
  empty: {
    fontSize: 13,
    fontFamily: fonts.body,
    color: colors.textMuted,
    fontStyle: 'italic',
  },
});

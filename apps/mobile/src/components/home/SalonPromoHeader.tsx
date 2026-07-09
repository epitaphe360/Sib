import { router } from 'expo-router';
import { ImageBackground, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { resolveAppImageSource } from '../../api/appContent';
import { AppIcon } from '../AppIcon';
import { useSalon } from '../../context/SalonContext';
import { SALON_IMAGES } from '../../data/images';
import { getUrbaSalonTheme, resolveSalonThemeKey } from '../../data/urbaCatalog';
import { useAppContent } from '../../hooks/useAppContent';
import { useAuth } from '../../context/AuthContext';
import { useI18n } from '../../i18n/I18nProvider';
import type { Salon } from '../../types';
import { fonts, radius, spacing } from '../../theme';

type Props = {
  salon: Salon;
};

export function SalonPromoHeader({ salon }: Props) {
  const insets = useSafeAreaInsets();
  const { clearActiveSalon } = useSalon();
  const { content } = useAppContent();
  const { user } = useAuth();
  const { t } = useI18n();
  const themeKey = resolveSalonThemeKey(salon);
  const theme = getUrbaSalonTheme(salon, content.salonStats);
  const bgSource = resolveAppImageSource(
    themeKey,
    theme.image ?? SALON_IMAGES[themeKey] ?? SALON_IMAGES.sib,
    content.images,
    content.updatedAt,
  );

  return (
    <ImageBackground source={bgSource} style={styles.wrap} imageStyle={styles.image} resizeMode="cover">
      <View style={styles.overlay} />
      <View style={[styles.topBar, { paddingTop: insets.top + spacing.xs }]}>
        <Pressable
          onPress={async () => {
            await clearActiveSalon();
            router.replace('/(visitor)/(tabs)' as never);
          }}
          style={styles.iconBtn}
          accessibilityRole="button"
          accessibilityLabel={t('common.back')}
        >
          <AppIcon name="arrow-back-outline" size={22} color="#1B365D" />
        </Pressable>
        <Pressable
          onPress={() => router.push((user ? '/(visitor)/news' : '/(auth)/login') as never)}
          style={styles.iconBtn}
          accessibilityRole="button"
          accessibilityLabel={t('news.title')}
        >
          <AppIcon name="notifications-outline" size={22} color="#1B365D" />
        </Pressable>
      </View>
      <View style={styles.promoBody}>
        <Text style={styles.promoDates}>{salon.dates ?? theme.edition}</Text>
        <Text style={styles.promoVenue} numberOfLines={2}>
          {salon.location ? `${salon.location} — Maroc` : theme.location}
        </Text>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  wrap: {
    height: 200,
    marginBottom: -36,
  },
  image: { borderBottomLeftRadius: 0, borderBottomRightRadius: 0 },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15, 35, 65, 0.55)',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    zIndex: 2,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: radius.full,
    backgroundColor: 'rgba(255,255,255,0.95)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  promoBody: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.lg + 28,
  },
  promoDates: {
    color: '#fff',
    fontFamily: fonts.bodyBold,
    fontSize: 13,
    marginBottom: 4,
  },
  promoVenue: {
    color: 'rgba(255,255,255,0.92)',
    fontFamily: fonts.body,
    fontSize: 12,
    lineHeight: 17,
  },
});

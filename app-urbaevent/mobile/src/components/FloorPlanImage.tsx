import { Platform, ScrollView, useWindowDimensions } from 'react-native';
import { Image, StyleSheet, Text, View } from 'react-native';
import { APP_IMAGES } from '../data/images';
import { useI18n } from '../i18n/I18nProvider';
import { colors, fonts, radius, spacing } from '../theme';

/** Plan isométrique 3D du salon — 1024×576 px */
export const FLOOR_PLAN_ASPECT = 576 / 1024;

type Props = {
  remoteUrl?: string | null;
};

export function FloorPlanImage({ remoteUrl }: Props) {
  const { t } = useI18n();
  const { width } = useWindowDimensions();
  const planWidth = width - spacing.md * 2;
  const planHeight = planWidth * FLOOR_PLAN_ASPECT;
  const source = remoteUrl ? { uri: remoteUrl } : APP_IMAGES.plan;

  return (
    <View style={styles.wrap}>
      <ScrollView
        style={styles.zoomScroll}
        contentContainerStyle={styles.zoomContent}
        maximumZoomScale={Platform.OS === 'ios' ? 3 : 1}
        minimumZoomScale={1}
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        centerContent
      >
        <Image source={source} style={{ width: planWidth, height: planHeight }} resizeMode="contain" />
      </ScrollView>
      <Text style={styles.caption}>{t('map.planHint')}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    borderRadius: radius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.borderLight,
    backgroundColor: '#0A1628',
    marginBottom: spacing.md,
  },
  zoomScroll: { maxHeight: 420 },
  zoomContent: { alignItems: 'center', padding: spacing.xs },
  caption: {
    fontFamily: fonts.body,
    fontSize: 11,
    color: 'rgba(255,255,255,0.55)',
    textAlign: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    backgroundColor: '#0A1628',
  },
});

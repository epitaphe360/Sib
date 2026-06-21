import { useWindowDimensions } from 'react-native';
import { Image, StyleSheet, Text, View } from 'react-native';
import { APP_IMAGES } from '../data/images';
import { useI18n } from '../i18n/I18nProvider';
import { colors, fonts, radius, spacing } from '../theme';

/** Plan général SIB 2026 — export PDF 10-04-26, page 1 @ 2.5× */
export const FLOOR_PLAN_ASPECT = 3094 / 2176;

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
      <Image source={source} style={{ width: planWidth, height: planHeight }} resizeMode="contain" />
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
    backgroundColor: '#fff',
    marginBottom: spacing.md,
    padding: spacing.xs,
  },
  caption: {
    fontFamily: fonts.body,
    fontSize: 11,
    color: colors.textMuted,
    textAlign: 'center',
    paddingTop: spacing.xs,
    paddingHorizontal: spacing.sm,
  },
});

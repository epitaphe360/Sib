import { StyleSheet, Text, View } from 'react-native';
import { URBA_PLATFORM_STATS } from '../../data/urbaCatalog';
import { useAppTheme } from '../../context/ThemeContext';
import { useI18n } from '../../i18n/I18nProvider';
import { fonts, radius, spacing } from '../../theme';

export function HomePlatformStats() {
  const { t } = useI18n();
  const { colors, isDark } = useAppTheme();

  return (
    <View
      style={[
        styles.wrap,
        {
          backgroundColor: colors.surface,
          borderColor: colors.cardBorder,
          shadowOpacity: isDark ? 0 : 0.06,
        },
      ]}
    >
      {URBA_PLATFORM_STATS.map((stat, index) => (
        <View
          key={stat.labelKey}
          style={[
            styles.cell,
            index < URBA_PLATFORM_STATS.length - 1 && {
              borderRightWidth: StyleSheet.hairlineWidth,
              borderRightColor: colors.border,
            },
          ]}
        >
          <Text style={[styles.value, { color: colors.primary }]}>{stat.value}</Text>
          <Text style={[styles.label, { color: colors.textMuted }]} numberOfLines={1}>
            {t(stat.labelKey)}
          </Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    marginHorizontal: spacing.md,
    marginBottom: spacing.lg,
    borderRadius: radius.lg,
    borderWidth: 1,
    shadowColor: '#0F2138',
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 2,
    overflow: 'hidden',
  },
  cell: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: 4,
  },
  value: {
    fontFamily: fonts.displayMedium,
    fontSize: 20,
    lineHeight: 24,
  },
  label: {
    fontFamily: fonts.bodyMedium,
    fontSize: 10,
    marginTop: 2,
    textAlign: 'center',
  },
});

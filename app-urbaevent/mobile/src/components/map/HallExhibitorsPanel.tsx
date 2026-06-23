import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { ExhibitorRow } from '../ExhibitorRow';
import { PrimaryButton } from '../ui';
import { useI18n } from '../../i18n/I18nProvider';
import type { Exhibitor } from '../../types';
import { colors, fonts, radius, spacing } from '../../theme';

type Props = {
  hall: string;
  exhibitors: Exhibitor[];
  onClear: () => void;
};

export function HallExhibitorsPanel({ hall, exhibitors, onClear }: Props) {
  const { t } = useI18n();

  if (!hall) return null;

  const openSingle = (ex: Exhibitor) => {
    router.push(`/minisite/${ex.id}` as never);
  };

  return (
    <View style={styles.panel}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>
            {t('map.hallExhibitors').replace('{{hall}}', hall).replace('{{count}}', String(exhibitors.length))}
          </Text>
          <Text style={styles.sub}>{t('map.tapExhibitor')}</Text>
        </View>
        <Pressable onPress={onClear} hitSlop={12} accessibilityRole="button">
          <Text style={styles.clear}>{t('map.allHalls')}</Text>
        </Pressable>
      </View>

      {exhibitors.length === 0 ? (
        <Text style={styles.empty}>{t('map.noExhibitorsInHall')}</Text>
      ) : (
        <>
          {exhibitors.slice(0, 6).map((ex) => (
            <ExhibitorRow key={ex.id} exhibitor={ex} onPress={() => openSingle(ex)} />
          ))}
          {exhibitors.length === 1 ? (
            <PrimaryButton
              label={t('map.openExhibitor')}
              variant="gold"
              onPress={() => openSingle(exhibitors[0])}
            />
          ) : exhibitors.length > 6 ? (
            <Text style={styles.more}>
              {t('map.moreExhibitors').replace('{{count}}', String(exhibitors.length - 6))}
            </Text>
          ) : null}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.gold,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  title: {
    fontFamily: fonts.bodyBold,
    fontSize: 16,
    color: colors.text,
  },
  sub: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
  clear: {
    fontFamily: fonts.bodyBold,
    fontSize: 13,
    color: colors.primary,
  },
  empty: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.textMuted,
    textAlign: 'center',
    paddingVertical: spacing.md,
  },
  more: {
    fontFamily: fonts.bodyMedium,
    fontSize: 12,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
});

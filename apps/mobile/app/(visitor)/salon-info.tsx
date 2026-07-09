import { Linking, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SalonGate } from '../../src/components/guards/SalonGate';
import { PrimaryButton, Screen } from '../../src/components/ui';
import { useAppContent } from '../../src/hooks/useAppContent';
import { getSalonCmsFields } from '../../src/lib/salonCms';
import { useSalon } from '../../src/context/SalonContext';
import { useI18n } from '../../src/i18n/I18nProvider';
import { colors, fonts, radius, spacing } from '../../src/theme';

function InfoRow({ label, value }: { label: string; value: string }) {
  if (!value.trim()) return null;
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  );
}

export default function SalonInfoScreen() {
  const { activeSalon } = useSalon();
  const { content } = useAppContent();
  const { t } = useI18n();
  const cms = activeSalon ? getSalonCmsFields(activeSalon, content.salonStats) : null;

  return (
    <SalonGate>
      <Screen style={styles.screen}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <Text style={styles.title}>{t('salon.menu.info')}</Text>
          <Text style={styles.subtitle}>{activeSalon?.name ?? cms?.tagline ?? ''}</Text>

          {cms ? (
            <>
              <View style={styles.card}>
                <InfoRow label={t('salon.info.dates')} value={activeSalon?.dates ?? ''} />
                <InfoRow label={t('salon.info.hours')} value={cms.hours} />
                <InfoRow label={t('salon.info.venue')} value={cms.venue} />
                <InfoRow label={t('salon.info.city')} value={cms.city} />
                <InfoRow label={t('salon.info.note')} value={cms.startDayNote} />
              </View>

              <View style={styles.card}>
                <InfoRow label={t('salon.info.exhibitors')} value={cms.exhibitorsStat} />
                <InfoRow label={t('salon.info.visitors')} value={cms.visitors} />
                <InfoRow label={t('salon.info.countries')} value={cms.countriesStat} />
              </View>

              <View style={styles.card}>
                <InfoRow label={t('salon.info.email')} value={cms.contactEmail} />
                <InfoRow label={t('salon.info.website')} value={cms.website} />
              </View>

              {cms.website ? (
                <PrimaryButton
                  label={t('salon.info.openWebsite')}
                  variant="outline"
                  onPress={() => void Linking.openURL(cms.website)}
                />
              ) : null}
            </>
          ) : null}
        </ScrollView>
      </Screen>
    </SalonGate>
  );
}

const styles = StyleSheet.create({
  screen: { padding: 0 },
  scroll: { padding: spacing.md, paddingBottom: spacing.xl, gap: spacing.md },
  title: {
    fontFamily: fonts.display,
    fontSize: 22,
    color: colors.text,
  },
  subtitle: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.textMuted,
    marginBottom: spacing.sm,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    gap: spacing.sm,
  },
  row: { gap: 4 },
  label: {
    fontFamily: fonts.bodyBold,
    fontSize: 11,
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  value: {
    fontFamily: fonts.body,
    fontSize: 15,
    color: colors.text,
    lineHeight: 22,
  },
});

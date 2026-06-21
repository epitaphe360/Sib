import { router } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native'; // eslint-disable-line
import { PrimaryButton, Screen, ScreenTitle } from '../../src/components/ui';
import { useAuth } from '../../src/context/AuthContext';
import { checkAttendance, generateAndShareCertificate, requestCertificate } from '../../src/api/certificate';
import { useI18n } from '../../src/i18n/I18nProvider';
import { SALON_INFO } from '../../src/data/salons';
import { colors, fonts, radius, shadows, spacing } from '../../src/theme';

export default function CertificateScreen() {
  const { user } = useAuth();
  const { t } = useI18n();
  const [hasAttended, setHasAttended] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);

  const checkStatus = useCallback(async () => {
    if (!user) return;
    try {
      const attended = await checkAttendance(user.id);
      setHasAttended(attended);
    } catch {
      setHasAttended(false);
    } finally {
      setChecking(false);
    }
  }, [user]);

  useEffect(() => { checkStatus(); }, [checkStatus]);

  const download = async () => {
    if (!user) return;
    setLoading(true);
    try {
      await requestCertificate(user.id);
      await generateAndShareCertificate(user);
    } catch (e) {
      Alert.alert(t('common.error'), e instanceof Error ? e.message : t('certificate.error'));
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <Screen>
        <ScreenTitle title={t('certificate.title')} subtitle={t('certificate.subtitle')} />
        <PrimaryButton label={t('login.submit')} onPress={() => router.push('/(auth)/login')} />
      </Screen>
    );
  }

  return (
    <Screen>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <ScreenTitle title={t('certificate.title')} subtitle={t('certificate.subtitle')} />

        {/* Aperçu certificat */}
        <View style={styles.certPreview}>
          <View style={styles.goldBar} />
          <Text style={styles.certSalon}>{SALON_INFO.name}</Text>
          <Text style={styles.certMainTitle}>Certificat de participation</Text>
          <View style={styles.divider} />
          <Text style={styles.certCertifies}>Délivré à</Text>
          <Text style={styles.certName}>{user.name}</Text>
          <View style={styles.roleChip}>
            <Text style={styles.roleChipText}>
              {user.type === 'visitor' ? 'Visiteur' : user.type === 'exhibitor' ? 'Exposant' : 'Participant'}
            </Text>
          </View>
          <Text style={styles.certEvent}>Salon International du Bâtiment</Text>
          <Text style={styles.certDates}>{SALON_INFO.dates} · {SALON_INFO.city}</Text>
        </View>

        {checking ? (
          <Text style={styles.checking}>{t('common.loading')}</Text>
        ) : hasAttended ? (
          <>
            <View style={styles.statusCard}>
              <Text style={styles.statusIcon}>✅</Text>
              <Text style={styles.statusTitle}>{t('certificate.attendanceConfirmed')}</Text>
              <Text style={styles.statusBody}>{t('certificate.readyToDownload')}</Text>
            </View>
            <PrimaryButton
              label={loading ? t('common.loading') : t('certificate.download')}
              onPress={download}
              loading={loading}
              variant="gold"
            />
          </>
        ) : (
          <View style={styles.warningCard}>
            <Text style={styles.statusIcon}>ℹ️</Text>
            <Text style={styles.statusTitle}>{t('certificate.noAttendance')}</Text>
            <Text style={styles.statusBody}>{t('certificate.noAttendanceHint')}</Text>
          </View>
        )}

        <View style={{ height: spacing.sm }} />
        <PrimaryButton label={t('common.back')} variant="outline" onPress={() => router.back()} />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingBottom: spacing.xl },
  certPreview: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 2,
    borderColor: colors.gold,
    padding: spacing.lg,
    alignItems: 'center',
    marginBottom: spacing.lg,
    ...shadows.md,
  },
  goldBar: { width: '100%', height: 5, backgroundColor: colors.gold, borderRadius: 3, marginBottom: spacing.md },
  certSalon: { fontFamily: fonts.display, fontSize: 24, color: colors.primaryDark, letterSpacing: 2, marginBottom: spacing.xs },
  certMainTitle: { fontFamily: fonts.body, fontSize: 13, color: colors.textMuted, marginBottom: spacing.sm },
  divider: { width: 60, height: 2, backgroundColor: colors.gold, marginBottom: spacing.sm },
  certCertifies: { fontFamily: fonts.body, fontSize: 12, color: colors.textMuted, marginBottom: spacing.xs },
  certName: { fontFamily: fonts.display, fontSize: 22, color: colors.primaryDark, textAlign: 'center', marginBottom: spacing.sm },
  roleChip: { backgroundColor: colors.primaryDark, paddingHorizontal: spacing.md, paddingVertical: spacing.xs, borderRadius: radius.full, marginBottom: spacing.md },
  roleChipText: { color: colors.gold, fontFamily: fonts.bodyBold, fontSize: 11, textTransform: 'uppercase', letterSpacing: 1 },
  certEvent: { fontFamily: fonts.bodyBold, fontSize: 14, color: colors.primaryDark, textAlign: 'center', marginBottom: spacing.xs },
  certDates: { fontFamily: fonts.body, fontSize: 12, color: colors.textMuted },
  checking: { textAlign: 'center', color: colors.textMuted, fontFamily: fonts.body },
  statusCard: { alignItems: 'center', padding: spacing.lg, marginBottom: spacing.md, backgroundColor: colors.surface, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border },
  warningCard: { alignItems: 'center', padding: spacing.lg, marginBottom: spacing.md, backgroundColor: colors.warningBg, borderColor: colors.warning, borderWidth: 1, borderRadius: radius.lg },
  statusIcon: { fontSize: 32, marginBottom: spacing.sm },
  statusTitle: { fontFamily: fonts.bodyBold, fontSize: 16, color: colors.text, textAlign: 'center', marginBottom: spacing.xs },
  statusBody: { fontFamily: fonts.body, fontSize: 14, color: colors.textMuted, textAlign: 'center', lineHeight: 20 },
});

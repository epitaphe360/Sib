import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { replaceBadge } from '../../src/api/serviceClient';
import { lookupParticipant } from '../../src/api/serviceClient';
import { Input, PrimaryButton, Screen, ScreenTitle, SecondaryButton } from '../../src/components/ui';
import { useAuth } from '../../src/context/AuthContext';
import { useI18n } from '../../src/i18n/I18nProvider';
import { colors, fonts, radius, spacing } from '../../src/theme';

const REASONS = [
  'Badge perdu',
  'Badge endommagé (illisible)',
  'Badge volé',
  'Erreur sur le badge',
  'Autre',
];

export default function BadgeReplacementScreen() {
  const { userId: initialUserId } = useLocalSearchParams<{ userId?: string }>();
  const { user } = useAuth();
  const { t } = useI18n();
  const [email, setEmail] = useState('');
  const [userId, setUserId] = useState(initialUserId ?? '');
  const [participantName, setParticipantName] = useState('');
  const [reason, setReason] = useState(REASONS[0]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [looked, setLooked] = useState(!!initialUserId);

  const lookup = async () => {
    if (!email.trim()) return;
    setLoading(true);
    try {
      const result = await lookupParticipant(email.trim());
      if (!result.found || !result.userId) {
        Alert.alert(t('common.error'), result.error ?? t('lookup.notFound'));
        return;
      }
      setUserId(result.userId);
      setParticipantName(result.name ?? '');
      setLooked(true);
    } catch (e) {
      Alert.alert(t('common.error'), e instanceof Error ? e.message : t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  const submit = async () => {
    if (!userId || !user) return;
    Alert.alert(
      t('badgeReplacement.confirmTitle'),
      `${t('badgeReplacement.subtitle')}\n\n${participantName || userId}\n${t('badgeReplacement.reason')} : ${reason}`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Remplacer',
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            try {
              const result = await replaceBadge({ userId, reason, operatorId: user.id });
              setSuccess(result.newBadgeCode);
            } catch (e) {
              Alert.alert(t('common.error'), e instanceof Error ? e.message : '');
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  if (success) {
    return (
      <Screen>
        <ScrollView contentContainerStyle={styles.successContainer}>
          <Text style={styles.successTitle}>{t('badgeReplacement.successTitle')}</Text>
          <Text style={styles.successFor}>{participantName}</Text>
          <View style={styles.newCodeBox}>
            <Text style={styles.newCodeLabel}>{t('badgeReplacement.newCodeLabel')}</Text>
            <Text style={styles.newCode}>{success}</Text>
          </View>
          <PrimaryButton
            label={t('badgeReplacement.printNew')}
            variant="gold"
            onPress={() => router.push('/(service-client)/(tabs)/lookup' as never)}
          />
          <View style={{ height: spacing.sm }} />
          <SecondaryButton label={t('badgeReplacement.newReplacement')} onPress={() => { setSuccess(null); setLooked(false); setUserId(''); setEmail(''); }} />
        </ScrollView>
      </Screen>
    );
  }

  return (
    <Screen>
      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.scroll}>
        <ScreenTitle title={t('badgeReplacement.title')} subtitle={t('badgeReplacement.subtitle')} />

        {!looked ? (
          <>
            <Input
              label="Email du participant"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              placeholder="participant@email.com"
              returnKeyType="search"
              onSubmitEditing={lookup}
            />
            <PrimaryButton label={t('common.search')} onPress={lookup} loading={loading} disabled={!email.trim()} />
          </>
        ) : (
          <>
            <View style={styles.participantCard}>
              <Text style={styles.participantName}>{participantName || userId}</Text>
              <Text style={styles.participantId}>ID : {userId.slice(0, 12)}…</Text>
              <SecondaryButton label={t('badgeReplacement.changeParticipant')} onPress={() => { setLooked(false); setUserId(''); setEmail(''); }} />
            </View>

            <Text style={styles.sectionTitle}>{t('badgeReplacement.reason')} *</Text>
            {REASONS.map((r) => (
              <View
                key={r}
                style={[styles.reasonItem, reason === r && styles.reasonItemActive]}
              >
                <Text style={styles.reasonText} onPress={() => setReason(r)}>
                  {reason === r ? '● ' : '○ '}{r}
                </Text>
              </View>
            ))}

            <View style={{ height: spacing.md }} />
            <PrimaryButton
              label={t('badgeReplacement.replace')}
              onPress={submit}
              loading={loading}
            />
            <View style={{ height: spacing.sm }} />
            <SecondaryButton label={t('common.cancel')} onPress={() => router.back()} />
          </>
        )}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingBottom: 40 },
  participantCard: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.md, marginBottom: spacing.md, borderWidth: 1, borderColor: colors.border },
  participantName: { fontFamily: fonts.bodyBold, fontSize: 18, color: colors.text, marginBottom: 4 },
  participantId: { fontFamily: fonts.body, fontSize: 12, color: colors.textMuted, marginBottom: spacing.sm },
  sectionTitle: { fontFamily: fonts.bodyBold, fontSize: 14, color: colors.primary, marginBottom: spacing.sm, textTransform: 'uppercase', letterSpacing: 0.5 },
  reasonItem: { padding: spacing.sm, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, marginBottom: spacing.xs },
  reasonItemActive: { borderColor: colors.primary, backgroundColor: colors.primary + '10' },
  reasonText: { fontFamily: fonts.body, fontSize: 14, color: colors.text },
  successContainer: { alignItems: 'center', paddingVertical: 40, paddingHorizontal: spacing.md },
  successIcon: { fontSize: 64, marginBottom: spacing.md },
  successTitle: { fontFamily: fonts.display, fontSize: 24, color: colors.success, marginBottom: spacing.sm },
  successFor: { fontFamily: fonts.bodyBold, fontSize: 18, color: colors.text, marginBottom: spacing.lg },
  newCodeBox: { backgroundColor: colors.primaryDark, borderRadius: radius.lg, padding: spacing.lg, alignItems: 'center', marginBottom: spacing.lg, width: '100%' },
  newCodeLabel: { color: colors.gold, fontFamily: fonts.bodyBold, fontSize: 11, letterSpacing: 1, textTransform: 'uppercase', marginBottom: spacing.xs },
  newCode: { color: '#fff', fontFamily: fonts.display, fontSize: 24, letterSpacing: 2 },
});

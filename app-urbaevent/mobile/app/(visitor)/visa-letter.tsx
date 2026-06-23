import { useCallback, useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { fetchVisaRequest, submitVisaRequest, type VisaRequest } from '../../src/api/visa';
import { Card, Input, PrimaryButton, Screen, ScreenTitle, StatusBadge } from '../../src/components/ui';
import { useAuth } from '../../src/context/AuthContext';
import { useI18n } from '../../src/i18n/I18nProvider';
import { colors, fonts, spacing } from '../../src/theme';

export default function VisaLetterScreen() {
  const { user } = useAuth();
  const { t } = useI18n();
  const [existing, setExisting] = useState<VisaRequest | null>(null);
  const [form, setForm] = useState({ firstName: '', lastName: '', passportNumber: '', nationality: '', organization: '', jobTitle: '' });
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    if (!user) return;
    setExisting(await fetchVisaRequest(user.id));
  }, [user]);

  useEffect(() => { load(); }, [load]);

  const submit = async () => {
    if (!user?.email) return;
    if (!form.firstName.trim() || !form.lastName.trim() || !form.passportNumber.trim() || !form.nationality.trim()) {
      Alert.alert(t('common.error'), t('visa.formRequired'));
      return;
    }
    setLoading(true);
    try {
      await submitVisaRequest(user.id, user.email, form);
      Alert.alert(t('visa.submittedTitle'), t('visa.submittedBody'));
      await load();
    } catch (e) {
      Alert.alert(t('common.error'), e instanceof Error ? e.message : t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <ScreenTitle title={t('visa.title')} subtitle={t('visa.subtitle')} />

        {existing ? (
          <Card elevated>
            <StatusBadge status={existing.status === 'approved' ? 'confirmed' : existing.status === 'rejected' ? 'rejected' : 'pending'} />
            <Text style={styles.name}>{existing.firstName} {existing.lastName}</Text>
            <Text style={styles.meta}>{existing.passportNumber} · {existing.nationality}</Text>
            <Text style={styles.meta}>{t('visa.status')}: {existing.status}</Text>
            {existing.status === 'approved' ? <Text style={styles.ok}>{t('visa.approvedHint')}</Text> : null}
          </Card>
        ) : (
          <>
            <Input label={t('team.firstName')} value={form.firstName} onChangeText={(v) => setForm((f) => ({ ...f, firstName: v }))} />
            <Input label={t('team.lastName')} value={form.lastName} onChangeText={(v) => setForm((f) => ({ ...f, lastName: v }))} />
            <Input label={t('visa.passport')} value={form.passportNumber} onChangeText={(v) => setForm((f) => ({ ...f, passportNumber: v }))} />
            <Input label={t('visa.nationality')} value={form.nationality} onChangeText={(v) => setForm((f) => ({ ...f, nationality: v }))} />
            <Input label={t('visa.organization')} value={form.organization} onChangeText={(v) => setForm((f) => ({ ...f, organization: v }))} />
            <Input label={t('visa.jobTitle')} value={form.jobTitle} onChangeText={(v) => setForm((f) => ({ ...f, jobTitle: v }))} />
            <PrimaryButton label={t('visa.submit')} onPress={submit} loading={loading} variant="gold" />
          </>
        )}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingBottom: spacing.xl },
  name: { fontFamily: fonts.bodyBold, fontSize: 18, color: colors.text, marginTop: spacing.sm },
  meta: { fontFamily: fonts.body, fontSize: 13, color: colors.textMuted, marginTop: 4 },
  ok: { fontFamily: fonts.body, color: colors.success, marginTop: spacing.md },
});

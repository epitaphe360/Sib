import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text } from 'react-native';
import { Input, PrimaryButton, Screen, ScreenTitle } from '../../src/components/ui';
import { useI18n } from '../../src/i18n/I18nProvider';
import { requestPasswordReset } from '../../src/services/auth';
import { colors, spacing } from '../../src/theme';

export default function ForgotPasswordScreen() {
  const { t } = useI18n();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!email.trim()) {
      Alert.alert(t('common.error'), t('auth.emailRequired'));
      return;
    }
    setLoading(true);
    try {
      const redirectTo = 'urbaevent://reset-password';
      await requestPasswordReset(email.trim(), redirectTo);
      Alert.alert(t('auth.forgot.sentTitle'), t('auth.forgot.sentBody'));
      router.back();
    } catch (e) {
      Alert.alert(t('common.error'), e instanceof Error ? e.message : t('auth.forgot.error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex}>
        <ScrollView keyboardShouldPersistTaps="handled">
          <ScreenTitle title={t('auth.forgot.title')} subtitle={t('auth.forgot.subtitle')} />
          <Input label={t('auth.email')} value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
          <PrimaryButton label={t('auth.forgot.submit')} onPress={submit} loading={loading} />
          <Text style={styles.back} onPress={() => router.back()}>{t('auth.forgot.back')}</Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  back: { textAlign: 'center', marginTop: spacing.lg, color: colors.primaryLight, fontWeight: '600' },
});

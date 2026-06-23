import { router } from 'expo-router';
import { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
} from 'react-native';
import { Input, PrimaryButton, Screen, ScreenTitle } from '../../src/components/ui';
import { useAuth } from '../../src/context/AuthContext';
import { useI18n } from '../../src/i18n/I18nProvider';
import { supabaseErrorMessage } from '../../src/lib/supabaseError';
import { colors, spacing } from '../../src/theme';

const SECTORS = [
  'BTP / Construction',
  'Architecture',
  'Immobilier',
  'Industrie',
  'Institutionnel',
  'Autre',
];

export default function RegisterScreen() {
  const { requestVisitorSignup } = useAuth();
  const { t } = useI18n();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [country, setCountry] = useState('MA');
  const [sector, setSector] = useState(SECTORS[0]);
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!firstName || !lastName || !email.trim()) {
      Alert.alert(t('common.error'), t('auth.register.fillRequired'));
      return;
    }
    setLoading(true);
    try {
      await requestVisitorSignup({
        intent: 'free',
        email: email.trim(),
        firstName,
        lastName,
        country,
        sector,
      });
      Alert.alert(t('auth.magic.sentTitle'), t('auth.magic.registerBody'), [
        { text: 'OK', onPress: () => router.replace('/(auth)/login') },
      ]);
    } catch (e) {
      Alert.alert(t('common.error'), supabaseErrorMessage(e, t('auth.magic.sendError')));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex}>
        <ScrollView keyboardShouldPersistTaps="handled">
          <ScreenTitle title={t('auth.register.freeTitle')} subtitle={t('auth.magic.registerSubtitle')} />
          <Text style={styles.note}>{t('auth.magic.noPassword')}</Text>
          <Input label={t('auth.register.firstName')} value={firstName} onChangeText={setFirstName} returnKeyType="next" />
          <Input label={t('auth.register.lastName')} value={lastName} onChangeText={setLastName} returnKeyType="next" />
          <Input
            label={t('auth.email')}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            returnKeyType="next"
          />
          <Input label={t('auth.register.country')} value={country} onChangeText={setCountry} autoCapitalize="characters" returnKeyType="next" />
          <Input label={t('auth.register.sector')} value={sector} onChangeText={setSector} returnKeyType="send" onSubmitEditing={handleRegister} />
          <Text style={styles.sectorsHint}>Ex. : {SECTORS.join(', ')}</Text>
          <PrimaryButton label={t('auth.magic.sendBadge')} onPress={handleRegister} loading={loading} />
          <Text style={styles.rgpdLink} onPress={() => router.push('/(auth)/rgpd' as never)}>
            🔒 {t('rgpd.readPolicy')}
          </Text>
          <Text style={styles.vipLink} onPress={() => router.push('/(auth)/register-vip')}>
            {t('auth.register.vipLink')}
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  note: {
    fontSize: 14,
    color: colors.primary,
    marginBottom: spacing.md,
    lineHeight: 22,
    fontWeight: '600',
  },
  sectorsHint: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: -8,
    marginBottom: spacing.md,
  },
  rgpdLink: {
    textAlign: 'center',
    marginTop: spacing.sm,
    marginBottom: spacing.sm,
    color: colors.textMuted,
    fontSize: 12,
  },
  vipLink: {
    textAlign: 'center',
    marginTop: spacing.lg,
    color: colors.primaryLight,
    fontWeight: '600',
  },
});

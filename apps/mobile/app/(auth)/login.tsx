import { router } from 'expo-router';
import { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Input, PrimaryButton, Screen, ScreenTitle } from '../../src/components/ui';
import { useAuth } from '../../src/context/AuthContext';
import { useI18n } from '../../src/i18n/I18nProvider';
import { getHomePath } from '../../src/navigation/roleConfig';
import { colors, spacing } from '../../src/theme';

type LoginMode = 'magic' | 'password';

export default function LoginScreen() {
  const { signIn, sendMagicLinkLogin } = useAuth();
  const { t } = useI18n();
  const [mode, setMode] = useState<LoginMode>('magic');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [magicSent, setMagicSent] = useState(false);

  const handleMagicLink = async () => {
    if (!email.trim()) {
      Alert.alert(t('common.error'), t('auth.emailRequired'));
      return;
    }
    setLoading(true);
    try {
      await sendMagicLinkLogin(email.trim());
      setMagicSent(true);
      Alert.alert(t('auth.magic.sentTitle'), t('auth.magic.sentBody'));
    } catch (e) {
      Alert.alert(t('common.error'), e instanceof Error ? e.message : t('auth.magic.sendError'));
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordLogin = async () => {
    if (!email.trim() || !password) {
      Alert.alert(t('common.error'), t('auth.emailRequired'));
      return;
    }
    setLoading(true);
    try {
      const appUser = await signIn(email.trim(), password);
      router.replace(getHomePath(appUser.type) as never);
    } catch (e) {
      Alert.alert(t('login.title'), e instanceof Error ? e.message : t('auth.password.invalid'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex}>
        <ScrollView keyboardShouldPersistTaps="handled">
          <ScreenTitle title={t('login.title')} subtitle={t('auth.magic.subtitle')} />

          <View style={styles.tabs}>
            <Pressable
              style={[styles.tab, mode === 'magic' && styles.tabActive]}
              onPress={() => { setMode('magic'); setMagicSent(false); }}
            >
              <Text style={[styles.tabText, mode === 'magic' && styles.tabTextActive]}>
                {t('login.mode_magic')}
              </Text>
            </Pressable>
            <Pressable
              style={[styles.tab, mode === 'password' && styles.tabActive]}
              onPress={() => setMode('password')}
            >
              <Text style={[styles.tabText, mode === 'password' && styles.tabTextActive]}>
                {t('login.mode_password')}
              </Text>
            </Pressable>
          </View>

          <Input
            label={t('auth.email')}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
          />

          {mode === 'magic' ? (
            <>
              <Text style={styles.hint}>{t('auth.magic.hint')}</Text>
              {magicSent && (
                <Text style={styles.sent}>{t('auth.magic.checkInbox')}</Text>
              )}
              <PrimaryButton
                label={t('auth.magic.send')}
                onPress={handleMagicLink}
                loading={loading}
              />
            </>
          ) : (
            <>
              <Text style={styles.hint}>{t('auth.password.proOnly')}</Text>
              <Input
                label={t('auth.password.label')}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoComplete="password"
              />
              <PrimaryButton
                label={t('login.submit')}
                onPress={handlePasswordLogin}
                loading={loading}
              />
              <Text style={styles.link} onPress={() => router.push('/(auth)/forgot-password')}>
                {t('login.forgot')}
              </Text>
            </>
          )}

          <Text style={styles.register} onPress={() => router.replace('/(auth)/register')}>
            {t('login.register')}
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  tabs: {
    flexDirection: 'row',
    marginBottom: spacing.md,
    backgroundColor: colors.border,
    borderRadius: 10,
    padding: 4,
  },
  tab: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 8 },
  tabActive: { backgroundColor: colors.surface },
  tabText: { fontSize: 13, fontWeight: '600', color: colors.textMuted },
  tabTextActive: { color: colors.primary },
  hint: { fontSize: 13, color: colors.textMuted, marginBottom: spacing.md, lineHeight: 20 },
  sent: { color: colors.success, marginBottom: spacing.sm, fontWeight: '600', textAlign: 'center' },
  link: { textAlign: 'center', marginTop: spacing.md, color: colors.primaryLight, fontWeight: '600' },
  register: { textAlign: 'center', marginTop: spacing.lg, color: colors.primaryLight, fontWeight: '600' },
});

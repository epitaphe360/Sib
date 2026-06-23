import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
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
import { BrandLogo } from '../../src/components/brand/BrandLogo';
import { useAuth } from '../../src/context/AuthContext';
import { useI18n } from '../../src/i18n/I18nProvider';
import { navigateAfterAuth } from '../../src/lib/navigateAfterAuth';
import { supabaseErrorMessage } from '../../src/lib/supabaseError';
import { DEMO_QUICK_LOGIN_ACCOUNTS, isQuickLoginEnabled } from '../../src/lib/demoQuickLogin';
import { colors, fonts, spacing } from '../../src/theme';

type LoginMode = 'magic' | 'password';

export default function LoginScreen() {
  const { signIn, sendMagicLinkLogin, refreshUser, signOut } = useAuth();
  const { t } = useI18n();
  const switchingRef = useRef(false);

  const quickLogin = async (email: string, password: string) => {
    if (switchingRef.current) return;
    switchingRef.current = true;
    setLoading(true);
    try {
      await signOut().catch(() => undefined);
      const appUser = await signIn(email, password);
      await refreshUser();
      navigateAfterAuth(appUser);
    } catch (e) {
      Alert.alert(
        'Connexion rapide',
        supabaseErrorMessage(e, 'Impossible de changer de compte. Réessayez.'),
      );
    } finally {
      switchingRef.current = false;
      setLoading(false);
    }
  };
  const [mode, setMode] = useState<LoginMode>('magic');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [magicSent, setMagicSent] = useState(false);
  const [resendIn, setResendIn] = useState(0);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [lockUntil, setLockUntil] = useState<number | null>(null);

  useEffect(() => {
    if (resendIn <= 0) return;
    const timer = setTimeout(() => setResendIn((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendIn]);

  const handleMagicLink = async () => {
    if (!email.trim()) {
      Alert.alert(t('common.error'), t('auth.emailRequired'));
      return;
    }
    setLoading(true);
    try {
      await sendMagicLinkLogin(email.trim());
      setMagicSent(true);
      setResendIn(60);
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
    if (lockUntil && Date.now() < lockUntil) {
      const remainingSec = Math.ceil((lockUntil - Date.now()) / 1000);
      Alert.alert(t('common.error'), `${t('auth.tooManyAttempts')} ${remainingSec}s.`);
      return;
    }
    setLoading(true);
    try {
      await signOut().catch(() => undefined);
      const appUser = await signIn(email.trim(), password);
      await refreshUser();
      setFailedAttempts(0);
      setLockUntil(null);
      navigateAfterAuth(appUser);
    } catch (e) {
      const next = failedAttempts + 1;
      setFailedAttempts(next);
      if (next >= 3) {
        const delay = Math.min((next - 2) * 15000, 60000);
        setLockUntil(Date.now() + delay);
      }
      Alert.alert(t('login.title'), e instanceof Error ? e.message : t('auth.password.invalid'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex}>
        <ScrollView keyboardShouldPersistTaps="handled">
          <BrandLogo size="md" style={styles.logo} showLabel />
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
            returnKeyType={mode === 'password' ? 'next' : 'send'}
          />

          {mode === 'magic' ? (
            <>
              <Text style={styles.hint}>{t('auth.magic.hint')}</Text>
              {magicSent && (
                <Text style={styles.sent}>{t('auth.magic.checkInbox')}</Text>
              )}
              <PrimaryButton
                label={magicSent && resendIn > 0 ? `${t('auth.resend')} (${resendIn}s)` : t('auth.magic.send')}
                onPress={handleMagicLink}
                loading={loading}
                disabled={magicSent && resendIn > 0}
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
                returnKeyType="done"
                onSubmitEditing={handlePasswordLogin}
              />
              <PrimaryButton
                label={t('login.submit')}
                onPress={handlePasswordLogin}
                loading={loading}
                disabled={!!(lockUntil && Date.now() < lockUntil)}
              />
              <Text style={styles.link} onPress={() => router.push('/(auth)/forgot-password')}>
                {t('login.forgot')}
              </Text>
            </>
          )}

          <Text style={styles.register} onPress={() => router.replace('/(auth)/register')}>
            {t('login.register')}
          </Text>

          {/* Connexions rapides démo — dev ou APK avec EXPO_PUBLIC_ENABLE_QUICK_LOGIN=true */}
          {isQuickLoginEnabled() && (
            <View style={styles.devBox}>
              <Text style={styles.devTitle}>⚡ Connexion rapide démo</Text>
              <View style={styles.devGrid}>
                {DEMO_QUICK_LOGIN_ACCOUNTS.map((acc) => (
                  <Pressable
                    key={acc.email}
                    style={[styles.devBtn, { borderColor: acc.color }]}
                    onPress={() => quickLogin(acc.email, acc.password)}
                    disabled={loading}
                  >
                    <Text style={[styles.devBtnText, { color: acc.color }]}>{acc.label}</Text>
                  </Pressable>
                ))}
              </View>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  logo: { alignSelf: 'center', marginBottom: spacing.md },
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
  devBox: {
    marginTop: spacing.xl,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: '#f59e0b',
    borderRadius: 12,
    borderStyle: 'dashed',
    backgroundColor: '#fffbeb',
  },
  devTitle: {
    fontFamily: fonts.bodyBold,
    fontSize: 12,
    color: '#92400e',
    textAlign: 'center',
    marginBottom: spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  devGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'center',
  },
  devBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1.5,
    backgroundColor: '#fff',
  },
  devBtnText: {
    fontFamily: fonts.bodyBold,
    fontSize: 12,
  },
});

import * as ExpoLinking from 'expo-linking';
import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
} from 'react-native';
import { Input, PrimaryButton, Screen, ScreenTitle } from '../../src/components/ui';
import { useI18n } from '../../src/i18n/I18nProvider';
import { supabase } from '../../src/lib/supabase';
import { updatePassword } from '../../src/services/auth';
import { colors, spacing } from '../../src/theme';

const LINK_WAIT_MS = 8_000;

function parseTokens(url: string) {
  const hash = url.includes('#') ? url.split('#')[1] : '';
  const query = url.includes('?') ? url.split('?')[1]?.split('#')[0] : '';
  const params = new URLSearchParams(hash || query);
  return {
    accessToken: params.get('access_token'),
    refreshToken: params.get('refresh_token'),
  };
}

export default function ResetPasswordScreen() {
  const { t } = useI18n();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [ready, setReady] = useState(false);
  const [linkError, setLinkError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const readyRef = useRef(false);

  useEffect(() => {
    let cancelled = false;
    readyRef.current = false;

    const init = async (url: string | null) => {
      if (!url) return;
      const { accessToken, refreshToken } = parseTokens(url);
      if (accessToken && refreshToken) {
        await supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken });
        if (!cancelled) {
          readyRef.current = true;
          setReady(true);
          setLinkError(null);
        }
      }
    };

    ExpoLinking.getInitialURL().then(init);
    const sub = ExpoLinking.addEventListener('url', ({ url }) => init(url));

    const timer = setTimeout(() => {
      if (!cancelled && !readyRef.current) {
        setLinkError(t('auth.reset.linkMissing'));
      }
    }, LINK_WAIT_MS);

    return () => {
      cancelled = true;
      clearTimeout(timer);
      sub.remove();
    };
  }, [t]);

  const submit = async () => {
    if (password.length < 12) {
      Alert.alert(t('common.error'), t('auth.reset.minLength'));
      return;
    }
    if (password !== confirm) {
      Alert.alert(t('common.error'), t('auth.reset.mismatch'));
      return;
    }
    setLoading(true);
    try {
      await updatePassword(password);
      Alert.alert(t('auth.reset.successTitle'), t('auth.reset.successBody'), [
        { text: 'OK', onPress: () => router.replace('/(auth)/login') },
      ]);
    } catch (e) {
      Alert.alert(t('common.error'), e instanceof Error ? e.message : t('auth.reset.error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex}>
        <ScrollView keyboardShouldPersistTaps="handled">
          <ScreenTitle title={t('auth.reset.title')} subtitle={ready ? t('auth.reset.subtitle') : t('auth.reset.waitLink')} />
          {linkError ? (
            <>
              <Text style={styles.linkError}>{linkError}</Text>
              <PrimaryButton
                label={t('login.forgot')}
                variant="outline"
                onPress={() => router.replace('/(auth)/forgot-password')}
              />
            </>
          ) : null}
          <Input label={t('auth.reset.password')} value={password} onChangeText={setPassword} secureTextEntry />
          <Input label={t('auth.reset.confirm')} value={confirm} onChangeText={setConfirm} secureTextEntry />
          <PrimaryButton label={t('auth.reset.submit')} onPress={submit} loading={loading} disabled={!ready} />
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  linkError: { color: colors.danger, textAlign: 'center', marginBottom: spacing.md },
});
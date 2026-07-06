import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text } from 'react-native';
import { requestConnection } from '../../src/api/networking';
import { validateQRCode } from '../../src/api/qr';
import { QRScannerView } from '../../src/components/QRScannerView';
import { IllustratedEmpty, Input, PrimaryButton, Screen, ScreenTitle } from '../../src/components/ui';
import { useAuth } from '../../src/context/AuthContext';
import { useNetworkingPermissions } from '../../src/hooks/useNetworkingPermissions';
import { useI18n } from '../../src/i18n/I18nProvider';
import { getPermissionErrorMessage } from '../../src/lib/networkingPermissions';
import { requireAuth } from '../../src/lib/navigateSafe';
import { colors, fonts, spacing } from '../../src/theme';

export default function ScanConnectScreen() {
  const { user } = useAuth();
  const { t } = useI18n();
  const { limits } = useNetworkingPermissions();
  const [manual, setManual] = useState('');
  const [busy, setBusy] = useState(false);
  const [cameraMode, setCameraMode] = useState(true);

  const processCode = async (raw: string) => {
    if (!requireAuth(user, t)) return;
    if (!limits.canMakeConnection) {
      Alert.alert(t('common.error'), getPermissionErrorMessage(user!.type, user!.visitorLevel, 'connection'));
      return;
    }

    const data = raw.trim();
    if (!data) return;

    setBusy(true);
    try {
      const result = await validateQRCode(data);
      if (!result.valid || !result.payload?.userId) {
        Alert.alert(t('networking.scanInvalid'), result.reason ?? t('networking.scanInvalid'));
        return;
      }

      const targetId = result.payload.userId;
      if (targetId === user!.id) {
        Alert.alert(t('networking.scanInvalid'), t('networking.scanSelf'));
        return;
      }

      await requestConnection(user!.id, targetId);
      const name = result.payload.name?.trim() || t('networking.unknown');
      Alert.alert(
        t('networking.scanSuccessTitle'),
        t('networking.scanSuccess').replace('{{name}}', name),
        [{ text: 'OK', onPress: () => router.push('/(visitor)/networking' as never) }],
      );
      setManual('');
    } catch (e) {
      Alert.alert(t('common.error'), e instanceof Error ? e.message : t('common.error'));
    } finally {
      setBusy(false);
    }
  };

  if (!user) {
    return (
      <Screen>
        <IllustratedEmpty
          icon="scan-outline"
          title={t('networking.scanTitle')}
          message={t('profile.guestHint')}
          actionLabel={t('login.submit')}
          onAction={() => router.push('/(auth)/login' as never)}
        />
      </Screen>
    );
  }

  return (
    <Screen style={styles.flex}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <ScreenTitle title={t('networking.scanTitle')} subtitle={t('networking.scanSubtitle')} />

        {cameraMode ? (
          <>
            <QRScannerView onScan={processCode} active={!busy} />
            <PrimaryButton
              label={t('networking.scanManual')}
              variant="outline"
              onPress={() => setCameraMode(false)}
            />
          </>
        ) : (
          <>
            <Input label={t('networking.scanManualLabel')} value={manual} onChangeText={setManual} />
            <PrimaryButton
              label={t('networking.scanConnectBtn')}
              variant="gold"
              loading={busy}
              onPress={() => processCode(manual)}
            />
            <PrimaryButton label={t('networking.scanCamera')} variant="outline" onPress={() => setCameraMode(true)} />
          </>
        )}

        <Text style={styles.hint}>{t('networking.scanHint')}</Text>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  scroll: { paddingBottom: spacing.xl },
  hint: {
    marginTop: spacing.md,
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.textMuted,
    lineHeight: 19,
    textAlign: 'center',
  },
});

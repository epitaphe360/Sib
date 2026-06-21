import { router } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { scanLeadForExhibitor, scanLeadFromQr } from '../../src/api/scanner';
import { QRScannerView } from '../../src/components/QRScannerView';
import { SignOutOverlayButton } from '../../src/components/SignOutOverlayButton';
import { ScanResultFlash, type ScanFlashStatus } from '../../src/components/ScanResultFlash';
import { Input, PrimaryButton, Screen, ScreenTitle } from '../../src/components/ui';
import { useAuth } from '../../src/context/AuthContext';
import { useI18n } from '../../src/i18n/I18nProvider';
import { colors, fonts, radius, spacing } from '../../src/theme';

export default function ExhibitorScanScreen() {
  const { user } = useAuth();
  const { t } = useI18n();
  const insets = useSafeAreaInsets();
  const [code, setCode] = useState('');
  const [useCamera, setUseCamera] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [flash, setFlash] = useState<{ status: ScanFlashStatus; message: string } | null>(null);

  const processCode = async (raw: string) => {
    if (!user || !raw.trim() || scanning) return;
    setScanning(true);
    try {
      const trimmed = raw.trim();
      const result = trimmed.includes('.')
        ? await scanLeadFromQr(trimmed, user.id)
        : await scanLeadForExhibitor(trimmed, user.id);

      const message = result.valid
        ? `${t('exhibitor.scan.saved')}: ${result.userName ?? trimmed}`
        : result.reason ?? t('exhibitor.scan.invalid');

      setFlash({
        status: result.valid ? 'granted' : 'denied',
        message,
      });

      if (result.valid) setCode('');
    } catch (e) {
      setFlash({
        status: 'denied',
        message: e instanceof Error ? e.message : t('common.error'),
      });
    } finally {
      setScanning(false);
    }
  };

  if (useCamera) {
    return (
      <View style={styles.fullRoot} pointerEvents="box-none">
        <QRScannerView onScan={processCode} active={!scanning} fullScreen />
        <View style={styles.topBar} pointerEvents="box-none">
          <SignOutOverlayButton />
        </View>
        <ScanResultFlash
          status={flash?.status ?? 'denied'}
          message={flash?.message ?? ''}
          visible={!!flash}
          onDismiss={() => setFlash(null)}
        />
        <View style={[styles.overlayPanel, { paddingBottom: insets.bottom + spacing.md }]}>
          <Text style={styles.zoneTitle}>{t('exhibitor.scan.title')}</Text>
          <PrimaryButton label={t('scanner.manual')} variant="outline" onPress={() => setUseCamera(false)} />
          <PrimaryButton label={t('exhibitor.scans.title')} variant="outline" onPress={() => router.push('/(exhibitor)/scans' as never)} />
          <PrimaryButton label={t('exhibitor.contacts.title')} variant="gold" onPress={() => router.push('/(exhibitor)/(tabs)/contacts' as never)} />
        </View>
      </View>
    );
  }

  return (
    <Screen>
      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.scroll}>
        <ScreenTitle title={t('exhibitor.scan.title')} subtitle={t('exhibitor.scan.subtitle')} />
        <ScanResultFlash
          status={flash?.status ?? 'denied'}
          message={flash?.message ?? ''}
          visible={!!flash}
          onDismiss={() => setFlash(null)}
        />
        <Input
          label={t('scanner.inputLabel')}
          value={code}
          onChangeText={setCode}
          autoCapitalize="none"
          placeholder={t('scanner.inputPlaceholder')}
        />
        <PrimaryButton label={t('exhibitor.scan.save')} onPress={() => processCode(code)} loading={scanning} disabled={!code.trim()} />
        <PrimaryButton label={t('scanner.useCamera')} variant="gold" onPress={() => setUseCamera(true)} />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  fullRoot: { flex: 1, backgroundColor: '#000' },
  topBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    elevation: 24,
  },
  overlayPanel: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(27, 54, 93, 0.95)',
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    padding: spacing.md,
    gap: spacing.sm,
  },
  zoneTitle: { color: colors.gold, fontFamily: fonts.bodyBold, fontSize: 14 },
  scroll: { paddingBottom: spacing.xl },
});

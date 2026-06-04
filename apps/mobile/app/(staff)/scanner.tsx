import { useCallback, useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import {
  fetchAccessLogHistory,
  flushOfflineScanQueue,
  getScanHistory,
  scanQrPayload,
} from '../../src/api/scanner';
import { QRScannerView } from '../../src/components/QRScannerView';
import { Input, PrimaryButton, Screen, ScreenTitle } from '../../src/components/ui';
import { useI18n } from '../../src/i18n/I18nProvider';
import { colors, spacing } from '../../src/theme';

const ZONES = ['public', 'exhibition_hall', 'vip_lounge', 'networking_area', 'backstage'];

export default function StaffScannerScreen() {
  const { t } = useI18n();
  const [zone, setZone] = useState(ZONES[0]);
  const [payload, setPayload] = useState('');
  const [history, setHistory] = useState(getScanHistory());
  const [useCamera, setUseCamera] = useState(true);

  const reloadHistory = useCallback(async () => {
    const db = await fetchAccessLogHistory(15);
    setHistory(db.length ? db : getScanHistory());
  }, []);

  useEffect(() => {
    flushOfflineScanQueue().then(() => reloadHistory());
  }, [reloadHistory]);

  const scan = async (data?: string) => {
    const value = (data ?? payload).trim();
    if (!value) return;
    const result = await scanQrPayload(value, zone);
    await reloadHistory();
    Alert.alert(
      result.valid ? t('scanner.granted') : t('scanner.denied'),
      result.reason ?? result.userName ?? ''
    );
    if (result.valid) setPayload('');
  };

  return (
    <Screen>
      <ScrollView keyboardShouldPersistTaps="handled">
        <ScreenTitle title={t('scanner.title')} subtitle={`${t('scanner.zone')} : ${zone}`} />
        <View style={styles.zones}>
          {ZONES.map((z) => (
            <Text
              key={z}
              style={[styles.zoneChip, zone === z && styles.zoneActive]}
              onPress={() => setZone(z)}
            >
              {z}
            </Text>
          ))}
        </View>
        {useCamera ? (
          <>
            <QRScannerView onScan={(data) => scan(data)} />
            <PrimaryButton label={t('scanner.manual')} onPress={() => setUseCamera(false)} />
          </>
        ) : (
          <>
            <Input
              label={t('scanner.inputLabel')}
              value={payload}
              onChangeText={setPayload}
              autoCapitalize="none"
            />
            <PrimaryButton label={t('scanner.validate')} onPress={() => scan()} />
            <View style={{ height: spacing.sm }} />
            <PrimaryButton label={t('scanner.useCamera')} onPress={() => setUseCamera(true)} />
          </>
        )}
        <Text style={styles.section}>{t('scanner.history')}</Text>
        {history.slice(0, 10).map((h) => (
          <View key={h.id} style={styles.histRow}>
            <Text style={h.valid ? styles.ok : styles.ko}>{h.valid ? 'OK' : 'KO'}</Text>
            <Text style={styles.histText}>{h.userName ?? h.reason ?? h.zone}</Text>
          </View>
        ))}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  zones: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: spacing.md },
  zoneChip: { paddingHorizontal: 10, paddingVertical: 6, backgroundColor: colors.border, borderRadius: 8, fontSize: 12 },
  zoneActive: { backgroundColor: colors.primary, color: '#fff' },
  section: { marginTop: spacing.lg, fontWeight: '700', color: colors.text, marginBottom: spacing.sm },
  histRow: { flexDirection: 'row', gap: 8, paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: colors.border },
  ok: { color: colors.success, fontWeight: '700', width: 32 },
  ko: { color: colors.danger, fontWeight: '700', width: 32 },
  histText: { flex: 1, color: colors.textMuted, fontSize: 13 },
});

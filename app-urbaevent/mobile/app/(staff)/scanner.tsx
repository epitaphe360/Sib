import { useCallback, useEffect, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SignOutOverlayButton } from '../../src/components/SignOutOverlayButton';
import { useSignOut } from '../../src/hooks/useSignOut';
import {
  fetchAccessLogHistory,
  flushOfflineScanQueue,
  getScanHistory,
  scanQrPayload,
} from '../../src/api/scanner';
import { fetchGates, getSelectedGate, saveSelectedGate } from '../../src/api/gates';
import { QRScannerView } from '../../src/components/QRScannerView';
import { ScanResultFlash, type ScanFlashStatus } from '../../src/components/ScanResultFlash';
import { Chip, Input, PrimaryButton, Screen, ScreenTitle } from '../../src/components/ui';
import { AppIcon } from '../../src/components/AppIcon';
import { useI18n } from '../../src/i18n/I18nProvider';
import type { Gate } from '../../src/types';
import { colors, fonts, radius, shadows, spacing } from '../../src/theme';

const ZONES = [
  { id: 'public', label: 'Public' },
  { id: 'exhibition_hall', label: 'Hall expo' },
  { id: 'vip_lounge', label: 'VIP' },
  { id: 'networking_area', label: 'Networking' },
  { id: 'backstage', label: 'Backstage' },
];

export default function StaffScannerScreen() {
  const { t } = useI18n();
  const { confirmSignOut } = useSignOut();
  const insets = useSafeAreaInsets();
  const [zone, setZone] = useState(ZONES[0].id);
  const [payload, setPayload] = useState('');
  const [history, setHistory] = useState(getScanHistory());
  const [useCamera, setUseCamera] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [flash, setFlash] = useState<{ status: ScanFlashStatus; message: string } | null>(null);
  const [gates, setGates] = useState<Gate[]>([]);
  const [selectedGate, setSelectedGate] = useState<Gate | null>(null);
  const [showGatePicker, setShowGatePicker] = useState(false);

  useEffect(() => {
    fetchGates().then(setGates).catch((e) => console.warn('[Scanner] fetchGates', e));
    getSelectedGate().then((g) => { if (g) setSelectedGate(g); }).catch((e) => console.warn('[Scanner] getSelectedGate', e));
  }, []);

  const pickGate = async (gate: Gate) => {
    setSelectedGate(gate);
    setZone(gate.zone);
    await saveSelectedGate(gate);
    setShowGatePicker(false);
  };

  const reloadHistory = useCallback(async () => {
    const db = await fetchAccessLogHistory(15);
    setHistory(db.length ? db : getScanHistory());
  }, []);

  useEffect(() => {
    flushOfflineScanQueue().then(() => reloadHistory()).catch((e) => console.warn('[Scanner] flushOfflineScanQueue', e));
  }, [reloadHistory]);

  const scan = async (data?: string) => {
    const value = (data ?? payload).trim();
    if (!value || scanning) return;
    setScanning(true);
    try {
      const result = await scanQrPayload(value, zone);
      setHistory(getScanHistory());
      await reloadHistory();
      const status: ScanFlashStatus = result.valid
        ? 'granted'
        : result.reason?.toLowerCase().includes('expir') || result.reason?.toLowerCase().includes('warn')
          ? 'warning'
          : 'denied';
      setFlash({
        status,
        message: result.reason ?? result.userName ?? (result.valid ? t('scanner.granted') : t('scanner.denied')),
      });
      if (result.valid) setPayload('');
    } finally {
      setScanning(false);
    }
  };

  const zoneLabel = ZONES.find((z) => z.id === zone)?.label ?? zone;

  if (useCamera) {
    return (
      <View style={styles.fullRoot} pointerEvents="box-none">
        <QRScannerView onScan={(data) => scan(data)} active={!scanning} fullScreen />
        <ScanResultFlash
          status={flash?.status ?? 'denied'}
          message={flash?.message ?? ''}
          visible={!!flash}
          onDismiss={() => setFlash(null)}
        />
        {history.length > 0 ? (
          <View style={[styles.historyOverlay, { top: insets.top + spacing.sm }]}>
            <Text style={styles.historyOverlayTitle}>{t('scanner.history')}</Text>
            {history.slice(0, 3).map((h) => (
              <View key={h.id} style={styles.historyOverlayRow}>
                <AppIcon
                  name={h.valid ? 'checkmark-circle-outline' : 'close-circle-outline'}
                  size={12}
                  color={h.valid ? '#4ade80' : '#f87171'}
                />
                <Text style={styles.historyOverlayLine} numberOfLines={1}>
                  {h.userName ?? h.reason ?? '—'}
                </Text>
              </View>
            ))}
          </View>
        ) : null}
        <View style={styles.topBar} pointerEvents="box-none">
          <SignOutOverlayButton />
        </View>
        <View style={[styles.overlayPanel, { paddingBottom: insets.bottom + spacing.md }]}>
          {/* Gate selector */}
          <Pressable style={styles.gateSelector} onPress={() => setShowGatePicker(true)}>
            <Text style={styles.gateSelectorLabel}>
              {t('scanner.gate')} : {selectedGate?.name ?? t('scanner.selectGate')}
            </Text>
            <Text style={styles.gateSelectorChevron}>›</Text>
          </Pressable>
          <Text style={styles.zoneTitle}>{t('scanner.zone')} : {zoneLabel}</Text>
          <View style={styles.zones}>
            {ZONES.map((z) => (
              <Chip key={z.id} label={z.label} active={zone === z.id} onPress={() => setZone(z.id)} />
            ))}
          </View>
          <PrimaryButton label={t('scanner.manual')} variant="outline" onPress={() => setUseCamera(false)} />
        </View>

        {/* Modal sélection gate */}
        <Modal visible={showGatePicker} transparent animationType="slide" onRequestClose={() => setShowGatePicker(false)}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalSheet}>
              <Text style={styles.modalTitle}>{t('scanner.selectGate')}</Text>
              {gates.map((g) => (
                <Pressable key={g.id} style={[styles.gateItem, selectedGate?.id === g.id && styles.gateItemActive]} onPress={() => pickGate(g)}>
                  <Text style={styles.gateItemName}>{g.name}</Text>
                  <Text style={styles.gateItemLocation}>{g.location ?? g.zone}</Text>
                </Pressable>
              ))}
              <PrimaryButton label={t('common.cancel')} variant="outline" onPress={() => setShowGatePicker(false)} />
            </View>
          </View>
        </Modal>
      </View>
    );
  }

  return (
    <Screen style={styles.manualRoot}>
      <ScanResultFlash
        status={flash?.status ?? 'denied'}
        message={flash?.message ?? ''}
        visible={!!flash}
        onDismiss={() => setFlash(null)}
      />
      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.scroll}>
        <ScreenTitle title={t('scanner.title')} subtitle={`${t('scanner.zone')} : ${zoneLabel}`} />

        <View style={styles.zones}>
          {ZONES.map((z) => (
            <Chip key={z.id} label={z.label} active={zone === z.id} onPress={() => setZone(z.id)} />
          ))}
        </View>

        <Input
          label={t('scanner.inputLabel')}
          value={payload}
          onChangeText={setPayload}
          autoCapitalize="none"
          placeholder={t('scanner.inputPlaceholder')}
        />
        <PrimaryButton
          label={t('scanner.validate')}
          onPress={() => scan()}
          loading={scanning}
          disabled={!payload.trim()}
        />
        <View style={{ height: spacing.sm }} />
        <PrimaryButton label={t('scanner.useCamera')} variant="gold" onPress={() => setUseCamera(true)} />
        <View style={{ height: spacing.sm }} />
        <PrimaryButton label={t('profile.signOut')} variant="outline" onPress={confirmSignOut} />

        <Text style={styles.section}>{t('scanner.history')}</Text>
        {history.length === 0 ? (
          <Text style={styles.emptyHistory}>{t('scanner.historyEmpty')}</Text>
        ) : (
          history.slice(0, 10).map((h) => (
            <View key={h.id} style={styles.histRow}>
              <AppIcon
                name={h.valid ? 'checkmark-circle-outline' : 'close-circle-outline'}
                size={20}
                color={h.valid ? colors.success : colors.danger}
              />
              <View style={styles.histContent}>
                <Text style={styles.histName}>{h.userName ?? h.reason ?? '—'}</Text>
                <Text style={styles.histMeta}>{h.zone}</Text>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  manualRoot: { flex: 1 },
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
    ...shadows.lg,
  },
  historyOverlay: {
    position: 'absolute',
    left: spacing.md,
    right: spacing.md,
    backgroundColor: 'rgba(0,0,0,0.55)',
    borderRadius: radius.lg,
    padding: spacing.sm,
    zIndex: 50,
  },
  historyOverlayTitle: { color: colors.gold, fontFamily: fonts.bodyBold, fontSize: 12, marginBottom: 4 },
  historyOverlayRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 2 },
  historyOverlayLine: { color: '#fff', fontFamily: fonts.body, fontSize: 12, flex: 1 },
  gateSelector: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: radius.md, paddingHorizontal: spacing.sm, paddingVertical: spacing.xs, marginBottom: spacing.sm, borderWidth: 1, borderColor: colors.gold },
  gateSelectorLabel: { color: colors.gold, fontFamily: fonts.bodyBold, fontSize: 13 },
  gateSelectorChevron: { color: colors.gold, fontSize: 16 },
  zoneTitle: { color: 'rgba(255,255,255,0.8)', fontFamily: fonts.body, fontSize: 13, marginBottom: spacing.xs },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  modalSheet: { backgroundColor: colors.surface, borderTopLeftRadius: radius.xl, borderTopRightRadius: radius.xl, padding: spacing.lg },
  modalTitle: { fontFamily: fonts.bodyBold, fontSize: 18, color: colors.primaryDark, marginBottom: spacing.md, textAlign: 'center' },
  gateItem: { padding: spacing.md, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, marginBottom: spacing.sm },
  gateItemActive: { borderColor: colors.primary, backgroundColor: colors.primary + '10' },
  gateItemName: { fontFamily: fonts.bodyBold, fontSize: 15, color: colors.text },
  gateItemLocation: { fontFamily: fonts.body, fontSize: 12, color: colors.textMuted, marginTop: 2 },
  scroll: { paddingBottom: spacing.xl },
  zones: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: spacing.md },
  section: {
    marginTop: spacing.lg,
    fontFamily: fonts.bodyBold,
    fontSize: 16,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  emptyHistory: { color: colors.textMuted, fontSize: 14, fontStyle: 'italic', fontFamily: fonts.body },
  histRow: {
    flexDirection: 'row',
    gap: 10,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    alignItems: 'center',
  },
  histContent: { flex: 1 },
  histName: { color: colors.text, fontSize: 14, fontFamily: fonts.bodyMedium },
  histMeta: { color: colors.textMuted, fontSize: 12, marginTop: 2, fontFamily: fonts.body },
});

import { useCallback, useEffect, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { fetchAccessLogHistory, type ScanHistoryEntry } from '../../src/api/scanner';
import { fetchScannerNames } from '../../src/api/visitorScans';
import { Screen, ScreenTitle } from '../../src/components/ui';
import { useAuth } from '../../src/context/AuthContext';
import { useI18n } from '../../src/i18n/I18nProvider';
import { colors, fonts, radius, spacing } from '../../src/theme';

function formatScanTime(iso: string): string {
  return new Date(iso).toLocaleString('fr-FR', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

export default function StaffScanHistoryScreen() {
  const { user } = useAuth();
  const { t } = useI18n();
  const isController = user?.type === 'security';
  const [items, setItems] = useState<ScanHistoryEntry[]>([]);
  const [scannerNames, setScannerNames] = useState<Map<string, string>>(new Map());
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    const rows = await fetchAccessLogHistory(100, {
      scannedBy: isController ? user?.id : undefined,
    });
    setItems(rows);
    if (!isController) {
      const ids = [...new Set(rows.map((r) => r.scannedBy).filter(Boolean))] as string[];
      setScannerNames(await fetchScannerNames(ids));
    }
    setRefreshing(false);
  }, [isController, user?.id]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <Screen>
      <ScreenTitle
        title={t('scanHistory.controllerTitle')}
        subtitle={isController ? t('scanHistory.myScans') : t('scanHistory.allControllers')}
      />
      <FlatList
        data={items}
        keyExtractor={(i) => i.id}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              void load();
            }}
          />
        }
        contentContainerStyle={{ paddingBottom: spacing.xl, gap: spacing.sm }}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <View style={styles.rowTop}>
              <Text style={[styles.status, { color: item.valid ? '#16a34a' : '#dc2626' }]}>
                {item.valid ? '✓' : '✗'} {item.userName ?? item.reason ?? '—'}
              </Text>
              <Text style={styles.time}>{formatScanTime(item.scannedAt)}</Text>
            </View>
            <Text style={styles.meta}>
              {t('scanner.zone')}: {item.zone}
              {item.salonName ? ` · ${item.salonName}` : ''}
              {!isController && item.scannedBy
                ? ` · ${scannerNames.get(item.scannedBy) ?? t('scanHistory.controller')}`
                : ''}
            </Text>
          </View>
        )}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  rowTop: { flexDirection: 'row', justifyContent: 'space-between', gap: spacing.sm },
  status: { flex: 1, fontFamily: fonts.bodyBold, fontSize: 14 },
  time: { fontFamily: fonts.body, fontSize: 12, color: colors.textMuted },
  meta: { marginTop: 4, fontFamily: fonts.body, fontSize: 12, color: colors.textMuted },
});

import { router } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { fetchVisitorScanHistory, type VisitorScanEntry } from '../../src/api/visitorScans';
import { SalonGate } from '../../src/components/guards/SalonGate';
import { EmptyState, PrimaryButton, Screen, ScreenTitle } from '../../src/components/ui';
import { useAuth } from '../../src/context/AuthContext';
import { useI18n } from '../../src/i18n/I18nProvider';
import { colors, fonts, radius, spacing } from '../../src/theme';

function formatScanTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString('fr-FR', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function ScanRow({ item, t }: { item: VisitorScanEntry; t: (k: string) => string }) {
  const kindLabel =
    item.kind === 'networking' ? t('scanHistory.kindNetworking') : t('scanHistory.kindStand');
  return (
    <View style={styles.row}>
      <View style={styles.rowTop}>
        <Text style={styles.partner}>{item.partnerName}</Text>
        <Text style={styles.time}>{formatScanTime(item.scannedAt)}</Text>
      </View>
      <View style={styles.rowMeta}>
        <Text style={styles.badge}>{kindLabel}</Text>
        {item.salonName ? <Text style={styles.salon}>{item.salonName}</Text> : null}
        {item.status ? <Text style={styles.status}>{item.status}</Text> : null}
      </View>
    </View>
  );
}

export default function VisitorScanHistoryScreen() {
  const { user } = useAuth();
  const { t } = useI18n();
  const [items, setItems] = useState<VisitorScanEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    if (!user) return;
    try {
      setItems(await fetchVisitorScanHistory(user.id));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <SalonGate>
      <Screen>
        <ScreenTitle title={t('scanHistory.title')} subtitle={t('scanHistory.visitorSubtitle')} />
        <PrimaryButton
          label={t('networking.scanTitle')}
          variant="gold"
          onPress={() => router.push('/(visitor)/scan-connect' as never)}
        />
        <FlatList
          data={items}
          keyExtractor={(i) => i.id}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); void load(); }} />
          }
          contentContainerStyle={items.length ? styles.list : styles.listEmpty}
          ListEmptyComponent={
            !loading ? (
              <EmptyState title={t('scanHistory.empty')} message={t('scanHistory.emptyHint')} />
            ) : null
          }
          renderItem={({ item }) => <ScanRow item={item} t={t} />}
        />
      </Screen>
    </SalonGate>
  );
}

const styles = StyleSheet.create({
  list: { paddingBottom: spacing.xl, gap: spacing.sm },
  listEmpty: { flexGrow: 1, paddingBottom: spacing.xl },
  row: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  rowTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: spacing.sm },
  partner: { flex: 1, fontFamily: fonts.bodyBold, fontSize: 15, color: colors.text },
  time: { fontFamily: fonts.body, fontSize: 12, color: colors.textMuted },
  rowMeta: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs, marginTop: spacing.xs },
  badge: {
    fontFamily: fonts.bodyBold,
    fontSize: 11,
    color: colors.gold,
    backgroundColor: `${colors.gold}18`,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radius.sm,
  },
  salon: { fontFamily: fonts.body, fontSize: 11, color: colors.primaryDark },
  status: { fontFamily: fonts.body, fontSize: 11, color: colors.textMuted, textTransform: 'capitalize' },
});

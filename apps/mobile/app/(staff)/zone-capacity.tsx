import { useCallback, useEffect, useRef, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { fetchZoneCapacities, subscribeZoneCapacity } from '../../src/api/gates';
import { Screen, ScreenTitle } from '../../src/components/ui';
import { AppIcon } from '../../src/components/AppIcon';
import type { ZoneCapacity } from '../../src/types';
import { useI18n } from '../../src/i18n/I18nProvider';
import { localeCode } from '../../src/lib/locale';
import { colors, fonts, radius, shadows, spacing } from '../../src/theme';

export default function ZoneCapacityScreen() {
  const { locale } = useI18n();
  const [zones, setZones] = useState<ZoneCapacity[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  const loadVersionRef = useRef(0);

  const load = useCallback(async () => {
    const version = ++loadVersionRef.current;
    try {
      const data = await fetchZoneCapacities();
      if (version === loadVersionRef.current) {
        setZones(data);
        setLastUpdate(new Date());
      }
    } catch { /* silently ignore */ }
  }, []);

  useEffect(() => {
    load();
    // Polling toutes les 30s + realtime
    const interval = setInterval(load, 30_000);
    const unsub = subscribeZoneCapacity(() => load());
    return () => {
      clearInterval(interval);
      unsub();
    };
  }, [load]);

  const totalCurrent = zones.reduce((s, z) => s + z.current, 0);
  const totalMax = zones.reduce((s, z) => s + z.max, 0);

  return (
    <Screen>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={async () => { setRefreshing(true); await load(); setRefreshing(false); }} />}
      >
        <ScreenTitle title="Capacité zones" subtitle={`Dernière màj : ${lastUpdate.toLocaleTimeString(localeCode(locale))}`} />

        <View style={styles.totalCard}>
          <Text style={styles.totalLabel}>Affluence totale</Text>
          <View style={styles.totalCountRow}>
            <Text style={styles.totalCount}>{totalCurrent.toLocaleString()}</Text>
            <Text style={styles.totalMax}>/ {totalMax.toLocaleString()}</Text>
          </View>
          <ProgressBar value={totalCurrent} max={totalMax} color={getCapacityColor(totalCurrent, totalMax)} />
          <Text style={styles.totalPct}>{Math.round((totalCurrent / totalMax) * 100)}% de remplissage</Text>
        </View>

        {zones.map((z) => (
          <ZoneCard key={z.zone} zone={z} />
        ))}
      </ScrollView>
    </Screen>
  );
}

function ZoneCard({ zone }: { zone: ZoneCapacity }) {
  const pct = zone.max > 0 ? Math.round((zone.current / zone.max) * 100) : 0;
  const color = getCapacityColor(zone.current, zone.max);
  const isWarning = pct >= 80;
  const isFull = pct >= 95;

  return (
    <View style={[styles.zoneCard, isFull && styles.zoneCardFull, isWarning && !isFull && styles.zoneCardWarning]}>
      <View style={styles.zoneHeader}>
        <Text style={styles.zoneName}>{zone.label}</Text>
        <View style={[styles.statusChip, { backgroundColor: color + '20' }]}>
          <AppIcon
            name={isFull ? 'warning-outline' : isWarning ? 'flash-outline' : 'checkmark-outline'}
            size={12}
            color={color}
          />
          <Text style={[styles.statusChipText, { color }]}>
            {isFull ? 'Complet' : isWarning ? 'Élevé' : 'Normal'}
          </Text>
        </View>
      </View>
      <View style={styles.zoneCountRow}>
        <Text style={[styles.zoneCount, { color }]}>{zone.current.toLocaleString()}</Text>
        <Text style={styles.zoneMax}> / {zone.max.toLocaleString()} personnes</Text>
      </View>
      <ProgressBar value={zone.current} max={zone.max} color={color} />
      <Text style={styles.zonePct}>{pct}%</Text>
    </View>
  );
}

function ProgressBar({ value, max, color }: { value: number; max: number; color: string }) {
  const pct = Math.min(100, max > 0 ? (value / max) * 100 : 0);
  return (
    <View style={styles.progressBg}>
      <View style={[styles.progressFill, { width: `${pct}%` as any, backgroundColor: color }]} />
    </View>
  );
}

function getCapacityColor(current: number, max: number): string {
  if (max === 0) return colors.textMuted;
  const pct = (current / max) * 100;
  if (pct >= 95) return colors.danger;
  if (pct >= 80) return colors.warning;
  return colors.success;
}

const styles = StyleSheet.create({
  totalCard: {
    backgroundColor: colors.primaryDark,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    ...shadows.md,
  },
  totalLabel: { color: 'rgba(255,255,255,0.7)', fontFamily: fonts.bodyBold, fontSize: 12, textTransform: 'uppercase', letterSpacing: 1, marginBottom: spacing.xs },
  totalCountRow: { flexDirection: 'row', alignItems: 'baseline', marginBottom: spacing.sm },
  totalCount: { color: '#fff', fontFamily: fonts.display, fontSize: 48 },
  totalMax: { color: 'rgba(255,255,255,0.5)', fontFamily: fonts.body, fontSize: 20, marginLeft: spacing.xs },
  totalPct: { color: colors.gold, fontFamily: fonts.body, fontSize: 13, marginTop: spacing.xs },
  zoneCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.sm,
  },
  zoneCardWarning: { borderColor: colors.warning, backgroundColor: colors.warningBg },
  zoneCardFull: { borderColor: colors.danger, backgroundColor: colors.dangerBg },
  zoneHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.xs },
  zoneName: { fontFamily: fonts.bodyBold, fontSize: 15, color: colors.text },
  statusChip: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: spacing.sm, paddingVertical: 3, borderRadius: radius.full },
  statusChipText: { fontFamily: fonts.bodyBold, fontSize: 11 },
  zoneCountRow: { flexDirection: 'row', alignItems: 'baseline', marginBottom: spacing.sm },
  zoneCount: { fontFamily: fonts.display, fontSize: 28 },
  zoneMax: { fontFamily: fonts.body, color: colors.textMuted, fontSize: 14 },
  zonePct: { fontFamily: fonts.body, color: colors.textMuted, fontSize: 12, textAlign: 'right', marginTop: 2 },
  progressBg: { height: 6, backgroundColor: colors.border, borderRadius: 3, overflow: 'hidden' },
  progressFill: { height: 6, borderRadius: 3 },
});

import { router } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { fetchExhibitorMetrics } from '../../../src/api/analytics';
import { fetchExhibitorStand, fetchMiniSite } from '../../../src/api/minisite';
import { Card, PrimaryButton, Screen, ScreenTitle } from '../../../src/components/ui';
import { useAuth } from '../../../src/context/AuthContext';
import { colors, spacing } from '../../../src/theme';

export default function ExhibitorHomeScreen() {
  const { user } = useAuth();
  const [stand, setStand] = useState<Awaited<ReturnType<typeof fetchExhibitorStand>>>(null);
  const [metrics, setMetrics] = useState({ appointments: 0, messages: 0, connections: 0 });
  const [miniSite, setMiniSite] = useState<Awaited<ReturnType<typeof fetchMiniSite>>>(null);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    if (!user) return;
    const [s, m, ms] = await Promise.all([
      fetchExhibitorStand(user.id),
      fetchExhibitorMetrics(user.id),
      fetchMiniSite(user.id),
    ]);
    setStand(s);
    setMetrics(m);
    setMiniSite(ms);
  }, [user]);

  useEffect(() => { load(); }, [load]);

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  return (
    <Screen style={styles.flex}>
      <ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
        <ScreenTitle title="Mon stand" subtitle={stand?.companyName ?? user?.name ?? 'Exposant'} />
        <Card>
          <Text style={styles.label}>Stand</Text>
          <Text style={styles.value}>{stand?.standNumber ?? '—'} · Hall {stand?.hallNumber ?? '—'}</Text>
          <Text style={styles.desc}>{stand?.description ?? 'Complétez votre fiche stand sur le web ou via Mini-site.'}</Text>
        </Card>
        <View style={styles.statsRow}>
          <Stat label="RDV" value={String(metrics.appointments)} />
          <Stat label="Messages" value={String(metrics.messages)} />
          <Stat label="Réseau" value={String(metrics.connections)} />
        </View>
        <PrimaryButton label="Scanner un contact" onPress={() => router.push('/(exhibitor)/scan')} />
        <View style={styles.gap} />
        <PrimaryButton label="Mini-site" onPress={() => router.push('/(exhibitor)/minisite')} />
        <View style={styles.gap} />
        <PrimaryButton label="Analytics détaillés" onPress={() => router.push('/(exhibitor)/analytics')} />
        {miniSite && (
          <Text style={styles.hint}>
            Mini-site : {miniSite.isPublished ? 'Publié' : 'Brouillon'}
          </Text>
        )}
      </ScrollView>
    </Screen>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  gap: { height: spacing.sm },
  label: { fontSize: 12, color: colors.textMuted, textTransform: 'uppercase' },
  value: { fontSize: 18, fontWeight: '700', color: colors.text, marginTop: 4 },
  desc: { fontSize: 14, color: colors.textMuted, marginTop: 8, lineHeight: 20 },
  statsRow: { flexDirection: 'row', gap: spacing.sm, marginVertical: spacing.md },
  stat: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  statValue: { fontSize: 22, fontWeight: '700', color: colors.primary },
  statLabel: { fontSize: 12, color: colors.textMuted, marginTop: 4 },
  hint: { textAlign: 'center', color: colors.textMuted, marginTop: spacing.sm, fontSize: 13 },
});

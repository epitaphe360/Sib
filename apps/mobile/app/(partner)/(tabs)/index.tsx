import { useCallback, useEffect, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { fetchPartnerMetrics } from '../../../src/api/analytics';
import { Card, Screen, ScreenTitle } from '../../../src/components/ui';
import { useAuth } from '../../../src/context/AuthContext';
import { colors, spacing } from '../../../src/theme';

export default function PartnerHomeScreen() {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState({ appointments: 0, messages: 0, connections: 0 });
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    if (!user) return;
    setMetrics(await fetchPartnerMetrics(user.id));
  }, [user]);

  useEffect(() => { load(); }, [load]);

  return (
    <Screen style={styles.flex}>
      <ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={async () => { setRefreshing(true); await load(); setRefreshing(false); }} />}>
        <ScreenTitle title="Espace partenaire" subtitle={user?.name} />
        <View style={styles.statsRow}>
          <Stat label="RDV / Leads" value={String(metrics.appointments)} />
          <Stat label="Messages" value={String(metrics.messages)} />
        </View>
        <Card>
          <Text style={styles.text}>Gérez vos leads, rendez-vous et médias depuis cette application mobile.</Text>
        </Card>
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
  statsRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md },
  stat: { flex: 1, backgroundColor: colors.surface, borderRadius: 12, padding: spacing.md, alignItems: 'center', borderWidth: 1, borderColor: colors.border },
  statValue: { fontSize: 22, fontWeight: '700', color: colors.primary },
  statLabel: { fontSize: 12, color: colors.textMuted, marginTop: 4 },
  text: { color: colors.textMuted, lineHeight: 20 },
});

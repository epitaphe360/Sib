import { router } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { fetchAdminLiveMetrics } from '../../../src/api/analytics';
import { Card, PrimaryButton, Screen, ScreenTitle } from '../../../src/components/ui';
import { useAuth } from '../../../src/context/AuthContext';
import { colors, spacing } from '../../../src/theme';

export default function StaffLiveScreen() {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState({ totalUsers: 0, pendingPayments: 0, pendingValidations: 0 });
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    if (user?.type === 'admin') {
      setMetrics(await fetchAdminLiveMetrics());
    }
  }, [user]);

  useEffect(() => { load(); }, [load]);

  const isSecurity = user?.type === 'security';

  return (
    <Screen style={styles.flex}>
      <ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={async () => { setRefreshing(true); await load(); setRefreshing(false); }} />}>
        <ScreenTitle
          title={isSecurity ? 'Contrôle accès' : 'Suivi organisateur'}
          subtitle={isSecurity ? 'Validation badges en entrée' : 'Métriques salon en direct'}
        />
        {isSecurity ? (
          <>
            <Text style={styles.text}>Utilisez le scanner pour valider les badges à l'entrée.</Text>
            <PrimaryButton label="Ouvrir le scanner" onPress={() => router.push('/(staff)/scanner')} />
          </>
        ) : (
          <>
            <View style={styles.statsRow}>
              <Stat label="Utilisateurs" value={String(metrics.totalUsers)} />
              <Stat label="Paiements" value={String(metrics.pendingPayments)} />
            </View>
            <Card>
              <Text style={styles.text}>Validez les paiements VIP et surveillez les inscriptions en attente.</Text>
            </Card>
            <PrimaryButton label="Validation paiements" onPress={() => router.push('/(staff)/payments')} />
            <View style={styles.gap} />
            <PrimaryButton label="Tarif Pass VIP" onPress={() => router.push('/(staff)/pricing')} />
            <View style={styles.gap} />
            <PrimaryButton label="Alertes inscriptions" onPress={() => router.push('/(staff)/alerts')} />
            <View style={styles.gap} />
            <PrimaryButton label="Gestion utilisateurs" onPress={() => router.push('/(staff)/users')} />
          </>
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
  statsRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md },
  stat: { flex: 1, backgroundColor: colors.surface, borderRadius: 12, padding: spacing.md, alignItems: 'center', borderWidth: 1, borderColor: colors.border },
  statValue: { fontSize: 22, fontWeight: '700', color: colors.primary },
  statLabel: { fontSize: 12, color: colors.textMuted, marginTop: 4 },
  text: { color: colors.textMuted, lineHeight: 20, marginBottom: spacing.md },
});

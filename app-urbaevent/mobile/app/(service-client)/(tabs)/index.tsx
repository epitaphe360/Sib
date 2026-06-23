import { router } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { fetchDeskStats } from '../../../src/api/serviceClient';
import { PrimaryButton, Screen, ScreenTitle } from '../../../src/components/ui';
import { useAuth } from '../../../src/context/AuthContext';
import { useI18n } from '../../../src/i18n/I18nProvider';
import { SALON_INFO } from '../../../src/data/salons';
import { colors, fonts, radius, spacing } from '../../../src/theme';

export default function ServiceClientDashboard() {
  const { user } = useAuth();
  const { t } = useI18n();
  const [stats, setStats] = useState({ registrationsToday: 0, badgesIssuedToday: 0, replacementsToday: 0 });
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    if (!user) return;
    try {
      const s = await fetchDeskStats(user.id);
      setStats(s);
    } catch (e) {
      console.warn('[ServiceClientDashboard] fetchDeskStats', e);
    }
  }, [user]);

  useEffect(() => { load(); }, [load]);

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return t('greeting.morning');
    if (h < 18) return t('greeting.afternoon');
    return t('greeting.evening');
  };

  const firstName = (user?.profile as Record<string, unknown> | null)?.firstName as string | undefined
    ?? user?.name?.split(' ')[0]
    ?? 'Agent';

  return (
    <Screen>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={async () => { setRefreshing(true); await load(); setRefreshing(false); }} />}
      >
        <View style={styles.header}>
          <Text style={styles.greeting}>{greeting()}, {firstName}</Text>
          <Text style={styles.role}>Service Clientèle · {SALON_INFO.name}</Text>
        </View>

        {/* Stats du jour */}
        <Text style={styles.sectionTitle}>Aujourd'hui</Text>
        <View style={styles.statsRow}>
          <StatCard label="Inscriptions" value={stats.registrationsToday} icon="📝" color="#0891B2" />
          <StatCard label="Badges émis" value={stats.badgesIssuedToday} icon="🪪" color="#15803D" />
          <StatCard label="Remplacements" value={stats.replacementsToday} icon="🔄" color="#B45309" />
        </View>

        {/* Actions rapides */}
        <Text style={styles.sectionTitle}>Actions rapides</Text>

        <ActionButton
          title="Rechercher un participant"
          subtitle="Retrouver par email, nom ou code badge"
          icon="🔍"
          onPress={() => router.push('/(service-client)/(tabs)/lookup' as never)}
        />
        <ActionButton
          title="Inscription sur place"
          subtitle="Enregistrer un nouveau visiteur"
          icon="➕"
          onPress={() => router.push('/(service-client)/on-site-registration' as never)}
        />
        <ActionButton
          title="Remplacement badge"
          subtitle="Badge perdu ou endommagé"
          icon="🔄"
          onPress={() => router.push('/(service-client)/badge-replacement' as never)}
        />
        <ActionButton
          title="Station impression"
          subtitle="Imprimer le badge A4 d'un participant"
          icon="🖨️"
          onPress={() => router.push('/(service-client)/print-station' as never)}
        />
        <ActionButton
          title="Capacité zones"
          subtitle="Voir l'affluence en temps réel"
          icon="📊"
          onPress={() => router.push('/(service-client)/zone-capacity' as never)}
        />
      </ScrollView>
    </Screen>
  );
}

function StatCard({ label, value, icon, color }: { label: string; value: number; icon: string; color: string }) {
  return (
    <View style={[styles.statCard, { borderTopColor: color }]}>
      <Text style={styles.statIcon}>{icon}</Text>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function ActionButton({ title, subtitle, icon, onPress }: { title: string; subtitle: string; icon: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={styles.actionCard}>
      <Text style={styles.actionIcon}>{icon}</Text>
      <View style={styles.actionContent}>
        <Text style={styles.actionTitle}>{title}</Text>
        <Text style={styles.actionSub}>{subtitle}</Text>
      </View>
      <Text style={styles.actionChevron}>›</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  header: { backgroundColor: '#0E7490', borderRadius: radius.lg, padding: spacing.lg, marginBottom: spacing.md },
  greeting: { color: '#fff', fontFamily: fonts.bodyBold, fontSize: 22, marginBottom: 2 },
  role: { color: 'rgba(255,255,255,0.7)', fontFamily: fonts.body, fontSize: 13 },
  sectionTitle: { fontFamily: fonts.bodyBold, fontSize: 16, color: colors.text, marginBottom: spacing.sm, marginTop: spacing.sm },
  statsRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md },
  statCard: { flex: 1, backgroundColor: colors.surface, borderRadius: radius.md, padding: spacing.sm, alignItems: 'center', borderWidth: 1, borderColor: colors.border, borderTopWidth: 3 },
  statIcon: { fontSize: 20, marginBottom: 4 },
  statValue: { fontFamily: fonts.display, fontSize: 24 },
  statLabel: { fontFamily: fonts.body, fontSize: 11, color: colors.textMuted, textAlign: 'center', marginTop: 2 },
  actionCard: { marginBottom: spacing.sm, padding: spacing.md, backgroundColor: colors.surface, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  actionIcon: { fontSize: 24, width: 32 },
  actionContent: { flex: 1 },
  actionTitle: { fontFamily: fonts.bodyBold, fontSize: 15, color: colors.text },
  actionSub: { fontFamily: fonts.body, fontSize: 12, color: colors.textMuted, marginTop: 2 },
  actionChevron: { fontSize: 22, color: colors.textMuted },
});

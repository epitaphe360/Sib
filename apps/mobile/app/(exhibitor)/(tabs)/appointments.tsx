import { useCallback, useEffect, useState } from 'react';
import { Alert, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { fetchAppointmentsForUser, updateAppointmentStatus } from '../../../src/api/appointments';
import { EmptyState, Screen, ScreenTitle } from '../../../src/components/ui';
import { useAuth } from '../../../src/context/AuthContext';
import { colors, spacing } from '../../../src/theme';

export default function ExhibitorAppointmentsScreen() {
  const { user } = useAuth();
  const [items, setItems] = useState<Awaited<ReturnType<typeof fetchAppointmentsForUser>>>([]);

  const load = useCallback(async () => {
    if (!user) return;
    setItems(await fetchAppointmentsForUser(user.id, user.type));
  }, [user]);

  useEffect(() => { load(); }, [load]);

  const act = async (id: string, status: string) => {
    try {
      await updateAppointmentStatus(id, status);
      await load();
    } catch (e) {
      Alert.alert('Erreur', e instanceof Error ? e.message : 'Action impossible');
    }
  };

  return (
    <Screen style={styles.flex}>
      <ScreenTitle title="Rendez-vous" subtitle="Demandes visiteurs" />
      <FlatList
        data={items}
        keyExtractor={(i) => i.id}
        ListEmptyComponent={<EmptyState message="Aucun rendez-vous" />}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.title}>{item.visitorName ?? 'Visiteur'}</Text>
            <Text style={styles.meta}>Statut : {item.status}</Text>
            {item.status === 'pending' && (
              <View style={styles.actions}>
                <Pressable style={styles.ok} onPress={() => act(item.id, 'confirmed')}>
                  <Text style={styles.btnText}>Accepter</Text>
                </Pressable>
                <Pressable style={styles.ko} onPress={() => act(item.id, 'rejected')}>
                  <Text style={styles.btnText}>Refuser</Text>
                </Pressable>
              </View>
            )}
          </View>
        )}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  card: {
    backgroundColor: colors.surface,
    marginBottom: spacing.sm,
    padding: spacing.md,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  title: { fontWeight: '700', color: colors.text, fontSize: 16 },
  meta: { color: colors.textMuted, marginTop: 4, fontSize: 13 },
  actions: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.sm },
  ok: { flex: 1, backgroundColor: colors.success, padding: 10, borderRadius: 8, alignItems: 'center' },
  ko: { flex: 1, backgroundColor: colors.danger, padding: 10, borderRadius: 8, alignItems: 'center' },
  btnText: { color: '#fff', fontWeight: '600' },
});

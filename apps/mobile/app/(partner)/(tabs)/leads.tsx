import { useCallback, useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { fetchAppointmentsForUser } from '../../../src/api/appointments';
import { EmptyState, Screen, ScreenTitle } from '../../../src/components/ui';
import { useAuth } from '../../../src/context/AuthContext';
import { colors, spacing } from '../../../src/theme';

export default function PartnerLeadsScreen() {
  const { user } = useAuth();
  const [items, setItems] = useState<Awaited<ReturnType<typeof fetchAppointmentsForUser>>>([]);

  const load = useCallback(async () => {
    if (!user) return;
    setItems(await fetchAppointmentsForUser(user.id, user.type));
  }, [user]);

  useEffect(() => { load(); }, [load]);

  return (
    <Screen style={styles.flex}>
      <ScreenTitle title="Leads & RDV" />
      <FlatList
        data={items}
        keyExtractor={(i) => i.id}
        ListEmptyComponent={<EmptyState message="Aucun lead pour le moment" />}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.title}>{item.visitorName ?? 'Contact'}</Text>
            <Text style={styles.meta}>{item.status} · {new Date(item.createdAt).toLocaleDateString('fr-FR')}</Text>
          </View>
        )}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  card: { padding: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border },
  title: { fontWeight: '600', color: colors.text },
  meta: { color: colors.textMuted, fontSize: 13, marginTop: 4 },
});

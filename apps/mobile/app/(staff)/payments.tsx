import { useCallback, useEffect, useState } from 'react';
import { Alert, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { fetchPendingPaymentRequests, validatePaymentRequest, type PaymentRequestRow } from '../../src/api/admin';
import { EmptyState, Screen, ScreenTitle } from '../../src/components/ui';
import { colors, spacing } from '../../src/theme';

export default function StaffPaymentsScreen() {
  const [items, setItems] = useState<PaymentRequestRow[]>([]);

  const load = useCallback(async () => {
    setItems(await fetchPendingPaymentRequests());
  }, []);

  useEffect(() => { load(); }, [load]);

  const act = async (id: string, approve: boolean) => {
    try {
      await validatePaymentRequest(id, approve);
      await load();
      Alert.alert('Succès', approve ? 'Paiement validé' : 'Paiement refusé');
    } catch (e) {
      Alert.alert('Erreur', e instanceof Error ? e.message : 'Action impossible');
    }
  };

  return (
    <Screen style={styles.flex}>
      <ScreenTitle title="Validation paiements VIP" />
      <FlatList
        data={items}
        keyExtractor={(i) => i.id}
        ListEmptyComponent={<EmptyState message="Aucun paiement en attente" />}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.title}>{item.userName ?? item.userEmail}</Text>
            <Text style={styles.amount}>{item.amount} {item.currency}</Text>
            <View style={styles.actions}>
              <Pressable style={styles.ok} onPress={() => act(item.id, true)}>
                <Text style={styles.btn}>Valider</Text>
              </Pressable>
              <Pressable style={styles.ko} onPress={() => act(item.id, false)}>
                <Text style={styles.btn}>Refuser</Text>
              </Pressable>
            </View>
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
  amount: { color: colors.primary, marginTop: 4, fontSize: 18, fontWeight: '700' },
  actions: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.sm },
  ok: { flex: 1, backgroundColor: colors.success, padding: 10, borderRadius: 8, alignItems: 'center' },
  ko: { flex: 1, backgroundColor: colors.danger, padding: 10, borderRadius: 8, alignItems: 'center' },
  btn: { color: '#fff', fontWeight: '600' },
});

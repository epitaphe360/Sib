import { useCallback, useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { supabase } from '../../../src/lib/supabase';
import { EmptyState, Screen, ScreenTitle } from '../../../src/components/ui';
import { useAuth } from '../../../src/context/AuthContext';
import { colors, spacing } from '../../../src/theme';

interface MediaRow {
  id: string;
  title: string;
  status: string;
}

export default function PartnerMediaScreen() {
  const { user } = useAuth();
  const [items, setItems] = useState<MediaRow[]>([]);

  const load = useCallback(async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from('pending_partner_media')
      .select('id, title, status')
      .eq('created_by_id', user.id)
      .order('created_at', { ascending: false })
      .limit(30);
    if (error && error.code !== '42P01') throw error;
    setItems((data ?? []).map((r) => ({ id: r.id, title: r.title ?? 'Média', status: r.status ?? 'pending' })));
  }, [user]);

  useEffect(() => { load(); }, [load]);

  return (
    <Screen style={styles.flex}>
      <ScreenTitle title="Médias" subtitle="Statut de validation" />
      <FlatList
        data={items}
        keyExtractor={(i) => i.id}
        ListEmptyComponent={<EmptyState message="Aucun média" />}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.status}>{item.status}</Text>
          </View>
        )}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  row: { flexDirection: 'row', justifyContent: 'space-between', padding: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border },
  title: { color: colors.text, flex: 1 },
  status: { color: colors.primaryLight, fontWeight: '600', textTransform: 'capitalize' },
});

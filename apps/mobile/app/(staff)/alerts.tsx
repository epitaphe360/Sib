import { useCallback, useEffect, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { fetchPendingRegistrationAlerts, type RegistrationAlertRow } from '../../src/api/admin';
import { EmptyState, Screen, ScreenTitle } from '../../src/components/ui';
import { useI18n } from '../../src/i18n/I18nProvider';
import { colors, spacing } from '../../src/theme';

export default function StaffAlertsScreen() {
  const { t } = useI18n();
  const [items, setItems] = useState<RegistrationAlertRow[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    setItems(await fetchPendingRegistrationAlerts());
  }, []);

  useEffect(() => { load(); }, [load]);

  return (
    <Screen style={styles.flex}>
      <ScreenTitle title={t('staff.alerts.title')} subtitle={t('staff.alerts.subtitle')} />
      <FlatList
        data={items}
        keyExtractor={(i) => i.id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={async () => { setRefreshing(true); await load(); setRefreshing(false); }} />
        }
        ListEmptyComponent={<EmptyState message={t('staff.alerts.empty')} />}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.title}>{item.name ?? item.email}</Text>
            <Text style={styles.meta}>{item.type ?? '—'} · {item.status}</Text>
            <Text style={styles.date}>{new Date(item.createdAt).toLocaleString('fr-FR')}</Text>
          </View>
        )}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  card: { padding: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border },
  title: { fontWeight: '700', color: colors.text },
  meta: { color: colors.primary, marginTop: 4, fontSize: 13 },
  date: { color: colors.textMuted, fontSize: 12, marginTop: 4 },
});

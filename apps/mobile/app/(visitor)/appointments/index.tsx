import { router } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { fetchAppointmentsForUser, type MobileAppointment } from '../../../src/api/appointments';
import { EmptyState, PrimaryButton, Screen, ScreenTitle } from '../../../src/components/ui';
import { useAuth } from '../../../src/context/AuthContext';
import { useI18n } from '../../../src/i18n/I18nProvider';
import { colors, spacing } from '../../../src/theme';

const STATUS_KEYS: Record<string, string> = {
  pending: 'appointments.status.pending',
  confirmed: 'appointments.status.confirmed',
  rejected: 'appointments.status.rejected',
  cancelled: 'appointments.status.cancelled',
};

export default function VisitorAppointmentsScreen() {
  const { user } = useAuth();
  const { t } = useI18n();
  const [items, setItems] = useState<MobileAppointment[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    if (!user) return;
    setItems(await fetchAppointmentsForUser(user.id, user.type));
  }, [user]);

  useEffect(() => { load(); }, [load]);

  return (
    <Screen style={styles.flex}>
      <ScreenTitle title={t('appointments.title')} subtitle={t('appointments.subtitle')} />
      <PrimaryButton label={t('appointments.new.button')} onPress={() => router.push('/(visitor)/appointments/new')} />
      <View style={styles.gap} />
      <FlatList
        data={items}
        keyExtractor={(i) => i.id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={async () => { setRefreshing(true); await load(); setRefreshing(false); }} />
        }
        ListEmptyComponent={<EmptyState message={t('appointments.empty')} />}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.title}>{item.exhibitorName ?? t('appointments.exhibitor')}</Text>
            <Text style={styles.status}>{t(STATUS_KEYS[item.status] ?? 'appointments.status.pending')}</Text>
            {item.startTime ? <Text style={styles.meta}>{new Date(item.startTime).toLocaleString('fr-FR')}</Text> : null}
            {item.location ? <Text style={styles.meta}>{item.location}</Text> : null}
            {item.message ? <Text style={styles.message}>{item.message}</Text> : null}
          </View>
        )}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  gap: { height: spacing.sm },
  card: { padding: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border },
  title: { fontSize: 16, fontWeight: '700', color: colors.text },
  status: { color: colors.primary, fontWeight: '600', marginTop: 4 },
  meta: { color: colors.textMuted, fontSize: 13, marginTop: 4 },
  message: { color: colors.text, fontSize: 14, marginTop: 8, fontStyle: 'italic' },
});

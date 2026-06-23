import { useCallback, useEffect, useState } from 'react';
import { Alert, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { fetchAppointmentsForUser, updateAppointmentStatus } from '../../../src/api/appointments';
import { EmptyState, Screen, ScreenTitle } from '../../../src/components/ui';
import { useAuth } from '../../../src/context/AuthContext';
import { useI18n } from '../../../src/i18n/I18nProvider';
import { colors, spacing } from '../../../src/theme';

const STATUS_KEYS: Record<string, string> = {
  pending: 'appointments.status.pending',
  confirmed: 'appointments.status.confirmed',
  rejected: 'appointments.status.rejected',
  cancelled: 'appointments.status.cancelled',
};

export default function ExhibitorAppointmentsScreen() {
  const { user } = useAuth();
  const { t } = useI18n();
  const [items, setItems] = useState<Awaited<ReturnType<typeof fetchAppointmentsForUser>>>([]);

  const load = useCallback(async () => {
    if (!user) return;
    try {
      setItems(await fetchAppointmentsForUser(user.id, user.type));
    } catch (e) {
      Alert.alert(t('common.error'), e instanceof Error ? e.message : t('common.error'));
    }
  }, [user, t]);

  useEffect(() => { load(); }, [load]);

  const act = async (id: string, status: string) => {
    try {
      await updateAppointmentStatus(id, status);
      await load();
    } catch (e) {
      Alert.alert(t('common.error'), e instanceof Error ? e.message : t('common.error'));
    }
  };

  return (
    <Screen style={styles.flex}>
      <ScreenTitle title={t('appointments.exhibitorTitle')} subtitle={t('appointments.exhibitorSubtitle')} />
      <FlatList
        data={items}
        keyExtractor={(i) => i.id}
        ListEmptyComponent={<EmptyState message={t('appointments.empty')} />}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.title}>{item.visitorName ?? t('appointments.visitor')}</Text>
            <Text style={styles.meta}>
              {t('appointments.statusLabel')} : {t(STATUS_KEYS[item.status] ?? 'appointments.status.pending')}
            </Text>
            {item.status === 'pending' && (
              <View style={styles.actions}>
                <Pressable style={styles.ok} onPress={() => act(item.id, 'confirmed')}>
                  <Text style={styles.btnText}>{t('networking.accept')}</Text>
                </Pressable>
                <Pressable style={styles.ko} onPress={() => act(item.id, 'rejected')}>
                  <Text style={styles.btnText}>{t('networking.reject')}</Text>
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

import { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';
import {
  fetchPendingRegistrationAlerts,
  reviewRegistrationRequest,
  type RegistrationAlertRow,
} from '../../src/api/admin';
import { EmptyState, PrimaryButton, Screen, ScreenTitle } from '../../src/components/ui';
import { SkeletonList } from '../../src/components/Skeleton';
import { withRetry } from '../../src/lib/withRetry';
import { useI18n } from '../../src/i18n/I18nProvider';
import { colors, fonts, spacing } from '../../src/theme';

export default function StaffAlertsScreen() {
  const { t } = useI18n();
  const [items, setItems] = useState<RegistrationAlertRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actingId, setActingId] = useState<string | null>(null);
  const abortRef = useRef(false);

  const load = useCallback(async () => {
    abortRef.current = false;
    try {
      const data = await withRetry(fetchPendingRegistrationAlerts, { context: 'StaffAlerts', maxAttempts: 3 });
      if (!abortRef.current) setItems(data);
    } catch (e) {
      Alert.alert(t('common.error'), e instanceof Error ? e.message : t('common.error'));
    } finally {
      if (!abortRef.current) setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    load();
    return () => { abortRef.current = true; };
  }, [load]);

  const review = async (id: string, approve: boolean) => {
    setActingId(id);
    try {
      await reviewRegistrationRequest(id, approve);
      await load();
      Alert.alert(approve ? t('staff.alerts.approved') : t('staff.alerts.rejected'));
    } catch (e) {
      Alert.alert(t('common.error'), e instanceof Error ? e.message : t('common.error'));
    } finally {
      setActingId(null);
    }
  };

  if (loading) {
    return (
      <Screen style={styles.flex}>
        <ScreenTitle title={t('staff.alerts.title')} subtitle={t('staff.alerts.subtitle')} />
        <SkeletonList rows={4} />
      </Screen>
    );
  }

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
            <Text style={styles.email}>{item.email}</Text>
            <Text style={styles.date}>{new Date(item.createdAt).toLocaleString('fr-FR')}</Text>
            <View style={styles.actions}>
              <Pressable
                style={[styles.btn, styles.approve]}
                disabled={actingId === item.id}
                onPress={() => review(item.id, true)}
              >
                <Text style={styles.btnText}>{t('payments.validate')}</Text>
              </Pressable>
              <Pressable
                style={[styles.btn, styles.reject]}
                disabled={actingId === item.id}
                onPress={() => review(item.id, false)}
              >
                <Text style={styles.btnText}>{t('payments.reject')}</Text>
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
  card: {
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.surface,
    marginBottom: spacing.sm,
    borderRadius: 12,
  },
  title: { fontWeight: '700', color: colors.text, fontFamily: fonts.bodyBold },
  meta: { color: colors.primary, marginTop: 4, fontSize: 13, fontFamily: fonts.body },
  email: { color: colors.textMuted, fontSize: 13, marginTop: 2, fontFamily: fonts.body },
  date: { color: colors.textMuted, fontSize: 12, marginTop: 4, fontFamily: fonts.body },
  actions: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md },
  btn: { flex: 1, paddingVertical: 10, borderRadius: 8, alignItems: 'center' },
  approve: { backgroundColor: '#16a34a' },
  reject: { backgroundColor: '#dc2626' },
  btnText: { color: '#fff', fontFamily: fonts.bodyBold, fontSize: 14 },
});

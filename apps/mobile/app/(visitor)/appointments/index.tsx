import { useCallback, useEffect, useState } from 'react';
import { Alert, FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { fetchAppointmentsForUser, type MobileAppointment } from '../../../src/api/appointments';
import { EmptyState, PrimaryButton, Screen, ScreenTitle } from '../../../src/components/ui';
import { useAuth } from '../../../src/context/AuthContext';
import { useI18n } from '../../../src/i18n/I18nProvider';
import { navigateSafe, requireAuth } from '../../../src/lib/navigateSafe';
import { colors, spacing } from '../../../src/theme';

const STATUS_KEYS: Record<string, string> = {
  pending: 'appointments.status.pending',
  confirmed: 'appointments.status.confirmed',
  rejected: 'appointments.status.rejected',
  cancelled: 'appointments.status.cancelled',
};

export default function VisitorAppointmentsScreen({ embedded = false }: { embedded?: boolean }) {
  const { user, isLoading } = useAuth();
  const { t, locale } = useI18n();
  const dateLocale = locale === 'ar' ? 'ar-MA' : locale === 'en' ? 'en-GB' : 'fr-FR';
  const [items, setItems] = useState<MobileAppointment[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    if (!user) return;
    try {
      setItems(await fetchAppointmentsForUser(user.id, user.type));
    } catch (e) {
      Alert.alert(t('common.error'), e instanceof Error ? e.message : t('common.error'));
    }
  }, [user, t]);

  useEffect(() => { load(); }, [load]);

  const openNew = () => {
    if (!requireAuth(user, t)) return;
    navigateSafe('/(visitor)/appointments/new');
  };

  const content = (
    <>
      {embedded ? <ScreenTitle title={t('appointments.title')} subtitle={t('appointments.subtitle')} /> : null}
      <PrimaryButton label={t('appointments.new.button')} onPress={openNew} />
      {!user && !isLoading ? (
        <EmptyState message={t('auth.emailRequired')} />
      ) : (
        <>
          <View style={styles.gap} />
          <FlatList
            style={embedded ? undefined : styles.flex}
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
                {item.startTime ? <Text style={styles.meta}>{new Date(item.startTime).toLocaleString(dateLocale)}</Text> : null}
                {item.location ? <Text style={styles.meta}>{item.location}</Text> : null}
                {item.message ? <Text style={styles.message}>{item.message}</Text> : null}
              </View>
            )}
          />
        </>
      )}
    </>
  );

  if (embedded) return <View style={[styles.flex, styles.embedded]}>{content}</View>;
  return <Screen style={styles.flex}>{content}</Screen>;
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  embedded: { paddingHorizontal: spacing.md },
  gap: { height: spacing.sm },
  card: { padding: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border },
  title: { fontSize: 16, fontWeight: '700', color: colors.text },
  status: { color: colors.primary, fontWeight: '600', marginTop: 4 },
  meta: { color: colors.textMuted, fontSize: 13, marginTop: 4 },
  message: { color: colors.text, fontSize: 14, marginTop: 8, fontStyle: 'italic' },
});

import { useCallback, useEffect, useState } from 'react';
import { Alert, FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { fetchAppointmentsForUser, type MobileAppointment } from '../../../src/api/appointments';
import { AppIcon } from '../../../src/components/AppIcon';
import { AppointmentStatusPill } from '../../../src/components/chat/AppointmentStatusPill';
import { IllustratedEmpty, PrimaryButton, Screen, ScreenTitle } from '../../../src/components/ui';
import { WorkspaceHeader } from '../../../src/components/workspace/WorkspaceUI';
import { useAuth } from '../../../src/context/AuthContext';
import { useI18n } from '../../../src/i18n/I18nProvider';
import { navigateSafe, requireAuth } from '../../../src/lib/navigateSafe';
import { colors, fonts, radius, shadows, spacing } from '../../../src/theme';

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

  const header = embedded ? (
    <ScreenTitle title={t('appointments.title')} subtitle={t('appointments.subtitle')} />
  ) : (
    <WorkspaceHeader
      eyebrow={t('tabs.appointments')}
      title={t('appointments.title')}
      subtitle={t('appointments.subtitle')}
      tone="salon"
      icon="calendar-outline"
      status={items.length ? `${items.length}` : undefined}
    />
  );

  const content = (
    <>
      {header}
      <View style={[styles.body, embedded && styles.bodyEmbedded]}>
        <PrimaryButton label={t('appointments.new.button')} onPress={openNew} />
        {!user && !isLoading ? (
          <IllustratedEmpty icon="person-outline" title={t('appointments.title')} message={t('auth.emailRequired')} />
        ) : (
          <FlatList
            style={styles.flex}
            data={items}
            keyExtractor={(i) => i.id}
            contentContainerStyle={[styles.list, items.length === 0 && styles.emptyList]}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={async () => { setRefreshing(true); await load(); setRefreshing(false); }} />
            }
            ListEmptyComponent={
              <IllustratedEmpty icon="calendar-outline" title={t('appointments.title')} message={t('appointments.empty')} />
            }
            renderItem={({ item }) => (
              <View style={styles.card}>
                <View style={styles.cardHeader}>
                  <View style={styles.iconWrap}>
                    <AppIcon name="storefront-outline" size={20} color={colors.primary} />
                  </View>
                  <View style={styles.cardCopy}>
                    <Text style={styles.title}>{item.exhibitorName ?? t('appointments.exhibitor')}</Text>
                    <AppointmentStatusPill label={t(STATUS_KEYS[item.status] ?? 'appointments.status.pending')} status={item.status} />
                    {item.startTime ? (
                      <Text style={styles.meta}>{new Date(item.startTime).toLocaleString(dateLocale)}</Text>
                    ) : null}
                    {item.location ? <Text style={styles.meta}>{item.location}</Text> : null}
                  </View>
                </View>
                {item.message ? <Text style={styles.message}>{item.message}</Text> : null}
              </View>
            )}
          />
        )}
      </View>
    </>
  );

  if (embedded) return <View style={[styles.flex, styles.embedded]}>{content}</View>;
  return <Screen style={styles.flex}>{content}</Screen>;
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  embedded: { paddingHorizontal: spacing.md },
  body: { flex: 1, paddingHorizontal: spacing.md, gap: spacing.sm, marginTop: -spacing.sm },
  bodyEmbedded: { marginTop: 0, paddingHorizontal: 0 },
  list: { paddingBottom: spacing.xl, gap: spacing.sm },
  emptyList: { flexGrow: 1 },
  card: {
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.borderLight,
    marginBottom: spacing.sm,
    ...shadows.sm,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: colors.accentMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardCopy: { flex: 1 },
  title: { fontSize: 16, fontFamily: fonts.bodyBold, color: colors.text },
  meta: { color: colors.textMuted, fontSize: 13, marginTop: 4, fontFamily: fonts.body },
  message: { color: colors.text, fontSize: 14, marginTop: spacing.sm, fontFamily: fonts.body, fontStyle: 'italic', lineHeight: 20 },
});

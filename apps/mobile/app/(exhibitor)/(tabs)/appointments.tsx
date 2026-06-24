import { useCallback, useEffect, useState } from 'react';
import { Alert, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { fetchAppointmentsForUser, updateAppointmentStatus } from '../../../src/api/appointments';
import { AppIcon } from '../../../src/components/AppIcon';
import { AppointmentStatusPill } from '../../../src/components/chat/AppointmentStatusPill';
import { IllustratedEmpty, PrimaryButton, Screen } from '../../../src/components/ui';
import { WorkspaceHeader } from '../../../src/components/workspace/WorkspaceUI';
import { useAuth } from '../../../src/context/AuthContext';
import { useI18n } from '../../../src/i18n/I18nProvider';
import { colors, fonts, radius, shadows, spacing } from '../../../src/theme';

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
      <WorkspaceHeader
        eyebrow={t('tabs.appointments')}
        title={t('appointments.exhibitorTitle')}
        subtitle={t('appointments.exhibitorSubtitle')}
        tone="exhibitor"
        icon="calendar-outline"
        status={items.length ? `${items.length}` : undefined}
      />
      <FlatList
        style={styles.flex}
        contentContainerStyle={[styles.list, items.length === 0 && styles.emptyList]}
        data={items}
        keyExtractor={(i) => i.id}
        ListEmptyComponent={
          <IllustratedEmpty icon="calendar-outline" title={t('appointments.exhibitorTitle')} message={t('appointments.empty')} />
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.iconWrap}>
                <AppIcon name="person-outline" size={20} color={colors.primary} />
              </View>
              <View style={styles.cardCopy}>
                <Text style={styles.title}>{item.visitorName ?? t('appointments.visitor')}</Text>
                <AppointmentStatusPill label={t(STATUS_KEYS[item.status] ?? 'appointments.status.pending')} status={item.status} />
              </View>
            </View>
            {item.status === 'pending' && (
              <View style={styles.actions}>
                <PrimaryButton label={t('networking.accept')} onPress={() => act(item.id, 'confirmed')} />
                <Pressable style={styles.rejectBtn} onPress={() => act(item.id, 'rejected')}>
                  <Text style={styles.rejectText}>{t('networking.reject')}</Text>
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
  list: { paddingHorizontal: spacing.md, paddingBottom: spacing.xl, gap: spacing.sm },
  emptyList: { flexGrow: 1 },
  card: {
    backgroundColor: colors.surface,
    marginBottom: spacing.sm,
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.borderLight,
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
  title: { fontFamily: fonts.bodyBold, color: colors.text, fontSize: 16 },
  actions: { gap: spacing.sm, marginTop: spacing.md },
  rejectBtn: {
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.danger,
  },
  rejectText: { color: colors.danger, fontFamily: fonts.bodySemiBold, fontSize: 14 },
});

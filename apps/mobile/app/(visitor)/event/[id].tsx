import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { EmptyState, PrimaryButton, Screen, ScreenTitle } from '../../../src/components/ui';
import { AppIcon, type AppIconName } from '../../../src/components/AppIcon';
import { SkeletonList } from '../../../src/components/Skeleton';
import { useAuth } from '../../../src/context/AuthContext';
import {
  cancelEventRegistration,
  fetchUserEventRegistrations,
  registerForEvent,
} from '../../../src/api/eventRegistration';
import { fetchEvents } from '../../../src/services/events';
import type { EventRegistrationStatus, SalonEvent } from '../../../src/types';
import { useI18n } from '../../../src/i18n/I18nProvider';
import { localeCode } from '../../../src/lib/locale';
import { colors, fonts, radius, spacing } from '../../../src/theme';

export default function EventDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const { t, locale } = useI18n();
  const [event, setEvent] = useState<SalonEvent | null>(null);
  const [regStatus, setRegStatus] = useState<EventRegistrationStatus | null>(null);
  const [regId, setRegId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  const load = useCallback(async () => {
    if (!id) return;
    try {
      const events = await fetchEvents();
      const ev = events.find((e) => e.id === id);
      setEvent(ev ?? null);

      if (user && ev) {
        const regs = await fetchUserEventRegistrations(user.id);
        const existing = regs.find((r) => r.eventId === id);
        if (existing) {
          setRegStatus(existing.status);
          setRegId(existing.id);
        }
      }
    } catch {
      /* ignore */
    } finally {
      setFetching(false);
    }
  }, [id, user]);

  useEffect(() => { load(); }, [load]);

  const register = async () => {
    if (!user || !event) return;
    setLoading(true);
    try {
      const reg = await registerForEvent({ userId: user.id, eventId: event.id });
      setRegStatus(reg.status);
      setRegId(reg.id);
      Alert.alert(t('event.registeredTitle'), t('event.registeredBody'));
    } catch (e) {
      Alert.alert(t('common.error'), e instanceof Error ? e.message : t('event.registerError'));
    } finally {
      setLoading(false);
    }
  };

  const cancel = async () => {
    if (!regId) return;
    Alert.alert(t('event.cancelConfirmTitle'), t('event.cancelConfirmBody'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('event.cancelRegister'),
        style: 'destructive',
        onPress: async () => {
          setLoading(true);
          try {
            await cancelEventRegistration(regId);
            setRegStatus('cancelled');
            setRegId(null);
          } catch (e) {
            Alert.alert(t('common.error'), e instanceof Error ? e.message : '');
          } finally {
            setLoading(false);
          }
        },
      },
    ]);
  };

  if (fetching) {
    return <Screen><SkeletonList rows={4} /></Screen>;
  }

  if (!event) {
    return <Screen><EmptyState message={t('event.notFound')} /></Screen>;
  }

  const lc = localeCode(locale);
  const formatDate = (d: Date) =>
    d.toLocaleDateString(lc, { weekday: 'long', day: 'numeric', month: 'long' });
  const formatTime = (d: Date) =>
    d.toLocaleTimeString(lc, { hour: '2-digit', minute: '2-digit' });

  const statusLabels: Record<EventRegistrationStatus, string> = {
    pending: t('appointments.status.pending'),
    confirmed: t('appointments.status.confirmed'),
    rejected: t('appointments.status.rejected'),
    cancelled: t('appointments.status.cancelled'),
  };

  const statusColors: Record<EventRegistrationStatus, string> = {
    pending: colors.warning,
    confirmed: colors.success,
    rejected: colors.danger,
    cancelled: colors.textMuted,
  };

  const spotsLeft = event.capacity ? event.capacity - event.registered : null;
  const isFull = spotsLeft !== null && spotsLeft <= 0;

  return (
    <Screen>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <ScreenTitle title={event.title} subtitle={event.type.toUpperCase()} />

        <View style={styles.metaCard}>
          <MetaRow icon="calendar-outline" label={formatDate(event.startDate)} />
          <MetaRow icon="time-outline" label={`${formatTime(event.startDate)} – ${formatTime(event.endDate)}`} />
          {event.location ? <MetaRow icon="location-outline" label={event.location} /> : null}
          {event.speakerName ? <MetaRow icon="person-outline" label={event.speakerName} /> : null}
          {event.capacity ? (
            <MetaRow
              icon="people-outline"
              label={
                t('event.registrations', { registered: event.registered, capacity: event.capacity })
                + (spotsLeft !== null
                  ? ` — ${isFull ? t('event.full') : t('event.spotsRemaining', { count: spotsLeft })}`
                  : '')
              }
            />
          ) : null}
        </View>

        {event.description ? (
          <View style={styles.descCard}>
            <Text style={styles.descTitle}>{t('event.description')}</Text>
            <Text style={styles.descText}>{event.description}</Text>
          </View>
        ) : null}

        {/* Statut inscription */}
        {regStatus && regStatus !== 'cancelled' ? (
          <View style={[styles.statusBadge, { backgroundColor: statusColors[regStatus] + '20', borderColor: statusColors[regStatus] }]}>
            <Text style={[styles.statusText, { color: statusColors[regStatus] }]}>
              {statusLabels[regStatus]}
            </Text>
          </View>
        ) : null}

        {/* Actions */}
        {user ? (
          !regStatus || regStatus === 'cancelled' ? (
            <PrimaryButton
              label={isFull ? t('event.full') : (loading ? t('common.loading') : t('event.register'))}
              onPress={register}
              loading={loading}
              disabled={isFull}
            />
          ) : regStatus === 'pending' || regStatus === 'confirmed' ? (
            <PrimaryButton
              label={t('event.cancelRegister')}
              variant="outline"
              onPress={cancel}
              loading={loading}
            />
          ) : null
        ) : (
          <PrimaryButton label={t('event.loginToRegister')} onPress={() => router.push('/(auth)/login')} />
        )}

        <View style={{ height: spacing.sm }} />
        <PrimaryButton label={t('event.backToProgram')} variant="outline" onPress={() => router.back()} />
      </ScrollView>
    </Screen>
  );
}

function MetaRow({ icon, label }: { icon: AppIconName; label: string }) {
  return (
    <View style={styles.metaRow}>
      <AppIcon name={icon} size={16} color={colors.textMuted} />
      <Text style={styles.metaLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingBottom: spacing.xl },
  metaCard: { marginBottom: spacing.sm, backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.md, borderWidth: 1, borderColor: colors.border },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.xs },
  metaLabel: { flex: 1, fontFamily: fonts.body, fontSize: 14, color: colors.text },
  descCard: { marginBottom: spacing.md, backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.md, borderWidth: 1, borderColor: colors.border },
  descTitle: { fontFamily: fonts.bodyBold, fontSize: 14, color: colors.primary, marginBottom: spacing.xs },
  descText: { fontFamily: fonts.body, fontSize: 14, color: colors.text, lineHeight: 22 },
  statusBadge: {
    borderRadius: radius.md,
    borderWidth: 1,
    padding: spacing.sm,
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  statusText: { fontFamily: fonts.bodyBold, fontSize: 14 },
});

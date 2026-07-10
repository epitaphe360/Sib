import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { bookAppointment, fetchAvailableTimeSlots, type MobileTimeSlot } from '../../../src/api/appointments';
import { EmptyState, Input, PrimaryButton, Screen, ScreenTitle } from '../../../src/components/ui';
import { useAuth } from '../../../src/context/AuthContext';
import { useNetworkingPermissions } from '../../../src/hooks/useNetworkingPermissions';
import { useI18n } from '../../../src/i18n/I18nProvider';
import { localeCode } from '../../../src/lib/locale';
import { getPermissionErrorMessage } from '../../../src/lib/networkingPermissions';
import { colors, spacing } from '../../../src/theme';

export default function NewAppointmentScreen() {
  const { exhibitorUserId } = useLocalSearchParams<{ exhibitorUserId?: string }>();
  const { user, isLoading: authLoading } = useAuth();
  const { t, locale } = useI18n();
  const insets = useSafeAreaInsets();
  const { permissions, limits } = useNetworkingPermissions();
  const [slots, setSlots] = useState<MobileTimeSlot[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [initialLoading, setInitialLoading] = useState(true);

  const exhibitorFilter = typeof exhibitorUserId === 'string' ? exhibitorUserId : undefined;

  const load = useCallback(async () => {
    setLoadError(null);
    try {
      setSlots(await fetchAvailableTimeSlots(exhibitorFilter));
    } catch (e) {
      setLoadError(e instanceof Error ? e.message : t('common.error'));
      setSlots([]);
    } finally {
      setInitialLoading(false);
    }
  }, [exhibitorFilter, t]);

  useEffect(() => {
    if (!authLoading) load();
  }, [load, authLoading]);

  const selectedSlot = useMemo(
    () => slots.find((s) => s.id === selectedId) ?? null,
    [slots, selectedId]
  );

  const book = async () => {
    if (!user || !selectedId || !selectedSlot) return;

    if (!permissions.canScheduleMeetings || !limits.canScheduleMeeting) {
      Alert.alert(t('networking.planLimit'), getPermissionErrorMessage(user.type, user.visitorLevel, 'meeting', t));
      return;
    }

    setLoading(true);
    try {
      await bookAppointment({
        visitorId: user.id,
        exhibitorId: selectedSlot.exhibitorId,
        timeSlotId: selectedSlot.id,
        message: message.trim() || undefined,
      });
      Alert.alert(t('appointments.booked.title'), t('appointments.booked.body'), [
        { text: t('common.ok'), onPress: () => router.back() },
      ]);
    } catch (e) {
      Alert.alert(t('common.error'), e instanceof Error ? e.message : t('appointments.bookError'));
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || initialLoading) {
    return (
      <Screen>
        <ScreenTitle title={t('appointments.new.title')} />
        <EmptyState message={t('common.loading')} />
      </Screen>
    );
  }

  if (!user) {
    return (
      <Screen>
        <ScreenTitle title={t('appointments.new.title')} subtitle={t('appointments.new.subtitle')} />
        <EmptyState message={t('auth.emailRequired')} />
        <PrimaryButton label={t('login.submit')} onPress={() => router.push('/(auth)/login')} />
      </Screen>
    );
  }

  const lc = localeCode(locale);
  const formatSlotLabel = (slot: MobileTimeSlot) => {
    const dateLabel = new Date(slot.date).toLocaleDateString(lc, {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
    });
    return `${dateLabel} · ${slot.startTime}${slot.endTime ? `–${slot.endTime}` : ''}`;
  };

  return (
    <Screen style={styles.flex}>
      <ScreenTitle
        title={t('appointments.new.title')}
        subtitle={
          exhibitorFilter && slots[0]?.companyName
            ? `${t('appointments.new.subtitle')} — ${slots[0].companyName}`
            : `${t('appointments.new.subtitle')}. ${t('appointments.freeHint')}`
        }
      />
      <Input
        label={t('appointments.new.message')}
        value={message}
        onChangeText={setMessage}
        placeholder={t('appointments.new.messagePlaceholder')}
      />
      <Text style={styles.section}>{t('appointments.new.pickSlot')}</Text>

      <FlatList
        style={styles.flex}
        contentContainerStyle={styles.listContent}
        data={slots}
        keyExtractor={(s) => s.id}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={async () => {
              setRefreshing(true);
              await load();
              setRefreshing(false);
            }}
          />
        }
        ListEmptyComponent={
          <EmptyState message={loadError ?? t('appointments.new.noSlots')} />
        }
        renderItem={({ item }) => {
          const selected = selectedId === item.id;
          return (
            <Pressable
              style={[styles.slot, selected && styles.slotSelected]}
              onPress={() => setSelectedId(item.id)}
              accessibilityRole="radio"
              accessibilityState={{ selected }}
            >
              <Text style={styles.company}>{item.companyName ?? t('appointments.exhibitor')}</Text>
              <Text style={styles.time}>{formatSlotLabel(item)}</Text>
              {item.location ? <Text style={styles.loc}>{item.location}</Text> : null}
              {selected ? <Text style={styles.selectedBadge}>{t('appointments.new.selected')}</Text> : null}
            </Pressable>
          );
        }}
      />

      {slots.length > 0 ? (
        <View style={[styles.stickyFooter, { paddingBottom: Math.max(insets.bottom, spacing.sm) }]}>
          {selectedSlot ? (
            <Text style={styles.footerHint}>
              {selectedSlot.companyName ?? t('appointments.exhibitor')} — {formatSlotLabel(selectedSlot)}
            </Text>
          ) : (
            <Text style={styles.footerHintMuted}>{t('appointments.new.selectHint')}</Text>
          )}
          <PrimaryButton
            label={t('appointments.new.confirm')}
            onPress={book}
            loading={loading}
            disabled={!selectedId}
            variant={selectedId ? 'gold' : 'primary'}
          />
        </View>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  listContent: { paddingBottom: spacing.sm },
  section: { fontWeight: '700', color: colors.text, marginBottom: spacing.sm, marginTop: spacing.md },
  slot: {
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    marginBottom: spacing.sm,
    backgroundColor: colors.surface,
  },
  slotSelected: { borderColor: colors.gold, backgroundColor: 'rgba(212,175,55,0.12)' },
  company: { fontWeight: '700', color: colors.text, fontSize: 15 },
  time: { color: colors.primary, marginTop: 4, fontWeight: '600' },
  loc: { color: colors.textMuted, fontSize: 13, marginTop: 4 },
  selectedBadge: { color: colors.gold, fontWeight: '700', marginTop: 6, fontSize: 12 },
  stickyFooter: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.sm,
    gap: spacing.sm,
    backgroundColor: colors.background,
  },
  footerHint: { color: colors.text, fontWeight: '600', fontSize: 13 },
  footerHintMuted: { color: colors.textMuted, fontSize: 13 },
});

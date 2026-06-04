import { router } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Alert, FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { bookAppointment, fetchAvailableTimeSlots, type MobileTimeSlot } from '../../../src/api/appointments';
import { EmptyState, Input, PrimaryButton, Screen, ScreenTitle } from '../../../src/components/ui';
import { useAuth } from '../../../src/context/AuthContext';
import { useNetworkingPermissions } from '../../../src/hooks/useNetworkingPermissions';
import { useI18n } from '../../../src/i18n/I18nProvider';
import { getPermissionErrorMessage } from '../../../src/lib/networkingPermissions';
import { colors, spacing } from '../../../src/theme';

export default function NewAppointmentScreen() {
  const { user } = useAuth();
  const { t } = useI18n();
  const { permissions, limits } = useNetworkingPermissions();
  const [slots, setSlots] = useState<MobileTimeSlot[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    setSlots(await fetchAvailableTimeSlots());
  }, []);

  useEffect(() => { load(); }, [load]);

  const book = async () => {
    if (!user || !selectedId) return;

    if (!permissions.canScheduleMeetings || !limits.canScheduleMeeting) {
      Alert.alert('Forfait', getPermissionErrorMessage(user.type, user.visitorLevel, 'meeting'));
      return;
    }

    const slot = slots.find((s) => s.id === selectedId);
    if (!slot) return;

    setLoading(true);
    try {
      await bookAppointment({
        visitorId: user.id,
        exhibitorId: slot.exhibitorId,
        timeSlotId: slot.id,
        message: message.trim() || undefined,
      });
      Alert.alert(t('appointments.booked.title'), t('appointments.booked.body'), [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (e) {
      Alert.alert('Erreur', e instanceof Error ? e.message : 'Réservation impossible');
    } finally {
      setLoading(false);
    }
  };

  if (!permissions.canScheduleMeetings) {
    return (
      <Screen>
        <ScreenTitle title={t('appointments.new.title')} />
        <EmptyState message={getPermissionErrorMessage(user?.type ?? 'visitor', user?.visitorLevel, 'meeting')} />
        <PrimaryButton label={t('vip.upgrade')} onPress={() => router.push('/(auth)/register-vip')} />
      </Screen>
    );
  }

  return (
    <Screen style={styles.flex}>
      <ScreenTitle title={t('appointments.new.title')} subtitle={t('appointments.new.subtitle')} />
      <FlatList
        data={slots}
        keyExtractor={(s) => s.id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={async () => { setRefreshing(true); await load(); setRefreshing(false); }} />
        }
        ListHeaderComponent={
          <>
            <Input label={t('appointments.new.message')} value={message} onChangeText={setMessage} placeholder={t('appointments.new.messagePlaceholder')} />
            <Text style={styles.section}>{t('appointments.new.pickSlot')}</Text>
          </>
        }
        ListEmptyComponent={<EmptyState message={t('appointments.new.noSlots')} />}
        renderItem={({ item }) => {
          const selected = selectedId === item.id;
          const dateLabel = new Date(item.date).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' });
          return (
            <Pressable
              style={[styles.slot, selected && styles.slotSelected]}
              onPress={() => setSelectedId(item.id)}
            >
              <Text style={styles.company}>{item.companyName ?? t('appointments.exhibitor')}</Text>
              <Text style={styles.time}>{dateLabel} · {item.startTime}{item.endTime ? `–${item.endTime}` : ''}</Text>
              {item.location ? <Text style={styles.loc}>{item.location}</Text> : null}
            </Pressable>
          );
        }}
        ListFooterComponent={
          <View style={styles.footer}>
            <PrimaryButton label={t('appointments.new.confirm')} onPress={book} loading={loading} disabled={!selectedId} />
          </View>
        }
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  section: { fontWeight: '700', color: colors.text, marginBottom: spacing.sm, marginTop: spacing.md },
  slot: {
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    marginBottom: spacing.sm,
    backgroundColor: colors.surface,
  },
  slotSelected: { borderColor: colors.primary, backgroundColor: '#EEF3FA' },
  company: { fontWeight: '700', color: colors.text, fontSize: 15 },
  time: { color: colors.primary, marginTop: 4, fontWeight: '600' },
  loc: { color: colors.textMuted, fontSize: 13, marginTop: 4 },
  footer: { marginTop: spacing.md, marginBottom: spacing.xl },
});

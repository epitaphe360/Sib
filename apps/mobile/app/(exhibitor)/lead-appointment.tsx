import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Alert, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { bookAppointment, fetchAvailableTimeSlots, type MobileTimeSlot } from '../../src/api/appointments';
import { EmptyState, Input, PrimaryButton, Screen, ScreenTitle } from '../../src/components/ui';
import { useAuth } from '../../src/context/AuthContext';
import { useI18n } from '../../src/i18n/I18nProvider';
import { colors, fonts, spacing } from '../../src/theme';

export default function LeadAppointmentScreen() {
  const { visitorUserId, visitorName } = useLocalSearchParams<{ visitorUserId: string; visitorName?: string }>();
  const { user } = useAuth();
  const { t } = useI18n();
  const [slots, setSlots] = useState<MobileTimeSlot[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    if (!user) return;
    setSlots(await fetchAvailableTimeSlots(user.id));
  }, [user]);

  useEffect(() => { load(); }, [load]);

  const book = async () => {
    if (!user || !visitorUserId || !selectedId) return;
    const slot = slots.find((s) => s.id === selectedId);
    if (!slot) return;

    setLoading(true);
    try {
      await bookAppointment({
        visitorId: visitorUserId,
        exhibitorId: slot.exhibitorId,
        timeSlotId: selectedId,
        message: message.trim() || undefined,
      });
      Alert.alert(t('appointments.booked.title'), t('appointments.booked.body'), [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (e) {
      Alert.alert(t('common.error'), e instanceof Error ? e.message : t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen style={styles.flex}>
      <ScreenTitle
        title={t('exhibitor.contact.appointment')}
        subtitle={typeof visitorName === 'string' ? visitorName : t('exhibitor.contacts.unknown')}
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
        data={slots}
        keyExtractor={(s) => s.id}
        ListEmptyComponent={<EmptyState message={t('appointments.new.noSlots')} />}
        renderItem={({ item }) => (
          <Pressable
            style={[styles.slot, selectedId === item.id && styles.slotSelected]}
            onPress={() => setSelectedId(item.id)}
          >
            <Text style={styles.slotDate}>{item.date} · {item.startTime}</Text>
            {item.location ? <Text style={styles.slotMeta}>{item.location}</Text> : null}
          </Pressable>
        )}
      />
      <PrimaryButton
        label={t('appointments.new.confirm')}
        onPress={book}
        loading={loading}
        disabled={!selectedId}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  section: { fontFamily: fonts.bodyBold, color: colors.text, marginBottom: spacing.sm, marginTop: spacing.md },
  slot: {
    padding: spacing.md,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.sm,
    backgroundColor: colors.surface,
  },
  slotSelected: { borderColor: colors.gold, backgroundColor: 'rgba(212,175,55,0.12)' },
  slotDate: { fontFamily: fonts.bodyBold, color: colors.text },
  slotMeta: { fontFamily: fonts.body, color: colors.textMuted, marginTop: 4, fontSize: 13 },
});

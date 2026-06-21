import { router } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  FlatList,
  ImageBackground,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { HeroBanner } from '../../../src/components/HeroBanner';
import { Card, EmptyState, Screen } from '../../../src/components/ui';
import { SkeletonList } from '../../../src/components/Skeleton';
import { eventImage } from '../../../src/data/images';
import { fetchUserEventRegistrations } from '../../../src/api/eventRegistration';
import { fetchEvents } from '../../../src/services/events';
import { withRetry } from '../../../src/lib/withRetry';
import { useAuth } from '../../../src/context/AuthContext';
import { useI18n } from '../../../src/i18n/I18nProvider';
import type { EventRegistrationStatus, SalonEvent } from '../../../src/types';
import { colors, fonts, radius, spacing } from '../../../src/theme';

function formatDate(date: Date): string {
  return date.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' });
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
}

export default function ProgramScreen() {
  const { user } = useAuth();
  const { t } = useI18n();
  const [events, setEvents] = useState<SalonEvent[]>([]);
  const [registrations, setRegistrations] = useState<Map<string, EventRegistrationStatus>>(new Map());
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef(false);

  const load = useCallback(async () => {
    abortRef.current = false;
    try {
      setError(null);
      const data = await withRetry(() => fetchEvents(), { context: 'ProgramScreen', maxAttempts: 3 });
      if (abortRef.current) return;
      setEvents(data);
      if (user) {
        const regs = await fetchUserEventRegistrations(user.id);
        const map = new Map<string, EventRegistrationStatus>();
        for (const r of regs) {
          if (r.eventId && r.status !== 'cancelled') map.set(r.eventId, r.status);
        }
        if (!abortRef.current) setRegistrations(map);
      }
    } catch (e) {
      if (!abortRef.current) setError(e instanceof Error ? e.message : 'Erreur de chargement');
    } finally {
      if (!abortRef.current) { setLoading(false); setRefreshing(false); }
    }
  }, [user]);

  useEffect(() => {
    load();
    return () => { abortRef.current = true; };
  }, [load]);

  return (
    <Screen style={styles.flex}>
      <HeroBanner imageKey="conference" title={t('tabs.program')} subtitle={t('explore.subtitle')} compact />
      {loading ? (
        <SkeletonList rows={4} />
      ) : error ? (
        <EmptyState message={error} />
      ) : (
        <FlatList
          data={events}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <EventCard
              event={item}
              regStatus={registrations.get(item.id) ?? null}
              onPress={() => router.push(`/(visitor)/event/${item.id}` as never)}
            />
          )}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor={colors.primary} />
          }
          ListEmptyComponent={<EmptyState message="Le programme sera publié prochainement" />}
          showsVerticalScrollIndicator={false}
        />
      )}
    </Screen>
  );
}

const STATUS_COLOR: Record<EventRegistrationStatus, string> = {
  pending: colors.warning,
  confirmed: colors.success,
  rejected: colors.danger,
  cancelled: colors.textMuted,
};
const STATUS_LABEL: Record<EventRegistrationStatus, string> = {
  pending: 'En attente',
  confirmed: 'Confirmé',
  rejected: 'Refusé',
  cancelled: 'Annulé',
};

function EventCard({ event, regStatus, onPress }: { event: SalonEvent; regStatus: EventRegistrationStatus | null; onPress: () => void }) {
  return (
    <Pressable style={styles.cardWrap} onPress={onPress}>
      <ImageBackground source={eventImage(event.type)} style={styles.eventImg} imageStyle={styles.eventImgRadius}>
        <View style={styles.eventOverlay} />
        <Text style={styles.eventType}>{event.type}</Text>
        {regStatus ? (
          <View style={[styles.regBadge, { backgroundColor: STATUS_COLOR[regStatus] }]}>
            <Text style={styles.regBadgeText}>{STATUS_LABEL[regStatus]}</Text>
          </View>
        ) : null}
      </ImageBackground>
      <Card>
        <View style={styles.eventHeader}>
          {event.featured ? <Text style={styles.featured}>À la une</Text> : <View />}
          {event.capacity ? (
            <Text style={styles.capacity}>
              {event.registered}/{event.capacity} places
            </Text>
          ) : null}
        </View>
        <Text style={styles.eventTitle}>{event.title}</Text>
        <Text style={styles.eventMeta}>
          {formatDate(event.startDate)} · {formatTime(event.startDate)}
          {event.location ? ` · ${event.location}` : ''}
        </Text>
        {event.description ? (
          <Text style={styles.eventDesc} numberOfLines={3}>{event.description}</Text>
        ) : null}
        <Text style={styles.detailCta}>Voir détails & s'inscrire →</Text>
      </Card>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  cardWrap: { marginBottom: spacing.sm },
  eventImg: { height: 100, justifyContent: 'space-between', flexDirection: 'row', alignItems: 'flex-end', padding: spacing.sm, marginBottom: -8, zIndex: 1 },
  eventImgRadius: { borderTopLeftRadius: 14, borderTopRightRadius: 14 },
  eventOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(27,54,93,0.5)', borderTopLeftRadius: 14, borderTopRightRadius: 14 },
  eventType: { color: '#fff', fontSize: 11, fontWeight: '800', textTransform: 'uppercase', zIndex: 1 },
  regBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: radius.full, zIndex: 1 },
  regBadgeText: { color: '#fff', fontSize: 10, fontFamily: fonts.bodyBold },
  eventHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  featured: { fontSize: 11, color: colors.vip, fontWeight: '700' },
  capacity: { fontSize: 11, color: colors.textMuted, fontFamily: fonts.body },
  eventTitle: { fontSize: 17, fontWeight: '700', color: colors.text, marginBottom: 4 },
  eventMeta: { fontSize: 13, color: colors.textMuted, marginBottom: 6 },
  eventDesc: { fontSize: 14, color: colors.text, lineHeight: 20, marginBottom: spacing.xs },
  detailCta: { fontSize: 13, color: colors.primary, fontFamily: fonts.bodyBold, marginTop: spacing.xs },
});

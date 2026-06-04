import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  ImageBackground,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { HeroBanner } from '../../../src/components/HeroBanner';
import { Card, EmptyState, Screen } from '../../../src/components/ui';
import { eventImage } from '../../../src/data/images';
import { fetchEvents } from '../../../src/services/events';
import type { SalonEvent } from '../../../src/types';
import { colors, spacing } from '../../../src/theme';

function formatDate(date: Date): string {
  return date.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' });
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
}

export default function ProgramScreen() {
  const [events, setEvents] = useState<SalonEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setError(null);
      const data = await fetchEvents();
      setEvents(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur de chargement');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <Screen style={styles.flex}>
      <HeroBanner imageKey="conference" title="Programme" subtitle="Conférences & ateliers SIB 2026" compact />
      {loading ? (
        <ActivityIndicator color={colors.primary} style={{ marginTop: spacing.xl }} />
      ) : error ? (
        <EmptyState message={error} />
      ) : (
        <FlatList
          data={events}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <EventCard event={item} />}
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

function EventCard({ event }: { event: SalonEvent }) {
  return (
    <View style={styles.cardWrap}>
      <ImageBackground source={eventImage(event.type)} style={styles.eventImg} imageStyle={styles.eventImgRadius}>
        <View style={styles.eventOverlay} />
        <Text style={styles.eventType}>{event.type}</Text>
      </ImageBackground>
      <Card>
        <View style={styles.eventHeader}>
          {event.featured ? <Text style={styles.featured}>À la une</Text> : <View />}
        </View>
        <Text style={styles.eventTitle}>{event.title}</Text>
        <Text style={styles.eventMeta}>
          {formatDate(event.startDate)} · {formatTime(event.startDate)}
          {event.location ? ` · ${event.location}` : ''}
        </Text>
        {event.description ? (
          <Text style={styles.eventDesc} numberOfLines={4}>
            {event.description}
          </Text>
        ) : null}
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  cardWrap: { marginBottom: spacing.sm },
  eventImg: { height: 100, justifyContent: 'flex-end', padding: spacing.sm, marginBottom: -8, zIndex: 1 },
  eventImgRadius: { borderTopLeftRadius: 14, borderTopRightRadius: 14 },
  eventOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(27,54,93,0.5)', borderTopLeftRadius: 14, borderTopRightRadius: 14 },
  eventType: { color: '#fff', fontSize: 11, fontWeight: '800', textTransform: 'uppercase', zIndex: 1 },
  eventHeader: { flexDirection: 'row', justifyContent: 'flex-end', marginBottom: 4 },
  featured: { fontSize: 11, color: colors.vip, fontWeight: '700' },
  eventTitle: { fontSize: 17, fontWeight: '700', color: colors.text, marginBottom: 4 },
  eventMeta: { fontSize: 13, color: colors.textMuted, marginBottom: 6 },
  eventDesc: { fontSize: 14, color: colors.text, lineHeight: 20 },
});

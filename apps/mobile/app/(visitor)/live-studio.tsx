import { router } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Card, EmptyState, PrimaryButton, Screen } from '../../src/components/ui';
import { AppIcon } from '../../src/components/AppIcon';
import { SkeletonList } from '../../src/components/Skeleton';
import { supabase } from '../../src/lib/supabase';
import { useI18n } from '../../src/i18n/I18nProvider';
import { PLATFORM } from '../../src/config/platform';
import { localeCode } from '../../src/lib/locale';
import { colors, fonts, radius, spacing } from '../../src/theme';

interface LiveSession {
  id: string;
  title: string;
  description?: string;
  streamUrl: string;
  status: 'live' | 'upcoming' | 'ended';
  startTime?: string;
  speakerName?: string;
}

export default function LiveStudioScreen() {
  const { t, locale } = useI18n();
  const insets = useSafeAreaInsets();
  const [sessions, setSessions] = useState<LiveSession[]>([]);
  const [loading, setLoading] = useState(true);
  const cancelledRef = useRef(false);

  useEffect(() => {
    cancelledRef.current = false;
    (async () => {
      try {
        const { data } = await supabase
          .from('live_sessions')
          .select('id, title, description, stream_url, status, start_time, speaker_name')
          .in('status', ['live', 'upcoming'])
          .order('start_time', { ascending: true });
        if (cancelledRef.current) return;
        setSessions((data ?? []).map((row) => ({
          id: row.id,
          title: row.title,
          description: row.description,
          streamUrl: row.stream_url,
          status: row.status as LiveSession['status'],
          startTime: row.start_time,
          speakerName: row.speaker_name,
        })));
      } catch {
        if (!cancelledRef.current) setSessions([]);
      } finally {
        if (!cancelledRef.current) setLoading(false);
      }
    })();
    return () => { cancelledRef.current = true; };
  }, []);

  const openStream = async (session: LiveSession) => {
    await WebBrowser.openBrowserAsync(session.streamUrl, {
      presentationStyle: WebBrowser.WebBrowserPresentationStyle.FULL_SCREEN,
    });
  };

  if (loading) {
    return <Screen><SkeletonList rows={3} /></Screen>;
  }

  const lc = localeCode(locale);
  const liveSessions = sessions.filter((s) => s.status === 'live');
  const upcomingSessions = sessions.filter((s) => s.status === 'upcoming');

  return (
    <Screen style={styles.flex}>
      <View style={[styles.header, { paddingTop: insets.top + spacing.sm }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>{t('live.back')}</Text>
        </Pressable>
        <Text style={styles.headerTitle}>{t('live.title')}</Text>
        <View style={{ width: 60 }} />
      </View>

      {liveSessions.length > 0 && (
        <View style={styles.liveSection}>
          <View style={styles.liveBadge}>
            <Text style={styles.liveDot}>●</Text>
            <Text style={styles.liveLabel}>{t('live.onAir')}</Text>
          </View>
          {liveSessions.map((s) => (
            <SessionCard key={s.id} session={s} onPress={() => openStream(s)} isLive lc={lc} t={t} />
          ))}
        </View>
      )}

      {upcomingSessions.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('live.upcoming')}</Text>
          {upcomingSessions.map((s) => (
            <SessionCard key={s.id} session={s} onPress={() => openStream(s)} isLive={false} lc={lc} t={t} />
          ))}
        </View>
      )}

      {sessions.length === 0 && (
        <EmptyState message={t('live.empty')} />
      )}

      <View style={styles.footer}>
        <PrimaryButton
          label={t('live.openWebsite')}
          onPress={() => WebBrowser.openBrowserAsync(PLATFORM.liveUrl)}
          variant="outline"
        />
      </View>
    </Screen>
  );
}

function SessionCard({
  session,
  onPress,
  isLive,
  lc,
  t,
}: {
  session: LiveSession;
  onPress: () => void;
  isLive: boolean;
  lc: string;
  t: (key: string) => string;
}) {
  const startTime = session.startTime ? new Date(session.startTime).toLocaleTimeString(lc, { hour: '2-digit', minute: '2-digit' }) : '';

  return (
    <Pressable onPress={onPress}>
      <Card style={isLive ? [styles.sessionCard, styles.sessionCardLive] : styles.sessionCard}>
        <View style={styles.sessionHeader}>
          <Text style={styles.sessionTitle}>{session.title}</Text>
          {isLive ? (
            <Text style={styles.liveChip}>{t('live.chipLive')}</Text>
          ) : (
            <Text style={styles.timeChip}>{startTime}</Text>
          )}
        </View>
        {session.description ? (
          <Text style={styles.sessionDesc} numberOfLines={2}>{session.description}</Text>
        ) : null}
        {session.speakerName ? (
          <View style={styles.speakerRow}>
            <AppIcon name="person-outline" size={13} color={colors.textMuted} />
            <Text style={styles.speakerName}>{session.speakerName}</Text>
          </View>
        ) : null}
        <View style={styles.watchCtaRow}>
          <AppIcon name={isLive ? 'play-outline' : 'notifications-outline'} size={14} color={colors.primary} />
          <Text style={styles.watchCta}>{isLive ? t('live.watchLive') : t('live.open')}</Text>
        </View>
      </Card>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
    backgroundColor: colors.primaryDark,
  },
  backBtn: { padding: spacing.xs },
  backText: { color: '#fff', fontFamily: fonts.body, fontSize: 14 },
  headerTitle: { color: '#fff', fontFamily: fonts.bodyBold, fontSize: 18 },
  liveSection: { padding: spacing.md, backgroundColor: 'rgba(185,28,28,0.05)', borderBottomWidth: 1, borderBottomColor: colors.border },
  liveBadge: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, marginBottom: spacing.sm },
  liveDot: { color: '#dc2626', fontSize: 12 },
  liveLabel: { color: '#dc2626', fontFamily: fonts.bodyBold, fontSize: 13, letterSpacing: 1 },
  section: { padding: spacing.md },
  sectionTitle: { fontFamily: fonts.bodyBold, fontSize: 16, color: colors.text, marginBottom: spacing.sm },
  sessionCard: { marginBottom: spacing.sm },
  sessionCardLive: { borderLeftWidth: 3, borderLeftColor: '#dc2626' },
  sessionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: spacing.xs },
  sessionTitle: { flex: 1, fontFamily: fonts.bodyBold, fontSize: 15, color: colors.text, paddingRight: spacing.sm },
  liveChip: { backgroundColor: '#dc2626', color: '#fff', fontFamily: fonts.bodyBold, fontSize: 10, paddingHorizontal: 8, paddingVertical: 3, borderRadius: radius.full },
  timeChip: { backgroundColor: colors.primaryDark, color: '#fff', fontFamily: fonts.bodyBold, fontSize: 11, paddingHorizontal: 8, paddingVertical: 3, borderRadius: radius.full },
  sessionDesc: { fontFamily: fonts.body, fontSize: 13, color: colors.textMuted, lineHeight: 18, marginBottom: spacing.xs },
  speakerRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: spacing.sm },
  speakerName: { fontFamily: fonts.body, fontSize: 13, color: colors.textMuted },
  watchCtaRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  watchCta: { fontFamily: fonts.bodyBold, fontSize: 14, color: colors.primary },
  footer: { padding: spacing.md, borderTopWidth: 1, borderTopColor: colors.border },
});

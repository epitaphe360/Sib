import { router } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Alert,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {
  fetchConnections,
  requestConnection,
  respondConnection,
  searchUsers,
  type ConnectionRequest,
} from '../../src/api/networking';
import { fetchMatchSuggestions, type MatchSuggestion } from '../../src/api/matchmaking';
import { NetworkingConnectionRow } from '../../src/components/NetworkingConnectionRow';
import { EmptyState, Input, PrimaryButton, Screen, ScreenTitle } from '../../src/components/ui';
import { SkeletonList } from '../../src/components/Skeleton';
import { useAuth } from '../../src/context/AuthContext';
import { useNetworkingPermissions } from '../../src/hooks/useNetworkingPermissions';
import { useI18n } from '../../src/i18n/I18nProvider';
import { getPermissionErrorMessage } from '../../src/lib/networkingPermissions';
import { requireAuth } from '../../src/lib/navigateSafe';
import { withRetry } from '../../src/lib/withRetry';
import { colors, fonts, radius, spacing } from '../../src/theme';

type Props = {
  embedded?: boolean;
  refreshKey?: number;
  onRefreshComplete?: () => void;
};

export default function VisitorNetworkingScreen({ embedded = false, refreshKey = 0, onRefreshComplete }: Props) {
  const { user } = useAuth();
  const { t } = useI18n();
  const { permissions, limits } = useNetworkingPermissions();
  const [connections, setConnections] = useState<ConnectionRequest[]>([]);
  const [suggestions, setSuggestions] = useState<MatchSuggestion[]>([]);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Array<{ id: string; name: string; email: string; type: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const abortRef = useRef(false);

  const load = useCallback(async () => {
    if (!user) return;
    abortRef.current = false;
    try {
      const [conns, sugg] = await withRetry(
        () => Promise.all([fetchConnections(user.id), fetchMatchSuggestions(user.id)]),
        { context: 'Networking', maxAttempts: 2 },
      );
      if (abortRef.current) return;
      setConnections(conns);
      setSuggestions(sugg);
    } catch (e) {
      Alert.alert(t('common.error'), e instanceof Error ? e.message : t('common.error'));
    } finally {
      if (!abortRef.current) {
        setLoading(false);
        setRefreshing(false);
        onRefreshComplete?.();
      }
    }
  }, [user, t, onRefreshComplete]);

  useEffect(() => {
    load();
    return () => { abortRef.current = true; };
  }, [load]);

  useEffect(() => {
    if (refreshKey > 0) {
      setRefreshing(true);
      void load();
    }
  }, [refreshKey, load]);

  const onRefresh = () => {
    setRefreshing(true);
    void load();
  };

  if (loading) {
    const skeleton = <SkeletonList rows={4} />;
    if (embedded) return <View style={[styles.flex, styles.embedded]}>{skeleton}</View>;
    return <Screen style={styles.flex}>{skeleton}</Screen>;
  }

  if (!permissions.canAccessNetworking) {
    const blocked = (
      <>
        {!embedded && <ScreenTitle title={t('networking.title')} />}
        <EmptyState message={getPermissionErrorMessage(user?.type ?? 'visitor', user?.visitorLevel, 'connection')} />
        <PrimaryButton label={t('vip.upgrade')} onPress={() => router.push('/(auth)/register-vip')} variant="gold" />
      </>
    );
    if (embedded) return <View style={styles.embedded}>{blocked}</View>;
    return <Screen>{blocked}</Screen>;
  }

  const isPremiumVisitor = user?.type === 'visitor' && (user.visitorLevel === 'premium' || user.visitorLevel === 'vip');
  const canSearch = isPremiumVisitor || user?.type !== 'visitor';

  const search = async () => {
    if (!requireAuth(user, t)) return;
    if (query.trim().length < 2) {
      Alert.alert(t('networking.search'), t('networking.searchMin'));
      return;
    }
    try {
      setResults(await searchUsers(query.trim(), user!.id));
    } catch (e) {
      Alert.alert(t('common.error'), e instanceof Error ? e.message : t('common.error'));
    }
  };

  const connect = async (toUserId: string) => {
    if (!requireAuth(user, t)) return;
    if (!limits.canMakeConnection) {
      Alert.alert(t('networking.planLimit'), getPermissionErrorMessage(user!.type, user!.visitorLevel, 'connection'));
      return;
    }
    try {
      await requestConnection(user.id, toUserId);
      Alert.alert(t('common.ok'), t('networking.requestSent'));
      await load();
    } catch (e) {
      Alert.alert(t('common.error'), e instanceof Error ? e.message : t('common.error'));
    }
  };

  const respond = async (id: string, accept: boolean) => {
    try {
      await respondConnection(id, accept ? 'accepted' : 'rejected');
      await load();
    } catch (e) {
      Alert.alert(t('common.error'), e instanceof Error ? e.message : t('common.error'));
    }
  };

  const renderConnection = (item: ConnectionRequest) => (
    <NetworkingConnectionRow
      key={item.id}
      item={item}
      currentUserId={user!.id}
      t={t}
      onAccept={item.toUserId === user?.id && item.status === 'pending' ? () => respond(item.id, true) : undefined}
      onReject={item.toUserId === user?.id && item.status === 'pending' ? () => respond(item.id, false) : undefined}
    />
  );

  const body = (
    <>
      {!embedded && <ScreenTitle title={t('networking.title')} subtitle="B2B" />}
      {!embedded && (
        <>
          <PrimaryButton
            label={t('networking.scanCta')}
            variant="gold"
            onPress={() => router.push('/(visitor)/scan-connect' as never)}
          />
          <PrimaryButton
            label={t('scanHistory.title')}
            variant="outline"
            onPress={() => router.push('/(visitor)/scan-history' as never)}
          />
        </>
      )}
      {!permissions.canSendMessages && user?.type === 'visitor' ? (
        <Text style={styles.freeHint}>{t('networking.freeHint')}</Text>
      ) : null}
      {canSearch && suggestions.length > 0 && (
        <>
          <Text style={styles.section}>{t('networking.suggestions')}</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.suggestList}>
            {suggestions.map((item) => (
              <Pressable key={item.id} style={styles.suggestCard} onPress={() => connect(item.id)}>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.meta}>{item.reason}</Text>
                <Text style={styles.score}>{t('networking.matchScore')} {item.score}</Text>
              </Pressable>
            ))}
          </ScrollView>
        </>
      )}
      {canSearch ? (
        <>
          <Input label={t('networking.search')} value={query} onChangeText={setQuery} />
          <PrimaryButton label={t('networking.searchBtn')} onPress={search} />
          {results.length > 0 && (
            <View style={styles.results}>
              {results.map((item) => (
                <Pressable key={item.id} style={styles.row} onPress={() => connect(item.id)}>
                  <Text style={styles.name}>{item.name}</Text>
                  <Text style={styles.meta}>{item.type} · {item.email}</Text>
                </Pressable>
              ))}
            </View>
          )}
        </>
      ) : embedded ? null : (
        <PrimaryButton label={t('vip.upgrade')} variant="outline" onPress={() => router.push('/(auth)/register-vip' as never)} />
      )}
      <View style={styles.sectionRow}>
        <Text style={styles.sectionInline}>{t('networking.connections')}</Text>
        {embedded ? (
          <Pressable onPress={onRefresh} disabled={refreshing}>
            <Text style={styles.refreshLink}>{refreshing ? t('common.loading') : t('common.retry')}</Text>
          </Pressable>
        ) : null}
      </View>
      {connections.length === 0 ? (
        <EmptyState message={t('networking.empty')} />
      ) : (
        connections.map(renderConnection)
      )}
    </>
  );

  if (embedded) {
    return (
      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {body}
      </ScrollView>
    );
  }

  return (
    <Screen style={styles.flex}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {body}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  scroll: { paddingBottom: spacing.xl },
  embedded: { paddingHorizontal: spacing.md, flex: 1 },
  section: { fontFamily: fonts.bodyBold, marginTop: spacing.lg, marginBottom: spacing.sm, color: colors.text },
  sectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  sectionInline: { fontFamily: fonts.bodyBold, color: colors.text },
  refreshLink: { fontFamily: fonts.bodySemiBold, fontSize: 13, color: colors.primary },
  freeHint: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.textMuted,
    marginBottom: spacing.sm,
    lineHeight: 18,
  },
  results: { marginBottom: spacing.md },
  row: { padding: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border },
  name: { fontFamily: fonts.bodySemiBold, color: colors.text },
  meta: { fontSize: 12, fontFamily: fonts.body, color: colors.textMuted, marginTop: 2 },
  suggestList: { maxHeight: 120, marginBottom: spacing.md },
  suggestCard: {
    width: 200,
    marginRight: spacing.sm,
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  score: { fontSize: 11, fontFamily: fonts.bodySemiBold, color: colors.primary, marginTop: 4 },
});

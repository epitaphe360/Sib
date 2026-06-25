import { router } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';
import {
  fetchConnections,
  requestConnection,
  respondConnection,
  searchUsers,
  type ConnectionRequest,
} from '../../src/api/networking';
import { fetchMatchSuggestions, type MatchSuggestion } from '../../src/api/matchmaking';
import { SalonGate } from '../../src/components/guards/SalonGate';
import { EmptyState, Input, PrimaryButton, Screen, ScreenTitle } from '../../src/components/ui';
import { SkeletonList } from '../../src/components/Skeleton';
import { useAuth } from '../../src/context/AuthContext';
import { useNetworkingPermissions } from '../../src/hooks/useNetworkingPermissions';
import { useI18n } from '../../src/i18n/I18nProvider';
import { avatarColor, avatarInitials } from '../../src/lib/avatarColor';
import { getPermissionErrorMessage } from '../../src/lib/networkingPermissions';
import { requireAuth } from '../../src/lib/navigateSafe';
import { withRetry } from '../../src/lib/withRetry';
import { colors, fonts, radius, spacing } from '../../src/theme';

export default function VisitorNetworkingScreen({ embedded = false }: { embedded?: boolean }) {
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
        { context: 'Networking', maxAttempts: 2 }
      );
      if (abortRef.current) return;
      setConnections(conns);
      setSuggestions(sugg);
    } catch (e) {
      Alert.alert(t('common.error'), e instanceof Error ? e.message : t('common.error'));
    } finally {
      if (!abortRef.current) setLoading(false);
    }
  }, [user, t]);

  useEffect(() => {
    load();
    return () => { abortRef.current = true; };
  }, [load]);

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
      Alert.alert('Forfait', getPermissionErrorMessage(user!.type, user!.visitorLevel, 'connection'));
      return;
    }
    try {
      await requestConnection(user.id, toUserId);
      Alert.alert('OK', 'Demande envoyée');
      await load();
    } catch (e) {
      Alert.alert(t('common.error'), e instanceof Error ? e.message : 'Erreur');
    }
  };

  const respond = async (id: string, accept: boolean) => {
    try {
      await respondConnection(id, accept ? 'accepted' : 'rejected');
      await load();
    } catch (e) {
      Alert.alert(t('common.error'), e instanceof Error ? e.message : 'Erreur');
    }
  };

  const body = (
    <>
      {!embedded && <ScreenTitle title={t('networking.title')} subtitle="B2B" />}
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
      {!permissions.canSendMessages && user?.type === 'visitor' ? (
        <Text style={styles.freeHint}>{t('networking.freeHint')}</Text>
      ) : null}
      {canSearch && suggestions.length > 0 && (
        <>
          <Text style={styles.section}>{t('networking.suggestions')}</Text>
          <FlatList
            data={suggestions}
            keyExtractor={(s) => s.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.suggestList}
            renderItem={({ item }) => (
              <Pressable style={styles.suggestCard} onPress={() => connect(item.id)}>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.meta}>{item.reason}</Text>
                <Text style={styles.score}>{t('networking.matchScore')} {item.score}</Text>
              </Pressable>
            )}
          />
        </>
      )}
      {canSearch ? (
        <>
          <Input label={t('networking.search')} value={query} onChangeText={setQuery} />
          <PrimaryButton label={t('networking.searchBtn')} onPress={search} />
          {results.length > 0 && (
            <FlatList
              data={results}
              keyExtractor={(u) => u.id}
              style={styles.results}
              renderItem={({ item }) => (
                <Pressable style={styles.row} onPress={() => connect(item.id)}>
                  <Text style={styles.name}>{item.name}</Text>
                  <Text style={styles.meta}>{item.type} · {item.email}</Text>
                </Pressable>
              )}
            />
          )}
        </>
      ) : (
        <PrimaryButton label={t('vip.upgrade')} variant="outline" onPress={() => router.push('/(auth)/register-vip' as never)} />
      )}
      <Text style={styles.section}>{t('networking.connections')}</Text>
      <FlatList
        data={connections}
        keyExtractor={(c) => c.id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={async () => { setRefreshing(true); await load(); setRefreshing(false); }} />
        }
        ListEmptyComponent={<EmptyState message={t('networking.empty')} />}
          renderItem={({ item }) => {
          const incoming = item.toUserId === user?.id && item.status === 'pending';
          const outgoing = item.fromUserId === user?.id;
          const displayName = outgoing
            ? item.toName ?? t('networking.unknown')
            : item.fromName ?? t('networking.unknown');
          const statusLabel =
            item.status === 'accepted'
              ? t('networking.statusAccepted')
              : item.status === 'rejected'
                ? t('networking.statusRejected')
                : incoming
                  ? t('networking.statusIncoming')
                  : t('networking.statusPending');
          const bgColor = avatarColor(item.id);
          const initials = avatarInitials(displayName);
          return (
            <View style={styles.row}>
              <View style={styles.rowInner}>
                <View style={[styles.avatar, { backgroundColor: bgColor }]}>
                  <Text style={styles.avatarText}>{initials}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.name}>{displayName}</Text>
                  <Text style={styles.meta}>{statusLabel}</Text>
                </View>
              </View>
              {incoming && (
                <View style={styles.actions}>
                  <Pressable style={styles.accept} onPress={() => respond(item.id, true)}>
                    <Text style={styles.btn}>{t('networking.accept')}</Text>
                  </Pressable>
                  <Pressable style={styles.reject} onPress={() => respond(item.id, false)}>
                    <Text style={styles.btn}>{t('networking.reject')}</Text>
                  </Pressable>
                </View>
              )}
            </View>
          );
        }}
      />
    </>
  );

  if (embedded) return <View style={[styles.flex, styles.embedded]}>{body}</View>;
  return (
    <SalonGate>
      <Screen style={styles.flex}>{body}</Screen>
    </SalonGate>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  embedded: { paddingHorizontal: spacing.md },
  section: { fontFamily: fonts.bodyBold, marginTop: spacing.lg, marginBottom: spacing.sm, color: colors.text },
  freeHint: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.textMuted,
    marginBottom: spacing.sm,
    lineHeight: 18,
  },
  results: { maxHeight: 180, marginBottom: spacing.md },
  row: { padding: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border },
  rowInner: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  avatar: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#fff', fontFamily: fonts.bodyBold, fontSize: 14 },
  name: { fontFamily: fonts.bodySemiBold, color: colors.text },
  meta: { fontSize: 12, fontFamily: fonts.body, color: colors.textMuted, marginTop: 2 },
  actions: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.sm },
  accept: { flex: 1, backgroundColor: colors.success, padding: 8, borderRadius: radius.sm, alignItems: 'center' },
  reject: { flex: 1, backgroundColor: colors.danger, padding: 8, borderRadius: radius.sm, alignItems: 'center' },
  btn: { color: '#fff', fontFamily: fonts.bodySemiBold, fontSize: 13 },
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

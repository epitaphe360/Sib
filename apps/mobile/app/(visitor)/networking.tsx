import { router } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Alert, FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';
import {
  fetchConnections,
  requestConnection,
  respondConnection,
  searchUsers,
  type ConnectionRequest,
} from '../../src/api/networking';
import { fetchMatchSuggestions, type MatchSuggestion } from '../../src/api/matchmaking';
import { EmptyState, Input, PrimaryButton, Screen, ScreenTitle } from '../../src/components/ui';
import { useAuth } from '../../src/context/AuthContext';
import { useNetworkingPermissions } from '../../src/hooks/useNetworkingPermissions';
import { useI18n } from '../../src/i18n/I18nProvider';
import { getPermissionErrorMessage } from '../../src/lib/networkingPermissions';
import { colors, spacing } from '../../src/theme';

export default function VisitorNetworkingScreen() {
  const { user } = useAuth();
  const { t } = useI18n();
  const { permissions, limits } = useNetworkingPermissions();
  const [connections, setConnections] = useState<ConnectionRequest[]>([]);
  const [suggestions, setSuggestions] = useState<MatchSuggestion[]>([]);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Array<{ id: string; name: string; email: string; type: string }>>([]);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    if (!user) return;
    const [conns, sugg] = await Promise.all([
      fetchConnections(user.id),
      fetchMatchSuggestions(user.id),
    ]);
    setConnections(conns);
    setSuggestions(sugg);
  }, [user]);

  useEffect(() => { load(); }, [load]);

  if (!permissions.canAccessNetworking) {
    return (
      <Screen>
        <ScreenTitle title={t('networking.title')} />
        <EmptyState message={getPermissionErrorMessage(user?.type ?? 'visitor', user?.visitorLevel, 'connection')} />
        <PrimaryButton label={t('vip.upgrade')} onPress={() => router.push('/(auth)/register-vip')} />
      </Screen>
    );
  }

  const search = async () => {
    if (!user || query.trim().length < 2) return;
    setResults(await searchUsers(query.trim(), user.id));
  };

  const connect = async (toUserId: string) => {
    if (!user) return;
    if (!limits.canMakeConnection) {
      Alert.alert('Forfait', getPermissionErrorMessage(user.type, user.visitorLevel, 'connection'));
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

  return (
    <Screen style={styles.flex}>
      <ScreenTitle title={t('networking.title')} subtitle="B2B" />
      {suggestions.length > 0 && (
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
          return (
            <View style={styles.row}>
              <Text style={styles.name}>{item.status}</Text>
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
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  section: { fontWeight: '700', marginTop: spacing.lg, marginBottom: spacing.sm, color: colors.text },
  results: { maxHeight: 180, marginBottom: spacing.md },
  row: { padding: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border },
  name: { fontWeight: '600', color: colors.text },
  meta: { fontSize: 12, color: colors.textMuted, marginTop: 4 },
  actions: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.sm },
  accept: { flex: 1, backgroundColor: colors.success, padding: 8, borderRadius: 8, alignItems: 'center' },
  reject: { flex: 1, backgroundColor: colors.danger, padding: 8, borderRadius: 8, alignItems: 'center' },
  btn: { color: '#fff', fontWeight: '600', fontSize: 13 },
  suggestList: { maxHeight: 120, marginBottom: spacing.md },
  suggestCard: {
    width: 200,
    marginRight: spacing.sm,
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  score: { fontSize: 11, color: colors.primary, marginTop: 4, fontWeight: '600' },
});

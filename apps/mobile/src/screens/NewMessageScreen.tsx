import { useState } from 'react';
import { Alert, FlatList, Pressable, StyleSheet, Text } from 'react-native';
import { startConversation } from '../api/chat';
import { searchUsers } from '../api/networking';
import { EmptyState, Input, PrimaryButton, Screen, ScreenTitle } from '../components/ui';
import { useAuth } from '../context/AuthContext';
import { useNetworkingPermissions } from '../hooks/useNetworkingPermissions';
import { useI18n } from '../i18n/I18nProvider';
import { getPermissionErrorMessage } from '../lib/networkingPermissions';
import { navigateSafe, requireAuth } from '../lib/navigateSafe';
import { colors, spacing } from '../theme';

type MessageRouteGroup = 'visitor' | 'exhibitor';

const ROUTE_PREFIX: Record<MessageRouteGroup, string> = {
  visitor: '/(visitor)',
  exhibitor: '/(exhibitor)',
};

export function NewMessageScreen({ group }: { group: MessageRouteGroup }) {
  const { user } = useAuth();
  const { t } = useI18n();
  const { permissions } = useNetworkingPermissions();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Array<{ id: string; name: string; email: string; type: string }>>([]);
  const [loading, setLoading] = useState(false);
  const prefix = ROUTE_PREFIX[group];

  if (!permissions.canSendMessages) {
    return (
      <Screen style={styles.flex}>
        <ScreenTitle title={t('messages.newThread')} />
        <EmptyState message={getPermissionErrorMessage(user?.type ?? 'visitor', user?.visitorLevel, 'message', t)} />
        <PrimaryButton label={t('vip.upgrade')} onPress={() => navigateSafe('/(auth)/register-vip', 'push')} variant="gold" />
      </Screen>
    );
  }

  const search = async () => {
    if (!requireAuth(user, t)) return;
    if (query.trim().length < 2) {
      Alert.alert(t('networking.search'), t('networking.searchMin'));
      return;
    }
    setLoading(true);
    try {
      setResults(await searchUsers(query.trim(), user!.id));
    } catch (e) {
      Alert.alert(t('common.error'), e instanceof Error ? e.message : t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  const openChat = async (otherUserId: string) => {
    if (!requireAuth(user, t)) return;
    setLoading(true);
    try {
      const conversationId = await startConversation(user!.id, otherUserId);
      navigateSafe(`${prefix}/messages/${conversationId}`, 'replace');
    } catch (e) {
      Alert.alert(t('common.error'), e instanceof Error ? e.message : t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen style={styles.flex}>
      <ScreenTitle title={t('messages.newThread')} subtitle={t('networking.search')} />
      <Input label={t('networking.search')} value={query} onChangeText={setQuery} autoCapitalize="none" />
      <PrimaryButton label={t('networking.searchBtn')} onPress={search} loading={loading} />
      <FlatList
        data={results}
        keyExtractor={(u) => u.id}
        style={styles.list}
        renderItem={({ item }) => (
          <Pressable style={styles.row} onPress={() => openChat(item.id)} disabled={loading}>
            <Text style={styles.name}>{item.name}</Text>
            <Text style={styles.meta}>{item.type} · {item.email}</Text>
          </Pressable>
        )}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  list: { flex: 1, marginTop: spacing.md },
  row: { padding: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border },
  name: { fontWeight: '600', color: colors.text },
  meta: { fontSize: 12, color: colors.textMuted, marginTop: 4 },
});

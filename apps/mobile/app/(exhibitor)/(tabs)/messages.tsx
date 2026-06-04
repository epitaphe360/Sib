import { router } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text } from 'react-native';
import { fetchConversations } from '../../../src/api/chat';
import { EmptyState, Screen, ScreenTitle } from '../../../src/components/ui';
import { useAuth } from '../../../src/context/AuthContext';
import { colors, spacing } from '../../../src/theme';

export default function ExhibitorMessagesScreen() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Awaited<ReturnType<typeof fetchConversations>>>([]);

  const load = useCallback(async () => {
    if (!user) return;
    setConversations(await fetchConversations(user.id));
  }, [user]);

  useEffect(() => { load(); }, [load]);

  return (
    <Screen style={styles.flex}>
      <ScreenTitle title="Messages" />
      <FlatList
        data={conversations}
        keyExtractor={(c) => c.id}
        ListEmptyComponent={<EmptyState message="Aucune conversation" />}
        renderItem={({ item }) => (
          <Pressable
            style={styles.row}
            onPress={() => router.push(`/(exhibitor)/messages/${item.id}` as never)}
          >
            <Text style={styles.preview}>{item.lastMessage ?? 'Conversation'}</Text>
            {item.unreadCount > 0 && <Text style={styles.badge}>{item.unreadCount}</Text>}
          </Pressable>
        )}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  row: {
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  preview: { flex: 1, color: colors.text, fontSize: 15 },
  badge: { backgroundColor: colors.primary, color: '#fff', paddingHorizontal: 8, borderRadius: 10, overflow: 'hidden' },
});

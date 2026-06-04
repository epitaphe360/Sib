import { router } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { fetchConversations, type MobileConversation } from '../../../src/api/chat';
import { EmptyState, Screen, ScreenTitle } from '../../../src/components/ui';
import { useAuth } from '../../../src/context/AuthContext';
import { colors, spacing } from '../../../src/theme';

export default function VisitorMessagesScreen() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<MobileConversation[]>([]);
  const [refreshing, setRefreshing] = useState(false);

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
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={async () => { setRefreshing(true); await load(); setRefreshing(false); }} />
        }
        ListEmptyComponent={<EmptyState message="Aucune conversation" />}
        renderItem={({ item }) => (
          <Pressable
            style={styles.row}
            onPress={() => router.push(`/(visitor)/messages/${item.id}` as never)}
          >
            <View style={styles.flex}>
              <Text style={styles.preview} numberOfLines={1}>{item.lastMessage ?? 'Nouvelle conversation'}</Text>
              <Text style={styles.date}>{new Date(item.updatedAt).toLocaleDateString('fr-FR')}</Text>
            </View>
            {item.unreadCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{item.unreadCount}</Text>
              </View>
            )}
          </Pressable>
        )}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  row: { flexDirection: 'row', alignItems: 'center', padding: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border },
  preview: { fontSize: 15, color: colors.text, fontWeight: '600' },
  date: { fontSize: 12, color: colors.textMuted, marginTop: 4 },
  badge: { backgroundColor: colors.primary, borderRadius: 12, minWidth: 24, height: 24, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 6 },
  badgeText: { color: '#fff', fontSize: 12, fontWeight: '700' },
});

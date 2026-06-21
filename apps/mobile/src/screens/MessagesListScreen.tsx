import { router } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Alert, FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { fetchConversations, type MobileConversation } from '../api/chat';
import { EmptyState, PrimaryButton, Screen, ScreenTitle } from '../components/ui';
import { useAuth } from '../context/AuthContext';
import { useNetworkingPermissions } from '../hooks/useNetworkingPermissions';
import { useI18n } from '../i18n/I18nProvider';
import { navigateSafe, requireAuth } from '../lib/navigateSafe';
import { colors, spacing } from '../theme';

type MessageRouteGroup = 'visitor' | 'exhibitor';

const ROUTE_PREFIX: Record<MessageRouteGroup, string> = {
  visitor: '/(visitor)',
  exhibitor: '/(exhibitor)',
};

export function MessagesListScreen({ group, embedded }: { group: MessageRouteGroup; embedded?: boolean }) {
  const { user } = useAuth();
  const { permissions } = useNetworkingPermissions();
  const { t, locale } = useI18n();
  const [conversations, setConversations] = useState<MobileConversation[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const prefix = ROUTE_PREFIX[group];
  const dateLocale = locale === 'ar' ? 'ar-MA' : locale === 'en' ? 'en-GB' : 'fr-FR';

  const load = useCallback(async () => {
    if (!user) return;
    try {
      setConversations(await fetchConversations(user.id));
    } catch (e) {
      Alert.alert(t('common.error'), e instanceof Error ? e.message : t('common.error'));
    }
  }, [user, t]);

  useEffect(() => {
    load();
  }, [load]);

  if (group === 'visitor' && !permissions.canAccessNetworking) {
    const blocked = (
      <>
        {!embedded && <ScreenTitle title={t('messages.title')} />}
        <EmptyState message={t('networking.blocked')} />
        <PrimaryButton label={t('vip.upgrade')} onPress={() => router.push('/(auth)/register-vip')} variant="gold" />
      </>
    );
    if (embedded) return <View style={styles.embedded}>{blocked}</View>;
    return <Screen>{blocked}</Screen>;
  }

  const inner = (
    <>
      {!embedded && <ScreenTitle title={t('messages.title')} />}
      <PrimaryButton
        label={t('messages.newThread')}
        onPress={() => {
          if (!requireAuth(user, t)) return;
          navigateSafe(`${prefix}/messages/new`);
        }}
      />
      <View style={styles.gap} />
      <FlatList
        data={conversations}
        keyExtractor={(c) => c.id}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={async () => {
              setRefreshing(true);
              await load();
              setRefreshing(false);
            }}
          />
        }
        ListEmptyComponent={<EmptyState message={t('messages.empty')} />}
        renderItem={({ item }) => (
          <Pressable
            style={styles.row}
            onPress={() => navigateSafe(`${prefix}/messages/${item.id}`)}
          >
            <View style={styles.flex}>
              <Text style={styles.preview} numberOfLines={1}>
                {item.lastMessage ?? t('messages.newThread')}
              </Text>
              <Text style={styles.date}>{new Date(item.updatedAt).toLocaleDateString(dateLocale)}</Text>
            </View>
            {item.unreadCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{item.unreadCount}</Text>
              </View>
            )}
          </Pressable>
        )}
      />
    </>
  );

  if (embedded) return <View style={[styles.flex, styles.embedded]}>{inner}</View>;
  return <Screen style={styles.flex}>{inner}</Screen>;
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  embedded: { paddingHorizontal: spacing.md },
  gap: { height: spacing.sm },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  preview: { fontSize: 15, color: colors.text, fontWeight: '600' },
  date: { fontSize: 12, color: colors.textMuted, marginTop: 4 },
  badge: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  badgeText: { color: '#fff', fontSize: 12, fontWeight: '700' },
});

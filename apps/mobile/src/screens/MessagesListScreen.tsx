import { router } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Alert, FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { fetchConversations, type MobileConversation } from '../api/chat';
import { AppIcon } from '../components/AppIcon';
import { Avatar, IllustratedEmpty, PrimaryButton, Screen } from '../components/ui';
import { WorkspaceHeader } from '../components/workspace/WorkspaceUI';
import { useAuth } from '../context/AuthContext';
import { useNetworkingPermissions } from '../hooks/useNetworkingPermissions';
import { useI18n } from '../i18n/I18nProvider';
import { navigateSafe, requireAuth } from '../lib/navigateSafe';
import { colors, fonts, radius, shadows, spacing } from '../theme';

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
  const tone = group === 'exhibitor' ? 'exhibitor' : 'salon';

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
        {!embedded && (
          <WorkspaceHeader eyebrow={t('tabs.messages')} title={t('messages.title')} tone={tone} icon="chatbubbles-outline" />
        )}
        <IllustratedEmpty
          icon="lock-closed-outline"
          title={t('messages.title')}
          message={t('networking.blocked')}
          actionLabel={t('vip.upgrade')}
          onAction={() => router.push('/(auth)/register-vip')}
        />
      </>
    );
    if (embedded) return <View style={styles.embedded}>{blocked}</View>;
    return <Screen>{blocked}</Screen>;
  }

  const inner = (
    <>
      {!embedded && (
        <WorkspaceHeader
          eyebrow={t('tabs.messages')}
          title={t('messages.title')}
          subtitle={t('messages.subtitle')}
          tone={tone}
          icon="chatbubbles-outline"
          status={conversations.length ? `${conversations.length}` : undefined}
        />
      )}
      <View style={styles.body}>
        <PrimaryButton
          label={t('messages.newThread')}
          onPress={() => {
            if (!requireAuth(user, t)) return;
            navigateSafe(`${prefix}/messages/new`);
          }}
        />
        <FlatList
          style={styles.flex}
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
          contentContainerStyle={conversations.length === 0 ? styles.emptyList : styles.list}
          ListEmptyComponent={
            <IllustratedEmpty icon="chatbubbles-outline" title={t('messages.title')} message={t('messages.empty')} />
          }
          renderItem={({ item }) => {
            const preview = item.lastMessage ?? t('messages.newThread');
            const label = preview.length > 24 ? `${preview.slice(0, 24)}…` : preview;
            return (
              <Pressable
                style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
                onPress={() => navigateSafe(`${prefix}/messages/${item.id}`)}
              >
                <Avatar name={label} size={44} />
                <View style={styles.rowCopy}>
                  <Text style={styles.preview} numberOfLines={1}>
                    {preview}
                  </Text>
                  <Text style={styles.date}>{new Date(item.updatedAt).toLocaleDateString(dateLocale)}</Text>
                </View>
                {item.unreadCount > 0 ? (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{item.unreadCount}</Text>
                  </View>
                ) : (
                  <AppIcon name="chevron-forward" size={16} color={colors.textLight} />
                )}
              </Pressable>
            );
          }}
        />
      </View>
    </>
  );

  if (embedded) return <View style={[styles.flex, styles.embedded]}>{inner}</View>;
  return <Screen style={styles.flex}>{inner}</Screen>;
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  embedded: { paddingHorizontal: spacing.md },
  body: { flex: 1, paddingHorizontal: spacing.md, gap: spacing.sm, marginTop: -spacing.sm },
  list: { paddingBottom: spacing.xl, gap: spacing.sm },
  emptyList: { flexGrow: 1, paddingBottom: spacing.xl },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.borderLight,
    marginBottom: spacing.sm,
    ...shadows.sm,
  },
  rowPressed: { opacity: 0.92 },
  rowCopy: { flex: 1, minWidth: 0 },
  preview: { fontSize: 15, fontFamily: fonts.bodySemiBold, color: colors.text },
  date: { fontSize: 12, fontFamily: fonts.body, color: colors.textMuted, marginTop: 4 },
  badge: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  badgeText: { color: '#fff', fontSize: 12, fontFamily: fonts.bodyBold },
});

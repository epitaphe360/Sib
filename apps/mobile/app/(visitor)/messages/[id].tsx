import { useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Alert, FlatList, KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { fetchConversations, sendMessage, type MobileMessage } from '../../../src/api/chat';
import { AppIcon } from '../../../src/components/AppIcon';
import { IllustratedEmpty, Screen } from '../../../src/components/ui';
import { useAuth } from '../../../src/context/AuthContext';
import { useNetworkingPermissions } from '../../../src/hooks/useNetworkingPermissions';
import { useI18n } from '../../../src/i18n/I18nProvider';
import { getPermissionErrorMessage } from '../../../src/lib/networkingPermissions';
import { colors, fonts, radius, spacing } from '../../../src/theme';

export default function VisitorMessageThreadScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const { t } = useI18n();
  const { permissions, limits } = useNetworkingPermissions();
  const [messages, setMessages] = useState<MobileMessage[]>([]);
  const [otherUserId, setOtherUserId] = useState<string | null>(null);
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!user || !id) return;
    setLoadError(null);
    try {
      const convs = await fetchConversations(user.id);
      const conv = convs.find((c) => c.id === id);
      if (conv) {
        setMessages(conv.messages);
        setOtherUserId(conv.participants.find((p) => p !== user.id) ?? null);
      } else {
        setLoadError(t('messages.threadNotFound'));
      }
    } catch (e) {
      setLoadError(e instanceof Error ? e.message : t('common.error'));
    }
  }, [user, id, t]);

  useEffect(() => { load(); }, [load]);

  const handleSend = async () => {
    if (!user || !id) return;
    if (!draft.trim()) {
      Alert.alert(t('messages.title'), t('messages.emptyDraft'));
      return;
    }
    if (!permissions.canSendMessages || !limits.canSendMessage) {
      Alert.alert(t('messages.title'), getPermissionErrorMessage(user.type, user.visitorLevel, 'message'));
      return;
    }
    if (!otherUserId) {
      Alert.alert(t('common.error'), t('messages.threadNotFound'));
      return;
    }
    setSending(true);
    try {
      await sendMessage(id, user.id, otherUserId, draft.trim());
      setDraft('');
      await load();
    } catch (e) {
      Alert.alert(t('common.error'), e instanceof Error ? e.message : t('messages.sendError'));
    } finally {
      setSending(false);
    }
  };

  return (
    <Screen style={styles.flex}>
      <View style={styles.threadHeader}>
        <AppIcon name="chatbubbles-outline" size={18} color={colors.gold} />
        <Text style={styles.threadTitle}>{t('messages.title')}</Text>
      </View>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        {loadError ? (
          <IllustratedEmpty icon="alert-circle-outline" title={t('common.error')} message={loadError} />
        ) : (
          <FlatList
            style={styles.flex}
            data={messages}
            keyExtractor={(m) => m.id}
            contentContainerStyle={styles.list}
            renderItem={({ item }) => {
              const mine = item.senderId === user?.id;
              return (
                <View style={[styles.bubble, mine ? styles.mine : styles.theirs]}>
                  <Text style={[styles.text, mine && styles.textMine]}>{item.content}</Text>
                </View>
              );
            }}
          />
        )}
        <View style={styles.composer}>
          <TextInput
            style={styles.input}
            value={draft}
            onChangeText={setDraft}
            placeholder={t('messages.placeholder')}
            placeholderTextColor={colors.textMuted}
            multiline
          />
          <Pressable style={[styles.sendBtn, sending && styles.sendBtnDisabled]} onPress={handleSend} disabled={sending}>
            <AppIcon name="send-outline" size={18} color="#fff" />
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  threadHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.primaryDark,
  },
  threadTitle: { fontFamily: fonts.bodySemiBold, fontSize: 15, color: '#fff' },
  list: { padding: spacing.md, paddingBottom: spacing.lg, flexGrow: 1 },
  bubble: { maxWidth: '80%', padding: 12, borderRadius: radius.lg, marginBottom: spacing.sm },
  mine: { alignSelf: 'flex-end', backgroundColor: colors.primary },
  theirs: { alignSelf: 'flex-start', backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.borderLight },
  text: { color: colors.text, fontSize: 15, fontFamily: fonts.body, lineHeight: 21 },
  textMine: { color: '#fff' },
  composer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.sm,
    padding: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    backgroundColor: colors.surface,
  },
  input: {
    flex: 1,
    minHeight: 42,
    maxHeight: 120,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    fontFamily: fonts.body,
    fontSize: 15,
    color: colors.text,
    backgroundColor: colors.background,
  },
  sendBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnDisabled: { opacity: 0.6 },
});

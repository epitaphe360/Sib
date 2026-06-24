import { useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Alert, FlatList, KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { fetchConversations, sendMessage } from '../../../src/api/chat';
import { AppIcon } from '../../../src/components/AppIcon';
import { PrimaryButton, Screen } from '../../../src/components/ui';
import { useAuth } from '../../../src/context/AuthContext';
import { useI18n } from '../../../src/i18n/I18nProvider';
import { colors, fonts, radius, spacing } from '../../../src/theme';

export default function ExhibitorChatScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const { t } = useI18n();
  const [messages, setMessages] = useState<Array<{ id: string; senderId: string; content: string }>>([]);
  const [text, setText] = useState('');
  const [otherId, setOtherId] = useState('');
  const [sending, setSending] = useState(false);

  const load = useCallback(async () => {
    if (!user || !id) return;
    const convs = await fetchConversations(user.id);
    const conv = convs.find((c) => c.id === id);
    if (conv) {
      setMessages(conv.messages);
      setOtherId(conv.participants.find((p) => p !== user.id) ?? '');
    }
  }, [user, id]);

  useEffect(() => { load(); }, [load]);

  const onSend = async () => {
    if (!user || !id || !otherId) return;
    if (!text.trim()) {
      Alert.alert(t('messages.title'), t('messages.emptyDraft'));
      return;
    }
    setSending(true);
    try {
      await sendMessage(id, user.id, otherId, text.trim());
      setText('');
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
        <FlatList
          data={messages}
          keyExtractor={(m) => m.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => {
            const mine = item.senderId === user?.id;
            return (
              <View style={[styles.bubble, mine ? styles.mine : styles.theirs]}>
                <Text style={[styles.content, mine && styles.contentMine]}>{item.content}</Text>
              </View>
            );
          }}
        />
        <View style={styles.composer}>
          <TextInput
            style={styles.input}
            value={text}
            onChangeText={setText}
            placeholder={t('messages.placeholder')}
            placeholderTextColor={colors.textMuted}
            multiline
          />
          <Pressable style={[styles.sendBtn, sending && styles.sendBtnDisabled]} onPress={onSend} disabled={sending}>
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
  list: { padding: spacing.md, flexGrow: 1 },
  bubble: { maxWidth: '80%', padding: 12, borderRadius: radius.lg, marginBottom: 8 },
  mine: { alignSelf: 'flex-end', backgroundColor: colors.primary },
  theirs: { alignSelf: 'flex-start', backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.borderLight },
  content: { color: colors.text, fontSize: 15, fontFamily: fonts.body, lineHeight: 21 },
  contentMine: { color: '#fff' },
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

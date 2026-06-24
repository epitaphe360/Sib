import { useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Alert, FlatList, KeyboardAvoidingView, Platform, StyleSheet, Text, View } from 'react-native';
import { fetchConversations, sendMessage } from '../../../src/api/chat';
import { Input, PrimaryButton, Screen } from '../../../src/components/ui';
import { useAuth } from '../../../src/context/AuthContext';
import { useI18n } from '../../../src/i18n/I18nProvider';
import { colors, spacing } from '../../../src/theme';

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
          <Input label="" value={text} onChangeText={setText} placeholder={t('messages.placeholder')} />
          <PrimaryButton label={t('messages.send')} onPress={onSend} loading={sending} />
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  list: { padding: spacing.md, flexGrow: 1 },
  bubble: { maxWidth: '80%', padding: 10, borderRadius: 12, marginBottom: 8 },
  mine: { alignSelf: 'flex-end', backgroundColor: colors.primary },
  theirs: { alignSelf: 'flex-start', backgroundColor: colors.border },
  content: { color: colors.text, fontSize: 15 },
  contentMine: { color: '#fff' },
  composer: { padding: spacing.md, borderTopWidth: 1, borderTopColor: colors.border },
});

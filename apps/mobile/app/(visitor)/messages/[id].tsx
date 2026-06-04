import { useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { FlatList, KeyboardAvoidingView, Platform, StyleSheet, Text, View } from 'react-native';
import { fetchConversations, sendMessage, type MobileMessage } from '../../../src/api/chat';
import { Input, PrimaryButton, Screen } from '../../../src/components/ui';
import { useAuth } from '../../../src/context/AuthContext';
import { colors, spacing } from '../../../src/theme';

export default function VisitorMessageThreadScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const [messages, setMessages] = useState<MobileMessage[]>([]);
  const [otherUserId, setOtherUserId] = useState<string | null>(null);
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);

  const load = useCallback(async () => {
    if (!user || !id) return;
    const convs = await fetchConversations(user.id);
    const conv = convs.find((c) => c.id === id);
    if (conv) {
      setMessages(conv.messages);
      setOtherUserId(conv.participants.find((p) => p !== user.id) ?? null);
    }
  }, [user, id]);

  useEffect(() => { load(); }, [load]);

  const handleSend = async () => {
    if (!user || !id || !otherUserId || !draft.trim()) return;
    setSending(true);
    try {
      await sendMessage(id, user.id, otherUserId, draft.trim());
      setDraft('');
      await load();
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
                <Text style={[styles.text, mine && styles.textMine]}>{item.content}</Text>
              </View>
            );
          }}
        />
        <View style={styles.composer}>
          <Input label="" value={draft} onChangeText={setDraft} placeholder="Votre message…" />
          <PrimaryButton label="Envoyer" onPress={handleSend} loading={sending} />
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  list: { padding: spacing.md, paddingBottom: spacing.lg },
  bubble: { maxWidth: '80%', padding: spacing.sm, borderRadius: 12, marginBottom: spacing.sm },
  mine: { alignSelf: 'flex-end', backgroundColor: colors.primary },
  theirs: { alignSelf: 'flex-start', backgroundColor: colors.border },
  text: { color: colors.text, fontSize: 15 },
  textMine: { color: '#fff' },
  composer: { padding: spacing.md, borderTopWidth: 1, borderTopColor: colors.border },
});

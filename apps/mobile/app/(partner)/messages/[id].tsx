import { useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Alert, FlatList, KeyboardAvoidingView, Platform, StyleSheet, Text, View } from 'react-native';
import { fetchConversations, sendMessage } from '../../../src/api/chat';
import { Input, PrimaryButton, Screen } from '../../../src/components/ui';
import { useAuth } from '../../../src/context/AuthContext';
import { colors, spacing } from '../../../src/theme';

export default function PartnerChatScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const [messages, setMessages] = useState<Array<{ id: string; senderId: string; content: string }>>([]);
  const [text, setText] = useState('');
  const [otherId, setOtherId] = useState('');

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
    if (!user || !id || !text.trim() || !otherId) return;
    try {
      await sendMessage(id, user.id, otherId, text.trim());
      setText('');
      await load();
    } catch (e) {
      Alert.alert('Erreur', e instanceof Error ? e.message : 'Envoi impossible');
    }
  };

  return (
    <Screen style={styles.flex}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={80}
      >
        <FlatList
          data={messages}
          keyExtractor={(m) => m.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <View style={[styles.bubble, item.senderId === user?.id && styles.bubbleMine]}>
              <Text style={[styles.bubbleText, item.senderId === user?.id && styles.textMine]}>{item.content}</Text>
            </View>
          )}
        />
        <View style={styles.composer}>
          <Input label="" value={text} onChangeText={setText} placeholder="Message..." />
          <PrimaryButton label="Envoyer" onPress={onSend} />
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  list: { paddingBottom: spacing.md },
  bubble: {
    alignSelf: 'flex-start',
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.sm,
    marginBottom: spacing.xs,
    maxWidth: '85%',
    borderWidth: 1,
    borderColor: colors.border,
  },
  bubbleMine: { alignSelf: 'flex-end', backgroundColor: colors.primary },
  bubbleText: { color: colors.text },
  textMine: { color: '#fff' },
  composer: { borderTopWidth: 1, borderTopColor: colors.border, paddingTop: spacing.sm },
});

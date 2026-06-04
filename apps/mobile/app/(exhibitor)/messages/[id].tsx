import { useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Alert, FlatList, KeyboardAvoidingView, Platform, StyleSheet, Text, View } from 'react-native';
import { fetchConversations, sendMessage } from '../../../src/api/chat';
import { Input, PrimaryButton, Screen } from '../../../src/components/ui';
import { useAuth } from '../../../src/context/AuthContext';
import { colors, spacing } from '../../../src/theme';

export default function ExhibitorChatScreen() {
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
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <FlatList
          data={messages}
          keyExtractor={(m) => m.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <View style={[styles.bubble, item.senderId === user?.id ? styles.mine : styles.theirs]}>
              <Text style={styles.content}>{item.content}</Text>
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
  list: { padding: spacing.md, flexGrow: 1 },
  bubble: { maxWidth: '80%', padding: 10, borderRadius: 12, marginBottom: 8 },
  mine: { alignSelf: 'flex-end', backgroundColor: colors.primary },
  theirs: { alignSelf: 'flex-start', backgroundColor: colors.border },
  content: { color: colors.text },
  composer: { padding: spacing.md, borderTopWidth: 1, borderTopColor: colors.border },
});

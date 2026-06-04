import { supabase } from '../lib/supabase';

export interface MobileMessage {
  id: string;
  senderId: string;
  content: string;
  createdAt: string;
  read: boolean;
}

export interface MobileConversation {
  id: string;
  participants: string[];
  lastMessage?: string;
  unreadCount: number;
  updatedAt: string;
  messages: MobileMessage[];
}

export async function fetchConversations(userId: string): Promise<MobileConversation[]> {
  const { data, error } = await supabase
    .from('conversations')
    .select(`
      id,
      participants,
      updated_at,
      messages:messages(
        id,
        content,
        created_at,
        read_at,
        sender_id
      )
    `)
    .contains('participants', [userId])
    .order('updated_at', { ascending: false });

  if (error) throw error;

  return (data ?? []).map((conv) => {
    const msgs = (conv.messages ?? []) as Array<{
      id: string;
      content: string;
      created_at: string;
      read_at: string | null;
      sender_id: string;
    }>;
    const sorted = [...msgs].sort(
      (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );
    const last = sorted[sorted.length - 1];
    return {
      id: conv.id,
      participants: conv.participants as string[],
      lastMessage: last?.content,
      unreadCount: sorted.filter((m) => m.sender_id !== userId && !m.read_at).length,
      updatedAt: conv.updated_at as string,
      messages: sorted.map((m) => ({
        id: m.id,
        senderId: m.sender_id,
        content: m.content,
        createdAt: m.created_at,
        read: m.read_at != null,
      })),
    };
  });
}

export async function sendMessage(
  conversationId: string,
  senderId: string,
  receiverId: string,
  content: string
): Promise<void> {
  const { error } = await supabase.from('messages').insert({
    conversation_id: conversationId,
    sender_id: senderId,
    receiver_id: receiverId,
    content,
    message_type: 'text',
  });
  if (error) throw error;

  await supabase
    .from('conversations')
    .update({ updated_at: new Date().toISOString(), last_message_at: new Date().toISOString() })
    .eq('id', conversationId);
}

export async function startConversation(userId: string, otherUserId: string): Promise<string> {
  const { data: existing } = await supabase
    .from('conversations')
    .select('id, participants')
    .contains('participants', [userId]);

  const found = (existing ?? []).find(
    (c) =>
      Array.isArray(c.participants) &&
      c.participants.includes(userId) &&
      c.participants.includes(otherUserId)
  );
  if (found) return found.id;

  const { data, error } = await supabase
    .from('conversations')
    .insert({
      participants: [userId, otherUserId],
      type: 'direct',
      created_by: userId,
      is_active: true,
    })
    .select('id')
    .single();

  if (error) throw error;
  return data.id;
}

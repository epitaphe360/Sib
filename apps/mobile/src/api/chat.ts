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
    .order('updated_at', { ascending: false })
    .limit(40);

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
  _conversationId: string,
  _senderId: string,
  receiverId: string,
  content: string
): Promise<void> {
  const { error } = await supabase.rpc('send_direct_message', {
    p_receiver_id: receiverId,
    p_content: content,
    p_message_type: 'text',
  });
  if (error) throw error;
}

export async function startConversation(_userId: string, otherUserId: string): Promise<string> {
  const { data, error } = await supabase.rpc('get_or_create_conversation', {
    p_other_user_id: otherUserId,
  });
  if (error) throw error;
  if (!data) throw new Error('Impossible de démarrer la conversation');
  return data as string;
}

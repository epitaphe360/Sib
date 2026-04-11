import { create } from 'zustand';
import { ChatMessage, ChatConversation, ChatBot } from '../types';
import { SupabaseService } from '../services/supabaseService';
import { useAuthStore } from './authStore';

interface ChatState {
  conversations: ChatConversation[];
  activeConversation: string | null;
  messages: Record<string, ChatMessage[]>;
  isLoading: boolean;
  error: string | null;
  chatBot: ChatBot;
  onlineUsers: string[];

  // Actions
  fetchConversations: () => Promise<void>;
  setActiveConversation: (conversationId: string) => void;
  sendMessage: (conversationId: string, content: string, type?: 'text' | 'file') => Promise<void>;
  markAsRead: (conversationId: string) => void;
  startConversation: (userId: string) => Promise<string>;
  sendBotMessage: (message: string) => Promise<void>;
  setOnlineUsers: (users: string[]) => void;
}

const BOT_ID = 'siports-bot';

const mockChatBot: ChatBot = {
  id: BOT_ID,
  name: 'Assistant SIB',
  avatar: 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=100',
  status: 'online',
  capabilities: [
    'Aide à la navigation',
    'Recommandations de contacts',
    'Informations sur les exposants',
    'Planification de rendez-vous',
    'Support technique'
  ]
};

// Chat conversations and messages will be loaded from Supabase
const loadChatData = async (userId: string) => {
  try {
    // FIX N+1: Charger les conversations avec leurs messages en une seule requête
    const conversations = await SupabaseService.getConversations(userId);

    // ⚡ PERFORMANCE: Messages déjà inclus dans les conversations (pas de requêtes supplémentaires)
    const messages: Record<string, ChatMessage[]> = {};

    conversations.forEach((conversation) => {
      // Messages already included in conversation object from getConversations
      messages[conversation.id] = conversation.messages || [];
    });

    return {
      conversations,
      messages
    };
  } catch (error) {
    console.error('❌ Error loading chat data:', error);
    return {
      conversations: [],
      messages: {}
    };
  }
};

export const useChatStore = create<ChatState>((set, get) => ({
  conversations: [],
  activeConversation: null,
  messages: {},
  isLoading: false,
  error: null,
  chatBot: mockChatBot,
  onlineUsers: [],

  fetchConversations: async () => {
    set({ isLoading: true, error: null });
    try {
      const user = useAuthStore.getState().user;

      if (!user) {
        console.warn('⚠️ No authenticated user found');
        set({ conversations: [], messages: {}, isLoading: false });
        return;
      }

      const chatData = await loadChatData(user.id);
      set({
        conversations: chatData.conversations,
        messages: chatData.messages,
        isLoading: false
      });
    } catch (error) {
      console.error('❌ Error fetching conversations:', error);
      set({ isLoading: false, error: error instanceof Error ? error.message : 'Erreur lors du chargement des conversations' });
    }
  },

  setActiveConversation: (conversationId) => {
    set({ activeConversation: conversationId });
    // Mark messages as read
    get().markAsRead(conversationId);
  },

  sendMessage: async (conversationId, content, type = 'text') => {
    try {

      const { messages, conversations } = get();
      const conversation = conversations.find(c => c.id === conversationId);

      if (!conversation) {
        throw new Error('Conversation non trouvée');
      }

      const user = useAuthStore.getState().user;

      if (!user) {
        throw new Error('Utilisateur non authentifié');
      }

      // Identifier l'expéditeur et le destinataire
      // Note: participants est un string[] (array d'IDs), pas un array d'objets
      const senderId = user.id;
      const participants = conversation.participants || [];
      const receiverId = participants.find(p => p !== senderId);

      if (!receiverId) {
        throw new Error('Destinataire non trouvé dans la conversation');
      }

      // Envoyer via Supabase
      const sentMessage = await SupabaseService.sendMessage(
        conversationId,
        senderId,
        receiverId,
        content,
        type
      );

      if (!sentMessage) {
        throw new Error('Échec envoi message');
      }


      // Add message to conversation local state
      const updatedMessages = {
        ...messages,
        [conversationId]: [...(messages[conversationId] || []), sentMessage]
      };

      // Update conversation last message
      const updatedConversations = conversations.map(conv =>
        conv.id === conversationId
          ? { ...conv, lastMessage: sentMessage, updatedAt: new Date() }
          : conv
      );

      set({
        messages: updatedMessages,
        conversations: updatedConversations
      });

      // Simulate bot response if talking to bot
      if (conversationId === '2') {
        setTimeout(() => {
          get().sendBotMessage('Merci pour votre message. Je traite votre demande...');
        }, 1000);
      }
    } catch (error) {
      console.error('❌ Erreur envoi message:', error);
      throw error;
    }
  },

  markAsRead: async (conversationId) => {
    const { conversations } = get();

    const user = useAuthStore.getState().user;

    if (!user) {
      console.warn('⚠️ Cannot mark as read: no authenticated user');
      return;
    }

    // Marquer comme lus dans la base de données
    try {
      await SupabaseService.markMessagesAsRead(conversationId, user.id);
    } catch (error) {
      console.error('❌ Erreur lors du marquage des messages comme lus:', error);
      // Continue quand même avec la mise à jour locale
    }

    // Mise à jour locale du compteur
    const updatedConversations = conversations.map(conv =>
      conv.id === conversationId
        ? { ...conv, unreadCount: 0 }
        : conv
    );
    set({ conversations: updatedConversations });
  },

  startConversation: async (userId) => {
    const currentUserId = useAuthStore.getState().user?.id;
    if (!currentUserId) {
      throw new Error('Utilisateur non connecté');
    }

    try {
      // Create conversation in Supabase
      const conversation = await SupabaseService.createConversation(currentUserId, userId);
      if (!conversation) {
        throw new Error('Impossible de créer la conversation');
      }

      const { conversations } = get();
      // Check if already in list
      const exists = conversations.some(c => c.id === conversation.id);
      if (!exists) {
        set({ 
          conversations: [conversation, ...conversations],
          activeConversation: conversation.id
        });
      } else {
        set({ activeConversation: conversation.id });
      }

      return conversation.id;
    } catch (error) {
      console.error('Erreur startConversation:', error);
      throw error;
    }
  },

  sendBotMessage: async (message) => {
    const { messages, conversations, activeConversation } = get();
    if (!activeConversation) return;

    const currentUserId = useAuthStore.getState().user?.id;
    if (!currentUserId) {
      throw new Error('Utilisateur non connecté');
    }

    const botMessage: ChatMessage = {
      id: Date.now().toString(),
      senderId: BOT_ID,
      receiverId: currentUserId,
      content: message,
      type: 'text',
      timestamp: new Date(),
      read: false
    };

    const updatedMessages = {
      ...messages,
      [activeConversation]: [...(messages[activeConversation] || []), botMessage]
    };

    const updatedConversations = conversations.map(conv => 
      conv.id === activeConversation 
        ? { ...conv, lastMessage: botMessage, updatedAt: new Date(), unreadCount: conv.unreadCount + 1 }
        : conv
    );

    set({ 
      messages: updatedMessages,
      conversations: updatedConversations
    });
  },

  setOnlineUsers: (users) => {
    set({ onlineUsers: users });
  }
}));
import React, { useState, useEffect, useRef } from 'react';
import { 
  Send, 
  Paperclip, 
  Smile, 
  Phone, 
  Video, 
  MoreVertical, 
  Search,
  Star,
  Archive,
  Trash2,
  Flag,
  User,
  Circle,
  Check,
  CheckCheck,
  Clock,
  Shield,
  Crown,
  Filter,
  Plus,
  X
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Card } from '../ui/Card';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import useAuthStore from '../../store/authStore';
import { useNetworkingStore } from '../../store/networkingStore';
import { useChatStore } from '../../store/chatStore';
import { ChatMessage, ChatConversation } from '../../types';

// Extended interface for enhanced chat features
interface EnhancedChatMessage extends ChatMessage {
  reactions?: { emoji: string; userId: string; userName: string }[];
  isEncrypted?: boolean;
  attachments?: { 
    name: string; 
    url: string; 
    size: string; 
    type: string; 
  }[];
}

interface EnhancedChatConversation extends ChatConversation {
  participants: { id: string; name: string; avatar?: string; type: string; online: boolean }[];
  isPinned?: boolean;
  isArchived?: boolean;
  priority?: 'low' | 'normal' | 'high' | 'urgent';
}

export const EnhancedChatInterface: React.FC = () => {
  const { user } = useAuthStore();
  const { permissions } = useNetworkingStore();
  const { 
    conversations: chatConversations, 
    activeConversation: activeChatConversation,
    messages: chatMessages,
    isLoading: chatLoading,
    onlineUsers,
    fetchConversations,
    setActiveConversation: setChatActiveConversation,
    sendMessage: sendChatMessage,
    markAsRead,
    startConversation
  } = useChatStore();

  const [messageInput, setMessageInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'unread' | 'pinned' | 'archived'>('all');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isTyping, setIsTyping] = useState<Record<string, boolean>>({});
  const [enhancedFeatures, setEnhancedFeatures] = useState<Record<string, { isPinned: boolean; isArchived: boolean; priority: string }>>({});
  const isBotId = (participantId: string) => participantId === 'siports-bot';
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, activeChatConversation]);

  useEffect(() => {
    if (user) {
      fetchConversations();
    }
  }, [user, fetchConversations]);

  // Check permissions
  if (!permissions?.canSendMessages) {
    return (
      <Card className="p-8 text-center">
        <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Chat Non Disponible</h3>
        <p className="text-gray-600 mb-4">
          Votre forfait actuel ne permet pas d'utiliser le chat direct.
        </p>
        <Button variant="default">
          Mettre à Niveau Mon Forfait
        </Button>
      </Card>
    );
  }

  const handleSendMessage = async () => {
    if (!messageInput.trim() || !activeChatConversation || !user) return;

    // Check daily limits
    const remaining = useNetworkingStore.getState().getRemainingQuota();
    if (remaining.messages === 0) {
      toast.error('Limite quotidienne de messages atteinte. Revenez demain !');
      return;
    }

    try {
      await sendChatMessage(activeChatConversation, messageInput);
      setMessageInput('');
      
      // Update networking store usage
      useNetworkingStore.getState().handleMessage(
        `Utilisateur ${activeChatConversation}`, 
        'Conversation'
      );
      
      // Simulate typing indicator
      setIsTyping(prev => ({ ...prev, [activeChatConversation]: true }));
      setTimeout(() => {
        setIsTyping(prev => ({ ...prev, [activeChatConversation]: false }));
      }, 2000);

    } catch (error) {
      toast.error('Erreur lors de l\'envoi du message');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const addReaction = (messageId: string, emoji: string) => {
    if (!user || !activeChatConversation) return;

    // This would normally be handled by the backend
    // For now, we'll just show a toast
    toast.success(`Réaction ${emoji} ajoutée !`);
  };

  const togglePin = (conversationId: string) => {
    setEnhancedFeatures(prev => ({
      ...prev,
      [conversationId]: {
        ...prev[conversationId],
        isPinned: !prev[conversationId]?.isPinned
      }
    }));
  };

  const archiveConversation = (conversationId: string) => {
    setEnhancedFeatures(prev => ({
      ...prev,
      [conversationId]: {
        ...prev[conversationId],
        isArchived: !prev[conversationId]?.isArchived
      }
    }));
    
    if (activeChatConversation === conversationId) {
      const remainingConversations = chatConversations.filter(c => c.id !== conversationId);
      if (remainingConversations.length > 0) {
        setChatActiveConversation(remainingConversations[0].id);
      }
    }
  };

  const enhancedConversations = chatConversations.map(conv => ({
    ...conv,
    isPinned: enhancedFeatures[conv.id]?.isPinned || false,
    isArchived: enhancedFeatures[conv.id]?.isArchived || false,
    priority: enhancedFeatures[conv.id]?.priority || 'normal',
    participants: (conv.participants || []).map((participantId: string) => {
      // Map participant IDs to user info
      const isOnline = onlineUsers.includes(participantId);
      return {
        id: participantId,
          name: isBotId(participantId) ? 'Assistant SIB' : 
              participantId === 'user2' ? 'Contact Professionnel' : 
              `Utilisateur ${participantId.substring(0, 8)}`,
          avatar: isBotId(participantId) ? 
               'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=100' :
               undefined,
          type: isBotId(participantId) ? 'bot' : 
              participantId === 'user2' ? 'partner' : 'visitor',
        online: isOnline
      };
    })
  }));

  const filteredConversations = enhancedConversations.filter(conv => {
    if (selectedFilter === 'unread' && conv.unreadCount === 0) return false;
    if (selectedFilter === 'pinned' && !conv.isPinned) return false;
    if (selectedFilter === 'archived' && !conv.isArchived) return false;
    if (selectedFilter === 'all' && conv.isArchived) return false;
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return conv.participants.some(p => p.name.toLowerCase().includes(query)) ||
             conv.lastMessage?.content.toLowerCase().includes(query);
    }
    
    return true;
  });

  const activeConv = enhancedConversations.find(c => c.id === activeChatConversation);
  const activeMessages = activeChatConversation ? chatMessages[activeChatConversation] || [] : [];

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'text-red-600';
      case 'high': return 'text-orange-600';
      case 'normal': return 'text-gray-600';
      case 'low': return 'text-gray-400';
      default: return 'text-gray-600';
    }
  };

  const getUserTypeIcon = (userType: string) => {
    switch (userType) {
      case 'partner': return <Crown className="h-3 w-3 text-amber-500" />;
      case 'exhibitor': return <Star className="h-3 w-3 text-blue-500" />;
      case 'bot': return <Shield className="h-3 w-3 text-green-500" />;
      default: return <User className="h-3 w-3 text-gray-500" />;
    }
  };

  return (
    <div className="h-[500px] sm:h-[600px] md:h-[700px] bg-white rounded-lg shadow-lg overflow-hidden flex flex-col md:flex-row">
      {/* Conversations Sidebar */}
      <div className="w-full md:w-1/3 border-b md:border-b-0 md:border-r border-gray-200 flex flex-col max-h-[200px] md:max-h-none">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-gray-900">Messages</h2>
            <Button size="sm" variant="ghost">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>
          
          {/* Filters */}
          <div className="flex space-x-1 mt-3">
            {(['all', 'unread', 'pinned', 'archived'] as const).map((filter) => (
              <button
                key={filter}
                onClick={() => setSelectedFilter(filter)}
                className={`px-3 py-1 text-xs rounded-full transition-colors ${
                  selectedFilter === filter
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {filter === 'all' && 'Tous'}
                {filter === 'unread' && 'Non lus'}
                {filter === 'pinned' && 'Épinglés'}
                {filter === 'archived' && 'Archivés'}
              </button>
            ))}
          </div>
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto">
          {filteredConversations.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              <Search className="h-8 w-8 mx-auto mb-2 text-gray-400" />
              <p>Aucune conversation trouvée</p>
            </div>
          ) : (
            filteredConversations.map((conversation) => {
              const otherParticipant = conversation.participants.find((p: any) => p.id !== user?.id);
              if (!otherParticipant) return null;

              return (
                <motion.div
                  key={conversation.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                    activeChatConversation === conversation.id ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                  }`}
                  onClick={() => {
                    setChatActiveConversation(conversation.id);
                    markAsRead(conversation.id);
                  }}
                >
                  <div className="flex items-start space-x-3">
                    <div className="relative">
                      <img
                        src={otherParticipant.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(otherParticipant.name)}`}
                        alt={otherParticipant.name}
                        className="h-12 w-12 rounded-full object-cover"
                      />
                      <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
                        otherParticipant.online ? 'bg-green-500' : 'bg-gray-400'
                      }`} />
                      <div className="absolute -top-1 -right-1">
                        {getUserTypeIcon(otherParticipant.type)}
                      </div>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <h3 className="text-sm font-medium text-gray-900 truncate">
                            {otherParticipant.name}
                          </h3>
                          {conversation.isPinned && (
                            <Star className="h-3 w-3 text-yellow-500 fill-current" />
                          )}
                        </div>
                        <div className="flex items-center space-x-1">
                          {conversation.lastMessage?.isEncrypted && (
                            <Shield className="h-3 w-3 text-green-500" />
                          )}
                          <span className={`text-xs ${getPriorityColor(conversation.priority)}`}>
                            {formatTime(conversation.updatedAt)}
                          </span>
                        </div>
                      </div>
                      
                      <p className="text-sm text-gray-600 truncate mt-1">
                        {conversation.lastMessage?.content || 'Aucun message'}
                      </p>
                      
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center space-x-1">
                          {conversation.lastMessage?.reactions?.map((reaction, index) => (
                            <span key={`${reaction.emoji}-${index}`} className="text-xs">
                              {reaction.emoji}
                            </span>
                          ))}
                        </div>
                        {conversation.unreadCount > 0 && (
                          <Badge variant="default" className="bg-blue-600 text-white text-xs">
                            {conversation.unreadCount}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {activeConv ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-gray-200 bg-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {(() => {
                    const otherParticipant = (activeConv.participants || []).find(p => p.id !== user?.id);
                    return otherParticipant ? (
                      <>
                        <div className="relative">
                          <img
                            src={otherParticipant.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(otherParticipant.name)}`}
                            alt={otherParticipant.name}
                            className="h-10 w-10 rounded-full object-cover"
                          />
                          <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${
                            otherParticipant.online ? 'bg-green-500' : 'bg-gray-400'
                          }`} />
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900 flex items-center">
                            {otherParticipant.name}
                            <span className="ml-2">{getUserTypeIcon(otherParticipant.type)}</span>
                          </h3>
                          <p className="text-sm text-gray-500">
                            {otherParticipant.online ? 'En ligne' : 'Hors ligne'}
                            {activeChatConversation && isTyping[activeChatConversation] && ' • En train d\'écrire...'}
                          </p>
                        </div>
                      </>
                    ) : null;
                  })()}
                </div>
                
                <div className="flex items-center space-x-2">
                  <Button size="sm" variant="ghost">
                    <Phone className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="ghost">
                    <Video className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => activeChatConversation && togglePin(activeChatConversation)}>
                    <Star className={`h-4 w-4 ${activeConv?.isPinned ? 'text-yellow-500 fill-current' : ''}`} />
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => activeChatConversation && archiveConversation(activeChatConversation)}>
                    <Archive className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="ghost">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              <AnimatePresence>
                {activeMessages.map((message) => {
                  const isCurrentUser = message.senderId === user?.id;
                  return (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg relative group ${
                        isCurrentUser 
                          ? 'bg-blue-600 text-white rounded-br-none' 
                          : 'bg-gray-100 text-gray-900 rounded-bl-none'
                      }`}>
                        <p className="text-sm">{message.content}</p>
                        
                        {(message as any).attachments && (message as any).attachments.length > 0 && (
                          <div className="mt-2 space-y-1">
                            {(message as any).attachments.map((attachment: any, index: number) => (
                              <div key={`attachment-${attachment.name}-${index}`} className="flex items-center space-x-2 p-2 bg-white bg-opacity-20 rounded">
                                <Paperclip className="h-3 w-3" />
                                <span className="text-xs truncate">{attachment.name}</span>
                                <span className="text-xs opacity-75">({attachment.size})</span>
                              </div>
                            ))}
                          </div>
                        )}
                        
                        <div className="flex items-center justify-between mt-1">
                          <span className="text-xs opacity-75">
                            {formatTime(message.timestamp)}
                          </span>
                          <div className="flex items-center space-x-1">
                            {(message as any).isEncrypted && (
                              <Shield className="h-3 w-3 opacity-75" />
                            )}
                            {isCurrentUser && (
                              message.read ? <CheckCheck className="h-3 w-3" /> : <Check className="h-3 w-3" />
                            )}
                          </div>
                        </div>
                        
                        {/* Reactions (Enhanced feature) */}
                        {(message as any).reactions && (message as any).reactions.length > 0 && (
                          <div className="absolute -bottom-6 left-0 flex space-x-1">
                            {(message as any).reactions.map((reaction: any, index: number) => (
                              <span
                                key={`reaction-${reaction.emoji}-${reaction.userName}-${index}`}
                                className="bg-white border border-gray-200 rounded-full px-2 py-1 text-xs shadow-sm"
                                title={reaction.userName}
                              >
                                {reaction.emoji}
                              </span>
                            ))}
                          </div>
                        )}
                        
                        {/* Quick Reaction */}
                        <div className="absolute top-0 right-0 transform translate-x-8 opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="flex space-x-1">
                            {['👍', '❤️', '😊', '👏'].map((emoji) => (
                              <button
                                key={emoji}
                                onClick={() => addReaction(message.id, emoji)}
                                className="bg-white border border-gray-200 rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-gray-50 shadow-sm"
                              >
                                {emoji}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
              
              {activeChatConversation && isTyping[activeChatConversation] && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex justify-start"
                >
                  <div className="bg-gray-100 px-4 py-2 rounded-lg rounded-bl-none">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </motion.div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="p-4 border-t border-gray-200 bg-white">
              <div className="flex items-end space-x-2">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={() => {/* Handle file upload */}}
                  className="hidden"
                  multiple
                />
                
                <Button 
                  size="sm" 
                  variant="ghost"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Paperclip className="h-4 w-4" />
                </Button>
                
                <div className="flex-1 relative">
                  <textarea
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Tapez votre message..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    rows={1}
                    style={{ minHeight: '40px', maxHeight: '120px' }}
                  />
                </div>
                
                <Button 
                  size="sm" 
                  variant="ghost"
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                >
                  <Smile className="h-4 w-4" />
                </Button>
                
                <Button 
                  onClick={handleSendMessage}
                  disabled={!messageInput.trim()}
                  className="px-4 py-2"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
              
              {/* Usage Info */}
              <div className="mt-2 text-xs text-gray-500 text-center">
                Messages restants aujourd'hui : {useNetworkingStore.getState().getRemainingQuota().messages === -1 ? '∞' : useNetworkingStore.getState().getRemainingQuota().messages}
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="bg-gray-100 rounded-full p-6 w-24 h-24 mx-auto mb-4">
                <Send className="h-12 w-12 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Sélectionnez une conversation
              </h3>
              <p className="text-gray-600">
                Choisissez une conversation dans la liste pour commencer à discuter
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
import React, { useState, useEffect, useRef } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ROUTES } from '../../lib/routes';
import { toast } from 'sonner';
import {
  Send,
  Paperclip,
  Smile,
  Phone,
  Video,
  MoreVertical,
  MessageCircle,
  Bot,
  User,
  Circle,
  ArrowLeft,
  Plus,
  X,
  Search
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { useChatStore } from '../../store/chatStore';
import useAuthStore from '../../store/authStore';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../../lib/supabase';

export default function ChatInterface() {
  const [searchParams] = useSearchParams();
  const targetUserId = searchParams.get('userId');

  const {
    conversations,
    activeConversation,
    messages,
    isLoading,
    onlineUsers,
    fetchConversations,
    setActiveConversation,
    sendMessage,
    startConversation
  } = useChatStore();

  const { user: currentUser } = useAuthStore();

  const [messageInput, setMessageInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const handledTargetRef = useRef<string | null>(null);
  const [isCreatingConversation, setIsCreatingConversation] = useState(false);
  const [showNewConvModal, setShowNewConvModal] = useState(false);
  const [userSearch, setUserSearch] = useState('');
  const [userList, setUserList] = useState<Array<{id: string, name: string, type: string}>>([])
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [userNameCache, setUserNameCache] = useState<Record<string, string>>({});
  const isBotParticipant = (participants: string[]) => participants.includes('sib-bot');
  const isBotSender = (senderId: string) => senderId === 'sib-bot';

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  // Charger les noms des participants depuis Supabase
  useEffect(() => {
    const allParticipantIds = conversations
      .flatMap(c => c.participants)
      .filter(id => id !== 'sib-bot' && id !== currentUser?.id && !userNameCache[id]);
    const uniqueIds = [...new Set(allParticipantIds)];
    if (uniqueIds.length === 0) {return;}
    supabase!.from('users').select('id, name').in('id', uniqueIds).then(({ data }) => {
      if (data) {
        setUserNameCache(prev => ({
          ...prev,
          ...Object.fromEntries(data.map(u => [u.id, u.name]))
        }));
      }
    });
  }, [conversations, currentUser?.id]);

  // Auto-créer conversation si userId est en paramètre
  useEffect(() => {
    if (!targetUserId || isCreatingConversation) {return;}
    // Guard: ne traiter ce targetUserId qu'une seule fois pour éviter la boucle infinie
    // (setActiveConversation → markAsRead → new conversations ref → effet re-run)
    if (handledTargetRef.current === targetUserId) {return;}

    const existingConv = conversations.find(c => c.participants.includes(targetUserId));
    if (existingConv) {
      handledTargetRef.current = targetUserId;
      setActiveConversation(existingConv.id);
      return;
    }

    // Créer la conversation dès que le chargement initial est terminé
    if (!isLoading) {
      handledTargetRef.current = targetUserId;
      setIsCreatingConversation(true);
      startConversation(targetUserId)
        .then(convId => {
          if (convId) {
            setActiveConversation(convId);
            toast.success('Conversation créée ! Vous pouvez maintenant envoyer un message.');
          }
        })
        .catch(err => {
          console.error('Erreur création conversation:', err);
          toast.error('Impossible de créer la conversation');
        })
        .finally(() => setIsCreatingConversation(false));
    }
  }, [targetUserId, conversations, isCreatingConversation, isLoading, setActiveConversation, startConversation]);

  const loadUsers = async () => {
    setLoadingUsers(true);
    try {
      const { data } = await supabase!
        .from('users')
        .select('id, name, type')
        .in('type', ['exhibitor', 'partner', 'visitor'])
        .eq('status', 'active')
        .order('name');
      setUserList(data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleOpenNewConv = () => {
    setShowNewConvModal(true);
    loadUsers();
  };

  const handleStartConvWith = async (userId: string, userName: string) => {
    setShowNewConvModal(false);
    setIsCreatingConversation(true);
    try {
      const convId = await startConversation(userId);
      if (convId) {
        setActiveConversation(convId);
        toast.success(`Conversation démarrée avec ${userName}`);
      }
    } catch {
      toast.error('Impossible de créer la conversation');
    } finally {
      setIsCreatingConversation(false);
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, activeConversation]);

  const handleSendMessage = async () => {
    if (!messageInput.trim() || !activeConversation) {return;}
    await sendMessage(activeConversation, messageInput);
    setMessageInput('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const activeMessages = activeConversation ? messages[activeConversation] || [] : [];
  const activeConv = conversations.find(c => c.id === activeConversation);
  const filteredUsers = userList.filter(u =>
    u.name?.toLowerCase().includes(userSearch.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Modal nouvelle conversation */}
      <AnimatePresence>
        {showNewConvModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setShowNewConvModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Nouvelle conversation</h3>
                <button onClick={() => setShowNewConvModal(false)} className="text-gray-400 hover:text-gray-600">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Rechercher un utilisateur..."
                  value={userSearch}
                  onChange={e => setUserSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  autoFocus
                />
              </div>
              <div className="max-h-64 overflow-y-auto space-y-1">
                {loadingUsers ? (
                  <p className="text-center text-gray-500 text-sm py-4">Chargement...</p>
                ) : filteredUsers.length === 0 ? (
                  <p className="text-center text-gray-500 text-sm py-4">Aucun utilisateur trouvé</p>
                ) : (
                  filteredUsers.map(u => (
                    <button
                      key={u.id}
                      onClick={() => handleStartConvWith(u.id, u.name)}
                      className="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 text-left transition-colors"
                    >
                      <div className="h-9 w-9 bg-blue-100 rounded-full flex items-center justify-center">
                        <User className="h-4 w-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{u.name}</p>
                        <p className="text-xs text-gray-500 capitalize">{u.type}</p>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Bouton de retour */}
        <div className="mb-6">
          <Link to={ROUTES.DASHBOARD}>
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour au Tableau de Bord
            </Button>
          </Link>
        </div>

        <div className="space-y-6">
          <div className="flex flex-col md:flex-row h-auto md:h-[600px] bg-white rounded-lg shadow-lg overflow-hidden">
            {/* Conversations List */}
            <div className="w-full md:w-1/3 border-b md:border-b-0 md:border-r border-gray-200 flex flex-col max-h-[200px] md:max-h-none">
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">Messages</h3>
                  <button
                    onClick={handleOpenNewConv}
                    className="p-1.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                    title="Nouvelle conversation"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
                <div className="relative">
                  <input type="text"
                    placeholder="Rechercher une conversation..."
                    className="w-full pl-3 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                   aria-label="Rechercher une conversation..." />
                </div>
              </div>

              <div className="flex-1 overflow-y-auto">
                {isLoading ? (
                  <div className="p-4">
                    {[1, 2, 3].map(i => (
                      <div key={`skeleton-${i}`} className="animate-pulse mb-4">
                        <div className="flex items-center space-x-3">
                          <div className="h-10 w-10 bg-gray-200 rounded-full"></div>
                          <div className="flex-1">
                            <div className="h-4 bg-gray-200 rounded mb-1"></div>
                            <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : conversations.length === 0 ? (
                  <div className="p-8 text-center">
                    <MessageCircle className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 text-sm mb-2 font-medium">Aucune conversation</p>
                    <p className="text-gray-400 text-xs mb-4">
                      Commencez une nouvelle conversation en visitant le profil d'un exposant ou partenaire
                    </p>
                    <div className="flex flex-col gap-2">
                      <Link to={ROUTES.EXHIBITORS}>
                        <Button variant="outline" size="sm" className="w-full">
                          Voir les Exposants
                        </Button>
                      </Link>
                      <Link to={ROUTES.PARTNERS}>
                        <Button variant="outline" size="sm" className="w-full">
                          Voir les Partenaires
                        </Button>
                      </Link>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-1">
                    {conversations.map((conversation) => {
                      const isBot = isBotParticipant(conversation.participants);
                      const otherParticipant = isBot
                        ? 'Assistant SIB'
                        : (() => {
                            const otherId = conversation.participants.find(p => p !== currentUser?.id && p !== 'sib-bot');
                            return otherId ? (userNameCache[otherId] || `Utilisateur ${otherId.substring(0, 8)}`) : 'Inconnu';
                          })();
                      const isOnline = conversation.participants.some(p => onlineUsers.includes(p));

                      return (
                        <motion.div
                          key={conversation.id}
                          whileHover={{ backgroundColor: '#f9fafb' }}
                          onClick={() => setActiveConversation(conversation.id)}
                          className={`p-4 cursor-pointer border-b border-gray-100 ${
                            activeConversation === conversation.id ? 'bg-blue-50 border-blue-200' : ''
                          }`}
                        >
                          <div className="flex items-start space-x-3">
                            <div className="relative">
                              <div className="h-10 w-10 bg-gray-300 rounded-full flex items-center justify-center">
                                {isBot ? (
                                  <Bot className="h-5 w-5 text-blue-600" />
                                ) : (
                                  <User className="h-5 w-5 text-gray-600" />
                                )}
                              </div>
                              {isOnline && (
                                <Circle className="absolute -bottom-1 -right-1 h-3 w-3 text-green-500 fill-current" />
                              )}
                            </div>

                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <p className="text-sm font-medium text-gray-900 truncate">
                                  {otherParticipant}
                                </p>
                                {conversation.unreadCount > 0 && (
                                  <Badge variant="info" size="sm">
                                    {conversation.unreadCount}
                                  </Badge>
                                )}
                              </div>

                              {conversation.lastMessage && (
                                <div className="flex items-center justify-between mt-1">
                                  <p className="text-sm text-gray-600 truncate">
                                    {conversation.lastMessage.content}
                                  </p>
                                  <span className="text-xs text-gray-400">
                                    {formatTime(conversation.lastMessage.timestamp)}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 flex flex-col">
              {activeConversation ? (
                <>
                  {/* Chat Header */}
                  <div className="p-4 border-b border-gray-200 bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="h-10 w-10 bg-gray-300 rounded-full flex items-center justify-center">
                          {activeConv?.participants && isBotParticipant(activeConv.participants) ? (
                            <Bot className="h-5 w-5 text-blue-600" />
                          ) : (
                            <User className="h-5 w-5 text-gray-600" />
                          )}
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">
                            {activeConv?.participants && isBotParticipant(activeConv.participants)
                            ? 'Assistant SIB'
                            : (() => {
                                const otherId = activeConv?.participants.find(p => p !== currentUser?.id && p !== 'sib-bot');
                                return otherId ? (userNameCache[otherId] || `Utilisateur ${otherId.substring(0, 8)}`) : 'Inconnu';
                              })()}
                          </h4>
                          <p className="text-sm text-gray-500">
                            {onlineUsers.includes(activeConv?.participants[1] || '') ? 'En ligne' : 'Hors ligne'}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Button variant="ghost" size="sm" title="Appel vocal">
                          <Phone className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" title="Appel vidéo">
                          <Video className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" title="Options">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    <AnimatePresence>
                      {activeMessages.map((message) => {
                        const isBot = isBotSender(message.senderId);
                        const isCurrentUser = message.senderId === currentUser?.id;

                        return (
                          <motion.div
                            key={message.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
                          >
                            <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                              isCurrentUser
                                ? 'bg-blue-600 text-white'
                                : isBot
                                ? 'bg-green-100 text-green-800 border border-green-200'
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              <p className="text-sm">{message.content}</p>
                              <p className={`text-xs mt-1 ${
                                isCurrentUser ? 'text-blue-100' : 'text-gray-500'
                              }`}>
                                {formatTime(message.timestamp)}
                              </p>
                            </div>
                          </motion.div>
                        );
                      })}
                    </AnimatePresence>
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Message Input */}
                  <div className="p-4 border-t border-gray-200">
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          const input = document.createElement('input');
                          input.type = 'file';
                          input.accept = 'image/*,application/pdf,.doc,.docx,.txt';
                          input.multiple = true;
                          input.onchange = (e) => {
                            const files = (e.target as HTMLInputElement).files;
                            if (files && files.length > 0) {
                              // Traiter les fichiers sélectionnés
                              Array.from(files).forEach(file => {
                                // Ici vous pouvez ajouter la logique pour uploader les fichiers
                              });

                              // Afficher un message de confirmation
                              const fileNames = Array.from(files).map(f => f.name).join(', ');
                              toast.success(`${files.length} fichier(s) sélectionné(s): ${fileNames}\n\nUpload en cours...`);
                            }
                          };
                          input.click();
                        }}
                        title="Joindre un fichier"
                      >
                        <Paperclip className="h-4 w-4" />
                      </Button>

                      <div className="flex-1 relative">
                        <input
                          type="text"
                          value={messageInput}
                          onChange={(e) => setMessageInput(e.target.value)}
                          onKeyPress={handleKeyPress}
                          placeholder="Tapez votre message..."
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          const emojis = ['😊', '👍', '❤️', '😂', '🎉', '👏', '🔥', '💯', '🙌', '✨', '💪', '🎯', '🚀', '💡', '⭐'];
                          const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];
                          setMessageInput(prev => prev + randomEmoji);
                        }}
                        title="Ajouter un emoji"
                      >
                        <Smile className="h-4 w-4" />
                      </Button>

                      <Button variant="default" onClick={handleSendMessage} disabled={!messageInput.trim()}>
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center">
                    <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Sélectionnez une conversation
                    </h3>
                    <p className="text-gray-600">
                      Choisissez une conversation pour commencer à échanger
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MessageCircle,
  Send,
  X,
  Bot,
  User,
  Minimize2,
  Maximize2,
  Calendar,
  Building2,
  Users,
  Globe,
  CheckCircle,
  ArrowRight,
  TrendingUp,
  FileText,
  Target,
  Heart
} from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { motion, AnimatePresence } from 'framer-motion';
import useAuthStore from '../../store/authStore';
import { ROUTES } from '../../lib/routes';
import { toast } from 'sonner';
import { useTranslation } from '../../hooks/useTranslation';

interface ChatMessage {
  id: string;
  content: string;
  isBot: boolean;
  timestamp: Date;
  type?: 'text' | 'quick_reply' | 'suggestion' | 'action';
  quickReplies?: string[];
  suggestions?: Array<{
    title: string;
    description: string;
    action: string;
    icon: React.ComponentType<{ className?: string }>;
  }>;
}

interface ChatBotProps {
  isOpen: boolean;
  onToggle: () => void;
}

export const ChatBot: React.FC<ChatBotProps> = ({ isOpen, onToggle }) => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();
  const { t } = useTranslation();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialiser la conversation
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      // Messages d'accueil selon le type d'utilisateur
      const getWelcomeMessage = () => {
        if (!isAuthenticated) {
          return {
            content: t('chatbot.welcome_guest'),
            quickReplies: [t('chatbot.qr_login'), t('chatbot.qr_discover'), t('chatbot.qr_exhibitors'), t('chatbot.qr_program')]
          };
        }

        const userType = user?.type;
        const firstName = user?.profile?.firstName || t('chatbot.default_name');

        switch (userType) {
          case 'admin':
            return {
              content: t('chatbot.welcome_admin', { firstName }),
              quickReplies: [t('chatbot.qr_metrics'), t('chatbot.qr_pending'), t('chatbot.qr_moderation'), t('chatbot.qr_stats')]
            };
          case 'exhibitor':
            return {
              content: t('chatbot.welcome_exhibitor', { firstName }),
              quickReplies: [t('chatbot.qr_optimize'), t('chatbot.qr_manage_rdv'), t('chatbot.qr_edit_minisite'), t('chatbot.qr_my_stats')]
            };
          case 'partner':
            return {
              content: t('chatbot.welcome_partner', { firstName }),
              quickReplies: [t('chatbot.qr_roi'), t('chatbot.qr_sponsored'), t('chatbot.qr_vip_network'), t('chatbot.qr_impact')]
            };
          case 'visitor':
            return {
              content: t('chatbot.welcome_visitor', { firstName }),
              quickReplies: [t('chatbot.qr_plan_visit'), t('chatbot.qr_recommendations'), t('chatbot.qr_my_rdv'), t('chatbot.qr_custom_program')]
            };
          default:
            return {
              content: t('chatbot.welcome_default', { firstName }),
              quickReplies: [t('chatbot.qr_nav_help'), t('chatbot.qr_salon_info'), t('chatbot.qr_support'), t('chatbot.qr_contact')]
            };
        }
      };

      const welcomeMsg = getWelcomeMessage();
      const initialMessage: ChatMessage = {
        id: '1',
        content: welcomeMsg.content,
        isBot: true,
        timestamp: new Date(),
        type: 'quick_reply',
        quickReplies: welcomeMsg.quickReplies
      };
      setMessages([initialMessage]);
    }
  }, [isOpen, isAuthenticated, user, messages.length]);

  // Auto-scroll vers le bas
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  // Réponses automatiques du bot
  const getBotResponse = (userMessage: string): ChatMessage => {
    const message = userMessage.toLowerCase();
    const timestamp = new Date();
    const userType = user?.type || 'visitor';
    const firstName = user?.profile?.firstName || 'cher utilisateur';

    // Réponses selon l'authentification
    if (!isAuthenticated) {
      if (message.includes('connecter') || message.includes('connexion')) {
        return {
          id: Date.now().toString(),
          content: t('chatbot.resp_login'),
          isBot: true,
          timestamp,
          type: 'suggestion',
          suggestions: [
            {
              title: t('chatbot.sugg_login_page'),
              description: t('chatbot.sugg_login_desc'),
              action: "/login",
              icon: User
            }
          ]
        };
      }

      if (message.includes('exposant') || message.includes('entreprise')) {
        return {
          id: Date.now().toString(),
          content: t('chatbot.resp_exhibitors_guest'),
          isBot: true,
          timestamp,
          type: 'suggestion',
          suggestions: [
            {
              title: t('chatbot.sugg_view_exhibitors'),
              description: t('chatbot.sugg_view_exhibitors_desc'),
              action: "/exhibitors",
              icon: Building2
            },
            {
              title: t('chatbot.sugg_register'),
              description: t('chatbot.sugg_register_desc'),
              action: "/register",
              icon: User
            }
          ]
        };
      }

      if (message.includes('salon') || message.includes('SIB') || message.includes('information')) {
        return {
          id: Date.now().toString(),
          content: t('chatbot.resp_salon_info_guest'),
          isBot: true,
          timestamp,
          type: 'quick_reply',
          quickReplies: [t('chatbot.qr_see_program'), t('chatbot.qr_exhibitors_list'), t('chatbot.qr_register'), t('chatbot.qr_practical_info')]
        };
      }

      if (message.includes('programme') || message.includes('événement')) {
        return {
          id: Date.now().toString(),
          content: t('chatbot.resp_program_guest'),
          isBot: true,
          timestamp,
          type: 'suggestion',
          suggestions: [
            {
              title: t('chatbot.sugg_full_program'),
              description: t('chatbot.sugg_full_program_desc'),
              action: "/events",
              icon: Calendar
            }
          ]
        };
      }

      return {
        id: Date.now().toString(),
        content: t('chatbot.welcome_guest'),
        isBot: true,
        timestamp,
        type: 'quick_reply',
        quickReplies: [t('chatbot.qr_login'), t('chatbot.qr_salon_info'), t('chatbot.qr_exhibitors'), t('chatbot.qr_program_events')]
      };
    }

    // Réponses pour utilisateurs connectés

    // Réponses communes
    if (message.includes('salon') || message.includes('SIB') || message.includes('information')) {
      return {
        id: Date.now().toString(),
        content: t('chatbot.resp_salon_info', { firstName }),
        isBot: true,
        timestamp,
        type: 'suggestion',
        suggestions: [
          {
            title: t('chatbot.sugg_full_program'),
            description: t('chatbot.sugg_full_program_desc'),
            action: "/events",
            icon: Calendar
          },
          {
            title: t('chatbot.sugg_salon_map'),
            description: t('chatbot.sugg_salon_map_desc'),
            action: "/pavilions",
            icon: Globe
          }
        ]
      };
    }

    if (message.includes('rendez-vous') || message.includes('rdv') || message.includes('appointment')) {
      const rdvText = userType === 'visitor'
        ? "vous pouvez programmer des RDV B2B garantis avec les exposants"
        : "En tant qu'exposant, vous pouvez créer des créneaux pour recevoir des visiteurs";

      return {
        id: Date.now().toString(),
        content: `📅 ${firstName}, ${rdvText}. Je peux vous aider à optimiser votre planning !`,
        isBot: true,
        timestamp,
        type: 'suggestion',
        suggestions: [
          {
            title: userType === 'visitor' ? "Demander un RDV" : "Créer un créneau",
            description: userType === 'visitor' ? "Avec un exposant" : "Pour recevoir des visiteurs",
            action: "/appointments",
            icon: Calendar
          },
          {
            title: "Mes rendez-vous",
            description: "Voir mon planning",
            action: "/appointments",
            icon: Calendar
          }
        ]
      };
    }

    if (message.includes('réseautage') || message.includes('networking') || message.includes('contact')) {
      return {
        id: Date.now().toString(),
        content: t('chatbot.resp_networking', { firstName, networkingTip: userType === 'visitor' ? t('chatbot.networking_visitor') : t('chatbot.networking_exhibitor') }),
        isBot: true,
        timestamp,
        type: 'suggestion',
        suggestions: [
          {
            title: t('chatbot.sugg_ai_network'),
            description: t('chatbot.sugg_ai_network_desc'),
            action: "/networking",
            icon: Users
          },
          {
            title: t('chatbot.sugg_messages'),
            description: t('chatbot.sugg_messages_desc'),
            action: "/messages",
            icon: MessageCircle
          }
        ]
      };
    }

    if (message.includes('aide') || message.includes('help') || message.includes('support')) {
      let userRole: string;
      if (userType === 'admin') { userRole = t('chatbot.role_admin'); }
      else if (userType === 'exhibitor') { userRole = t('chatbot.role_exhibitor'); }
      else if (userType === 'partner') { userRole = t('chatbot.role_partner'); }
      else { userRole = t('chatbot.role_visitor'); }
      return {
        id: Date.now().toString(),
        content: t('chatbot.resp_help', { firstName, userRole }),
        isBot: true,
        timestamp,
        type: 'quick_reply',
        quickReplies: [t('chatbot.qr_nav'), t('chatbot.qr_profile'), t('chatbot.qr_rdv_system'), t('chatbot.qr_ai_network'), t('chatbot.qr_tech_support')]
      };
    }
    // Réponses spécifiques par type d'utilisateur
    switch (userType) {
      case 'admin':
        if (message.includes('métrique') || message.includes('statistique') || message.includes('performance')) {
          return {
            id: Date.now().toString(),
            content: t('chatbot.resp_admin_metrics', { firstName }),
            isBot: true,
            timestamp,
            type: 'suggestion',
            suggestions: [
              {
                title: t('chatbot.sugg_full_metrics'),
                description: t('chatbot.sugg_full_metrics_desc'),
                action: "/metrics",
                icon: TrendingUp
              },
              {
                title: t('chatbot.sugg_validation'),
                description: t('chatbot.sugg_validation_desc'),
                action: "/admin/validation",
                icon: CheckCircle
              }
            ]
          };
        }

        if (message.includes('validation') || message.includes('compte') || message.includes('modération')) {
          return {
            id: Date.now().toString(),
            content: t('chatbot.resp_admin_validation', { firstName }),
            isBot: true,
            timestamp,
            type: 'suggestion',
            suggestions: [
              {
                title: t('chatbot.sugg_validation'),
                description: t('chatbot.sugg_validation_pending'),
                action: "/admin/validation",
                icon: CheckCircle
              },
              {
                title: t('chatbot.sugg_moderation'),
                description: t('chatbot.sugg_moderation_desc'),
                action: "/admin/moderation",
                icon: FileText
              }
            ]
          };
        }
        break;

      case 'exhibitor':
        if (message.includes('stand') || message.includes('mini-site') || message.includes('optimiser')) {
          return {
            id: Date.now().toString(),
            content: t('chatbot.resp_exhibitor_stand', { firstName }),
            isBot: true,
            timestamp,
            type: 'suggestion',
            suggestions: [
              {
                title: t('chatbot.sugg_edit_minisite'),
                description: t('chatbot.sugg_edit_minisite_desc'),
                action: "/minisite/editor",
                icon: Building2
              },
              {
                title: t('chatbot.sugg_my_stats'),
                description: t('chatbot.sugg_my_stats_desc'),
                action: "/dashboard",
                icon: TrendingUp
              }
            ]
          };
        }

        if (message.includes('statistique') || message.includes('performance') || message.includes('vue')) {
          return {
            id: Date.now().toString(),
            content: t('chatbot.resp_exhibitor_stats', { firstName }),
            isBot: true,
            timestamp,
            type: 'suggestion',
            suggestions: [
              {
                title: t('chatbot.sugg_dashboard'),
                description: t('chatbot.sugg_dashboard_desc'),
                action: "/dashboard",
                icon: TrendingUp
              },
              {
                title: t('chatbot.sugg_my_rdv'),
                description: t('chatbot.sugg_manage_rdv_desc'),
                action: "/appointments",
                icon: Calendar
              }
            ]
          };
        }
        break;

      case 'partner':
        if (message.includes('partenariat') || message.includes('roi') || message.includes('impact')) {
          return {
            id: Date.now().toString(),
            content: t('chatbot.resp_partner_roi', { firstName }),
            isBot: true,
            timestamp,
            type: 'suggestion',
            suggestions: [
              {
                title: t('chatbot.sugg_roi_detail'),
                description: t('chatbot.sugg_roi_detail_desc'),
                action: "/dashboard",
                icon: TrendingUp
              },
              {
                title: t('chatbot.sugg_vip_network'),
                description: t('chatbot.sugg_vip_network_desc'),
                action: "/networking",
                icon: Users
              }
            ]
          };
        }
        break;

      case 'visitor':
        if (message.includes('visite') || message.includes('planifier') || message.includes('programme')) {
          return {
            id: Date.now().toString(),
            content: t('chatbot.resp_visitor_plan', { firstName }),
            isBot: true,
            timestamp,
            type: 'suggestion',
            suggestions: [
              {
                title: t('chatbot.sugg_my_agenda'),
                description: t('chatbot.sugg_my_agenda_desc'),
                action: "/visitor/dashboard",
                icon: Calendar
              },
              {
                title: t('chatbot.sugg_recommended_exhibitors'),
                description: t('chatbot.sugg_recommended_exhibitors_desc'),
                action: "/exhibitors",
                icon: Target
              }
            ]
          };
        }

        if (message.includes('exposant') || message.includes('recommandation') || message.includes('contact')) {
          return {
            id: Date.now().toString(),
            content: t('chatbot.resp_visitor_recommendations', { firstName }),
            isBot: true,
            timestamp,
            type: 'suggestion',
            suggestions: [
              {
                title: t('chatbot.sugg_ai_recommendations'),
                description: t('chatbot.sugg_ai_recommendations_desc'),
                action: "/networking",
                icon: Target
              },
              {
                title: t('chatbot.sugg_favorites'),
                description: t('chatbot.sugg_favorites_desc'),
                action: "/visitor/dashboard",
                icon: Heart
              }
            ]
          };
        }
        break;
    }

    // Réponses par défaut selon le type d'utilisateur
    const getDefaultResponse = () => {
      switch (userType) {
        case 'admin':
          return {
            content: t('chatbot.default_admin', { firstName }),
            suggestions: [
              { title: t('chatbot.sugg_sys_metrics'), description: t('chatbot.sugg_sys_metrics_desc'), action: "/metrics", icon: TrendingUp },
              { title: t('chatbot.sugg_validation'), description: t('chatbot.sugg_validation_pending'), action: "/admin/validation", icon: CheckCircle },
              { title: t('chatbot.sugg_user_mgmt'), description: t('chatbot.sugg_user_mgmt_desc'), action: "/admin/users", icon: Users }
            ]
          };
        case 'exhibitor':
          return {
            content: t('chatbot.default_exhibitor', { firstName }),
            suggestions: [
              { title: t('chatbot.sugg_minisite'), description: t('chatbot.sugg_minisite_views'), action: "/minisite/editor", icon: Building2 },
              { title: t('chatbot.sugg_my_rdv_short'), description: t('chatbot.sugg_manage_planning'), action: "/appointments", icon: Calendar },
              { title: t('chatbot.sugg_my_stats'), description: t('chatbot.sugg_stand_perf'), action: "/dashboard", icon: TrendingUp }
            ]
          };
        case 'partner':
          return {
            content: t('chatbot.default_partner', { firstName }),
            suggestions: [
              { title: t('chatbot.sugg_roi_short'), description: t('chatbot.sugg_roi_return'), action: "/dashboard", icon: TrendingUp },
              { title: t('chatbot.sugg_sponsored_events'), description: t('chatbot.sugg_sponsored_events_desc'), action: "/events", icon: Calendar },
              { title: t('chatbot.sugg_vip_network'), description: t('chatbot.sugg_vip_access'), action: "/networking", icon: Users }
            ]
          };
        case 'visitor':
          return {
            content: t('chatbot.default_visitor', { firstName }),
            suggestions: [
              { title: t('chatbot.sugg_plan_visit'), description: t('chatbot.sugg_personal_agenda'), action: "/visitor/dashboard", icon: Calendar },
              { title: t('chatbot.sugg_recommendations_short'), description: t('chatbot.sugg_exhibitors_for_you'), action: "/networking", icon: Target },
              { title: t('chatbot.sugg_my_rdv'), description: t('chatbot.sugg_rdv_programmed'), action: "/appointments", icon: Calendar }
            ]
          };
        default:
          return {
            content: t('chatbot.default_generic', { firstName }),
            suggestions: [
              { title: t('chatbot.sugg_salon_info'), description: t('chatbot.sugg_salon_info_desc'), action: "/", icon: Globe },
              { title: t('chatbot.sugg_view_exhibitors'), description: t('chatbot.sugg_exhibitors_count'), action: "/exhibitors", icon: Building2 },
              { title: t('chatbot.sugg_events_program'), description: t('chatbot.sugg_events_count'), action: "/events", icon: Calendar }
            ]
          };
      }
    };

    const defaultResponse = getDefaultResponse();

    return {
      id: Date.now().toString(),
      content: defaultResponse.content,
      isBot: true,
      timestamp,
      type: 'suggestion',
      suggestions: defaultResponse.suggestions
    };
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) {return;}

    // Ajouter le message de l'utilisateur
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content: inputMessage,
      isBot: false,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    // Simuler le temps de réponse du bot
    setTimeout(() => {
      const botResponse = getBotResponse(inputMessage);
      setMessages(prev => [...prev, botResponse]);
      setIsTyping(false);
    }, 1000 + Math.random() * 1000);
  };

  const handleQuickReply = (reply: string) => {
    // Ajouter le message de l'utilisateur
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content: reply,
      isBot: false,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setIsTyping(true);

    // Générer la réponse du bot
    setTimeout(() => {
      const botResponse = getBotResponse(reply);
      setMessages(prev => [...prev, botResponse]);
      setIsTyping(false);
    }, 800);
  };

  const handleSuggestionClick = (action: string) => {
    if (action.startsWith('/')) {
      // Vérifier l'authentification pour les pages protégées
      if (action === '/appointments' && !isAuthenticated) {
        // Rediriger vers la page de connexion avec retour vers les RDV
        navigate(`${ROUTES.LOGIN}?redirect=${encodeURIComponent(ROUTES.APPOINTMENTS)}`);
        return;
      }

      // Navigation interne
      navigate(action);
    } else {
      // Action personnalisée
      const actionMessages = {
        'info_salon': t('chatbot.action_info_salon'),
        'support': t('chatbot.action_support'),
        'contact_commercial': t('chatbot.action_contact_commercial')
      };

      const message = actionMessages[action as keyof typeof actionMessages] || `💬 Action: ${action}`;
      toast(message);
    }
  };

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  if (!isOpen) {return null;}

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.8, y: 20 }}
      className={`fixed bottom-4 right-4 z-[9998] ${
        isMinimized ? 'w-80 h-16' : 'w-80 h-96'
      } transition-all duration-300`}
    >
      <Card className="h-full flex flex-col shadow-2xl border-blue-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-4 rounded-t-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-white bg-opacity-20 p-2 rounded-full">
                <Bot className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold">{t('chatbot.header_title')}</h3>
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                  <span className="text-xs opacity-90">{t('chatbot.header_status')}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="p-2 min-w-[44px] min-h-[44px] flex items-center justify-center hover:bg-white hover:bg-opacity-20 rounded transition-colors"
              >
                {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
              </button>
              <button aria-label="Close"
                onClick={onToggle}
                className="p-2 min-w-[44px] min-h-[44px] flex items-center justify-center hover:bg-white hover:bg-opacity-20 rounded transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {!isMinimized && (
          <>
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
              <AnimatePresence>
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${message.isBot ? 'justify-start' : 'justify-end'}`}
                  >
                    <div className={`max-w-xs ${
                      message.isBot
                        ? 'bg-white border border-gray-200'
                        : 'bg-blue-600 text-white'
                    } rounded-lg p-3 shadow-sm`}>
                      <p className="text-sm">{message.content}</p>
                      <p className={`text-xs mt-1 ${
                        message.isBot ? 'text-gray-500' : 'text-blue-100'
                      }`}>
                        {formatTime(message.timestamp)}
                      </p>

                      {/* Quick Replies */}
                      {message.quickReplies && (
                        <div className="mt-3 space-y-1">
                          {message.quickReplies.map((reply) => (
                            <button
                              key={reply}
                              onClick={() => handleQuickReply(reply)}
                              className="block w-full text-left px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-xs transition-colors"
                            >
                              {reply}
                            </button>
                          ))}
                        </div>
                      )}

                      {/* Suggestions */}
                      {message.suggestions && (
                        <div className="mt-3 space-y-2">
                          {message.suggestions.map((suggestion) => (
                            <button
                              key={suggestion.title}
                              onClick={() => handleSuggestionClick(suggestion.action)}
                              className="flex items-center space-x-2 w-full p-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-xs transition-colors"
                            >
                              <suggestion.icon className="h-4 w-4" />
                              <div className="text-left">
                                <div className="font-medium">{suggestion.title}</div>
                                <div className="text-blue-600">{suggestion.description}</div>
                              </div>
                              <ArrowRight className="h-3 w-3 ml-auto" />
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {/* Typing indicator */}
              {isTyping && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex justify-start"
                >
                  <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm">
                    <div className="flex items-center space-x-1">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                      <span className="text-xs text-gray-500 ml-2">{t('chatbot.typing_indicator')}</span>
                    </div>
                  </div>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-gray-200 bg-white rounded-b-lg">
              <div className="flex items-center space-x-2">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder={t('chatbot.input_placeholder')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>

                <Button
                  variant="default"
                  onClick={handleSendMessage}
                  disabled={!inputMessage.trim() || isTyping}
                  size="sm"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>

              {/* Suggestions rapides */}
              <div className="mt-2 flex flex-wrap gap-1">
                {[
                  t('chatbot.qr_nav_help'),
                  t('chatbot.qr_my_stats'),
                  t('chatbot.qr_support'),
                  t('chatbot.qr_practical_info')
                ].map((suggestion) => (
                  <button
                    key={suggestion}
                    onClick={() => handleQuickReply(suggestion)}
                    className="px-2 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded text-xs transition-colors"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}
      </Card>
    </motion.div>
  );
};

import { create } from 'zustand';

interface ChatBotMessage {
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
    icon: string;
  }>;
}

interface ChatBotState {
  messages: ChatBotMessage[];
  isOpen: boolean;
  isTyping: boolean;
  conversationId: string | null;
  userPreferences: {
    language: 'fr' | 'en';
    notifications: boolean;
    soundEnabled: boolean;
  };

  // Actions
  addMessage: (message: Omit<ChatBotMessage, 'id' | 'timestamp'>) => void;
  clearMessages: () => void;
  setTyping: (typing: boolean) => void;
  setOpen: (open: boolean) => void;
  updatePreferences: (preferences: Partial<ChatBotState['userPreferences']>) => void;
  generateBotResponse: (userMessage: string, userType?: string) => ChatBotMessage;
  getContextualResponses: (message: string, userType: string) => any;
}

export const useChatBotStore = create<ChatBotState>((set, get) => ({
  messages: [],
  isOpen: false,
  isTyping: false,
  conversationId: null,
  userPreferences: {
    language: 'fr',
    notifications: true,
    soundEnabled: true
  },

  addMessage: (message) => {
    const newMessage: ChatBotMessage = {
      ...message,
      id: Date.now().toString(),
      timestamp: new Date()
    };

    set(state => ({
      messages: [...state.messages, newMessage]
    }));
  },

  clearMessages: () => {
    set({ messages: [] });
  },

  setTyping: (typing) => {
    set({ isTyping: typing });
  },

  setOpen: (open) => {
    set({ isOpen: open });
  },

  updatePreferences: (preferences) => {
    set(state => ({
      userPreferences: { ...state.userPreferences, ...preferences }
    }));
  },

  generateBotResponse: (userMessage, userType = 'visitor') => {
    const message = userMessage.toLowerCase();
    const responses = get().getContextualResponses(message, userType);

    return {
      id: Date.now().toString(),
      content: responses.content,
      isBot: true,
      timestamp: new Date(),
      type: responses.type,
      quickReplies: responses.quickReplies,
      suggestions: responses.suggestions
    };
  },

  // Méthode helper pour générer des réponses contextuelles
  getContextualResponses: (message: string, userType: string) => {
    // Réponses par mots-clés
    if (message.includes('exposant') || message.includes('entreprise')) {
      return {
        content: `🏢 SIB 2026 accueille de nombreux exposants internationaux répartis dans différents pavillons thématiques. Voulez-vous explorer un pavillon spécifique ?`,
        type: 'suggestion',
        suggestions: [
          { title: "Voir tous les exposants", description: "Liste complète", action: "/exhibitors", icon: "Building2" },
          { title: "Pavillons thématiques", description: "Explorer par secteur", action: "/pavilions", icon: "Globe" }
        ]
      };
    }

    if (message.includes('événement') || message.includes('conférence') || message.includes('programme')) {
      return {
        content: `📅 Le programme SIB comprend de nombreuses conférences, ateliers et sessions de networking. Quel type d'événement vous intéresse ?`,
        type: 'quick_reply',
        quickReplies: ["Conférences techniques", "Ateliers pratiques", "Sessions networking", "Webinaires"]
      };
    }

    if (message.includes('rendez-vous') || message.includes('rdv')) {
      const rdvText = userType === 'visitor'
        ? "Vous pouvez programmer des RDV B2B avec les exposants"
        : "Vous pouvez créer des créneaux pour recevoir des visiteurs";

      return {
        content: `📅 ${rdvText}. Je peux vous aider à optimiser votre planning !`,
        type: 'suggestion',
        suggestions: [
          { title: "Mon calendrier", description: "Voir mes RDV", action: "/appointments", icon: "Calendar" },
          { title: "Planifier un RDV", description: "Nouveau rendez-vous", action: "/appointments", icon: "Plus" }
        ]
      };
    }

    if (message.includes('aide') || message.includes('help') || message.includes('support')) {
      return {
        content: "🆘 Je suis là pour vous aider ! Voici les principales fonctionnalités que je peux vous expliquer :",
        type: 'quick_reply',
        quickReplies: ["Navigation du site", "Gestion du profil", "Système de RDV", "Réseautage IA", "Support technique"]
      };
    }

    // Réponse par défaut
    return {
      content: "🤖 Je comprends votre question ! Voici comment je peux vous aider avec SIB 2026 :",
      type: 'suggestion',
      suggestions: [
        { title: "Informations salon", description: "Dates, lieu, programme", action: "info_salon", icon: "Info" },
        { title: "Mon tableau de bord", description: "Accéder à mon espace", action: "/dashboard", icon: "BarChart3" },
        { title: "Support technique", description: "Aide et assistance", action: "support", icon: "HelpCircle" }
      ]
    };
  }
}));
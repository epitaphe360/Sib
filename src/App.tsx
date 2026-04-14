import React, { Suspense } from 'react';
import { Toaster } from 'sonner';
import { lazyRetry } from './utils/lazyRetry';
import { Routes, Route, Link, Navigate } from 'react-router-dom';
import { usePageTracking } from './hooks/usePageTracking';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { SkipToContent } from './components/common/SkipToContent';
import { ScrollToTop } from './components/common/ScrollToTop';

// Lazy load pages
const HomePage = lazyRetry(() => import('./pages/HomePage'));
const ExhibitorsPage = lazyRetry(() => import('./pages/ExhibitorsPage'));
const NetworkingPage = lazyRetry(() => import('./pages/NetworkingPage'));
const InteractionHistoryPage = lazyRetry(() => import('./pages/networking/InteractionHistoryPage'));
const NetworkingRoomsPage = lazyRetry(() => import('./pages/networking/NetworkingRoomsPage'));
const SpeedNetworkingPage = lazyRetry(() => import('./pages/networking/SpeedNetworkingPage'));
const LoginPage = lazyRetry(() => import('./components/auth/LoginPage'));
const DemoAccountsPage = lazyRetry(() => import('./pages/DemoAccountsPage'));
const RegisterPage = lazyRetry(() => import('./components/auth/RegisterPage'));
const ForgotPasswordPage = lazyRetry(() => import('./pages/ForgotPasswordPage'));
const ProfilePage = lazyRetry(() => import('./components/profile/ProfilePage'));
const DashboardPage = lazyRetry(() => import('./components/dashboard/DashboardPage'));
const EventsPage = lazyRetry(() => import('./components/events/EventsPage'));
const ChatInterface = lazyRetry(() => import('./components/chat/ChatInterface'));
const AppointmentCalendar = lazyRetry(() => import('./components/appointments/AppointmentCalendar'));
const MiniSitePreview = lazyRetry(() => import('./components/minisite/MiniSitePreviewSimple'));
const MiniSiteDirectory = lazyRetry(() => import('./components/minisite/MiniSiteDirectory'));
const MiniSiteListPage = lazyRetry(() => import('./pages/MiniSiteListPage'));
const MiniSiteCreationPage = lazyRetry(() => import('./pages/MiniSiteCreationPage'));
const ExhibitorDetailPage = lazyRetry(() => import('./pages/ExhibitorDetailPage'));
const ProfileEdit = lazyRetry(() => import('./pages/exhibitor/ProfileEdit'));
const ActivityPage = lazyRetry(() => import('./pages/admin/ActivityPage'));
const ResetPasswordPage = lazyRetry(() => import('./pages/ResetPasswordPage'));
const PartnersPage = lazyRetry(() => import('./pages/PartnersPage'));
const PartnerDetailPage = lazyRetry(() => import('./pages/PartnerDetailPage'));
const PavillonsPage = lazyRetry(() => import('./components/pavilions/PavillonsPage'));
const MetricsPage = lazyRetry(() => import('./components/metrics/MetricsPage'));
const DetailedProfilePage = lazyRetry(() => import('./components/profile/DetailedProfilePage'));
const ProfileMatchingPage = lazyRetry(() => import('./pages/ProfileMatchingPage'));
const AdvancedMatchingPage = lazyRetry(() => import('./pages/AdvancedMatchingPage'));
const VisitorDashboard = lazyRetry(() => import('./components/visitor/VisitorDashboard'));

const VisitorProfileSettings = lazyRetry(() => import('./components/visitor/VisitorProfileSettings'));
const AdminDashboard = lazyRetry(() => import('./components/dashboard/AdminDashboard'));
const EmailTemplatesManager = lazyRetry(() => import('./pages/admin/EmailTemplatesManager'));
const ExhibitorDashboard = lazyRetry(() => import('./components/dashboard/ExhibitorDashboard'));
const PartnerDashboard = lazyRetry(() => import('./components/dashboard/PartnerDashboard'));
const ExhibitorValidation = lazyRetry(() => import('./components/admin/ExhibitorValidation'));
const ModerationPanel = lazyRetry(() => import('./components/admin/ModerationPanel'));
const MiniSiteEditor = lazyRetry(() => import('./components/minisite/MiniSiteEditor'));
const NewsPage = lazyRetry(() => import('./pages/NewsPage'));
const ArticleDetailPage = lazyRetry(() => import('./pages/ArticleDetailPage'));
const NewsArticleCreationForm = lazyRetry(() => import('./components/admin/NewsArticleCreationForm'));
const EventCreationPage = lazyRetry(() => import('./pages/admin/EventCreationPage'));
const EventManagementPage = lazyRetry(() => import('./pages/admin/EventManagementPage'));
const UserManagementPage = lazyRetry(() => import('./pages/UserManagementPage'));
const ExhibitorSignUpPage = lazyRetry(() => import('./pages/auth/ExhibitorSignUpPage'));
const PartnerSignUpPage = lazyRetry(() => import('./pages/auth/PartnerSignUpPage'));
const SignUpSuccessPage = lazyRetry(() => import('./pages/auth/SignUpSuccessPage'));
const SignupConfirmationPage = lazyRetry(() => import('./pages/auth/SignupConfirmationPage'));
const PendingAccountPage = lazyRetry(() => import('./pages/auth/PendingAccountPage'));
const OAuthCallbackPage = lazyRetry(() => import('./pages/auth/OAuthCallbackPage'));
const SubscriptionPage = lazyRetry(() => import('./pages/SubscriptionPage'));
const ExhibitorSubscriptionPage = lazyRetry(() => import('./pages/ExhibitorSubscriptionPage'));
const PartnerSubscriptionPage = lazyRetry(() => import('./pages/PartnerSubscriptionPage'));
const VisitorUpgradePage = lazyRetry(() => import('./pages/VisitorUpgradePage'));
const VisitorPaymentPage = lazyRetry(() => import('./pages/VisitorPaymentPage'));
const VisitorBankTransferPage = lazyRetry(() => import('./pages/visitor/VisitorBankTransferPage'));
const PaymentSuccessPage = lazyRetry(() => import('./pages/visitor/PaymentSuccessPage'));
const PaymentInstructionsPage = lazyRetry(() => import('./pages/visitor/PaymentInstructionsPage'));
const PaymentValidationPage = lazyRetry(() => import('./pages/admin/PaymentValidationPage'));
const BadgePage = lazyRetry(() => import('./pages/BadgePage'));
const PartnerUpgradePage = lazyRetry(() => import('./pages/PartnerUpgradePage'));
const BadgeScannerPage = lazyRetry(() => import('./pages/BadgeScannerPage'));
const PartnerBankTransferPage = lazyRetry(() => import('./pages/partner/PartnerBankTransferPage'));
const PartnerPaymentSelectionPage = lazyRetry(() => import('./pages/partner/PartnerPaymentSelectionPage'));
const DigitalBadge = lazyRetry(() => import('./components/badge/DigitalBadge'));
const QRScanner = lazyRetry(() => import('./components/security/QRScanner'));
const BadgePrintStationPage = lazyRetry(() => import('./pages/BadgePrintStationPage'));

// Visitor registration pages
const VisitorFreeRegistration = lazyRetry(() => import('./pages/visitor/VisitorFreeRegistration'));
const VisitorVIPRegistration = lazyRetry(() => import('./pages/visitor/VisitorVIPRegistration'));

// Admin pages
const PavillonsAdminPage = lazyRetry(() => import('./pages/admin/PavillonsPage'));
const CreatePavilionPage = lazyRetry(() => import('./pages/admin/CreatePavilionPage'));
const AddDemoProgramPage = lazyRetry(() => import('./pages/admin/AddDemoProgramPage'));
const ContentManagementPage = lazyRetry(() => import('./pages/admin/ContentManagementPage'));
const NewsManagementPage = lazyRetry(() => import('./pages/admin/NewsManagementPage'));
const ExhibitorManagementPage = lazyRetry(() => import('./pages/admin/ExhibitorManagementPage'));
const ExhibitorCreationPage = lazyRetry(() => import('./pages/admin/ExhibitorCreationPage'));
const PartnerManagementPage = lazyRetry(() => import('./pages/admin/PartnerManagementPage'));
const PartnerCreationPage = lazyRetry(() => import('./pages/admin/PartnerCreationPage'));
const CreateUserPage = lazyRetry(() => import('./pages/admin/CreateUserPage'));
const AdminPartnersPage = lazyRetry(() => import('./pages/admin/PartnersPage'));
const MarketingDashboard = lazyRetry(() => import('./pages/MarketingDashboard'));
const PublicationControlPage = lazyRetry(() => import('./pages/admin/PublicationControlPage'));

// New pages for footer links
const ContactPage = lazyRetry(() => import('./pages/ContactPage'));
const ContactSuccessPage = lazyRetry(() => import('./pages/ContactSuccessPage'));
const PartnershipPage = lazyRetry(() => import('./pages/PartnershipPage'));
const SupportPage = lazyRetry(() => import('./pages/SupportPage'));
const APIPage = lazyRetry(() => import('./pages/APIPage'));
const PrivacyPage = lazyRetry(() => import('./pages/PrivacyPage'));
const TermsPage = lazyRetry(() => import('./pages/TermsPage'));
const CookiesPage = lazyRetry(() => import('./pages/CookiesPage'));
const AvailabilitySettingsPage = lazyRetry(() => import('./pages/AvailabilitySettingsPage'));
const VenuePage = lazyRetry(() => import('./pages/VenuePage'));
const AccommodationPage = lazyRetry(() => import('./pages/AccommodationPage'));

// Partner pages
const PartnerActivityPage = lazyRetry(() => import('./pages/partners/PartnerActivityPage'));
const PartnerAnalyticsPage = lazyRetry(() => import('./pages/partners/PartnerAnalyticsPage'));
const PartnerEventsPage = lazyRetry(() => import('./pages/partners/PartnerEventsPage'));
const PartnerLeadsPage = lazyRetry(() => import('./pages/partners/PartnerLeadsPage'));
const PartnerMediaPage = lazyRetry(() => import('./pages/partners/PartnerMediaPage'));
const PartnerNetworkingPage = lazyRetry(() => import('./pages/partners/PartnerNetworkingPage'));
const PartnerProfileEditPage = lazyRetry(() => import('./pages/partners/PartnerProfileEditPage'));
const PartnerSatisfactionPage = lazyRetry(() => import('./pages/partners/PartnerSatisfactionPage'));
const PartnerSupportPageComponent = lazyRetry(() => import('./pages/partners/PartnerSupportPage'));

// Admin media approval
const PartnerMediaApprovalPage = lazyRetry(() => import('./pages/admin/PartnerMediaApprovalPage'));
const VIPVisitorsPage = lazyRetry(() => import('./pages/admin/VIPVisitorsPage'));

// Error pages
const UnauthorizedPage = lazyRetry(() => import('./pages/UnauthorizedPage'));
const ForbiddenPage = lazyRetry(() => import('./pages/ForbiddenPage'));

// Visitor new pages
const VisaLetterPage = lazyRetry(() => import('./pages/visitor/VisaLetterPage'));
const PressAccreditationPage = lazyRetry(() => import('./pages/press/PressAccreditationPage'));
const SpeakersPage = lazyRetry(() => import('./pages/public/SpeakersPage'));
const AdminPressAccreditationsPage = lazyRetry(() => import('./pages/admin/PressAccreditationsPage'));
const AdminSpeakersPage = lazyRetry(() => import('./pages/admin/SpeakersManagementPage'));
const HallMapPage = lazyRetry(() => import('./pages/HallMapPage'));
const CatalogPage = lazyRetry(() => import('./pages/CatalogPage'));
const ProductDetailPage = lazyRetry(() => import('./pages/ProductDetailPage'));

// Media pages
const WebinarsPage = lazyRetry(() => import('./pages/media/WebinarsPage'));
const PodcastsPage = lazyRetry(() => import('./pages/media/PodcastsPage'));
const CapsulesPage = lazyRetry(() => import('./pages/media/CapsulesPage'));
const LiveStudioPage = lazyRetry(() => import('./pages/media/LiveStudioPage'));
const BestMomentsPage = lazyRetry(() => import('./pages/media/BestMomentsPage'));
const TestimonialsPage = lazyRetry(() => import('./pages/media/TestimonialsPage'));
const MediaLibraryPage = lazyRetry(() => import('./pages/media/MediaLibraryPage'));
const MediaDetailPage = lazyRetry(() => import('./pages/media/MediaDetailPage'));

// Admin Media pages
const MediaManagementPage = lazyRetry(() => import('./pages/admin/media/MediaManagementPage'));
const CreateMediaPage = lazyRetry(() => import('./pages/admin/media/CreateMediaPage'));
const EditMediaPage = lazyRetry(() => import('./pages/admin/media/EditMediaPage'));

// Partner Media pages
const PartnerMediaUploadPage = lazyRetry(() => import('./pages/partners/PartnerMediaUploadPage'));
const PartnerMediaAnalyticsPage = lazyRetry(() => import('./pages/partners/PartnerMediaAnalyticsPage'));
const PartnerMediaLibraryPage = lazyRetry(() => import('./pages/partners/PartnerMediaLibraryPage'));
const MatchmakingDashboard = lazyRetry(() => import('./components/networking/MatchmakingDashboard').then((m) => ({ default: m.MatchmakingDashboard })));
const LiveEventManager = lazyRetry(() => import('./pages/admin/media/LiveEventManager').then((m) => ({ default: m.LiveEventManager })));
const ChatBot = lazyRetry(() => import('./components/chatbot/ChatBot').then((m) => ({ default: m.ChatBot })));
const ChatBotToggle = lazyRetry(() => import('./components/chatbot/ChatBotToggle').then((m) => ({ default: m.ChatBotToggle })));
const WhatsAppFloatingWidget = lazyRetry(() => import('./components/whatsapp/WhatsAppFloatingWidget').then((m) => ({ default: m.WhatsAppFloatingWidget })));
const DevSubscriptionSwitcher = lazyRetry(() => import('./components/dev/DevSubscriptionSwitcher'));
const SalonSelectionPage = lazyRetry(() => import('./pages/SalonSelectionPage'));
const SalonPage = lazyRetry(() => import('./pages/SalonPage'));
import { useLanguageStore } from './store/languageStore';
import { ROUTES } from './lib/routes';
import ProtectedRoute from './components/auth/ProtectedRoute';
import { initializeAuth } from './lib/initAuth';
import { ErrorBoundary } from './components/ErrorBoundary';
import { usePushNotifications } from './hooks/usePushNotifications';
import { useAuthStore } from './store/authStore';
import { useLocation } from 'react-router-dom';
import { UrbaEventNav } from './components/layout/UrbaEventNav';

const URBA_ROUTES = ['/salons', '/salon/sir', '/salon/sip', '/salon/btp', '/salon/sie'];

function AppShell({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const isUrbaRoute = URBA_ROUTES.some(r => location.pathname.startsWith(r));
  return (
    <div className="min-h-screen flex flex-col">
      <SkipToContent />
      {isUrbaRoute ? <UrbaEventNav /> : <Header />}
      <main id="main-content" className={`flex-1 ${isUrbaRoute ? 'pt-[66px]' : 'pt-16 sm:pt-20 xl:pt-28'}`}>
        {children}
      </main>
    </div>
  );
}

// Import cleanup functions for dev debugging (not used in production)
if (import.meta.env.DEV) {
  import('./lib/cleanupAuth').then(({ cleanupAuth, checkAuthStatus }) => {
    // Make available in browser console for debugging
    (window as any).cleanupAuth = cleanupAuth;
    (window as any).checkAuthStatus = checkAuthStatus;
    console.log('🛠️ Dev tools disponibles: checkAuthStatus(), cleanupAuth()');
  });
}


const App = () => {
  const [isChatBotOpen, setIsChatBotOpen] = React.useState(false);
  const { currentLanguage } = useLanguageStore();

  // Tracking des visites de pages pour le trafic hebdomadaire (admin dashboard)
  usePageTracking();

  // Initialize push notifications on app startup
  usePushNotifications();

  // Initialize auth from Supabase session on app start
  React.useEffect(() => {
    // Run async init without blocking
    initializeAuth().catch(err => {
      console.error('Erreur initialisation auth:', err);
    });
  }, []);

  // SECURITY: Session timeout - track user activity
  React.useEffect(() => {
    const { checkSessionTimeout, updateActivity, isAuthenticated } = useAuthStore.getState();

    // Check timeout on mount
    if (isAuthenticated) {
      checkSessionTimeout();
      updateActivity(); // Initialize activity tracking
    }

    // Track user activity events
    const activityEvents = ['mousedown', 'keydown', 'scroll', 'touchstart', 'click'];

    const handleActivity = () => {
      const state = useAuthStore.getState();
      if (state.isAuthenticated) {
        state.updateActivity();
      }
    };

    // Add event listeners
    activityEvents.forEach(event => {
      window.addEventListener(event, handleActivity, { passive: true });
    });

    // Cleanup on unmount
    return () => {
      activityEvents.forEach(event => {
        window.removeEventListener(event, handleActivity);
      });
    };
  }, []);

  // BUGFIX: Removed getCurrentLanguage from deps to prevent unnecessary re-renders
  // Appliquer la direction du texte selon la langue
  React.useEffect(() => {
    const currentLang = useLanguageStore.getState().getCurrentLanguage();
    document.documentElement.dir = currentLang.code === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = currentLang.code;
  }, [currentLanguage]);

  return (
    <ErrorBoundary>
      <ScrollToTop />
      <AppShell>
          <Suspense fallback={
            <div className="flex items-center justify-center min-h-screen bg-gray-50">
              <div className="flex flex-col items-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                <p className="text-gray-600">Chargement...</p>
              </div>
            </div>
          }>
            <Routes>
            <Route path={ROUTES.HOME} element={<HomePage />} />
            <Route path={ROUTES.SALON_SELECTION} element={<SalonSelectionPage />} />
            <Route path={ROUTES.SALON_SIR} element={<SalonPage salonId="sir" />} />
            <Route path={ROUTES.SALON_SIP} element={<SalonPage salonId="sip" />} />
            <Route path={ROUTES.SALON_BTP} element={<SalonPage salonId="btp" />} />
            <Route path={ROUTES.SALON_SIE} element={<SalonPage salonId="sie" />} />
            <Route path={ROUTES.EXHIBITORS} element={<ExhibitorsPage />} />
            <Route path={ROUTES.EXHIBITOR_DETAIL} element={<ExhibitorDetailPage />} />
            <Route path={ROUTES.PARTNERS} element={<PartnersPage />} />
            <Route path={ROUTES.PARTNER_DETAIL} element={<PartnerDetailPage />} />
            <Route path={ROUTES.PAVILIONS} element={<PavillonsPage />} />
            <Route path={ROUTES.METRICS} element={<ProtectedRoute><MetricsPage /></ProtectedRoute>} />
            <Route path={ROUTES.NETWORKING} element={<NetworkingPage />} />
            <Route path={ROUTES.INTERACTION_HISTORY} element={<ProtectedRoute><InteractionHistoryPage /></ProtectedRoute>} />
            <Route path={ROUTES.NETWORKING_ROOMS} element={<ProtectedRoute><NetworkingRoomsPage /></ProtectedRoute>} />
            <Route path={ROUTES.SPEED_NETWORKING} element={<ProtectedRoute><SpeedNetworkingPage /></ProtectedRoute>} />
            <Route path={ROUTES.EVENTS} element={<EventsPage />} />
            <Route path={ROUTES.LOGIN} element={<LoginPage />} />
            <Route path={ROUTES.DEMO_ACCOUNTS} element={<DemoAccountsPage />} />
            <Route path={ROUTES.FORGOT_PASSWORD} element={<ForgotPasswordPage />} />
            <Route path={ROUTES.REGISTER} element={<RegisterPage />} />
            <Route path={ROUTES.REGISTER_VISITOR} element={<VisitorFreeRegistration />} />
            <Route path={ROUTES.REGISTER_EXHIBITOR} element={<ExhibitorSignUpPage />} />
            <Route path={ROUTES.REGISTER_PARTNER} element={<PartnerSignUpPage />} />
            <Route path={ROUTES.VISITOR_FREE_REGISTRATION} element={<VisitorFreeRegistration />} />
            <Route path={ROUTES.VISITOR_VIP_REGISTRATION} element={<VisitorVIPRegistration />} />
            <Route path={ROUTES.SIGNUP_SUCCESS} element={<SignUpSuccessPage />} />
            <Route path={ROUTES.SIGNUP_CONFIRMATION} element={<SignupConfirmationPage />} />
            <Route path={ROUTES.PENDING_ACCOUNT} element={<PendingAccountPage />} />
            <Route path={ROUTES.OAUTH_CALLBACK} element={<OAuthCallbackPage />} />
            <Route path={ROUTES.VISITOR_SUBSCRIPTION} element={<SubscriptionPage />} />
            <Route path={ROUTES.EXHIBITOR_SUBSCRIPTION} element={<ExhibitorSubscriptionPage />} />
            <Route path={ROUTES.PARTNER_SUBSCRIPTION} element={<PartnerSubscriptionPage />} />
            {/* Protected routes - require authentication */}
            <Route path={ROUTES.PROFILE} element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
            <Route path={ROUTES.PROFILE_DETAILED} element={<ProtectedRoute><DetailedProfilePage /></ProtectedRoute>} />
            <Route path={ROUTES.PROFILE_MATCHING} element={<ProtectedRoute><ProfileMatchingPage /></ProtectedRoute>} />
            <Route path={ROUTES.ADVANCED_MATCHING} element={<ProtectedRoute><AdvancedMatchingPage /></ProtectedRoute>} />
            <Route path={ROUTES.DASHBOARD} element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
            <Route path={ROUTES.EXHIBITOR_PROFILE} element={<ProtectedRoute requiredRole="exhibitor"><ProfilePage /></ProtectedRoute>} />
            <Route path={`${ROUTES.EXHIBITOR_PROFILE}/edit`} element={<ProtectedRoute requiredRole="exhibitor"><ProfileEdit /></ProtectedRoute>} />
            <Route path={ROUTES.EXHIBITOR_PROFILE_EDIT} element={<ProtectedRoute requiredRole="exhibitor"><ProfileEdit /></ProtectedRoute>} />
            <Route path={ROUTES.EXHIBITOR_DASHBOARD} element={<ProtectedRoute requiredRole="exhibitor"><ExhibitorDashboard /></ProtectedRoute>} />
            <Route path={ROUTES.VISITOR_DASHBOARD} element={<ProtectedRoute requiredRole="visitor" allowPendingPayment={true}><VisitorDashboard /></ProtectedRoute>} />
            {/* Partner routes - NEW */}
            <Route path={ROUTES.PARTNER_DASHBOARD} element={<ProtectedRoute requiredRole="partner"><PartnerDashboard /></ProtectedRoute>} />
            <Route path={ROUTES.PARTNER_PROFILE} element={<ProtectedRoute requiredRole="partner"><ProfilePage /></ProtectedRoute>} />
            <Route path={ROUTES.PARTNER_SETTINGS} element={<ProtectedRoute requiredRole="partner"><VisitorProfileSettings /></ProtectedRoute>} />

            {/* Pages partenaires détaillées */}
            <Route path={ROUTES.PARTNER_ACTIVITY} element={<ProtectedRoute requiredRole="partner"><PartnerActivityPage /></ProtectedRoute>} />
            <Route path={ROUTES.PARTNER_ANALYTICS} element={<ProtectedRoute requiredRole="partner"><PartnerAnalyticsPage /></ProtectedRoute>} />
            <Route path={ROUTES.PARTNER_EVENTS} element={<ProtectedRoute requiredRole="partner"><PartnerEventsPage /></ProtectedRoute>} />
            <Route path={ROUTES.PARTNER_LEADS} element={<ProtectedRoute requiredRole="partner"><PartnerLeadsPage /></ProtectedRoute>} />
            <Route path={ROUTES.PARTNER_MEDIA} element={<ProtectedRoute requiredRole="partner"><PartnerMediaPage /></ProtectedRoute>} />
            <Route path={ROUTES.PARTNER_NETWORKING} element={<ProtectedRoute requiredRole="partner"><PartnerNetworkingPage /></ProtectedRoute>} />
            <Route path={ROUTES.PARTNER_PROFILE_EDIT} element={<ProtectedRoute requiredRole="partner"><PartnerProfileEditPage /></ProtectedRoute>} />
            <Route path={ROUTES.PARTNER_SATISFACTION} element={<ProtectedRoute requiredRole="partner"><PartnerSatisfactionPage /></ProtectedRoute>} />
            <Route path={ROUTES.PARTNER_SUPPORT_PAGE} element={<ProtectedRoute requiredRole="partner"><PartnerSupportPageComponent /></ProtectedRoute>} />

            {/* Pages erreur */}
            <Route path={ROUTES.UNAUTHORIZED} element={<UnauthorizedPage />} />
            <Route path={ROUTES.FORBIDDEN} element={<ForbiddenPage />} />


            <Route path={ROUTES.VISITOR_SETTINGS} element={<ProtectedRoute requiredRole="visitor"><VisitorProfileSettings /></ProtectedRoute>} />
            {/* BUG FIX: Route VISITOR_SUBSCRIPTION dupliquée - supprimée car déjà définie ligne 180 comme route publique */}
            <Route path={ROUTES.VISITOR_UPGRADE} element={<ProtectedRoute requiredRole="visitor"><VisitorUpgradePage /></ProtectedRoute>} />
            <Route path={ROUTES.VISITOR_PAYMENT} element={<ProtectedRoute requiredRole="visitor" allowPendingPayment={true}><VisitorPaymentPage /></ProtectedRoute>} />
            <Route path={ROUTES.VISITOR_BANK_TRANSFER} element={<ProtectedRoute requiredRole="visitor" allowPendingPayment={true}><VisitorBankTransferPage /></ProtectedRoute>} />
            <Route path={ROUTES.VISITOR_PAYMENT_SUCCESS} element={<ProtectedRoute requiredRole="visitor" allowPendingPayment={true}><PaymentSuccessPage /></ProtectedRoute>} />
            <Route path={ROUTES.VISITOR_PAYMENT_INSTRUCTIONS} element={<ProtectedRoute requiredRole="visitor" allowPendingPayment={true}><PaymentInstructionsPage /></ProtectedRoute>} />
            <Route path={ROUTES.VISITOR_VISA_LETTER} element={<ProtectedRoute requiredRole="visitor"><VisaLetterPage /></ProtectedRoute>} />
            <Route path={ROUTES.BADGE} element={<ProtectedRoute><BadgePage /></ProtectedRoute>} />
            <Route path={ROUTES.BADGE_DIGITAL} element={<ProtectedRoute><DigitalBadge /></ProtectedRoute>} />
            <Route path={ROUTES.BADGE_SCANNER} element={<ProtectedRoute><BadgeScannerPage /></ProtectedRoute>} />
            <Route path={ROUTES.BADGE_PRINT_STATION} element={<ProtectedRoute requiredRole={['admin', 'security']}><BadgePrintStationPage /></ProtectedRoute>} />
            {/* FIXED: Permettre aux admins d'accéder au scanner QR (pas seulement 'security') */}
            <Route path={ROUTES.SECURITY_SCANNER} element={<ProtectedRoute requiredRole={['admin', 'exhibitor', 'partner', 'security']}><QRScanner /></ProtectedRoute>} />
            <Route path={ROUTES.PARTNER_UPGRADE} element={<ProtectedRoute requiredRole="partner"><PartnerUpgradePage /></ProtectedRoute>} />
            <Route path={ROUTES.PARTNER_PAYMENT_SELECTION} element={<ProtectedRoute requiredRole="partner"><PartnerPaymentSelectionPage /></ProtectedRoute>} />
            <Route path={ROUTES.PARTNER_BANK_TRANSFER} element={<ProtectedRoute requiredRole="partner"><PartnerBankTransferPage /></ProtectedRoute>} />
            <Route path={ROUTES.MESSAGES} element={<ProtectedRoute><ChatInterface /></ProtectedRoute>} />
            <Route path={ROUTES.CHAT} element={<ProtectedRoute><ChatInterface /></ProtectedRoute>} />
            <Route path={ROUTES.APPOINTMENTS} element={<ProtectedRoute><AppointmentCalendar /></ProtectedRoute>} />
            <Route path={ROUTES.CALENDAR} element={<ProtectedRoute><AppointmentCalendar /></ProtectedRoute>} />
            <Route path={ROUTES.MINISITE_CREATION} element={<ProtectedRoute requiredRole="exhibitor"><MiniSiteCreationPage /></ProtectedRoute>} />
            <Route path={ROUTES.CREATE_MINI_SITE} element={<ProtectedRoute requiredRole="exhibitor"><MiniSiteCreationPage /></ProtectedRoute>} />
            <Route path={ROUTES.MINISITE_EDITOR} element={<ProtectedRoute requiredRole="exhibitor"><MiniSiteEditor /></ProtectedRoute>} />
            <Route path={ROUTES.EDIT_MINI_SITE} element={<ProtectedRoute requiredRole="exhibitor"><MiniSiteEditor /></ProtectedRoute>} />
            <Route path={ROUTES.MINISITE} element={<MiniSiteListPage />} />
            <Route path={ROUTES.MINISITE_DIRECTORY} element={<MiniSiteDirectory />} />
            <Route path={ROUTES.MINISITE_PREVIEW} element={<MiniSitePreview />} />
            <Route path={ROUTES.MINI_SITE_VIEW} element={<MiniSitePreview />} />
            <Route path={ROUTES.RESET_PASSWORD} element={<ResetPasswordPage />} />

            {/* Admin routes - require admin role */}
            <Route path={ROUTES.ADMIN_CREATE_EXHIBITOR} element={<ProtectedRoute requiredRole="admin"><ExhibitorCreationPage /></ProtectedRoute>} />
            <Route path={ROUTES.ADMIN_CREATE_PARTNER} element={<ProtectedRoute requiredRole="admin"><PartnerCreationPage /></ProtectedRoute>} />
            <Route path={ROUTES.ADMIN_CREATE_NEWS} element={<ProtectedRoute requiredRole="admin"><NewsArticleCreationForm /></ProtectedRoute>} />
            <Route path={ROUTES.ADMIN_CREATE_EVENT} element={<ProtectedRoute requiredRole="admin"><EventCreationPage /></ProtectedRoute>} />
            <Route path={ROUTES.ADMIN_EVENTS} element={<ProtectedRoute requiredRole="admin"><EventManagementPage /></ProtectedRoute>} />
            <Route path={ROUTES.ADMIN_ACTIVITY} element={<ProtectedRoute requiredRole="admin"><ActivityPage /></ProtectedRoute>} />
            <Route path={ROUTES.ADMIN_VALIDATION} element={<ProtectedRoute requiredRole="admin"><ExhibitorValidation /></ProtectedRoute>} />
            <Route path={ROUTES.ADMIN_MODERATION} element={<ProtectedRoute requiredRole="admin"><ModerationPanel /></ProtectedRoute>} />
            <Route path={ROUTES.NEWS} element={<NewsPage />} />
            <Route path={ROUTES.NEWS_DETAIL} element={<ArticleDetailPage />} />
            <Route path={ROUTES.ADMIN_DASHBOARD} element={<ProtectedRoute requiredRole="admin"><AdminDashboard /></ProtectedRoute>} />
            <Route path={ROUTES.ADMIN_PAYMENT_VALIDATION} element={<ProtectedRoute requiredRole="admin"><PaymentValidationPage /></ProtectedRoute>} />
            <Route path={ROUTES.ADMIN_VIP_VISITORS} element={<ProtectedRoute requiredRole="admin"><VIPVisitorsPage /></ProtectedRoute>} />
            <Route path={ROUTES.ADMIN_USERS} element={<ProtectedRoute requiredRole="admin"><UserManagementPage /></ProtectedRoute>} />
            <Route path={ROUTES.ADMIN_CREATE_USER} element={<ProtectedRoute requiredRole="admin"><CreateUserPage /></ProtectedRoute>} />
            <Route path={ROUTES.ADMIN_PARTNERS} element={<ProtectedRoute requiredRole="admin"><AdminPartnersPage /></ProtectedRoute>} />
            <Route path={ROUTES.ADMIN_PAVILIONS} element={<ProtectedRoute requiredRole="admin"><PavillonsAdminPage /></ProtectedRoute>} />
            <Route path={ROUTES.ADMIN_CREATE_PAVILION} element={<ProtectedRoute requiredRole="admin"><CreatePavilionPage /></ProtectedRoute>} />
            <Route path={ROUTES.ADMIN_EMAIL_TEMPLATES} element={<ProtectedRoute requiredRole="admin"><EmailTemplatesManager /></ProtectedRoute>} />
            <Route path={ROUTES.ADMIN_PAVILION_ADD_DEMO} element={<ProtectedRoute requiredRole="admin"><AddDemoProgramPage /></ProtectedRoute>} />
            <Route path={ROUTES.ADMIN_CONTENT} element={<ProtectedRoute requiredRole="admin"><ContentManagementPage /></ProtectedRoute>} />
            <Route path={ROUTES.ADMIN_NEWS} element={<ProtectedRoute requiredRole="admin"><NewsManagementPage /></ProtectedRoute>} />
            <Route path={ROUTES.ADMIN_EXHIBITORS} element={<ProtectedRoute requiredRole="admin"><ExhibitorManagementPage /></ProtectedRoute>} />
            <Route path={ROUTES.ADMIN_EXHIBITORS_LIST} element={<ProtectedRoute requiredRole="admin"><ExhibitorManagementPage /></ProtectedRoute>} />
            <Route path={ROUTES.ADMIN_PARTNERS_MANAGE} element={<ProtectedRoute requiredRole="admin"><PartnerManagementPage /></ProtectedRoute>} />
            <Route path={ROUTES.MARKETING_DASHBOARD} element={<ProtectedRoute requiredRole="admin"><MarketingDashboard /></ProtectedRoute>} />
            <Route path={ROUTES.ADMIN_PUBLICATION_CONTROL} element={<ProtectedRoute requiredRole="admin"><PublicationControlPage /></ProtectedRoute>} />
            <Route path={ROUTES.ADMIN_MEDIA} element={<ProtectedRoute requiredRole="admin"><MediaManagementPage /></ProtectedRoute>} />
            <Route path={ROUTES.ADMIN_USERS_LIST} element={<ProtectedRoute requiredRole="admin"><UserManagementPage /></ProtectedRoute>} />

            {/* New routes for footer links */}
            <Route path={ROUTES.CONTACT} element={<ContactPage />} />
            <Route path={ROUTES.CONTACT_SUCCESS} element={<ContactSuccessPage />} />
            <Route path={ROUTES.PARTNERSHIP} element={<PartnershipPage />} />
            <Route path={ROUTES.SUPPORT} element={<SupportPage />} />
            <Route path={ROUTES.API} element={<APIPage />} />
            <Route path={ROUTES.PRIVACY} element={<PrivacyPage />} />
            <Route path={ROUTES.TERMS} element={<TermsPage />} />
            <Route path={ROUTES.COOKIES} element={<CookiesPage />} />
            <Route path={ROUTES.AVAILABILITY_SETTINGS} element={<ProtectedRoute><AvailabilitySettingsPage /></ProtectedRoute>} />
            <Route path={ROUTES.VENUE} element={<VenuePage />} />
            <Route path={ROUTES.ACCOMMODATION} element={<AccommodationPage />} />

            {/* Media routes - public access */}
            <Route path={ROUTES.WEBINARS} element={<WebinarsPage />} />
            <Route path={ROUTES.WEBINAR_DETAIL} element={<MediaDetailPage />} />
            <Route path={ROUTES.PODCASTS} element={<PodcastsPage />} />
            <Route path={ROUTES.PODCAST_DETAIL} element={<MediaDetailPage />} />
            <Route path={ROUTES.CAPSULES_INSIDE} element={<CapsulesPage />} />
            <Route path={ROUTES.CAPSULE_DETAIL} element={<MediaDetailPage />} />
            <Route path={ROUTES.LIVE_STUDIO} element={<LiveStudioPage />} />
            <Route path={ROUTES.LIVE_STUDIO_DETAIL} element={<MediaDetailPage />} />
            <Route path={ROUTES.BEST_MOMENTS} element={<BestMomentsPage />} />
            <Route path={ROUTES.BEST_MOMENTS_DETAIL} element={<MediaDetailPage />} />
            <Route path={ROUTES.TESTIMONIALS} element={<TestimonialsPage />} />
            <Route path={ROUTES.TESTIMONIAL_DETAIL} element={<MediaDetailPage />} />
            <Route path={ROUTES.MEDIA_LIBRARY} element={<MediaLibraryPage />} />
            <Route path={ROUTES.MEDIA_DETAIL} element={<MediaDetailPage />} />

            {/* Partner Media routes - protected */}
            <Route path={ROUTES.PARTNER_MEDIA_UPLOAD} element={<ProtectedRoute requiredRole="partner"><PartnerMediaUploadPage /></ProtectedRoute>} />
            <Route path={ROUTES.PARTNER_MEDIA_ANALYTICS} element={<ProtectedRoute requiredRole="partner"><PartnerMediaAnalyticsPage /></ProtectedRoute>} />
            <Route path={ROUTES.PARTNER_MEDIA_LIBRARY} element={<ProtectedRoute requiredRole="partner"><PartnerMediaLibraryPage /></ProtectedRoute>} />

            {/* Admin Media routes - protected */}
            <Route path={ROUTES.ADMIN_MEDIA_MANAGE} element={<ProtectedRoute requiredRole="admin"><MediaManagementPage /></ProtectedRoute>} />
            <Route path={ROUTES.ADMIN_MEDIA_CREATE} element={<ProtectedRoute requiredRole="admin"><CreateMediaPage /></ProtectedRoute>} />
            <Route path={ROUTES.ADMIN_MEDIA_EDIT} element={<ProtectedRoute requiredRole="admin"><EditMediaPage /></ProtectedRoute>} />
            <Route path={ROUTES.ADMIN_PARTNER_MEDIA_APPROVAL} element={<ProtectedRoute requiredRole="admin"><PartnerMediaApprovalPage /></ProtectedRoute>} />
            <Route path={ROUTES.ADMIN_LIVE_EVENTS} element={<ProtectedRoute requiredRole="admin"><LiveEventManager /></ProtectedRoute>} />
            <Route path={ROUTES.ADMIN_LIVE_EVENT_CREATE} element={<ProtectedRoute requiredRole="admin"><LiveEventManager /></ProtectedRoute>} />

            {/* Pages statiques menu - Le Salon */}
            <Route path={ROUTES.PRESENTATION} element={<Navigate to={ROUTES.HOME} replace />} />
            <Route path={ROUTES.NOUVEAUTES} element={<Navigate to={ROUTES.HOME} replace />} />
            <Route path={ROUTES.SECTEURS} element={<Navigate to={ROUTES.HOME} replace />} />
            <Route path={ROUTES.EDITIONS} element={<Navigate to={ROUTES.HOME} replace />} />
            <Route path={ROUTES.TELECHARGEMENTS} element={<Navigate to={ROUTES.HOME} replace />} />
            {/* Pages statiques menu - Exposer */}
            <Route path={ROUTES.POURQUOI_EXPOSER} element={<Navigate to={ROUTES.PAVILIONS} replace />} />
            <Route path={ROUTES.ESPACES_SIB} element={<Navigate to={ROUTES.REGISTER_EXHIBITOR} replace />} />
            {/* Pages statiques menu - Visiter */}
            <Route path={ROUTES.POURQUOI_VISITER} element={<Navigate to={ROUTES.REGISTER_VISITOR} replace />} />
            <Route path={ROUTES.INFOS_PRATIQUES} element={<Navigate to={ROUTES.HOME} replace />} />

            {/* Speakers & Press routes */}
            <Route path={ROUTES.SPEAKERS} element={<SpeakersPage />} />
            <Route path={ROUTES.PRESS_ACCREDITATION} element={<PressAccreditationPage />} />
            <Route path={ROUTES.HALL_MAP} element={<HallMapPage />} />
            <Route path={ROUTES.CATALOG} element={<CatalogPage />} />
            <Route path={ROUTES.PRODUCT_DETAIL} element={<ProductDetailPage />} />
            <Route path={ROUTES.NETWORKING_MATCHMAKING} element={<ProtectedRoute><MatchmakingDashboard /></ProtectedRoute>} />
            <Route path={ROUTES.ADMIN_SPEAKERS} element={<ProtectedRoute requiredRole="admin"><AdminSpeakersPage /></ProtectedRoute>} />
            <Route path={ROUTES.ADMIN_PRESS_ACCREDITATIONS} element={<ProtectedRoute requiredRole="admin"><AdminPressAccreditationsPage /></ProtectedRoute>} />
            <Route path={ROUTES.NOT_FOUND} element={<div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
              <p className="text-xl text-gray-600 mb-8">Page non trouvée</p>
              <Link to={ROUTES.HOME} className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700" aria-label="Retour à l'accueil">
                Retour à l'accueil
              </Link>
            </div>} />

            {/* 404 catch-all route - must be last */}
            <Route path="*" element={<div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
              <p className="text-xl text-gray-600 mb-8">Page non trouvée</p>
              <Link to={ROUTES.HOME} className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700" aria-label="Retour à l'accueil">
                Retour à l'accueil
              </Link>
            </div>} />
          </Routes>
        </Suspense>
      </AppShell>
      <Footer />

      <Suspense fallback={null}>
        {/* ChatBot */}
        <ChatBot
          isOpen={isChatBotOpen}
          onToggle={() => setIsChatBotOpen(!isChatBotOpen)}
        />

        {/* ChatBot Toggle Button */}
        {!isChatBotOpen && (
          <ChatBotToggle
            onClick={() => setIsChatBotOpen(true)}
            hasUnreadMessages={false}
          />
        )}

        {/* WhatsApp Floating Widget */}
        <WhatsAppFloatingWidget
          position="bottom-right"
          offsetBottom={100}
          offsetSide={24}
          defaultVisible={true}
        />

        {/* Dev Tools - Subscription Switcher (Development Only) */}
        {import.meta.env.DEV && <DevSubscriptionSwitcher />}
      </Suspense>

      <Toaster position="top-right" />
    </ErrorBoundary>
  );
}

export default App;
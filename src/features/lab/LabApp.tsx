import { Route, Routes } from 'react-router-dom';
import { LabClientShell, LabShell } from './components/LabShell';
import { LabGuard } from './components/LabGuard';
import LabLandingPage from './pages/LabLandingPage';
import LabAdminLoginPage from './pages/LabAdminLoginPage';
import LabClientLoginPage from './pages/LabClientLoginPage';
import LabDashboardPage from './pages/LabDashboardPage';
import LabRequestFormPage from './pages/LabRequestFormPage';
import LabRequestsPage from './pages/LabRequestsPage';
import LabRequestDetailPage from './pages/LabRequestDetailPage';
import LabPlaceholderPage, { LabClientHomePage } from './pages/LabPlaceholderPage';
import LabSuppliersPage from './pages/LabSuppliersPage';
import LabSupplierDetailPage from './pages/LabSupplierDetailPage';
import LabConsultationsPage from './pages/LabConsultationsPage';
import LabConsultationDetailPage from './pages/LabConsultationDetailPage';
import LabQuotesPage from './pages/LabQuotesPage';
import LabQuoteDetailPage from './pages/LabQuoteDetailPage';
import LabSupplierOfferPage from './pages/LabSupplierOfferPage';
import LabQuoteSurveyPage from './pages/LabQuoteSurveyPage';

function AdminOutlet() {
  return (
    <LabGuard portal="admin">
      <LabShell />
    </LabGuard>
  );
}

function ClientOutlet() {
  return (
    <LabGuard portal="client">
      <LabClientShell />
    </LabGuard>
  );
}

export default function LabApp() {
  return (
    <Routes>
      <Route index element={<LabLandingPage />} />
      <Route path="login" element={<LabAdminLoginPage />} />
      <Route path="client-login" element={<LabClientLoginPage />} />
      <Route path="request-form" element={<LabRequestFormPage />} />
      <Route path="supplier-offer/:token" element={<LabSupplierOfferPage />} />
      <Route path="quote-survey/:token" element={<LabQuoteSurveyPage />} />

      <Route path="admin" element={<AdminOutlet />}>
        <Route path="dashboard" element={<LabDashboardPage />} />
        <Route path="requests" element={<LabRequestsPage />} />
        <Route path="requests/:id" element={<LabRequestDetailPage />} />
        <Route path="quotes" element={<LabQuotesPage />} />
        <Route path="quotes/:id" element={<LabQuoteDetailPage />} />
        <Route path="suppliers" element={<LabSuppliersPage />} />
        <Route path="suppliers/:id" element={<LabSupplierDetailPage />} />
        <Route path="consultations" element={<LabConsultationsPage />} />
        <Route path="consultations/:id" element={<LabConsultationDetailPage />} />
        <Route path="orders" element={<LabPlaceholderPage title="Commandes" />} />
        <Route path="samples" element={<LabPlaceholderPage title="Échantillons" />} />
        <Route path="samples/:id" element={<LabPlaceholderPage title="Échantillon" />} />
        <Route path="analyses" element={<LabPlaceholderPage title="Analyses" />} />
        <Route path="results" element={<LabPlaceholderPage title="Résultats" />} />
        <Route path="validations" element={<LabPlaceholderPage title="Validations" />} />
        <Route path="reports" element={<LabPlaceholderPage title="Rapports" />} />
        <Route path="report-templates" element={<LabPlaceholderPage title="Gabarit rapports" />} />
        <Route path="clients" element={<LabPlaceholderPage title="Clients" />} />
        <Route path="users" element={<LabPlaceholderPage title="Utilisateurs" />} />
        <Route path="tasks" element={<LabPlaceholderPage title="Tâches" />} />
        <Route path="invoices" element={<LabPlaceholderPage title="Factures" />} />
        <Route path="payments" element={<LabPlaceholderPage title="Paiements" />} />
        <Route path="settings" element={<LabPlaceholderPage title="Réglages" />} />
        <Route path="audit" element={<LabPlaceholderPage title="Audit" />} />
        <Route path="backups" element={<LabPlaceholderPage title="Sauvegardes" />} />
      </Route>

      <Route path="client" element={<ClientOutlet />}>
        <Route path="dashboard" element={<LabClientHomePage />} />
        <Route path="requests" element={<LabPlaceholderPage title="Mes demandes" />} />
        <Route path="requests/:id" element={<LabPlaceholderPage title="Demande" />} />
        <Route path="quotes" element={<LabPlaceholderPage title="Mes devis" />} />
        <Route path="reports" element={<LabPlaceholderPage title="Mes rapports" />} />
        <Route path="invoices" element={<LabPlaceholderPage title="Mes factures" />} />
        <Route path="profile" element={<LabPlaceholderPage title="Profil" />} />
      </Route>
    </Routes>
  );
}

import { Route, Routes } from 'react-router-dom';
import './theme/lab.css';
import { LabClientShell, LabShell } from './components/LabShell';
import { LabGuard } from './components/LabGuard';
import LabLandingPage from './pages/LabLandingPage';
import LabAdminLoginPage from './pages/LabAdminLoginPage';
import LabClientLoginPage from './pages/LabClientLoginPage';
import LabDashboardPage from './pages/LabDashboardPage';
import LabRequestFormPage from './pages/LabRequestFormPage';
import LabRequestsPage from './pages/LabRequestsPage';
import LabRequestDetailPage from './pages/LabRequestDetailPage';
import LabSuppliersPage from './pages/LabSuppliersPage';
import LabSupplierDetailPage from './pages/LabSupplierDetailPage';
import LabConsultationsPage from './pages/LabConsultationsPage';
import LabConsultationDetailPage from './pages/LabConsultationDetailPage';
import LabQuotesPage from './pages/LabQuotesPage';
import LabQuoteDetailPage from './pages/LabQuoteDetailPage';
import LabSupplierOfferPage from './pages/LabSupplierOfferPage';
import LabQuoteSurveyPage from './pages/LabQuoteSurveyPage';
import LabOrdersPage from './pages/LabOrdersPage';
import LabOrderDetailPage from './pages/LabOrderDetailPage';
import LabSamplesPage from './pages/LabSamplesPage';
import LabSampleDetailPage from './pages/LabSampleDetailPage';
import LabAnalysesPage from './pages/LabAnalysesPage';
import LabResultsPage from './pages/LabResultsPage';
import LabValidationsPage from './pages/LabValidationsPage';
import LabReportsPage from './pages/LabReportsPage';
import LabInvoicesPage from './pages/LabInvoicesPage';
import LabSettingsPage from './pages/LabSettingsPage';
import LabDeadlinesPage from './pages/LabDeadlinesPage';
import LabSupplierInvoicesPage from './pages/LabSupplierInvoicesPage';
import LabEmailsPage from './pages/LabEmailsPage';
import LabMfaPage from './pages/LabMfaPage';
import LabInboxPage from './pages/LabInboxPage';
import LabSampleCatalogPage from './pages/LabSampleCatalogPage';
import LabCallsPage from './pages/LabCallsPage';
import LabRegulatoryPage from './pages/LabRegulatoryPage';
import LabRegulationPage from './pages/LabRegulationPage';
import {
  LabAuditPage, LabBackupsPage, LabClientsPage, LabPaymentsPage,
  LabReportTemplatesPage, LabTasksPage, LabUsersPage,
} from './pages/LabAdminLists';
import {
  LabClientHomePage, LabClientInvoicesPage, LabClientProfilePage,
  LabClientQuotesPage, LabClientReportsPage,
  LabClientRequestDetailPage, LabClientRequestsPage,
} from './pages/LabClientPortalPages';

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
        <Route path="orders" element={<LabOrdersPage />} />
        <Route path="orders/:id" element={<LabOrderDetailPage />} />
        <Route path="samples" element={<LabSamplesPage />} />
        <Route path="samples/:id" element={<LabSampleDetailPage />} />
        <Route path="analyses" element={<LabAnalysesPage />} />
        <Route path="results" element={<LabResultsPage />} />
        <Route path="validations" element={<LabValidationsPage />} />
        <Route path="reports" element={<LabReportsPage />} />
        <Route path="report-templates" element={<LabReportTemplatesPage />} />
        <Route path="clients" element={<LabClientsPage />} />
        <Route path="users" element={<LabUsersPage />} />
        <Route path="tasks" element={<LabTasksPage />} />
        <Route path="invoices" element={<LabInvoicesPage />} />
        <Route path="payments" element={<LabPaymentsPage />} />
        <Route path="supplier-invoices" element={<LabSupplierInvoicesPage />} />
        <Route path="deadlines" element={<LabDeadlinesPage />} />
        <Route path="emails" element={<LabEmailsPage />} />
        <Route path="inbox" element={<LabInboxPage />} />
        <Route path="regulatory" element={<LabRegulatoryPage />} />
        <Route path="regulation" element={<LabRegulationPage />} />
        <Route path="calls" element={<LabCallsPage />} />
        <Route path="mfa" element={<LabMfaPage />} />
        <Route path="settings" element={<LabSettingsPage />} />
        <Route path="sample-catalog" element={<LabSampleCatalogPage />} />
        <Route path="audit" element={<LabAuditPage />} />
        <Route path="backups" element={<LabBackupsPage />} />
      </Route>

      <Route path="client" element={<ClientOutlet />}>
        <Route path="dashboard" element={<LabClientHomePage />} />
        <Route path="requests" element={<LabClientRequestsPage />} />
        <Route path="requests/:id" element={<LabClientRequestDetailPage />} />
        <Route path="quotes" element={<LabClientQuotesPage />} />
        <Route path="reports" element={<LabClientReportsPage />} />
        <Route path="invoices" element={<LabClientInvoicesPage />} />
        <Route path="profile" element={<LabClientProfilePage />} />
      </Route>
    </Routes>
  );
}

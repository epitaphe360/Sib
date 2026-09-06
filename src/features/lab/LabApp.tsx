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

      <Route path="admin" element={<AdminOutlet />}>
        <Route path="dashboard" element={<LabDashboardPage />} />
        <Route path="requests" element={<LabRequestsPage />} />
        <Route path="requests/:id" element={<LabRequestDetailPage />} />
        <Route path="quotes" element={<LabPlaceholderPage title="Devis" />} />
        <Route path="quotes/:id" element={<LabPlaceholderPage title="Devis" />} />
        <Route path="suppliers" element={<LabPlaceholderPage title="Fournisseurs" />} />
        <Route path="suppliers/:id" element={<LabPlaceholderPage title="Fournisseur" />} />
        <Route path="consultations" element={<LabPlaceholderPage title="Consultations" />} />
        <Route path="consultations/:id" element={<LabPlaceholderPage title="Consultation" />} />
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

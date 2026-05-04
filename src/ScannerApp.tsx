import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import BadgeScannerPage from './pages/BadgeScannerPage';
import LoginPage from './components/auth/LoginPage';
import useAuthStore from './store/authStore';
import { QrCode } from 'lucide-react';

export default function ScannerApp() {
  const { isAuthenticated } = useAuthStore();

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster position="top-center" />

      {/* Simplified Header */}
      <div className="bg-blue-900 text-white p-4 shadow-md flex items-center justify-center">
        <QrCode className="h-6 w-6 mr-2" />
        <h1 className="text-xl font-bold">SIB Scanner</h1>
      </div>

      <Routes>
        <Route path="/login" element={<LoginPage />} />

        {/* Main Scanner Route - Protected */}
        <Route
          path="/scanner"
          element={
            isAuthenticated ? (
              <BadgeScannerPage />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        {/* Redirects for LoginPage logic */}
        <Route path="/admin/dashboard" element={<Navigate to="/scanner" replace />} />
        <Route path="/partner/dashboard" element={<Navigate to="/scanner" replace />} />
        <Route path="/exhibitor/dashboard" element={<Navigate to="/scanner" replace />} />
        <Route path="/visitor/dashboard" element={<Navigate to="/scanner" replace />} />
        <Route path="/dashboard" element={<Navigate to="/scanner" replace />} />
        <Route path="/badge" element={<Navigate to="/scanner" replace />} />

        {/* Default Redirect */}
        <Route path="/" element={<Navigate to="/scanner" replace />} />
        <Route path="*" element={<Navigate to="/scanner" replace />} />
      </Routes>
    </div>
  );
}

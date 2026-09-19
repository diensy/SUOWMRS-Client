import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Providers
import { SnackbarProvider } from './context/SnackbarContext';
import { LanguageProvider } from './context/LanguageContext';
import { ThemeProvider } from './context/ThemeContext';

// Layout & Common
import DashboardLayout from './components/layout/DashboardLayout';
import ProtectedRoute from './components/common/ProtectedRoute';
import { getCurrentUser } from './services/authService';

// Pages — Public
import LandingPage from './pages/LandingPage';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';

// Pages — Dashboard
import UserDashboard from './pages/dashboard/UserDashboard';
import MunicipalityDashboard from './pages/admin/MunicipalityDashboard';

// Pages — User Profile & Approvals
import ProfilePage from './pages/user/ProfilePage';
import UserApprovalsPage from './pages/admin/UserApprovalsPage';
import AdminPricingPage from './pages/admin/AdminPricingPage';

// Pages — Phase 6 Municipality & Citizen Portal
import MultiSystemMonitoringPage from './pages/admin/MultiSystemMonitoringPage';
import CityGisMapPage from './pages/admin/CityGisMapPage';
import CitizenComplaintPortal from './pages/user/CitizenComplaintPortal';
import MunicipalityComplaintsPage from './pages/admin/MunicipalityComplaintsPage';
import EmergencyMonitoringPage from './pages/admin/EmergencyMonitoringPage';

// Pages — Phase 7 AI Flood Prediction Engine
import AiPredictionDashboard from './pages/ai/AiPredictionDashboard';
import PredictionHistoryPage from './pages/ai/PredictionHistoryPage';

// Pages — Phase 5 Hardware Diagnostics & Maintenance
import SystemHealthDashboard from './pages/maintenance/SystemHealthDashboard';
import Esp32Diagnostics from './pages/maintenance/Esp32Diagnostics';
import SensorDiagnostics from './pages/maintenance/SensorDiagnostics';
import ComponentsHealth from './pages/maintenance/ComponentsHealth';
import WorkOrdersPage from './pages/maintenance/WorkOrdersPage';

import AlertsPage from './pages/user/AlertsPage';
import StoragePage from './pages/user/StoragePage';
import WaterReusePage from './pages/user/WaterReusePage';
import WeatherPage from './pages/user/WeatherPage';
import SosPage from './pages/user/SosPage';
import WaterMonitoringPage from './pages/user/WaterMonitoringPage';
import PaymentDashboardPage from './pages/user/PaymentDashboardPage';
import PaymentCheckoutPage from './pages/user/PaymentCheckoutPage';
import InvoicesPage from './pages/user/InvoicesPage';
import SubscriptionPage from './pages/user/SubscriptionPage';
import { primeTTS } from './services/ttsService';

export default function App() {
  // Warm the neural-voice capability lookup so the first "Listen" click is instant
  useEffect(() => { primeTTS(); }, []);

  const [userRole, setUserRole] = useState(() => {
    const user = getCurrentUser();
    return user?.role || 'Resident';
  });

  useEffect(() => {
    const checkRole = () => {
      const user = getCurrentUser();
      if (user?.role && user.role !== userRole) {
        setUserRole(user.role);
      }
    };
    window.addEventListener('storage', checkRole);
    return () => window.removeEventListener('storage', checkRole);
  }, [userRole]);

  return (
    <ThemeProvider>
      <LanguageProvider>
        <SnackbarProvider>
          <BrowserRouter>
          <Routes>
            {/* Public */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />

            {/* Dashboard wrapper */}
            <Route
              element={
                <DashboardLayout
                  userRole={userRole}
                  onRoleChange={setUserRole}
                />
              }
            >
              {/* Common Authenticated — Profile & Password */}
              <Route
                path="/profile"
                element={
                  <ProtectedRoute allowedRoles={['Resident', 'Technician', 'Admin']} currentRole={userRole}>
                    <ProfilePage />
                  </ProtectedRoute>
                }
              />

              {/* Resident routes — Strictly Resident & Admin */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute allowedRoles={['Resident', 'Admin']} currentRole={userRole}>
                    <UserDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/water-monitoring"
                element={
                  <ProtectedRoute allowedRoles={['Resident', 'Admin']} currentRole={userRole}>
                    <WaterMonitoringPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/alerts"
                element={
                  <ProtectedRoute allowedRoles={['Resident', 'Admin']} currentRole={userRole}>
                    <AlertsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/storage"
                element={
                  <ProtectedRoute allowedRoles={['Resident', 'Admin']} currentRole={userRole}>
                    <StoragePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/water-reuse"
                element={
                  <ProtectedRoute allowedRoles={['Resident', 'Admin']} currentRole={userRole}>
                    <WaterReusePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/weather"
                element={
                  <ProtectedRoute allowedRoles={['Resident', 'Admin']} currentRole={userRole}>
                    <WeatherPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/citizen-portal"
                element={
                  <ProtectedRoute allowedRoles={['Resident', 'Admin']} currentRole={userRole}>
                    <CitizenComplaintPortal />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/complaints"
                element={
                  <ProtectedRoute allowedRoles={['Resident', 'Admin']} currentRole={userRole}>
                    <CitizenComplaintPortal />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/sos"
                element={
                  <ProtectedRoute allowedRoles={['Resident', 'Admin']} currentRole={userRole}>
                    <SosPage />
                  </ProtectedRoute>
                }
              />
              {/* Payment routes */}
              <Route
                path="/payments"
                element={
                  <ProtectedRoute allowedRoles={['Resident', 'Admin']} currentRole={userRole}>
                    <PaymentDashboardPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/payments/checkout"
                element={
                  <ProtectedRoute allowedRoles={['Resident', 'Admin']} currentRole={userRole}>
                    <PaymentCheckoutPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/payments/invoices"
                element={
                  <ProtectedRoute allowedRoles={['Resident', 'Admin']} currentRole={userRole}>
                    <InvoicesPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/payments/subscription"
                element={
                  <ProtectedRoute allowedRoles={['Resident', 'Admin']} currentRole={userRole}>
                    <SubscriptionPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/ai-prediction"
                element={
                  <ProtectedRoute allowedRoles={['Resident', 'Admin', 'Technician']} currentRole={userRole}>
                    <AiPredictionDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/ai-prediction/history"
                element={
                  <ProtectedRoute allowedRoles={['Resident', 'Admin', 'Technician']} currentRole={userRole}>
                    <PredictionHistoryPage />
                  </ProtectedRoute>
                }
              />

              {/* Technician routes — Strictly Technician & Admin */}
              <Route
                path="/system-health"
                element={
                  <ProtectedRoute allowedRoles={['Technician', 'Admin']} currentRole={userRole}>
                    <SystemHealthDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/maintenance/esp32"
                element={
                  <ProtectedRoute allowedRoles={['Technician', 'Admin']} currentRole={userRole}>
                    <Esp32Diagnostics />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/maintenance/sensors"
                element={
                  <ProtectedRoute allowedRoles={['Technician', 'Admin']} currentRole={userRole}>
                    <SensorDiagnostics />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/sensors"
                element={
                  <ProtectedRoute allowedRoles={['Technician', 'Admin']} currentRole={userRole}>
                    <SensorDiagnostics />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/maintenance/components"
                element={
                  <ProtectedRoute allowedRoles={['Technician', 'Admin']} currentRole={userRole}>
                    <ComponentsHealth />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/maintenance/work-orders"
                element={
                  <ProtectedRoute allowedRoles={['Technician', 'Admin']} currentRole={userRole}>
                    <WorkOrdersPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/maintenance"
                element={
                  <ProtectedRoute allowedRoles={['Technician', 'Admin']} currentRole={userRole}>
                    <WorkOrdersPage />
                  </ProtectedRoute>
                }
              />

              {/* Municipality admin routes — Strictly Admin */}
              <Route
                path="/municipality/dashboard"
                element={
                  <ProtectedRoute allowedRoles={['Admin']} currentRole={userRole}>
                    <MunicipalityDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/dashboard"
                element={
                  <ProtectedRoute allowedRoles={['Admin']} currentRole={userRole}>
                    <MunicipalityDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/approvals"
                element={
                  <ProtectedRoute allowedRoles={['Admin']} currentRole={userRole}>
                    <UserApprovalsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/pricing"
                element={
                  <ProtectedRoute allowedRoles={['Admin']} currentRole={userRole}>
                    <AdminPricingPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/municipality/systems"
                element={
                  <ProtectedRoute allowedRoles={['Admin']} currentRole={userRole}>
                    <MultiSystemMonitoringPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/systems"
                element={
                  <ProtectedRoute allowedRoles={['Admin']} currentRole={userRole}>
                    <MultiSystemMonitoringPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/municipality/map"
                element={
                  <ProtectedRoute allowedRoles={['Admin']} currentRole={userRole}>
                    <CityGisMapPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/map"
                element={
                  <ProtectedRoute allowedRoles={['Admin']} currentRole={userRole}>
                    <CityGisMapPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/municipality/complaints"
                element={
                  <ProtectedRoute allowedRoles={['Admin']} currentRole={userRole}>
                    <MunicipalityComplaintsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/complaints"
                element={
                  <ProtectedRoute allowedRoles={['Admin']} currentRole={userRole}>
                    <MunicipalityComplaintsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/municipality/emergency"
                element={
                  <ProtectedRoute allowedRoles={['Admin']} currentRole={userRole}>
                    <EmergencyMonitoringPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/emergency"
                element={
                  <ProtectedRoute allowedRoles={['Admin']} currentRole={userRole}>
                    <EmergencyMonitoringPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/analytics"
                element={
                  <ProtectedRoute allowedRoles={['Admin']} currentRole={userRole}>
                    <AiPredictionDashboard />
                  </ProtectedRoute>
                }
              />
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          </BrowserRouter>
        </SnackbarProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '@/context/AuthContext';
import Navbar from '@/components/Navbar';
import WhatsAppButton from '@/components/WhatsAppButton';
import AnalyticsTracker from '@/components/AnalyticsTracker';

// Pages
import Home from '@/pages/Home';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import Admin from '@/pages/Admin';
import VerificatorDashboard from '@/pages/VerificatorDashboard';
import Merchants from '@/pages/Merchants';
import Influencers from '@/pages/Influencers';
import Overview from '@/pages/Overview';
import FAQPage from '@/pages/FAQPage';

// Dashboard Pages
import DashboardLayout from '@/pages/dashboard/DashboardLayout';
import DashboardHome from '@/pages/dashboard/DashboardHome';
import Devices from '@/pages/dashboard/Devices';
import Transfers from '@/pages/dashboard/Transfers';
import Transactions from '@/pages/dashboard/Transactions';
import History from '@/pages/dashboard/History';
import Alerts from '@/pages/dashboard/Alerts';
import VerificatorPortal from '@/pages/dashboard/VerificatorPortal';
import VerificatorApply from '@/pages/dashboard/VerificatorApply';
import Substores from '@/pages/dashboard/Substores';
import Reports from '@/pages/dashboard/Reports';
import Subscription from '@/pages/dashboard/Subscription';

export default function App() {
  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <AuthProvider>
        <AnalyticsTracker />
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/verificator" element={<VerificatorDashboard />} />
          <Route path="/merchants" element={<Merchants />} />
          <Route path="/influencers" element={<Influencers />} />
          <Route path="/features" element={<Overview />} />
          <Route path="/faq" element={<FAQPage />} />
          <Route path="/admin" element={<Admin />} />

          {/* Dashboard Nested Routes */}
          <Route path="/dashboard" element={<DashboardLayout />}>
            <Route index element={<DashboardHome />} />
            <Route path="devices" element={<Devices />} />
            <Route path="transfers" element={<Transfers />} />
            <Route path="transactions" element={<Transactions />} />
            <Route path="history" element={<History />} />
            <Route path="alerts" element={<Alerts />} />
            <Route path="verificator" element={<VerificatorPortal />} />
            <Route path="verificator-apply" element={<VerificatorApply />} />
            <Route path="substores" element={<Substores />} />
            <Route path="reports" element={<Reports />} />
            <Route path="subscription" element={<Subscription />} />
          </Route>

          {/* Fallback Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <WhatsAppButton />
      </AuthProvider>
    </Router>
  );
}

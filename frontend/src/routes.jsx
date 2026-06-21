/**
 * routes.jsx — React Router 6 route tree for the Badlaav site.
 *
 * Public marketing + registration/payment only. The copied backend still
 * exposes admin/auth/account APIs, but this frontend does not route to them
 * (those legacy page files remain unrouted and can be removed in cleanup).
 *
 * AmbientMotionBoundary disables ambient animations on form paths
 * (/register, /contact) per the animation rules in CLAUDE.md.
 */
import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/layout/Layout.jsx';
import { AmbientMotionBoundary } from './components/animations/AmbientMotionBoundary.jsx';
import { AdminProtectedRoute } from './context/AdminProtectedRoute.jsx';
import { AdminLayout } from './components/admin/AdminLayout.jsx';
import { Spinner } from './components/ui/Spinner.jsx';

import HomePage from './pages/public/HomePage.jsx';
import RetreatPage from './pages/public/RetreatPage.jsx';
import BadlaavExperiencePage from './pages/public/BadlaavExperiencePage.jsx';
import VolunteerPage from './pages/public/VolunteerPage.jsx';
import PricingPage from './pages/public/PricingPage.jsx';
import AboutPage from './pages/public/AboutPage.jsx';
import GalleryPage from './pages/public/GalleryPage.jsx';
import ContactPage from './pages/public/ContactPage.jsx';
import RegisterPage from './pages/public/RegisterPage.jsx';
import PaymentSuccessPage from './pages/public/PaymentSuccessPage.jsx';
import LoginPage from './pages/public/LoginPage.jsx';
import PrivacyPage from './pages/public/PrivacyPage.jsx';
import TermsPage from './pages/public/TermsPage.jsx';
import RefundPage from './pages/public/RefundPage.jsx';
import CookiePolicyPage from './pages/public/CookiePolicyPage.jsx';
import CodeOfConductPage from './pages/public/CodeOfConductPage.jsx';
import NotFoundPage from './pages/public/NotFoundPage.jsx';

// Admin pages — lazy-loaded so they never enter the public bundle.
const AdminDashboardPage     = lazy(() => import('./pages/admin/AdminDashboardPage.jsx'));
const AdminBatchesPage       = lazy(() => import('./pages/admin/AdminBatchesPage.jsx'));
const AdminBatchFormPage     = lazy(() => import('./pages/admin/AdminBatchFormPage.jsx'));
const AdminCouponsPage       = lazy(() => import('./pages/admin/AdminCouponsPage.jsx'));
const AdminRegistrationsPage = lazy(() => import('./pages/admin/AdminRegistrationsPage.jsx'));
const AdminReportsPage       = lazy(() => import('./pages/admin/AdminReportsPage.jsx'));
const AdminEnquiriesPage     = lazy(() => import('./pages/admin/AdminEnquiriesPage.jsx'));
const AdminInvoicesPage      = lazy(() => import('./pages/admin/AdminInvoicesPage.jsx'));
const AdminSettingsPage      = lazy(() => import('./pages/admin/AdminSettingsPage.jsx'));

function AdminSuspense({ children }) {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-20">
          <Spinner size={24} />
        </div>
      }
    >
      {children}
    </Suspense>
  );
}

export default function AppRoutes() {
  return (
    <Routes>
      <Route
        element={
          <AmbientMotionBoundary>
            <Layout />
          </AmbientMotionBoundary>
        }
      >
        {/* Marketing */}
        <Route path="/" element={<HomePage />} />
        <Route path="/retreat" element={<RetreatPage />} />
        <Route path="/badlaav-experience" element={<BadlaavExperiencePage />} />
        <Route path="/volunteer" element={<VolunteerPage />} />
        <Route path="/pricing" element={<PricingPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/gallery" element={<GalleryPage />} />
        <Route path="/contact" element={<ContactPage />} />

        {/* Registration + payment */}
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/register/*" element={<RegisterPage />} />
        <Route path="/payment-success" element={<PaymentSuccessPage />} />

        {/* Auth (shared — admins land at /admin/dashboard, members at /account/dashboard) */}
        <Route path="/login" element={<LoginPage />} />

        {/* Legal */}
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/refund" element={<RefundPage />} />
        <Route path="/cookies" element={<CookiePolicyPage />} />
        <Route path="/code-of-conduct" element={<CodeOfConductPage />} />

        {/* 404 */}
        <Route path="*" element={<NotFoundPage />} />
      </Route>

      {/* Admin panel — gated by role, lazy-loaded, own layout (no public chrome). */}
      <Route path="/admin" element={<AdminProtectedRoute />}>
        <Route element={<AdminLayout />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="login" element={<Navigate to="/login?next=/admin/dashboard" replace />} />
          <Route path="dashboard"          element={<AdminSuspense><AdminDashboardPage /></AdminSuspense>} />
          <Route path="batches"            element={<AdminSuspense><AdminBatchesPage /></AdminSuspense>} />
          <Route path="batches/new"        element={<AdminSuspense><AdminBatchFormPage /></AdminSuspense>} />
          <Route path="batches/:id/edit"   element={<AdminSuspense><AdminBatchFormPage /></AdminSuspense>} />
          <Route path="coupons"            element={<AdminSuspense><AdminCouponsPage /></AdminSuspense>} />
          <Route path="coupons/new"        element={<AdminSuspense><AdminCouponsPage /></AdminSuspense>} />
          <Route path="registrations"      element={<AdminSuspense><AdminRegistrationsPage /></AdminSuspense>} />
          <Route path="reports"            element={<AdminSuspense><AdminReportsPage /></AdminSuspense>} />
          <Route path="enquiries"          element={<AdminSuspense><AdminEnquiriesPage /></AdminSuspense>} />
          <Route path="invoices"           element={<AdminSuspense><AdminInvoicesPage /></AdminSuspense>} />
          <Route path="settings"           element={<AdminSuspense><AdminSettingsPage /></AdminSuspense>} />
          <Route path="*"                  element={<Navigate to="dashboard" replace />} />
        </Route>
      </Route>
    </Routes>
  );
}

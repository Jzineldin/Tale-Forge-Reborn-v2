import { Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Suspense, lazy } from 'react';
import { AuthProvider, useAuth } from '@/providers/AuthContext';
import { BillingProvider } from '@/providers/BillingContext';
import { SettingsProvider } from '@/providers/SettingsContext';
import MainLayout from '@/components/layout/MainLayout';
import AuthenticatedLayout from '@/components/layout/AuthenticatedLayout';
import AdminLayout from '@/components/layout/AdminLayout';
import ProtectedRoute from '@/components/routes/ProtectedRoute';
import AdminRoute from '@/components/routes/AdminRoute';
import PublicOnlyRoute from '@/components/routes/PublicOnlyRoute';
import './App.css';

// Lazy load all page components for optimal code splitting
// Public pages
const HomePage = lazy(() => import('@/pages/public/HomePage'));
const FeaturesPage = lazy(() => import('@/pages/public/FeaturesPage'));
const ShowcasePage = lazy(() => import('@/pages/public/ShowcasePage'));
const TestimonialsPage = lazy(() => import('@/pages/public/TestimonialsPage'));
const HelpPage = lazy(() => import('@/pages/public/HelpPage'));
const ContactPage = lazy(() => import('@/pages/public/ContactPage'));
const PrivacyPage = lazy(() => import('@/pages/legal/PrivacyPage'));
const TermsPage = lazy(() => import('@/pages/legal/TermsPage'));

// Auth pages
const SigninPage = lazy(() => import('@/pages/auth/SigninPage'));
const SignupPage = lazy(() => import('@/pages/auth/SignupPage'));
const AuthCallbackPage = lazy(() => import('@/pages/auth/AuthCallbackPage'));
const ResetPasswordPage = lazy(() => import('@/pages/auth/ResetPasswordPage'));

// Authenticated pages
const DashboardPage = lazy(() => import('@/pages/authenticated/DashboardPage'));
const StoriesHubPage = lazy(() => import('@/pages/authenticated/stories/StoriesHubPage'));
const StoryDiscoverPage = lazy(() => import('@/pages/authenticated/stories/StoryDiscoverPage'));
const StoryLibraryPage = lazy(() => import('@/pages/authenticated/stories/StoryLibraryPage'));
const StorySearchPage = lazy(() => import('@/pages/authenticated/stories/StorySearchPage'));
const StoryReaderPage = lazy(() => import('@/pages/authenticated/stories/StoryReaderPage'));
const StoryEditorPage = lazy(() => import('@/pages/authenticated/stories/StoryEditorPage'));
const CreateStoryPage = lazy(() => import('@/pages/authenticated/create/CreateStoryPage'));
const AccountPage = lazy(() => import('@/pages/authenticated/account/AccountPage'));
const AccountSettingsPage = lazy(() => import('@/pages/authenticated/account/AccountSettingsPage'));
const AccountBillingPage = lazy(() => import('@/pages/authenticated/account/AccountBillingPage'));
const ProfilePage = lazy(() => import('@/pages/authenticated/account/ProfilePage'));
const AccountExportPage = lazy(() => import('@/pages/authenticated/account/AccountExportPage'));
const AccountHistoryPage = lazy(() => import('@/pages/authenticated/account/AccountHistoryPage'));
const SearchPage = lazy(() => import('@/pages/authenticated/SearchPage'));
const NotificationsPage = lazy(() => import('@/pages/authenticated/NotificationsPage'));

// Admin pages
const AdminDashboardPage = lazy(() => import('@/pages/admin/AdminDashboardPage'));
const AdminAnalyticsPage = lazy(() => import('@/pages/admin/AdminAnalyticsPage'));
const AdminUsersPage = lazy(() => import('@/pages/admin/AdminUsersPage'));
const AdminContentPage = lazy(() => import('@/pages/admin/AdminContentPage'));
const AdminSystemPage = lazy(() => import('@/pages/admin/AdminSystemPage'));
const AdminSettingsPage = lazy(() => import('@/pages/admin/AdminSettingsPage'));

// Create React Query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

// Enhanced loading component
const LoadingScreen = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="text-center">
      <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-amber-400 mx-auto mb-4"></div>
      <p className="text-white text-lg font-medium">Loading Tale Forge...</p>
    </div>
  </div>
);

// Smaller loading component for page transitions
const PageLoader = () => (
  <div className="flex justify-center items-center h-64">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-400"></div>
  </div>
);

// Always show homepage - let users choose where to go
const HomePageWrapper = () => {
  return <MainLayout><HomePage /></MainLayout>;
};

// Main app content with optimized routing
const AppContent = () => {
  const { loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <div className="App min-h-screen">
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Home route - always show homepage */}
          <Route path="/" element={<HomePageWrapper />} />
          
          {/* Public routes */}
          <Route path="/features" element={<MainLayout><FeaturesPage /></MainLayout>} />
          <Route path="/showcase" element={<MainLayout><ShowcasePage /></MainLayout>} />
          <Route path="/testimonials" element={<MainLayout><TestimonialsPage /></MainLayout>} />
          <Route path="/help" element={<MainLayout><HelpPage /></MainLayout>} />
          <Route path="/contact" element={<MainLayout><ContactPage /></MainLayout>} />
          
          {/* Legal routes */}
          <Route path="/legal/privacy" element={<MainLayout><PrivacyPage /></MainLayout>} />
          <Route path="/legal/terms" element={<MainLayout><TermsPage /></MainLayout>} />
          
          {/* Authentication routes (public only) */}
          <Route path="/signin" element={
            <PublicOnlyRoute>
              <MainLayout><SigninPage /></MainLayout>
            </PublicOnlyRoute>
          } />
          <Route path="/signup" element={
            <PublicOnlyRoute>
              <MainLayout><SignupPage /></MainLayout>
            </PublicOnlyRoute>
          } />
          <Route path="/auth/callback" element={<MainLayout><AuthCallbackPage /></MainLayout>} />
          <Route path="/auth/reset-password" element={<MainLayout><ResetPasswordPage /></MainLayout>} />
          
          {/* Authenticated routes */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <AuthenticatedLayout><DashboardPage /></AuthenticatedLayout>
            </ProtectedRoute>
          } />
          
          {/* Stories ecosystem */}
          <Route path="/stories" element={
            <ProtectedRoute>
              <AuthenticatedLayout><StoriesHubPage /></AuthenticatedLayout>
            </ProtectedRoute>
          } />
          <Route path="/stories/discover" element={
            <ProtectedRoute>
              <AuthenticatedLayout><StoryDiscoverPage /></AuthenticatedLayout>
            </ProtectedRoute>
          } />
          <Route path="/stories/library" element={
            <ProtectedRoute>
              <AuthenticatedLayout><StoryLibraryPage /></AuthenticatedLayout>
            </ProtectedRoute>
          } />
          <Route path="/stories/search" element={
            <ProtectedRoute>
              <AuthenticatedLayout><StorySearchPage /></AuthenticatedLayout>
            </ProtectedRoute>
          } />
          <Route path="/stories/:id" element={
            <ProtectedRoute>
              <AuthenticatedLayout><StoryReaderPage /></AuthenticatedLayout>
            </ProtectedRoute>
          } />
          <Route path="/stories/:id/edit" element={
            <ProtectedRoute>
              <AuthenticatedLayout><StoryEditorPage /></AuthenticatedLayout>
            </ProtectedRoute>
          } />
          
          {/* Story creation */}
          <Route path="/create" element={
            <ProtectedRoute>
              <AuthenticatedLayout><CreateStoryPage /></AuthenticatedLayout>
            </ProtectedRoute>
          } />
          
          {/* Account management */}
          <Route path="/account" element={
            <ProtectedRoute>
              <AuthenticatedLayout><AccountPage /></AuthenticatedLayout>
            </ProtectedRoute>
          } />
          <Route path="/account/settings" element={
            <ProtectedRoute>
              <AuthenticatedLayout><AccountSettingsPage /></AuthenticatedLayout>
            </ProtectedRoute>
          } />
          <Route path="/account/billing" element={
            <ProtectedRoute>
              <AuthenticatedLayout><AccountBillingPage /></AuthenticatedLayout>
            </ProtectedRoute>
          } />
          <Route path="/account/profile" element={
            <ProtectedRoute>
              <AuthenticatedLayout><ProfilePage /></AuthenticatedLayout>
            </ProtectedRoute>
          } />
          <Route path="/account/export" element={
            <ProtectedRoute>
              <AuthenticatedLayout><AccountExportPage /></AuthenticatedLayout>
            </ProtectedRoute>
          } />
          <Route path="/account/history" element={
            <ProtectedRoute>
              <AuthenticatedLayout><AccountHistoryPage /></AuthenticatedLayout>
            </ProtectedRoute>
          } />
          
          {/* Other authenticated routes */}
          <Route path="/search" element={
            <ProtectedRoute>
              <AuthenticatedLayout><SearchPage /></AuthenticatedLayout>
            </ProtectedRoute>
          } />
          <Route path="/notifications" element={
            <ProtectedRoute>
              <AuthenticatedLayout><NotificationsPage /></AuthenticatedLayout>
            </ProtectedRoute>
          } />
          
          {/* Admin routes */}
          <Route path="/admin" element={
            <AdminRoute>
              <AdminLayout><AdminDashboardPage /></AdminLayout>
            </AdminRoute>
          } />
          <Route path="/admin/analytics" element={
            <AdminRoute>
              <AdminLayout><AdminAnalyticsPage /></AdminLayout>
            </AdminRoute>
          } />
          <Route path="/admin/users" element={
            <AdminRoute>
              <AdminLayout><AdminUsersPage /></AdminLayout>
            </AdminRoute>
          } />
          <Route path="/admin/content" element={
            <AdminRoute>
              <AdminLayout><AdminContentPage /></AdminLayout>
            </AdminRoute>
          } />
          <Route path="/admin/system" element={
            <AdminRoute>
              <AdminLayout><AdminSystemPage /></AdminLayout>
            </AdminRoute>
          } />
          <Route path="/admin/settings" element={
            <AdminRoute>
              <AdminLayout><AdminSettingsPage /></AdminLayout>
            </AdminRoute>
          } />
          
          {/* Catch-all 404 - redirect to home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </div>
  );
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <SettingsProvider>
          <BillingProvider>
            <AppContent />
          </BillingProvider>
        </SettingsProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
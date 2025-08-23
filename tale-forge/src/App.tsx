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

// Lazy load optimized page components for faster initial loads
// CORE PUBLIC PAGES (5 routes)
const HomePage = lazy(() => import('@/pages/public/HomePage'));
const DiscoverPage = lazy(() => import('@/pages/public/DiscoverPage'));
const FeaturesPage = lazy(() => import('@/pages/public/FeaturesPage'));
const HelpPage = lazy(() => import('@/pages/public/HelpPage'));
const PrivacyPage = lazy(() => import('@/pages/legal/PrivacyPage'));
const TermsPage = lazy(() => import('@/pages/legal/TermsPage'));

// ESSENTIAL AUTH PAGES (3 routes)
const SigninPage = lazy(() => import('@/pages/auth/SigninPage'));
const SignupPage = lazy(() => import('@/pages/auth/SignupPage'));
const AuthCallbackPage = lazy(() => import('@/pages/auth/AuthCallbackPage'));

// CORE USER EXPERIENCE (8 routes)
const DashboardPage = lazy(() => import('@/pages/authenticated/DashboardPage'));
const StoriesHubPage = lazy(() => import('@/pages/authenticated/stories/StoriesHubPage'));
const StoryReaderPage = lazy(() => import('@/pages/authenticated/stories/StoryReaderPage'));
const StoryCompletePage = lazy(() => import('@/pages/authenticated/stories/StoryCompletePage'));
const CreateStoryPage = lazy(() => import('@/pages/authenticated/create/CreateStoryPage'));
const AccountPage = lazy(() => import('@/pages/authenticated/account/AccountPage'));
const ProfilePage = lazy(() => import('@/pages/authenticated/account/ProfilePage'));

// ESSENTIAL ADMIN PAGES (6 routes)
const AdminDashboardPage = lazy(() => import('@/pages/admin/AdminDashboardPage'));
const AdminUsersPage = lazy(() => import('@/pages/admin/AdminUsersPage'));
const AdminContentPage = lazy(() => import('@/pages/admin/AdminContentPage'));
const AdminSystemPage = lazy(() => import('@/pages/admin/AdminSystemPage'));
const AdminAIPage = lazy(() => import('@/pages/admin/AdminAIPage'));

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
          {/* CORE PUBLIC ROUTES (6 routes) */}
          <Route path="/" element={<HomePageWrapper />} />
          <Route path="/discover" element={<MainLayout><DiscoverPage /></MainLayout>} />
          <Route path="/features" element={<MainLayout><FeaturesPage /></MainLayout>} />
          <Route path="/help" element={<MainLayout><HelpPage /></MainLayout>} />
          <Route path="/legal/privacy" element={<MainLayout><PrivacyPage /></MainLayout>} />
          <Route path="/legal/terms" element={<MainLayout><TermsPage /></MainLayout>} />
          
          {/* ESSENTIAL AUTH ROUTES (3 routes) */}
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
          
          {/* CORE USER EXPERIENCE (8 routes) */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <AuthenticatedLayout><DashboardPage /></AuthenticatedLayout>
            </ProtectedRoute>
          } />
          <Route path="/stories" element={
            <ProtectedRoute>
              <AuthenticatedLayout><StoriesHubPage /></AuthenticatedLayout>
            </ProtectedRoute>
          } />
          <Route path="/stories/:id" element={
            <ProtectedRoute>
              <AuthenticatedLayout><StoryReaderPage /></AuthenticatedLayout>
            </ProtectedRoute>
          } />
          <Route path="/stories/:id/complete" element={
            <ProtectedRoute>
              <AuthenticatedLayout><StoryCompletePage /></AuthenticatedLayout>
            </ProtectedRoute>
          } />
          <Route path="/create" element={
            <ProtectedRoute>
              <AuthenticatedLayout><CreateStoryPage /></AuthenticatedLayout>
            </ProtectedRoute>
          } />
          <Route path="/account" element={
            <ProtectedRoute>
              <AuthenticatedLayout><AccountPage /></AuthenticatedLayout>
            </ProtectedRoute>
          } />
          <Route path="/account/profile" element={
            <ProtectedRoute>
              <AuthenticatedLayout><ProfilePage /></AuthenticatedLayout>
            </ProtectedRoute>
          } />
          
          {/* ESSENTIAL ADMIN ROUTES (6 routes) */}
          <Route path="/admin" element={
            <AdminRoute>
              <AdminLayout><AdminDashboardPage /></AdminLayout>
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
          <Route path="/admin/ai" element={
            <AdminRoute>
              <AdminLayout><AdminAIPage /></AdminLayout>
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
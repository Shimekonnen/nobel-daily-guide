import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import Layout from './components/Layout';
import TodayPage from './pages/TodayPage';
import WeekPage from './pages/WeekPage';
import AssessPage from './pages/AssessPage';
import ProgressPage from './pages/ProgressPage';
import BooksPage from './pages/BooksPage';
import SettingsPage from './pages/SettingsPage';
import CoachPage from './pages/CoachPage';
import AuthPage from './pages/AuthPage';
import SetupWizard from './pages/SetupWizard';
import { Loader2, Calendar } from 'lucide-react';

function LoadingScreen() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
      <div className="text-center">
        {/* App branding */}
        <div className="flex items-center justify-center gap-3 mb-6">
          <div className="p-3 bg-blue-100 rounded-xl">
            <Calendar className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Daily Guide</h1>
        </div>

        {/* Spinner */}
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin mx-auto mb-3" />
        <p className="text-gray-500">Loading your schedule...</p>
      </div>
    </div>
  );
}

function ConfigErrorScreen({ error }: { error: string }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-3xl">⚠️</span>
        </div>
        <h1 className="text-xl font-bold text-gray-900 mb-2">Configuration Error</h1>
        <p className="text-gray-600 mb-4">{error}</p>
        <div className="bg-gray-50 rounded-lg p-4 text-left text-sm">
          <p className="font-medium text-gray-700 mb-2">To fix this:</p>
          <ol className="list-decimal list-inside text-gray-600 space-y-1">
            <li>Go to Vercel Dashboard → Settings → Environment Variables</li>
            <li>Add <code className="bg-gray-200 px-1 rounded">VITE_SUPABASE_URL</code></li>
            <li>Add <code className="bg-gray-200 px-1 rounded">VITE_SUPABASE_ANON_KEY</code></li>
            <li>Redeploy the application</li>
          </ol>
        </div>
      </div>
    </div>
  );
}

function App() {
  const { user, childProfile, loading, configError, connectionError } = useAuth();

  // Show config error if Supabase is not configured
  if (configError) {
    return <ConfigErrorScreen error={configError} />;
  }

  // Show loading screen while checking auth state (max 3 seconds due to timeout)
  if (loading) {
    return <LoadingScreen />;
  }

  // Not logged in (or connection failed) - show auth page
  // Connection errors will be displayed on the auth page
  if (!user) {
    return (
      <Routes>
        <Route path="/auth" element={<AuthPage connectionError={connectionError} />} />
        <Route path="*" element={<Navigate to="/auth" replace />} />
      </Routes>
    );
  }

  // Logged in but no child profile - show setup wizard
  if (!childProfile) {
    return (
      <Routes>
        <Route path="/setup" element={<SetupWizard />} />
        <Route path="*" element={<Navigate to="/setup" replace />} />
      </Routes>
    );
  }

  // Fully authenticated with profile - show main app
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Navigate to="/today" replace />} />
        <Route path="today" element={<TodayPage />} />
        <Route path="week" element={<WeekPage />} />
        <Route path="assess" element={<AssessPage />} />
        <Route path="progress" element={<ProgressPage />} />
        <Route path="books" element={<BooksPage />} />
        <Route path="coach" element={<CoachPage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>
      {/* Redirect auth/setup to main app if already set up */}
      <Route path="/auth" element={<Navigate to="/today" replace />} />
      <Route path="/setup" element={<Navigate to="/today" replace />} />
    </Routes>
  );
}

export default App;

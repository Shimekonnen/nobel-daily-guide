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
import { Loader2 } from 'lucide-react';

function LoadingScreen() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" />
        <p className="text-gray-500">Loading...</p>
      </div>
    </div>
  );
}

function App() {
  const { user, childProfile, loading } = useAuth();

  // Show loading screen while checking auth state
  if (loading) {
    return <LoadingScreen />;
  }

  // Not logged in - show auth page
  if (!user) {
    return (
      <Routes>
        <Route path="/auth" element={<AuthPage />} />
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

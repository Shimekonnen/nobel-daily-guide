import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import TodayPage from './pages/TodayPage';
import WeekPage from './pages/WeekPage';
import AssessPage from './pages/AssessPage';
import ProgressPage from './pages/ProgressPage';
import BooksPage from './pages/BooksPage';
import SettingsPage from './pages/SettingsPage';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Navigate to="/today" replace />} />
        <Route path="today" element={<TodayPage />} />
        <Route path="week" element={<WeekPage />} />
        <Route path="assess" element={<AssessPage />} />
        <Route path="progress" element={<ProgressPage />} />
        <Route path="books" element={<BooksPage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>
    </Routes>
  );
}

export default App;

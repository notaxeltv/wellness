import { HashRouter, Route, Routes } from 'react-router-dom';
import { AppShell } from '@/components/layout/AppShell';
import { Toaster } from '@/components/ui/sonner';
import DashboardPage from '@/pages/DashboardPage';
import WorkoutsPage from '@/pages/WorkoutsPage';
import NutritionPage from '@/pages/NutritionPage';
import ProgressPage from '@/pages/ProgressPage';
import ChatPage from '@/pages/ChatPage';
import SettingsPage from '@/pages/SettingsPage';
import { useAppBootstrap } from '@/hooks/useAppBootstrap';
import { useThemeSync } from '@/hooks/useThemeSync';

export default function App() {
  useAppBootstrap();
  useThemeSync();

  return (
    <HashRouter>
      <Toaster />
      <Routes>
        <Route element={<AppShell />}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/allenamenti" element={<WorkoutsPage />} />
          <Route path="/nutrizione" element={<NutritionPage />} />
          <Route path="/progressi" element={<ProgressPage />} />
          <Route path="/coach" element={<ChatPage />} />
          <Route path="/impostazioni" element={<SettingsPage />} />
        </Route>
      </Routes>
    </HashRouter>
  );
}

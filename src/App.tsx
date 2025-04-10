
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { AuthProvider } from './components/AuthProvider';
import { ThemeProvider } from './components/ThemeProvider';

// Layouts
import { Layout } from './components/layout/Layout';
import MainLayout from './components/layout/MainLayout';
import { LandingLayout } from './components/layout/LandingLayout';
import MobileLayout from './layouts/MobileLayout';

// Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/auth/Login';
import SignupPage from './pages/auth/Signup';
import ForgotPasswordPage from './pages/auth/ForgotPassword';
import DashboardPage from './pages/DashboardPage';
import TasksPage from './pages/TasksPage';
import FocusTasksPage from './pages/FocusTasksPage';
import EnergyPage from './pages/EnergyPage';
import AntiGooglitisPage from './pages/AntiGooglitisPage';
import FlowStatePage from './pages/FlowStatePage';
import BodyDoublingPage from './pages/BodyDoublingPage';
import ExecutiveFunctionPage from './pages/executive-function';
import ContextSwitchingPage from './pages/context-switching';
import DistractionBlockerPage from './pages/distraction-blocker';
import MentalHealthPage from './pages/MentalHealth';

// Mobile Pages
import MobileDashboard from './pages/mobile/MobileDashboard';
import MobileFocus from './pages/mobile/MobileFocus';
import MobileTasks from './pages/mobile/MobileTasks';
import MobileSettings from './pages/mobile/MobileSettings';

// Tool Pages
import MentalRotation from './pages/tools/MentalRotation';
import MemoryCards from './pages/tools/MemoryCards';
import Sleep from './pages/tools/Sleep';
import Light from './pages/tools/Light';
import MouthTaping from './pages/tools/MouthTaping';
import NootropicsDatabase from './pages/tools/NootropicsDatabase';
import HerbalTeaGuide from './pages/tools/HerbalTeaGuide';

// Create a new query client instance
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 1 minute
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="dark">
        <AuthProvider>
          <Router>
            <Routes>
              {/* Landing Pages */}
              <Route element={<LandingLayout />}>
                <Route path="/" element={<LandingPage />} />
              </Route>

              {/* Auth Pages */}
              <Route path="/auth">
                <Route path="login" element={<LoginPage />} />
                <Route path="signup" element={<SignupPage />} />
                <Route path="forgot-password" element={<ForgotPasswordPage />} />
              </Route>

              {/* Main Web App Routes */}
              <Route path="/app" element={<Layout />}>
                <Route path="dashboard" element={<DashboardPage />} />
                <Route path="tasks" element={<TasksPage />} />
                <Route path="focus-tasks" element={<FocusTasksPage />} />
                <Route path="energy" element={<EnergyPage />} />
                <Route path="anti-googlitis" element={<AntiGooglitisPage />} />
                <Route path="flow-state" element={<FlowStatePage />} />
                <Route path="body-doubling" element={<BodyDoublingPage />} />
                <Route path="executive-function" element={<ExecutiveFunctionPage />} />
                <Route path="context-switching" element={<ContextSwitchingPage />} />
                <Route path="distraction-blocker" element={<DistractionBlockerPage />} />
                <Route path="mental-health" element={<MentalHealthPage />} />
              </Route>

              {/* Mobile App Routes */}
              <Route path="/mobile" element={<MobileLayout />}>
                <Route path="dashboard" element={<MobileDashboard />} />
                <Route path="focus" element={<MobileFocus />} />
                <Route path="tasks" element={<MobileTasks />} />
                <Route path="settings" element={<MobileSettings />} />
              </Route>

              {/* Tool Pages */}
              <Route path="/tools">
                <Route path="mental-rotation" element={<MentalRotation />} />
                <Route path="memory-cards" element={<MemoryCards />} />
                <Route path="sleep" element={<Sleep />} />
                <Route path="light" element={<Light />} />
                <Route path="mouth-taping" element={<MouthTaping />} />
                <Route path="nootropics" element={<NootropicsDatabase />} />
                <Route path="herbal-tea" element={<HerbalTeaGuide />} />
              </Route>
            </Routes>
          </Router>
          <Toaster position="bottom-right" richColors />
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;

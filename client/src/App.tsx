import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import OnboardingPage from './pages/OnboardingPage';
import LoginPage from './pages/LoginPage';
import DashboardRouter from './pages/dashboard/DashboardRouter';
import ClientDashboard from './pages/dashboard/client/ClientDashboard';
import ClientOverviewPage from './pages/dashboard/client/ClientOverviewPage';
import ClientProjectsPage from './pages/dashboard/client/ClientProjectsPage';
import ClientDocumentsPage from './pages/dashboard/client/ClientDocumentsPage';
import AdminDashboard from './pages/dashboard/admin/AdminDashboard';
import AdminOverviewPage from './pages/dashboard/admin/AdminOverviewPage';
import AdminProjectsPage from './pages/dashboard/admin/AdminProjectsPage';
import AdminUsersPage from './pages/dashboard/admin/AdminUsersPage';
import AdminTasksPage from './pages/dashboard/admin/AdminTasksPage';
import FreelancerDashboard from './pages/dashboard/freelancer/FreelancerDashboard';
import FreelancerOverviewPage from './pages/dashboard/freelancer/FreelancerOverviewPage';
import FreelancerTasksPage from './pages/dashboard/freelancer/FreelancerTasksPage';
import FreelancerProfilePage from './pages/dashboard/freelancer/FreelancerProfilePage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/onboarding" element={<OnboardingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/dashboard" element={<DashboardRouter />} />
        <Route path="/dashboard/client" element={<ClientDashboard />}>
          <Route index element={<Navigate to="/dashboard/client/overview" replace />} />
          <Route path="overview" element={<ClientOverviewPage />} />
          <Route path="projects" element={<ClientProjectsPage />} />
          <Route path="documents" element={<ClientDocumentsPage />} />
        </Route>
        <Route path="/dashboard/admin" element={<AdminDashboard />}>
          <Route index element={<Navigate to="/dashboard/admin/overview" replace />} />
          <Route path="overview" element={<AdminOverviewPage />} />
          <Route path="projects" element={<AdminProjectsPage />} />
          <Route path="users" element={<AdminUsersPage />} />
          <Route path="tasks" element={<AdminTasksPage />} />
        </Route>
        <Route path="/dashboard/freelancer" element={<FreelancerDashboard />}>
          <Route index element={<Navigate to="/dashboard/freelancer/overview" replace />} />
          <Route path="overview" element={<FreelancerOverviewPage />} />
          <Route path="tasks" element={<FreelancerTasksPage />} />
          <Route path="profile" element={<FreelancerProfilePage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

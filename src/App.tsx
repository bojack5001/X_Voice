import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { DataProvider } from './context/DataContext';
import { MainLayout } from './components/layout/MainLayout';

// 13 Pages
import { OverviewDashboard } from './pages/OverviewDashboard';
import { DriverOnboarding } from './pages/DriverOnboarding';
import { ExcelLeadImport } from './pages/ExcelLeadImport';
import { PassengerManagement } from './pages/PassengerManagement';
import { DriverEngagement } from './pages/DriverEngagement';
import { AICallManagement } from './pages/AICallManagement';
import { LiveCallMonitor } from './pages/LiveCallMonitor';
import { CallHistory } from './pages/CallHistory';
import { FollowUpTasks } from './pages/FollowUpTasks';
import { EmployeeManagement } from './pages/EmployeeManagement';
import { AIAgentSettings } from './pages/AIAgentSettings';
import { ReportsAnalytics } from './pages/ReportsAnalytics';
import { SettingsPage } from './pages/SettingsPage';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <DataProvider>
          <Routes>
            <Route path="/" element={<MainLayout />}>
              <Route index element={<OverviewDashboard />} />
              <Route path="dashboard" element={<Navigate to="/" replace />} />
              <Route path="drivers" element={<DriverOnboarding />} />
              <Route path="leads/import" element={<ExcelLeadImport />} />
              <Route path="passengers" element={<PassengerManagement />} />
              <Route path="driver-engagement" element={<DriverEngagement />} />
              <Route path="calls/management" element={<AICallManagement />} />
              <Route path="calls/live" element={<LiveCallMonitor />} />
              <Route path="calls/history" element={<CallHistory />} />
              <Route path="tasks" element={<FollowUpTasks />} />
              <Route path="employees" element={<EmployeeManagement />} />
              <Route path="ai-settings" element={<AIAgentSettings />} />
              <Route path="reports" element={<ReportsAnalytics />} />
              <Route path="settings" element={<SettingsPage />} />
              {/* Catch-all redirect */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        </DataProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;


/**
 * FinAI - AI-Powered Financial Audit Platform
 * منصة التدقيق المالي الذكية
 * 
 * Arabic-first (RTL) Auditor Dashboard
 */
import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Layout
import { RTLLayout, AuthProvider, useAuth } from './components/layout/RTLLayout';

// Pages
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import FindingsPage from './pages/FindingsPage';
import VATPage from './pages/VATPage';
import ZakatPage from './pages/ZakatPage';
import InvoicesPage from './pages/InvoicesPage';
import ReportsPage from './pages/ReportsPage';
import OrganizationsPage from './pages/OrganizationsPage';

// Hooks
import { useOrganizations } from './lib/hooks';

// Styles
import './index.css';

// Create React Query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30 * 1000, // 30 seconds
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

// Protected Route wrapper
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('finai_token');
  
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

// Main App Content with organization context
const AppContent = () => {
  const [currentOrg, setCurrentOrg] = useState(null);
  const { data: orgsData } = useOrganizations();

  // Set default organization
  useEffect(() => {
    if (orgsData?.results?.length > 0 && !currentOrg) {
      // Default to first Saudi org or first available
      const saudiOrg = orgsData.results.find(o => o.country === 'SA');
      setCurrentOrg(saudiOrg || orgsData.results[0]);
    }
  }, [orgsData, currentOrg]);

  const organizations = orgsData?.results || [];

  return (
    <RTLLayout 
      organizations={organizations}
      currentOrg={currentOrg}
      onOrgChange={setCurrentOrg}
    >
      <Routes>
        <Route 
          path="/" 
          element={<DashboardPage organizationId={currentOrg?.id} />} 
        />
        <Route 
          path="/findings" 
          element={<FindingsPage organizationId={currentOrg?.id} />} 
        />
        <Route 
          path="/vat" 
          element={<VATPage organizationId={currentOrg?.id} />} 
        />
        <Route 
          path="/zakat" 
          element={<ZakatPage organizationId={currentOrg?.id} />} 
        />
        <Route 
          path="/invoices" 
          element={<InvoicesPage organizationId={currentOrg?.id} />} 
        />
        <Route 
          path="/reports" 
          element={<ReportsPage organizationId={currentOrg?.id} />} 
        />
        <Route 
          path="/organizations" 
          element={<OrganizationsPage onSelectOrg={setCurrentOrg} />} 
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </RTLLayout>
  );
};

// Root App Component
function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return !!localStorage.getItem('finai_token');
  });

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('finai_token');
    localStorage.removeItem('finai_refresh');
    localStorage.removeItem('finai_user');
    setIsAuthenticated(false);
  };

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route 
              path="/login" 
              element={
                isAuthenticated ? (
                  <Navigate to="/" replace />
                ) : (
                  <LoginPage onLogin={handleLogin} />
                )
              } 
            />
            <Route 
              path="/*" 
              element={
                <ProtectedRoute>
                  <AppContent />
                </ProtectedRoute>
              } 
            />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;

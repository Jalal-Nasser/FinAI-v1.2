/**
 * RTL Layout Component - تخطيط من اليمين إلى اليسار
 * Main layout wrapper for the Arabic-first dashboard
 */
import React, { createContext, useContext, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  AlertTriangle, 
  FileText, 
  Receipt, 
  Calculator,
  Building2,
  Settings,
  LogOut,
  ChevronDown,
  Menu
} from 'lucide-react';

// Auth Context
const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('finai_user');
    return saved ? JSON.parse(saved) : null;
  });

  const login = (userData, token) => {
    localStorage.setItem('finai_token', token);
    localStorage.setItem('finai_user', JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('finai_token');
    localStorage.removeItem('finai_user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

// Navigation Items - Arabic first
const navItems = [
  { 
    path: '/', 
    icon: LayoutDashboard, 
    label_ar: 'لوحة المعلومات', 
    label_en: 'Dashboard' 
  },
  { 
    path: '/findings', 
    icon: AlertTriangle, 
    label_ar: 'ملاحظات التدقيق', 
    label_en: 'Audit Findings' 
  },
  { 
    path: '/vat', 
    icon: Receipt, 
    label_ar: 'ضريبة القيمة المضافة', 
    label_en: 'VAT' 
  },
  { 
    path: '/zakat', 
    icon: Calculator, 
    label_ar: 'الزكاة', 
    label_en: 'Zakat' 
  },
  { 
    path: '/invoices', 
    icon: FileText, 
    label_ar: 'الفواتير الإلكترونية', 
    label_en: 'E-Invoices' 
  },
  { 
    path: '/reports', 
    icon: FileText, 
    label_ar: 'التقارير', 
    label_en: 'Reports' 
  },
  { 
    path: '/organizations', 
    icon: Building2, 
    label_ar: 'المنشآت', 
    label_en: 'Organizations' 
  },
];

// Sidebar Navigation
const Sidebar = ({ isOpen, onClose }) => {
  const location = useLocation();
  const { logout } = useAuth();

  return (
    <aside 
      className={`fixed inset-y-0 right-0 z-50 w-64 bg-card border-l border-border 
                  transform transition-transform duration-200 ease-in-out
                  lg:relative lg:translate-x-0
                  ${isOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}`}
    >
      {/* Logo */}
      <div className="h-16 flex items-center justify-center border-b border-border">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-bold">FA</span>
          </div>
          <div>
            <span className="font-bold text-lg">FinAI</span>
            <span className="text-xs text-muted-foreground block">منصة التدقيق المالي</span>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="p-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={onClose}
              className={`nav-item ${isActive ? 'active' : ''}`}
              data-testid={`nav-${item.path.replace('/', '') || 'dashboard'}`}
            >
              <Icon className="w-5 h-5" />
              <span>{item.label_ar}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-border">
        <button
          onClick={logout}
          className="nav-item w-full text-red-400 hover:text-red-300 hover:bg-red-500/10"
          data-testid="logout-btn"
        >
          <LogOut className="w-5 h-5" />
          <span>تسجيل الخروج</span>
        </button>
      </div>
    </aside>
  );
};

// Header
const Header = ({ onMenuClick, currentOrg, organizations, onOrgChange }) => {
  const { user } = useAuth();
  const [showOrgDropdown, setShowOrgDropdown] = useState(false);

  return (
    <header className="h-16 bg-card border-b border-border flex items-center justify-between px-6">
      {/* Mobile Menu Button */}
      <button 
        onClick={onMenuClick}
        className="lg:hidden p-2 hover:bg-secondary rounded-lg"
        data-testid="mobile-menu-btn"
      >
        <Menu className="w-6 h-6" />
      </button>

      {/* Organization Selector */}
      <div className="relative">
        <button
          onClick={() => setShowOrgDropdown(!showOrgDropdown)}
          className="flex items-center gap-2 px-4 py-2 bg-secondary rounded-lg hover:bg-secondary/80"
          data-testid="org-selector"
        >
          <Building2 className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm">{currentOrg?.name || 'اختر المنشأة'}</span>
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        </button>
        
        {showOrgDropdown && organizations?.length > 0 && (
          <div className="absolute top-full mt-2 right-0 w-64 bg-card border border-border rounded-lg shadow-lg z-50">
            {organizations.map((org) => (
              <button
                key={org.id}
                onClick={() => {
                  onOrgChange(org);
                  setShowOrgDropdown(false);
                }}
                className={`w-full text-right px-4 py-3 hover:bg-secondary transition-colors
                  ${currentOrg?.id === org.id ? 'bg-primary/10 text-primary' : ''}`}
              >
                <div className="font-medium">{org.name}</div>
                <div className="text-xs text-muted-foreground">{org.country} • {org.industry}</div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* User Info */}
      <div className="flex items-center gap-3">
        <div className="text-left">
          <div className="text-sm font-medium">{user?.name || 'المستخدم'}</div>
          <div className="text-xs text-muted-foreground">{user?.role || 'مدقق'}</div>
        </div>
        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
          <span className="text-primary font-medium">
            {(user?.name || 'م').charAt(0)}
          </span>
        </div>
      </div>
    </header>
  );
};

// Main Layout
export const RTLLayout = ({ children, organizations, currentOrg, onOrgChange }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background flex" dir="rtl">
      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        <Header 
          onMenuClick={() => setSidebarOpen(true)}
          currentOrg={currentOrg}
          organizations={organizations}
          onOrgChange={onOrgChange}
        />
        
        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default RTLLayout;

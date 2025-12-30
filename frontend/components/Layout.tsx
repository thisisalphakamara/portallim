
import React from 'react';
import { User, UserRole } from '../types';
import limlogo from '../assets/limlogo.png';

export type ActivePage = 'dashboard' | 'profile' | 'accounts' | 'approvals';

interface LayoutProps {
  children: React.ReactNode;
  user: User | null;
  onLogout: () => void;
  activePage: ActivePage;
  onNavigate: (page: ActivePage) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, user, onLogout, activePage, onNavigate }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [sidebarVisible, setSidebarVisible] = React.useState(true);

  const handleNavigate = (page: ActivePage) => {
    onNavigate(page);
    setMobileMenuOpen(false);
  };

  return (
    <div className="h-screen overflow-hidden flex flex-col md:flex-row bg-gray-50 text-black font-sans">
      {/* Mobile Header */}
      {user && (
        <div className="md:hidden flex items-center justify-between p-4 bg-white border-b border-gray-200 z-40 sticky top-0 safe-top">
          <div className="flex items-center space-x-3">
            <img src={limlogo} className="w-8 h-auto" alt="Logo" />
            <span className="text-xs font-black uppercase tracking-widest">LIM Portal</span>
          </div>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 -mr-2 rounded-lg hover:bg-gray-100 active:bg-gray-200 transition-colors"
          >
            {mobileMenuOpen ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
            )}
          </button>
        </div>
      )}

      {/* Mobile Menu Overlay */}
      {user && mobileMenuOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 z-30 backdrop-blur-sm transition-opacity"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      {user && (
        <aside className={`
          fixed md:relative inset-y-0 left-0 z-40
          w-[280px] md:w-72 bg-black text-white flex flex-col shadow-2xl md:shadow-none
          transform transition-transform duration-300 ease-[cubic-bezier(0.23,1,0.32,1)]
          ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
          ${!sidebarVisible ? 'md:-ml-72' : ''}
        `}>
          <div className="p-6 flex flex-col items-center border-b border-gray-800">
            <img src={limlogo} className="w-auto h-16 mb-4 filter drop-shadow-lg" alt="Limkokwing University Logo" />
            <div className="text-center">
              <h3 className="text-sm font-bold uppercase tracking-widest text-white">{user.name}</h3>
              <p className="text-[10px] uppercase tracking-wide text-gray-400 mt-1">{user.role}</p>
            </div>
          </div>

          <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-1">
            <div className="px-3 mb-2 text-[10px] font-black uppercase tracking-widest text-gray-500">Navigation</div>
            <NavItem
              label="Dashboard"
              active={activePage === 'dashboard'}
              onClick={() => handleNavigate('dashboard')}
              icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>}
            />
            <NavItem
              label="My Profile"
              active={activePage === 'profile'}
              onClick={() => handleNavigate('profile')}
              icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>}
            />
            {(user.role === UserRole.REGISTRAR || user.role === UserRole.SYSTEM_ADMIN) && (
              <NavItem
                label={user.role === UserRole.SYSTEM_ADMIN ? "Manage System Accounts" : "Create Account"}
                active={activePage === 'accounts'}
                onClick={() => handleNavigate('accounts')}
                icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg>}
              />
            )}
            {user.role === UserRole.REGISTRAR ? (
              <NavItem
                label="Student Accounts"
                active={activePage === 'approvals'}
                onClick={() => handleNavigate('approvals')}
                icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>}
              />
            ) : (user.role !== UserRole.STUDENT && user.role !== UserRole.SYSTEM_ADMIN) && (
              <NavItem
                label="Approvals"
                active={activePage === 'approvals'}
                onClick={() => handleNavigate('approvals')}
                icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
              />
            )}
          </nav>

          <div className="p-4 border-t border-gray-800">
            <button
              onClick={onLogout}
              className="group w-[120px] mx-auto flex items-center justify-center py-2 px-3 border border-gray-700 hover:bg-white hover:border-white transition-all rounded-lg"
            >
              <span className="text-xs font-black uppercase tracking-widest text-white group-hover:text-black transition-colors">Log Out</span>
            </button>
          </div>
        </aside>
      )}

      {/* Main Content */}
      <main className={`flex-1 flex flex-col h-full overflow-hidden transition-all duration-300 ${!sidebarVisible ? 'w-full' : ''}`}>
        {!user ? (
          <div className="flex-1 overflow-auto bg-white">{children}</div>
        ) : (
          <>
            <header className="hidden md:flex h-20 border-b border-gray-200 items-center justify-between px-8 bg-white/80 backdrop-blur sticky top-0 z-20">
              <div className="flex items-center space-x-4">
                <button
                  className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                  onClick={() => setSidebarVisible(v => !v)}
                  title={sidebarVisible ? "Collapse Sidebar" : "Expand Sidebar"}
                >
                  <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
                <h2 className="text-xl font-black uppercase tracking-tight text-gray-900">
                  {user.role.replace('_', ' ')}
                </h2>
              </div>
              <div className="flex items-center space-x-6">
              </div>
            </header>

            <div className="flex-1 overflow-auto overflow-x-hidden bg-gray-50 scroll-smooth">
              <div className="p-4 md:p-8 max-w-7xl mx-auto w-full">
                {children}
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
};

interface NavItemProps {
  label: string;
  active?: boolean;
  onClick?: () => void;
  badge?: number;
  icon?: React.ReactNode;
}

const NavItem: React.FC<NavItemProps> = ({ label, active, onClick, badge, icon }) => (
  <button
    onClick={onClick}
    className={`
      w-full text-left py-3 px-4 flex items-center justify-between transition-all duration-200 rounded-lg mb-1 group
      ${active
        ? 'bg-white text-black shadow-md translate-x-1'
        : 'text-gray-400 hover:bg-gray-900 hover:text-white hover:translate-x-1'
      }
    `}
  >
    <div className="flex items-center space-x-3">
      {icon && <span className={`opacity-70 ${active ? 'text-black' : 'group-hover:text-white'}`}>{icon}</span>}
      <span className="text-xs font-bold uppercase tracking-widest">{label}</span>
    </div>
    {badge !== undefined && badge > 0 && (
      <span className={`
        min-w-[20px] h-5 rounded-full flex items-center justify-center text-[10px] font-bold px-1.5
        ${active ? 'bg-black text-white' : 'bg-gray-700 text-white group-hover:bg-white group-hover:text-black'}
      `}>
        {badge > 99 ? '99+' : badge}
      </span>
    )}
  </button>
);

export default Layout;

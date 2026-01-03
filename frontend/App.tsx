import React, { useState, useEffect } from 'react';
import Layout, { ActivePage } from './components/Layout';
import StudentRegistration from './components/StudentRegistration';
import StaffDashboard from './components/StaffDashboard';
import AccountCreation from './components/AccountCreation';
import ProfilePage from './components/ProfilePage';
import SystemAdminDashboard from './components/SystemAdminDashboard';
import ChangePasswordModal from './components/ChangePasswordModal';
import StudentAccountsList from './components/StudentAccountsList';
import NotificationsPage from './components/NotificationsPage';
import { NotificationProvider } from './contexts/NotificationContext';
import { User, UserRole, RegistrationSubmission, RegistrationStatus } from './types';
import limlogo from './assets/limlogo.png';
import { login as apiLogin, logout as apiLogout, getCurrentUserProfile, changePassword as apiChangePassword } from './services/auth.service';
import { getRegistrations, approveRegistration, rejectRegistration, submitRegistration } from './services/registration.service';
import { getAllStaff, getStudents } from './services/admin.service';



const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [submissions, setSubmissions] = useState<RegistrationSubmission[]>([]);
  const [createdAccounts, setCreatedAccounts] = useState<User[]>([]);
  const [activePage, setActivePage] = useState<ActivePage>('dashboard');
  const [showFirstLoginModal, setShowFirstLoginModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [attemptsRemaining, setAttemptsRemaining] = useState<number | null>(null);
  const [loginLocked, setLoginLocked] = useState(false);
  const [lockedUntil, setLockedUntil] = useState<string | null>(null);

  // Check for existing session on mount
  useEffect(() => {
    checkSession();
  }, []);

  // Load registrations when user logs in
  useEffect(() => {
    if (user) {
      loadRegistrations();

      // Check if first login (Students only)
      if (user.isFirstLogin && user.role === UserRole.STUDENT) {
        setShowFirstLoginModal(true);
      }
    }
  }, [user]);

  // Load accounts when user logs in or navigates to relevant pages
  useEffect(() => {
    if (user && (activePage === 'accounts' || activePage === 'approvals')) {
      loadAuthorizedAccounts();
    } else if (user && user.role === UserRole.SYSTEM_ADMIN) {
      // System admin might need accounts loaded immediately for dashboard stats if any
      loadAuthorizedAccounts();
    }
  }, [user, activePage]);

  const loadAuthorizedAccounts = async () => {
    if (!user) return;

    try {
      if (user.role === UserRole.SYSTEM_ADMIN) {
        const staffResult = await getAllStaff();
        if (staffResult.success) {
          // Flatten faculty name for the UI
          const flattenedStaff = staffResult.staff.map((s: any) => ({
            ...s,
            name: s.fullName,
            faculty: s.faculty?.name
          }));
          setCreatedAccounts(flattenedStaff);
        }
      }

      if (user.role === UserRole.REGISTRAR || user.role === UserRole.SYSTEM_ADMIN) {
        const studentResult = await getStudents();
        if (studentResult.success) {
          const flattenedStudents = studentResult.students.map((s: any) => ({
            ...s,
            name: s.fullName || s.name,
            // Faculty and program are already flattened by backend, no need to access .name
            faculty: s.faculty,
            program: s.program
          }));

          if (user.role === UserRole.REGISTRAR) {
            setCreatedAccounts(flattenedStudents);
          } else {
            // System admin might want both, but for now let's just combine or prioritize
            setCreatedAccounts(prev => [...prev, ...flattenedStudents]);
          }
        }
      }
    } catch (error) {
      console.error('Error loading accounts:', error);
    }
  };

  const checkSession = async () => {
    try {
      const profile = await getCurrentUserProfile();
      if (profile) {
        setUser(profile);
      }
    } catch (error) {
      console.error('Session check error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadRegistrations = async () => {
    try {
      const result = await getRegistrations();
      if (result.success && result.registrations) {
        setSubmissions(result.registrations);
      }
    } catch (error) {
      console.error('Error loading registrations:', error);
    }
  };

  const handleLoginWithCredentials = async () => {
    if (!loginEmail || !loginPassword) {
      setLoginError('Please enter email and password');
      return;
    }

    setLoginLoading(true);
    setLoginError('');
    setAttemptsRemaining(null);
    setLoginLocked(false);
    setLockedUntil(null);

    try {
      const result = await apiLogin({
        email: loginEmail,
        password: loginPassword,
      });

      if (!result.success) {
        setLoginError(result.error || 'Login failed');

        if (result.attemptsRemaining !== undefined) {
          setAttemptsRemaining(result.attemptsRemaining);
        }

        if (result.isLocked && result.lockedUntil) {
          setLoginLocked(true);
          setLockedUntil(result.lockedUntil);
          setLoginError(`${result.error} Account locked until ${new Date(result.lockedUntil).toLocaleTimeString('en-GB', {
            hour: '2-digit',
            minute: '2-digit'
          })} on ${new Date(result.lockedUntil).toLocaleDateString('en-GB')}`);
        }

        if (result.isLocked) {
          setLoginError(`Account locked. ${result.error}`);
        }

        return;
      }

      // Successful login
      setUser(result.user!);
      setLoginEmail('');
      setLoginPassword('');
      setLoginError('');
      setAttemptsRemaining(null);
      setLoginLocked(false);
      setLockedUntil(null);
    } catch (error: any) {
      console.error('Login error:', error);
      setLoginError(error.message || 'An unexpected error occurred');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      apiLogout();
      setUser(null);
      setActivePage('dashboard');
      setSubmissions([]);
      setCreatedAccounts([]);
      setLoginLocked(false);
      setLockedUntil(null);
      setAttemptsRemaining(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleRegistrationSubmit = async (submissionData: any) => {
    try {
      const result = await submitRegistration(submissionData);
      if (result.success) {
        alert('Registration submitted successfully!');
        await loadRegistrations();
      } else {
        alert(result.error || 'Failed to submit registration');
      }
    } catch (error: any) {
      console.error('Submission error:', error);
      alert(error.message || 'Failed to submit registration');
    }
  };

  const handleApprove = async (id: string) => {
    if (!user) return;

    try {
      const result = await approveRegistration(id, 'Approved by staff');

      if (result.success) {
        alert(`Registration approved!`);
        // Reload registrations
        await loadRegistrations();
      } else {
        alert(result.error || 'Failed to approve registration');
      }
    } catch (error: any) {
      console.error('Approve error:', error);
      alert(error.message || 'Failed to approve registration');
    }
  };

  const handleReject = async (id: string) => {
    if (!user) return;

    const comments = prompt('Please enter reason for rejection:');
    if (!comments) return;

    try {
      const result = await rejectRegistration(id, comments);

      if (result.success) {
        alert('Registration rejected.');
        // Reload registrations
        await loadRegistrations();
      } else {
        alert(result.error || 'Failed to reject registration');
      }
    } catch (error: any) {
      console.error('Reject error:', error);
      alert(error.message || 'Failed to reject registration');
    }
  };

  const handleUpdateProfile = (updates: Partial<User>) => {
    if (user) {
      setUser({ ...user, ...updates });
    }
  };

  const handleFirstLoginPasswordChange = async (newPassword: string) => {
    try {
      const result = await apiChangePassword(newPassword);

      if (result.success) {
        if (user) {
          setUser({ ...user, isFirstLogin: false });
        }
        setShowFirstLoginModal(false);
        alert('Password changed successfully!');
      } else {
        alert(result.error || 'Failed to change password');
      }
    } catch (error: any) {
      console.error('Password change error:', error);
      alert(error.message || 'Failed to change password');
    }
  };

  const handleNavigate = (page: ActivePage) => {
    setActivePage(page);
  };

  // Show loading state while checking session
  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
          <p className="mt-4 text-sm font-bold uppercase tracking-widest">Loading...</p>
        </div>
      </div>
    );
  }

  // Login screen
  if (!user) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-8">
        <div className="max-w-md w-full text-center space-y-4">
          <div className="flex flex-col items-center">
            <div className="p-4">
              <img src={limlogo} className="w-48 h-auto" alt="Limkokwing University" />
            </div>
          </div>

          <div className="bg-white border border-black p-8 shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] w-full max-w-md">
            <h2 className="text-lg font-bold uppercase mb-6 tracking-widest border-b border-black pb-4">Student Registration Portal</h2>
            <div className="space-y-4 text-left">
              <p className="text-[10px] font-bold uppercase text-gray-400 mb-2">Welcome to Limkokwing University Student Registration Portal</p>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest">Email</label>
                <input
                  type="email"
                  value={loginEmail}
                  onChange={e => setLoginEmail(e.target.value)}
                  onKeyPress={e => e.key === 'Enter' && handleLoginWithCredentials()}
                  placeholder="you@limkokwing.edu.sl"
                  className="w-full p-3 border border-black text-xs"
                  disabled={loginLoading}
                />
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest">Password</label>
                <input
                  type="password"
                  value={loginPassword}
                  onChange={e => setLoginPassword(e.target.value)}
                  onKeyPress={e => e.key === 'Enter' && handleLoginWithCredentials()}
                  placeholder="Password"
                  className="w-full p-3 border border-black text-xs"
                  disabled={loginLoading}
                />
              </div>

              {loginError && (
                <div className="bg-red-50 border border-red-500 p-3 text-xs text-red-700">
                  {loginError}
                </div>
              )}

              {attemptsRemaining !== null && attemptsRemaining > 0 && (
                <p className="text-[10px] text-gray-500 text-center">
                  {attemptsRemaining} login attempts remaining
                </p>
              )}

              <div>
                <button
                  onClick={handleLoginWithCredentials}
                  disabled={loginLoading || loginLocked}
                  className="w-full py-3 bg-black text-white text-xs font-bold uppercase tracking-widest hover:bg-gray-800 transition-all duration-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loginLoading ? 'Logging in...' : loginLocked ? 'Locked' : 'Login'}
                </button>
              </div>

              {loginLocked && lockedUntil && (
                <p className="text-[10px] text-red-600 uppercase mt-3">
                  Account locked until {new Date(lockedUntil).toLocaleDateString('en-GB')} {new Date(lockedUntil).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                </p>
              )}

              {!loginLocked && attemptsRemaining !== null && attemptsRemaining > 0 && (
                <p className="text-[10px] text-gray-500 uppercase mt-3">
                  {attemptsRemaining} login attempt{attemptsRemaining > 1 ? 's' : ''} remaining
                </p>
              )}

              <div className="pt-8 text-center">
                <p className="text-[10px] font-bold uppercase tracking-widest text-black">
                  © {new Date().getFullYear()} Limkokwing University Online Registration System
                </p>
                <p className="text-[9px] uppercase mt-1 font-bold text-gray-500">All Rights Reserved</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const studentSubmission = submissions.find(s => s.studentId === user.id) || null;

  const renderContent = () => {
    if (!user) return null;

    // Notifications page for all users
    if (activePage === 'notifications') {
      return <NotificationsPage user={user} />;
    }

    // Profile page for all users
    if (activePage === 'profile') {
      return <ProfilePage user={user} onUpdateProfile={handleUpdateProfile} />;
    }

    // Account creation for Registrar and System Admin
    if (activePage === 'accounts' && (user.role === UserRole.REGISTRAR || user.role === UserRole.SYSTEM_ADMIN)) {
      return <AccountCreation currentUser={user} onAccountCreated={(newUser) => setCreatedAccounts([...createdAccounts, newUser])} />;
    }

    // Student Accounts view for Registrar
    if (activePage === 'approvals' && user.role === UserRole.REGISTRAR) {
      return <StudentAccountsList accounts={createdAccounts} />;
    }

    // Student dashboard
    if (user.role === UserRole.STUDENT) {
      return (
        <StudentRegistration
          user={user}
          onSubmitted={handleRegistrationSubmit}
          existingSubmission={studentSubmission}
        />
      );
    }

    // System Admin dashboard
    if (user.role === UserRole.SYSTEM_ADMIN) {
      return <SystemAdminDashboard />;
    }

    // Staff dashboard (Year Leader, Finance, Registrar)
    if (activePage === 'dashboard') {
      return (
        <StaffDashboard
          user={user}
          submissions={submissions}
          onApprove={handleApprove}
          onReject={handleReject}
        />
      );
    }

    return null;
  };

  return (
    <NotificationProvider>
      <Layout
        user={user}
        onLogout={handleLogout}
        activePage={activePage}
        onNavigate={handleNavigate}
      >
        {showFirstLoginModal && (
          <ChangePasswordModal
            isFirstLogin={true}
            onPasswordChanged={handleFirstLoginPasswordChange}
            onClose={() => {
              // Don't allow closing without changing password on first login
              if (!user.isFirstLogin) {
                setShowFirstLoginModal(false);
              }
            }}
          />
        )}
        {renderContent()}
      </Layout>
    </NotificationProvider>
  );
};

export default App;

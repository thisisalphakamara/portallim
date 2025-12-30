
import React, { useState, useEffect } from 'react';
import { UserRole, User, FacultyType, ProgramType as Program } from '../types';
import {
  createStaffAccount,
  createStudentAccount,
  getFaculties,
  getProgramsByFaculty
} from '../services/admin.service';
// import { sendStudentCredentialsEmail, SendStudentCredentialsPayload } from '../services/notification.service';


interface AccountCreationProps {
  onAccountCreated: (user: any) => void;
  currentUser: User | null;
}

const AccountCreation: React.FC<AccountCreationProps> = ({ onAccountCreated, currentUser }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<UserRole>(UserRole.STUDENT);
  const [studentId, setStudentId] = useState('');
  const [idType, setIdType] = useState<'National ID' | 'Passport Number'>('National ID');
  const [idValue, setIdValue] = useState('');
  const [currentYear, setCurrentYear] = useState(1);
  const [temporaryPassword, setTemporaryPassword] = useState('');

  const [faculties, setFaculties] = useState<FacultyType[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [selectedFacultyId, setSelectedFacultyId] = useState('');
  const [selectedProgramId, setSelectedProgramId] = useState('');

  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [createdCredentials, setCreatedCredentials] = useState<{
    email: string;
    password: string;
    studentId?: string;
    name: string;
    role: UserRole;
  } | null>(null);
  const [emailStatusMessage, setEmailStatusMessage] = useState<string | null>(null);
  const [isEmailSending, setIsEmailSending] = useState(false);

  // Set initial role based on who is logged in
  useEffect(() => {
    if (currentUser?.role === UserRole.SYSTEM_ADMIN) {
      setRole(UserRole.REGISTRAR); // System Admin defaults to creating Registrar
    } else {
      setRole(UserRole.STUDENT); // Registrar defaults to creating Student
    }
  }, [currentUser]);

  // Load faculties on mount
  useEffect(() => {
    loadFaculties();
  }, []);

  // Load programs when faculty changes
  useEffect(() => {
    if (selectedFacultyId && role === UserRole.STUDENT) {
      loadPrograms(selectedFacultyId);
    }
  }, [selectedFacultyId, role]);

  const loadFaculties = async () => {
    const result = await getFaculties();
    if (result.success && result.faculties) {
      setFaculties(result.faculties);
      if (result.faculties.length > 0) {
        setSelectedFacultyId(result.faculties[0].id);
      }
    }
  };

  const loadPrograms = async (facultyId: string) => {
    const result = await getProgramsByFaculty(facultyId);
    if (result.success && result.programs) {
      const uniqueProgramsByName = result.programs.filter((program, index, self) =>
        self.findIndex(p => p.name === program.name) === index
      );
      setPrograms(uniqueProgramsByName);
      if (uniqueProgramsByName.length > 0) {
        setSelectedProgramId(uniqueProgramsByName[0].id);
      }
    }
  };

  const generateStudentId = () => {
    const year = new Date().getFullYear().toString().slice(-2);
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `LIM${year}${random}`;
  };

  const generateTemporaryPassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$%';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  };

  const sendCredentialsByEmail = async (payload: any) => {
    setIsEmailSending(true);
    try {
      // await mockSendStudentCredentialsEmail(payload);
      setEmailStatusMessage(`Credentials ready for ${payload.email}.`);
    } catch (error: any) {
      console.error('Failed to email credentials:', error);
      setEmailStatusMessage(
        'Email delivery failed. Please copy the credentials below and share them securely.'
      );
    } finally {
      setIsEmailSending(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (role === UserRole.STUDENT && !studentId) {
      alert('Please enter a Student ID');
      return;
    }

    if (role === UserRole.STUDENT && !selectedProgramId) {
      alert('Please select a program');
      return;
    }

    if (!idValue) {
      alert(`Please enter the ${idType}`);
      return;
    }

    if (!temporaryPassword) {
      alert('Please generate a temporary password');
      return;
    }

    // Role specific requirements
    if (role === UserRole.YEAR_LEADER && !selectedFacultyId) {
      alert('Please select a faculty for this role');
      return;
    }

    setLoading(true);

    try {
      const accountData = {
        email,
        fullName: name,
        role: role,
        studentId: role === UserRole.STUDENT ? studentId : undefined,
        nationalId: idType === 'National ID' ? idValue : undefined,
        passportNumber: idType === 'Passport Number' ? idValue : undefined,
        facultyId: selectedFacultyId || undefined,
        programId: selectedProgramId || undefined,
        currentYear: role === UserRole.STUDENT ? currentYear : undefined,
        password: temporaryPassword,
      };

      const result = role === UserRole.STUDENT
        ? await createStudentAccount(accountData)
        : await createStaffAccount(accountData);

      if (result.success && result.user) {
        setCreatedCredentials({
          email,
          password: temporaryPassword,
          studentId: role === UserRole.STUDENT ? studentId : undefined,
          name,
          role: role
        });
        setShowSuccess(true);
        onAccountCreated(result.user);

        // Notify
        await sendCredentialsByEmail({
          email,
          fullName: name,
          studentId: role === UserRole.STUDENT ? studentId : 'STAFF',
          temporaryPassword,
        });
      } else {
        alert(result.error || 'Failed to create account');
      }
    } catch (error: any) {
      console.error('Account creation error:', error);
      alert(error.message || 'Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setName('');
    setEmail('');
    setStudentId('');
    setIdValue('');
    setCurrentYear(1);
    setTemporaryPassword('');
    setShowSuccess(false);
    setCreatedCredentials(null);
    setEmailStatusMessage(null);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
  };

  const isSystemAdmin = currentUser?.role === UserRole.SYSTEM_ADMIN;

  if (showSuccess && createdCredentials) {
    const roleType = createdCredentials.role === UserRole.STUDENT ? 'Student' : 'Staff';
    return (
      <div className="max-w-2xl mx-auto bg-white border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
        <div className="p-8 border-b-2 border-black bg-black text-white text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white text-black flex items-center justify-center text-2xl font-bold">
            ✓
          </div>
          <h3 className="text-2xl font-black uppercase">{roleType} Account Created Successfully</h3>
        </div>

        <div className="p-8 space-y-6">
          <div className="bg-gray-50 p-6 border-2 border-black space-y-4">
            <h4 className="text-sm font-black uppercase mb-4">Account Details</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-[10px] font-bold uppercase text-gray-400">Full Name</p>
                <p className="text-sm font-bold">{createdCredentials.name}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase text-gray-400">Role</p>
                <p className="text-sm font-bold">{createdCredentials.role.replace('_', ' ')}</p>
              </div>
              {createdCredentials.studentId && (
                <div>
                  <p className="text-[10px] font-bold uppercase text-gray-400">Student ID</p>
                  <p className="text-sm font-mono font-bold">{createdCredentials.studentId}</p>
                </div>
              )}
            </div>
          </div>

          <div className="p-6 border-2 border-black bg-yellow-50 space-y-4">
            <h4 className="text-sm font-black uppercase mb-4 flex items-center">
              <span className="mr-2">⚠️</span>
              Login Credentials - IMPORTANT
            </h4>

            <div className="space-y-4">
              <div className="bg-white p-4 border border-black">
                <p className="text-[10px] font-bold uppercase text-gray-400 mb-1">Email</p>
                <div className="flex items-center justify-between">
                  <p className="text-sm font-mono">{createdCredentials.email}</p>
                  <button onClick={() => copyToClipboard(createdCredentials.email)} className="px-3 py-1 border border-black text-[10px] font-bold uppercase hover:bg-black hover:text-white transition-colors">Copy</button>
                </div>
              </div>

              <div className="bg-white p-4 border border-black">
                <p className="text-[10px] font-bold uppercase text-gray-400 mb-1">Temporary Password</p>
                <div className="flex items-center justify-between">
                  <p className="text-sm font-mono font-bold">{createdCredentials.password}</p>
                  <button onClick={() => copyToClipboard(createdCredentials.password)} className="px-3 py-1 border border-black text-[10px] font-bold uppercase hover:bg-black hover:text-white transition-colors">Copy</button>
                </div>
              </div>
            </div>

            {emailStatusMessage && (
              <div className="p-3 bg-white border border-black">
                <p className="text-[10px] font-bold uppercase text-gray-600">{emailStatusMessage}</p>
              </div>
            )}

            <div className="mt-4 p-3 bg-red-50 border border-red-500">
              <p className="text-[10px] font-bold text-red-700 uppercase">
                ⚠️ Security Notice: These credentials will only be shown once. Please provide them to the user.
              </p>
            </div>
          </div>

          <div className="flex space-x-4">
            <button
              onClick={resetForm}
              className="flex-1 py-4 bg-black text-white font-bold uppercase tracking-widest hover:bg-gray-800 transition-colors"
            >
              Create Another Account
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto bg-white border-2 border-black p-10 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
      <h3 className="text-2xl font-black uppercase mb-8 border-b-2 border-black pb-4">
        {isSystemAdmin ? 'Manage System Accounts' : 'Create Student Account'}
      </h3>
      <p className="text-sm text-gray-600 mb-6">
        {isSystemAdmin
          ? 'Manage system staff accounts including Registrar, Finance, and Faculty staff. These accounts will have access to their respective dashboards.'
          : 'Create a new student account with secure login credentials. The student will be required to change their password on first login.'}
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">
        {isSystemAdmin && (
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-widest">Account Type / Role *</label>
            <select
              value={role}
              onChange={e => setRole(e.target.value as UserRole)}
              className="w-full p-3 border-2 border-black font-bold"
              required
            >
              <option value={UserRole.REGISTRAR}>Registrar</option>
              <option value={UserRole.FINANCE_OFFICER}>Finance Officer</option>
              <option value={UserRole.YEAR_LEADER}>Year Leader</option>
            </select>
          </div>
        )}

        <div className="space-y-1">
          <label className="text-[10px] font-bold uppercase tracking-widest">Full Name *</label>
          <input
            type="text" required value={name} onChange={e => setName(e.target.value)}
            className="w-full p-3 border-2 border-black outline-none focus:ring-2 focus:ring-black"
            placeholder="John Doe"
          />
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-bold uppercase tracking-widest">Institutional Email *</label>
          <input
            type="email" required value={email} onChange={e => setEmail(e.target.value)}
            placeholder={`${role.toLowerCase()}@limkokwing.edu.sl`}
            className="w-full p-3 border-2 border-black outline-none focus:ring-2 focus:ring-black"
          />
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-bold uppercase tracking-widest">Identification Type & Number *</label>
          <div className="flex space-x-0 border-2 border-black">
            <select
              value={idType}
              onChange={e => setIdType(e.target.value as any)}
              className="bg-gray-100 p-3 text-xs font-bold uppercase border-r-2 border-black outline-none w-1/3"
            >
              <option value="National ID">National ID</option>
              <option value="Passport Number">Passport</option>
            </select>
            <input
              type="text"
              required
              value={idValue}
              onChange={e => setIdValue(e.target.value)}
              className="flex-1 p-3 outline-none focus:bg-white transition-colors text-sm"
              placeholder={`Enter ${idType} number`}
            />
          </div>
        </div>

        {(role === UserRole.STUDENT || role === UserRole.YEAR_LEADER) && (
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-widest">Faculty *</label>
            <select
              value={selectedFacultyId} onChange={e => setSelectedFacultyId(e.target.value)}
              className="w-full p-3 border-2 border-black" required
            >
              <option value="">Select Faculty</option>
              {faculties.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
            </select>
          </div>
        )}

        {role === UserRole.STUDENT && (
          <>
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-widest">Program *</label>
              <select
                value={selectedProgramId} onChange={e => setSelectedProgramId(e.target.value)}
                required className="w-full p-3 border-2 border-black"
              >
                <option value="">Select Program</option>
                {programs.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-widest">Student ID *</label>
              <div className="flex space-x-3">
                <input
                  type="text" required value={studentId}
                  onChange={e => setStudentId(e.target.value.toUpperCase())}
                  className="flex-1 p-3 border-2 border-black font-mono"
                />
                <button type="button" onClick={() => setStudentId(generateStudentId())} className="px-4 py-3 border-2 border-black text-xs font-bold uppercase">Generate</button>
              </div>
            </div>
          </>
        )}

        <div className="space-y-1">
          <label className="text-[10px] font-bold uppercase tracking-widest">Temporary Password *</label>
          <div className="flex space-x-3">
            <input
              type="text" required value={temporaryPassword} onChange={e => setTemporaryPassword(e.target.value)}
              className="flex-1 p-3 border-2 border-black font-mono text-sm"
            />
            <button type="button" onClick={() => setTemporaryPassword(generateTemporaryPassword())} className="px-4 py-3 border-2 border-black text-xs font-bold uppercase">Generate</button>
          </div>
        </div>

        <div className="pt-6">
          <button
            type="submit" disabled={loading}
            className="w-full py-4 bg-black text-white font-bold uppercase tracking-widest hover:bg-gray-800 transition-colors disabled:opacity-50"
          >
            {loading ? 'Processing...' : `Create ${role.replace('_', ' ')} Account`}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AccountCreation;

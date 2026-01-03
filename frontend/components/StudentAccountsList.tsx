
import React, { useState } from 'react';
import { User, UserRole } from '../types';
import { deleteStudentAccount } from '../services/admin.service';
import { getCurrentSemester } from '../utils';

interface StudentAccountsListProps {
  accounts: User[];
}

const getStatusBadge = (status?: string) => {
  const s = status || 'NOT_STARTED';

  if (s === 'APPROVED') {
    return (
      <span className="px-2 py-1 bg-green-500 text-white text-[10px] font-bold uppercase">
        Approved
      </span>
    );
  }

  if (s === 'REJECTED') {
    return (
      <span className="px-2 py-1 bg-red-500 text-white text-[10px] font-bold uppercase">
        Rejected
      </span>
    );
  }

  if (s.startsWith('PENDING')) {
    return (
      <span className="px-2 py-1 bg-yellow-400 text-black text-[10px] font-bold uppercase">
        Pending
      </span>
    );
  }

  return (
    <span className="px-2 py-1 bg-gray-400 text-white text-[10px] font-bold uppercase">
      {s.replace(/_/g, ' ')}
    </span>
  );
};

const StudentAccountsList: React.FC<StudentAccountsListProps> = ({ accounts }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [facultyFilter, setFacultyFilter] = useState<string>('all');
  const [selectedStudent, setSelectedStudent] = useState<User | null>(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);

  const studentAccounts = accounts.filter(acc => acc.role === UserRole.STUDENT);

  // Create faculty mapping for filtering - handle both abbreviated and full names
  const facultyMapping: { [key: string]: string[] } = {
    'FICT': ['FICT', 'Faculty of Information & Communication Technology', 'Faculty of Information & Communication Technology (FICT)'],
    'FABE': ['FABE', 'Faculty of Architecture & Built Environment', 'Faculty of Architecture & Built Environment (FABE)'],
    'FCMB': ['FCMB', 'Faculty of Business & Management', 'Faculty of Business & Management (FCMB)']
  };

  const handleDeleteStudent = async (email: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete the student account for ${name} (${email})? This action cannot be undone.`)) {
      return;
    }

    try {
      const result = await deleteStudentAccount(email);
      if (result.success) {
        alert('Student account deleted successfully');
        window.location.reload(); // Refresh to show updated list
      } else {
        alert(result.error || 'Failed to delete student account');
      }
    } catch (error: any) {
      alert(error.message || 'Failed to delete student account');
    }
  };

  const handleViewDetails = (student: User) => {
    setSelectedStudent(student);
    setDetailsModalOpen(true);
  };

  const filteredAccounts = studentAccounts.filter(acc => {
    const matchesSearch = !searchQuery ||
      acc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      acc.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (acc.studentId && acc.studentId.toLowerCase().includes(searchQuery.toLowerCase()));

    // Handle faculty filtering with direct mapping
    let matchesFaculty = facultyFilter === 'all';
    if (facultyFilter !== 'all' && facultyMapping[facultyFilter]) {
      matchesFaculty = facultyMapping[facultyFilter].includes(acc.faculty || '');
    }

    return matchesSearch && matchesFaculty;
  });

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-black uppercase tracking-tight">Student Accounts</h2>
        <div className="text-[10px] font-bold text-gray-500 bg-gray-100 px-3 py-1 rounded">
          TOTAL: {studentAccounts.length}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard label="Total Students" value={studentAccounts.length.toString()} />
        <StatCard label="Active Accounts" value={studentAccounts.length.toString()} />
        <StatCard label="Faculties" value={Object.keys(facultyMapping).length.toString()} />
      </div>

      <div className="space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h3 className="text-xl font-bold uppercase tracking-widest">All Student Accounts</h3>
          <div className="flex flex-col md:flex-row gap-3">
            <input
              type="text"
              placeholder="Search by name, email or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="px-4 py-2 border border-black text-sm w-full md:w-64 focus:outline-none focus:ring-2 focus:ring-black"
            />
            <select
              value={facultyFilter}
              onChange={(e) => setFacultyFilter(e.target.value)}
              className="px-3 py-2 border border-black text-sm font-bold uppercase w-full md:w-24 focus:outline-none focus:ring-2 focus:ring-black"
            >
              <option value="all">ALL</option>
              {Object.keys(facultyMapping).map(abbreviation => (
                <option key={abbreviation} value={abbreviation}>{abbreviation}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="bg-white border border-black overflow-hidden overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-black text-white text-[10px] font-bold uppercase tracking-widest">
                <th className="p-4">Student ID</th>
                <th className="p-4">Name</th>
                <th className="p-4">Email</th>
                <th className="p-4 text-right">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="text-xs divide-y divide-gray-100">
              {filteredAccounts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-20 text-center text-gray-400 font-bold uppercase tracking-widest">
                    No student accounts found
                  </td>
                </tr>
              ) : (
                filteredAccounts.map(account => (
                  <tr key={account.id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-4 font-mono font-bold">{account.studentId || 'N/A'}</td>
                    <td className="p-4 font-bold">{account.name}</td>
                    <td className="p-4 font-mono text-gray-600">{account.email}</td>
                    <td className="p-4 text-right">
                      {getStatusBadge(account.registrationStatus)}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => handleViewDetails(account)}
                          className="px-3 py-1 bg-black text-white text-[10px] font-bold uppercase hover:bg-gray-800 transition-colors"
                        >
                          View Details
                        </button>
                        <button
                          onClick={() => handleDeleteStudent(account.email, account.name)}
                          className="px-3 py-1 bg-red-500 text-white text-[10px] font-bold uppercase hover:bg-red-600 transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Student Details Modal */}
      {selectedStudent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl border border-black max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-black uppercase tracking-widest">Student Complete Details</h3>
                <button
                  onClick={() => {
                    setDetailsModalOpen(false);
                    setSelectedStudent(null);
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-6">
                {/* Account Status */}
                <div className="flex items-center justify-between p-4 bg-gray-50 border border-gray-200">
                  <span className="text-xs font-bold uppercase">Account Status</span>
                  <span className="px-2 py-1 bg-black text-white text-[10px] font-bold uppercase">
                    {selectedStudent.isFirstLogin ? 'First Login' : 'Active'}
                  </span>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 border border-gray-200 mt-2">
                  <span className="text-xs font-bold uppercase">Registration Status</span>
                  {getStatusBadge(selectedStudent.registrationStatus)}
                </div>

                {/* Student Information */}
                <div className="space-y-6">
                  <h4 className="text-sm font-bold uppercase tracking-widest border-b border-gray-100 pb-2">Student Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                        Student Name
                      </label>
                      <p className="text-sm font-bold">{selectedStudent.name}</p>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                        Student ID
                      </label>
                      <p className="text-sm font-mono">{selectedStudent.studentId || 'N/A'}</p>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                        Email Address
                      </label>
                      <p className="text-sm font-bold">{selectedStudent.email}</p>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                        Phone Number
                      </label>
                      <p className="text-sm font-bold">{selectedStudent.phoneNumber || 'Not provided'}</p>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                        National ID
                      </label>
                      <p className="text-sm font-mono">{selectedStudent.nationalId || 'Not provided'}</p>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                        Sponsor Type
                      </label>
                      <p className="text-sm font-bold">{selectedStudent.sponsorType || 'Not specified'}</p>
                    </div>
                  </div>
                </div>

                {/* Academic Details */}
                <div className="space-y-6">
                  <h4 className="text-sm font-bold uppercase tracking-widest border-b border-gray-100 pb-2">Academic Details</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                        Faculty
                      </label>
                      <p className="text-sm font-bold">{selectedStudent.faculty || 'Not assigned'}</p>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                        Program
                      </label>
                      <p className="text-sm font-bold">{selectedStudent.program || 'Not assigned'}</p>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                        Current Year
                      </label>
                      <p className="text-sm font-bold">{selectedStudent.currentYear ? `Year ${selectedStudent.currentYear}` : 'Not specified'}</p>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                        Current Semester
                      </label>
                      <p className="text-sm font-bold">{getCurrentSemester(selectedStudent.currentYear)}</p>
                    </div>
                  </div>
                </div>

                {/* System Information */}
                <div className="space-y-6">
                  <h4 className="text-sm font-bold uppercase tracking-widest border-b border-gray-100 pb-2">System Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                        User Role
                      </label>
                      <p className="text-sm font-bold">{selectedStudent.role}</p>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                        Login Status
                      </label>
                      <p className="text-sm font-bold">
                        <span className="px-2 py-1 bg-green-100 text-green-800 text-[10px] font-bold uppercase border border-green-200">
                          {selectedStudent.isFirstLogin ? 'Pending First Login' : 'Active'}
                        </span>
                      </p>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end space-x-4 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => {
                      setDetailsModalOpen(false);
                      setSelectedStudent(null);
                    }}
                    className="px-4 py-2 border border-gray-200 text-sm font-bold uppercase hover:bg-gray-50 transition-colors"
                  >
                    Close
                  </button>
                  <button
                    onClick={() => {
                      if (selectedStudent) {
                        handleDeleteStudent(selectedStudent.email, selectedStudent.name);
                        setDetailsModalOpen(false);
                        setSelectedStudent(null);
                      }
                    }}
                    className="px-4 py-2 bg-red-500 text-white text-sm font-bold uppercase hover:bg-red-600 transition-colors"
                  >
                    Delete Account
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const StatCard: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="bg-white p-6 border border-black">
    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">{label}</p>
    <p className="text-3xl font-black">{value}</p>
  </div>
);

export default StudentAccountsList;

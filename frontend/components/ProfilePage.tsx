
import React, { useState } from 'react';
import { User, UserRole } from '../types';
import ChangePasswordModal from './ChangePasswordModal';

interface ProfilePageProps {
  user: User;
  onUpdateProfile: (updates: Partial<User>) => void;
}

const ProfilePage: React.FC<ProfilePageProps> = ({ user, onUpdateProfile }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [editedName, setEditedName] = useState(user.name);
  const [editedPhone, setEditedPhone] = useState(user.phoneNumber || '');
  const [editedAddress, setEditedAddress] = useState('');
  const [editedSponsorType, setEditedSponsorType] = useState(user.sponsorType || 'Self');
  const [showAcademic, setShowAcademic] = useState(true);
  const [showSecurity, setShowSecurity] = useState(false);

  const handleSave = () => {
    onUpdateProfile({ name: editedName, phoneNumber: editedPhone, sponsorType: editedSponsorType });
    setIsEditing(false);
    alert('Profile updated successfully');
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {showPasswordModal && (
        <ChangePasswordModal
          onPasswordChanged={() => {
            setShowPasswordModal(false);
            alert('Password changed successfully');
          }}
        />
      )}

      {/* Profile Summary Card */}
      <div className="bg-white border border-black rounded-lg flex items-center px-6 py-4 mb-2">
        <div className="w-16 h-16 rounded-full bg-black flex items-center justify-center text-white text-2xl font-black mr-4">
          {user.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-bold mb-1">{user.name}</h3>
          <p className="text-xs text-gray-500 mb-1">{user.email}</p>
          <div className="inline-block px-2 py-1 border border-black text-[10px] font-bold uppercase mr-2">
            {user.role}
          </div>
          {user.faculty && (
            <span className="inline-block px-2 py-1 border border-black text-[10px] font-bold uppercase">
              {user.faculty}
            </span>
          )}
        </div>
        <div>
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 border border-black text-xs font-bold uppercase tracking-widest hover:bg-gray-100 transition-colors"
            >
              Edit
            </button>
          ) : (
            <>
              <button
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 border border-black text-xs font-bold uppercase tracking-widest hover:bg-gray-100 transition-colors mr-2"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-black text-white text-xs font-bold uppercase tracking-widest hover:bg-gray-800 transition-colors"
              >
                Save
              </button>
            </>
          )}
        </div>
      </div>

      {/* Profile Details Grid */}
      <div className="bg-white border border-black rounded-lg px-6 py-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Full Name</label>
            {isEditing ? (
              <input type="text" value={editedName} onChange={e => setEditedName(e.target.value)} className="w-full p-2 border border-black text-sm focus:outline-none focus:ring-2 focus:ring-black" />
            ) : (
              <div className="py-2 px-3 bg-gray-50 border border-gray-200 text-sm">{user.name}</div>
            )}
          </div>
          <div>
            <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Email Address</label>
            <div className="py-2 px-3 bg-gray-50 border border-gray-200 text-sm flex items-center justify-between">
              <span>{user.email}</span>
              <span className="text-[10px] font-bold text-gray-400">VERIFIED</span>
            </div>
          </div>
          <div>
            <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">User ID</label>
            <div className="py-2 px-3 bg-gray-50 border border-gray-200 text-sm font-mono">{user.id}</div>
          </div>
          <div>
            <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Role</label>
            <div className="py-2 px-3 bg-gray-50 border border-gray-200 text-sm">{user.role}</div>
          </div>
          {user.nationalId && (
            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">National ID / Passport</label>
              <div className="py-2 px-3 bg-gray-50 border border-gray-200 text-sm">{user.nationalId.slice(0, 4)}****{user.nationalId.slice(-4)}</div>
            </div>
          )}
          {user.studentId && (
            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Student ID</label>
              <div className="py-2 px-3 bg-gray-50 border border-gray-200 text-sm font-mono font-bold">{user.studentId}</div>
            </div>
          )}
          {user.program && (
            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Designated Program</label>
              <div className="py-2 px-3 bg-gray-50 border border-gray-200 text-sm">{user.program}</div>
            </div>
          )}
          {user.role === UserRole.STUDENT && (
            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Enrollment Date</label>
              <div className="py-2 px-3 bg-gray-50 border border-gray-200 text-sm">{new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}</div>
            </div>
          )}
          <div>
            <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Phone Number</label>
            {isEditing ? (
              <input type="tel" value={editedPhone} onChange={e => setEditedPhone(e.target.value)} placeholder="+60 12-345 6789" className="w-full p-2 border border-black text-sm focus:outline-none focus:ring-2 focus:ring-black" />
            ) : (
              <div className="py-2 px-3 bg-gray-50 border border-gray-200 text-sm text-gray-400">{user.phoneNumber || 'Not provided'}</div>
            )}
          </div>
          <div>
            <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Sponsor Type</label>
            {isEditing ? (
              <select value={editedSponsorType} onChange={e => setEditedSponsorType(e.target.value as any)} className="w-full p-2 border border-black text-sm focus:outline-none focus:ring-2 focus:ring-black">
                <option value="Self">Self</option>
                <option value="Parent">Parent</option>
                <option value="Scholarship">Scholarship</option>
                <option value="Other">Other</option>
              </select>
            ) : (
              <div className="py-2 px-3 bg-gray-50 border border-gray-200 text-sm text-gray-400">{user.sponsorType || 'Not provided'}</div>
            )}
          </div>
          <div className="md:col-span-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Address</label>
            {isEditing ? (
              <input type="text" value={editedAddress} onChange={e => setEditedAddress(e.target.value)} placeholder="Enter your address" className="w-full p-2 border border-black text-sm focus:outline-none focus:ring-2 focus:ring-black" />
            ) : (
              <div className="py-2 px-3 bg-gray-50 border border-gray-200 text-sm text-gray-400">{editedAddress || 'Not provided'}</div>
            )}
          </div>
        </div>
      </div>

      {/* Collapsible Academic Information */}
      {user.role === UserRole.STUDENT && (
        <div className="bg-white border border-black rounded-lg px-6 py-4 mt-2">
          <button
            className="w-full text-left text-sm font-bold uppercase tracking-widest mb-2 focus:outline-none"
            onClick={() => setShowAcademic(!showAcademic)}
          >
            Academic Information {showAcademic ? '▲' : '▼'}
          </button>
          {showAcademic && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-[10px] font-bold uppercase text-gray-400 mb-1">Faculty</p>
                <p className="text-sm font-bold">{user.faculty || 'Not assigned'}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase text-gray-400 mb-1">Program</p>
                <p className="text-sm font-bold">{user.program || 'Not assigned'}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase text-gray-400 mb-1">Enrollment Status</p>
                <p className="text-sm font-bold">Active</p>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase text-gray-400 mb-1">Enrollment Date</p>
                <p className="text-sm font-bold">{new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Collapsible Security Settings (Students Only) */}
      {user.role === UserRole.STUDENT && (
        <div className="bg-white border border-black rounded-lg px-6 py-4 mt-2">
          <button
            className="w-full text-left text-sm font-bold uppercase tracking-widest mb-2 focus:outline-none"
            onClick={() => setShowSecurity(!showSecurity)}
          >
            Security Settings {showSecurity ? '▲' : '▼'}
          </button>
          {showSecurity && (
            <div className="flex items-center justify-between p-2 border border-gray-200 hover:border-black transition-colors rounded">
              <div>
                <p className="font-bold text-sm">Password</p>
                <p className="text-xs text-gray-500">Last changed: Never</p>
              </div>
              <button
                onClick={() => setShowPasswordModal(true)}
                className="px-4 py-2 border border-black text-xs font-bold uppercase hover:bg-black hover:text-white transition-colors"
              >
                Change Password
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ProfilePage;

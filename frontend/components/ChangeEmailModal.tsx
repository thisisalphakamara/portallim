import React, { useState } from 'react';
import { changeEmail } from '../services/auth.service';

interface ChangeEmailModalProps {
  currentEmail: string;
  onEmailChanged: (newEmail: string) => void;
  onClose: () => void;
}

const ChangeEmailModal: React.FC<ChangeEmailModalProps> = ({ currentEmail, onEmailChanged, onClose }) => {
  const [newEmail, setNewEmail] = useState('');
  const [confirmEmail, setConfirmEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (newEmail !== confirmEmail) {
      setError('Email addresses do not match');
      return;
    }

    if (newEmail === currentEmail) {
      setError('New email must be different from current email');
      return;
    }

    if (!password) {
      setError('Please enter your password to confirm the change');
      return;
    }

    setLoading(true);

    try {
      const result = await changeEmail(newEmail, password);

      if (result.success) {
        onEmailChanged(newEmail);
        onClose();
        alert('Email changed successfully! Please use your new email for future logins.');
      } else {
        setError(result.error || 'Failed to change email');
      }
    } catch (error: any) {
      setError(error.message || 'Failed to change email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl border border-black shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] max-w-md w-full">
        <div className="p-6">
          <h3 className="text-lg font-bold uppercase mb-4 tracking-widest border-b border-black pb-4">
            Change Email Address
          </h3>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Current Email</label>
              <div className="py-2 px-3 bg-gray-50 border border-gray-200 text-sm text-gray-600">
                {currentEmail}
              </div>
            </div>

            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest">New Email Address</label>
              <input
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="Enter new email address"
                className="w-full p-3 border border-black text-xs focus:outline-none focus:ring-2 focus:ring-black"
                required
                disabled={loading}
              />
            </div>

            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest">Confirm New Email</label>
              <input
                type="email"
                value={confirmEmail}
                onChange={(e) => setConfirmEmail(e.target.value)}
                placeholder="Confirm new email address"
                className="w-full p-3 border border-black text-xs focus:outline-none focus:ring-2 focus:ring-black"
                required
                disabled={loading}
              />
            </div>

            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your current password"
                className="w-full p-3 border border-black text-xs focus:outline-none focus:ring-2 focus:ring-black"
                required
                disabled={loading}
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-500 p-3 text-xs text-red-700">
                {error}
              </div>
            )}

            <div className="flex space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="flex-1 py-3 border border-black text-xs font-bold uppercase tracking-widest hover:bg-gray-100 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-3 bg-black text-white text-xs font-bold uppercase tracking-widest hover:bg-gray-800 transition-colors disabled:opacity-50"
              >
                {loading ? 'Changing...' : 'Change Email'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ChangeEmailModal;

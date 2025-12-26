
import React, { useState } from 'react';

interface ChangePasswordModalProps {
  onPasswordChanged: (newPassword: string) => void;
  isFirstLogin?: boolean;
  onClose?: () => void;
}

const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({ onPasswordChanged, isFirstLogin = false }) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [strength, setStrength] = useState(0);

  const checkPasswordStrength = (password: string) => {
    let score = 0;
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    return Math.min(score, 5);
  };

  const handleNewPasswordChange = (value: string) => {
    setNewPassword(value);
    setStrength(checkPasswordStrength(value));
    setError('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!isFirstLogin && !currentPassword) {
      setError('Please enter your current password');
      return;
    }

    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (strength < 3) {
      setError('Please choose a stronger password');
      return;
    }

    onPasswordChanged(newPassword);
  };

  const strengthLabels = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong'];
  const strengthColors = ['bg-gray-300', 'bg-gray-400', 'bg-gray-500', 'bg-gray-700', 'bg-black'];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white border-2 border-black w-full max-w-md shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
        <div className="p-6 border-b border-black">
          <h2 className="text-xl font-black uppercase tracking-tight">
            {isFirstLogin ? 'Set Your Password' : 'Change Password'}
          </h2>
          {isFirstLogin && (
            <p className="text-xs text-gray-500 mt-2">
              For security, you must set a new password on your first login.
            </p>
          )}
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {!isFirstLogin && (
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
                Current Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full p-3 border border-black text-sm focus:outline-none focus:ring-2 focus:ring-black"
                  placeholder="Enter current password"
                />
              </div>
            </div>
          )}

          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
              New Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => handleNewPasswordChange(e.target.value)}
                className="w-full p-3 border border-black text-sm focus:outline-none focus:ring-2 focus:ring-black"
                placeholder="Enter new password"
              />
            </div>
            {newPassword && (
              <div className="mt-2 space-y-1">
                <div className="flex space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <div
                      key={i}
                      className={`h-1 flex-1 ${i < strength ? strengthColors[strength - 1] : 'bg-gray-200'}`}
                    />
                  ))}
                </div>
                <p className="text-[10px] font-bold uppercase text-gray-500">
                  Strength: {strength > 0 ? strengthLabels[strength - 1] : 'Too Short'}
                </p>
              </div>
            )}
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
              Confirm New Password
            </label>
            <input
              type={showPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className={`w-full p-3 border text-sm focus:outline-none focus:ring-2 focus:ring-black ${confirmPassword && confirmPassword !== newPassword ? 'border-gray-400' : 'border-black'
                }`}
              placeholder="Confirm new password"
            />
            {confirmPassword && confirmPassword !== newPassword && (
              <p className="text-[10px] font-bold text-gray-500 mt-1">Passwords do not match</p>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="showPassword"
              checked={showPassword}
              onChange={(e) => setShowPassword(e.target.checked)}
              className="w-4 h-4 border-black"
            />
            <label htmlFor="showPassword" className="text-xs font-bold uppercase">
              Show passwords
            </label>
          </div>

          {error && (
            <div className="p-3 bg-gray-100 border border-black text-xs font-bold">
              {error}
            </div>
          )}

          <div className="pt-4 space-y-3">
            <button
              type="submit"
              className="w-full py-3 bg-black text-white text-xs font-bold uppercase tracking-widest hover:bg-gray-800 transition-colors"
            >
              {isFirstLogin ? 'Set Password & Continue' : 'Update Password'}
            </button>
          </div>
        </form>

        <div className="p-4 bg-gray-50 border-t border-black">
          <p className="text-[10px] text-gray-500 text-center">
            Password must be at least 8 characters with uppercase, lowercase, numbers, and symbols.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ChangePasswordModal;

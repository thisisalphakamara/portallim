import React from 'react';

interface SystemOfflineProps {
    currentSession?: string;
    currentAcademicYear?: string;
}

const SystemOffline: React.FC<SystemOfflineProps> = ({ currentSession, currentAcademicYear }) => {
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8">
            <div className="bg-gray-100 p-6 rounded-full mb-6">
                <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
            </div>

            <h2 className="text-3xl font-black uppercase tracking-tighter text-gray-900 mb-4">
                System Offline
            </h2>

            <div className="max-w-md mx-auto space-y-4">
                <p className="text-gray-600 font-medium text-lg leading-relaxed">
                    The registration system for <span className="text-black font-bold">{currentSession}</span> ({currentAcademicYear}) is currently offline.
                </p>

                <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 text-sm text-blue-800">
                    <p className="font-bold mb-1">Notice to Staff:</p>
                    Please contact the System Administrator to activate the portal when the registration period officially opens.
                </div>
            </div>
        </div>
    );
};

export default SystemOffline;

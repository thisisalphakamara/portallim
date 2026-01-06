import React from 'react';

interface RegistrationClosedProps {
    academicYear: string;
    session: string;
}

const RegistrationClosed: React.FC<RegistrationClosedProps> = ({ academicYear, session }) => {
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8 animate-fade-in-up">
            <div className="bg-gray-100 p-6 rounded-full mb-6 relative">
                <div className="absolute inset-0 bg-red-100 rounded-full animate-ping opacity-20"></div>
                <svg className="w-16 h-16 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
            </div>

            <h2 className="text-3xl font-black uppercase tracking-tighter text-gray-900 mb-4">
                Registration Closed
            </h2>

            <div className="max-w-md mx-auto space-y-4">
                <p className="text-gray-600 font-medium text-lg leading-relaxed">
                    The registration portal for the <span className="text-black font-bold border-b-2 border-green-400">{session}</span> session (<span className="text-black font-bold">{academicYear}</span>) is currently not accepting new submissions.
                </p>

                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-sm text-gray-500">
                    Please wait for an official announcement from the Registrar's Office regarding the opening of the next registration window.
                </div>
            </div>
        </div>
    );
};

export default RegistrationClosed;

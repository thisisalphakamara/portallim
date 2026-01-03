
import React, { useState, useEffect } from 'react';
import { RegistrationSubmission, RegistrationStatus } from '../types';
import { generateRegistrationSlip } from '../utils/pdfGenerator';
import limlogo from '../assets/limlogo.png';

interface RegistrationSlipsSectionProps {
    submissions: RegistrationSubmission[];
    registrarName: string;
}

type SlipStatus = 'idle' | 'generating' | 'generated' | 'downloaded';

interface SlipState {
    status: SlipStatus;
    url?: string;
}

const RegistrationSlipsSection: React.FC<RegistrationSlipsSectionProps> = ({ submissions, registrarName }) => {
    const [slipStates, setSlipStates] = useState<Record<string, SlipState>>({});

    // Load downloaded status from localStorage on mount
    useEffect(() => {
        const savedDownloaded = JSON.parse(localStorage.getItem('downloadedSlips') || '[]');
        if (savedDownloaded.length > 0) {
            const initialStates: Record<string, SlipState> = {};
            savedDownloaded.forEach((id: string) => {
                initialStates[id] = { status: 'downloaded' };
            });
            setSlipStates(prev => ({ ...prev, ...initialStates }));
        }
    }, []);

    // Filter only approved students for slips
    const approvedSubmissions = submissions.filter(s => s.status === RegistrationStatus.APPROVED);

    const handleGenerate = async (submission: RegistrationSubmission, autoDownload = false) => {
        setSlipStates(prev => ({
            ...prev,
            [submission.id]: { ...prev[submission.id], status: 'generating' }
        }));

        try {
            const blob = await generateRegistrationSlip(submission, registrarName, limlogo);
            const url = URL.createObjectURL(blob);

            if (autoDownload) {
                // Determine existing downloaded list
                const savedDownloaded = JSON.parse(localStorage.getItem('downloadedSlips') || '[]');

                // Trigger download immediately
                const link = document.createElement('a');
                link.href = url;
                link.download = `Registration_Slip_${submission.studentName.replace(/\s+/g, '_')}_${submission.academicStudentId || submission.studentId}.pdf`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);

                // Update localStorage if not already present
                if (!savedDownloaded.includes(submission.id)) {
                    localStorage.setItem('downloadedSlips', JSON.stringify([...savedDownloaded, submission.id]));
                }

                setSlipStates(prev => ({
                    ...prev,
                    [submission.id]: { status: 'downloaded', url }
                }));
            } else {
                setSlipStates(prev => ({
                    ...prev,
                    [submission.id]: { status: 'generated', url }
                }));
            }
        } catch (error) {
            console.error("Failed to generate slip", error);
            setSlipStates(prev => ({
                ...prev,
                [submission.id]: { status: 'idle' } // Reset on error
            }));
            alert("Failed to generate slip. Please try again.");
        }
    };

    const handleDownload = (submission: RegistrationSubmission) => {
        const state = slipStates[submission.id];

        // If URL is missing (e.g. after refresh), regenerate and download
        if (!state || !state.url) {
            handleGenerate(submission, true);
            return;
        }

        // Trigger download
        const link = document.createElement('a');
        link.href = state.url;
        link.download = `Registration_Slip_${submission.studentName.replace(/\s+/g, '_')}_${submission.academicStudentId || submission.studentId}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        // Update localStorage
        const savedDownloaded = JSON.parse(localStorage.getItem('downloadedSlips') || '[]');
        if (!savedDownloaded.includes(submission.id)) {
            localStorage.setItem('downloadedSlips', JSON.stringify([...savedDownloaded, submission.id]));
        }

        // Update state
        setSlipStates(prev => ({
            ...prev,
            [submission.id]: { ...state, status: 'downloaded' }
        }));
    };

    if (approvedSubmissions.length === 0) {
        return null;
    }

    return (
        <div className="space-y-4">
            <h3 className="text-xl font-bold uppercase tracking-widest">Registration Confirmation Slips</h3>
            <div className="bg-white border border-black overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-black text-white text-[10px] font-bold uppercase tracking-widest">
                                <th className="p-4">Student Name</th>
                                <th className="p-4">ID</th>
                                <th className="p-4">Program</th>
                                <th className="p-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {approvedSubmissions.map(submission => {
                                const state = slipStates[submission.id] || { status: 'idle' };

                                return (
                                    <tr key={submission.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="p-4 text-sm font-bold">{submission.studentName}</td>
                                        <td className="p-4 text-xs font-mono">{submission.academicStudentId || submission.studentId}</td>
                                        <td className="p-4 text-xs">{submission.program}</td>
                                        <td className="p-4 text-right">
                                            <div className="flex items-center justify-end space-x-2">
                                                {state.status === 'idle' && (
                                                    <button
                                                        onClick={() => handleGenerate(submission)}
                                                        className="px-4 py-2 bg-black text-white text-[10px] font-bold uppercase tracking-widest hover:bg-gray-800 transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,0.2)]"
                                                    >
                                                        Generate Slip
                                                    </button>
                                                )}

                                                {state.status === 'generating' && (
                                                    <button
                                                        disabled
                                                        className="px-4 py-2 bg-gray-200 text-gray-500 text-[10px] font-bold uppercase tracking-widest cursor-wait"
                                                    >
                                                        Generating...
                                                    </button>
                                                )}

                                                {state.status === 'generated' && (
                                                    <button
                                                        onClick={() => handleDownload(submission)}
                                                        className="px-4 py-2 bg-black text-white text-[10px] font-bold uppercase tracking-widest hover:bg-gray-800 transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,0.2)] flex items-center gap-2"
                                                    >
                                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                                                        Download Slip
                                                    </button>
                                                )}

                                                {state.status === 'downloaded' && (
                                                    <div className="flex items-center space-x-2">
                                                        <span className="text-[10px] font-bold uppercase text-green-600 flex items-center bg-green-50 px-2 py-1 rounded border border-green-200">
                                                            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                                            Downloaded
                                                        </span>
                                                        <button
                                                            onClick={() => handleDownload(submission)}
                                                            className="p-2 text-gray-400 hover:text-black transition-colors"
                                                            title="Download Again"
                                                        >
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default RegistrationSlipsSection;

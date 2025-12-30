import React from 'react';
import { RegistrationSubmission } from '../types';

const ApprovalTimeline: React.FC<{ submission: RegistrationSubmission }> = ({ submission }) => {
  const steps = [
    { key: 'YEAR_LEADER', label: 'Year Leader', status: 'PENDING_YEAR_LEADER' },
    { key: 'FINANCE', label: 'Finance', status: 'PENDING_FINANCE' },
    { key: 'REGISTRAR', label: 'Registrar', status: 'PENDING_REGISTRAR' },
  ];

  const statusOrder = [
    'PENDING_YEAR_LEADER',
    'PENDING_FINANCE',
    'PENDING_REGISTRAR',
    'APPROVED',
    'REJECTED',
  ];
  const currentIdx = statusOrder.indexOf(submission.status);

  function getStepState(idx: number) {
    if (submission.status === 'REJECTED') return 'rejected';
    if (idx < currentIdx) return 'approved';
    if (idx === currentIdx) {
      if (submission.status === 'APPROVED') return 'approved';
      return 'pending';
    }
    return 'waiting';
  }

  function getApprovalDate(role: string) {
    const entry = submission.approvalHistory?.find(h => h.role.replace(/\s/g, '').toUpperCase().includes(role));
    return entry ? new Date(entry.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : null;
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 md:p-8 mb-8 border border-gray-100">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <h3 className="text-base font-black uppercase tracking-tight text-gray-800">Registration Status</h3>
        {submission.status === 'APPROVED' && (
          <span className="self-start md:self-auto px-4 py-1.5 rounded-full bg-green-100 text-green-800 text-xs font-bold uppercase tracking-widest border border-green-200">
            Approved
          </span>
        )}
        {submission.status === 'REJECTED' && (
          <span className="self-start md:self-auto px-4 py-1.5 rounded-full bg-red-100 text-red-800 text-xs font-bold uppercase tracking-widest border border-red-200">
            Rejected
          </span>
        )}
      </div>

      <div className="relative">
        {/* Mobile Vertical Line */}
        <div className="md:hidden absolute top-4 bottom-4 left-5 w-0.5 bg-gray-200" />
        {/* Desktop Horizontal Line */}
        <div className="hidden md:block absolute top-5 left-0 right-0 h-0.5 bg-gray-200" style={{ marginLeft: '10%', marginRight: '10%' }} />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 md:gap-0 relative">
          {steps.map((step, idx) => {
            const state = getStepState(idx);
            let icon, labelColor, statusText, dateText, borderColor;
            
            if (state === 'approved') {
              icon = (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
              );
              labelColor = 'text-green-700';
              statusText = <span className="text-green-700 font-bold">Approved</span>;
              borderColor = 'border-green-600 bg-green-600 text-white';
              dateText = getApprovalDate(step.label.replace(/\s/g, '').toUpperCase());
            } else if (state === 'pending') {
              icon = (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="w-5 h-5">
                   <circle cx="12" cy="12" r="10" strokeOpacity="0" />
                   <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5" />
                </svg>
              );
              labelColor = 'text-yellow-700';
              statusText = <span className="text-yellow-700 font-bold">Pending</span>;
              borderColor = 'border-yellow-400 bg-yellow-50 text-yellow-600';
              dateText = null;
            } else {
               icon = (
                <div className="w-2 h-2 bg-gray-300 rounded-full" />
              );
              labelColor = 'text-gray-400';
              statusText = <span className="text-gray-400 font-bold">Waiting</span>;
              borderColor = 'border-gray-200 bg-gray-50 text-gray-300';
              dateText = null;
            }

            return (
              <div key={step.key} className="flex md:flex-col items-center relative z-10 group">
                <span className={`w-10 h-10 rounded-full flex items-center justify-center text-xl shadow-sm border-2 transition-all duration-300 ${borderColor}`}>
                  {icon}
                </span>
                
                <div className="ml-4 md:ml-0 md:mt-4 flex flex-col md:items-center">
                  <span className={`text-xs font-black uppercase tracking-wider ${labelColor}`}>{step.label}</span>
                  <div className="flex items-center gap-2 md:flex-col md:gap-0">
                    <span className="text-[10px] uppercase font-bold mt-0.5">{statusText}</span>
                    {dateText && (
                      <>
                        <span className="md:hidden text-gray-300">•</span>
                        <span className="text-[10px] text-gray-400 md:mt-0.5">{dateText}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ApprovalTimeline;

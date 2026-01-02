import React from 'react';
import { RegistrationSubmission, RegistrationStatus, UserRole } from '../types';
import { formatDate } from '../utils';

interface ApprovalTimelineProps {
  submission: RegistrationSubmission;
}

const ApprovalTimeline: React.FC<ApprovalTimelineProps> = ({ submission }) => {
  const getStepStatus = (role: UserRole): 'completed' | 'current' | 'pending' | 'rejected' => {
    if (submission.status === RegistrationStatus.REJECTED) {
      return 'rejected';
    }

    const completedApprovals = submission.approvalHistory?.map(h => h.role) || [];
    
    if (completedApprovals.includes(role)) {
      return 'completed';
    }

    const roleOrder = [UserRole.YEAR_LEADER, UserRole.FINANCE_OFFICER, UserRole.REGISTRAR];
    const currentIndex = roleOrder.indexOf(role);
    
    if (currentIndex > 0) {
      const previousRole = roleOrder[currentIndex - 1];
      if (!completedApprovals.includes(previousRole)) {
        return 'pending';
      }
    }

    if (currentIndex === 0 && completedApprovals.length === 0) {
      return 'current';
    } else if (currentIndex > 0 && completedApprovals.length === currentIndex) {
      return 'current';
    }

    return 'pending';
  };

  const getStepInfo = (role: UserRole) => {
    switch (role) {
      case UserRole.YEAR_LEADER:
        return {
          title: 'Year Leader',
          description: 'Academic eligibility verification',
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          )
        };
      case UserRole.FINANCE_OFFICER:
        return {
          title: 'Finance',
          description: 'Payment status confirmation',
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )
        };
      case UserRole.REGISTRAR:
        return {
          title: 'Registrar',
          description: 'Registrar confirmation',
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )
        };
      default:
        return { title: '', description: '', icon: null };
    }
  };

  const getStepColor = (status: 'completed' | 'current' | 'pending' | 'rejected') => {
    switch (status) {
      case 'completed':
        return 'bg-green-500 border-green-500 text-white';
      case 'current':
        return 'bg-blue-500 border-blue-500 text-white';
      case 'rejected':
        return 'bg-red-500 border-red-500 text-white';
      case 'pending':
        return 'bg-gray-200 border-gray-300 text-gray-500';
    }
  };

  const getLineColor = (status: 'completed' | 'current' | 'pending' | 'rejected') => {
    switch (status) {
      case 'completed':
        return 'bg-green-500';
      case 'rejected':
        return 'bg-red-500';
      default:
        return 'bg-gray-300';
    }
  };

  const steps = [
    UserRole.YEAR_LEADER,
    UserRole.FINANCE_OFFICER,
    UserRole.REGISTRAR
  ];

  const getApprovalInfo = (role: UserRole) => {
    return submission.approvalHistory?.find(h => h.role === role);
  };

  return (
    <div className="bg-gradient-to-br from-white via-gray-50 to-white rounded-2xl border border-gray-200 p-6 shadow-[0_10px_40px_rgba(0,0,0,0.08),0_4px_12px_rgba(0,0,0,0.04),0_0_0_1px_rgba(0,0,0,0.02)] backdrop-blur-sm relative overflow-hidden">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 opacity-[0.03]">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 20% 80%, rgba(0,0,0,0.1) 0%, transparent 50%),
                           radial-gradient(circle at 80% 20%, rgba(0,0,0,0.1) 0%, transparent 50%),
                           radial-gradient(circle at 40% 40%, rgba(0,0,0,0.05) 0%, transparent 50%)`
        }} />
      </div>
      
      {/* Content */}
      <div className="relative z-10">
        <h3 className="text-lg font-bold uppercase tracking-widest mb-6 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent">Approval Progress</h3>
      
      {/* Horizontal Timeline */}
      <div className="relative">
        {/* Progress Line */}
        <div className="absolute top-6 left-0 right-0 h-0.5 bg-gray-300">
          <div 
            className="h-full bg-green-500 transition-all duration-500"
            style={{ 
              width: `${(steps.filter((role, index) => {
                const status = getStepStatus(role);
                return status === 'completed' || status === 'rejected';
              }).length / steps.length) * 100}%` 
            }}
          />
        </div>

        {/* Steps */}
        <div className="relative flex justify-between items-start">
          {steps.map((role, index) => {
            const status = getStepStatus(role);
            const stepInfo = getStepInfo(role);
            const approvalInfo = getApprovalInfo(role);

            const isCompleted = status === 'completed';
            const isRejected = status === 'rejected';
            const isCurrent = status === 'current';
            const isPending = status === 'pending';

            return (
              <div key={role} className="flex flex-col items-center text-center max-w-[200px]">
                {/* Step Circle */}
                <div className={`
                  relative z-10 flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all duration-500 mb-3
                  ${isCompleted ? 'border-green-400 bg-gradient-to-br from-green-400 via-green-500 to-green-600 text-white shadow-[0_0_20px_rgba(34,197,94,0.4),0_0_40px_rgba(34,197,94,0.2),inset_0_1px_0_rgba(255,255,255,0.3)]' : ''}
                  ${isRejected ? 'border-red-400 bg-gradient-to-br from-red-400 via-red-500 to-red-600 text-white shadow-[0_0_20px_rgba(239,68,68,0.4),0_0_40px_rgba(239,68,68,0.2),inset_0_1px_0_rgba(255,255,255,0.3)]' : ''}
                  ${isCurrent ? 'border-blue-400 bg-gradient-to-br from-blue-50 via-blue-100 to-blue-200 text-blue-700 shadow-[0_0_20px_rgba(59,130,246,0.4),0_0_40px_rgba(59,130,246,0.2),inset_0_1px_0_rgba(255,255,255,0.8)] animate-pulse' : ''}
                  ${isPending ? 'border-gray-200 bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200 text-gray-400 shadow-[0_2px_8px_rgba(0,0,0,0.1),inset_0_1px_0_rgba(255,255,255,0.8)]' : ''}
                `}>
                  {isCompleted || isRejected ? (
                    <svg className="w-6 h-6 drop-shadow-sm" fill="currentColor" viewBox="0 0 20 20">
                      {isCompleted ? (
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      ) : (
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      )}
                    </svg>
                  ) : (
                    <div className="w-6 h-6">
                      {stepInfo.icon}
                    </div>
                  )}
                </div>

                {/* Step Details */}
                <div className="space-y-1">
                  <h4 className="font-semibold text-gray-900 text-sm">{stepInfo.title.split(' ')[0]}</h4>
                  
                  {approvalInfo && (
                    <div className="mt-1">
                      <p className="text-xs text-gray-500">{formatDate(approvalInfo.date)}</p>
                    </div>
                  )}

                  {status === 'current' && (
                    <div className="mt-1">
                      <p className="text-xs text-blue-600 font-medium">Under Review</p>
                    </div>
                  )}

                  {status === 'pending' && (
                    <div className="mt-1 text-xs text-gray-400">
                      Pending
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Final Status */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-semibold text-gray-900">Registration Status</h4>
            <p className="text-sm text-gray-600">
              Submitted on {formatDate(submission.submittedAt)}
            </p>
          </div>
          <div className={`px-4 py-2 rounded-full text-sm font-medium ${
            submission.status === RegistrationStatus.APPROVED
              ? 'bg-green-100 text-green-800'
              : submission.status === RegistrationStatus.REJECTED
              ? 'bg-red-100 text-red-800'
              : 'bg-yellow-100 text-yellow-800'
          }`}>
            {submission.status.replace(/_/g, ' ')}
          </div>
        </div>
      </div>
      </div>
    </div>
  );
};

export default ApprovalTimeline;

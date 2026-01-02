import React, { useState } from 'react';
import { RegistrationSubmission, UserRole } from '../types';
import { Modal, Button, Textarea } from './ui';
import { formatDate, formatIdDisplay } from '../utils';

interface ApprovalModalProps {
  submission: RegistrationSubmission;
  userRole: UserRole;
  onApprove: (comments: string) => void;
  onReject: (reason: string) => void;
  onClose: () => void;
}

const ApprovalModal: React.FC<ApprovalModalProps> = ({
  submission,
  userRole,
  onApprove,
  onReject,
  onClose
}) => {
  const [comments, setComments] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleApprove = async () => {
    setIsSubmitting(true);
    try {
      await onApprove(comments);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReject = async () => {
    if (!comments.trim()) {
      alert('Please provide a reason for rejection');
      return;
    }
    setIsSubmitting(true);
    try {
      await onReject(comments);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  const getActionTitle = () => {
    switch (userRole) {
      case UserRole.YEAR_LEADER:
        return 'Year Leader Review';
      case UserRole.FINANCE_OFFICER:
        return 'Finance Verification';
      case UserRole.REGISTRAR:
        return 'Final Approval';
      default:
        return 'Review Registration';
    }
  };

  return (
    <Modal onClose={onClose}>
      <div className="bg-white rounded-xl border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] max-w-2xl w-full mx-4">
        <div className="p-6 border-b border-black">
          <h2 className="text-xl font-bold uppercase tracking-widest">{getActionTitle()}</h2>
          <p className="text-sm text-gray-600 mt-1">Registration ID: {formatIdDisplay(submission.id)}</p>
        </div>

        <div className="p-6 space-y-6">
          {/* Student Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Student Details</h3>
              <div className="space-y-1">
                <p className="text-sm font-medium">{submission.studentName}</p>
                <p className="text-xs text-gray-600">{submission.studentEmail}</p>
                <p className="text-xs text-gray-600">{submission.phoneNumber}</p>
              </div>
            </div>
            <div>
              <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Academic Info</h3>
              <div className="space-y-1">
                <p className="text-sm font-medium">{submission.program}</p>
                <p className="text-xs text-gray-600">{submission.faculty}</p>
                <p className="text-xs text-gray-600">{submission.semester} - {submission.academicYear}</p>
              </div>
            </div>
          </div>

          {/* Modules */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Selected Modules</h3>
            <div className="bg-gray-50 rounded-lg p-4">
              {Array.isArray(submission.modules) && submission.modules.length > 0 ? (
                <div className="space-y-2">
                  {submission.modules.map((module: any, index: number) => (
                    <div key={index} className="flex justify-between items-center text-sm">
                      <span className="font-medium">{module.name || module}</span>
                      <span className="text-xs text-gray-600">
                        {module.code && `${module.code} • `}
                        {module.credits && `${module.credits} credits`}
                      </span>
                    </div>
                  ))}
                  <div className="pt-2 border-t border-gray-200">
                    <p className="text-xs font-bold">
                      Total Credits: {submission.modules.reduce((sum: number, module: any) => sum + (module.credits || 0), 0)}
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-600">No modules selected</p>
              )}
            </div>
          </div>

          {/* Comments/Reason */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">
              {userRole === UserRole.REGISTRAR ? 'Final Comments' : 'Review Comments'}
            </h3>
            <Textarea
              value={comments}
              onChange={setComments}
              placeholder={
                userRole === UserRole.REGISTRAR 
                  ? "Add final approval comments (optional)..."
                  : userRole === UserRole.FINANCE_OFFICER
                  ? "Add finance verification notes..."
                  : "Add academic review comments..."
              }
              rows={3}
            />
          </div>

          {/* Approval History */}
          {submission.approvalHistory && submission.approvalHistory.length > 0 && (
            <div>
              <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Approval History</h3>
              <div className="space-y-2">
                {submission.approvalHistory.map((history, index) => (
                  <div key={index} className="bg-gray-50 rounded-lg p-3 text-sm">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">{history.approvedBy}</p>
                        <p className="text-xs text-gray-600">{history.role}</p>
                      </div>
                      <p className="text-xs text-gray-500">{formatDate(history.date)}</p>
                    </div>
                    {history.comments && (
                      <p className="text-xs text-gray-600 mt-1">{history.comments}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="p-6 border-t border-black bg-gray-50">
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={handleApprove}
              disabled={isSubmitting}
              className="flex-1 bg-black text-white hover:bg-gray-800"
            >
              {isSubmitting ? 'Processing...' : 'Approve'}
            </Button>
            <Button
              onClick={handleReject}
              disabled={isSubmitting}
              variant="outline"
              className="flex-1 border-red-500 text-red-500 hover:bg-red-50"
            >
              {isSubmitting ? 'Processing...' : 'Reject'}
            </Button>
            <Button
              onClick={onClose}
              disabled={isSubmitting}
              variant="outline"
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default ApprovalModal;

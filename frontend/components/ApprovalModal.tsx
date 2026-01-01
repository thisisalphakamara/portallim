import React, { useState } from 'react';
import { RegistrationSubmission, Module } from '../types';
import { Modal, Button, Textarea, Badge } from './ui';
import { getStatusLabel, calculateTotalCredits, formatDateTime } from '../utils';

interface ApprovalModalProps {
  submission: RegistrationSubmission;
  onApprove: (id: string, comments: string) => void;
  onReject: (id: string, reason: string) => void;
  onClose: () => void;
}

const ApprovalModal: React.FC<ApprovalModalProps> = ({ 
  submission, 
  onApprove, 
  onReject, 
  onClose 
}) => {
  const [action, setAction] = useState<'approve' | 'reject' | null>(null);
  const [comments, setComments] = useState('');
  const [rejectReason, setRejectReason] = useState('');

  const handleSubmit = () => {
    if (action === 'approve') {
      onApprove(submission.id, comments);
    } else if (action === 'reject') {
      if (!rejectReason.trim()) {
        alert('Please provide a reason for rejection');
        return;
      }
      onReject(submission.id, rejectReason);
    }
    onClose();
  };

  const totalCredits = calculateTotalCredits(submission.modules);

  const renderFooter = () => {
    if (!action) {
      return (
        <div className="flex space-x-4">
          <Button 
            variant="primary" 
            fullWidth 
            onClick={() => setAction('approve')}
          >
            ✓ Approve Registration
          </Button>
          <Button 
            variant="outline" 
            fullWidth 
            onClick={() => setAction('reject')}
          >
            ✕ Reject Registration
          </Button>
        </div>
      );
    }

    if (action === 'approve') {
      return (
        <div className="space-y-4">
          <Textarea
            label="Comments (Optional)"
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            placeholder="Add any comments for this approval..."
            rows={4}
          />
          <div className="flex space-x-4">
            <Button variant="outline" onClick={() => setAction(null)}>
              Back
            </Button>
            <Button variant="primary" fullWidth onClick={handleSubmit}>
              Confirm Approval
            </Button>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <Textarea
          label="Reason for Rejection *"
          value={rejectReason}
          onChange={(e) => setRejectReason(e.target.value)}
          placeholder="Please provide a reason for rejecting this registration..."
          rows={4}
          required
        />
        <div className="flex space-x-4">
          <Button variant="outline" onClick={() => setAction(null)}>
            Back
          </Button>
          <Button variant="danger" fullWidth onClick={handleSubmit}>
            Confirm Rejection
          </Button>
        </div>
      </div>
    );
  };

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title="Registration Review"
      footer={renderFooter()}
    >
      <div className="space-y-6">
        <div className="flex items-center justify-between p-4 bg-gray-50 border border-gray-200">
          <span className="text-xs font-bold uppercase">Current Status</span>
          <Badge variant="default">
            {getStatusLabel(submission.status)}
          </Badge>
        </div>

        <div className="space-y-6">
          <h4 className="text-sm font-bold uppercase tracking-widest border-b border-gray-100 pb-2">Student Information</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                Student Name
              </label>
              <p className="text-sm font-bold">{submission.studentName}</p>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                Student ID
              </label>
              <p className="text-sm font-mono">{submission.studentId}</p>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                Email Address
              </label>
              <p className="text-sm font-bold">{submission.studentEmail}</p>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                Phone Number
              </label>
              <p className="text-sm font-bold">{submission.phoneNumber || 'Not provided'}</p>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                National ID
              </label>
              <p className="text-sm font-mono">{submission.nationalId || 'Not provided'}</p>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                Sponsor Type
              </label>
              <p className="text-sm font-bold">{submission.sponsorType || 'Not specified'}</p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <h4 className="text-sm font-bold uppercase tracking-widest border-b border-gray-100 pb-2">Academic Details</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                Faculty
              </label>
              <p className="text-sm font-bold">{submission.faculty}</p>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                Program
              </label>
              <p className="text-sm font-bold">{submission.program}</p>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                Semester
              </label>
              <p className="text-sm">{submission.semester} - {submission.academicYear}</p>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                Enrollment Intake
              </label>
              <p className="text-sm font-bold">{submission.enrollmentIntake || 'Not specified'}</p>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                Submitted
              </label>
              <p className="text-sm">{formatDateTime(submission.submittedAt)}</p>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                Total Credits
              </label>
              <p className="text-sm font-bold">{totalCredits} Credits</p>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
            Registered Modules ({submission.modules.length})
          </label>
          <div className="border border-black divide-y divide-gray-200">
            {submission.modules.map((mod: Module) => (
              <div key={mod.id} className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold">{mod.name}</p>
                  <p className="text-xs text-gray-500">{mod.code}</p>
                </div>
                <p className="text-xs font-bold">{mod.credits} CR</p>
              </div>
            ))}
          </div>
        </div>

        {submission.approvalHistory.length > 0 && (
          <div className="space-y-3">
            <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
              Approval History
            </label>
            <div className="space-y-2">
              {submission.approvalHistory.map((history, index) => (
                <div key={index} className="p-3 bg-gray-50 border border-gray-200 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold">{history.role}</p>
                    <p className="text-[10px] text-gray-500">by {history.approvedBy}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-gray-500">
                      {new Date(history.date).toLocaleDateString()}
                    </p>
                    {history.comments && (
                      <p className="text-xs italic">"{history.comments}"</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default ApprovalModal;

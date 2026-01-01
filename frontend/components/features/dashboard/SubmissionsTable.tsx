import React, { useState, useEffect } from 'react';
import { RegistrationSubmission, RegistrationStatus } from '../../../types';
import { Table, Badge, Button } from '../../ui';
import { truncateId, getStatusBadgeVariant } from '../../../utils';
import DocumentUploadModal from '../../DocumentUploadModal';
import { getRegistrationDocuments } from '../../../services/document.service';

interface SubmissionsTableProps {
  submissions: RegistrationSubmission[];
  onRowClick: (submission: RegistrationSubmission) => void;
}

const SubmissionsTable: React.FC<SubmissionsTableProps> = ({ submissions, onRowClick }) => {
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState<RegistrationSubmission | null>(null);
  const [documentsStatus, setDocumentsStatus] = useState<{ [key: string]: boolean }>([]);
  const [loadingDocuments, setLoadingDocuments] = useState<{ [key: string]: boolean }>([]);

  // Check if documents exist for each submission
  useEffect(() => {
    const checkDocuments = async () => {
      const approvedSubmissions = submissions.filter(s => s.status === RegistrationStatus.APPROVED);
      
      for (const submission of approvedSubmissions) {
        setLoadingDocuments(prev => ({ ...prev, [submission.id]: true }));
        
        try {
          const result = await getRegistrationDocuments(submission.id);
          const hasDocuments = result.success && result.documents && result.documents.length > 0;
          setDocumentsStatus(prev => ({ ...prev, [submission.id]: hasDocuments }));
        } catch (error) {
          console.error('Failed to check documents:', error);
          setDocumentsStatus(prev => ({ ...prev, [submission.id]: false }));
        } finally {
          setLoadingDocuments(prev => ({ ...prev, [submission.id]: false }));
        }
      }
    };

    checkDocuments();
  }, [submissions]);

  const handleUploadDocument = (submission: RegistrationSubmission) => {
    console.log('handleUploadDocument called for:', submission.studentName);
    setSelectedSubmission(submission);
    setUploadModalOpen(true);
  };

  const handleUploadSuccess = () => {
    // Refresh documents status for the uploaded submission
    if (selectedSubmission) {
      setDocumentsStatus(prev => ({ ...prev, [selectedSubmission.id]: true }));
    }
    alert('Registration confirmation slip uploaded successfully!');
  };

  const columns = [
    {
      header: 'Ref ID',
      accessor: (row: RegistrationSubmission) => (
        <span className="font-mono">#{truncateId(row.id)}</span>
      )
    },
    {
      header: 'Student',
      accessor: (row: RegistrationSubmission) => (
        <span className="font-medium">{row.studentName}</span>
      )
    },
    {
      header: 'Faculty',
      accessor: (row: RegistrationSubmission) => (
        <span className="text-gray-500">{row.faculty}</span>
      )
    },
    {
      header: 'Status',
      accessor: (row: RegistrationSubmission) => (
        <Badge variant={getStatusBadgeVariant(row.status)}>
          {row.status}
        </Badge>
      )
    },
    {
      header: 'Documents',
      accessor: (row: RegistrationSubmission) => (
        <div className="flex items-center space-x-2">
          {row.status === RegistrationStatus.APPROVED ? (
            loadingDocuments[row.id] ? (
              <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                Checking...
              </span>
            ) : documentsStatus[row.id] ? (
              <Badge variant="success">
                Document Uploaded
              </Badge>
            ) : (
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  console.log('Upload button clicked for:', row.studentName);
                  handleUploadDocument(row);
                }}
              >
                Upload Slip
              </Button>
            )
          ) : (
            <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
              Pending Approval
            </span>
          )}
        </div>
      )
    },
    {
      header: 'Action',
      accessor: (row) => (
        <Button
          variant="outline"
          size="sm"
          className="underline hover:no-underline"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onRowClick(row);
            return false;
          }}
          onMouseDown={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
        >
          View Details
        </Button>
      ),
      className: 'text-right'
    }
  ];

  return (
    <>
      <Table
        columns={columns}
        data={submissions}
        emptyMessage="No registrations found"
        headerClassName="bg-gray-100"
      />
      
      {console.log('Modal state:', { uploadModalOpen, selectedSubmission })}
      {selectedSubmission && (
        <DocumentUploadModal
          isOpen={uploadModalOpen}
          onClose={() => {
            console.log('Modal closing');
            setUploadModalOpen(false);
            setSelectedSubmission(null);
          }}
          submissionId={selectedSubmission.id}
          studentName={selectedSubmission.studentName}
          onUploadSuccess={handleUploadSuccess}
        />
      )}
    </>
  );
};

export default SubmissionsTable;

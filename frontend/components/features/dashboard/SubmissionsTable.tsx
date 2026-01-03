import React, { useState, useEffect } from 'react';
import { RegistrationSubmission, RegistrationStatus, UserRole } from '../../../types';
import { Table, Badge, Button } from '../../ui';
import { truncateId, getStatusBadgeVariant } from '../../../utils';
import DocumentUploadModal from '../../DocumentUploadModal';
import { getRegistrationDocuments, deleteRegistrationDocument, downloadRegistrationDocument } from '../../../services/document.service';

interface SubmissionsTableProps {
  submissions: RegistrationSubmission[];
  onRowClick: (submission: RegistrationSubmission) => void;
  userRole: UserRole;
}

const SubmissionsTable: React.FC<SubmissionsTableProps> = ({ submissions, onRowClick, userRole }) => {
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState<RegistrationSubmission | null>(null);
  const [documentsStatus, setDocumentsStatus] = useState<{ [key: string]: boolean }>([]);
  const [documentsInfo, setDocumentsInfo] = useState<{ [key: string]: any }>({});
  const [loadingDocuments, setLoadingDocuments] = useState<{ [key: string]: boolean }>([]);
  const [deletingDocuments, setDeletingDocuments] = useState<{ [key: string]: boolean }>({});
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [viewDocumentUrl, setViewDocumentUrl] = useState<string | null>(null);

  // Check if user can upload documents (only Registrar)
  const canUploadDocuments = userRole === UserRole.REGISTRAR;

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

          // Store document information if available
          if (hasDocuments && result.documents.length > 0) {
            setDocumentsInfo(prev => ({ ...prev, [submission.id]: result.documents[0] }));
          }
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

  const handleUploadDocument = (submission: RegistrationSubmission, isReplacement = false) => {
    console.log('handleUploadDocument called for:', submission.studentName, 'isReplacement:', isReplacement);
    setSelectedSubmission(submission);
    setUploadModalOpen(true);
    // Store replacement mode in a ref to pass to modal
    (window as any).isDocumentReplacement = isReplacement;
  };

  const handleUploadSuccess = (document: any) => {
    // Refresh documents status for the uploaded submission
    if (selectedSubmission) {
      setDocumentsStatus(prev => ({ ...prev, [selectedSubmission.id]: true }));
      // IMPORTANT: Update the document info immediately so "View" works without refresh
      if (document) {
        setDocumentsInfo(prev => ({ ...prev, [selectedSubmission.id]: document }));
      }
    }
  };

  const handleDeleteDocument = async (submission: RegistrationSubmission) => {
    if (!confirm(`Are you sure you want to delete the document for ${submission.studentName}? This action cannot be undone.`)) {
      return;
    }

    const documentInfo = documentsInfo[submission.id];
    if (!documentInfo) {
      alert('No document found to delete');
      return;
    }

    setDeletingDocuments(prev => ({ ...prev, [submission.id]: true }));

    try {
      const result = await deleteRegistrationDocument(submission.id, documentInfo.id);

      if (result.success) {
        setDocumentsStatus(prev => ({ ...prev, [submission.id]: false }));
        setDocumentsInfo(prev => ({ ...prev, [submission.id]: null }));
        alert('Document deleted successfully. You can now upload a new document.');
      } else {
        alert(result.error || 'Failed to delete document');
      }
    } catch (error: any) {
      console.error('Failed to delete document:', error);
      alert(error.message || 'Failed to delete document. Please try again.');
    } finally {
      setDeletingDocuments(prev => ({ ...prev, [submission.id]: false }));
    }
  };

  const handleViewDocument = async (submission: RegistrationSubmission) => {
    const documentInfo = documentsInfo[submission.id];
    if (!documentInfo) {
      alert('No document found to view');
      return;
    }

    try {
      const blob = await downloadRegistrationDocument(submission.id, documentInfo.id);
      const url = window.URL.createObjectURL(blob);
      setViewDocumentUrl(url);
      setViewModalOpen(true);
    } catch (error: any) {
      console.error('Failed to view document:', error);
      alert(error.message || 'Failed to load document for viewing. Please try again.');
    }
  };

  const columns = [
    {
      header: 'Student ID',
      accessor: (row: RegistrationSubmission) => (
        <span className="font-mono font-bold">{row.academicStudentId || row.studentId || 'N/A'}</span>
      )
    },
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
      header: 'Confirmation Slip',
      accessor: (row: RegistrationSubmission) => (
        <div className="flex flex-col space-y-2">
          {row.status === RegistrationStatus.APPROVED ? (
            loadingDocuments[row.id] ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-black"></div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                  Checking...
                </span>
              </div>
            ) : documentsStatus[row.id] ? (
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-green-100 text-green-700 border border-green-200">
                  <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Uploaded
                </span>

                <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm">
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleViewDocument(row);
                    }}
                    className="p-1.5 text-gray-600 hover:bg-gray-50 hover:text-black transition-colors"
                    title="View Document"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </button>
                  {canUploadDocuments && (
                    <>
                      <div className="w-px h-4 bg-gray-200"></div>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleUploadDocument(row, true);
                        }}
                        disabled={deletingDocuments[row.id]}
                        className="p-1.5 text-blue-600 hover:bg-blue-50 transition-colors disabled:opacity-50"
                        title="Replace Document"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                      </button>
                      <div className="w-px h-4 bg-gray-200"></div>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleDeleteDocument(row);
                        }}
                        disabled={deletingDocuments[row.id]}
                        className="p-1.5 text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
                        title="Delete Document"
                      >
                        {deletingDocuments[row.id] ? (
                          <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-red-600"></div>
                        ) : (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        )}
                      </button>
                    </>
                  )}
                </div>
              </div>
            ) : (
              canUploadDocuments ? (
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('Upload button clicked for:', row.studentName);
                    handleUploadDocument(row);
                  }}
                  className="inline-flex items-center px-3 py-1.5 bg-black text-white text-[10px] font-bold uppercase tracking-widest rounded hover:bg-gray-800 transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,0.1)] active:translate-y-px active:shadow-none"
                >
                  <svg className="w-3 h-3 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0l-4 4m4-4v12" />
                  </svg>
                  Upload Slip
                </button>
              ) : (
                <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 bg-gray-100 px-2 py-1 rounded inline-block">
                  No Slip
                </span>
              )
            )
          ) : (
            <span className="text-[10px] font-bold uppercase tracking-widest text-amber-500 bg-amber-50 px-2 py-1 rounded border border-amber-100 inline-block">
              Pending
            </span>
          )}
        </div>
      )
    },
    {
      header: 'Action',
      accessor: (row) => (
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onRowClick(row);
          }}
          className="text-xs font-bold text-gray-400 hover:text-black underline decoration-gray-300 hover:decoration-black underline-offset-4 transition-all"
        >
          View Details
        </button>
      ),
      className: 'text-right'
    }
  ];

  return (
    <>
      <Table
        columns={columns}
        data={submissions}
        onRowClick={onRowClick}
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
            (window as any).isDocumentReplacement = false;
          }}
          submissionId={selectedSubmission.id}
          studentName={selectedSubmission.studentName}
          onUploadSuccess={handleUploadSuccess}
          isReplacement={(window as any).isDocumentReplacement || false}
        />
      )}

      {/* Document View Modal */}
      {viewModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="text-lg font-bold text-gray-900">View Confirmation Slip</h3>
              <button
                onClick={() => {
                  setViewModalOpen(false);
                  if (viewDocumentUrl) {
                    window.URL.revokeObjectURL(viewDocumentUrl);
                    setViewDocumentUrl(null);
                  }
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="flex-1 p-4 overflow-auto">
              {viewDocumentUrl ? (
                <iframe
                  src={viewDocumentUrl}
                  className="w-full h-full min-h-[600px] border border-gray-200 rounded"
                  title="Confirmation Slip"
                />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <div className="w-8 h-8 border-2 border-gray-300 border-t-black rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-sm text-gray-600">Loading document...</p>
                  </div>
                </div>
              )}
            </div>
            <div className="flex items-center justify-end p-4 border-t border-gray-200">
              <button
                onClick={() => {
                  setViewModalOpen(false);
                  if (viewDocumentUrl) {
                    window.URL.revokeObjectURL(viewDocumentUrl);
                    setViewDocumentUrl(null);
                  }
                }}
                className="px-4 py-2 border border-black text-sm font-bold uppercase tracking-widest rounded hover:bg-black hover:text-white transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SubmissionsTable;

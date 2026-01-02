import React, { useState, useEffect } from 'react';
import { RegistrationSubmission } from '../../../types';
import { getRegistrationDocuments, downloadRegistrationDocument, sendDocumentToEmail } from '../../../services/document.service';

interface RegistrationConfirmationProps {
  submission: RegistrationSubmission;
}

interface RegistrationDocument {
  id: string;
  fileName: string;
  documentUrl?: string;
  uploadedAt: string;
  uploadedBy: string;
  status: 'PENDING' | 'AVAILABLE';
}

const RegistrationConfirmation: React.FC<RegistrationConfirmationProps> = ({ submission }) => {
  const [documents, setDocuments] = useState<RegistrationDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDocument, setSelectedDocument] = useState<RegistrationDocument | null>(null);

  useEffect(() => {
    const fetchDocuments = async () => {
      setLoading(true);
      try {
        const result = await getRegistrationDocuments(submission.id);
        if (result.success && result.documents) {
          setDocuments(result.documents);
        }
      } catch (error) {
        console.error('Failed to fetch documents:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDocuments();
  }, [submission.id]);

  const handleDownload = async (doc: RegistrationDocument) => {
    if (doc.status === 'AVAILABLE') {
      try {
        const blob = await downloadRegistrationDocument(submission.id, doc.id);
        // Create download link
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = doc.fileName;
        document.body.appendChild(link);
        link.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(link);
      } catch (error) {
        console.error('Failed to download document:', error);
        alert('Failed to download document. Please try again.');
      }
    } else {
      alert('Document is not yet available. The registrar will upload your official registration slip shortly.');
    }
  };

  const handleView = async (doc: RegistrationDocument) => {
    if (doc.status === 'AVAILABLE') {
      try {
        const blob = await downloadRegistrationDocument(submission.id, doc.id);
        const url = window.URL.createObjectURL(blob);
        setSelectedDocument({ ...doc, documentUrl: url });
      } catch (error) {
        console.error('Failed to view document:', error);
        alert('Failed to load document for viewing. Please try again.');
      }
    } else {
      alert('Document is not yet available for viewing.');
    }
  };

  const handleSendToEmail = async (doc: RegistrationDocument) => {
    if (doc.status === 'AVAILABLE') {
      try {
        const result = await sendDocumentToEmail(submission.id, doc.id);
        if (result.success) {
          alert(result.message || 'Document has been sent to your email!');
        } else {
          alert(result.error || 'Failed to send document to email.');
        }
      } catch (error: any) {
        console.error('Failed to send document to email:', error);
        alert(error.message || 'Failed to send document to email. Please try again.');
      }
    } else {
      alert('Document is not yet available for email sending.');
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden animate-in fade-in duration-500">
        <div className="p-8 text-center">
          <div className="w-8 h-8 border-2 border-gray-300 border-t-black rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-sm text-gray-600">Loading your registration documents...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden animate-in fade-in duration-500">
      <div className="bg-black p-8 text-center border-b border-gray-800">
        <div className="w-16 h-16 bg-gray-900 rounded-full flex items-center justify-center mx-auto mb-4 shadow-[0_0_20px_rgba(255,255,255,0.1)]">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="3" stroke="currentColor" className="w-8 h-8 text-white">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
        </div>
        <h3 className="text-xl font-black uppercase tracking-tight text-white mb-2">
          Registration Fully Approved
        </h3>
        <p className="text-sm text-gray-300 max-w-md mx-auto leading-relaxed">
          Your semester registration has been successfully approved. Your official registration slip will be available here once processed by the Registrar.
        </p>
      </div>
      
      <div className="p-6 md:p-8 space-y-6">
        {/* Registration Summary */}
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
          <h4 className="text-sm font-black uppercase tracking-widest mb-4">Registration Summary</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-[10px] uppercase font-black tracking-widest text-gray-400 mb-1">Student Name</p>
              <p className="text-sm font-bold text-gray-900">{submission.studentName}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase font-black tracking-widest text-gray-400 mb-1">Student ID</p>
              <p className="text-sm font-bold text-gray-900">{submission.academicStudentId || submission.studentId}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase font-black tracking-widest text-gray-400 mb-1">Email Address</p>
              <p className="text-sm font-bold text-gray-900">{submission.studentEmail}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase font-black tracking-widest text-gray-400 mb-1">Phone Number</p>
              <p className="text-sm font-bold text-gray-900">{submission.phoneNumber}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase font-black tracking-widest text-gray-400 mb-1">National ID</p>
              <p className="text-sm font-bold text-gray-900">{submission.nationalId || 'Not provided'}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase font-black tracking-widest text-gray-400 mb-1">Sponsor Type</p>
              <p className="text-sm font-bold text-gray-900">{submission.sponsorType || 'Not provided'}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase font-black tracking-widest text-gray-400 mb-1">Faculty</p>
              <p className="text-sm font-bold text-gray-900">{submission.faculty}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase font-black tracking-widest text-gray-400 mb-1">Program</p>
              <p className="text-sm font-bold text-gray-900">{submission.program}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase font-black tracking-widest text-gray-400 mb-1">Enrollment Intake</p>
              <p className="text-sm font-bold text-gray-900">{submission.enrollmentIntake}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase font-black tracking-widest text-gray-400 mb-1">Year Level</p>
              <p className="text-sm font-bold text-gray-900">Year {submission.yearLevel}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase font-black tracking-widest text-gray-400 mb-1">Semester</p>
              <p className="text-sm font-bold text-gray-900">{submission.semester}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase font-black tracking-widest text-gray-400 mb-1">Registration Status</p>
              <p className="text-sm font-bold text-gray-900">{submission.status.replace('_', ' ')}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase font-black tracking-widest text-gray-400 mb-1">Submitted Date</p>
              <p className="text-sm font-bold text-gray-900">{new Date(submission.submittedAt).toLocaleDateString()}</p>
            </div>
          </div>
        </div>

        {/* Documents Section */}
        <div>
          <h4 className="text-sm font-black uppercase tracking-widest mb-4">Registration Confirmation Slip</h4>
          
          {documents.length === 0 ? (
            <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center">
              <svg className="w-12 h-12 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="text-sm font-bold text-gray-900 mb-1">No Documents Available Yet</p>
              <p className="text-xs text-gray-500 max-w-xs mx-auto">
                The Registrar will upload your official registration slip here once it has been signed and stamped.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {documents.map((doc) => (
                <div key={doc.id} className="border border-gray-200 rounded-xl p-4 hover:border-gray-300 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                        doc.status === 'AVAILABLE' 
                          ? 'bg-green-100 text-green-600' 
                          : 'bg-yellow-100 text-yellow-600'
                      }`}>
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-900">{doc.fileName}</p>
                        <div className="flex items-center space-x-4 mt-1">
                          <p className="text-xs text-gray-500">
                            {doc.status === 'AVAILABLE' ? 'Available for download' : 'Processing by Registrar'}
                          </p>
                          <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                            doc.status === 'AVAILABLE'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {doc.status}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleView(doc)}
                        disabled={doc.status !== 'AVAILABLE'}
                        className={`px-3 py-1.5 text-xs font-bold uppercase tracking-widest rounded transition-colors ${
                          doc.status === 'AVAILABLE'
                            ? 'border border-black hover:bg-black hover:text-white'
                            : 'border border-gray-200 text-gray-400 cursor-not-allowed'
                        }`}
                      >
                        View
                      </button>
                      <button
                        onClick={() => handleDownload(doc)}
                        disabled={doc.status !== 'AVAILABLE'}
                        className={`px-3 py-1.5 text-xs font-bold uppercase tracking-widest rounded transition-colors ${
                          doc.status === 'AVAILABLE'
                            ? 'bg-black text-white hover:bg-gray-800'
                            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        }`}
                      >
                        Download
                      </button>
                      <button
                        onClick={() => handleSendToEmail(doc)}
                        disabled={doc.status !== 'AVAILABLE'}
                        className={`px-3 py-1.5 text-xs font-bold uppercase tracking-widest rounded transition-colors ${
                          doc.status === 'AVAILABLE'
                            ? 'border border-black hover:bg-black hover:text-white'
                            : 'border border-gray-200 text-gray-400 cursor-not-allowed'
                        }`}
                      >
                        Send to Email
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Information Box */}
        <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl flex gap-3">
          <svg className="w-5 h-5 text-blue-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <p className="text-xs text-blue-800 font-medium leading-relaxed mb-2">
              <strong>Digital Registration Process:</strong>
            </p>
            <ul className="text-xs text-blue-800 space-y-1 list-disc list-inside">
              <li>Your registration has been fully approved</li>
              <li>The Registrar will upload your signed and stamped registration slip</li>
              <li>You'll receive a notification when your document is ready</li>
              <li>No need to visit any office - everything is digital!</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Document Viewer Modal */}
      {selectedDocument && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="text-lg font-bold text-gray-900">{selectedDocument.fileName}</h3>
              <button
                onClick={() => setSelectedDocument(null)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="flex-1 p-4 overflow-auto">
              <iframe
                src={selectedDocument.documentUrl}
                className="w-full h-full min-h-[600px] border border-gray-200 rounded"
                title={selectedDocument.fileName}
              />
            </div>
            <div className="flex items-center justify-end gap-3 p-4 border-t border-gray-200">
              <button
                onClick={() => handleSendToEmail(selectedDocument)}
                className="px-4 py-2 border border-black text-sm font-bold uppercase tracking-widest rounded hover:bg-black hover:text-white transition-colors"
              >
                Send to Email
              </button>
              <button
                onClick={() => handleDownload(selectedDocument)}
                className="px-4 py-2 bg-black text-white text-sm font-bold uppercase tracking-widest rounded hover:bg-gray-800 transition-colors"
              >
                Download
              </button>
              <button
                onClick={() => setSelectedDocument(null)}
                className="px-4 py-2 border border-black text-sm font-bold uppercase tracking-widest rounded hover:bg-black hover:text-white transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RegistrationConfirmation;

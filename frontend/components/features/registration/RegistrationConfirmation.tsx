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
  const [documentUrl, setDocumentUrl] = useState<string | null>(null);

  useEffect(() => {
    const fetchDocuments = async () => {
      setLoading(true);
      try {
        const result = await getRegistrationDocuments(submission.id);
        if (result.success && result.documents) {
          setDocuments(result.documents);
          // Auto-load the first available document for display
          const availableDoc = result.documents.find(doc => doc.status === 'AVAILABLE');
          if (availableDoc) {
            await loadDocumentForDisplay(availableDoc);
          }
        }
      } catch (error) {
        console.error('Failed to fetch documents:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDocuments();
  }, [submission.id]);

  const loadDocumentForDisplay = async (doc: RegistrationDocument) => {
    if (doc.status === 'AVAILABLE') {
      try {
        const blob = await downloadRegistrationDocument(submission.id, doc.id);
        const url = window.URL.createObjectURL(blob);
        setDocumentUrl(url);
        setSelectedDocument(doc);
      } catch (error) {
        console.error('Failed to load document for display:', error);
      }
    }
  };

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


        {/* Embedded Document Viewer */}
        {selectedDocument && documentUrl && (
          <div>
            <h4 className="text-sm font-black uppercase tracking-widest mb-4">Registration Confirmation Slip</h4>
            <div className="border border-gray-200 rounded-xl overflow-hidden">
              <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                <h4 className="text-sm font-bold text-gray-900">{selectedDocument.fileName}</h4>
                <p className="text-xs text-gray-500 mt-1">Registration Confirmation Slip</p>
              </div>
              <div className="bg-gray-100 p-4">
                <iframe
                  src={documentUrl}
                  className="w-full h-[600px] border border-gray-300 rounded bg-white shadow-sm"
                  title={selectedDocument.fileName}
                />
              </div>
              <div className="bg-gray-50 px-4 py-3 border-t border-gray-200 flex items-center justify-end gap-3">
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
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RegistrationConfirmation;

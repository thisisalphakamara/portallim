import React, { useState } from 'react';
import { Modal, Button, Input } from './ui';
import { uploadRegistrationDocument } from '../services/document.service';

interface DocumentUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  submissionId: string;
  studentName: string;
  onUploadSuccess: () => void;
}

const DocumentUploadModal: React.FC<DocumentUploadModalProps> = ({
  isOpen,
  onClose,
  submissionId,
  studentName,
  onUploadSuccess
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      // Only allow PDF files
      if (selectedFile.type === 'application/pdf') {
        setFile(selectedFile);
        setError('');
      } else {
        setError('Only PDF files are allowed');
        setFile(null);
      }
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a file to upload');
      return;
    }

    setUploading(true);
    setError('');

    try {
      const response = await uploadRegistrationDocument(submissionId, file);
      
      if (response.success) {
        onUploadSuccess();
        onClose();
        setFile(null);
      } else {
        setError(response.error || 'Failed to upload document');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to upload document. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Upload Registration Confirmation Slip"
      footer={
        <div className="flex space-x-4">
          <Button variant="outline" onClick={onClose} disabled={uploading}>
            Cancel
          </Button>
          <Button
            onClick={handleUpload}
            disabled={!file || uploading}
            className="bg-black text-white hover:bg-gray-800"
          >
            {uploading ? 'Uploading...' : 'Upload Document'}
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        <div className="bg-gray-50 p-4 rounded-xl">
          <h4 className="text-sm font-bold text-gray-900 mb-2">Student Information</h4>
          <p className="text-sm text-gray-600">
            <strong>Name:</strong> {studentName}<br />
            <strong>Registration ID:</strong> #{submissionId.slice(-8)}
          </p>
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-900 mb-2">
            Select Confirmation Slip (PDF only)
          </label>
          <Input
            type="file"
            accept=".pdf"
            onChange={handleFileChange}
            className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-black file:text-white hover:file:bg-gray-800"
          />
          {file && (
            <p className="mt-2 text-sm text-gray-600">
              Selected: <span className="font-medium">{file.name}</span>
            </p>
          )}
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 p-3 rounded-xl">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl">
          <h4 className="text-sm font-bold text-blue-900 mb-2">Upload Guidelines</h4>
          <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
            <li>Only PDF files are accepted</li>
            <li>Maximum file size: 10MB</li>
            <li>Document should be signed and stamped</li>
            <li>Ensure the document is clear and readable</li>
          </ul>
        </div>
      </div>
    </Modal>
  );
};

export default DocumentUploadModal;

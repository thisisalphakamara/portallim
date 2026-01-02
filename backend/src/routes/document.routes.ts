import { Router } from 'express';
import { 
  uploadRegistrationDocument,
  uploadDocument, 
  getDocuments, 
  downloadDocument, 
  sendDocumentToEmail,
  deleteDocument 
} from '../controllers/document.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

// Upload a registration document (Registrar only)
router.post('/:submissionId/documents', uploadRegistrationDocument, uploadDocument);

// Get all documents for a submission
router.get('/:submissionId/documents', getDocuments);

// Download a specific document
router.get('/:submissionId/documents/:documentId/download', downloadDocument);

// Send document to email
router.post('/:submissionId/documents/:documentId/email', sendDocumentToEmail);

// Delete a document (Registrar and Admin only)
router.delete('/:submissionId/documents/:documentId', deleteDocument);

export default router;

import { Request, Response } from 'express';
import { prisma } from '../index';
import { AppError, asyncHandler } from '../middleware/error.middleware';
import { Role } from '@prisma/client';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(process.cwd(), 'uploads', 'registration-documents');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept only PDF files
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'));
    }
  }
});

// Middleware for handling file uploads
export const uploadRegistrationDocument = upload.single('document');

export const uploadDocument = asyncHandler(async (req: any, res: Response) => {
  const { submissionId } = req.params;
  const user = req.user;

  if (user.role !== Role.REGISTRAR) {
    throw new AppError('Only registrars can upload registration documents', 403);
  }

  if (!req.file) {
    throw new AppError('No document file provided', 400);
  }

  // Verify submission exists and is approved
  const submission = await prisma.submission.findUnique({
    where: { id: submissionId },
    include: { student: true }
  });

  if (!submission) {
    throw new AppError('Registration submission not found', 404);
  }

  if (submission.status !== 'APPROVED') {
    throw new AppError('Can only upload documents for approved registrations', 400);
  }

  // Create document record in database
  const document = await prisma.registrationDocument.create({
    data: {
      submissionId,
      fileName: req.file.originalname,
      filePath: req.file.path,
      uploadedBy: user.id,
      uploadedAt: new Date()
    }
  });

  // Send notification to student (you can implement email notification here)
  console.log(`Document uploaded for student ${submission.student.fullName}`);

  res.status(201).json({
    success: true,
    document: {
      id: document.id,
      fileName: document.fileName,
      uploadedAt: document.uploadedAt,
      uploadedBy: user.fullName
    },
    message: 'Registration document uploaded successfully'
  });
});

export const getDocuments = asyncHandler(async (req: any, res: Response) => {
  const { submissionId } = req.params;
  const user = req.user;

  // Verify submission exists and user has access
  const submission = await prisma.submission.findUnique({
    where: { id: submissionId },
    include: {
      student: true,
      documents: {
        include: {
          user: {
            select: { fullName: true }
          }
        }
      }
    }
  });

  if (!submission) {
    throw new AppError('Registration submission not found', 404);
  }

  // Check access permissions
  const hasAccess = 
    user.role === Role.REGISTRAR || 
    user.role === Role.SYSTEM_ADMIN ||
    (user.role === Role.STUDENT && user.id === submission.studentId);

  if (!hasAccess) {
    throw new AppError('Access denied', 403);
  }

  const documents = submission.documents.map((doc: any) => ({
    id: doc.id,
    fileName: doc.fileName,
    documentUrl: `/api/registrations/${submissionId}/documents/${doc.id}/download`,
    uploadedAt: doc.uploadedAt,
    uploadedBy: doc.user.fullName,
    status: 'AVAILABLE' as const
  }));

  res.json({
    success: true,
    documents
  });
});

export const downloadDocument = asyncHandler(async (req: any, res: Response) => {
  const { submissionId, documentId } = req.params;
  const user = req.user;

  // Verify document exists and user has access
  const document = await prisma.registrationDocument.findUnique({
    where: { id: documentId },
    include: {
      submission: {
        include: { student: true }
      }
    }
  });

  if (!document) {
    throw new AppError('Document not found', 404);
  }

  // Verify this document belongs to the specified submission
  if (document.submissionId !== submissionId) {
    throw new AppError('Document does not belong to this submission', 400);
  }

  // Check access permissions
  const hasAccess = 
    user.role === Role.REGISTRAR || 
    user.role === Role.SYSTEM_ADMIN ||
    (user.role === Role.STUDENT && user.id === document.submission.studentId);

  if (!hasAccess) {
    throw new AppError('Access denied', 403);
  }

  // Check if file exists
  if (!fs.existsSync(document.filePath)) {
    throw new AppError('File not found on server', 404);
  }

  // Set appropriate headers
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="${document.fileName}"`);

  // Send file
  const fileStream = fs.createReadStream(document.filePath);
  fileStream.pipe(res);
});

export const deleteDocument = asyncHandler(async (req: any, res: Response) => {
  const { submissionId, documentId } = req.params;
  const user = req.user;

  if (user.role !== Role.REGISTRAR && user.role !== Role.SYSTEM_ADMIN) {
    throw new AppError('Only registrars and admins can delete documents', 403);
  }

  // Verify document exists
  const document = await prisma.registrationDocument.findUnique({
    where: { id: documentId }
  });

  if (!document) {
    throw new AppError('Document not found', 404);
  }

  // Verify this document belongs to the specified submission
  if (document.submissionId !== submissionId) {
    throw new AppError('Document does not belong to this submission', 400);
  }

  // Delete file from filesystem
  if (fs.existsSync(document.filePath)) {
    fs.unlinkSync(document.filePath);
  }

  // Delete record from database
  await prisma.registrationDocument.delete({
    where: { id: documentId }
  });

  res.json({
    success: true,
    message: 'Document deleted successfully'
  });
});

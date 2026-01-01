import { Request, Response, NextFunction } from 'express';

export interface ApiError extends Error {
  statusCode?: number;
  isOperational?: boolean;
}

export class AppError extends Error implements ApiError {
  public statusCode: number;
  public isOperational: boolean;

  constructor(message: string, statusCode: number = 500, isOperational: boolean = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;

    Error.captureStackTrace(this, this.constructor);
  }
}

export const errorHandler = (
  err: ApiError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let error = { ...err };
  error.message = err.message;

  // Log error
  console.error('Error:', {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    body: req.body,
    user: (req as any).user?.id,
    timestamp: new Date().toISOString()
  });

  // Prisma validation error
  if (err.name === 'PrismaClientValidationError') {
    const message = 'Invalid data provided. Please check your input and try again.';
    error = new AppError(message, 400);
  }

  // Prisma unique constraint error
  if (err.name === 'PrismaClientKnownRequestError' && (err as any).code === 'P2002') {
    const target = (err as any).meta?.target;
    const field = Array.isArray(target) ? target[0] : 'field';
    const message = `${field.charAt(0).toUpperCase() + field.slice(1)} already exists. Please use a different value.`;
    error = new AppError(message, 409);
  }

  // Prisma foreign key constraint error
  if (err.name === 'PrismaClientKnownRequestError' && (err as any).code === 'P2003') {
    const message = 'Invalid reference. The selected item does not exist.';
    error = new AppError(message, 400);
  }

  // Prisma record not found error
  if (err.name === 'PrismaClientKnownRequestError' && (err as any).code === 'P2025') {
    const message = 'Record not found. Please check your input and try again.';
    error = new AppError(message, 404);
  }

  // JWT error
  if (err.name === 'JsonWebTokenError') {
    const message = 'Invalid authentication token. Please log in again.';
    error = new AppError(message, 401);
  }

  // JWT expired error
  if (err.name === 'TokenExpiredError') {
    const message = 'Your session has expired. Please log in again.';
    error = new AppError(message, 401);
  }

  // Supabase auth errors
  if (err.message && err.message.includes('Supabase')) {
    error = new AppError(err.message, 400);
  }

  // Default error
  if (!error.statusCode) {
    error.statusCode = 500;
  }

  const response = {
    success: false,
    error: error.message,
    ...(process.env.NODE_ENV === 'development' && {
      stack: error.stack,
      details: err
    })
  };

  // Remove stack in production
  if (process.env.NODE_ENV === 'production') {
    delete response.stack;
    delete response.details;
  }

  res.status(error.statusCode).json(response);
};

export const asyncHandler = (fn: Function) => (req: Request, res: Response, next: NextFunction) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

export const notFound = (req: Request, res: Response, next: NextFunction) => {
  const error = new AppError(`Route ${req.originalUrl} not found`, 404);
  next(error);
};

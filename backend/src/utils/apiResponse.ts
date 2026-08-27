import { Response } from 'express';

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: any;
  meta?: any;
}

export const sendSuccess = <T>(
  res: Response,
  data?: T,
  message: string = 'Success',
  statusCode: number = 200,
  meta?: any
): Response => {
  const body: ApiResponse<T> = {
    success: true,
    message,
    ...(data !== undefined && { data }),
    ...(meta !== undefined && { meta }),
  };
  return res.status(statusCode).json(body);
};

export const sendError = (
  res: Response,
  message: string = 'Internal Server Error',
  statusCode: number = 500,
  error?: any
): Response => {
  const body: ApiResponse = {
    success: false,
    message,
    ...(error !== undefined && { error }),
  };
  return res.status(statusCode).json(body);
};


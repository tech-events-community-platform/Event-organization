import jwt, { SignOptions } from 'jsonwebtoken';
import { ENV } from '../config/env';
import { IJwtPayload } from '../types';

export const signAuthToken = (payload: IJwtPayload): string => {
  const options: SignOptions = {
    expiresIn: ENV.JWT_EXPIRES_IN as any,
  };
  return jwt.sign(payload, ENV.JWT_SECRET, options);
};

export const verifyAuthToken = (token: string): IJwtPayload => {
  return jwt.verify(token, ENV.JWT_SECRET) as IJwtPayload;
};


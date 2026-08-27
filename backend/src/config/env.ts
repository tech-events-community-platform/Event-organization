import dotenv from 'dotenv';
dotenv.config();

export const ENV = {
  PORT: process.env.PORT || '5000',
  NODE_ENV: process.env.NODE_ENV || 'development',
  DATABASE_URL: process.env.DATABASE_URL || '',
  JWT_SECRET: process.env.JWT_SECRET || 'sheba_default_jwt_secret_change_in_prod',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  TICKET_SIGNING_SECRET: process.env.TICKET_SIGNING_SECRET || 'sheba_default_ticket_secret_change_in_prod',
  CORS_ORIGIN: process.env.CORS_ORIGIN || '*',
};


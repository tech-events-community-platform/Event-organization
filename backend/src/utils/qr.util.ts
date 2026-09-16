import jwt from 'jsonwebtoken';
import QRCode from 'qrcode';
import { ENV } from '../config/env';
import { IQrTicketPayload } from '../types';

export const computeEventDayExpiration = (eventDate: string | Date): Date => {
  let dateStr: string;
  if (eventDate instanceof Date) {
    dateStr = eventDate.toISOString().split('T')[0];
  } else {
    dateStr = String(eventDate).split('T')[0];
  }

  // End of event day in East Africa Time (EAT, UTC+3)
  try {
    const endOfDayEAT = new Date(`${dateStr}T23:59:59+03:00`);
    if (!isNaN(endOfDayEAT.getTime())) {
      return endOfDayEAT;
    }
  } catch {}

  // Fallback: 23:59:59 UTC
  const fallback = new Date(dateStr);
  fallback.setUTCHours(23, 59, 59, 999);
  return fallback;
};

export const generateTicketCode = (eventDate?: string | Date): string => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let randomPart = '';
  for (let i = 0; i < 4; i++) {
    randomPart += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  let year = '2026';
  if (eventDate) {
    try {
      const d = new Date(eventDate);
      if (!isNaN(d.getFullYear())) {
        year = String(d.getFullYear());
      }
    } catch {}
  }
  return `SHB-${randomPart}-${year}`;
};

export const generateTicketToken = (
  ticketId: string,
  eventId: string,
  eventDate?: string | Date
): string => {
  const expDate = computeEventDayExpiration(eventDate || new Date());
  const expUnix = Math.floor(expDate.getTime() / 1000);

  // Cryptographically signed token strictly contains NO PII (no name, email, phone)
  const payload: IQrTicketPayload = {
    ticketId,
    eventId,
    exp: expUnix,
    issuedAt: Date.now(),
  };

  return jwt.sign(payload, ENV.TICKET_SIGNING_SECRET);
};

export const verifyTicketToken = (token: string): IQrTicketPayload => {
  try {
    const decoded = jwt.verify(token, ENV.TICKET_SIGNING_SECRET) as IQrTicketPayload;
    return decoded;
  } catch (error: any) {
    if (error.name === 'TokenExpiredError') {
      const err: any = new Error('TOKEN_EXPIRED');
      err.code = 'TOKEN_EXPIRED';
      err.expiredAt = error.expiredAt;
      throw err;
    }
    const err: any = new Error('INVALID_QR_SIGNATURE');
    err.code = 'INVALID_QR_SIGNATURE';
    throw err;
  }
};

export const generateQrDataUrl = async (token: string): Promise<string> => {
  try {
    const dataUrl = await QRCode.toDataURL(token, {
      errorCorrectionLevel: 'M',
      margin: 2,
      scale: 8,
      color: {
        dark: '#000000',
        light: '#ffffff',
      },
    });
    return dataUrl;
  } catch (error) {
    console.error('Failed to generate QR Data URL:', error);
    throw new Error('QR_GENERATION_FAILED');
  }
};


import jwt from 'jsonwebtoken';
import QRCode from 'qrcode';
import { ENV } from '../config/env';
import { IQrTicketPayload } from '../types';

export const generateTicketToken = (
  ticketId: string,
  eventId: string,
  userId: string
): string => {
  const payload: IQrTicketPayload = {
    ticketId,
    eventId,
    userId,
    issuedAt: Date.now(),
  };
  return jwt.sign(payload, ENV.TICKET_SIGNING_SECRET, {
    // Ticket tokens don't expire prematurely, but they are validated against DB status
    noTimestamp: false,
  });
};

export const verifyTicketToken = (token: string): IQrTicketPayload => {
  try {
    return jwt.verify(token, ENV.TICKET_SIGNING_SECRET) as IQrTicketPayload;
  } catch (error: any) {
    throw new Error('INVALID_QR_SIGNATURE');
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


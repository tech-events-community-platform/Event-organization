import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import type { Ticket } from '../../types/ticket';
import { Badge } from '../ui/Badge';
import { QrCode, Calendar, MapPin, CheckCircle2, Download, ShieldCheck } from 'lucide-react';

interface TicketCardProps {
  ticket: Ticket;
  onDownload?: () => void;
}

export const TicketCard: React.FC<TicketCardProps> = ({ ticket, onDownload }) => {
  const formattedDate = new Date(ticket.eventDate).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div className="max-w-md mx-auto">
      {/* Container Ticket Card */}
      <div className="bg-white rounded-3xl shadow-xl border border-gray-200 overflow-hidden relative transition-transform hover:scale-[1.01]">
        {/* Top Header Brand */}
        <div className="bg-[#0B5D4B] text-white p-6 text-center relative overflow-hidden">
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-[#D6A84F]/10 rounded-full blur-xl pointer-events-none"></div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#D6A84F] flex items-center justify-center text-[#064638] shadow-xs">
                <QrCode className="w-5 h-5 font-bold" />
              </div>
              <span className="font-extrabold text-lg tracking-wider text-white">
                SHEBA<span className="text-[#D6A84F]">.</span>
              </span>
            </div>
            <Badge variant="gold" icon={<ShieldCheck className="w-3 h-3" />}>
              {ticket.status}
            </Badge>
          </div>

          <h2 className="text-xl font-bold text-white mb-1 leading-snug">{ticket.eventTitle}</h2>
          <p className="text-xs text-emerald-100 font-medium">Digital Entrance Pass</p>
        </div>

        {/* Card Body Details */}
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-[#66736E] uppercase tracking-wider text-[10px] font-bold block mb-1">
                ATTENDEE NAME
              </span>
              <p className="font-bold text-[#17211E] text-sm">{ticket.attendeeName}</p>
              <p className="text-[11px] font-semibold text-[#0B5D4B]">{ticket.telegramHandle}</p>
            </div>
            <div>
              <span className="text-[#66736E] uppercase tracking-wider text-[10px] font-bold block mb-1">
                TICKET ID
              </span>
              <p className="font-mono font-bold text-[#17211E] text-xs bg-gray-100 px-2 py-1 rounded-md inline-block">
                {ticket.id}
              </p>
            </div>
          </div>

          <div className="space-y-2 pt-2 border-t border-gray-100 text-xs text-[#17211E]">
            <div className="flex items-start gap-2.5">
              <Calendar className="w-4 h-4 text-[#0B5D4B] mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-semibold text-[#17211E]">{formattedDate}</p>
                <p className="text-[#66736E]">{ticket.eventTime}</p>
              </div>
            </div>
            <div className="flex items-start gap-2.5 pt-1">
              <MapPin className="w-4 h-4 text-[#0B5D4B] mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-semibold text-[#17211E]">{ticket.eventLocation}</p>
              </div>
            </div>
          </div>

          {/* Ticket Tear Line Separator */}
          <div className="relative py-2 flex items-center justify-center">
            <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-full w-4 h-8 bg-[#F7F8F5] rounded-r-full border-r border-gray-200"></div>
            <div className="w-full border-t-2 border-dashed border-gray-200"></div>
            <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-full w-4 h-8 bg-[#F7F8F5] rounded-l-full border-l border-gray-200"></div>
          </div>

          {/* QR Code Section (Prominent) */}
          <div className="text-center space-y-3 pt-2">
            <div className="bg-[#F7F8F5] p-5 rounded-2xl border-2 border-[#D6A84F]/40 inline-block shadow-inner relative group">
              {ticket.qrCodeDataUrl ? (
                <img
                  src={ticket.qrCodeDataUrl}
                  alt="Official Ticket QR Code"
                  className="w-[190px] h-[190px] mx-auto object-contain"
                />
              ) : (
                <QRCodeSVG
                  value={ticket.qrPayload}
                  size={190}
                  bgColor="#F7F8F5"
                  fgColor="#064638"
                  level="H"
                  includeMargin={false}
                />
              )}
              <div className="mt-2 text-[10px] font-mono text-[#66736E] truncate max-w-[190px]">
                {ticket.qrPayload}
              </div>
            </div>

            <div className="flex items-center justify-center gap-1.5 text-xs text-[#0B5D4B] font-semibold bg-[#0B5D4B]/5 py-2 px-4 rounded-xl border border-[#0B5D4B]/15">
              <CheckCircle2 className="w-4 h-4 text-[#238B6E]" />
              <span>Show this QR code at the entrance.</span>
            </div>
          </div>
        </div>

        {/* Card Footer actions */}
        <div className="bg-[#F7F8F5] px-6 py-4 border-t border-gray-200/80 flex items-center justify-between text-xs text-[#66736E]">
          <span className="flex items-center gap-1 text-[11px]">
            <ShieldCheck className="w-3.5 h-3.5 text-[#0B5D4B]" />
            Sheba Verified Ticket
          </span>
          <div className="flex items-center gap-3">
            <button
              onClick={onDownload}
              className="flex items-center gap-1 text-[#0B5D4B] hover:underline font-semibold"
            >
              <Download className="w-3.5 h-3.5" />
              Save Ticket
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

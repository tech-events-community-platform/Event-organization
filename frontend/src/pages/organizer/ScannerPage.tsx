import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../../services/api';
import type { Ticket } from '../../types/ticket';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ArrowLeft,
  Camera,
  RotateCcw,
  Zap,
  ShieldCheck,
} from 'lucide-react';

type ScanState = 'IDLE' | 'SUCCESS' | 'DUPLICATE' | 'INVALID';

export const ScannerPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [scanState, setScanState] = useState<ScanState>('IDLE');
  const [scanResult, setScanResult] = useState<{
    message: string;
    ticket?: Ticket;
    attendee?: any;
    time?: string;
  } | null>(null);

  const [inputPayload, setInputPayload] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleScanPayload = async (payload: string) => {
    if (!payload.trim()) return;
    setIsProcessing(true);
    setScanState('IDLE');
    setScanResult(null);

    try {
      const res = await api.verifyTicketQR(payload, id);
      const nowTime = new Date().toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
      });

      if (res.result === 'SUCCESS') {
        setScanState('SUCCESS');
        setScanResult({
          message: res.message,
          ticket: res.ticket,
          time: nowTime,
        });
      } else if (res.result === 'DUPLICATE') {
        setScanState('DUPLICATE');
        setScanResult({
          message: res.message,
          ticket: res.ticket,
          time: nowTime,
        });
      } else {
        setScanState('INVALID');
        setScanResult({
          message: res.message,
        });
      }
    } catch (e: any) {
      setScanState('INVALID');
      setScanResult({
        message: e.message || 'Error processing scan.',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const resetScanner = () => {
    setScanState('IDLE');
    setScanResult(null);
    setInputPayload('');
  };

  return (
    <div className="max-w-xl mx-auto space-y-6 pb-12">
      <Link
        to={`/organizer/events/${id || ''}`}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0B5D4B] hover:underline"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Event Dashboard
      </Link>

      <div className="text-center space-y-2">
        <Badge variant="gold" icon={<ShieldCheck className="w-3.5 h-3.5" />}>
          Sheba Entrance Scanner
        </Badge>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#17211E]">Live Door QR Scanner</h1>
        <p className="text-xs text-[#66736E]">
          Point camera at attendee QR ticket pass or input scanned token to verify against backend database.
        </p>
      </div>

      {/* Camera Viewport Frame */}
      <div
        className={`bg-slate-900 rounded-3xl p-6 sm:p-8 text-white border-4 transition-all overflow-hidden relative shadow-xl text-center space-y-6 ${
          scanState === 'SUCCESS'
            ? 'border-[#238B6E] ring-4 ring-[#238B6E]/30'
            : scanState === 'DUPLICATE'
            ? 'border-[#D6A84F] ring-4 ring-[#D6A84F]/30'
            : scanState === 'INVALID'
            ? 'border-[#C94C4C] ring-4 ring-[#C94C4C]/30'
            : 'border-[#0B5D4B]'
        }`}
      >
        {/* Scanner Corner Crosshair Overlays */}
        <div className="absolute top-4 left-4 w-8 h-8 border-t-4 border-l-4 border-[#D6A84F]"></div>
        <div className="absolute top-4 right-4 w-8 h-8 border-t-4 border-r-4 border-[#D6A84F]"></div>
        <div className="absolute bottom-4 left-4 w-8 h-8 border-b-4 border-l-4 border-[#D6A84F]"></div>
        <div className="absolute bottom-4 right-4 w-8 h-8 border-b-4 border-r-4 border-[#D6A84F]"></div>

        {/* Viewport Content */}
        {scanState === 'IDLE' && (
          <div className="py-8 space-y-4">
            <div className="w-20 h-20 rounded-2xl bg-[#0B5D4B]/40 border border-[#D6A84F]/40 flex items-center justify-center mx-auto text-[#D6A84F] animate-pulse">
              <Camera className="w-10 h-10" />
            </div>
            <div>
              <p className="text-base font-bold text-white">Scan attendee QR</p>
              <p className="text-xs text-gray-400 mt-1">Ready for entrance ticket verification</p>
            </div>
          </div>
        )}

        {/* SUCCESS State */}
        {scanState === 'SUCCESS' && (
          <div className="py-6 space-y-3 bg-[#238B6E]/20 p-6 rounded-2xl border border-[#238B6E] animate-fade-in">
            <div className="w-16 h-16 bg-[#238B6E] rounded-full flex items-center justify-center mx-auto text-white shadow-lg">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h3 className="text-xl font-extrabold text-emerald-300">✓ Check-in successful</h3>
            <p className="text-xs text-emerald-100">{scanResult?.message}</p>

            {scanResult?.ticket && (
              <div className="text-xs text-white space-y-1 bg-black/40 p-4 rounded-xl text-left border border-emerald-500/30">
                <p className="font-bold text-base text-[#D6A84F]">
                  {scanResult.ticket.attendeeName}
                </p>
                <p className="text-emerald-200">{scanResult.ticket.telegramHandle}</p>
                <p className="text-gray-300">Event: {scanResult.ticket.eventTitle}</p>
                <p className="text-gray-400 font-mono text-[11px]">
                  Check-in Time: {scanResult.time}
                </p>
              </div>
            )}

            <Button onClick={resetScanner} size="sm" variant="accent" icon={<RotateCcw className="w-4 h-4" />}>
              Scan Next Attendee
            </Button>
          </div>
        )}

        {/* DUPLICATE State */}
        {scanState === 'DUPLICATE' && (
          <div className="py-6 space-y-3 bg-[#D6A84F]/20 p-6 rounded-2xl border border-[#D6A84F] animate-fade-in">
            <div className="w-16 h-16 bg-[#D6A84F] rounded-full flex items-center justify-center mx-auto text-[#17211E] shadow-lg">
              <AlertTriangle className="w-10 h-10" />
            </div>
            <h3 className="text-xl font-extrabold text-amber-300">Already checked in</h3>
            <p className="text-xs text-gray-200">{scanResult?.message}</p>

            <Button onClick={resetScanner} size="sm" variant="accent" icon={<RotateCcw className="w-4 h-4" />}>
              Scan Next Attendee
            </Button>
          </div>
        )}

        {/* INVALID State */}
        {scanState === 'INVALID' && (
          <div className="py-6 space-y-3 bg-[#C94C4C]/20 p-6 rounded-2xl border border-[#C94C4C] animate-fade-in">
            <div className="w-16 h-16 bg-[#C94C4C] rounded-full flex items-center justify-center mx-auto text-white shadow-lg">
              <XCircle className="w-10 h-10" />
            </div>
            <h3 className="text-xl font-extrabold text-red-300">Invalid or expired ticket</h3>
            <p className="text-xs text-red-100">{scanResult?.message}</p>

            <Button onClick={resetScanner} size="sm" variant="danger" icon={<RotateCcw className="w-4 h-4" />}>
              Try Again
            </Button>
          </div>
        )}
      </div>

      {/* Manual Input Payload Entry */}
      <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-md space-y-4">
        <h3 className="font-bold text-sm text-[#17211E] flex items-center gap-2">
          <Zap className="w-4 h-4 text-[#D6A84F]" />
          Manual QR Token Verification
        </h3>
        <p className="text-xs text-[#66736E]">
          Paste or scan raw QR token string to verify directly against backend check-in endpoint:
        </p>

        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Paste JWT QR token string..."
            value={inputPayload}
            onChange={(e) => setInputPayload(e.target.value)}
            className="flex-1 px-3 py-2 bg-[#F7F8F5] border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#0B5D4B]"
          />
          <Button
            onClick={() => handleScanPayload(inputPayload)}
            isLoading={isProcessing}
            disabled={!inputPayload.trim()}
            variant="primary"
            size="sm"
          >
            Verify Token
          </Button>
        </div>
      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import type { Event } from '../../types/event';
import type { AttendeeRosterItem, BadgeAward } from '../../types/attendance';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import {
  CheckCircle2,
  AlertTriangle,
  Camera,
  RotateCcw,
  ShieldCheck,
  Search,
  Award,
  User,
} from 'lucide-react';

export const ScannerPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [event, setEvent] = useState<Event | null>(null);

  const [inputQuery, setInputQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [surfacedAttendee, setSurfacedAttendee] = useState<AttendeeRosterItem | null>(null);
  const [isApproving, setIsApproving] = useState(false);
  const [approvalResult, setApprovalResult] = useState<{
    badge?: BadgeAward;
    rosterItem?: AttendeeRosterItem;
  } | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    const fetchEvent = async () => {
      if (id) {
        const ev = await api.events.getById(id);
        setEvent(ev || null);
      }
    };
    fetchEvent();
  }, [id]);

  const handleLookup = async (queryText: string) => {
    if (!queryText.trim() || !id) return;
    setIsSearching(true);
    setErrorMsg(null);
    setApprovalResult(null);

    try {
      const found = await api.checkin.lookupByTokenOrName(id, queryText);
      if (found) {
        setSurfacedAttendee(found);
      } else {
        setSurfacedAttendee(null);
        setErrorMsg('No attendee record found matching this token or name.');
      }
    } catch (e: any) {
      setErrorMsg(e.message || 'Lookup error.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleApproveCheckIn = async () => {
    if (!surfacedAttendee || !id) return;
    setIsApproving(true);
    setErrorMsg(null);

    try {
      const res = await api.checkin.approveCheckIn({
        eventId: id,
        attendeeRosterId: surfacedAttendee.id,
        approvedByOrganizerId: user?.id || 'org-lead',
      });
      if (res.success) {
        setApprovalResult({
          badge: res.badgeAwarded,
          rosterItem: res.rosterItem || surfacedAttendee,
        });
        setSurfacedAttendee(null);
      } else {
        setErrorMsg(res.message);
      }
    } catch (e: any) {
      setErrorMsg(e.message || 'Check-in approval failed.');
    } finally {
      setIsApproving(false);
    }
  };

  const handleReset = () => {
    setInputQuery('');
    setSurfacedAttendee(null);
    setApprovalResult(null);
    setErrorMsg(null);
  };

  return (
    <div className="max-w-xl mx-auto space-y-6 pb-20">

      <div className="text-center space-y-2">
        <Badge variant="accent" icon={<ShieldCheck className="w-3.5 h-3.5" />}>
          Door Entrance Console
        </Badge>
        <h1 className="font-serif text-2xl sm:text-3xl font-extrabold text-[#2D1F23]">
          Check-In Console
        </h1>
        <p className="text-xs text-[#756366]">
          {event ? event.title : 'Event'} • Scan attendee QR pass or search attendee by name.
        </p>
      </div>

      {/* Simulated Web Camera Scanner Viewfinder */}
      <div className="bg-[#63474D] rounded-3xl p-6 sm:p-8 text-white border-4 border-[#FFA686]/50 shadow-md relative text-center space-y-4 overflow-hidden">
        {/* Corner Guides */}
        <div className="absolute top-4 left-4 w-7 h-7 border-t-4 border-l-4 border-[#FFA686]"></div>
        <div className="absolute top-4 right-4 w-7 h-7 border-t-4 border-r-4 border-[#FFA686]"></div>
        <div className="absolute bottom-4 left-4 w-7 h-7 border-b-4 border-l-4 border-[#FFA686]"></div>
        <div className="absolute bottom-4 right-4 w-7 h-7 border-b-4 border-r-4 border-[#FFA686]"></div>

        <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center mx-auto text-[#FFA686] animate-pulse">
          <Camera className="w-8 h-8" />
        </div>
        <div>
          <p className="font-serif font-bold text-base text-white">Live Web Camera Active</p>
          <p className="text-xs text-[#E8DDD7]">Hold attendee dynamic QR pass up to camera to surface record</p>
        </div>

        {/* Quick Sample Token Test Trigger */}
        <div className="pt-2">
          <button
            type="button"
            onClick={() => {
              setInputQuery('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.shb_ticket_token_8921');
              handleLookup('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.shb_ticket_token_8921');
            }}
            className="px-3 py-1 bg-white/15 hover:bg-white/25 rounded-lg text-[11px] font-mono text-[#FFA686] transition-colors"
          >
            Simulate Camera Scan (#SHB-8921)
          </button>
        </div>
      </div>

      {/* Manual Name & Token Search Bar */}
      <div className="bg-white p-6 rounded-3xl border border-[#E8DDD7] shadow-xs space-y-4">
        <div>
          <h3 className="font-serif font-bold text-sm text-[#2D1F23] flex items-center gap-2">
            <Search className="w-4 h-4 text-[#63474D]" />
            Lookup by Name, Email, or Scanned Token
          </h3>
          <p className="text-xs text-[#756366]">
            Enter attendee name or paste dynamic token string to surface record with Approve action.
          </p>
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            placeholder="e.g. Abebe Kebede or QR token string..."
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleLookup(inputQuery)}
            className="flex-1 px-3.5 py-2 bg-[#FAF7F5] border border-[#E8DDD7] rounded-xl text-xs text-[#2D1F23] focus:outline-none focus:ring-2 focus:ring-[#63474D]"
          />
          <Button
            onClick={() => handleLookup(inputQuery)}
            isLoading={isSearching}
            variant="primary"
            size="sm"
          >
            Find Record
          </Button>
        </div>

        {errorMsg && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}
      </div>

      {/* Surfaced Attendee with APPROVE Action (SRS Section 6.5) */}
      {surfacedAttendee && (
        <div className="bg-white p-6 rounded-3xl border-2 border-[#63474D] shadow-md space-y-4 animate-fade-in">
          <div className="flex items-center justify-between pb-3 border-b border-[#E8DDD7]">
            <Badge variant="primary">Surfaced Attendee Record</Badge>
            <span className="text-xs font-mono text-[#756366]">Reg ID: {surfacedAttendee.registrationId}</span>
          </div>

          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <h3 className="font-serif font-bold text-lg text-[#2D1F23] flex items-center gap-2">
                <User className="w-4 h-4 text-[#63474D]" />
                {surfacedAttendee.name}
              </h3>
              <p className="text-xs text-[#756366]">{surfacedAttendee.email}</p>
              <p className="text-[11px] text-[#756366]">Registered: {surfacedAttendee.registrationDate}</p>
            </div>

            <Badge variant={surfacedAttendee.status === 'Checked in' ? 'success' : 'gray'}>
              {surfacedAttendee.status}
            </Badge>
          </div>

          {surfacedAttendee.answers && Object.keys(surfacedAttendee.answers).length > 0 && (
            <div className="p-3 bg-[#FAF7F5] rounded-xl border border-[#E8DDD7] text-xs space-y-1">
              <span className="text-[10px] uppercase font-bold text-[#756366]">Registration Answers:</span>
              {Object.entries(surfacedAttendee.answers).map(([q, a]) => (
                <p key={q} className="text-[#2D1F23]">
                  <strong>{q}:</strong> {a}
                </p>
              ))}
            </div>
          )}

          {surfacedAttendee.status === 'Checked in' ? (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              <span>This attendee has already been checked in at {surfacedAttendee.checkInTime}.</span>
            </div>
          ) : (
            <div className="pt-2 flex gap-3">
              <Button
                onClick={handleApproveCheckIn}
                isLoading={isApproving}
                variant="accent"
                size="lg"
                fullWidth
                icon={<CheckCircle2 className="w-5 h-5" />}
              >
                Approve & Issue Attended Badge
              </Button>
              <Button onClick={handleReset} variant="outline" size="lg">
                Cancel
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Check-In Approval Success Notice */}
      {approvalResult && (
        <div className="bg-[#2A7B5F]/10 border border-[#2A7B5F]/40 p-6 rounded-3xl space-y-4 animate-fade-in text-center">
          <div className="w-14 h-14 bg-[#2A7B5F] text-white rounded-full flex items-center justify-center mx-auto shadow-md">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div className="space-y-1">
            <h3 className="font-serif font-bold text-xl text-[#2A7B5F]">
              Check-In Approved!
            </h3>
            <p className="text-xs text-[#2D1F23]">
              <strong>{approvalResult.rosterItem?.name || 'Attendee'}</strong> checked in successfully at {approvalResult.rosterItem?.checkInTime || 'now'}.
            </p>
          </div>

          <div className="p-4 bg-white rounded-2xl border border-[#E8DDD7] text-left text-xs space-y-1">
            <div className="flex items-center gap-2 text-[#63474D] font-bold">
              <Award className="w-4 h-4 text-[#FFA686]" />
              <span>Automatic Badge Granted: &quot;{approvalResult.badge?.badgeLabel || 'Attended'}&quot;</span>
            </div>
            <p className="text-[11px] text-[#756366]">Given by {approvalResult.badge?.issuerName || 'Organizer'}</p>
          </div>

          <Button onClick={handleReset} variant="primary" size="sm" icon={<RotateCcw className="w-4 h-4" />}>
            Ready for Next Attendee
          </Button>
        </div>
      )}
    </div>
  );
};

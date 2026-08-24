import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import type { VerifiedAttendance } from '../../types/attendance';
import { Badge } from '../../components/ui/Badge';
import { ShieldCheck, Calendar, AlertCircle, CheckCircle2 } from 'lucide-react';

export const AttendanceHistoryPage: React.FC = () => {
  const { user } = useAuth();
  const [history, setHistory] = useState<VerifiedAttendance[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true);
      if (user) {
        const data = await api.getAttendanceHistory(user.id);
        setHistory(data);
      }
      setLoading(false);
    };
    fetchHistory();
  }, [user]);

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12">
      {/* Header Banner */}
      <div className="bg-[#064638] text-white p-6 sm:p-8 rounded-3xl space-y-3 shadow-md border border-[#0B5D4B]">
        <Badge variant="gold" icon={<ShieldCheck className="w-3.5 h-3.5" />}>
          Verified Attendance Record
        </Badge>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
          Verified Attendance History
        </h1>
        <p className="text-xs text-gray-300 leading-relaxed">
          Official entrance verification record logged via Sheba QR scanner at door.
        </p>

        {/* Product Rule Disclaimer Banner */}
        <div className="bg-[#0B5D4B]/60 p-3 rounded-xl border border-[#D6A84F]/30 text-[11px] text-[#D6A84F] flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>
            Note: Verified attendance records door presence at event. It does not certify technical competence or skills.
          </span>
        </div>
      </div>

      {/* Timeline list */}
      {loading ? (
        <div className="space-y-4 animate-pulse">
          {[1, 2].map((i) => (
            <div key={i} className="h-24 bg-gray-200 rounded-2xl"></div>
          ))}
        </div>
      ) : history.length === 0 ? (
        <div className="bg-white rounded-2xl p-10 text-center border border-gray-200 space-y-2">
          <p className="text-sm font-bold text-[#17211E]">No verified attendance records yet.</p>
          <p className="text-xs text-[#66736E]">
            Your verified participation will appear here after you present your QR ticket at an event door scanner.
          </p>
        </div>
      ) : (
        <div className="relative pl-6 border-l-2 border-[#0B5D4B]/30 space-y-6">
          {history.map((record) => (
            <div key={record.id} className="relative group">
              {/* Timeline Bullet Dot */}
              <div className="absolute -left-[31px] top-1.5 w-4 h-4 rounded-full bg-[#0B5D4B] border-2 border-white ring-4 ring-[#0B5D4B]/15"></div>

              <div className="bg-white p-5 rounded-2xl border border-gray-200/90 shadow-2xs space-y-3 hover:border-[#0B5D4B]/40 transition-colors">
                <div className="flex items-center justify-between gap-2">
                  <Badge variant="green" icon={<CheckCircle2 className="w-3.5 h-3.5" />}>
                    Verified Attended
                  </Badge>
                  <span className="text-[10px] font-mono text-[#66736E]">
                    Log Time: {record.checkInTime || 'Checked in'}
                  </span>
                </div>

                <div>
                  <h3 className="font-bold text-base text-[#17211E]">{record.eventTitle}</h3>
                  <p className="text-xs text-[#0B5D4B] font-semibold mt-0.5">
                    Host: {record.organizerName}
                  </p>
                </div>

                <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-xs text-[#66736E]">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-[#0B5D4B]" />
                    Event Date: {record.eventDate}
                  </span>
                  <span className="text-[10px] bg-gray-100 px-2 py-0.5 rounded-md font-mono">
                    VERIFIED PASS
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

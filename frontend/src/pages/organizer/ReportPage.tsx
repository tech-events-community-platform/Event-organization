import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../../services/api';
import type { SponsorReportData } from '../../types/attendance';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import {
  BarChart3,
  ShieldCheck,
  ArrowLeft,
  FileSpreadsheet,
  Printer,
  Calendar,
  MapPin,
  Award,
  Users,
  Eye,
  EyeOff,
} from 'lucide-react';

export const ReportPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [report, setReport] = useState<SponsorReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAppendix, setShowAppendix] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    const fetchReport = async () => {
      setLoading(true);
      if (id) {
        const data = await api.reports.getEventReport(id);
        setReport(data);
      }
      setLoading(false);
    };
    fetchReport();
  }, [id]);

  const handlePrintPDF = () => {
    window.print();
  };

  const handleExportCSV = async () => {
    if (!id) return;
    setIsExporting(true);
    try {
      await api.reports.exportCsv(id);
    } catch (e) {
      console.error(e);
    } finally {
      setIsExporting(false);
    }
  };

  if (loading) {
    return <div className="max-w-4xl mx-auto py-12 px-4 animate-pulse h-64 bg-[#E8DDD7]/50 rounded-3xl"></div>;
  }

  if (!report) return null;

  return (
    <div className="space-y-8 pb-20 max-w-4xl mx-auto">
      <div className="no-print">
        <Link
          to={`/organizer`}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#63474D] hover:underline"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>
      </div>

      {/* Header Block (SRS Section 9.1 Product Decision) */}
      <div className="bg-[#63474D] text-white p-6 sm:p-8 rounded-3xl space-y-4 shadow-sm border border-[#AA767C]/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[#FFA686]/20 border border-[#FFA686]/30 text-[#FFA686] text-xs font-semibold">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Sponsor Evidence Report</span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-extrabold text-white">{report.eventTitle}</h1>
          <div className="flex flex-wrap items-center gap-3 text-xs text-[#E8DDD7]">
            <span>Organizer: {report.organizerName}</span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-[#FFA686]" /> {report.eventDate}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-[#FFA686]" /> {report.eventLocation}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 no-print">
          <Button
            onClick={handleExportCSV}
            isLoading={isExporting}
            variant="outline"
            size="sm"
            className="text-white border-white/40 hover:bg-white/10"
            icon={<FileSpreadsheet className="w-4 h-4" />}
          >
            CSV
          </Button>
          <Button
            onClick={handlePrintPDF}
            variant="accent"
            size="sm"
            icon={<Printer className="w-4 h-4" />}
          >
            1-Click PDF Export
          </Button>
        </div>
      </div>

      {/* Metric Cards Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-5 rounded-2xl border border-[#E8DDD7] shadow-xs space-y-1">
          <span className="text-[10px] uppercase font-bold text-[#756366]">Registered</span>
          <p className="font-serif text-3xl font-extrabold text-[#2D1F23]">{report.totalRegistered}</p>
          <p className="text-[10px] text-[#756366]">Confirmed RSVPs</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#E8DDD7] shadow-xs space-y-1">
          <span className="text-[10px] uppercase font-bold text-[#756366]">Turnout / Attended</span>
          <p className="font-serif text-3xl font-extrabold text-[#2A7B5F]">{report.totalAttended}</p>
          <p className="text-[10px] text-[#2A7B5F] font-semibold">QR Door Scanned</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#E8DDD7] shadow-xs space-y-1">
          <span className="text-[10px] uppercase font-bold text-[#756366]">Attendance Rate</span>
          <p className="font-serif text-3xl font-extrabold text-[#63474D]">{report.attendanceRate}%</p>
          <p className="text-[10px] text-[#756366]">Turnout efficiency</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#E8DDD7] shadow-xs space-y-1">
          <span className="text-[10px] uppercase font-bold text-[#756366]">Total Badges Awarded</span>
          <p className="font-serif text-3xl font-extrabold text-[#AA767C]">
            {report.badgeDistribution.attended +
              report.badgeDistribution.participant +
              report.badgeDistribution.winner +
              report.badgeDistribution.speaker}
          </p>
          <p className="text-[10px] text-[#756366]">Verified Credentials</p>
        </div>
      </div>

      {/* Two Sponsor Evidence Charts (Registrations & Badges) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Chart 1: Registration & Arrival Velocity */}
        <div className="bg-white p-6 rounded-3xl border border-[#E8DDD7] shadow-xs space-y-4">
          <h3 className="font-serif font-bold text-base text-[#2D1F23] flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-[#63474D]" />
            1. Registration Timeline (Velocity)
          </h3>

          <div className="space-y-3 pt-2">
            {report.registrationsOverTime.map((slot, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex justify-between text-xs font-semibold text-[#2D1F23]">
                  <span>{slot.date}</span>
                  <span className="text-[#63474D] font-mono">{slot.count} RSVPs</span>
                </div>
                <div className="w-full bg-[#FAF7F5] h-3 rounded-full overflow-hidden border border-[#E8DDD7]">
                  <div
                    className="bg-[#63474D] h-full rounded-full transition-all"
                    style={{ width: `${Math.min(100, (slot.count / report.totalRegistered) * 100)}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Chart 2: Badge Distribution Breakdown (SRS Section 9.1) */}
        <div className="bg-white p-6 rounded-3xl border border-[#E8DDD7] shadow-xs space-y-4">
          <h3 className="font-serif font-bold text-base text-[#2D1F23] flex items-center gap-2">
            <Award className="w-4 h-4 text-[#AA767C]" />
            2. Badge Distribution Breakdown
          </h3>

          <div className="space-y-3 pt-2">
            {[
              { label: 'Attended (Automatic check-in)', count: report.badgeDistribution.attended, color: 'bg-[#63474D]' },
              { label: 'Participant (Workshop coders)', count: report.badgeDistribution.participant, color: 'bg-[#AA767C]' },
              { label: 'Speaker (Session leads)', count: report.badgeDistribution.speaker, color: 'bg-[#D6A184]' },
              { label: 'Winner (Prize recipients)', count: report.badgeDistribution.winner, color: 'bg-[#FFA686]' },
            ].map((item, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex justify-between text-xs font-semibold text-[#2D1F23]">
                  <span>{item.label}</span>
                  <span className="font-mono text-[#63474D]">{item.count} awarded</span>
                </div>
                <div className="w-full bg-[#FAF7F5] h-3 rounded-full overflow-hidden border border-[#E8DDD7]">
                  <div
                    className={`${item.color} h-full rounded-full transition-all`}
                    style={{
                      width: `${Math.min(
                        100,
                        (item.count / Math.max(1, report.totalAttended)) * 100
                      )}%`,
                    }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Togglable Appendix Table (Off by default for sponsor reports) */}
      <div className="bg-white p-6 rounded-3xl border border-[#E8DDD7] shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-serif font-bold text-base text-[#2D1F23] flex items-center gap-2">
              <Users className="w-4 h-4 text-[#63474D]" />
              Attendee Roster Appendix
            </h3>
            <p className="text-xs text-[#756366]">
              Optional granular list of individual participants (Toggled off by default for privacy in sponsor PDFs).
            </p>
          </div>

          <button
            onClick={() => setShowAppendix(!showAppendix)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#E8DDD7] text-xs font-bold text-[#63474D] hover:bg-[#FAF7F5] transition-colors no-print"
          >
            {showAppendix ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            {showAppendix ? 'Hide Appendix' : 'Show Appendix'}
          </button>
        </div>

        {showAppendix && (
          <div className="pt-2 border-t border-[#E8DDD7] overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-[#FAF7F5] border-b border-[#E8DDD7] text-[10px] font-bold uppercase tracking-wider text-[#756366]">
                  <th className="py-2 px-3">Name</th>
                  <th className="py-2 px-3">Email</th>
                  <th className="py-2 px-3">Status</th>
                  <th className="py-2 px-3">Badges Issued</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8DDD7] text-[#2D1F23]">
                {(report.attendees || []).map((att) => (
                  <tr key={att.id}>
                    <td className="py-2 px-3 font-semibold">{att.name}</td>
                    <td className="py-2 px-3 text-[#756366]">{att.email}</td>
                    <td className="py-2 px-3">
                      <Badge variant={att.status === 'Checked in' ? 'success' : 'gray'}>
                        {att.status}
                      </Badge>
                    </td>
                    <td className="py-2 px-3">{att.badges.join(', ') || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

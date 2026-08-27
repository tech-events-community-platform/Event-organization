import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../../services/api';
import type { SponsorReportData } from '../../types/attendance';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import {
  BarChart3,
  CheckCircle2,
  ShieldCheck,
  ArrowLeft,
  AlertCircle,
  FileSpreadsheet,
} from 'lucide-react';

export const ReportPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [report, setReport] = useState<SponsorReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [exported, setExported] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    const fetchReport = async () => {
      setLoading(true);
      if (id) {
        try {
          const data = await api.reports.getEventReport(id);
          setReport(data);
        } catch (e) {
          console.error(e);
        }
      }
      setLoading(false);
    };
    fetchReport();
  }, [id]);

  const handleExportCSV = async () => {
    if (!id) return;
    setIsExporting(true);
    try {
      await api.reports.exportCsv(id);
      setExported(true);
      setTimeout(() => setExported(false), 4000);
    } catch (e) {
      console.error('CSV Export error:', e);
      alert('Failed to download report CSV from backend.');
    } finally {
      setIsExporting(false);
    }
  };

  if (loading) {
    return <div className="max-w-4xl mx-auto py-12 px-4 animate-pulse h-64 bg-gray-200 rounded-3xl"></div>;
  }

  if (!report) return null;

  return (
    <div className="space-y-8 pb-12">
      <Link
        to={`/organizer/events/${id || ''}`}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0B5D4B] hover:underline"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Event Dashboard
      </Link>

      {/* Header */}
      <div className="bg-[#064638] text-white p-6 sm:p-8 rounded-3xl space-y-4 shadow-lg border border-[#0B5D4B] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <Badge variant="gold" icon={<ShieldCheck className="w-3.5 h-3.5" />}>
            Verified Sponsor Impact Report
          </Badge>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">{report.eventTitle}</h1>
          <p className="text-xs text-gray-300">
            Host: {report.organizerName} • Report Date: {report.eventDate}
          </p>
        </div>

        <Button
          onClick={handleExportCSV}
          isLoading={isExporting}
          variant="accent"
          size="lg"
          icon={<FileSpreadsheet className="w-5 h-5" />}
        >
          Export Report (.CSV)
        </Button>
      </div>

      {exported && (
        <div className="bg-[#238B6E]/10 border border-[#238B6E]/40 p-4 rounded-2xl text-xs text-[#238B6E] font-bold flex items-center gap-2 animate-fade-in">
          <CheckCircle2 className="w-5 h-5" />
          Sponsor report exported successfully from backend! Download initialized.
        </div>
      )}

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-2xs space-y-1">
          <span className="text-xs font-semibold text-[#66736E]">Total Registered</span>
          <p className="text-3xl font-extrabold text-[#17211E]">{report.totalRegistered}</p>
          <p className="text-[10px] text-[#66736E]">Confirmed Registrations</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-2xs space-y-1">
          <span className="text-xs font-semibold text-[#66736E]">Total Attended</span>
          <p className="text-3xl font-extrabold text-[#238B6E]">{report.totalAttended}</p>
          <p className="text-[10px] text-[#238B6E] font-medium">Door QR Verified</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-2xs space-y-1">
          <span className="text-xs font-semibold text-[#66736E]">Verified Attendance Rate</span>
          <p className="text-3xl font-extrabold text-[#D6A84F]">{report.attendanceRate}%</p>
          <p className="text-[10px] text-[#66736E]">Actual turnout ratio</p>
        </div>
      </div>

      {/* Timeline & Tag Distribution */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Entrance Timeline Check-in Chart */}
        <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-2xs space-y-4">
          <h3 className="font-bold text-base text-[#17211E] flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-[#0B5D4B]" />
            Entrance Velocity (Hourly Check-ins)
          </h3>

          <div className="space-y-3 pt-2">
            {report.hourlyCheckIns.length === 0 ? (
              <p className="text-xs text-gray-500 py-4 text-center">No hourly check-ins recorded yet.</p>
            ) : (
              report.hourlyCheckIns.map((slot, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold text-[#17211E]">
                    <span>{slot.time}</span>
                    <span className="text-[#0B5D4B] font-mono">{slot.count} scans</span>
                  </div>
                  <div className="w-full bg-gray-100 h-3 rounded-full overflow-hidden">
                    <div
                      className="bg-[#0B5D4B] h-full rounded-full transition-all"
                      style={{ width: `${Math.min(100, (slot.count / Math.max(1, report.totalAttended)) * 100)}%` }}
                    ></div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Self-Reported Skill Tag Distribution */}
        <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-2xs space-y-4">
          <div className="space-y-1">
            <h3 className="font-bold text-base text-[#17211E]">
              Self-Reported Tech Interests
            </h3>
            {/* Product Rule Alert */}
            <div className="bg-amber-50 border border-amber-200 p-2.5 rounded-xl text-[11px] text-amber-900 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-[#D6A84F] flex-shrink-0" />
              <span>
                Note: Tech tags are self-reported interests selected by attendees during RSVP (Not verified skill tests).
              </span>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            {report.selfReportedSkills.map((item, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex justify-between text-xs font-semibold text-[#17211E]">
                  <span>{item.skill}</span>
                  <span className="text-[#D6A84F] font-mono">{item.percentage}% ({item.count})</span>
                </div>
                <div className="w-full bg-gray-100 h-3 rounded-full overflow-hidden">
                  <div
                    className="bg-[#D6A84F] h-full rounded-full transition-all"
                    style={{ width: `${item.percentage}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

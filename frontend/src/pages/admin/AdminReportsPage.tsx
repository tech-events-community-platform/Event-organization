import React, { useState } from 'react';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import {
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  ShieldCheck,
  Calendar,
} from 'lucide-react';

export const AdminReportsPage: React.FC = () => {
  const [exported, setExported] = useState(false);

  const totalEvents = 28;
  const totalRegistrations = 1450;
  const totalAttendance = 1240;
  const avgAttendanceRate = '85.5';

  const eventsOverTime = [
    { period: 'Q1 2025', count: 4 },
    { period: 'Q2 2025', count: 7 },
    { period: 'Q3 2025', count: 8 },
    { period: 'Q4 2025', count: 9 },
  ];

  const registrationsOverTime = [
    { period: 'Q1 2025', count: 210 },
    { period: 'Q2 2025', count: 380 },
    { period: 'Q3 2025', count: 420 },
    { period: 'Q4 2025', count: 440 },
  ];

  const attendanceOverTime = [
    { period: 'Q1 2025', count: 180 },
    { period: 'Q2 2025', count: 320 },
    { period: 'Q3 2025', count: 360 },
    { period: 'Q4 2025', count: 380 },
  ];

  const handleExportCSV = () => {
    setExported(true);
    const csvContent =
      `data:text/csv;charset=utf-8,` +
      `Metric,Value\n` +
      `Total Platform Events,${totalEvents}\n` +
      `Total Registrations,${totalRegistrations}\n` +
      `Total Door Attendance,${totalAttendance}\n` +
      `Average Turnout Rate,${avgAttendanceRate}%\n`;

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Sheba_Platform_Master_Report_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setTimeout(() => setExported(false), 4000);
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header Banner */}
      <div className="bg-[#064638] text-white p-6 sm:p-8 rounded-3xl space-y-4 shadow-lg border border-[#0B5D4B] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <Badge variant="gold" icon={<ShieldCheck className="w-3.5 h-3.5" />}>
            Platform Master Audit & Analytics
          </Badge>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Platform Reports</h1>
          <p className="text-xs text-gray-300">Comprehensive event attendance metrics across Ethiopia tech ecosystem.</p>
        </div>

        <Button
          onClick={handleExportCSV}
          variant="accent"
          size="lg"
          icon={<FileSpreadsheet className="w-5 h-5" />}
        >
          Export Platform Report (.CSV)
        </Button>
      </div>

      {exported && (
        <div className="bg-[#238B6E]/10 border border-[#238B6E]/40 p-4 rounded-2xl text-xs font-bold text-[#238B6E] flex items-center gap-2 animate-fade-in">
          <CheckCircle2 className="w-5 h-5" />
          Master platform report exported successfully!
        </div>
      )}

      {/* Non-Skill Disclaimer Alert */}
      <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl text-xs text-amber-900 flex items-start gap-2.5">
        <AlertCircle className="w-5 h-5 text-[#D6A84F] flex-shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <p className="font-bold text-amber-950">Important Product Disclaimer</p>
          <p className="text-[#66736E]">
            Platform reports describe event attendance logging via door QR passes. Attendance does NOT certify technical competence or skill levels.
          </p>
        </div>
      </div>

      {/* Statistics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-2xs space-y-1">
          <span className="text-xs font-semibold text-[#66736E]">Total Events</span>
          <p className="text-3xl font-extrabold text-[#17211E]">{totalEvents}</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-2xs space-y-1">
          <span className="text-xs font-semibold text-[#66736E]">Total Registrations</span>
          <p className="text-3xl font-extrabold text-[#0B5D4B]">{totalRegistrations}</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-2xs space-y-1">
          <span className="text-xs font-semibold text-[#66736E]">Total Attendance</span>
          <p className="text-3xl font-extrabold text-[#238B6E]">{totalAttendance}</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-2xs space-y-1">
          <span className="text-xs font-semibold text-[#66736E]">Average Turnout Rate</span>
          <p className="text-3xl font-extrabold text-[#D6A84F]">{avgAttendanceRate}%</p>
        </div>
      </div>

      {/* Charts / Visual Bars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Events Over Time */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200 space-y-4 shadow-2xs">
          <h3 className="font-bold text-sm text-[#17211E] flex items-center gap-2">
            <Calendar className="w-4 h-4 text-[#0B5D4B]" />
            Events Created Over Time
          </h3>
          <div className="space-y-3 pt-2">
            {eventsOverTime.map((item, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex justify-between text-xs font-semibold text-[#17211E]">
                  <span>{item.period}</span>
                  <span className="text-[#0B5D4B] font-mono">{item.count} events</span>
                </div>
                <div className="w-full bg-gray-100 h-3 rounded-full overflow-hidden">
                  <div
                    className="bg-[#0B5D4B] h-full rounded-full"
                    style={{ width: `${(item.count / 10) * 100}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Registrations Over Time */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200 space-y-4 shadow-2xs">
          <h3 className="font-bold text-sm text-[#17211E] flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-indigo-600" />
            Registrations Over Time
          </h3>
          <div className="space-y-3 pt-2">
            {registrationsOverTime.map((item, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex justify-between text-xs font-semibold text-[#17211E]">
                  <span>{item.period}</span>
                  <span className="text-indigo-600 font-mono">{item.count}</span>
                </div>
                <div className="w-full bg-gray-100 h-3 rounded-full overflow-hidden">
                  <div
                    className="bg-indigo-600 h-full rounded-full"
                    style={{ width: `${(item.count / 500) * 100}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Attendance Over Time */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200 space-y-4 shadow-2xs">
          <h3 className="font-bold text-sm text-[#17211E] flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#238B6E]" />
            Door Scans Over Time
          </h3>
          <div className="space-y-3 pt-2">
            {attendanceOverTime.map((item, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex justify-between text-xs font-semibold text-[#17211E]">
                  <span>{item.period}</span>
                  <span className="text-[#238B6E] font-mono">{item.count}</span>
                </div>
                <div className="w-full bg-gray-100 h-3 rounded-full overflow-hidden">
                  <div
                    className="bg-[#238B6E] h-full rounded-full"
                    style={{ width: `${(item.count / 500) * 100}%` }}
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

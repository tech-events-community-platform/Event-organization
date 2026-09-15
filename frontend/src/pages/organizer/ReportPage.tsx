import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import type { Event } from '../../types/event';
import type { SponsorReportData } from '../../types/attendance';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import {
  Calendar,
  Award,
  BarChart3,
  FileSpreadsheet,
  Printer,
} from 'lucide-react';

export const ReportPage: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string>(id || '');
  const [report, setReport] = useState<SponsorReportData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const reportContainerRef = useRef<HTMLDivElement>(null);

  // 1. Fetch all events and open directly into current / most recent event (Section 8)
  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      try {
        const evts = await api.events.getAll(user?.id);
        const myEvents = user?.role === 'ADMIN' ? evts : evts.filter((e) => e.organizerId === user?.id || !user?.id);
        
        // Sort: Ongoing first, then upcoming, then past (most recent first)
        const sorted = [...myEvents].sort((a, b) => {
          const stateA = api.getEventTimeStatus(a);
          const stateB = api.getEventTimeStatus(b);
          const stateRank = { ongoing: 1, upcoming: 2, past: 3 };
          if (stateRank[stateA] !== stateRank[stateB]) {
            return stateRank[stateA] - stateRank[stateB];
          }
          const dateA = new Date(a.date).getTime();
          const dateB = new Date(b.date).getTime();
          if (stateA === 'upcoming') return dateA - dateB;
          return dateB - dateA;
        });

        setEvents(sorted);

        if (id) {
          setSelectedEventId(id);
        } else if (sorted.length > 0) {
          setSelectedEventId(sorted[0].id);
        }
      } catch (err) {
        console.error('Failed to load events:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, [id, user?.id, user?.role]);

  // 2. Load report data for the selected event
  useEffect(() => {
    const fetchReport = async () => {
      if (!selectedEventId) return;
      setLoading(true);
      try {
        const data = await api.reports.getEventReport(selectedEventId);
        setReport(data);
      } catch (err) {
        console.error('Failed to load event report:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchReport();
  }, [selectedEventId]);

  const handleSelectEvent = (eventId: string) => {
    setSelectedEventId(eventId);
    navigate(`/organizer/reports/${eventId}`);
  };

  const handleExportCSV = async () => {
    if (!selectedEventId) return;
    await api.reports.exportCsv(selectedEventId);
  };

  const handlePrintPDF = () => {
    window.print();
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-24">
      {/* Top Header & Event Picker */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-4 print:hidden">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#63474D]">
              Proof-of-Performance Artifact
            </span>
            <Badge variant="primary" className="text-[10px]">
              Sponsor Ready
            </Badge>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-extrabold text-[#2D1F23]">
            Event Report
          </h1>
        </div>

        {/* Event Selector & Export Buttons */}
        <div className="flex flex-wrap items-center gap-3">
          {events.length > 1 && (
            <div className="min-w-56">
              <select
                value={selectedEventId}
                onChange={(e) => handleSelectEvent(e.target.value)}
                className="w-full px-3 py-2 bg-[#FAF7F5] border border-[#E8DDD7] rounded-xl text-xs font-bold text-[#2D1F23] focus:outline-none focus:ring-2 focus:ring-[#63474D] cursor-pointer"
              >
                {events.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.title} ({e.date})
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="flex items-center gap-2">
            <Button
              onClick={handleExportCSV}
              variant="outline"
              size="sm"
              icon={<FileSpreadsheet className="w-4 h-4 text-[#2A7B5F]" />}
            >
              Export CSV
            </Button>
            <Button
              onClick={handlePrintPDF}
              variant="accent"
              size="sm"
              icon={<Printer className="w-4 h-4" />}
            >
              Print / Save PDF
            </Button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="space-y-6 animate-pulse p-8 bg-white rounded-3xl border border-gray-200">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-20 bg-gray-100 rounded"></div>
          <div className="h-40 bg-gray-100 rounded"></div>
          <div className="h-64 bg-gray-100 rounded"></div>
        </div>
      ) : !report ? (
        <div className="bg-white rounded-3xl p-12 border border-[#E8DDD7] text-center space-y-3">
          <BarChart3 className="w-10 h-10 text-gray-300 mx-auto" />
          <p className="font-serif font-bold text-base text-[#2D1F23]">No Report Available</p>
          <p className="text-xs text-gray-500">Please select an event to generate its proof-of-performance report.</p>
        </div>
      ) : (
        /* Section 8: Single, clean document laid out top-to-bottom */
        <div
          ref={reportContainerRef}
          className="bg-white rounded-3xl border border-[#E8DDD7] p-8 sm:p-10 shadow-xs space-y-8 print:border-none print:shadow-none print:p-0"
        >
          {/* 1. Header: Event Title, Date, Location, Organizer Name */}
          <div className="border-b border-gray-200 pb-6 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-widest text-[#63474D]">
                Official Event & Sponsor Report
              </span>
              <span className="text-[11px] font-mono text-gray-400">
                Generated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
              </span>
            </div>

            <h1 className="font-serif text-3xl sm:text-4xl font-black text-[#2D1F23] tracking-tight">
              {report.eventTitle}
            </h1>

            <div className="flex flex-wrap items-center gap-6 text-xs text-gray-600 pt-1 font-medium">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-[#63474D]" />
                {report.eventDate}
              </span>
              <span className="flex items-center gap-1.5">
                <img src="/location.png" alt="Location" className="w-4 h-4 object-contain shrink-0" />
                {report.eventLocation}
              </span>
              <span className="flex items-center gap-1.5 font-bold text-[#63474D]">
                <Award className="w-4 h-4 text-[#FFA686]" />
                Organizer: {report.organizerName}
              </span>
            </div>
          </div>

          {/* 2. Description Paragraph (Reusing event's own description field) */}
          <div className="space-y-2">
            <h2 className="font-serif font-bold text-sm uppercase tracking-wider text-gray-400">
              Event Overview & Description
            </h2>
            <p className="text-xs sm:text-sm text-gray-700 leading-relaxed whitespace-pre-line bg-[#FAF7F5] p-5 rounded-2xl border border-[#E8DDD7]">
              {report.eventDescription || 'No description provided for this event.'}
            </p>
          </div>

          {/* 3. Badge Distribution Chart & Attendance Rate (Attended / Participant / Winner / Speaker) */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-serif font-bold text-base text-[#2D1F23]">
                Badge Distribution & Verified Attendance
              </h2>
              <span className="text-xs font-bold text-[#2A7B5F]">
                Attendance Rate: {report.attendanceRate}% ({report.totalAttended} / {report.totalRegistered})
              </span>
            </div>

            {/* 4-Box Badge Distribution Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                {
                  code: 'attended',
                  label: 'Attended (Door Floor)',
                  count: report.badgeDistribution?.attended || report.totalAttended,
                  icon: '✅',
                  color: 'border-emerald-200 bg-emerald-50/60 text-emerald-900',
                  badgeColor: 'text-[#2A7B5F]',
                },
                {
                  code: 'participant',
                  label: 'Participant',
                  count: report.badgeDistribution?.participant || 0,
                  icon: '🎖️',
                  color: 'border-blue-200 bg-blue-50/60 text-blue-900',
                  badgeColor: 'text-blue-700',
                },
                {
                  code: 'winner',
                  label: 'Winner',
                  count: report.badgeDistribution?.winner || 0,
                  icon: '🏆',
                  color: 'border-amber-200 bg-amber-50/60 text-amber-900',
                  badgeColor: 'text-amber-700',
                },
                {
                  code: 'speaker',
                  label: 'Speaker',
                  count: report.badgeDistribution?.speaker || 0,
                  icon: '🎤',
                  color: 'border-purple-200 bg-purple-50/60 text-purple-900',
                  badgeColor: 'text-purple-700',
                },
              ].map((b) => (
                <div
                  key={b.code}
                  className={`p-4 rounded-2xl border ${b.color} space-y-1.5 text-center`}
                >
                  <span className="text-2xl block">{b.icon}</span>
                  <p className="font-serif text-2xl font-black">{b.count}</p>
                  <p className="text-[11px] font-bold uppercase tracking-wider opacity-80">{b.label}</p>
                </div>
              ))}
            </div>

            {/* Visual Bar Distribution */}
            <div className="w-full bg-gray-100 rounded-full h-3 flex overflow-hidden">
              {report.totalAttended > 0 ? (
                <>
                  <div
                    style={{
                      width: `${((report.badgeDistribution?.attended || 0) / (report.totalRegistered || 1)) * 100}%`,
                    }}
                    className="bg-[#2A7B5F] h-full"
                    title={`Attended: ${report.badgeDistribution?.attended}`}
                  />
                  <div
                    style={{
                      width: `${((report.badgeDistribution?.participant || 0) / (report.totalRegistered || 1)) * 100}%`,
                    }}
                    className="bg-blue-500 h-full"
                    title={`Participant: ${report.badgeDistribution?.participant}`}
                  />
                  <div
                    style={{
                      width: `${((report.badgeDistribution?.winner || 0) / (report.totalRegistered || 1)) * 100}%`,
                    }}
                    className="bg-amber-500 h-full"
                    title={`Winner: ${report.badgeDistribution?.winner}`}
                  />
                  <div
                    style={{
                      width: `${((report.badgeDistribution?.speaker || 0) / (report.totalRegistered || 1)) * 100}%`,
                    }}
                    className="bg-purple-500 h-full"
                    title={`Speaker: ${report.badgeDistribution?.speaker}`}
                  />
                </>
              ) : (
                <div className="w-full bg-gray-200 h-full"></div>
              )}
            </div>
          </div>

          {/* 4. Attendee Roster Table: Name, Email, Check-in Time, Badges Awarded */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <h2 className="font-serif font-bold text-base text-[#2D1F23]">
                Attendee Roster ({report.attendees?.length || 0})
              </h2>
              <span className="text-xs text-gray-500">Verified attendance ledger</span>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-gray-200">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#FAF7F5] border-b border-gray-200 text-gray-600 font-bold uppercase text-[10px]">
                  <tr>
                    <th className="py-3 px-4">Attendee Name</th>
                    <th className="py-3 px-4">Email</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Check-in Time</th>
                    <th className="py-3 px-4">Badges Awarded</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {(report.attendees || []).map((att) => (
                    <tr key={att.id} className="hover:bg-gray-50/70 transition-colors">
                      <td className="py-3 px-4 font-bold text-[#2D1F23]">{att.name}</td>
                      <td className="py-3 px-4 text-gray-600">{att.email}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            att.status === 'Checked in'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          {att.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono text-[11px] text-gray-600">
                        {att.checkInTime || '—'}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex flex-wrap gap-1">
                          {att.badges && att.badges.length > 0 ? (
                            att.badges.map((b) => (
                              <span
                                key={b}
                                className="px-1.5 py-0.5 bg-gray-100 text-gray-800 rounded text-[10px] font-bold uppercase border border-gray-200"
                              >
                                {b}
                              </span>
                            ))
                          ) : (
                            <span className="text-gray-400 italic">None</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* 5. Raw Q&A Demographics Table (Questions as column headers, raw answer in rows) */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <h2 className="font-serif font-bold text-base text-[#2D1F23]">
                Raw Registration Demographics & Q&A
              </h2>
              <span className="text-xs text-gray-500">Unmodified respondent submissions</span>
            </div>

            {(() => {
              // Extract all unique custom question texts
              const allQuestions: string[] = [];
              if (report.customQuestions && report.customQuestions.length > 0) {
                report.customQuestions.forEach((q: any) => {
                  const text = typeof q === 'string' ? q : q.questionText || q.title || '';
                  if (text && !allQuestions.includes(text)) allQuestions.push(text);
                });
              }

              // Also scan attendees' answers object if questions weren't formally populated
              (report.attendees || []).forEach((att) => {
                if (att.answers && typeof att.answers === 'object') {
                  Object.keys(att.answers).forEach((k) => {
                    if (!allQuestions.includes(k)) allQuestions.push(k);
                  });
                }
              });

              if (allQuestions.length === 0) {
                return (
                  <div className="p-6 bg-[#FAF7F5] rounded-2xl border border-[#E8DDD7] text-center text-xs text-gray-500">
                    No custom registration questions were specified for this event.
                  </div>
                );
              }

              return (
                <div className="overflow-x-auto rounded-2xl border border-gray-200">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#FAF7F5] border-b border-gray-200 text-gray-600 font-bold uppercase text-[10px]">
                      <tr>
                        <th className="py-3 px-4 min-w-36">Attendee</th>
                        {allQuestions.map((q, idx) => (
                          <th key={idx} className="py-3 px-4 min-w-48 max-w-xs">
                            {q}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {(report.attendees || []).map((att) => (
                        <tr key={att.id} className="hover:bg-gray-50/70 transition-colors">
                          <td className="py-3 px-4 font-bold text-[#2D1F23] whitespace-nowrap">
                            {att.name}
                          </td>
                          {allQuestions.map((q, qIdx) => {
                            const ans = att.answers?.[q] || '—';
                            return (
                              <td key={qIdx} className="py-3 px-4 text-gray-700 max-w-xs truncate" title={ans}>
                                {ans}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
};

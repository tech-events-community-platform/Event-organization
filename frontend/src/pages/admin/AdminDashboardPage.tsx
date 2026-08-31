import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { api } from '../../services/api';
import type { Event } from '../../types/event';
import type { BadgeAward } from '../../types/attendance';
import type { PaymentIssueRecord } from '../../types/admin';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import {
  Award,
  ShieldCheck,
  CreditCard,
  AlertTriangle,
} from 'lucide-react';

export const AdminDashboardPage: React.FC = () => {
  const location = useLocation();
  const [events, setEvents] = useState<Event[]>([]);
  const [badges, setBadges] = useState<BadgeAward[]>([]);
  const [payments, setPayments] = useState<PaymentIssueRecord[]>([]);
  const [revokedNotice, setRevokedNotice] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const evts = await api.events.getAll();
      const bdgs = await api.badges.getAllBadgeAwards();
      const pays = await api.admin.getPaymentIssues();
      setEvents(evts);
      setBadges(bdgs);
      setPayments(pays);
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (location.hash) {
      setTimeout(() => {
        const elem = document.querySelector(location.hash);
        if (elem) {
          elem.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    }
  }, [location.hash, location.pathname]);

  const handleRevokeBadge = async (badgeId: string) => {
    try {
      await api.badges.adminRevokeBadge(badgeId);
      setRevokedNotice(`Badge ${badgeId} was successfully revoked.`);
      setTimeout(() => setRevokedNotice(null), 4000);
      const updated = await api.badges.getAllBadgeAwards();
      setBadges(updated);
    } catch (e: any) {
      alert(e.message || 'Revocation failed.');
    }
  };

  const totalRegistrations = events.reduce((acc, curr) => acc + curr.registeredCount, 0);
  const totalCheckIns = events.reduce((acc, curr) => acc + curr.checkedInCount, 0);

  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Badge variant="primary" icon={<ShieldCheck className="w-3.5 h-3.5" />}>
            Platform Administration & Oversight
          </Badge>
          <h1 className="font-serif text-2xl sm:text-3xl font-extrabold text-[#2D1F23] mt-1">
            Sheba Admin Panel
          </h1>
          <p className="text-xs text-[#756366]">
            Global metrics, badge revocation requests, and Chapa ETB settlement operations.
          </p>
        </div>

        <Link to="/admin/events">
          <Button variant="primary" size="sm">
            Event Oversight Queue
          </Button>
        </Link>
      </div>

      {revokedNotice && (
        <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-900 font-bold flex items-center gap-2 animate-fade-in">
          <AlertTriangle className="w-4 h-4 text-amber-600" />
          <span>{revokedNotice}</span>
        </div>
      )}

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-[#E8DDD7] shadow-xs space-y-1">
          <span className="text-[10px] uppercase font-bold text-[#756366]">Platform Events</span>
          <p className="font-serif text-3xl font-extrabold text-[#63474D]">{events.length}</p>
          <p className="text-[10px] text-[#756366]">Single-day tech events</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-[#E8DDD7] shadow-xs space-y-1">
          <span className="text-[10px] uppercase font-bold text-[#756366]">Total Registrations</span>
          <p className="font-serif text-3xl font-extrabold text-[#AA767C]">{totalRegistrations}</p>
          <p className="text-[10px] text-[#756366]">Across all organizers</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-[#E8DDD7] shadow-xs space-y-1">
          <span className="text-[10px] uppercase font-bold text-[#756366]">Turnout Rate</span>
          <p className="font-serif text-3xl font-extrabold text-[#2A7B5F]">
            {totalRegistrations > 0 ? ((totalCheckIns / totalRegistrations) * 100).toFixed(1) : 85.3}%
          </p>
          <p className="text-[10px] text-[#2A7B5F] font-semibold">{totalCheckIns} door check-ins</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-[#E8DDD7] shadow-xs space-y-1">
          <span className="text-[10px] uppercase font-bold text-[#756366]">Active Badge Awards</span>
          <p className="font-serif text-3xl font-extrabold text-[#FFA686]">
            {badges.filter((b) => !b.revokedAt).length}
          </p>
          <p className="text-[10px] text-[#756366]">Organizer credential issuances</p>
        </div>
      </div>

      {/* Badge Revocation Queue (SRS Section 7.3 & 11.1) */}
      <div id="badges" className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E8DDD7] shadow-xs space-y-4 scroll-mt-6">
        <div className="flex items-center justify-between pb-3 border-b border-[#E8DDD7]">
          <div>
            <h2 className="font-serif font-bold text-base text-[#2D1F23] flex items-center gap-2">
              <Award className="w-4 h-4 text-[#63474D]" />
              Badge Oversight & Admin Revocation Queue
            </h2>
            <p className="text-xs text-[#756366] mt-0.5">
              Organizers request badge revocations directly with admin. Revoking erases credential from public profile immediately.
            </p>
          </div>
          <Badge variant="primary">{badges.length} Records</Badge>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-[#FAF7F5] border-b border-[#E8DDD7] text-[10px] font-bold uppercase tracking-wider text-[#756366]">
                <th className="py-3 px-4">Badge</th>
                <th className="py-3 px-4">Recipient</th>
                <th className="py-3 px-4">Event Title</th>
                <th className="py-3 px-4">Issuing Organizer</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Admin Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E8DDD7] text-[#2D1F23]">
              {badges.map((b) => (
                <tr key={b.id} className="hover:bg-[#FAF7F5]/50">
                  <td className="py-3 px-4 font-bold">
                    <Badge variant="secondary" className="capitalize text-[10px]">
                      {b.badgeLabel}
                    </Badge>
                  </td>
                  <td className="py-3 px-4">
                    <p className="font-semibold">{b.attendeeName}</p>
                    <p className="text-[10px] text-[#756366]">{b.attendeeEmail}</p>
                  </td>
                  <td className="py-3 px-4 max-w-xs truncate">{b.eventTitle}</td>
                  <td className="py-3 px-4">{b.issuerName}</td>
                  <td className="py-3 px-4">
                    {b.revokedAt ? (
                      <Badge variant="error">REVOKED</Badge>
                    ) : (
                      <Badge variant="success">ACTIVE</Badge>
                    )}
                  </td>
                  <td className="py-3 px-4 text-right">
                    {!b.revokedAt ? (
                      <button
                        onClick={() => handleRevokeBadge(b.id)}
                        className="px-2.5 py-1 rounded-lg text-[11px] font-bold text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 transition-colors"
                      >
                        Revoke Badge
                      </button>
                    ) : (
                      <span className="text-[11px] text-[#756366] italic">Revoked</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Chapa Payment Settlement & Issues Log (SRS Section 5.2 & 11.1) */}
      <div id="payments" className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E8DDD7] shadow-xs space-y-4 scroll-mt-6">
        <div className="flex items-center justify-between pb-3 border-b border-[#E8DDD7]">
          <div>
            <h2 className="font-serif font-bold text-base text-[#2D1F23] flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-[#63474D]" />
              Chapa ETB Payment Issues & Split Fee Logs
            </h2>
            <p className="text-xs text-[#756366] mt-0.5">
              3% Sheba platform commission + Chapa gateway fee deductions.
            </p>
          </div>
          <Badge variant="tertiary">ETB Gateway</Badge>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-[#FAF7F5] border-b border-[#E8DDD7] text-[10px] font-bold uppercase tracking-wider text-[#756366]">
                <th className="py-3 px-4">Tx ID</th>
                <th className="py-3 px-4">Event</th>
                <th className="py-3 px-4">Payer</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Commission (3%)</th>
                <th className="py-3 px-4">Org Payout</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E8DDD7] text-[#2D1F23]">
              {payments.map((p) => (
                <tr key={p.id} className="hover:bg-[#FAF7F5]/50">
                  <td className="py-3 px-4 font-mono font-bold text-[#63474D]">{p.transactionId}</td>
                  <td className="py-3 px-4 max-w-xs truncate">{p.eventTitle}</td>
                  <td className="py-3 px-4 text-[#756366]">{p.attendeeEmail}</td>
                  <td className="py-3 px-4 font-bold">{p.amount} ETB</td>
                  <td className="py-3 px-4 text-[#AA767C] font-mono">{p.commissionAmount} ETB</td>
                  <td className="py-3 px-4 text-[#2A7B5F] font-bold font-mono">{p.organizerPayout} ETB</td>
                  <td className="py-3 px-4">
                    <Badge variant={p.status === 'SETTLED' ? 'success' : 'error'}>
                      {p.status}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

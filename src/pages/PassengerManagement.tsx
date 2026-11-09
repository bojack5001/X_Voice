import React, { useState, useMemo } from 'react';
import { 
  UserCheck, 
  Search, 
  Filter, 
  PhoneCall, 
  Sparkles, 
  Star, 
  Wallet, 
  MapPin, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  Eye,
  Plus
} from 'lucide-react';
import { useData } from '../context/DataContext';
import { Passenger, PassengerStatus, EngagementStatus, LanguageCode } from '../types';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { CallSimulationDialog } from '../components/calls/CallSimulationDialog';
import { DemoBadge } from '../components/common/DemoBadge';

export const PassengerManagement: React.FC = () => {
  const { passengers, addPassenger } = useData();

  // Search & Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [registrationFilter, setRegistrationFilter] = useState<string>('all');
  const [engagementFilter, setEngagementFilter] = useState<string>('all');
  const [languageFilter, setLanguageFilter] = useState<string>('all');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 6;

  // Selected Passenger for Details Modal
  const [selectedPassenger, setSelectedPassenger] = useState<Passenger | null>(null);

  // Call simulation modal
  const [callModalData, setCallModalData] = useState<{
    isOpen: boolean;
    name: string;
    phone: string;
    language: LanguageCode;
  }>({
    isOpen: false,
    name: '',
    phone: '',
    language: 'Tamil'
  });

  const filteredPassengers = useMemo(() => {
    return passengers.filter(p => {
      const matchesSearch = 
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.phone.includes(searchTerm) ||
        p.preferredPickupZone.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesReg = registrationFilter === 'all' || p.registrationStatus === registrationFilter;
      const matchesEng = engagementFilter === 'all' || p.engagementStatus === engagementFilter;
      const matchesLang = languageFilter === 'all' || p.preferredLanguage === languageFilter;

      return matchesSearch && matchesReg && matchesEng && matchesLang;
    });
  }, [passengers, searchTerm, registrationFilter, engagementFilter, languageFilter]);

  const totalPages = Math.ceil(filteredPassengers.length / pageSize) || 1;
  const paginatedPassengers = filteredPassengers.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const getEngagementBadge = (status: EngagementStatus) => {
    switch (status) {
      case 'High Value':
        return <Badge variant="purple">VIP High Value</Badge>;
      case 'Active':
        return <Badge variant="green">Active Frequent</Badge>;
      case 'Dormant':
        return <Badge variant="amber">Dormant (&gt;45d)</Badge>;
      case 'Churn Risk':
        return <Badge variant="red">Churn Risk</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const handleTriggerSurvey = (p: Passenger, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setCallModalData({
      isOpen: true,
      name: p.name,
      phone: p.phone,
      language: p.preferredLanguage
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight font-poppins">
              Passenger Engagement
            </h1>
            <DemoBadge label="SIMULATED COMMUTER POOL" />
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Monitor commuter engagement levels, ride frequency, wallet balance, and conduct verified manual feedback calls
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-card space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search passenger, phone, zone..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/50"
            />
          </div>

          {/* Registration Filter */}
          <div>
            <select
              value={registrationFilter}
              onChange={(e) => {
                setRegistrationFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full py-2 px-3 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/50"
            >
              <option value="all">All Registration Statuses</option>
              <option value="Registered">Registered Active</option>
              <option value="VIP">VIP Passenger</option>
              <option value="Pending Verification">Pending Verification</option>
              <option value="Blocked">Blocked</option>
            </select>
          </div>

          {/* Engagement Filter */}
          <div>
            <select
              value={engagementFilter}
              onChange={(e) => {
                setEngagementFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full py-2 px-3 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/50"
            >
              <option value="all">All Engagement Segments</option>
              <option value="High Value">VIP High Value</option>
              <option value="Active">Active Frequent</option>
              <option value="Dormant">Dormant (&gt;45 days)</option>
              <option value="Churn Risk">Churn Risk</option>
            </select>
          </div>

          {/* Language Filter */}
          <div>
            <select
              value={languageFilter}
              onChange={(e) => {
                setLanguageFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full py-2 px-3 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/50"
            >
              <option value="all">All Preferred Languages</option>
              <option value="Tamil">Tamil (தமிழ்)</option>
              <option value="Telugu">Telugu (తెలుగు)</option>
              <option value="English">English</option>
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-slate-500 pt-1 border-t border-slate-100">
          <span>Found <strong className="text-slate-900">{filteredPassengers.length}</strong> matching commuter records</span>
          {(searchTerm || registrationFilter !== 'all' || engagementFilter !== 'all' || languageFilter !== 'all') && (
            <button
              onClick={() => {
                setSearchTerm('');
                setRegistrationFilter('all');
                setEngagementFilter('all');
                setLanguageFilter('all');
              }}
              className="text-amber-700 font-semibold hover:underline"
            >
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* Passengers Table */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 font-semibold">
                <th className="py-3 px-4">Passenger Details</th>
                <th className="py-3 px-4">Language & Pickup Hub</th>
                <th className="py-3 px-4">Consent & Eligibility</th>
                <th className="py-3 px-4">Engagement State</th>
                <th className="py-3 px-4">Ride Stats & Rating</th>
                <th className="py-3 px-4">Wallet Balance</th>
                <th className="py-3 px-4">Last Activity</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedPassengers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-10 text-slate-400">
                    No passengers match selected criteria.
                  </td>
                </tr>
              ) : (
                paginatedPassengers.map((p) => {
                  const isEligible = p.consentStatus === 'Consent Granted' && p.dncStatus !== 'DNC Active';

                  return (
                    <tr 
                      key={p.id}
                      onClick={() => setSelectedPassenger(p)}
                      className="hover:bg-amber-50/40 transition cursor-pointer group"
                    >
                      {/* Passenger Details */}
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900 group-hover:text-amber-700 transition">
                          {p.name}
                        </div>
                        <div className="text-[11px] text-slate-500 font-mono">{p.phone}</div>
                        <div className="text-[10px] text-slate-400">{p.id}</div>
                      </td>

                      {/* Language & Pickup Hub */}
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-800">{p.preferredLanguage}</div>
                        <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3 text-slate-400" />
                          <span className="truncate max-w-[140px]">{p.preferredPickupZone}</span>
                        </div>
                      </td>

                      {/* Consent & Eligibility */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            p.consentStatus === 'Consent Granted' ? 'bg-emerald-100 text-emerald-800' :
                            p.consentStatus === 'Consent Revoked' ? 'bg-rose-100 text-rose-800' :
                            'bg-amber-100 text-amber-800'
                          }`}>
                            {p.consentStatus || 'Consent Unknown'}
                          </span>
                          {p.dncStatus === 'DNC Active' && (
                            <span className="px-1.5 py-0.5 rounded bg-rose-100 text-rose-800 text-[10px] font-bold">
                              DNC
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-slate-500 mt-0.5 max-w-[140px] truncate" title={p.nextEligibleContactDate}>
                          {p.nextEligibleContactDate || 'Eligible Now'}
                        </div>
                      </td>

                      {/* Engagement */}
                      <td className="py-3 px-4">
                        {getEngagementBadge(p.engagementStatus)}
                      </td>

                      {/* Rides & Rating */}
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-800">{p.completedRides} rides completed</div>
                        <div className="text-[11px] text-amber-600 flex items-center gap-1 font-semibold">
                          <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                          <span>{p.rating.toFixed(2)}</span>
                        </div>
                      </td>

                      {/* Wallet */}
                      <td className="py-3 px-4">
                        <div className="font-mono font-bold text-slate-900">₹{p.walletBalance.toFixed(2)}</div>
                        <span className="text-[10px] text-slate-400">Prepaid Credits</span>
                      </td>

                      {/* Last Ride */}
                      <td className="py-3 px-4">
                        <div className="text-[11px] font-medium text-slate-700">{p.lastRideDate}</div>
                        <span className="text-[10px] text-slate-400">Last called: {p.lastContactedAt || 'Never'}</span>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setSelectedPassenger(p)}
                            className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition"
                            title="View Profile & Ride History"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          <button
                            onClick={(e) => handleTriggerSurvey(p, e)}
                            disabled={!isEligible}
                            className="px-2.5 py-1 bg-amber-500 hover:bg-amber-600 disabled:opacity-35 disabled:cursor-not-allowed text-slate-950 font-bold rounded-lg text-xs flex items-center gap-1 shadow-sm transition active:scale-95"
                            title={
                              !isEligible 
                                ? `Outbound calling blocked: ${p.consentStatus}${p.dncStatus === 'DNC Active' ? ' (DNC Active)' : ''}` 
                                : 'Trigger manual feedback call sequence'
                            }
                          >
                            <PhoneCall className="w-3 h-3" />
                            <span>Manual Call</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="py-3 px-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between text-xs text-slate-500">
          <span>Page {currentPage} of {totalPages}</span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-40 transition font-medium"
            >
              Previous
            </button>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-40 transition font-medium"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Passenger Details Modal */}
      {selectedPassenger && (
        <Modal
          isOpen={!!selectedPassenger}
          onClose={() => setSelectedPassenger(null)}
          title={`Passenger Record • ${selectedPassenger.name}`}
          subtitle={`ID: ${selectedPassenger.id} • Registered since ${selectedPassenger.joinedDate}`}
          maxWidth="2xl"
          footer={
            <>
              <button
                onClick={() => setSelectedPassenger(null)}
                className="px-4 py-2 border border-slate-300 text-slate-700 text-xs font-semibold rounded-xl hover:bg-slate-50"
              >
                Close
              </button>
              <button
                disabled={selectedPassenger.consentStatus !== 'Consent Granted' || selectedPassenger.dncStatus === 'DNC Active'}
                onClick={() => {
                  const p = selectedPassenger;
                  setSelectedPassenger(null);
                  handleTriggerSurvey(p);
                }}
                className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 disabled:opacity-40 disabled:cursor-not-allowed text-slate-950 text-xs font-bold rounded-xl shadow-brand flex items-center gap-1.5"
                title={
                  selectedPassenger.consentStatus !== 'Consent Granted'
                    ? `Calling disabled: ${selectedPassenger.consentStatus}`
                    : selectedPassenger.dncStatus === 'DNC Active'
                    ? 'Calling disabled: DNC Active'
                    : 'Dispatch verified manual feedback call'
                }
              >
                <PhoneCall className="w-4 h-4" />
                <span>Launch Manual Feedback Call</span>
              </button>
            </>
          }
        >
          <div className="space-y-4 text-xs">
            {/* Highlights Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Engagement</span>
                <span className="mt-1 inline-block">{getEngagementBadge(selectedPassenger.engagementStatus)}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Consent Status</span>
                <span className={`text-xs font-bold mt-1 block ${
                  selectedPassenger.consentStatus === 'Consent Granted' ? 'text-emerald-700' :
                  selectedPassenger.consentStatus === 'Consent Revoked' ? 'text-rose-700' : 'text-amber-700'
                }`}>
                  {selectedPassenger.consentStatus || 'Consent Unknown'}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">DNC Suppression</span>
                <span className={`text-xs font-bold mt-1 block ${selectedPassenger.dncStatus === 'DNC Active' ? 'text-rose-700' : 'text-emerald-700'}`}>
                  {selectedPassenger.dncStatus || 'Not Listed'}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Eligibility</span>
                <span className="text-xs font-semibold text-slate-700 mt-1 block truncate" title={selectedPassenger.nextEligibleContactDate}>
                  {selectedPassenger.nextEligibleContactDate || 'Eligible Now'}
                </span>
              </div>
            </div>

            {/* Commute Info */}
            <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-2">
              <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider border-b border-slate-100 pb-2">
                Commute Patterns & Preferences
              </h4>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Frequent Hub / Route:</span>
                <span className="font-semibold text-slate-800">{selectedPassenger.preferredPickupZone}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Mobile Phone:</span>
                <span className="font-mono font-semibold text-slate-800">{selectedPassenger.phone}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Email Address:</span>
                <span className="font-mono text-slate-700">{selectedPassenger.email}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Last Ride Timestamp:</span>
                <span className="font-semibold text-slate-800">{selectedPassenger.lastRideDate}</span>
              </div>
            </div>

            {/* Notes */}
            {selectedPassenger.notes && (
              <div className="bg-amber-50/50 border border-amber-200 rounded-xl p-3 text-amber-950">
                <span className="font-bold text-[10px] uppercase tracking-wide block mb-1 text-amber-900">
                  Customer Experience History
                </span>
                <p>{selectedPassenger.notes}</p>
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* AI Voice Call Simulation Modal */}
      <CallSimulationDialog
        isOpen={callModalData.isOpen}
        onClose={() => setCallModalData({ ...callModalData, isOpen: false })}
        targetName={callModalData.name}
        targetPhone={callModalData.phone}
        defaultLanguage={callModalData.language}
      />
    </div>
  );
};


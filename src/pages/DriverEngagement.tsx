import React, { useState } from 'react';
import { 
  HeartHandshake, 
  PhoneCall, 
  Clock, 
  AlertCircle, 
  CheckCircle2, 
  MessageSquare, 
  UserX, 
  Flame, 
  Calendar, 
  Search, 
  ShieldAlert,
  ArrowUpRight
} from 'lucide-react';
import { useData } from '../context/DataContext';
import { Driver, LanguageCode } from '../types';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { CallSimulationDialog } from '../components/calls/CallSimulationDialog';
import { DemoBadge } from '../components/common/DemoBadge';

export const DriverEngagement: React.FC = () => {
  const { drivers, addTask, updateDriver } = useData();

  const [activeQueueTab, setActiveQueueTab] = useState<'urgent' | 'scheduled' | 're-engagement' | 'docs-pending'>('urgent');
  const [searchTerm, setSearchTerm] = useState('');

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

  // Log Note Modal
  const [selectedDriverForNote, setSelectedDriverForNote] = useState<Driver | null>(null);
  const [noteContent, setNoteContent] = useState('');

  // Categorize drivers into queues
  const urgentQueue = drivers.filter(d => d.status === 'rejected' || (d.complianceScore < 50 && d.status === 'docs_pending'));
  const scheduledQueue = drivers.filter(d => d.lastCallOutcome === 'Callback Requested');
  const reEngagementQueue = drivers.filter(d => d.status === 'contacted' || d.aiCallAttempts === 0);
  const docsPendingQueue = drivers.filter(d => d.status === 'docs_pending');

  const currentList = 
    activeQueueTab === 'urgent' ? urgentQueue :
    activeQueueTab === 'scheduled' ? scheduledQueue :
    activeQueueTab === 're-engagement' ? reEngagementQueue :
    docsPendingQueue;

  const filteredList = currentList.filter(d => 
    d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.phone.includes(searchTerm) ||
    d.city.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEscalateToHuman = (driver: Driver) => {
    addTask({
      title: `Human Escalation for ${driver.name} (${driver.city})`,
      category: 'Human Escalation',
      priority: 'Urgent',
      status: 'Pending',
      assignedToName: 'Dinesh Kumar Shanmugam',
      assignedRole: 'Team Leader',
      targetContactName: driver.name,
      targetPhone: driver.phone,
      targetType: 'Driver',
      dueDate: new Date(Date.now() + 2 * 3600 * 1000).toISOString().replace('T', ' ').substring(0, 16),
      createdDate: new Date().toISOString().replace('T', ' ').substring(0, 16),
      notes: `Escalated directly from Driver Engagement queue. Issue: Low compliance (${driver.complianceScore}%) or policy conflict.`
    });
    alert(`Follow-up task created! Escalated ${driver.name} to Tamil Nadu Team Leader Dinesh Kumar.`);
  };

  const handleSaveNote = () => {
    if (!selectedDriverForNote || !noteContent.trim()) return;
    updateDriver(selectedDriverForNote.id, {
      notes: `${selectedDriverForNote.notes} | [${new Date().toLocaleDateString()}]: ${noteContent.trim()}`
    });
    setSelectedDriverForNote(null);
    setNoteContent('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight font-poppins">
              Driver Engagement & Follow-up Queue
            </h1>
            <DemoBadge label="PRIORITY SLA DISPATCH" />
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time queues for missed callbacks, document bottlenecks, and urgent driver retention interventions
          </p>
        </div>
      </div>

      {/* Queue Tabs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <button
          onClick={() => setActiveQueueTab('urgent')}
          className={`p-4 rounded-2xl border text-left transition flex items-center justify-between ${
            activeQueueTab === 'urgent'
              ? 'bg-rose-50 border-rose-300 ring-2 ring-rose-500/20 shadow-sm'
              : 'bg-white border-slate-200/90 hover:bg-slate-50'
          }`}
        >
          <div>
            <span className="text-[10px] font-bold text-rose-600 uppercase tracking-wider block">Critical Queue</span>
            <div className="text-lg font-bold text-slate-900 mt-0.5">{urgentQueue.length} Urgent Drivers</div>
            <span className="text-[11px] text-slate-500">Expiring FC or Rejections</span>
          </div>
          <Flame className="w-5 h-5 text-rose-500" />
        </button>

        <button
          onClick={() => setActiveQueueTab('scheduled')}
          className={`p-4 rounded-2xl border text-left transition flex items-center justify-between ${
            activeQueueTab === 'scheduled'
              ? 'bg-amber-50 border-amber-300 ring-2 ring-amber-500/20 shadow-sm'
              : 'bg-white border-slate-200/90 hover:bg-slate-50'
          }`}
        >
          <div>
            <span className="text-[10px] font-bold text-amber-600 uppercase tracking-wider block">Requested Callbacks</span>
            <div className="text-lg font-bold text-slate-900 mt-0.5">{scheduledQueue.length} Scheduled</div>
            <span className="text-[11px] text-slate-500">Evening slot requested</span>
          </div>
          <Calendar className="w-5 h-5 text-amber-500" />
        </button>

        <button
          onClick={() => setActiveQueueTab('docs-pending')}
          className={`p-4 rounded-2xl border text-left transition flex items-center justify-between ${
            activeQueueTab === 'docs-pending'
              ? 'bg-purple-50 border-purple-300 ring-2 ring-purple-500/20 shadow-sm'
              : 'bg-white border-slate-200/90 hover:bg-slate-50'
          }`}
        >
          <div>
            <span className="text-[10px] font-bold text-purple-600 uppercase tracking-wider block">Document Assist</span>
            <div className="text-lg font-bold text-slate-900 mt-0.5">{docsPendingQueue.length} Pending KYC</div>
            <span className="text-[11px] text-slate-500">RC or DL missing photo</span>
          </div>
          <Clock className="w-5 h-5 text-purple-500" />
        </button>

        <button
          onClick={() => setActiveQueueTab('re-engagement')}
          className={`p-4 rounded-2xl border text-left transition flex items-center justify-between ${
            activeQueueTab === 're-engagement'
              ? 'bg-blue-50 border-blue-300 ring-2 ring-blue-500/20 shadow-sm'
              : 'bg-white border-slate-200/90 hover:bg-slate-50'
          }`}
        >
          <div>
            <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider block">Re-engagement</span>
            <div className="text-lg font-bold text-slate-900 mt-0.5">{reEngagementQueue.length} Uncontacted</div>
            <span className="text-[11px] text-slate-500">Pending onboarding review</span>
          </div>
          <ArrowUpRight className="w-5 h-5 text-blue-500" />
        </button>
      </div>

      {/* Queue Items Table */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-card overflow-hidden space-y-3 p-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search queue by driver, phone, city..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>
          <span className="text-xs font-semibold text-slate-500">
            Queue Depth: <strong>{filteredList.length} Drivers</strong>
          </span>
        </div>

        <div className="divide-y divide-slate-100 border border-slate-100 rounded-xl overflow-hidden">
          {filteredList.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-xs">
              No drivers currently in this queue. Great job!
            </div>
          ) : (
            filteredList.map((driver) => (
              <div 
                key={driver.id} 
                className="p-4 hover:bg-slate-50/70 transition flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-slate-900 text-sm">{driver.name}</span>
                    <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-mono font-medium">
                      {driver.id}
                    </span>
                    <span className="text-[10px] bg-amber-50 text-amber-800 border border-amber-200 px-1.5 py-0.2 rounded font-semibold">
                      {driver.preferredLanguage}
                    </span>
                    <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                      driver.consentStatus === 'Consent Granted' ? 'bg-emerald-100 text-emerald-800' :
                      driver.consentStatus === 'Consent Revoked' ? 'bg-rose-100 text-rose-800' :
                      'bg-amber-100 text-amber-800'
                    }`}>
                      {driver.consentStatus || 'Consent Unknown'}
                    </span>
                    {driver.dncStatus === 'DNC Active' && (
                      <span className="text-[10px] bg-rose-100 text-rose-800 px-1.5 py-0.5 rounded font-bold">
                        DNC Active
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-3 text-slate-500 text-[11px] flex-wrap">
                    <span className="font-mono">{driver.phone}</span>
                    <span>•</span>
                    <span>{driver.city} ({driver.vehicleType})</span>
                    <span>•</span>
                    <span className="font-medium text-slate-700">Attempts: {driver.aiCallAttempts}</span>
                    <span>•</span>
                    <span className="font-medium text-slate-700">Next Eligible: {driver.nextEligibleContactDate || 'Eligible Now'}</span>
                  </div>

                  <p className="text-[11px] text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-100 max-w-2xl mt-1">
                    <strong>Operational Context:</strong> {driver.notes}
                  </p>
                </div>

                {/* Queue Action Buttons */}
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    onClick={() => {
                      setSelectedDriverForNote(driver);
                      setNoteContent('');
                    }}
                    className="px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg transition"
                  >
                    Log Note
                  </button>

                  <button
                    onClick={() => handleEscalateToHuman(driver)}
                    className="px-3 py-1.5 bg-rose-50 border border-rose-200 hover:bg-rose-100 text-rose-800 text-xs font-semibold rounded-lg flex items-center gap-1 transition"
                  >
                    <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
                    <span>Human Escalation</span>
                  </button>

                  <button
                    disabled={driver.consentStatus !== 'Consent Granted' || driver.dncStatus === 'DNC Active'}
                    onClick={() => setCallModalData({
                      isOpen: true,
                      name: driver.name,
                      phone: driver.phone,
                      language: driver.preferredLanguage
                    })}
                    className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 disabled:opacity-35 disabled:cursor-not-allowed text-slate-950 text-xs font-bold rounded-lg shadow-sm flex items-center gap-1.5 transition active:scale-95"
                    title={
                      driver.consentStatus !== 'Consent Granted'
                        ? `Calling blocked: ${driver.consentStatus}`
                        : driver.dncStatus === 'DNC Active'
                        ? 'Calling blocked: DNC Active'
                        : 'Dispatch manual AI call'
                    }
                  >
                    <PhoneCall className="w-3.5 h-3.5" />
                    <span>Manual AI Call</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Note Modal */}
      {selectedDriverForNote && (
        <Modal
          isOpen={!!selectedDriverForNote}
          onClose={() => setSelectedDriverForNote(null)}
          title={`Log Operational Note • ${selectedDriverForNote.name}`}
          subtitle="Add internal notes for team leaders and CCE executives"
        >
          <div className="space-y-3 text-xs">
            <textarea
              rows={4}
              placeholder="Enter follow-up update, customer feedback, or promised documents..."
              value={noteContent}
              onChange={(e) => setNoteContent(e.target.value)}
              className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none"
            />
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setSelectedDriverForNote(null)}
                className="px-4 py-2 border border-slate-200 rounded-xl text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveNote}
                disabled={!noteContent.trim()}
                className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl disabled:opacity-50"
              >
                Save Note
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* AI Call Modal */}
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


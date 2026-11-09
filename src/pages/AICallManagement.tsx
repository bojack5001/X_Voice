import React, { useState } from 'react';
import { 
  PhoneCall, 
  Bot, 
  Globe, 
  Send, 
  Users, 
  CheckCircle2, 
  Clock, 
  Activity, 
  Radio, 
  Layers, 
  Sparkles,
  Zap,
  ShieldCheck,
  ShieldAlert,
  XCircle,
  AlertTriangle,
  Info,
  Car,
  UserCheck
} from 'lucide-react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { LanguageCode, Driver, Passenger } from '../types';
import { DemoBadge } from '../components/common/DemoBadge';
import { CallSimulationDialog } from '../components/calls/CallSimulationDialog';
import { SUPPORTED_LANGUAGES } from '../config/languages';
import { TELEPHONY_DEMO_STATUS } from '../data/mockConfig';

export const AICallManagement: React.FC = () => {
  const { aiAgents, drivers, passengers, calls } = useData();
  const { currentUser } = useAuth();

  // Contact Category & Selected Contact
  const [targetCategory, setTargetCategory] = useState<'Driver' | 'Passenger'>('Driver');
  const [selectedDriverId, setSelectedDriverId] = useState<string>(drivers[0]?.id || '');
  const [selectedPassengerId, setSelectedPassengerId] = useState<string>(passengers[0]?.id || '');
  const [selectedAgentId, setSelectedAgentId] = useState(aiAgents[0]?.id || 'AGENT-01');
  const [selectedLanguage, setSelectedLanguage] = useState<LanguageCode>('Tamil');

  // Modal State
  const [callModalOpen, setCallModalOpen] = useState(false);

  // Active contact resolution
  const activeDriver = drivers.find(d => d.id === selectedDriverId) || drivers[0];
  const activePassenger = passengers.find(p => p.id === selectedPassengerId) || passengers[0];
  const activeContact = targetCategory === 'Driver' ? activeDriver : activePassenger;
  const currentAgent = aiAgents.find(a => a.id === selectedAgentId) || aiAgents[0];

  // Consent & DNC evaluations
  const consentStatus = activeContact?.consentStatus || 'Consent Unknown';
  const dncStatus = activeContact?.dncStatus || 'Not Listed';
  const isConsentGranted = consentStatus === 'Consent Granted';
  const isDncClear = dncStatus === 'Not Listed';
  const isEligible = isConsentGranted && isDncClear;

  const handleLaunchModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isEligible) {
      alert('Outbound calling is blocked due to missing consent or active DNC suppression.');
      return;
    }
    setCallModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight font-poppins">
              Manual AI Call Dispatch Console
            </h1>
            <DemoBadge label="MANUAL ONLY • ZERO AUTO-DIAL" />
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Single-call verified outreach console with mandatory consent checking, suppression screening, and employee authorization
          </p>
        </div>
      </div>

      {/* Honest Telephony Status Strip (Replacing misleading claims) */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-card flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">SIP Trunk Status</span>
            <div className="text-sm font-bold text-amber-700 mt-1 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              {TELEPHONY_DEMO_STATUS.sipTrunk}
            </div>
            <span className="text-[10px] text-slate-400">Carrier Gateway: Not Connected</span>
          </div>
          <ShieldAlert className="w-5 h-5 text-amber-500" />
        </div>

        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-card flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Telephony Channels</span>
            <div className="text-base font-bold text-slate-800 mt-1">Simulated Streams</div>
            <span className="text-[10px] text-slate-400">Local Browser Audio / Tone</span>
          </div>
          <Radio className="w-5 h-5 text-slate-500" />
        </div>

        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-card flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Calling Compliance Mode</span>
            <div className="text-sm font-bold text-emerald-700 mt-1 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              Manual Action Required
            </div>
            <span className="text-[10px] text-slate-400">Batch-dialing disabled</span>
          </div>
          <ShieldCheck className="w-5 h-5 text-emerald-600" />
        </div>

        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-card flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Simulated Calls Logged</span>
            <div className="text-base font-bold text-slate-900 mt-1">{calls.length} Sessions</div>
            <span className="text-[10px] text-slate-400">Demo audit transcripts</span>
          </div>
          <CheckCircle2 className="w-5 h-5 text-amber-500" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Outbound Dispatch Form (Mandatory Sequence) */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/90 p-6 shadow-card space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-base font-bold text-slate-900">Manual AI Voice Call Dispatch</h3>
              <p className="text-xs text-slate-500">Every call requires explicit operator confirmation and consent verification</p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 bg-amber-50 text-amber-900 border border-amber-200 rounded-lg">
              Simulated Local Dispatch
            </span>
          </div>

          <form onSubmit={handleLaunchModal} className="space-y-4 text-xs">
            {/* Step 1: Category toggle */}
            <div>
              <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                1. Select Contact Type
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setTargetCategory('Driver')}
                  className={`flex-1 py-2 px-3 rounded-xl font-bold flex items-center justify-center gap-2 border transition ${
                    targetCategory === 'Driver' 
                      ? 'bg-amber-500 text-slate-950 border-amber-500 shadow-sm' 
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <Car className="w-4 h-4" />
                  <span>Driver Partner Database ({drivers.length})</span>
                </button>

                <button
                  type="button"
                  onClick={() => setTargetCategory('Passenger')}
                  className={`flex-1 py-2 px-3 rounded-xl font-bold flex items-center justify-center gap-2 border transition ${
                    targetCategory === 'Passenger' 
                      ? 'bg-amber-500 text-slate-950 border-amber-500 shadow-sm' 
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <UserCheck className="w-4 h-4" />
                  <span>Passenger Database ({passengers.length})</span>
                </button>
              </div>
            </div>

            {/* Step 2: Contact selection */}
            <div>
              <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                2. Select Destination Contact
              </label>
              {targetCategory === 'Driver' ? (
                <select
                  value={selectedDriverId}
                  onChange={(e) => setSelectedDriverId(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 text-xs"
                >
                  {drivers.map(d => (
                    <option key={d.id} value={d.id}>
                      {d.name} • {d.phone} • {d.city} ({d.preferredLanguage}) — [{d.consentStatus}]
                    </option>
                  ))}
                </select>
              ) : (
                <select
                  value={selectedPassengerId}
                  onChange={(e) => setSelectedPassengerId(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 text-xs"
                >
                  {passengers.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name} • {p.phone} • {p.preferredPickupZone} ({p.preferredLanguage}) — [{p.consentStatus}]
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Steps 3, 4, 5: Live Eligibility Indicators */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase block">3. Consent Status</span>
                <span className={`font-bold inline-block text-xs mt-0.5 ${
                  consentStatus === 'Consent Granted' ? 'text-emerald-700' :
                  consentStatus === 'Consent Revoked' ? 'text-rose-700' : 'text-amber-700'
                }`}>
                  {consentStatus}
                </span>
              </div>

              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase block">4. DNC Status</span>
                <span className={`font-bold inline-block text-xs mt-0.5 ${isDncClear ? 'text-emerald-700' : 'text-rose-700'}`}>
                  {dncStatus}
                </span>
              </div>

              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase block">5. Next Eligible Date</span>
                <span className="font-semibold text-slate-700 text-xs mt-0.5 truncate block" title={activeContact?.nextEligibleContactDate}>
                  {activeContact?.nextEligibleContactDate || 'Eligible Now'}
                </span>
              </div>
            </div>

            {/* Blocker note if ineligibility detected */}
            {!isEligible && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2.5 text-rose-900">
                <XCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <div className="text-[11px]">
                  <strong>Outbound AI Calling Disabled:</strong> Contact does not have verified consent on file or is on the DNC registry.
                  Telephony regulations prohibit autonomous calls without recorded opt-in.
                </div>
              </div>
            )}

            {/* Step 6: AI Agent & Modular Language Selection */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1 flex items-center gap-1.5">
                  <Bot className="w-4 h-4 text-amber-500" />
                  6a. AI Agent Persona
                </label>
                <select
                  value={selectedAgentId}
                  onChange={(e) => setSelectedAgentId(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 text-xs"
                >
                  {aiAgents.map(a => (
                    <option key={a.id} value={a.id}>
                      {a.name} ({a.voiceGender})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1 flex items-center gap-1.5">
                  <Globe className="w-4 h-4 text-amber-500" />
                  6b. Voice Dialect (Modular)
                </label>
                <select
                  value={selectedLanguage}
                  onChange={(e) => setSelectedLanguage(e.target.value as LanguageCode)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 text-xs font-semibold"
                >
                  {SUPPORTED_LANGUAGES.map(lang => (
                    <option key={lang.code} value={lang.code}>
                      {lang.label} ({lang.nativeLabel}) — {lang.region}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Prompt preview */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-1">
              <span className="font-bold text-slate-800 block text-[10px] uppercase tracking-wider">
                Opening Script Preview ({selectedLanguage}):
              </span>
              <p className="text-slate-600 text-xs italic">
                "{currentAgent.greetingPrompts[selectedLanguage] || currentAgent.greetingPrompts.English}"
              </p>
            </div>

            {/* Step 7 & 8: Employee Action Confirmation */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-100">
              <div className="text-[11px] text-slate-500">
                Operator: <strong className="text-slate-800">{currentUser.name}</strong> ({currentUser.role})
              </div>

              <button
                type="submit"
                disabled={!isEligible}
                className="px-6 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 disabled:opacity-40 disabled:cursor-not-allowed text-slate-950 font-bold rounded-xl shadow-brand text-xs flex items-center gap-2 transition active:scale-95"
              >
                <PhoneCall className="w-4 h-4" />
                <span>Open Confirmation & Dispatch Call</span>
              </button>
            </div>
          </form>
        </div>

        {/* Telephony Health & Recent Dispatches */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-card space-y-4">
          <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
            Recent Simulated Dispatches
          </h3>

          <div className="space-y-3">
            {calls.slice(0, 4).map(c => (
              <div key={c.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900">{c.contactName}</span>
                  <span className="font-mono text-[10px] text-slate-400">{c.audioDuration}</span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-500">
                  <span>{c.agentName}</span>
                  <span className="font-semibold text-amber-700">{c.language}</span>
                </div>
                <div className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-semibold inline-block">
                  Outcome: {c.outcome}
                </div>
              </div>
            ))}
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-[11px] text-slate-600 space-y-1">
            <strong className="text-slate-800 block">Integration Architecture Note:</strong>
            <p>
              In production, this console sends authenticated API webhooks to the backend telephony orchestrator with validated user JWT tokens and verified consent records.
            </p>
          </div>
        </div>
      </div>

      {/* 9-Step Guided Call Simulation Dialog */}
      <CallSimulationDialog
        isOpen={callModalOpen}
        onClose={() => setCallModalOpen(false)}
        targetContact={activeContact}
        defaultLanguage={selectedLanguage}
      />
    </div>
  );
};

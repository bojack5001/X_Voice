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
  Zap
} from 'lucide-react';
import { useData } from '../context/DataContext';
import { LanguageCode } from '../types';
import { DemoBadge } from '../components/common/DemoBadge';
import { CallSimulationDialog } from '../components/calls/CallSimulationDialog';

export const AICallManagement: React.FC = () => {
  const { aiAgents, drivers, calls } = useData();

  // Outbound Dispatch Form state
  const [targetType, setTargetType] = useState<'existing' | 'custom'>('existing');
  const [selectedDriverId, setSelectedDriverId] = useState<string>(drivers[0]?.id || '');
  const [customName, setCustomName] = useState('');
  const [customPhone, setCustomPhone] = useState('');
  const [selectedAgentId, setSelectedAgentId] = useState(aiAgents[0]?.id || 'AGENT-01');
  const [selectedLanguage, setSelectedLanguage] = useState<LanguageCode>('Tamil');
  const [batchMode, setBatchMode] = useState(false);

  // Active simulation modal
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

  const selectedDriver = drivers.find(d => d.id === selectedDriverId);
  const currentAgent = aiAgents.find(a => a.id === selectedAgentId) || aiAgents[0];

  const handleLaunchCall = (e: React.FormEvent) => {
    e.preventDefault();

    const name = targetType === 'existing' ? (selectedDriver?.name || 'Driver Lead') : customName;
    const phone = targetType === 'existing' ? (selectedDriver?.phone || '+91 98401 23456') : customPhone;

    if (!name || !phone) {
      alert('Please specify contact name and phone number');
      return;
    }

    setCallModalData({
      isOpen: true,
      name,
      phone,
      language: selectedLanguage
    });
  };

  const queuedCallsCount = 18;
  const inProgressCallsCount = 4;
  const completedTodayCount = 142;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight font-poppins">
              AI Voice Call Dispatch Console
            </h1>
            <DemoBadge label="SIMULATED TELEPHONY CARRIER" />
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure automated outbound voice campaigns, select AI agent personas, and simulate conversational telephonic sessions
          </p>
        </div>
      </div>

      {/* Telephony Channels Metric Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-card flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">SIP Trunk Status</span>
            <div className="text-base font-bold text-emerald-600 mt-0.5 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Connected (Ready)
            </div>
            <span className="text-[10px] text-slate-400">Exotel SIP Trunk (Mocked)</span>
          </div>
          <Zap className="w-6 h-6 text-emerald-500" />
        </div>

        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-card flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Queue Depth</span>
            <div className="text-lg font-bold text-slate-900 mt-0.5">{queuedCallsCount} Queued</div>
            <span className="text-[10px] text-slate-400">Scheduled for dialout</span>
          </div>
          <Clock className="w-6 h-6 text-amber-500" />
        </div>

        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-card flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Active Channels</span>
            <div className="text-lg font-bold text-red-600 mt-0.5 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
              {inProgressCallsCount} Live
            </div>
            <span className="text-[10px] text-slate-400">Concurrent streams</span>
          </div>
          <Radio className="w-6 h-6 text-red-500" />
        </div>

        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-card flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Completed Today</span>
            <div className="text-lg font-bold text-slate-900 mt-0.5">{completedTodayCount} Calls</div>
            <span className="text-[10px] text-emerald-600 font-semibold">91.4% Intent Extracted</span>
          </div>
          <CheckCircle2 className="w-6 h-6 text-emerald-500" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Outbound Dispatch Form */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/90 p-6 shadow-card space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-base font-bold text-slate-900">Initiate Outbound AI Call</h3>
              <p className="text-xs text-slate-500">Dispatch single test call or batch queue to partner contacts</p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 bg-amber-50 text-amber-900 border border-amber-200 rounded-lg">
              Simulated Outbound Line
            </span>
          </div>

          <form onSubmit={handleLaunchCall} className="space-y-4 text-xs">
            {/* Target mode toggle */}
            <div className="flex items-center gap-3 bg-slate-50 p-2 rounded-xl border border-slate-200">
              <button
                type="button"
                onClick={() => setTargetType('existing')}
                className={`flex-1 py-1.5 rounded-lg font-semibold transition ${
                  targetType === 'existing' 
                    ? 'bg-white shadow text-slate-900' 
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Select from CRM Database
              </button>
              <button
                type="button"
                onClick={() => setTargetType('custom')}
                className={`flex-1 py-1.5 rounded-lg font-semibold transition ${
                  targetType === 'custom' 
                    ? 'bg-white shadow text-slate-900' 
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Custom Test Phone Number
              </button>
            </div>

            {/* Target selection */}
            {targetType === 'existing' ? (
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Select Driver Partner</label>
                <select
                  value={selectedDriverId}
                  onChange={(e) => setSelectedDriverId(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 text-xs"
                >
                  {drivers.map(d => (
                    <option key={d.id} value={d.id}>
                      {d.name} ({d.phone}) • {d.city} • {d.preferredLanguage}
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Target Name *</label>
                  <input
                    type="text"
                    placeholder="e.g. Anandha Krishnan"
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Phone Number *</label>
                  <input
                    type="text"
                    placeholder="+91 98400 12345"
                    value={customPhone}
                    onChange={(e) => setCustomPhone(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 font-mono"
                  />
                </div>
              </div>
            )}

            {/* AI Agent & Language selection */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                  <Bot className="w-4 h-4 text-amber-500" />
                  AI Agent Persona
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
                <label className="block font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                  <Globe className="w-4 h-4 text-amber-500" />
                  Primary Voice Dialect
                </label>
                <select
                  value={selectedLanguage}
                  onChange={(e) => setSelectedLanguage(e.target.value as LanguageCode)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 text-xs"
                >
                  <option value="Tamil">Tamil (தமிழ் - Chennai / Madurai)</option>
                  <option value="Telugu">Telugu (తెలుగు - Hyderabad / AP)</option>
                  <option value="English">English (Indian Accent)</option>
                  <option value="Hindi">Hindi (हिंदी)</option>
                </select>
              </div>
            </div>

            {/* Persona preview summary */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-1">
              <span className="font-bold text-slate-800 block text-[11px] uppercase tracking-wider">
                Active Telephony Prompt Hook
              </span>
              <p className="text-slate-600 text-xs italic">
                "{currentAgent.greetingPrompts[selectedLanguage] || currentAgent.greetingPrompts.English}"
              </p>
            </div>

            {/* Launch button */}
            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                className="px-6 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 font-bold rounded-xl shadow-brand text-xs flex items-center gap-2 transition active:scale-95"
              >
                <PhoneCall className="w-4 h-4" />
                <span>Launch Interactive Call Simulation</span>
              </button>
            </div>
          </form>
        </div>

        {/* Telephony Health & Recent Dispatches */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-card space-y-4">
          <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
            Recent Telephony Dispatches
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

          <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-[11px] text-amber-900">
            <strong>Production Integration Note:</strong> When connecting Exotel, n8n webhook web-sockets, and OpenAI Realtime API, this console triggers direct SIP trunk channels with 0 code changes.
          </div>
        </div>
      </div>

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


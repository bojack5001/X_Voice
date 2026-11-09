import React, { useState } from 'react';
import { 
  Radio, 
  PhoneCall, 
  Headphones, 
  UserCheck, 
  Volume2, 
  ShieldAlert, 
  Clock, 
  Wifi, 
  Sparkles,
  PhoneOff,
  Bot
} from 'lucide-react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { DemoBadge } from '../components/common/DemoBadge';
import { Modal } from '../components/common/Modal';

export const LiveCallMonitor: React.FC = () => {
  const { liveCalls, addTask } = useData();
  const { currentUser } = useAuth();

  const [activeListeningCall, setActiveListeningCall] = useState<any | null>(null);
  const [takeoverSuccessCall, setTakeoverSuccessCall] = useState<any | null>(null);

  const formatDuration = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleTakeoverCall = (call: any) => {
    addTask({
      title: `Live Human Intervention on Call ${call.id} (${call.contactName})`,
      category: 'Human Escalation',
      priority: 'Urgent',
      status: 'In Progress',
      assignedToName: currentUser.name,
      assignedRole: currentUser.role,
      targetContactName: call.contactName,
      targetPhone: call.contactPhone,
      targetType: call.contactType,
      dueDate: 'Immediate',
      createdDate: new Date().toISOString().replace('T', ' ').substring(0, 16),
      notes: `Live call intercepted by operator ${currentUser.name} (${currentUser.role}). AI stream paused.`
    });
    setTakeoverSuccessCall(call);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight font-poppins">
              Live Call Monitor
            </h1>
            <DemoBadge label="SIMULATED TELEPHONY CHANNELS • DEMO ONLY" />
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Locally simulated multi-lingual voice streams demonstrating sentiment monitoring, speech transcript generation & supervisor takeover
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-xl bg-amber-500/10 text-amber-800 border border-amber-300 text-xs font-bold flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            {liveCalls.filter(c => c.status === 'in-progress').length} Simulated Streams (Demo Only)
          </span>
        </div>
      </div>

      {/* Live Stream Tiles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {liveCalls.map((call) => (
          <div 
            key={call.id}
            className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-card space-y-4 hover:border-amber-400 transition"
          >
            {/* Top Channel Header */}
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900 text-sm">{call.contactName}</span>
                  <span className="font-mono text-[10px] text-slate-400">({call.id})</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    call.language === 'Tamil' ? 'bg-amber-100 text-amber-900' :
                    call.language === 'Telugu' ? 'bg-orange-100 text-orange-900' :
                    'bg-blue-100 text-blue-900'
                  }`}>
                    {call.language}
                  </span>
                </div>
                <div className="text-xs text-slate-500 font-mono mt-0.5">{call.contactPhone} • {call.driverVehicle}</div>
              </div>

              <div className="text-right">
                <div className="flex items-center gap-1.5 justify-end">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="font-mono text-xs font-bold text-slate-900">
                    {formatDuration(call.durationSeconds)}
                  </span>
                </div>
                <span className="text-[10px] text-slate-400 flex items-center gap-1 justify-end mt-0.5">
                  <Wifi className="w-3 h-3 text-emerald-500" />
                  Signal {call.signalStrength}%
                </span>
              </div>
            </div>

            {/* Agent & Current Dialogue Step */}
            <div className="bg-slate-50 rounded-xl p-3 border border-slate-200/80 space-y-1.5 text-xs">
              <div className="flex items-center justify-between text-[11px]">
                <div className="flex items-center gap-1.5 text-slate-700 font-semibold">
                  <Bot className="w-3.5 h-3.5 text-amber-600" />
                  <span>{call.agentName}</span>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                  {call.sentiment} Sentiment
                </span>
              </div>
              <p className="text-slate-600 italic">
                "{call.currentStep}"
              </p>
            </div>

            {/* Simulated Audio Waveform Bar */}
            <div className="flex items-center justify-between gap-1 h-6 px-1 bg-slate-900 rounded-lg p-1.5">
              {Array.from({ length: 28 }).map((_, i) => (
                <div
                  key={i}
                  className="flex-1 bg-amber-400 rounded-full wave-bar"
                  style={{
                    height: `${Math.max(20, (i % 5) * 20 + 20)}%`,
                    animationDelay: `${(i % 7) * 0.15}s`
                  }}
                />
              ))}
            </div>

            {/* Action Buttons: Listen In vs Takeover */}
            <div className="flex items-center justify-between pt-1 text-xs">
              <button
                onClick={() => setActiveListeningCall(call)}
                className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl font-semibold flex items-center gap-1.5 transition"
              >
                <Headphones className="w-3.5 h-3.5 text-amber-600" />
                <span>Listen In (Audio)</span>
              </button>

              <button
                onClick={() => handleTakeoverCall(call)}
                className="px-3.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 rounded-xl font-bold flex items-center gap-1.5 transition"
              >
                <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
                <span>Take Over Call</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Listen In Audio Dialog */}
      {activeListeningCall && (
        <Modal
          isOpen={!!activeListeningCall}
          onClose={() => setActiveListeningCall(null)}
          title={`Supervisor Listen In • ${activeListeningCall.contactName}`}
          subtitle={`Channel: ${activeListeningCall.id} • AI Agent: ${activeListeningCall.agentName}`}
          maxWidth="lg"
        >
          <div className="space-y-4 text-xs">
            <div className="bg-slate-900 text-white p-4 rounded-xl space-y-3">
              <div className="flex items-center justify-between text-slate-400 text-xs">
                <span className="flex items-center gap-1.5 text-amber-400 font-bold">
                  <span className="w-2 h-2 rounded-full bg-amber-400" />
                  Simulated Stream Tapped (Muted Operator • Demo)
                </span>
                <span className="font-mono text-amber-400">
                  {formatDuration(activeListeningCall.durationSeconds)}
                </span>
              </div>

              {/* Dynamic Soundwaves */}
              <div className="flex items-center justify-center gap-1 h-14 bg-slate-850 rounded-lg p-2">
                {Array.from({ length: 30 }).map((_, i) => (
                  <div
                    key={i}
                    className="w-1.5 bg-amber-400 rounded-full wave-bar"
                    style={{
                      height: `${Math.max(20, (i % 6) * 16 + 15)}%`,
                      animationDuration: `${0.7 + (i % 3) * 0.4}s`
                    }}
                  />
                ))}
              </div>

              <div className="text-center text-[11px] text-slate-400">
                Listening as <strong>{currentUser.name} ({currentUser.role})</strong>. The target driver cannot hear your microphone.
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Live Speech Recognition Stream
              </span>
              <p className="text-slate-800 font-medium">
                {activeListeningCall.language === 'Tamil'
                  ? 'ஓட்டுநர்: "சார் என் வண்டி 2022 மாடல், ஆவணங்களை வாட்ஸ்அப்பில் அனுப்புறேன்..."'
                  : activeListeningCall.language === 'Telugu'
                  ? 'డ్రైవర్: "అవునండి, నేను మొదటి నెల జీరో కమిషన్ ఆఫర్‌లో చేరతాను..."'
                  : 'Customer: "Yes, I will upload the insurance policy copy today..."'}
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setActiveListeningCall(null)}
                className="px-4 py-2 bg-slate-900 text-white rounded-xl font-semibold hover:bg-slate-800"
              >
                Disconnect Headset
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Takeover Confirmation Modal */}
      {takeoverSuccessCall && (
        <Modal
          isOpen={!!takeoverSuccessCall}
          onClose={() => setTakeoverSuccessCall(null)}
          title="Human Takeover Initiated"
          subtitle="AI Voice stream has been gracefully paused"
          maxWidth="md"
        >
          <div className="text-center space-y-3 py-2 text-xs">
            <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold text-slate-900">
              Call Transferred to {currentUser.name}
            </h4>
            <p className="text-slate-600 leading-relaxed">
              Target driver <strong>{takeoverSuccessCall.contactName}</strong> has been bridged into your active telephony softphone extension. An urgent escalation task was logged in the CRM.
            </p>
            <div className="pt-2">
              <button
                onClick={() => setTakeoverSuccessCall(null)}
                className="px-5 py-2 bg-slate-900 text-white rounded-xl font-semibold hover:bg-slate-800"
              >
                Dismiss
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};


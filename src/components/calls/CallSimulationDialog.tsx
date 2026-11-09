import React, { useState, useEffect } from 'react';
import { 
  PhoneCall, 
  PhoneOff, 
  Bot, 
  Globe, 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle,
  XCircle,
  ShieldCheck,
  ShieldAlert,
  Clock,
  User,
  Car,
  UserCheck,
  Lock,
  ArrowRight,
  Info
} from 'lucide-react';
import { Modal } from '../common/Modal';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { LanguageCode, Driver, Passenger, ConsentStatus, DncStatus } from '../../types';
import { playTelephonyTone, speakText, stopSpeech } from '../../utils/audioSynthesizer';
import { SUPPORTED_LANGUAGES } from '../../config/languages';
import { Badge } from '../common/Badge';

interface CallSimulationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  targetContact?: Driver | Passenger | null;
  targetName?: string;
  targetPhone?: string;
  defaultLanguage?: LanguageCode;
}

export const CallSimulationDialog: React.FC<CallSimulationDialogProps> = ({
  isOpen,
  onClose,
  targetContact: initialTargetContact,
  targetName: initialTargetName,
  targetPhone: initialTargetPhone,
  defaultLanguage = 'Tamil'
}) => {
  const { aiAgents, drivers, passengers, triggerSimulationCall } = useData();
  const { currentUser } = useAuth();

  // Contact Selection State (Step 1)
  const [contactCategory, setContactCategory] = useState<'Driver' | 'Passenger'>('Driver');
  const [selectedContactId, setSelectedContactId] = useState<string>('');

  // Form State
  const [selectedAgentId, setSelectedAgentId] = useState(aiAgents[0]?.id || 'AGENT-01');
  const [selectedLanguage, setSelectedLanguage] = useState<LanguageCode>(defaultLanguage);
  const [operatorConfirmed, setOperatorConfirmed] = useState(false);

  // Workflow Step: 'verification' (Steps 1-8) | 'calling' | 'connected' | 'completed' (Step 9)
  const [workflowState, setWorkflowState] = useState<'verification' | 'calling' | 'connected' | 'completed'>('verification');
  const [callDuration, setCallDuration] = useState(0);
  const [logs, setLogs] = useState<Array<{ sender: string; text: string; time: string }>>([]);

  // Resolve active contact
  const activeContact = React.useMemo(() => {
    if (initialTargetContact) return initialTargetContact;
    if (initialTargetName || initialTargetPhone) {
      // Find matching driver or passenger
      const d = drivers.find(drv => drv.name === initialTargetName || drv.phone === initialTargetPhone);
      if (d) return d;
      const p = passengers.find(psg => psg.name === initialTargetName || psg.phone === initialTargetPhone);
      if (p) return p;
    }
    if (contactCategory === 'Driver') {
      return drivers.find(d => d.id === selectedContactId) || drivers[0];
    } else {
      return passengers.find(p => p.id === selectedContactId) || passengers[0];
    }
  }, [initialTargetContact, initialTargetName, initialTargetPhone, contactCategory, selectedContactId, drivers, passengers]);

  // Sync selected contact on open
  useEffect(() => {
    if (isOpen) {
      setWorkflowState('verification');
      setCallDuration(0);
      setLogs([]);
      setOperatorConfirmed(false);
      setSelectedLanguage(defaultLanguage);

      if (initialTargetContact) {
        if ('vehicleType' in initialTargetContact) {
          setContactCategory('Driver');
          setSelectedContactId(initialTargetContact.id);
        } else {
          setContactCategory('Passenger');
          setSelectedContactId(initialTargetContact.id);
        }
        if (initialTargetContact.preferredLanguage) {
          setSelectedLanguage(initialTargetContact.preferredLanguage);
        }
      } else if (drivers.length > 0) {
        setSelectedContactId(drivers[0].id);
      }
    }
  }, [isOpen, initialTargetContact, defaultLanguage, drivers]);

  // Tick call duration when connected
  useEffect(() => {
    let interval: any;
    if (workflowState === 'connected') {
      interval = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [workflowState]);

  const currentAgent = aiAgents.find(a => a.id === selectedAgentId) || aiAgents[0];

  // Eligibility evaluation
  const consentStatus: ConsentStatus = activeContact?.consentStatus || 'Consent Unknown';
  const dncStatus: DncStatus = activeContact?.dncStatus || 'Not Listed';
  const isConsentGranted = consentStatus === 'Consent Granted';
  const isDncClear = dncStatus === 'Not Listed';
  const isEligibleToCall = isConsentGranted && isDncClear;

  const contactName = activeContact?.name || initialTargetName || 'Contact';
  const contactPhone = activeContact?.phone || initialTargetPhone || '+91 98000 00000';
  const contactType = activeContact && 'vehicleType' in activeContact ? 'Driver' : 'Passenger';
  const lastContacted = activeContact?.lastContactedAt || 'Never';
  const callAttempts = activeContact ? ('aiCallAttempts' in activeContact ? activeContact.aiCallAttempts : activeContact.callAttempts) : 0;
  const nextEligible = activeContact?.nextEligibleContactDate || 'Eligible Now';

  // Step 8 & 9: Operator explicitly confirms the call
  const handleConfirmAndDispatch = () => {
    if (!isEligibleToCall) {
      alert('Outbound calling is blocked due to missing consent or DNC status.');
      return;
    }
    if (!operatorConfirmed) {
      alert('Please check the operator verification box to confirm explicit employee action.');
      return;
    }

    setWorkflowState('calling');
    playTelephonyTone('ring');
    setLogs([
      { sender: 'System Audit', text: `Manual dispatch authorized by ${currentUser.name} (${currentUser.role}). Target: ${contactName} (${contactPhone}).`, time: '00:01' },
      { sender: 'Simulated Gateway', text: `Initiating carrier dial handshake (Mock SIP Trunk to ${contactPhone})...`, time: '00:02' }
    ]);

    // Simulated connection delay
    setTimeout(() => {
      setWorkflowState('connected');
      const greeting = currentAgent?.greetingPrompts[selectedLanguage] || currentAgent?.greetingPrompts.English;
      speakText(greeting, selectedLanguage);
      setLogs(prev => [
        ...prev,
        { sender: 'Telephony Simulator', text: 'Call Answered (Simulated 200 OK). Speech session initialized.', time: '00:04' },
        { sender: currentAgent.name, text: greeting, time: '00:05' }
      ]);
    }, 2500);

    // Customer simulated response
    setTimeout(() => {
      const responses: Record<LanguageCode, string> = {
        Tamil: 'வணக்கம்! நான் எக்ஸ்பூல் ஓட்டுநர் திட்டத்தில் இணைய ஆர்வம் காட்டுகிறேன். தேவையான ஆவணங்கள் என்ன?',
        Telugu: 'హలో అండి, ఎక్స్‌పూల్ పార్టనర్ ఆన్‌బోర్డింగ్ వివరాలు చెప్పండి. ఏయే డాక్యుమెంట్లు కావాలి?',
        English: 'Hello Maya, yes I am interested in joining as a mobility partner. What documents do I need to prepare?'
      };
      speakText(responses[selectedLanguage], selectedLanguage);
      setLogs(prev => [
        ...prev,
        { sender: contactName, text: responses[selectedLanguage], time: '00:14' }
      ]);
    }, 5500);

    // Final AI confirmation response
    setTimeout(() => {
      const confirmations: Record<LanguageCode, string> = {
        Tamil: 'மிக்க நன்றி! உங்கள் ஆதார் மற்றும் ஓட்டுநர் உரிம நகலை எங்கள் வாட்ஸ்அப் எண்ணிற்கு பதிவேற்றுங்கள். எங்கள் குழு சரிபார்க்கும்.',
        Telugu: 'ధన్యవాదాలు! మీ ఆధార్ మరియు డ్రైవింగ్ లైసెన్స్ ఫోటోలను మా వాట్సాప్ లింక్‌లో అప్‌లోడ్ చేయండి.',
        English: 'Thank you! Please submit your driving license and vehicle registration copies via our verified link.'
      };
      speakText(confirmations[selectedLanguage], selectedLanguage);
      setLogs(prev => [
        ...prev,
        { sender: currentAgent.name, text: confirmations[selectedLanguage], time: '00:26' },
        { sender: 'Compliance Engine', text: 'Call transcript recorded under DEMO AUDIT LOGS. No real call charges incurred.', time: '00:32' }
      ]);
      setWorkflowState('completed');

      // Create simulated CallRecord in state
      triggerSimulationCall(contactName, contactPhone, selectedLanguage, currentAgent.id);
    }, 9000);
  };

  const handleEndCall = () => {
    stopSpeech();
    setWorkflowState('completed');
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        stopSpeech();
        onClose();
      }}
      title="Manual AI Voice Call Dispatch (Mandatory 9-Step Sequence)"
      subtitle="Demo Simulation • Outbound calling strictly requires verified consent & employee confirmation"
      maxWidth="2xl"
    >
      <div className="space-y-5 text-xs">
        {/* Persistent Demo Notice */}
        <div className="bg-amber-500/10 border border-amber-300/80 rounded-xl p-3 flex items-start gap-2.5">
          <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
          <div className="text-slate-700">
            <strong className="text-amber-950 block">DEMO ENVIRONMENT — NO REAL CUSTOMER CALLS</strong>
            <span className="text-[11px] text-slate-600">
              Outbound calls cannot be automated. An operator must review contact details, verify consent, and confirm the dispatch.
            </span>
          </div>
        </div>

        {/* WORKFLOW VIEW: Steps 1-8 */}
        {workflowState === 'verification' && (
          <div className="space-y-4">
            {/* Step 1: Contact Selection (if not locked to existing) */}
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 flex items-center gap-1.5 uppercase text-[11px] tracking-wider">
                  <span className="w-5 h-5 rounded-full bg-slate-800 text-white flex items-center justify-center text-[10px]">1</span>
                  Select Contact Category & Record
                </span>
                <span className="text-[10px] text-slate-400 font-mono">Step 1 of 8</span>
              </div>

              {!initialTargetContact && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Target Type</label>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setContactCategory('Driver')}
                        className={`flex-1 py-1.5 px-3 rounded-lg font-semibold border transition ${
                          contactCategory === 'Driver' 
                            ? 'bg-amber-500 text-slate-950 border-amber-500 shadow-sm' 
                            : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        Driver Partner
                      </button>
                      <button
                        type="button"
                        onClick={() => setContactCategory('Passenger')}
                        className={`flex-1 py-1.5 px-3 rounded-lg font-semibold border transition ${
                          contactCategory === 'Passenger' 
                            ? 'bg-amber-500 text-slate-950 border-amber-500 shadow-sm' 
                            : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        Passenger
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Select Contact</label>
                    <select
                      value={selectedContactId}
                      onChange={(e) => setSelectedContactId(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-amber-500"
                    >
                      {contactCategory === 'Driver' ? (
                        drivers.map(d => (
                          <option key={d.id} value={d.id}>
                            {d.name} • {d.phone} ({d.consentStatus})
                          </option>
                        ))
                      ) : (
                        passengers.map(p => (
                          <option key={p.id} value={p.id}>
                            {p.name} • {p.phone} ({p.consentStatus})
                          </option>
                        ))
                      )}
                    </select>
                  </div>
                </div>
              )}
            </div>

            {/* Step 2: Contact Details */}
            <div className="p-3.5 bg-white border border-slate-200 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 flex items-center gap-1.5 uppercase text-[11px] tracking-wider">
                  <span className="w-5 h-5 rounded-full bg-slate-800 text-white flex items-center justify-center text-[10px]">2</span>
                  Target Contact Details
                </span>
                <span className="text-[10px] text-slate-400 font-mono">Step 2 of 8</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs pt-1">
                <div className="bg-slate-50 p-2 rounded-lg">
                  <span className="text-[10px] text-slate-400 block">Name</span>
                  <strong className="text-slate-900 truncate block">{contactName}</strong>
                </div>
                <div className="bg-slate-50 p-2 rounded-lg">
                  <span className="text-[10px] text-slate-400 block">Phone</span>
                  <strong className="text-slate-900 font-mono">{contactPhone}</strong>
                </div>
                <div className="bg-slate-50 p-2 rounded-lg">
                  <span className="text-[10px] text-slate-400 block">Category</span>
                  <span className="font-semibold text-slate-800">{contactType}</span>
                </div>
                <div className="bg-slate-50 p-2 rounded-lg">
                  <span className="text-[10px] text-slate-400 block">Preferred Dialect</span>
                  <span className="font-semibold text-amber-800">{activeContact?.preferredLanguage || selectedLanguage}</span>
                </div>
              </div>
            </div>

            {/* Steps 3, 4, 5: Consent, DNC & Frequency Eligibility Strip */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Step 3: Consent Status */}
              <div className={`p-3 rounded-xl border ${
                consentStatus === 'Consent Granted' 
                  ? 'bg-emerald-50/70 border-emerald-200' 
                  : consentStatus === 'Consent Revoked'
                  ? 'bg-rose-50 border-rose-200'
                  : 'bg-amber-50 border-amber-200'
              }`}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-bold uppercase text-slate-500">Step 3: Consent Check</span>
                  {isConsentGranted ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <XCircle className="w-4 h-4 text-rose-600" />
                  )}
                </div>
                <div className="font-bold text-slate-900 text-xs">{consentStatus}</div>
                <span className="text-[10px] text-slate-600 mt-0.5 block">
                  {isConsentGranted 
                    ? 'Verified opt-in on file' 
                    : 'Outbound calling strictly disabled'}
                </span>
              </div>

              {/* Step 4: DNC Status */}
              <div className={`p-3 rounded-xl border ${
                isDncClear ? 'bg-emerald-50/70 border-emerald-200' : 'bg-rose-50 border-rose-200'
              }`}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-bold uppercase text-slate-500">Step 4: DNC Suppression</span>
                  {isDncClear ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <ShieldAlert className="w-4 h-4 text-rose-600" />
                  )}
                </div>
                <div className="font-bold text-slate-900 text-xs">{dncStatus}</div>
                <span className="text-[10px] text-slate-600 mt-0.5 block">
                  {isDncClear ? 'No suppression active' : 'Suppression / Opt-out active'}
                </span>
              </div>

              {/* Step 5: Frequency & Eligibility */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-bold uppercase text-slate-500">Step 5: Eligibility</span>
                  <Clock className="w-4 h-4 text-slate-500" />
                </div>
                <div className="font-bold text-slate-900 text-xs">Attempts: {callAttempts}</div>
                <span className="text-[10px] text-slate-600 mt-0.5 block truncate" title={nextEligible}>
                  Next: {nextEligible}
                </span>
              </div>
            </div>

            {/* BLOCKER WARNING IF CONSENT REVOKED OR UNKNOWN */}
            {!isEligibleToCall && (
              <div className="p-3.5 bg-rose-50 border border-rose-300 rounded-xl flex items-start gap-3">
                <XCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                <div className="text-xs text-rose-900 space-y-1">
                  <strong className="block font-bold">Manual AI Call Dispatch Blocked</strong>
                  <p>
                    {consentStatus === 'Consent Revoked' && 'This contact has explicitly revoked calling consent. Outbound telephonic dialing is legally suppressed.'}
                    {consentStatus === 'Consent Unknown' && 'Consent status is Unknown. In accordance with telecommunications compliance, AI calls cannot be placed without prior recorded consent.'}
                    {!isDncClear && ' This number is registered on the National Do Not Call (DNC) list.'}
                  </p>
                  <p className="text-[10px] text-rose-700 italic">
                    To enable dialing, verified consent must be recorded through inbound web signup or partner document submission.
                  </p>
                </div>
              </div>
            )}

            {/* Step 6: Agent Persona & Modular Language Selection */}
            {isEligibleToCall && (
              <div className="p-3.5 bg-white border border-slate-200 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 flex items-center gap-1.5 uppercase text-[11px] tracking-wider">
                    <span className="w-5 h-5 rounded-full bg-slate-800 text-white flex items-center justify-center text-[10px]">6</span>
                    Select AI Agent Persona & Language Dialect
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">Step 6 of 8</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">AI Agent</label>
                    <select
                      value={selectedAgentId}
                      onChange={(e) => setSelectedAgentId(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs"
                    >
                      {aiAgents.map(a => (
                        <option key={a.id} value={a.id}>
                          {a.name} ({a.voiceGender})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Dialect (Modular Config)</label>
                    <select
                      value={selectedLanguage}
                      onChange={(e) => setSelectedLanguage(e.target.value as LanguageCode)}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-semibold"
                    >
                      {SUPPORTED_LANGUAGES.map(lang => (
                        <option key={lang.code} value={lang.code}>
                          {lang.label} ({lang.nativeLabel}) — {lang.region}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Opening Speech Prompt Hook Preview */}
                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200/80 text-[11px] space-y-1">
                  <span className="font-bold text-slate-700 block text-[10px] uppercase">
                    Opening Verified Script ({selectedLanguage}):
                  </span>
                  <p className="text-slate-600 italic">
                    "{currentAgent.greetingPrompts[selectedLanguage] || currentAgent.greetingPrompts.English}"
                  </p>
                </div>
              </div>
            )}

            {/* Steps 7 & 8: Employee Explicit Confirmation */}
            {isEligibleToCall && (
              <div className="p-3.5 bg-amber-50/70 border border-amber-300/80 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-amber-950 flex items-center gap-1.5 uppercase text-[11px] tracking-wider">
                    <span className="w-5 h-5 rounded-full bg-amber-600 text-white flex items-center justify-center text-[10px]">7</span>
                    Employee Explicit Confirmation Dialog
                  </span>
                  <span className="text-[10px] text-amber-800 font-mono">Step 7 & 8 of 8</span>
                </div>

                <div className="text-xs text-slate-700 bg-white p-3 rounded-lg border border-amber-200/80 space-y-2">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-500">Dispatching Employee:</span>
                    <strong className="text-slate-900">{currentUser.name} ({currentUser.role})</strong>
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-500">Destination Number:</span>
                    <strong className="text-slate-900 font-mono">{contactPhone}</strong>
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-500">Carrier Trunk:</span>
                    <span className="text-slate-700 font-semibold">Simulated Local Telephony Engine (Demo Mode)</span>
                  </div>

                  <label className="flex items-start gap-2 pt-2 border-t border-slate-100 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={operatorConfirmed}
                      onChange={(e) => setOperatorConfirmed(e.target.checked)}
                      className="mt-0.5 rounded text-amber-600 focus:ring-amber-500"
                    />
                    <span className="text-[11px] text-slate-800 font-medium leading-tight">
                      I, <strong>{currentUser.name}</strong>, explicitly confirm that I have verified the contact's consent and authorize this manual AI test call simulation.
                    </span>
                  </label>
                </div>
              </div>
            )}

            {/* Footer Actions */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              <span className="text-[10px] text-slate-400">
                Backend security note: Real backend repeats consent & DNC checks prior to carrier dialing.
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 border border-slate-300 rounded-xl text-slate-700 font-semibold hover:bg-slate-50"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleConfirmAndDispatch}
                  disabled={!isEligibleToCall || !operatorConfirmed}
                  className="px-5 py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 disabled:opacity-40 disabled:cursor-not-allowed text-slate-950 font-bold rounded-xl shadow-brand flex items-center gap-2 transition"
                >
                  <PhoneCall className="w-4 h-4" />
                  <span>Confirm & Dispatch Simulated Call</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* WORKFLOW VIEW: Step 9 (Call in Progress / Simulation Execution) */}
        {(workflowState === 'calling' || workflowState === 'connected' || workflowState === 'completed') && (
          <div className="space-y-4">
            <div className="bg-slate-900 text-white rounded-2xl p-5 space-y-4 shadow-xl border border-slate-800">
              {/* Header inside call */}
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                    workflowState === 'connected' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
                  }`}>
                    <Bot className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-sm">{contactName}</h4>
                    <span className="text-[11px] text-slate-400 font-mono">
                      {contactPhone} • {currentAgent.name} ({selectedLanguage})
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <div className="flex items-center gap-1.5 justify-end">
                    <span className={`w-2 h-2 rounded-full ${
                      workflowState === 'connected' ? 'bg-emerald-400 animate-pulse' : 
                      workflowState === 'calling' ? 'bg-amber-400 animate-ping' : 'bg-slate-500'
                    }`} />
                    <span className="font-mono text-xs font-bold text-amber-400">
                      {Math.floor(callDuration / 60).toString().padStart(2, '0')}:{(callDuration % 60).toString().padStart(2, '0')}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 block mt-0.5">
                    {workflowState === 'calling' && 'Ringing Line...'}
                    {workflowState === 'connected' && 'Speech Stream Active'}
                    {workflowState === 'completed' && 'Call Completed'}
                  </span>
                </div>
              </div>

              {/* Dynamic Waveform Visualizer */}
              <div className="flex items-center justify-center gap-1 h-12 bg-slate-850 rounded-xl px-4">
                {Array.from({ length: 32 }).map((_, i) => (
                  <div
                    key={i}
                    className={`w-1 rounded-full transition-all duration-300 ${
                      workflowState === 'connected' ? 'bg-amber-400' : 'bg-slate-700'
                    }`}
                    style={{
                      height: workflowState === 'connected' ? `${Math.max(15, (i % 6) * 16 + 12)}%` : '15%'
                    }}
                  />
                ))}
              </div>

              {/* Live Transcript / Audit Feed */}
              <div className="bg-slate-950 rounded-xl p-3 max-h-48 overflow-y-auto space-y-2 border border-slate-800/80 font-mono text-[11px]">
                {logs.map((log, idx) => (
                  <div key={idx} className="flex gap-2 text-slate-300">
                    <span className="text-slate-500 shrink-0">[{log.time}]</span>
                    <strong className="text-amber-400 shrink-0">{log.sender}:</strong>
                    <span className="text-slate-300">{log.text}</span>
                  </div>
                ))}
              </div>

              {/* Call Controls */}
              <div className="flex items-center justify-between pt-1">
                <span className="text-[10px] text-slate-400">
                  Step 9: Simulated Call Session (Audio rendered via browser Web Speech & Tone synthesizer)
                </span>

                {workflowState !== 'completed' ? (
                  <button
                    onClick={handleEndCall}
                    className="px-4 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl flex items-center gap-1.5 text-xs transition"
                  >
                    <PhoneOff className="w-3.5 h-3.5" />
                    <span>End Simulated Call</span>
                  </button>
                ) : (
                  <button
                    onClick={onClose}
                    className="px-5 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl text-xs transition"
                  >
                    <span>Close Session</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};

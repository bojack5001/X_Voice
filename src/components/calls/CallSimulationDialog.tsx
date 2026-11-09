import React, { useState, useEffect } from 'react';
import { 
  PhoneCall, 
  PhoneOff, 
  Bot, 
  Globe, 
  Sparkles, 
  CheckCircle, 
  MessageSquare,
  ShieldAlert,
  Volume2
} from 'lucide-react';
import { Modal } from '../common/Modal';
import { useData } from '../../context/DataContext';
import { LanguageCode } from '../../types';
import { playTelephonyTone, speakText, stopSpeech } from '../../utils/audioSynthesizer';

interface CallSimulationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  targetName: string;
  targetPhone: string;
  defaultLanguage?: LanguageCode;
}

export const CallSimulationDialog: React.FC<CallSimulationDialogProps> = ({
  isOpen,
  onClose,
  targetName,
  targetPhone,
  defaultLanguage = 'Tamil'
}) => {
  const { aiAgents, triggerSimulationCall } = useData();

  const [selectedAgentId, setSelectedAgentId] = useState(aiAgents[0]?.id || 'AGENT-01');
  const [selectedLanguage, setSelectedLanguage] = useState<LanguageCode>(defaultLanguage);
  
  // Call simulation states: 'idle' | 'calling' | 'connected' | 'completed'
  const [callState, setCallState] = useState<'idle' | 'calling' | 'connected' | 'completed'>('idle');
  const [callDuration, setCallDuration] = useState(0);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [logs, setLogs] = useState<Array<{ sender: string; text: string; time: string }>>([]);

  const currentAgent = aiAgents.find(a => a.id === selectedAgentId) || aiAgents[0];

  useEffect(() => {
    if (isOpen) {
      setCallState('idle');
      setCallDuration(0);
      setCurrentStepIndex(0);
      setLogs([]);
      setSelectedLanguage(defaultLanguage);
    }
  }, [isOpen, defaultLanguage]);

  useEffect(() => {
    let interval: any;
    if (callState === 'connected') {
      interval = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [callState]);

  const handleStartCall = () => {
    setCallState('calling');
    playTelephonyTone('ring');
    setLogs([
      { sender: 'System', text: `Initiating carrier handshake via SIP Trunk to ${targetPhone}...`, time: '00:01' }
    ]);

    // Simulated carrier delay
    setTimeout(() => {
      setCallState('connected');
      const greeting = currentAgent?.greetingPrompts[selectedLanguage] || currentAgent?.greetingPrompts.English;
      speakText(greeting, selectedLanguage);
      setLogs(prev => [
        ...prev,
        { sender: 'Telephony Gateway', text: 'Call Answered (200 OK). Latency: 42ms. Voice Stream Initialized.', time: '00:03' },
        { sender: currentAgent.name, text: greeting, time: '00:05' }
      ]);
      setCurrentStepIndex(1);
    }, 2500);

    // Step 2: Target responds
    setTimeout(() => {
      const responses: Record<LanguageCode, string> = {
        Tamil: 'வணக்கம் மேடம்! ஆமாம் நான் புதிய கார் ஓட்டுநர். எக்ஸ்பூல் கமிஷன் விகிதம் மற்றும் வாராந்திர கட்டணம் பற்றி தெரிந்து கொள்ள விரும்புகிறேன்.',
        Telugu: 'హలో అండి, నేను హైదరాబాద్‌లో ఆటో నడుపుతున్నాను. మీ 0% కమిషన్ స్కీమ్ వివరాలు చెప్పండి.',
        English: 'Hello Maya! Yes, I am interested in joining as a commercial sedan driver. What are the vehicle eligibility requirements?',
        Hindi: 'नमस्ते! हाँ मैं अपनी स्विफ्ट डिजायर कार एक्स-पूल में लगाना चाहता हूँ। क्या मुझे डाक्यूमेंट्स भेजने होंगे?'
      };
      speakText(responses[selectedLanguage], selectedLanguage);
      setLogs(prev => [
        ...prev,
        { sender: targetName, text: responses[selectedLanguage], time: '00:15' }
      ]);
      setCurrentStepIndex(2);
    }, 6000);

    // Step 3: AI guides and sends WhatsApp upload link
    setTimeout(() => {
      const guidance: Record<LanguageCode, string> = {
        Tamil: 'மிக்க மகிழ்ச்சி! எக்ஸ்பூலில் முதல் 30 நாட்கள் 0% கமிஷன்! உங்கள் ஆதார் மற்றும் ஆர்சி புத்தகத்தை எங்கள் அதிகாரப்பூர்வ வாட்ஸ்அப் லிங்க்கில் பதிவேற்றவும். இப்போது லிங்க் அனுப்பப்பட்டுள்ளது.',
        Telugu: 'చాలా మంచిది! మొదటి నెల పూర్తి సంపాదన మీదే. మీ ఆర్సీ మరియు లైసెన్స్ ఫోటోలను మేము పంపిన వాట్సాప్ లింక్‌లో అప్‌లోడ్ చేయండి.',
        English: 'Wonderful! In the introductory month, you retain 100% of all ride fares. A secure WhatsApp document verification link has just been sent to your phone.',
        Hindi: 'बहुत बढ़िया! पहले महीने कोई कमीशन नहीं कटेगा। आपके फोन पर अभी एक व्हाट्सएप लिंक भेजा गया है, कृपया उसपर आरसी और लाइसेंस अपलोड करें।'
      };
      speakText(guidance[selectedLanguage], selectedLanguage);
      setLogs(prev => [
        ...prev,
        { sender: currentAgent.name, text: guidance[selectedLanguage], time: '00:30' }
      ]);
      setCurrentStepIndex(3);
    }, 10000);
  };

  const handleEndCall = () => {
    stopSpeech();
    setCallState('completed');
    // Save call to local DataContext
    triggerSimulationCall(targetName, targetPhone, selectedLanguage, selectedAgentId);
  };

  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        stopSpeech();
        onClose();
      }}
      title="AI Voice Call Dispatcher"
      subtitle="Interactive Voice Simulation Engine with multi-language natural dialogue"
      maxWidth="2xl"
    >
      <div className="space-y-5">
        {/* Call Meta Strip */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Target Contact</span>
            <div className="text-base font-bold text-slate-900">{targetName}</div>
            <div className="text-xs text-slate-500 font-mono">{targetPhone}</div>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 bg-amber-100 text-amber-800 rounded-lg text-xs font-semibold flex items-center gap-1.5 border border-amber-200">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              Demo Simulation Mode
            </span>
          </div>
        </div>

        {/* Configuration when Idle */}
        {callState === 'idle' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
                  <Bot className="w-4 h-4 text-amber-500" />
                  Select AI Agent Persona
                </label>
                <select
                  value={selectedAgentId}
                  onChange={(e) => setSelectedAgentId(e.target.value)}
                  className="w-full text-xs rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  {aiAgents.map(agent => (
                    <option key={agent.id} value={agent.id}>
                      {agent.name} ({agent.voiceGender})
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-slate-500 mt-1">{currentAgent.purpose}</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
                  <Globe className="w-4 h-4 text-amber-500" />
                  Conversation Language
                </label>
                <select
                  value={selectedLanguage}
                  onChange={(e) => setSelectedLanguage(e.target.value as LanguageCode)}
                  className="w-full text-xs rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  <option value="Tamil">Tamil (தமிழ்) - Chennai / Madurai dialect</option>
                  <option value="Telugu">Telugu (తెలుగు) - Hyderabad / AP dialect</option>
                  <option value="English">English (Indian Accent - Neutral)</option>
                  <option value="Hindi">Hindi (हिंदी - Standard Urban)</option>
                </select>
                <p className="text-[11px] text-slate-500 mt-1">Automatic fallback to English if threshold exceeded.</p>
              </div>
            </div>

            {/* Script preview */}
            <div className="bg-amber-50/60 border border-amber-200/80 rounded-xl p-3.5">
              <span className="text-[11px] font-semibold text-amber-900 uppercase tracking-wide block mb-1">
                Selected Language Initial Greeting
              </span>
              <p className="text-xs text-amber-950 font-medium leading-relaxed italic">
                "{currentAgent.greetingPrompts[selectedLanguage] || currentAgent.greetingPrompts.English}"
              </p>
            </div>

            {/* Start Button */}
            <div className="pt-2 flex justify-end">
              <button
                onClick={handleStartCall}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 font-bold text-sm flex items-center justify-center gap-2 shadow-brand transition active:scale-95"
              >
                <PhoneCall className="w-4 h-4" />
                <span>Initiate AI Telephony Call</span>
              </button>
            </div>
          </div>
        )}

        {/* In-Call Active Display */}
        {(callState === 'calling' || callState === 'connected') && (
          <div className="bg-slate-900 text-white rounded-xl p-5 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-3">
                <div className={`w-3.5 h-3.5 rounded-full ${callState === 'calling' ? 'bg-amber-400 animate-ping' : 'bg-emerald-400 animate-pulse'}`} />
                <div>
                  <div className="text-xs text-slate-400">
                    {callState === 'calling' ? 'Establishing SIP Trunk Connection...' : 'AI Voice Session Active'}
                  </div>
                  <div className="text-sm font-semibold text-white">
                    {currentAgent.name} • {selectedLanguage}
                  </div>
                </div>
              </div>

              <div className="text-right">
                <span className="text-xs text-slate-400 block">Duration</span>
                <span className="font-mono text-base font-bold text-amber-400">
                  {formatTimer(callDuration)}
                </span>
              </div>
            </div>

            {/* Simulated Audio Waves */}
            <div className="flex items-center justify-center gap-1.5 h-12 bg-slate-850 rounded-lg p-2">
              <Volume2 className="w-4 h-4 text-amber-400 mr-2" />
              {Array.from({ length: 24 }).map((_, i) => (
                <div
                  key={i}
                  className="w-1.5 bg-amber-400 rounded-full wave-bar"
                  style={{
                    height: `${Math.max(15, (i % 6) * 16 + 10)}%`,
                    animationDuration: `${0.8 + (i % 4) * 0.3}s`
                  }}
                />
              ))}
            </div>

            {/* Realtime Live Conversation Logs */}
            <div className="space-y-2.5 max-h-56 overflow-y-auto pr-2 text-xs">
              {logs.map((log, idx) => (
                <div 
                  key={idx}
                  className={`p-2.5 rounded-lg border ${
                    log.sender === targetName 
                      ? 'bg-slate-800 border-slate-700 text-slate-200 ml-6'
                      : log.sender === 'System' || log.sender === 'Telephony Gateway'
                      ? 'bg-slate-950/60 border-slate-800 text-amber-300 font-mono text-[11px]'
                      : 'bg-amber-950/40 border-amber-800/60 text-amber-100 mr-6'
                  }`}
                >
                  <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                    <span className="font-bold uppercase tracking-wider">{log.sender}</span>
                    <span className="font-mono">{log.time}</span>
                  </div>
                  <p className="leading-relaxed">{log.text}</p>
                </div>
              ))}
            </div>

            {/* Hangup button */}
            <div className="pt-2 flex items-center justify-between border-t border-slate-800">
              <span className="text-xs text-slate-400">Simulated speech recognition with live entity extraction</span>
              <button
                onClick={handleEndCall}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold flex items-center gap-2 transition"
              >
                <PhoneOff className="w-4 h-4" />
                <span>Wrap Up & End Call</span>
              </button>
            </div>
          </div>
        )}

        {/* Completed state */}
        {callState === 'completed' && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5 text-center space-y-3">
            <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold text-slate-900">AI Call Successfully Completed & Logged</h4>
            <p className="text-xs text-slate-600 max-w-md mx-auto">
              The conversation has been transcribed, sentiment analyzed, and appended to the <strong>Call History</strong> audit log. Target lead status has been updated in the local database.
            </p>
            <div className="pt-2 flex justify-center gap-3">
              <button
                onClick={onClose}
                className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg transition"
              >
                Back to Dashboard
              </button>
              <button
                onClick={() => setCallState('idle')}
                className="px-4 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg transition"
              >
                Make Another Call
              </button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};


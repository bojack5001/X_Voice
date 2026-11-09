import React, { useState } from 'react';
import { 
  Cpu, 
  Bot, 
  Globe, 
  Volume2, 
  Sliders, 
  Save, 
  Play, 
  Sparkles, 
  CheckCircle2, 
  Info,
  RotateCcw
} from 'lucide-react';
import { useData } from '../context/DataContext';
import { AIAgentConfig, LanguageCode } from '../types';
import { DemoBadge } from '../components/common/DemoBadge';
import { Modal } from '../components/common/Modal';
import { speakText, stopSpeech, playTelephonyTone } from '../utils/audioSynthesizer';

export const AIAgentSettings: React.FC = () => {
  const { aiAgents, updateAgentConfig } = useData();

  const [selectedAgentId, setSelectedAgentId] = useState<string>(aiAgents[0]?.id || 'AGENT-01');
  const [activeLangTab, setActiveLangTab] = useState<LanguageCode>('Tamil');
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Audio testing simulator modal
  const [testVoiceModalOpen, setTestVoiceModalOpen] = useState(false);
  const [isPlayingTestAudio, setIsPlayingTestAudio] = useState(false);

  const activeAgent = aiAgents.find(a => a.id === selectedAgentId) || aiAgents[0];

  // Local form state
  const [greetingText, setGreetingText] = useState(activeAgent.greetingPrompts[activeLangTab] || '');
  const [systemInstructionsText, setSystemInstructionsText] = useState(activeAgent.systemInstructions[activeLangTab] || '');
  const [speakingRate, setSpeakingRate] = useState(activeAgent.speakingRate);
  const [voiceGender, setVoiceGender] = useState(activeAgent.voiceGender);
  const [fallbackSensitivity, setFallbackSensitivity] = useState(activeAgent.fallbackSensitivity);

  // When changing agent or language tab, refresh local fields
  React.useEffect(() => {
    if (activeAgent) {
      setGreetingText(activeAgent.greetingPrompts[activeLangTab] || '');
      setSystemInstructionsText(activeAgent.systemInstructions[activeLangTab] || '');
      setSpeakingRate(activeAgent.speakingRate);
      setVoiceGender(activeAgent.voiceGender);
      setFallbackSensitivity(activeAgent.fallbackSensitivity);
    }
  }, [selectedAgentId, activeLangTab]);

  const handleSaveConfig = () => {
    updateAgentConfig(activeAgent.id, {
      speakingRate,
      voiceGender,
      fallbackSensitivity,
      greetingPrompts: {
        ...activeAgent.greetingPrompts,
        [activeLangTab]: greetingText
      },
      systemInstructions: {
        ...activeAgent.systemInstructions,
        [activeLangTab]: systemInstructionsText
      }
    });

    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  const handleTriggerVoiceTest = () => {
    setTestVoiceModalOpen(true);
    setIsPlayingTestAudio(true);
    speakText(greetingText, activeLangTab, speakingRate, () => {
      setIsPlayingTestAudio(false);
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight font-poppins">
              AI Voice Agent Configuration
            </h1>
            <DemoBadge label="TAMIL • TELUGU • ENGLISH RECOGNITION" />
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure conversational system prompts, synthetic voice characteristics, and regional fallback policies
          </p>
        </div>

        <button
          onClick={handleSaveConfig}
          className="px-5 py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 text-xs font-bold rounded-xl shadow-brand flex items-center gap-2 transition active:scale-95"
        >
          {saveSuccess ? <CheckCircle2 className="w-4 h-4 text-slate-950" /> : <Save className="w-4 h-4" />}
          <span>{saveSuccess ? 'Changes Saved Locally' : 'Save Voice Profile'}</span>
        </button>
      </div>

      {/* Integration Notice Strip */}
      <div className="bg-amber-50 border border-amber-200/90 rounded-2xl p-4 flex items-center gap-3 text-xs text-amber-950">
        <Info className="w-5 h-5 text-amber-600 flex-shrink-0" />
        <p>
          <strong>Notice:</strong> This interface stores voice prompts and hyperparameters in local frontend state. When ready for production backend integration, these schema hooks directly map to the OpenAI Realtime API session configurations and n8n webhooks.
        </p>
      </div>

      {/* Agent Selector Tabs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {aiAgents.map(agent => (
          <button
            key={agent.id}
            onClick={() => setSelectedAgentId(agent.id)}
            className={`p-4 rounded-2xl border text-left transition flex items-start justify-between ${
              selectedAgentId === agent.id
                ? 'bg-white border-amber-400 ring-2 ring-amber-500/20 shadow-card'
                : 'bg-slate-50/70 border-slate-200 hover:bg-white'
            }`}
          >
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                {agent.targetAudience} Focused
              </span>
              <div className="font-bold text-slate-900 text-sm">{agent.name}</div>
              <p className="text-[11px] text-slate-500 line-clamp-2">{agent.purpose}</p>
            </div>
            <Bot className={`w-5 h-5 flex-shrink-0 ${selectedAgentId === agent.id ? 'text-amber-500' : 'text-slate-400'}`} />
          </button>
        ))}
      </div>

      {/* Main Config Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Prompts & Dialect Tabs */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/90 p-6 shadow-card space-y-5">
          {/* Dialect Tabs */}
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Regional Dialect Prompts
            </span>

            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs">
              {(['Tamil', 'Telugu', 'English', 'Hindi'] as LanguageCode[]).map(lang => (
                <button
                  key={lang}
                  onClick={() => setActiveLangTab(lang)}
                  className={`px-3 py-1 rounded-lg font-semibold transition ${
                    activeLangTab === lang
                      ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {lang}
                </button>
              ))}
            </div>
          </div>

          {/* Initial Greeting Textarea */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-800">
              Initial Greeting Message ({activeLangTab})
            </label>
            <textarea
              rows={3}
              value={greetingText}
              onChange={(e) => setGreetingText(e.target.value)}
              className="w-full p-3.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none text-xs leading-relaxed font-medium"
              placeholder="First voice prompt spoken when line is answered..."
            />
            <p className="text-[11px] text-slate-400">
              Spoken immediately upon SIP channel connection (max latency: 120ms).
            </p>
          </div>

          {/* System Instructions & Guardrails */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-800">
              System Instruction Persona & Context Guardrails ({activeLangTab})
            </label>
            <textarea
              rows={5}
              value={systemInstructionsText}
              onChange={(e) => setSystemInstructionsText(e.target.value)}
              className="w-full p-3.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none text-xs leading-relaxed font-mono"
              placeholder="System prompt context, objections handling, and transfer rules..."
            />
            <p className="text-[11px] text-slate-400">
              Defines dialect nuance, politeness markers, vehicle terms, and automated human handoff triggers.
            </p>
          </div>

          {/* Test Audio Button */}
          <div className="pt-2 flex justify-between items-center border-t border-slate-100">
            <span className="text-xs text-slate-500">Live preview synthetic TTS generation</span>
            <button
              onClick={handleTriggerVoiceTest}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl flex items-center gap-2 shadow-sm transition active:scale-95"
            >
              <Volume2 className="w-4 h-4 text-amber-400" />
              <span>Simulate Voice Greeting</span>
            </button>
          </div>
        </div>

        {/* Right Column: Synthetic Voice Parameters */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-card space-y-5 text-xs">
          <h3 className="font-bold text-slate-900 border-b border-slate-100 pb-2 text-sm flex items-center gap-2">
            <Sliders className="w-4 h-4 text-amber-500" />
            Voice Model Hyperparameters
          </h3>

          {/* Voice Gender */}
          <div className="space-y-1.5">
            <label className="font-semibold text-slate-700 block">Synthetic Voice Gender</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setVoiceGender('Female')}
                className={`py-2 rounded-xl font-bold border transition ${
                  voiceGender === 'Female'
                    ? 'bg-amber-50 border-amber-300 text-amber-900'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                Female (Warm & Clear)
              </button>
              <button
                type="button"
                onClick={() => setVoiceGender('Male')}
                className={`py-2 rounded-xl font-bold border transition ${
                  voiceGender === 'Male'
                    ? 'bg-amber-50 border-amber-300 text-amber-900'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                Male (Authoritative)
              </button>
            </div>
          </div>

          {/* Speaking Rate */}
          <div className="space-y-1.5">
            <div className="flex justify-between font-semibold text-slate-700">
              <span>Speaking Speed Rate</span>
              <span className="font-mono text-amber-700">{speakingRate}x</span>
            </div>
            <input
              type="range"
              min="0.8"
              max="1.3"
              step="0.05"
              value={speakingRate}
              onChange={(e) => setSpeakingRate(parseFloat(e.target.value))}
              className="w-full accent-amber-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>0.8x (Patient)</span>
              <span>1.0x (Standard)</span>
              <span>1.3x (Fast)</span>
            </div>
          </div>

          {/* Fallback Sensitivity */}
          <div className="space-y-1.5">
            <div className="flex justify-between font-semibold text-slate-700">
              <span>Silence Fallback Threshold</span>
              <span className="font-mono text-amber-700">{fallbackSensitivity}s</span>
            </div>
            <input
              type="range"
              min="2"
              max="10"
              step="1"
              value={fallbackSensitivity}
              onChange={(e) => setFallbackSensitivity(parseInt(e.target.value))}
              className="w-full accent-amber-500 cursor-pointer"
            />
            <p className="text-[10px] text-slate-400">
              Time of uninterrupted customer silence before triggering gentle reprompt.
            </p>
          </div>

          {/* Human Escalation Trigger */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
            <span className="font-bold text-slate-800 block text-[11px]">Auto-Escalation Safeguard</span>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              If negative sentiment is detected for &gt; 2 turns, call is immediately bridged to the on-duty Team Leader extension.
            </p>
          </div>
        </div>
      </div>

      {/* Voice Greeting Test Modal */}
      {testVoiceModalOpen && (
        <Modal
          isOpen={testVoiceModalOpen}
          onClose={() => {
            stopSpeech();
            setIsPlayingTestAudio(false);
            setTestVoiceModalOpen(false);
          }}
          title={`Audible Voice Synthesis • ${activeLangTab}`}
          subtitle={`${activeAgent.name} • ${voiceGender} voice at ${speakingRate}x`}
          maxWidth="md"
        >
          <div className="space-y-4 text-center py-3 text-xs">
            <div 
              onClick={() => {
                setIsPlayingTestAudio(true);
                speakText(greetingText, activeLangTab, speakingRate, () => setIsPlayingTestAudio(false));
              }}
              className="w-14 h-14 bg-gradient-to-tr from-amber-500 to-orange-500 text-slate-950 rounded-2xl flex items-center justify-center mx-auto shadow-brand cursor-pointer hover:scale-105 transition"
              title="Click to replay audio"
            >
              <Volume2 className="w-7 h-7" />
            </div>

            <div className="space-y-1">
              <h4 className="font-bold text-slate-900 text-sm">
                Live Browser Audio Output ({activeLangTab})
              </h4>
              <p className="text-slate-600 max-w-sm mx-auto italic bg-slate-50 p-3 rounded-xl border border-slate-200">
                "{greetingText}"
              </p>
            </div>

            {/* Pulsing soundbars */}
            <div className="flex items-center justify-center gap-1 h-10 px-4 bg-slate-900 rounded-xl">
              {Array.from({ length: 20 }).map((_, i) => (
                <div
                  key={i}
                  className="w-1.5 bg-amber-400 rounded-full wave-bar"
                  style={{
                    height: isPlayingTestAudio ? `${Math.max(20, (i % 5) * 18 + 20)}%` : '15%',
                    animationDuration: `${0.6 + (i % 3) * 0.3}s`
                  }}
                />
              ))}
            </div>

            <div className="text-[11px] text-slate-400 flex items-center justify-center gap-1">
              {isPlayingTestAudio ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping mr-1" />
                  <span className="text-emerald-700 font-semibold">Speaking through your device audio output...</span>
                </>
              ) : (
                <span>Playback finished. Click 'Replay Speech' to listen again.</span>
              )}
            </div>

            <div className="pt-2 flex justify-center gap-2">
              <button
                onClick={() => {
                  setIsPlayingTestAudio(true);
                  speakText(greetingText, activeLangTab, speakingRate, () => setIsPlayingTestAudio(false));
                }}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl flex items-center gap-1.5 shadow-sm transition"
              >
                <Volume2 className="w-3.5 h-3.5" />
                <span>Replay Speech</span>
              </button>
              <button
                onClick={() => {
                  stopSpeech();
                  setIsPlayingTestAudio(false);
                  setTestVoiceModalOpen(false);
                }}
                className="px-4 py-2 bg-slate-900 text-white rounded-xl font-semibold hover:bg-slate-800"
              >
                Done
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};


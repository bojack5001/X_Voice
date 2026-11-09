import { LanguageCode } from '../types';

// Browser Web Audio API Chime & Tone Generator
export const playTelephonyTone = (type: 'ring' | 'chime' | 'speech_pulse' = 'chime') => {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();

    if (type === 'chime') {
      // Pleasant dual-tone enterprise chime (440Hz + 880Hz)
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc1.type = 'sine';
      osc2.type = 'triangle';

      osc1.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
      osc1.frequency.exponentialRampToValueAtTime(659.25, ctx.currentTime + 0.15); // E5
      osc1.frequency.exponentialRampToValueAtTime(783.99, ctx.currentTime + 0.3); // G5

      osc2.frequency.setValueAtTime(261.63, ctx.currentTime); // C4

      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);

      osc1.start();
      osc2.start();
      osc1.stop(ctx.currentTime + 0.85);
      osc2.stop(ctx.currentTime + 0.85);
    } else if (type === 'ring') {
      // Classic telephonic ringback tone (400Hz + 450Hz)
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc1.type = 'sine';
      osc2.type = 'sine';
      osc1.frequency.value = 400;
      osc2.frequency.value = 450;

      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.2);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);

      osc1.start();
      osc2.start();
      osc1.stop(ctx.currentTime + 1.25);
      osc2.stop(ctx.currentTime + 1.25);
    }
  } catch (err) {
    console.warn('Web Audio API not allowed or supported yet:', err);
  }
};

// Native Browser Speech Synthesizer
export const speakText = (
  text: string, 
  language: LanguageCode | string = 'Tamil', 
  rate: number = 1.0,
  onEnd?: () => void
) => {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    // Fallback to chime if speech synthesis not available
    playTelephonyTone('chime');
    if (onEnd) setTimeout(onEnd, 2000);
    return;
  }

  // Play a soft introductory notification chime
  playTelephonyTone('chime');

  try {
    window.speechSynthesis.cancel(); // Stop any pending speech

    const utterance = new SpeechSynthesisUtterance(text);
    
    // Dialect locale mapping
    const langLocaleMap: Record<string, string> = {
      'Tamil': 'ta-IN',
      'Telugu': 'te-IN',
      'Hindi': 'hi-IN',
      'English': 'en-IN'
    };

    const targetLang = langLocaleMap[language] || 'en-IN';
    utterance.lang = targetLang;
    utterance.rate = Math.max(0.7, Math.min(1.4, rate));
    utterance.pitch = 1.05;
    utterance.volume = 1.0;

    // Pick best matching voice
    const voices = window.speechSynthesis.getVoices();
    const matchedVoice = voices.find(v => 
      v.lang.toLowerCase() === targetLang.toLowerCase() ||
      v.lang.toLowerCase().replace('_', '-').startsWith(targetLang.toLowerCase().substring(0, 2))
    );

    if (matchedVoice) {
      utterance.voice = matchedVoice;
    }

    utterance.onend = () => {
      if (onEnd) onEnd();
    };

    utterance.onerror = (e) => {
      console.warn('SpeechSynthesis error:', e);
      if (onEnd) onEnd();
    };

    window.speechSynthesis.speak(utterance);
  } catch (err) {
    console.error('Speech synthesis execution error:', err);
    if (onEnd) onEnd();
  }
};

export const stopSpeech = () => {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
};


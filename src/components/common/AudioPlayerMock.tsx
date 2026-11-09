import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, Volume2, Download, CheckCircle2 } from 'lucide-react';
import { playTelephonyTone, speakText, stopSpeech } from '../../utils/audioSynthesizer';

interface AudioPlayerMockProps {
  duration?: string;
  callId?: string;
  compact?: boolean;
  transcriptSnippet?: string;
  language?: string;
}

export const AudioPlayerMock: React.FC<AudioPlayerMockProps> = ({
  duration = '02:44',
  callId = 'CALL-REC-01',
  compact = false,
  transcriptSnippet,
  language = 'Tamil'
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [speed, setSpeed] = useState<1 | 1.25 | 1.5>(1);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  useEffect(() => {
    let interval: any;
    if (isPlaying) {
      // Play real audio through browser speaker
      const speechToPlay = transcriptSnippet || (
        language === 'Tamil' 
          ? 'வணக்கம், எக்ஸ்பூல் ஓட்டுநர் ஆவண சரிபார்ப்பு பிரிவு அழைப்பு பதிவு.'
          : language === 'Telugu'
          ? 'నమస్కారం, ఎక్స్‌పూల్ డ్రైవర్ ఆన్‌బోర్డింగ్ ఆడియో రికార్డింగ్.'
          : 'XPOOL automated voice onboarding call playback stream.'
      );
      speakText(speechToPlay, language, speed);

      interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            setIsPlaying(false);
            stopSpeech();
            return 0;
          }
          return prev + 1.5 * speed;
        });
      }, 200);
    } else {
      stopSpeech();
    }
    return () => {
      clearInterval(interval);
      stopSpeech();
    };
  }, [isPlaying, speed]);

  const toggleSpeed = () => {
    if (speed === 1) setSpeed(1.25);
    else if (speed === 1.25) setSpeed(1.5);
    else setSpeed(1);
  };

  const handleDownload = () => {
    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 2500);
  };

  const currentSeconds = Math.floor((progress / 100) * 164);
  const mins = Math.floor(currentSeconds / 60);
  const secs = currentSeconds % 60;
  const currentTimeDisplay = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;

  if (compact) {
    return (
      <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs">
        <button
          onClick={() => setIsPlaying(!isPlaying)}
          className="w-7 h-7 rounded-full bg-amber-500 text-white flex items-center justify-center hover:bg-amber-600 transition shadow-sm"
        >
          {isPlaying ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 ml-0.5 fill-current" />}
        </button>
        <div className="flex-1">
          <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
            <div className="h-full bg-amber-500 rounded-full transition-all duration-150" style={{ width: `${progress}%` }} />
          </div>
        </div>
        <span className="font-mono text-[11px] text-slate-500">{currentTimeDisplay} / {duration}</span>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white p-4 rounded-xl border border-slate-700 shadow-md">
      <div className="flex items-center justify-between mb-3 text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <Volume2 className="w-4 h-4 text-amber-400" />
          <span className="font-mono text-slate-300">Call Audio Recording • {callId}</span>
        </div>
        <span className="text-[11px] bg-slate-800 border border-slate-700 px-2 py-0.5 rounded text-amber-300">
          Encrypted Stereo Track
        </span>
      </div>

      {/* Waveform Visualization Bars */}
      <div className="flex items-center justify-between gap-1 h-9 my-3 px-2">
        {Array.from({ length: 32 }).map((_, i) => {
          const heights = [30, 45, 80, 60, 40, 95, 75, 50, 65, 85, 40, 30, 90, 70, 55, 35, 75, 90, 60, 45, 85, 95, 65, 40, 50, 70, 80, 60, 45, 75, 55, 35];
          const barHeight = heights[i % heights.length];
          const isPassed = (i / 32) * 100 <= progress;
          return (
            <div
              key={i}
              className={`flex-1 rounded-full transition-all duration-150 ${
                isPassed ? 'bg-amber-400' : 'bg-slate-700'
              } ${isPlaying ? 'wave-bar' : ''}`}
              style={{
                height: `${barHeight}%`,
                animationPlayState: isPlaying ? 'running' : 'paused'
              }}
            />
          );
        })}
      </div>

      {/* Scrubber Progress Bar */}
      <div 
        className="relative h-2 bg-slate-700 rounded-full cursor-pointer overflow-hidden group"
        onClick={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const clickX = e.clientX - rect.left;
          const newProgress = Math.max(0, Math.min(100, (clickX / rect.width) * 100));
          setProgress(newProgress);
        }}
      >
        <div 
          className="absolute left-0 top-0 h-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all duration-100"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between mt-3 text-xs">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="w-9 h-9 rounded-full bg-amber-500 hover:bg-amber-600 text-slate-950 flex items-center justify-center font-bold transition shadow-brand"
          >
            {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 ml-0.5 fill-current" />}
          </button>

          <button
            onClick={() => setProgress(0)}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-700 transition"
            title="Restart"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            onClick={toggleSpeed}
            className="px-2 py-1 text-[11px] font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 rounded border border-slate-700 transition"
          >
            {speed}x
          </button>

          <span className="font-mono text-slate-300 text-xs">
            {currentTimeDisplay} <span className="text-slate-500">/</span> {duration}
          </span>
        </div>

        <button
          onClick={handleDownload}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition border border-slate-700"
        >
          {downloadSuccess ? (
            <>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-400">Export Ready</span>
            </>
          ) : (
            <>
              <Download className="w-3.5 h-3.5" />
              <span>Download MP3</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};


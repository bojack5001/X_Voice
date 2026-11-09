import React from 'react';
import { Sparkles, Info } from 'lucide-react';

interface DemoBadgeProps {
  label?: string;
  className?: string;
}

export const DemoBadge: React.FC<DemoBadgeProps> = ({ 
  label = "FRONTEND SIMULATION MODE • READY FOR BACKEND / N8N INTEGRATION",
  className = "" 
}) => {
  return (
    <div className={`inline-flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-yellow-500/10 border border-amber-300/60 rounded-full text-[11px] font-semibold text-amber-900 shadow-sm ${className}`}>
      <Sparkles className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
      <span>{label}</span>
    </div>
  );
};

export const DemoNoticeBanner: React.FC = () => {
  return (
    <div className="bg-slate-900 border-b border-slate-800 text-slate-300 text-xs px-4 py-1.5 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
        <span className="font-medium text-white">XPOOL AI CONNECT v2.4</span>
        <span className="text-slate-500">|</span>
        <span className="hidden sm:inline text-slate-400">Enterprise Voice & Telephony CRM (Tamil • Telugu • English • Hindi)</span>
      </div>
      <div className="flex items-center gap-2">
        <DemoBadge label="MOCK DATA ENGINE • NO REAL CALL CHARGES" className="py-0.5" />
      </div>
    </div>
  );
};


import React from 'react';
import { Sparkles, ShieldAlert, Info, AlertTriangle } from 'lucide-react';
import { DEMO_BANNER_TEXT } from '../../data/mockConfig';

interface DemoBadgeProps {
  label?: string;
  className?: string;
  variant?: 'amber' | 'slate' | 'rose' | 'emerald';
}

export const DemoBadge: React.FC<DemoBadgeProps> = ({ 
  label = "SIMULATED DEMO • AWAITING INTEGRATION",
  className = "",
  variant = 'amber'
}) => {
  const variantStyles = {
    amber: "bg-amber-500/10 border-amber-300/70 text-amber-900",
    slate: "bg-slate-100 border-slate-300 text-slate-700",
    rose: "bg-rose-50 border-rose-200 text-rose-800",
    emerald: "bg-emerald-50 border-emerald-200 text-emerald-800"
  };

  return (
    <div className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 border rounded-full text-[10px] font-bold tracking-wide uppercase shadow-sm ${variantStyles[variant]} ${className}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
      <span>{label}</span>
    </div>
  );
};

export const DemoNoticeBanner: React.FC = () => {
  return (
    <div className="bg-slate-950 border-b border-amber-500/30 text-slate-200 text-xs px-4 py-2 flex flex-col sm:flex-row items-center justify-between gap-2 shadow-sm">
      <div className="flex items-center gap-2.5">
        <span className="inline-flex items-center justify-center px-2 py-0.5 rounded text-[10px] font-black bg-amber-500 text-slate-950 uppercase tracking-wider">
          Demo Environment
        </span>
        <span className="font-bold text-amber-400 tracking-wide">
          {DEMO_BANNER_TEXT}
        </span>
      </div>
      
      <div className="flex items-center gap-3 text-[11px] text-slate-400">
        <span className="hidden md:inline">Languages: <strong className="text-slate-200">Tamil • Telugu • English</strong></span>
        <span className="hidden md:inline text-slate-700">|</span>
        <span className="text-amber-300/90 font-medium flex items-center gap-1">
          <Info className="w-3.5 h-3.5" />
          <span>Manual-Only Dialing Enforced</span>
        </span>
      </div>
    </div>
  );
};

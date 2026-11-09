import React from 'react';
import { LucideIcon, ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  change?: string;
  isPositive?: boolean;
  subtitle?: string;
  badge?: string;
  colorScheme?: 'amber' | 'blue' | 'emerald' | 'purple' | 'rose' | 'orange';
  onClick?: () => void;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon: Icon,
  change,
  isPositive = true,
  subtitle,
  badge,
  colorScheme = 'amber',
  onClick
}) => {
  const iconBgMap = {
    amber: 'bg-amber-50 text-amber-600 border border-amber-200/60',
    orange: 'bg-orange-50 text-orange-600 border border-orange-200/60',
    blue: 'bg-blue-50 text-blue-600 border border-blue-200/60',
    emerald: 'bg-emerald-50 text-emerald-600 border border-emerald-200/60',
    purple: 'bg-purple-50 text-purple-600 border border-purple-200/60',
    rose: 'bg-rose-50 text-rose-600 border border-rose-200/60'
  };

  return (
    <div 
      onClick={onClick}
      className={`relative bg-white rounded-xl border border-slate-200/80 p-5 shadow-card hover:shadow-md transition-all duration-200 ${onClick ? 'cursor-pointer hover:border-amber-400' : ''}`}
    >
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{title}</span>
            {badge && (
              <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-medium">
                {badge}
              </span>
            )}
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900 tracking-tight">{value}</div>
        </div>

        <div className={`p-2.5 rounded-xl ${iconBgMap[colorScheme]}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>

      {(change || subtitle) && (
        <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
          {change && (
            <div className={`flex items-center font-medium ${isPositive ? 'text-emerald-600' : 'text-rose-600'}`}>
              {isPositive ? <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" /> : <ArrowDownRight className="w-3.5 h-3.5 mr-0.5" />}
              <span>{change}</span>
              <span className="text-slate-400 font-normal ml-1">vs last week</span>
            </div>
          )}
          {subtitle && (
            <span className="text-slate-500 text-[11px] ml-auto">{subtitle}</span>
          )}
        </div>
      )}
    </div>
  );
};


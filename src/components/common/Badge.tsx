import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'amber' | 'green' | 'blue' | 'red' | 'purple' | 'slate' | 'orange' | 'yellow';
  size?: 'sm' | 'md';
  pulse?: boolean;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ 
  children, 
  variant = 'slate', 
  size = 'md',
  pulse = false,
  className = '' 
}) => {
  const variantStyles = {
    amber: 'bg-amber-50 text-amber-700 border-amber-200/80',
    orange: 'bg-orange-50 text-orange-700 border-orange-200/80',
    green: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
    blue: 'bg-blue-50 text-blue-700 border-blue-200/80',
    red: 'bg-rose-50 text-rose-700 border-rose-200/80',
    purple: 'bg-purple-50 text-purple-700 border-purple-200/80',
    yellow: 'bg-yellow-50 text-yellow-800 border-yellow-300',
    slate: 'bg-slate-100 text-slate-700 border-slate-200',
  };

  const sizeStyles = {
    sm: 'text-[11px] px-2 py-0.5 font-medium',
    md: 'text-xs px-2.5 py-1 font-medium',
  };

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}>
      {pulse && (
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-current opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-current"></span>
        </span>
      )}
      {children}
    </span>
  );
};


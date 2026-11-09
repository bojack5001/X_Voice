import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  FileSpreadsheet, 
  UserCheck, 
  HeartHandshake, 
  PhoneCall, 
  Radio, 
  History, 
  CheckSquare, 
  Briefcase, 
  Cpu, 
  BarChart3, 
  Settings,
  ChevronRight,
  ShieldCheck,
  Zap
} from 'lucide-react';
import { useData } from '../../context/DataContext';

interface SidebarProps {
  isOpen: boolean;
  onClose?: () => void;
}

interface NavItem {
  name: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
  liveBadge?: string;
  pulse?: boolean;
  badge?: string;
  countBadge?: number;
}

interface NavGroup {
  title: string;
  items: NavItem[];
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const location = useLocation();
  const { tasks, liveCalls } = useData();

  const pendingTasksCount = tasks.filter(t => t.status !== 'Completed').length;
  const activeLiveCallsCount = liveCalls.filter(c => c.status === 'in-progress').length;

  const navigationGroups: NavGroup[] = [
    {
      title: 'OPERATIONS',
      items: [
        { name: 'Overview', path: '/', icon: LayoutDashboard },
        { name: 'Driver Onboarding', path: '/drivers', icon: Users },
        { name: 'Excel Lead Import', path: '/leads/import', icon: FileSpreadsheet, badge: 'XLSX' },
        { name: 'Passenger Management', path: '/passengers', icon: UserCheck },
        { name: 'Driver Engagement', path: '/driver-engagement', icon: HeartHandshake },
      ]
    },
    {
      title: 'AI TELEPHONY',
      items: [
        { 
          name: 'Live Call Monitor', 
          path: '/calls/live', 
          icon: Radio, 
          liveBadge: `${activeLiveCallsCount} LIVE`,
          pulse: true 
        },
        { name: 'AI Call Dispatch', path: '/calls/management', icon: PhoneCall },
        { name: 'Call History & Audio', path: '/calls/history', icon: History },
      ]
    },
    {
      title: 'TEAM & GOVERNANCE',
      items: [
        { 
          name: 'Follow-up Tasks', 
          path: '/tasks', 
          icon: CheckSquare, 
          countBadge: pendingTasksCount > 0 ? pendingTasksCount : undefined 
        },
        { name: 'Employee Roster', path: '/employees', icon: Briefcase },
        { name: 'AI Voice Agents', path: '/ai-settings', icon: Cpu },
        { name: 'Reports & Analytics', path: '/reports', icon: BarChart3 },
        { name: 'Settings', path: '/settings', icon: Settings },
      ]
    }
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-[#0B0F19] text-slate-300 flex flex-col border-r border-slate-800/80 transition-transform duration-300 ease-in-out lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        {/* Brand Header */}
        <div className="h-16 flex items-center px-5 border-b border-slate-800/80 bg-[#0B0F19]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 via-amber-500 to-orange-500 flex items-center justify-center text-slate-950 font-black shadow-brand">
              <Zap className="w-5 h-5 fill-slate-950" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-white tracking-tight text-base font-poppins">XPOOL</span>
                <span className="text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30 px-1.5 py-0.2 rounded">
                  AI
                </span>
              </div>
              <span className="text-[10px] text-slate-400 block font-medium">Enterprise Telephony</span>
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
          {navigationGroups.map((group, groupIdx) => (
            <div key={groupIdx} className="space-y-1">
              <div className="px-3 text-[10px] font-bold text-slate-500 tracking-wider uppercase mb-2">
                {group.title}
              </div>

              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));

                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={onClose}
                    className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all group ${
                      isActive 
                        ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-bold shadow-brand' 
                        : 'text-slate-400 hover:text-white hover:bg-slate-850/80'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className={`w-4 h-4 transition-transform group-hover:scale-110 ${isActive ? 'text-slate-950' : 'text-slate-400 group-hover:text-amber-400'}`} />
                      <span>{item.name}</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {item.liveBadge && (
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full flex items-center gap-1 ${
                          isActive ? 'bg-slate-950 text-amber-400' : 'bg-red-500/20 text-red-400 border border-red-500/30'
                        }`}>
                          {item.pulse && <span className="w-1.5 h-1.5 rounded-full bg-current animate-ping" />}
                          {item.liveBadge}
                        </span>
                      )}

                      {item.badge && (
                        <span className={`text-[10px] font-semibold px-1.5 py-0.2 rounded ${
                          isActive ? 'bg-slate-950/20 text-slate-950' : 'bg-slate-800 text-slate-300'
                        }`}>
                          {item.badge}
                        </span>
                      )}

                      {item.countBadge !== undefined && (
                        <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${
                          isActive ? 'bg-slate-950 text-amber-400' : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                        }`}>
                          {item.countBadge}
                        </span>
                      )}
                    </div>
                  </NavLink>
                );
              })}
            </div>
          ))}
        </div>

        {/* Tenant Footer */}
        <div className="p-3 border-t border-slate-800/80 bg-slate-950">
          <div className="flex items-center gap-2.5 p-2 rounded-xl bg-slate-900 border border-slate-800">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div className="overflow-hidden">
              <span className="text-xs font-semibold text-white truncate block">XPOOL Tech Pvt Ltd</span>
              <span className="text-[10px] text-slate-400 truncate block">HQ: Chennai, India</span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

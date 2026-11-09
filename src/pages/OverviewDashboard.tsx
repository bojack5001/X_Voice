import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  UserCheck, 
  FileSpreadsheet, 
  PhoneCall, 
  PhoneIncoming, 
  CheckCircle2, 
  Clock, 
  AlertOctagon,
  ArrowRight,
  Sparkles,
  TrendingUp,
  Download,
  Filter,
  Radio,
  Zap
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';
import { useData } from '../context/DataContext';
import { StatCard } from '../components/common/StatCard';
import { Badge } from '../components/common/Badge';
import { DemoBadge } from '../components/common/DemoBadge';
import { 
  CALL_TRENDS_WEEKLY, 
  ONBOARDING_FUNNEL_DATA, 
  LANGUAGE_DISTRIBUTION, 
  PASSENGER_GROWTH_DATA,
  RECENT_SYSTEM_ACTIVITIES 
} from '../data/mockAnalytics';
import { CallSimulationDialog } from '../components/calls/CallSimulationDialog';

export const OverviewDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { kpiSummary, drivers, liveCalls } = useData();

  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('7d');
  const [isCallModalOpen, setIsCallModalOpen] = useState(false);

  return (
    <div className="space-y-7">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight font-poppins">
              Executive Overview Dashboard
            </h1>
            <DemoBadge label="SIMULATED TELEPHONY & CRM" />
          </div>
          <p className="text-xs text-slate-500 mt-1">
            XPOOL Technology Private Limited • Real-time AI Voice Telephony & Driver Conversion Telemetry
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5">
          <div className="bg-white border border-slate-200 rounded-xl p-1 flex items-center text-xs shadow-card">
            {(['7d', '30d', '90d'] as const).map(range => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-3 py-1 rounded-lg font-medium transition ${
                  timeRange === range 
                    ? 'bg-amber-500 text-slate-950 font-bold shadow-sm' 
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {range.toUpperCase()}
              </button>
            ))}
          </div>

          <button
            onClick={() => setIsCallModalOpen(true)}
            className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 text-xs font-bold rounded-xl shadow-brand flex items-center gap-1.5 transition active:scale-95"
          >
            <PhoneCall className="w-3.5 h-3.5" />
            <span>Launch AI Call</span>
          </button>
        </div>
      </div>

      {/* 8 REQUIRED KPI CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Drivers"
          value={kpiSummary.totalDrivers.toLocaleString()}
          icon={Users}
          change="+18.4%"
          isPositive={true}
          subtitle="Active fleet in TN & TS"
          colorScheme="amber"
          onClick={() => navigate('/drivers')}
        />
        <StatCard
          title="Total Passengers"
          value={kpiSummary.totalPassengers.toLocaleString()}
          icon={UserCheck}
          change="+12.6%"
          isPositive={true}
          subtitle="Registered commuters"
          colorScheme="blue"
          onClick={() => navigate('/passengers')}
        />
        <StatCard
          title="Leads Imported"
          value={kpiSummary.leadsImported.toLocaleString()}
          icon={FileSpreadsheet}
          change="+24.0%"
          isPositive={true}
          subtitle="XLSX auto-parsed"
          colorScheme="purple"
          onClick={() => navigate('/leads/import')}
        />
        <StatCard
          title="Calls Initiated"
          value={kpiSummary.callsInitiated.toLocaleString()}
          icon={PhoneCall}
          change="+31.2%"
          isPositive={true}
          subtitle="AI Voice outbound"
          colorScheme="orange"
          onClick={() => navigate('/calls/management')}
        />
        <StatCard
          title="Answered Calls"
          value={kpiSummary.answeredCalls.toLocaleString()}
          icon={PhoneIncoming}
          change="82.1%"
          isPositive={true}
          subtitle="Connectivity pick-up rate"
          colorScheme="emerald"
          onClick={() => navigate('/calls/history')}
        />
        <StatCard
          title="Successful Onboarding"
          value={kpiSummary.successfulOnboarding.toLocaleString()}
          icon={CheckCircle2}
          change="+15.8%"
          isPositive={true}
          subtitle="Full KYC verified"
          colorScheme="emerald"
          onClick={() => navigate('/drivers')}
        />
        <StatCard
          title="Pending Follow-ups"
          value={kpiSummary.pendingFollowups.toLocaleString()}
          icon={Clock}
          change="-4.2%"
          isPositive={true}
          subtitle="Queued agent callbacks"
          colorScheme="amber"
          onClick={() => navigate('/tasks')}
        />
        <StatCard
          title="Human Escalations"
          value={kpiSummary.humanEscalations.toLocaleString()}
          icon={AlertOctagon}
          change="1.8%"
          isPositive={false}
          subtitle="Transferred to TL / CCE"
          colorScheme="rose"
          onClick={() => navigate('/calls/history')}
        />
      </div>

      {/* Live Monitoring Quick Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 text-white rounded-2xl p-5 border border-slate-800 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Radio className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-white">Live AI Call Engine Active</span>
              <span className="px-2 py-0.5 rounded-full bg-red-500/20 border border-red-500/30 text-red-400 text-[10px] font-bold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-current animate-ping" />
                {liveCalls.filter(c => c.status === 'in-progress').length} CHANNELS LIVE
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Simulated Tamil, Telugu, and English conversational voice streams currently processing driver document onboarding.
            </p>
          </div>
        </div>

        <button
          onClick={() => navigate('/calls/live')}
          className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 text-xs font-semibold flex items-center justify-center gap-2 transition"
        >
          <span>Open Live Monitor</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Main Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Call Connectivity Trends */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/90 p-5 shadow-card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">AI Call Telephony Performance</h3>
              <p className="text-xs text-slate-500">Initiated vs Answered vs Successfully Qualified Calls (Daily)</p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                <span className="text-slate-600 font-medium">Initiated</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span className="text-slate-600 font-medium">Answered</span>
              </div>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={CALL_TRENDS_WEEKLY}>
                <defs>
                  <linearGradient id="colorInit" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0}/>
                  </linearGradient>
                  <linearGradient id="colorAns" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="day" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#0f172a', 
                    borderRadius: '10px', 
                    border: 'none', 
                    color: '#fff', 
                    fontSize: '11px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                  }} 
                />
                <Area type="monotone" dataKey="initiated" stroke="#f59e0b" strokeWidth={2.5} fillOpacity={1} fill="url(#colorInit)" name="Calls Initiated" />
                <Area type="monotone" dataKey="answered" stroke="#10b981" strokeWidth={2.5} fillOpacity={1} fill="url(#colorAns)" name="Calls Answered" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Language Breakdown */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-card flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Regional Voice Distribution</h3>
            <p className="text-xs text-slate-500 mb-4">Autonomous language routing breakdown</p>

            <div className="h-44 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={LANGUAGE_DISTRIBUTION}
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {LANGUAGE_DISTRIBUTION.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#0f172a', 
                      borderRadius: '8px', 
                      border: 'none', 
                      color: '#fff', 
                      fontSize: '11px' 
                    }} 
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="space-y-2 pt-2 border-t border-slate-100">
            {LANGUAGE_DISTRIBUTION.map((item) => (
              <div key={item.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.fill }} />
                  <span className="font-medium text-slate-700">{item.name}</span>
                </div>
                <span className="font-bold text-slate-900">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Funnel & Passenger Growth Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Driver Onboarding Funnel */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Driver Onboarding Conversion Funnel</h3>
              <p className="text-xs text-slate-500">From cold Excel lead ingest to fully verified KYC driver</p>
            </div>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
              42.7% Overall Conversion
            </span>
          </div>

          <div className="space-y-3 pt-2">
            {ONBOARDING_FUNNEL_DATA.map((step) => {
              const maxCount = ONBOARDING_FUNNEL_DATA[0].count;
              const pct = Math.round((step.count / maxCount) * 100);
              return (
                <div key={step.stage} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-700">{step.stage}</span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-slate-900">{step.count.toLocaleString()}</span>
                      <span className="text-[11px] text-slate-400">({pct}%)</span>
                    </div>
                  </div>
                  <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full rounded-full transition-all duration-500" 
                      style={{ width: `${pct}%`, backgroundColor: step.fill }} 
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Passenger Statistics & Recent Activities */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-card flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Live System Activity Stream</h3>
                <p className="text-xs text-slate-500">Recent automated AI telephony & KYC updates</p>
              </div>
              <button
                onClick={() => navigate('/calls/history')}
                className="text-xs font-semibold text-amber-700 hover:text-amber-800 flex items-center gap-1"
              >
                <span>View All</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            <div className="divide-y divide-slate-100 space-y-3">
              {RECENT_SYSTEM_ACTIVITIES.map((act) => (
                <div key={act.id} className="pt-3 first:pt-0 flex items-start justify-between gap-3 text-xs">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-900">{act.title}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${act.badgeColor}`}>
                        {act.badge}
                      </span>
                    </div>
                    <p className="text-slate-600 text-[11px] leading-relaxed">{act.description}</p>
                  </div>
                  <span className="text-[10px] text-slate-400 whitespace-nowrap">{act.time}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500">Fast action shortcuts:</span>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => navigate('/leads/import')} 
                className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-700 font-medium"
              >
                Import Leads
              </button>
              <button 
                onClick={() => navigate('/tasks')} 
                className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-700 font-medium"
              >
                Tasks Queue
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive AI Call Modal */}
      <CallSimulationDialog
        isOpen={isCallModalOpen}
        onClose={() => setIsCallModalOpen(false)}
        targetName={drivers[0]?.name || 'Muruganandham P'}
        targetPhone={drivers[0]?.phone || '+91 97890 12399'}
        defaultLanguage={drivers[0]?.preferredLanguage || 'Tamil'}
      />
    </div>
  );
};


import React, { useState } from 'react';
import { 
  BarChart3, 
  Download, 
  Calendar, 
  TrendingUp, 
  Users, 
  PhoneCall, 
  CheckCircle2, 
  Clock, 
  FileSpreadsheet, 
  Sparkles,
  MapPin,
  Check
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  Legend 
} from 'recharts';
import { useData } from '../context/DataContext';
import { DemoBadge } from '../components/common/DemoBadge';
import { CITY_PERFORMANCE, CALL_TRENDS_WEEKLY, ONBOARDING_FUNNEL_DATA } from '../data/mockAnalytics';

export const ReportsAnalytics: React.FC = () => {
  const { employees, kpiSummary } = useData();

  const [dateRange, setDateRange] = useState<'30d' | '90d' | 'ytd'>('30d');
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  const handleExportCSV = () => {
    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight font-poppins">
              Executive Reports & Performance Analytics
            </h1>
            <DemoBadge label="AGGREGATED KPI INTELLIGENCE" />
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Operational conversion telemetry, regional voice connectivity, and customer service team metrics
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="bg-white border border-slate-200 rounded-xl p-1 flex items-center text-xs shadow-card">
            {(['30d', '90d', 'ytd'] as const).map(range => (
              <button
                key={range}
                onClick={() => setDateRange(range)}
                className={`px-3 py-1 rounded-lg font-semibold transition ${
                  dateRange === range 
                    ? 'bg-amber-500 text-slate-950 shadow-sm' 
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {range.toUpperCase()}
              </button>
            ))}
          </div>

          <button
            onClick={handleExportCSV}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl flex items-center gap-2 shadow-sm transition active:scale-95"
          >
            {downloadSuccess ? <Check className="w-4 h-4 text-emerald-400" /> : <Download className="w-4 h-4" />}
            <span>{downloadSuccess ? 'Export Generated' : 'Export Full CSV'}</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-card">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Average Pickup Rate</span>
          <div className="text-xl font-bold text-slate-900 mt-1">82.1%</div>
          <span className="text-[11px] text-emerald-600 font-semibold">+3.4% above SLA</span>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-card">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Avg Call Duration</span>
          <div className="text-xl font-bold text-slate-900 mt-1">2m 18s</div>
          <span className="text-[11px] text-slate-500">Autonomous qualification</span>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-card">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Full Onboarding Yield</span>
          <div className="text-xl font-bold text-amber-700 mt-1">42.7%</div>
          <span className="text-[11px] text-emerald-600 font-semibold">Lead to Active Driver</span>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-card">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Escalation Resolution</span>
          <div className="text-xl font-bold text-slate-900 mt-1">&lt; 45 mins</div>
          <span className="text-[11px] text-slate-500">Team Leader SLA</span>
        </div>
      </div>

      {/* Regional Conversion Breakdown Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/90 p-5 shadow-card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Regional Onboarding & Yield Analysis</h3>
              <p className="text-xs text-slate-500">Leads ingested vs successfully verified drivers across hubs</p>
            </div>
            <span className="text-xs font-semibold bg-amber-50 text-amber-900 px-2.5 py-1 rounded-lg">
              South India Fleet
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={CITY_PERFORMANCE}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="city" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#0f172a', 
                    borderRadius: '8px', 
                    border: 'none', 
                    color: '#fff', 
                    fontSize: '11px' 
                  }} 
                />
                <Bar dataKey="leads" fill="#f59e0b" radius={[6, 6, 0, 0]} name="Leads Processed" />
                <Bar dataKey="onboarded" fill="#10b981" radius={[6, 6, 0, 0]} name="Onboarded Drivers" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* City Summary Table */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-card flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 mb-1">City Hub Performance</h3>
            <p className="text-xs text-slate-500 mb-4">Conversion yield by metro area</p>

            <div className="space-y-3">
              {CITY_PERFORMANCE.map(c => (
                <div key={c.city} className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-slate-900">{c.city}</span>
                    <div className="text-[11px] text-slate-400 mt-0.5">Avg Call: {c.avgDuration}</div>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-emerald-700">{c.rate}</span>
                    <div className="text-[10px] text-slate-500">{c.onboarded}/{c.leads}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 text-center text-xs text-slate-400">
            Automated dialect routing to Chennai Tamil, Coimbatore Tamil, and Hyderabad Telugu.
          </div>
        </div>
      </div>

      {/* Employee Operations Performance Table */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-card overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Operations Team Performance Roster</h3>
            <p className="text-xs text-slate-500">Tasks resolved, calls audited, and escalation handling</p>
          </div>
          <span className="text-xs font-semibold bg-slate-100 text-slate-700 px-2.5 py-1 rounded-lg">
            Active Staff
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                <th className="py-3 px-4">Staff Member</th>
                <th className="py-3 px-4">Role & Department</th>
                <th className="py-3 px-4">Calls Managed</th>
                <th className="py-3 px-4">Pending Tasks</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Efficiency Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {employees.map(emp => (
                <tr key={emp.id} className="hover:bg-slate-50">
                  <td className="py-3 px-4 font-bold text-slate-900">
                    {emp.name}
                    <div className="text-[10px] font-mono text-slate-400">{emp.email}</div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-semibold text-slate-800">{emp.role}</span>
                    <div className="text-[11px] text-slate-500">{emp.department}</div>
                  </td>
                  <td className="py-3 px-4 font-mono font-bold text-amber-700">
                    {emp.callsHandled} calls
                  </td>
                  <td className="py-3 px-4 font-mono font-bold text-slate-800">
                    {emp.activeTasksCount} tasks
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      emp.status === 'Active' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {emp.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 font-bold border border-emerald-200">
                      98.4%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};


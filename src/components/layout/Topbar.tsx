import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Menu, 
  Search, 
  PhoneCall, 
  Bell, 
  ChevronDown, 
  User, 
  Sparkles,
  Globe2,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Car,
  UserCheck,
  History,
  FileSpreadsheet,
  X
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { CallSimulationDialog } from '../calls/CallSimulationDialog';
import { UserRole } from '../../types';

interface TopbarProps {
  onToggleSidebar: () => void;
}

export const Topbar: React.FC<TopbarProps> = ({ onToggleSidebar }) => {
  const navigate = useNavigate();
  const { currentUser, switchRole, availableRoles } = useAuth();
  const { drivers, passengers, calls, resetToDefaults } = useData();

  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isQuickCallOpen, setIsQuickCallOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const trimmedQuery = searchQuery.trim().toLowerCase();

  // Filter items matching search
  const matchingDrivers = trimmedQuery 
    ? drivers.filter(d => 
        d.name.toLowerCase().includes(trimmedQuery) || 
        d.phone.includes(trimmedQuery) ||
        d.vehicleNumber.toLowerCase().includes(trimmedQuery) ||
        d.city.toLowerCase().includes(trimmedQuery)
      ).slice(0, 3)
    : [];

  const matchingPassengers = trimmedQuery
    ? passengers.filter(p =>
        p.name.toLowerCase().includes(trimmedQuery) ||
        p.phone.includes(trimmedQuery) ||
        p.preferredPickupZone.toLowerCase().includes(trimmedQuery)
      ).slice(0, 3)
    : [];

  const matchingCalls = trimmedQuery
    ? calls.filter(c =>
        c.contactName.toLowerCase().includes(trimmedQuery) ||
        c.agentName.toLowerCase().includes(trimmedQuery) ||
        c.keyNotes.toLowerCase().includes(trimmedQuery)
      ).slice(0, 3)
    : [];

  const hasSearchResults = matchingDrivers.length > 0 || matchingPassengers.length > 0 || matchingCalls.length > 0;

  const notifications = [
    { id: 1, title: 'Tamil Onboarding Call Completed', time: '5m ago', unread: true },
    { id: 2, title: 'Ravi Teja uploaded Commercial Insurance', time: '22m ago', unread: true },
    { id: 3, title: 'Escalation queued for Team Leader review', time: '1h ago', unread: false },
  ];

  return (
    <>
      <header className="sticky top-0 z-30 h-16 bg-white border-b border-slate-200/90 shadow-card px-4 lg:px-8 flex items-center justify-between gap-4">
        {/* Left: Mobile Toggle & Global Search */}
        <div className="flex items-center gap-3 flex-1 max-w-lg">
          <button
            onClick={onToggleSidebar}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 lg:hidden transition"
            aria-label="Toggle Navigation"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="relative w-full max-w-md hidden sm:block">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search drivers, phones, vehicle numbers, transcripts..."
              value={searchQuery}
              onFocus={() => setIsSearchFocused(true)}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-8 py-1.5 text-xs bg-slate-50 hover:bg-slate-100/70 focus:bg-white border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition font-poppins"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}

            {/* Instant Search Results Dropdown */}
            {isSearchFocused && trimmedQuery && (
              <div 
                className="absolute left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-slate-200 py-2 z-50 animate-in fade-in max-h-96 overflow-y-auto"
                onMouseDown={(e) => e.preventDefault()} // prevent input blur
              >
                {!hasSearchResults ? (
                  <div className="p-4 text-center text-xs text-slate-400">
                    No records found for "{searchQuery}"
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100 text-xs">
                    {/* Matching Drivers */}
                    {matchingDrivers.length > 0 && (
                      <div className="p-2">
                        <div className="px-2 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                          <Car className="w-3 h-3 text-amber-500" />
                          <span>Drivers</span>
                        </div>
                        {matchingDrivers.map(d => (
                          <div
                            key={d.id}
                            onClick={() => {
                              navigate('/drivers');
                              setIsSearchFocused(false);
                              setSearchQuery('');
                            }}
                            className="p-2 hover:bg-amber-50 rounded-xl cursor-pointer flex items-center justify-between transition"
                          >
                            <div>
                              <span className="font-bold text-slate-900 block">{d.name}</span>
                              <span className="text-[11px] text-slate-500 font-mono">{d.phone} • {d.city} ({d.vehicleType})</span>
                            </div>
                            <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-mono">
                              {d.id}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Matching Passengers */}
                    {matchingPassengers.length > 0 && (
                      <div className="p-2">
                        <div className="px-2 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                          <UserCheck className="w-3 h-3 text-blue-500" />
                          <span>Passengers</span>
                        </div>
                        {matchingPassengers.map(p => (
                          <div
                            key={p.id}
                            onClick={() => {
                              navigate('/passengers');
                              setIsSearchFocused(false);
                              setSearchQuery('');
                            }}
                            className="p-2 hover:bg-blue-50 rounded-xl cursor-pointer flex items-center justify-between transition"
                          >
                            <div>
                              <span className="font-bold text-slate-900 block">{p.name}</span>
                              <span className="text-[11px] text-slate-500 font-mono">{p.phone} • {p.preferredPickupZone}</span>
                            </div>
                            <span className="text-[10px] bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded font-bold">
                              {p.preferredLanguage}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Matching Calls */}
                    {matchingCalls.length > 0 && (
                      <div className="p-2">
                        <div className="px-2 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                          <History className="w-3 h-3 text-purple-500" />
                          <span>Call Recordings & Transcripts</span>
                        </div>
                        {matchingCalls.map(c => (
                          <div
                            key={c.id}
                            onClick={() => {
                              navigate('/calls/history');
                              setIsSearchFocused(false);
                              setSearchQuery('');
                            }}
                            className="p-2 hover:bg-purple-50 rounded-xl cursor-pointer flex items-center justify-between transition"
                          >
                            <div className="max-w-[260px] truncate">
                              <span className="font-bold text-slate-900 block">{c.contactName}</span>
                              <span className="text-[11px] text-slate-500 truncate block">{c.keyNotes}</span>
                            </div>
                            <span className="text-[10px] bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded">
                              {c.outcome}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right: Quick Action Buttons, Language Indicator, Role Switcher, Profile */}
        <div className="flex items-center gap-2.5 sm:gap-4">
          {/* Quick AI Call button */}
          <button
            onClick={() => setIsQuickCallOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 font-bold text-xs rounded-xl shadow-sm transition active:scale-95"
            title="Launch test AI voice call simulation"
          >
            <PhoneCall className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Quick AI Call</span>
          </button>

          {/* Languages supported badge */}
          <div className="hidden xl:flex items-center gap-1 px-2.5 py-1 bg-slate-100 rounded-lg text-[11px] font-medium text-slate-600 border border-slate-200">
            <Globe2 className="w-3.5 h-3.5 text-amber-600 mr-1" />
            <span className="text-amber-800 font-semibold">Tamil</span>
            <span className="text-slate-300">•</span>
            <span className="text-orange-800 font-semibold">Telugu</span>
            <span className="text-slate-300">•</span>
            <span className="text-blue-800 font-semibold">English</span>
          </div>

          {/* Role Switcher (CEO, HR, TL, CCE) */}
          <div className="relative">
            <button
              onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
              className="flex items-center gap-2 px-2.5 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 transition"
              title="Switch user role to preview permissions"
            >
              <div className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="text-slate-500 font-normal hidden sm:inline">Role:</span>
              <span className="text-slate-900 font-bold">{currentUser.role}</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {isRoleDropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-50 animate-in fade-in slide-in-from-top-1">
                <div className="px-3 py-1.5 border-b border-slate-100 text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  Switch Active Persona
                </div>
                {availableRoles.map((role) => (
                  <button
                    key={role}
                    onClick={() => {
                      switchRole(role);
                      setIsRoleDropdownOpen(false);
                    }}
                    className={`w-full px-3 py-2 text-left text-xs flex items-center justify-between transition ${
                      currentUser.role === role ? 'bg-amber-50 text-amber-900 font-bold' : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <span>{role}</span>
                    {currentUser.role === role && <CheckCircle2 className="w-3.5 h-3.5 text-amber-600" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setIsNotifOpen(!isNotifOpen)}
              className="relative p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-amber-500 ring-2 ring-white" />
            </button>

            {isNotifOpen && (
              <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50">
                <div className="px-3 py-1.5 border-b border-slate-100 flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900">Notifications</span>
                  <span className="text-[10px] text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded font-semibold">2 New</span>
                </div>
                <div className="divide-y divide-slate-100 max-h-60 overflow-y-auto">
                  {notifications.map((n) => (
                    <div key={n.id} className="p-3 text-xs hover:bg-slate-50 transition cursor-pointer">
                      <div className="font-medium text-slate-800">{n.title}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">{n.time}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Reset Demo Data button */}
          <button
            onClick={() => {
              if (window.confirm('Reset all demo state to fresh default data?')) {
                resetToDefaults();
              }
            }}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition"
            title="Reset to fresh sample data"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* User Avatar */}
          <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-500 to-orange-500 text-slate-950 font-bold flex items-center justify-center text-xs shadow-sm">
              {currentUser.name.split(' ').map(n => n[0]).slice(0, 2).join('')}
            </div>
            <div className="hidden lg:block text-left">
              <span className="text-xs font-bold text-slate-900 block leading-tight">{currentUser.name}</span>
              <span className="text-[10px] text-slate-400 block">{currentUser.department}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Quick Call Modal */}
      <CallSimulationDialog
        isOpen={isQuickCallOpen}
        onClose={() => setIsQuickCallOpen(false)}
        targetName="Senthil Kumar (Sample Driver)"
        targetPhone="+91 98401 23456"
        defaultLanguage="Tamil"
      />
    </>
  );
};


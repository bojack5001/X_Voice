import React, { useState } from 'react';
import { 
  Settings, 
  Building2, 
  User, 
  Bell, 
  Sliders, 
  Save, 
  CheckCircle2, 
  ShieldCheck, 
  Key, 
  Sparkles,
  RotateCcw
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { DemoBadge } from '../components/common/DemoBadge';

export const SettingsPage: React.FC = () => {
  const { currentUser, setCurrentUser } = useAuth();
  const { resetToDefaults } = useData();

  const [activeTab, setActiveTab] = useState<'company' | 'profile' | 'preferences'>('company');
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Company details state
  const [companyData, setCompanyData] = useState({
    legalName: 'XPOOL Technology Private Limited',
    brandName: 'XPOOL AI CONNECT',
    cin: 'U72900TN2024PTC168921',
    registeredOffice: 'No. 42, OMR IT Highway, Sholinganallur, Chennai, Tamil Nadu - 600119, India',
    supportEmail: 'telephony-ops@xpool.in',
    phone: '+91 44 4890 1200',
    website: 'https://xpool.in',
    primaryColor: '#F59E0B'
  });

  // User Profile state
  const [profileData, setProfileData] = useState({
    name: currentUser.name,
    email: currentUser.email,
    phone: currentUser.phone,
    department: currentUser.department,
    currentPassword: '',
    newPassword: ''
  });

  // Interface preferences state
  const [preferences, setPreferences] = useState({
    soundAlerts: true,
    compactTableMode: false,
    autoRefreshLiveCalls: true,
    telephonySipTrunkSimulation: true,
    smsDispatchesEnabled: true
  });

  const handleSaveCompany = (e: React.FormEvent) => {
    e.preventDefault();
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentUser({
      ...currentUser,
      name: profileData.name,
      email: profileData.email,
      phone: profileData.phone,
      department: profileData.department
    });
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight font-poppins">
              Platform & Corporate Settings
            </h1>
            <DemoBadge label="ENTERPRISE CONFIGURATION" />
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage XPOOL corporate credentials, employee profile information, and interface preferences
          </p>
        </div>

        {saveSuccess && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-100 text-emerald-800 rounded-xl text-xs font-bold border border-emerald-200">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Settings Updated</span>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200">
        <button
          onClick={() => setActiveTab('company')}
          className={`pb-3 px-3 text-xs font-bold transition flex items-center gap-2 border-b-2 ${
            activeTab === 'company'
              ? 'border-amber-500 text-amber-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Company & Legal Entity</span>
        </button>

        <button
          onClick={() => setActiveTab('profile')}
          className={`pb-3 px-3 text-xs font-bold transition flex items-center gap-2 border-b-2 ${
            activeTab === 'profile'
              ? 'border-amber-500 text-amber-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <User className="w-4 h-4" />
          <span>My Profile & Credentials</span>
        </button>

        <button
          onClick={() => setActiveTab('preferences')}
          className={`pb-3 px-3 text-xs font-bold transition flex items-center gap-2 border-b-2 ${
            activeTab === 'preferences'
              ? 'border-amber-500 text-amber-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>Interface & Sound Alerts</span>
        </button>
      </div>

      {/* TAB 1: Company Details */}
      {activeTab === 'company' && (
        <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-card space-y-6">
          <div className="flex items-start justify-between border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">Corporate Information</h3>
              <p className="text-xs text-slate-500">Official company details for invoice headers, customer SMS and SIP caller ID</p>
            </div>
            <span className="px-2.5 py-1 bg-amber-50 text-amber-900 border border-amber-200 rounded-lg text-xs font-bold">
              Verified Legal Tenant
            </span>
          </div>

          <form onSubmit={handleSaveCompany} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Company Legal Name</label>
                <input
                  type="text"
                  value={companyData.legalName}
                  onChange={(e) => setCompanyData({ ...companyData, legalName: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl font-medium focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Platform Brand Name</label>
                <input
                  type="text"
                  value={companyData.brandName}
                  onChange={(e) => setCompanyData({ ...companyData, brandName: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl font-medium focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Corporate CIN (Registrar of Companies)</label>
                <input
                  type="text"
                  value={companyData.cin}
                  onChange={(e) => setCompanyData({ ...companyData, cin: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl font-mono focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Official Telephony Support Email</label>
                <input
                  type="email"
                  value={companyData.supportEmail}
                  onChange={(e) => setCompanyData({ ...companyData, supportEmail: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl font-mono focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block font-semibold text-slate-700 mb-1">Registered Head Office Address</label>
                <input
                  type="text"
                  value={companyData.registeredOffice}
                  onChange={(e) => setCompanyData({ ...companyData, registeredOffice: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>

            <div className="pt-3 flex justify-end">
              <button
                type="submit"
                className="px-6 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 font-bold rounded-xl shadow-brand text-xs flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                <span>Save Company Info</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 2: User Profile */}
      {activeTab === 'profile' && (
        <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-card space-y-6">
          <div className="flex items-center gap-4 border-b border-slate-100 pb-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 text-slate-950 font-black text-lg flex items-center justify-center shadow-brand">
              {currentUser.name.split(' ').map(n => n[0]).slice(0, 2).join('')}
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">{currentUser.name}</h3>
              <p className="text-xs text-slate-500">{currentUser.role} • {currentUser.department}</p>
            </div>
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Your Full Name</label>
                <input
                  type="text"
                  value={profileData.name}
                  onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Work Email</label>
                <input
                  type="email"
                  value={profileData.email}
                  onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl font-mono focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Mobile Phone Number</label>
                <input
                  type="text"
                  value={profileData.phone}
                  onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl font-mono focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Department</label>
                <input
                  type="text"
                  value={profileData.department}
                  onChange={(e) => setProfileData({ ...profileData, department: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <button
                type="submit"
                className="px-6 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 font-bold rounded-xl shadow-brand text-xs flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                <span>Save Profile</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 3: Preferences */}
      {activeTab === 'preferences' && (
        <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-card space-y-6 text-xs">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-base font-bold text-slate-900">Interface & Audio Preferences</h3>
            <p className="text-xs text-slate-500">Configure sound effects, simulated webhooks, and display density</p>
          </div>

          <div className="space-y-4 divide-y divide-slate-100">
            <div className="flex items-center justify-between pt-3 first:pt-0">
              <div>
                <span className="font-bold text-slate-800 block text-xs">Audio Wave Sound Effects</span>
                <span className="text-[11px] text-slate-500">Play simulated audio tone when AI calls connect or finish</span>
              </div>
              <input
                type="checkbox"
                checked={preferences.soundAlerts}
                onChange={(e) => setPreferences({ ...preferences, soundAlerts: e.target.checked })}
                className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between pt-3">
              <div>
                <span className="font-bold text-slate-800 block text-xs">Auto-Ticking Live Call Clocks</span>
                <span className="text-[11px] text-slate-500">Increment live call monitor seconds in real-time</span>
              </div>
              <input
                type="checkbox"
                checked={preferences.autoRefreshLiveCalls}
                onChange={(e) => setPreferences({ ...preferences, autoRefreshLiveCalls: e.target.checked })}
                className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between pt-3">
              <div>
                <span className="font-bold text-slate-800 block text-xs">Compact Table View</span>
                <span className="text-[11px] text-slate-500">Reduce vertical row padding on data tables</span>
              </div>
              <input
                type="checkbox"
                checked={preferences.compactTableMode}
                onChange={(e) => setPreferences({ ...preferences, compactTableMode: e.target.checked })}
                className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <button
              onClick={() => {
                if (window.confirm('Reset all localStorage data back to fresh defaults?')) {
                  resetToDefaults();
                  alert('Demo database reset to factory state.');
                }
              }}
              className="px-4 py-2 border border-rose-200 text-rose-700 hover:bg-rose-50 rounded-xl text-xs font-semibold flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Demo State</span>
            </button>

            <button
              onClick={() => {
                setSaveSuccess(true);
                setTimeout(() => setSaveSuccess(false), 2000);
              }}
              className="px-6 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 font-bold rounded-xl shadow-brand text-xs"
            >
              Save Preferences
            </button>
          </div>
        </div>
      )}
    </div>
  );
};


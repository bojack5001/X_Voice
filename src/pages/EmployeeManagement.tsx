import React, { useState } from 'react';
import { 
  Briefcase, 
  Plus, 
  Search, 
  ShieldCheck, 
  PhoneCall, 
  CheckSquare, 
  UserCheck, 
  Sparkles,
  Lock,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { useData } from '../context/DataContext';
import { Employee, UserRole } from '../types';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { DemoBadge } from '../components/common/DemoBadge';
import { ROLE_CAPABILITIES } from '../data/mockConfig';

export const EmployeeManagement: React.FC = () => {
  const { employees, addEmployee, updateEmployee } = useData();

  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Add Employee Modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newEmp, setNewEmp] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'Customer Care Executive' as UserRole,
    department: 'Driver Operations'
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const filteredEmployees = employees.filter(emp => {
    const matchesSearch = 
      emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.department.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRole = roleFilter === 'all' || emp.role === roleFilter;

    return matchesSearch && matchesRole;
  });

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'CEO':
        return <Badge variant="purple">CEO • Executive</Badge>;
      case 'HR':
        return <Badge variant="blue">HR • People</Badge>;
      case 'Team Leader':
        return <Badge variant="orange">Team Leader</Badge>;
      case 'Customer Care Executive':
        return <Badge variant="amber">CCE Support</Badge>;
    }
  };

  const handleAddEmployee = (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!newEmp.name.trim()) errs.name = 'Full name is required';
    if (!newEmp.email.trim()) errs.email = 'Work email is required';
    if (!newEmp.phone.trim()) errs.phone = 'Mobile phone is required';

    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    const defaultPermissionsMap: Record<UserRole, string[]> = {
      'CEO': ['Full Administrative Access', 'AI Prompt Control', 'Role Assignment', 'Financial Oversight'],
      'HR': ['Staff Directory', 'Attendance & Performance', 'Onboarding Compliance'],
      'Team Leader': ['Live Call Monitoring', 'Supervisor Takeover', 'Task Reassignment', 'KYC Approvals'],
      'Customer Care Executive': ['Outbound AI Call Dispatch', 'Callback Resolution', 'Driver Support Desk']
    };

    addEmployee({
      name: newEmp.name,
      email: newEmp.email,
      phone: newEmp.phone,
      role: newEmp.role,
      department: newEmp.department,
      status: 'Active',
      activeTasksCount: 0,
      callsHandled: 0,
      lastActive: 'Just added',
      joinedDate: new Date().toISOString().split('T')[0],
      permissions: defaultPermissionsMap[newEmp.role]
    });

    setIsAddModalOpen(false);
    setNewEmp({
      name: '',
      email: '',
      phone: '',
      role: 'Customer Care Executive',
      department: 'Driver Operations'
    });
    setErrors({});
  };

  const toggleStatus = (emp: Employee) => {
    const nextStatus = emp.status === 'Active' ? 'On Leave' : 'Active';
    updateEmployee(emp.id, { status: nextStatus });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight font-poppins">
              Employee Roster & Role Governance
            </h1>
            <DemoBadge label="ROLE UI SIMULATION • 4 ROLES" />
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Internal organizational roster across CEO, HR, Team Leader, and Customer Care Executive personas (Demo Environment)
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 text-xs font-bold rounded-xl shadow-brand flex items-center gap-1.5 transition active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Add Employee</span>
        </button>
      </div>

      {/* Role-Based Architectural Notice */}
      <div className="bg-amber-50 border border-amber-200/90 rounded-2xl p-4 flex items-start gap-3 text-xs text-amber-950">
        <ShieldCheck className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <strong className="block font-bold">Frontend Role Simulation Notice:</strong>
          <p className="text-slate-700 leading-relaxed">
            The role views and capabilities below demonstrate business workflows for <strong>CEO</strong>, <strong>HR</strong>, <strong>Team Leader</strong>, and <strong>Customer Care Executive</strong>. Frontend visibility alone does not enforce security boundaries; real authorization will be enforced at the API and database level via Supabase Row-Level Security (RLS) and JWT verification.
          </p>
        </div>
      </div>

      {/* Role Counts Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {(['CEO', 'HR', 'Team Leader', 'Customer Care Executive'] as UserRole[]).map(r => {
          const count = employees.filter(e => e.role === r).length;
          return (
            <div key={r} className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-card">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">{r}</span>
              <div className="text-xl font-bold text-slate-900 mt-1">{count} Staff</div>
              <span className="text-[10px] text-emerald-600 font-semibold">100% Authorized</span>
            </div>
          );
        })}
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-card flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search employee by name, email, department..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="py-1.5 px-3 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-700"
          >
            <option value="all">All Roles</option>
            <option value="CEO">CEO</option>
            <option value="HR">HR</option>
            <option value="Team Leader">Team Leader</option>
            <option value="Customer Care Executive">Customer Care Executive</option>
          </select>
        </div>
      </div>

      {/* Roster Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredEmployees.map((emp) => (
          <div 
            key={emp.id}
            className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-card hover:border-amber-400 transition space-y-4 flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 text-slate-950 font-bold flex items-center justify-center text-sm shadow-sm">
                    {emp.name.split(' ').map(n => n[0]).slice(0, 2).join('')}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">{emp.name}</h4>
                    <span className="text-[10px] text-slate-400 font-mono">{emp.id}</span>
                  </div>
                </div>

                <button
                  onClick={() => toggleStatus(emp)}
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full border transition ${
                    emp.status === 'Active'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                      : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
                  }`}
                  title="Click to toggle status"
                >
                  {emp.status}
                </button>
              </div>

              <div className="space-y-1 text-xs">
                <div>{getRoleBadge(emp.role)}</div>
                <div className="text-slate-600 font-medium">{emp.department}</div>
                <div className="text-[11px] text-slate-400 font-mono">{emp.email}</div>
                <div className="text-[11px] text-slate-400 font-mono">{emp.phone}</div>
              </div>

              {/* Workload Stats */}
              <div className="grid grid-cols-2 gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-xs text-center">
                <div>
                  <span className="text-[10px] text-slate-400 block font-semibold">Active Tasks</span>
                  <span className="font-bold text-slate-800">{emp.activeTasksCount}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-semibold">Calls Handled</span>
                  <span className="font-bold text-amber-700">{emp.callsHandled}</span>
                </div>
              </div>

              {/* Permissions List */}
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Permissions Scope
                </span>
                <div className="flex flex-wrap gap-1">
                  {emp.permissions.slice(0, 3).map((p, idx) => (
                    <span key={idx} className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">
                      {p}
                    </span>
                  ))}
                  {emp.permissions.length > 3 && (
                    <span className="text-[10px] text-amber-700 font-bold px-1">
                      +{emp.permissions.length - 3} more
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
              <span>Last Active: {emp.lastActive}</span>
              <span>Joined: {emp.joinedDate}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Add Employee Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Register Team Member"
        subtitle="Add executive, management, or customer care staff to XPOOL CRM"
        maxWidth="md"
      >
        <form onSubmit={handleAddEmployee} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Full Staff Name *</label>
            <input
              type="text"
              placeholder="e.g. Ramesh V"
              value={newEmp.name}
              onChange={(e) => setNewEmp({ ...newEmp, name: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500"
            />
            {errors.name && <p className="text-rose-600 text-[11px] mt-1">{errors.name}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Corporate Email *</label>
              <input
                type="email"
                placeholder="name@xpool.in"
                value={newEmp.email}
                onChange={(e) => setNewEmp({ ...newEmp, email: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl font-mono"
              />
              {errors.email && <p className="text-rose-600 text-[11px] mt-1">{errors.email}</p>}
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Mobile Phone *</label>
              <input
                type="text"
                placeholder="+91 98400 00000"
                value={newEmp.phone}
                onChange={(e) => setNewEmp({ ...newEmp, phone: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl font-mono"
              />
              {errors.phone && <p className="text-rose-600 text-[11px] mt-1">{errors.phone}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Enterprise Role</label>
              <select
                value={newEmp.role}
                onChange={(e) => setNewEmp({ ...newEmp, role: e.target.value as UserRole })}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl"
              >
                <option value="Customer Care Executive">Customer Care Executive (CCE)</option>
                <option value="Team Leader">Team Leader</option>
                <option value="HR">HR</option>
                <option value="CEO">CEO</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Department</label>
              <input
                type="text"
                placeholder="e.g. Tamil Telephony Desk"
                value={newEmp.department}
                onChange={(e) => setNewEmp({ ...newEmp, department: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl"
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="px-4 py-2 border border-slate-300 rounded-xl text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-bold rounded-xl shadow-brand hover:from-amber-600 hover:to-orange-600"
            >
              Save Member
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};


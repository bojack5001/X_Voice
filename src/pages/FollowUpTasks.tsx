import React, { useState } from 'react';
import { 
  CheckSquare, 
  Plus, 
  Search, 
  Filter, 
  Clock, 
  Calendar, 
  User, 
  PhoneCall, 
  CheckCircle2, 
  AlertCircle, 
  ArrowUpRight,
  Sparkles,
  ShieldAlert,
  LayoutGrid,
  List
} from 'lucide-react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { FollowUpTask, TaskPriority, TaskStatus, TaskCategory, UserRole } from '../types';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { DemoBadge } from '../components/common/DemoBadge';

export const FollowUpTasks: React.FC = () => {
  const { tasks, addTask, updateTask, employees } = useData();
  const { currentUser } = useAuth();

  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'kanban'>('list');

  // Add Task Modal
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    category: 'Callback' as TaskCategory,
    priority: 'High' as TaskPriority,
    assignedToName: employees[0]?.name || 'Demo CCE Specialist',
    assignedRole: 'Customer Care Executive' as UserRole,
    targetContactName: '',
    targetPhone: '',
    targetType: 'Driver' as 'Driver' | 'Passenger',
    dueDate: '',
    notes: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = 
      task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.targetContactName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.assignedToName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.notes.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || task.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter;
    const matchesCategory = categoryFilter === 'all' || task.category === categoryFilter;

    return matchesSearch && matchesStatus && matchesPriority && matchesCategory;
  });

  const getPriorityBadge = (priority: TaskPriority) => {
    switch (priority) {
      case 'Urgent':
        return <Badge variant="red" pulse>Urgent SLA</Badge>;
      case 'High':
        return <Badge variant="orange">High Priority</Badge>;
      case 'Medium':
        return <Badge variant="amber">Medium</Badge>;
      case 'Low':
        return <Badge variant="slate">Low</Badge>;
    }
  };

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!newTask.title.trim()) errs.title = 'Task title is required';
    if (!newTask.targetContactName.trim()) errs.contact = 'Target contact name is required';
    if (!newTask.targetPhone.trim()) errs.phone = 'Target phone number is required';

    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    const assignedEmp = employees.find(e => e.name === newTask.assignedToName);

    addTask({
      title: newTask.title,
      category: newTask.category,
      priority: newTask.priority,
      status: 'Pending',
      assignedToName: newTask.assignedToName,
      assignedRole: assignedEmp?.role || newTask.assignedRole,
      targetContactName: newTask.targetContactName,
      targetPhone: newTask.targetPhone,
      targetType: newTask.targetType,
      dueDate: newTask.dueDate || new Date(Date.now() + 24 * 3600 * 1000).toISOString().replace('T', ' ').substring(0, 16),
      createdDate: new Date().toISOString().replace('T', ' ').substring(0, 16),
      notes: newTask.notes || 'Follow-up task created manually.'
    });

    setIsAddTaskOpen(false);
    setNewTask({
      title: '',
      category: 'Callback',
      priority: 'High',
      assignedToName: employees[0]?.name || 'Demo CCE Specialist',
      assignedRole: 'Customer Care Executive',
      targetContactName: '',
      targetPhone: '',
      targetType: 'Driver',
      dueDate: '',
      notes: ''
    });
    setErrors({});
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight font-poppins">
              Follow-up Tasks
            </h1>
            <DemoBadge label="SIMULATED TASK WORKFLOW" />
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Coordinate manual driver callbacks, document verification reviews, and human escalation resolutions
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* View Mode Toggle */}
          <div className="bg-white border border-slate-200 rounded-xl p-1 flex items-center shadow-sm">
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                viewMode === 'list' 
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-sm' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="List View"
            >
              <List className="w-3.5 h-3.5" />
              <span>List</span>
            </button>
            <button
              onClick={() => setViewMode('kanban')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                viewMode === 'kanban' 
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-sm' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Kanban Board View"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Kanban</span>
            </button>
          </div>

          <button
            onClick={() => setIsAddTaskOpen(true)}
            className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 text-xs font-bold rounded-xl shadow-brand flex items-center gap-1.5 transition active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Create Task</span>
          </button>
        </div>
      </div>

      {/* Task Summary Badges */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center justify-between text-xs">
          <div>
            <span className="font-bold text-amber-900 block text-sm">
              {tasks.filter(t => t.status === 'Pending').length} Pending Tasks
            </span>
            <span className="text-amber-700 text-[11px]">Awaiting employee action</span>
          </div>
          <Clock className="w-6 h-6 text-amber-600" />
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-center justify-between text-xs">
          <div>
            <span className="font-bold text-blue-900 block text-sm">
              {tasks.filter(t => t.status === 'In Progress').length} In Progress
            </span>
            <span className="text-blue-700 text-[11px]">Currently being worked on</span>
          </div>
          <ArrowUpRight className="w-6 h-6 text-blue-600" />
        </div>

        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center justify-between text-xs">
          <div>
            <span className="font-bold text-emerald-900 block text-sm">
              {tasks.filter(t => t.status === 'Completed').length} Completed
            </span>
            <span className="text-emerald-700 text-[11px]">SLA successfully closed</span>
          </div>
          <CheckCircle2 className="w-6 h-6 text-emerald-600" />
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-card space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search tasks, contacts, assignee..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full py-2 px-3 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              <option value="all">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
            </select>
          </div>

          <div>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="w-full py-2 px-3 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              <option value="all">All Priorities</option>
              <option value="Urgent">Urgent SLA</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>

          <div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full py-2 px-3 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              <option value="all">All Categories</option>
              <option value="Callback">Driver Callback</option>
              <option value="Doc Review">Document Review</option>
              <option value="Human Escalation">Human Escalation</option>
              <option value="Compliance Check">Compliance Check</option>
              <option value="VIP Support">VIP Support</option>
            </select>
          </div>
        </div>
      </div>

      {/* Task List or Kanban Board */}
      {viewMode === 'kanban' ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {(['Pending', 'In Progress', 'Completed'] as TaskStatus[]).map(columnStatus => {
            const columnTasks = filteredTasks.filter(t => t.status === columnStatus);
            const columnHeaderStyles = {
              'Pending': 'bg-amber-50 text-amber-900 border-amber-200',
              'In Progress': 'bg-blue-50 text-blue-900 border-blue-200',
              'Completed': 'bg-emerald-50 text-emerald-900 border-emerald-200'
            };

            return (
              <div key={columnStatus} className="bg-slate-50/70 border border-slate-200 rounded-2xl p-4 flex flex-col space-y-3">
                {/* Column Header */}
                <div className={`p-2.5 rounded-xl border flex items-center justify-between font-bold text-xs ${columnHeaderStyles[columnStatus]}`}>
                  <span>{columnStatus} Tasks</span>
                  <span className="px-2 py-0.5 rounded-full bg-white text-slate-900 text-[10px] font-mono shadow-sm">
                    {columnTasks.length}
                  </span>
                </div>

                {/* Task Cards */}
                <div className="space-y-3 flex-1 overflow-y-auto max-h-[600px] pr-1">
                  {columnTasks.length === 0 ? (
                    <div className="p-8 text-center text-slate-400 text-xs italic bg-white rounded-xl border border-dashed border-slate-200">
                      No tasks in {columnStatus}
                    </div>
                  ) : (
                    columnTasks.map(task => (
                      <div 
                        key={task.id} 
                        className="bg-white rounded-xl border border-slate-200/90 p-3.5 shadow-card hover:border-amber-400 transition space-y-2.5 text-xs"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <span className="font-bold text-slate-900 leading-snug line-clamp-2">
                            {task.title}
                          </span>
                          <span className="font-mono text-[10px] text-slate-400">
                            {task.id}
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5 flex-wrap">
                          {getPriorityBadge(task.priority)}
                          <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">
                            {task.category}
                          </span>
                        </div>

                        <div className="text-[11px] text-slate-600 space-y-0.5 bg-slate-50 p-2 rounded-lg border border-slate-100">
                          <div><strong>Target:</strong> {task.targetContactName}</div>
                          <div className="font-mono text-slate-500">{task.targetPhone}</div>
                          <div className="text-amber-800 font-medium">Assigned: {task.assignedToName}</div>
                          <div className="text-slate-400 text-[10px]">Due: {task.dueDate}</div>
                        </div>

                        {/* Kanban Actions */}
                        <div className="pt-1 flex items-center justify-between gap-2 border-t border-slate-100 text-[11px]">
                          {columnStatus === 'Pending' && (
                            <button
                              onClick={() => updateTask(task.id, { status: 'In Progress' })}
                              className="w-full py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold rounded-lg text-center transition"
                            >
                              Start Working →
                            </button>
                          )}
                          {columnStatus === 'In Progress' && (
                            <div className="flex items-center gap-1.5 w-full">
                              <button
                                onClick={() => updateTask(task.id, { status: 'Pending' })}
                                className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-[10px]"
                              >
                                ← Back
                              </button>
                              <button
                                onClick={() => updateTask(task.id, { status: 'Completed' })}
                                className="flex-1 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-center transition"
                              >
                                Complete ✓
                              </button>
                            </div>
                          )}
                          {columnStatus === 'Completed' && (
                            <button
                              onClick={() => updateTask(task.id, { status: 'In Progress' })}
                              className="w-full py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg text-center transition"
                            >
                              Reopen Task
                            </button>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
      /* Task List */
      <div className="space-y-3">
        {filteredTasks.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200/90 p-12 text-center text-slate-400 text-xs">
            No tasks match your selected criteria.
          </div>
        ) : (
          filteredTasks.map((task) => (
            <div
              key={task.id}
              className={`bg-white rounded-2xl border p-4 shadow-card hover:border-amber-400 transition flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs ${
                task.status === 'Completed' ? 'opacity-70 bg-slate-50/50 border-slate-200' : 'border-slate-200/90'
              }`}
            >
              <div className="space-y-1.5 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-bold text-slate-900 text-sm">{task.title}</span>
                  <span className="font-mono text-[10px] text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                    {task.id}
                  </span>
                  {getPriorityBadge(task.priority)}
                  <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-[10px] font-semibold">
                    {task.category}
                  </span>
                </div>

                <div className="flex items-center gap-3 text-slate-500 text-[11px] flex-wrap">
                  <span className="flex items-center gap-1 text-slate-700 font-semibold">
                    <User className="w-3 h-3 text-amber-600" />
                    Target: {task.targetContactName} ({task.targetPhone})
                  </span>
                  <span>•</span>
                  <span>Assigned to: <strong>{task.assignedToName}</strong> ({task.assignedRole})</span>
                  <span>•</span>
                  <span className="flex items-center gap-1 font-mono text-amber-800">
                    <Calendar className="w-3 h-3" />
                    Due: {task.dueDate}
                  </span>
                </div>

                <p className="text-[11px] text-slate-600 bg-slate-50 p-2 rounded-xl border border-slate-100 max-w-3xl">
                  {task.notes}
                </p>
              </div>

              {/* Status Update Control */}
              <div className="flex items-center gap-2">
                {task.status !== 'Completed' ? (
                  <>
                    {task.status === 'Pending' && (
                      <button
                        onClick={() => updateTask(task.id, { status: 'In Progress' })}
                        className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-xl font-semibold text-xs transition"
                      >
                        Start Task
                      </button>
                    )}
                    <button
                      onClick={() => updateTask(task.id, { status: 'Completed' })}
                      className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-sm transition"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Mark Done</span>
                    </button>
                  </>
                ) : (
                  <span className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-xl font-bold text-xs flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Completed
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>
      )}

      {/* Add Task Modal */}
      <Modal
        isOpen={isAddTaskOpen}
        onClose={() => setIsAddTaskOpen(false)}
        title="Create Team Follow-up Task"
        subtitle="Schedule a driver callback or assign document review"
        maxWidth="lg"
      >
        <form onSubmit={handleCreateTask} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Task Title *</label>
            <input
              type="text"
              placeholder="e.g. Call back Muruganandham P regarding RC upload guidance"
              value={newTask.title}
              onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500"
            />
            {errors.title && <p className="text-rose-600 text-[11px] mt-1">{errors.title}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Category</label>
              <select
                value={newTask.category}
                onChange={(e) => setNewTask({ ...newTask, category: e.target.value as TaskCategory })}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl"
              >
                <option value="Callback">Callback</option>
                <option value="Doc Review">Doc Review</option>
                <option value="Human Escalation">Human Escalation</option>
                <option value="Compliance Check">Compliance Check</option>
                <option value="VIP Support">VIP Support</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Priority SLA</label>
              <select
                value={newTask.priority}
                onChange={(e) => setNewTask({ ...newTask, priority: e.target.value as TaskPriority })}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl"
              >
                <option value="Urgent">Urgent SLA</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Target Name *</label>
              <input
                type="text"
                placeholder="Target person name"
                value={newTask.targetContactName}
                onChange={(e) => setNewTask({ ...newTask, targetContactName: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl"
              />
              {errors.contact && <p className="text-rose-600 text-[11px] mt-1">{errors.contact}</p>}
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Target Phone *</label>
              <input
                type="text"
                placeholder="+91 98400 00000"
                value={newTask.targetPhone}
                onChange={(e) => setNewTask({ ...newTask, targetPhone: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl font-mono"
              />
              {errors.phone && <p className="text-rose-600 text-[11px] mt-1">{errors.phone}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Assign to Team Member</label>
              <select
                value={newTask.assignedToName}
                onChange={(e) => {
                  const emp = employees.find(em => em.name === e.target.value);
                  setNewTask({ 
                    ...newTask, 
                    assignedToName: e.target.value,
                    assignedRole: emp?.role || newTask.assignedRole
                  });
                }}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl"
              >
                {employees.map(emp => (
                  <option key={emp.id} value={emp.name}>
                    {emp.name} ({emp.role})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Due Date & Time</label>
              <input
                type="text"
                placeholder="2026-11-10 18:00"
                value={newTask.dueDate}
                onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Detailed Operational Notes</label>
            <textarea
              rows={2}
              placeholder="Instructions for the assigned team member..."
              value={newTask.notes}
              onChange={(e) => setNewTask({ ...newTask, notes: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsAddTaskOpen(false)}
              className="px-4 py-2 border border-slate-300 rounded-xl text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-bold rounded-xl shadow-brand hover:from-amber-600 hover:to-orange-600"
            >
              Assign Task
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};


import { Employee } from '../types';

export const INITIAL_EMPLOYEES: Employee[] = [
  {
    id: 'EMP-001',
    name: 'Demo CEO (Executive Leadership)',
    email: 'ceo.demo@xpool.test',
    phone: '+91 98000 00901',
    role: 'CEO',
    department: 'Executive Leadership',
    status: 'Active',
    activeTasksCount: 2,
    callsHandled: 42,
    lastActive: 'Just now',
    joinedDate: '2025-01-01',
    permissions: [
      'Full Administrative Access (Simulation)',
      'System Configuration',
      'AI Prompt Management',
      'Financial & Conversion Overview',
      'Role Switcher & Audit Logs',
      'Data Export'
    ]
  },
  {
    id: 'EMP-002',
    name: 'Demo HR Lead (People & Culture)',
    email: 'hr.demo@xpool.test',
    phone: '+91 98000 00902',
    role: 'HR',
    department: 'People & Culture',
    status: 'Active',
    activeTasksCount: 5,
    callsHandled: 120,
    lastActive: '12 mins ago',
    joinedDate: '2025-04-15',
    permissions: [
      'Staff Directory Management',
      'Onboarding Oversight & Verification Audit',
      'Team Performance Metrics Review',
      'Employee Roster Governance'
    ]
  },
  {
    id: 'EMP-003',
    name: 'Demo Team Leader (Tamil Nadu Ops)',
    email: 'tl.tamil.demo@xpool.test',
    phone: '+91 98000 00903',
    role: 'Team Leader',
    department: 'Driver Operations (Tamil Nadu)',
    status: 'Active',
    activeTasksCount: 8,
    callsHandled: 480,
    lastActive: '5 mins ago',
    joinedDate: '2025-06-01',
    permissions: [
      'Live Call Monitoring & Intervention',
      'Human Escalation Takeover',
      'Task Allocation & Reassignment',
      'Driver Approval & Verification Review',
      'Tamil Region Telephony Oversight'
    ]
  },
  {
    id: 'EMP-004',
    name: 'Demo Team Leader (Telangana & AP)',
    email: 'tl.telugu.demo@xpool.test',
    phone: '+91 98000 00904',
    role: 'Team Leader',
    department: 'Driver Operations (Telangana & AP)',
    status: 'Active',
    activeTasksCount: 6,
    callsHandled: 410,
    lastActive: '18 mins ago',
    joinedDate: '2025-06-15',
    permissions: [
      'Live Call Monitoring & Intervention',
      'Human Escalation Takeover',
      'Telugu Lead Pool Oversight',
      'Driver KYC Exception Review'
    ]
  },
  {
    id: 'EMP-005',
    name: 'Demo CCE Specialist (Support Desk)',
    email: 'cce.demo@xpool.test',
    phone: '+91 98000 00905',
    role: 'Customer Care Executive',
    department: 'Telephony Customer Support',
    status: 'Active',
    activeTasksCount: 14,
    callsHandled: 890,
    lastActive: 'Online',
    joinedDate: '2025-09-01',
    permissions: [
      'Manual AI Call Dispatch (Verified Consent Only)',
      'Scheduled Callback Resolution',
      'Document Review Support',
      'Driver Assistance Desk'
    ]
  }
];

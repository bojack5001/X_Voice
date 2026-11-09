import { Employee } from '../types';

export const INITIAL_EMPLOYEES: Employee[] = [
  {
    id: 'EMP-001',
    name: 'Jaganathan Sundararajan',
    email: 'jagan@xpool.in',
    phone: '+91 98400 11000',
    role: 'CEO',
    department: 'Executive Leadership',
    status: 'Active',
    activeTasksCount: 2,
    callsHandled: 42,
    lastActive: 'Just now',
    joinedDate: '2025-01-01',
    permissions: [
      'Full Administrative Access',
      'System Configuration',
      'AI Prompt Management',
      'Financial Approvals',
      'Role Assignment',
      'Data Export'
    ]
  },
  {
    id: 'EMP-002',
    name: 'Deepika Narayanan',
    email: 'deepika.n@xpool.in',
    phone: '+91 98402 77112',
    role: 'HR',
    department: 'People & Culture',
    status: 'Active',
    activeTasksCount: 5,
    callsHandled: 120,
    lastActive: '12 mins ago',
    joinedDate: '2025-04-15',
    permissions: [
      'Staff Directory Management',
      'Onboarding Oversight',
      'Performance Metrics Review',
      'Payroll & Attendance',
      'Employee Support'
    ]
  },
  {
    id: 'EMP-003',
    name: 'Dinesh Kumar Shanmugam',
    email: 'dinesh.k@xpool.in',
    phone: '+91 97890 55431',
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
      'Driver Approval & Verification',
      'Team Queue Management'
    ]
  },
  {
    id: 'EMP-004',
    name: 'Praveen Chalamalasetty',
    email: 'praveen.c@xpool.in',
    phone: '+91 96180 88209',
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
      'Telugu Lead Pool Assignment',
      'Driver KYC Approvals'
    ]
  },
  {
    id: 'EMP-005',
    name: 'Meena Sundari R',
    email: 'meena.s@xpool.in',
    phone: '+91 94441 33201',
    role: 'Customer Care Executive',
    department: 'Tamil Telephony Support',
    status: 'Active',
    activeTasksCount: 14,
    callsHandled: 890,
    lastActive: 'Online',
    joinedDate: '2025-09-01',
    permissions: [
      'Outbound Call Initiation',
      'Callback Resolution',
      'Document Review Support',
      'Driver Assistance Desk'
    ]
  },
  {
    id: 'EMP-006',
    name: 'Sravani V',
    email: 'sravani.v@xpool.in',
    phone: '+91 97001 99234',
    role: 'Customer Care Executive',
    department: 'Telugu Telephony Support',
    status: 'Active',
    activeTasksCount: 11,
    callsHandled: 780,
    lastActive: 'Online',
    joinedDate: '2025-09-10',
    permissions: [
      'Outbound Call Initiation',
      'Callback Resolution',
      'Passenger Survey Assistance'
    ]
  },
  {
    id: 'EMP-007',
    name: 'Arun George',
    email: 'arun.g@xpool.in',
    phone: '+91 98840 22198',
    role: 'Customer Care Executive',
    department: 'English & VIP Care',
    status: 'On Leave',
    activeTasksCount: 0,
    callsHandled: 640,
    lastActive: '2 days ago',
    joinedDate: '2025-08-20',
    permissions: [
      'VIP Passenger Support',
      'Corporate Account Escalations',
      'Outbound Surveys'
    ]
  }
];


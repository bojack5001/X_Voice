import { UserRole, CompanyProfile, ConsentStatus, DncStatus } from '../types';

export const DEMO_BANNER_TEXT = "DEMO ENVIRONMENT — NO REAL CUSTOMER DATA — NO REAL CALLS";

export const DEMO_STATUS_SUBTITLE = 
  "All customer records, phone numbers, telephony events, KPIs, transcripts and staff identities are simulated for workflow demonstration.";

export const TELEPHONY_DEMO_STATUS = {
  sipTrunk: 'Awaiting Integration (Simulated)',
  voiceChannels: 'Simulated Local Audio',
  telephonyCarrier: 'Not Connected',
  complianceMode: 'Demo Only',
  backendStatus: 'Awaiting Supabase / Backend Integration'
};

export const DEFAULT_COMPANY_PROFILE: CompanyProfile = {
  legalName: 'XPOOL Technology Private Limited (Demo Organization)',
  brandName: 'XPOOL AI CONNECT',
  cin: 'U72900TN2024PTC000000 (Simulated Demo CIN)',
  registeredOffice: 'Demo Facility, OMR IT Corridor, Sholinganallur, Chennai, Tamil Nadu - 600119, India',
  supportEmail: 'telephony-demo@xpool.test',
  phone: '+91 44 0000 1200',
  website: 'https://xpool.test',
  environmentNotice: 'DEMO ENVIRONMENT — NO REAL CUSTOMER DATA — NO REAL CALLS'
};

export interface RoleCapabilityMeta {
  role: UserRole;
  title: string;
  badgeColor: string;
  scopeDescription: string;
  canTriggerManualCall: boolean;
  canTakeoverCall: boolean;
  canEditPrompts: boolean;
  canManageTeam: boolean;
  canExportReports: boolean;
  capabilities: string[];
}

export const ROLE_CAPABILITIES: Record<UserRole, RoleCapabilityMeta> = {
  'CEO': {
    role: 'CEO',
    title: 'Chief Executive Officer',
    badgeColor: 'bg-purple-100 text-purple-900 border-purple-200',
    scopeDescription: 'Full executive oversight, configuration authority, and KPI evaluation.',
    canTriggerManualCall: true,
    canTakeoverCall: true,
    canEditPrompts: true,
    canManageTeam: true,
    canExportReports: true,
    capabilities: [
      'Executive KPI Dashboard & Financial Reports',
      'AI Agent Prompt & Voice Model Configuration',
      'System-Wide Audit Logs & Data Export',
      'Team & Corporate Profile Management'
    ]
  },
  'HR': {
    role: 'HR',
    title: 'People & Culture Lead',
    badgeColor: 'bg-blue-100 text-blue-900 border-blue-200',
    scopeDescription: 'Employee directory management, role assignments, and onboarding compliance.',
    canTriggerManualCall: false,
    canTakeoverCall: false,
    canEditPrompts: false,
    canManageTeam: true,
    canExportReports: true,
    capabilities: [
      'Staff Directory & Role Assignments',
      'Onboarding Oversight & Document Verification Audit',
      'CCE Performance Metrics & Training Reviews'
    ]
  },
  'Team Leader': {
    role: 'Team Leader',
    title: 'Operations Supervisor',
    badgeColor: 'bg-orange-100 text-orange-900 border-orange-200',
    scopeDescription: 'Live queue monitoring, supervisor takeover, and escalation dispute resolution.',
    canTriggerManualCall: true,
    canTakeoverCall: true,
    canEditPrompts: false,
    canManageTeam: false,
    canExportReports: true,
    capabilities: [
      'Simulated Live Call Monitoring & Supervisor Takeover',
      'Human Escalation Resolution & Task Reassignment',
      'Driver Approval & KYC Exception Handling',
      'Regional Language Pool Oversight (Tamil & Telugu)'
    ]
  },
  'Customer Care Executive': {
    role: 'Customer Care Executive',
    title: 'Support Specialist',
    badgeColor: 'bg-amber-100 text-amber-900 border-amber-200',
    scopeDescription: 'Manual outbound AI call dispatch, verified callback execution, and driver KYC support.',
    canTriggerManualCall: true,
    canTakeoverCall: false,
    canEditPrompts: false,
    canManageTeam: false,
    canExportReports: false,
    capabilities: [
      'Manual Outbound AI Call Dispatch (Verified Consent Only)',
      'Scheduled Driver & Passenger Callback Resolution',
      'WhatsApp KYC Guidance & Assistance Note Logging'
    ]
  }
};

export const CONSENT_OPTIONS: ConsentStatus[] = [
  'Consent Granted',
  'Consent Unknown',
  'Consent Revoked'
];

export const DNC_OPTIONS: DncStatus[] = [
  'Not Listed',
  'DNC Active'
];


export type DriverStatus = 
  | 'lead' 
  | 'contacted' 
  | 'docs_pending' 
  | 'verification' 
  | 'training' 
  | 'onboarded' 
  | 'rejected';

// Initial supported languages per Task 002: Tamil, Telugu, English.
// Modular configuration in src/config/languages.ts allows adding more later.
export type LanguageCode = 'Tamil' | 'English' | 'Telugu';

export type VehicleType = 'Auto' | 'Bike' | 'Hatchback' | 'Sedan' | 'SUV' | 'EV Auto';

export type ConsentStatus = 'Consent Granted' | 'Consent Unknown' | 'Consent Revoked';

export type DncStatus = 'Not Listed' | 'DNC Active';

export interface KYCDocument {
  type: 'Aadhaar' | 'Driving License' | 'RC Book' | 'Vehicle Insurance' | 'Police Verification';
  number: string;
  status: 'Verified' | 'Pending Review' | 'Missing' | 'Rejected';
  uploadedAt?: string;
  notes?: string;
}

export interface Driver {
  id: string;
  name: string;
  phone: string;
  email: string;
  city: string;
  vehicleType: VehicleType;
  vehicleNumber: string;
  status: DriverStatus;
  documents: KYCDocument[];
  preferredLanguage: LanguageCode;
  aiCallAttempts: number;
  lastCallOutcome?: string;
  lastContactedAt?: string;
  joinedDate: string;
  rating?: number;
  complianceScore: number; // 0 - 100
  notes: string;
  // Task 002 Consent & Eligibility Attributes
  consentStatus: ConsentStatus;
  dncStatus: DncStatus;
  nextEligibleContactDate: string;
}

export type PassengerStatus = 'Registered' | 'Pending Verification' | 'VIP' | 'Blocked';
export type EngagementStatus = 'Active' | 'Dormant' | 'Churn Risk' | 'High Value';

export interface Passenger {
  id: string;
  name: string;
  phone: string;
  email: string;
  preferredLanguage: LanguageCode;
  registrationStatus: PassengerStatus;
  engagementStatus: EngagementStatus;
  totalRides: number;
  completedRides: number;
  rating: number;
  walletBalance: number;
  lastRideDate: string;
  joinedDate: string;
  preferredPickupZone: string;
  notes?: string;
  // Task 002 Consent & Eligibility Attributes
  consentStatus: ConsentStatus;
  dncStatus: DncStatus;
  lastContactedAt?: string;
  callAttempts: number;
  nextEligibleContactDate: string;
}

export type CallStatus = 'queued' | 'ringing' | 'in-progress' | 'completed' | 'failed' | 'transferred';
export type CallOutcome = 
  | 'Interested' 
  | 'Callback Requested' 
  | 'Language Barrier' 
  | 'Docs Submitted' 
  | 'Not Reachable' 
  | 'Escalated to Human' 
  | 'Completed' 
  | 'Call Dropped';

export interface CallTranscriptMessage {
  speaker: 'AI Agent' | 'Customer' | 'Human Specialist';
  text: string;
  timestamp: string;
  sentiment?: 'Positive' | 'Neutral' | 'Negative';
}

export interface CallRecord {
  id: string;
  contactName: string;
  contactPhone: string;
  contactType: 'Driver' | 'Passenger';
  agentName: string;
  language: LanguageCode;
  status: CallStatus;
  startTime: string;
  durationSeconds: number;
  outcome: CallOutcome;
  sentiment: 'Positive' | 'Neutral' | 'Negative';
  transcript: CallTranscriptMessage[];
  keyNotes: string;
  actionItem: string;
  audioDuration?: string;
  escalatedTo?: string;
}

export type UserRole = 'CEO' | 'HR' | 'Team Leader' | 'Customer Care Executive';

export interface Employee {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  department: string;
  status: 'Active' | 'On Leave' | 'Inactive';
  avatar?: string;
  activeTasksCount: number;
  callsHandled: number;
  lastActive: string;
  joinedDate: string;
  permissions: string[];
}

export type TaskPriority = 'Urgent' | 'High' | 'Medium' | 'Low';
export type TaskStatus = 'Pending' | 'In Progress' | 'Completed';
export type TaskCategory = 'Callback' | 'Doc Review' | 'Human Escalation' | 'VIP Support' | 'Compliance Check';

export interface FollowUpTask {
  id: string;
  title: string;
  category: TaskCategory;
  priority: TaskPriority;
  status: TaskStatus;
  assignedToName: string;
  assignedRole: UserRole;
  targetContactName: string;
  targetPhone: string;
  targetType: 'Driver' | 'Passenger';
  dueDate: string;
  createdDate: string;
  notes: string;
}

export interface AIAgentConfig {
  id: string;
  name: string;
  purpose: string;
  targetAudience: 'Driver' | 'Passenger' | 'Both';
  supportedLanguages: LanguageCode[];
  voiceGender: 'Female' | 'Male';
  voiceStyle: string;
  speakingRate: number; // 0.8 - 1.2
  fallbackSensitivity: number; // 1 - 5
  status: 'Active' | 'Paused' | 'Training';
  greetingPrompts: Record<LanguageCode, string>;
  systemInstructions: Record<LanguageCode, string>;
  transferThresholdSilenceSeconds: number;
}

export interface LeadImportRow {
  rowId: number;
  name: string;
  phone: string;
  city: string;
  vehicleType: string;
  language: string;
  consentStatus: ConsentStatus;
  dncStatus?: DncStatus;
  status: 'valid' | 'invalid' | 'duplicate';
  errorDetails?: string;
}

export interface DashboardKPISummary {
  totalDrivers: number;
  totalPassengers: number;
  leadsImported: number;
  callsInitiated: number;
  answeredCalls: number;
  successfulOnboarding: number;
  pendingFollowups: number;
  humanEscalations: number;
}

export interface CompanyProfile {
  legalName: string;
  brandName: string;
  cin: string;
  registeredOffice: string;
  supportEmail: string;
  phone: string;
  website: string;
  environmentNotice: string;
}

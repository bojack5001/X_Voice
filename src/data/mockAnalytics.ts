// SIMULATED DEMO DATA — NO REAL COMPANY METRICS
export const CALL_TRENDS_WEEKLY = [
  { day: 'Mon', initiated: 42, answered: 36, successful: 28, escalated: 2 },
  { day: 'Tue', initiated: 48, answered: 41, successful: 32, escalated: 3 },
  { day: 'Wed', initiated: 56, answered: 49, successful: 39, escalated: 4 },
  { day: 'Thu', initiated: 51, answered: 44, successful: 35, escalated: 2 },
  { day: 'Fri', initiated: 64, answered: 55, successful: 44, escalated: 5 },
  { day: 'Sat', initiated: 39, answered: 34, successful: 26, escalated: 2 },
  { day: 'Sun', initiated: 21, answered: 18, successful: 14, escalated: 1 }
];

export const ONBOARDING_FUNNEL_DATA = [
  { stage: '1. Ingested Leads (Demo)', count: 185, fill: '#3b82f6', dropOff: '0%' },
  { stage: '2. Consent Verified', count: 153, fill: '#f59e0b', dropOff: '17.3%' },
  { stage: '3. Manual Call Placed', count: 122, fill: '#ea580c', dropOff: '20.2%' },
  { stage: '4. Documents Shared', count: 98, fill: '#8b5cf6', dropOff: '19.6%' },
  { stage: '5. KYC Verified', count: 86, fill: '#06b6d4', dropOff: '12.2%' },
  { stage: '6. Onboarding Complete', count: 79, fill: '#10b981', dropOff: '8.1%' }
];

// Languages: Tamil, Telugu, English (Hindi removed per Task 002)
export const LANGUAGE_DISTRIBUTION = [
  { name: 'Tamil', value: 55, fill: '#f59e0b' },
  { name: 'Telugu', value: 32, fill: '#ea580c' },
  { name: 'English', value: 13, fill: '#3b82f6' }
];

export const CITY_PERFORMANCE = [
  { city: 'Chennai', leads: 64, onboarded: 31, rate: '48.4%', avgDuration: '2m 14s' },
  { city: 'Hyderabad', leads: 52, onboarded: 25, rate: '48.1%', avgDuration: '2m 30s' },
  { city: 'Bengaluru', leads: 38, onboarded: 18, rate: '47.4%', avgDuration: '1m 55s' },
  { city: 'Coimbatore', leads: 18, onboarded: 9, rate: '50.0%', avgDuration: '2m 05s' },
  { city: 'Madurai', leads: 13, onboarded: 6, rate: '46.2%', avgDuration: '2m 18s' }
];

export const PASSENGER_GROWTH_DATA = [
  { month: 'Jun', total: 124, active: 89, newRiders: 14 },
  { month: 'Jul', total: 152, active: 112, newRiders: 28 },
  { month: 'Aug', total: 189, active: 138, newRiders: 37 },
  { month: 'Sep', total: 234, active: 171, newRiders: 45 },
  { month: 'Oct', total: 289, active: 215, newRiders: 55 },
  { month: 'Nov', total: 342, active: 258, newRiders: 53 }
];

export const RECENT_SYSTEM_ACTIVITIES = [
  {
    id: 'ACT-01',
    type: 'call',
    title: 'Manual AI Call Simulated',
    description: 'Tamil Onboarding AI completed simulated call with Muruganandham P (Demo Driver)',
    time: '4 mins ago',
    badge: 'Simulated Call',
    badgeColor: 'bg-amber-100 text-amber-800'
  },
  {
    id: 'ACT-02',
    type: 'upload',
    title: 'Excel Lead Batch Ingested',
    description: 'Sample XLSX ingested with column mapping & internal duplicate filtering',
    time: '18 mins ago',
    badge: 'XLSX Ingest',
    badgeColor: 'bg-blue-100 text-blue-800'
  },
  {
    id: 'ACT-03',
    type: 'kyc',
    title: 'KYC Document Verified',
    description: 'Demo Driver Ravi Teja commercial insurance marked Verified by Supervisor',
    time: '42 mins ago',
    badge: 'KYC Verified',
    badgeColor: 'bg-emerald-100 text-emerald-800'
  },
  {
    id: 'ACT-04',
    type: 'escalation',
    title: 'Escalation Task Assigned',
    description: 'Disputed fitness certificate record flagged for Team Leader review',
    time: '1 hour ago',
    badge: 'Human Escalation',
    badgeColor: 'bg-rose-100 text-rose-800'
  },
  {
    id: 'ACT-05',
    type: 'passenger',
    title: 'Passenger Feedback Logged',
    description: 'Demo commute feedback recorded for Priya Dharshini (Chennai OMR)',
    time: '2 hours ago',
    badge: 'Engagement',
    badgeColor: 'bg-purple-100 text-purple-800'
  }
];

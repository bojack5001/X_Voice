export const CALL_TRENDS_WEEKLY = [
  { day: 'Mon', initiated: 420, answered: 365, successful: 280, escalated: 14 },
  { day: 'Tue', initiated: 480, answered: 412, successful: 320, escalated: 18 },
  { day: 'Wed', initiated: 560, answered: 490, successful: 395, escalated: 22 },
  { day: 'Thu', initiated: 510, answered: 440, successful: 350, escalated: 16 },
  { day: 'Fri', initiated: 640, answered: 558, successful: 442, escalated: 25 },
  { day: 'Sat', initiated: 390, answered: 340, successful: 265, escalated: 12 },
  { day: 'Sun', initiated: 210, answered: 185, successful: 145, escalated: 8 }
];

export const ONBOARDING_FUNNEL_DATA = [
  { stage: '1. Leads Ingested', count: 1850, fill: '#3b82f6', dropOff: '0%' },
  { stage: '2. AI Call Connected', count: 1530, fill: '#f59e0b', dropOff: '17.3%' },
  { stage: '3. Expressed Interest', count: 1220, fill: '#ea580c', dropOff: '20.2%' },
  { stage: '4. Documents Submitted', count: 980, fill: '#8b5cf6', dropOff: '19.6%' },
  { stage: '5. KYC Verified', count: 860, fill: '#06b6d4', dropOff: '12.2%' },
  { stage: '6. Fully Onboarded', count: 790, fill: '#10b981', dropOff: '8.1%' }
];

export const LANGUAGE_DISTRIBUTION = [
  { name: 'Tamil', value: 48, fill: '#f59e0b' },
  { name: 'Telugu', value: 32, fill: '#ea580c' },
  { name: 'English', value: 14, fill: '#3b82f6' },
  { name: 'Hindi', value: 6, fill: '#8b5cf6' }
];

export const CITY_PERFORMANCE = [
  { city: 'Chennai', leads: 640, onboarded: 312, rate: '48.8%', avgDuration: '2m 14s' },
  { city: 'Hyderabad', leads: 520, onboarded: 245, rate: '47.1%', avgDuration: '2m 30s' },
  { city: 'Bengaluru', leads: 380, onboarded: 180, rate: '47.3%', avgDuration: '1m 55s' },
  { city: 'Coimbatore', leads: 180, onboarded: 92, rate: '51.1%', avgDuration: '2m 05s' },
  { city: 'Madurai', leads: 130, onboarded: 61, rate: '46.9%', avgDuration: '2m 18s' }
];

export const PASSENGER_GROWTH_DATA = [
  { month: 'Jun', total: 12400, active: 8900, newRiders: 1400 },
  { month: 'Jul', total: 15200, active: 11200, newRiders: 2800 },
  { month: 'Aug', total: 18900, active: 13800, newRiders: 3700 },
  { month: 'Sep', total: 23400, active: 17100, newRiders: 4500 },
  { month: 'Oct', total: 28900, active: 21500, newRiders: 5500 },
  { month: 'Nov', total: 34200, active: 25800, newRiders: 5300 }
];

export const RECENT_SYSTEM_ACTIVITIES = [
  {
    id: 'ACT-01',
    type: 'call',
    title: 'AI Call Completed',
    description: 'Tamil Onboarding Bot completed qualification with Muruganandham P (Madurai)',
    time: '4 mins ago',
    badge: 'Tamil Bot',
    badgeColor: 'bg-amber-100 text-amber-800'
  },
  {
    id: 'ACT-02',
    type: 'upload',
    title: 'Batch Leads Imported',
    description: '120 Auto driver leads uploaded from "Chennai_South_Expo_Batch_2.xlsx"',
    time: '18 mins ago',
    badge: 'Excel Ingest',
    badgeColor: 'bg-blue-100 text-blue-800'
  },
  {
    id: 'ACT-03',
    type: 'kyc',
    title: 'KYC Document Approved',
    description: 'Ravi Teja Naidu commercial insurance verified by Praveen C (Team Leader)',
    time: '42 mins ago',
    badge: 'KYC Verified',
    badgeColor: 'bg-emerald-100 text-emerald-800'
  },
  {
    id: 'ACT-04',
    type: 'escalation',
    title: 'Call Escalated to Human',
    description: 'Call with Karthikeyan S escalated to Dinesh Kumar (Disputed FC expiration)',
    time: '1 hour ago',
    badge: 'Escalation',
    badgeColor: 'bg-rose-100 text-rose-800'
  },
  {
    id: 'ACT-05',
    type: 'passenger',
    title: 'Passenger Incentive Triggered',
    description: '₹100 reactivation credit added to Ananya Sharma (Bengaluru)',
    time: '2 hours ago',
    badge: 'Retention',
    badgeColor: 'bg-purple-100 text-purple-800'
  }
];


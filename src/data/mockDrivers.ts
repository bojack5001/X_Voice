import { Driver } from '../types';

export const INITIAL_DRIVERS: Driver[] = [
  {
    id: 'DRV-1001',
    name: 'Senthil Kumar V',
    phone: '+91 98401 23456',
    email: 'senthil.kumar@gmail.com',
    city: 'Chennai',
    vehicleType: 'EV Auto',
    vehicleNumber: 'TN 09 BX 4412',
    status: 'onboarded',
    preferredLanguage: 'Tamil',
    aiCallAttempts: 2,
    lastCallOutcome: 'Completed',
    lastContactedAt: '2026-11-08 14:30',
    joinedDate: '2026-10-15',
    rating: 4.85,
    complianceScore: 98,
    documents: [
      { type: 'Aadhaar', number: 'XXXX-XXXX-4312', status: 'Verified', uploadedAt: '2026-10-15' },
      { type: 'Driving License', number: 'TN09 20180004123', status: 'Verified', uploadedAt: '2026-10-15' },
      { type: 'RC Book', number: 'TN09BX4412', status: 'Verified', uploadedAt: '2026-10-16' },
      { type: 'Vehicle Insurance', number: 'POL-ICICI-88421', status: 'Verified', uploadedAt: '2026-10-16' }
    ],
    notes: 'Experienced green fleet EV operator. Completed 100% of EV training modules on first attempt.'
  },
  {
    id: 'DRV-1002',
    name: 'Ravi Teja Naidu',
    phone: '+91 94408 87654',
    email: 'raviteja.n@yahoo.com',
    city: 'Hyderabad',
    vehicleType: 'Sedan',
    vehicleNumber: 'TS 07 EA 9921',
    status: 'verification',
    preferredLanguage: 'Telugu',
    aiCallAttempts: 3,
    lastCallOutcome: 'Docs Submitted',
    lastContactedAt: '2026-11-09 10:15',
    joinedDate: '2026-11-02',
    complianceScore: 78,
    documents: [
      { type: 'Aadhaar', number: 'XXXX-XXXX-9122', status: 'Verified', uploadedAt: '2026-11-02' },
      { type: 'Driving License', number: 'TS07 20190008871', status: 'Verified', uploadedAt: '2026-11-03' },
      { type: 'RC Book', number: 'TS07EA9921', status: 'Pending Review', uploadedAt: '2026-11-09' },
      { type: 'Vehicle Insurance', number: 'CHOLA-882190', status: 'Pending Review', uploadedAt: '2026-11-09' }
    ],
    notes: 'Commercial Dzire owner. AI Call confirmed he submitted commercial insurance copy via WhatsApp link.'
  },
  {
    id: 'DRV-1003',
    name: 'Muruganandham P',
    phone: '+91 97890 12399',
    email: 'murugan.auto@gmail.com',
    city: 'Madurai',
    vehicleType: 'Auto',
    vehicleNumber: 'TN 58 AB 2209',
    status: 'docs_pending',
    preferredLanguage: 'Tamil',
    aiCallAttempts: 4,
    lastCallOutcome: 'Callback Requested',
    lastContactedAt: '2026-11-09 11:45',
    joinedDate: '2026-11-04',
    complianceScore: 45,
    documents: [
      { type: 'Aadhaar', number: 'XXXX-XXXX-6619', status: 'Verified', uploadedAt: '2026-11-04' },
      { type: 'Driving License', number: 'TN58 20150001290', status: 'Missing' },
      { type: 'RC Book', number: 'TN58AB2209', status: 'Missing' },
      { type: 'Vehicle Insurance', number: 'PENDING', status: 'Missing' }
    ],
    notes: 'Requested callback after 6 PM due to airport trip duties. Needs assistance uploading DL photo.'
  },
  {
    id: 'DRV-1004',
    name: 'Kiran Kumar Reddy',
    phone: '+91 98860 33412',
    email: 'kiran.reddy87@gmail.com',
    city: 'Bengaluru',
    vehicleType: 'SUV',
    vehicleNumber: 'KA 03 MM 7819',
    status: 'training',
    preferredLanguage: 'English',
    aiCallAttempts: 1,
    lastCallOutcome: 'Completed',
    lastContactedAt: '2026-11-08 16:20',
    joinedDate: '2026-10-28',
    complianceScore: 92,
    documents: [
      { type: 'Aadhaar', number: 'XXXX-XXXX-1123', status: 'Verified', uploadedAt: '2026-10-28' },
      { type: 'Driving License', number: 'KA03 20160002194', status: 'Verified', uploadedAt: '2026-10-28' },
      { type: 'RC Book', number: 'KA03MM7819', status: 'Verified', uploadedAt: '2026-10-29' },
      { type: 'Vehicle Insurance', number: 'TATA-AIG-99120', status: 'Verified', uploadedAt: '2026-10-29' }
    ],
    notes: 'Ertiga fleet driver. Currently at 85% completion in safety guidelines video course.'
  },
  {
    id: 'DRV-1005',
    name: 'Annamalai Raja',
    phone: '+91 94441 55290',
    email: 'annamalai.r@gmail.com',
    city: 'Coimbatore',
    vehicleType: 'Hatchback',
    vehicleNumber: 'TN 37 CY 8801',
    status: 'lead',
    preferredLanguage: 'Tamil',
    aiCallAttempts: 0,
    lastCallOutcome: 'Not Reachable',
    lastContactedAt: '2026-11-07 09:10',
    joinedDate: '2026-11-06',
    complianceScore: 10,
    documents: [
      { type: 'Aadhaar', number: 'UNVERIFIED', status: 'Missing' },
      { type: 'Driving License', number: 'UNVERIFIED', status: 'Missing' },
      { type: 'RC Book', number: 'TN37CY8801', status: 'Missing' },
      { type: 'Vehicle Insurance', number: 'PENDING', status: 'Missing' }
    ],
    notes: 'Inbound lead from Coimbatore Auto Expo campaign. Queued for first AI welcome greeting call.'
  },
  {
    id: 'DRV-1006',
    name: 'Venkatesh Prasad',
    phone: '+91 99002 44109',
    email: 'venky.prasad90@outlook.com',
    city: 'Bengaluru',
    vehicleType: 'Bike',
    vehicleNumber: 'KA 05 JJ 1902',
    status: 'onboarded',
    preferredLanguage: 'English',
    aiCallAttempts: 2,
    lastCallOutcome: 'Completed',
    lastContactedAt: '2026-11-05 15:10',
    joinedDate: '2026-10-10',
    rating: 4.92,
    complianceScore: 100,
    documents: [
      { type: 'Aadhaar', number: 'XXXX-XXXX-9943', status: 'Verified', uploadedAt: '2026-10-10' },
      { type: 'Driving License', number: 'KA05 20170003310', status: 'Verified', uploadedAt: '2026-10-10' },
      { type: 'RC Book', number: 'KA05JJ1902', status: 'Verified', uploadedAt: '2026-10-11' },
      { type: 'Vehicle Insurance', number: 'BAJAJ-558129', status: 'Verified', uploadedAt: '2026-10-11' }
    ],
    notes: 'Top performing bike-taxi partner in South Bengaluru. Eligible for tier 1 incentives.'
  },
  {
    id: 'DRV-1007',
    name: 'Nagaraju Goud',
    phone: '+91 97011 22881',
    email: 'nagaraju.goud@gmail.com',
    city: 'Hyderabad',
    vehicleType: 'Auto',
    vehicleNumber: 'TS 09 UA 3012',
    status: 'contacted',
    preferredLanguage: 'Telugu',
    aiCallAttempts: 1,
    lastCallOutcome: 'Interested',
    lastContactedAt: '2026-11-09 12:30',
    joinedDate: '2026-11-07',
    complianceScore: 30,
    documents: [
      { type: 'Aadhaar', number: 'XXXX-XXXX-7712', status: 'Pending Review', uploadedAt: '2026-11-09' },
      { type: 'Driving License', number: 'TS09 20140004419', status: 'Missing' },
      { type: 'RC Book', number: 'TS09UA3012', status: 'Missing' },
      { type: 'Vehicle Insurance', number: 'PENDING', status: 'Missing' }
    ],
    notes: 'Expressed strong interest in the 0% commission pilot program in Secunderabad.'
  },
  {
    id: 'DRV-1008',
    name: 'Karthikeyan S',
    phone: '+91 98410 77319',
    email: 'karthi.s@gmail.com',
    city: 'Chennai',
    vehicleType: 'Sedan',
    vehicleNumber: 'TN 02 BK 5520',
    status: 'rejected',
    preferredLanguage: 'Tamil',
    aiCallAttempts: 2,
    lastCallOutcome: 'Escalated to Human',
    lastContactedAt: '2026-11-06 17:00',
    joinedDate: '2026-10-20',
    complianceScore: 15,
    documents: [
      { type: 'Aadhaar', number: 'XXXX-XXXX-5521', status: 'Verified', uploadedAt: '2026-10-20' },
      { type: 'Driving License', number: 'TN02 20120008821', status: 'Rejected', notes: 'Expired license' },
      { type: 'RC Book', number: 'TN02BK5520', status: 'Rejected', notes: 'Fitness certificate expired' },
      { type: 'Vehicle Insurance', number: 'EXP-2025', status: 'Rejected', notes: 'Expired policy' }
    ],
    notes: 'Application declined due to multiple expired statutory vehicle fitness & license records.'
  }
];


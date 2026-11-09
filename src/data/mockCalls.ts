import { CallRecord } from '../types';

export const INITIAL_CALLS: CallRecord[] = [
  {
    id: 'CALL-8801',
    contactName: 'Muruganandham P (Demo Driver)',
    contactPhone: '+91 98000 00003',
    contactType: 'Driver',
    agentName: 'XPOOL Driver Onboarder (Tamil)',
    language: 'Tamil',
    status: 'completed',
    startTime: '2026-11-09 11:43:10',
    durationSeconds: 164,
    outcome: 'Callback Requested',
    sentiment: 'Neutral',
    audioDuration: '02:44',
    keyNotes: 'Demo call: Driver driving passenger in Madurai. Explicit consent confirmed. Requested callback after 6:00 PM for RC guidance.',
    actionItem: 'Task scheduled: Callback at 18:30 IST by Tamil CCE team.',
    transcript: [
      {
        speaker: 'AI Agent',
        text: 'வணக்கம் திரு. முருகானந்தம் அவர்களே! நான் எக்ஸ்பூல் (XPOOL) சார்பாக பேசுகிறேன். நீங்கள் எங்களது ஆட்டோ ஓட்டுநர் இணைப்பில் பதிவு செய்திருந்தீர்கள். பேச இது நல்ல நேரமா?',
        timestamp: '00:04',
        sentiment: 'Neutral'
      },
      {
        speaker: 'Customer',
        text: 'சார் வணக்கம், நான் இப்ப மதுரை ஏர்போர்ட் சவாரி போய்ட்டு இருக்கேன் சார். இப்போ டிரைவிங்ல இருக்கேன்.',
        timestamp: '00:15',
        sentiment: 'Neutral'
      },
      {
        speaker: 'AI Agent',
        text: 'நிச்சயமாக சார்! பாதுகாப்பு தான் முக்கியம். உங்கள் லைசென்ஸ் மற்றும் ஆர்சி புக் பதிவேற்ற உதவ நாங்கள் எப்போது அழைக்கலாம்?',
        timestamp: '00:27',
        sentiment: 'Positive'
      },
      {
        speaker: 'Customer',
        text: 'இன்னைக்கு சாயங்காலம் ஒரு ஆறு மணிக்கு மேல கூப்பிடுங்க சார், நான் வண்டிய நிறுத்திட்டு டீடைல்ஸ் சொல்றேன்.',
        timestamp: '00:40',
        sentiment: 'Positive'
      },
      {
        speaker: 'AI Agent',
        text: 'ரொம்ப நன்றி சார்! மாலை 6:30 மணிக்கு எங்கள் குழு உங்களுக்கு அழைக்கும். பாதுகாப்பான பயணம் அமைய வாழ்த்துக்கள்!',
        timestamp: '00:58',
        sentiment: 'Positive'
      }
    ]
  },
  {
    id: 'CALL-8802',
    contactName: 'Ravi Teja Naidu (Demo Driver)',
    contactPhone: '+91 98000 00002',
    contactType: 'Driver',
    agentName: 'XPOOL Document Bot (Telugu)',
    language: 'Telugu',
    status: 'completed',
    startTime: '2026-11-09 10:12:00',
    durationSeconds: 198,
    outcome: 'Docs Submitted',
    sentiment: 'Positive',
    audioDuration: '03:18',
    keyNotes: 'Demo call: RC copy and vehicle insurance document verified over demo link during call.',
    actionItem: 'Ready for background check verification approval.',
    transcript: [
      {
        speaker: 'AI Agent',
        text: 'నమస్కారం రవి తేజ గారు! నేను ఎక్స్‌పూల్ (XPOOL) టెక్నాలజీస్ నుండి ఏఐ అసిస్టెంట్ మాట్లాడుతున్నాను. మీ డిజైర్ కారు ఆన్‌బోర్డింగ్ తనిఖీ కోసం కాల్ చేశాము.',
        timestamp: '00:05',
        sentiment: 'Neutral'
      },
      {
        speaker: 'Customer',
        text: 'హలో అండి, అవును నేను ఇన్సూరెన్స్ కాపీ వాట్సాప్‌లో అప్‌లోడ్ చేశాను, వచ్చిందా చూస్తారా?',
        timestamp: '00:18',
        sentiment: 'Positive'
      },
      {
        speaker: 'AI Agent',
        text: 'అవును రవి గారు, మీ డాక్యుమెంట్ అందింది. పరిశీలన పూర్తయిన వెంటనే మీ ఖాతా ఆక్టివేట్ అవుతుంది.',
        timestamp: '00:36',
        sentiment: 'Positive'
      }
    ]
  },
  {
    id: 'CALL-8803',
    contactName: 'Kiran Kumar Reddy (Demo Driver)',
    contactPhone: '+91 98000 00004',
    contactType: 'Driver',
    agentName: 'XPOOL Driver Onboarder (English)',
    language: 'English',
    status: 'completed',
    startTime: '2026-11-08 16:15:00',
    durationSeconds: 135,
    outcome: 'Completed',
    sentiment: 'Positive',
    audioDuration: '02:15',
    keyNotes: 'Demo call: Driver completed briefing on Bangalore airport SUV pooling guidelines.',
    actionItem: 'Enrolled in Tier-1 airport fleet group.',
    transcript: [
      {
        speaker: 'AI Agent',
        text: 'Hello Mr. Kiran! This is Maya from XPOOL Onboarding. We received your verified documents for the Ertiga SUV.',
        timestamp: '00:04',
        sentiment: 'Neutral'
      },
      {
        speaker: 'Customer',
        text: 'Hi Maya, yes! When can I start taking airport trips?',
        timestamp: '00:14',
        sentiment: 'Positive'
      },
      {
        speaker: 'AI Agent',
        text: 'Your document verification is 100% complete. You can log into the partner driver app right now.',
        timestamp: '00:26',
        sentiment: 'Positive'
      }
    ]
  },
  {
    id: 'CALL-8804',
    contactName: 'Priya Dharshini (Demo Passenger)',
    contactPhone: '+91 98000 00101',
    contactType: 'Passenger',
    agentName: 'XPOOL Passenger Engagement (Tamil)',
    language: 'Tamil',
    status: 'completed',
    startTime: '2026-11-07 11:20:00',
    durationSeconds: 140,
    outcome: 'Interested',
    sentiment: 'Positive',
    audioDuration: '02:20',
    keyNotes: 'Demo call: Regular OMR commuter gave 5-star rating for EV shuttle punctuality.',
    actionItem: 'Added to EV preferred commuter route pool.',
    transcript: [
      {
        speaker: 'AI Agent',
        text: 'வணக்கம் பிரியா அவர்களே! எக்ஸ்பூல் பயணிகள் பிரிவிலிருந்து மாயா பேசுகிறேன். எங்களது மின்சார வாகன சேவை உங்களுக்கு திருப்திகரமாக உள்ளதா?',
        timestamp: '00:04',
        sentiment: 'Positive'
      },
      {
        speaker: 'Customer',
        text: 'ரொம்ப நல்லா இருக்கு மேடம். குறிப்பா சோழிங்கநல்லூர் டூ டைடல் பார்க் ரூட்ல டைமிங் கரெக்ட்டா இருக்கு.',
        timestamp: '00:18',
        sentiment: 'Positive'
      }
    ]
  }
];

export const LIVE_CALL_SAMPLES = [
  {
    id: 'SIM-CH-101',
    contactName: 'Senthil Kumar V (Demo Driver)',
    contactPhone: '+91 98000 00001',
    contactType: 'Driver' as const,
    agentName: 'XPOOL Onboarder (Tamil)',
    language: 'Tamil' as const,
    status: 'in-progress' as const,
    durationSeconds: 84,
    sentiment: 'Positive' as const,
    currentStep: 'Simulated dialogue: Explaining weekly payout structure for Chennai zone',
    driverVehicle: 'Auto (Bajaj Compact)',
    signalStrength: 94
  },
  {
    id: 'SIM-CH-102',
    contactName: 'Ravi Teja Naidu (Demo Driver)',
    contactPhone: '+91 98000 00002',
    contactType: 'Driver' as const,
    agentName: 'XPOOL Document Bot (Telugu)',
    language: 'Telugu' as const,
    status: 'in-progress' as const,
    durationSeconds: 142,
    sentiment: 'Neutral' as const,
    currentStep: 'Simulated dialogue: Verifying Driving License validity and badge status',
    driverVehicle: 'Sedan (Maruti Dzire)',
    signalStrength: 88
  },
  {
    id: 'SIM-CH-103',
    contactName: 'Priya Dharshini (Demo Passenger)',
    contactPhone: '+91 98000 00101',
    contactType: 'Passenger' as const,
    agentName: 'XPOOL Passenger Engagement',
    language: 'Tamil' as const,
    status: 'ringing' as const,
    durationSeconds: 12,
    sentiment: 'Neutral' as const,
    currentStep: 'Simulated telephony line: Outbound ringing...',
    driverVehicle: 'Passenger Feedback',
    signalStrength: 99
  },
  {
    id: 'SIM-CH-104',
    contactName: 'Kiran Kumar Reddy (Demo Driver)',
    contactPhone: '+91 98000 00004',
    contactType: 'Driver' as const,
    agentName: 'XPOOL Onboarder (English)',
    language: 'English' as const,
    status: 'in-progress' as const,
    durationSeconds: 215,
    sentiment: 'Positive' as const,
    currentStep: 'Simulated dialogue: Explaining airport fleet safety guidelines',
    driverVehicle: 'SUV (Maruti Ertiga)',
    signalStrength: 91
  }
];

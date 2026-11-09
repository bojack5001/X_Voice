import { CallRecord } from '../types';

export const INITIAL_CALLS: CallRecord[] = [
  {
    id: 'CALL-8801',
    contactName: 'Muruganandham P',
    contactPhone: '+91 97890 12399',
    contactType: 'Driver',
    agentName: 'XPOOL Driver Onboarder (Tamil)',
    language: 'Tamil',
    status: 'completed',
    startTime: '2026-11-09 11:43:10',
    durationSeconds: 164,
    outcome: 'Callback Requested',
    sentiment: 'Neutral',
    audioDuration: '02:44',
    keyNotes: 'Driver is on road driving passenger in Madurai. Requested callback after 6:00 PM for RC upload guidance.',
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
        text: 'ரொம்ப நன்றி சார்! மாலை 6:30 மணிக்கு எங்கள் குழு உங்களுக்கு அழைக்கும். வாட்ஸ்அப் வழியாகவும் லிங்க் அனுப்பி வைக்கிறோம். பாதுகாப்பான பயணம் அமைய வாழ்த்துக்கள்!',
        timestamp: '00:58',
        sentiment: 'Positive'
      }
    ]
  },
  {
    id: 'CALL-8802',
    contactName: 'Ravi Teja Naidu',
    contactPhone: '+91 94408 87654',
    contactType: 'Driver',
    agentName: 'XPOOL Doc Verification AI (Telugu)',
    language: 'Telugu',
    status: 'completed',
    startTime: '2026-11-09 10:12:00',
    durationSeconds: 198,
    outcome: 'Docs Submitted',
    sentiment: 'Positive',
    audioDuration: '03:18',
    keyNotes: 'RC copy and vehicle insurance document verified over WhatsApp OCR portal link during call.',
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
        text: 'ధన్యవాదాలు రవి గారు. మీ చూలా ఇన్సూరెన్స్ పాలసీ మా సిస్టమ్‌లో నమోదైంది. మీ వెరిఫికేషన్ ప్రక్రియ 4 గంటల్లో పూర్తవుతుంది. మీరు మొదటి వారం 0% కమిషన్ స్కీమ్‌కి అర్హులయ్యారు!',
        timestamp: '00:36',
        sentiment: 'Positive'
      },
      {
        speaker: 'Customer',
        text: 'చాలా మంచిది అండి! డ్రైవర్ యాప్ డౌన్‌లోడ్ లింక్ కూడా పంపండి.',
        timestamp: '00:52',
        sentiment: 'Positive'
      },
      {
        speaker: 'AI Agent',
        text: 'తప్పకుండా రవి గారు, మీ మొబైల్ నంబర్‌కు ఇప్పుడే ఎస్ఎంఎస్ పంపించాము. ఎక్స్‌పూల్‌కి స్వాగతం!',
        timestamp: '01:06',
        sentiment: 'Positive'
      }
    ]
  },
  {
    id: 'CALL-8803',
    contactName: 'Ananya Sharma',
    contactPhone: '+91 99018 77621',
    contactType: 'Passenger',
    agentName: 'XPOOL Passenger Engagement Bot',
    language: 'English',
    status: 'completed',
    startTime: '2026-11-09 09:40:22',
    durationSeconds: 142,
    outcome: 'Interested',
    sentiment: 'Positive',
    audioDuration: '02:22',
    keyNotes: 'Passenger appreciated the Koramangala daily commute discount pass. Added ₹100 credit voucher to app wallet.',
    actionItem: 'Promo coupon WELCOMEBACK100 issued.',
    transcript: [
      {
        speaker: 'AI Agent',
        text: 'Good morning Ms. Ananya! This is Maya from XPOOL AI Connect. We noticed you haven\'t taken a ride from Koramangala recently, and we wanted to check how your experience was.',
        timestamp: '00:04',
        sentiment: 'Neutral'
      },
      {
        speaker: 'Customer',
        text: 'Hi Maya. Yeah, I had been working from home lately. Are there any discounts on morning office rides right now?',
        timestamp: '00:19',
        sentiment: 'Neutral'
      },
      {
        speaker: 'AI Agent',
        text: 'Absolutely! We have just credited ₹100 into your XPOOL wallet for your next two rides, and zero surge pricing is unlocked for peak hours.',
        timestamp: '00:38',
        sentiment: 'Positive'
      },
      {
        speaker: 'Customer',
        text: 'Oh that is wonderful! I will book my evening commute with XPOOL today.',
        timestamp: '00:55',
        sentiment: 'Positive'
      },
      {
        speaker: 'AI Agent',
        text: 'Delighted to have you with us again, Ananya! Have a productive day ahead.',
        timestamp: '01:08',
        sentiment: 'Positive'
      }
    ]
  },
  {
    id: 'CALL-8804',
    contactName: 'Karthikeyan S',
    contactPhone: '+91 98410 77319',
    contactType: 'Driver',
    agentName: 'XPOOL Driver Onboarder (Tamil)',
    language: 'Tamil',
    status: 'transferred',
    startTime: '2026-11-08 17:02:11',
    durationSeconds: 245,
    outcome: 'Escalated to Human',
    sentiment: 'Negative',
    audioDuration: '04:05',
    escalatedTo: 'Dinesh Kumar (Team Leader)',
    keyNotes: 'Driver disagreed with vehicle fitness rejection rule for vehicles older than 12 years. Escalated to Tamil Team Leader for manual policy explanation.',
    actionItem: 'Senior fleet supervisor review concluded: Policy maintained.',
    transcript: [
      {
        speaker: 'AI Agent',
        text: 'வணக்கம் கார்த்திகேயன் அவர்களே, உங்கள் கார் ஆர்சி மற்றும் எஃப்.சி தணிக்கை முடிவுகள் குறித்து பேசுகிறேன்.',
        timestamp: '00:06',
        sentiment: 'Neutral'
      },
      {
        speaker: 'Customer',
        text: 'சார் என் வண்டி நல்ல கண்டிஷன்ல தான் இருக்கு, ஆனா ஆப்ல ரிஜக்ட்னு வருது, ஏன் சார்?',
        timestamp: '00:20',
        sentiment: 'Negative'
      },
      {
        speaker: 'AI Agent',
        text: 'புரிகிறது கார்த்திகேயன் அவர்களே. எக்ஸ்பூல் பாதுகாப்பு விதிகளின்படி வணிக வாகன வயது வரம்பு மற்றும் தற்போதைய எஃப்.சி சான்றிதழ் அவசியம். இதில் உங்களுக்கு விளக்கம் அளிக்க எங்கள் சீனியர் மேற்பார்வையாளரிடம் இணைக்கிறேன், ஒரு நிமிடம் காத்திருக்கவும்.',
        timestamp: '00:45',
        sentiment: 'Neutral'
      },
      {
        speaker: 'Human Specialist',
        text: 'வணக்கம் கார்த்திகேயன், நான் தினேஷ், எக்ஸ்பூல் டீம் லீடர் பேசுகிறேன். உங்கள் விண்ணப்பத்தை நேரடியாக சரிபார்க்கிறேன்...',
        timestamp: '01:10',
        sentiment: 'Neutral'
      }
    ]
  },
  {
    id: 'CALL-8805',
    contactName: 'Nagaraju Goud',
    contactPhone: '+91 97011 22881',
    contactType: 'Driver',
    agentName: 'XPOOL Driver Onboarder (Telugu)',
    language: 'Telugu',
    status: 'completed',
    startTime: '2026-11-09 12:28:45',
    durationSeconds: 155,
    outcome: 'Interested',
    sentiment: 'Positive',
    audioDuration: '02:35',
    keyNotes: 'Auto driver excited about zero commission weekly payout program in Secunderabad zone.',
    actionItem: 'Sent KYC WhatsApp upload bot link.',
    transcript: [
      {
        speaker: 'AI Agent',
        text: 'నమస్కారం నాగరాజు గారు! ఎక్స్‌పూల్ ఆటో డ్రైవర్ల కోసం సికింద్రాబాద్‌లో ప్రత్యేకమైన వీక్లీ పేఅవుట్ ప్రోగ్రామ్ ప్రారంభించాము. దీని గురించి తెలుసుకోవడానికి మీకు ఆసక్తి ఉందా?',
        timestamp: '00:05',
        sentiment: 'Positive'
      },
      {
        speaker: 'Customer',
        text: 'అవునండి, రోజు ఎంత సంపాదించవచ్చు? కమిషన్ ఎంత తీసుకుంటారు?',
        timestamp: '00:19',
        sentiment: 'Neutral'
      },
      {
        speaker: 'AI Agent',
        text: 'మొదటి నెల ఎటువంటి కమిషన్ ఉండదు! ప్రయాణికులు ఇచ్చే పూర్తి ఫేర్ నేరుగా మీ బ్యాంక్ ఖాతాకు ప్రతి మంగళవారం జమ అవుతుంది.',
        timestamp: '00:35',
        sentiment: 'Positive'
      },
      {
        speaker: 'Customer',
        text: 'సరే అండి, నేను ఆధార్ కార్డు మరియు లైసెన్స్ ఫోటో వాట్సాప్‌లో పంపిస్తాను.',
        timestamp: '00:54',
        sentiment: 'Positive'
      }
    ]
  }
];

export const LIVE_CALL_SAMPLES = [
  {
    id: 'LIVE-101',
    contactName: 'Vasanth Ramanathan',
    contactPhone: '+91 94440 33812',
    contactType: 'Driver' as const,
    agentName: 'XPOOL Onboarder AI (Tamil)',
    language: 'Tamil' as const,
    status: 'in-progress' as const,
    durationSeconds: 84,
    sentiment: 'Positive' as const,
    currentStep: 'Explaining 0% commission pilot benefits for Chennai South',
    driverVehicle: 'Auto (Bajaj Compact)',
    signalStrength: 94
  },
  {
    id: 'LIVE-102',
    contactName: 'Suresh Babu K',
    contactPhone: '+91 98861 90214',
    contactType: 'Driver' as const,
    agentName: 'XPOOL Document Bot (Telugu)',
    language: 'Telugu' as const,
    status: 'in-progress' as const,
    durationSeconds: 142,
    sentiment: 'Neutral' as const,
    currentStep: 'Verifying Driving License expiry date and badge eligibility',
    driverVehicle: 'Sedan (Maruti Dzire)',
    signalStrength: 88
  },
  {
    id: 'LIVE-103',
    contactName: 'Divya Krishnan',
    contactPhone: '+91 99401 55091',
    contactType: 'Passenger' as const,
    agentName: 'XPOOL Passenger Care Bot',
    language: 'English' as const,
    status: 'ringing' as const,
    durationSeconds: 12,
    sentiment: 'Neutral' as const,
    currentStep: 'Ringing outbound line...',
    driverVehicle: 'Passenger Survey',
    signalStrength: 99
  },
  {
    id: 'LIVE-104',
    contactName: 'Ramesh Chenna',
    contactPhone: '+91 97000 44921',
    contactType: 'Driver' as const,
    agentName: 'XPOOL Onboarder AI (Telugu)',
    language: 'Telugu' as const,
    status: 'in-progress' as const,
    durationSeconds: 215,
    sentiment: 'Positive' as const,
    currentStep: 'Explaining insurance renewal discount tie-ups with partner firms',
    driverVehicle: 'EV Auto (Mahindra Treo)',
    signalStrength: 91
  }
];


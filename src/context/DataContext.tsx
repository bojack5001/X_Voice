import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  Driver, 
  Passenger, 
  CallRecord, 
  FollowUpTask, 
  Employee, 
  AIAgentConfig, 
  DashboardKPISummary,
  LanguageCode,
  LeadImportRow,
  CompanyProfile
} from '../types';
import { INITIAL_DRIVERS } from '../data/mockDrivers';
import { INITIAL_PASSENGERS } from '../data/mockPassengers';
import { INITIAL_CALLS, LIVE_CALL_SAMPLES } from '../data/mockCalls';
import { INITIAL_TASKS } from '../data/mockTasks';
import { INITIAL_EMPLOYEES } from '../data/mockEmployees';
import { INITIAL_AI_AGENTS } from '../data/mockAgents';
import { DEFAULT_COMPANY_PROFILE } from '../data/mockConfig';

interface DataContextType {
  drivers: Driver[];
  passengers: Passenger[];
  calls: CallRecord[];
  tasks: FollowUpTask[];
  employees: Employee[];
  aiAgents: AIAgentConfig[];
  liveCalls: typeof LIVE_CALL_SAMPLES;
  kpiSummary: DashboardKPISummary;
  companyProfile: CompanyProfile;
  
  // Actions
  addDriver: (driver: Omit<Driver, 'id'>) => Driver;
  updateDriver: (id: string, updates: Partial<Driver>) => void;
  deleteDriver: (id: string) => void;
  
  addPassenger: (passenger: Omit<Passenger, 'id'>) => Passenger;
  updatePassenger: (id: string, updates: Partial<Passenger>) => void;
  
  addCallRecord: (call: Omit<CallRecord, 'id'>) => CallRecord;
  
  addTask: (task: Omit<FollowUpTask, 'id'>) => FollowUpTask;
  updateTask: (id: string, updates: Partial<FollowUpTask>) => void;
  deleteTask: (id: string) => void;
  
  addEmployee: (employee: Omit<Employee, 'id'>) => Employee;
  updateEmployee: (id: string, updates: Partial<Employee>) => void;
  
  updateAgentConfig: (id: string, updates: Partial<AIAgentConfig>) => void;
  updateCompanyProfile: (updates: Partial<CompanyProfile>) => void;
  
  importLeads: (leads: LeadImportRow[]) => { addedCount: number; duplicateCount: number };
  
  triggerSimulationCall: (targetName: string, phone: string, language: LanguageCode, agentId: string) => CallRecord;
  resetToDefaults: () => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load from localStorage or defaults
  const [drivers, setDrivers] = useState<Driver[]>(() => {
    const saved = localStorage.getItem('xpool_drivers_v2');
    return saved ? JSON.parse(saved) : INITIAL_DRIVERS;
  });

  const [passengers, setPassengers] = useState<Passenger[]>(() => {
    const saved = localStorage.getItem('xpool_passengers_v2');
    return saved ? JSON.parse(saved) : INITIAL_PASSENGERS;
  });

  const [calls, setCalls] = useState<CallRecord[]>(() => {
    const saved = localStorage.getItem('xpool_calls_v2');
    return saved ? JSON.parse(saved) : INITIAL_CALLS;
  });

  const [tasks, setTasks] = useState<FollowUpTask[]>(() => {
    const saved = localStorage.getItem('xpool_tasks_v2');
    return saved ? JSON.parse(saved) : INITIAL_TASKS;
  });

  const [employees, setEmployees] = useState<Employee[]>(() => {
    const saved = localStorage.getItem('xpool_employees_v2');
    return saved ? JSON.parse(saved) : INITIAL_EMPLOYEES;
  });

  const [aiAgents, setAiAgents] = useState<AIAgentConfig[]>(() => {
    const saved = localStorage.getItem('xpool_ai_agents_v2');
    return saved ? JSON.parse(saved) : INITIAL_AI_AGENTS;
  });

  const [companyProfile, setCompanyProfile] = useState<CompanyProfile>(() => {
    const saved = localStorage.getItem('xpool_company_profile_v2');
    return saved ? JSON.parse(saved) : DEFAULT_COMPANY_PROFILE;
  });

  const [liveCalls, setLiveCalls] = useState(LIVE_CALL_SAMPLES);

  // Sync with localStorage
  useEffect(() => {
    localStorage.setItem('xpool_drivers_v2', JSON.stringify(drivers));
  }, [drivers]);

  useEffect(() => {
    localStorage.setItem('xpool_passengers_v2', JSON.stringify(passengers));
  }, [passengers]);

  useEffect(() => {
    localStorage.setItem('xpool_calls_v2', JSON.stringify(calls));
  }, [calls]);

  useEffect(() => {
    localStorage.setItem('xpool_tasks_v2', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('xpool_employees_v2', JSON.stringify(employees));
  }, [employees]);

  useEffect(() => {
    localStorage.setItem('xpool_ai_agents_v2', JSON.stringify(aiAgents));
  }, [aiAgents]);

  useEffect(() => {
    localStorage.setItem('xpool_company_profile_v2', JSON.stringify(companyProfile));
  }, [companyProfile]);

  // Real-time ticking simulation for live calls
  useEffect(() => {
    const timer = setInterval(() => {
      setLiveCalls(prev => prev.map(call => ({
        ...call,
        durationSeconds: call.status === 'in-progress' ? call.durationSeconds + 1 : call.durationSeconds
      })));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Compute live KPIs (Clearly identifying them as simulated demo metrics)
  const kpiSummary: DashboardKPISummary = {
    totalDrivers: drivers.length,
    totalPassengers: passengers.length,
    leadsImported: 185 + drivers.filter(d => d.status === 'lead').length,
    callsInitiated: calls.length + 152,
    answeredCalls: calls.filter(c => c.status === 'completed' || c.status === 'transferred').length + 124,
    successfulOnboarding: drivers.filter(d => d.status === 'onboarded').length + 78,
    pendingFollowups: tasks.filter(t => t.status !== 'Completed').length,
    humanEscalations: calls.filter(c => c.outcome === 'Escalated to Human' || c.status === 'transferred').length + 4
  };

  const addDriver = (driverData: Omit<Driver, 'id'>): Driver => {
    const newId = `DRV-${1000 + drivers.length + 1}`;
    const newDriver: Driver = { 
      ...driverData, 
      id: newId,
      consentStatus: driverData.consentStatus || 'Consent Unknown',
      dncStatus: driverData.dncStatus || 'Not Listed',
      nextEligibleContactDate: driverData.consentStatus === 'Consent Granted' ? 'Eligible Now' : 'Blocked — Awaiting Explicit Consent'
    };
    setDrivers(prev => [newDriver, ...prev]);
    return newDriver;
  };

  const updateDriver = (id: string, updates: Partial<Driver>) => {
    setDrivers(prev => prev.map(d => d.id === id ? { ...d, ...updates } : d));
  };

  const deleteDriver = (id: string) => {
    setDrivers(prev => prev.filter(d => d.id !== id));
  };

  const addPassenger = (passengerData: Omit<Passenger, 'id'>): Passenger => {
    const newId = `PSG-${5000 + passengers.length + 1}`;
    const newPassenger: Passenger = { 
      ...passengerData, 
      id: newId,
      consentStatus: passengerData.consentStatus || 'Consent Unknown',
      dncStatus: passengerData.dncStatus || 'Not Listed',
      callAttempts: 0,
      nextEligibleContactDate: passengerData.consentStatus === 'Consent Granted' ? 'Eligible Now' : 'Blocked — Awaiting Explicit Consent'
    };
    setPassengers(prev => [newPassenger, ...prev]);
    return newPassenger;
  };

  const updatePassenger = (id: string, updates: Partial<Passenger>) => {
    setPassengers(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
  };

  const addCallRecord = (callData: Omit<CallRecord, 'id'>): CallRecord => {
    const newId = `CALL-${8800 + calls.length + 1}`;
    const newCall: CallRecord = { ...callData, id: newId };
    setCalls(prev => [newCall, ...prev]);
    return newCall;
  };

  const addTask = (taskData: Omit<FollowUpTask, 'id'>): FollowUpTask => {
    const newId = `TSK-${300 + tasks.length + 1}`;
    const newTask: FollowUpTask = { ...taskData, id: newId };
    setTasks(prev => [newTask, ...prev]);
    return newTask;
  };

  const updateTask = (id: string, updates: Partial<FollowUpTask>) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
  };

  const deleteTask = (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
  };

  const addEmployee = (empData: Omit<Employee, 'id'>): Employee => {
    const newId = `EMP-00${employees.length + 1}`;
    const newEmp: Employee = { ...empData, id: newId };
    setEmployees(prev => [...prev, newEmp]);
    return newEmp;
  };

  const updateEmployee = (id: string, updates: Partial<Employee>) => {
    setEmployees(prev => prev.map(e => e.id === id ? { ...e, ...updates } : e));
  };

  const updateAgentConfig = (id: string, updates: Partial<AIAgentConfig>) => {
    setAiAgents(prev => prev.map(a => a.id === id ? { ...a, ...updates } : a));
  };

  const updateCompanyProfile = (updates: Partial<CompanyProfile>) => {
    setCompanyProfile(prev => ({ ...prev, ...updates }));
  };

  // Import Leads: XLSX ONLY, strictly NEVER starts calls automatically
  const importLeads = (leads: LeadImportRow[]) => {
    let addedCount = 0;
    let duplicateCount = 0;
    const existingPhones = new Set(drivers.map(d => d.phone.replace(/\D/g, '')));

    const newDriversToAdd: Driver[] = [];

    leads.forEach((row, idx) => {
      const cleanPhone = row.phone.replace(/\D/g, '');
      if (existingPhones.has(cleanPhone)) {
        duplicateCount++;
        return;
      }
      addedCount++;
      existingPhones.add(cleanPhone);

      const mappedLang: LanguageCode = 
        row.language === 'Telugu' ? 'Telugu' :
        row.language === 'English' ? 'English' : 'Tamil';

      newDriversToAdd.push({
        id: `DRV-${1050 + drivers.length + idx}`,
        name: row.name || 'Demo Lead Contact',
        phone: row.phone,
        email: `${row.name.toLowerCase().replace(/[^a-z0-9]/g, '.')}@demo.xpool.test`,
        city: row.city || 'Chennai',
        vehicleType: (row.vehicleType as any) || 'Auto',
        vehicleNumber: 'Pending Verification',
        status: 'lead',
        preferredLanguage: mappedLang,
        aiCallAttempts: 0,
        joinedDate: new Date().toISOString().split('T')[0],
        complianceScore: 20,
        consentStatus: row.consentStatus || 'Consent Unknown',
        dncStatus: row.dncStatus || 'Not Listed',
        nextEligibleContactDate: row.consentStatus === 'Consent Granted' ? 'Eligible Now' : 'Blocked — Awaiting Explicit Consent',
        documents: [
          { type: 'Aadhaar', number: 'Pending', status: 'Missing' },
          { type: 'Driving License', number: 'Pending', status: 'Missing' },
          { type: 'RC Book', number: 'Pending', status: 'Missing' },
          { type: 'Vehicle Insurance', number: 'Pending', status: 'Missing' }
        ],
        notes: `Imported via Lead Batch File. Target vehicle: ${row.vehicleType}. Consent: ${row.consentStatus || 'Consent Unknown'}. Manual outreach only.`
      });
    });

    if (newDriversToAdd.length > 0) {
      setDrivers(prev => [...newDriversToAdd, ...prev]);
    }

    // STRICT: Never initiate calls after Excel upload.
    return { addedCount, duplicateCount };
  };

  const triggerSimulationCall = (targetName: string, phone: string, language: LanguageCode, agentId: string): CallRecord => {
    const selectedAgent = aiAgents.find(a => a.id === agentId) || aiAgents[0];
    const newRecord: CallRecord = {
      id: `CALL-${8900 + calls.length + 1}`,
      contactName: targetName,
      contactPhone: phone,
      contactType: 'Driver',
      agentName: `${selectedAgent.name} (${language})`,
      language: language,
      status: 'completed',
      startTime: new Date().toISOString().replace('T', ' ').substring(0, 19),
      durationSeconds: 115,
      outcome: 'Interested',
      sentiment: 'Positive',
      audioDuration: '01:55',
      keyNotes: `Simulated AI call manually authorized by operator. Target confirmed interest in XPOOL partner program in ${language}. (DEMO SIMULATION)`,
      actionItem: `Manual WhatsApp KYC upload link dispatched to ${phone}. (DEMO ONLY)`,
      transcript: [
        {
          speaker: 'AI Agent',
          text: selectedAgent.greetingPrompts[language] || selectedAgent.greetingPrompts.English,
          timestamp: '00:04',
          sentiment: 'Neutral'
        },
        {
          speaker: 'Customer',
          text: language === 'Tamil' 
            ? 'வணக்கம், ஆமாம் சார் நான் புதுசா இணைய விருப்பம் உள்ளேன். என்னென்ன டாக்குமென்ட் தேவைப்படும்?'
            : language === 'Telugu'
            ? 'హలో అండి, నేను కొత్తగా చేరాలనుకుంటున్నాను. ఏ డాక్యుమెంట్లు కావాలి?'
            : 'Hello, yes I am interested in joining XPOOL. What documents do I need to prepare?',
          timestamp: '00:18',
          sentiment: 'Positive'
        },
        {
          speaker: 'AI Agent',
          text: language === 'Tamil'
            ? 'மிக்க மகிழ்ச்சி சார்! உங்கள் ஆதார் மற்றும் ஓட்டுநர் உரிமத்தின் தெளிவான புகைப்படத்தை அனுப்புங்கள்.'
            : language === 'Telugu'
            ? 'చాలా సంతోషం అండి! మీ ఆధార్ మరియు డ్రైవింగ్ లైసెన్స్ ఫోటోలను పంపించండి.'
            : 'Wonderful! Please share clear photos of your Aadhaar and driving license.',
          timestamp: '00:38',
          sentiment: 'Positive'
        }
      ]
    };

    setCalls(prev => [newRecord, ...prev]);

    // Also update driver status if matching
    setDrivers(prev => prev.map(d => {
      if (d.phone === phone || d.name === targetName) {
        return {
          ...d,
          aiCallAttempts: d.aiCallAttempts + 1,
          lastCallOutcome: 'Interested',
          lastContactedAt: 'Just now (Simulated)',
          status: d.status === 'lead' ? 'contacted' : d.status
        };
      }
      return d;
    }));

    setPassengers(prev => prev.map(p => {
      if (p.phone === phone || p.name === targetName) {
        return {
          ...p,
          callAttempts: (p.callAttempts || 0) + 1,
          lastContactedAt: 'Just now (Simulated)'
        };
      }
      return p;
    }));

    return newRecord;
  };

  const resetToDefaults = () => {
    localStorage.removeItem('xpool_drivers_v2');
    localStorage.removeItem('xpool_passengers_v2');
    localStorage.removeItem('xpool_calls_v2');
    localStorage.removeItem('xpool_tasks_v2');
    localStorage.removeItem('xpool_employees_v2');
    localStorage.removeItem('xpool_ai_agents_v2');
    localStorage.removeItem('xpool_company_profile_v2');
    setDrivers(INITIAL_DRIVERS);
    setPassengers(INITIAL_PASSENGERS);
    setCalls(INITIAL_CALLS);
    setTasks(INITIAL_TASKS);
    setEmployees(INITIAL_EMPLOYEES);
    setAiAgents(INITIAL_AI_AGENTS);
    setCompanyProfile(DEFAULT_COMPANY_PROFILE);
  };

  return (
    <DataContext.Provider value={{
      drivers,
      passengers,
      calls,
      tasks,
      employees,
      aiAgents,
      liveCalls,
      kpiSummary,
      companyProfile,
      addDriver,
      updateDriver,
      deleteDriver,
      addPassenger,
      updatePassenger,
      addCallRecord,
      addTask,
      updateTask,
      deleteTask,
      addEmployee,
      updateEmployee,
      updateAgentConfig,
      updateCompanyProfile,
      importLeads,
      triggerSimulationCall,
      resetToDefaults
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};

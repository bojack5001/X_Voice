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
  LeadImportRow
} from '../types';
import { INITIAL_DRIVERS } from '../data/mockDrivers';
import { INITIAL_PASSENGERS } from '../data/mockPassengers';
import { INITIAL_CALLS, LIVE_CALL_SAMPLES } from '../data/mockCalls';
import { INITIAL_TASKS } from '../data/mockTasks';
import { INITIAL_EMPLOYEES } from '../data/mockEmployees';
import { INITIAL_AI_AGENTS } from '../data/mockAgents';

interface DataContextType {
  drivers: Driver[];
  passengers: Passenger[];
  calls: CallRecord[];
  tasks: FollowUpTask[];
  employees: Employee[];
  aiAgents: AIAgentConfig[];
  liveCalls: typeof LIVE_CALL_SAMPLES;
  kpiSummary: DashboardKPISummary;
  
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
  
  importLeads: (leads: LeadImportRow[]) => { addedCount: number; duplicateCount: number };
  
  triggerSimulationCall: (targetName: string, phone: string, language: LanguageCode, agentId: string) => CallRecord;
  resetToDefaults: () => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load from localStorage or defaults
  const [drivers, setDrivers] = useState<Driver[]>(() => {
    const saved = localStorage.getItem('xpool_drivers');
    return saved ? JSON.parse(saved) : INITIAL_DRIVERS;
  });

  const [passengers, setPassengers] = useState<Passenger[]>(() => {
    const saved = localStorage.getItem('xpool_passengers');
    return saved ? JSON.parse(saved) : INITIAL_PASSENGERS;
  });

  const [calls, setCalls] = useState<CallRecord[]>(() => {
    const saved = localStorage.getItem('xpool_calls');
    return saved ? JSON.parse(saved) : INITIAL_CALLS;
  });

  const [tasks, setTasks] = useState<FollowUpTask[]>(() => {
    const saved = localStorage.getItem('xpool_tasks');
    return saved ? JSON.parse(saved) : INITIAL_TASKS;
  });

  const [employees, setEmployees] = useState<Employee[]>(() => {
    const saved = localStorage.getItem('xpool_employees');
    return saved ? JSON.parse(saved) : INITIAL_EMPLOYEES;
  });

  const [aiAgents, setAiAgents] = useState<AIAgentConfig[]>(() => {
    const saved = localStorage.getItem('xpool_ai_agents');
    return saved ? JSON.parse(saved) : INITIAL_AI_AGENTS;
  });

  const [liveCalls, setLiveCalls] = useState(LIVE_CALL_SAMPLES);

  // Sync with localStorage
  useEffect(() => {
    localStorage.setItem('xpool_drivers', JSON.stringify(drivers));
  }, [drivers]);

  useEffect(() => {
    localStorage.setItem('xpool_passengers', JSON.stringify(passengers));
  }, [passengers]);

  useEffect(() => {
    localStorage.setItem('xpool_calls', JSON.stringify(calls));
  }, [calls]);

  useEffect(() => {
    localStorage.setItem('xpool_tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('xpool_employees', JSON.stringify(employees));
  }, [employees]);

  useEffect(() => {
    localStorage.setItem('xpool_ai_agents', JSON.stringify(aiAgents));
  }, [aiAgents]);

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

  // Compute live KPIs
  const kpiSummary: DashboardKPISummary = {
    totalDrivers: drivers.length,
    totalPassengers: passengers.length,
    leadsImported: 1850 + drivers.filter(d => d.status === 'lead').length,
    callsInitiated: calls.length + 1520,
    answeredCalls: calls.filter(c => c.status === 'completed' || c.status === 'transferred').length + 1248,
    successfulOnboarding: drivers.filter(d => d.status === 'onboarded').length + 786,
    pendingFollowups: tasks.filter(t => t.status !== 'Completed').length,
    humanEscalations: calls.filter(c => c.outcome === 'Escalated to Human' || c.status === 'transferred').length + 14
  };

  const addDriver = (driverData: Omit<Driver, 'id'>): Driver => {
    const newId = `DRV-${1000 + drivers.length + 1}`;
    const newDriver: Driver = { ...driverData, id: newId };
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
    const newPassenger: Passenger = { ...passengerData, id: newId };
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

      newDriversToAdd.push({
        id: `DRV-${1050 + drivers.length + idx}`,
        name: row.name || 'Lead Contact',
        phone: row.phone,
        email: `${row.name.toLowerCase().replace(/\s+/g, '.')}@lead.xpool.in`,
        city: row.city || 'Chennai',
        vehicleType: (row.vehicleType as any) || 'Auto',
        vehicleNumber: 'Pending Ingest',
        status: 'lead',
        preferredLanguage: (row.language as any) || 'Tamil',
        aiCallAttempts: 0,
        joinedDate: new Date().toISOString().split('T')[0],
        complianceScore: 20,
        documents: [
          { type: 'Aadhaar', number: 'Pending', status: 'Missing' },
          { type: 'Driving License', number: 'Pending', status: 'Missing' },
          { type: 'RC Book', number: 'Pending', status: 'Missing' },
          { type: 'Vehicle Insurance', number: 'Pending', status: 'Missing' }
        ],
        notes: `Imported via Lead Batch File. Target vehicle: ${row.vehicleType}. Ready for AI outreach.`
      });
    });

    if (newDriversToAdd.length > 0) {
      setDrivers(prev => [...newDriversToAdd, ...prev]);
    }

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
      keyNotes: `Simulated AI call initiated by operator. Target confirmed interest in XPOOL onboarding program in ${language}.`,
      actionItem: `Automatic WhatsApp KYC upload link dispatched to ${phone}.`,
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
          timestamp: '00:22',
          sentiment: 'Positive'
        },
        {
          speaker: 'AI Agent',
          text: language === 'Tamil'
            ? 'மிக்க மகிழ்ச்சி சார்! உங்கள் ஆதார், ஓட்டுநர் உரிமம் மற்றும் வாகன ஆர்சி புத்தகத்தின் தெளிவான புகைப்படத்தை எங்கள் வாட்ஸ்அப் எண்ணிற்கு அனுப்புங்கள். உடனடியாக பதிவு முடிவடையும்.'
            : language === 'Telugu'
            ? 'చాలా సంతోషం అండి! మీ ఆధార్, డ్రైవింగ్ లైసెన్స్ మరియు ఆర్సీ ఫోటోలను మా అధికారిక వాట్సాప్‌కి పంపించండి.'
            : 'Wonderful! Please share clear photos of your Aadhaar, driving license, and vehicle registration book to our verified WhatsApp. We will activate your partner account promptly.',
          timestamp: '00:46',
          sentiment: 'Positive'
        },
        {
          speaker: 'Customer',
          text: language === 'Tamil' ? 'சரிங்க, இப்போதே அனுப்புகிறேன். நன்றி!' : language === 'Telugu' ? 'సరే అండి, ఇప్పుడే పంపుతాను.' : 'Great, I will upload them right away. Thank you!',
          timestamp: '01:05',
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
          lastContactedAt: 'Just now',
          status: d.status === 'lead' ? 'contacted' : d.status
        };
      }
      return d;
    }));

    return newRecord;
  };

  const resetToDefaults = () => {
    localStorage.removeItem('xpool_drivers');
    localStorage.removeItem('xpool_passengers');
    localStorage.removeItem('xpool_calls');
    localStorage.removeItem('xpool_tasks');
    localStorage.removeItem('xpool_employees');
    localStorage.removeItem('xpool_ai_agents');
    setDrivers(INITIAL_DRIVERS);
    setPassengers(INITIAL_PASSENGERS);
    setCalls(INITIAL_CALLS);
    setTasks(INITIAL_TASKS);
    setEmployees(INITIAL_EMPLOYEES);
    setAiAgents(INITIAL_AI_AGENTS);
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


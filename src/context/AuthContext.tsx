import React, { createContext, useContext, useState, useEffect } from 'react';
import { Employee, UserRole } from '../types';
import { INITIAL_EMPLOYEES } from '../data/mockEmployees';

interface AuthContextType {
  currentUser: Employee;
  setCurrentUser: (user: Employee) => void;
  switchRole: (role: UserRole) => void;
  availableRoles: UserRole[];
  allEmployees: Employee[];
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [employees] = useState<Employee[]>(INITIAL_EMPLOYEES);
  
  // Default to CEO
  const [currentUser, setCurrentUser] = useState<Employee>(() => {
    const saved = localStorage.getItem('xpool_current_user_v2');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved user', e);
      }
    }
    return INITIAL_EMPLOYEES[0];
  });

  useEffect(() => {
    localStorage.setItem('xpool_current_user_v2', JSON.stringify(currentUser));
  }, [currentUser]);

  const switchRole = (role: UserRole) => {
    const matching = employees.find(e => e.role === role);
    if (matching) {
      setCurrentUser(matching);
    }
  };

  const availableRoles: UserRole[] = ['CEO', 'HR', 'Team Leader', 'Customer Care Executive'];

  return (
    <AuthContext.Provider value={{ currentUser, setCurrentUser, switchRole, availableRoles, allEmployees: employees }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

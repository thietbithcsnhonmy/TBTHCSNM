import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { StorageService } from '../services/storageService';

interface AuthContextType {
  currentUser: User;
  users: User[];
  setCurrentUser: (user: User) => void;
  switchUserById: (userId: string) => void;
  updateCurrentUserProfile: (updates: Partial<User>) => void;
  logout: () => void;
  login: (email: string) => boolean;
  canEditEquipment: (subject?: string, room?: string) => boolean;
  canApproveBorrow: (subject?: string) => boolean;
  canManageSystem: boolean;
  isBGH: boolean;
  isStaff: boolean;
  isTeacher: boolean;
  refreshUsers: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<User[]>(() => StorageService.getUsers());
  const [currentUser, setCurrentUserState] = useState<User>(() => StorageService.getCurrentUser());

  const refreshUsers = () => {
    const list = StorageService.getUsers();
    setUsers(list);
    const active = StorageService.getCurrentUser();
    const updated = list.find(u => u.id === active.id) || list[0];
    setCurrentUserState(updated);
  };

  useEffect(() => {
    const handler = (e: any) => {
      if (e.detail?.key && (e.detail.key.includes('users') || e.detail.key.includes('current_user'))) {
        refreshUsers();
      }
    };
    window.addEventListener('nhonmy_storage_change', handler);
    return () => window.removeEventListener('nhonmy_storage_change', handler);
  }, []);

  const setCurrentUser = (user: User) => {
    StorageService.setCurrentUser(user);
    setCurrentUserState(user);
  };

  const switchUserById = (userId: string) => {
    const found = users.find(u => u.id === userId);
    if (found) {
      setCurrentUser(found);
    }
  };

  const updateCurrentUserProfile = (updates: Partial<User>) => {
    const updated = { ...currentUser, ...updates };
    StorageService.saveUser(updated);
    setCurrentUser(updated);
    refreshUsers();
  };

  const logout = () => {
    // switch to teacher or default guest
    const defaultUser = users.find(u => u.role === 'teacher') || users[0];
    setCurrentUser(defaultUser);
  };

  const login = (email: string): boolean => {
    const found = users.find(u => u.email.toLowerCase() === email.trim().toLowerCase() && u.isActive);
    if (found) {
      setCurrentUser(found);
      return true;
    }
    return false;
  };

  const canManageSystem = currentUser.role === 'admin';
  const isBGH = currentUser.role === 'bgh';
  const isStaff = currentUser.role === 'staff';
  const isTeacher = currentUser.role === 'teacher';

  const canEditEquipment = (subject?: string, room?: string): boolean => {
    if (currentUser.role === 'admin') return true;
    if (currentUser.role === 'staff') {
      if (!subject && !room) return true;
      const matchSubject = subject && currentUser.assignedSubjects?.includes(subject);
      const matchRoom = room && currentUser.assignedRooms?.includes(room);
      return !!(matchSubject || matchRoom);
    }
    return false;
  };

  const canApproveBorrow = (subject?: string): boolean => {
    if (currentUser.role === 'admin') return true;
    if (currentUser.role === 'staff') {
      if (!subject) return true;
      return currentUser.assignedSubjects?.includes(subject) || false;
    }
    return false;
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        users,
        setCurrentUser,
        switchUserById,
        updateCurrentUserProfile,
        logout,
        login,
        canEditEquipment,
        canApproveBorrow,
        canManageSystem,
        isBGH,
        isStaff,
        isTeacher,
        refreshUsers
      }}
    >
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

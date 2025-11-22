import { useState, useCallback } from 'react';
import { User, UserRole, InventoryItem } from '../types';

const INITIAL_USERS: User[] = [
  { id: 'admin-01', name: '系統管理員', role: 'admin', balance: 999999 },
  { id: 'farmer-1', name: '老王有機農場', role: 'farmer', balance: 5000, invitationCodes: ['FARM-KING-01'] },
  { id: 'cust-1', name: '愛吃菜的阿明', role: 'customer', balance: 1500, inventory: [] },
];

const generateCode = () => 'FARM-' + Math.random().toString(36).substr(2, 6).toUpperCase();

export const useAuth = (notify: (msg: string, type: any) => void) => {
  const [allUsers, setAllUsers] = useState<User[]>(INITIAL_USERS);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  const currentUser = allUsers.find(u => u.id === currentUserId) || null;

  const login = useCallback((user: User) => {
    setCurrentUserId(user.id);
    notify(`歡迎回來，${user.name}！`, 'info');
  }, [notify]);

  const logout = useCallback(() => {
    setCurrentUserId(null);
    notify('已登出系統', 'info');
  }, [notify]);

  const register = useCallback((name: string, role: UserRole, code?: string) => {
    if (role === 'admin') return notify('禁止註冊管理員', 'error');
    
    if (role === 'farmer') {
      const codeOwner = allUsers.find(u => u.role === 'farmer' && u.invitationCodes.includes(code || ''));
      if (!codeOwner) return notify('無效的邀請碼', 'error');
      
      setAllUsers(prev => prev.map(u => u.id === codeOwner.id && u.role === 'farmer' 
        ? { ...u, invitationCodes: u.invitationCodes.filter(c => c !== code) } 
        : u
      ));
    }

    const newUser: any = {
      id: Math.random().toString(36).substr(2, 9),
      name,
      role,
      balance: role === 'customer' ? 2000 : 0,
    };

    if (role === 'farmer') newUser.invitationCodes = [generateCode(), generateCode()];
    if (role === 'customer') newUser.inventory = [];

    setAllUsers(prev => [...prev, newUser as User]);
    setCurrentUserId(newUser.id);
    notify('註冊成功！', 'success');
  }, [allUsers, notify]);

  const transferMoney = useCallback((fromId: string, toId: string, amount: number) => {
    setAllUsers(prev => prev.map(u => {
      if (u.id === fromId) return { ...u, balance: u.balance - amount };
      if (u.id === toId) return { ...u, balance: u.balance + amount };
      return u;
    }));
  }, []);

  const addToInventory = useCallback((userId: string, item: InventoryItem) => {
    setAllUsers(prev => prev.map(u => {
      if (u.id === userId && u.role === 'customer') {
        return { ...u, inventory: [...u.inventory, item] };
      }
      return u;
    }));
  }, []);

  const adminTopUp = useCallback((targetId: string, amount: number) => {
    if (currentUser?.role !== 'admin') return;
    setAllUsers(prev => prev.map(u => u.id === targetId ? { ...u, balance: u.balance + amount } : u));
    notify('充值成功', 'success');
  }, [currentUser, notify]);

  const buyInvitationCode = useCallback(() => {
    if (currentUser?.role !== 'farmer') return;
    if (currentUser.balance < 3000) return notify('餘額不足', 'error');

    setAllUsers(prev => prev.map(u => u.id === currentUser.id && u.role === 'farmer' ? {
      ...u,
      balance: u.balance - 3000,
      invitationCodes: [...u.invitationCodes, generateCode()]
    } : u));
    notify('已購買新邀請碼', 'success');
  }, [currentUser, notify]);

  return { allUsers, currentUser, login, logout, register, transferMoney, addToInventory, adminTopUp, buyInvitationCode };
};
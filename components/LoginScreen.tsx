import React, { useState } from 'react';
import { User, UserRole } from '../types';
import { Button } from './ui/Button';
import { Sprout, User as UserIcon, Shield, ShoppingBag, Plus, LogIn, Wallet, Key } from 'lucide-react';

interface LoginScreenProps {
  existingUsers: User[];
  onLogin: (user: User) => void;
  onRegister: (name: string, role: UserRole, invitationCode?: string) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ existingUsers, onLogin, onRegister }) => {
  const [view, setView] = useState<'list' | 'register'>('list');
  const [newName, setNewName] = useState('');
  const [newRole, setNewRole] = useState<UserRole>('customer');
  const [invitationCode, setInvitationCode] = useState('');

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    if (newRole === 'farmer' && !invitationCode.trim()) return alert('請輸入邀請碼');
    onRegister(newName, newRole, invitationCode);
  };

  if (view === 'list') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
        <div className="bg-white w-full max-w-md p-8 rounded-2xl shadow-xl">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-100 rounded-full mb-4"><Sprout className="w-8 h-8 text-emerald-600" /></div>
            <h1 className="text-2xl font-bold text-gray-900">白澤農產市集登入</h1>
          </div>
          <div className="space-y-3 mb-6 max-h-64 overflow-y-auto pr-1">
            {existingUsers.map(user => (
              <button key={user.id} onClick={() => onLogin(user)} className="w-full flex items-center justify-between p-4 rounded-xl border border-gray-200 hover:border-emerald-400 hover:shadow-md transition-all bg-white text-left">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-full ${user.role === 'farmer' ? 'bg-emerald-100' : user.role === 'admin' ? 'bg-purple-100' : 'bg-blue-100'}`}>
                    {user.role === 'admin' ? <Shield className="w-4 h-4 text-purple-600"/> : user.role === 'farmer' ? <UserIcon className="w-4 h-4 text-emerald-600"/> : <ShoppingBag className="w-4 h-4 text-blue-600"/>}
                  </div>
                  <div>
                    <div className="font-bold text-gray-800">{user.name}</div>
                    <div className="text-xs text-gray-500 flex items-center gap-1">
                        {user.role} <span className="flex items-center gap-1 ml-2 bg-gray-100 px-1.5 rounded"><Wallet className="w-3 h-3" /> ${user.balance.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
                <LogIn className="w-5 h-5 text-gray-300" />
              </button>
            ))}
          </div>
          <Button onClick={() => setView('register')} variant="outline" fullWidth><Plus className="w-4 h-4 mr-2" />註冊新帳號</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="bg-white w-full max-w-md p-8 rounded-2xl shadow-xl">
        <h2 className="text-xl font-bold text-gray-900 mb-6 text-center">註冊新身份</h2>
        <form onSubmit={handleRegister} className="space-y-6">
          <div className="grid grid-cols-2 gap-3">
            <div onClick={() => setNewRole('farmer')} className={`flex flex-col items-center p-3 border rounded-xl cursor-pointer ${newRole === 'farmer' ? 'border-emerald-500 bg-emerald-50' : 'border-gray-200'}`}>
              <UserIcon className="w-6 h-6 mb-2 text-emerald-600" /><span className="text-xs font-medium">農夫</span>
            </div>
            <div onClick={() => setNewRole('customer')} className={`flex flex-col items-center p-3 border rounded-xl cursor-pointer ${newRole === 'customer' ? 'border-emerald-500 bg-emerald-50' : 'border-gray-200'}`}>
              <ShoppingBag className="w-6 h-6 mb-2 text-blue-600" /><span className="text-xs font-medium">顧客</span>
            </div>
          </div>
          <input type="text" required value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="名稱" className="block w-full rounded-lg border border-gray-300 px-4 py-3"/>
          {newRole === 'farmer' && <input type="text" required value={invitationCode} onChange={(e) => setInvitationCode(e.target.value)} placeholder="邀請碼" className="block w-full rounded-lg border border-gray-300 px-4 py-3"/>}
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => setView('list')} fullWidth>返回</Button>
            <Button type="submit" fullWidth>確認註冊</Button>
          </div>
        </form>
      </div>
    </div>
  );
};
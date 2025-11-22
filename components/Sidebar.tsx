import React, { useState, useMemo, useRef } from 'react';
import { Button } from './ui/Button';
import { Clock, Plus, Sprout, Wallet, Package, TrendingUp, Users, DollarSign, Share2, Copy } from 'lucide-react';
import { User } from '../types';

interface SidebarProps {
  currentUser: User;
  allUsers: User[];
  onAddProduct: (farmer: {id: string, name: string}, name: string, price: number, stock: number, imageUrl?: string) => void;
  onSimulateTime: () => void;
  onAdminTopUp: (targetUserId: string, amount: number) => void;
  onBuyInvitationCode: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentUser, allUsers, onAddProduct, onSimulateTime, onAdminTopUp, onBuyInvitationCode }) => {
  const [newName, setNewName] = useState('');
  const [newPrice, setNewPrice] = useState(50);
  const [newStock, setNewStock] = useState(1000);
  const [newImage, setNewImage] = useState<string | undefined>(undefined);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [topUpAmount, setTopUpAmount] = useState(1000);

  const isAdmin = currentUser.role === 'admin';
  const isFarmer = currentUser.role === 'farmer';
  const isCustomer = currentUser.role === 'customer';
  const customers = useMemo(() => allUsers.filter(u => u.role === 'customer'), [allUsers]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setNewImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newName && newPrice > 0 && newStock > 0) {
      onAddProduct({id: currentUser.id, name: currentUser.name}, newName, newPrice, newStock, newImage);
      setNewName(''); setNewPrice(50); setNewStock(1000); setNewImage(undefined);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 h-full flex flex-col gap-6 overflow-y-auto max-h-[calc(100vh-8rem)]">
      <div>
        <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-3"><Wallet className="text-blue-600" />我的資產</h2>
        <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
             <p className="text-sm text-blue-800 mb-1">目前餘額</p>
             <p className="text-3xl font-bold text-blue-700">${currentUser.balance.toLocaleString()}</p>
             {isFarmer && <p className="text-xs text-blue-600 mt-2 flex items-center"><TrendingUp className="w-3 h-3 mr-1" /> 收益已入帳</p>}
        </div>
        {isCustomer && currentUser.role === 'customer' && currentUser.inventory.length > 0 && (
             <div className="mt-4">
                 <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1"><Package className="w-4 h-4" /> 購買清單</h3>
                 <div className="bg-gray-50 rounded-lg border border-gray-200 divide-y divide-gray-200 max-h-32 overflow-y-auto">
                     {currentUser.inventory.slice().reverse().map((item, idx) => (
                         <div key={idx} className="p-2 flex justify-between text-xs">
                             <span className="text-gray-800 font-medium">{item.productName}</span>
                             <span className="text-gray-500">{item.amount}g</span>
                         </div>
                     ))}
                 </div>
             </div>
        )}
      </div>

      {isAdmin && (
          <div className="border-t border-gray-200 pt-6">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-4"><Users className="text-purple-600" />顧客資金管理</h2>
              <form onSubmit={(e) => {e.preventDefault(); if(selectedCustomerId) onAdminTopUp(selectedCustomerId, topUpAmount);}} className="space-y-3 bg-purple-50 p-4 rounded-lg border border-purple-100">
                  <select className="block w-full rounded-md border-gray-300 text-sm p-2" value={selectedCustomerId} onChange={(e) => setSelectedCustomerId(e.target.value)} required>
                      <option value="">-- 選擇顧客 --</option>
                      {customers.map(c => <option key={c.id} value={c.id}>{c.name} (${c.balance})</option>)}
                  </select>
                  <input type="number" min="100" step="100" required value={topUpAmount} onChange={(e) => setTopUpAmount(Number(e.target.value))} className="block w-full rounded-md border-gray-300 p-2 text-sm"/>
                  <Button type="submit" fullWidth size="sm" className="bg-purple-600 hover:bg-purple-700 text-white"><DollarSign className="w-4 h-4 mr-1" /> 確認充值</Button>
              </form>
          </div>
      )}

      {isFarmer && currentUser.role === 'farmer' && (
          <div className="border-t border-gray-200 pt-6">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-4"><Share2 className="text-orange-500" />推廣計畫</h2>
              <div className="bg-orange-50 p-4 rounded-lg border border-orange-100 mb-3">
                  <div className="flex justify-between items-center mb-2">
                      <span className="text-xs font-bold text-orange-800">可用邀請碼</span>
                      <span className="bg-orange-200 text-orange-800 text-xs px-2 py-0.5 rounded-full">{currentUser.invitationCodes.length}</span>
                  </div>
                  <div className="space-y-2">
                      {currentUser.invitationCodes.map(code => (
                          <div key={code} className="flex items-center justify-between bg-white p-2 rounded border border-orange-200">
                              <code className="text-xs font-mono font-bold text-gray-700">{code}</code>
                              <button onClick={() => {navigator.clipboard.writeText(code); alert('複製成功');}} className="text-gray-400 hover:text-orange-600"><Copy className="w-3 h-3" /></button>
                          </div>
                      ))}
                  </div>
              </div>
              {currentUser.balance >= 3000 && <Button onClick={onBuyInvitationCode} fullWidth size="sm" className="bg-orange-500 hover:bg-orange-600 text-white"><Plus className="w-4 h-4 mr-1" /> 購買邀請碼 ($3000)</Button>}
          </div>
      )}

      {(isFarmer || isAdmin) && (
      <div className="border-t border-gray-200 pt-6">
        <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-4"><Sprout className="text-emerald-600" />農夫後台</h2>
          <form onSubmit={handleSubmit} className="space-y-3">
            <input type="text" required value={newName} onChange={(e) => setNewName(e.target.value)} className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm" placeholder="產品名稱"/>
            <div className="grid grid-cols-2 gap-3">
              <input type="number" min="1" required value={newPrice} onChange={(e) => setNewPrice(Number(e.target.value))} className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm" placeholder="價格"/>
              <input type="number" min="100" step="100" required value={newStock} onChange={(e) => setNewStock(Number(e.target.value))} className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm" placeholder="庫存"/>
            </div>
            <input type="file" accept="image/*" ref={fileInputRef} onChange={handleImageUpload} className="block w-full text-xs text-gray-500"/>
            <Button type="submit" fullWidth variant="primary" size="sm"><Plus className="w-4 h-4 mr-2" />上架產品</Button>
          </form>
      </div>
      )}
      
      {isAdmin && (
        <div className="border-t border-gray-200 pt-6">
            <Button onClick={onSimulateTime} fullWidth variant="secondary" size="sm"><Clock className="w-4 h-4 mr-2" />模擬經過 30 分鐘</Button>
        </div>
      )}
    </div>
  );
};
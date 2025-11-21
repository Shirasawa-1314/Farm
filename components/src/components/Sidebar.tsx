
import React, { useState, useMemo, useRef } from 'react';
import { Button } from './ui/Button';
import { Clock, Plus, Sprout, Lock, Wallet, Package, TrendingUp, Users, DollarSign, Share2, Copy, Camera, Image as ImageIcon } from 'lucide-react';
import { User } from '../types';

interface SidebarProps {
  currentUser: User;
  allUsers: User[];
  onAddProduct: (name: string, price: number, stock: number, imageUrl?: string) => void;
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

  // 管理員充值表單狀態
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [topUpAmount, setTopUpAmount] = useState(1000);

  const canAddProduct = currentUser.role === 'farmer' || currentUser.role === 'admin';
  const canSimulateTime = currentUser.role === 'admin';
  const isAdmin = currentUser.role === 'admin';
  const isFarmer = currentUser.role === 'farmer';

  // 篩選出所有顧客
  const customers = useMemo(() => allUsers.filter(u => u.role === 'customer'), [allUsers]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newName && newPrice > 0 && newStock > 0) {
      onAddProduct(newName, newPrice, newStock, newImage);
      setNewName('');
      setNewPrice(50);
      setNewStock(1000);
      setNewImage(undefined);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleTopUpSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (selectedCustomerId && topUpAmount > 0) {
          onAdminTopUp(selectedCustomerId, topUpAmount);
      }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 h-full flex flex-col gap-6 overflow-y-auto max-h-[calc(100vh-8rem)]">
      
      {/* 資產管理區塊 */}
      <div>
        <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-3">
          <Wallet className="text-blue-600" />
          我的資產
        </h2>
        <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
             <p className="text-sm text-blue-800 mb-1">目前餘額</p>
             <p className="text-3xl font-bold text-blue-700">${currentUser.balance.toLocaleString()}</p>
             
             {currentUser.role === 'farmer' && (
                 <p className="text-xs text-blue-600 mt-2 flex items-center">
                    <TrendingUp className="w-3 h-3 mr-1" /> 銷售收益已入帳
                 </p>
             )}
             {currentUser.role === 'customer' && (
                 <p className="text-xs text-blue-600 mt-2 flex items-center">
                    <Lock className="w-3 h-3 mr-1" /> LINE 聯繫 @shirasawa1314 （含@)
                 </p>
             )}
        </div>

        {/* 顧客的背包 (簡單顯示前5項) */}
        {currentUser.role === 'customer' && currentUser.inventory.length > 0 && (
             <div className="mt-4">
                 <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1">
                    <Package className="w-4 h-4" /> 購買清單 ({currentUser.inventory.length})
                 </h3>
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

      {/* 管理員專屬：資金管理 */}
      {isAdmin && (
          <div className="border-t border-gray-200 pt-6">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-4">
                <Users className="text-purple-600" />
                顧客資金管理
              </h2>
              <form onSubmit={handleTopUpSubmit} className="space-y-3 bg-purple-50 p-4 rounded-lg border border-purple-100">
                  <div>
                      <label className="block text-xs font-medium text-purple-900 mb-1">選擇顧客</label>
                      <select 
                        className="block w-full rounded-md border-gray-300 text-sm focus:ring-purple-500 focus:border-purple-500 p-2"
                        value={selectedCustomerId}
                        onChange={(e) => setSelectedCustomerId(e.target.value)}
                        required
                      >
                          <option value="">-- 請選擇 --</option>
                          {customers.map(c => (
                              <option key={c.id} value={c.id}>
                                  {c.name} (餘額: ${c.balance})
                              </option>
                          ))}
                      </select>
                  </div>
                  <div>
                      <label className="block text-xs font-medium text-purple-900 mb-1">充值金額</label>
                      <div className="relative rounded-md shadow-sm">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                          <span className="text-gray-500 sm:text-sm">$</span>
                        </div>
                        <input
                            type="number"
                            min="100"
                            step="100"
                            required
                            value={topUpAmount}
                            onChange={(e) => setTopUpAmount(Number(e.target.value))}
                            className="block w-full rounded-md border-gray-300 pl-7 pr-3 py-2 text-sm focus:border-purple-500 focus:ring-purple-500"
                        />
                      </div>
                  </div>
                  <Button type="submit" fullWidth size="sm" className="bg-purple-600 hover:bg-purple-700 text-white">
                      <DollarSign className="w-4 h-4 mr-1" /> 確認充值
                  </Button>
              </form>
          </div>
      )}

      {/* 農夫專屬：邀請碼管理 */}
      {isFarmer && (
          <div className="border-t border-gray-200 pt-6">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-4">
                  <Share2 className="text-orange-500" />
                  推廣計畫
              </h2>
              <div className="bg-orange-50 p-4 rounded-lg border border-orange-100 mb-3">
                  <div className="flex justify-between items-center mb-2">
                      <span className="text-xs font-bold text-orange-800">可用邀請碼</span>
                      <span className="bg-orange-200 text-orange-800 text-xs px-2 py-0.5 rounded-full">
                          {currentUser.invitationCodes.length} 組
                      </span>
                  </div>
                  {currentUser.invitationCodes.length > 0 ? (
                      <div className="space-y-2">
                          {currentUser.invitationCodes.map(code => (
                              <div key={code} className="flex items-center justify-between bg-white p-2 rounded border border-orange-200">
                                  <code className="text-xs font-mono font-bold text-gray-700">{code}</code>
                                  <button 
                                    onClick={() => {
                                        navigator.clipboard.writeText(code);
                                        alert('已複製邀請碼');
                                    }}
                                    className="text-gray-400 hover:text-orange-600"
                                    title="複製"
                                  >
                                      <Copy className="w-3 h-3" />
                                  </button>
                              </div>
                          ))}
                      </div>
                  ) : (
                      <p className="text-xs text-gray-500 italic">目前無可用邀請碼</p>
                  )}
              </div>
              <Button 
                onClick={onBuyInvitationCode} 
                fullWidth 
                size="sm" 
                className="bg-orange-500 hover:bg-orange-600 text-white"
                disabled={currentUser.balance < 3000}
              >
                  <Plus className="w-4 h-4 mr-1" /> 產生邀請碼 ($3,000)
              </Button>
          </div>
      )}

      <div className="border-t border-gray-200 pt-6">
        <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-4">
          <Sprout className="text-emerald-600" />
          農夫後台
        </h2>
        
        {canAddProduct ? (
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="bg-emerald-50 p-3 rounded-lg border border-emerald-100 mb-4">
               <p className="text-xs text-emerald-800">
                 上架新產品賺取收益。
               </p>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">產品名稱</label>
              <input
                type="text"
                required
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 text-sm"
                placeholder="例如：富士蘋果"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">每100g價格</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={newPrice}
                  onChange={(e) => setNewPrice(Number(e.target.value))}
                  className="block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">庫存 (g)</label>
                <input
                  type="number"
                  min="100"
                  step="100"
                  required
                  value={newStock}
                  onChange={(e) => setNewStock(Number(e.target.value))}
                  className="block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 text-sm"
                />
              </div>
            </div>

            {/* 圖片上傳區塊 */}
            <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                   實拍照片 (僅限相機)
                </label>
                <div className="flex items-center gap-2">
                    <input
                        type="file"
                        accept="image/*"
                        capture="environment" // 強制使用後置鏡頭 (Mobile)
                        ref={fileInputRef}
                        onChange={handleImageUpload}
                        className="block w-full text-xs text-gray-500 file:mr-2 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100"
                    />
                </div>
                {newImage && (
                    <div className="mt-2 relative h-20 w-full rounded-md overflow-hidden border border-gray-200">
                        <img src={newImage} alt="Preview" className="h-full w-full object-cover" />
                        <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-[10px] px-2 py-1 text-center">
                            預覽
                        </div>
                    </div>
                )}
            </div>

            <Button type="submit" fullWidth variant="primary" size="sm">
              <Plus className="w-4 h-4 mr-2" />
              上架產品
            </Button>
          </form>
        ) : (
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 text-center">
            <Lock className="w-6 h-6 text-gray-400 mx-auto mb-1" />
            <p className="text-xs text-gray-500">
              顧客無法上架產品。
            </p>
          </div>
        )}
      </div>

      <div className="border-t border-gray-200 pt-6">
        <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-4">
          <Clock className="text-amber-500" />
          市場控制
        </h2>
        
        {canSimulateTime ? (
          <>
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-3">
              <p className="text-xs text-amber-800 leading-relaxed">
                模擬「30分鐘無人下單」。<br/>
                若高於底價，價格將下跌 1 元。
              </p>
            </div>
            <Button onClick={onSimulateTime} fullWidth variant="secondary" size="sm">
              模擬經過 30 分鐘
            </Button>
          </>
        ) : (
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 text-center">
            <Lock className="w-6 h-6 text-gray-400 mx-auto mb-1" />
            <p className="text-xs text-gray-500">
              僅管理員可操作。
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
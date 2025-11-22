
import React, { useState, useCallback, useMemo } from 'react';
import { Sidebar } from './components/Sidebar';
import { ProductCard } from './components/ProductCard';
import { MarketStats } from './components/MarketStats';
import { LoginScreen } from './components/LoginScreen';
import { Product, Notification, User, UserRole } from './types';
import { ShoppingBag, X, LogOut, User as UserIcon, Sprout } from 'lucide-react';
import { Button } from './components/ui/Button';

// 產生隨機邀請碼
const generateCode = () => {
    return 'FARM-' + Math.random().toString(36).substr(2, 6).toUpperCase();
};

// 預設使用者資料庫
const INITIAL_USERS: User[] = [
  { id: 'admin-01', name: '系統管理員', role: 'admin', balance: 999999, inventory: [], invitationCodes: [] },
  { id: 'farmer-1', name: '老王有機農場', role: 'farmer', balance: 5000, inventory: [], invitationCodes: ['FARM-KING-01', 'FARM-KING-02'] },
  { id: 'farmer-2', name: '山上的小農', role: 'farmer', balance: 2500, inventory: [], invitationCodes: ['FARM-MOUNTAIN-01', 'FARM-MOUNTAIN-02'] },
  { id: 'cust-1', name: '愛吃菜的阿明', role: 'customer', balance: 1500, inventory: [], invitationCodes: [] },
];

const INITIAL_PRODUCTS: Product[] = [
  {
    id: 1,
    farmerId: 'farmer-1',
    farmerName: '老王有機農場',
    name: '有機高麗菜',
    basePrice: 20,
    currentPrice: 50,
    stock: 5000,
    soldAcc: 0,
    lastSaleTime: new Date(),
    noSaleMinutes: 0,
    imageSeed: 101
  },
  {
    id: 2,
    farmerId: 'farmer-2',
    farmerName: '山上的小農',
    name: '巨峰葡萄',
    basePrice: 100,
    currentPrice: 200,
    stock: 3000,
    soldAcc: 0,
    lastSaleTime: new Date(),
    noSaleMinutes: 0,
    imageSeed: 202
  },
  // 增加一個競品測試用
  {
    id: 3,
    farmerId: 'farmer-2',
    farmerName: '山上的小農',
    name: '有機高麗菜', // 同名產品
    basePrice: 25,
    currentPrice: 45, // 價格略低
    stock: 2000,
    soldAcc: 0,
    lastSaleTime: new Date(),
    noSaleMinutes: 0,
    imageSeed: 303
  }
];

const App: React.FC = () => {
  const [allUsers, setAllUsers] = useState<User[]>(INITIAL_USERS);
  // 改用 ID 追蹤當前使用者，並透過 derived state 取得完整物件，確保資料同步
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Derived State: 確保 currentUser 永遠與 allUsers 同步
  const currentUser = useMemo(() => 
    allUsers.find(u => u.id === currentUserId) || null, 
  [allUsers, currentUserId]);

  const addNotification = (message: string, type: 'success' | 'error' | 'warning' | 'info') => {
    const id = Math.random().toString(36).substr(2, 9);
    setNotifications(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 4000);
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  // --- 使用者系統邏輯 ---

  const handleLogin = (user: User) => {
    setCurrentUserId(user.id);
    addNotification(`歡迎回來，${user.name}！`, 'info');
  };

  const handleRegister = (name: string, role: UserRole, invitationCode?: string) => {
      // 1. 禁止註冊管理員
      if (role === 'admin') {
          addNotification('禁止註冊管理員帳號', 'error');
          return;
      }

      // 2. 農夫註冊檢查邀請碼
      if (role === 'farmer') {
          if (!invitationCode) {
              addNotification('農夫註冊需輸入邀請碼', 'error');
              return;
          }

          // 尋找持有此邀請碼的使用者
          const codeOwner = allUsers.find(u => u.invitationCodes.includes(invitationCode));
          
          if (!codeOwner) {
              addNotification('無效的邀請碼，請確認後再試', 'error');
              return;
          }

          // 消耗掉該邀請碼
          setAllUsers(prev => prev.map(u => {
              if (u.id === codeOwner.id) {
                  return { 
                      ...u, 
                      invitationCodes: u.invitationCodes.filter(c => c !== invitationCode) 
                  };
              }
              return u;
          }));
      }

      const newUser: User = {
          id: Math.random().toString(36).substr(2, 9),
          name,
          role,
          balance: role === 'customer' ? 2000 : 0, // 新顧客送 2000 體驗金
          inventory: [],
          // 新農夫獲得 2 組免費邀請碼
          invitationCodes: role === 'farmer' ? [generateCode(), generateCode()] : []
      };

      setAllUsers(prev => [...prev, newUser]);
      setCurrentUserId(newUser.id);
      
      if (role === 'farmer') {
          addNotification('註冊成功！已獲得 2 組免費邀請碼', 'success');
      } else {
          addNotification('註冊成功！已獲得 $2000 體驗金', 'success');
      }
  };

  const handleLogout = () => {
    setCurrentUserId(null);
    addNotification('已登出系統', 'info');
  };

  // 管理員專屬充值功能
  const handleAdminTopUp = (targetUserId: string, amount: number) => {
      if (currentUser?.role !== 'admin') {
          addNotification("權限不足：僅管理員可進行充值操作", "error");
          return;
      }
      
      const targetUser = allUsers.find(u => u.id === targetUserId);
      if (!targetUser) {
          addNotification("找不到目標用戶", "error");
          return;
      }

      setAllUsers(prev => prev.map(u => {
          if (u.id === targetUserId) {
              return { ...u, balance: u.balance + amount };
          }
          return u;
      }));
      addNotification(`成功為 ${targetUser.name} 充值 $${amount}！`, 'success');
  };

  // 農夫購買邀請碼功能
  const handleBuyInvitationCode = () => {
      if (!currentUser || currentUser.role !== 'farmer') return;

      const PRICE = 3000;
      if (currentUser.balance < PRICE) {
          addNotification(`餘額不足！產生邀請碼需花費 $${PRICE}`, 'error');
          return;
      }

      const newCode = generateCode();

      setAllUsers(prev => prev.map(u => {
          if (u.id === currentUser.id) {
              return {
                  ...u,
                  balance: u.balance - PRICE,
                  invitationCodes: [...u.invitationCodes, newCode]
              };
          }
          return u;
      }));
      
      addNotification('成功產生一組新邀請碼！已扣除 $3,000', 'success');
  };

  // --- 農產市集邏輯 ---

  const handleAddProduct = (name: string, price: number, stock: number, imageUrl?: string) => {
    if (!currentUser) return;

    const newProduct: Product = {
      id: products.length > 0 ? Math.max(...products.map(p => p.id)) + 1 : 1,
      farmerId: currentUser.id,
      farmerName: currentUser.name,
      name,
      basePrice: price,
      currentPrice: price,
      stock,
      soldAcc: 0,
      lastSaleTime: new Date(),
      noSaleMinutes: 0,
      imageSeed: Math.floor(Math.random() * 1000),
      imageUrl // 儲存圖片
    };
    setProducts([...products, newProduct]);
    addNotification(`已將 ${name} 上架到市場！`, 'success');
  };

  const handleDeleteProduct = (id: number) => {
     setProducts(prev => prev.filter(p => p.id !== id));
     
     // 修正：不再刪除顧客背包中的紀錄，僅下架市場上的商品
     addNotification('產品已下架 (顧客已購買的紀錄將保留)', 'info');
  };

  const handleBuy = (productId: number, amount: number, totalCost: number) => {
    if (!currentUser) return;

    // 1. 檢查餘額
    if (currentUser.balance < totalCost) {
        addNotification("餘額不足，請聯繫管理員充值！", "error");
        return;
    }

    const product = products.find(p => p.id === productId);
    if (!product) return;

    // 2. 處理金流與庫存轉移
    setAllUsers(prevUsers => prevUsers.map(u => {
        // 扣款顧客
        if (u.id === currentUser.id) {
            return {
                ...u,
                balance: u.balance - totalCost,
                inventory: [...u.inventory, { productId, productName: product.name, amount, boughtAt: new Date() }]
            };
        }
        // 付款給農夫
        if (u.id === product.farmerId) {
            return {
                ...u,
                balance: u.balance + totalCost
            };
        }
        return u;
    }));

    // 3. 更新產品狀態 (庫存減少、價格波動)
    setProducts(prevProducts => {
      return prevProducts.map(p => {
        if (p.id !== productId) return p;

        const oldAcc = p.soldAcc;
        const newAcc = oldAcc + amount;
        
        // 價格上漲邏輯：每賣出 1000g 漲 1 元
        const increase = Math.floor(newAcc / 1000) - Math.floor(oldAcc / 1000);
        let newPrice = p.currentPrice;

        if (increase > 0) {
            newPrice += increase;
            addNotification(`📈 買氣太旺！ ${p.name} 價格上漲了 ${increase} 元`, 'warning');
        } else {
            addNotification(`購買成功！花費 $${totalCost}`, 'success');
        }

        return {
            ...p,
            stock: p.stock - amount,
            soldAcc: newAcc,
            currentPrice: newPrice,
            lastSaleTime: new Date(),
            noSaleMinutes: 0
        };
      });
    });
  };

  const handleSimulateTime = useCallback(() => {
    let decreasedCount = 0;
    
    setProducts(prevProducts => {
        return prevProducts.map(p => {
            const newNoSaleMinutes = p.noSaleMinutes + 30;
            
            if (newNoSaleMinutes >= 30) {
                if (p.currentPrice > p.basePrice) {
                    decreasedCount++;
                    return {
                        ...p,
                        currentPrice: p.currentPrice - 1,
                        noSaleMinutes: 0
                    };
                } else {
                    return { ...p, noSaleMinutes: newNoSaleMinutes };
                }
            }
            
            return { ...p, noSaleMinutes: newNoSaleMinutes };
        });
    });

    if (decreasedCount > 0) {
        addNotification(`📉 市場冷卻：${decreasedCount} 項商品已降價。`, 'info');
    } else {
        addNotification(`⏱️ 時間經過，無需降價。`, 'info');
    }
  }, []);

  // 如果沒有登入，顯示登入畫面
  if (!currentUser) {
    return (
        <LoginScreen 
            existingUsers={allUsers} 
            onLogin={handleLogin} 
            onRegister={handleRegister} 
        />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Notifications */}
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
        {notifications.map(n => (
          <div 
            key={n.id} 
            className={`
                flex items-center justify-between p-4 rounded-lg shadow-lg min-w-[300px] animate-fade-in-down
                ${n.type === 'success' ? 'bg-emerald-500 text-white' : 
                  n.type === 'error' ? 'bg-red-500 text-white' : 
                  n.type === 'warning' ? 'bg-amber-500 text-white' : 
                  'bg-blue-500 text-white'}
            `}
          >
            <span className="text-sm font-medium">{n.message}</span>
            <button onClick={() => removeNotification(n.id)} className="ml-4 hover:opacity-80">
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4 flex justify-between items-center sticky top-0 z-40">
        <div className="flex items-center gap-2">
             <div className="bg-emerald-100 p-2 rounded-lg">
                 <Sprout className="w-6 h-6 text-emerald-600" />
             </div>
             <div>
                 <h1 className="text-xl font-bold text-gray-900">白澤農產市集</h1>
                 <p className="text-xs text-gray-500">供需法則 • 新鮮直送</p>
             </div>
        </div>
        
        <div className="flex items-center gap-4">
            <div className="flex flex-col items-end mr-2">
                <span className="text-sm font-bold text-gray-800">{currentUser.name}</span>
                <span className="text-xs text-gray-500 flex items-center gap-1">
                    {currentUser.role === 'admin' ? '系統管理員' : 
                     currentUser.role === 'farmer' ? '農夫賣家' : '親愛的顧客'}
                </span>
            </div>
            <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="w-4 h-4 mr-2" /> 登出
            </Button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-6 grid grid-cols-1 lg:grid-cols-4 gap-8">
         {/* Sidebar */}
         <div className="lg:col-span-1">
            <Sidebar 
                currentUser={currentUser}
                allUsers={allUsers}
                onAddProduct={handleAddProduct}
                onSimulateTime={handleSimulateTime}
                onAdminTopUp={handleAdminTopUp}
                onBuyInvitationCode={handleBuyInvitationCode}
            />
         </div>

         {/* Product List */}
         <div className="lg:col-span-3">
             <MarketStats products={products} currentUser={currentUser} />

             <div className="flex justify-between items-center mb-4">
                 <h2 className="text-xl font-bold text-gray-900">
                     市場現況 ({products.length} 項產品)
                 </h2>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                 {products.map(product => (
                     <ProductCard 
                        key={product.id}
                        product={product}
                        currentUser={currentUser}
                        onBuy={handleBuy}
                        onDelete={handleDeleteProduct}
                     />
                 ))}
                 {products.length === 0 && (
                     <div className="col-span-full py-12 text-center text-gray-500 bg-white rounded-xl border border-dashed border-gray-300">
                         <p className="mb-2">市場目前空空如也</p>
                         <p className="text-sm">等待農夫上架新鮮產品...</p>
                     </div>
                 )}
             </div>
         </div>
      </div>
    </div>
  );
};

export default App;

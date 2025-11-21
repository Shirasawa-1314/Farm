
import React, { useState, useCallback, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { ProductCard } from './components/ProductCard';
import { MarketStats } from './components/MarketStats';
import { LoginScreen } from './components/LoginScreen';
import { Product, Notification, User, UserRole } from './types';
import { ShoppingBag, X, LogOut, User as UserIcon, Sprout } from 'lucide-react';

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
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // 當全域使用者列表變更，且目前有登入者，需同步更新登入者的狀態 (例如餘額變動)
  useEffect(() => {
    if (currentUser) {
        const updatedUser = allUsers.find(u => u.id === currentUser.id);
        if (updatedUser) {
            setCurrentUser(updatedUser);
        }
    }
  }, [allUsers]);

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
    setCurrentUser(user);
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
      setCurrentUser(newUser);
      
      if (role === 'farmer') {
          addNotification('註冊成功！已獲得 2 組免費邀請碼', 'success');
      } else {
          addNotification('註冊成功！已獲得 $2000 體驗金', 'success');
      }
  };

  const handleLogout = () => {
    setCurrentUser(null);
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
     addNotification('產品已下架刪除', 'info');
  };

  const handleBuy = (productId: number, amount: number, totalCost: number) => {
    if (!currentUser) return;

    // 1. 檢查餘額
    if (currentUser.balance < totalCost) {
        addNotification("餘額不足，請聯繫 LINE @shirasawa1314 （含@) 充值！", "error");
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
                flex items-center justify-between p-4 rounded-lg shadow-lg min-w-[300px] animate-fade-in-down border-l-4
                ${n.type === 'success' ? 'bg-white border-emerald-500 text-gray-800' : ''}
                ${n.type === 'error' ? 'bg-white border-red-500 text-gray-800' : ''}
                ${n.type === 'warning' ? 'bg-white border-amber-500 text-gray-800' : ''}
                ${n.type === 'info' ? 'bg-white border-blue-500 text-gray-800' : ''}
            `}
          >
            <span className="text-sm font-medium">{n.message}</span>
            <button onClick={() => removeNotification(n.id)} className="ml-4 opacity-40 hover:opacity-100">
                <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <div className="flex items-center gap-2">
                <div className="bg-emerald-100 p-2 rounded-lg">
                    <ShoppingBag className="w-6 h-6 text-emerald-700" />
                </div>
                <div>
                    <h1 className="text-xl font-bold text-gray-900 tracking-tight">動態定價農產市集</h1>
                </div>
            </div>
            
            <div className="flex items-center gap-4">
                <div className="hidden md:flex flex-col items-end mr-2">
                    <span className="text-xs text-gray-400 uppercase font-semibold tracking-wider">
                        {currentUser.role === 'customer' ? '我的錢包' : '累計收益'}
                    </span>
                    <span className={`font-bold font-mono ${currentUser.role === 'customer' ? 'text-blue-600' : 'text-emerald-600'}`}>
                        ${currentUser.balance.toLocaleString()}
                    </span>
                </div>
                <div className="h-8 w-px bg-gray-200 hidden md:block"></div>

                <div className="flex items-center gap-2 bg-gray-100 pl-2 pr-3 py-1.5 rounded-full border border-gray-200">
                    <div className="p-1.5 bg-white rounded-full shadow-sm">
                        <UserIcon className="w-4 h-4 text-gray-500" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-xs font-bold text-gray-900 leading-none">{currentUser.name}</span>
                        <span className="text-[10px] text-gray-500 leading-none uppercase mt-0.5">
                            {currentUser.role === 'admin' ? '管理員' : currentUser.role === 'farmer' ? '農夫' : '顧客'}
                        </span>
                    </div>
                </div>
                <button 
                    onClick={handleLogout}
                    className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-full transition-all"
                    title="登出"
                >
                    <LogOut className="w-5 h-5" />
                </button>
            </div>
        </div>
      </header>

      {/* Main Layout */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        <div className="flex flex-col lg:flex-row gap-8">
            
            {/* Sidebar */}
            <aside className="lg:w-80 flex-shrink-0">
                <div className="sticky top-24">
                    <Sidebar 
                        currentUser={currentUser}
                        allUsers={allUsers}
                        onAddProduct={handleAddProduct}
                        onSimulateTime={handleSimulateTime}
                        onAdminTopUp={handleAdminTopUp}
                        onBuyInvitationCode={handleBuyInvitationCode}
                    />
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 min-w-0">
                <MarketStats products={products} currentUser={currentUser} />

                <div className="mb-6 flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-gray-900">新鮮農產品</h2>
                    <span className="bg-emerald-100 text-emerald-800 text-xs font-semibold px-2.5 py-0.5 rounded border border-emerald-200">
                        {products.length} 件商品上架中
                    </span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-6">
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
                        <div className="col-span-full py-16 text-center rounded-xl border-2 border-dashed border-gray-200 bg-gray-50">
                            <Sprout className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                            <p className="text-gray-500 font-medium">目前沒有農產品上架</p>
                            {currentUser.role === 'customer' && <p className="text-sm text-gray-400 mt-1">請稍後再來查看</p>}
                        </div>
                    )}
                </div>
            </div>
        </div>
      </main>
    </div>
  );
};

export default App;
    
import React, { useState, useMemo } from 'react';
import { Sidebar } from './components/Sidebar';
import { ProductCard } from './components/ProductCard';
import { MarketStats } from './components/MarketStats';
import { LoginScreen } from './components/LoginScreen';
import { Button } from './components/ui/Button';
import { Sprout, LogOut, X } from 'lucide-react';
import { useNotification } from './hooks/useNotification';
import { useAuth } from './hooks/useAuth';
import { useMarket } from './hooks/useMarket';

const App: React.FC = () => {
  const { notifications, addNotification, removeNotification } = useNotification();
  const auth = useAuth(addNotification);
  const market = useMarket(addNotification);

  const [searchQuery, setSearchQuery] = useState('');

  const handleBuy = (productId: number, amount: number, totalCost: number) => {
    const { currentUser } = auth;
    const product = market.products.find(p => p.id === productId);
    
    if (!currentUser || currentUser.role !== 'customer' || !product) return;
    if (currentUser.balance < totalCost) return addNotification('餘額不足', 'error');

    auth.transferMoney(currentUser.id, product.farmerId, totalCost);
    auth.addToInventory(currentUser.id, {
        productId: product.id,
        productName: product.name,
        amount,
        boughtAt: new Date().toISOString()
    });
    market.processSale(productId, amount);
    
    addNotification(`購買成功！花費 $${totalCost}`, 'success');
  };

  const filteredProducts = useMemo(() => {
    let result = [...market.products];
    if (searchQuery) {
        result = result.filter(p => p.name.includes(searchQuery) || p.farmerName.includes(searchQuery));
    }
    return result;
  }, [market.products, searchQuery]);

  if (!auth.currentUser) {
    return <LoginScreen existingUsers={auth.allUsers} onLogin={auth.login} onRegister={auth.register} />;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
        {notifications.map(n => (
          <div key={n.id} className={`p-4 rounded shadow-lg text-white flex justify-between ${n.type === 'error' ? 'bg-red-500' : 'bg-emerald-500'}`}>
            <span>{n.message}</span>
            <button onClick={() => removeNotification(n.id)}><X size={16}/></button>
          </div>
        ))}
      </div>

      <header className="bg-white shadow-sm px-6 py-4 flex justify-between sticky top-0 z-40">
        <div className="flex items-center gap-2">
             <Sprout className="text-emerald-600" />
             <h1 className="text-xl font-bold">白澤農產市集 <span className="text-xs text-gray-500 font-normal">Refactored</span></h1>
        </div>
        <div className="flex items-center gap-4">
            <span className="font-bold">{auth.currentUser.name}</span>
            <Button variant="outline" size="sm" onClick={auth.logout}><LogOut size={16} className="mr-2"/>登出</Button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-4 gap-8">
         <div className="lg:col-span-1">
            <Sidebar 
                currentUser={auth.currentUser}
                allUsers={auth.allUsers}
                onAddProduct={market.addProduct}
                onSimulateTime={market.simulateTime}
                onAdminTopUp={auth.adminTopUp}
                onBuyInvitationCode={auth.buyInvitationCode}
            />
         </div>

         <div className="lg:col-span-3">
             <MarketStats products={market.products} currentUser={auth.currentUser} />
             <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                 {filteredProducts.map(product => (
                     <ProductCard 
                        key={product.id}
                        product={product}
                        currentUser={auth.currentUser!}
                        onBuy={handleBuy}
                        onDelete={market.removeProduct}
                     />
                 ))}
             </div>
         </div>
      </div>
    </div>
  );
};
export default App;
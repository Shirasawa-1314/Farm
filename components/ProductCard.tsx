
import React, { useState } from 'react';
import { Product, User } from '../types';
import { Button } from './ui/Button';
import { TrendingUp, TrendingDown, Package, History, Trash2, User as UserIcon, Camera, ShieldAlert } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  currentUser: User;
  onBuy: (id: number, amount: number, totalCost: number) => void;
  onDelete: (id: number) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, currentUser, onBuy, onDelete }) => {
  const [amount, setAmount] = useState<number>(100);
  const [showConfirm, setShowConfirm] = useState(false); // 控制自定義確認彈窗

  const isOwner = currentUser.id === product.farmerId;
  const isAdmin = currentUser.role === 'admin';
  
  // 權限邏輯：管理員優先於農夫 (Admin > Farmer)
  const canDelete = isAdmin || isOwner;
  const canBuy = (currentUser.role === 'customer' || isAdmin) && !isOwner;

  // 價格計算
  const unitSize = 100;
  const totalCost = Math.floor((amount / unitSize) * product.currentPrice);
  const canAfford = currentUser.balance >= totalCost;
  const canAffordMin = currentUser.balance >= product.currentPrice;

  const handleBuy = () => {
    if (amount > 0 && amount <= product.stock && canAfford) {
      onBuy(product.id, amount, totalCost);
    }
  };

  // 觸發刪除流程 (顯示彈窗)
  const handleDeleteClick = (e: React.MouseEvent) => {
      e.stopPropagation(); // 防止觸發卡片其他點擊效果
      e.preventDefault();
      setShowConfirm(true);
  };

  // 確認刪除 (實際執行)
  const confirmDelete = (e: React.MouseEvent) => {
      e.stopPropagation();
      onDelete(product.id);
      setShowConfirm(false);
  };

  // 取消刪除
  const cancelDelete = (e: React.MouseEvent) => {
      e.stopPropagation();
      setShowConfirm(false);
  };

  const priceDiff = product.currentPrice - product.basePrice;
  const isHighDemand = priceDiff > 0;
  const isDiscounted = priceDiff < 0;

  return (
    <>
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col hover:shadow-md transition-shadow duration-300 group relative z-0">
      
      <div className="relative h-48 overflow-hidden bg-gray-100">
        <img 
          src={product.imageUrl || `https://picsum.photos/seed/${product.imageSeed}/400/300`} 
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        
        {/* 狀態標籤 */}
        <div className="absolute top-2 left-2 flex flex-col gap-1 z-10 pointer-events-none">
            {product.imageUrl && (
                <span className="bg-black/70 text-white text-[10px] font-bold px-2 py-1 rounded-full flex items-center shadow-sm backdrop-blur-sm">
                    <Camera className="w-3 h-3 mr-1" /> 產地實拍
                </span>
            )}
            {isHighDemand && (
                <span className="bg-red-100 text-red-800 text-xs font-bold px-2.5 py-1 rounded-full flex items-center shadow-sm backdrop-blur-sm bg-opacity-90">
                    <TrendingUp className="w-3 h-3 mr-1" /> 漲價中
                </span>
            )}
            {isDiscounted && (
                <span className="bg-green-100 text-green-800 text-xs font-bold px-2.5 py-1 rounded-full flex items-center shadow-sm backdrop-blur-sm bg-opacity-90">
                    <TrendingDown className="w-3 h-3 mr-1" /> 特價中
                </span>
            )}
        </div>
      </div>

      <div className="p-5 flex-1 flex flex-col relative z-10 bg-white">
        <div className="flex justify-between items-start mb-1">
          <h3 className="text-lg font-bold text-gray-900">{product.name}</h3>
          <div className="text-right">
            <p className="text-2xl font-bold text-emerald-700">${product.currentPrice} <span className="text-xs text-gray-400 font-normal">/100g</span></p>
            <p className="text-xs text-gray-500">底價: ${product.basePrice}</p>
          </div>
        </div>
        
        <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-50">
           <div className="flex items-center text-xs text-gray-500">
             <UserIcon className="w-3 h-3 mr-1" />
             <span>農夫: {product.farmerName}</span>
           </div>
        </div>

        <div className="space-y-2 mb-4 flex-1">
          <div className="flex items-center text-sm text-gray-600">
            <Package className="w-4 h-4 mr-2" />
            剩餘庫存: <span className={`font-medium ml-1 ${product.stock < 1000 ? 'text-red-600' : 'text-gray-900'}`}>{product.stock}g</span>
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <History className="w-4 h-4 mr-2" />
            累積銷量: <span className="font-medium ml-1 text-gray-900">{product.soldAcc}g</span>
          </div>
        </div>

        <div className="mt-auto space-y-3">
            {/* 購買區塊 */}
            {canBuy && product.stock > 0 && canAffordMin && (
              <div className="pt-2 border-t border-gray-100">
                <div className="space-y-3">
                    <div className="flex gap-2 items-end">
                        <div className="flex-1">
                            <label htmlFor={`amount-${product.id}`} className="block text-xs font-medium text-gray-700 mb-1">
                            購買重量 (g)
                            </label>
                            <input
                                id={`amount-${product.id}`}
                                type="number"
                                min="100"
                                max={product.stock}
                                step="100"
                                value={amount}
                                onChange={(e) => setAmount(Number(e.target.value))}
                                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm border p-2"
                            />
                        </div>
                        <div className="text-right pb-2">
                            <p className="text-xs text-gray-500">總金額</p>
                            <p className={`font-bold ${canAfford ? 'text-gray-900' : 'text-red-600'}`}>${totalCost}</p>
                        </div>
                    </div>
                    
                    <Button 
                        onClick={handleBuy} 
                        disabled={amount > product.stock || !canAfford}
                        fullWidth
                        variant={canAfford ? 'primary' : 'danger'}
                    >
                        {!canAfford ? '餘額不足' 
                          : `支付 $${totalCost} 購買`}
                    </Button>
                </div>
              </div>
            )}

            {/* 管理與下架區塊 - 改用實心按鈕確保視覺明顯與可點擊性 */}
            {canDelete && (
                <div className="pt-4 mt-2 border-t border-gray-100 relative z-20">
                   <Button
                        type="button"
                        variant={isAdmin ? 'secondary' : 'danger'}
                        fullWidth
                        onClick={handleDeleteClick}
                        className={isAdmin ? "bg-purple-600 hover:bg-purple-700 text-white border-transparent shadow-sm" : "bg-red-600 hover:bg-red-700 text-white shadow-sm"}
                   >
                       {isAdmin ? <ShieldAlert className="w-4 h-4 mr-2" /> : <Trash2 className="w-4 h-4 mr-2" />}
                       {isAdmin ? '管理員強制下架' : '下架此商品'}
                   </Button>
                </div>
            )}
        </div>
      </div>
    </div>

    {/* 自定義確認彈窗 (Modal) - 確保層級最高 z-[100] */}
    {showConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200" onClick={(e) => e.stopPropagation()}>
            <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 border border-gray-100 transform transition-all scale-100" onClick={(e) => e.stopPropagation()}>
                <div className="flex flex-col items-center text-center">
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-5 ${isAdmin ? 'bg-purple-100' : 'bg-red-100'}`}>
                        {isAdmin ? <ShieldAlert className="w-8 h-8 text-purple-600" /> : <Trash2 className="w-8 h-8 text-red-600" />}
                    </div>
                    
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                        {isAdmin ? '確認強制下架？' : '確認下架商品？'}
                    </h3>
                    
                    <div className="bg-gray-50 p-3 rounded-lg w-full mb-4 text-left border border-gray-200">
                        <p className="text-sm text-gray-600"><span className="font-bold">商品：</span>{product.name}</p>
                        <p className="text-sm text-gray-600"><span className="font-bold">當前價格：</span>${product.currentPrice}</p>
                    </div>

                    <p className="text-sm text-gray-500 mb-6 leading-relaxed">
                        ℹ️ 提示：下架後商品將從市場移除，無法再被購買。<br/>
                        <span className="text-gray-800 font-bold">顧客已購買的庫存將會保留在他們的背包中。</span>
                    </p>
                    
                    <div className="grid grid-cols-2 gap-3 w-full">
                        <Button type="button" variant="outline" onClick={cancelDelete} fullWidth className="bg-white hover:bg-gray-50 text-gray-700 border-gray-300">
                            取消
                        </Button>
                        <Button 
                            type="button"
                            variant={isAdmin ? 'secondary' : 'danger'} 
                            onClick={confirmDelete} 
                            fullWidth
                            className={isAdmin ? "bg-purple-600 hover:bg-purple-700 border-transparent text-white" : "bg-red-600 hover:bg-red-700 text-white"}
                        >
                            {isAdmin ? '確認下架' : '確認下架'}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )}
    </>
  );
};

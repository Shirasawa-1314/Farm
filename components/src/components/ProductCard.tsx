
import React, { useState } from 'react';
import { Product, User } from '../types';
import { Button } from './ui/Button';
import { TrendingUp, TrendingDown, Package, History, Trash2, User as UserIcon, Camera, AlertTriangle } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  currentUser: User;
  onBuy: (id: number, amount: number, totalCost: number) => void;
  onDelete: (id: number) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, currentUser, onBuy, onDelete }) => {
  const [amount, setAmount] = useState<number>(100);
  const [showConfirm, setShowConfirm] = useState(false);

  const isOwner = currentUser.id === product.farmerId;
  const isAdmin = currentUser.role === 'admin';
  const isCustomer = currentUser.role === 'customer';
  
  const canDelete = isOwner || isAdmin;
  const canBuy = (isCustomer || isAdmin) && !isOwner;

  const unitSize = 100;
  const totalCost = Math.floor((amount / unitSize) * product.currentPrice);
  const canAfford = currentUser.balance >= totalCost;

  const handleBuy = () => {
    if (amount > 0 && amount <= product.stock && canAfford) {
      onBuy(product.id, amount, totalCost);
    }
  };

  const priceDiff = product.currentPrice - product.basePrice;
  const isHighDemand = priceDiff > 0;
  const isDiscounted = priceDiff < 0;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col hover:shadow-md transition-shadow duration-300 group relative">
      
      {/* 刪除確認覆蓋層 (Overlay) - 取代原生的 window.confirm */}
      {showConfirm && (
        <div className="absolute inset-0 z-50 bg-white/95 backdrop-blur-[2px] flex flex-col items-center justify-center p-6 text-center animate-fade-in">
            <div className="bg-red-100 p-3 rounded-full mb-3">
                <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
            <h4 className="text-lg font-bold text-gray-900 mb-2">確定要下架此商品？</h4>
            <p className="text-sm text-gray-500 mb-6 leading-relaxed">
              下架後 <span className="font-bold text-gray-700">{product.name}</span> 將從市場消失。<br/>此動作無法復原。
            </p>
            <div className="flex gap-3 w-full">
                <Button 
                    variant="outline" 
                    fullWidth 
                    onClick={(e) => {
                        e.stopPropagation();
                        setShowConfirm(false);
                    }}
                >
                    取消
                </Button>
                <Button 
                    variant="danger" 
                    fullWidth 
                    onClick={(e) => {
                        e.stopPropagation();
                        onDelete(product.id);
                        // 刪除後元件會被移除，不需要 setShowConfirm(false)
                    }}
                >
                    確認下架
                </Button>
            </div>
        </div>
      )}

      {/* 圖片區域 */}
      <div className="relative h-48 overflow-hidden bg-gray-100">
        <img 
          src={product.imageUrl || `https://picsum.photos/seed/${product.imageSeed}/400/300`} 
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        
        {/* 刪除按鈕 - 確保在最上層 (z-40) */}
        {canDelete && !showConfirm && (
          <button 
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation(); // 防止點擊事件冒泡
              setShowConfirm(true);
            }}
            className="absolute top-2 right-2 z-40 bg-white p-2 rounded-full text-gray-500 hover:text-red-600 hover:bg-red-50 shadow-md hover:shadow-lg transition-all cursor-pointer border border-gray-100"
            title="下架產品"
            type="button"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}

        {/* 狀態標籤 */}
        <div className="absolute top-2 left-2 flex flex-col gap-1 pointer-events-none z-30">
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

      <div className="p-5 flex-1 flex flex-col">
        <div className="flex justify-between items-start mb-1">
          <h3 className="text-lg font-bold text-gray-900">{product.name}</h3>
          <div className="text-right">
            <p className="text-2xl font-bold text-emerald-700">${product.currentPrice} <span className="text-xs text-gray-400 font-normal">/100g</span></p>
            <p className="text-xs text-gray-500">底價: ${product.basePrice}</p>
          </div>
        </div>
        
        <div className="flex items-center text-xs text-gray-500 mb-4">
           <UserIcon className="w-3 h-3 mr-1" />
           <span>農夫: {product.farmerName}</span>
        </div>

        <div className="space-y-2 mb-4 flex-1 border-t border-gray-100 pt-3">
          <div className="flex items-center text-sm text-gray-600">
            <Package className="w-4 h-4 mr-2" />
            剩餘庫存: <span className={`font-medium ml-1 ${product.stock < 1000 ? 'text-red-600' : 'text-gray-900'}`}>{product.stock}g</span>
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <History className="w-4 h-4 mr-2" />
            累積銷量: <span className="font-medium ml-1 text-gray-900">{product.soldAcc}g</span>
          </div>
        </div>

        <div className="mt-auto pt-2">
          {canBuy ? (
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
                    disabled={product.stock === 0 || amount > product.stock || !canAfford}
                    fullWidth
                    variant={canAfford ? 'primary' : 'danger'}
                >
                    {product.stock === 0 ? '已售完' 
                      : !canAfford ? '餘額不足' 
                      : `支付 $${totalCost} 購買`}
                </Button>
            </div>
          ) : (
            <div className="bg-gray-100 text-gray-500 text-center py-3 rounded-lg text-sm">
               {isOwner ? '管理您的商品' : '無法購買'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
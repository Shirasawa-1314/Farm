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
  const [showConfirm, setShowConfirm] = useState(false);

  const isOwner = currentUser.id === product.farmerId;
  const isAdmin = currentUser.role === 'admin';
  const isCustomer = currentUser.role === 'customer';
  
  const canDelete = isAdmin || isOwner;
  const canBuy = (isCustomer || (isAdmin && !isOwner));
  const totalCost = Math.floor((amount / 100) * product.currentPrice);
  const canAfford = currentUser.balance >= totalCost;

  return (
    <>
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col hover:shadow-md transition-shadow duration-300 group relative z-0">
      <div className="relative h-48 overflow-hidden bg-gray-100">
        <img src={product.imageUrl || `https://picsum.photos/seed/${product.imageSeed}/400/300`} alt={product.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"/>
        <div className="absolute top-2 left-2 flex flex-col gap-1 z-10 pointer-events-none">
            {product.imageUrl && <span className="bg-black/70 text-white text-[10px] font-bold px-2 py-1 rounded-full flex items-center"><Camera className="w-3 h-3 mr-1" /> 實拍</span>}
            {product.currentPrice > product.basePrice && <span className="bg-red-100 text-red-800 text-xs font-bold px-2 py-1 rounded-full flex items-center"><TrendingUp className="w-3 h-3 mr-1" /> 漲價中</span>}
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
           <div className="flex items-center text-xs text-gray-500"><UserIcon className="w-3 h-3 mr-1" /><span>農夫: {product.farmerName}</span></div>
        </div>

        <div className="space-y-2 mb-4 flex-1">
          <div className="flex items-center text-sm text-gray-600"><Package className="w-4 h-4 mr-2" />庫存: <span className={`font-medium ml-1 ${product.stock < 1000 ? 'text-red-600' : 'text-gray-900'}`}>{product.stock}g</span></div>
          <div className="flex items-center text-sm text-gray-600"><History className="w-4 h-4 mr-2" />銷量: <span className="font-medium ml-1 text-gray-900">{product.soldAcc}g</span></div>
        </div>

        <div className="mt-auto space-y-3">
            {canBuy && product.stock > 0 && (
              <div className="pt-2 border-t border-gray-100 space-y-3">
                  <div className="flex gap-2 items-end">
                      <div className="flex-1">
                          <label className="block text-xs font-medium text-gray-700 mb-1">購買重量 (g)</label>
                          <input type="number" min="100" max={product.stock} step="100" value={amount} onChange={(e) => setAmount(Number(e.target.value))} className="block w-full rounded-md border-gray-300 border p-2 text-sm"/>
                      </div>
                      <div className="text-right pb-2">
                          <p className="text-xs text-gray-500">總金額</p>
                          <p className={`font-bold ${canAfford ? 'text-gray-900' : 'text-red-600'}`}>${totalCost}</p>
                      </div>
                  </div>
                  <Button onClick={() => onBuy(product.id, amount, totalCost)} disabled={amount > product.stock || !canAfford} fullWidth variant={canAfford ? 'primary' : 'danger'}>
                      {!canAfford ? '餘額不足' : `支付 $${totalCost} 購買`}
                  </Button>
              </div>
            )}

            {canDelete && (
                <div className="pt-4 mt-2 border-t border-gray-100 relative z-20">
                   <Button type="button" variant={isAdmin ? 'secondary' : 'danger'} fullWidth onClick={(e) => {e.stopPropagation(); setShowConfirm(true);}} className={isAdmin ? "bg-purple-600 text-white" : "bg-red-600 text-white"}>
                       {isAdmin ? <ShieldAlert className="w-4 h-4 mr-2" /> : <Trash2 className="w-4 h-4 mr-2" />}
                       {isAdmin ? '管理員強制下架' : '下架此商品'}
                   </Button>
                </div>
            )}
        </div>
      </div>
    </div>

    {showConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={(e) => e.stopPropagation()}>
            <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6" onClick={(e) => e.stopPropagation()}>
                <h3 className="text-xl font-bold text-center mb-4">確認下架商品？</h3>
                <div className="grid grid-cols-2 gap-3">
                    <Button variant="outline" onClick={() => setShowConfirm(false)}>取消</Button>
                    <Button variant="danger" onClick={() => {onDelete(product.id); setShowConfirm(false);}}>確認下架</Button>
                </div>
            </div>
        </div>
    )}
    </>
  );
};
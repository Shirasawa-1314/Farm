import { useState, useCallback } from 'react';
import { Product } from '../types';

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
    lastSaleTime: new Date().toISOString(),
    noSaleMinutes: 0,
    imageSeed: 101
  }
];

export const useMarket = (notify: (msg: string, type: any) => void) => {
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);

  const addProduct = useCallback((farmer: {id: string, name: string}, name: string, price: number, stock: number, imageUrl?: string) => {
    const newProduct: Product = {
      id: Date.now(),
      farmerId: farmer.id,
      farmerName: farmer.name,
      name,
      basePrice: price,
      currentPrice: price,
      stock,
      soldAcc: 0,
      lastSaleTime: new Date().toISOString(),
      noSaleMinutes: 0,
      imageSeed: Math.floor(Math.random() * 1000),
      imageUrl
    };
    setProducts(prev => [...prev, newProduct]);
    notify(`已上架 ${name}`, 'success');
  }, [notify]);

  const removeProduct = useCallback((productId: number) => {
    setProducts(prev => prev.filter(p => p.id !== productId));
    notify('產品已下架', 'info');
  }, [notify]);

  const processSale = useCallback((productId: number, amount: number) => {
    setProducts(prev => prev.map(p => {
      if (p.id !== productId) return p;

      const oldAcc = p.soldAcc;
      const newAcc = oldAcc + amount;
      const increase = Math.floor(newAcc / 1000) - Math.floor(oldAcc / 1000);
      let newPrice = p.currentPrice;

      if (increase > 0) {
        newPrice += increase;
        notify(`📈 ${p.name} 買氣旺！價格上漲 ${increase} 元`, 'warning');
      }

      return {
        ...p,
        stock: p.stock - amount,
        soldAcc: newAcc,
        currentPrice: newPrice,
        lastSaleTime: new Date().toISOString(),
        noSaleMinutes: 0
      };
    }));
  }, [notify]);

  const simulateTime = useCallback(() => {
    let droppedCount = 0;
    setProducts(prev => prev.map(p => {
      const newNoSaleMinutes = p.noSaleMinutes + 30;
      if (newNoSaleMinutes >= 30 && p.currentPrice > p.basePrice) {
        droppedCount++;
        return { ...p, currentPrice: p.currentPrice - 1, noSaleMinutes: 0 };
      }
      return { ...p, noSaleMinutes: newNoSaleMinutes };
    }));
    if (droppedCount > 0) notify(`📉 市場冷卻，${droppedCount} 項商品降價`, 'info');
    else notify('⏱️ 時間經過', 'info');
  }, [notify]);

  return { products, addProduct, removeProduct, processSale, simulateTime };
};
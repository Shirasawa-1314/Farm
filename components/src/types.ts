
export type UserRole = 'admin' | 'farmer' | 'customer';

export interface InventoryItem {
  productId: number;
  productName: string;
  amount: number; // 克數
  boughtAt: Date;
}

export interface User {
  id: string;
  name: string;
  role: UserRole;
  balance: number; // 用戶餘額 (顧客是錢包，農夫是營收)
  inventory: InventoryItem[]; // 顧客買到的東西
  invitationCodes: string[]; // 擁有的邀請碼 (僅農夫使用)
}

export interface Product {
  id: number;
  farmerId: string; // 連結到上架的農夫
  farmerName: string;
  name: string;
  basePrice: number; // 底價 (每100g)
  currentPrice: number; // 當前價格 (每100g)
  stock: number; // 庫存 (g)
  soldAcc: number;
  lastSaleTime: Date;
  noSaleMinutes: number;
  imageSeed: number;
  imageUrl?: string; // 新增：實拍照片 (Base64)
}

export interface Notification {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
}

export type MarketAction = 
  | { type: 'ADD_PRODUCT'; payload: Omit<Product, 'id' | 'soldAcc' | 'lastSaleTime' | 'noSaleMinutes' | 'currentPrice' | 'imageSeed'> }
  | { type: 'BUY_PRODUCT'; payload: { id: number; amount: number } }
  | { type: 'DELETE_PRODUCT'; payload: { id: number } }
  | { type: 'SIMULATE_TIME' };
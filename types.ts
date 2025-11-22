export type UserRole = 'admin' | 'farmer' | 'customer';

// 基礎用戶介面
export interface BaseUser {
  id: string;
  name: string;
  balance: number;
}

// 管理員：擁有特殊權限，無特殊屬性
export interface AdminUser extends BaseUser {
  role: 'admin';
}

// 農夫：擁有邀請碼
export interface FarmerUser extends BaseUser {
  role: 'farmer';
  invitationCodes: string[];
}

// 顧客：擁有背包
export interface InventoryItem {
  productId: number;
  productName: string;
  amount: number;
  boughtAt: string; // ISO Date string
}

export interface CustomerUser extends BaseUser {
  role: 'customer';
  inventory: InventoryItem[];
}

// 聯合型別：TypeScript 會自動根據 role 判斷可用的屬性
export type User = AdminUser | FarmerUser | CustomerUser;

export interface Product {
  id: number;
  farmerId: string;
  farmerName: string;
  name: string;
  basePrice: number;
  currentPrice: number;
  stock: number;
  soldAcc: number;
  lastSaleTime: string; // ISO Date string
  noSaleMinutes: number;
  imageSeed: number;
  imageUrl?: string;
}

export interface Notification {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
}

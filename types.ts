export type UserRole = 'admin' | 'farmer' | 'customer';

export interface BaseUser {
  id: string;
  name: string;
  balance: number;
}

export interface AdminUser extends BaseUser {
  role: 'admin';
}

export interface FarmerUser extends BaseUser {
  role: 'farmer';
  invitationCodes: string[];
}

export interface InventoryItem {
  productId: number;
  productName: string;
  amount: number;
  boughtAt: string;
}

export interface CustomerUser extends BaseUser {
  role: 'customer';
  inventory: InventoryItem[];
}

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
  lastSaleTime: string;
  noSaleMinutes: number;
  imageSeed: number;
  imageUrl?: string;
}

export interface Notification {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
}
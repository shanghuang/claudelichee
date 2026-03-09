export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  image: string;
  category: 'tropical' | 'citrus' | 'berries' | 'melons' | 'stone' | 'other';
  stock: number;
  unit: string;
  sellerId?: number | null;
  sellerName?: string | null;
  status: 'pending' | 'approved' | 'rejected';
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface User {
  id: number;
  email: string;
  name: string;
  passwordHash: string;
  role: 'user' | 'admin' | 'seller';
  createdAt: Date;
}

export interface Order {
  id: number;
  userId: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  total: number;
  shippingAddress: string;
  createdAt: Date;
}

export interface OrderItem {
  id: number;
  orderId: number;
  productId: number;
  quantity: number;
  price: number;
}

export type CartAction =
  | { type: 'ADD_ITEM'; product: Product }
  | { type: 'REMOVE_ITEM'; productId: number }
  | { type: 'UPDATE_QUANTITY'; productId: number; quantity: number }
  | { type: 'CLEAR_CART' }
  | { type: 'LOAD_CART'; items: CartItem[] };

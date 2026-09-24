export type CategoryType = 
  | 'Fruits & Vegetables'
  | 'Dairy & Eggs'
  | 'Staples'
  | 'Snacks'
  | 'Beverages'
  | 'Household';

export interface ProductVariant {
  id: string;
  unit: string;
  price: number;
  mrp: number;
}

export interface Product {
  id: string;
  name: string;
  brand: string;
  category: CategoryType;
  price: number;
  mrp: number;
  unit: string;
  variants?: ProductVariant[];
  stock: number;
  rating: number;
  ratingCount: number;
  image: string;
  images?: string[];
  description: string;
  highlights: string[];
  isFeatured?: boolean;
  isBestSeller?: boolean;
  isDealOfDay?: boolean;
  discountPercent: number;
}

export interface Review {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  userEmail: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface CartItem {
  productId: string;
  product: Product;
  variantId?: string;
  quantity: number;
  unit: string;
  price: number;
  mrp: number;
}

export interface Address {
  id: string;
  fullName: string;
  phone: string;
  flat: string;
  street: string;
  landmark?: string;
  area: string;
  city: string;
  pincode: string;
  tag: 'Home' | 'Work' | 'Other';
  isDefault?: boolean;
}

export type OrderStatus =
  | 'Placed'
  | 'Confirmed'
  | 'Packed'
  | 'Out for Delivery'
  | 'Delivered'
  | 'Cancelled';

export interface OrderStatusHistoryItem {
  status: OrderStatus;
  timestamp: string;
  note?: string;
}

export interface OrderPricing {
  subtotal: number;
  deliveryFee: number;
  discount: number;
  total: number;
  couponCode?: string;
}

export interface OrderPayment {
  method: 'ONLINE' | 'COD';
  status: 'PAID' | 'PENDING' | 'FAILED';
  razorpayPaymentId?: string;
}

export interface Order {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  userPhone: string;
  items: CartItem[];
  deliveryAddress: Address;
  pricing: OrderPricing;
  payment: OrderPayment;
  status: OrderStatus;
  statusHistory: OrderStatusHistoryItem[];
  estimatedDelivery: string;
  createdAt: string;
  cancellable?: boolean;
}

export interface SupportTicket {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  orderId?: string;
  subject: string;
  message: string;
  status: 'Open' | 'In Progress' | 'Resolved';
  adminReply?: string;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  uid: string;
  name: string;
  email: string;
  role: 'customer' | 'admin';
  phone?: string;
  addresses: Address[];
}

export interface CategoryInfo {
  id: string;
  name: CategoryType;
  icon: string;
  image: string;
  tagline: string;
  color: string;
}

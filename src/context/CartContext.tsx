import React, { createContext, useContext, useState, useEffect } from 'react';
import { CartItem, Product } from '../types';

export interface Coupon {
  code: string;
  description: string;
  discountType: 'percentage' | 'flat';
  value: number;
  minSubtotal: number;
}

export const VALID_COUPONS: Coupon[] = [
  {
    code: 'FRESH10',
    description: '10% off on all groceries',
    discountType: 'percentage',
    value: 10,
    minSubtotal: 0,
  },
  {
    code: 'WELCOME50',
    description: 'Flat ₹50 off on orders above ₹199',
    discountType: 'flat',
    value: 50,
    minSubtotal: 199,
  },
];

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product, quantity?: number, variantId?: string) => { success: boolean; message?: string };
  removeFromCart: (productId: string, variantId?: string) => void;
  updateQuantity: (productId: string, quantity: number, variantId?: string) => void;
  clearCart: () => void;
  totalItems: number;
  subtotal: number;
  deliveryFee: number;
  freeDeliveryThreshold: number;
  amountNeededForFreeDelivery: number;
  discount: number;
  total: number;
  appliedCoupon: Coupon | null;
  applyCoupon: (code: string) => { success: boolean; message: string };
  removeCoupon: () => void;
  isMiniCartOpen: boolean;
  setIsMiniCartOpen: (open: boolean) => void;
  getItemQuantity: (productId: string, variantId?: string) => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'freshkart_cart_items_v1';
const COUPON_STORAGE_KEY = 'freshkart_cart_coupon_v1';
const FREE_DELIVERY_THRESHOLD = 499;
const STANDARD_DELIVERY_FEE = 40;

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const raw = localStorage.getItem(CART_STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(() => {
    try {
      const raw = localStorage.getItem(COUPON_STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });

  const [isMiniCartOpen, setIsMiniCartOpen] = useState(false);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  useEffect(() => {
    if (appliedCoupon) {
      localStorage.setItem(COUPON_STORAGE_KEY, JSON.stringify(appliedCoupon));
    } else {
      localStorage.removeItem(COUPON_STORAGE_KEY);
    }
  }, [appliedCoupon]);

  const getItemQuantity = (productId: string, variantId?: string): number => {
    const item = items.find(
      i => i.productId === productId && (variantId ? i.variantId === variantId : !i.variantId)
    );
    return item ? item.quantity : 0;
  };

  const addToCart = (product: Product, quantity = 1, variantId?: string): { success: boolean; message?: string } => {
    const currentQty = getItemQuantity(product.id, variantId);
    const newQty = currentQty + quantity;

    if (newQty > product.stock) {
      return {
        success: false,
        message: `Only ${product.stock} units available in stock right now.`,
      };
    }

    let unit = product.unit;
    let price = product.price;
    let mrp = product.mrp;

    if (variantId && product.variants) {
      const variant = product.variants.find(v => v.id === variantId);
      if (variant) {
        unit = variant.unit;
        price = variant.price;
        mrp = variant.mrp;
      }
    }

    setItems(prev => {
      const index = prev.findIndex(
        i => i.productId === product.id && (variantId ? i.variantId === variantId : !i.variantId)
      );

      if (index >= 0) {
        const next = [...prev];
        next[index] = {
          ...next[index],
          quantity: newQty,
        };
        return next;
      } else {
        return [
          ...prev,
          {
            productId: product.id,
            product,
            variantId,
            quantity,
            unit,
            price,
            mrp,
          },
        ];
      }
    });

    return { success: true };
  };

  const updateQuantity = (productId: string, quantity: number, variantId?: string) => {
    if (quantity <= 0) {
      removeFromCart(productId, variantId);
      return;
    }

    setItems(prev =>
      prev.map(item => {
        if (item.productId === productId && (variantId ? item.variantId === variantId : !item.variantId)) {
          if (quantity > item.product.stock) {
            return { ...item, quantity: item.product.stock };
          }
          return { ...item, quantity };
        }
        return item;
      })
    );
  };

  const removeFromCart = (productId: string, variantId?: string) => {
    setItems(prev =>
      prev.filter(
        item => !(item.productId === productId && (variantId ? item.variantId === variantId : !item.variantId))
      )
    );
  };

  const clearCart = () => {
    setItems([]);
    setAppliedCoupon(null);
    localStorage.removeItem(CART_STORAGE_KEY);
    localStorage.removeItem(COUPON_STORAGE_KEY);
  };

  // Calculations
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const deliveryFee = subtotal === 0 || subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : STANDARD_DELIVERY_FEE;
  const amountNeededForFreeDelivery = Math.max(0, FREE_DELIVERY_THRESHOLD - subtotal);

  let discount = 0;
  if (appliedCoupon && subtotal >= appliedCoupon.minSubtotal) {
    if (appliedCoupon.discountType === 'percentage') {
      discount = Math.round((subtotal * appliedCoupon.value) / 100);
    } else {
      discount = appliedCoupon.value;
    }
  }

  const total = Math.max(0, subtotal - discount + deliveryFee);

  const applyCoupon = (code: string): { success: boolean; message: string } => {
    const coupon = VALID_COUPONS.find(c => c.code.toUpperCase() === code.trim().toUpperCase());
    if (!coupon) {
      return { success: false, message: 'Invalid coupon code. Try FRESH10 or WELCOME50.' };
    }
    if (subtotal < coupon.minSubtotal) {
      return {
        success: false,
        message: `Minimum order value for ${coupon.code} is ₹${coupon.minSubtotal}.`,
      };
    }
    setAppliedCoupon(coupon);
    return { success: true, message: `Coupon ${coupon.code} applied successfully!` };
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
  };

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalItems,
        subtotal,
        deliveryFee,
        freeDeliveryThreshold: FREE_DELIVERY_THRESHOLD,
        amountNeededForFreeDelivery,
        discount,
        total,
        appliedCoupon,
        applyCoupon,
        removeCoupon,
        isMiniCartOpen,
        setIsMiniCartOpen,
        getItemQuantity,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}

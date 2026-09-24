import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShoppingBag,
  Plus,
  Minus,
  Trash2,
  Tag,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  ArrowLeft,
  X,
} from 'lucide-react';
import { useCart, VALID_COUPONS } from '../context/CartContext';
import { useToast } from '../components/common/Toast';

export function CartPage() {
  const {
    items,
    updateQuantity,
    removeFromCart,
    clearCart,
    subtotal,
    deliveryFee,
    freeDeliveryThreshold,
    amountNeededForFreeDelivery,
    discount,
    total,
    appliedCoupon,
    applyCoupon,
    removeCoupon,
  } = useCart();

  const navigate = useNavigate();
  const { success, error } = useToast();
  const [couponInput, setCouponInput] = useState('');

  const freeDeliveryPercent = Math.min(
    100,
    Math.round((subtotal / freeDeliveryThreshold) * 100)
  );

  const handleApplyCoupon = (codeToApply?: string) => {
    const code = codeToApply || couponInput;
    if (!code.trim()) {
      error('Please enter a coupon code.');
      return;
    }
    const res = applyCoupon(code);
    if (res.success) {
      success(res.message);
      setCouponInput('');
    } else {
      error(res.message);
    }
  };

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto py-16 px-4 text-center space-y-5">
        <div className="w-24 h-24 rounded-3xl bg-emerald-50 dark:bg-emerald-950/60 text-[#2E7D32] dark:text-emerald-400 flex items-center justify-center mx-auto shadow-inner">
          <ShoppingBag className="w-12 h-12" />
        </div>
        <h2 className="text-2xl font-black text-slate-900 dark:text-white">
          Your Shopping Cart is Empty
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
          Stock up on fresh farm produce, dairy, staples, and munchies delivered in 25 minutes to your doorstep in Greater Noida.
        </p>
        <Link
          to="/products"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-[#2E7D32] hover:bg-[#256628] text-white font-black text-sm shadow-lg shadow-emerald-700/20 transition active:scale-95"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Browse Kirana Catalog</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20">
      
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Shopping Cart ({items.length} {items.length === 1 ? 'item' : 'items'})
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Greater Noida Express Dispatch from Jagat Farm
          </p>
        </div>
        <button
          onClick={clearCart}
          className="text-xs font-semibold text-rose-500 hover:text-rose-700 self-start sm:self-auto"
        >
          Clear Cart
        </button>
      </div>

      {/* Free Delivery Bar Banner */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
        {amountNeededForFreeDelivery > 0 ? (
          <div>
            <div className="flex items-center justify-between text-xs font-semibold text-slate-800 dark:text-slate-200 mb-2">
              <span className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400 font-bold">
                <Sparkles className="w-4 h-4 text-amber-500" />
                Add ₹{amountNeededForFreeDelivery} more to enjoy FREE Delivery!
              </span>
              <span>{freeDeliveryPercent}%</span>
            </div>
            <div className="w-full h-2.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
              <div
                className="h-full bg-[#2E7D32] transition-all duration-300 rounded-full"
                style={{ width: `${freeDeliveryPercent}%` }}
              />
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-800 dark:text-emerald-300">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Congratulations! You qualify for FREE 25-Min Delivery anywhere in Greater Noida!</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* Left: Cart Items List */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-200/80 dark:border-slate-800 space-y-4">
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {items.map(item => (
              <div
                key={`${item.productId}-${item.variantId || 'base'}`}
                className="py-4 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="flex items-center gap-4">
                  <img
                    src={item.product.image}
                    alt={item.product.name}
                    className="w-18 h-18 sm:w-20 sm:h-20 rounded-2xl object-cover bg-slate-100 dark:bg-slate-800 shrink-0"
                  />
                  <div>
                    <span className="text-[11px] font-bold text-slate-400 uppercase">
                      {item.product.brand}
                    </span>
                    <Link
                      to={`/product/${item.product.id}`}
                      className="font-bold text-slate-900 dark:text-white text-sm sm:text-base hover:text-[#2E7D32] line-clamp-1 block"
                    >
                      {item.product.name}
                    </Link>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      {item.unit} • ₹{item.price} each
                    </p>
                    <div className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold mt-1">
                      Line Total: <strong>₹{item.price * item.quantity}</strong>
                    </div>
                  </div>
                </div>

                {/* Stepper and Remove button */}
                <div className="flex items-center justify-between sm:justify-end gap-4 self-end sm:self-center">
                  <div className="flex items-center bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-1 font-bold">
                    <button
                      onClick={() => updateQuantity(item.productId, item.quantity - 1, item.variantId)}
                      className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white dark:hover:bg-slate-700 transition"
                      aria-label="Decrease quantity"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-8 text-center text-sm font-black">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.productId, item.quantity + 1, item.variantId)}
                      disabled={item.quantity >= item.product.stock}
                      className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white dark:hover:bg-slate-700 transition disabled:opacity-40"
                      aria-label="Increase quantity"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <button
                    onClick={() => removeFromCart(item.productId, item.variantId)}
                    className="p-2 text-slate-400 hover:text-rose-600 transition rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/40"
                    title="Remove item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center text-xs">
            <Link
              to="/products"
              className="text-[#2E7D32] dark:text-emerald-400 font-bold flex items-center gap-1 hover:underline"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Add more groceries</span>
            </Link>
          </div>
        </div>

        {/* Right: Summary & Coupons */}
        <div className="space-y-4">
          
          {/* Coupon Box */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200/80 dark:border-slate-800 space-y-3">
            <h3 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
              <Tag className="w-4 h-4 text-[#2E7D32]" />
              Apply Kirana Coupon
            </h3>

            {appliedCoupon ? (
              <div className="flex items-center justify-between p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-xs font-semibold text-emerald-900 dark:text-emerald-200">
                <div>
                  <span className="font-black tracking-wider uppercase block">{appliedCoupon.code}</span>
                  <span className="text-[11px] text-emerald-700 dark:text-emerald-400">{appliedCoupon.description}</span>
                </div>
                <button
                  onClick={removeCoupon}
                  className="p-1 text-emerald-700 hover:text-rose-600 transition"
                  title="Remove coupon"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={couponInput}
                  onChange={e => setCouponInput(e.target.value.toUpperCase())}
                  placeholder="e.g. FRESH10"
                  className="flex-1 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-mono font-bold uppercase focus:ring-2 focus:ring-[#2E7D32] focus:outline-none"
                />
                <button
                  onClick={() => handleApplyCoupon()}
                  className="px-4 py-2 rounded-xl bg-slate-900 dark:bg-slate-800 hover:bg-[#2E7D32] text-white font-bold text-xs transition"
                >
                  Apply
                </button>
              </div>
            )}

            {/* Quick Coupon Chips */}
            {!appliedCoupon && (
              <div className="space-y-1.5 pt-1">
                <p className="text-[11px] text-slate-400">Available Coupons:</p>
                {VALID_COUPONS.map(c => (
                  <div
                    key={c.code}
                    onClick={() => handleApplyCoupon(c.code)}
                    className="p-2 rounded-xl border border-dashed border-emerald-300 dark:border-emerald-800/80 bg-emerald-50/50 dark:bg-emerald-950/20 flex items-center justify-between cursor-pointer hover:bg-emerald-100/50 transition text-xs"
                  >
                    <div>
                      <span className="font-black text-[#2E7D32] dark:text-emerald-400 uppercase">{c.code}</span>
                      <p className="text-[10px] text-slate-500">{c.description}</p>
                    </div>
                    <span className="text-[11px] font-bold text-[#2E7D32] hover:underline">Apply</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Bill Summary Box */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-200/80 dark:border-slate-800 space-y-4">
            <h3 className="font-bold text-slate-900 dark:text-white text-base">
              Bill Summary
            </h3>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Items Subtotal</span>
                <span className="font-bold text-slate-900 dark:text-white">₹{subtotal}</span>
              </div>

              {discount > 0 && (
                <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-bold">
                  <span>Coupon Discount</span>
                  <span>-₹{discount}</span>
                </div>
              )}

              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Express Delivery Fee</span>
                <span>
                  {deliveryFee === 0 ? (
                    <strong className="text-emerald-600 dark:text-emerald-400">FREE</strong>
                  ) : (
                    `₹${deliveryFee}`
                  )}
                </span>
              </div>

              <div className="flex justify-between text-sm sm:text-base font-black text-slate-900 dark:text-white pt-3 border-t border-slate-200 dark:border-slate-800">
                <span>To Pay</span>
                <span className="text-emerald-700 dark:text-emerald-400 text-lg sm:text-xl">₹{total}</span>
              </div>
            </div>

            <button
              onClick={() => navigate('/checkout')}
              className="w-full py-4 rounded-2xl bg-[#2E7D32] hover:bg-[#256628] text-white font-black text-sm shadow-xl shadow-emerald-700/25 flex items-center justify-center gap-2 transition active:scale-98"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <p className="text-[11px] text-center text-slate-400">
              Safe & Secure Checkout • Razorpay Test & Cash on Delivery Available
            </p>
          </div>

        </div>

      </div>

    </div>
  );
}

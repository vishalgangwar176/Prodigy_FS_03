import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { X, ShoppingBag, Plus, Minus, Trash2, ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react';
import { useCart } from '../../context/CartContext';

export function MiniCartDrawer() {
  const {
    items,
    isMiniCartOpen,
    setIsMiniCartOpen,
    updateQuantity,
    removeFromCart,
    subtotal,
    deliveryFee,
    freeDeliveryThreshold,
    amountNeededForFreeDelivery,
    discount,
    total,
  } = useCart();

  const navigate = useNavigate();

  if (!isMiniCartOpen) return null;

  const freeDeliveryPercent = Math.min(
    100,
    Math.round((subtotal / freeDeliveryThreshold) * 100)
  );

  const handleCheckoutClick = () => {
    setIsMiniCartOpen(false);
    navigate('/checkout');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={() => setIsMiniCartOpen(false)}
        className="absolute inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white dark:bg-slate-900 shadow-2xl flex flex-col border-l border-slate-200 dark:border-slate-800">
          
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-[#2E7D32] dark:text-emerald-400 flex items-center justify-center font-bold">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-base">
                  Your Kirana Cart
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {items.length} {items.length === 1 ? 'item' : 'items'} in your cart
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsMiniCartOpen(false)}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              aria-label="Close cart"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Free Delivery Bar */}
          <div className="p-3 sm:px-5 bg-emerald-50/80 dark:bg-emerald-950/40 border-b border-emerald-100 dark:border-emerald-900/60">
            {amountNeededForFreeDelivery > 0 ? (
              <div>
                <div className="flex items-center justify-between text-xs font-semibold text-emerald-900 dark:text-emerald-200 mb-1.5">
                  <span className="flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    Add <strong>₹{amountNeededForFreeDelivery}</strong> more for FREE Delivery!
                  </span>
                  <span>{freeDeliveryPercent}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-emerald-200 dark:bg-emerald-900 overflow-hidden">
                  <div
                    className="h-full bg-[#2E7D32] transition-all duration-300 rounded-full"
                    style={{ width: `${freeDeliveryPercent}%` }}
                  />
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-800 dark:text-emerald-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>You unlocked FREE Express Delivery to Greater Noida!</span>
              </div>
            )}
          </div>

          {/* Cart Item List */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3 divide-y divide-slate-100 dark:divide-slate-800">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
                <div className="w-20 h-20 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                  <ShoppingBag className="w-10 h-10" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 dark:text-slate-200 text-lg">
                    Your Cart is Empty
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xs">
                    Explore fresh vegetables, dairy, atta, snacks, and more from our Jagat Farm store.
                  </p>
                </div>
                <Link
                  to="/products"
                  onClick={() => setIsMiniCartOpen(false)}
                  className="px-5 py-2.5 rounded-xl bg-[#2E7D32] text-white font-bold text-sm shadow-md hover:bg-[#256628] transition"
                >
                  Start Shopping
                </Link>
              </div>
            ) : (
              items.map((item, idx) => (
                <div key={`${item.productId}-${item.variantId || idx}`} className={`pt-3 first:pt-0 flex gap-3 items-center`}>
                  <img
                    src={item.product.image}
                    alt={item.product.name}
                    className="w-14 h-14 rounded-xl object-cover bg-slate-100 dark:bg-slate-800 shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <h5 className="font-bold text-slate-900 dark:text-slate-100 text-xs sm:text-sm truncate">
                      {item.product.name}
                    </h5>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      {item.unit} • ₹{item.price} each
                    </p>
                    <div className="text-xs font-black text-slate-900 dark:text-white mt-1">
                      ₹{item.price * item.quantity}
                    </div>
                  </div>

                  {/* Quantity Stepper & Delete */}
                  <div className="flex flex-col items-end gap-1.5 shrink-0">
                    <button
                      onClick={() => removeFromCart(item.productId, item.variantId)}
                      className="text-slate-400 hover:text-rose-500 transition p-1"
                      title="Remove item"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-lg p-0.5 text-xs font-bold">
                      <button
                        onClick={() => updateQuantity(item.productId, item.quantity - 1, item.variantId)}
                        className="w-6 h-6 flex items-center justify-center hover:bg-white dark:hover:bg-slate-700 rounded transition"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-5 text-center">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.productId, item.quantity + 1, item.variantId)}
                        disabled={item.quantity >= item.product.stock}
                        className="w-6 h-6 flex items-center justify-center hover:bg-white dark:hover:bg-slate-700 rounded transition disabled:opacity-40"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer & Order Summary */}
          {items.length > 0 && (
            <div className="p-4 sm:p-5 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 space-y-3">
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>Subtotal</span>
                  <span className="font-semibold text-slate-900 dark:text-white">₹{subtotal}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-semibold">
                    <span>Coupon Discount</span>
                    <span>-₹{discount}</span>
                  </div>
                )}
                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>Delivery Fee</span>
                  <span>{deliveryFee === 0 ? <strong className="text-emerald-600">FREE</strong> : `₹${deliveryFee}`}</span>
                </div>
                <div className="flex justify-between text-sm font-extrabold text-slate-900 dark:text-white pt-2 border-t border-slate-200 dark:border-slate-800">
                  <span>Total Payable</span>
                  <span className="text-base text-emerald-700 dark:text-emerald-400">₹{total}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <Link
                  to="/cart"
                  onClick={() => setIsMiniCartOpen(false)}
                  className="py-2.5 px-3 rounded-xl border border-slate-300 dark:border-slate-700 font-bold text-xs text-slate-700 dark:text-slate-200 text-center hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                >
                  View Full Cart
                </Link>
                <button
                  onClick={handleCheckoutClick}
                  className="py-2.5 px-3 rounded-xl bg-[#2E7D32] hover:bg-[#256628] text-white font-bold text-xs text-center flex items-center justify-center gap-1.5 shadow-md transition active:scale-95"
                >
                  <span>Checkout</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

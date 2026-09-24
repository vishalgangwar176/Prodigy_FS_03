import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import confetti from 'canvas-confetti';
import {
  CheckCircle2,
  Package,
  Truck,
  ArrowRight,
  ShoppingBag,
  Clock,
  MapPin,
} from 'lucide-react';
import { getOrderById } from '../services/storageService';

export function OrderConfirmationPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const order = orderId ? getOrderById(orderId) : undefined;

  useEffect(() => {
    // Fire celebratory confetti on mount
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#2E7D32', '#FF8F00', '#10B981', '#F59E0B'],
      });
    } catch {
      // ignore
    }
  }, []);

  return (
    <div className="max-w-2xl mx-auto py-12 px-4 space-y-8 text-center">
      
      {/* Celebration Icon Header */}
      <div className="space-y-3">
        <div className="w-20 h-20 rounded-3xl bg-emerald-100 dark:bg-emerald-950 text-[#2E7D32] dark:text-emerald-400 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/15 animate-bounce">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
          Order Successfully Placed!
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
          Thank you! Our kirana team at Jagat Farm is handpicking your fresh groceries right now.
        </p>
      </div>

      {/* Order Highlights Card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-xl space-y-5 text-left">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 gap-2">
          <div>
            <span className="text-[11px] text-slate-400 font-bold uppercase">Order Reference</span>
            <div className="font-mono font-black text-base text-slate-900 dark:text-white">
              {orderId}
            </div>
          </div>
          <div className="sm:text-right">
            <span className="text-[11px] text-slate-400 font-bold uppercase">Estimated Arrival</span>
            <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 sm:justify-end">
              <Clock className="w-3.5 h-3.5" />
              <span>Today, within 25 mins</span>
            </div>
          </div>
        </div>

        {order && (
          <>
            {/* Delivery address snapshot */}
            <div className="flex items-start gap-3 text-xs bg-slate-50 dark:bg-slate-800/50 p-3.5 rounded-2xl">
              <MapPin className="w-4 h-4 text-[#2E7D32] shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-slate-900 dark:text-white">
                  Delivering to: {order.deliveryAddress.fullName}
                </span>
                <p className="text-slate-500 dark:text-slate-400 mt-0.5">
                  {order.deliveryAddress.flat}, {order.deliveryAddress.street}, {order.deliveryAddress.area}
                </p>
              </div>
            </div>

            {/* Items summary */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Items in this order ({order.items.length})
              </h3>
              <div className="max-h-40 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                {order.items.map(item => (
                  <div key={item.productId} className="py-2 flex items-center justify-between">
                    <span className="truncate max-w-[260px] font-semibold text-slate-800 dark:text-slate-200">
                      {item.quantity}x {item.product.name} ({item.unit})
                    </span>
                    <span className="font-mono font-bold text-slate-900 dark:text-white">
                      ₹{item.price * item.quantity}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Total Paid */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center text-sm font-black">
              <span>Total Amount ({order.payment.method})</span>
              <span className="text-emerald-700 dark:text-emerald-400 text-base">₹{order.pricing.total}</span>
            </div>
          </>
        )}

      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
        <Link
          to={`/track/${orderId}`}
          className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-[#2E7D32] hover:bg-[#256628] text-white font-black text-xs sm:text-sm shadow-xl shadow-emerald-700/25 flex items-center justify-center gap-2 transition active:scale-95"
        >
          <Truck className="w-4 h-4" />
          <span>Track Order in Real-Time</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
        <Link
          to="/products"
          className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs sm:text-sm transition"
        >
          Continue Shopping
        </Link>
      </div>

    </div>
  );
}

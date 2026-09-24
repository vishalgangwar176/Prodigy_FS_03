import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Package,
  CheckCircle2,
  Truck,
  Clock,
  MapPin,
  Phone,
  ArrowLeft,
  XCircle,
  AlertCircle,
  ShieldCheck,
  RotateCcw,
} from 'lucide-react';
import { getOrderById, cancelOrder, storageEvents } from '../services/storageService';
import { Order, OrderStatus } from '../types';
import { useToast } from '../components/common/Toast';

const TRACKING_STEPS: { status: OrderStatus; label: string; desc: string }[] = [
  {
    status: 'Placed',
    label: 'Order Placed',
    desc: 'Order received and being verified by store',
  },
  {
    status: 'Confirmed',
    label: 'Store Confirmed',
    desc: 'Jagat Farm store accepted your grocery list',
  },
  {
    status: 'Packed',
    label: 'Items Packed',
    desc: 'Quality checked & packed in insulated crates',
  },
  {
    status: 'Out for Delivery',
    label: 'Out for Delivery',
    desc: 'Delivery hero en route across Greater Noida',
  },
  {
    status: 'Delivered',
    label: 'Delivered',
    desc: 'Handed over safely at your doorstep',
  },
];

export function OrderTrackingPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const [order, setOrder] = useState<Order | undefined>(() => (orderId ? getOrderById(orderId) : undefined));
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('Ordered by mistake');
  const { success, error } = useToast();

  useEffect(() => {
    if (!orderId) return;

    const reloadOrder = () => {
      const updated = getOrderById(orderId);
      setOrder(updated);
    };

    reloadOrder();

    // Listen for storage events (e.g. admin advancing status in another window or tab)
    const handleStorage = () => reloadOrder();
    storageEvents.addEventListener('orders_updated', handleStorage);
    storageEvents.addEventListener(`order_status_${orderId}`, handleStorage);

    return () => {
      storageEvents.removeEventListener('orders_updated', handleStorage);
      storageEvents.removeEventListener(`order_status_${orderId}`, handleStorage);
    };
  }, [orderId]);

  if (!order) {
    return (
      <div className="max-w-md mx-auto py-16 text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 flex items-center justify-center mx-auto">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Order Not Found</h2>
        <p className="text-xs text-slate-500">Could not locate tracking records for reference #{orderId}.</p>
        <Link
          to="/orders"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#2E7D32] text-white font-bold text-xs"
        >
          <ArrowLeft className="w-4 h-4" />
          View All Orders
        </Link>
      </div>
    );
  }

  // Determine current step index
  const currentStepIndex = TRACKING_STEPS.findIndex(s => s.status === order.status);
  const isCancelled = order.status === 'Cancelled';
  const isDelivered = order.status === 'Delivered';
  const canCancel = ['Placed', 'Confirmed'].includes(order.status);

  const handleCancelOrder = () => {
    const ok = cancelOrder(order.id, cancelReason);
    if (ok) {
      setCancelModalOpen(false);
      setOrder(getOrderById(order.id));
      success('Your order has been cancelled.');
    } else {
      error('Order cannot be cancelled as it is already packed or dispatched.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      
      {/* Top Banner Navigation */}
      <div className="flex items-center justify-between">
        <Link
          to="/orders"
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-[#2E7D32]"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Orders</span>
        </Link>

        <span className="text-xs text-slate-400 font-mono">
          Ref: <strong>{order.id}</strong>
        </span>
      </div>

      {/* Main Status Header Card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#2E7D32] dark:text-emerald-400">
              Live Express Kirana Tracking
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight mt-1">
              {isCancelled
                ? 'Order Cancelled'
                : isDelivered
                ? 'Order Delivered'
                : 'Arriving in 20-30 Mins'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Dispatched from <strong>FreshKart Jagat Farm Store</strong> to <strong>{order.deliveryAddress.area}</strong>
            </p>
          </div>

          <div className="flex items-center gap-3">
            {canCancel && (
              <button
                onClick={() => setCancelModalOpen(true)}
                className="px-4 py-2 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-xs font-bold transition"
              >
                Cancel Order
              </button>
            )}
            <a
              href="tel:+919811234567"
              className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 text-xs font-bold flex items-center gap-1.5 transition"
            >
              <Phone className="w-3.5 h-3.5 text-[#2E7D32]" />
              <span>Call Store</span>
            </a>
          </div>
        </div>

        {/* Timeline Visualization */}
        {!isCancelled ? (
          <div className="py-4">
            {/* Desktop Horizontal Stepper */}
            <div className="hidden md:grid grid-cols-5 gap-2 relative">
              {TRACKING_STEPS.map((step, idx) => {
                const isPassed = idx <= currentStepIndex;
                const isCurrent = idx === currentStepIndex;

                return (
                  <div key={step.status} className="flex flex-col items-center text-center space-y-2 relative">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs transition z-10 ${
                        isCurrent
                          ? 'bg-[#2E7D32] text-white ring-4 ring-emerald-500/20 shadow-lg scale-110'
                          : isPassed
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                      }`}
                    >
                      {isPassed ? <CheckCircle2 className="w-5 h-5" /> : idx + 1}
                    </div>

                    <h4
                      className={`text-xs font-bold ${
                        isPassed ? 'text-slate-900 dark:text-white' : 'text-slate-400'
                      }`}
                    >
                      {step.label}
                    </h4>
                    <p className="text-[10px] text-slate-400 leading-tight max-w-[120px]">
                      {step.desc}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* Mobile Vertical Stepper */}
            <div className="md:hidden space-y-6 pl-2 border-l-2 border-slate-200 dark:border-slate-800 ml-4">
              {TRACKING_STEPS.map((step, idx) => {
                const isPassed = idx <= currentStepIndex;
                const isCurrent = idx === currentStepIndex;

                return (
                  <div key={step.status} className="relative pl-6">
                    <div
                      className={`absolute -left-[17px] top-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                        isCurrent
                          ? 'bg-[#2E7D32] text-white ring-4 ring-emerald-500/20'
                          : isPassed
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                      }`}
                    >
                      {isPassed ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                    </div>
                    <div className="space-y-0.5">
                      <h4
                        className={`text-xs font-bold ${
                          isPassed ? 'text-slate-900 dark:text-white' : 'text-slate-400'
                        }`}
                      >
                        {step.label}
                      </h4>
                      <p className="text-[11px] text-slate-500">{step.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 flex items-center gap-3">
            <XCircle className="w-6 h-6 text-rose-600 shrink-0" />
            <div className="text-xs">
              <span className="font-bold text-rose-800 dark:text-rose-300 block">
                This order was cancelled
              </span>
              <p className="text-rose-600 dark:text-rose-400">
                Any online payment has been refunded to your original payment source.
              </p>
            </div>
          </div>
        )}

        {/* Real-time Status History Log */}
        <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 space-y-2">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Live Status Log
          </h3>
          <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
            {order.statusHistory.map((sh, i) => (
              <div key={i} className="py-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#2E7D32]" />
                  <span className="font-bold text-slate-800 dark:text-slate-200">{sh.status}</span>
                  {sh.note && <span className="text-slate-500 italic">- {sh.note}</span>}
                </div>
                <span className="text-[10px] text-slate-400 font-mono">
                  {new Date(sh.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Order Details & Delivery Map Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Delivery Address & Driver Info */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 space-y-4">
          <h3 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
            <MapPin className="w-4 h-4 text-[#2E7D32]" />
            Delivery Destination
          </h3>

          <div className="space-y-1 text-xs">
            <div className="font-bold text-slate-900 dark:text-white">
              {order.deliveryAddress.fullName}
            </div>
            <div className="text-slate-600 dark:text-slate-400">
              {order.deliveryAddress.flat}, {order.deliveryAddress.street}
            </div>
            <div className="text-slate-500">
              {order.deliveryAddress.area}, Greater Noida - {order.deliveryAddress.pincode}
            </div>
            <div className="text-slate-500 font-mono pt-1">
              Contact: {order.deliveryAddress.phone}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
            <div>
              <span className="text-slate-400 block text-[10px]">Assigned Rider</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">
                Rajesh Kumar (UP-16-EK-4902)
              </span>
            </div>
            <span className="text-[10px] bg-emerald-100 dark:bg-emerald-950 text-[#2E7D32] px-2 py-1 rounded-md font-bold">
              Vaccinated & Verified
            </span>
          </div>
        </div>

        {/* Ordered Items & Bill */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 space-y-4">
          <h3 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
            <Package className="w-4 h-4 text-[#2E7D32]" />
            Ordered Groceries ({order.items.length})
          </h3>

          <div className="max-h-48 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800 text-xs">
            {order.items.map(item => (
              <div key={item.productId} className="py-2 flex items-center justify-between">
                <span className="truncate max-w-[200px] text-slate-700 dark:text-slate-300">
                  {item.quantity}x {item.product.name}
                </span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">
                  ₹{item.price * item.quantity}
                </span>
              </div>
            ))}
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-1 text-xs">
            <div className="flex justify-between text-slate-500">
              <span>Subtotal</span>
              <span>₹{order.pricing.subtotal}</span>
            </div>
            {order.pricing.discount > 0 && (
              <div className="flex justify-between text-emerald-600 font-semibold">
                <span>Discount ({order.pricing.couponCode})</span>
                <span>-₹{order.pricing.discount}</span>
              </div>
            )}
            <div className="flex justify-between text-slate-500">
              <span>Delivery Fee</span>
              <span>{order.pricing.deliveryFee === 0 ? 'FREE' : `₹${order.pricing.deliveryFee}`}</span>
            </div>
            <div className="flex justify-between font-black text-sm text-slate-900 dark:text-white pt-1 border-t">
              <span>Paid Amount</span>
              <span className="text-emerald-700 dark:text-emerald-400">₹{order.pricing.total}</span>
            </div>
          </div>
        </div>

      </div>

      {/* Cancellation Modal */}
      {cancelModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              Cancel Order #{order.id}?
            </h3>
            <p className="text-xs text-slate-500">
              Are you sure you want to cancel? Items will be returned to store shelves.
            </p>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Reason for cancellation:
              </label>
              <select
                value={cancelReason}
                onChange={e => setCancelReason(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
              >
                <option>Ordered by mistake</option>
                <option>Delivery address changed</option>
                <option>Need items earlier</option>
                <option>Forgot to apply coupon code</option>
                <option>Other reason</option>
              </select>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setCancelModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
              >
                Go Back
              </button>
              <button
                onClick={handleCancelOrder}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md"
              >
                Confirm Cancellation
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

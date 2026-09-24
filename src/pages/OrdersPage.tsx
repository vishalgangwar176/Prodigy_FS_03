import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Package,
  Clock,
  CheckCircle2,
  XCircle,
  Truck,
  RotateCcw,
  ArrowRight,
  ShoppingBag,
  AlertCircle,
} from 'lucide-react';
import { getOrders, storageEvents } from '../services/storageService';
import { Order, OrderStatus } from '../types';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useToast } from '../components/common/Toast';

export function OrdersPage() {
  const { user } = useAuth();
  const { addToCart } = useCart();
  const { success } = useToast();
  const navigate = useNavigate();

  const [orders, setOrders] = useState<Order[]>([]);
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'DELIVERED' | 'CANCELLED'>('ALL');

  useEffect(() => {
    const fetchOrders = () => {
      const all = getOrders();
      // If user is logged in, show user's orders or sample orders
      if (user) {
        const userOrders = all.filter(
          o => o.userId === user.uid || o.userEmail.toLowerCase() === user.email.toLowerCase()
        );
        // If user is demo customer or newly created, also show the default orders so they can test tracking
        setOrders(userOrders.length > 0 ? userOrders : all);
      } else {
        setOrders(all);
      }
    };

    fetchOrders();
    storageEvents.addEventListener('orders_updated', fetchOrders);
    return () => storageEvents.removeEventListener('orders_updated', fetchOrders);
  }, [user]);

  const filteredOrders = orders.filter(order => {
    if (statusFilter === 'ALL') return true;
    if (statusFilter === 'ACTIVE') {
      return ['Placed', 'Confirmed', 'Packed', 'Out for Delivery'].includes(order.status);
    }
    if (statusFilter === 'DELIVERED') return order.status === 'Delivered';
    if (statusFilter === 'CANCELLED') return order.status === 'Cancelled';
    return true;
  });

  const handleReorder = (order: Order) => {
    order.items.forEach(item => {
      addToCart(item.product, item.quantity, item.variantId);
    });
    success(`Re-added ${order.items.length} items from order ${order.id} to cart!`);
    navigate('/cart');
  };

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'Placed':
      case 'Confirmed':
        return (
          <span className="inline-flex items-center gap-1 bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 px-2.5 py-1 rounded-full text-xs font-bold border border-sky-200 dark:border-sky-800">
            <Clock className="w-3 h-3" />
            {status}
          </span>
        );
      case 'Packed':
        return (
          <span className="inline-flex items-center gap-1 bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 px-2.5 py-1 rounded-full text-xs font-bold border border-amber-200 dark:border-amber-800">
            <Package className="w-3 h-3" />
            Packed
          </span>
        );
      case 'Out for Delivery':
        return (
          <span className="inline-flex items-center gap-1 bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 px-2.5 py-1 rounded-full text-xs font-bold border border-purple-200 dark:border-purple-800 animate-pulse">
            <Truck className="w-3 h-3" />
            Out for Delivery
          </span>
        );
      case 'Delivered':
        return (
          <span className="inline-flex items-center gap-1 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 px-2.5 py-1 rounded-full text-xs font-bold border border-emerald-200 dark:border-emerald-800">
            <CheckCircle2 className="w-3 h-3" />
            Delivered
          </span>
        );
      case 'Cancelled':
        return (
          <span className="inline-flex items-center gap-1 bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 px-2.5 py-1 rounded-full text-xs font-bold border border-rose-200 dark:border-rose-800">
            <XCircle className="w-3 h-3" />
            Cancelled
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 pb-20">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <Package className="w-6 h-6 text-[#2E7D32]" />
            My Orders
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Track and manage your Greater Noida kirana deliveries in real time
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-bold">
          {(['ALL', 'ACTIVE', 'DELIVERED', 'CANCELLED'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setStatusFilter(tab)}
              className={`px-3 py-1.5 rounded-lg transition capitalize ${
                statusFilter === tab
                  ? 'bg-white dark:bg-slate-700 text-[#2E7D32] dark:text-emerald-400 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
              }`}
            >
              {tab.toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-12 text-center border border-slate-200/80 dark:border-slate-800 space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
            <ShoppingBag className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            No orders found
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            You don't have any orders under the "{statusFilter.toLowerCase()}" filter.
          </p>
          <Link
            to="/products"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#2E7D32] text-white font-bold text-xs shadow-md"
          >
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map(order => (
            <div
              key={order.id}
              className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4 hover:border-emerald-500/30 transition"
            >
              {/* Order Header bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 gap-2">
                <div className="flex items-center gap-3">
                  <span className="font-mono font-black text-sm text-slate-900 dark:text-white">
                    {order.id}
                  </span>
                  <span className="text-slate-300 dark:text-slate-700">•</span>
                  <span className="text-xs text-slate-500">
                    {new Date(order.createdAt).toLocaleString()}
                  </span>
                </div>
                <div>{getStatusBadge(order.status)}</div>
              </div>

              {/* Items Preview */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {order.items.slice(0, 3).map(item => (
                  <div
                    key={item.productId}
                    className="flex items-center gap-3 p-2 rounded-xl bg-slate-50 dark:bg-slate-800/40 text-xs"
                  >
                    <img
                      src={item.product.image}
                      alt={item.product.name}
                      className="w-12 h-12 rounded-lg object-cover bg-slate-100 dark:bg-slate-800 shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <h4 className="font-bold text-slate-800 dark:text-slate-200 truncate">
                        {item.product.name}
                      </h4>
                      <p className="text-[11px] text-slate-500">
                        {item.quantity} x ₹{item.price} ({item.unit})
                      </p>
                    </div>
                  </div>
                ))}
                {order.items.length > 3 && (
                  <div className="flex items-center justify-center p-2 rounded-xl bg-slate-50 dark:bg-slate-800/40 text-xs font-bold text-slate-500">
                    +{order.items.length - 3} more items
                  </div>
                )}
              </div>

              {/* Order Footer summary & actions */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800 gap-3">
                <div className="text-xs space-y-0.5">
                  <span className="text-slate-500">
                    Delivered to:{' '}
                    <strong className="text-slate-800 dark:text-slate-200">
                      {order.deliveryAddress.fullName} ({order.deliveryAddress.area})
                    </strong>
                  </span>
                  <div className="font-black text-sm text-slate-900 dark:text-white">
                    Total: ₹{order.pricing.total}{' '}
                    <span className="text-xs text-slate-400 font-normal">
                      via {order.payment.method}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto">
                  <button
                    onClick={() => handleReorder(order)}
                    className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-1.5 transition"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-[#2E7D32]" />
                    <span>Reorder</span>
                  </button>

                  <Link
                    to={`/track/${order.id}`}
                    className="px-4 py-2 rounded-xl bg-[#2E7D32] hover:bg-[#256628] text-white text-xs font-bold shadow-md flex items-center gap-1.5 transition"
                  >
                    <Truck className="w-3.5 h-3.5" />
                    <span>Track Live</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}

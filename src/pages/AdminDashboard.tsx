import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  Package,
  TrendingUp,
  IndianRupee,
  HelpCircle,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  Clock,
  Truck,
  Send,
  X,
  Search,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import {
  getProducts,
  saveProduct,
  deleteProduct,
  getOrders,
  updateOrderStatus,
  getTickets,
  updateTicket,
  storageEvents,
} from '../services/storageService';
import { Product, Order, SupportTicket, OrderStatus, CategoryType } from '../types';
import { useToast } from '../components/common/Toast';

export function AdminDashboard() {
  const { user, isAdmin, loginAsDemoAdmin } = useAuth();
  const { success, error } = useToast();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'orders' | 'tickets'>('overview');
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [tickets, setTickets] = useState<SupportTicket[]>([]);

  // Product modal
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productForm, setProductForm] = useState({
    name: '',
    brand: '',
    category: 'Staples' as CategoryType,
    price: 99,
    mrp: 120,
    unit: '1 kg',
    stock: 50,
    image: '',
    description: '',
    isFeatured: false,
    isBestSeller: false,
    isDealOfDay: false,
  });

  // Ticket reply modal
  const [replyTicket, setReplyTicket] = useState<SupportTicket | null>(null);
  const [replyText, setReplyText] = useState('');
  const [replyStatus, setReplyStatus] = useState<'Open' | 'In Progress' | 'Resolved'>('Resolved');

  const [searchFilter, setSearchFilter] = useState('');

  const refreshData = () => {
    setProducts(getProducts());
    setOrders(getOrders());
    setTickets(getTickets());
  };

  useEffect(() => {
    refreshData();
    storageEvents.addEventListener('products_updated', refreshData);
    storageEvents.addEventListener('orders_updated', refreshData);
    storageEvents.addEventListener('tickets_updated', refreshData);
    return () => {
      storageEvents.removeEventListener('products_updated', refreshData);
      storageEvents.removeEventListener('orders_updated', refreshData);
      storageEvents.removeEventListener('tickets_updated', refreshData);
    };
  }, []);

  if (!isAdmin) {
    return (
      <div className="max-w-md mx-auto py-16 px-4 text-center space-y-5">
        <div className="w-16 h-16 rounded-2xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 flex items-center justify-center mx-auto">
          <ShieldCheck className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-black text-slate-900 dark:text-white">Admin Access Required</h2>
        <p className="text-xs text-slate-500 max-w-sm mx-auto">
          The Admin Dashboard is protected for FreshKart store managers. You can log in using the pre-seeded admin credentials below.
        </p>
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 text-xs font-mono space-y-1 text-slate-600 dark:text-slate-300">
          <div>Email: <strong>admin@freshkart.com</strong></div>
          <div>Password: <strong>Admin@123</strong></div>
        </div>
        <button
          onClick={async () => {
            await loginAsDemoAdmin();
            success('Signed in as Admin!');
          }}
          className="w-full py-3 rounded-2xl bg-[#2E7D32] hover:bg-[#256628] text-white font-bold text-xs shadow-lg"
        >
          Click to Login as Demo Admin
        </button>
      </div>
    );
  }

  // Calculations
  const totalRevenue = orders.reduce((sum, o) => (o.status !== 'Cancelled' ? sum + o.pricing.total : sum), 0);
  const totalOrdersCount = orders.length;
  const openTicketsCount = tickets.filter(t => t.status !== 'Resolved').length;

  // 7-day orders trend simulation
  const last7Days = [
    { day: 'Mon', count: 18, amount: 7200 },
    { day: 'Tue', count: 24, amount: 9800 },
    { day: 'Wed', count: 32, amount: 14200 },
    { day: 'Thu', count: 28, amount: 11900 },
    { day: 'Fri', count: 42, amount: 18400 },
    { day: 'Sat', count: 56, amount: 26100 },
    { day: 'Sun (Today)', count: 48, amount: 22400 },
  ];

  const maxDayAmount = Math.max(...last7Days.map(d => d.amount));

  // Product CRUD
  const openAddProductModal = () => {
    setEditingProduct(null);
    setProductForm({
      name: '',
      brand: '',
      category: 'Fruits & Vegetables',
      price: 40,
      mrp: 50,
      unit: '1 kg',
      stock: 50,
      image: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=600&fit=crop',
      description: 'Farm fresh produce sourced for Greater Noida homes.',
      isFeatured: false,
      isBestSeller: false,
      isDealOfDay: false,
    });
    setIsProductModalOpen(true);
  };

  const openEditProductModal = (prod: Product) => {
    setEditingProduct(prod);
    setProductForm({
      name: prod.name,
      brand: prod.brand,
      category: prod.category,
      price: prod.price,
      mrp: prod.mrp,
      unit: prod.unit,
      stock: prod.stock,
      image: prod.image,
      description: prod.description,
      isFeatured: !!prod.isFeatured,
      isBestSeller: !!prod.isBestSeller,
      isDealOfDay: !!prod.isDealOfDay,
    });
    setIsProductModalOpen(true);
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!productForm.name.trim() || !productForm.brand.trim()) {
      error('Please provide name and brand.');
      return;
    }

    const discountPercent =
      productForm.mrp > productForm.price
        ? Math.round(((productForm.mrp - productForm.price) / productForm.mrp) * 100)
        : 0;

    const newProd: Product = {
      id: editingProduct ? editingProduct.id : 'prod-custom-' + Date.now(),
      name: productForm.name.trim(),
      brand: productForm.brand.trim(),
      category: productForm.category,
      price: Number(productForm.price),
      mrp: Number(productForm.mrp),
      unit: productForm.unit.trim(),
      stock: Number(productForm.stock),
      image: productForm.image.trim() || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=600&fit=crop',
      description: productForm.description.trim(),
      highlights: editingProduct ? editingProduct.highlights : ['100% genuine guaranteed', 'Direct from local hub'],
      rating: editingProduct ? editingProduct.rating : 4.8,
      ratingCount: editingProduct ? editingProduct.ratingCount : 1,
      discountPercent,
      isFeatured: productForm.isFeatured,
      isBestSeller: productForm.isBestSeller,
      isDealOfDay: productForm.isDealOfDay,
    };

    saveProduct(newProd);
    setIsProductModalOpen(false);
    success(editingProduct ? 'Product updated successfully!' : 'Product added to catalog!');
  };

  const handleDeleteProduct = (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete ${name} from the catalog?`)) {
      deleteProduct(id);
      success('Product deleted.');
    }
  };

  // Orders update
  const handleOrderStatusChange = (orderId: string, newStatus: OrderStatus) => {
    updateOrderStatus(orderId, newStatus);
    success(`Order ${orderId} updated to ${newStatus}!`);
  };

  // Tickets reply
  const handleReplyTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyTicket) return;
    updateTicket(replyTicket.id, replyStatus, replyText.trim());
    setReplyTicket(null);
    setReplyText('');
    success('Reply sent and ticket updated!');
  };

  return (
    <div className="space-y-8 pb-24">
      
      {/* Dashboard Top Header */}
      <div className="bg-slate-900 text-white p-6 sm:p-8 rounded-3xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-500 text-slate-950 flex items-center justify-center font-black text-sm">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight">
              FreshKart Store Manager Portal
            </h1>
          </div>
          <p className="text-xs text-slate-400">
            Greater Noida Hub (Jagat Farm, Gamma 1) • Live Inventory & Orders Control
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1.5 bg-slate-800 p-1.5 rounded-2xl text-xs font-bold self-start sm:self-auto">
          {(['overview', 'orders', 'products', 'tickets'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3.5 py-2 rounded-xl capitalize transition ${
                activeTab === tab
                  ? 'bg-[#2E7D32] text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* OVERVIEW TAB */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          
          {/* 4 Metric Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Revenue</span>
                <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-[#2E7D32] flex items-center justify-center font-bold">
                  ₹
                </div>
              </div>
              <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                ₹{totalRevenue.toLocaleString()}
              </div>
              <span className="text-[11px] text-emerald-600 font-semibold">+18.4% this week</span>
            </div>

            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Orders</span>
                <div className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-600 flex items-center justify-center font-bold">
                  <Package className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                {totalOrdersCount}
              </div>
              <span className="text-[11px] text-slate-400">Greater Noida deliveries</span>
            </div>

            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Catalog SKUs</span>
                <div className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-950 text-amber-600 flex items-center justify-center font-bold">
                  <Sparkles className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                {products.length}
              </div>
              <span className="text-[11px] text-slate-400">Across 6 categories</span>
            </div>

            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Open Tickets</span>
                <div className="w-8 h-8 rounded-xl bg-rose-100 dark:bg-rose-950 text-rose-600 flex items-center justify-center font-bold">
                  <HelpCircle className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                {openTicketsCount}
              </div>
              <span className="text-[11px] text-slate-400">Pending customer queries</span>
            </div>
          </div>

          {/* 7-Day Orders Trend Bar Chart */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-base">
                  Last 7 Days Sales Trend
                </h3>
                <p className="text-xs text-slate-500">Daily store order revenue across Greater Noida</p>
              </div>
              <span className="text-xs font-bold text-[#2E7D32] bg-emerald-50 dark:bg-emerald-950 px-2.5 py-1 rounded-lg">
                Jagat Farm Hub Peak: Sat & Sun
              </span>
            </div>

            <div className="grid grid-cols-7 gap-2 sm:gap-4 items-end h-48 pt-6 border-b border-slate-100 dark:border-slate-800">
              {last7Days.map(d => {
                const heightPercent = Math.round((d.amount / maxDayAmount) * 100);
                return (
                  <div key={d.day} className="flex flex-col items-center gap-2 h-full justify-end group">
                    <span className="text-[10px] font-mono text-slate-400 opacity-0 group-hover:opacity-100 transition">
                      ₹{d.amount}
                    </span>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-t-xl h-full flex items-end overflow-hidden">
                      <div
                        className="w-full bg-[#2E7D32] hover:bg-emerald-500 transition-all rounded-t-xl"
                        style={{ height: `${heightPercent}%` }}
                      />
                    </div>
                    <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400 truncate max-w-full text-center">
                      {d.day}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recent Orders Quick Table */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 dark:text-white text-base">
                Recent Customer Orders
              </h3>
              <button
                onClick={() => setActiveTab('orders')}
                className="text-xs font-bold text-[#2E7D32] hover:underline"
              >
                Manage All Orders
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400">
                    <th className="pb-3 font-semibold">Order ID</th>
                    <th className="pb-3 font-semibold">Customer</th>
                    <th className="pb-3 font-semibold">Sector</th>
                    <th className="pb-3 font-semibold">Total</th>
                    <th className="pb-3 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {orders.slice(0, 5).map(o => (
                    <tr key={o.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="py-3 font-mono font-bold">{o.id}</td>
                      <td className="py-3">{o.userName}</td>
                      <td className="py-3 text-slate-500">{o.deliveryAddress.area}</td>
                      <td className="py-3 font-bold text-slate-900 dark:text-white">₹{o.pricing.total}</td>
                      <td className="py-3">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-[#2E7D32] dark:bg-emerald-950 dark:text-emerald-300">
                          {o.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* ORDERS TAB */}
      {activeTab === 'orders' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-black text-slate-900 dark:text-white">
                Orders Management ({orders.length})
              </h2>
              <p className="text-xs text-slate-500">
                Update order statuses to automatically reflect on the customer's live tracking screen
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {orders.map(order => (
              <div
                key={order.id}
                className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3 hover:border-emerald-500/40 transition"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                  <div>
                    <span className="font-mono font-bold text-sm text-slate-900 dark:text-white">
                      {order.id}
                    </span>
                    <span className="text-slate-400 ml-2">
                      {new Date(order.createdAt).toLocaleString()}
                    </span>
                  </div>

                  {/* Status update selector */}
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400 font-medium text-xs">Advance Status:</span>
                    <select
                      value={order.status}
                      onChange={e => handleOrderStatusChange(order.id, e.target.value as OrderStatus)}
                      className="px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-[#2E7D32]"
                    >
                      <option value="Placed">Placed</option>
                      <option value="Confirmed">Confirmed</option>
                      <option value="Packed">Packed</option>
                      <option value="Out for Delivery">Out for Delivery</option>
                      <option value="Delivered">Delivered</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Customer</span>
                    <strong className="text-slate-800 dark:text-slate-200">{order.userName}</strong>
                    <p className="text-slate-500">{order.userPhone}</p>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Address</span>
                    <p className="text-slate-700 dark:text-slate-300 truncate">
                      {order.deliveryAddress.flat}, {order.deliveryAddress.area}
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Bill & Mode</span>
                    <strong className="text-slate-900 dark:text-white">
                      ₹{order.pricing.total} ({order.payment.method})
                    </strong>
                  </div>
                </div>

                <div className="text-xs text-slate-600 dark:text-slate-400 flex items-center justify-between">
                  <span>Items: {order.items.map(i => `${i.quantity}x ${i.product.name}`).join(', ')}</span>
                  <Link
                    to={`/track/${order.id}`}
                    target="_blank"
                    className="text-[#2E7D32] dark:text-emerald-400 font-bold hover:underline"
                  >
                    View Customer Screen →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* PRODUCTS TAB */}
      {activeTab === 'products' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-black text-slate-900 dark:text-white">
                Catalog Inventory ({products.length} Products)
              </h2>
              <p className="text-xs text-slate-500">
                Add, edit prices, update stock levels, or delete grocery items
              </p>
            </div>

            <button
              onClick={openAddProductModal}
              className="px-4 py-2.5 rounded-xl bg-[#2E7D32] hover:bg-[#256628] text-white font-bold text-xs shadow-md flex items-center gap-1.5 transition self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Grocery Item</span>
            </button>
          </div>

          {/* Search input for products */}
          <div className="relative">
            <input
              type="text"
              value={searchFilter}
              onChange={e => setSearchFilter(e.target.value)}
              placeholder="Filter products by name, brand, or category..."
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-[#2E7D32]"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400">
                  <th className="pb-3 font-semibold">Item</th>
                  <th className="pb-3 font-semibold">Category</th>
                  <th className="pb-3 font-semibold">Price / MRP</th>
                  <th className="pb-3 font-semibold">Stock</th>
                  <th className="pb-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {products
                  .filter(
                    p =>
                      p.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
                      p.brand.toLowerCase().includes(searchFilter.toLowerCase()) ||
                      p.category.toLowerCase().includes(searchFilter.toLowerCase())
                  )
                  .map(p => (
                    <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="py-3">
                        <div className="flex items-center gap-3">
                          <img
                            src={p.image}
                            alt={p.name}
                            className="w-10 h-10 rounded-lg object-cover bg-slate-100 shrink-0"
                          />
                          <div>
                            <span className="font-bold text-slate-900 dark:text-white block">
                              {p.name}
                            </span>
                            <span className="text-[10px] text-slate-400 font-semibold uppercase">
                              {p.brand} • {p.unit}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 text-slate-600 dark:text-slate-300">{p.category}</td>
                      <td className="py-3 font-bold text-slate-900 dark:text-white">
                        ₹{p.price} <span className="text-slate-400 font-normal line-through">₹{p.mrp}</span>
                      </td>
                      <td className="py-3">
                        <span
                          className={`font-bold ${
                            p.stock <= 5 ? 'text-amber-600' : 'text-emerald-600'
                          }`}
                        >
                          {p.stock} units
                        </span>
                      </td>
                      <td className="py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openEditProductModal(p)}
                            className="p-1.5 text-slate-500 hover:text-[#2E7D32] hover:bg-slate-100 rounded-lg transition"
                            title="Edit"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(p.id, p.name)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TICKETS TAB */}
      {activeTab === 'tickets' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 space-y-4">
          <div>
            <h2 className="text-xl font-black text-slate-900 dark:text-white">
              Customer Support Tickets ({tickets.length})
            </h2>
            <p className="text-xs text-slate-500">
              Respond to customer questions, quality reports and delivery updates
            </p>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {tickets.map(t => (
              <div key={t.id} className="py-4 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-slate-900 dark:text-white">{t.id}</span>
                    <span className="text-slate-400">•</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {t.userName} ({t.userEmail})
                    </span>
                    {t.orderId && (
                      <span className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-[10px]">
                        Order: {t.orderId}
                      </span>
                    )}
                  </div>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      t.status === 'Resolved'
                        ? 'bg-emerald-100 text-[#2E7D32]'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {t.status}
                  </span>
                </div>

                <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">{t.subject}</h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl">
                  {t.message}
                </p>

                {t.adminReply && (
                  <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-xs">
                    <strong className="text-[#2E7D32]">Current Store Reply:</strong>
                    <p className="text-slate-700 dark:text-slate-300 mt-0.5">{t.adminReply}</p>
                  </div>
                )}

                <div className="pt-1">
                  <button
                    onClick={() => {
                      setReplyTicket(t);
                      setReplyText(t.adminReply || '');
                      setReplyStatus(t.status);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-[#2E7D32] hover:text-white text-xs font-bold text-slate-700 dark:text-slate-300 transition"
                  >
                    {t.adminReply ? 'Update Reply / Status' : 'Reply to Customer'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Product Add / Edit Modal */}
      {isProductModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                {editingProduct ? 'Edit Grocery Product' : 'Add New Grocery Product'}
              </h3>
              <button
                onClick={() => setIsProductModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Product Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Amul Pure Cow Ghee"
                  value={productForm.name}
                  onChange={e => setProductForm({ ...productForm, name: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Brand *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Amul"
                    value={productForm.brand}
                    onChange={e => setProductForm({ ...productForm, brand: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Category *</label>
                  <select
                    value={productForm.category}
                    onChange={e => setProductForm({ ...productForm, category: e.target.value as CategoryType })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    <option>Fruits & Vegetables</option>
                    <option>Dairy & Eggs</option>
                    <option>Staples</option>
                    <option>Snacks</option>
                    <option>Beverages</option>
                    <option>Household</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Price (₹) *</label>
                  <input
                    type="number"
                    required
                    value={productForm.price}
                    onChange={e => setProductForm({ ...productForm, price: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">MRP (₹) *</label>
                  <input
                    type="number"
                    required
                    value={productForm.mrp}
                    onChange={e => setProductForm({ ...productForm, mrp: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Unit/Weight *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 1 kg"
                    value={productForm.unit}
                    onChange={e => setProductForm({ ...productForm, unit: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Available Stock</label>
                  <input
                    type="number"
                    required
                    value={productForm.stock}
                    onChange={e => setProductForm({ ...productForm, stock: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Image URL</label>
                  <input
                    type="url"
                    placeholder="https://..."
                    value={productForm.image}
                    onChange={e => setProductForm({ ...productForm, image: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Description</label>
                <textarea
                  rows={2}
                  value={productForm.description}
                  onChange={e => setProductForm({ ...productForm, description: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              {/* Flags */}
              <div className="flex items-center gap-4 pt-1">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={productForm.isFeatured}
                    onChange={e => setProductForm({ ...productForm, isFeatured: e.target.checked })}
                    className="accent-[#2E7D32]"
                  />
                  <span>Featured</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={productForm.isBestSeller}
                    onChange={e => setProductForm({ ...productForm, isBestSeller: e.target.checked })}
                    className="accent-[#2E7D32]"
                  />
                  <span>Best Seller</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={productForm.isDealOfDay}
                    onChange={e => setProductForm({ ...productForm, isDealOfDay: e.target.checked })}
                    className="accent-[#2E7D32]"
                  />
                  <span>Deal of Day</span>
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsProductModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#2E7D32] hover:bg-[#256628] text-white font-bold text-xs shadow-md"
                >
                  Save Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Ticket Reply Modal */}
      {replyTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b">
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                Reply to {replyTicket.id}
              </h3>
              <button onClick={() => setReplyTicket(null)} className="text-slate-400 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleReplyTicket} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Ticket Status
                </label>
                <select
                  value={replyStatus}
                  onChange={e => setReplyStatus(e.target.value as any)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                >
                  <option value="Open">Open</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Resolved">Resolved</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Manager Reply Message
                </label>
                <textarea
                  rows={4}
                  required
                  value={replyText}
                  onChange={e => setReplyText(e.target.value)}
                  placeholder="Type official store reply to customer..."
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setReplyTicket(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#2E7D32] text-white text-xs font-bold shadow-md"
                >
                  Send Reply
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

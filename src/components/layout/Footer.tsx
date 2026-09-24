import React from 'react';
import { Link } from 'react-router-dom';
import {
  ShoppingBag,
  MapPin,
  Phone,
  Clock,
  Mail,
  ShieldCheck,
  Truck,
  HeartHandshake,
  CreditCard,
} from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 pt-12 pb-24 sm:pb-12 text-slate-600 dark:text-slate-400 text-sm transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Value Props Bar */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pb-12 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-4 p-4 rounded-2xl bg-[#F8FAF5] dark:bg-slate-800/50">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-[#2E7D32] dark:text-emerald-400 flex items-center justify-center shrink-0">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 dark:text-slate-100 text-base">
                25-Min Greater Noida Delivery
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Dispatched straight from our Jagat Farm hub
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 rounded-2xl bg-[#F8FAF5] dark:bg-slate-800/50">
            <div className="w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 dark:text-slate-100 text-base">
                100% Quality Guarantee
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Instant refund or replacement at your doorstep
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 rounded-2xl bg-[#F8FAF5] dark:bg-slate-800/50">
            <div className="w-12 h-12 rounded-xl bg-sky-100 dark:bg-sky-950 text-sky-600 dark:text-sky-400 flex items-center justify-center shrink-0">
              <CreditCard className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 dark:text-slate-100 text-base">
                UPI, Razorpay & Cash on Delivery
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Safe, contactless & verified payments
              </p>
            </div>
          </div>
        </div>

        {/* Main Footer Links */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 py-10">
          
          {/* Col 1: Brand & Kirana Store Info */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#2E7D32] flex items-center justify-center text-white">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <span className="text-xl font-black text-slate-900 dark:text-white">
                Fresh<span className="text-[#2E7D32] dark:text-emerald-400">Kart</span>
              </span>
            </Link>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Your trusted neighbourhood kirana supermarket in Greater Noida. Sourcing farm-fresh produce and daily household essentials directly to your home.
            </p>
            <div className="pt-2 text-xs space-y-2">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-[#2E7D32] shrink-0 mt-0.5" />
                <span>Shop 4, Jagat Farm Commercial Complex, Gamma 1, Greater Noida, UP 201310</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#2E7D32] shrink-0" />
                <span>Open 7:00 AM – 11:00 PM (All 7 Days)</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-[#2E7D32] shrink-0" />
                <span>+91 98112 34567 / 0120-2320011</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#2E7D32] shrink-0" />
                <span>orders@freshkart.in</span>
              </div>
            </div>
          </div>

          {/* Col 2: Categories */}
          <div>
            <h5 className="font-bold text-slate-900 dark:text-slate-100 text-sm mb-4">
              Grocery Categories
            </h5>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/products?category=Fruits %26 Vegetables" className="hover:text-[#2E7D32] dark:hover:text-emerald-400 transition">
                  Fresh Fruits & Vegetables
                </Link>
              </li>
              <li>
                <Link to="/products?category=Dairy %26 Eggs" className="hover:text-[#2E7D32] dark:hover:text-emerald-400 transition">
                  Milk, Butter, Paneer & Eggs
                </Link>
              </li>
              <li>
                <Link to="/products?category=Staples" className="hover:text-[#2E7D32] dark:hover:text-emerald-400 transition">
                  Atta, Rice, Dal & Cooking Oils
                </Link>
              </li>
              <li>
                <Link to="/products?category=Snacks" className="hover:text-[#2E7D32] dark:hover:text-emerald-400 transition">
                  Biscuits, Namkeen & Maggi
                </Link>
              </li>
              <li>
                <Link to="/products?category=Beverages" className="hover:text-[#2E7D32] dark:hover:text-emerald-400 transition">
                  Tea, Coffee, Cold Drinks & Juices
                </Link>
              </li>
              <li>
                <Link to="/products?category=Household" className="hover:text-[#2E7D32] dark:hover:text-emerald-400 transition">
                  Detergents & Surface Cleaners
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Quick Links */}
          <div>
            <h5 className="font-bold text-slate-900 dark:text-slate-100 text-sm mb-4">
              Customer Services
            </h5>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/orders" className="hover:text-[#2E7D32] dark:hover:text-emerald-400 transition">
                  Track Your Orders
                </Link>
              </li>
              <li>
                <Link to="/support" className="hover:text-[#2E7D32] dark:hover:text-emerald-400 transition">
                  Help Center & FAQs
                </Link>
              </li>
              <li>
                <Link to="/support" className="hover:text-[#2E7D32] dark:hover:text-emerald-400 transition">
                  Raise a Support Ticket
                </Link>
              </li>
              <li>
                <Link to="/cart" className="hover:text-[#2E7D32] dark:hover:text-emerald-400 transition">
                  Shopping Cart
                </Link>
              </li>
              <li>
                <Link to="/profile" className="hover:text-[#2E7D32] dark:hover:text-emerald-400 transition">
                  Saved Delivery Addresses
                </Link>
              </li>
              <li>
                <Link to="/admin" className="hover:text-[#2E7D32] dark:hover:text-emerald-400 transition flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold">
                  Admin Portal
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Greater Noida Delivery Sectors & Hours */}
          <div>
            <h5 className="font-bold text-slate-900 dark:text-slate-100 text-sm mb-4">
              Local Service Areas
            </h5>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
              Serving residential sectors, societies, and universities in Greater Noida:
            </p>
            <div className="flex flex-wrap gap-1.5 text-[11px]">
              {[
                'Alpha 1 & 2',
                'Beta 1 & 2',
                'Gamma 1 & 2',
                'Delta 1 & 2',
                'Pari Chowk',
                'Chi IV',
                'ATS Paradiso',
                'Jaypee Greens',
                'Knowledge Park',
                'Ecotech',
                'Surajpur',
              ].map(sec => (
                <span
                  key={sec}
                  className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded-md"
                >
                  {sec}
                </span>
              ))}
            </div>
            <div className="mt-4 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-xs">
              <span className="font-bold text-[#2E7D32] dark:text-emerald-400 block mb-0.5">
                Prodigy Infotech Task-03
              </span>
              <span className="text-slate-600 dark:text-slate-400">
                Engineered with real cart, Razorpay test payment, order tracking, reviews & support.
              </span>
            </div>
          </div>
        </div>

        {/* Bottom copyright & accepted payment methods */}
        <div className="border-t border-slate-200 dark:border-slate-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <p className="text-slate-500 dark:text-slate-400">
            © {new Date().getFullYear()} FreshKart Kirana Retail Private Limited. All rights reserved. Greater Noida, India.
          </p>
          <div className="flex items-center gap-3 text-slate-400">
            <span className="font-semibold text-slate-600 dark:text-slate-300">Accepted Modes:</span>
            <span className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded font-mono text-[10px]">UPI / GPay / Paytm</span>
            <span className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded font-mono text-[10px]">Razorpay Cards</span>
            <span className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded font-mono text-[10px]">Cash on Delivery</span>
          </div>
        </div>

      </div>
    </footer>
  );
}

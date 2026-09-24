import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, LayoutGrid, ShoppingBag, Package, User } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';

export function MobileNav() {
  const { totalItems, setIsMiniCartOpen } = useCart();
  const { user } = useAuth();

  return (
    <div className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 px-2 py-1 shadow-lg">
      <div className="grid grid-cols-5 items-center">
        <NavLink
          to="/"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center py-1.5 transition text-[10px] font-medium ${
              isActive
                ? 'text-[#2E7D32] dark:text-emerald-400 font-bold'
                : 'text-slate-500 dark:text-slate-400'
            }`
          }
        >
          <Home className="w-5 h-5 mb-0.5" />
          <span>Home</span>
        </NavLink>

        <NavLink
          to="/products"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center py-1.5 transition text-[10px] font-medium ${
              isActive
                ? 'text-[#2E7D32] dark:text-emerald-400 font-bold'
                : 'text-slate-500 dark:text-slate-400'
            }`
          }
        >
          <LayoutGrid className="w-5 h-5 mb-0.5" />
          <span>Shop</span>
        </NavLink>

        <button
          onClick={() => setIsMiniCartOpen(true)}
          className="flex flex-col items-center justify-center py-1.5 transition text-[10px] font-medium text-slate-500 dark:text-slate-400 relative"
        >
          <div className="relative">
            <ShoppingBag className="w-5 h-5 mb-0.5 text-[#2E7D32] dark:text-emerald-400" />
            {totalItems > 0 && (
              <span className="absolute -top-1.5 -right-2.5 bg-amber-500 text-white font-extrabold text-[9px] w-4 h-4 rounded-full flex items-center justify-center ring-2 ring-white dark:ring-slate-900">
                {totalItems}
              </span>
            )}
          </div>
          <span>Cart</span>
        </button>

        <NavLink
          to="/orders"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center py-1.5 transition text-[10px] font-medium ${
              isActive
                ? 'text-[#2E7D32] dark:text-emerald-400 font-bold'
                : 'text-slate-500 dark:text-slate-400'
            }`
          }
        >
          <Package className="w-5 h-5 mb-0.5" />
          <span>Orders</span>
        </NavLink>

        <NavLink
          to={user ? '/profile' : '/auth'}
          className={({ isActive }) =>
            `flex flex-col items-center justify-center py-1.5 transition text-[10px] font-medium ${
              isActive
                ? 'text-[#2E7D32] dark:text-emerald-400 font-bold'
                : 'text-slate-500 dark:text-slate-400'
            }`
          }
        >
          <User className="w-5 h-5 mb-0.5" />
          <span>{user ? 'Account' : 'Login'}</span>
        </NavLink>
      </div>
    </div>
  );
}

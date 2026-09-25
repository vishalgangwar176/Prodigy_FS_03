import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShoppingBag,
  Search,
  MapPin,
  Moon,
  Sun,
  User as UserIcon,
  ChevronDown,
  LogOut,
  ShieldCheck,
  Package,
  HelpCircle,
  Menu,
  X,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useTheme } from '../../context/ThemeContext';
import { getProducts } from '../../services/storageService';
import { Product } from '../../types';

export function Navbar() {
  const { user, isAdmin, logout } = useAuth();
  const { totalItems, setIsMiniCartOpen } = useCart();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<Product[]>([]);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [currentLocation, setCurrentLocation] = useState('Alpha 1, Greater Noida (201310)');

  const searchContainerRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Close search suggestions on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setIsSearchOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced search suggestions
  useEffect(() => {
    if (searchQuery.trim().length < 2) {
      setSuggestions([]);
      return;
    }
    const timer = setTimeout(() => {
      const all = getProducts();
      const q = searchQuery.toLowerCase();
      const matched = all
        .filter(
          p =>
            p.name.toLowerCase().includes(q) ||
            p.category.toLowerCase().includes(q) ||
            p.brand.toLowerCase().includes(q)
        )
        .slice(0, 6);
      setSuggestions(matched);
      setIsSearchOpen(true);
    }, 150);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setIsSearchOpen(false);
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const selectSuggestion = (product: Product) => {
    setIsSearchOpen(false);
    setSearchQuery('');
    navigate(`/product/${product.id}`);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors shadow-xs">
      {/* Top Banner Notice */}
      <div className="bg-[#2E7D32] text-white px-4 py-1 text-xs font-medium text-center flex items-center justify-center gap-2">
        <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
        <span>Fresh Local Groceries delivered in <strong>20-30 mins</strong> across Greater Noida! Free delivery on orders above ₹499</span>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-3 sm:gap-6">
          
          {/* Logo & Kirana Location */}
          <div className="flex items-center gap-4 sm:gap-6 shrink-0">
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-tr from-[#2E7D32] to-emerald-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/20 group-hover:scale-105 transition">
                <ShoppingBag className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white flex items-center">
                  Fresh<span className="text-[#2E7D32] dark:text-emerald-400">Kart</span>
                </span>
                <span className="text-[10px] font-semibold tracking-wider text-slate-600 dark:text-slate-400 uppercase -mt-1">
                  Greater Noida
                </span>
              </div>
            </Link>

            {/* Delivery Location Pill */}
            <button
              onClick={() => setIsLocationModalOpen(true)}
              className="hidden md:flex items-center gap-2 py-1.5 px-3 rounded-xl bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700/80 text-left transition text-xs"
              title="Change Delivery Location"
            >
              <div className="w-7 h-7 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-[#2E7D32] dark:text-emerald-400 flex items-center justify-center shrink-0">
                <MapPin className="w-4 h-4" />
              </div>
              <div className="max-w-[170px] truncate">
                <div className="font-bold text-slate-800 dark:text-slate-200 text-[11px] leading-tight flex items-center gap-1">
                  Deliver to
                  <ChevronDown className="w-3 h-3 text-slate-400" />
                </div>
                <div className="text-slate-500 dark:text-slate-400 truncate text-[11px]">
                  {currentLocation}
                </div>
              </div>
            </button>
          </div>

          {/* Search Bar with Instant Auto-Suggestions */}
          <div ref={searchContainerRef} className="relative flex-1 max-w-xl hidden sm:block">
            <form onSubmit={handleSearchSubmit} className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                onFocus={() => searchQuery.trim().length >= 2 && setIsSearchOpen(true)}
                placeholder="Search atta, milk, chips, fresh sabzi, fruits..."
                className="w-full pl-11 pr-10 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-[#2E7D32] focus:border-transparent transition"
              />
              <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setSuggestions([]);
                    setIsSearchOpen(false);
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </form>

            {/* Instant Suggestions Dropdown */}
            {isSearchOpen && suggestions.length > 0 && (
              <div className="absolute left-0 right-0 top-full mt-2 bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden z-50">
                <div className="p-2 border-b border-slate-100 dark:border-slate-800 text-xs font-semibold text-slate-400 uppercase tracking-wider flex justify-between">
                  <span>Suggestions</span>
                  <span>Press enter to view all</span>
                </div>
                <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
                  {suggestions.map(item => (
                    <div
                      key={item.id}
                      onClick={() => selectSuggestion(item)}
                      className="p-3 flex items-center gap-3 hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer transition"
                    >
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-11 h-11 rounded-lg object-cover shrink-0 bg-slate-100 dark:bg-slate-800"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">
                          {item.name}
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2">
                          <span className="font-medium text-emerald-600 dark:text-emerald-400">
                            ₹{item.price}
                          </span>
                          <span>•</span>
                          <span>{item.unit}</span>
                          <span>•</span>
                          <span className="text-[11px] bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                            {item.category}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <button
                  onClick={handleSearchSubmit}
                  className="w-full py-2.5 px-4 bg-slate-50 dark:bg-slate-800/80 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-xs font-semibold text-[#2E7D32] dark:text-emerald-400 text-center block transition"
                >
                  View all results for "{searchQuery}"
                </button>
              </div>
            )}
          </div>

          {/* Nav Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center gap-1 mr-2 text-sm font-semibold text-slate-600 dark:text-slate-300">
              <Link to="/products" className="px-3 py-2 rounded-lg hover:text-[#2E7D32] hover:bg-emerald-50 dark:hover:bg-slate-800 transition">
                All Products
              </Link>
              <Link to="/orders" className="px-3 py-2 rounded-lg hover:text-[#2E7D32] hover:bg-emerald-50 dark:hover:bg-slate-800 transition">
                Orders
              </Link>
              <Link to="/support" className="px-3 py-2 rounded-lg hover:text-[#2E7D32] hover:bg-emerald-50 dark:hover:bg-slate-800 transition">
                Support
              </Link>
              {isAdmin && (
                <Link
                  to="/admin"
                  className="px-3 py-1.5 rounded-lg bg-emerald-100 text-[#2E7D32] dark:bg-emerald-950 dark:text-emerald-300 hover:bg-emerald-200 transition flex items-center gap-1.5"
                >
                  <ShieldCheck className="w-4 h-4" />
                  Admin
                </Link>
              )}
            </nav>

            {/* Dark Mode Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2.5 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? (
                <Sun className="w-5 h-5 text-amber-400" />
              ) : (
                <Moon className="w-5 h-5 text-slate-600" />
              )}
            </button>

            {/* Cart Button (with Mini-Cart trigger) */}
            <button
              onClick={() => setIsMiniCartOpen(true)}
              className="relative flex items-center gap-2.5 bg-[#2E7D32] hover:bg-[#256628] text-white px-3.5 py-2.5 rounded-xl font-bold text-sm shadow-md shadow-emerald-700/20 transition active:scale-95"
              aria-label="View shopping cart"
            >
              <ShoppingBag className="w-5 h-5" />
              <span className="hidden sm:inline">Cart</span>
              {totalItems > 0 && (
                <span className="bg-amber-400 text-slate-950 text-xs font-extrabold w-5 h-5 rounded-full flex items-center justify-center ring-2 ring-white dark:ring-slate-900 animate-scale">
                  {totalItems}
                </span>
              )}
            </button>

            {/* User Account Menu */}
            <div ref={userMenuRef} className="relative">
              {user ? (
                <button
                  onClick={() => setIsUserMenuOpen(prev => !prev)}
                  className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition text-left"
                >
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-[#2E7D32] text-white font-bold flex items-center justify-center text-sm shadow-sm">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="hidden xl:block">
                    <div className="text-xs font-bold text-slate-800 dark:text-slate-200 leading-tight">
                      {user.name.split(' ')[0]}
                    </div>
                    <div className="text-[10px] text-slate-400 capitalize">{user.role}</div>
                  </div>
                  <ChevronDown className="w-4 h-4 text-slate-400 hidden xl:block" />
                </button>
              ) : (
                <Link
                  to="/auth"
                  className="hidden sm:flex items-center gap-1.5 text-sm font-bold text-slate-700 dark:text-slate-200 px-3 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                >
                  <UserIcon className="w-4 h-4 text-[#2E7D32]" />
                  <span>Sign In</span>
                </Link>
              )}

              {/* User Dropdown */}
              {isUserMenuOpen && user && (
                <div className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 py-1.5 z-50 divide-y divide-slate-100 dark:divide-slate-800">
                  <div className="px-4 py-3">
                    <p className="text-xs text-slate-400 font-medium">Signed in as</p>
                    <p className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate">{user.name}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{user.email}</p>
                  </div>
                  <div className="py-1">
                    <Link
                      to="/profile"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                    >
                      <UserIcon className="w-4 h-4 text-slate-400" />
                      My Profile & Addresses
                    </Link>
                    <Link
                      to="/orders"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                    >
                      <Package className="w-4 h-4 text-slate-400" />
                      My Orders & Tracking
                    </Link>
                    <Link
                      to="/support"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                    >
                      <HelpCircle className="w-4 h-4 text-slate-400" />
                      Support & Help Tickets
                    </Link>
                    {isAdmin && (
                      <Link
                        to="/admin"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-emerald-700 dark:text-emerald-400 font-semibold hover:bg-emerald-50 dark:hover:bg-slate-800"
                      >
                        <ShieldCheck className="w-4 h-4" />
                        Admin Dashboard
                      </Link>
                    )}
                  </div>
                  <div className="py-1">
                    <button
                      onClick={() => {
                        logout();
                        setIsUserMenuOpen(false);
                      }}
                      className="w-full text-left flex items-center gap-2 px-4 py-2 text-sm text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile hamburger menu */}
            <button
              onClick={() => setIsMobileMenuOpen(prev => !prev)}
              className="lg:hidden p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              aria-label="Toggle mobile menu"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Search input bar */}
        <div className="pb-3 sm:hidden">
          <form onSubmit={handleSearchSubmit} className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search atta, milk, chips, fresh sabzi..."
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-[#2E7D32]"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          </form>
        </div>
      </div>

      {/* Mobile drawer menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-3 space-y-1">
          <Link
            to="/products"
            onClick={() => setIsMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
          >
            All Products & Categories
          </Link>
          <Link
            to="/orders"
            onClick={() => setIsMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
          >
            My Orders
          </Link>
          <Link
            to="/support"
            onClick={() => setIsMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
          >
            Customer Support & FAQs
          </Link>
          {isAdmin && (
            <Link
              to="/admin"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-sm font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50"
            >
              Admin Dashboard
            </Link>
          )}
          {!user && (
            <Link
              to="/auth"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block mt-2 px-3 py-2 text-center rounded-xl bg-[#2E7D32] text-white font-bold text-sm"
            >
              Sign In / Register
            </Link>
          )}
        </div>
      )}

      {/* Location Modal */}
      {isLocationModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-[#2E7D32]" />
                Select Greater Noida Sector
              </h3>
              <button
                onClick={() => setIsLocationModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              We deliver fresh groceries from our Jagat Farm hub across all sectors of Greater Noida in 20-30 mins.
            </p>

            {/* Manual Location Input */}
            <div className="mb-4 space-y-2">
              <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block">
                Type Your Sector / Area Manually:
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. Sector 16B, Gaur City, Pari Chowk..."
                  defaultValue={currentLocation}
                  id="manualNavbarLocationInput"
                  className="flex-1 px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
                <button
                  type="button"
                  onClick={() => {
                    const el = document.getElementById('manualNavbarLocationInput') as HTMLInputElement;
                    if (el && el.value.trim()) {
                      setCurrentLocation(el.value.trim());
                      setIsLocationModalOpen(false);
                    }
                  }}
                  className="px-3.5 py-2 rounded-xl bg-[#2E7D32] text-white text-xs font-bold hover:bg-[#256628] shrink-0"
                >
                  Set
                </button>
              </div>
            </div>

            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
              Or pick popular sector:
            </div>

            <div className="space-y-2 max-h-52 overflow-y-auto">
              {[
                'Alpha 1, Greater Noida (201310)',
                'Alpha 2, Greater Noida (201310)',
                'Beta 1 & 2, Greater Noida (201308)',
                'Gamma 1 & Jagat Farm Market (201310)',
                'Delta 1 & 2, Greater Noida (201308)',
                'Pari Chowk Hub (201310)',
                'Omega 1, Greater Noida (201308)',
                'Chi IV & ATS Paradiso (201310)',
                'Knowledge Park II & III (201306)',
                'Jaypee Greens Wish Town (201304)',
                'Ecotech / Surajpur Industrial Area (201306)',
              ].map(sec => (
                <button
                  key={sec}
                  onClick={() => {
                    setCurrentLocation(sec);
                    setIsLocationModalOpen(false);
                  }}
                  className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-between transition ${
                    currentLocation === sec
                      ? 'bg-emerald-100 dark:bg-emerald-950/60 text-[#2E7D32] dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800'
                      : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <span>{sec}</span>
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded-md">
                    20-30m
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

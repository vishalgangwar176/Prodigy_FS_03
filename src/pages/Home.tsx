import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Zap,
  ShieldCheck,
  Tag,
  Clock,
  Sparkles,
  Flame,
  TrendingUp,
  Percent,
  History,
} from 'lucide-react';
import { CATEGORIES_DATA } from '../data/seedProducts';
import { getProducts, getRecentlyViewed, storageEvents } from '../services/storageService';
import { Product } from '../types';
import { ProductCard } from '../components/common/ProductCard';

export function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [recentlyViewed, setRecentlyViewed] = useState<Product[]>([]);

  useEffect(() => {
    setProducts(getProducts());
    setRecentlyViewed(getRecentlyViewed());

    const handleUpdate = () => {
      setProducts(getProducts());
      setRecentlyViewed(getRecentlyViewed());
    };

    storageEvents.addEventListener('products_updated', handleUpdate);
    storageEvents.addEventListener('recently_viewed_updated', handleUpdate);
    return () => {
      storageEvents.removeEventListener('products_updated', handleUpdate);
      storageEvents.removeEventListener('recently_viewed_updated', handleUpdate);
    };
  }, []);

  const featured = products.filter(p => p.isFeatured).slice(0, 8);
  const bestSellers = products.filter(p => p.isBestSeller).slice(0, 8);
  const deals = products.filter(p => p.isDealOfDay || p.discountPercent >= 15).slice(0, 8);

  return (
    <div className="space-y-10 pb-16">
      
      {/* 1. Hero Banner */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-800 via-[#2E7D32] to-teal-800 text-white shadow-xl shadow-emerald-950/10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.15),transparent)]" />
        <div className="relative max-w-7xl mx-auto px-6 py-12 sm:py-16 md:py-20 flex flex-col md:flex-row items-center justify-between gap-8">
          
          <div className="max-w-xl space-y-4 text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-emerald-200 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Greater Noida's #1 Local Kirana</span>
            </div>
            
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight leading-tight">
              Fresh Groceries at <br />
              <span className="text-amber-300">Mandi Rates</span> in 25 Mins
            </h1>
            
            <p className="text-sm sm:text-base text-emerald-100 max-w-lg leading-relaxed">
              Order farm-fresh sabzi, pure dairy, daily atta, pulses, and snacks directly from our Jagat Farm hub. Free delivery on orders over ₹499!
            </p>

            <div className="pt-3 flex flex-wrap items-center justify-center md:justify-start gap-3">
              <Link
                to="/products"
                className="px-6 py-3.5 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-sm shadow-lg shadow-amber-500/25 flex items-center gap-2 transition transform hover:-translate-y-0.5 active:translate-y-0"
              >
                <span>Shop All Groceries</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <div className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-white/10 backdrop-blur-md text-xs font-semibold text-white">
                <Tag className="w-4 h-4 text-amber-300" />
                <span>Use code <strong>FRESH10</strong> for 10% OFF</span>
              </div>
            </div>
          </div>

          {/* Hero Decorative Visual */}
          <div className="relative w-full max-w-sm md:max-w-md">
            <div className="relative aspect-4/3 rounded-2xl overflow-hidden shadow-2xl border-4 border-white/20">
              <img
                src="https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&auto=format&fit=crop&q=80"
                alt="Fresh Grocery Store FreshKart"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
              <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-xs">
                <span className="bg-emerald-600/90 backdrop-blur-md px-3 py-1 rounded-full font-bold">
                  ⚡ 20-30 Mins Dispatch
                </span>
                <span className="bg-black/60 backdrop-blur-md px-3 py-1 rounded-full font-medium">
                  Jagat Farm, Gamma 1
                </span>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* 2. Value Proposition Strip */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-[#2E7D32] dark:text-emerald-400 flex items-center justify-center shrink-0">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <div className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">25-Min Delivery</div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400">All Greater Noida sectors</div>
          </div>
        </div>

        <div className="p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
            <Percent className="w-5 h-5" />
          </div>
          <div>
            <div className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">Best Local Prices</div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400">Up to 25% below MRP</div>
          </div>
        </div>

        <div className="p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <div className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">7 AM – 11 PM Daily</div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400">Early morning milk & essentials</div>
          </div>
        </div>

        <div className="p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">Doorstep Exchange</div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400">No-questions-asked refund</div>
          </div>
        </div>
      </section>

      {/* 3. Category Grid */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Explore Categories
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Fresh vegetables, dairy, staples, snacks & household
            </p>
          </div>
          <Link
            to="/products"
            className="text-xs sm:text-sm font-bold text-[#2E7D32] dark:text-emerald-400 hover:underline flex items-center gap-1"
          >
            <span>See All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          {CATEGORIES_DATA.map(cat => (
            <Link
              key={cat.id}
              to={`/products?category=${encodeURIComponent(cat.name)}`}
              className="group relative rounded-2xl overflow-hidden bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-3 flex flex-col items-center text-center hover:shadow-lg hover:border-emerald-500/50 transition-all duration-300"
            >
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden mb-2 bg-slate-100 dark:bg-slate-800">
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition duration-300"
                  loading="lazy"
                />
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm line-clamp-1 group-hover:text-[#2E7D32] dark:group-hover:text-emerald-400 transition">
                {cat.name}
              </h3>
              <p className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">
                {cat.tagline}
              </p>
            </Link>
          ))}
        </div>
      </section>

      {/* 4. Deals of the Day */}
      {deals.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-950 text-amber-600 flex items-center justify-center font-bold">
                <Flame className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                  Deals of the Day
                  <span className="text-xs font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded-full">
                    Limited Stock
                  </span>
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                  Maximum savings on daily kitchen essentials
                </p>
              </div>
            </div>
            <Link
              to="/products"
              className="text-xs sm:text-sm font-bold text-[#2E7D32] dark:text-emerald-400 hover:underline flex items-center gap-1"
            >
              <span>View Deals</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
            {deals.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}

      {/* 5. Best Sellers Section */}
      {bestSellers.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-[#2E7D32] dark:text-emerald-400 flex items-center justify-center font-bold">
                <TrendingUp className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                  Best Sellers in Greater Noida
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                  Most frequently ordered by families in Alpha, Beta, Gamma & Jaypee
                </p>
              </div>
            </div>
            <Link
              to="/products"
              className="text-xs sm:text-sm font-bold text-[#2E7D32] dark:text-emerald-400 hover:underline flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
            {bestSellers.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}

      {/* 6. Featured Products */}
      {featured.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-950 text-purple-600 flex items-center justify-center font-bold">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                  Handpicked & Featured
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                  Top quality produce and branded staples
                </p>
              </div>
            </div>
            <Link
              to="/products"
              className="text-xs sm:text-sm font-bold text-[#2E7D32] dark:text-emerald-400 hover:underline flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
            {featured.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}

      {/* 7. Recently Viewed (Persisted) */}
      {recentlyViewed.length > 0 && (
        <section className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 flex items-center justify-center font-bold">
              <History className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white tracking-tight">
                Recently Viewed
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Pick up where you left off
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
            {recentlyViewed.slice(0, 6).map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}

      {/* 8. Callout Banner: Fast Local Delivery */}
      <section className="rounded-3xl bg-slate-900 text-white p-6 sm:p-10 relative overflow-hidden border border-slate-800">
        <div className="relative z-10 max-w-2xl space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
            Jagat Farm Store Pickup & Express Delivery
          </span>
          <h3 className="text-2xl sm:text-3xl font-black tracking-tight">
            Order before 10:30 PM for Guaranteed Same-Day Delivery
          </h3>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Need items quickly for cooking or guests? Our delivery fleet is stationed across Pari Chowk, Jagat Farm, and Alpha commercial belts to reach your gate in 20-30 mins.
          </p>
          <div className="pt-2">
            <Link
              to="/products"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#2E7D32] hover:bg-emerald-600 text-white font-bold text-xs sm:text-sm transition"
            >
              <span>Explore Kirana Catalogue</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}

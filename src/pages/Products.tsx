import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Filter,
  SlidersHorizontal,
  X,
  Star,
  Check,
  LayoutGrid,
  List,
  Search,
  ChevronDown,
  RotateCcw,
} from 'lucide-react';
import { getProducts, storageEvents } from '../services/storageService';
import { Product, CategoryType } from '../types';
import { ProductCard } from '../components/common/ProductCard';
import { CATEGORIES_DATA } from '../data/seedProducts';
import { useCart } from '../context/CartContext';
import { useToast } from '../components/common/Toast';

export function Products() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // Subscribe to storage updates (e.g. from admin editing products)
  useEffect(() => {
    setProducts(getProducts());
    const handleUpdate = () => setProducts(getProducts());
    storageEvents.addEventListener('products_updated', handleUpdate);
    return () => storageEvents.removeEventListener('products_updated', handleUpdate);
  }, []);

  // Filter & sort states read from URL searchParams
  const categoryParam = searchParams.get('category') || 'All';
  const searchParam = searchParams.get('search') || '';
  const sortParam = searchParams.get('sort') || 'relevance';
  const minPriceParam = Number(searchParams.get('minPrice')) || 0;
  const hasMaxPrice = searchParams.has('maxPrice');
  const maxPriceParam = hasMaxPrice ? Number(searchParams.get('maxPrice')) : 2000;
  const ratingParam = Number(searchParams.get('rating')) || 0;
  const inStockParam = searchParams.get('inStock') === 'true';
  const brandParam = searchParams.get('brand') || '';
  const discountParam = Number(searchParams.get('discount')) || 0;

  // Local state for price slider to allow smooth dragging before setting URL
  const [sliderMaxPrice, setSliderMaxPrice] = useState(maxPriceParam);

  useEffect(() => {
    setSliderMaxPrice(maxPriceParam);
  }, [maxPriceParam]);

  // Extract all unique brands
  const allBrands = useMemo(() => {
    const brands = new Set<string>();
    products.forEach(p => brands.add(p.brand));
    return Array.from(brands).sort();
  }, [products]);

  // Update query params helper
  const updateParams = (newParams: Record<string, string | null>) => {
    const next = new URLSearchParams(searchParams);
    Object.entries(newParams).forEach(([k, v]) => {
      if (v === null || v === '' || v === 'All' || v === '0' || v === 'false') {
        next.delete(k);
      } else {
        next.set(k, v);
      }
    });
    setSearchParams(next);
  };

  const clearAllFilters = () => {
    setSearchParams({});
    setSliderMaxPrice(2000);
  };

  // Filtered and sorted products
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      // Category filter
      if (categoryParam !== 'All' && p.category !== categoryParam) {
        return false;
      }
      // Search keyword filter
      if (searchParam) {
        const q = searchParam.toLowerCase();
        const matches =
          p.name.toLowerCase().includes(q) ||
          p.brand.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q);
        if (!matches) return false;
      }
      // Price range: minPrice only if provided, maxPrice only if set by user
      if (searchParams.has('minPrice') && p.price < minPriceParam) {
        return false;
      }
      if (hasMaxPrice && p.price > maxPriceParam) {
        return false;
      }
      // Rating filter
      if (ratingParam > 0 && p.rating < ratingParam) {
        return false;
      }
      // In-stock only
      if (inStockParam && p.stock <= 0) {
        return false;
      }
      // Brand filter
      if (brandParam && p.brand !== brandParam) {
        return false;
      }
      // Discount filter
      if (discountParam > 0 && p.discountPercent < discountParam) {
        return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortParam === 'price-asc') return a.price - b.price;
      if (sortParam === 'price-desc') return b.price - a.price;
      if (sortParam === 'rating-desc') return b.rating - a.rating;
      if (sortParam === 'name-asc') return a.name.localeCompare(b.name);
      if (sortParam === 'newest') return b.id.localeCompare(a.id);
      return 0; // relevance
    });
  }, [
    products,
    categoryParam,
    searchParam,
    sortParam,
    minPriceParam,
    hasMaxPrice,
    maxPriceParam,
    ratingParam,
    inStockParam,
    brandParam,
    discountParam,
    searchParams,
  ]);

  // Active filters count
  const activeFiltersCount = [
    categoryParam !== 'All',
    searchParam !== '',
    searchParams.has('minPrice'),
    hasMaxPrice,
    ratingParam > 0,
    inStockParam,
    brandParam !== '',
    discountParam > 0,
  ].filter(Boolean).length;

  const { addToCart } = useCart();
  const { success, error } = useToast();

  return (
    <div className="space-y-6 pb-20">
      
      {/* Top Header / Breadcrumb & View Toggle */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 sm:p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800">
        <div>
          <div className="text-xs text-slate-400 mb-1 flex items-center gap-1.5 font-medium">
            <span>FreshKart</span>
            <span>/</span>
            <span className="text-[#2E7D32] dark:text-emerald-400 font-bold">{categoryParam}</span>
            {searchParam && (
              <>
                <span>/</span>
                <span>Search: "{searchParam}"</span>
              </>
            )}
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            {categoryParam === 'All' ? 'All Grocery Products' : categoryParam}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Showing {filteredProducts.length} items available for 25-min delivery
          </p>
        </div>

        {/* Sort & View Controls */}
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          {/* Mobile Filter Button */}
          <button
            onClick={() => setIsMobileFilterOpen(true)}
            className="lg:hidden flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold"
          >
            <SlidersHorizontal className="w-4 h-4 text-[#2E7D32]" />
            <span>Filters</span>
            {activeFiltersCount > 0 && (
              <span className="bg-[#2E7D32] text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
                {activeFiltersCount}
              </span>
            )}
          </button>

          {/* Sort Dropdown */}
          <div className="relative flex items-center text-xs">
            <span className="text-slate-400 mr-2 hidden sm:inline font-medium">Sort by:</span>
            <select
              value={sortParam}
              onChange={e => updateParams({ sort: e.target.value })}
              className="px-3 py-2 pr-8 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-semibold focus:outline-none focus:ring-2 focus:ring-[#2E7D32] appearance-none cursor-pointer"
            >
              <option value="relevance">Relevance / Popular</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="rating-desc">Customer Rating (High to Low)</option>
              <option value="newest">Newest Arrivals</option>
              <option value="name-asc">Name: A to Z</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 pointer-events-none" />
          </div>

          {/* Grid / List toggle */}
          <div className="hidden sm:flex items-center bg-slate-100 dark:bg-slate-800 rounded-xl p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition ${
                viewMode === 'grid'
                  ? 'bg-white dark:bg-slate-700 text-[#2E7D32] shadow-xs'
                  : 'text-slate-400 hover:text-slate-600'
              }`}
              aria-label="Grid view"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg transition ${
                viewMode === 'list'
                  ? 'bg-white dark:bg-slate-700 text-[#2E7D32] shadow-xs'
                  : 'text-slate-400 hover:text-slate-600'
              }`}
              aria-label="List view"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Active Filter Chips Bar */}
      {activeFiltersCount > 0 && (
        <div className="flex items-center gap-2 flex-wrap text-xs bg-emerald-50/70 dark:bg-emerald-950/30 p-3 rounded-2xl border border-emerald-200 dark:border-emerald-800/50">
          <span className="font-bold text-emerald-900 dark:text-emerald-200">Active Filters:</span>
          {categoryParam !== 'All' && (
            <span className="inline-flex items-center gap-1.5 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 font-medium">
              Category: {categoryParam}
              <X
                className="w-3 h-3 cursor-pointer text-slate-400 hover:text-rose-500"
                onClick={() => updateParams({ category: null })}
              />
            </span>
          )}
          {searchParam && (
            <span className="inline-flex items-center gap-1.5 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 font-medium">
              Search: "{searchParam}"
              <X
                className="w-3 h-3 cursor-pointer text-slate-400 hover:text-rose-500"
                onClick={() => updateParams({ search: null })}
              />
            </span>
          )}
          {brandParam && (
            <span className="inline-flex items-center gap-1.5 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 font-medium">
              Brand: {brandParam}
              <X
                className="w-3 h-3 cursor-pointer text-slate-400 hover:text-rose-500"
                onClick={() => updateParams({ brand: null })}
              />
            </span>
          )}
          {hasMaxPrice && (
            <span className="inline-flex items-center gap-1.5 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 font-medium">
              Max Price: ₹{maxPriceParam}
              <X
                className="w-3 h-3 cursor-pointer text-slate-400 hover:text-rose-500"
                onClick={() => updateParams({ maxPrice: null })}
              />
            </span>
          )}
          {ratingParam > 0 && (
            <span className="inline-flex items-center gap-1.5 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 font-medium">
              ★ {ratingParam}+
              <X
                className="w-3 h-3 cursor-pointer text-slate-400 hover:text-rose-500"
                onClick={() => updateParams({ rating: null })}
              />
            </span>
          )}
          {discountParam > 0 && (
            <span className="inline-flex items-center gap-1.5 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 font-medium">
              {discountParam}%+ Discount
              <X
                className="w-3 h-3 cursor-pointer text-slate-400 hover:text-rose-500"
                onClick={() => updateParams({ discount: null })}
              />
            </span>
          )}
          {inStockParam && (
            <span className="inline-flex items-center gap-1.5 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 font-medium">
              In-Stock Only
              <X
                className="w-3 h-3 cursor-pointer text-slate-400 hover:text-rose-500"
                onClick={() => updateParams({ inStock: null })}
              />
            </span>
          )}

          <button
            onClick={clearAllFilters}
            className="ml-auto text-xs font-bold text-rose-600 dark:text-rose-400 hover:underline flex items-center gap-1"
          >
            <RotateCcw className="w-3 h-3" />
            Clear All
          </button>
        </div>
      )}

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        
        {/* Desktop Sidebar Filters */}
        <aside className="hidden lg:block bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 space-y-6 sticky top-24">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
              <Filter className="w-4 h-4 text-[#2E7D32]" />
              Filters
            </h3>
            {activeFiltersCount > 0 && (
              <button
                onClick={clearAllFilters}
                className="text-xs text-slate-400 hover:text-rose-500 font-semibold"
              >
                Reset
              </button>
            )}
          </div>

          {/* Categories Filter */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Category
            </h4>
            <div className="space-y-1">
              <button
                onClick={() => updateParams({ category: null })}
                className={`w-full text-left px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center justify-between transition ${
                  categoryParam === 'All'
                    ? 'bg-[#2E7D32] text-white'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <span>All Categories</span>
                <span>{products.length}</span>
              </button>
              {CATEGORIES_DATA.map(c => {
                const count = products.filter(p => p.category === c.name).length;
                const isSelected = categoryParam === c.name;
                return (
                  <button
                    key={c.id}
                    onClick={() => updateParams({ category: isSelected ? null : c.name })}
                    className={`w-full text-left px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center justify-between transition ${
                      isSelected
                        ? 'bg-[#2E7D32] text-white'
                        : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <span>{c.name}</span>
                    <span className={isSelected ? 'text-white/80' : 'text-slate-400'}>{count}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Price Range Slider */}
          <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
            <div className="flex justify-between items-center text-xs">
              <h4 className="font-bold text-slate-400 uppercase tracking-wider">Max Price</h4>
              <span className="font-black text-slate-900 dark:text-white">
                {hasMaxPrice ? `₹${sliderMaxPrice}` : 'No Limit'}
              </span>
            </div>
            <input
              type="range"
              min="20"
              max="2000"
              step="20"
              value={sliderMaxPrice}
              onChange={e => {
                const val = Number(e.target.value);
                setSliderMaxPrice(val);
                updateParams({ maxPrice: val < 2000 ? String(val) : null });
              }}
              className="w-full accent-[#2E7D32] cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>₹20</span>
              <span>₹2000</span>
            </div>
            {/* Quick Price Buttons */}
            <div className="grid grid-cols-2 gap-1.5 pt-1">
              {[
                { label: 'Under ₹100', val: 100 },
                { label: 'Under ₹300', val: 300 },
                { label: 'Under ₹600', val: 600 },
                { label: 'Under ₹1000', val: 1000 },
              ].map(opt => (
                <button
                  key={opt.val}
                  type="button"
                  onClick={() => {
                    setSliderMaxPrice(opt.val);
                    updateParams({ maxPrice: String(opt.val) });
                  }}
                  className={`px-2 py-1 rounded-lg text-[10px] font-bold border transition ${
                    hasMaxPrice && maxPriceParam === opt.val
                      ? 'bg-emerald-50 border-[#2E7D32] text-[#2E7D32] dark:bg-emerald-950/60 dark:text-emerald-400'
                      : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Brand Filter */}
          <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Brand
            </h4>
            <div className="max-h-36 overflow-y-auto space-y-1">
              <button
                onClick={() => updateParams({ brand: null })}
                className={`w-full text-left px-2.5 py-1 rounded-lg text-xs font-medium transition ${
                  brandParam === ''
                    ? 'font-bold text-[#2E7D32] dark:text-emerald-400'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                All Brands
              </button>
              {allBrands.map(b => (
                <button
                  key={b}
                  onClick={() => updateParams({ brand: brandParam === b ? null : b })}
                  className={`w-full text-left px-2.5 py-1 rounded-lg text-xs font-medium flex items-center justify-between transition ${
                    brandParam === b
                      ? 'bg-emerald-50 dark:bg-emerald-950/60 text-[#2E7D32] dark:text-emerald-400 font-bold'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  <span>{b}</span>
                  {brandParam === b && <Check className="w-3 h-3" />}
                </button>
              ))}
            </div>
          </div>

          {/* Rating Filter */}
          <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Minimum Rating
            </h4>
            <div className="space-y-1 text-xs">
              {[4.5, 4.0, 3.5].map(r => (
                <button
                  key={r}
                  onClick={() => updateParams({ rating: ratingParam === r ? null : String(r) })}
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg flex items-center justify-between transition ${
                    ratingParam === r
                      ? 'bg-emerald-50 dark:bg-emerald-950/60 text-[#2E7D32] dark:text-emerald-400 font-bold'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span>{r}★ & above</span>
                  </div>
                  {ratingParam === r && <Check className="w-3 h-3" />}
                </button>
              ))}
            </div>
          </div>

          {/* Minimum Discount Filter */}
          <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Discount
            </h4>
            <div className="space-y-1 text-xs">
              {[20, 15, 10].map(d => (
                <button
                  key={d}
                  onClick={() => updateParams({ discount: discountParam === d ? null : String(d) })}
                  className={`w-full text-left px-2.5 py-1 rounded-lg flex items-center justify-between transition ${
                    discountParam === d
                      ? 'bg-emerald-50 dark:bg-emerald-950/60 text-[#2E7D32] dark:text-emerald-400 font-bold'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  <span>{d}% OFF or more</span>
                  {discountParam === d && <Check className="w-3 h-3" />}
                </button>
              ))}
            </div>
          </div>

          {/* In-Stock Toggle */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
              In-Stock Items Only
            </span>
            <input
              type="checkbox"
              checked={inStockParam}
              onChange={e => updateParams({ inStock: e.target.checked ? 'true' : null })}
              className="w-4 h-4 accent-[#2E7D32] rounded cursor-pointer"
            />
          </div>
        </aside>

        {/* Product Grid / List Section */}
        <div className="lg:col-span-3">
          {filteredProducts.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-10 text-center border border-slate-200 dark:border-slate-800 space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 flex items-center justify-center mx-auto">
                <Search className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                No grocery products found
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                We couldn't find items matching your active filters. Try adjusting price, relaxing filters, or clearing search keywords.
              </p>
              <button
                onClick={clearAllFilters}
                className="px-5 py-2.5 rounded-xl bg-[#2E7D32] text-white font-bold text-xs shadow-md transition hover:bg-[#256628]"
              >
                Clear All Filters
              </button>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
              {filteredProducts.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            // List View
            <div className="space-y-3">
              {filteredProducts.map(product => (
                <div
                  key={product.id}
                  className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-4 flex flex-col sm:flex-row items-center justify-between gap-4 hover:shadow-lg transition"
                >
                  <div className="flex items-center gap-4 w-full sm:w-auto">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-20 h-20 rounded-xl object-cover bg-slate-100 dark:bg-slate-800 shrink-0"
                    />
                    <div>
                      <div className="text-[11px] text-slate-400 font-bold uppercase">
                        {product.brand} • {product.category}
                      </div>
                      <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                        {product.name}
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {product.unit}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-base font-black text-slate-900 dark:text-white">
                          ₹{product.price}
                        </span>
                        {product.mrp > product.price && (
                          <span className="text-xs text-slate-400 line-through">
                            ₹{product.mrp}
                          </span>
                        )}
                        {product.discountPercent > 0 && (
                          <span className="text-[10px] font-bold text-amber-600 bg-amber-50 dark:bg-amber-950 px-1.5 py-0.5 rounded">
                            {product.discountPercent}% OFF
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="w-full sm:w-auto flex items-center justify-end gap-3">
                    <button
                      onClick={() => {
                        const res = addToCart(product, 1);
                        if (res.success) {
                          success(`Added ${product.name} to cart`);
                        } else if (res.message) {
                          error(res.message);
                        }
                      }}
                      disabled={product.stock <= 0}
                      className="w-full sm:w-auto px-5 py-2 rounded-xl bg-[#2E7D32] hover:bg-[#256628] text-white font-bold text-xs shadow-md transition disabled:opacity-50"
                    >
                      {product.stock <= 0 ? 'Out of Stock' : 'Add to Cart'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* Mobile Filters Bottom Sheet Drawer */}
      {isMobileFilterOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden lg:hidden">
          <div
            onClick={() => setIsMobileFilterOpen(false)}
            className="absolute inset-0 bg-black/60 backdrop-blur-xs"
          />
          <div className="fixed inset-x-0 bottom-0 bg-white dark:bg-slate-900 rounded-t-3xl max-h-[85vh] flex flex-col shadow-2xl">
            
            {/* Header */}
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
                <Filter className="w-4 h-4 text-[#2E7D32]" />
                Filter Groceries
              </h3>
              <button
                onClick={() => setIsMobileFilterOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Filters */}
            <div className="p-5 overflow-y-auto space-y-6 flex-1">
              
              {/* Category */}
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Category</h4>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => updateParams({ category: null })}
                    className={`p-2 rounded-xl text-xs font-semibold text-center border ${
                      categoryParam === 'All'
                        ? 'bg-[#2E7D32] text-white border-[#2E7D32]'
                        : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    All Categories
                  </button>
                  {CATEGORIES_DATA.map(c => (
                    <button
                      key={c.id}
                      onClick={() => updateParams({ category: categoryParam === c.name ? null : c.name })}
                      className={`p-2 rounded-xl text-xs font-semibold text-center border truncate ${
                        categoryParam === c.name
                          ? 'bg-[#2E7D32] text-white border-[#2E7D32]'
                          : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {c.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div>
                <div className="flex justify-between items-center text-xs mb-2">
                  <h4 className="font-bold text-slate-400 uppercase tracking-wider">Max Price</h4>
                  <span className="font-black text-slate-900 dark:text-white">
                    {hasMaxPrice ? `₹${sliderMaxPrice}` : 'No Limit'}
                  </span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="2000"
                  step="20"
                  value={sliderMaxPrice}
                  onChange={e => {
                    const val = Number(e.target.value);
                    setSliderMaxPrice(val);
                    updateParams({ maxPrice: val < 2000 ? String(val) : null });
                  }}
                  className="w-full accent-[#2E7D32]"
                />
                <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                  <span>₹20</span>
                  <span>₹2000</span>
                </div>
                {/* Quick Price Buttons */}
                <div className="grid grid-cols-2 gap-2 pt-2">
                  {[
                    { label: 'Under ₹100', val: 100 },
                    { label: 'Under ₹300', val: 300 },
                    { label: 'Under ₹600', val: 600 },
                    { label: 'Under ₹1000', val: 1000 },
                  ].map(opt => (
                    <button
                      key={opt.val}
                      type="button"
                      onClick={() => {
                        setSliderMaxPrice(opt.val);
                        updateParams({ maxPrice: String(opt.val) });
                      }}
                      className={`px-2 py-1.5 rounded-xl text-xs font-bold border text-center transition ${
                        hasMaxPrice && maxPriceParam === opt.val
                          ? 'bg-emerald-50 border-[#2E7D32] text-[#2E7D32] dark:bg-emerald-950/60 dark:text-emerald-400'
                          : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Rating */}
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Rating</h4>
                <div className="flex gap-2">
                  {[4.5, 4.0, 3.5].map(r => (
                    <button
                      key={r}
                      onClick={() => updateParams({ rating: ratingParam === r ? null : String(r) })}
                      className={`flex-1 py-2 rounded-xl text-xs font-bold border flex items-center justify-center gap-1 ${
                        ratingParam === r
                          ? 'bg-emerald-50 border-[#2E7D32] text-[#2E7D32]'
                          : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <Star className="w-3 h-3 fill-current" />
                      {r}★+
                    </button>
                  ))}
                </div>
              </div>

              {/* In Stock toggle */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  In-Stock Items Only
                </span>
                <input
                  type="checkbox"
                  checked={inStockParam}
                  onChange={e => updateParams({ inStock: e.target.checked ? 'true' : null })}
                  className="w-5 h-5 accent-[#2E7D32]"
                />
              </div>

            </div>

            {/* Bottom Actions */}
            <div className="p-4 border-t border-slate-200 dark:border-slate-800 grid grid-cols-2 gap-3">
              <button
                onClick={clearAllFilters}
                className="py-3 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300"
              >
                Clear All
              </button>
              <button
                onClick={() => setIsMobileFilterOpen(false)}
                className="py-3 rounded-xl bg-[#2E7D32] text-white text-xs font-bold shadow-md"
              >
                Apply Filters ({filteredProducts.length})
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}

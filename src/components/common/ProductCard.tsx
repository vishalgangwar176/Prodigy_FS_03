import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Star, Plus, Minus, ShoppingBag } from 'lucide-react';
import { Product } from '../../types';
import { useCart } from '../../context/CartContext';
import { useToast } from './Toast';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addToCart, updateQuantity, getItemQuantity } = useCart();
  const { success, error } = useToast();
  const [imgError, setImgError] = useState(false);

  const quantity = getItemQuantity(product.id);
  const isOutOfStock = product.stock <= 0;

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isOutOfStock) return;
    const res = addToCart(product, 1);
    if (res.success) {
      success(`Added ${product.name} to cart`);
    } else if (res.message) {
      error(res.message);
    }
  };

  const handleIncrement = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (quantity >= product.stock) {
      error(`Only ${product.stock} items available`);
      return;
    }
    updateQuantity(product.id, quantity + 1);
  };

  const handleDecrement = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    updateQuantity(product.id, quantity - 1);
  };

  const fallbackImage = 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=600&auto=format&fit=crop&q=80';

  return (
    <div className="group relative bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-3 sm:p-4 flex flex-col justify-between hover:shadow-xl hover:border-emerald-500/40 dark:hover:border-emerald-500/40 transition-all duration-300">
      <div>
        {/* Top Tag Bar */}
        <div className="flex items-center justify-between gap-1 mb-2">
          {product.discountPercent > 0 ? (
            <span className="bg-amber-500 text-white text-[10px] sm:text-[11px] font-extrabold px-2 py-0.5 rounded-md uppercase tracking-wider">
              {product.discountPercent}% OFF
            </span>
          ) : (
            <span className="text-[11px] text-slate-400 font-medium">{product.brand}</span>
          )}

          {/* Rating */}
          <div className="flex items-center gap-1 bg-emerald-50 dark:bg-emerald-950/60 text-[#2E7D32] dark:text-emerald-400 px-1.5 py-0.5 rounded-md text-[11px] font-bold">
            <Star className="w-3 h-3 fill-current text-[#2E7D32] dark:text-emerald-400" />
            <span>{product.rating}</span>
            <span className="text-[10px] text-slate-400 font-normal">({product.ratingCount})</span>
          </div>
        </div>

        {/* Product Image Link */}
        <Link to={`/product/${product.id}`} className="block relative aspect-square overflow-hidden rounded-xl bg-slate-50 dark:bg-slate-800/50 mb-3">
          <img
            src={imgError ? fallbackImage : product.image}
            alt={product.name}
            onError={() => setImgError(true)}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />

          {isOutOfStock && (
            <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center">
              <span className="bg-rose-600 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                Sold Out
              </span>
            </div>
          )}

          {product.stock > 0 && product.stock <= 5 && (
            <span className="absolute bottom-2 left-2 bg-amber-500/90 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded-md">
              Only {product.stock} left!
            </span>
          )}
        </Link>

        {/* Brand & Name */}
        <div className="text-[11px] text-slate-400 dark:text-slate-500 font-semibold uppercase tracking-wider mb-0.5">
          {product.brand}
        </div>
        <Link
          to={`/product/${product.id}`}
          className="font-bold text-slate-900 dark:text-slate-100 text-xs sm:text-sm line-clamp-2 hover:text-[#2E7D32] dark:hover:text-emerald-400 transition mb-1 leading-snug"
          title={product.name}
        >
          {product.name}
        </Link>
        <div className="text-xs text-slate-500 dark:text-slate-400 mb-3">
          {product.unit}
        </div>
      </div>

      {/* Price and Add/Stepper */}
      <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
        <div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
              ₹{product.price}
            </span>
            {product.mrp > product.price && (
              <span className="text-xs text-slate-400 line-through">
                ₹{product.mrp}
              </span>
            )}
          </div>
          <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
            Save ₹{product.mrp - product.price}
          </div>
        </div>

        {/* Action Button: Add or Inline Stepper */}
        <div>
          {quantity > 0 ? (
            <div className="flex items-center bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-500/40 rounded-xl p-1 text-[#2E7D32] dark:text-emerald-400 shadow-xs">
              <button
                onClick={handleDecrement}
                className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-emerald-500 hover:text-white transition active:scale-95"
                aria-label="Decrease quantity"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="w-6 text-center font-black text-xs sm:text-sm">
                {quantity}
              </span>
              <button
                onClick={handleIncrement}
                disabled={quantity >= product.stock}
                className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-emerald-500 hover:text-white transition active:scale-95 disabled:opacity-40"
                aria-label="Increase quantity"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={handleAdd}
              disabled={isOutOfStock}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-xs sm:text-sm transition shadow-xs active:scale-95 ${
                isOutOfStock
                  ? 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                  : 'bg-emerald-50 dark:bg-emerald-950/80 text-[#2E7D32] dark:text-emerald-300 border border-emerald-500/50 hover:bg-[#2E7D32] hover:text-white dark:hover:bg-emerald-600 dark:hover:text-white'
              }`}
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>ADD</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

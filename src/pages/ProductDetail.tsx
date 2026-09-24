import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Star,
  ShoppingBag,
  Plus,
  Minus,
  CheckCircle2,
  Truck,
  ShieldCheck,
  RotateCcw,
  ArrowLeft,
  Trash2,
  Sparkles,
  Heart,
  Share2,
  AlertCircle,
} from 'lucide-react';
import {
  getProductById,
  getProductReviews,
  addReview,
  deleteReview,
  getProducts,
  addRecentlyViewed,
  storageEvents,
} from '../services/storageService';
import { Product, Review } from '../types';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/common/Toast';
import { ProductCard } from '../components/common/ProductCard';

export function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToCart, updateQuantity, getItemQuantity, setIsMiniCartOpen } = useCart();
  const { success, error, info } = useToast();

  const [product, setProduct] = useState<Product | undefined>(undefined);
  const [selectedVariantId, setSelectedVariantId] = useState<string | undefined>(undefined);
  const [activeImage, setActiveImage] = useState<string>('');
  const [reviews, setReviews] = useState<Review[]>([]);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);

  // Write Review form state
  const [newRating, setNewRating] = useState<number>(5);
  const [newComment, setNewComment] = useState<string>('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  useEffect(() => {
    if (!id) return;
    const p = getProductById(id);
    setProduct(p);
    if (p) {
      addRecentlyViewed(p);
      setActiveImage(p.image);
      if (p.variants && p.variants.length > 0) {
        setSelectedVariantId(p.variants[0].id);
      } else {
        setSelectedVariantId(undefined);
      }
      // Related products by category
      const all = getProducts();
      const related = all.filter(item => item.category === p.category && item.id !== p.id).slice(0, 4);
      setRelatedProducts(related);
    }
    setReviews(getProductReviews(id));

    // Listen for storage events
    const handleUpdate = () => {
      const updatedP = getProductById(id);
      setProduct(updatedP);
      setReviews(getProductReviews(id));
    };

    storageEvents.addEventListener('reviews_updated', handleUpdate);
    storageEvents.addEventListener('products_updated', handleUpdate);
    return () => {
      storageEvents.removeEventListener('reviews_updated', handleUpdate);
      storageEvents.removeEventListener('products_updated', handleUpdate);
    };
  }, [id]);

  if (!product) {
    return (
      <div className="max-w-4xl mx-auto py-16 text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Product Not Found</h2>
        <p className="text-sm text-slate-500">The requested grocery item may have been moved or discontinued.</p>
        <Link
          to="/products"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#2E7D32] text-white font-bold text-xs"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Store
        </Link>
      </div>
    );
  }

  // Determine current active price / unit based on variant selection
  let currentPrice = product.price;
  let currentMrp = product.mrp;
  let currentUnit = product.unit;

  if (selectedVariantId && product.variants) {
    const v = product.variants.find(item => item.id === selectedVariantId);
    if (v) {
      currentPrice = v.price;
      currentMrp = v.mrp;
      currentUnit = v.unit;
    }
  }

  const currentCartQty = getItemQuantity(product.id, selectedVariantId);

  // Reviews calculation
  const totalReviews = reviews.length;
  const ratingDistribution = [5, 4, 3, 2, 1].map(stars => {
    const count = reviews.filter(r => r.rating === stars).length;
    const percent = totalReviews > 0 ? Math.round((count / totalReviews) * 100) : 0;
    return { stars, count, percent };
  });

  const userHasReviewed = user ? reviews.some(r => r.userId === user.uid) : false;

  const handleAddToCart = () => {
    if (product.stock <= 0) return;
    const res = addToCart(product, 1, selectedVariantId);
    if (res.success) {
      success(`Added ${product.name} (${currentUnit}) to cart`);
    } else if (res.message) {
      error(res.message);
    }
  };

  const handleBuyNow = () => {
    if (product.stock <= 0) return;
    addToCart(product, 1, selectedVariantId);
    navigate('/checkout');
  };

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      navigate('/auth');
      return;
    }
    if (!newComment.trim()) {
      error('Please write a short comment about your experience with this grocery item.');
      return;
    }

    setIsSubmittingReview(true);
    const newRev: Review = {
      id: 'rev-' + Date.now(),
      productId: product.id,
      userId: user.uid,
      userName: user.name,
      userEmail: user.email,
      rating: newRating,
      comment: newComment.trim(),
      createdAt: new Date().toISOString(),
    };

    addReview(newRev);
    setNewComment('');
    setNewRating(5);
    setIsSubmittingReview(false);
    success('Thank you! Your verified review has been posted.');
  };

  const handleDeleteReview = (revId: string) => {
    deleteReview(revId, product.id);
    success('Your review was removed.');
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: product.name,
        text: `Buy ${product.name} for ₹${currentPrice} on FreshKart Greater Noida!`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      info('Link copied to clipboard!');
    }
  };

  const allImages = product.images && product.images.length > 0 ? product.images : [product.image];

  return (
    <div className="space-y-10 pb-20">
      
      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
        <Link to="/" className="hover:text-[#2E7D32]">Home</Link>
        <span>/</span>
        <Link to={`/products?category=${encodeURIComponent(product.category)}`} className="hover:text-[#2E7D32]">
          {product.category}
        </Link>
        <span>/</span>
        <span className="font-bold text-slate-800 dark:text-slate-200 truncate max-w-[200px]">
          {product.name}
        </span>
      </div>

      {/* Main Product Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200/80 dark:border-slate-800">
        
        {/* Gallery & Zoom */}
        <div className="space-y-4">
          <div className="relative aspect-square rounded-2xl overflow-hidden bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-800 group">
            <img
              src={activeImage || product.image}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 cursor-crosshair"
            />
            {product.discountPercent > 0 && (
              <span className="absolute top-4 left-4 bg-amber-500 text-white font-extrabold text-xs px-2.5 py-1 rounded-lg uppercase tracking-wider shadow-md">
                {product.discountPercent}% OFF
              </span>
            )}
            <div className="absolute top-4 right-4 flex items-center gap-2">
              <button
                onClick={handleShare}
                className="p-2 rounded-xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-md text-slate-700 dark:text-slate-200 hover:text-[#2E7D32] shadow-sm transition"
                title="Share link"
              >
                <Share2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Thumbnails */}
          {allImages.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-1">
              {allImages.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImage(img)}
                  className={`w-16 h-16 rounded-xl overflow-hidden border-2 transition shrink-0 ${
                    activeImage === img ? 'border-[#2E7D32] shadow-md' : 'border-transparent opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt={`${product.name} ${i}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}

          {/* Delivery & Trust Guarantees */}
          <div className="grid grid-cols-3 gap-2 pt-4 border-t border-slate-100 dark:border-slate-800 text-[11px] text-center">
            <div className="p-2 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 font-semibold flex flex-col items-center gap-1">
              <Truck className="w-4 h-4 text-[#2E7D32]" />
              <span>25 Mins Greater Noida Delivery</span>
            </div>
            <div className="p-2 rounded-xl bg-amber-50/70 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 font-semibold flex flex-col items-center gap-1">
              <ShieldCheck className="w-4 h-4 text-amber-600" />
              <span>100% Genuine Mandi Fresh</span>
            </div>
            <div className="p-2 rounded-xl bg-blue-50/70 dark:bg-blue-950/40 text-blue-900 dark:text-blue-200 font-semibold flex flex-col items-center gap-1">
              <RotateCcw className="w-4 h-4 text-blue-600" />
              <span>Doorstep Hassle-Free Returns</span>
            </div>
          </div>
        </div>

        {/* Product Details & Purchase Actions */}
        <div className="space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-extrabold uppercase tracking-wider text-[#2E7D32] dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 rounded-md">
                {product.brand}
              </span>
              <span className="text-xs text-slate-400">•</span>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                {product.category}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight leading-snug">
              {product.name}
            </h1>

            {/* Ratings & Reviews summary */}
            <div className="flex items-center gap-3 mt-3">
              <div className="flex items-center gap-1 bg-[#2E7D32] text-white px-2 py-0.5 rounded-lg text-xs font-bold shadow-xs">
                <Star className="w-3.5 h-3.5 fill-current" />
                <span>{product.rating}</span>
              </div>
              <a href="#reviews-section" className="text-xs font-semibold text-slate-500 hover:text-[#2E7D32] transition">
                {product.ratingCount} Ratings & {reviews.length} Verified Reviews
              </a>
              <span className="text-slate-300 dark:text-slate-700">|</span>
              <span className={`text-xs font-bold ${product.stock > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-500'}`}>
                {product.stock > 0 ? `In Stock (${product.stock} available)` : 'Out of Stock'}
              </span>
            </div>
          </div>

          {/* Pricing Box */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 flex items-baseline gap-3">
            <span className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white">
              ₹{currentPrice}
            </span>
            {currentMrp > currentPrice && (
              <>
                <span className="text-sm sm:text-base text-slate-400 line-through">
                  MRP ₹{currentMrp}
                </span>
                <span className="text-xs font-extrabold text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-950 px-2 py-0.5 rounded-md">
                  SAVE ₹{currentMrp - currentPrice}
                </span>
              </>
            )}
            <span className="ml-auto text-xs text-slate-500 dark:text-slate-400 font-medium">
              (Inclusive of all taxes)
            </span>
          </div>

          {/* Variants Selector */}
          {product.variants && product.variants.length > 0 && (
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">
                Select Pack / Unit Size:
              </label>
              <div className="flex flex-wrap gap-2">
                {product.variants.map(v => (
                  <button
                    key={v.id}
                    onClick={() => setSelectedVariantId(v.id)}
                    className={`px-4 py-2.5 rounded-xl text-xs font-bold border transition flex items-center gap-2 ${
                      selectedVariantId === v.id
                        ? 'bg-emerald-50 dark:bg-emerald-950/60 border-[#2E7D32] text-[#2E7D32] dark:text-emerald-400 ring-2 ring-[#2E7D32]/20'
                        : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <span>{v.unit}</span>
                    <span className="text-slate-400">|</span>
                    <span>₹{v.price}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Add to Cart & Buy Now Buttons */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-3">
              {currentCartQty > 0 ? (
                <div className="flex-1 flex items-center justify-between bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-500 rounded-2xl p-2 text-[#2E7D32] dark:text-emerald-300">
                  <button
                    onClick={() => updateQuantity(product.id, currentCartQty - 1, selectedVariantId)}
                    className="w-10 h-10 flex items-center justify-center rounded-xl bg-white dark:bg-slate-800 shadow-sm hover:bg-emerald-500 hover:text-white transition"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="font-black text-base">{currentCartQty} in Cart</span>
                  <button
                    onClick={() => updateQuantity(product.id, currentCartQty + 1, selectedVariantId)}
                    disabled={currentCartQty >= product.stock}
                    className="w-10 h-10 flex items-center justify-center rounded-xl bg-white dark:bg-slate-800 shadow-sm hover:bg-emerald-500 hover:text-white transition disabled:opacity-40"
                    aria-label="Increase quantity"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleAddToCart}
                  disabled={product.stock <= 0}
                  className="flex-1 py-3.5 px-6 rounded-2xl bg-[#2E7D32] hover:bg-[#256628] text-white font-extrabold text-sm shadow-lg shadow-emerald-700/20 flex items-center justify-center gap-2 transition active:scale-98 disabled:opacity-50"
                >
                  <ShoppingBag className="w-5 h-5" />
                  <span>{product.stock <= 0 ? 'Out of Stock' : 'Add to Cart'}</span>
                </button>
              )}

              <button
                onClick={handleBuyNow}
                disabled={product.stock <= 0}
                className="py-3.5 px-6 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-sm shadow-lg shadow-amber-500/20 transition active:scale-98 disabled:opacity-50"
              >
                Buy Now
              </button>
            </div>
          </div>

          {/* Description & Highlights */}
          <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-sm mb-1.5">
                Product Description
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                {product.description}
              </p>
            </div>

            {product.highlights && product.highlights.length > 0 && (
              <div>
                <h4 className="font-bold text-slate-900 dark:text-white text-xs mb-2">
                  Key Features & Highlights
                </h4>
                <ul className="space-y-1.5">
                  {product.highlights.map((h, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-slate-600 dark:text-slate-400">
                      <CheckCircle2 className="w-4 h-4 text-[#2E7D32] shrink-0 mt-0.5" />
                      <span>{h}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Reviews Section */}
      <section id="reviews-section" className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 space-y-8">
        <div className="border-b border-slate-200 dark:border-slate-800 pb-6">
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Customer Ratings & Reviews
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Authentic verified feedback from Greater Noida residents
          </p>
        </div>

        {/* Rating Breakdown Bars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          <div className="text-center md:border-r md:border-slate-200 dark:md:border-slate-800 md:pr-6">
            <div className="text-5xl font-black text-slate-900 dark:text-white">
              {product.rating}
            </div>
            <div className="flex justify-center gap-1 my-2">
              {[1, 2, 3, 4, 5].map(star => (
                <Star
                  key={star}
                  className={`w-5 h-5 ${
                    star <= Math.round(product.rating)
                      ? 'text-amber-400 fill-amber-400'
                      : 'text-slate-300 dark:text-slate-700'
                  }`}
                />
              ))}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Based on {totalReviews} reviews
            </p>
          </div>

          <div className="md:col-span-2 space-y-2">
            {ratingDistribution.map(item => (
              <div key={item.stars} className="flex items-center gap-3 text-xs">
                <span className="w-8 font-bold text-slate-700 dark:text-slate-300">
                  {item.stars} ★
                </span>
                <div className="flex-1 h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <div
                    className="h-full bg-amber-400 rounded-full transition-all"
                    style={{ width: `${item.percent}%` }}
                  />
                </div>
                <span className="w-12 text-right text-slate-400">{item.count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Write Review Form */}
        <div className="bg-slate-50 dark:bg-slate-800/50 p-5 rounded-2xl border border-slate-200/70 dark:border-slate-800">
          <h3 className="font-bold text-slate-900 dark:text-white text-sm mb-1">
            Write a Review
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
            Share freshness, taste, packaging and delivery experience with fellow shoppers.
          </p>

          {!user ? (
            <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <span className="text-xs text-slate-600 dark:text-slate-400">
                Please sign in to write a review.
              </span>
              <Link
                to="/auth"
                className="px-4 py-1.5 rounded-lg bg-[#2E7D32] text-white text-xs font-bold"
              >
                Sign In
              </Link>
            </div>
          ) : userHasReviewed ? (
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/50 rounded-xl border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-300 font-medium">
              You have already reviewed this product. You can manage or remove your review below.
            </div>
          ) : (
            <form onSubmit={handleSubmitReview} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Your Rating:
                </label>
                <div className="flex items-center gap-1.5">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setNewRating(star)}
                      className="p-1 text-amber-400 hover:scale-110 transition"
                    >
                      <Star
                        className={`w-6 h-6 ${
                          star <= newRating ? 'fill-amber-400 text-amber-400' : 'text-slate-300 dark:text-slate-700'
                        }`}
                      />
                    </button>
                  ))}
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300 ml-2">
                    {newRating} / 5 Stars
                  </span>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Your Review:
                </label>
                <textarea
                  value={newComment}
                  onChange={e => setNewComment(e.target.value)}
                  placeholder="e.g. Tomatoes were super crisp and delivered in 20 mins to Delta 1! Highly satisfied."
                  rows={3}
                  className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-xs focus:ring-2 focus:ring-[#2E7D32] focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmittingReview}
                className="px-5 py-2.5 rounded-xl bg-[#2E7D32] hover:bg-[#256628] text-white font-bold text-xs shadow-md transition active:scale-95"
              >
                Submit Review
              </button>
            </form>
          )}
        </div>

        {/* Review List */}
        <div className="space-y-4">
          <h3 className="font-bold text-slate-900 dark:text-white text-sm">
            Customer Reviews ({reviews.length})
          </h3>

          {reviews.length === 0 ? (
            <p className="text-xs text-slate-400 italic">No reviews yet. Be the first to review this product!</p>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {reviews.map(rev => (
                <div key={rev.id} className="py-4 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-emerald-100 dark:bg-emerald-950 text-[#2E7D32] font-bold flex items-center justify-center text-xs">
                        {rev.userName.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-xs font-bold text-slate-900 dark:text-white">
                        {rev.userName}
                      </span>
                    </div>

                    {user && user.uid === rev.userId && (
                      <button
                        onClick={() => handleDeleteReview(rev.id)}
                        className="text-xs text-rose-500 hover:text-rose-700 flex items-center gap-1"
                        title="Delete your review"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete</span>
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-0.5">
                      {[1, 2, 3, 4, 5].map(s => (
                        <Star
                          key={s}
                          className={`w-3 h-3 ${
                            s <= rev.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-300'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-[10px] text-slate-400">
                      {new Date(rev.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    {rev.comment}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Related Products Section */}
      {relatedProducts.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Frequently Bought Together in {product.category}
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
            {relatedProducts.map(item => (
              <ProductCard key={item.id} product={item} />
            ))}
          </div>
        </section>
      )}

    </div>
  );
}

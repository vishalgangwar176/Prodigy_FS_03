import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  MapPin,
  CreditCard,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Truck,
  Plus,
  ShieldCheck,
  AlertCircle,
  Banknote,
  Smartphone,
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/common/Toast';
import { Address, Order, OrderPayment } from '../types';
import { createOrder } from '../services/storageService';

type CheckoutStep = 'address' | 'payment' | 'review';

export function CheckoutPage() {
  const { items, subtotal, deliveryFee, discount, total, appliedCoupon, clearCart } = useCart();
  const { user, addAddress } = useAuth();
  const { success, error, info } = useToast();
  const navigate = useNavigate();

  const [step, setStep] = useState<CheckoutStep>('address');

  // Selected or New Address
  const defaultAddr = user?.addresses.find(a => a.isDefault) || user?.addresses[0];
  const [selectedAddressId, setSelectedAddressId] = useState<string>(defaultAddr?.id || 'new');

  // New Address form inputs
  const [addressForm, setAddressForm] = useState({
    fullName: user?.name || '',
    phone: user?.phone || '+91 98112 34567',
    flat: '',
    street: '',
    landmark: '',
    area: 'Alpha 1, Greater Noida',
    city: 'Greater Noida',
    pincode: '201310',
    tag: 'Home' as 'Home' | 'Work' | 'Other',
  });

  // Payment Method
  const [paymentMethod, setPaymentMethod] = useState<'ONLINE' | 'COD'>('ONLINE');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [showSimulatedModal, setShowSimulatedModal] = useState(false);

  if (items.length === 0) {
    return (
      <div className="max-w-md mx-auto py-16 text-center space-y-4">
        <h2 className="text-2xl font-black text-slate-900 dark:text-white">Your Cart is Empty</h2>
        <p className="text-xs text-slate-500">Please add items to cart before proceeding to checkout.</p>
        <Link
          to="/products"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#2E7D32] text-white font-bold text-xs"
        >
          Browse Groceries
        </Link>
      </div>
    );
  }

  const getEffectiveAddress = (): Address => {
    if (selectedAddressId !== 'new' && user?.addresses) {
      const found = user.addresses.find(a => a.id === selectedAddressId);
      if (found) return found;
    }

    return {
      id: 'addr-' + Date.now(),
      fullName: addressForm.fullName || 'Customer',
      phone: addressForm.phone || '+91 98112 34567',
      flat: addressForm.flat || 'Flat 101',
      street: addressForm.street || 'Main Road',
      landmark: addressForm.landmark,
      area: addressForm.area,
      city: 'Greater Noida',
      pincode: addressForm.pincode,
      tag: addressForm.tag,
    };
  };

  const validateAddress = (): boolean => {
    if (selectedAddressId !== 'new') return true;
    if (!addressForm.fullName.trim()) {
      error('Please provide full recipient name.');
      return false;
    }
    if (!addressForm.phone.trim()) {
      error('Please provide phone number for delivery updates.');
      return false;
    }
    if (!addressForm.flat.trim() || !addressForm.street.trim()) {
      error('Please provide flat number and society / street address.');
      return false;
    }
    return true;
  };

  const handleNextFromAddress = () => {
    if (!validateAddress()) return;
    // Save to user profile if user is logged in and filled new address
    if (user && selectedAddressId === 'new') {
      const saved = addAddress({
        fullName: addressForm.fullName,
        phone: addressForm.phone,
        flat: addressForm.flat,
        street: addressForm.street,
        landmark: addressForm.landmark,
        area: addressForm.area,
        city: 'Greater Noida',
        pincode: addressForm.pincode,
        tag: addressForm.tag,
      });
      setSelectedAddressId(saved.id);
    }
    setStep('payment');
  };

  // Complete Order
  const finalizeOrder = (paymentData: OrderPayment) => {
    const address = getEffectiveAddress();
    const orderId = 'FK-' + new Date().getFullYear() + '-' + Math.floor(1000 + Math.random() * 9000);

    const newOrder: Order = {
      id: orderId,
      userId: user?.uid || 'guest-user',
      userName: address.fullName,
      userEmail: user?.email || 'customer@freshkart.in',
      userPhone: address.phone,
      items: [...items],
      deliveryAddress: address,
      pricing: {
        subtotal,
        deliveryFee,
        discount,
        total,
        couponCode: appliedCoupon?.code,
      },
      payment: paymentData,
      status: 'Placed',
      statusHistory: [
        {
          status: 'Placed',
          timestamp: new Date().toISOString(),
          note: 'Order successfully placed via FreshKart Greater Noida',
        },
      ],
      estimatedDelivery: 'Today, within 25 mins',
      createdAt: new Date().toISOString(),
      cancellable: true,
    };

    createOrder(newOrder);
    clearCart();
    navigate(`/order-confirmation/${orderId}`);
  };

  // Trigger Online Payment (Razorpay real test mode or simulated test mode)
  const triggerRazorpayPayment = () => {
    const razorpayKey = import.meta.env.VITE_RAZORPAY_KEY_ID;
    const address = getEffectiveAddress();

    // Check if window.Razorpay is available and key is configured
    if ((window as any).Razorpay && razorpayKey && razorpayKey !== 'rzp_test_YourKeyHere') {
      try {
        const options = {
          key: razorpayKey,
          amount: total * 100, // amount in paisa
          currency: 'INR',
          name: 'FreshKart Kirana Store',
          description: 'Grocery Delivery Greater Noida',
          image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=200&fit=crop',
          prefill: {
            name: address.fullName,
            email: user?.email || 'customer@freshkart.in',
            contact: address.phone,
          },
          theme: {
            color: '#2E7D32',
          },
          handler: function (response: any) {
            success('Razorpay payment verified successfully!');
            finalizeOrder({
              method: 'ONLINE',
              status: 'PAID',
              razorpayPaymentId: response.razorpay_payment_id || 'pay_rzp_' + Date.now(),
            });
          },
          modal: {
            ondismiss: function () {
              setIsProcessingPayment(false);
              info('Payment flow closed. You can retry anytime.');
            },
          },
        };
        const rzp = new (window as any).Razorpay(options);
        rzp.open();
        return;
      } catch (err) {
        console.warn('Razorpay initialization exception:', err);
      }
    }

    // Interactive Test Payment Modal fallback
    setShowSimulatedModal(true);
  };

  const handlePlaceOrder = () => {
    setIsProcessingPayment(true);

    if (paymentMethod === 'COD') {
      setTimeout(() => {
        finalizeOrder({
          method: 'COD',
          status: 'PENDING',
        });
      }, 600);
    } else {
      triggerRazorpayPayment();
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      
      {/* Checkout Progress Stepper */}
      <div className="bg-white dark:bg-slate-900 p-4 sm:p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800">
        <div className="flex items-center justify-between max-w-lg mx-auto">
          
          {/* Step 1 */}
          <div className="flex flex-col items-center">
            <div
              className={`w-9 h-9 rounded-full flex items-center justify-center font-black text-xs transition ${
                step === 'address'
                  ? 'bg-[#2E7D32] text-white ring-4 ring-emerald-500/20'
                  : 'bg-emerald-100 text-[#2E7D32] dark:bg-emerald-950 dark:text-emerald-400'
              }`}
            >
              1
            </div>
            <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 mt-1">
              Address
            </span>
          </div>

          <div className="flex-1 h-1 mx-3 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
            <div
              className={`h-full bg-[#2E7D32] transition-all duration-300 ${
                step !== 'address' ? 'w-full' : 'w-1/2'
              }`}
            />
          </div>

          {/* Step 2 */}
          <div className="flex flex-col items-center">
            <div
              className={`w-9 h-9 rounded-full flex items-center justify-center font-black text-xs transition ${
                step === 'payment'
                  ? 'bg-[#2E7D32] text-white ring-4 ring-emerald-500/20'
                  : step === 'review'
                  ? 'bg-emerald-100 text-[#2E7D32] dark:bg-emerald-950 dark:text-emerald-400'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
              }`}
            >
              2
            </div>
            <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 mt-1">
              Payment
            </span>
          </div>

          <div className="flex-1 h-1 mx-3 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
            <div
              className={`h-full bg-[#2E7D32] transition-all duration-300 ${
                step === 'review' ? 'w-full' : 'w-0'
              }`}
            />
          </div>

          {/* Step 3 */}
          <div className="flex flex-col items-center">
            <div
              className={`w-9 h-9 rounded-full flex items-center justify-center font-black text-xs transition ${
                step === 'review'
                  ? 'bg-[#2E7D32] text-white ring-4 ring-emerald-500/20'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
              }`}
            >
              3
            </div>
            <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 mt-1">
              Review
            </span>
          </div>

        </div>
      </div>

      {/* STEP 1: ADDRESS */}
      {step === 'address' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 space-y-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              <MapPin className="w-5 h-5 text-[#2E7D32]" />
              Select Greater Noida Delivery Address
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Our Jagat Farm delivery executive will arrive in 20-30 mins
            </p>
          </div>

          {/* Saved Addresses for Logged-In User */}
          {user && user.addresses && user.addresses.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Saved Addresses
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {user.addresses.map(addr => (
                  <div
                    key={addr.id}
                    onClick={() => setSelectedAddressId(addr.id)}
                    className={`p-4 rounded-2xl border-2 cursor-pointer transition flex flex-col justify-between ${
                      selectedAddressId === addr.id
                        ? 'border-[#2E7D32] bg-emerald-50/50 dark:bg-emerald-950/30'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="font-bold text-xs text-slate-900 dark:text-white">
                          {addr.fullName}
                        </span>
                        <span className="text-[10px] font-bold bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-slate-600 dark:text-slate-300">
                          {addr.tag}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-400">
                        {addr.flat}, {addr.street}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                        {addr.area}, {addr.city} - {addr.pincode}
                      </p>
                      <p className="text-xs text-slate-500 mt-1 font-mono">
                        Phone: {addr.phone}
                      </p>
                    </div>

                    <div className="pt-2 text-right">
                      {selectedAddressId === addr.id ? (
                        <span className="text-xs font-bold text-[#2E7D32] flex items-center justify-end gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Deliver Here
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400 font-medium">Click to select</span>
                      )}
                    </div>
                  </div>
                ))}

                {/* Add New Option Card */}
                <div
                  onClick={() => setSelectedAddressId('new')}
                  className={`p-4 rounded-2xl border-2 border-dashed cursor-pointer transition flex items-center justify-center gap-2 ${
                    selectedAddressId === 'new'
                      ? 'border-[#2E7D32] bg-emerald-50/40 text-[#2E7D32]'
                      : 'border-slate-200 dark:border-slate-800 text-slate-500 hover:border-slate-300'
                  }`}
                >
                  <Plus className="w-4 h-4" />
                  <span className="text-xs font-bold">Use a different / new address</span>
                </div>
              </div>
            </div>
          )}

          {/* New Address Input Form */}
          {selectedAddressId === 'new' && (
            <div className="bg-slate-50 dark:bg-slate-800/50 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 space-y-4">
              <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Enter Delivery Details
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Recipient Full Name *
                  </label>
                  <input
                    type="text"
                    value={addressForm.fullName}
                    onChange={e => setAddressForm({ ...addressForm, fullName: e.target.value })}
                    placeholder="e.g. Pooja Verma"
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#2E7D32]"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Mobile Phone (for delivery OTP) *
                  </label>
                  <input
                    type="tel"
                    value={addressForm.phone}
                    onChange={e => setAddressForm({ ...addressForm, phone: e.target.value })}
                    placeholder="e.g. +91 98112 34567"
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#2E7D32]"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Flat / House No., Floor, Tower *
                  </label>
                  <input
                    type="text"
                    value={addressForm.flat}
                    onChange={e => setAddressForm({ ...addressForm, flat: e.target.value })}
                    placeholder="e.g. Flat 402, Tower 6"
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#2E7D32]"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Society Name / Street Address *
                  </label>
                  <input
                    type="text"
                    value={addressForm.street}
                    onChange={e => setAddressForm({ ...addressForm, street: e.target.value })}
                    placeholder="e.g. ATS Greens Paradiso"
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#2E7D32]"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Sector / Area (Greater Noida) *
                  </label>
                  <select
                    value={addressForm.area}
                    onChange={e => setAddressForm({ ...addressForm, area: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#2E7D32]"
                  >
                    <option>Alpha 1, Greater Noida</option>
                    <option>Alpha 2, Greater Noida</option>
                    <option>Beta 1 & 2, Greater Noida</option>
                    <option>Gamma 1 & Jagat Farm Market</option>
                    <option>Delta 1 & 2, Greater Noida</option>
                    <option>Pari Chowk Central Hub</option>
                    <option>Chi IV & Express Highway</option>
                    <option>Jaypee Greens Wish Town</option>
                    <option>Knowledge Park II & III</option>
                    <option>Omega 1 & 2, Greater Noida</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Pincode
                  </label>
                  <input
                    type="text"
                    value={addressForm.pincode}
                    onChange={e => setAddressForm({ ...addressForm, pincode: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Tag selector */}
              <div className="flex items-center gap-3 pt-2">
                <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                  Address Type:
                </span>
                {(['Home', 'Work', 'Other'] as const).map(tag => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => setAddressForm({ ...addressForm, tag })}
                    className={`px-3 py-1 rounded-lg text-xs font-bold border transition ${
                      addressForm.tag === tag
                        ? 'bg-[#2E7D32] text-white border-[#2E7D32]'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-between items-center pt-4 border-t border-slate-100 dark:border-slate-800">
            <Link
              to="/cart"
              className="text-xs font-bold text-slate-500 hover:text-slate-800 dark:hover:text-white flex items-center gap-1"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Cart
            </Link>

            <button
              onClick={handleNextFromAddress}
              className="px-6 py-3 rounded-2xl bg-[#2E7D32] hover:bg-[#256628] text-white font-bold text-xs shadow-lg shadow-emerald-700/20 flex items-center gap-2 transition active:scale-95"
            >
              <span>Continue to Payment</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: PAYMENT METHOD */}
      {step === 'payment' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 space-y-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-[#2E7D32]" />
              Select Payment Method
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Total to pay: <strong className="text-emerald-700 dark:text-emerald-400 text-sm">₹{total}</strong>
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Option 1: Razorpay Online (Cards, UPI, NetBanking) */}
            <div
              onClick={() => setPaymentMethod('ONLINE')}
              className={`p-5 rounded-2xl border-2 cursor-pointer transition flex flex-col justify-between ${
                paymentMethod === 'ONLINE'
                  ? 'border-[#2E7D32] bg-emerald-50/50 dark:bg-emerald-950/30'
                  : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-[#2E7D32] flex items-center justify-center font-bold">
                    <Smartphone className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-extrabold uppercase bg-emerald-100 text-[#2E7D32] px-2 py-0.5 rounded-full">
                    Recommended
                  </span>
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                    Pay Online (Razorpay / UPI / Cards)
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Google Pay, PhonePe, Paytm, RuPay & Visa credit/debit cards.
                  </p>
                </div>
              </div>
              <div className="pt-4 flex items-center justify-between">
                <span className="text-[10px] font-mono text-slate-400">Instant Verification</span>
                {paymentMethod === 'ONLINE' && <CheckCircle2 className="w-4 h-4 text-[#2E7D32]" />}
              </div>
            </div>

            {/* Option 2: Cash on Delivery */}
            <div
              onClick={() => setPaymentMethod('COD')}
              className={`p-5 rounded-2xl border-2 cursor-pointer transition flex flex-col justify-between ${
                paymentMethod === 'COD'
                  ? 'border-[#2E7D32] bg-emerald-50/50 dark:bg-emerald-950/30'
                  : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
              }`}
            >
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-950 text-amber-600 flex items-center justify-center font-bold">
                  <Banknote className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                    Cash on Delivery (COD)
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Pay via cash or UPI QR scanner to our rider at your door.
                  </p>
                </div>
              </div>
              <div className="pt-4 flex items-center justify-between">
                <span className="text-[10px] font-mono text-slate-400">Zero Convenience Fee</span>
                {paymentMethod === 'COD' && <CheckCircle2 className="w-4 h-4 text-[#2E7D32]" />}
              </div>
            </div>

          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 text-xs text-slate-500 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-[#2E7D32] shrink-0" />
            <span>256-Bit SSL Encrypted. In TEST mode, test payments will complete without charging your actual bank account.</span>
          </div>

          <div className="flex justify-between items-center pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              onClick={() => setStep('address')}
              className="text-xs font-bold text-slate-500 hover:text-slate-800 dark:hover:text-white flex items-center gap-1"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Address
            </button>

            <button
              onClick={() => setStep('review')}
              className="px-6 py-3 rounded-2xl bg-[#2E7D32] hover:bg-[#256628] text-white font-bold text-xs shadow-lg shadow-emerald-700/20 flex items-center gap-2 transition active:scale-95"
            >
              <span>Review Order</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: REVIEW & PLACE ORDER */}
      {step === 'review' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 space-y-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Review & Place Order
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Please check your grocery list and delivery location before confirming
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Delivery address summary */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Deliver To
                </span>
                <button
                  onClick={() => setStep('address')}
                  className="text-xs font-semibold text-[#2E7D32] hover:underline"
                >
                  Change
                </button>
              </div>
              <div className="text-xs font-bold text-slate-900 dark:text-white">
                {getEffectiveAddress().fullName}
              </div>
              <div className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                {getEffectiveAddress().flat}, {getEffectiveAddress().street}
              </div>
              <div className="text-xs text-slate-500">
                {getEffectiveAddress().area}, Greater Noida - {getEffectiveAddress().pincode}
              </div>
              <div className="text-xs text-slate-500 font-mono mt-1">
                Phone: {getEffectiveAddress().phone}
              </div>
            </div>

            {/* Payment Summary */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Payment Mode
                </span>
                <button
                  onClick={() => setStep('payment')}
                  className="text-xs font-semibold text-[#2E7D32] hover:underline"
                >
                  Change
                </button>
              </div>
              <div className="text-xs font-bold text-slate-900 dark:text-white">
                {paymentMethod === 'ONLINE' ? 'Razorpay Online (UPI / Card / NetBanking)' : 'Cash on Delivery (COD)'}
              </div>
              <div className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold mt-1">
                Estimated Delivery: Today, within 25 mins
              </div>
            </div>
          </div>

          {/* Items Preview */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Order Items ({items.length})
            </h3>
            <div className="max-h-56 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-3">
              {items.map(item => (
                <div key={item.productId} className="py-2.5 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <img
                      src={item.product.image}
                      alt={item.product.name}
                      className="w-10 h-10 rounded-lg object-cover"
                    />
                    <div>
                      <div className="font-bold text-slate-900 dark:text-white truncate max-w-[240px]">
                        {item.product.name}
                      </div>
                      <div className="text-slate-400">{item.unit} • Qty: {item.quantity}</div>
                    </div>
                  </div>
                  <div className="font-black text-slate-900 dark:text-white">
                    ₹{item.price * item.quantity}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Bill Breakdown */}
          <div className="p-4 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900 space-y-2 text-xs">
            <div className="flex justify-between text-slate-600 dark:text-slate-400">
              <span>Items Subtotal</span>
              <span>₹{subtotal}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-bold">
                <span>Coupon ({appliedCoupon?.code})</span>
                <span>-₹{discount}</span>
              </div>
            )}
            <div className="flex justify-between text-slate-600 dark:text-slate-400">
              <span>Express Greater Noida Delivery</span>
              <span>{deliveryFee === 0 ? <strong className="text-emerald-600">FREE</strong> : `₹${deliveryFee}`}</span>
            </div>
            <div className="flex justify-between text-base font-black text-slate-900 dark:text-white pt-2 border-t border-emerald-200 dark:border-emerald-800/80">
              <span>Total Payable</span>
              <span className="text-emerald-700 dark:text-emerald-400 text-lg">₹{total}</span>
            </div>
          </div>

          {/* Place Order CTA */}
          <div className="flex justify-between items-center pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              onClick={() => setStep('payment')}
              className="text-xs font-bold text-slate-500 hover:text-slate-800 dark:hover:text-white flex items-center gap-1"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>

            <button
              onClick={handlePlaceOrder}
              disabled={isProcessingPayment}
              className="px-8 py-3.5 rounded-2xl bg-[#2E7D32] hover:bg-[#256628] text-white font-black text-sm shadow-xl shadow-emerald-700/25 flex items-center gap-2 transition active:scale-95 disabled:opacity-50"
            >
              {isProcessingPayment ? (
                <span>Processing...</span>
              ) : (
                <>
                  <span>Place Order • ₹{total}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Simulated Interactive Test Payment Modal */}
      {showSimulatedModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-[#2E7D32] flex items-center justify-center font-bold">
                  ₹
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                    Razorpay Checkout Simulation
                  </h3>
                  <p className="text-[10px] text-slate-400">Test Sandbox Mode</p>
                </div>
              </div>
              <span className="text-xs font-black text-emerald-700 dark:text-emerald-400">
                ₹{total}
              </span>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300">
              Select a simulated payment method to complete this order:
            </p>

            <div className="space-y-2">
              <button
                onClick={() => {
                  setShowSimulatedModal(false);
                  setIsProcessingPayment(false);
                  success('Simulated UPI payment verified via GPay!');
                  finalizeOrder({
                    method: 'ONLINE',
                    status: 'PAID',
                    razorpayPaymentId: 'pay_sim_upi_' + Date.now(),
                  });
                }}
                className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-left text-xs font-bold flex items-center justify-between transition"
              >
                <span>Google Pay / PhonePe UPI (Auto Approve)</span>
                <ArrowRight className="w-4 h-4 text-[#2E7D32]" />
              </button>

              <button
                onClick={() => {
                  setShowSimulatedModal(false);
                  setIsProcessingPayment(false);
                  success('Simulated Card payment verified (RuPay/Visa)!');
                  finalizeOrder({
                    method: 'ONLINE',
                    status: 'PAID',
                    razorpayPaymentId: 'pay_sim_card_' + Date.now(),
                  });
                }}
                className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-left text-xs font-bold flex items-center justify-between transition"
              >
                <span>Credit / Debit Card (Auto Approve)</span>
                <ArrowRight className="w-4 h-4 text-[#2E7D32]" />
              </button>

              <button
                onClick={() => {
                  setShowSimulatedModal(false);
                  setIsProcessingPayment(false);
                  error('Simulated payment was cancelled.');
                }}
                className="w-full p-2.5 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 text-center text-xs font-semibold transition"
              >
                Simulate Payment Failure / Cancel
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

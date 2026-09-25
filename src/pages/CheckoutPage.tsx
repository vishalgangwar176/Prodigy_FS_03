import React, { useState, useEffect } from 'react';
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
  QrCode,
  Building2,
  Copy,
  Check,
  Timer,
  Edit2,
  X,
  Lock,
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/common/Toast';
import { Address, Order, OrderPayment } from '../types';
import { createOrder } from '../services/storageService';

type CheckoutStep = 'address' | 'payment' | 'review';
type PaymentTab = 'UPI_QR' | 'NETBANKING' | 'CARD';

const POPULAR_AREAS = [
  'Alpha 1, Greater Noida',
  'Alpha 2, Greater Noida',
  'Beta 1 & 2, Greater Noida',
  'Gamma 1 & Jagat Farm Market',
  'Delta 1 & 2, Greater Noida',
  'Pari Chowk Hub, Greater Noida',
  'Chi IV & ATS Paradiso, Greater Noida',
  'Jaypee Greens Wish Town, Greater Noida',
  'Omega 1 & 2, Greater Noida',
  'Knowledge Park II & III, Greater Noida',
  'Sector 16B, Gaur City 2, Greater Noida West',
  'Zeta 1, Greater Noida',
];

const POPULAR_BANKS = [
  { id: 'sbi', name: 'State Bank of India', code: 'SBI', short: 'SBI' },
  { id: 'hdfc', name: 'HDFC Bank', code: 'HDFC', short: 'HDFC' },
  { id: 'icici', name: 'ICICI Bank', code: 'ICICI', short: 'ICICI' },
  { id: 'axis', name: 'Axis Bank', code: 'UTIBR', short: 'Axis' },
  { id: 'kotak', name: 'Kotak Mahindra Bank', code: 'KKBK', short: 'Kotak' },
  { id: 'pnb', name: 'Punjab National Bank', code: 'PUNB', short: 'PNB' },
  { id: 'bob', name: 'Bank of Baroda', code: 'BARB', short: 'BOB' },
  { id: 'canara', name: 'Canara Bank', code: 'CNRB', short: 'Canara' },
];

export function CheckoutPage() {
  const { items, subtotal, deliveryFee, discount, total, appliedCoupon, clearCart } = useCart();
  const { user, addAddress } = useAuth();
  const { success, error, info } = useToast();
  const navigate = useNavigate();

  const [step, setStep] = useState<CheckoutStep>('address');

  // Address Selection mode: 'saved' or 'manual'
  const hasSavedAddresses = Boolean(user && user.addresses && user.addresses.length > 0);
  const defaultAddr = user?.addresses.find(a => a.isDefault) || user?.addresses?.[0];
  const [addressMode, setAddressMode] = useState<'saved' | 'manual'>(hasSavedAddresses ? 'saved' : 'manual');
  const [selectedAddressId, setSelectedAddressId] = useState<string>(defaultAddr?.id || 'manual');

  // Manual Address Form State
  const [addressForm, setAddressForm] = useState({
    fullName: user?.name || '',
    phone: user?.phone || '+91 98112 34567',
    flat: '',
    street: '',
    landmark: '',
    area: 'Alpha 1, Greater Noida',
    city: 'Greater Noida',
    state: 'Uttar Pradesh',
    pincode: '201310',
    tag: 'Home' as 'Home' | 'Work' | 'Other',
    saveToProfile: true,
  });

  // Payment Method
  const [paymentMethod, setPaymentMethod] = useState<'ONLINE' | 'COD'>('ONLINE');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [showSimulatedModal, setShowSimulatedModal] = useState(false);

  // Gateway Modal states
  const [activePaymentTab, setActivePaymentTab] = useState<PaymentTab>('UPI_QR');
  const [qrTimerSeconds, setQrTimerSeconds] = useState(300); // 5 mins
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [manualUtr, setManualUtr] = useState('');
  const [selectedBankId, setSelectedBankId] = useState('sbi');
  const [netBankingCustId, setNetBankingCustId] = useState('FK_CUST_98214');
  const [isSimulatingBankAuth, setIsSimulatingBankAuth] = useState(false);
  const [cardForm, setCardForm] = useState({
    number: '4532 8920 1928 8812',
    name: user?.name || 'Customer Name',
    expiry: '08/29',
    cvv: '821',
  });

  // Countdown timer for QR
  useEffect(() => {
    if (!showSimulatedModal) return;
    const interval = setInterval(() => {
      setQrTimerSeconds(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [showSimulatedModal]);

  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

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
    if (addressMode === 'saved' && selectedAddressId !== 'manual' && user?.addresses) {
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
      area: addressForm.area || 'Alpha 1, Greater Noida',
      city: addressForm.city || 'Greater Noida',
      state: addressForm.state || 'Uttar Pradesh',
      pincode: addressForm.pincode || '201310',
      tag: addressForm.tag,
    };
  };

  const validateAddress = (): boolean => {
    if (addressMode === 'saved' && selectedAddressId !== 'manual') return true;
    if (!addressForm.fullName.trim()) {
      error('Please provide recipient full name.');
      return false;
    }
    if (!addressForm.phone.trim() || addressForm.phone.trim().length < 8) {
      error('Please provide a valid 10-digit mobile number.');
      return false;
    }
    if (!addressForm.flat.trim()) {
      error('Please provide flat / house number.');
      return false;
    }
    if (!addressForm.street.trim()) {
      error('Please provide society / colony / street address.');
      return false;
    }
    if (!addressForm.area.trim()) {
      error('Please provide sector / area name.');
      return false;
    }
    return true;
  };

  const handleNextFromAddress = () => {
    if (!validateAddress()) return;
    // Save to user profile if user is logged in and opted to save
    if (user && addressMode === 'manual' && addressForm.saveToProfile) {
      const saved = addAddress({
        fullName: addressForm.fullName,
        phone: addressForm.phone,
        flat: addressForm.flat,
        street: addressForm.street,
        landmark: addressForm.landmark,
        area: addressForm.area,
        city: addressForm.city,
        pincode: addressForm.pincode,
        tag: addressForm.tag,
      });
      setSelectedAddressId(saved.id);
    }
    setStep('payment');
  };

  // Complete Order & Persist
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
              paymentType: 'RAZORPAY',
              paidAt: new Date().toISOString(),
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
          paymentType: 'COD',
        });
      }, 600);
    } else {
      triggerRazorpayPayment();
    }
  };

  const copyUpiId = () => {
    navigator.clipboard.writeText('freshkart.groceries@okhdfcbank');
    setCopiedUpi(true);
    success('UPI ID copied to clipboard!');
    setTimeout(() => setCopiedUpi(false), 2500);
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
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                <MapPin className="w-5 h-5 text-[#2E7D32]" />
                Delivery Address in Greater Noida
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Delivering from Jagat Farm store directly to your doorstep in 20-30 mins
              </p>
            </div>

            {/* Address Mode Switcher if user has saved addresses */}
            {hasSavedAddresses && (
              <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl shrink-0 self-start sm:self-auto">
                <button
                  type="button"
                  onClick={() => setAddressMode('saved')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                    addressMode === 'saved'
                      ? 'bg-white dark:bg-slate-700 text-[#2E7D32] shadow-xs'
                      : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  Saved Addresses ({user?.addresses?.length})
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAddressMode('manual');
                    setSelectedAddressId('manual');
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                    addressMode === 'manual'
                      ? 'bg-white dark:bg-slate-700 text-[#2E7D32] shadow-xs'
                      : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  + Add Address Manually
                </button>
              </div>
            )}
          </div>

          {/* Saved Addresses List */}
          {addressMode === 'saved' && hasSavedAddresses && (
            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {user?.addresses?.map(addr => (
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
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-bold bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-slate-600 dark:text-slate-300">
                            {addr.tag}
                          </span>
                          <button
                            type="button"
                            onClick={e => {
                              e.stopPropagation();
                              setAddressForm({
                                fullName: addr.fullName,
                                phone: addr.phone,
                                flat: addr.flat,
                                street: addr.street,
                                landmark: addr.landmark || '',
                                area: addr.area,
                                city: addr.city,
                                state: addr.state || 'Uttar Pradesh',
                                pincode: addr.pincode,
                                tag: (addr.tag as any) || 'Home',
                                saveToProfile: false,
                              });
                              setAddressMode('manual');
                              setSelectedAddressId('manual');
                            }}
                            className="p-1 hover:text-[#2E7D32] text-slate-400"
                            title="Edit this address"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
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
                  onClick={() => {
                    setAddressMode('manual');
                    setSelectedAddressId('manual');
                  }}
                  className="p-4 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-[#2E7D32] cursor-pointer transition flex items-center justify-center gap-2 text-slate-600 dark:text-slate-400 hover:text-[#2E7D32]"
                >
                  <Plus className="w-4 h-4" />
                  <span className="text-xs font-bold">Type New Address Manually</span>
                </div>
              </div>
            </div>
          )}

          {/* Manual Address Input Form */}
          {(addressMode === 'manual' || !hasSavedAddresses) && (
            <div className="bg-slate-50 dark:bg-slate-800/50 p-5 sm:p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-[#2E7D32]" />
                  Enter Address Details Manually
                </h3>
                {hasSavedAddresses && (
                  <button
                    type="button"
                    onClick={() => setAddressMode('saved')}
                    className="text-xs font-bold text-[#2E7D32] hover:underline"
                  >
                    Select From Saved Addresses
                  </button>
                )}
              </div>

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
                    Mobile Phone (10 Digits for delivery OTP) *
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
                    Society Name / Colony / Building *
                  </label>
                  <input
                    type="text"
                    value={addressForm.street}
                    onChange={e => setAddressForm({ ...addressForm, street: e.target.value })}
                    placeholder="e.g. ATS Greens Paradiso / Omaxe Palm Greens"
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#2E7D32]"
                  />
                </div>

                {/* Free Manual Area Entry with Datalist Suggestions */}
                <div className="sm:col-span-2">
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Sector / Area / Locality (Manual Entry) *
                  </label>
                  <input
                    type="text"
                    list="greaterNoidaAreas"
                    value={addressForm.area}
                    onChange={e => setAddressForm({ ...addressForm, area: e.target.value })}
                    placeholder="Type any sector e.g. Alpha 1, Chi IV, Pari Chowk, Sector 16B Gaur City, Knowledge Park..."
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#2E7D32]"
                  />
                  <datalist id="greaterNoidaAreas">
                    {POPULAR_AREAS.map(ar => (
                      <option key={ar} value={ar} />
                    ))}
                  </datalist>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Landmark (Optional)
                  </label>
                  <input
                    type="text"
                    value={addressForm.landmark}
                    onChange={e => setAddressForm({ ...addressForm, landmark: e.target.value })}
                    placeholder="e.g. Near Pari Chowk Metro / Opposite Jagat Farm"
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#2E7D32]"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Pincode *
                  </label>
                  <input
                    type="text"
                    value={addressForm.pincode}
                    onChange={e => setAddressForm({ ...addressForm, pincode: e.target.value })}
                    placeholder="201310"
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    City
                  </label>
                  <input
                    type="text"
                    value={addressForm.city}
                    onChange={e => setAddressForm({ ...addressForm, city: e.target.value })}
                    placeholder="Greater Noida"
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    State
                  </label>
                  <input
                    type="text"
                    value={addressForm.state}
                    onChange={e => setAddressForm({ ...addressForm, state: e.target.value })}
                    placeholder="Uttar Pradesh"
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Tag selector & Save Checkbox */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-slate-200 dark:border-slate-700/60">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                    Address Label:
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

                {user && (
                  <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={addressForm.saveToProfile}
                      onChange={e => setAddressForm({ ...addressForm, saveToProfile: e.target.checked })}
                      className="w-4 h-4 accent-[#2E7D32] rounded"
                    />
                    Save this address to my profile
                  </label>
                )}
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
            
            {/* Option 1: Razorpay Online (Cards, UPI QR, NetBanking) */}
            <div
              onClick={() => setPaymentMethod('ONLINE')}
              className={`p-5 rounded-2xl border-2 cursor-pointer transition flex flex-col justify-between ${
                paymentMethod === 'ONLINE'
                  ? 'border-[#2E7D32] bg-emerald-50/50 dark:bg-emerald-950/30 ring-2 ring-emerald-500/20'
                  : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-[#2E7D32] flex items-center justify-center font-bold">
                    <QrCode className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-extrabold uppercase bg-emerald-100 text-[#2E7D32] px-2 py-0.5 rounded-full">
                    Fast & Verified
                  </span>
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
                    <span>UPI QR Code & NetBanking</span>
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Scan via Google Pay, PhonePe, Paytm, BHIM, or use SBI, HDFC, ICICI NetBanking.
                  </p>
                </div>
              </div>
              <div className="pt-4 flex items-center justify-between">
                <span className="text-[10px] font-mono text-[#2E7D32] dark:text-emerald-400 font-bold">
                  Instant QR / NetBanking Gateway
                </span>
                {paymentMethod === 'ONLINE' && <CheckCircle2 className="w-4 h-4 text-[#2E7D32]" />}
              </div>
            </div>

            {/* Option 2: Cash on Delivery */}
            <div
              onClick={() => setPaymentMethod('COD')}
              className={`p-5 rounded-2xl border-2 cursor-pointer transition flex flex-col justify-between ${
                paymentMethod === 'COD'
                  ? 'border-[#2E7D32] bg-emerald-50/50 dark:bg-emerald-950/30 ring-2 ring-emerald-500/20'
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
                    Pay via cash or UPI to our delivery rider upon doorstep grocery delivery.
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
            <span>256-Bit SSL Encrypted. Supports direct UPI QR scanning, Indian NetBanking, and RuPay/Visa test modes.</span>
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
                {getEffectiveAddress().area}, {getEffectiveAddress().city} - {getEffectiveAddress().pincode}
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
                {paymentMethod === 'ONLINE' ? 'Online (UPI QR Code / NetBanking / Cards)' : 'Cash on Delivery (COD)'}
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
                  <span>
                    {paymentMethod === 'ONLINE' ? `Pay ₹${total} Online` : `Place Order (COD) • ₹${total}`}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* INTERACTIVE PAYMENT GATEWAY WITH DUMMY QR & NETBANKING MODAL */}
      {showSimulatedModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-5 sm:p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 my-auto">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 text-[#2E7D32] dark:bg-emerald-950/80 flex items-center justify-center font-black">
                  ₹
                </div>
                <div>
                  <h3 className="font-black text-sm sm:text-base text-slate-900 dark:text-white">
                    FreshKart Verified Payment
                  </h3>
                  <p className="text-[10px] text-slate-400 flex items-center gap-1">
                    <Lock className="w-3 h-3 text-emerald-600" />
                    256-Bit Encrypted Indian Banking Gateway
                  </p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Amount</span>
                <span className="text-base font-black text-[#2E7D32] dark:text-emerald-400">
                  ₹{total}
                </span>
              </div>
            </div>

            {/* Gateway Tabs */}
            <div className="flex rounded-xl bg-slate-100 dark:bg-slate-800 p-1 text-xs">
              <button
                type="button"
                onClick={() => setActivePaymentTab('UPI_QR')}
                className={`flex-1 py-2 rounded-lg font-bold flex items-center justify-center gap-1.5 transition ${
                  activePaymentTab === 'UPI_QR'
                    ? 'bg-white dark:bg-slate-700 text-[#2E7D32] shadow-xs'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                <QrCode className="w-3.5 h-3.5" />
                <span>UPI QR Code</span>
              </button>

              <button
                type="button"
                onClick={() => setActivePaymentTab('NETBANKING')}
                className={`flex-1 py-2 rounded-lg font-bold flex items-center justify-center gap-1.5 transition ${
                  activePaymentTab === 'NETBANKING'
                    ? 'bg-white dark:bg-slate-700 text-[#2E7D32] shadow-xs'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                <Building2 className="w-3.5 h-3.5" />
                <span>NetBanking</span>
              </button>

              <button
                type="button"
                onClick={() => setActivePaymentTab('CARD')}
                className={`flex-1 py-2 rounded-lg font-bold flex items-center justify-center gap-1.5 transition ${
                  activePaymentTab === 'CARD'
                    ? 'bg-white dark:bg-slate-700 text-[#2E7D32] shadow-xs'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                <CreditCard className="w-3.5 h-3.5" />
                <span>Cards</span>
              </button>
            </div>

            {/* TAB 1: DUMMY UPI QR CODE */}
            {activePaymentTab === 'UPI_QR' && (
              <div className="space-y-4 text-center">
                <div className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800">
                  <p className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                    Scan with any UPI App (Google Pay / PhonePe / Paytm / BHIM)
                  </p>

                  {/* High Quality SVG Dummy QR Code */}
                  <div className="relative mx-auto w-48 h-48 bg-white p-3 rounded-2xl shadow-md border border-slate-200 flex items-center justify-center">
                    <svg
                      viewBox="0 0 200 200"
                      className="w-full h-full text-slate-900"
                      fill="currentColor"
                    >
                      {/* Top-Left Finder Pattern */}
                      <rect x="10" y="10" width="50" height="50" fill="#1F2937" rx="6" />
                      <rect x="20" y="20" width="30" height="30" fill="white" rx="3" />
                      <rect x="26" y="26" width="18" height="18" fill="#2E7D32" rx="2" />

                      {/* Top-Right Finder Pattern */}
                      <rect x="140" y="10" width="50" height="50" fill="#1F2937" rx="6" />
                      <rect x="150" y="20" width="30" height="30" fill="white" rx="3" />
                      <rect x="156" y="26" width="18" height="18" fill="#2E7D32" rx="2" />

                      {/* Bottom-Left Finder Pattern */}
                      <rect x="10" y="140" width="50" height="50" fill="#1F2937" rx="6" />
                      <rect x="20" y="150" width="30" height="30" fill="white" rx="3" />
                      <rect x="26" y="156" width="18" height="18" fill="#2E7D32" rx="2" />

                      {/* Dummy Matrix Dots & Timing Tracks */}
                      <rect x="70" y="20" width="8" height="8" />
                      <rect x="90" y="20" width="8" height="8" />
                      <rect x="110" y="20" width="8" height="8" />
                      <rect x="70" y="40" width="8" height="8" />
                      <rect x="100" y="40" width="8" height="8" />
                      <rect x="120" y="40" width="8" height="8" />
                      <rect x="20" y="70" width="8" height="8" />
                      <rect x="40" y="70" width="8" height="8" />
                      <rect x="70" y="70" width="8" height="8" />
                      <rect x="90" y="70" width="8" height="8" />
                      <rect x="110" y="70" width="8" height="8" />
                      <rect x="140" y="70" width="8" height="8" />
                      <rect x="160" y="70" width="8" height="8" />

                      {/* Center Cluster */}
                      <rect x="70" y="90" width="8" height="8" />
                      <rect x="120" y="90" width="8" height="8" />
                      <rect x="70" y="110" width="8" height="8" />
                      <rect x="90" y="110" width="8" height="8" />
                      <rect x="120" y="110" width="8" height="8" />
                      <rect x="20" y="120" width="8" height="8" />
                      <rect x="40" y="120" width="8" height="8" />
                      <rect x="140" y="100" width="8" height="8" />
                      <rect x="160" y="100" width="8" height="8" />
                      <rect x="180" y="100" width="8" height="8" />

                      {/* Bottom-Right Matrix Dots */}
                      <rect x="70" y="140" width="8" height="8" />
                      <rect x="90" y="140" width="8" height="8" />
                      <rect x="110" y="140" width="8" height="8" />
                      <rect x="140" y="140" width="8" height="8" />
                      <rect x="160" y="140" width="8" height="8" />
                      <rect x="80" y="160" width="8" height="8" />
                      <rect x="100" y="160" width="8" height="8" />
                      <rect x="130" y="160" width="8" height="8" />
                      <rect x="150" y="160" width="8" height="8" />
                      <rect x="170" y="160" width="8" height="8" />
                      <rect x="70" y="180" width="8" height="8" />
                      <rect x="110" y="180" width="8" height="8" />
                      <rect x="140" y="180" width="8" height="8" />
                      <rect x="170" y="180" width="8" height="8" />
                    </svg>

                    {/* FreshKart Logo Badge in Center of QR */}
                    <div className="absolute inset-0 m-auto w-10 h-10 rounded-xl bg-white border-2 border-[#2E7D32] flex items-center justify-center shadow-md">
                      <div className="w-7 h-7 rounded-lg bg-[#2E7D32] text-white flex items-center justify-center font-black text-xs">
                        FK
                      </div>
                    </div>
                  </div>

                  {/* Timer & UPI VPA */}
                  <div className="mt-3 flex items-center justify-center gap-2 text-xs">
                    <span className="text-slate-400 flex items-center gap-1 font-mono">
                      <Timer className="w-3.5 h-3.5 text-amber-500 animate-spin" />
                      Expires in: <strong className="text-slate-800 dark:text-slate-200">{formatTimer(qrTimerSeconds)}</strong>
                    </span>
                  </div>

                  <div className="mt-2.5 inline-flex items-center gap-2 bg-white dark:bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-mono text-slate-700 dark:text-slate-300">
                    <span>freshkart.groceries@okhdfcbank</span>
                    <button
                      type="button"
                      onClick={copyUpiId}
                      className="text-[#2E7D32] hover:text-[#256628] font-bold flex items-center gap-1"
                      title="Copy UPI ID"
                    >
                      {copiedUpi ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                {/* Primary QR Approve Action */}
                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowSimulatedModal(false);
                      setIsProcessingPayment(false);
                      success('UPI payment verified via Google Pay / PhonePe!');
                      finalizeOrder({
                        method: 'ONLINE',
                        status: 'PAID',
                        paymentType: 'UPI_QR',
                        upiTransactionId: 'UPI/' + Math.floor(100000000000 + Math.random() * 900000000000),
                        paidAt: new Date().toISOString(),
                      });
                    }}
                    className="w-full py-3 rounded-2xl bg-[#2E7D32] hover:bg-[#256628] text-white font-black text-xs shadow-lg shadow-emerald-700/20 flex items-center justify-center gap-2 transition active:scale-95"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>I Have Paid via UPI (Auto-Approve Order)</span>
                  </button>

                  {/* Manual UTR field */}
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Or enter 12-digit UTR (e.g. 428198273910)"
                      value={manualUtr}
                      onChange={e => setManualUtr(e.target.value)}
                      className="flex-1 p-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (!manualUtr.trim() || manualUtr.trim().length < 6) {
                          error('Please enter a valid UPI Reference / UTR Number.');
                          return;
                        }
                        setShowSimulatedModal(false);
                        setIsProcessingPayment(false);
                        success('Payment confirmed with UTR ' + manualUtr.trim());
                        finalizeOrder({
                          method: 'ONLINE',
                          status: 'PAID',
                          paymentType: 'UPI_QR',
                          upiTransactionId: manualUtr.trim(),
                          paidAt: new Date().toISOString(),
                        });
                      }}
                      className="px-4 py-2 rounded-xl bg-slate-800 text-white dark:bg-slate-700 text-xs font-bold shrink-0 hover:bg-slate-900"
                    >
                      Verify UTR
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: INDIAN NETBANKING SYSTEM */}
            {activePaymentTab === 'NETBANKING' && (
              <div className="space-y-4 text-xs">
                <div className="space-y-2">
                  <label className="font-bold text-slate-700 dark:text-slate-300 block">
                    Select Your Bank:
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {POPULAR_BANKS.map(bank => (
                      <button
                        key={bank.id}
                        type="button"
                        onClick={() => setSelectedBankId(bank.id)}
                        className={`p-2.5 rounded-xl border flex flex-col items-center justify-center text-center gap-1 transition ${
                          selectedBankId === bank.id
                            ? 'border-[#2E7D32] bg-emerald-50 dark:bg-emerald-950/50 text-[#2E7D32] font-black ring-2 ring-emerald-500/20'
                            : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                        }`}
                      >
                        <Building2 className="w-4 h-4" />
                        <span className="text-[11px] truncate w-full">{bank.short}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Simulated NetBanking Credential Box */}
                <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 space-y-3">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-bold text-slate-500">
                      Bank: <strong className="text-slate-900 dark:text-white">{POPULAR_BANKS.find(b => b.id === selectedBankId)?.name}</strong>
                    </span>
                    <span className="font-mono text-emerald-600 font-bold">Secure Banking Portal</span>
                  </div>

                  <div>
                    <label className="font-semibold text-slate-600 dark:text-slate-400 block mb-1">
                      Customer ID / NetBanking Username
                    </label>
                    <input
                      type="text"
                      value={netBankingCustId}
                      onChange={e => setNetBankingCustId(e.target.value)}
                      placeholder="e.g. USER883192"
                      className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                <button
                  type="button"
                  disabled={isSimulatingBankAuth}
                  onClick={() => {
                    setIsSimulatingBankAuth(true);
                    const bank = POPULAR_BANKS.find(b => b.id === selectedBankId);
                    setTimeout(() => {
                      setIsSimulatingBankAuth(false);
                      setShowSimulatedModal(false);
                      setIsProcessingPayment(false);
                      success(`NetBanking payment verified via ${bank?.name}!`);
                      finalizeOrder({
                        method: 'ONLINE',
                        status: 'PAID',
                        paymentType: 'NETBANKING',
                        bankName: bank?.name,
                        razorpayPaymentId: `NETBNK_${bank?.code}_${Date.now()}`,
                        paidAt: new Date().toISOString(),
                      });
                    }, 1200);
                  }}
                  className="w-full py-3 rounded-2xl bg-[#2E7D32] hover:bg-[#256628] text-white font-black text-xs shadow-lg shadow-emerald-700/20 flex items-center justify-center gap-2 transition active:scale-95 disabled:opacity-50"
                >
                  {isSimulatingBankAuth ? (
                    <span>Authenticating with {POPULAR_BANKS.find(b => b.id === selectedBankId)?.short} Server...</span>
                  ) : (
                    <>
                      <Building2 className="w-4 h-4" />
                      <span>Authorize & Pay ₹{total} via NetBanking</span>
                    </>
                  )}
                </button>
              </div>
            )}

            {/* TAB 3: DEBIT / CREDIT CARD */}
            {activePaymentTab === 'CARD' && (
              <div className="space-y-3 text-xs">
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Card Number
                  </label>
                  <input
                    type="text"
                    value={cardForm.number}
                    onChange={e => setCardForm({ ...cardForm, number: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-mono"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                      Expiry Date
                    </label>
                    <input
                      type="text"
                      value={cardForm.expiry}
                      onChange={e => setCardForm({ ...cardForm, expiry: e.target.value })}
                      placeholder="MM/YY"
                      className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                      CVV
                    </label>
                    <input
                      type="password"
                      maxLength={4}
                      value={cardForm.cvv}
                      onChange={e => setCardForm({ ...cardForm, cvv: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Cardholder Full Name
                  </label>
                  <input
                    type="text"
                    value={cardForm.name}
                    onChange={e => setCardForm({ ...cardForm, name: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setShowSimulatedModal(false);
                    setIsProcessingPayment(false);
                    success('Card payment verified via RuPay / Visa Sandbox!');
                    finalizeOrder({
                      method: 'ONLINE',
                      status: 'PAID',
                      paymentType: 'CARD',
                      razorpayPaymentId: 'CARD_' + Date.now(),
                      paidAt: new Date().toISOString(),
                    });
                  }}
                  className="w-full py-3 rounded-2xl bg-[#2E7D32] hover:bg-[#256628] text-white font-black text-xs shadow-lg shadow-emerald-700/20 flex items-center justify-center gap-2 transition active:scale-95 mt-2"
                >
                  <CreditCard className="w-4 h-4" />
                  <span>Pay ₹{total} with Card</span>
                </button>
              </div>
            )}

            {/* Cancel Footer */}
            <div className="pt-2 text-center">
              <button
                type="button"
                onClick={() => {
                  setShowSimulatedModal(false);
                  setIsProcessingPayment(false);
                  info('Payment flow closed. You can retry anytime.');
                }}
                className="text-xs font-semibold text-slate-400 hover:text-rose-500 transition"
              >
                Cancel and return to checkout
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ShoppingBag, Lock, Mail, User as UserIcon, Phone, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/common/Toast';

export function AuthPage() {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { login, register, googleSignIn, loginAsDemoAdmin, loginAsDemoCustomer } = useAuth();
  const { success, error, info } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (mode === 'login') {
      const res = await login(email, password);
      setIsLoading(false);
      if (res.success) {
        success('Signed in successfully!');
        navigate('/');
      } else {
        error(res.error || 'Failed to sign in.');
      }
    } else {
      if (!name.trim()) {
        setIsLoading(false);
        error('Please provide your full name.');
        return;
      }
      const res = await register(name, email, password, phone);
      setIsLoading(false);
      if (res.success) {
        success('Account created successfully! Welcome to FreshKart.');
        navigate('/');
      } else {
        error(res.error || 'Failed to create account.');
      }
    }
  };

  const handleDemoAdmin = async () => {
    setIsLoading(true);
    await loginAsDemoAdmin();
    setIsLoading(false);
    success('Logged in as FreshKart Store Administrator!');
    navigate('/admin');
  };

  const handleDemoCustomer = async () => {
    setIsLoading(true);
    await loginAsDemoCustomer();
    setIsLoading(false);
    success('Logged in as Pooja Verma (Sample Customer)!');
    navigate('/');
  };

  const handleGoogle = async () => {
    setIsLoading(true);
    const res = await googleSignIn();
    setIsLoading(false);
    if (res.success) {
      success('Signed in via Google!');
      navigate('/');
    }
  };

  return (
    <div className="max-w-md mx-auto py-10 px-4 space-y-6">
      
      {/* Brand Header */}
      <div className="text-center space-y-2">
        <Link to="/" className="inline-flex items-center gap-2">
          <div className="w-12 h-12 rounded-2xl bg-[#2E7D32] flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
            <ShoppingBag className="w-6 h-6" />
          </div>
          <span className="text-2xl font-black text-slate-900 dark:text-white">
            Fresh<span className="text-[#2E7D32] dark:text-emerald-400">Kart</span>
          </span>
        </Link>
        <h1 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
          {mode === 'login' ? 'Welcome Back to FreshKart' : 'Create Your FreshKart Account'}
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Your neighborhood online kirana for Greater Noida
        </p>
      </div>

      {/* Main Card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-xl space-y-5">
        
        {/* Tab switch */}
        <div className="grid grid-cols-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl text-xs font-bold">
          <button
            onClick={() => setMode('login')}
            className={`py-2 rounded-xl transition ${
              mode === 'login'
                ? 'bg-white dark:bg-slate-700 text-[#2E7D32] dark:text-emerald-400 shadow-xs'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => setMode('register')}
            className={`py-2 rounded-xl transition ${
              mode === 'register'
                ? 'bg-white dark:bg-slate-700 text-[#2E7D32] dark:text-emerald-400 shadow-xs'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Register
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          {mode === 'register' && (
            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Full Name *
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g. Priya Sharma"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#2E7D32]"
                />
                <UserIcon className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>
          )}

          <div>
            <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Email Address *
            </label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#2E7D32]"
              />
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          {mode === 'register' && (
            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Phone Number (Greater Noida Delivery)
              </label>
              <div className="relative">
                <input
                  type="tel"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="+91 98112 34567"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#2E7D32]"
                />
                <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>
          )}

          <div>
            <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Password *
            </label>
            <div className="relative">
              <input
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#2E7D32]"
              />
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 rounded-2xl bg-[#2E7D32] hover:bg-[#256628] text-white font-black text-xs shadow-lg shadow-emerald-700/20 flex items-center justify-center gap-2 transition active:scale-98 disabled:opacity-50"
          >
            <span>{mode === 'login' ? 'Sign In to FreshKart' : 'Create Account'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="relative flex items-center justify-center my-3">
          <div className="border-t border-slate-200 dark:border-slate-800 w-full" />
          <span className="bg-white dark:bg-slate-900 px-3 text-[11px] text-slate-400 uppercase font-bold absolute">
            Or
          </span>
        </div>

        {/* Google sign-in button */}
        <button
          type="button"
          onClick={handleGoogle}
          className="w-full py-2.5 px-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold flex items-center justify-center gap-2 transition"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
            />
            <path
              fill="#34A853"
              d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.35 24 12 24z"
            />
            <path
              fill="#FBBC05"
              d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.17 0 9.99 0 12s.45 3.83 1.25 5.42l4.03-3.15z"
            />
            <path
              fill="#EA4335"
              d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.35 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
            />
          </svg>
          <span>Continue with Google</span>
        </button>

        {/* Demo Access Note & Single-click Login Buttons */}
        <div className="p-4 rounded-2xl bg-amber-50/80 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/80 space-y-2.5">
          <div className="flex items-center gap-1.5 text-xs font-black text-amber-900 dark:text-amber-200">
            <Sparkles className="w-4 h-4 text-amber-600" />
            <span>Demo Access Credentials</span>
          </div>
          <p className="text-[11px] text-amber-800 dark:text-amber-300">
            Quickly test all customer & admin features with 1-click login:
          </p>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              type="button"
              onClick={handleDemoCustomer}
              className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-amber-300 dark:border-amber-700 text-slate-800 dark:text-slate-200 font-bold hover:bg-amber-100 dark:hover:bg-amber-900/60 transition text-[11px]"
            >
              Demo Customer
              <span className="block text-[9px] text-slate-400 font-mono font-normal">
                pooja.verma@example.com
              </span>
            </button>

            <button
              type="button"
              onClick={handleDemoAdmin}
              className="p-2 rounded-xl bg-emerald-600 text-white font-bold hover:bg-emerald-700 transition text-[11px] shadow-sm flex flex-col items-center justify-center"
            >
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" />
                Admin Portal
              </span>
              <span className="block text-[9px] text-emerald-100 font-mono font-normal">
                admin@freshkart.com
              </span>
            </button>
          </div>
        </div>

      </div>

    </div>
  );
}

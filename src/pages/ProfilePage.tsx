import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  User as UserIcon,
  MapPin,
  Package,
  HelpCircle,
  LogOut,
  Plus,
  Trash2,
  CheckCircle2,
  ShieldCheck,
  Edit2,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/common/Toast';
import { Address } from '../types';

export function ProfilePage() {
  const { user, logout, updateProfile, addAddress, deleteAddress, setDefaultAddress, isAdmin } = useAuth();
  const { success, error } = useToast();
  const navigate = useNavigate();

  const [isEditingName, setIsEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(user?.name || '');
  const [phoneInput, setPhoneInput] = useState(user?.phone || '');

  // Add Address modal state
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [newAddr, setNewAddr] = useState({
    fullName: user?.name || '',
    phone: user?.phone || '+91 98112 34567',
    flat: '',
    street: '',
    landmark: '',
    area: 'Alpha 1',
    city: 'Greater Noida',
    pincode: '201310',
    tag: 'Home' as 'Home' | 'Work' | 'Other',
  });

  if (!user) {
    return (
      <div className="max-w-md mx-auto py-16 text-center space-y-4">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Please Sign In</h2>
        <p className="text-xs text-slate-500">Sign in to manage your delivery addresses and account details.</p>
        <Link
          to="/auth"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#2E7D32] text-white font-bold text-xs"
        >
          Sign In
        </Link>
      </div>
    );
  }

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameInput.trim()) {
      error('Name cannot be empty.');
      return;
    }
    updateProfile({ name: nameInput.trim(), phone: phoneInput.trim() });
    setIsEditingName(false);
    success('Profile updated!');
  };

  const handleAddAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAddr.flat.trim() || !newAddr.street.trim()) {
      error('Please specify flat number and society/street.');
      return;
    }
    addAddress({
      fullName: newAddr.fullName,
      phone: newAddr.phone,
      flat: newAddr.flat,
      street: newAddr.street,
      landmark: newAddr.landmark,
      area: newAddr.area,
      city: 'Greater Noida',
      pincode: newAddr.pincode,
      tag: newAddr.tag,
    });
    setIsAddressModalOpen(false);
    success('New Greater Noida delivery address saved!');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      
      {/* Header Profile Card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-6 shadow-xs">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#2E7D32] to-emerald-500 text-white font-black text-2xl flex items-center justify-center shadow-md shadow-emerald-500/20">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                {user.name}
              </h1>
              {isAdmin && (
                <span className="bg-emerald-100 text-[#2E7D32] dark:bg-emerald-950 dark:text-emerald-300 px-2 py-0.5 rounded-md text-[10px] font-bold flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" />
                  Admin
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{user.email}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5">{user.phone || '+91 98112 34567'}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setNameInput(user.name);
              setPhoneInput(user.phone || '');
              setIsEditingName(true);
            }}
            className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-1.5 transition"
          >
            <Edit2 className="w-3.5 h-3.5" />
            <span>Edit Profile</span>
          </button>
          <button
            onClick={() => {
              logout();
              navigate('/');
            }}
            className="px-4 py-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 hover:bg-rose-100 text-xs font-bold flex items-center gap-1.5 transition"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Quick Navigation Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link
          to="/orders"
          className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:shadow-md hover:border-emerald-500/40 transition flex items-center gap-3.5"
        >
          <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-[#2E7D32] dark:text-emerald-400 flex items-center justify-center font-bold">
            <Package className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">My Orders</h3>
            <p className="text-xs text-slate-400">Track and reorder items</p>
          </div>
        </Link>

        <Link
          to="/support"
          className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:shadow-md hover:border-emerald-500/40 transition flex items-center gap-3.5"
        >
          <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
            <HelpCircle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">Support & FAQs</h3>
            <p className="text-xs text-slate-400">View replies and raise tickets</p>
          </div>
        </Link>

        {isAdmin && (
          <Link
            to="/admin"
            className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-emerald-300 dark:border-emerald-800 hover:shadow-md transition flex items-center gap-3.5"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-[#2E7D32] flex items-center justify-center font-bold">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">Admin Dashboard</h3>
              <p className="text-xs text-slate-400">Orders, stock & tickets</p>
            </div>
          </Link>
        )}
      </div>

      {/* Saved Addresses Section */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              <MapPin className="w-5 h-5 text-[#2E7D32]" />
              Saved Delivery Addresses
            </h2>
            <p className="text-xs text-slate-500">
              Societies and sectors in Greater Noida for fast checkout
            </p>
          </div>

          <button
            onClick={() => setIsAddressModalOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-[#2E7D32] hover:bg-[#256628] text-white font-bold text-xs shadow-md flex items-center gap-1.5 transition active:scale-95"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Address</span>
          </button>
        </div>

        {user.addresses.length === 0 ? (
          <div className="p-8 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl text-xs text-slate-400">
            No saved addresses yet. Add your Greater Noida flat/society address for 25-min checkout.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {user.addresses.map(addr => (
              <div
                key={addr.id}
                className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col justify-between space-y-3 bg-slate-50/50 dark:bg-slate-800/30"
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-xs text-slate-900 dark:text-white">
                      {addr.fullName}
                    </span>
                    <span className="text-[10px] font-bold bg-slate-200 dark:bg-slate-700 px-2 py-0.5 rounded text-slate-700 dark:text-slate-300">
                      {addr.tag}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    {addr.flat}, {addr.street}
                  </p>
                  <p className="text-xs text-slate-500 font-medium">
                    {addr.area}, Greater Noida - {addr.pincode}
                  </p>
                  <p className="text-xs text-slate-400 font-mono mt-1">Phone: {addr.phone}</p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-800 text-xs">
                  {addr.isDefault ? (
                    <span className="text-emerald-700 dark:text-emerald-400 font-bold flex items-center gap-1 text-[11px]">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Default Address
                    </span>
                  ) : (
                    <button
                      onClick={() => setDefaultAddress(addr.id)}
                      className="text-slate-500 hover:text-[#2E7D32] font-semibold text-[11px]"
                    >
                      Make Default
                    </button>
                  )}

                  <button
                    onClick={() => deleteAddress(addr.id)}
                    className="text-slate-400 hover:text-rose-600 p-1 transition"
                    title="Delete address"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Edit Profile Modal */}
      {isEditingName && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <h3 className="font-bold text-base text-slate-900 dark:text-white">Edit Profile Details</h3>
            <form onSubmit={handleSaveProfile} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Full Name</label>
                <input
                  type="text"
                  value={nameInput}
                  onChange={e => setNameInput(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Phone Number</label>
                <input
                  type="tel"
                  value={phoneInput}
                  onChange={e => setPhoneInput(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditingName(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#2E7D32] text-white text-xs font-bold shadow-md"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Address Modal */}
      {isAddressModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <h3 className="font-bold text-base text-slate-900 dark:text-white">Add Delivery Address</h3>
            <form onSubmit={handleAddAddress} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Recipient Name *</label>
                  <input
                    type="text"
                    required
                    value={newAddr.fullName}
                    onChange={e => setNewAddr({ ...newAddr, fullName: e.target.value })}
                    className="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Phone *</label>
                  <input
                    type="tel"
                    required
                    value={newAddr.phone}
                    onChange={e => setNewAddr({ ...newAddr, phone: e.target.value })}
                    className="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Flat / House / Tower *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Flat 301, Tower 2"
                  value={newAddr.flat}
                  onChange={e => setNewAddr({ ...newAddr, flat: e.target.value })}
                  className="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Society / Street Address *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. ATS Greens Paradiso"
                  value={newAddr.street}
                  onChange={e => setNewAddr({ ...newAddr, street: e.target.value })}
                  className="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Sector / Area</label>
                  <select
                    value={newAddr.area}
                    onChange={e => setNewAddr({ ...newAddr, area: e.target.value })}
                    className="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    <option>Alpha 1</option>
                    <option>Alpha 2</option>
                    <option>Beta 1 & 2</option>
                    <option>Gamma 1 & Jagat Farm</option>
                    <option>Delta 1 & 2</option>
                    <option>Pari Chowk Hub</option>
                    <option>Chi IV</option>
                    <option>Jaypee Greens</option>
                    <option>Knowledge Park</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Address Tag</label>
                  <select
                    value={newAddr.tag}
                    onChange={e => setNewAddr({ ...newAddr, tag: e.target.value as any })}
                    className="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    <option>Home</option>
                    <option>Work</option>
                    <option>Other</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddressModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#2E7D32] text-white text-xs font-bold shadow-md"
                >
                  Save Address
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

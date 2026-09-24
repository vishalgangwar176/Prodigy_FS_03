import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Address } from '../types';

interface AuthContextType {
  user: User | null;
  isAdmin: boolean;
  login: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  register: (name: string, email: string, pass: string, phone?: string) => Promise<{ success: boolean; error?: string }>;
  googleSignIn: () => Promise<{ success: boolean; error?: string }>;
  loginAsDemoAdmin: () => Promise<void>;
  loginAsDemoCustomer: () => Promise<void>;
  logout: () => void;
  updateProfile: (data: Partial<User>) => void;
  addAddress: (address: Omit<Address, 'id'>) => Address;
  updateAddress: (address: Address) => void;
  deleteAddress: (id: string) => void;
  setDefaultAddress: (id: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_USER_KEY = 'freshkart_auth_user_v1';
const USERS_DB_KEY = 'freshkart_users_db_v1';

const DEFAULT_USERS: { user: User; pass: string }[] = [
  {
    pass: 'Admin@123',
    user: {
      uid: 'admin-001',
      name: 'FreshKart Admin',
      email: 'admin@freshkart.com',
      role: 'admin',
      phone: '+91 98765 43210',
      addresses: [
        {
          id: 'addr-admin-1',
          fullName: 'FreshKart Store Manager',
          phone: '+91 98765 43210',
          flat: 'Shop 4, Ground Floor',
          street: 'Jagat Farm Commercial Complex',
          landmark: 'Opposite Domino\'s Pizza',
          area: 'Gamma 1',
          city: 'Greater Noida',
          pincode: '201310',
          tag: 'Work',
          isDefault: true,
        },
      ],
    },
  },
  {
    pass: 'Pooja@123',
    user: {
      uid: 'user-sample-01',
      name: 'Pooja Verma',
      email: 'pooja.verma@example.com',
      role: 'customer',
      phone: '+91 98112 34567',
      addresses: [
        {
          id: 'addr-01',
          fullName: 'Pooja Verma',
          phone: '+91 98112 34567',
          flat: 'Flat 402, Tower 6',
          street: 'ATS Greens Paradiso',
          landmark: 'Near Jaypee Hospital',
          area: 'Chi IV',
          city: 'Greater Noida',
          pincode: '201310',
          tag: 'Home',
          isDefault: true,
        },
        {
          id: 'addr-02',
          fullName: 'Pooja Verma',
          phone: '+91 98112 34567',
          flat: 'Building C, Knowledge Boulevard',
          street: 'Plot A-8, Sector 62 / Expway Link',
          area: 'Knowledge Park',
          city: 'Greater Noida',
          pincode: '201306',
          tag: 'Work',
          isDefault: false,
        },
      ],
    },
  },
];

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem(AUTH_USER_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    if (!localStorage.getItem(USERS_DB_KEY)) {
      localStorage.setItem(USERS_DB_KEY, JSON.stringify(DEFAULT_USERS));
    }
  }, []);

  const getUsersDB = (): { user: User; pass: string }[] => {
    try {
      const raw = localStorage.getItem(USERS_DB_KEY);
      return raw ? JSON.parse(raw) : DEFAULT_USERS;
    } catch {
      return DEFAULT_USERS;
    }
  };

  const saveUsersDB = (db: { user: User; pass: string }[]) => {
    localStorage.setItem(USERS_DB_KEY, JSON.stringify(db));
  };

  const login = async (email: string, pass: string): Promise<{ success: boolean; error?: string }> => {
    const db = getUsersDB();
    const normalizedEmail = email.trim().toLowerCase();
    const match = db.find(u => u.user.email.toLowerCase() === normalizedEmail);

    if (!match) {
      return { success: false, error: 'No account found with this email address.' };
    }
    if (match.pass !== pass) {
      return { success: false, error: 'Invalid password. Please check and try again.' };
    }

    setUser(match.user);
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(match.user));
    return { success: true };
  };

  const register = async (name: string, email: string, pass: string, phone?: string): Promise<{ success: boolean; error?: string }> => {
    const db = getUsersDB();
    const normalizedEmail = email.trim().toLowerCase();
    if (db.some(u => u.user.email.toLowerCase() === normalizedEmail)) {
      return { success: false, error: 'An account with this email already exists.' };
    }

    const newUser: User = {
      uid: 'user-' + Date.now(),
      name: name.trim(),
      email: normalizedEmail,
      role: 'customer',
      phone: phone || '+91 98765 00000',
      addresses: [],
    };

    db.push({ user: newUser, pass });
    saveUsersDB(db);

    setUser(newUser);
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(newUser));
    return { success: true };
  };

  const googleSignIn = async (): Promise<{ success: boolean; error?: string }> => {
    // Simulated seamless Google Sign-In with real customer account profile
    const db = getUsersDB();
    const googleUser = db.find(u => u.user.email === 'pooja.verma@example.com')?.user || {
      uid: 'google-user-' + Date.now(),
      name: 'Pooja Verma',
      email: 'pooja.verma@example.com',
      role: 'customer',
      phone: '+91 98112 34567',
      addresses: [],
    };

    setUser(googleUser);
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(googleUser));
    return { success: true };
  };

  const loginAsDemoAdmin = async () => {
    await login('admin@freshkart.com', 'Admin@123');
  };

  const loginAsDemoCustomer = async () => {
    await login('pooja.verma@example.com', 'Pooja@123');
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(AUTH_USER_KEY);
  };

  const updateProfile = (data: Partial<User>) => {
    if (!user) return;
    const updatedUser = { ...user, ...data };
    setUser(updatedUser);
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(updatedUser));

    // Update in DB
    const db = getUsersDB();
    const idx = db.findIndex(u => u.user.uid === user.uid);
    if (idx >= 0) {
      db[idx].user = updatedUser;
      saveUsersDB(db);
    }
  };

  const addAddress = (addressData: Omit<Address, 'id'>): Address => {
    const newAddress: Address = {
      ...addressData,
      id: 'addr-' + Date.now(),
    };
    if (user) {
      const isFirst = user.addresses.length === 0;
      if (isFirst) newAddress.isDefault = true;
      const updatedAddresses = newAddress.isDefault
        ? [...user.addresses.map(a => ({ ...a, isDefault: false })), newAddress]
        : [...user.addresses, newAddress];
      updateProfile({ addresses: updatedAddresses });
    }
    return newAddress;
  };

  const updateAddress = (address: Address) => {
    if (!user) return;
    const updatedAddresses = address.isDefault
      ? user.addresses.map(a => (a.id === address.id ? address : { ...a, isDefault: false }))
      : user.addresses.map(a => (a.id === address.id ? address : a));
    updateProfile({ addresses: updatedAddresses });
  };

  const deleteAddress = (id: string) => {
    if (!user) return;
    const updatedAddresses = user.addresses.filter(a => a.id !== id);
    if (updatedAddresses.length > 0 && !updatedAddresses.some(a => a.isDefault)) {
      updatedAddresses[0].isDefault = true;
    }
    updateProfile({ addresses: updatedAddresses });
  };

  const setDefaultAddress = (id: string) => {
    if (!user) return;
    const updatedAddresses = user.addresses.map(a => ({
      ...a,
      isDefault: a.id === id,
    }));
    updateProfile({ addresses: updatedAddresses });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAdmin: user?.role === 'admin',
        login,
        register,
        googleSignIn,
        loginAsDemoAdmin,
        loginAsDemoCustomer,
        logout,
        updateProfile,
        addAddress,
        updateAddress,
        deleteAddress,
        setDefaultAddress,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

import React, { useState } from 'react';
import { 
  X, 
  Store, 
  Mail, 
  Lock, 
  User, 
  Layers, 
  MapPin, 
  Phone, 
  CheckCircle2, 
  ArrowRight,
  Info,
  AlertCircle,
  Loader2,
  Eye,
  EyeOff
} from 'lucide-react';
import { CATEGORIES_DATA } from '../data/mockData';
import { 
  registerShopOwner, 
  loginShopOwner, 
  type User as FirebaseUser 
} from '../services/firebase';
import { UserProfile } from '../types';

interface ShopOwnerAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (user?: FirebaseUser, profile?: UserProfile | null) => void;
  onAdminLogin?: () => void;
}

export const ShopOwnerAuthModal: React.FC<ShopOwnerAuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  onAdminLogin,
}) => {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  
  // Form states
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  
  // Registration form states (Shop Name, Owner Name, Email, Password, Phone Number, Shop Category)
  const [ownerName, setOwnerName] = useState('');
  const [shopName, setShopName] = useState('');
  const [shopCategory, setShopCategory] = useState('Handmade & Crafts');
  const [shopAddress, setShopAddress] = useState('');
  const [shopPhone, setShopPhone] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');

  // Password visibility toggle states
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showRegPassword, setShowRegPassword] = useState(false);

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);

    try {
      const { user, profile } = await loginShopOwner(loginEmail.trim(), loginPassword);
      setIsLoading(false);
      onClose();
      if (onSuccess) {
        onSuccess(user, profile);
      }
    } catch (error: any) {
      setIsLoading(false);
      // Requirements: If credentials are incorrect, show: "Email or password is incorrect"
      setErrorMessage("Email or password is incorrect");
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);

    try {
      const { user, profile } = await registerShopOwner({
        email: regEmail.trim(),
        password: regPassword,
        ownerName,
        shopName,
        phone: shopPhone,
        category: shopCategory,
        address: shopAddress,
      });

      setIsLoading(false);
      onClose();
      if (onSuccess) {
        onSuccess(user, profile);
      }
    } catch (error: any) {
      setIsLoading(false);
      const errorCode = error?.code || '';
      // Requirements: If the email already exists, show: "User already exists. Please sign in"
      if (errorCode === 'auth/email-already-in-use') {
        setErrorMessage("User already exists. Please sign in");
      } else if (errorCode === 'auth/weak-password') {
        setErrorMessage("Password should be at least 6 characters");
      } else if (errorCode === 'auth/invalid-email') {
        setErrorMessage("Please enter a valid email address");
      } else {
        setErrorMessage(error?.message || "Registration failed. Please try again.");
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-150">
      <div 
        className="relative bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          type="button"
          id="close-owner-auth-modal-btn"
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-8 h-8 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-full flex items-center justify-center transition-colors cursor-pointer border border-slate-700"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-900 text-white p-6 sm:p-7 pb-6 border-b border-indigo-900/50">
          <div className="flex items-center gap-2 text-yellow-300 text-xs font-black uppercase tracking-wider mb-2">
            <Store className="w-4 h-4 text-yellow-300" />
            <span>Shop Manager Portal</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight">
            Small Business Owner Access
          </h2>
          <p className="text-xs text-indigo-200/80 mt-1 font-normal">
            Manage your digital storefront, upload product batches, and monitor local shoppers.
          </p>

          {/* Tabs */}
          <div className="flex gap-2 mt-5 p-1 bg-slate-900/80 border border-slate-800 rounded-2xl">
            <button
              type="button"
              id="tab-owner-login"
              onClick={() => {
                setActiveTab('login');
                setErrorMessage(null);
              }}
              className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                activeTab === 'login'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-950'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              Shop Owner Sign In
            </button>
            <button
              type="button"
              id="tab-owner-register"
              onClick={() => {
                setActiveTab('register');
                setErrorMessage(null);
              }}
              className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                activeTab === 'register'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-950'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              Register New Shop
            </button>
          </div>
        </div>

        {/* Form Body */}
        <div className="p-6">
          {activeTab === 'login' ? (
            /* Login Form */
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1" htmlFor="owner-login-email">
                  Registered Business Email
                </label>
                <div className="relative flex items-center">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
                  <input
                    id="owner-login-email"
                    type="email"
                    required
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="owner@yourshop.com"
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/20 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1" htmlFor="owner-login-password">
                  Account Password
                </label>
                <div className="relative flex items-center">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
                  <input
                    id="owner-login-password"
                    type={showLoginPassword ? "text" : "password"}
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/20 outline-none"
                  />
                  <button
                    type="button"
                    id="toggle-login-password-visibility-btn"
                    onClick={() => setShowLoginPassword((prev) => !prev)}
                    className="absolute right-2.5 p-1 text-slate-400 hover:text-slate-700 focus:text-indigo-600 transition-colors cursor-pointer rounded-lg hover:bg-slate-200/60"
                    aria-label={showLoginPassword ? "Hide password" : "Show password"}
                    title={showLoginPassword ? "Hide password" : "Show password"}
                  >
                    {showLoginPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs font-medium">
                <label className="flex items-center gap-1.5 text-slate-600 cursor-pointer">
                  <input type="checkbox" className="rounded text-indigo-600 focus:ring-indigo-500" />
                  <span>Remember this merchant device</span>
                </label>
                <button type="button" className="text-indigo-600 font-bold hover:underline">
                  Forgot password?
                </button>
              </div>

              {/* Error Alert Display */}
              {errorMessage && (
                <div 
                  id="auth-login-error"
                  className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs font-semibold text-rose-700 flex items-center gap-2 animate-in fade-in"
                  role="alert"
                >
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <button
                type="submit"
                id="owner-login-submit-btn"
                disabled={isLoading}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 disabled:opacity-60 text-white rounded-2xl text-xs sm:text-sm font-bold shadow-lg shadow-indigo-200 transition-all cursor-pointer flex items-center justify-center gap-2 hover:scale-[1.01]"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Authenticating...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In to Shop Manager</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              {/* 1-Click Quick Demo Sign-In for Shop Owners */}
              <div className="pt-3 border-t border-slate-100">
                <div className="flex items-center gap-2 mb-2.5">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Instant Demo Login (Verified Merchants)
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <button
                    type="button"
                    id="demo-login-crown-hairstyles"
                    onClick={async () => {
                      setIsLoading(true);
                      setErrorMessage(null);
                      try {
                        const { user, profile } = await loginShopOwner('amara@crowncoiffure.com', 'demo123456');
                        setIsLoading(false);
                        onClose();
                        if (onSuccess) onSuccess(user, profile);
                      } catch (e: any) {
                        setIsLoading(false);
                        setErrorMessage("Could not sign in with demo account");
                      }
                    }}
                    disabled={isLoading}
                    className="p-2.5 bg-fuchsia-50 hover:bg-fuchsia-100 border border-fuchsia-200 rounded-xl text-left transition-all cursor-pointer group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-fuchsia-900 group-hover:text-fuchsia-950">
                        💇‍♀️ Crown & Coiffure
                      </span>
                      <span className="text-[9px] bg-fuchsia-200/80 text-fuchsia-800 px-1.5 py-0.5 rounded-full font-bold">
                        Hairstyles
                      </span>
                    </div>
                    <p className="text-[10px] text-fuchsia-700 mt-0.5">
                      Wigs, Braids & Hair Extensions
                    </p>
                  </button>

                  <button
                    type="button"
                    id="demo-login-cedar-clay"
                    onClick={async () => {
                      setIsLoading(true);
                      setErrorMessage(null);
                      try {
                        const { user, profile } = await loginShopOwner('maya.lin@cedarandclay.com', 'demo123456');
                        setIsLoading(false);
                        onClose();
                        if (onSuccess) onSuccess(user, profile);
                      } catch (e: any) {
                        setIsLoading(false);
                        setErrorMessage("Could not sign in with demo account");
                      }
                    }}
                    disabled={isLoading}
                    className="p-2.5 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-xl text-left transition-all cursor-pointer group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-amber-900 group-hover:text-amber-950">
                        🏺 Cedar & Clay Studio
                      </span>
                      <span className="text-[9px] bg-amber-200/80 text-amber-800 px-1.5 py-0.5 rounded-full font-bold">
                        Crafts
                      </span>
                    </div>
                    <p className="text-[10px] text-amber-700 mt-0.5">
                      Ceramics & Earthen Homewares
                    </p>
                  </button>

                  <button
                    type="button"
                    id="demo-login-verdant-apothecary"
                    onClick={async () => {
                      setIsLoading(true);
                      setErrorMessage(null);
                      try {
                        const { user, profile } = await loginShopOwner('elena@verdantapothecary.org', 'demo123456');
                        setIsLoading(false);
                        onClose();
                        if (onSuccess) onSuccess(user, profile);
                      } catch (e: any) {
                        setIsLoading(false);
                        setErrorMessage("Could not sign in with demo account");
                      }
                    }}
                    disabled={isLoading}
                    className="p-2.5 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl text-left transition-all cursor-pointer group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-rose-900 group-hover:text-rose-950">
                        🌿 Verdant Apothecary
                      </span>
                      <span className="text-[9px] bg-rose-200/80 text-rose-800 px-1.5 py-0.5 rounded-full font-bold">
                        Beauty
                      </span>
                    </div>
                    <p className="text-[10px] text-rose-700 mt-0.5">
                      Botanical Skincare & Oils
                    </p>
                  </button>

                  <button
                    type="button"
                    id="demo-login-golden-harvest"
                    onClick={async () => {
                      setIsLoading(true);
                      setErrorMessage(null);
                      try {
                        const { user, profile } = await loginShopOwner('marcus@goldenharvestbread.com', 'demo123456');
                        setIsLoading(false);
                        onClose();
                        if (onSuccess) onSuccess(user, profile);
                      } catch (e: any) {
                        setIsLoading(false);
                        setErrorMessage("Could not sign in with demo account");
                      }
                    }}
                    disabled={isLoading}
                    className="p-2.5 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl text-left transition-all cursor-pointer group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-emerald-900 group-hover:text-emerald-950">
                        🥖 Golden Harvest Bakery
                      </span>
                      <span className="text-[9px] bg-emerald-200/80 text-emerald-800 px-1.5 py-0.5 rounded-full font-bold">
                        Groceries
                      </span>
                    </div>
                    <p className="text-[10px] text-emerald-700 mt-0.5">
                      Artisan Breads & Local Honey
                    </p>
                  </button>
                </div>
              </div>
            </form>
          ) : (
            /* Register Form */
            <form onSubmit={handleRegisterSubmit} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1" htmlFor="reg-owner-name">
                    Owner Full Name
                  </label>
                  <div className="relative flex items-center">
                    <User className="w-3.5 h-3.5 text-slate-400 absolute left-3 pointer-events-none" />
                    <input
                      id="reg-owner-name"
                      type="text"
                      required
                      value={ownerName}
                      onChange={(e) => setOwnerName(e.target.value)}
                      placeholder="e.g. Maya Lin"
                      className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-indigo-600 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1" htmlFor="reg-shop-name">
                    Shop / Brand Name
                  </label>
                  <div className="relative flex items-center">
                    <Store className="w-3.5 h-3.5 text-slate-400 absolute left-3 pointer-events-none" />
                    <input
                      id="reg-shop-name"
                      type="text"
                      required
                      value={shopName}
                      onChange={(e) => setShopName(e.target.value)}
                      placeholder="e.g. Cedar & Clay"
                      className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-indigo-600 outline-none"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1" htmlFor="reg-shop-category">
                  Primary Category
                </label>
                <div className="relative flex items-center">
                  <Layers className="w-3.5 h-3.5 text-slate-400 absolute left-3 pointer-events-none" />
                  <select
                    id="reg-shop-category"
                    value={shopCategory}
                    onChange={(e) => setShopCategory(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:border-indigo-600 outline-none cursor-pointer"
                  >
                    {CATEGORIES_DATA.map((c) => (
                      <option key={c.id} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1" htmlFor="reg-shop-address">
                    Physical Storefront Address
                  </label>
                  <div className="relative flex items-center">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 absolute left-3 pointer-events-none" />
                    <input
                      id="reg-shop-address"
                      type="text"
                      required
                      value={shopAddress}
                      onChange={(e) => setShopAddress(e.target.value)}
                      placeholder="42 Pine St, Arts District"
                      className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-indigo-600 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1" htmlFor="reg-shop-phone">
                    Shop Contact Phone
                  </label>
                  <div className="relative flex items-center">
                    <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-3 pointer-events-none" />
                    <input
                      id="reg-shop-phone"
                      type="tel"
                      required
                      value={shopPhone}
                      onChange={(e) => setShopPhone(e.target.value)}
                      placeholder="(503) 555-0182"
                      className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-indigo-600 outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1" htmlFor="reg-shop-email">
                    Login Email
                  </label>
                  <div className="relative flex items-center">
                    <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-3 pointer-events-none" />
                    <input
                      id="reg-shop-email"
                      type="email"
                      required
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      placeholder="owner@yourshop.com"
                      className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-indigo-600 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1" htmlFor="reg-shop-password">
                    Create Password
                  </label>
                  <div className="relative flex items-center">
                    <Lock className="w-3.5 h-3.5 text-slate-400 absolute left-3 pointer-events-none" />
                    <input
                      id="reg-shop-password"
                      type={showRegPassword ? "text" : "password"}
                      required
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      placeholder="Minimum 6 characters"
                      className="w-full pl-8 pr-10 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-indigo-600 outline-none"
                    />
                    <button
                      type="button"
                      id="toggle-reg-password-visibility-btn"
                      onClick={() => setShowRegPassword((prev) => !prev)}
                      className="absolute right-2.5 p-1 text-slate-400 hover:text-slate-700 focus:text-indigo-600 transition-colors cursor-pointer rounded-lg hover:bg-slate-200/60"
                      aria-label={showRegPassword ? "Hide password" : "Show password"}
                      title={showRegPassword ? "Hide password" : "Show password"}
                    >
                      {showRegPassword ? (
                        <EyeOff className="w-3.5 h-3.5" />
                      ) : (
                        <Eye className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Error Alert Display */}
              {errorMessage && (
                <div 
                  id="auth-register-error"
                  className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs font-semibold text-rose-700 flex items-center gap-2 animate-in fade-in"
                  role="alert"
                >
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 flex items-start gap-2 text-[11px] text-amber-900 font-normal">
                <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Approval Required:</strong> After submitting, your shop registration will be set to <em>Pending Review</em> until approved by the platform administrator.
                </span>
              </div>

              <div className="pt-1">
                <button
                  type="submit"
                  id="owner-register-submit-btn"
                  disabled={isLoading}
                  className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white rounded-2xl text-xs font-bold shadow-lg shadow-indigo-200 transition-all cursor-pointer flex items-center justify-center gap-2 hover:scale-[1.01]"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Registering Account...</span>
                    </>
                  ) : (
                    <>
                      <span>Submit Shop Application</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>

              <p className="text-[10px] text-slate-400 text-center font-medium">
                By registering, you confirm you are an authorized representative of an independent small business.
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

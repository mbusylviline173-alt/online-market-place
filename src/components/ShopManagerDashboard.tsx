import React, { useState } from 'react';
import { 
  Store, 
  LogOut, 
  ShoppingBag, 
  Eye, 
  MessageSquare, 
  Settings, 
  CheckCircle2, 
  ArrowLeft, 
  ShieldCheck, 
  Plus, 
  Sparkles, 
  TrendingUp, 
  UserCheck, 
  MapPin, 
  Mail,
  Clock,
  Filter,
  ExternalLink,
  Trash2,
  PackagePlus,
  AlertCircle
} from 'lucide-react';
import type { User } from 'firebase/auth';
import { PRODUCTS_DATA, SHOPS_DATA } from '../data/mockData';
import { Product, UserProfile } from '../types';
import { AddProductModal } from './AddProductModal';

interface ShopManagerDashboardProps {
  user: User | null;
  userProfile?: UserProfile | null;
  onLogout: () => void;
  onViewMarketplace: () => void;
  allProducts?: Product[];
  onAddProduct?: (newProduct: Product) => void;
  onDeleteProduct?: (id: string) => void;
}

export const ShopManagerDashboard: React.FC<ShopManagerDashboardProps> = ({
  user,
  userProfile,
  onLogout,
  onViewMarketplace,
  allProducts,
  onAddProduct,
  onDeleteProduct,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'inquiries' | 'settings'>('overview');
  const [isAddProductModalOpen, setIsAddProductModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Associated or sample shop for previewing owner experience, merged with registered profile
  const baseShop = SHOPS_DATA[0];
  const userShopId = userProfile?.uid || user?.uid || baseShop.id;
  const sampleShop = {
    ...baseShop,
    id: userShopId,
    name: userProfile?.shopName || baseShop.name,
    category: (userProfile?.shopCategory as any) || baseShop.category,
    phone: userProfile?.phone || baseShop.phone,
    email: userProfile?.email || user?.email || baseShop.email,
  };
  
  // Local product inventory state
  const [localProducts, setLocalProducts] = useState<Product[]>(() => {
    if (allProducts) {
      return allProducts.filter((p) => p.shopId === sampleShop.id || p.shopId === baseShop.id || (user?.uid && p.ownerId === user.uid));
    }
    return PRODUCTS_DATA.filter((p) => p.shopId === sampleShop.id || p.shopId === baseShop.id);
  });

  const displayProducts = allProducts 
    ? allProducts.filter((p) => p.shopId === sampleShop.id || p.shopId === baseShop.id || (user?.uid && p.ownerId === user.uid))
    : localProducts;

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const handleProductAdded = (newProduct: Product) => {
    if (onAddProduct) {
      onAddProduct(newProduct);
    } else {
      setLocalProducts((prev) => [newProduct, ...prev]);
    }
    showToast(`"${newProduct.title}" added to your live shop inventory!`);
  };

  const handleProductDeleted = (productId: string, productTitle: string) => {
    if (onDeleteProduct) {
      onDeleteProduct(productId);
    } else {
      setLocalProducts((prev) => prev.filter((p) => p.id !== productId));
    }
    showToast(`Removed "${productTitle}" from inventory.`);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 selection:bg-indigo-100 selection:text-indigo-900">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-30 bg-slate-950 text-white border-b border-indigo-900/50 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-18 gap-4">
            {/* Branding & Portal Tag */}
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={onViewMarketplace}
                className="flex items-center gap-3 text-left cursor-pointer group"
              >
                <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-950 group-hover:bg-indigo-500 transition-colors">
                  <Store className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xl font-black tracking-tight text-white">
                      Shop<span className="text-pink-400">Local</span>
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-yellow-400 text-slate-950">
                      Merchant Portal
                    </span>
                  </div>
                  <span className="block text-[10px] uppercase font-bold tracking-wider text-slate-400 -mt-0.5">
                    Shop Manager Dashboard
                  </span>
                </div>
              </button>
            </div>

            {/* User Info & Actions */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                id="dashboard-view-marketplace-btn"
                onClick={onViewMarketplace}
                className="hidden sm:inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-full transition-all cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>View Marketplace</span>
              </button>

              <div className="hidden md:flex items-center gap-2 pl-3 border-l border-slate-800 text-xs text-slate-300">
                <div className="w-7 h-7 rounded-full bg-indigo-900/80 border border-indigo-700 flex items-center justify-center text-indigo-300 font-bold">
                  {user?.email ? user.email.charAt(0).toUpperCase() : 'M'}
                </div>
                <div className="leading-tight">
                  <div className="font-semibold text-white truncate max-w-[150px]">
                    {user?.email || 'Merchant'}
                  </div>
                  <div className="text-[10px] text-emerald-400 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    <span>Firebase Auth Active</span>
                  </div>
                </div>
              </div>

              {/* Dedicated Logout Button */}
              <button
                type="button"
                id="dashboard-logout-btn"
                onClick={onLogout}
                className="inline-flex items-center gap-2 px-4 py-2 bg-rose-600/90 hover:bg-rose-600 text-white rounded-full text-xs font-bold transition-all shadow-md shadow-rose-950/50 cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
                title="Sign out of Shop Manager and return to authentication"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Log Out</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
        {/* Welcome Header Card */}
        <div className="bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl border border-indigo-900/40 relative overflow-hidden">
          <div className="relative z-10 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-indigo-900/70 border border-indigo-700/60 text-indigo-200">
                <ShieldCheck className="w-3.5 h-3.5 text-yellow-300" />
                <span>Signed In as {user?.email || 'Registered Merchant'}</span>
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-950/80 border border-emerald-700/60 text-emerald-300">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Role: Authenticated Shop Owner</span>
              </div>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              {sampleShop.name}
            </h1>
            <p className="text-xs sm:text-sm text-indigo-200/80 mt-2 font-normal leading-relaxed">
              {userProfile?.ownerName ? `Welcome back, ${userProfile.ownerName}. ` : ''}
              Your merchant account is authenticated via Firebase. You can track customer activity, review your neighborhood storefront metrics, and manage product inventory.
            </p>
          </div>

          <div className="mt-6 pt-5 border-t border-indigo-900/50 flex flex-wrap items-center justify-between gap-4 text-xs text-indigo-300/80">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Firestore Document: users/{user?.uid?.slice(0, 8)}...</span>
              </span>
              <span className="hidden sm:inline-block text-indigo-800">•</span>
              <span className="hidden sm:flex items-center gap-1.5">
                <Store className="w-4 h-4 text-yellow-300" />
                <span>Category: {sampleShop.category}</span>
              </span>
            </div>
            <button
              type="button"
              onClick={onViewMarketplace}
              className="inline-flex items-center gap-1.5 text-yellow-300 hover:text-yellow-200 font-bold transition-colors cursor-pointer"
            >
              <span>Preview your public shop page</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Dashboard Navigation Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <button
            type="button"
            id="tab-overview"
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-2 ${
              activeTab === 'overview'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Store Overview</span>
          </button>
          <button
            type="button"
            id="tab-products"
            onClick={() => setActiveTab('products')}
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-2 ${
              activeTab === 'products'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Product Inventory ({displayProducts.length})</span>
          </button>
          <button
            type="button"
            id="tab-inquiries"
            onClick={() => setActiveTab('inquiries')}
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-2 ${
              activeTab === 'inquiries'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Customer Inquiries (3)</span>
          </button>
          <button
            type="button"
            id="tab-settings"
            onClick={() => setActiveTab('settings')}
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-2 ${
              activeTab === 'settings'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <Settings className="w-3.5 h-3.5" />
            <span>Account & Security</span>
          </button>
        </div>

        {/* Tab 1: Store Overview */}
        {activeTab === 'overview' && (
          <div className="space-y-6 animate-in fade-in duration-150">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between">
                <div>
                  <span className="text-[11px] uppercase font-bold text-slate-400 tracking-wider">
                    Total Shopper Views
                  </span>
                  <div className="text-2xl font-black text-slate-900 mt-1">
                    {sampleShop.viewsCount.toLocaleString()}
                  </div>
                  <div className="text-[11px] text-emerald-600 font-semibold mt-0.5 flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" />
                    <span>+18% from last month</span>
                  </div>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <Eye className="w-6 h-6" />
                </div>
              </div>

              <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between">
                <div>
                  <span className="text-[11px] uppercase font-bold text-slate-400 tracking-wider">
                    Active Listings
                  </span>
                  <div className="text-2xl font-black text-slate-900 mt-1">
                    {displayProducts.length} Products
                  </div>
                  <div className="text-[11px] text-slate-500 font-medium mt-0.5">
                    Live in {sampleShop.category}
                  </div>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-pink-50 text-pink-500 flex items-center justify-center">
                  <ShoppingBag className="w-6 h-6" />
                </div>
              </div>

              <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between">
                <div>
                  <span className="text-[11px] uppercase font-bold text-slate-400 tracking-wider">
                    Customer Inquiries
                  </span>
                  <div className="text-2xl font-black text-slate-900 mt-1">
                    3 Inquiries
                  </div>
                  <div className="text-[11px] text-yellow-600 font-semibold mt-0.5 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>Awaiting reply today</span>
                  </div>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-yellow-50 text-yellow-600 flex items-center justify-center">
                  <MessageSquare className="w-6 h-6" />
                </div>
              </div>

              <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between">
                <div>
                  <span className="text-[11px] uppercase font-bold text-slate-400 tracking-wider">
                    Customer Rating
                  </span>
                  <div className="text-2xl font-black text-slate-900 mt-1">
                    {sampleShop.rating.toFixed(1)} / 5.0
                  </div>
                  <div className="text-[11px] text-slate-500 font-medium mt-0.5">
                    {sampleShop.reviewCount} neighborhood reviews
                  </div>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <Sparkles className="w-6 h-6" />
                </div>
              </div>
            </div>

            {/* Quick Actions & Store Info */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Quick Action Card: Add Product / Bottle */}
              <div className="lg:col-span-3 bg-gradient-to-r from-indigo-900 via-indigo-950 to-slate-900 text-white p-6 rounded-3xl border border-indigo-800/50 shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-yellow-400 text-slate-950">
                      Merchant Catalog
                    </span>
                    <span className="text-xs text-indigo-300 font-medium">Quick Inventory Publisher</span>
                  </div>
                  <h3 className="text-lg font-black text-white">Add New Products, Bottles, or Jars</h3>
                  <p className="text-xs text-indigo-200 max-w-xl">
                    Publish handcrafted goods, artisanal dropper bottles, olive oil jars, skin serums, or ceramics straight to the local marketplace.
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    id="overview-add-product-btn"
                    onClick={() => setIsAddProductModalOpen(true)}
                    className="px-5 py-3 bg-yellow-400 hover:bg-yellow-300 text-slate-950 rounded-2xl text-xs font-black flex items-center gap-2 shadow-lg transition-all cursor-pointer hover:scale-[1.02]"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Product / Bottle</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('products')}
                    className="px-4 py-3 bg-white/10 hover:bg-white/20 text-white rounded-2xl text-xs font-bold transition-colors cursor-pointer"
                  >
                    View All ({displayProducts.length})
                  </button>
                </div>
              </div>

              {/* Storefront Info */}
              <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                    <Store className="w-4 h-4 text-indigo-600" />
                    <span>Live Storefront Status</span>
                  </h3>
                  <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-[11px] font-bold">
                    Active & Verified
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <img 
                    src={sampleShop.logoUrl} 
                    alt={sampleShop.name} 
                    className="w-16 h-16 rounded-2xl object-cover border border-slate-200 shadow-xs"
                    referrerPolicy="no-referrer"
                  />
                  <div className="flex-1">
                    <h4 className="text-base font-black text-slate-900">{sampleShop.name}</h4>
                    <p className="text-xs text-slate-500 font-medium">{sampleShop.tagline}</p>
                    <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-slate-600 font-medium">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        {sampleShop.address}, {sampleShop.city}
                      </span>
                      <span className="flex items-center gap-1">
                        <Mail className="w-3.5 h-3.5 text-slate-400" />
                        {user?.email || sampleShop.email}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-5 p-4 bg-indigo-50/70 border border-indigo-100 rounded-2xl text-xs text-indigo-950 font-normal">
                  <strong>Firebase Integration Note:</strong> You are currently authenticated with Firebase Authentication. Cloud Firestore will persist profile edits, custom shop bios, and hours in the upcoming update.
                </div>
              </div>

              {/* Security & Session Card */}
              <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex flex-col justify-between">
                <div>
                  <h3 className="text-base font-black text-slate-900 flex items-center gap-2 mb-4">
                    <ShieldCheck className="w-4 h-4 text-indigo-600" />
                    <span>Merchant Session</span>
                  </h3>

                  <div className="space-y-3 text-xs text-slate-600">
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                        Logged in as
                      </span>
                      <span className="font-semibold text-slate-900 block truncate">
                        {user?.email || 'Merchant'}
                      </span>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                        Provider
                      </span>
                      <span className="font-semibold text-slate-900">
                        Firebase Email/Password Auth
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-6">
                  <button
                    type="button"
                    onClick={onLogout}
                    className="w-full py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out to Auth Screen</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Products Inventory */}
        {activeTab === 'products' && (
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4 animate-in fade-in duration-150">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-black text-slate-900">Your Product Inventory</h3>
                <p className="text-xs text-slate-500">
                  {displayProducts.length} items currently displayed on the ShopLocal neighborhood marketplace
                </p>
              </div>
              <button
                type="button"
                id="dashboard-add-product-btn"
                onClick={() => setIsAddProductModalOpen(true)}
                className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md shadow-indigo-100 transition-all cursor-pointer hover:scale-[1.02]"
              >
                <Plus className="w-4 h-4" />
                <span>Add Product / Bottle</span>
              </button>
            </div>

            {displayProducts.length === 0 ? (
              <div className="py-12 text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
                  <PackagePlus className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-bold text-slate-900">No items in your inventory yet</h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Click the button below to add your first handcrafted item, artisanal bottle, jar, or specialty good.
                </p>
                <button
                  type="button"
                  onClick={() => setIsAddProductModalOpen(true)}
                  className="mt-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold inline-flex items-center gap-1.5 shadow-md cursor-pointer hover:bg-indigo-700"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Product / Bottle</span>
                </button>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {displayProducts.map((p) => {
                  const isBottle = 
                    p.title.toLowerCase().includes('bottle') || 
                    p.title.toLowerCase().includes('elixir') || 
                    p.title.toLowerCase().includes('oil') || 
                    p.title.toLowerCase().includes('honey');

                  return (
                    <div key={p.id} className="py-3.5 flex items-center justify-between gap-4 group">
                      <div className="flex items-center gap-3">
                        <img 
                          src={p.imageUrl} 
                          alt={p.title} 
                          className="w-12 h-12 rounded-xl object-cover border border-slate-100 shadow-2xs"
                          referrerPolicy="no-referrer"
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-xs sm:text-sm font-bold text-slate-900">{p.title}</h4>
                            {isBottle && (
                              <span className="text-[10px] font-bold px-2 py-0.5 bg-yellow-100 text-yellow-800 rounded-full">
                                Bottle / Jar
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                            {p.price.toLocaleString()} CFAF • {p.stock} in stock • {p.category}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2.5">
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          Live
                        </span>

                        <button
                          type="button"
                          onClick={() => handleProductDeleted(p.id, p.title)}
                          className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          title="Remove item from inventory"
                          aria-label={`Remove ${p.title}`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Customer Inquiries */}
        {activeTab === 'inquiries' && (
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4 animate-in fade-in duration-150">
            <div className="pb-3 border-b border-slate-100">
              <h3 className="text-lg font-black text-slate-900">Recent Customer Inquiries</h3>
              <p className="text-xs text-slate-500">Questions sent by shoppers through the ShopLocal directory</p>
            </div>

            <div className="space-y-3">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold text-slate-900">Elena Rostova</span>
                  <span className="text-[10px] font-medium text-slate-400">2 hours ago</span>
                </div>
                <p className="text-xs text-slate-600 font-normal">
                  "Hi! Do you offer local curb pickup for the ceramic vase set this Saturday afternoon?"
                </p>
                <div className="mt-3 flex items-center gap-2">
                  <a
                    href={`mailto:${user?.email || 'owner@shop.com'}?subject=Re: Local Pickup Inquiry`}
                    className="px-3 py-1.5 bg-indigo-600 text-white rounded-xl text-[11px] font-bold hover:bg-indigo-700 transition-colors"
                  >
                    Reply via Email
                  </a>
                </div>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold text-slate-900">Marcus Chen</span>
                  <span className="text-[10px] font-medium text-slate-400">Yesterday</span>
                </div>
                <p className="text-xs text-slate-600 font-normal">
                  "Can I order a custom engraved bowl with wedding dates for late October?"
                </p>
                <div className="mt-3 flex items-center gap-2">
                  <a
                    href={`mailto:${user?.email || 'owner@shop.com'}?subject=Re: Custom Order`}
                    className="px-3 py-1.5 bg-indigo-600 text-white rounded-xl text-[11px] font-bold hover:bg-indigo-700 transition-colors"
                  >
                    Reply via Email
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Account & Security */}
        {activeTab === 'settings' && (
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-6 animate-in fade-in duration-150">
            <div>
              <h3 className="text-lg font-black text-slate-900">Account & Security Settings</h3>
              <p className="text-xs text-slate-500">Manage your credentials and Firebase merchant connection</p>
            </div>

            <div className="space-y-4 max-w-lg">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Registered Account Email
                </label>
                <input
                  type="email"
                  disabled
                  value={user?.email || ''}
                  className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-xl text-xs text-slate-700 font-medium cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Firebase User UID
                </label>
                <input
                  type="text"
                  disabled
                  value={user?.uid || 'firebase-auth-token'}
                  className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-xl text-xs text-slate-700 font-mono text-[11px] cursor-not-allowed"
                />
              </div>

              <div className="pt-4 border-t border-slate-100">
                <button
                  type="button"
                  id="settings-logout-btn"
                  onClick={onLogout}
                  className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-rose-200 cursor-pointer flex items-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Log Out of Shop Manager</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Add Product / Bottle Modal */}
      <AddProductModal
        isOpen={isAddProductModalOpen}
        onClose={() => setIsAddProductModalOpen(false)}
        onAddProduct={handleProductAdded}
        shop={sampleShop}
      />

      {/* Action Notification Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-950 text-white px-4 py-3 rounded-2xl shadow-2xl border border-slate-800 flex items-center gap-3 animate-in fade-in slide-in-from-bottom-4 duration-200">
          <div className="w-7 h-7 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <span className="text-xs font-semibold">{toastMessage}</span>
          <button
            type="button"
            onClick={onViewMarketplace}
            className="ml-1 px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs"
          >
            View Live
          </button>
        </div>
      )}
    </div>
  );
};

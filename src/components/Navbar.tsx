import React, { useState } from 'react';
import { 
  Store, 
  Search, 
  ChevronDown, 
  UserCircle, 
  Menu, 
  X, 
  MapPin,
  Sparkles,
  ShoppingBag,
  LogOut,
  ShieldCheck,
  User
} from 'lucide-react';
import type { User as FirebaseUser } from 'firebase/auth';
import { CATEGORIES_DATA } from '../data/mockData';
import { UserProfile } from '../types';
import { ADMIN_UID } from '../services/firebase';

interface NavbarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedCategory: string;
  onSelectCategory: (cat: string) => void;
  onOpenOwnerAuth: () => void;
  onBrowseShopsClick: () => void;
  onResetFilters: () => void;
  currentUser?: FirebaseUser | null;
  userProfile?: UserProfile | null;
  onViewDashboard?: () => void;
  onLogout?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  searchQuery,
  onSearchChange,
  selectedCategory,
  onSelectCategory,
  onOpenOwnerAuth,
  onBrowseShopsClick,
  onResetFilters,
  currentUser,
  userProfile,
  onViewDashboard,
  onLogout,
}) => {
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const productsSection = document.getElementById('marketplace-products');
    if (productsSection) {
      productsSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-xs">
      {/* Top Banner Notice */}
      <div className="bg-slate-900 text-slate-200 text-xs py-1.5 px-4 text-center font-medium flex items-center justify-center gap-2">
        <Sparkles className="w-3.5 h-3.5 text-yellow-300 shrink-0" />
        <span>Support Independent Makers & Neighborhood Shops • Free local pickup available</span>
        <span className="hidden sm:inline-block text-slate-600">|</span>
        <button 
          onClick={onOpenOwnerAuth}
          className="hidden sm:inline-flex items-center text-yellow-300 hover:text-yellow-200 underline font-semibold transition-colors cursor-pointer"
        >
          Own a shop? Join the local marketplace
        </button>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18 gap-4">
          {/* Logo */}
          <div className="flex items-center gap-6 shrink-0">
            <button
              id="shoplocal-logo-btn"
              onClick={() => {
                onResetFilters();
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="flex items-center gap-3 text-slate-900 hover:opacity-95 transition-opacity text-left cursor-pointer group"
            >
              <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-200 group-hover:bg-indigo-700 transition-colors">
                <Store className="w-5 h-5" />
              </div>
              <div>
                <span className="text-2xl font-black tracking-tight text-indigo-600 flex items-center">
                  Shop<span className="text-pink-500">Local</span>
                </span>
                <span className="block text-[10px] uppercase font-bold tracking-wider text-slate-400 -mt-1">
                  Neighborhood Marketplace
                </span>
              </div>
            </button>

            {/* Category Dropdown (Desktop) */}
            <div className="relative hidden md:block">
              <button
                id="category-dropdown-btn"
                type="button"
                onClick={() => setIsCategoryOpen(!isCategoryOpen)}
                className={`flex items-center gap-1.5 px-3.5 py-2 text-sm font-semibold rounded-full transition-all border ${
                  selectedCategory !== 'All' 
                    ? 'bg-indigo-50 text-indigo-700 border-indigo-200 shadow-xs' 
                    : 'text-slate-700 hover:text-indigo-600 hover:bg-slate-100 border-transparent'
                }`}
              >
                <span>{selectedCategory === 'All' ? 'Categories' : selectedCategory}</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${isCategoryOpen ? 'rotate-180' : ''}`} />
              </button>

              {isCategoryOpen && (
                <div 
                  className="absolute left-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
                  onMouseLeave={() => setIsCategoryOpen(false)}
                >
                  <button
                    onClick={() => {
                      onSelectCategory('All');
                      setIsCategoryOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2.5 text-sm flex items-center justify-between transition-colors ${
                      selectedCategory === 'All' ? 'bg-indigo-50 text-indigo-700 font-bold' : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span>All Categories</span>
                  </button>
                  <div className="my-1 border-t border-slate-100" />
                  {CATEGORIES_DATA.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => {
                        onSelectCategory(cat.name);
                        setIsCategoryOpen(false);
                        const el = document.getElementById('marketplace-products');
                        if (el) el.scrollIntoView({ behavior: 'smooth' });
                      }}
                      className={`w-full text-left px-4 py-2 text-sm flex items-center justify-between transition-colors ${
                        selectedCategory === cat.name ? 'bg-indigo-50 text-indigo-700 font-bold' : 'text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <span>{cat.name}</span>
                      <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                        {cat.itemCount}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Global Search Bar (Center) */}
          <form 
            onSubmit={handleSearchSubmit}
            className="flex-1 max-w-xl mx-2 hidden sm:block"
          >
            <div className="relative">
              <input
                id="global-search-input"
                type="text"
                placeholder="Search shops or products..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full pl-10 pr-10 py-2 bg-slate-100 focus:bg-white text-slate-900 placeholder-slate-400 rounded-full text-sm border border-transparent focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all outline-none"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => onSearchChange('')}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
                  title="Clear search"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </form>

          {/* Action Links & CTA */}
          <div className="hidden lg:flex items-center gap-3">
            <button
              id="browse-shops-nav-link"
              onClick={onBrowseShopsClick}
              className="px-4 py-2 text-sm font-semibold text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 rounded-full transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <Store className="w-4 h-4 text-indigo-600" />
              <span>Browse Shops</span>
            </button>

            {currentUser ? (
              <div className="flex items-center gap-2.5">
                <div className="hidden xl:flex flex-col text-right leading-tight">
                  <span className="text-xs font-bold text-slate-800 truncate max-w-[130px]">
                    {currentUser.uid === ADMIN_UID || userProfile?.role === 'admin'
                      ? 'Platform Admin'
                      : userProfile?.shopName || userProfile?.ownerName || currentUser.email}
                  </span>
                  {currentUser.uid === ADMIN_UID || userProfile?.role === 'admin' ? (
                    <span className="text-[10px] font-black text-indigo-600 flex items-center gap-1 justify-end uppercase tracking-wider">
                      <ShieldCheck className="w-3 h-3 text-indigo-600" />
                      Admin View
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-1 justify-end">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                      Shop Owner
                    </span>
                  )}
                </div>
                <button
                  id="navbar-dashboard-btn"
                  onClick={onViewDashboard}
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-white font-semibold transition-all cursor-pointer text-xs sm:text-sm shadow-md ${
                    currentUser.uid === ADMIN_UID || userProfile?.role === 'admin'
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-purple-200'
                      : 'bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 shadow-indigo-200'
                  }`}
                >
                  {currentUser.uid === ADMIN_UID || userProfile?.role === 'admin' ? (
                    <>
                      <ShieldCheck className="w-4 h-4" />
                      <span>Admin View</span>
                    </>
                  ) : (
                    <>
                      <Store className="w-4 h-4" />
                      <span>Shop Dashboard</span>
                    </>
                  )}
                </button>
                <button
                  id="navbar-logout-btn"
                  onClick={onLogout}
                  className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-600 rounded-full text-xs font-bold transition-colors cursor-pointer border border-slate-200"
                  title="Sign out and return to auth screen"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden xl:inline">Log Out</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <div className="hidden xl:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 text-slate-600 text-xs font-medium border border-slate-200">
                  <span className="w-2 h-2 rounded-full bg-slate-400"></span>
                  <span>Public Shopper (Guest)</span>
                </div>
                <button
                  id="shop-owner-cta-btn"
                  onClick={onOpenOwnerAuth}
                  className="inline-flex items-center gap-2 bg-indigo-600 text-white px-4.5 py-2.5 rounded-full hover:bg-indigo-700 active:bg-indigo-800 transition-all font-semibold shadow-lg shadow-indigo-200 cursor-pointer text-xs sm:text-sm"
                >
                  <UserCircle className="w-4 h-4" />
                  <span>Owner Login</span>
                </button>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex lg:hidden items-center gap-2">
            <button
              id="mobile-menu-toggle-btn"
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-lg text-slate-700 hover:bg-slate-100 focus:outline-none"
              aria-label="Toggle Navigation Menu"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Search Bar (Visible on mobile screens) */}
        <div className="sm:hidden pb-3">
          <form onSubmit={handleSearchSubmit} className="relative">
            <input
              id="mobile-search-input"
              type="text"
              placeholder="Search shops or products..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-9 pr-8 py-2 bg-slate-100 focus:bg-white text-slate-900 placeholder-slate-400 rounded-full text-sm border border-transparent focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            {searchQuery && (
              <button
                type="button"
                onClick={() => onSearchChange('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </form>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-100 bg-white px-4 pt-3 pb-6 space-y-4 shadow-xl animate-in slide-in-from-top duration-200">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">
              Explore Categories
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  onSelectCategory('All');
                  setIsMobileMenuOpen(false);
                }}
                className={`text-left px-3 py-2 rounded-xl text-xs font-semibold border ${
                  selectedCategory === 'All'
                    ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                    : 'bg-slate-50 text-slate-700 border-slate-100'
                }`}
              >
                All Categories
              </button>
              {CATEGORIES_DATA.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => {
                    onSelectCategory(cat.name);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`text-left px-3 py-2 rounded-xl text-xs font-semibold border truncate ${
                    selectedCategory === cat.name
                      ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                      : 'bg-slate-50 text-slate-700 border-slate-100'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          <div className="border-t border-slate-100 pt-3 space-y-2">
            <button
              onClick={() => {
                onBrowseShopsClick();
                setIsMobileMenuOpen(false);
              }}
              className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:text-indigo-600"
            >
              <span className="flex items-center gap-2">
                <Store className="w-4 h-4 text-indigo-600" />
                Browse Registered Shops
              </span>
              <span className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full font-bold">6 Local</span>
            </button>

            {currentUser ? (
              <div className="space-y-2">
                <button
                  onClick={() => {
                    if (onViewDashboard) onViewDashboard();
                    setIsMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 text-white rounded-full font-bold text-sm shadow-lg cursor-pointer ${
                    currentUser.uid === ADMIN_UID || userProfile?.role === 'admin'
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-purple-200'
                      : 'bg-indigo-600 shadow-indigo-200 hover:bg-indigo-700'
                  }`}
                >
                  {currentUser.uid === ADMIN_UID || userProfile?.role === 'admin' ? (
                    <>
                      <ShieldCheck className="w-4 h-4" />
                      <span>Open Admin Console</span>
                    </>
                  ) : (
                    <>
                      <Store className="w-4 h-4" />
                      <span>Go to Shop Dashboard</span>
                    </>
                  )}
                </button>
                <button
                  onClick={() => {
                    if (onLogout) onLogout();
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-full font-bold text-sm hover:bg-rose-100 cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  Log Out ({currentUser.email})
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  onOpenOwnerAuth();
                  setIsMobileMenuOpen(false);
                }}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-full font-bold text-sm shadow-lg shadow-indigo-200 hover:bg-indigo-700 cursor-pointer"
              >
                <UserCircle className="w-4 h-4" />
                Shop Owner Login / Register
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

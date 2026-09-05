/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { 
  auth, 
  getUserProfile, 
  logoutUser, 
  ADMIN_UID, 
  getPersistedProducts, 
  saveProductToDatabase, 
  deletePersistedProduct 
} from './services/firebase';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { CategoriesSection } from './components/CategoriesSection';
import { FeaturedProducts } from './components/FeaturedProducts';
import { ShopsShowcase } from './components/ShopsShowcase';
import { Footer } from './components/Footer';
import { ProductDetailModal } from './components/ProductDetailModal';
import { ShopProfileModal } from './components/ShopProfileModal';
import { ShopOwnerAuthModal } from './components/ShopOwnerAuthModal';
import { ContactShopModal } from './components/ContactShopModal';
import { BrowseShopsModal } from './components/BrowseShopsModal';
import { ShopManagerDashboard } from './components/ShopManagerDashboard';
import { AdminDashboard } from './components/AdminDashboard';
import { PendingApprovalScreen } from './components/PendingApprovalScreen';
import { BannedAccountScreen } from './components/BannedAccountScreen';
import { SHOPS_DATA, PRODUCTS_DATA } from './data/mockData';
import { Product, Shop, UserProfile } from './types';

export default function App() {
  // Firebase Auth state & View routing
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [currentView, setCurrentView] = useState<'marketplace' | 'dashboard'>('marketplace');

  // Global filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedLocation, setSelectedLocation] = useState('All Neighborhoods (Within 10 miles)');

  // Modal / Interaction states
  const [activeProduct, setActiveProduct] = useState<Product | null>(null);
  const [activeShopId, setActiveShopId] = useState<string | null>(null);
  const [isOwnerAuthOpen, setIsOwnerAuthOpen] = useState(false);
  const [isBrowseShopsOpen, setIsBrowseShopsOpen] = useState(false);
  
  // Dynamic Product State (syncs with Firestore and local persistence)
  const [productsList, setProductsList] = useState<Product[]>(PRODUCTS_DATA);

  // Contact inquiry state with quantity support
  const [contactTarget, setContactTarget] = useState<{ 
    shop: Shop; 
    product?: Product | null; 
    quantity?: number;
  } | null>(null);

  // Load persisted products from database and local storage
  useEffect(() => {
    let isMounted = true;
    const fetchCatalog = async () => {
      try {
        const loaded = await getPersistedProducts();
        if (isMounted && loaded.length > 0) {
          setProductsList(loaded);
        }
      } catch (err) {
        console.warn("Could not load products catalog:", err);
      }
    };

    fetchCatalog();

    // Listen to real-time events across windows or tabs
    const onCatalogUpdate = () => {
      fetchCatalog();
    };

    window.addEventListener('shoplocal_product_added', onCatalogUpdate);
    window.addEventListener('shoplocal_product_deleted', onCatalogUpdate);
    window.addEventListener('storage', onCatalogUpdate);

    return () => {
      isMounted = false;
      window.removeEventListener('shoplocal_product_added', onCatalogUpdate);
      window.removeEventListener('shoplocal_product_deleted', onCatalogUpdate);
      window.removeEventListener('storage', onCatalogUpdate);
    };
  }, []);

  const handleAddProduct = async (newProduct: Product) => {
    // 1. Immediately update UI state with zero latency
    setProductsList((prev) => [newProduct, ...prev.filter((p) => p.id !== newProduct.id)]);
    
    // 2. Persist to Firestore and local registry
    try {
      await saveProductToDatabase(newProduct);
    } catch (e) {
      console.warn("Could not persist product to database:", e);
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    setProductsList((prev) => prev.filter((p) => p.id !== productId));
    try {
      await deletePersistedProduct(productId);
    } catch (e) {
      console.warn("Could not delete product from database:", e);
    }
  };

  const refreshUserProfile = async () => {
    if (!currentUser) return;
    try {
      const updated = await getUserProfile(currentUser.uid);
      setUserProfile(updated);
    } catch (e) {
      console.warn("Could not refresh profile:", e);
    }
  };

  // Monitor Firebase Authentication state with persistent sessions and role verification
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUser(user);
        try {
          const profile = await getUserProfile(user.uid);
          setUserProfile(profile);
          if (user.uid === ADMIN_UID || profile?.role === 'admin') {
            setCurrentView('dashboard');
          } else if (profile?.role === 'shop_owner') {
            setCurrentView('dashboard');
          }
        } catch (e) {
          console.warn("Could not load user profile:", e);
        }
      } else {
        // Check if admin demo session was set
        const storedAdmin = localStorage.getItem('shoplocal_active_admin');
        if (storedAdmin === ADMIN_UID) {
          const adminUser = {
            uid: ADMIN_UID,
            email: "admin@shoplocal.platform",
            displayName: "Platform Administrator",
          } as unknown as User;
          setCurrentUser(adminUser);
          const profile = await getUserProfile(ADMIN_UID);
          setUserProfile(profile);
          setCurrentView('dashboard');
        } else {
          setCurrentUser(null);
          setUserProfile(null);
        }
      }
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await logoutUser();
    } catch (error) {
      console.error('Sign out error:', error);
    }
    localStorage.removeItem('shoplocal_active_admin');
    setCurrentUser(null);
    setUserProfile(null);
    setCurrentView('marketplace');
    setIsOwnerAuthOpen(true); // Return to auth screen on logout
  };

  const handleAdminLogin = async () => {
    const adminUser = {
      uid: ADMIN_UID,
      email: "admin@shoplocal.platform",
      displayName: "Platform Administrator",
    } as unknown as User;

    localStorage.setItem('shoplocal_active_admin', ADMIN_UID);
    setCurrentUser(adminUser);
    const profile = await getUserProfile(ADMIN_UID);
    setUserProfile(profile);
    setIsOwnerAuthOpen(false);
    setCurrentView('dashboard');
  };

  const handleAuthSuccess = (_user?: User, profile?: UserProfile | null) => {
    if (profile) {
      setUserProfile(profile);
    }
    setIsOwnerAuthOpen(false);
    setCurrentView('dashboard');
  };

  // Active shop object
  const activeShop = activeShopId ? SHOPS_DATA.find((s) => s.id === activeShopId) || null : null;

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('All');
    setSelectedLocation('All Neighborhoods (Within 10 miles)');
  };

  const handleOpenContactForProduct = (product: Product, quantity = 1) => {
    const shop = SHOPS_DATA.find((s) => s.id === product.shopId);
    if (shop) {
      setActiveProduct(null);
      setContactTarget({ shop, product, quantity });
    }
  };

  const handleOpenContactForShop = (shop: Shop) => {
    setActiveShopId(null);
    setContactTarget({ shop, product: null });
  };

  const scrollToProducts = () => {
    const element = document.getElementById('marketplace-products');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleViewMarketplace = () => {
    handleResetFilters();
    setCurrentView('marketplace');
    setTimeout(() => {
      scrollToProducts();
    }, 150);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 selection:bg-emerald-100 selection:text-emerald-900">
      {currentView === 'dashboard' && currentUser ? (
        /* Check if Master Admin User */
        currentUser.uid === ADMIN_UID || userProfile?.role === 'admin' ? (
          <AdminDashboard
            user={currentUser}
            userProfile={userProfile}
            onLogout={handleLogout}
            onViewMarketplace={handleViewMarketplace}
          />
        ) : userProfile?.status === 'banned' ? (
          /* Banned Shop Owner View */
          <BannedAccountScreen
            user={currentUser}
            userProfile={userProfile}
            onLogout={handleLogout}
            onViewMarketplace={handleViewMarketplace}
          />
        ) : userProfile?.status === 'pending' ? (
          /* Pending Shop Owner Application View (Awaiting Admin Approval) */
          <PendingApprovalScreen
            user={currentUser}
            userProfile={userProfile}
            onRefreshProfile={refreshUserProfile}
            onLogout={handleLogout}
            onViewMarketplace={handleViewMarketplace}
          />
        ) : (
          /* Authenticated Approved Shop Owner Dashboard */
          <ShopManagerDashboard
            user={currentUser}
            userProfile={userProfile}
            onLogout={handleLogout}
            onViewMarketplace={handleViewMarketplace}
            allProducts={productsList}
            onAddProduct={handleAddProduct}
            onDeleteProduct={handleDeleteProduct}
          />
        )
      ) : (
        /* Public Main Platform (Landing Page & Marketplace) */
        <>
          {/* 1. Navigation Bar */}
          <Navbar
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
            onOpenOwnerAuth={() => setIsOwnerAuthOpen(true)}
            onBrowseShopsClick={() => setIsBrowseShopsOpen(true)}
            onResetFilters={handleResetFilters}
            currentUser={currentUser}
            userProfile={userProfile}
            onViewDashboard={() => setCurrentView('dashboard')}
            onLogout={handleLogout}
          />

          {/* Main Content Area */}
          <main className="flex-1">
            {/* 2. Hero Section */}
            <Hero
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              selectedCategory={selectedCategory}
              onSelectCategory={setSelectedCategory}
              selectedLocation={selectedLocation}
              onSelectLocation={setSelectedLocation}
              onExploreClick={scrollToProducts}
              onOpenOwnerAuth={() => setIsOwnerAuthOpen(true)}
            />

            {/* 3. Shop Categories Section */}
            <CategoriesSection
              selectedCategory={selectedCategory}
              onSelectCategory={setSelectedCategory}
            />

            {/* 4. Featured Products Grid */}
            <FeaturedProducts
              products={productsList}
              selectedCategory={selectedCategory}
              onSelectCategory={setSelectedCategory}
              searchQuery={searchQuery}
              onClearSearch={() => setSearchQuery('')}
              onSelectProduct={(p) => setActiveProduct(p)}
              onSelectShop={(shopId) => setActiveShopId(shopId)}
            />

            {/* 5. Registered Shops Showcase */}
            <ShopsShowcase
              shops={SHOPS_DATA}
              onSelectShop={(shopId) => setActiveShopId(shopId)}
              onOpenOwnerAuth={() => setIsOwnerAuthOpen(true)}
            />
          </main>

          {/* 6. Footer */}
          <Footer
            onOpenOwnerAuth={() => setIsOwnerAuthOpen(true)}
            onBrowseShops={() => setIsBrowseShopsOpen(true)}
            onSelectCategory={(cat) => {
              setSelectedCategory(cat);
              scrollToProducts();
            }}
          />
        </>
      )}

      {/* Interactive Modals */}

      {/* Product Detail Modal */}
      <ProductDetailModal
        product={activeProduct}
        shop={activeProduct ? SHOPS_DATA.find((s) => s.id === activeProduct.shopId) : undefined}
        onClose={() => setActiveProduct(null)}
        onSelectShop={(shopId) => setActiveShopId(shopId)}
        onContactShop={handleOpenContactForProduct}
      />

      {/* Shop Profile Modal */}
      <ShopProfileModal
        shop={activeShop}
        products={productsList}
        onClose={() => setActiveShopId(null)}
        onSelectProduct={(p) => setActiveProduct(p)}
        onContactShop={handleOpenContactForShop}
      />

      {/* Shop Owner Auth Modal */}
      <ShopOwnerAuthModal
        isOpen={isOwnerAuthOpen}
        onClose={() => setIsOwnerAuthOpen(false)}
        onSuccess={handleAuthSuccess}
        onAdminLogin={handleAdminLogin}
      />

      {/* Direct Contact Shop Owner Modal */}
      <ContactShopModal
        shop={contactTarget?.shop || null}
        product={contactTarget?.product || null}
        quantity={contactTarget?.quantity || 1}
        onClose={() => setContactTarget(null)}
      />

      {/* Browse Shops Directory Modal */}
      <BrowseShopsModal
        isOpen={isBrowseShopsOpen}
        shops={SHOPS_DATA}
        onClose={() => setIsBrowseShopsOpen(false)}
        onSelectShop={(shopId) => {
          setIsBrowseShopsOpen(false);
          setActiveShopId(shopId);
        }}
      />
    </div>
  );
}

import React, { useState } from 'react';
import { 
  Store, 
  Mail, 
  Phone, 
  MapPin, 
  CheckCircle2, 
  Heart, 
  ArrowRight,
  ShieldCheck,
  Sparkles
} from 'lucide-react';

interface FooterProps {
  onOpenOwnerAuth: () => void;
  onBrowseShops: () => void;
  onSelectCategory: (cat: string) => void;
}

export const Footer: React.FC<FooterProps> = ({
  onOpenOwnerAuth,
  onBrowseShops,
  onSelectCategory,
}) => {
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterSubscribed, setNewsletterSubscribed] = useState(false);

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newsletterEmail.trim()) {
      setNewsletterSubscribed(true);
      setNewsletterEmail('');
      setTimeout(() => {
        setNewsletterSubscribed(false);
      }, 5000);
    }
  };

  return (
    <footer className="bg-slate-950 text-slate-300 pt-16 pb-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Onboarding Callout Banner */}
        <div className="mb-14 p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-indigo-950 via-purple-950 to-slate-950 border border-indigo-800/60 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-center md:text-left">
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-pink-500/20 border border-pink-500/40 text-pink-300 text-xs font-bold mb-2.5">
              <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
              <span>Small Business Empowerment</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Are you an independent merchant or local maker?
            </h3>
            <p className="text-sm text-indigo-200/80 mt-1.5 max-w-xl font-normal">
              Create your free digital storefront, list unlimited handmade or local products, and connect with thousands of conscious community shoppers.
            </p>
          </div>

          <button
            id="footer-owner-onboarding-btn"
            type="button"
            onClick={onOpenOwnerAuth}
            className="shrink-0 px-6 py-3.5 bg-yellow-400 hover:bg-yellow-300 active:bg-yellow-500 text-slate-950 rounded-2xl font-black text-sm shadow-xl shadow-yellow-400/20 transition-all flex items-center gap-2 cursor-pointer hover:scale-[1.03] active:scale-[0.98]"
          >
            <Store className="w-4 h-4 text-slate-950" />
            <span>Open Your Shop Storefront</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* 4-Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-slate-850">
          {/* Col 1 & 2: Brand & Mission */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5 text-white">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-500 to-pink-500 text-white flex items-center justify-center shadow-md">
                <Store className="w-5 h-5" />
              </div>
              <span className="text-xl font-black tracking-tight">
                Shop<span className="text-yellow-300">Local</span>
              </span>
            </div>

            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-sm">
              ShopLocal is a community-first digital marketplace and marketing platform dedicated to empowering local brick-and-mortar storefronts, family grocers, and independent artisans.
            </p>

            <div className="pt-2 flex items-center gap-3 text-xs text-slate-400">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>100% Community Vetted Small Businesses</span>
            </div>
          </div>

          {/* Col 3: Quick Links */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">
              Marketplace
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <button
                  onClick={() => {
                    const el = document.getElementById('marketplace-products');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="hover:text-pink-400 transition-colors"
                >
                  Featured Products
                </button>
              </li>
              <li>
                <button
                  onClick={onBrowseShops}
                  className="hover:text-pink-400 transition-colors"
                >
                  Registered Shops
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectCategory('Handmade & Crafts')}
                  className="hover:text-pink-400 transition-colors"
                >
                  Handmade Ceramics & Crafts
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectCategory('Artisanal Groceries')}
                  className="hover:text-pink-400 transition-colors"
                >
                  Fresh Baked & Local Pantry
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectCategory('Organic Beauty')}
                  className="hover:text-pink-400 transition-colors"
                >
                  Zero-Waste Botanical Skincare
                </button>
              </li>
            </ul>
          </div>

          {/* Col 4: Shop Owner Portal Links */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">
              Shop Owners
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <button
                  onClick={onOpenOwnerAuth}
                  className="hover:text-yellow-300 transition-colors flex items-center gap-1 font-bold text-yellow-400"
                >
                  <span>Merchant Login / Register</span>
                </button>
              </li>
              <li>
                <button
                  onClick={onOpenOwnerAuth}
                  className="hover:text-indigo-400 transition-colors"
                >
                  Digital Storefront Setup
                </button>
              </li>
              <li>
                <button
                  onClick={onOpenOwnerAuth}
                  className="hover:text-indigo-400 transition-colors"
                >
                  Product Catalog Management
                </button>
              </li>
              <li>
                <button
                  onClick={onOpenOwnerAuth}
                  className="hover:text-indigo-400 transition-colors"
                >
                  Shop Traffic & View Analytics
                </button>
              </li>
              <li>
                <a href="#pickup-guide" className="hover:text-indigo-400 transition-colors">
                  Local Pickup Best Practices
                </a>
              </li>
            </ul>
          </div>

          {/* Col 5: Newsletter & Contact */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">
              Stay in the Loop
            </h4>
            <p className="text-xs text-slate-400 mb-3">
              Weekly digest of new neighborhood shops, weekend markets, and limited batch drops.
            </p>

            <form onSubmit={handleNewsletterSubmit} className="space-y-2">
              <div className="relative">
                <input
                  id="newsletter-email-input"
                  type="email"
                  required
                  placeholder="Enter your email"
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>
              <button
                type="submit"
                id="newsletter-submit-btn"
                className="w-full py-2.5 bg-gradient-to-r from-indigo-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-indigo-900/40 cursor-pointer"
              >
                Subscribe to Local News
              </button>

              {newsletterSubscribed && (
                <div className="text-[11px] text-pink-400 flex items-center gap-1 mt-1 animate-in fade-in">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Welcome! You're subscribed to local drops.</span>
                </div>
              )}
            </form>

            <div className="mt-5 space-y-1.5 text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-slate-500" />
                <span>support@shoplocal.org</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-slate-500" />
                <span>San Francisco, CA Community Hub</span>
              </div>
            </div>
          </div>
        </div>

        {/* Copyright & Sub-footer */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} ShopLocal. Designed for Independent Neighborhood Merchants.</p>
          <div className="flex items-center gap-6">
            <span className="hover:text-slate-400 transition-colors">Privacy Policy</span>
            <span className="hover:text-slate-400 transition-colors">Terms of Service</span>
            <span className="hover:text-slate-400 transition-colors">Community Charter</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

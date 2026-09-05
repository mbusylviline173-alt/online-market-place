import React, { useState } from 'react';
import { 
  X, 
  Store, 
  Search, 
  MapPin, 
  Star, 
  CheckCircle2, 
  Phone, 
  ExternalLink,
  Layers,
  ArrowRight
} from 'lucide-react';
import { Shop } from '../types';
import { CATEGORIES_DATA } from '../data/mockData';

interface BrowseShopsModalProps {
  isOpen: boolean;
  shops: Shop[];
  onClose: () => void;
  onSelectShop: (shopId: string) => void;
}

export const BrowseShopsModal: React.FC<BrowseShopsModalProps> = ({
  isOpen,
  shops,
  onClose,
  onSelectShop,
}) => {
  const [search, setSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState('All');

  if (!isOpen) return null;

  const filteredShops = shops.filter((s) => {
    if (selectedCat !== 'All' && s.category !== selectedCat) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchName = s.name.toLowerCase().includes(q);
      const matchBio = s.bio.toLowerCase().includes(q);
      const matchCity = s.city.toLowerCase().includes(q);
      if (!matchName && !matchBio && !matchCity) return false;
    }
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-150">
      <div 
        className="relative bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 sm:p-7 bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-900 text-white flex items-center justify-between border-b border-indigo-900/50">
          <div>
            <div className="flex items-center gap-2 text-yellow-300 text-xs font-black uppercase tracking-wider mb-1">
              <Store className="w-4 h-4 text-yellow-300" />
              <span>Neighborhood Merchants</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight">
              Directory of Registered Small Shops
            </h2>
            <p className="text-xs text-indigo-200/80 mt-0.5 font-normal">
              Explore independent shops verified and registered with ShopLocal.
            </p>
          </div>

          <button
            type="button"
            id="close-browse-shops-btn"
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-slate-850 hover:bg-slate-800 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer border border-slate-750"
            aria-label="Close directory"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Filter Toolbar */}
        <div className="p-4 bg-slate-50/80 border-b border-slate-100 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              id="browse-shops-search-input"
              type="text"
              placeholder="Search by shop name, neighborhood, or specialty..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 outline-none"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              id="browse-shops-category-select"
              value={selectedCat}
              onChange={(e) => setSelectedCat(e.target.value)}
              className="px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none cursor-pointer focus:border-indigo-600"
            >
              <option value="All">All Categories</option>
              {CATEGORIES_DATA.map((c) => (
                <option key={c.id} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* List of Shops */}
        <div className="p-6 overflow-y-auto max-h-[60vh] space-y-4">
          {filteredShops.length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-xs font-medium">
              No shops matched your search filter.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredShops.map((shop) => (
                <div
                  key={shop.id}
                  className="bg-white rounded-2xl border border-slate-100 p-4.5 hover:border-indigo-200 hover:shadow-lg transition-all flex flex-col justify-between group"
                >
                  <div>
                    <div className="flex items-start gap-3 mb-2">
                      <img
                        src={shop.logoUrl}
                        alt={shop.name}
                        className="w-14 h-14 rounded-2xl object-cover border border-slate-100 shrink-0 shadow-xs"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <h3 className="text-sm font-black text-slate-900 truncate group-hover:text-indigo-600 transition-colors">
                            {shop.name}
                          </h3>
                          {shop.verified && (
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          )}
                        </div>
                        <span className="text-[11px] text-indigo-600 font-bold block">
                          {shop.category}
                        </span>
                        <div className="flex items-center gap-1 text-[11px] text-slate-500 mt-0.5 font-medium">
                          <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                          <span className="font-bold text-slate-800">{shop.rating}</span>
                          <span>•</span>
                          <span className="truncate">{shop.city}</span>
                        </div>
                      </div>
                    </div>

                    <p className="text-xs text-slate-600 line-clamp-2 mt-1 font-normal">
                      {shop.bio}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[11px] text-slate-400 font-medium">
                      {shop.productsCount} items listed
                    </span>

                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onSelectShop(shop.id);
                      }}
                      className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 group-hover:text-indigo-700 cursor-pointer"
                    >
                      <span>Visit Storefront</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

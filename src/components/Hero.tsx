import React from 'react';
import { 
  Search, 
  MapPin, 
  Layers, 
  ShieldCheck, 
  Truck, 
  HeartHandshake, 
  ArrowRight,
  TrendingUp,
  Sparkles
} from 'lucide-react';
import { CATEGORIES_DATA } from '../data/mockData';

interface HeroProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedCategory: string;
  onSelectCategory: (cat: string) => void;
  selectedLocation: string;
  onSelectLocation: (loc: string) => void;
  onExploreClick: () => void;
  onOpenOwnerAuth: () => void;
}

export const Hero: React.FC<HeroProps> = ({
  searchQuery,
  onSearchChange,
  selectedCategory,
  onSelectCategory,
  selectedLocation,
  onSelectLocation,
  onExploreClick,
  onOpenOwnerAuth,
}) => {
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onExploreClick();
  };

  const locations = [
    'All Neighborhoods (Within 10 miles)',
    'Historic Arts District',
    'Downtown & Mercer',
    'Hawthorne & Division',
    'SE Belmont & Eastside',
    'Alberta Arts Corridor'
  ];

  return (
    <section className="relative bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 text-white overflow-hidden py-16 sm:py-24">
      {/* Decorative Background Elements */}
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#ffffff_1.5px,transparent_1.5px)] [background-size:24px_24px] pointer-events-none" />
      <div className="absolute right-0 bottom-0 w-96 h-96 opacity-20 pointer-events-none translate-x-12 translate-y-12">
        <svg viewBox="0 0 200 200" className="w-full h-full text-white fill-current">
          <path d="M40,-67C52.1,-62.5,62.5,-52.1,71.1,-40C79.7,-27.9,86.5,-13.9,86.5,0C86.5,13.9,79.7,27.9,71.1,40C62.5,52.1,52.1,62.5,40,71.1C27.9,79.7,13.9,86.5,0,86.5C-13.9,86.5,-27.9,79.7,-40,71.1C-52.1,62.5,-62.5,52.1,-71.1,40C-79.7,27.9,-86.5,13.9,-86.5,0C-86.5,-13.9,-79.7,-27.9,-71.1,-40C-62.5,-52.1,-52.1,-62.5,-40,-71.1C-27.9,-79.7,-13.9,-86.5,0,-86.5C13.9,-86.5,27.9,-79.7,40,-71.1Z" transform="translate(100 100)"/>
        </svg>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-10">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white text-xs font-bold uppercase tracking-wider mb-6 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
            <span>Support Your Neighbors</span>
          </div>

          {/* Engaging Title with Yellow Highlight */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight mb-4">
            Support Your Neighbors. <br />
            <span className="text-yellow-300 drop-shadow-xs">Shop Small, Shop Local.</span>
          </h1>

          {/* Tagline supporting local small businesses */}
          <p className="text-base sm:text-lg text-indigo-50 leading-relaxed font-normal max-w-2xl mx-auto">
            The best boutique treasures, handmade crafts, and neighborhood essentials delivered from independent shops directly to you.
          </p>

          {/* Quick Filter Badges */}
          <div className="mt-5 flex flex-wrap items-center justify-center gap-2.5">
            <div className="bg-white/20 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/30 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs">
              <MapPin className="w-3.5 h-3.5 text-yellow-300" />
              <span>{selectedLocation.split('(')[0]}</span>
            </div>
            <div className="bg-white/20 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/30 text-white text-xs font-semibold shadow-xs">
              {selectedCategory === 'All' ? 'All Artisan Categories' : selectedCategory}
            </div>
            <div className="bg-white/20 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/30 text-yellow-200 text-xs font-bold shadow-xs">
              ⚡ Local Pickup Ready
            </div>
          </div>
        </div>

        {/* Search & Multi-Filter Card */}
        <div className="max-w-4xl mx-auto bg-white rounded-3xl p-3 sm:p-5 shadow-2xl border border-white/40 text-slate-900">
          <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 sm:grid-cols-12 gap-2 sm:gap-3">
            {/* Search Input */}
            <div className="sm:col-span-5 relative">
              <label htmlFor="hero-search-input" className="sr-only">Search products or shops</label>
              <div className="flex items-center h-12 bg-slate-100 rounded-2xl px-3.5 border border-transparent focus-within:border-indigo-500 focus-within:bg-white focus-within:ring-2 focus-within:ring-indigo-500/20 transition-all">
                <Search className="w-5 h-5 text-slate-400 mr-2.5 shrink-0" />
                <input
                  id="hero-search-input"
                  type="text"
                  placeholder="What are you looking for today?"
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                  className="w-full bg-transparent text-sm text-slate-900 placeholder-slate-400 outline-none"
                />
              </div>
            </div>

            {/* Category Filter */}
            <div className="sm:col-span-3 relative">
              <label htmlFor="hero-category-select" className="sr-only">Category</label>
              <div className="flex items-center h-12 bg-slate-100 rounded-2xl px-3 border border-transparent focus-within:border-indigo-500 focus-within:bg-white focus-within:ring-2 focus-within:ring-indigo-500/20 transition-all">
                <Layers className="w-4 h-4 text-indigo-500 mr-2 shrink-0" />
                <select
                  id="hero-category-select"
                  value={selectedCategory}
                  onChange={(e) => onSelectCategory(e.target.value)}
                  className="w-full bg-transparent text-xs sm:text-sm text-slate-700 outline-none cursor-pointer truncate font-semibold"
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

            {/* Location Filter */}
            <div className="sm:col-span-3 relative">
              <label htmlFor="hero-location-select" className="sr-only">Location</label>
              <div className="flex items-center h-12 bg-slate-100 rounded-2xl px-3 border border-transparent focus-within:border-indigo-500 focus-within:bg-white focus-within:ring-2 focus-within:ring-indigo-500/20 transition-all">
                <MapPin className="w-4 h-4 text-pink-500 mr-2 shrink-0" />
                <select
                  id="hero-location-select"
                  value={selectedLocation}
                  onChange={(e) => onSelectLocation(e.target.value)}
                  className="w-full bg-transparent text-xs sm:text-sm text-slate-700 outline-none cursor-pointer truncate font-semibold"
                >
                  {locations.map((loc) => (
                    <option key={loc} value={loc}>
                      {loc}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Submit Button */}
            <div className="sm:col-span-1">
              <button
                id="hero-search-submit-btn"
                type="submit"
                className="w-full h-12 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white rounded-2xl flex items-center justify-center font-bold shadow-lg shadow-indigo-200 transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
                title="Search marketplace"
              >
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </form>

          {/* Quick Tags underneath Search */}
          <div className="mt-3.5 pt-3 border-t border-slate-100 flex flex-wrap items-center gap-2 text-xs text-slate-500">
            <span className="font-bold text-slate-700">Popular right now:</span>
            {['Sourdough Bread', 'Handmade Ceramics', 'Organic Face Oil', 'Vintage Audio', 'Linen Shirts'].map((tag, idx) => {
              const borderStyles = [
                'hover:border-pink-400 hover:text-pink-600',
                'hover:border-yellow-400 hover:text-yellow-600',
                'hover:border-emerald-400 hover:text-emerald-600',
                'hover:border-indigo-400 hover:text-indigo-600',
                'hover:border-purple-400 hover:text-purple-600'
              ];
              return (
                <button
                  key={tag}
                  type="button"
                  onClick={() => {
                    onSearchChange(tag);
                    onExploreClick();
                  }}
                  className={`px-3 py-1 rounded-full bg-slate-100 text-slate-700 font-semibold border border-transparent transition-all cursor-pointer ${borderStyles[idx % borderStyles.length]}`}
                >
                  {tag}
                </button>
              );
            })}
          </div>
        </div>

        {/* Visual Call-to-Action Banner / Value Pillars */}
        <div className="mt-12 max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center gap-3.5 p-4 rounded-2xl bg-white/15 backdrop-blur-md border border-white/20 shadow-sm hover:bg-white/20 transition-all">
            <div className="w-11 h-11 rounded-xl bg-pink-500 text-white flex items-center justify-center shrink-0 shadow-md">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">100% Verified Local Shops</h2>
              <p className="text-xs text-indigo-50">Authentic neighborhood merchants, no drop-shippers or fake listings.</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5 p-4 rounded-2xl bg-white/15 backdrop-blur-md border border-white/20 shadow-sm hover:bg-white/20 transition-all">
            <div className="w-11 h-11 rounded-xl bg-yellow-400 text-indigo-950 flex items-center justify-center shrink-0 shadow-md">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">Curbside Pickup & Delivery</h2>
              <p className="text-xs text-indigo-50">Pick up same-day in person or request direct neighborhood courier delivery.</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5 p-4 rounded-2xl bg-white/15 backdrop-blur-md border border-white/20 shadow-sm hover:bg-white/20 transition-all">
            <div className="w-11 h-11 rounded-xl bg-emerald-400 text-emerald-950 flex items-center justify-center shrink-0 shadow-md">
              <HeartHandshake className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">Direct Maker Impact</h2>
              <p className="text-xs text-indigo-50">95%+ of revenue stays directly in the pocket of the small business owner.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

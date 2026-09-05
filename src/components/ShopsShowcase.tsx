import React, { useRef } from 'react';
import { 
  Store, 
  MapPin, 
  Star, 
  CheckCircle2, 
  ChevronLeft, 
  ChevronRight, 
  Phone, 
  ExternalLink,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { Shop } from '../types';

interface ShopsShowcaseProps {
  shops: Shop[];
  onSelectShop: (shopId: string) => void;
  onOpenOwnerAuth: () => void;
}

export const ShopsShowcase: React.FC<ShopsShowcaseProps> = ({
  shops,
  onSelectShop,
  onOpenOwnerAuth,
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -340, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 340, behavior: 'smooth' });
    }
  };

  return (
    <section id="registered-shops-section" className="py-16 bg-slate-50 border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-indigo-600 mb-2">
              <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
              <span>Independent Creators & Merchants</span>
            </div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
              <span className="w-2.5 h-8 bg-yellow-400 rounded-full shrink-0"></span>
              <span>Registered Neighborhood Shops</span>
            </h2>
            <p className="text-slate-600 text-sm mt-1 max-w-xl">
              Meet the passionate artisans and family owners behind the shelves. Every storefront is locally vetted and independently operated.
            </p>
          </div>

          {/* Carousel Navigation Buttons & Join CTA */}
          <div className="flex items-center gap-3">
            <button
              onClick={onOpenOwnerAuth}
              className="text-xs font-bold text-indigo-600 hover:text-indigo-700 hover:underline mr-2 cursor-pointer flex items-center gap-1"
            >
              <span>List your shop</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={scrollLeft}
              className="w-9 h-9 rounded-full bg-white border border-slate-200 text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-300 flex items-center justify-center shadow-xs transition-all cursor-pointer"
              title="Scroll left"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={scrollRight}
              className="w-9 h-9 rounded-full bg-white border border-slate-200 text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-300 flex items-center justify-center shadow-xs transition-all cursor-pointer"
              title="Scroll right"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Carousel / Responsive Horizontal Scroll */}
        <div
          ref={scrollContainerRef}
          className="flex gap-6 overflow-x-auto pb-4 pt-1 snap-x snap-mandatory scrollbar-none no-scrollbar"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {shops.map((shop) => (
            <div
              key={shop.id}
              id={`shop-card-${shop.id}`}
              className="min-w-[300px] sm:min-w-[340px] max-w-[340px] snap-start bg-white rounded-3xl border border-slate-100 hover:border-slate-200 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between overflow-hidden shadow-sm"
            >
              {/* Header Banner & Logo */}
              <div>
                <div className="h-28 w-full relative bg-slate-200">
                  <img
                    src={shop.bannerUrl}
                    alt={`${shop.name} banner`}
                    className="w-full h-full object-cover"
                    loading="lazy"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = shop.category === "Ladies' Hairstyles"
                        ? '/images/ladies_hairstyles.jpg'
                        : '/images/organic_beauty.jpg';
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/50 to-transparent" />
                  
                  {/* Category Pill on Banner */}
                  <span className="absolute top-2.5 right-2.5 bg-white/95 backdrop-blur-md text-indigo-700 text-[10px] font-extrabold px-3 py-1 rounded-full shadow-sm">
                    {shop.category}
                  </span>
                </div>

                <div className="px-5 pt-0 pb-4 relative">
                  {/* Avatar/Logo overlapping banner */}
                  <div className="-mt-10 mb-3 flex items-end justify-between">
                    <div className="w-16 h-16 rounded-2xl border-2 border-white shadow-md bg-white overflow-hidden shrink-0 relative">
                      <img
                        src={shop.logoUrl}
                        alt={shop.name}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute -bottom-0.5 -right-0.5 bg-emerald-500 w-3.5 h-3.5 rounded-full border-2 border-white"></div>
                    </div>
                    {shop.verified && (
                      <div className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-800 text-[11px] font-bold px-2.5 py-1 rounded-full border border-emerald-200">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Verified Shop</span>
                      </div>
                    )}
                  </div>

                  {/* Shop Name & Rating */}
                  <h3 className="text-base font-black text-slate-900 leading-snug group-hover:text-indigo-600 transition-colors">
                    {shop.name}
                  </h3>

                  <div className="flex items-center gap-2 mt-1 text-xs text-slate-500 font-medium">
                    <div className="flex items-center gap-1 font-bold text-slate-800">
                      <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                      <span>{shop.rating}</span>
                      <span className="text-slate-400 font-normal">({shop.reviewCount})</span>
                    </div>
                    <span>•</span>
                    <span className="flex items-center gap-1 truncate">
                      <MapPin className="w-3 h-3 text-pink-500 shrink-0" />
                      {shop.city}
                    </span>
                  </div>

                  {/* Tagline & Bio */}
                  <p className="text-xs text-indigo-600 font-semibold mt-2 line-clamp-1 italic">
                    "{shop.tagline}"
                  </p>

                  <p className="text-xs text-slate-500 mt-2 line-clamp-3 leading-relaxed font-normal">
                    {shop.bio}
                  </p>
                </div>
              </div>

              {/* Footer Details & Visit Shop Action */}
              <div className="px-5 py-3.5 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between">
                <div className="text-[11px] text-slate-500">
                  <span className="font-bold text-slate-800">{shop.productsCount}</span> Products listed
                </div>

                <button
                  type="button"
                  id={`visit-shop-btn-${shop.id}`}
                  onClick={() => onSelectShop(shop.id)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-xs font-bold rounded-full shadow-sm shadow-indigo-200 transition-all cursor-pointer hover:scale-[1.02]"
                >
                  <Store className="w-3.5 h-3.5" />
                  <span>View Storefront</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

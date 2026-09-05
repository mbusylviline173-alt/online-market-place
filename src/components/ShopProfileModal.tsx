import React from 'react';
import { 
  X, 
  Store, 
  MapPin, 
  Phone, 
  Mail, 
  Clock, 
  CheckCircle2, 
  Star, 
  MessageSquare, 
  Eye, 
  Package, 
  Tag, 
  ArrowLeft 
} from 'lucide-react';
import { Shop, Product } from '../types';

interface ShopProfileModalProps {
  shop: Shop | null;
  products: Product[];
  onClose: () => void;
  onSelectProduct: (product: Product) => void;
  onContactShop: (shop: Shop) => void;
}

export const ShopProfileModal: React.FC<ShopProfileModalProps> = ({
  shop,
  products,
  onClose,
  onSelectProduct,
  onContactShop,
}) => {
  if (!shop) return null;

  const shopProducts = products.filter((p) => p.shopId === shop.id);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-150">
      <div 
        className="relative bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          type="button"
          id="close-shop-profile-btn"
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-9 h-9 bg-white/90 hover:bg-white text-slate-700 hover:text-slate-900 rounded-full shadow-md flex items-center justify-center transition-colors cursor-pointer"
          aria-label="Close shop profile"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Shop Banner */}
        <div className="relative h-48 sm:h-64 w-full bg-slate-200 overflow-hidden">
          <img
            src={shop.bannerUrl}
            alt={`${shop.name} banner`}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-slate-950/20 to-transparent" />
          
          <div className="absolute bottom-4 left-6 right-6 flex items-end justify-between text-white">
            <div className="flex items-center gap-3">
              <span className="px-3.5 py-1 rounded-full bg-indigo-600/90 text-white text-xs font-bold backdrop-blur-md shadow-sm">
                {shop.category}
              </span>
              <span className="text-xs text-slate-300 hidden sm:inline font-medium">
                {shop.viewsCount.toLocaleString()} community supporters
              </span>
            </div>
          </div>
        </div>

        {/* Profile Info Header */}
        <div className="px-6 sm:px-8 pt-0 pb-6 relative">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between -mt-12 sm:-mt-14 mb-4 gap-4">
            <div className="flex items-end gap-4">
              <div className="w-24 h-24 rounded-2xl border-4 border-white shadow-xl bg-white overflow-hidden shrink-0 relative">
                <img
                  src={shop.logoUrl}
                  alt={shop.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute -bottom-0.5 -right-0.5 bg-emerald-500 w-4 h-4 rounded-full border-2 border-white"></div>
              </div>
              <div className="mb-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-2xl font-black text-slate-900">
                    {shop.name}
                  </h2>
                  {shop.verified && (
                    <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-800 text-xs font-bold px-2.5 py-0.5 rounded-full border border-emerald-200">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Verified Local Merchant</span>
                    </span>
                  )}
                </div>
                <p className="text-xs sm:text-sm text-indigo-600 font-semibold italic mt-0.5">
                  "{shop.tagline}"
                </p>
              </div>
            </div>

            {/* Contact Action */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                id="profile-contact-shop-btn"
                onClick={() => onContactShop(shop)}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white rounded-2xl text-xs sm:text-sm font-bold flex items-center gap-2 shadow-lg shadow-indigo-200 transition-all cursor-pointer hover:scale-[1.02]"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Contact Shop Owner</span>
              </button>
            </div>
          </div>

          {/* Rating & Contact Strip */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 py-3 border-y border-slate-100 text-xs text-slate-600 font-medium">
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 text-amber-500 fill-amber-500 shrink-0" />
              <div>
                <span className="font-bold text-slate-900">{shop.rating} / 5.0</span>
                <span className="text-slate-400"> ({shop.reviewCount} reviews)</span>
              </div>
            </div>

            <div className="flex items-center gap-2 truncate">
              <MapPin className="w-4 h-4 text-pink-500 shrink-0" />
              <span className="truncate" title={`${shop.address}, ${shop.city}`}>
                {shop.address}
              </span>
            </div>

            <div className="flex items-center gap-2 truncate">
              <Phone className="w-4 h-4 text-indigo-500 shrink-0" />
              <a href={`tel:${shop.phone}`} className="hover:underline text-slate-700 font-semibold">
                {shop.phone}
              </a>
            </div>

            <div className="flex items-center gap-2 truncate">
              <Clock className="w-4 h-4 text-amber-500 shrink-0" />
              <span className="truncate">{shop.openingHours}</span>
            </div>
          </div>

          {/* About / Bio */}
          <div className="mt-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
              About the Maker & Storefront
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
              {shop.bio}
            </p>
          </div>

          {/* Products from this Shop */}
          <div className="mt-8 pt-6 border-t border-slate-100">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                  <span className="w-2 h-5 bg-pink-500 rounded-full"></span>
                  <span>Products from {shop.name}</span>
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  {shopProducts.length} items available for pickup or local delivery
                </p>
              </div>
            </div>

            {shopProducts.length === 0 ? (
              <div className="text-center py-8 bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-slate-500 text-xs">
                No active products currently listed for this shop.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {shopProducts.map((p) => (
                  <div
                    key={p.id}
                    className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-xs hover:shadow-md transition-all group flex flex-col justify-between"
                  >
                    <div className="relative aspect-4/3 bg-slate-100 overflow-hidden">
                      <img
                        src={p.imageUrl}
                        alt={p.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                      {p.discountPercent && (
                        <div className="absolute top-2 left-2 bg-pink-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-xs">
                          -{p.discountPercent}% OFF
                        </div>
                      )}
                    </div>

                    <div className="p-3.5 flex-1 flex flex-col justify-between">
                      <div>
                        <h4 className="text-xs font-bold text-slate-900 line-clamp-2 leading-snug group-hover:text-indigo-600 transition-colors">
                          {p.title}
                        </h4>
                        <div className="flex items-center gap-1 mt-1 text-[11px] text-slate-500">
                          <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                          <span>{p.rating}</span>
                        </div>
                      </div>

                      <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between">
                        <span className="text-sm font-extrabold text-indigo-600">
                          {p.price.toLocaleString()} CFAF
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            onClose();
                            onSelectProduct(p);
                          }}
                          className="px-3 py-1 bg-indigo-50 hover:bg-indigo-600 text-indigo-600 hover:text-white text-xs font-bold rounded-xl transition-all cursor-pointer"
                        >
                          View
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

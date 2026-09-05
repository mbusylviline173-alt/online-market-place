import React, { useState, useEffect } from 'react';
import { 
  X, 
  Store, 
  Star, 
  Tag, 
  MapPin, 
  CheckCircle2, 
  Truck, 
  MessageSquare, 
  Share2, 
  ExternalLink,
  ShieldCheck,
  Plus,
  Minus,
  ShoppingBag
} from 'lucide-react';
import { Product, Shop } from '../types';

interface ProductDetailModalProps {
  product: Product | null;
  shop: Shop | undefined;
  onClose: () => void;
  onSelectShop: (shopId: string) => void;
  onContactShop: (product: Product, quantity?: number) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  shop,
  onClose,
  onSelectShop,
  onContactShop,
}) => {
  const [quantity, setQuantity] = useState(1);

  // Reset quantity on product change
  useEffect(() => {
    setQuantity(1);
  }, [product?.id]);

  if (!product) return null;

  const isBottleProduct = 
    product.title.toLowerCase().includes('bottle') || 
    product.title.toLowerCase().includes('elixir') || 
    product.title.toLowerCase().includes('honey') ||
    product.tags.some(t => t.toLowerCase().includes('bottle'));

  const handleIncrement = () => {
    if (quantity < (product.stock || 99)) {
      setQuantity(q => q + 1);
    }
  };

  const handleDecrement = () => {
    if (quantity > 1) {
      setQuantity(q => q - 1);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-150">
      <div 
        className="relative bg-white rounded-3xl max-w-3xl w-full overflow-hidden shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          type="button"
          id="close-product-modal-btn"
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-9 h-9 bg-white/90 hover:bg-white text-slate-700 hover:text-slate-900 rounded-full shadow-md flex items-center justify-center transition-colors cursor-pointer"
          aria-label="Close dialog"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Image & Badges */}
          <div className="relative bg-slate-100 min-h-[320px] md:min-h-[460px] flex items-center justify-center overflow-hidden">
            <img
              src={product.imageUrl}
              alt={product.title}
              className="w-full h-full object-cover"
            />
            {product.discountPercent && (
              <div className="absolute top-4 left-4 bg-pink-500 text-white text-xs font-black px-3 py-1 rounded-full shadow-md flex items-center gap-1">
                <Tag className="w-3.5 h-3.5" />
                <span>-{product.discountPercent}% OFF</span>
              </div>
            )}
          </div>

          {/* Details & Actions */}
          <div className="p-6 md:p-8 flex flex-col justify-between">
            <div>
              {/* Shop Badge */}
              <div className="flex items-center justify-between gap-2 mb-3">
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onSelectShop(product.shopId);
                  }}
                  className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-900 hover:bg-indigo-100 text-xs font-bold transition-colors cursor-pointer"
                >
                  <Store className="w-3.5 h-3.5 text-indigo-600" />
                  <span>{product.shopName}</span>
                  <ExternalLink className="w-3 h-3 text-indigo-500" />
                </button>

                <span className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">
                  {product.category}
                </span>
              </div>

              {/* Title */}
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 leading-tight">
                {product.title}
              </h2>

              {/* Rating & Stock */}
              <div className="flex items-center gap-3 my-3 text-xs text-slate-600 font-medium">
                <div className="flex items-center gap-1 font-bold text-slate-800">
                  <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                  <span>{product.rating}</span>
                  <span className="text-slate-400 font-normal">({product.reviewCount} reviews)</span>
                </div>
                <span>•</span>
                <span className="text-indigo-600 font-bold">
                  {product.stock > 0 ? `${product.stock} in stock` : 'Inquire for batch'}
                </span>
              </div>

              {/* Price */}
              <div className="flex items-baseline gap-2 my-4">
                <span className="text-3xl font-black text-indigo-600">
                  {product.price.toLocaleString()} CFAF
                </span>
                {product.originalPrice && (
                  <span className="text-base text-slate-400 line-through">
                    {product.originalPrice.toLocaleString()} CFAF
                  </span>
                )}
              </div>

              {/* Description */}
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-4 font-normal">
                {product.description}
              </p>

              {/* Tags */}
              <div className="flex flex-wrap gap-1.5 mb-6">
                {product.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2.5 py-0.5 rounded-full bg-slate-100 hover:bg-pink-50 hover:text-pink-600 text-slate-600 text-[11px] font-semibold transition-colors"
                  >
                    #{tag}
                  </span>
                ))}
              </div>

              {/* Local Logistics Value */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 text-xs space-y-2 mb-6">
                <div className="flex items-center gap-2 text-slate-700">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span><strong>Curbside / In-Store Pickup:</strong> Ready within 2 hours at shop location.</span>
                </div>
                {product.freeLocalDelivery && (
                  <div className="flex items-center gap-2 text-slate-700">
                    <Truck className="w-4 h-4 text-pink-500 shrink-0" />
                    <span><strong>Neighborhood Delivery:</strong> Free local drop-off on orders over 20,000 CFAF.</span>
                  </div>
                )}
              </div>
            </div>

            {/* Quantity Selector & Reservation Controls */}
            <div className="pt-3 pb-4 border-t border-slate-100 space-y-3">
              <div className="flex items-center justify-between">
                <div className="text-xs">
                  <span className="font-bold text-slate-800 block">
                    {isBottleProduct ? 'Bottles to Reserve:' : 'Select Quantity:'}
                  </span>
                  <span className="text-[11px] text-slate-400">
                    Max {product.stock} available in stock
                  </span>
                </div>

                <div className="flex items-center gap-3 bg-slate-100 p-1 rounded-xl border border-slate-200">
                  <button
                    type="button"
                    id="qty-minus-btn"
                    onClick={handleDecrement}
                    disabled={quantity <= 1}
                    className="w-7 h-7 rounded-lg bg-white disabled:opacity-40 hover:bg-slate-50 text-slate-700 font-bold flex items-center justify-center shadow-xs transition-all cursor-pointer disabled:cursor-not-allowed"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>

                  <span 
                    id="qty-display"
                    className="w-8 text-center text-xs font-black text-slate-900"
                  >
                    {quantity}
                  </span>

                  <button
                    type="button"
                    id="qty-plus-btn"
                    onClick={handleIncrement}
                    disabled={quantity >= product.stock}
                    className="w-7 h-7 rounded-lg bg-white disabled:opacity-40 hover:bg-slate-50 text-slate-700 font-bold flex items-center justify-center shadow-xs transition-all cursor-pointer disabled:cursor-not-allowed"
                    aria-label="Increase quantity"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-2.5 pt-1">
                <button
                  type="button"
                  id="add-reserve-product-btn"
                  onClick={() => onContactShop(product, quantity)}
                  className="flex-1 py-3 px-4 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white rounded-2xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-lg shadow-indigo-200 transition-all cursor-pointer hover:scale-[1.01]"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>
                    {isBottleProduct 
                      ? `Add / Reserve ${quantity} Bottle${quantity > 1 ? 's' : ''} (${(product.price * quantity).toLocaleString()} CFAF)`
                      : `Add / Reserve Item (${(product.price * quantity).toLocaleString()} CFAF)`
                    }
                  </span>
                </button>

                <button
                  type="button"
                  id="contact-shop-owner-btn"
                  onClick={() => onContactShop(product, 1)}
                  className="py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-2xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
                  title="Ask shop owner a direct question"
                >
                  <MessageSquare className="w-4 h-4 text-slate-600" />
                  <span>Ask Question</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

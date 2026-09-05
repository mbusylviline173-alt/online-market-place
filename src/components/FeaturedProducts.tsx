import React, { useState } from 'react';
import { 
  Star, 
  MapPin, 
  Store, 
  Tag, 
  Eye, 
  CheckCircle2, 
  SlidersHorizontal,
  PackageX,
  Sparkles
} from 'lucide-react';
import { Product, Shop } from '../types';

interface FeaturedProductsProps {
  products: Product[];
  selectedCategory: string;
  onSelectCategory: (cat: string) => void;
  searchQuery: string;
  onClearSearch: () => void;
  onSelectProduct: (product: Product) => void;
  onSelectShop: (shopId: string) => void;
}

export const FeaturedProducts: React.FC<FeaturedProductsProps> = ({
  products,
  selectedCategory,
  onSelectCategory,
  searchQuery,
  onClearSearch,
  onSelectProduct,
  onSelectShop,
}) => {
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc' | 'rating'>('featured');
  const [onlyDiscounted, setOnlyDiscounted] = useState(false);

  // Filter & Sort Logic
  const filteredProducts = products.filter((p) => {
    // Category match
    if (selectedCategory !== 'All' && p.category !== selectedCategory) {
      return false;
    }
    // Search match
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const titleMatch = p.title.toLowerCase().includes(q);
      const descMatch = p.description.toLowerCase().includes(q);
      const shopMatch = p.shopName.toLowerCase().includes(q);
      const tagMatch = p.tags.some(t => t.toLowerCase().includes(q));
      if (!titleMatch && !descMatch && !shopMatch && !tagMatch) return false;
    }
    // Discount filter
    if (onlyDiscounted && !p.discountPercent) {
      return false;
    }
    return true;
  }).sort((a, b) => {
    if (sortBy === 'price-asc') return a.price - b.price;
    if (sortBy === 'price-desc') return b.price - a.price;
    if (sortBy === 'rating') return b.rating - a.rating;

    // Default 'featured': Newly created/uploaded products appear FIRST at the front of the main section!
    const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    if (bTime !== aTime) {
      return bTime - aTime;
    }

    return (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0);
  });

  return (
    <section id="marketplace-products" className="py-16 bg-white scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header & Controls Bar */}
        <div className="flex flex-col md:flex-row md:items-end justify-between pb-6 border-b border-slate-100 gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-indigo-600 mb-1.5">
              <Sparkles className="w-3.5 h-3.5 text-pink-500" />
              <span>Direct From Local Shelves</span>
            </div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
              <span className="w-2.5 h-8 bg-pink-500 rounded-full shrink-0"></span>
              <span>Featured Neighborhood Goods</span>
            </h2>
            <p className="text-slate-500 text-sm mt-1">
              Showing {filteredProducts.length} unique products from local registered workshops & independent stores.
            </p>
          </div>

          {/* Controls: Discount toggle & Sort */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setOnlyDiscounted(!onlyDiscounted)}
              className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-full border transition-all cursor-pointer ${
                onlyDiscounted
                  ? 'bg-pink-50 text-pink-700 border-pink-300 shadow-xs'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
            >
              <Tag className="w-3.5 h-3.5 text-pink-500" />
              <span>Special Offers Only</span>
            </button>

            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-full px-4 py-1.5">
              <SlidersHorizontal className="w-3.5 h-3.5 text-indigo-500" />
              <label htmlFor="products-sort-select" className="text-xs text-slate-500 font-semibold">Sort:</label>
              <select
                id="products-sort-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-transparent text-xs text-slate-800 font-bold outline-none cursor-pointer"
              >
                <option value="featured">Recommended & Featured</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
              </select>
            </div>
          </div>
        </div>

        {/* Active Filter Tags */}
        {(selectedCategory !== 'All' || searchQuery || onlyDiscounted) && (
          <div className="flex flex-wrap items-center gap-2 mb-8 bg-slate-50 p-3 rounded-2xl border border-slate-100 text-xs">
            <span className="font-bold text-slate-600">Active filters:</span>
            {selectedCategory !== 'All' && (
              <span className="inline-flex items-center gap-1 bg-white border border-indigo-200 text-indigo-800 font-semibold px-3 py-1 rounded-full shadow-xs">
                Category: {selectedCategory}
                <button
                  onClick={() => onSelectCategory('All')}
                  className="hover:text-indigo-950 font-bold ml-1"
                >
                  ×
                </button>
              </span>
            )}
            {searchQuery && (
              <span className="inline-flex items-center gap-1 bg-white border border-slate-200 text-slate-800 font-semibold px-3 py-1 rounded-full shadow-xs">
                Search: "{searchQuery}"
                <button
                  onClick={onClearSearch}
                  className="hover:text-slate-950 font-bold ml-1"
                >
                  ×
                </button>
              </span>
            )}
            {onlyDiscounted && (
              <span className="inline-flex items-center gap-1 bg-white border border-pink-200 text-pink-700 font-semibold px-3 py-1 rounded-full shadow-xs">
                On Sale
                <button
                  onClick={() => setOnlyDiscounted(false)}
                  className="hover:text-pink-950 font-bold ml-1"
                >
                  ×
                </button>
              </span>
            )}
            <button
              onClick={() => {
                onSelectCategory('All');
                onClearSearch();
                setOnlyDiscounted(false);
              }}
              className="text-xs text-indigo-600 hover:text-indigo-700 hover:underline font-bold ml-auto"
            >
              Reset All Filters
            </button>
          </div>
        )}

        {/* Empty State */}
        {filteredProducts.length === 0 ? (
          <div className="text-center py-16 px-4 bg-slate-50 rounded-3xl border border-dashed border-slate-300 max-w-lg mx-auto my-6">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-4">
              <PackageX className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-1">No matching products found</h3>
            <p className="text-xs text-slate-500 mb-6 max-w-sm mx-auto font-medium">
              We couldn’t find items matching your search criteria. Try removing filters or searching for terms like "honey", "ceramics", or "linen".
            </p>
            <button
              onClick={() => {
                onSelectCategory('All');
                onClearSearch();
                setOnlyDiscounted(false);
              }}
              className="px-5 py-2.5 bg-indigo-600 text-white rounded-full text-xs font-bold hover:bg-indigo-700 transition-all shadow-md shadow-indigo-200 cursor-pointer"
            >
              Clear Filters & View All Products
            </button>
          </div>
        ) : (
          /* Products Grid with Vibrant Rounded Cards */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <article
                key={product.id}
                id={`product-card-${product.id}`}
                className="group flex flex-col bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-md hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300"
              >
                {/* Image Container with Badges */}
                <div className="relative aspect-4/3 w-full bg-slate-100 overflow-hidden">
                  <img
                    src={product.imageUrl}
                    alt={product.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = product.category === 'Organic Beauty'
                        ? '/images/organic_beauty.jpg'
                        : product.category === "Ladies' Hairstyles"
                        ? '/images/ladies_hairstyles.jpg'
                        : 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80';
                    }}
                  />

                  {/* New Arrival Tag */}
                  {product.createdAt && (
                    <div className="absolute top-3 left-3 bg-emerald-600 text-white text-[10px] font-black uppercase tracking-wide px-2.5 py-1 rounded-full shadow-md flex items-center gap-1 z-10">
                      <Sparkles className="w-3 h-3" />
                      <span>New Arrival</span>
                    </div>
                  )}

                  {/* Discount Tag (Vibrant Pink Pill) */}
                  {product.discountPercent && (
                    <div className="absolute top-3 right-3 bg-pink-500 text-white text-[10px] font-black px-2.5 py-1 rounded-full shadow-md flex items-center gap-1">
                      <Tag className="w-3 h-3" />
                      <span>-{product.discountPercent}% OFF</span>
                    </div>
                  )}

                  {/* Featured Curator Badge */}
                  {product.isFeatured && !product.discountPercent && (
                    <div className="absolute top-3 right-3 bg-indigo-600 text-white text-[10px] font-extrabold uppercase tracking-wide px-2.5 py-1 rounded-full shadow-md">
                      Featured
                    </div>
                  )}

                  {/* Pickup Badge */}
                  {product.pickupAvailable && (
                    <div className="absolute bottom-2.5 left-3 bg-white/95 backdrop-blur-md text-slate-800 text-[10px] font-bold px-2.5 py-1 rounded-full shadow-sm flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      <span>Local Pickup</span>
                    </div>
                  )}
                </div>

                {/* Card Body */}
                <div className="p-4.5 flex-1 flex flex-col justify-between">
                  <div>
                    {/* Shop Name Badge */}
                    <div className="mb-2">
                      <button
                        type="button"
                        onClick={() => onSelectShop(product.shopId)}
                        className="bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-600 px-2 py-0.5 rounded text-[10px] inline-flex items-center gap-1.5 font-bold tracking-wider uppercase transition-colors cursor-pointer"
                        title={`View ${product.shopName} profile`}
                      >
                        <Store className="w-3 h-3 text-indigo-600" />
                        <span className="truncate max-w-[160px]">{product.shopName}</span>
                      </button>
                    </div>

                    {/* Product Title */}
                    <h3 className="text-sm font-bold text-slate-900 leading-snug line-clamp-2 group-hover:text-indigo-600 transition-colors">
                      {product.title}
                    </h3>

                    {/* Category & Rating */}
                    <div className="flex items-center justify-between text-xs text-slate-500 mt-2">
                      <span className="text-[11px] font-semibold text-slate-400">
                        {product.category}
                      </span>
                      <div className="flex items-center gap-1 font-bold text-slate-700">
                        <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                        <span>{product.rating}</span>
                        <span className="text-slate-400 font-normal">({product.reviewCount})</span>
                      </div>
                    </div>
                  </div>

                  {/* Price & View Details Action */}
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                    <div>
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-xl font-extrabold text-indigo-600">
                          {product.price.toLocaleString()} CFA
                        </span>
                        {product.originalPrice && (
                          <span className="text-xs text-slate-400 line-through">
                            {product.originalPrice.toLocaleString()} CFA
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-400 block -mt-0.5 font-medium">
                        {product.stock > 0 ? `${product.stock} in stock` : 'Made to order'}
                      </span>
                    </div>

                    {/* View Details Action Button (Vibrant Indigo Button) */}
                    <button
                      type="button"
                      id={`view-details-${product.id}`}
                      onClick={() => onSelectProduct(product)}
                      className="bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white px-3 py-2 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>View Details</span>
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

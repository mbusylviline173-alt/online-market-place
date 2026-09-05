import React from 'react';
import { 
  Palette, 
  Shirt, 
  Apple, 
  Sparkles, 
  Cpu, 
  Home, 
  Scissors,
  ArrowRight,
  ShoppingBag
} from 'lucide-react';
import { CATEGORIES_DATA } from '../data/mockData';

interface CategoriesSectionProps {
  selectedCategory: string;
  onSelectCategory: (categoryName: string) => void;
}

export const CategoriesSection: React.FC<CategoriesSectionProps> = ({
  selectedCategory,
  onSelectCategory,
}) => {
  const getCategoryIcon = (iconName: string) => {
    switch (iconName) {
      case 'Palette':
        return <Palette className="w-6 h-6" />;
      case 'Shirt':
        return <Shirt className="w-6 h-6" />;
      case 'Apple':
        return <Apple className="w-6 h-6" />;
      case 'Sparkles':
        return <Sparkles className="w-6 h-6" />;
      case 'Scissors':
        return <Scissors className="w-6 h-6" />;
      case 'Cpu':
        return <Cpu className="w-6 h-6" />;
      case 'Home':
        return <Home className="w-6 h-6" />;
      default:
        return <ShoppingBag className="w-6 h-6" />;
    }
  };

  const handleCategoryClick = (categoryName: string) => {
    onSelectCategory(categoryName);
    const element = document.getElementById('marketplace-products');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const getCategoryColorConfig = (slug: string) => {
    switch (slug) {
      case 'handmade-crafts':
        return {
          hoverBorder: 'hover:border-pink-400',
          accentText: 'text-pink-600',
          iconBg: 'bg-pink-100 text-pink-600',
          activeBg: 'bg-pink-600 text-white',
        };
      case 'fashion-apparel':
        return {
          hoverBorder: 'hover:border-purple-400',
          accentText: 'text-purple-600',
          iconBg: 'bg-purple-100 text-purple-600',
          activeBg: 'bg-purple-600 text-white',
        };
      case 'ladies-hairstyles':
        return {
          hoverBorder: 'hover:border-fuchsia-400',
          accentText: 'text-fuchsia-600',
          iconBg: 'bg-fuchsia-100 text-fuchsia-600',
          activeBg: 'bg-fuchsia-600 text-white',
        };
      case 'artisanal-groceries':
        return {
          hoverBorder: 'hover:border-emerald-400',
          accentText: 'text-emerald-600',
          iconBg: 'bg-emerald-100 text-emerald-600',
          activeBg: 'bg-emerald-600 text-white',
        };
      case 'beauty':
      case 'organic-beauty':
        return {
          hoverBorder: 'hover:border-rose-400',
          accentText: 'text-rose-600',
          iconBg: 'bg-rose-100 text-rose-600',
          activeBg: 'bg-rose-600 text-white',
        };
      case 'electronics-gadgets':
        return {
          hoverBorder: 'hover:border-yellow-400',
          accentText: 'text-amber-600',
          iconBg: 'bg-yellow-100 text-amber-700',
          activeBg: 'bg-yellow-500 text-slate-900',
        };
      case 'home-living':
      default:
        return {
          hoverBorder: 'hover:border-blue-400',
          accentText: 'text-blue-600',
          iconBg: 'bg-blue-100 text-blue-600',
          activeBg: 'bg-blue-600 text-white',
        };
    }
  };

  return (
    <section className="py-16 bg-slate-50/80 border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-indigo-600 mb-2">
              <span className="w-1.5 h-1.5 rounded-full bg-pink-500"></span>
              <span>Curated Departments</span>
            </div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
              <span className="w-2 h-8 bg-pink-500 rounded-full shrink-0"></span>
              <span>Explore Local Shop Categories</span>
            </h2>
            <p className="text-slate-600 text-sm mt-1 max-w-xl">
              Browse independent merchants categorized by their craft. Handcrafted, fresh, and ethically made within your area.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleCategoryClick('All')}
              className={`px-5 py-2 text-xs font-bold rounded-full transition-all cursor-pointer ${
                selectedCategory === 'All'
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200'
                  : 'bg-white text-slate-700 hover:bg-slate-100 hover:text-indigo-600 border border-slate-200'
              }`}
            >
              Show All Categories
            </button>
          </div>
        </div>

        {/* Categories Grid with Vibrant Hover Borders */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {CATEGORIES_DATA.map((cat) => {
            const isSelected = selectedCategory === cat.name;
            const colors = getCategoryColorConfig(cat.slug);

            return (
              <div
                key={cat.id}
                id={`category-card-${cat.slug}`}
                onClick={() => handleCategoryClick(cat.name)}
                className={`group relative overflow-hidden rounded-3xl bg-white border-2 cursor-pointer transition-all duration-300 hover:-translate-y-1 ${
                  isSelected
                    ? 'border-indigo-600 shadow-xl ring-4 ring-indigo-500/15'
                    : `border-transparent hover:shadow-xl ${colors.hoverBorder} shadow-sm`
                }`}
              >
                {/* Visual Top Preview */}
                <div className="h-36 w-full overflow-hidden relative bg-slate-100">
                  <img
                    src={cat.imageUrl}
                    alt={cat.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = cat.name === "Ladies' Hairstyles"
                        ? '/images/ladies_hairstyles.jpg'
                        : '/images/organic_beauty.jpg';
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-slate-900/20 to-transparent" />
                  
                  {/* Category Floating Icon */}
                  <div className={`absolute bottom-3 left-4 w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg transition-all ${
                    isSelected 
                      ? colors.activeBg
                      : `${colors.iconBg} group-hover:scale-110`
                  }`}>
                    {getCategoryIcon(cat.iconName)}
                  </div>

                  {/* Item Count Badge */}
                  <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-md px-3 py-1 rounded-full text-[11px] font-bold text-slate-800 shadow-sm">
                    {cat.itemCount} items listed
                  </div>
                </div>

                {/* Content */}
                <div className="p-5 pt-4">
                  <div className="flex items-center justify-between">
                    <h3 className={`text-base font-bold transition-colors ${
                      isSelected ? 'text-indigo-600 font-black' : `text-slate-900 group-hover:${colors.accentText}`
                    }`}>
                      {cat.name}
                    </h3>
                    <ArrowRight className={`w-4 h-4 transition-transform group-hover:translate-x-1.5 ${
                      isSelected ? 'text-indigo-600' : 'text-slate-400 group-hover:text-indigo-600'
                    }`} />
                  </div>
                  
                  <p className="text-xs text-slate-500 mt-1.5 leading-relaxed line-clamp-2 font-medium">
                    {cat.description}
                  </p>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className={`font-bold transition-colors ${
                      isSelected ? 'text-indigo-600' : 'text-slate-600 group-hover:text-indigo-600'
                    }`}>
                      {isSelected ? 'Currently Selected' : 'Browse Department'}
                    </span>
                    <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                      Pickup Available
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

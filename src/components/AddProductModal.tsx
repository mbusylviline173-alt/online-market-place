import React, { useState, useRef } from 'react';
import { 
  X, 
  Plus, 
  Package, 
  Coins, 
  Image as ImageIcon, 
  Tag, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles,
  Layers,
  Truck,
  UploadCloud,
  FileImage,
  Trash2,
  RefreshCw,
  HardDrive,
  Link,
  Loader2
} from 'lucide-react';
import { Product, ProductCategory, Shop, HAIRSTYLE_STYLES_DATA, HairstyleStyle } from '../types';
import { uploadProductImage, recordUploadedFile, auth } from '../services/firebase';
import { compressAndOptimizeImage } from '../utils/imageCompressor';

interface AddProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddProduct: (product: Product) => void;
  onViewMarketplace?: (product: Product) => void;
  shop: Shop;
}

// Quick image presets for common artisan products, wigs, and goods!
const PRESET_TEMPLATES = [
  {
    label: 'Bone Straight Wig',
    icon: '💇‍♀️',
    title: 'Bone Straight 100% Virgin Hair HD Lace Wig (28 Inch)',
    category: "Ladies' Hairstyles" as ProductCategory,
    price: 68000,
    stock: 15,
    description: '100% Virgin Human Hair Bone Straight Wig with pre-plucked undetectable HD lace frontal and silky glass finish.',
    imageUrl: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=600&q=80',
    tags: ['Bone Straight Wigs', 'Bone Straight', 'Wig', 'Virgin Hair', 'HD Lace', 'Ladies Hairstyle']
  },
  {
    label: 'Knotless Braids',
    icon: '✨',
    title: 'Bohemian Knotless Box Braids (Full Head Styling Pack)',
    category: "Ladies' Hairstyles" as ProductCategory,
    price: 35000,
    stock: 15,
    description: 'Tension-free lightweight knotless box braids with soft goddess curls at the ends. Gentle on scalp and edges.',
    imageUrl: '/images/ladies_hairstyles.jpg',
    tags: ['Knotless Box Braids', 'Knotless Braids', 'Bohemian', 'Goddess Curls', 'Ladies Hairstyle']
  },
  {
    label: 'Passion Twists',
    icon: '👑',
    title: 'Caramel Honey Bohemian Passion Twists (Install Kit)',
    category: "Ladies' Hairstyles" as ProductCategory,
    price: 28000,
    stock: 18,
    description: 'Silky bohemian water-wave passion twists with bouncy spiral curl tips in warm honey espresso tones.',
    imageUrl: '/images/passion_twists.jpg',
    tags: ['Passion & Spring Twists', 'Passion Twists', 'Twists', 'Curls', 'Ladies Hairstyle']
  },
  {
    label: 'HD Lace Frontal',
    icon: '💎',
    title: 'Melted Swiss HD Lace Frontal 13x6 (Body Wave)',
    category: "Ladies' Hairstyles" as ProductCategory,
    price: 38000,
    stock: 14,
    description: 'Ultra-thin, melt-into-skin 13x6 transparent Swiss HD lace frontal with tiny bleached micro-knots.',
    imageUrl: 'https://images.unsplash.com/photo-1560869713-7d0a29430803?auto=format&fit=crop&w=600&q=80',
    tags: ['HD Lace Frontals & Closures', 'HD Lace', 'Lace Frontal', 'Body Wave', 'Ladies Hairstyle']
  },
  {
    label: 'Goddess Locs',
    icon: '🌿',
    title: 'Goddess Butterfly Bohemian Locs (26 Inch)',
    category: "Ladies' Hairstyles" as ProductCategory,
    price: 36000,
    stock: 12,
    description: 'Featherweight distressed bohemian butterfly faux locs wrapped with curly human hair tendrils.',
    imageUrl: 'https://images.unsplash.com/photo-1589156280159-27698a70f29e?auto=format&fit=crop&w=600&q=80',
    tags: ['Goddess & Bohemian Locs', 'Goddess Locs', 'Butterfly Locs', 'Locs', 'Ladies Hairstyle']
  },
  {
    label: 'Sleek Ponytail',
    icon: '🎀',
    title: 'Sleek Wrap-Around Virgin Hair Ponytail (24 Inch)',
    category: "Ladies' Hairstyles" as ProductCategory,
    price: 24000,
    stock: 20,
    description: 'Instant glam drawstring wrap-around ponytail extension made with 100% human virgin hair with secure clip combs.',
    imageUrl: 'https://images.unsplash.com/photo-1519699047748-de8e457a634e?auto=format&fit=crop&w=600&q=80',
    tags: ['Ponytails & Sleek Updos', 'Ponytail', 'Drawstring', 'Virgin Hair', 'Ladies Hairstyle']
  },
  {
    label: 'Dropper Bottle / Elixir',
    icon: '🧴',
    title: 'Amber Glass Botanical Elixir Bottle (50ml)',
    category: 'Organic Beauty' as ProductCategory,
    price: 22000,
    stock: 15,
    description: 'Cold-pressed botanical serum packaged in UV-protective amber glass bottle with precision glass dropper pipette.',
    imageUrl: '/images/organic_beauty.jpg',
    tags: ['Bottle', 'Elixir', 'Organic', 'Botanical']
  },
  {
    label: 'Honey Bottle / Jar',
    icon: '🍯',
    title: 'Raw Wildflower Honey Glass Bottle (16oz)',
    category: 'Artisanal Groceries' as ProductCategory,
    price: 12000,
    stock: 20,
    description: 'Unfiltered, local wildflower blossom honey poured fresh in reusable vintage-style glass bottle with cork seal.',
    imageUrl: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=600&q=80',
    tags: ['Bottle', 'Raw Honey', 'Local', 'Artisan']
  },
  {
    label: 'Ceramic Stoneware',
    icon: '🏺',
    title: 'Hand-Thrown Speckled Stoneware Mug',
    category: 'Handmade & Crafts' as ProductCategory,
    price: 18000,
    stock: 8,
    description: 'Wheel-thrown ceramic mug with matte chalk glaze and raw terracotta base. Microwave and dishwasher safe.',
    imageUrl: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=600&q=80',
    tags: ['Ceramics', 'Handmade', 'Coffee', 'Stoneware']
  }
];

const CATEGORIES: ProductCategory[] = [
  'Handmade & Crafts',
  'Fashion & Apparel',
  "Ladies' Hairstyles",
  'Artisanal Groceries',
  'Organic Beauty',
  'Electronics & Gadgets',
  'Home & Living',
];

export const AddProductModal: React.FC<AddProductModalProps> = ({
  isOpen,
  onClose,
  onAddProduct,
  onViewMarketplace,
  shop,
}) => {
  const [title, setTitle] = useState('Bone Straight Wig');
  const [category, setCategory] = useState<ProductCategory>(shop.category || 'Fashion & Apparel');
  const [selectedHairstyleStyle, setSelectedHairstyleStyle] = useState<HairstyleStyle | null>('Bone Straight Wigs');
  const [price, setPrice] = useState('55000');
  const [originalPrice, setOriginalPrice] = useState('65000');
  const [stock, setStock] = useState('20');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [pickupAvailable, setPickupAvailable] = useState(true);
  const [freeLocalDelivery, setFreeLocalDelivery] = useState(false);
  const [isFeatured, setIsFeatured] = useState(true);

  // Device Image Upload States & Handlers
  const [uploadSource, setUploadSource] = useState<'device' | 'url' | 'presets'>('device');
  const [isDragging, setIsDragging] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [uploadedFileSize, setUploadedFileSize] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [lastCreatedProduct, setLastCreatedProduct] = useState<Product | null>(null);

  if (!isOpen) return null;

  const handleProcessFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setFormError('Please select a valid image file (PNG, JPG, WEBP, or GIF).');
      return;
    }
    if (file.size > 25 * 1024 * 1024) {
      setFormError('Image size exceeds 25MB limit. Please choose a smaller photo.');
      return;
    }

    setFormError(null);
    setUploadedFileName(file.name);

    // 1. Instantaneous local blob preview (0 milliseconds!)
    const instantBlobUrl = URL.createObjectURL(file);
    setImageUrl(instantBlobUrl);

    // Initial size indicator
    const sizeInKb = file.size / 1024;
    const formatted = sizeInKb > 1024 
      ? `${(sizeInKb / 1024).toFixed(1)} MB` 
      : `${Math.round(sizeInKb)} KB`;
    setUploadedFileSize(formatted);
    setIsUploadingImage(true);

    try {
      // 2. Immediate client-side canvas compression (<50ms)
      // Produces an optimized, lightweight e-commerce image (~120KB)
      const optimized = await compressAndOptimizeImage(file, 1200, 0.85);
      setImageUrl(optimized.dataUrl);
      setUploadedFileSize(`${optimized.formattedSize} (High-Definition)`);

      // 3. Fast sync to Cloud Storage with automatic fallback
      const finalUrl = await uploadProductImage(file);
      setImageUrl(finalUrl);

      // Record uploaded file in Firestore for this user (tracked for admin dashboard)
      if (auth.currentUser) {
        recordUploadedFile({
          userId: auth.currentUser.uid,
          userEmail: auth.currentUser.email || undefined,
          fileName: file.name,
          fileSize: optimized.sizeBytes,
          fileType: 'image/jpeg',
          downloadUrl: finalUrl,
          purpose: 'product_image',
          associatedProductId: title || 'New Product',
        }).catch((e) => console.warn("Could not log file in Firestore:", e));
      }
    } catch (err: any) {
      console.warn("Image processing note:", err);
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleProcessFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleProcessFile(file);
    }
  };

  const handleRemoveImage = () => {
    setImageUrl('');
    setUploadedFileName(null);
    setUploadedFileSize(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleApplyPreset = (preset: typeof PRESET_TEMPLATES[0]) => {
    setTitle(preset.title);
    setCategory(preset.category);
    setPrice(preset.price.toString());
    setStock(preset.stock.toString());
    setDescription(preset.description);
    setImageUrl(preset.imageUrl);
    setUploadedFileName(preset.label);
    setUploadedFileSize('Template Photo');
    setTagsInput(preset.tags.join(', '));
    setFormError(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const parsedPrice = parseFloat(price);
    const parsedStock = parseInt(stock, 10);
    const parsedOriginalPrice = originalPrice.trim() ? parseFloat(originalPrice) : undefined;

    if (!title.trim()) {
      setFormError('Please enter a product title.');
      return;
    }

    if (isNaN(parsedPrice) || parsedPrice <= 0) {
      setFormError('Please enter a valid price greater than 0 CFA.');
      return;
    }

    if (isNaN(parsedStock) || parsedStock < 0) {
      setFormError('Please enter a valid stock quantity.');
      return;
    }

    // Default image if blank
    const finalImageUrl = imageUrl.trim() || '/images/organic_beauty.jpg';

    const tags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    if (tags.length === 0) {
      tags.push(category, 'Local');
    }

    let discountPercent: number | undefined;
    if (parsedOriginalPrice && parsedOriginalPrice > parsedPrice) {
      discountPercent = Math.round(((parsedOriginalPrice - parsedPrice) / parsedOriginalPrice) * 100);
    }

    const newProduct: Product = {
      id: `prod-${Date.now()}`,
      shopId: shop.id,
      shopName: shop.name,
      shopLogo: shop.logoUrl,
      title: title.trim(),
      description: description.trim() || `Handcrafted with care by ${shop.name}. Available for local neighborhood pickup.`,
      price: parsedPrice,
      originalPrice: parsedOriginalPrice,
      discountPercent,
      category,
      imageUrl: finalImageUrl,
      stock: parsedStock,
      rating: 5.0,
      reviewCount: 1,
      isFeatured: true,
      tags,
      pickupAvailable,
      freeLocalDelivery,
      createdAt: new Date().toISOString(),
      ownerId: auth.currentUser?.uid,
    };

    onAddProduct(newProduct);
    setIsSubmitted(true);
    setTimeout(() => {
      setIsSubmitted(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-150">
      <div 
        className="relative bg-white rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-150 my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-900 text-white p-6 sm:p-7 relative border-b border-indigo-900/50">
          <button
            type="button"
            id="close-add-product-modal-btn"
            onClick={onClose}
            className="absolute top-5 right-5 w-8 h-8 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer border border-slate-700"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-bold bg-indigo-900/80 border border-indigo-700/60 text-yellow-300 mb-2">
            <Plus className="w-3.5 h-3.5" />
            <span>Storefront Inventory Manager</span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
            Add New Product or Bottle
          </h2>
          <p className="text-xs text-indigo-200/80 mt-1 font-normal max-w-lg">
            Add an artisanal product, bottled elixir, jar, or handcrafted item to your public <strong>{shop.name}</strong> catalog.
          </p>
        </div>

        {/* Form Body */}
        <div className="p-6 sm:p-7 max-h-[75vh] overflow-y-auto">
          {isSubmitted ? (
            <div className="py-12 text-center space-y-3">
              <div className="w-16 h-16 rounded-3xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-black text-slate-900">
                Product Added Successfully!
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto font-medium">
                "{title}" is now active in your inventory and visible across the ShopLocal neighborhood marketplace.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Quick Template Picker (Especially for Bottles / Jars / Goods) */}
              <div className="p-4 bg-indigo-50/60 border border-indigo-100 rounded-2xl">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-indigo-950 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Quick Fill Templates (Bottles, Jars, Goods)</span>
                  </span>
                  <span className="text-[10px] text-indigo-500 font-medium">Click to auto-populate</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {PRESET_TEMPLATES.map((preset) => (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => handleApplyPreset(preset)}
                      className="px-3 py-1.5 bg-white hover:bg-indigo-600 hover:text-white border border-indigo-200 rounded-xl text-xs font-semibold text-slate-700 transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
                    >
                      <span>{preset.icon}</span>
                      <span>{preset.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Title & Category */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label htmlFor="product-title" className="block text-xs font-bold text-slate-700 mb-1">
                    Product Title *
                  </label>
                  <div className="relative flex items-center">
                    <Package className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
                    <input
                      id="product-title"
                      type="text"
                      required
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g., Bone Straight Wig"
                      className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-indigo-600 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="product-category" className="block text-xs font-bold text-slate-700 mb-1">
                    Category *
                  </label>
                  <select
                    id="product-category"
                    value={category}
                    onChange={(e) => setCategory(e.target.value as ProductCategory)}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-indigo-600 outline-none font-medium cursor-pointer"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Price, Original Price & Stock */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label htmlFor="product-price" className="block text-xs font-bold text-slate-700 mb-1">
                    Selling Price (CFA) *
                  </label>
                  <div className="relative flex items-center">
                    <span className="text-[10px] font-extrabold text-slate-400 absolute left-3 pointer-events-none">
                      CFA
                    </span>
                    <input
                      id="product-price"
                      type="number"
                      step="100"
                      min="100"
                      required
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      placeholder="55000"
                      className="w-full pl-12 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-indigo-600 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="product-original-price" className="block text-xs font-bold text-slate-700 mb-1">
                    Original Price (CFA) <span className="text-slate-400 font-normal">(Optional)</span>
                  </label>
                  <div className="relative flex items-center">
                    <span className="text-[10px] font-extrabold text-slate-400 absolute left-3 pointer-events-none">
                      CFA
                    </span>
                    <input
                      id="product-original-price"
                      type="number"
                      step="100"
                      min="100"
                      value={originalPrice}
                      onChange={(e) => setOriginalPrice(e.target.value)}
                      placeholder="65000"
                      className="w-full pl-12 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-indigo-600 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="product-stock" className="block text-xs font-bold text-slate-700 mb-1">
                    Available Stock *
                  </label>
                  <div className="relative flex items-center">
                    <Layers className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
                    <input
                      id="product-stock"
                      type="number"
                      min="0"
                      required
                      value={stock}
                      onChange={(e) => setStock(e.target.value)}
                      placeholder="20"
                      className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-indigo-600 outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Product Image Section: Device Upload, URL, or Presets */}
              <div className="space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                  <label className="block text-xs font-bold text-slate-700">
                    Product Image * <span className="text-slate-400 font-normal">(Upload from Device or Web)</span>
                  </label>

                  {/* Mode switcher tabs */}
                  <div className="inline-flex p-0.5 bg-slate-100 rounded-xl border border-slate-200 text-xs font-semibold">
                    <button
                      type="button"
                      id="image-source-device-btn"
                      onClick={() => setUploadSource('device')}
                      className={`px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 cursor-pointer ${
                        uploadSource === 'device' 
                          ? 'bg-white text-indigo-700 shadow-xs font-bold' 
                          : 'text-slate-500 hover:text-slate-900'
                      }`}
                    >
                      <HardDrive className="w-3 h-3" />
                      <span>From Device</span>
                    </button>
                    <button
                      type="button"
                      id="image-source-url-btn"
                      onClick={() => setUploadSource('url')}
                      className={`px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 cursor-pointer ${
                        uploadSource === 'url' 
                          ? 'bg-white text-indigo-700 shadow-xs font-bold' 
                          : 'text-slate-500 hover:text-slate-900'
                      }`}
                    >
                      <Link className="w-3 h-3" />
                      <span>Web URL</span>
                    </button>
                    <button
                      type="button"
                      id="image-source-presets-btn"
                      onClick={() => setUploadSource('presets')}
                      className={`px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 cursor-pointer ${
                        uploadSource === 'presets' 
                          ? 'bg-white text-indigo-700 shadow-xs font-bold' 
                          : 'text-slate-500 hover:text-slate-900'
                      }`}
                    >
                      <Sparkles className="w-3 h-3" />
                      <span>Bottle Presets</span>
                    </button>
                  </div>
                </div>

                {/* Hidden native file input targeting device storage */}
                <input
                  type="file"
                  ref={fileInputRef}
                  id="admin-device-image-input"
                  accept="image/png, image/jpeg, image/webp, image/gif"
                  onChange={handleFileChange}
                  className="hidden"
                />

                {/* 1. Device Upload View */}
                {uploadSource === 'device' && (
                  <div>
                    {imageUrl ? (
                      /* Active Image Uploaded Preview Card */
                      <div 
                        id="device-image-preview-card"
                        className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3.5"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-18 h-18 rounded-xl overflow-hidden border border-slate-200 shrink-0 bg-white relative shadow-xs">
                            <img 
                              src={imageUrl} 
                              alt="Selected product preview" 
                              className="w-full h-full object-cover" 
                              referrerPolicy="no-referrer"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = '/images/organic_beauty.jpg';
                              }}
                            />
                            {isUploadingImage && (
                              <div className="absolute bottom-0 inset-x-0 bg-indigo-950/80 backdrop-blur-xs py-0.5 flex items-center justify-center gap-1 text-[9px] font-bold text-white">
                                <Loader2 className="w-2.5 h-2.5 animate-spin" />
                                <span>Syncing</span>
                              </div>
                            )}
                          </div>

                          <div className="space-y-1">
                            <div className="flex items-center gap-1.5">
                              {isUploadingImage ? (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-indigo-50 border border-indigo-200 text-indigo-700 text-[10px] font-bold">
                                  <Loader2 className="w-3 h-3 animate-spin" />
                                  <span>Optimized & Syncing in Background</span>
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-bold">
                                  <CheckCircle2 className="w-3 h-3" />
                                  <span>Image Ready & Optimized</span>
                                </span>
                              )}
                            </div>
                            <p className="text-xs font-bold text-slate-900 truncate max-w-[220px] sm:max-w-xs">
                              {uploadedFileName || 'Uploaded Product Photo'}
                            </p>
                            <p className="text-[11px] text-slate-500 font-medium">
                              {uploadedFileSize || 'Ready for catalog publishing'}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 self-end sm:self-center">
                          <button
                            type="button"
                            id="change-device-image-btn"
                            onClick={() => fileInputRef.current?.click()}
                            className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-xs font-bold text-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                          >
                            <RefreshCw className="w-3 h-3 text-slate-500" />
                            <span>Change Photo</span>
                          </button>
                          <button
                            type="button"
                            id="remove-device-image-btn"
                            onClick={handleRemoveImage}
                            className="px-3 py-1.5 rounded-xl border border-rose-200 bg-rose-50/70 hover:bg-rose-100 text-xs font-bold text-rose-600 flex items-center gap-1.5 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3 h-3" />
                            <span>Remove</span>
                          </button>
                        </div>
                      </div>
                    ) : (
                      /* Drag & Drop Device Upload Zone */
                      <div
                        id="device-upload-dropzone"
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        onClick={() => fileInputRef.current?.click()}
                        className={`border-2 border-dashed rounded-2xl p-6 sm:p-7 text-center transition-all cursor-pointer ${
                          isDragging 
                            ? 'border-indigo-600 bg-indigo-50/80 scale-[1.01]' 
                            : 'border-slate-200 bg-slate-50/60 hover:bg-slate-50 hover:border-indigo-300'
                        }`}
                      >
                        <div className="w-12 h-12 rounded-2xl bg-indigo-100/80 text-indigo-600 flex items-center justify-center mx-auto mb-2.5 shadow-xs">
                          <UploadCloud className="w-6 h-6" />
                        </div>
                        <p className="text-xs font-bold text-slate-800">
                          {isDragging ? 'Drop your photo here now...' : 'Click to select or drag & drop product photo here'}
                        </p>
                        <p className="text-[11px] text-slate-500 mt-1 font-normal">
                          Select directly from your phone gallery, tablet, or computer (PNG, JPG, WEBP, GIF up to 15MB)
                        </p>
                        <button
                          type="button"
                          id="browse-device-files-btn"
                          className="mt-3.5 inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs transition-all pointer-events-none"
                        >
                          <FileImage className="w-3.5 h-3.5" />
                          <span>Browse Device Files</span>
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* 2. Web Image URL View */}
                {uploadSource === 'url' && (
                  <div className="space-y-2">
                    <div className="flex gap-3 items-center">
                      <div className="relative flex-1 flex items-center">
                        <Link className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
                        <input
                          id="product-image-url"
                          type="url"
                          value={imageUrl}
                          onChange={(e) => {
                            setImageUrl(e.target.value);
                            setUploadedFileName('Web image link');
                            setUploadedFileSize('Remote URL');
                          }}
                          placeholder="https://images.unsplash.com/... or hosted image link"
                          className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-indigo-600 outline-none"
                        />
                      </div>
                      {imageUrl && (
                        <div className="w-10 h-10 rounded-xl overflow-hidden border border-slate-200 shrink-0 shadow-xs bg-white">
                          <img 
                            src={imageUrl} 
                            alt="Preview" 
                            className="w-full h-full object-cover" 
                            referrerPolicy="no-referrer"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = '/images/organic_beauty.jpg';
                            }}
                          />
                        </div>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400">
                      Tip: You can switch back to "From Device" tab anytime to upload directly from your device storage.
                    </p>
                  </div>
                )}

                {/* 3. Bottle Presets View */}
                {uploadSource === 'presets' && (
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                    <p className="text-[11px] font-semibold text-slate-600">
                      Click any bottle or artisan template to apply photo and sample details:
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {PRESET_TEMPLATES.map((preset) => (
                        <button
                          key={preset.label}
                          type="button"
                          onClick={() => {
                            handleApplyPreset(preset);
                            setUploadSource('device'); // Switch to preview
                          }}
                          className="px-2.5 py-1.5 bg-white hover:bg-indigo-600 hover:text-white border border-indigo-200/80 rounded-xl text-xs font-semibold text-slate-700 transition-all shadow-2xs cursor-pointer flex items-center gap-1.5"
                        >
                          <span>{preset.icon}</span>
                          <span>{preset.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Description */}
              <div>
                <label htmlFor="product-description" className="block text-xs font-bold text-slate-700 mb-1">
                  Description
                </label>
                <textarea
                  id="product-description"
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe material, bottle capacity, craftsmanship notes, or usage instructions..."
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-indigo-600 outline-none resize-none"
                />
              </div>

              {/* Tags */}
              <div>
                <label htmlFor="product-tags" className="block text-xs font-bold text-slate-700 mb-1">
                  Tags <span className="text-slate-400 font-normal">(Comma-separated)</span>
                </label>
                <div className="relative flex items-center">
                  <Tag className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
                  <input
                    id="product-tags"
                    type="text"
                    value={tagsInput}
                    onChange={(e) => setTagsInput(e.target.value)}
                    placeholder="e.g., Bottle, Elixir, Organic, Handcrafted, Local"
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-indigo-600 outline-none"
                  />
                </div>
              </div>

              {/* Toggles */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <label className="flex items-center gap-2.5 p-3 rounded-xl border border-slate-200 bg-slate-50/50 cursor-pointer hover:bg-slate-50">
                  <input
                    type="checkbox"
                    checked={pickupAvailable}
                    onChange={(e) => setPickupAvailable(e.target.checked)}
                    className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
                  />
                  <div className="text-xs">
                    <span className="font-bold text-slate-900 block">Curbside Pickup</span>
                    <span className="text-slate-500 text-[11px]">Ready within 2 hours at shop</span>
                  </div>
                </label>

                <label className="flex items-center gap-2.5 p-3 rounded-xl border border-slate-200 bg-slate-50/50 cursor-pointer hover:bg-slate-50">
                  <input
                    type="checkbox"
                    checked={freeLocalDelivery}
                    onChange={(e) => setFreeLocalDelivery(e.target.checked)}
                    className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
                  />
                  <div className="text-xs">
                    <span className="font-bold text-slate-900 block">Free Local Delivery</span>
                    <span className="text-slate-500 text-[11px]">Free delivery on local orders</span>
                  </div>
                </label>
              </div>

              {/* Form Error */}
              {formError && (
                <div 
                  id="add-product-error"
                  className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs font-semibold text-rose-700 flex items-center gap-2"
                >
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Submit Buttons */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  id="add-product-submit-btn"
                  className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-200 transition-all cursor-pointer flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Product to Storefront</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

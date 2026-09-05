export type ProductCategory = 
  | 'All'
  | 'Handmade & Crafts'
  | 'Fashion & Apparel'
  | 'Artisanal Groceries'
  | 'Organic Beauty'
  | "Ladies' Hairstyles"
  | 'Electronics & Gadgets'
  | 'Home & Living';

export type HairstyleStyle = 
  | 'All Styles'
  | 'Bone Straight Wigs'
  | 'Knotless Box Braids'
  | 'Passion & Spring Twists'
  | 'HD Lace Frontals & Closures'
  | 'Goddess & Bohemian Locs'
  | 'Ponytails & Sleek Updos'
  | 'Natural Hair & Silk Press'
  | 'Weaves & Virgin Bundles';

export interface HairstyleCategoryDetail {
  id: string;
  name: string;
  shortName: string;
  icon: string;
  description: string;
  popularLengths: string[];
  suggestedTags: string[];
}

export const HAIRSTYLE_STYLES_DATA: HairstyleCategoryDetail[] = [
  {
    id: 'bone-straight',
    name: 'Bone Straight Wigs',
    shortName: 'Bone Straight',
    icon: '💇‍♀️',
    description: 'Ultra-sleek 100% human raw virgin bone straight hair with pre-plucked invisible HD lace.',
    popularLengths: ['18 inch', '22 inch', '26 inch', '30 inch', '34 inch'],
    suggestedTags: ['Bone Straight', 'Wig', 'HD Lace', 'Virgin Hair', 'Human Hair', 'Lace Frontal'],
  },
  {
    id: 'knotless-braids',
    name: 'Knotless Box Braids',
    shortName: 'Knotless Braids',
    icon: '✨',
    description: 'Painless, scalp-friendly knotless box braids with human hair curly curls and nourishing scalp prep.',
    popularLengths: ['Waist Length', 'Butt Length', 'Thigh Length', 'Mid-Back'],
    suggestedTags: ['Knotless', 'Box Braids', 'Protective Style', 'Boho Braids', 'Goddess Braids'],
  },
  {
    id: 'passion-twists',
    name: 'Passion & Spring Twists',
    shortName: 'Passion Twists',
    icon: '👑',
    description: 'Bohemian water wave passion twists and spring twists with lightweight, bouncy organic texture.',
    popularLengths: ['14 inch', '18 inch', '22 inch', '24 inch'],
    suggestedTags: ['Twists', 'Passion Twists', 'Spring Twists', 'Water Wave', 'Boho Hair'],
  },
  {
    id: 'hd-lace-frontals',
    name: 'HD Lace Frontals & Closures',
    shortName: 'HD Lace & Closures',
    icon: '💎',
    description: 'Melted undetectable Swiss HD lace frontals, 13x4, 13x6, and 5x5 HD closures with tiny pre-bleached knots.',
    popularLengths: ['14 inch', '18 inch', '20 inch', '22 inch'],
    suggestedTags: ['HD Lace', 'Frontal', 'Closure', 'Melted Lace', 'Pre-plucked'],
  },
  {
    id: 'goddess-locs',
    name: 'Goddess & Bohemian Locs',
    shortName: 'Goddess Locs',
    icon: '🌿',
    description: 'Distressed soft butterfly locs and goddess faux locs wrapped with curly human hair tendrils.',
    popularLengths: ['18 inch', '24 inch', '28 inch', '36 inch'],
    suggestedTags: ['Locs', 'Faux Locs', 'Soft Locs', 'Butterfly Locs', 'Goddess Locs'],
  },
  {
    id: 'ponytails-updos',
    name: 'Ponytails & Sleek Updos',
    shortName: 'Ponytails & Updos',
    icon: '🎀',
    description: 'Sleek drawstring wrap-around ponytails, claw clip extensions, and red-carpet bridal bun updos.',
    popularLengths: ['20 inch', '24 inch', '28 inch', '32 inch'],
    suggestedTags: ['Ponytail', 'Drawstring', 'Sleek Updo', 'Wrap-around', 'Bun'],
  },
  {
    id: 'natural-silk-press',
    name: 'Natural Hair & Silk Press',
    shortName: 'Natural & Silk Press',
    icon: '🌸',
    description: 'Chemical-free ceramic titanium silk press styling with argan thermal shield and deep hydration steam.',
    popularLengths: ['Short / Pixie', 'Collarbone', 'Bra-Strap', 'Long'],
    suggestedTags: ['Silk Press', 'Natural Hair', 'Thermal Shield', 'Steam Treatment', 'Scalp Care'],
  },
  {
    id: 'weaves-bundles',
    name: 'Weaves & Virgin Bundles',
    shortName: 'Weaves & Bundles',
    icon: '✂️',
    description: 'Single-donor virgin human hair bundles (raw straight, body wave, deep wave, kinky curly) for sew-in weaves.',
    popularLengths: ['16+18+20', '22+24+26', '28+30+32'],
    suggestedTags: ['Bundles', 'Virgin Hair', 'Sew-In', 'Weave', 'Raw Hair', 'Body Wave'],
  },
];

export interface CategoryInfo {
  id: string;
  name: ProductCategory;
  slug: string;
  iconName: string;
  description: string;
  itemCount: number;
  imageUrl: string;
}

export interface Shop {
  id: string;
  name: string;
  handle: string;
  tagline: string;
  bio: string;
  logoUrl: string;
  bannerUrl: string;
  category: ProductCategory;
  rating: number;
  reviewCount: number;
  address: string;
  city: string;
  distanceKm?: number;
  phone: string;
  email: string;
  openingHours: string;
  verified: boolean;
  featured: boolean;
  viewsCount: number;
  productsCount: number;
}

export interface Product {
  id: string;
  shopId: string;
  shopName: string;
  shopLogo: string;
  title: string;
  description: string;
  usageInstructions?: string;
  price: number;
  originalPrice?: number;
  discountPercent?: number;
  category: ProductCategory;
  imageUrl: string;
  stock: number;
  rating: number;
  reviewCount: number;
  isFeatured: boolean;
  tags: string[];
  pickupAvailable: boolean;
  freeLocalDelivery?: boolean;
  createdAt?: string | number;
  ownerId?: string;
}

export interface FilterState {
  searchQuery: string;
  category: string;
  location: string;
  sortBy: 'featured' | 'price-asc' | 'price-desc' | 'rating';
}

export type UserRole = 'admin' | 'shop_owner' | 'shopper' | 'guest';

export type UserStatus = 'pending' | 'approved' | 'banned';

export interface UserUploadedFile {
  id: string;
  userId: string;
  userEmail?: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  downloadUrl: string;
  createdAt?: any;
  purpose?: string;
  associatedProductId?: string;
}

export interface UserProfile {
  uid: string;
  email: string;
  role: UserRole;
  ownerName: string;
  shopName?: string;
  shopCategory?: ProductCategory | string;
  phone?: string;
  address?: string;
  status?: UserStatus;
  fileCount?: number;
  createdAt?: any;
  updatedAt?: any;
}

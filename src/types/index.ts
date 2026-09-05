export type ProductCategory = 
  | 'All'
  | 'Handmade & Crafts'
  | 'Fashion & Apparel'
  | 'Artisanal Groceries'
  | 'Organic Beauty'
  | 'Electronics & Gadgets'
  | 'Home & Living';

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

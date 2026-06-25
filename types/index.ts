// Core domain types. DB-ready (matches Supabase row shape we'll generate later).

export type Currency = 'AED';

export type StockStatus = 'in_stock' | 'out_of_stock' | 'preorder';

export type ProductId = string;
export type GroupId = string;
export type CategoryId = string;

export type Product = {
  id: ProductId;
  groupId: GroupId | null;
  title: string;
  slug: string;
  description: string;
  category: CategoryId;
  subCategory?: CategoryId | null;
  customGroups?: string[];
  price: number;
  discountPrice: number | null;
  currency: Currency;
  images: string[];
  primaryImageIndex?: number;
  videoUrl: string | null;
  videos?: string[];
  tags: string[];
  seoTags?: string[];
  stockStatus: StockStatus;
  stockCount?: number;
  isFeatured: boolean;
  isNewArrival?: boolean;
  isBestSelling?: boolean;
  availableSizes?: string[];
  availableColors?: string[];
  barcode?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type ProductGroup = {
  id: GroupId;
  title: string;
  slug: string;
  description: string;
  coverImage: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type Category = {
  id: CategoryId;
  title: string;
  slug: string;
  parentCategory: CategoryId | null;
  icon: string | null;
};

export type CustomGroup = {
  id: string;
  title: string;
  slug: string;
  description: string;
};

export type OrderStatus = 'cart' | 'pending' | 'paid' | 'shipped' | 'cancelled';

export type OrderItem = {
  productId: ProductId;
  title: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  selectedSize?: string;
  selectedColor?: string;
};

export type PaymentMethod = 'tabby' | 'tamara' | 'card' | 'cod';

export type Order = {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  items: OrderItem[];
  subtotal: number;
  discountTotal: number;
  total: number;
  status: OrderStatus;
  paymentMethod?: PaymentMethod;
  createdAt: string;
};

export type Customer = {
  id: string;
  name: string;
  email: string;
  phone: string;
  address?: string;
};

// Shipping address for orders
export type ShippingAddress = {
  line1: string;
  line2?: string;
  city: string;
  emirate: string;
  country: string;
  postalCode?: string;
};

// Coupon / Discount codes
export type CouponType = 'percentage' | 'fixed';

export type Coupon = {
  id: string;
  code: string;
  type: CouponType;
  value: number;
  minOrderAmount?: number;
  maxUses?: number;
  usedCount: number;
  validFrom: string;
  validUntil: string;
  isActive: boolean;
  createdAt: string;
};

// Shipping zones and rates
export type ShippingZone = {
  id: string;
  name: string;
  regions: string[];
  rate: number;
  freeAbove?: number;
  estimatedDays: string;
  isActive: boolean;
};

// Promotional banners
export type BannerPosition = 'hero' | 'announcement' | 'sidebar';

export type Banner = {
  id: string;
  title: string;
  subtitle?: string;
  image: string;
  link?: string;
  position: BannerPosition;
  isActive: boolean;
  displayOrder: number;
  validFrom?: string;
  validUntil?: string;
  createdAt: string;
};

// Store settings
export type StoreSettings = {
  storeName: string;
  logo: string;
  contactEmail: string;
  contactPhone: string;
  address: string;
  socialLinks: { platform: string; url: string }[];
  currency: Currency;
  taxRate: number;
  freeShippingThreshold: number;
};

// Admin feature visibility flags
export type AdminFeatureFlags = {
  customers: boolean;
  coupons: boolean;
  shipping: boolean;
  banners: boolean;
  storeSettings: boolean;
  analytics: boolean;
};

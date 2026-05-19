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
  price: number;
  discountPrice: number | null;
  currency: Currency;
  images: string[];
  videoUrl: string | null;
  tags: string[];
  stockStatus: StockStatus;
  isFeatured: boolean;
  availableSizes?: string[];
  availableColors?: string[];
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
  createdAt: string;
};

export type Customer = {
  id: string;
  name: string;
  email: string;
  phone: string;
  address?: string;
};

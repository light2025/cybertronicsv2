// snake_case Supabase rows ↔ camelCase domain types.
// Centralised here so individual API modules stay thin.

import type {
  Category,
  Order,
  OrderItem,
  Product,
  ProductGroup,
} from '@/types';
import type {
  CategoryRow,
  CustomGroupRow,
  OrderItemRow,
  OrderRow,
  ProductGroupRow,
  ProductRow,
} from './types';

export const rowToCategory = (r: CategoryRow): Category => ({
  id: r.id,
  title: r.title,
  slug: r.slug,
  parentCategory: r.parent_category,
  icon: r.icon,
});

export const rowToGroup = (r: ProductGroupRow): ProductGroup => ({
  id: r.id,
  title: r.title,
  slug: r.slug,
  description: r.description,
  coverImage: r.cover_image,
  isActive: r.is_active,
  createdAt: r.created_at,
  updatedAt: r.updated_at,
});

export const rowToProduct = (r: ProductRow, customGroupIds: string[] = []): Product => ({
  id: r.id,
  groupId: r.group_id,
  title: r.title,
  slug: r.slug,
  description: r.description,
  category: r.category ?? '',
  subCategory: r.sub_category ?? null,
  price: Number(r.price),
  discountPrice: r.discount_price != null ? Number(r.discount_price) : null,
  currency: r.currency as 'AED',
  images: r.images,
  primaryImageIndex: r.primary_image_index,
  videos: r.videos,
  videoUrl: r.videos[0] ?? null,
  tags: r.tags,
  seoTags: r.seo_tags,
  stockStatus: r.stock_status,
  stockCount: r.stock_count,
  isFeatured: r.is_featured,
  isNewArrival: r.is_new_arrival,
  isBestSelling: r.is_best_selling,
  availableSizes: r.available_sizes.length > 0 ? r.available_sizes : undefined,
  availableColors: r.available_colors.length > 0 ? r.available_colors : undefined,
  barcode: r.barcode,
  customGroups: customGroupIds,
  createdAt: r.created_at,
  updatedAt: r.updated_at,
});

export const rowToOrderItem = (r: OrderItemRow): OrderItem => ({
  productId: r.product_id,
  title: r.title,
  quantity: r.quantity,
  unitPrice: Number(r.unit_price),
  totalPrice: Number(r.total_price),
  selectedSize: r.selected_size ?? undefined,
  selectedColor: r.selected_color ?? undefined,
});

export const rowToOrder = (r: OrderRow, items: OrderItem[]): Order => ({
  id: r.id,
  customerName: r.customer_name,
  customerEmail: r.customer_email,
  customerPhone: r.customer_phone,
  items,
  subtotal: Number(r.subtotal),
  discountTotal: Number(r.discount_total),
  total: Number(r.total),
  status: r.status,
  createdAt: r.created_at,
});

// Inverse direction (Product → ProductRow) for writes.
// Omits server-managed fields (id/created/updated for INSERTs handled by caller).
export const productToRowPatch = (p: Partial<Product>): Partial<ProductRow> => {
  const out: Partial<ProductRow> = {};
  if (p.title !== undefined)            out.title = p.title;
  if (p.slug !== undefined)             out.slug = p.slug;
  if (p.description !== undefined)      out.description = p.description;
  if (p.category !== undefined)         out.category = p.category || null;
  if (p.subCategory !== undefined)      out.sub_category = p.subCategory ?? null;
  if (p.groupId !== undefined)          out.group_id = p.groupId;
  if (p.price !== undefined)            out.price = p.price;
  if (p.discountPrice !== undefined)    out.discount_price = p.discountPrice;
  if (p.currency !== undefined)         out.currency = p.currency;
  if (p.images !== undefined)           out.images = p.images;
  if (p.primaryImageIndex !== undefined) out.primary_image_index = p.primaryImageIndex;
  if (p.videos !== undefined)           out.videos = p.videos;
  if (p.tags !== undefined)             out.tags = p.tags;
  if (p.seoTags !== undefined)          out.seo_tags = p.seoTags;
  if (p.stockStatus !== undefined)      out.stock_status = p.stockStatus;
  if (p.stockCount !== undefined)       out.stock_count = p.stockCount;
  if (p.isFeatured !== undefined)       out.is_featured = p.isFeatured;
  if (p.isNewArrival !== undefined)     out.is_new_arrival = p.isNewArrival;
  if (p.isBestSelling !== undefined)    out.is_best_selling = p.isBestSelling;
  if (p.availableSizes !== undefined)   out.available_sizes = p.availableSizes ?? [];
  if (p.availableColors !== undefined)  out.available_colors = p.availableColors ?? [];
  if (p.barcode !== undefined)          out.barcode = p.barcode;
  return out;
};

export type { CustomGroupRow };

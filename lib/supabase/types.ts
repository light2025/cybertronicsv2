// Row types mirroring supabase/migrations/0001_init.sql.
// Hand-written for Stage 2 scaffolding; replace with `supabase gen types typescript`
// output once the project is linked.

export type CategoryRow = {
  id: string;
  title: string;
  slug: string;
  parent_category: string | null;
  icon: string | null;
  position: number;
  created_at: string;
};

export type ProductGroupRow = {
  id: string;
  title: string;
  slug: string;
  description: string;
  cover_image: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type CustomGroupRow = {
  id: string;
  title: string;
  slug: string;
  description: string;
  created_at: string;
};

export type ProductRow = {
  id: string;
  group_id: string | null;
  title: string;
  slug: string;
  description: string;
  category: string | null;
  sub_category: string | null;
  price: number;
  discount_price: number | null;
  currency: string;
  images: string[];
  primary_image_index: number;
  videos: string[];
  tags: string[];
  seo_tags: string[];
  stock_status: 'in_stock' | 'out_of_stock' | 'preorder';
  stock_count: number;
  is_featured: boolean;
  is_new_arrival: boolean;
  is_best_selling: boolean;
  available_sizes: string[];
  available_colors: string[];
  barcode: string | null;
  created_at: string;
  updated_at: string;
};

export type OrderRow = {
  id: string;
  customer_id: string | null;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  subtotal: number;
  discount_total: number;
  shipping: number;
  total: number;
  status: 'cart' | 'pending' | 'paid' | 'shipped' | 'cancelled';
  payment_method: 'tabby' | 'tamara' | 'card' | 'cod' | null;
  created_at: string;
};

export type OrderItemRow = {
  id: string;
  order_id: string;
  product_id: string;
  title: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  selected_size: string | null;
  selected_color: string | null;
};

export type SaveForLaterRow = {
  id: string;
  customer_id: string;
  product_id: string;
  selected_size: string | null;
  selected_color: string | null;
  saved_at: string;
};

export type ProfileRow = {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  email: string | null;
  role: 'guest' | 'customer' | 'admin';
  preferences: Record<string, unknown>;
  created_at: string;
};

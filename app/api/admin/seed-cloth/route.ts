import { NextResponse } from 'next/server';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { supabaseAdmin } from '@/lib/supabase/server';

// ── Product manifest ────────────────────────────────────────────────────────

type ClothProduct = {
  title: string;
  slug: string;
  description: string;
  categorySlug: string;
  price: number;
  availableColors?: string[];
  availableSizes?: string[];
  images: string[];
  isFeatured?: boolean;
  isNewArrival?: boolean;
};

const CLOTH_PRODUCTS: ClothProduct[] = [
  {
    title: 'Bidun tamat Sweatpants',
    slug: 'bidun-tamat-sweatpants',
    description: 'Premium Cybertronic sweatpants for the urban warrior.',
    categorySlug: 'pants',
    price: 275,
    availableSizes: ['S', 'M', 'L', 'XL'],
    images: ['Bidun tamat Sweatpants 01.png', 'Bidun tamat Sweatpants 02.png'],
    isFeatured: true,
    isNewArrival: true,
  },
  {
    title: 'Cybertronic Shorts',
    slug: 'cybertronic-shorts',
    description: 'Cybertronic performance shorts. Available in Black and Blue.',
    categorySlug: 'shorts',
    price: 155,
    availableColors: ['Black', 'Blue'],
    availableSizes: ['S', 'M', 'L', 'XL'],
    images: [
      'Cybertronic Shorts Black 01.png',
      'Cybertronic Shorts Black 02.png',
      'Cybertronic Shorts Blue 01.png',
      'Cybertronic Shorts Blue 02.png',
    ],
    isFeatured: true,
    isNewArrival: true,
  },
  {
    title: 'Cybertronic Socks',
    slug: 'cybertronic-socks',
    description: 'Ribbed Cybertronic socks with signature mark. Available in Black, Blue, and Red.',
    categorySlug: 'socks',
    price: 65,
    availableColors: ['Black', 'Blue', 'Red'],
    images: [
      'Cybertronic Socks Black.png',
      'Cybertronic Socks Blue.png',
      'Cybertronic Socks Red.png',
    ],
    isNewArrival: true,
  },
  {
    title: 'TwoSide Effect T-Shirt',
    slug: 'twoside-effect-tshirt',
    description: 'Premium Cybertronic tee with dual-side graphic. Available in Black and White.',
    categorySlug: 't-shirts',
    price: 185,
    availableColors: ['Black', 'White'],
    availableSizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    images: [
      'TwoSide Effect Tshirt Black Front.png',
      'TwoSide Effect Tshirt Black Back.png',
      'TwoSide Effect Tshirt White Front.png',
      'TwoSide Effect Tshirt White Back.png',
    ],
    isFeatured: true,
    isNewArrival: true,
  },
  {
    title: 'Yu Gi Oh! Long Sleeve',
    slug: 'yu-gi-oh-long-sleeve',
    description: 'Limited collab long sleeve. Cybertronic x Yu Gi Oh! energy.',
    categorySlug: 't-shirts',
    price: 220,
    availableSizes: ['S', 'M', 'L', 'XL'],
    images: ['Yu Gi Oh! long sleeve 01.png', 'Yu Gi Oh! long sleeve 02.png'],
    isFeatured: true,
    isNewArrival: true,
  },
];

const SEED_CATEGORIES = [
  { slug: 't-shirts',     title: 'T-Shirts',  icon: '👕', position: 1 },
  { slug: 'pants',        title: 'Pants',     icon: '👖', position: 2 },
  { slug: 'shorts',       title: 'Shorts',    icon: '🩳', position: 3 },
  { slug: 'hoodies',      title: 'Hoodies',   icon: '🧥', position: 4 },
  { slug: 'socks',        title: 'Socks',     icon: '🧦', position: 5 },
  { slug: 'caps',         title: 'Caps',      icon: '🧢', position: 6 },
  { slug: 'accessories',  title: 'Accessories', icon: '🕶️', position: 7 },
];

// ── Helpers ─────────────────────────────────────────────────────────────────

async function ensureBucket() {
  const admin = supabaseAdmin();
  const { data: buckets } = await admin.storage.listBuckets();
  const exists = buckets?.some((b) => b.name === 'product-images');
  if (!exists) {
    const { error } = await admin.storage.createBucket('product-images', { public: true });
    if (error) throw new Error(`Bucket create failed: ${error.message}`);
  }
}

async function uploadClothImage(filename: string): Promise<string> {
  const admin = supabaseAdmin();
  const filePath = join(process.cwd(), 'public', 'cloth', filename);

  if (!existsSync(filePath)) throw new Error(`File not found: public/cloth/${filename}`);

  const buffer = readFileSync(filePath);
  const ext = filename.split('.').pop()?.toLowerCase() ?? 'png';
  const storagePath = `cloth/${filename.replace(/\s+/g, '-').replace(/[!]/g, '')}`;
  const contentType = ext === 'jpg' ? 'image/jpeg' : `image/${ext}`;

  const { error } = await admin.storage
    .from('product-images')
    .upload(storagePath, buffer, { contentType, upsert: true });

  if (error) throw new Error(`Upload failed (${filename}): ${error.message}`);

  const { data } = admin.storage.from('product-images').getPublicUrl(storagePath);
  return data.publicUrl;
}

// ── Handler ──────────────────────────────────────────────────────────────────

export async function POST() {
  try {
    const admin = supabaseAdmin();

    // 1. Ensure bucket exists
    await ensureBucket();

    // 2. Upsert categories, collect slug→uuid map
    const catMap: Record<string, string> = {};
    for (const cat of SEED_CATEGORIES) {
      const { data, error } = await admin
        .from('categories')
        .upsert(
          { slug: cat.slug, title: cat.title, icon: cat.icon, parent_category: null, position: cat.position },
          { onConflict: 'slug' }
        )
        .select('id, slug')
        .single();
      if (error) throw new Error(`Category upsert failed (${cat.slug}): ${error.message}`);
      catMap[(data as { id: string; slug: string }).slug] = (data as { id: string; slug: string }).id;
    }

    // 3. Upload images + upsert products
    const results: { slug: string; action: string; images: number }[] = [];

    for (const product of CLOTH_PRODUCTS) {
      const categoryId = catMap[product.categorySlug];
      if (!categoryId) throw new Error(`Category ID not found for slug: ${product.categorySlug}`);

      // Upload all images
      const imageUrls = await Promise.all(product.images.map(uploadClothImage));

      // Check existing
      const { data: existing } = await admin
        .from('products')
        .select('id')
        .eq('slug', product.slug)
        .maybeSingle();

      if (existing) {
        const { error } = await admin
          .from('products')
          .update({ images: imageUrls, updated_at: new Date().toISOString() })
          .eq('id', (existing as { id: string }).id);
        if (error) throw new Error(`Product update failed (${product.slug}): ${error.message}`);
        results.push({ slug: product.slug, action: 'updated', images: imageUrls.length });
        continue;
      }

      const now = new Date().toISOString();
      const { error } = await admin.from('products').insert({
        title:              product.title,
        slug:               product.slug,
        description:        product.description,
        category:           categoryId,
        price:              product.price,
        discount_price:     null,
        currency:           'AED',
        images:             imageUrls,
        primary_image_index: 0,
        videos:             [],
        tags:               [product.categorySlug],
        seo_tags:           [],
        stock_status:       'in_stock',
        stock_count:        50,
        is_featured:        product.isFeatured ?? false,
        is_new_arrival:     product.isNewArrival ?? false,
        is_best_selling:    false,
        available_sizes:    product.availableSizes ?? [],
        available_colors:   product.availableColors ?? [],
        barcode:            null,
        created_at:         now,
        updated_at:         now,
      });

      if (error) throw new Error(`Product insert failed (${product.slug}): ${error.message}`);
      results.push({ slug: product.slug, action: 'created', images: imageUrls.length });
    }

    return NextResponse.json({ ok: true, categories: Object.keys(catMap).length, results });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('[seed-cloth]', message);
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}

// GET: just report what would be seeded
export async function GET() {
  return NextResponse.json({
    products: CLOTH_PRODUCTS.map((p) => ({
      slug: p.slug,
      title: p.title,
      category: p.categorySlug,
      images: p.images.length,
    })),
    instructions: 'POST to this endpoint to seed. Requires SUPABASE_SERVICE_ROLE_KEY on server.',
  });
}

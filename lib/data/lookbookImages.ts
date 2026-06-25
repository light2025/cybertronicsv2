// Lookbook images — curated lifestyle/promotional shots separate from product images.
// These are displayed in the Gallery app's "Lookbook" mode.
// To add images: place them in /public/gallery/ and add paths here.

export type LookbookImage = {
  id: string;
  url: string;
  caption?: string;
  category?: 'lifestyle' | 'outfit' | 'campaign' | 'behind-the-scenes';
};

// Default lookbook images — these can be replaced with actual curated images
export const defaultLookbookImages: LookbookImage[] = [
  // Placeholder — user should replace with actual lookbook images
  // {
  //   id: 'lb-1',
  //   url: '/gallery/lookbook-1.jpg',
  //   caption: 'Spring 2026 Collection',
  //   category: 'campaign',
  // },
];

// Helper to get all lookbook images (can be extended to read from store/db)
export function getLookbookImages(): LookbookImage[] {
  return defaultLookbookImages;
}

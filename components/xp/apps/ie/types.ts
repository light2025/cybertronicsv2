export type IERoute =
  | { kind: 'home' }
  | { kind: 'shop' }
  | { kind: 'shop-category'; slug: string }
  | { kind: 'product'; slug: string }
  | { kind: 'cart' }
  | { kind: 'checkout' }
  | { kind: 'about' }
  | { kind: 'contact' }
  | { kind: 'help' }
  | { kind: 'not-found'; url: string };

export const IE_SCHEME = 'cybertronics://';
export const IE_HOME_URL = 'cybertronics://';

export function parseUrl(url: string): IERoute {
  if (!url.startsWith(IE_SCHEME)) return { kind: 'not-found', url };
  const path = url.slice(IE_SCHEME.length).replace(/^\//, '');
  if (!path) return { kind: 'home' };
  const [seg, ...rest] = path.split('/');
  switch (seg) {
    case 'shop':
      if (rest.length === 0 || rest[0] === '') return { kind: 'shop' };
      return { kind: 'shop-category', slug: rest[0] };
    case 'product':
      if (rest[0]) return { kind: 'product', slug: rest[0] };
      return { kind: 'not-found', url };
    case 'cart': return { kind: 'cart' };
    case 'checkout': return { kind: 'checkout' };
    case 'about': return { kind: 'about' };
    case 'contact': return { kind: 'contact' };
    case 'help': return { kind: 'help' };
    default: return { kind: 'not-found', url };
  }
}

export function defaultTitleForRoute(route: IERoute): string {
  switch (route.kind) {
    case 'home': return 'Cybertronics — Home';
    case 'shop': return 'Cybertronics — Shop';
    case 'shop-category': return `Cybertronics — ${route.slug}`;
    case 'product': return 'Cybertronics — Product';
    case 'cart': return 'Cybertronics — Cart';
    case 'checkout': return 'Cybertronics — Checkout';
    case 'about': return 'About Cybertronics';
    case 'contact': return 'Contact Cybertronics';
    case 'help': return 'Cybertronics Help';
    case 'not-found': return 'Page not found';
  }
}

export function normalizeAddressInput(raw: string): string {
  const v = raw.trim();
  if (!v) return IE_HOME_URL;
  if (v.startsWith(IE_SCHEME)) return v;
  if (v.includes('://')) return v;
  return IE_SCHEME + v.replace(/^\//, '');
}

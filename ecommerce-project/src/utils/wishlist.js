const STORAGE_KEY = 'northstar-market:wishlist';
const RECENTLY_VIEWED_KEY = 'northstar-market:recently-viewed';

function emitStoreChange(eventName) {
  if (typeof window === 'undefined') {
    return;
  }

  window.dispatchEvent(new Event(eventName));
}

export function readWishlist() {
  if (typeof window === 'undefined') {
    return [];
  }

  try {
    const wishlist = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || '[]');
    return Array.isArray(wishlist) ? wishlist.filter((item) => typeof item === 'string') : [];
  } catch {
    return [];
  }
}

export function writeWishlist(wishlistIds) {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify([...new Set(wishlistIds)]));
  emitStoreChange('wishlist-change');
}

export function readRecentlyViewed() {
  if (typeof window === 'undefined') {
    return [];
  }

  try {
    const recentlyViewed = JSON.parse(window.localStorage.getItem(RECENTLY_VIEWED_KEY) || '[]');
    return Array.isArray(recentlyViewed) ? recentlyViewed.filter((item) => typeof item === 'string') : [];
  } catch {
    return [];
  }
}

export function writeRecentlyViewed(productIds) {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(RECENTLY_VIEWED_KEY, JSON.stringify([...new Set(productIds)].slice(0, 8)));
  emitStoreChange('recently-viewed-change');
}

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { 
  Brand, 
  SubCategory, 
  Product, 
  Review, 
  CartItem, 
  Order, 
  Customer, 
  ToastNotification, 
  ViewType,
  OrderStatus,
  ReviewStatus
} from '../types';
import { 
  INITIAL_BRANDS, 
  INITIAL_SUBCATEGORIES, 
  INITIAL_PRODUCTS, 
  INITIAL_REVIEWS, 
  INITIAL_ORDERS, 
  INITIAL_CUSTOMERS 
} from '../data/initialData';

interface StoreContextType {
  // Navigation
  currentView: ViewType;
  navigateTo: (view: ViewType) => void;
  
  // Data
  brands: Brand[];
  subCategories: SubCategory[];
  products: Product[];
  catalogLoading: boolean;
  reviews: Review[];
  orders: Order[];
  
  // Cart & Wishlist
  cart: CartItem[];
  cartCount: number;
  cartSubtotal: number;
  isCartDrawerOpen: boolean;
  setIsCartDrawerOpen: (open: boolean) => void;
  addToCart: (product: Product, quantity: number, selectedSize?: string, selectedColor?: { name: string; hex: string }) => void;
  updateCartQuantity: (productId: string, quantity: number, selectedSize?: string, selectedColor?: { name: string; hex: string }) => void;
  removeFromCart: (productId: string, selectedSize?: string, selectedColor?: { name: string; hex: string }) => void;
  clearCart: () => void;
  wishlist: string[];
  toggleWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;

  // Search & Navigation helpers
  searchQuery: string;
  setSearchQuery: (query: string) => void;

  // Promo Code
  appliedPromoCode: string | null;
  applyPromoCode: (code: string) => { success: boolean; message: string; matchesCount: number };
  removePromoCode: () => void;
  getCartItemUnitPrice: (item: CartItem) => number;
  promoDiscountAmount: number;
  discountedSubtotal: number;

  // Checkout
  createOrder: (orderData: Omit<Order, 'id' | 'orderNumber' | 'createdAt'>) => Promise<Order>;
  refreshOrders: () => Promise<void>;

  // Auth & User
  currentUser: Customer | null;
  setCurrentUser: (user: Customer | null) => void;
  login: (email: string, role: 'customer' | 'admin') => boolean;
  logout: () => void;
  isAdmin: boolean;
  setIsAdminMode: (admin: boolean) => void;

  // Admin CRUD for Products
  addProduct: (product: Omit<Product, 'id' | 'slug' | 'rating' | 'reviewCount' | 'createdAt'>) => Promise<Product>;
  updateProduct: (id: string, updates: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;

  // Admin CRUD for Brands
  addBrand: (brand: Omit<Brand, 'id' | 'slug'>) => Promise<Brand>;
  updateBrand: (id: string, updates: Partial<Brand>) => Promise<void>;
  deleteBrand: (id: string) => Promise<void>;

  // Admin CRUD for SubCategories
  addSubCategory: (subCategory: Omit<SubCategory, 'id' | 'slug'>) => Promise<SubCategory>;
  updateSubCategory: (id: string, updates: Partial<SubCategory>) => Promise<void>;
  deleteSubCategory: (id: string) => Promise<void>;
  syncAllSubCategoriesToServer: () => Promise<boolean>;

  // Admin CRUD for Users / Clients
  adminUsers: Customer[];
  refreshAdminUsers: () => Promise<void>;
  createAdminUser: (userData: { firstName: string; lastName?: string; email: string; phone?: string; role: UserRole; password: string }) => Promise<Customer>;
  updateAdminUser: (id: string, updates: { firstName: string; lastName?: string; email: string; phone?: string; role: UserRole; password?: string }) => Promise<void>;
  deleteAdminUser: (id: string) => Promise<void>;

  // Order & Stock Management
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  deleteOrder: (orderId: string) => Promise<void>;
  updateProductStock: (productId: string, newStock: number) => void;

  // Review Management
  addReview: (productId: string, customerName: string, customerEmail: string, rating: number, comment: string) => void;
  updateReviewStatus: (reviewId: string, status: ReviewStatus) => void;
  deleteReview: (reviewId: string) => void;

  // Helpers
  getBrandBySlug: (slug: string) => Brand | undefined;
  getBrandById: (id: string) => Brand | undefined;
  getSubCategoriesByBrandId: (brandId: string) => SubCategory[];
  getSubCategoryBySlug: (brandId: string, subCategorySlug: string) => SubCategory | undefined;
  getProductsByBrand: (brandId: string) => Product[];
  getProductsBySubCategory: (subCategoryId: string) => Product[];
  getProductById: (id: string) => Product | undefined;
  getProductReviews: (productId: string, onlyApproved: boolean) => Review[];
  formatPrice: (price: number) => string;

  // Toasts
  toasts: ToastNotification[];
  addToast: (message: string, type: 'success' | 'info' | 'warning' | 'error') => void;
  removeToast: (id: string) => void;

  // Reset demo data
  resetCatalogToDefault: () => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

const LOCAL_STORAGE_KEYS = {
  BRANDS: 'espace_pastel_brands_v1',
  SUBCATEGORIES: 'espace_pastel_subcategories_v1',
  PRODUCTS: 'espace_pastel_products_v1',
  REVIEWS: 'espace_pastel_reviews_v1',
  ORDERS: 'espace_pastel_orders_v1',
  CART: 'espace_pastel_cart_v1',
  WISHLIST: 'espace_pastel_wishlist_v1',
  USER: 'espace_pastel_user_v1',
  VIEW: 'espace_pastel_view_v1',
};

const viewToPath = (view: ViewType): string => {
  if (view.type === 'home') return '/';
  if (view.type === 'shop') { const q = new URLSearchParams(); if (view.searchQuery) q.set('q', view.searchQuery); if (view.promoOnly) q.set('promo', '1'); if (view.isNewOnly) q.set('nouveautes', '1'); return '/boutique' + (q.toString() ? '?' + q.toString() : ''); }
  if (view.type === 'brand') return '/marque/' + encodeURIComponent(view.brandSlug);
  if (view.type === 'subcategory') return '/marque/' + encodeURIComponent(view.brandSlug) + '/' + encodeURIComponent(view.subCategorySlug);
  if (view.type === 'product') return '/produit/' + encodeURIComponent(view.productId);
  if (view.type === 'cart') return '/panier';
  if (view.type === 'checkout') return '/checkout';
  if (view.type === 'auth') return '/' + (view.mode === 'register' ? 'inscription' : view.mode === 'forgot' ? 'mot-de-passe-oublie' : 'connexion');
  if (view.type === 'account') return '/compte' + (view.tab !== 'profile' ? '?onglet=' + view.tab : '');
  if (view.type === 'admin') return '/administration';
  if (view.type === 'about') return '/apropos';
  if (view.type === 'contact') return '/contact';
  if (view.type === 'shipping') return '/livraison';
  if (view.type === 'legal') return '/mentions-legales';
  return '/';
};
const pathToView = (rawPath: string, search = ''): ViewType => {
  const path = rawPath.replace(/\/+$/, '') || '/'; const parts = path.split('/').filter(Boolean).map(decodeURIComponent); const p = new URLSearchParams(search);
  const shop: ViewType = { type: 'shop', filterBrand: '', filterSubCategory: '', filterCategory: '', searchQuery: p.get('q') || '', promoOnly: p.get('promo') === '1', isNewOnly: p.get('nouveautes') === '1', brandId: '', subCategoryId: '', category: '' };
  if (path === '/') return { type: 'home' }; if (parts[0] === 'boutique' || parts[0] === 'nos-marques' || parts[0] === 'nos-marque') return shop;
  if (parts[0] === 'marque' && parts[1]) return parts[2] ? { type: 'subcategory', brandSlug: parts[1], subCategorySlug: parts[2] } : { type: 'brand', brandSlug: parts[1] };
  if (parts[0] === 'produit' && parts[1]) return { type: 'product', productId: parts[1] }; if (parts[0] === 'panier') return { type: 'cart' }; if (parts[0] === 'checkout') return { type: 'checkout' };
  if (parts[0] === 'connexion') return { type: 'auth', mode: 'login' }; if (parts[0] === 'inscription') return { type: 'auth', mode: 'register' }; if (parts[0] === 'mot-de-passe-oublie') return { type: 'auth', mode: 'forgot' };
  if (parts[0] === 'compte') return { type: 'account', tab: (p.get('onglet') as 'orders' | 'profile' | 'addresses' | 'reviews') || 'profile' }; if (parts[0] === 'administration') return { type: 'admin', tab: 'dashboard' };
  if (parts[0] === 'apropos' || parts[0] === 'a-propos') return { type: 'about' }; if (parts[0] === 'contact') return { type: 'contact' }; if (parts[0] === 'livraison') return { type: 'shipping' }; if (parts[0] === 'mentions-legales') return { type: 'legal' }; return { type: 'home' };
};
const safeStorageSet = (key: string, value: unknown): void => {
  try { localStorage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value)); }
  catch (error) { console.warn('Stockage local plein, donnees conservees par le serveur:', error); }
};

const parseStoredCollection = <T,>(key: string): T[] => {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    return JSON.parse(raw) as T[];
  } catch {
    return [];
  }
};


const normalizeBrandKey = (brand: Brand) => {
  const name = String(brand.name || '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/^brand[\\s-]+/, '')
    .replace(/[^a-z0-9]+/g, '');
  const slug = String(brand.slug || '').trim().toLowerCase().replace(/^brand-+/, '');
  return name || slug;
};

const mergeBrandsFromApi = (apiBrands: Brand[]): Brand[] => {
  const storedBrands = parseStoredCollection<Brand>(LOCAL_STORAGE_KEYS.BRANDS);
  const byKey = new Map<string, Brand>();

  for (const brand of INITIAL_BRANDS) byKey.set(normalizeBrandKey(brand), brand);
  for (const brand of apiBrands) {
    const key = normalizeBrandKey(brand);
    const current = byKey.get(key);
    byKey.set(key, { ...current, ...brand });
  }
  for (const brand of storedBrands) {
    const key = normalizeBrandKey(brand);
    const current = byKey.get(key);
    if (!current) byKey.set(key, brand);
  }

  return Array.from(byKey.values()).map((brand) => {
    const init = INITIAL_BRANDS.find((item) => normalizeBrandKey(item) === normalizeBrandKey(brand));
    return {
      ...brand,
      logoUrl: brand.logoUrl || (init && init.logoUrl) || '',
      bannerUrl: brand.bannerUrl || (init && init.bannerUrl) || '',
      status: brand.status || 'active',
    };
  });
};

const normalizeSubCategoryKey = (sub: SubCategory) => {
  const id = String(sub.id || '').trim().toLowerCase();
  const slug = String(sub.slug || '').trim().toLowerCase();
  return id || slug;
};

const mergeSubCategoriesFromApi = (apiSubCategories: SubCategory[]): SubCategory[] => {
  const storedSubCategories = parseStoredCollection<SubCategory>(LOCAL_STORAGE_KEYS.SUBCATEGORIES);
  const byKey = new Map<string, SubCategory>();

  for (const sub of INITIAL_SUBCATEGORIES) {
    byKey.set(normalizeSubCategoryKey(sub), sub);
    if (sub.slug) byKey.set(sub.slug.toLowerCase(), sub);
    if (sub.id) byKey.set(sub.id.toLowerCase(), sub);
  }

  // Cached data is only a fallback; the server response below is authoritative after edits.
  for (const sub of storedSubCategories) {
    const key = normalizeSubCategoryKey(sub);
    const current = byKey.get(key) || (sub.slug ? byKey.get(sub.slug.toLowerCase()) : undefined) || (sub.id ? byKey.get(sub.id.toLowerCase()) : undefined);
    const cleanImageUrl = sub.imageUrl && sub.imageUrl.startsWith('/uploads/') ? (current?.imageUrl || '') : (sub.imageUrl ?? current?.imageUrl ?? '');
    const merged = { ...current, ...sub, imageUrl: cleanImageUrl };
    byKey.set(key, merged);
    if (sub.slug) byKey.set(sub.slug.toLowerCase(), merged);
    if (sub.id) byKey.set(sub.id.toLowerCase(), merged);
  }

  // API data wins over stale localStorage values, including the latest image upload.
  for (const sub of apiSubCategories) {
    const key = normalizeSubCategoryKey(sub);
    const current = byKey.get(key) || (sub.slug ? byKey.get(sub.slug.toLowerCase()) : undefined) || (sub.id ? byKey.get(sub.id.toLowerCase()) : undefined);
    const cleanImageUrl = sub.imageUrl && sub.imageUrl.startsWith('/uploads/') ? (current?.imageUrl || '') : (sub.imageUrl ?? current?.imageUrl ?? '');
    const merged = { ...current, ...sub, imageUrl: cleanImageUrl };
    byKey.set(key, merged);
    if (sub.slug) byKey.set(sub.slug.toLowerCase(), merged);
    if (sub.id) byKey.set(sub.id.toLowerCase(), merged);
  }

  const unique = new Map<string, SubCategory>();
  for (const sub of byKey.values()) {
    if (sub && sub.id) {
      const init = INITIAL_SUBCATEGORIES.find((item) => item.id === sub.id || item.slug === sub.slug);
      unique.set(sub.id, {
        ...sub,
        imageUrl: sub.imageUrl || (init && init.imageUrl) || '',
        status: sub.status || 'active',
      });
    }
  }

  return Array.from(unique.values());
};

const normalizeCustomer = (value: unknown): Customer | null => {
  if (!value || typeof value !== 'object') return null;
  const candidate = value as Partial<Customer> & { addresses: unknown; address: unknown; city: unknown; postalCode: unknown };
  let rawAddresses: unknown[] = [];
  if (Array.isArray(candidate.addresses)) rawAddresses = candidate.addresses;
  const addresses = rawAddresses
    .filter((entry) => Boolean(entry) && typeof entry === 'object')
    .map((entry) => {
      const addressEntry = entry as Record<string, unknown>;
      let postalCode: string | undefined = undefined;
      if (typeof addressEntry.postalCode === 'string') postalCode = addressEntry.postalCode;
      return {
        label: String(addressEntry.label || 'Adresse principale'),
        address: String(addressEntry.address || ''),
        city: String(addressEntry.city || ''),
        postalCode,
        isDefault: Boolean(addressEntry.isDefault),
      };
    });
  // Phone and lastName are optional in the database; it must not invalidate a session or user record.
  if (!candidate.id || !candidate.firstName || !candidate.email || !candidate.role) return null;
  let role: 'customer' | 'admin' = 'customer';
  if (String(candidate.role).toLowerCase() === 'admin' || String(candidate.email).toLowerCase() === 'admin@espacepastel.tn') role = 'admin';
  let address: string | undefined = undefined;
  if (typeof candidate.address === 'string') address = candidate.address;
  let city: string | undefined = undefined;
  if (typeof candidate.city === 'string') city = candidate.city;
  let postalCode: string | undefined = undefined;
  if (typeof candidate.postalCode === 'string') postalCode = candidate.postalCode;
  return {
    id: String(candidate.id),
    firstName: String(candidate.firstName),
    lastName: String(candidate.lastName || ''),
    email: String(candidate.email),
    phone: String(candidate.phone || ''),
    role,
    addresses,
    address,
    city,
    postalCode,
    createdAt: String(candidate.createdAt || new Date().toISOString()),
    ordersCount: typeof candidate.ordersCount === 'number' ? candidate.ordersCount : undefined,
    totalSpent: typeof candidate.totalSpent === 'number' ? candidate.totalSpent : undefined,
  };
};

const API_URL = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');
const apiPath = (path: string): string => {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${API_URL}${cleanPath}`;
};

const getAuthToken = (): string => localStorage.getItem('espace_pastel_auth_token') || 'dev-admin-token';

const authHeaders = (jsonBody = false): Record<string, string> => {
  const headers: Record<string, string> = {};
  if (jsonBody) headers['Content-Type'] = 'application/json';
  const token = getAuthToken();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  return headers;
};

const DEMO_PRODUCT_IDS = new Set([
  'prod-bomi-cahier-a4', 'prod-bomi-stylo-gel', 'prod-bomi-crayons-couleurs',
  'prod-bomi-sac-scolaire', 'prod-bomi-trousse-double', 'prod-wama-carnet-cuir',
  'prod-wama-surligneurs-pastel', 'prod-wama-set-bureau',
  'prod-fourniture-classeur-levier', 'prod-fourniture-bloc-notes',
  'prod-fourniture-kit-geometrie', 'prod-arts-coffret-aquarelle',
  'prod-arts-set-pinceaux', 'prod-arts-carnet-croquis',
  'prod-arts-toile-chassis', 'prod-arts-marqueurs-alcool'
]);

const withoutDemoProducts = <T extends Partial<Product>>(products: T[]): T[] =>
  products.filter((product) => !DEMO_PRODUCT_IDS.has(String(product?.id)));
const isUsableProduct = (product: Partial<Product> | null | undefined): product is Product =>
  Boolean(product && product.id && product.name);

const isPublishedProduct = (product: Product): boolean => {
  const status = String(product.status || '').trim().toLowerCase();
  return !status || !['deleted', 'archived', 'inactive'].includes(status);
};

const mergeByIdProducts = (primary: Product[], secondary: Product[]): Product[] => {
  const map = new Map<string, Product>();
  for (const item of secondary) {
    if (item?.id) map.set(item.id, item);
  }
  for (const item of primary) {
    if (item?.id) map.set(item.id, item);
  }
  return Array.from(map.values()).sort((a, b) => String(b.createdAt || '').localeCompare(String(a.createdAt || '')));
};

const syncApiMutation = (method: string, endpoint: string, body: unknown | undefined) => {
  const headers = authHeaders(body !== undefined);
  let payload: string | undefined = undefined;
  if (body !== undefined) payload = JSON.stringify(body);
  return fetch(apiPath(endpoint), {
    method,
    headers,
    body: payload,
  }).catch((err) => {
    console.warn(`Erreur sync API ${method} ${endpoint}:`, err);
  });
};

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Navigation state
  const [currentView, setCurrentView] = useState<ViewType>(() => {
    if (window.location.pathname !== '/') return pathToView(window.location.pathname, window.location.search);
    const saved = localStorage.getItem(LOCAL_STORAGE_KEYS.VIEW);
    if (saved) {
      try {
        return JSON.parse(saved) as ViewType;
      } catch {
        return { type: 'home' };
      }
    }
    return { type: 'home' };
  });
  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Domain state with local storage fallback
  const [brands, setBrands] = useState<Brand[]>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEYS.BRANDS);
    if (saved) {
      try {
        const parsed: Brand[] = JSON.parse(saved);
        if (parsed.length > 0) return mergeBrandsFromApi(parsed);
      } catch {
        return INITIAL_BRANDS;
      }
    }
    return INITIAL_BRANDS;
  });

  const [subCategories, setSubCategories] = useState<SubCategory[]>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEYS.SUBCATEGORIES);
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as SubCategory[];
        if (parsed.length > 0) return mergeSubCategoriesFromApi(parsed);
      } catch {
        return INITIAL_SUBCATEGORIES;
      }
    }
    return INITIAL_SUBCATEGORIES;
  });

  const [catalogLoading, setCatalogLoading] = useState(true);

  // Le catalogue produit vient toujours de l’API serveur : aucune image ne dépend du navigateur.
  const [products, setProducts] = useState<Product[]>(() => withoutDemoProducts(INITIAL_PRODUCTS));

  const [reviews, setReviews] = useState<Review[]>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEYS.REVIEWS);
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as Review[];
        if (parsed.length > 0) return parsed;
      } catch {
        return INITIAL_REVIEWS;
      }
    }
    return INITIAL_REVIEWS;
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEYS.ORDERS);
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as Order[];
        if (parsed.length > 0) return parsed;
      } catch {
        return INITIAL_ORDERS;
      }
    }
    return INITIAL_ORDERS;
  });

  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEYS.CART);
    if (saved) {
      try {
        return JSON.parse(saved) as CartItem[];
      } catch {
        return [];
      }
    }
    return [];
  });

  const [wishlist, setWishlist] = useState<string[]>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEYS.WISHLIST);
    if (saved) {
      try {
        return JSON.parse(saved) as string[];
      } catch {
        return [];
      }
    }
    return [];
  });

  const [toasts, setToasts] = useState<ToastNotification[]>([]);
  const [adminUsers, setAdminUsers] = useState<Customer[]>([]);

  const [currentUser, setCurrentUser] = useState<Customer | null>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEYS.USER);
    if (!saved) return null;
    try {
      return normalizeCustomer(JSON.parse(saved));
    } catch {
      return null;
    }
  });

  // Reactive LocalStorage persistence
  useEffect(() => {
    safeStorageSet(LOCAL_STORAGE_KEYS.BRANDS, brands);
  }, [brands]);

  useEffect(() => {
    safeStorageSet(LOCAL_STORAGE_KEYS.SUBCATEGORIES, subCategories);
  }, [subCategories]);


  useEffect(() => {
    safeStorageSet(LOCAL_STORAGE_KEYS.REVIEWS, reviews);
  }, [reviews]);

  useEffect(() => {
    safeStorageSet(LOCAL_STORAGE_KEYS.ORDERS, orders);
  }, [orders]);

  useEffect(() => {
    safeStorageSet(LOCAL_STORAGE_KEYS.CART, cart);
  }, [cart]);

  useEffect(() => {
    safeStorageSet(LOCAL_STORAGE_KEYS.WISHLIST, wishlist);
  }, [wishlist]);

  useEffect(() => {
    safeStorageSet(LOCAL_STORAGE_KEYS.USER, currentUser);
  }, [currentUser]);

  useEffect(() => {
    let cancelled = false;
    const hydrateCurrentUser = async () => {
      const token = localStorage.getItem('espace_pastel_auth_token');
      if (!token) return;
      try {
        const response = await fetch(apiPath('/api/auth/me'), {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) return;
        const data = await response.json();
        if (!cancelled) {
          const normalized = normalizeCustomer(data);
          if (normalized) setCurrentUser(normalized);
        }
      } catch {
        /* keep local fallback */
      }
    };
    void hydrateCurrentUser();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    let cancelled = false;
    const loadCatalog = async () => {
      setCatalogLoading(true);
      try {
        const token = getAuthToken();
        const productHeaders: Record<string, string> = {};
        if (token) {
          productHeaders.Authorization = `Bearer ${token}`;
        }
        const [brandsResponse, subcategoriesResponse, productsResponse, adminProductsResponse] = await Promise.all([
          fetch(apiPath('/api/brands')),
          fetch(apiPath('/api/subcategories')),
          fetch(apiPath('/api/products')),
          currentUser?.role === 'admin'
            ? fetch(apiPath('/api/admin/products'), { headers: productHeaders })
            : Promise.resolve(null),
        ]);
        if (cancelled) return;

        if (brandsResponse.ok) {
          const apiBrands = await brandsResponse.json();
          if (Array.isArray(apiBrands) && apiBrands.length > 0) {
            setBrands(mergeBrandsFromApi(apiBrands));
          }
        }

        if (subcategoriesResponse.ok) {
          const apiSubcategories = await subcategoriesResponse.json();
          if (Array.isArray(apiSubcategories) && apiSubcategories.length > 0) {
            setSubCategories(mergeSubCategoriesFromApi(apiSubcategories));
          }
        }

        let nextProducts: Product[] | null = null;
        if (productsResponse.ok) {
          const apiProducts = await productsResponse.json();
          if (Array.isArray(apiProducts)) nextProducts = apiProducts.filter(isUsableProduct);
        }
        if (adminProductsResponse && adminProductsResponse.ok) {
          const adminProducts = await adminProductsResponse.json();
          if (Array.isArray(adminProducts)) {
            const published = (nextProducts || []).filter(isUsableProduct);
            const extras = adminProducts.filter(isUsableProduct);
            nextProducts = mergeByIdProducts(extras, published);
          }
        }
        // MySQL est la source de vérité : ne jamais réinjecter un produit supprimé depuis le cache navigateur.
        if (nextProducts) setProducts(nextProducts);
      } catch {
        /* keep local fallback */
      } finally {
        setCatalogLoading(false);
      }
    };
    void loadCatalog();
    const onVisible = () => {
      if (document.visibilityState === 'visible') void loadCatalog();
    };
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      cancelled = true;
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [currentUser?.role]);

  const refreshOrders = useCallback(async () => {
    const token = localStorage.getItem('espace_pastel_auth_token');
    try {
      const endpoint = currentUser?.role === 'admin' ? '/api/admin/orders' : '/api/orders';
      const headers: Record<string, string> = {};
      if (token) headers.Authorization = `Bearer ${token}`;
      const response = await fetch(apiPath(endpoint), { headers });
      if (!response.ok) return;
      const data = await response.json();
      if (Array.isArray(data)) {
        const sorted = [...data].sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
        setOrders(sorted);
      }
    } catch {
      /* keep local fallback */
    }
  }, [currentUser?.role]);

  const refreshAdminUsers = useCallback(async () => {
    const token = localStorage.getItem('espace_pastel_auth_token') || 'dev-admin-token';
    try {
      const response = await fetch(apiPath('/api/admin/users'), {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!response.ok) return;
      const data = await response.json();
      if (Array.isArray(data)) {
        const mapped = data.map(normalizeCustomer).filter(Boolean) as Customer[];
        setAdminUsers(mapped);
      }
    } catch {
      /* keep local fallback */
    }
  }, []);

  // Chargement prioritaire du catalogue : ne pas attendre les marques ou le back-office.
  useEffect(() => {
    let cancelled = false;
    const url = apiPath('/api/products?limit=500');
    const apply = (data: unknown) => {
      if (!cancelled && Array.isArray(data)) {
        setProducts(data.filter(isUsableProduct));
        setCatalogLoading(false);
      }
    };
    const load = async () => {
      try {
        const response = await fetch(url);
        if (!response.ok) return;
        apply(await response.json());
      } catch { /* le chargement complet conserve le cache local */ }
    };
    void load();    return () => { cancelled = true; };
  }, []);
  useEffect(() => {
    void refreshOrders();
  }, [refreshOrders]);

  // Auto-refresh admin data so new orders/products appear without a manual reload.
  useEffect(() => {
    if (currentUser?.role !== 'admin') return;
    const timer = window.setInterval(() => {
      void refreshOrders();
      if (document.visibilityState === 'visible') window.dispatchEvent(new Event('visibilitychange'));
    }, 30000);
    return () => window.clearInterval(timer);
  }, [currentUser?.role, refreshOrders]);







  // Toast Helpers
  const addToast = (message: string, type: 'success' | 'info' | 'warning' | 'error' = 'success') => {
    const id = 'toast-' + Math.random().toString(36).substring(2, 9);
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      removeToast(id);
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const navigateTo = (view: ViewType) => {
    setCurrentView(view);
    safeStorageSet(LOCAL_STORAGE_KEYS.VIEW, view);
    const nextPath = viewToPath(view);
    if (window.location.pathname + window.location.search !== nextPath) window.history.pushState({}, '', nextPath);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    const handlePopState = () => setCurrentView(pathToView(window.location.pathname, window.location.search));
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Cart operations
  const colorKey = (color?: { name: string; hex: string }) => color ? color.name + '__' + color.hex : '__no_color__';

  const addToCart = (product: Product, quantity = 1, selectedSize?: string, selectedColor?: { name: string; hex: string }) => {
    setCart(prev => {
      const existing = prev.find(item => item.productId === product.id && item.selectedSize === selectedSize && colorKey(item.selectedColor) === colorKey(selectedColor));
      if (existing) {
        return prev.map(item => {
          if (item.productId === product.id && item.selectedSize === selectedSize && colorKey(item.selectedColor) === colorKey(selectedColor)) {
            return { ...item, quantity: item.quantity + quantity };
          }
          return item;
        });
      }
      return [...prev, { productId: product.id, product, quantity, selectedSize, selectedColor }];
    });
    addToast(product.name + " ajouté au panier ✓", "success");
    setIsCartDrawerOpen(true);
  };

  const updateCartQuantity = (productId: string, quantity: number, selectedSize?: string, selectedColor?: { name: string; hex: string }) => {
    if (quantity <= 0) {
      removeFromCart(productId, selectedSize, selectedColor);
      return;
    }
    setCart(prev =>
      prev.map(item => {
        if (item.productId === productId && item.selectedSize === selectedSize && colorKey(item.selectedColor) === colorKey(selectedColor)) {
          return { ...item, quantity };
        }
        return item;
      })
    );
  };

  const removeFromCart = (productId: string, selectedSize?: string, selectedColor?: { name: string; hex: string }) => {
    setCart(prev => {
      const next = prev.filter(item => !(item.productId === productId && item.selectedSize === selectedSize && colorKey(item.selectedColor) === colorKey(selectedColor)));
      if (next.length === 0) {
        setAppliedPromoCodeState(null);
        if (typeof window !== 'undefined') {
          window.localStorage.removeItem('espace_pastel_promo_code');
        }
      }
      return next;
    });
  };

  const [appliedPromoCode, setAppliedPromoCodeState] = useState<string | null>(() => {
    if (typeof window === 'undefined') return null;
    return window.localStorage.getItem('espace_pastel_promo_code') || null;
  });

  const getCartItemUnitPrice = (item: CartItem) => {
    const basePrice = Number(item.product.promoPrice ?? item.product.price);
    const productCode = String(item.product.promoCode || '').trim().toUpperCase();
    const percent = Number(item.product.promoDiscountPercent || 0);
    const activeCode = (appliedPromoCode || '').trim().toUpperCase();
    return activeCode && productCode === activeCode && percent > 0
      ? basePrice * (1 - Math.min(100, percent) / 100)
      : basePrice;
  };

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const cartSubtotal = cart.reduce((sum, item) => {
    const unitPrice = item.product.promoPrice || item.product.price;
    return sum + unitPrice * item.quantity;
  }, 0);

  const promoDiscountAmount = cart.reduce((sum, item) => {
    const basePrice = Number(item.product.promoPrice ?? item.product.price);
    return sum + Math.max(0, basePrice - getCartItemUnitPrice(item)) * item.quantity;
  }, 0);

  const discountedSubtotal = Math.max(0, cartSubtotal - promoDiscountAmount);

  const applyPromoCode = (rawCode: string) => {
    const code = rawCode.trim().toUpperCase();
    if (!code) {
      return { success: false, message: 'Veuillez saisir un code promo.', matchesCount: 0 };
    }
    const catalogMatches = products.filter(
      p => String(p.promoCode || '').trim().toUpperCase() === code && Number(p.promoDiscountPercent || 0) > 0
    );
    if (catalogMatches.length === 0) {
      return { success: false, message: 'Code promo introuvable ou expiré.', matchesCount: 0 };
    }
    setAppliedPromoCodeState(code);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('espace_pastel_promo_code', code);
    }
    const cartMatches = cart.filter(
      item => String(item.product.promoCode || '').trim().toUpperCase() === code && Number(item.product.promoDiscountPercent || 0) > 0
    );
    if (cartMatches.length > 0) {
      return { success: true, message: `Code ${code} appliqué sur ${cartMatches.length} produit(s) éligible(s).`, matchesCount: cartMatches.length };
    }
    return { success: true, message: `Code ${code} activé ! La remise s'appliquera dès l'ajout des articles concernés au panier.`, matchesCount: 0 };
  };

  const removePromoCode = () => {
    setAppliedPromoCodeState(null);
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem('espace_pastel_promo_code');
    }
  };

  const clearCart = () => {
    setCart([]);
    removePromoCode();
  };

  // Wishlist
  const toggleWishlist = (productId: string) => {
    setWishlist(prev => {
      const exists = prev.includes(productId);
      if (exists) {
        addToast('Retiré de vos favoris', 'info');
        return prev.filter(id => id !== productId);
      } else {
        addToast('Ajouté à vos favoris ❤️', 'success');
        return [...prev, productId];
      }
    });
  };

  const isInWishlist = (productId: string) => wishlist.includes(productId);

  const isAdmin = Boolean(currentUser && (currentUser.role === 'admin' || currentUser.email.toLowerCase() === 'admin@espacepastel.tn'));

  // Auth

  const setIsAdminMode = (admin: boolean) => {
    if (admin) {
      safeStorageSet('espace_pastel_auth_token', 'dev-admin-token');
      setCurrentUser(INITIAL_CUSTOMERS[1]); // Admin user
      addToast('Mode Administrateur activé', 'info');
    } else {
      localStorage.removeItem('espace_pastel_auth_token');
      setCurrentUser(INITIAL_CUSTOMERS[0]); // Customer user
      addToast('Mode Client activé', 'info');
    }
  };

  const login = (email: string, role: 'customer' | 'admin' = 'customer') => {
    if (email.toLowerCase().includes('admin') || role === 'admin') {
      safeStorageSet('espace_pastel_auth_token', 'dev-admin-token');
      setCurrentUser(INITIAL_CUSTOMERS[1]);
      addToast('Bienvenue dans l\'administration Espace Pastel', 'success');
      return true;
    }
    const customer = INITIAL_CUSTOMERS.find(c => c.email.toLowerCase() === email.toLowerCase()) || {
      id: 'cust-' + Date.now(),
      firstName: email.split('@')[0],
      lastName: '',
      email,
      phone: '+216 58 260 515',
      role: 'customer',
      addresses: [{ label: 'Adresse principale', address: '23 Rue de la Liberté', city: 'Menzah 5' }],
      createdAt: new Date().toISOString()
    };
    setCurrentUser(customer);
    addToast(`Bonjour ${customer.firstName} !`, 'success');
    return true;
  };

  const logout = () => {
    localStorage.removeItem('espace_pastel_auth_token');
    setCurrentUser(null);
    addToast('Vous êtes déconnecté', 'info');
    navigateTo({ type: 'home' });
  };

  const createOrder = async (orderData: Omit<Order, 'id' | 'orderNumber' | 'createdAt'>): Promise<Order> => {
    const token = localStorage.getItem('espace_pastel_auth_token');
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (token) headers.Authorization = `Bearer ${token}`;

    const payload = {
      customer: orderData.customer,
            items: orderData.items.map((item) => ({
        productId: item.productId,
        productName: item.productName,
        quantity: item.quantity,
        price: item.price,
        image: item.image,
        selectedSize: item.selectedSize,
        selectedColor: item.selectedColor
      })), 
      paymentMethod: orderData.paymentMethod,
      promoCode: orderData.promoCode,
    };

    let serverOrder: any = null;
    try {
      const response = await fetch(apiPath('/api/orders'), {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
      });
      if (response.ok) {
        serverOrder = await response.json();
      }
    } catch {
      // local fallback
    }

    const newOrder: Order = {
      ...orderData,
      id: serverOrder?.id || ('ord-' + Date.now()),
      orderNumber: serverOrder?.orderNumber || ('EP-' + new Date().getFullYear() + '-' + Math.floor(1000 + Math.random() * 9000)),
      createdAt: serverOrder?.createdAt || new Date().toISOString(),
      subtotal: Number(serverOrder?.subtotal ?? orderData.subtotal),
      promoCode: serverOrder?.promoCode || orderData.promoCode,
      discountAmount: Number(serverOrder?.discountAmount ?? orderData.discountAmount ?? 0),
      shippingFee: Number(serverOrder?.shippingFee ?? orderData.shippingFee),
      total: Number(serverOrder?.total || orderData.total),
      status: serverOrder?.status || orderData.status,
    };

    setOrders((prev) => [newOrder, ...prev.filter((order) => order.id !== newOrder.id)]);
    clearCart();

    orderData.items.forEach((item) => {
      setProducts((prevProducts) =>
        prevProducts.map((p) => {
          if (p.id === item.productId) {
            const nextStock = Math.max(0, p.stock - item.quantity);
            return { ...p, stock: nextStock };
          }
          return p;
        }),
      );
    });

    addToast('Commande confirmée avec succès !', 'success');
    return newOrder;
  };

  // Helpers
  const formatPrice = (price: number): string => {
    return `${price.toFixed(3).replace('.', ',')} TND`;
  };

  const getBrandBySlug = (slug: string) =>
    brands.find(b => b.slug.toLowerCase() === slug.toLowerCase() || b.id === slug);

  const getBrandById = (id: string) =>
    brands.find(b => b.id === id || b.slug.toLowerCase() === id.toLowerCase());

  const getSubCategoriesByBrandId = (brandId: string) => {
    const brand = brands.find(b => b.id === brandId || b.slug.toLowerCase() === brandId.toLowerCase());
    const validBrandIds = brand ? [brand.id, brand.slug] : [brandId];
    return subCategories
      .filter(s => validBrandIds.includes(s.brandId) && s.status === 'active')
      .sort((a, b) => a.order - b.order);
  };

  const getSubCategoryBySlug = (brandId: string, subCategorySlug: string) => {
    const brand = brands.find(b => b.id === brandId || b.slug.toLowerCase() === brandId.toLowerCase());
    const validBrandIds = brand ? [brand.id, brand.slug] : [brandId];
    return subCategories.find(
      s => validBrandIds.includes(s.brandId) && (s.slug.toLowerCase() === subCategorySlug.toLowerCase() || s.id === subCategorySlug)
    );
  };

  const getProductsByBrand = (brandId: string) => {
    const brand = brands.find(b => b.id === brandId || b.slug.toLowerCase() === brandId.toLowerCase());
    const validBrandIds = brand ? [brand.id, brand.slug] : [brandId];
    return products.filter(p => validBrandIds.includes(p.brandId) && isPublishedProduct(p) && isUsableProduct(p));
  };

  const getProductsBySubCategory = (subCategoryId: string) => {
    const sub = subCategories.find(s => s.id === subCategoryId || s.slug.toLowerCase() === subCategoryId.toLowerCase());
    const validSubIds = sub ? [sub.id, sub.slug] : [subCategoryId];
    return products.filter(p => validSubIds.includes(p.subCategoryId) && isPublishedProduct(p) && isUsableProduct(p));
  };

  const getProductById = (id: string) =>
    products.find(p => p.id === id || p.slug === id);

  const getProductReviews = (productId: string, onlyApproved = true) => {
    return reviews.filter(r => r.productId === productId && (!onlyApproved || r.status === 'approved'));
  };

  // Product CRUD
  const addProduct = async (prodData: Omit<Product, 'id' | 'slug' | 'rating' | 'reviewCount' | 'createdAt'>): Promise<Product> => {
    const slug = prodData.name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    const localProduct: Product = {
      ...prodData,
      promoPrice: prodData.promoPrice || undefined,
      badge: prodData.badge === 'AUCUN' ? null : prodData.badge,
      status: 'published',
      features: prodData.features?.length ? prodData.features : ['Qualité certifiée Espace Pastel'],
      sizes: prodData.sizes || [],
      colors: prodData.colors || [],
      id: 'prod-' + Date.now(),
      slug: `${slug}-${Math.floor(100 + Math.random() * 900)}`,
      rating: 5.0,
      reviewCount: 0,
      createdAt: new Date().toISOString()
    };

    setProducts(prev => [localProduct, ...prev.filter((item) => item.id !== localProduct.id)]);

    try {
      const res = await fetch(apiPath('/api/admin/products'), {
        method: 'POST',
        headers: authHeaders(true),
        body: JSON.stringify({
          ...localProduct,
          promoPrice: localProduct.promoPrice ?? null,
          badge: localProduct.badge || null,
          status: 'published',
        }),
      });
      if (res.ok) {
        const saved = await res.json();
        const published = isUsableProduct(saved) ? saved : localProduct;
        setProducts(prev => [published, ...prev.filter(p => p.id !== localProduct.id && p.id !== published.id)]);
        try {
          const catalogRes = await fetch(apiPath('/api/products'));
          if (catalogRes.ok) {
            const apiProducts = await catalogRes.json();
            if (Array.isArray(apiProducts) && apiProducts.length >= 0) {
              const fromApi = apiProducts.filter(isUsableProduct);
              setProducts(mergeByIdProducts(fromApi, [published]));
            }
          }
        } catch {
          /* keep saved product in state */
        }
        addToast(`Produit "${published.name}" publié dans la boutique`, 'success');
        return published;
      }
      setProducts(prev => prev.filter(p => p.id !== localProduct.id));
      const errBody = await res.json().catch(() => ({}));
      addToast((errBody as { error?: string }).error || 'Le produit n\'a pas pu être enregistré sur le serveur.', 'error');
      return localProduct;
    } catch {
      setProducts(prev => prev.filter(p => p.id !== localProduct.id));
      addToast('Connexion serveur impossible. Le produit n\'est pas publié.', 'error');
      return localProduct;
    }
  };

  const updateProduct = async (id: string, updates: Partial<Product>) => {
    const normalized = {
      ...updates,
      badge: updates.badge === 'AUCUN' ? null : updates.badge,
    };
    setProducts(prev => prev.map(p => p.id === id ? { ...p, ...normalized } : p));

    try {
      const res = await fetch(apiPath(`/api/admin/products/${id}`), {
        method: 'PATCH',
        headers: authHeaders(true),
        body: JSON.stringify(normalized),
      });
      if (res.ok) {
        const saved = await res.json();
        if (isUsableProduct(saved)) {
          setProducts(prev => prev.map(p => p.id === id ? { ...p, ...saved } : p));
        }
        // Recharger la liste publique pour propager immédiatement la nouvelle image.
        try {
          const catalogRes = await fetch(apiPath('/api/products?limit=500'));
          if (catalogRes.ok) {
            const catalog = await catalogRes.json();
            if (Array.isArray(catalog)) setProducts(catalog.filter(isUsableProduct));
          }
        } catch { /* conserver l'image reçue dans la réponse PATCH */ }
        addToast('Produit mis à jour avec succès', 'success');
        return;
      } else {
        const errBody = await res.json().catch(() => ({}));
        addToast((errBody as { error?: string }).error || 'Mise à jour serveur échouée.', 'error');
      }
    } catch {
      addToast('Mise à jour enregistrée localement. Vérifiez la connexion serveur.', 'warning');
    }
  };

  const deleteProduct = async (id: string) => {
    const target = products.find(p => p.id === id);

    try {
      const res = await fetch(apiPath(`/api/admin/products/${id}`), {
        method: 'DELETE',
        headers: authHeaders(false),
      });
      if (!res.ok && res.status !== 204) {
        addToast('Suppression serveur échouée. Réessayez après reconnexion admin.', 'error');
        return;
      }
      setProducts(prev => prev.filter(p => p.id !== id));
      setCart(prev => prev.filter(item => item.productId !== id));
      addToast(`Produit "${(target && target.name) || ''}" retiré de la boutique`, 'info');
    } catch {
      addToast('Impossible de supprimer le produit. Vérifiez la connexion serveur.', 'error');
    }
  };

  // Brand CRUD
  const addBrand = async (brandData: Omit<Brand, 'id' | 'slug'>): Promise<Brand> => {
    const slug = brandData.name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    const newBrand: Brand = {
      ...brandData,
      id: 'brand-' + Date.now(),
      slug: `${slug}-${Math.floor(100 + Math.random() * 900)}`
    };

    setBrands(prev => [...prev, newBrand]);
    await syncApiMutation('POST', '/api/admin/brands', newBrand);
    addToast(`Marque "${newBrand.name}" ajoutee`, 'success');
    return newBrand;
  };

  const updateBrand = async (id: string, updates: Partial<Brand>): Promise<void> => {
    setBrands(prev =>
      prev.map(b => {
        if (b.id === id) return { ...b, ...updates };
        return b;
      })
    );
    syncApiMutation('PATCH', `/api/admin/brands/${id}`, updates);
    addToast('Marque mise a jour', 'success');
  };

  const deleteBrand = async (id: string): Promise<void> => {
    const target = brands.find(b => b.id === id);
    setBrands(prev => prev.filter(b => b.id !== id));
    syncApiMutation('DELETE', `/api/admin/brands/${id}`);
    addToast(`Marque "${(target && target.name) || ''}" supprimee`, 'info');
  };

  // SubCategory CRUD — même logique que addBrand / updateBrand
  const addSubCategory = async (subData: Omit<SubCategory, 'id' | 'slug'>): Promise<SubCategory> => {
    const slug = subData.name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    const newSub: SubCategory = {
      ...subData,
      id: 'sub-' + Date.now(),
      slug: `${slug}-${Math.floor(100 + Math.random() * 900)}`
    };

    setSubCategories(prev => [...prev, newSub]);
    await syncApiMutation('POST', '/api/admin/subcategories', newSub);
    addToast(`Sous-catégorie "${newSub.name}" ajoutée`, 'success');
    return newSub;
  };

  const updateSubCategory = async (id: string, updates: Partial<SubCategory>): Promise<void> => {
    setSubCategories(prev =>
      prev.map(s => (s.id === id || s.slug === id ? { ...s, ...updates } : s))
    );
    await syncApiMutation('PATCH', `/api/admin/subcategories/${id}`, updates);
    addToast('Sous-catégorie mise à jour', 'success');
  };

  const deleteSubCategory = async (id: string): Promise<void> => {
    const target = subCategories.find(s => s.id === id || s.slug === id);
    const removedIds = new Set(subCategories.filter(s => s.id === id || s.slug === id).map(s => s.id));
    removedIds.add(id);
    setSubCategories(prev => prev.filter(s => s.id !== id && s.slug !== id));
    setProducts(prev => prev.filter(product => !removedIds.has(product.subCategoryId)));
    setCart(prev => prev.filter(item => !removedIds.has(item.product.subCategoryId)));
    await syncApiMutation('DELETE', `/api/admin/subcategories/${id}`, undefined);
    addToast(`Sous-catégorie "${(target && target.name) || ''}" supprimée`, 'info');
  };

  const syncAllSubCategoriesToServer = async (): Promise<boolean> => {
    try {
      const res = await fetch(apiPath('/api/admin/subcategories/sync-all'), {
        method: 'POST',
        headers: authHeaders(true),
        body: JSON.stringify(subCategories),
      });
      if (res.ok) {
        const data = await res.json();
        if (data && Array.isArray(data.subcategories) && data.subcategories.length > 0) {
          setSubCategories(data.subcategories);
          try {
            safeStorageSet(LOCAL_STORAGE_KEYS.SUBCATEGORIES, data.subcategories);
          } catch {}
        }
        addToast('Toutes les catégories et images sont synchronisées et publiées sur le site public !', 'success');
        return true;
      } else {
        const err = await res.json().catch(() => ({}));
        addToast(err.error || 'Erreur lors de la synchronisation serveur.', 'error');
      }
    } catch (e) {
      console.warn('Erreur syncAllSubCategoriesToServer:', e);
      addToast('Impossible de contacter le serveur pour la synchronisation.', 'error');
    }
    return false;
  };

  // Orders & Stocks
  const updateOrderStatus = (orderId: string, status: OrderStatus) => {
    setOrders(prev =>
      prev.map(o => {
        if (o.id === orderId) return { ...o, status };
        return o;
      })
    );
    syncApiMutation('PATCH', `/api/admin/orders/${orderId}/status`, { status });
    addToast(`Statut de commande mis a jour : ${status}`, 'success');
  };

  const deleteOrder = async (orderId: string) => {
    const target = orders.find(o => o.id === orderId);
    setOrders(prev => prev.filter(o => o.id !== orderId));
    try {
      const token = localStorage.getItem('espace_pastel_auth_token') || 'dev-admin-token';
      await fetch(apiPath(`/api/admin/orders/${orderId}`), {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
    } catch { /* keep optimistic */ }
    addToast(`Commande #${(target && target.orderNumber) || orderId} supprimée`, 'info');
  };

  const createAdminUser = async (userData: { firstName: string; lastName?: string; email: string; phone?: string; role: UserRole; password: string }): Promise<Customer> => {
    const token = localStorage.getItem('espace_pastel_auth_token') || 'dev-admin-token';
    const res = await fetch(apiPath('/api/admin/users'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(userData)
    });
    const data = await res.json();
    if (!res.ok) {
      const msg = data.error || 'Erreur lors de la création du compte client.';
      addToast(msg, 'error');
      throw new Error(msg);
    }
    const created: Customer = normalizeCustomer(data)!;
    setAdminUsers(prev => [created, ...prev]);
    addToast(`Client ${created.firstName} ${created.lastName} créé avec succès !`, 'success');
    return created;
  };

  const updateAdminUser = async (id: string, updates: { firstName: string; lastName?: string; email: string; phone?: string; role: UserRole; password?: string }) => {
    const token = localStorage.getItem('espace_pastel_auth_token') || 'dev-admin-token';
    const res = await fetch(apiPath(`/api/admin/users/${id}`), {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(updates)
    });
    const data = await res.json();
    if (!res.ok) {
      const msg = data.error || 'Erreur lors de la mise à jour du client.';
      addToast(msg, 'error');
      throw new Error(msg);
    }
    setAdminUsers(prev => prev.map(u => u.id === id ? { ...u, ...updates } : u));
    addToast('Client mis à jour avec succès !', 'success');
  };

  const deleteAdminUser = async (id: string) => {
    const token = localStorage.getItem('espace_pastel_auth_token') || 'dev-admin-token';
    const res = await fetch(apiPath(`/api/admin/users/${id}`), {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      const msg = data.error || 'Erreur lors de la suppression du client.';
      addToast(msg, 'error');
      throw new Error(msg);
    }
    setAdminUsers(prev => prev.filter(u => u.id !== id));
    addToast('Client supprimé avec succès.', 'info');
  };

  const updateProductStock = (productId: string, newStock: number) => {
    setProducts(prev =>
      prev.map(p => {
        if (p.id === productId) return { ...p, stock: Math.max(0, newStock) };
        return p;
      })
    );
    syncApiMutation('PATCH', `/api/admin/products/${productId}/stock`, { stock: Math.max(0, newStock) });
    addToast('Stock actualise', 'info');
  };

  // Review Management
  const addReview = (
    productId: string, 
    customerName: string, 
    customerEmail: string, 
    rating: number, 
    comment: string
  ) => {
    const prod = products.find(p => p.id === productId);
    const newRev: Review = {
      id: 'rev-' + Date.now(),
      productId,
      productName: (prod && prod.name) || 'Produit',
      customerName,
      customerEmail,
      rating,
      comment,
      date: new Date().toISOString().split('T')[0],
      status: 'pending'
    };

    setReviews(prev => [newRev, ...prev]);
    syncApiMutation('POST', `/api/products/${productId}/reviews`, { rating, comment });
    addToast('Merci pour votre avis ! Il sera visible après validation par notre équipe.', 'info');
  };

  const updateReviewStatus = (reviewId: string, status: ReviewStatus) => {
    setReviews(prev =>
      prev.map(r => {
        if (r.id === reviewId) return { ...r, status };
        return r;
      })
    );

    const targetReview = reviews.find(r => r.id === reviewId);
    if (targetReview) {
      const approvedProductReviews = reviews.filter(r => {
        if (r.productId !== targetReview.productId) return false;
        if (r.id === reviewId) return status === 'approved';
        return r.status === 'approved';
      });

      if (approvedProductReviews.length > 0) {
        const avg = approvedProductReviews.reduce((sum, r) => sum + r.rating, 0) / approvedProductReviews.length;
        setProducts(prev =>
          prev.map(p => {
            if (p.id === targetReview.productId) {
              return { ...p, rating: parseFloat(avg.toFixed(1)), reviewCount: approvedProductReviews.length };
            }
            return p;
          })
        );
      }
    }

    syncApiMutation('PATCH', `/api/admin/reviews/${reviewId}`, { status });
    let label = 'refusé';
    if (status === 'approved') label = 'approuvé';
    addToast(`Avis ${label}`, 'success');
  };

  const deleteReview = (reviewId: string) => {
    setReviews(prev => prev.filter(r => r.id !== reviewId));
    syncApiMutation('DELETE', `/api/admin/reviews/${reviewId}`);
    addToast('Avis supprimé', 'info');
  };

  const resetCatalogToDefault = () => {
    setBrands(INITIAL_BRANDS);
    setSubCategories(INITIAL_SUBCATEGORIES);
    setProducts(INITIAL_PRODUCTS);
    setReviews(INITIAL_REVIEWS);
    setOrders(INITIAL_ORDERS);
    localStorage.removeItem(LOCAL_STORAGE_KEYS.BRANDS);
    localStorage.removeItem(LOCAL_STORAGE_KEYS.SUBCATEGORIES);
    localStorage.removeItem(LOCAL_STORAGE_KEYS.PRODUCTS);
    localStorage.removeItem(LOCAL_STORAGE_KEYS.REVIEWS);
    localStorage.removeItem(LOCAL_STORAGE_KEYS.ORDERS);
    addToast('Catalogue réinitialisé avec les données de démonstration', 'info');
  };

  return (
    <StoreContext.Provider
      value={{
        currentView,
        navigateTo,
        brands,
        subCategories,
        products,
        catalogLoading,
        reviews,
        orders,
        refreshOrders,
        cart,
        cartCount,
        cartSubtotal,
        isCartDrawerOpen,
        setIsCartDrawerOpen,
        addToCart,
        updateCartQuantity,
        removeFromCart,
        clearCart,
        wishlist,
        toggleWishlist,
        isInWishlist,
        searchQuery,
        setSearchQuery,
        appliedPromoCode,
        applyPromoCode,
        removePromoCode,
        getCartItemUnitPrice,
        promoDiscountAmount,
        discountedSubtotal,
        createOrder,
        currentUser,
        setCurrentUser,
        login,
        logout,
        isAdmin,
        setIsAdminMode,
        addProduct,
        updateProduct,
        deleteProduct,
        addBrand,
        updateBrand,
        deleteBrand,
        addSubCategory,
        updateSubCategory,
        deleteSubCategory,
        syncAllSubCategoriesToServer,
        adminUsers,
        refreshAdminUsers,
        createAdminUser,
        updateAdminUser,
        deleteAdminUser,
        updateOrderStatus,
        deleteOrder,
        updateProductStock,
        addReview,
        updateReviewStatus,
        deleteReview,
        getBrandBySlug,
        getBrandById,
        getSubCategoriesByBrandId,
        getSubCategoryBySlug,
        getProductsByBrand,
        getProductsBySubCategory,
        getProductById,
        getProductReviews,
        formatPrice,
        toasts,
        addToast,
        removeToast,
        resetCatalogToDefault
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};











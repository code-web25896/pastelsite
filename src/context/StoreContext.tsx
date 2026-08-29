import React, { createContext, useContext, useState, useEffect } from 'react';
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
  reviews: Review[];
  orders: Order[];
  
  // Cart & Wishlist
  cart: CartItem[];
  cartCount: number;
  cartSubtotal: number;
  isCartDrawerOpen: boolean;
  setIsCartDrawerOpen: (open: boolean) => void;
  addToCart: (product: Product, quantity: number) => void;
  updateCartQuantity: (productId: string, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  wishlist: string[];
  toggleWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;

  // Search & Navigation helpers
  searchQuery: string;
  setSearchQuery: (query: string) => void;

  // Checkout
  createOrder: (orderData: Omit<Order, 'id' | 'orderNumber' | 'createdAt'>) => Promise<Order>;

  // Auth & User
  currentUser: Customer | null;
  setCurrentUser: (user: Customer | null) => void;
  login: (email: string, role: 'customer' | 'admin') => boolean;
  logout: () => void;
  isAdmin: boolean;
  setIsAdminMode: (admin: boolean) => void;

  // Admin CRUD for Products
  addProduct: (product: Omit<Product, 'id' | 'slug' | 'rating' | 'reviewCount' | 'createdAt'>) => Product;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  deleteProduct: (id: string) => void;

  // Admin CRUD for Brands
  addBrand: (brand: Omit<Brand, 'id' | 'slug'>) => Brand;
  updateBrand: (id: string, updates: Partial<Brand>) => void;
  deleteBrand: (id: string) => void;

  // Admin CRUD for SubCategories
  addSubCategory: (subCategory: Omit<SubCategory, 'id' | 'slug'>) => SubCategory;
  updateSubCategory: (id: string, updates: Partial<SubCategory>) => void;
  deleteSubCategory: (id: string) => void;

  // Order & Stock Management
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
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


const mergeBrandsFromApi = (apiBrands: Brand[]): Brand[] => {
  const storedBrands = parseStoredCollection<Brand>(LOCAL_STORAGE_KEYS.BRANDS);
  let sourceBrands = INITIAL_BRANDS;
  if (apiBrands.length > 0) sourceBrands = apiBrands;
  return sourceBrands.map((apiBrand) => {
    const stored = storedBrands.find((item) => item.id === apiBrand.id || item.slug === apiBrand.slug);
    const init = INITIAL_BRANDS.find((item) => item.id === apiBrand.id || item.slug === apiBrand.slug);
    return {
      ...init,
      ...apiBrand,
      ...stored,
      logoUrl: (stored && stored.logoUrl) || apiBrand.logoUrl || (init && init.logoUrl) || '',
      bannerUrl: (stored && stored.bannerUrl) || apiBrand.bannerUrl || (init && init.bannerUrl) || '',
    };
  });
};

const mergeSubCategoriesFromApi = (apiSubCategories: SubCategory[]): SubCategory[] => {
  const storedSubCategories = parseStoredCollection<SubCategory>(LOCAL_STORAGE_KEYS.SUBCATEGORIES);
  let sourceSubCategories = INITIAL_SUBCATEGORIES;
  if (apiSubCategories.length > 0) sourceSubCategories = apiSubCategories;
  return sourceSubCategories.map((apiSubCategory) => {
    const stored = storedSubCategories.find((item) => item.id === apiSubCategory.id || item.slug === apiSubCategory.slug);
    const init = INITIAL_SUBCATEGORIES.find((item) => item.id === apiSubCategory.id || item.slug === apiSubCategory.slug);
    return {
      ...init,
      ...apiSubCategory,
      ...stored,
      imageUrl: (stored && stored.imageUrl) || apiSubCategory.imageUrl || (init && init.imageUrl) || '',
    };
  });
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
  if (!candidate.id || !candidate.firstName || !candidate.lastName || !candidate.email || !candidate.phone || !candidate.role || !candidate.createdAt) return null;
  let role: 'customer' | 'admin' = 'customer';
  if (candidate.role === 'admin') role = 'admin';
  let address: string | undefined = undefined;
  if (typeof candidate.address === 'string') address = candidate.address;
  let city: string | undefined = undefined;
  if (typeof candidate.city === 'string') city = candidate.city;
  let postalCode: string | undefined = undefined;
  if (typeof candidate.postalCode === 'string') postalCode = candidate.postalCode;
  return {
    id: String(candidate.id),
    firstName: String(candidate.firstName),
    lastName: String(candidate.lastName),
    email: String(candidate.email),
    phone: String(candidate.phone),
    role,
    addresses,
    address,
    city,
    postalCode,
    createdAt: String(candidate.createdAt),
  };
};

const API_URL = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');
const apiPath = (path: string): string => {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${API_URL}${cleanPath}`;
};

const syncApiMutation = (method: string, endpoint: string, body: unknown | undefined) => {
  const token = localStorage.getItem('espace_pastel_auth_token') || 'dev-admin-token';
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  let payload: string | undefined = undefined;
  if (body !== undefined) payload = JSON.stringify(body);
  void fetch(apiPath(endpoint), {
    method,
    headers,
    body: payload,
  }).catch((err) => {
    console.warn(`Erreur sync API ${method} ${endpoint}:`, err);
  });
};

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Navigation state
  const [currentView, setCurrentView] = useState<ViewType>({ type: 'home' });
  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Domain state with local storage fallback
  const [brands, setBrands] = useState<Brand[]>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEYS.BRANDS);
    if (saved) {
      try {
        const parsed: Brand[] = JSON.parse(saved);
        if (parsed.length > 0) return parsed;
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
        if (parsed.length > 0) return parsed;
      } catch {
        return INITIAL_SUBCATEGORIES;
      }
    }
    return INITIAL_SUBCATEGORIES;
  });

  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEYS.PRODUCTS);
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as Product[];
        if (parsed.length > 0) {
          // Merge: add any INITIAL_PRODUCTS not already in localStorage
          const savedIds = new Set(parsed.map(p => p.id));
          const missing = INITIAL_PRODUCTS.filter(p => !savedIds.has(p.id));
          return missing.length > 0 ? [...parsed, ...missing] : parsed;
        }
      } catch {
        return INITIAL_PRODUCTS;
      }
    }
    return INITIAL_PRODUCTS;
  });

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
    localStorage.setItem(LOCAL_STORAGE_KEYS.BRANDS, JSON.stringify(brands));
  }, [brands]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEYS.SUBCATEGORIES, JSON.stringify(subCategories));
  }, [subCategories]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEYS.REVIEWS, JSON.stringify(reviews));
  }, [reviews]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEYS.ORDERS, JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEYS.CART, JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEYS.WISHLIST, JSON.stringify(wishlist));
  }, [wishlist]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEYS.USER, JSON.stringify(currentUser));
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
      try {
        const [brandsResponse, subcategoriesResponse, productsResponse] = await Promise.all([
          fetch(apiPath('/api/brands')),
          fetch(apiPath('/api/subcategories')),
          fetch(apiPath('/api/products')),
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

        if (productsResponse.ok) {
          const apiProducts = await productsResponse.json();
          if (Array.isArray(apiProducts) && apiProducts.length > 0) {
            setProducts(apiProducts);
          }
        }
      } catch {
        /* keep local fallback */
      }
    };
    void loadCatalog();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    let cancelled = false;
    const loadOrders = async () => {
      const token = localStorage.getItem('espace_pastel_auth_token');
      try {
        let endpoint = '/api/orders';
        if (currentUser && currentUser.role === 'admin') endpoint = '/api/admin/orders';
        const headers: Record<string, string> = {};
        if (token) headers.Authorization = `Bearer ${token}`;
        const response = await fetch(apiPath(endpoint), { headers });
        if (!response.ok) return;
        const data = await response.json();
        if (!cancelled && Array.isArray(data) && data.length > 0) {
          setOrders(data);
        }
      } catch {
        /* keep local fallback */
      }
    };
    void loadOrders();
    return () => { cancelled = true; };
  }, [currentUser?.role]);




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
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Cart operations
  const addToCart = (product: Product, quantity = 1) => {
    setCart(prev => {
      const existing = prev.find(item => item.productId === product.id);
      if (existing) {
        return prev.map(item => {
          if (item.productId === product.id) {
            return { ...item, quantity: item.quantity + quantity };
          }
          return item;
        });
      }
      return [...prev, { productId: product.id, product, quantity }];
    });
    addToast(`${product.name} ajouté au panier ✓`, 'success');
    setIsCartDrawerOpen(true);
  };

  const updateCartQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart(prev =>
      prev.map(item => {
        if (item.productId === productId) {
          return { ...item, quantity };
        }
        return item;
      })
    );
  };

  const removeFromCart = (productId: string) => {
    const item = cart.find(i => i.productId === productId);
    setCart(prev => prev.filter(i => i.productId !== productId));
    if (item) {
      addToast(`${item.product.name} retiré du panier`, 'info');
    }
  };

  const clearCart = () => {
    setCart([]);
  };

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const cartSubtotal = cart.reduce((sum, item) => {
    const unitPrice = item.product.promoPrice || item.product.price;
    return sum + unitPrice * item.quantity;
  }, 0);

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

  const isAdmin = Boolean(currentUser && currentUser.role === 'admin');

  // Auth

  const setIsAdminMode = (admin: boolean) => {
    if (admin) {
      localStorage.setItem('espace_pastel_auth_token', 'dev-admin-token');
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
      localStorage.setItem('espace_pastel_auth_token', 'dev-admin-token');
      setCurrentUser(INITIAL_CUSTOMERS[1]);
      addToast('Bienvenue dans l\'administration Espace Pastel', 'success');
      return true;
    }
    const customer = INITIAL_CUSTOMERS.find(c => c.email.toLowerCase() === email.toLowerCase()) || {
      id: 'cust-' + Date.now(),
      firstName: email.split('@')[0],
      lastName: '',
      email,
      phone: '55 542 000',
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
      })),
      paymentMethod: orderData.paymentMethod,
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
      subtotal: Number(serverOrder?.subtotal || orderData.subtotal),
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
    return products.filter(p => validBrandIds.includes(p.brandId) && p.status === 'published');
  };

  const getProductsBySubCategory = (subCategoryId: string) => {
    const sub = subCategories.find(s => s.id === subCategoryId || s.slug.toLowerCase() === subCategoryId.toLowerCase());
    const validSubIds = sub ? [sub.id, sub.slug] : [subCategoryId];
    return products.filter(p => validSubIds.includes(p.subCategoryId) && p.status === 'published');
  };

  const getProductById = (id: string) =>
    products.find(p => p.id === id || p.slug === id);

  const getProductReviews = (productId: string, onlyApproved = true) => {
    return reviews.filter(r => r.productId === productId && (!onlyApproved || r.status === 'approved'));
  };

  // Product CRUD
  const addProduct = (prodData: Omit<Product, 'id' | 'slug' | 'rating' | 'reviewCount' | 'createdAt'>): Product => {
    const slug = prodData.name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    const newProduct: Product = {
      ...prodData,
      id: 'prod-' + Date.now(),
      slug: `${slug}-${Math.floor(100 + Math.random() * 900)}`,
      rating: 5.0,
      reviewCount: 0,
      createdAt: new Date().toISOString().split('T')[0]
    };

    setProducts(prev => [newProduct, ...prev]);
    syncApiMutation('POST', '/api/admin/products', newProduct);
    addToast(`Produit "${newProduct.name}" créé avec succès`, 'success');
    return newProduct;
  };

  const updateProduct = (id: string, updates: Partial<Product>) => {
    setProducts(prev =>
      prev.map(p => {
        if (p.id === id) return { ...p, ...updates };
        return p;
      })
    );
    syncApiMutation('PATCH', `/api/admin/products/${id}`, updates);
    addToast('Produit mis à jour avec succès', 'success');
  };

  const deleteProduct = (id: string) => {
    const target = products.find(p => p.id === id);
    setProducts(prev => prev.filter(p => p.id !== id));
    syncApiMutation('DELETE', `/api/admin/products/${id}`);
    addToast(`Produit "${(target && target.name) || ''}" supprimé`, 'info');
  };

  // Brand CRUD
  const addBrand = (brandData: Omit<Brand, 'id' | 'slug'>): Brand => {
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
    syncApiMutation('POST', '/api/admin/brands', newBrand);
    addToast(`Marque "${newBrand.name}" ajoutee`, 'success');
    return newBrand;
  };

  const updateBrand = (id: string, updates: Partial<Brand>) => {
    setBrands(prev =>
      prev.map(b => {
        if (b.id === id) return { ...b, ...updates };
        return b;
      })
    );
    syncApiMutation('PATCH', `/api/admin/brands/${id}`, updates);
    addToast('Marque mise a jour', 'success');
  };

  const deleteBrand = (id: string) => {
    const target = brands.find(b => b.id === id);
    setBrands(prev => prev.filter(b => b.id !== id));
    syncApiMutation('DELETE', `/api/admin/brands/${id}`);
    addToast(`Marque "${(target && target.name) || ''}" supprimee`, 'info');
  };

  // SubCategory CRUD
  const addSubCategory = (subData: Omit<SubCategory, 'id' | 'slug'>): SubCategory => {
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
    syncApiMutation('POST', '/api/admin/subcategories', newSub);
    addToast(`Sous-categorie "${newSub.name}" creee`, 'success');
    return newSub;
  };

  const updateSubCategory = (id: string, updates: Partial<SubCategory>) => {
    setSubCategories(prev =>
      prev.map(s => {
        if (s.id === id) return { ...s, ...updates };
        return s;
      })
    );
    syncApiMutation('PATCH', `/api/admin/subcategories/${id}`, updates);
    addToast('Sous-categorie mise a jour', 'success');
  };

  const deleteSubCategory = (id: string) => {
    const target = subCategories.find(s => s.id === id);
    setSubCategories(prev => prev.filter(s => s.id !== id));
    syncApiMutation('DELETE', `/api/admin/subcategories/${id}`);
    addToast(`Sous-categorie "${(target && target.name) || ''}" supprimee`, 'info');
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
        reviews,
        orders,
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
        updateOrderStatus,
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











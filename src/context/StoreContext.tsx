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
  addToCart: (product: Product, quantity?: number) => void;
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
  login: (email: string, role?: 'customer' | 'admin') => boolean;
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
  getProductReviews: (productId: string, onlyApproved?: boolean) => Review[];
  formatPrice: (price: number) => string;

  // Toasts
  toasts: ToastNotification[];
  addToast: (message: string, type?: 'success' | 'info' | 'warning' | 'error') => void;
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
  USER: 'espace_pastel_user_v1',
};

const parseStoredCollection = <T,>(key: string): T[] => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) as T[] : [];
  } catch {
    return [];
  }
};

const mergeBrandsFromApi = (apiBrands: Brand[]): Brand[] => {
  const storedBrands = parseStoredCollection<Brand>(LOCAL_STORAGE_KEYS.BRANDS);
  const sourceBrands = apiBrands.length > 0 ? apiBrands : INITIAL_BRANDS;
  return sourceBrands.map((apiBrand) => {
    const stored = storedBrands.find((item) => item.id === apiBrand.id || item.slug === apiBrand.slug);
    const init = INITIAL_BRANDS.find((item) => item.id === apiBrand.id || item.slug === apiBrand.slug);
    return {
      ...init,
      ...apiBrand,
      ...stored,
      logoUrl: stored?.logoUrl || apiBrand.logoUrl || init?.logoUrl || '',
      bannerUrl: stored?.bannerUrl || apiBrand.bannerUrl || init?.bannerUrl || '',
    };
  });
};

const mergeSubCategoriesFromApi = (apiSubCategories: SubCategory[]): SubCategory[] => {
  const storedSubCategories = parseStoredCollection<SubCategory>(LOCAL_STORAGE_KEYS.SUBCATEGORIES);
  const sourceSubCategories = apiSubCategories.length > 0 ? apiSubCategories : INITIAL_SUBCATEGORIES;
  return sourceSubCategories.map((apiSubCategory) => {
    const stored = storedSubCategories.find((item) => item.id === apiSubCategory.id || item.slug === apiSubCategory.slug);
    const init = INITIAL_SUBCATEGORIES.find((item) => item.id === apiSubCategory.id || item.slug === apiSubCategory.slug);
    return {
      ...init,
      ...apiSubCategory,
      ...stored,
      imageUrl: stored?.imageUrl || apiSubCategory.imageUrl || init?.imageUrl || '',
    };
  });
};

const API_BASE = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');
const apiPath = (endpoint: string) => `${API_BASE}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
const syncApiMutation = (method: string, endpoint: string, body?: unknown) => {
  const token = localStorage.getItem('espace_pastel_auth_token');
  if (!token) return;
  void fetch(apiPath(endpoint), {
    method,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  }).catch(() => {});
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
        return parsed.map(b => {
          const init = INITIAL_BRANDS.find(ib => ib.id === b.id || ib.slug === b.slug);
          return {
            ...init,
            ...b,
            logoUrl: b.logoUrl || init?.logoUrl,
            bannerUrl: b.bannerUrl || init?.bannerUrl,
          };
        });
      } catch {
        return INITIAL_BRANDS;
      }
    }
    return INITIAL_BRANDS;
  });

  const [subCategories, setSubCategories] = useState<SubCategory[]>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEYS.SUBCATEGORIES);
    return saved ? JSON.parse(saved) : INITIAL_SUBCATEGORIES;
  });

  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEYS.PRODUCTS);
    return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
  });

  const [reviews, setReviews] = useState<Review[]>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEYS.REVIEWS);
    return saved ? JSON.parse(saved) : INITIAL_REVIEWS;
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEYS.ORDERS);
    return saved ? JSON.parse(saved) : INITIAL_ORDERS;
  });

  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEYS.CART);
    return saved ? JSON.parse(saved) : [];
  });

  const [wishlist, setWishlist] = useState<string[]>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEYS.WISHLIST);
    return saved ? JSON.parse(saved) : [];
  });

  const [currentUser, setCurrentUser] = useState<Customer | null>(() => {
    const token = localStorage.getItem('espace_pastel_auth_token');
    const saved = localStorage.getItem(LOCAL_STORAGE_KEYS.USER);
    return token && saved ? JSON.parse(saved) : null;
  });

  const [toasts, setToasts] = useState<ToastNotification[]>([]);

  // Sync to local storage
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
    const loadCatalog = async () => {
      try {
        const [brandsResponse, subcategoriesResponse] = await Promise.all([
          fetch(apiPath('/api/brands')),
          fetch(apiPath('/api/subcategories')),
        ]);
        if (!brandsResponse.ok || !subcategoriesResponse.ok) return;
        const [apiBrands, apiSubcategories] = await Promise.all([
          brandsResponse.json(),
          subcategoriesResponse.json(),
        ]);
        if (cancelled) return;
        if (Array.isArray(apiBrands)) setBrands(mergeBrandsFromApi(apiBrands));
        if (Array.isArray(apiSubcategories)) setSubCategories(mergeSubCategoriesFromApi(apiSubcategories));
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
      if (!token) return;
      try {
        const response = await fetch(apiPath('/api/orders'), {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) return;
        const data = await response.json();
        if (!cancelled && Array.isArray(data)) {
          setOrders(data);
        }
      } catch {
        /* keep local fallback */
      }
    };
    void loadOrders();
    return () => { cancelled = true; };
  }, [currentUser]);


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
        return prev.map(item =>
          item.productId === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { productId: product.id, product, quantity }];
    });
    addToast(`${product.name} ajoutÃƒÂ© au panier Ã¢Å“â€œ`, 'success');
    setIsCartDrawerOpen(true);
  };

  const updateCartQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart(prev =>
      prev.map(item =>
        item.productId === productId ? { ...item, quantity } : item
      )
    );
  };

  const removeFromCart = (productId: string) => {
    const item = cart.find(i => i.productId === productId);
    setCart(prev => prev.filter(i => i.productId !== productId));
    if (item) {
      addToast(`${item.product.name} retirÃƒÂ© du panier`, 'info');
    }
  };

  const clearCart = () => {
    setCart([]);
  };

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const cartSubtotal = cart.reduce((sum, item) => {
    const unitPrice = item.product.promoPrice ?? item.product.price;
    return sum + unitPrice * item.quantity;
  }, 0);

  // Wishlist
  const toggleWishlist = (productId: string) => {
    setWishlist(prev => {
      const exists = prev.includes(productId);
      if (exists) {
        addToast('RetirÃƒÂ© de vos favoris', 'info');
        return prev.filter(id => id !== productId);
      } else {
        addToast('AjoutÃƒÂ© ÃƒÂ  vos favoris Ã¢ÂÂ¤Ã¯Â¸Â', 'success');
        return [...prev, productId];
      }
    });
  };

  const isInWishlist = (productId: string) => wishlist.includes(productId);

  // Auth
  const isAdmin = currentUser?.role === 'admin';

  const setIsAdminMode = (admin: boolean) => {
    if (admin) {
      setCurrentUser(INITIAL_CUSTOMERS[1]); // Admin user
      addToast('Mode Administrateur activÃƒÂ©', 'info');
    } else {
      setCurrentUser(INITIAL_CUSTOMERS[0]); // Customer user
      addToast('Mode Client activÃƒÂ©', 'info');
    }
  };

  const login = (email: string, role: 'customer' | 'admin' = 'customer') => {
    if (email.toLowerCase().includes('admin') || role === 'admin') {
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
    addToast(Bonjour  !, 'success');
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
    if (!token) {
      throw new Error('Vous devez vous connecter pour passer une commande.');
    }

    const response = await fetch(apiPath('/api/orders'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        customer: orderData.customer,
        items: orderData.items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
        })),
        paymentMethod: orderData.paymentMethod,
      }),
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(data.error || 'Impossible de creer la commande.');
    }

    const newOrder: Order = {
      ...orderData,
      id: data.id,
      orderNumber: data.orderNumber,
      createdAt: new Date().toISOString(),
      subtotal: Number(data.subtotal ?? orderData.subtotal),
      shippingFee: Number(data.shippingFee ?? orderData.shippingFee),
      total: Number(data.total ?? orderData.total),
      status: data.status ?? orderData.status,
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

    addToast('Commande confirmee avec succes !', 'success');
    return newOrder;
  };



  // Helpers
  const formatPrice = (price: number): string => {
    return `${price.toFixed(3).replace('.', ',')} TND`;
  };

  const getBrandBySlug = (slug: string) => brands.find(b => b.slug.toLowerCase() === slug.toLowerCase());
  const getBrandById = (id: string) => brands.find(b => b.id === id);

  const getSubCategoriesByBrandId = (brandId: string) => 
    subCategories
      .filter(s => s.brandId === brandId && s.status === 'active')
      .sort((a, b) => a.order - b.order);

  const getSubCategoryBySlug = (brandId: string, subCategorySlug: string) =>
    subCategories.find(s => s.brandId === brandId && s.slug.toLowerCase() === subCategorySlug.toLowerCase());

  const getProductsByBrand = (brandId: string) => 
    products.filter(p => p.brandId === brandId && p.status === 'published');

  const getProductsBySubCategory = (subCategoryId: string) =>
    products.filter(p => p.subCategoryId === subCategoryId && p.status === 'published');

  const getProductById = (id: string) => products.find(p => p.id === id);

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
    addToast(`Produit "${newProduct.name}" crÃƒÂ©ÃƒÂ© avec succÃƒÂ¨s`, 'success');
    return newProduct;
  };

  const updateProduct = (id: string, updates: Partial<Product>) => {
    setProducts(prev =>
      prev.map(p => (p.id === id ? { ...p, ...updates } : p))
    );
    addToast('Produit mis ÃƒÂ  jour avec succÃƒÂ¨s', 'success');
  };

  const deleteProduct = (id: string) => {
    const target = products.find(p => p.id === id);
    setProducts(prev => prev.filter(p => p.id !== id));
    addToast(`Produit "${target?.name || ''}" supprimÃƒÂ©`, 'info');
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
    addToast(`Marque "${newBrand.name}" ajoutÃ©e`, 'success');
    return newBrand;
  };

  const updateBrand = (id: string, updates: Partial<Brand>) => {
    setBrands(prev =>
      prev.map(b => (b.id === id ? { ...b, ...updates } : b))
    );
    syncApiMutation('PATCH', `/api/admin/brands/${id}`, updates);
    addToast('Marque mise Ã  jour', 'success');
  };

  const deleteBrand = (id: string) => {
    const target = brands.find(b => b.id === id);
    setBrands(prev => prev.filter(b => b.id !== id));
    syncApiMutation('DELETE', `/api/admin/brands/${id}`);
    addToast(`Marque "${target?.name || ''}" supprimÃ©e`, 'info');
  };

  // SubCategory CRUD
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
    addToast(`Sous-catÃ©gorie "${newSub.name}" crÃ©Ã©e`, 'success');
    return newSub;
  };

  const updateSubCategory = (id: string, updates: Partial<SubCategory>) => {
    setSubCategories(prev =>
      prev.map(s => (s.id === id ? { ...s, ...updates } : s))
    );
    syncApiMutation('PATCH', `/api/admin/subcategories/${id}`, updates);
    addToast('Sous-catÃ©gorie mise Ã  jour', 'success');
  };

  const deleteSubCategory = (id: string) => {
    const target = subCategories.find(s => s.id === id);
    setSubCategories(prev => prev.filter(s => s.id !== id));
    syncApiMutation('DELETE', `/api/admin/subcategories/${id}`);
    addToast(`Sous-catÃ©gorie "${target?.name || ''}" supprimÃ©e`, 'info');
  };

  // Orders & Stocks
  // Orders & Stocks
  const updateOrderStatus = (orderId: string, status: OrderStatus) => {
    setOrders(prev =>
      prev.map(o => (o.id === orderId ? { ...o, status } : o))
    );
    addToast(`Statut de commande mis ÃƒÂ  jour : ${status}`, 'success');
  };

  const updateProductStock = (productId: string, newStock: number) => {
    setProducts(prev =>
      prev.map(p => (p.id === productId ? { ...p, stock: Math.max(0, newStock) } : p))
    );
    addToast('Stock actualisÃƒÂ©', 'info');
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
      productName: prod?.name || 'Produit',
      customerName,
      customerEmail,
      rating,
      comment,
      date: new Date().toISOString().split('T')[0],
      status: 'pending' // pending until admin approves
    };

    setReviews(prev => [newRev, ...prev]);
    addToast('Merci pour votre avis ! Il sera visible aprÃƒÂ¨s validation par notre ÃƒÂ©quipe.', 'info');
  };

  const updateReviewStatus = (reviewId: string, status: ReviewStatus) => {
    setReviews(prev =>
      prev.map(r => (r.id === reviewId ? { ...r, status } : r))
    );

    // Recalculate product rating if approved
    const targetReview = reviews.find(r => r.id === reviewId);
    if (targetReview) {
      const approvedProductReviews = reviews
        .filter(r => r.productId === targetReview.productId && (r.id === reviewId ? status === 'approved' : r.status === 'approved'));

      if (approvedProductReviews.length > 0) {
        const avg = approvedProductReviews.reduce((sum, r) => sum + r.rating, 0) / approvedProductReviews.length;
        setProducts(prev =>
          prev.map(p =>
            p.id === targetReview.productId
              ? { ...p, rating: parseFloat(avg.toFixed(1)), reviewCount: approvedProductReviews.length }
              : p
          )
        );
      }
    }

    addToast(`Avis ${status === 'approved' ? 'approuvÃƒÂ©' : 'refusÃƒÂ©'}`, 'success');
  };

  const deleteReview = (reviewId: string) => {
    setReviews(prev => prev.filter(r => r.id !== reviewId));
    addToast('Avis supprimÃƒÂ©', 'info');
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
    addToast('Catalogue rÃƒÂ©initialisÃƒÂ© avec les donnÃƒÂ©es de dÃƒÂ©monstration', 'info');
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




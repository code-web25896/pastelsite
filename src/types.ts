export type ProductBadge = 
  | 'NOUVEAU' 
  | 'PROMOTION' 
  | 'BEST-SELLER' 
  | 'COUP DE CŒUR' 
  | 'PIÈCE RARE' 
  | 'ÉDITION LIMITÉE' 
  | 'COLLECTION 2026' 
  | null;

export type OrderStatus = 'pending' | 'preparing' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

export type ReviewStatus = 'pending' | 'approved' | 'rejected';

export type UserRole = 'customer' | 'admin';

export type ProductActionType = 'buy_online' | 'rare_call' | 'rare_chat' | 'rare_both';

export interface ProductColor {
  name: string;
  hex: string;
}

export interface Brand {
  id: string;
  name: string;
  slug: string;
  description: string;
  logoUrl: string;
  bannerUrl: string;
  accentColor: string;
  status: 'active' | 'draft';
  order: number;
}

export interface SubCategory {
  id: string;
  brandId: string;
  name: string;
  slug: string;
  description: string;
  imageUrl: string;
  status: 'active' | 'draft';
  order: number;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  brandId: string;
  subCategoryId: string;
  category: 'Papeterie' | 'Scolaire' | 'Arts & Peinture' | 'Librairie' | 'Bureau & Organisation';
  price: number; // In TND, e.g., 24.900
  promoPrice: number; // In TND, e.g., 19.900
  sku: string;
  stock: number;
  isNew: boolean;
  isPromo: boolean;
  isBestSeller: boolean;
  badge: ProductBadge;
  rating: number; // e.g. 4.8
  reviewCount: number;
  images: string[];
  shortDescription: string;
  description: string;
  features: string[];
  
  // Options & Attributs riches
  sizes: string[]; // e.g. ['A4', 'A5', 'XL', 'Standard']
  colors: ProductColor[]; // e.g. [{ name: 'Rose Pastel', hex: '#EFBED7' }]
  dimensions: string; // e.g. '44 x 32 x 20 cm'
  weight: string; // e.g. '450g'
  material: string; // e.g. 'Polyester 600D imperméable'
  
  // Pièces Rares & Modes de commande (Choix de l'admin)
  actionType: ProductActionType; // 'buy_online' | 'rare_call' | 'rare_chat' | 'rare_both'
  customPhone: string; // Téléphone boutique si spécifique
  customWhatsapp: string; // WhatsApp boutique si spécifique
  rareNote: string; // Message d'information pièce rare

  status: 'published' | 'draft';
  createdAt: string;
}

export interface Review {
  id: string;
  productId: string;
  productName: string;
  customerName: string;
  customerEmail: string;
  rating: number; // 1 - 5
  comment: string;
  date: string;
  status: ReviewStatus;
}

export interface CartItem {
  productId: string;
  product: Product;
  quantity: number;
}

export interface OrderItem {
  productId: string;
  productName: string;
  price: number;
  quantity: number;
  image: string;
  brandName: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  customer: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address: string;
    city: string; // e.g. "Tunis", "Ariana", "Menzah 5"
    postalCode: string;
    notes: string;
  };
  items: OrderItem[];
  subtotal: number;
  shippingFee: number;
  total: number;
  paymentMethod: 'cod' | 'card' | 'pickup'; // Paiement à la livraison | Carte bancaire | Retrait en boutique
  status: OrderStatus;
  createdAt: string;
}

export interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: UserRole;
  addresses: {
    label: string;
    address: string;
    city: string;
    postalCode: string;
    isDefault: boolean;
  }[];
  address: string;
  city: string;
  postalCode: string;
  createdAt: string;
  }[];
  address: string;
  city: string;
  postalCode: string;
  createdAt: string;
}

export interface ToastNotification {
  id: string;
  message: string;
  type: 'success' | 'info' | 'warning' | 'error';
}

export type ViewType = 
  | { type: 'home' }
  | { type: 'shop'; filterBrand: string; filterSubCategory: string; filterCategory: string; searchQuery: string; promoOnly: boolean; isNewOnly: boolean; brandId: string; subCategoryId: string; category: any }
  | { type: 'brand'; brandSlug: string }
  | { type: 'subcategory'; brandSlug: string; subCategorySlug: string }
  | { type: 'product'; productId: string }
  | { type: 'cart' }
  | { type: 'auth'; mode: 'login' | 'register' | 'forgot' }
  | { type: 'checkout' }
  | { type: 'account'; tab: 'orders' | 'profile' | 'addresses' | 'reviews' }
  | { type: 'admin'; tab: 'dashboard' | 'products' | 'brands' | 'subcategories' | 'stocks' | 'orders' | 'reviews' }
  | { type: 'about' }
  | { type: 'contact' }
  | { type: 'shipping' }
  | { type: 'legal' };

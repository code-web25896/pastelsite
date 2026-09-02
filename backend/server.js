import 'dotenv/config';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import mysql from 'mysql2/promise';
import { z } from 'zod';
import { initializeDatabase } from './init-db.js';
import { getMysqlConnectionConfig } from './db-config.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_FILE = path.join(__dirname, 'mock-db.json');
const uploadsDir = path.join(__dirname, 'uploads');
const clientDist = path.resolve(__dirname, '..', 'dist');

const JWT_SECRET = process.env.JWT_SECRET && process.env.JWT_SECRET.length >= 32
  ? process.env.JWT_SECRET
  : 'espace-pastel-production-default-jwt-secret-key-min-32-chars-2026';

if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
  console.warn('ATTENTION: JWT_SECRET non defini ou < 32 caracteres. Une cle de secours est activee.');
}

const app = express();
app.disable('x-powered-by');
app.set('trust proxy', 1);

const origins = (process.env.CORS_ORIGIN || 'http://127.0.0.1:3000,http://localhost:3000,http://127.0.0.1:3001,http://localhost:3001')
  .split(',')
  .map((x) => x.trim())
  .filter(Boolean);

app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(cors({
  origin(origin, done) {
    if (!origin || origins.includes(origin) || process.env.NODE_ENV !== 'production') {
      return done(null, true);
    }
    return done(null, true); // permissive for client and subdomains
  },
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '20mb' }));
app.use(rateLimit({ windowMs: 900000, limit: 1000, standardHeaders: 'draft-8', legacyHeaders: false }));

// Fallback JSON DB State
const seedData = () => {
  const now = new Date().toISOString();
  return {
    users: [
      { id: 'usr-admin', email: 'admin@espacepastel.tn', passwordHash: bcrypt.hashSync('Admin123!', 10), role: 'admin', firstName: 'Admin', lastName: 'Espace Pastel', phone: '55542000', createdAt: now },
      { id: 'usr-client', email: 'client@espacepastel.tn', passwordHash: bcrypt.hashSync('Client123!', 10), role: 'customer', firstName: 'Client', lastName: 'Espace Pastel', phone: '21600000000', createdAt: now },
    ],
    brands: [
      { id: 'brand-bomi', name: 'BOMI', slug: 'bomi', description: 'Papeterie et cartables pour la rentree.', logoUrl: '/brands/bomi.jpg', bannerUrl: '/brands/bomi.jpg', accentColor: '#F4A9C8', status: 'active', order: 1 },
      { id: 'brand-wama', name: 'WAMA', slug: 'wama', description: 'Instruments d ecriture et fournitures techniques.', logoUrl: '/brands/wama.jpeg', bannerUrl: '/brands/wama.jpeg', accentColor: '#8FD8C3', status: 'active', order: 2 },
    ],
    subcategories: [
      { id: 'sub-bomi-2026', brandId: 'brand-bomi', name: 'Collection 2026', slug: 'collection-2026', description: 'Nouveautes de la rentree.', imageUrl: '/brands/bomi.jpg', status: 'active', order: 1 },
      { id: 'sub-wama-ink', brandId: 'brand-wama', name: 'Ecriture', slug: 'ecriture', description: 'Stylos, feutres et accessoires.', imageUrl: '/brands/wama.jpeg', status: 'active', order: 1 },
    ],
    products: [
      { id: 'prd-bomi-horizon', brandId: 'brand-bomi', subCategoryId: 'sub-bomi-2026', name: 'Cartable BOMI Horizon', slug: 'cartable-bomi-horizon', category: 'Papeterie', price: 129.9, promoPrice: 109.9, sku: 'BOMI-HZN-001', stock: 14, isNew: true, isPromo: true, isBestSeller: true, badge: 'NOUVEAU', images: ['https://images.unsplash.com/photo-1514477917009-389c76a86b68?auto=format&fit=crop&w=900&q=80'], shortDescription: 'Cartable leger et robuste pour la rentree.', description: 'Un cartable compact avec plusieurs compartiments et finition durable.', features: ['Compartiment principal', 'Dos rembourre', 'Tissu resistant'], sizes: ['M'], colors: [{ name: 'Rose', hex: '#F4A9C8' }, { name: 'Bleu', hex: '#8FD8C3' }], dimensions: '42 x 30 x 18 cm', weight: '0.9 kg', material: 'Polyester', actionType: 'buy_online', customPhone: null, customWhatsapp: null, rareNote: null, status: 'published', createdAt: now },
      { id: 'prd-wama-gel', brandId: 'brand-wama', subCategoryId: 'sub-wama-ink', name: 'Stylo gel WAMA Precision', slug: 'stylo-gel-wama-precision', category: 'Papeterie', price: 3.5, promoPrice: null, sku: 'WAMA-GEL-010', stock: 120, isNew: true, isPromo: false, isBestSeller: true, badge: 'BEST-SELLER', images: ['https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?auto=format&fit=crop&w=900&q=80'], shortDescription: 'Glisse fluide et trait net.', description: 'Stylo gel pour ecriture rapide et confortable.', features: ['Encre fluide', 'Pointe fine', 'Prise en main confortable'], sizes: ['0.5'], colors: [{ name: 'Noir', hex: '#000000' }, { name: 'Bleu', hex: '#0055FF' }], dimensions: '14 cm', weight: '0.02 kg', material: 'Plastique', actionType: 'buy_online', customPhone: null, customWhatsapp: null, rareNote: null, status: 'published', createdAt: now },
    ],
    reviews: [],
    orders: [],
    addresses: [],
  };
};

let jsonDbState = seedData();
try {
  if (fs.existsSync(DB_FILE)) {
    jsonDbState = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
  } else {
    fs.writeFileSync(DB_FILE, JSON.stringify(jsonDbState, null, 2), 'utf8');
  }
} catch {
  jsonDbState = seedData();
}

function persistJsonDb() {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(jsonDbState, null, 2), 'utf8');
  } catch (err) {
    console.error('Erreur ecriture mock-db.json:', err.message);
  }
}

function mergeById(primary = [], secondary = []) {
  const map = new Map();
  for (const item of secondary) {
    if (item && item.id) map.set(String(item.id), item);
  }
  for (const item of primary) {
    if (item && item.id) map.set(String(item.id), item);
  }
  return Array.from(map.values());
}

function isPublishedProduct(product) {
  return !product?.status || product.status === 'published';
}

function filterCatalogProducts(list, { q, brandId, subCategoryId } = {}) {
  const query = String(q || '').trim().toLowerCase();
  return (list || []).filter((product) => {
    if (!isPublishedProduct(product)) return false;
    if (brandId && product.brandId !== brandId) return false;
    if (subCategoryId && product.subCategoryId !== subCategoryId) return false;
    if (query && ![product.name, product.shortDescription, product.category, product.description, product.sku].join(' ').toLowerCase().includes(query)) {
      return false;
    }
    return true;
  });
}

async function ensureProductRelations(product) {
  if (!pool) return;
  const brand = jsonDbState.brands.find((item) => item.id === product.brandId) || {
    id: product.brandId,
    name: product.brandId,
    slug: String(product.brandId || 'marque').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'marque',
    description: '',
    logoUrl: null,
    bannerUrl: null,
    accentColor: null,
    status: 'active',
    order: 0,
  };
  const sub = jsonDbState.subcategories.find((item) => item.id === product.subCategoryId) || {
    id: product.subCategoryId,
    brandId: product.brandId,
    name: product.subCategoryId,
    slug: String(product.subCategoryId || 'categorie').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'categorie',
    description: '',
    imageUrl: null,
    status: 'active',
    order: 0,
  };
  await pool.execute(
    'INSERT INTO brands (id, name, slug, description, logo_url, banner_url, accent_color, status, display_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE name = VALUES(name), status = VALUES(status)',
    [brand.id, brand.name, brand.slug, brand.description || '', brand.logoUrl || null, brand.bannerUrl || null, brand.accentColor || null, brand.status || 'active', brand.order || 0]
  );
  await pool.execute(
    'INSERT INTO subcategories (id, brand_id, name, slug, description, image_url, status, display_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE name = VALUES(name), status = VALUES(status)',
    [sub.id, sub.brandId, sub.name, sub.slug, sub.description || '', sub.imageUrl || null, sub.status || 'active', sub.order || 0]
  );
}

// MySQL connection pool
let pool = null;
try {
  pool = mysql.createPool(getMysqlConnectionConfig());
} catch (e) {
  console.warn('Configuration MySQL non fournie ou incomplete. Mode persistance JSON actif:', e.message || e);
}

const route = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

// Validation Schemas
const idString = z.string().min(1).max(128);
const passwordSchema = z.string().min(6).max(128);
const imageOrUrl = z.string().min(1).max(15000000);

const userInput = z.object({
  email: z.string().email().max(254),
  password: passwordSchema,
  firstName: z.string().trim().min(1).max(80),
  lastName: z.string().trim().max(80).optional().default(''),
  phone: z.string().trim().min(4).max(30).optional()
});

const brandInput = z.object({
  id: idString.optional(),
  name: z.string().trim().min(1).max(120),
  slug: z.string().max(140).optional(),
  description: z.string().trim().max(10000).optional().default(''),
  logoUrl: imageOrUrl.nullable().optional(),
  bannerUrl: imageOrUrl.nullable().optional(),
  accentColor: z.string().max(20).nullable().optional(),
  status: z.enum(['active', 'draft']).default('active'),
  order: z.number().int().min(0).max(100000).optional().default(0)
});

const subcategoryInput = z.object({
  id: idString.optional(),
  brandId: idString,
  name: z.string().trim().min(1).max(120),
  slug: z.string().max(140).optional(),
  description: z.string().trim().max(10000).optional().default(''),
  imageUrl: imageOrUrl.nullable().optional(),
  status: z.enum(['active', 'draft']).default('active'),
  order: z.number().int().min(0).max(100000).optional().default(0)
});

const productBase = z.object({
  id: idString.optional(),
  brandId: idString,
  subCategoryId: idString,
  name: z.string().trim().min(1).max(255),
  slug: z.string().max(255).optional(),
  category: z.string().min(1).max(100).default('Papeterie'),
  price: z.number().nonnegative().max(9999999),
  promoPrice: z.number().nonnegative().max(9999999).nullable().optional(),
  sku: z.string().trim().min(1).max(100),
  stock: z.number().int().min(0).max(100000).default(0),
  isNew: z.boolean().optional().default(false),
  isPromo: z.boolean().optional().default(false),
  isBestSeller: z.boolean().optional().default(false),
  badge: z.string().max(80).nullable().optional().transform((value) => (value === 'AUCUN' ? null : value)),
  images: z.array(imageOrUrl).optional().default([]),
  shortDescription: z.string().trim().max(2000).optional().default(''),
  description: z.string().trim().max(20000).optional().default(''),
  features: z.array(z.string().max(500)).optional().default([]),
  sizes: z.array(z.string().max(100)).nullable().optional(),
  colors: z.array(z.any()).nullable().optional(),
  dimensions: z.string().max(100).nullable().optional(),
  weight: z.string().max(100).nullable().optional(),
  material: z.string().max(255).nullable().optional(),
  actionType: z.string().nullable().optional().default('buy_online'),
  customPhone: z.string().max(30).nullable().optional(),
  customWhatsapp: z.string().max(30).nullable().optional(),
  rareNote: z.string().max(2000).nullable().optional(),
  status: z.enum(['published', 'draft']).default('published'),
});

const productPatch = productBase.partial();

const orderInput = z.object({
  customer: z.object({
    firstName: z.string().trim().min(1).max(80),
    lastName: z.string().trim().max(80).optional().default(''),
    email: z.string().email().trim().max(254),
    phone: z.string().trim().min(4).max(30),
    address: z.string().trim().min(2).max(255),
    city: z.string().trim().min(1).max(80),
    postalCode: z.string().max(20).optional().default(''),
    notes: z.string().max(1000).optional().default('')
  }),
  items: z.array(z.object({
    productId: idString,
    productName: z.string().optional(),
    quantity: z.number().int().min(1).max(100),
    price: z.number().optional(),
    image: z.string().optional(),
    selectedSize: z.string().nullable().optional(),
    selectedColor: z.any().nullable().optional()
  })).min(1),
  paymentMethod: z.enum(['cod', 'card', 'pickup', 'cash', 'transfer']).default('cod')
});

const json = (x) => {
  if (x == null) return x;
  if (typeof x !== 'string') return x;
  try {
    return JSON.parse(x);
  } catch {
    return x;
  }
};

function asImageList(value) {
  const parsed = json(value);
  if (Array.isArray(parsed)) return parsed.filter(Boolean);
  if (typeof parsed === 'string' && parsed) return [parsed];
  return [];
}

function materializeImages(images, productId) {
  fs.mkdirSync(path.join(uploadsDir, 'products'), { recursive: true });
  return (images || []).map((img, index) => {
    if (typeof img !== 'string' || !img.startsWith('data:image/')) return img;
    const match = img.match(/^data:image\/([a-zA-Z0-9+.-]+);base64,(.+)$/);
    if (!match) return img;
    let ext = match[1].toLowerCase().replace('jpeg', 'jpg');
    if (ext.includes('svg')) ext = 'svg';
    if (!['jpg', 'png', 'webp', 'gif', 'svg'].includes(ext)) ext = 'jpg';
    const fileName = `${String(productId).replace(/[^a-zA-Z0-9_-]/g, '')}-${index}.${ext}`;
    fs.writeFileSync(path.join(uploadsDir, 'products', fileName), Buffer.from(match[2], 'base64'));
    return `/uploads/products/${fileName}`;
  });
}

function materializeSubcategoryImage(imageUrl, subId) {
  if (!imageUrl || typeof imageUrl !== 'string' || !imageUrl.startsWith('data:image/')) return imageUrl;
  fs.mkdirSync(path.join(uploadsDir, 'subcategories'), { recursive: true });
  const match = imageUrl.match(/^data:image\/([a-zA-Z0-9+.-]+);base64,(.+)$/);
  if (!match) return imageUrl;
  let ext = match[1].toLowerCase().replace('jpeg', 'jpg');
  if (!['jpg', 'png', 'webp', 'gif', 'svg'].includes(ext)) ext = 'jpg';
  const fileName = `${String(subId).replace(/[^a-zA-Z0-9_-]/g, '')}.${ext}`;
  fs.writeFileSync(path.join(uploadsDir, 'subcategories', fileName), Buffer.from(match[2], 'base64'));
  return `/uploads/subcategories/${fileName}`;
}


const token = (u) => jwt.sign(
  { sub: u.id, role: u.role, email: u.email },
  JWT_SECRET,
  { expiresIn: process.env.JWT_EXPIRES_IN || '8h', issuer: 'espace-pastel-api', audience: 'espace-pastel-client' }
);

function auth(req, res, next) {
  const value = req.get('authorization')?.replace(/^Bearer\s+/i, '');
  if (!value) return res.status(401).json({ error: 'Authentification requise.' });
  try {
    req.user = jwt.verify(value, JWT_SECRET, { issuer: 'espace-pastel-api', audience: 'espace-pastel-client' });
    return next();
  } catch {
    return res.status(401).json({ error: 'Session invalide ou expiree.' });
  }
}

function optionalAuth(req, res, next) {
  const value = req.get('authorization')?.replace(/^Bearer\s+/i, '');
  if (value) {
    try {
      req.user = jwt.verify(value, JWT_SECRET, { issuer: 'espace-pastel-api', audience: 'espace-pastel-client' });
    } catch {
      // ignore expired token on optional endpoints
    }
  }
  next();
}

function admin(req, res, next) {
  if (req.user?.role === 'admin') return next();
  return res.status(403).json({ error: 'Acces administrateur requis.' });
}

// Health check
app.get('/api/health', route(async (_q, res) => {
  if (pool) {
    try {
      await pool.query('SELECT 1');
      return res.json({ status: 'ok', database: 'connected', mode: 'mysql' });
    } catch (e) {
      return res.json({ status: 'degraded', database: 'error', mode: 'json_fallback', message: e.message });
    }
  }
  return res.json({ status: 'ok', database: 'json_file', mode: 'json_db' });
}));

// ================= AUTH ROUTES =================
app.post(['/api/auth/register', '/api/api/auth/register'], route(async (req, res) => {
  const x = userInput.parse(req.body);
  const now = new Date().toISOString();
  const userId = crypto.randomUUID();
  const passwordHash = await bcrypt.hash(x.password, 10);
  const user = {
    id: userId,
    email: x.email.toLowerCase(),
    role: 'customer',
    firstName: x.firstName,
    lastName: x.lastName || '',
    phone: x.phone || null,
    createdAt: now,
    addresses: []
  };

  if (pool) {
    try {
      await pool.execute(
        'INSERT INTO users (id, email, password_hash, role, first_name, last_name, phone) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [user.id, user.email, passwordHash, user.role, user.firstName, user.lastName, user.phone]
      );
      return res.status(201).json({ token: token(user), user });
    } catch (err) {
      if (err.code === 'ER_DUP_ENTRY') return res.status(409).json({ error: 'Cet e-mail est deja enregistre.' });
      console.warn('MySQL register fallback to JSON:', err.message);
    }
  }

  // JSON fallback
  if (jsonDbState.users.some((u) => u.email.toLowerCase() === user.email)) {
    return res.status(409).json({ error: 'Cet e-mail est deja enregistre.' });
  }
  jsonDbState.users.push({ ...user, passwordHash });
  persistJsonDb();
  return res.status(201).json({ token: token(user), user });
}));

app.post(['/api/auth/login', '/api/api/auth/login'], route(async (req, res) => {
  const x = z.object({ email: z.string().email(), password: z.string().min(1).max(128) }).parse(req.body);
  const emailLower = x.email.toLowerCase();

  // Check MySQL first if connected
  if (pool) {
    try {
      const [rows] = await pool.execute('SELECT id, email, password_hash, role, first_name, last_name, phone, created_at FROM users WHERE email = ? LIMIT 1', [emailLower]);
      const u = rows[0];
      if (u && (await bcrypt.compare(x.password, u.password_hash))) {
        const [addresses] = await pool.execute('SELECT id, label, address, city, postal_code AS postalCode, is_default AS isDefault FROM addresses WHERE user_id = ? ORDER BY is_default DESC, created_at DESC', [u.id]);
        const userObj = { id: u.id, email: u.email, role: u.role, firstName: u.first_name, lastName: u.last_name, phone: u.phone, createdAt: u.created_at, addresses: addresses || [] };
        return res.json({ token: token(userObj), user: userObj });
      }
    } catch (err) {
      console.warn('MySQL login check failed, checking fallback:', err.message);
    }
  }

  // Fallback JSON DB Check
  const localUser = jsonDbState.users.find((u) => u.email.toLowerCase() === emailLower);
  if (localUser && (await bcrypt.compare(x.password, localUser.passwordHash))) {
    const addresses = jsonDbState.addresses?.filter((a) => a.userId === localUser.id) || [];
    const userObj = { id: localUser.id, email: localUser.email, role: localUser.role, firstName: localUser.firstName, lastName: localUser.lastName, phone: localUser.phone, createdAt: localUser.createdAt, addresses };
    return res.json({ token: token(userObj), user: userObj });
  }

  return res.status(401).json({ error: 'Identifiants invalides.' });
}));

app.get(['/api/auth/me', '/api/api/auth/me'], auth, route(async (req, res) => {
  if (pool) {
    try {
      const [users] = await pool.execute('SELECT id, email, role, first_name AS firstName, last_name AS lastName, phone, created_at AS createdAt FROM users WHERE id = ?', [req.user.sub]);
      if (users[0]) {
        const [addresses] = await pool.execute('SELECT id, label, address, city, postal_code AS postalCode, is_default AS isDefault FROM addresses WHERE user_id = ? ORDER BY is_default DESC, created_at DESC', [req.user.sub]);
        return res.json({ ...users[0], addresses: addresses || [] });
      }
    } catch (err) {
      console.warn('MySQL auth/me failed, falling back:', err.message);
    }
  }

  const u = jsonDbState.users.find((user) => user.id === req.user.sub);
  if (!u) return res.status(401).json({ error: 'Utilisateur introuvable.' });
  const addresses = jsonDbState.addresses?.filter((a) => a.userId === u.id) || [];
  return res.json({ id: u.id, email: u.email, role: u.role, firstName: u.firstName, lastName: u.lastName, phone: u.phone, createdAt: u.createdAt, addresses });
}));

// ================= BRANDS & SUBCATEGORIES =================
app.get('/api/brands', route(async (_q, res) => {
  if (pool) {
    try {
      const [rows] = await pool.execute('SELECT id, name, slug, description, logo_url AS logoUrl, banner_url AS bannerUrl, accent_color AS accentColor, status, display_order AS displayOrder FROM brands WHERE status = ? ORDER BY display_order, name', ['active']);
      return res.json(rows.map((x) => ({ ...x, order: x.displayOrder })));
    } catch (err) {
      console.warn('MySQL brands failed:', err.message);
    }
  }
  res.json(jsonDbState.brands.filter((b) => b.status === 'active'));
}));

app.get('/api/subcategories', route(async (req, res) => {
  const brandId = req.query.brandId;
  if (pool) {
    try {
      const sql = brandId
        ? 'SELECT id, brand_id AS brandId, name, slug, description, image_url AS imageUrl, status, display_order AS displayOrder FROM subcategories WHERE status = ? AND brand_id = ? ORDER BY display_order, name'
        : 'SELECT id, brand_id AS brandId, name, slug, description, image_url AS imageUrl, status, display_order AS displayOrder FROM subcategories WHERE status = ? ORDER BY display_order, name';
      const [rows] = await pool.execute(sql, brandId ? ['active', brandId] : ['active']);
      return res.json(rows.map((x) => ({ ...x, order: x.displayOrder })));
    } catch (err) {
      console.warn('MySQL subcategories failed:', err.message);
    }
  }
  res.json(jsonDbState.subcategories.filter((s) => s.status === 'active' && (!brandId || s.brandId === brandId)));
}));

// ================= PRODUCTS =================
const productSelect = 'p.id, p.brand_id AS brandId, p.subcategory_id AS subCategoryId, p.name, p.slug, p.category, p.price, p.promo_price AS promoPrice, p.sku, p.stock, p.is_new AS isNew, p.is_promo AS isPromo, p.is_best_seller AS isBestSeller, p.badge, p.images, p.short_description AS shortDescription, p.description, p.features, p.sizes, p.colors, p.dimensions, p.weight, p.material, p.action_type AS actionType, p.custom_phone AS customPhone, p.custom_whatsapp AS customWhatsapp, p.rare_note AS rareNote, p.status, p.created_at AS createdAt, COALESCE((SELECT AVG(r.rating) FROM reviews r WHERE r.product_id = p.id AND r.status = \'approved\'), 0) AS rating, (SELECT COUNT(*) FROM reviews r WHERE r.product_id = p.id AND r.status = \'approved\') AS reviewCount';

function outputProduct(row) {
  return {
    ...row,
    price: Number(row.price),
    promoPrice: row.promoPrice == null ? null : Number(row.promoPrice),
    rating: Number(row.rating || 0),
    reviewCount: Number(row.reviewCount || 0),
    isNew: Boolean(row.isNew),
    isPromo: Boolean(row.isPromo),
    isBestSeller: Boolean(row.isBestSeller),
    images: asImageList(row.images),
    features: json(row.features) || [],
    sizes: json(row.sizes) || [],
    colors: json(row.colors) || []
  };
}

app.get('/api/products', route(async (req, res) => {
  const q = String(req.query.q || '').trim().toLowerCase();
  const brandId = req.query.brandId;
  const subCategoryId = req.query.subCategoryId;
  let mysqlProducts = [];

  if (pool) {
    try {
      const where = ['(p.status = ? OR p.status IS NULL)'];
      const values = ['published'];
      if (brandId) { where.push('p.brand_id = ?'); values.push(brandId); }
      if (subCategoryId) { where.push('p.subcategory_id = ?'); values.push(subCategoryId); }
      if (q) {
        values.push(`%${q}%`, `%${q}%`, `%${q}%`);
        where.push('(p.name LIKE ? OR p.short_description LIKE ? OR p.category LIKE ?)');
      }
      const limit = Math.min(Math.max(Number(req.query.limit) || 500, 1), 1000);
      const [rows] = await pool.query(
        `SELECT ${productSelect} FROM products p WHERE ${where.join(' AND ')} ORDER BY p.created_at DESC LIMIT ${limit}`,
        values
      );
      mysqlProducts = rows.map(outputProduct);
    } catch (err) {
      console.warn('MySQL products query failed, using JSON db:', err.message);
    }
  }

  const merged = mergeById(mysqlProducts, jsonDbState.products);
  const filtered = filterCatalogProducts(merged, { q, brandId, subCategoryId })
    .map(outputProduct)
    .sort((a, b) => String(b.createdAt || '').localeCompare(String(a.createdAt || '')));
  return res.json(filtered);
}));

app.get('/api/products/:idOrSlug', route(async (req, res) => {
  const target = req.params.idOrSlug;
  if (pool) {
    try {
      const [rows] = await pool.execute(`SELECT ${productSelect} FROM products p WHERE (p.id = ? OR p.slug = ?) LIMIT 1`, [target, target]);
      if (rows[0]) {
        const product = outputProduct(rows[0]);
        if (isPublishedProduct(product)) return res.json(product);
      }
    } catch (err) {
      console.warn('MySQL product lookup failed:', err.message);
    }
  }

  const product = jsonDbState.products.find((p) => p.id === target || p.slug === target);
  if (!product || !isPublishedProduct(product)) return res.status(404).json({ error: 'Produit introuvable.' });
  return res.json(product);
}));

// ================= ORDERS (CLIENT & GUEST CHECKOUT) =================
app.post('/api/orders', optionalAuth, route(async (req, res) => {
  const x = orderInput.parse(req.body);
  const orderId = 'ord-' + crypto.randomUUID();
  const orderNumber = 'EP-' + new Date().getFullYear() + '-' + Math.floor(1000 + Math.random() * 9000);
  const now = new Date().toISOString();

  let subtotal = 0;
  const items = [];

  for (const item of x.items) {
    let product = jsonDbState.products.find((p) => p.id === item.productId);
    if (!product && pool) {
      try {
        const [rows] = await pool.execute('SELECT id, name, price, promo_price AS promoPrice, stock, images FROM products WHERE id = ? LIMIT 1', [item.productId]);
        if (rows[0]) product = rows[0];
      } catch {
        // ignore
      }
    }

    const price = product ? Number(product.promoPrice ?? product.price) : Number(item.price || 0);
    const quantity = item.quantity;
    subtotal += price * quantity;
    items.push({
      productId: item.productId,
      productName: product?.name || item.productName || 'Produit Espace Pastel',
      price,
      quantity,
      image: item.image || (product ? (json(product.images)?.[0] || '') : ''),
      selectedSize: item.selectedSize || undefined,
      selectedColor: item.selectedColor || undefined
    });

    // decrement stock in memory
    if (product) {
      product.stock = Math.max(0, (product.stock || 0) - quantity);
    }
  }

  const isPickup = x.paymentMethod === 'pickup' || x.customer.address.toLowerCase().includes('retrait');
  const shippingFee = (isPickup || subtotal >= 100) ? 0 : 7;
  const total = subtotal + shippingFee;
  const userId = req.user?.sub || 'usr-guest-' + crypto.randomUUID().slice(0, 8);

  const orderRecord = {
    id: orderId,
    orderNumber,
    userId,
    customer: x.customer,
    items,
    subtotal,
    shippingFee,
    total,
    paymentMethod: x.paymentMethod,
    status: 'pending',
    createdAt: now
  };

  if (pool) {
    try {
      // Ensure user entry exists for FK constraint if needed
      await pool.execute(
        'INSERT IGNORE INTO users (id, email, password_hash, role, first_name, last_name, phone) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [userId, x.customer.email.toLowerCase(), '$2a$10$none', 'customer', x.customer.firstName, x.customer.lastName || '', x.customer.phone]
      );
      await pool.execute(
        'INSERT INTO orders (id, order_number, user_id, customer_json, items_json, subtotal, shipping_fee, total, payment_method, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [orderId, orderNumber, userId, JSON.stringify(x.customer), JSON.stringify(items), subtotal, shippingFee, total, x.paymentMethod, 'pending', now]
      );
    } catch (err) {
      console.warn('MySQL order insert failed, saved to JSON DB:', err.message);
    }
  }

  jsonDbState.orders.unshift(orderRecord);
  persistJsonDb();

  return res.status(201).json(orderRecord);
}));

const mergeOrders = (primary, fallback) => {
  const byId = new Map();
  for (const order of [...fallback, ...primary]) {
    if (!order?.id) continue;
    byId.set(order.id, { ...byId.get(order.id), ...order });
  }
  return [...byId.values()].sort((a, b) => String(b.createdAt || '').localeCompare(String(a.createdAt || '')));
};

app.get('/api/orders', auth, route(async (req, res) => {
  if (pool) {
    try {
      const [rows] = await pool.execute('SELECT id, order_number AS orderNumber, user_id AS userId, customer_json AS customer, items_json AS items, subtotal, shipping_fee AS shippingFee, total, payment_method AS paymentMethod, status, created_at AS createdAt FROM orders WHERE user_id = ? ORDER BY created_at DESC', [req.user.sub]);
      const mysqlOrders = rows.map((x) => ({ ...x, subtotal: Number(x.subtotal), shippingFee: Number(x.shippingFee), total: Number(x.total), customer: json(x.customer), items: json(x.items) }));
      return res.json(mergeOrders(mysqlOrders, userOrders));
    } catch (err) {
      console.warn('MySQL get orders failed:', err.message);
    }
  }

  const userOrders = jsonDbState.orders.filter((o) => o.userId === req.user.sub || o.customer?.email?.toLowerCase() === req.user.email?.toLowerCase());
  return res.json(userOrders);
}));

// ================= ADMIN ROUTES =================
app.get('/api/admin/orders', auth, admin, route(async (_q, res) => {
  const jsonOrders = jsonDbState.orders || [];
  if (pool) {
    try {
      const [rows] = await pool.execute('SELECT id, order_number AS orderNumber, user_id AS userId, customer_json AS customer, items_json AS items, subtotal, shipping_fee AS shippingFee, total, payment_method AS paymentMethod, status, created_at AS createdAt FROM orders ORDER BY created_at DESC');
      const mysqlOrders = rows.map((x) => ({ ...x, subtotal: Number(x.subtotal), shippingFee: Number(x.shippingFee), total: Number(x.total), customer: json(x.customer), items: json(x.items) }));
      return res.json(mergeOrders(mysqlOrders, jsonOrders));
    } catch (err) {
      console.warn('MySQL admin get orders failed:', err.message);
    }
  }
  return res.json(jsonOrders);
}));

app.patch('/api/admin/orders/:id/status', auth, admin, route(async (req, res) => {
  const { status } = z.object({ status: z.enum(['pending', 'preparing', 'processing', 'shipped', 'delivered', 'cancelled']) }).parse(req.body);
  const targetId = req.params.id;

  if (pool) {
    try {
      await pool.execute('UPDATE orders SET status = ? WHERE id = ?', [status, targetId]);
    } catch (err) {
      console.warn('MySQL update order status failed:', err.message);
    }
  }

  const order = jsonDbState.orders.find((o) => o.id === targetId);
  if (order) {
    order.status = status;
    persistJsonDb();
  }

  return res.status(200).json({ success: true, status });
}));

app.delete('/api/admin/orders/:id', auth, admin, route(async (req, res) => {
  const targetId = req.params.id;
  if (pool) {
    try {
      await pool.execute('DELETE FROM orders WHERE id = ?', [targetId]);
    } catch (err) {
      console.warn('MySQL delete order failed:', err.message);
    }
  }
  jsonDbState.orders = (jsonDbState.orders || []).filter((o) => o.id !== targetId);
  persistJsonDb();
  return res.status(200).json({ success: true });
}));

// Admin Brands
app.post('/api/admin/brands', auth, admin, route(async (req, res) => {
  const x = brandInput.parse(req.body);
  const newId = x.id || 'brand-' + crypto.randomUUID();
  const slug = x.slug || x.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  const brand = { ...x, id: newId, slug, order: x.order || 0 };

  if (pool) {
    try {
      await pool.execute(
        'INSERT INTO brands (id, name, slug, description, logo_url, banner_url, accent_color, status, display_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [brand.id, brand.name, brand.slug, brand.description || '', brand.logoUrl || null, brand.bannerUrl || null, brand.accentColor || null, brand.status, brand.order]
      );
    } catch (err) {
      console.warn('MySQL insert brand failed:', err.message);
    }
  }

  jsonDbState.brands.push(brand);
  persistJsonDb();
  return res.status(201).json(brand);
}));

app.patch('/api/admin/brands/:id', auth, admin, route(async (req, res) => {
  const targetId = req.params.id;
  const updates = brandInput.partial().parse(req.body);

  if (pool) {
    try {
      const keys = Object.keys(updates);
      if (keys.length) {
        const fieldMap = { name: 'name', slug: 'slug', description: 'description', logoUrl: 'logo_url', bannerUrl: 'banner_url', accentColor: 'accent_color', status: 'status', order: 'display_order' };
        await pool.execute(
          'UPDATE brands SET ' + keys.map((k) => `${fieldMap[k]} = ?`).join(', ') + ' WHERE id = ?',
          [...Object.values(updates), targetId]
        );
      }
    } catch (err) {
      console.warn('MySQL update brand failed:', err.message);
    }
  }

  const brandIndex = jsonDbState.brands.findIndex((b) => b.id === targetId);
  if (brandIndex !== -1) {
    jsonDbState.brands[brandIndex] = { ...jsonDbState.brands[brandIndex], ...updates };
    persistJsonDb();
  }
  return res.status(200).json({ success: true });
}));

app.delete('/api/admin/brands/:id', auth, admin, route(async (req, res) => {
  const targetId = req.params.id;
  if (pool) {
    try {
      await pool.execute('DELETE FROM brands WHERE id = ?', [targetId]);
    } catch (err) {
      console.warn('MySQL delete brand failed:', err.message);
    }
  }
  jsonDbState.brands = jsonDbState.brands.filter((b) => b.id !== targetId);
  persistJsonDb();
  return res.status(204).end();
}));

// Admin Subcategories
app.post('/api/admin/subcategories', auth, admin, route(async (req, res) => {
  const x = subcategoryInput.parse(req.body);
  const newId = x.id || 'sub-' + crypto.randomUUID();
  const slug = x.slug || x.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  // Persist image base64 to disk if needed
  const imageUrl = materializeSubcategoryImage(x.imageUrl, newId);
  const sub = { ...x, id: newId, slug, order: x.order || 0, imageUrl };

  if (pool) {
    try {
      await pool.execute(
        'INSERT INTO subcategories (id, brand_id, name, slug, description, image_url, status, display_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [sub.id, sub.brandId, sub.name, sub.slug, sub.description || '', sub.imageUrl || null, sub.status, sub.order]
      );
    } catch (err) {
      console.warn('MySQL insert subcategory failed:', err.message);
    }
  }

  jsonDbState.subcategories.push(sub);
  persistJsonDb();
  return res.status(201).json(sub);
}));

app.patch('/api/admin/subcategories/:id', auth, admin, route(async (req, res) => {
  const targetId = req.params.id;
  const updates = subcategoryInput.partial().parse(req.body);

  // Persist image base64 to disk if needed
  if (updates.imageUrl) {
    updates.imageUrl = materializeSubcategoryImage(updates.imageUrl, targetId);
  }

  if (pool) {
    try {
      const keys = Object.keys(updates);
      if (keys.length) {
        const fieldMap = { brandId: 'brand_id', name: 'name', slug: 'slug', description: 'description', imageUrl: 'image_url', status: 'status', order: 'display_order' };
        await pool.execute(
          'UPDATE subcategories SET ' + keys.map((k) => `${fieldMap[k]} = ?`).join(', ') + ' WHERE id = ?',
          [...Object.values(updates), targetId]
        );
      }
    } catch (err) {
      console.warn('MySQL update subcategory failed:', err.message);
    }
  }

  const subIndex = jsonDbState.subcategories.findIndex((s) => s.id === targetId);
  if (subIndex !== -1) {
    jsonDbState.subcategories[subIndex] = { ...jsonDbState.subcategories[subIndex], ...updates };
    persistJsonDb();
  }
  return res.status(200).json({ success: true });
}));

app.delete('/api/admin/subcategories/:id', auth, admin, route(async (req, res) => {
  const targetId = req.params.id;
  if (pool) {
    try {
      await pool.execute('DELETE FROM subcategories WHERE id = ?', [targetId]);
    } catch (err) {
      console.warn('MySQL delete subcategory failed:', err.message);
    }
  }
  jsonDbState.subcategories = jsonDbState.subcategories.filter((s) => s.id !== targetId);
  persistJsonDb();
  return res.status(204).end();
}));

// Admin Products CRUD
app.get('/api/admin/products', auth, admin, route(async (_q, res) => {
  let mysqlProducts = [];
  if (pool) {
    try {
      const [rows] = await pool.query(`SELECT ${productSelect} FROM products p ORDER BY p.created_at DESC`);
      mysqlProducts = rows.map(outputProduct);
    } catch (err) {
      console.warn('MySQL admin products failed:', err.message);
    }
  }
  return res.json(mergeById(mysqlProducts, jsonDbState.products).map(outputProduct));
}));

app.post('/api/admin/products', auth, admin, route(async (req, res) => {
  const x = productBase.parse(req.body);
  const newId = x.id || crypto.randomUUID();
  const slug = x.slug || (x.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '-' + Math.floor(100 + Math.random() * 900));
  const now = new Date().toISOString();
  const product = {
    ...x,
    id: newId,
    slug,
    createdAt: now,
    rating: 5,
    reviewCount: 0,
    status: x.status || 'published',
    promoPrice: x.promoPrice ?? null,
    images: materializeImages(x.images?.length ? x.images : [], newId),
    features: x.features || [],
    sizes: x.sizes || [],
    colors: x.colors || [],
  };

  if (pool) {
    try {
      await ensureProductRelations(product);
      await pool.execute(
        'INSERT INTO products (id, brand_id, subcategory_id, name, slug, category, price, promo_price, sku, stock, is_new, is_promo, is_best_seller, badge, images, short_description, description, features, sizes, colors, dimensions, weight, material, action_type, custom_phone, custom_whatsapp, rare_note, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [
          product.id, product.brandId, product.subCategoryId, product.name, product.slug, product.category,
          product.price, product.promoPrice || null, product.sku, product.stock,
          Boolean(product.isNew), Boolean(product.isPromo), Boolean(product.isBestSeller), product.badge || null,
          JSON.stringify(product.images || []), product.shortDescription || '', product.description || '',
          JSON.stringify(product.features || []), JSON.stringify(product.sizes || []), JSON.stringify(product.colors || []),
          product.dimensions || null, product.weight || null, product.material || null,
          product.actionType || 'buy_online', product.customPhone || null, product.customWhatsapp || null,
          product.rareNote || null, product.status
        ]
      );
    } catch (err) {
      console.error('MySQL insert product failed:', err.message);
      return res.status(500).json({ error: 'Impossible d\'enregistrer le produit en base. ' + err.message });
    }
  }

  const existingIndex = jsonDbState.products.findIndex((item) => item.id === product.id || item.sku === product.sku);
  if (existingIndex !== -1) {
    jsonDbState.products[existingIndex] = { ...jsonDbState.products[existingIndex], ...product };
  } else {
    jsonDbState.products.unshift(product);
  }
  persistJsonDb();
  return res.status(201).json(product);
}));

app.patch('/api/admin/products/:id', auth, admin, route(async (req, res) => {
  const targetId = req.params.id;
  const updates = productPatch.parse(req.body);
  if (updates.images) updates.images = materializeImages(updates.images, targetId);

  if (pool) {
    try {
      const keys = Object.keys(updates);
      if (keys.length) {
        const productMap = {
          brandId: 'brand_id', subCategoryId: 'subcategory_id', name: 'name', slug: 'slug', category: 'category', price: 'price', promoPrice: 'promo_price', sku: 'sku', stock: 'stock', isNew: 'is_new', isPromo: 'is_promo', isBestSeller: 'is_best_seller', badge: 'badge', images: 'images', shortDescription: 'short_description', description: 'description', features: 'features', sizes: 'sizes', colors: 'colors', dimensions: 'dimensions', weight: 'weight', material: 'material', actionType: 'action_type', customPhone: 'custom_phone', customWhatsapp: 'custom_whatsapp', rareNote: 'rare_note', status: 'status'
        };
        const serializeVal = (k, v) => (['images', 'features', 'sizes', 'colors'].includes(k) && v != null ? JSON.stringify(v) : v);
        const validKeys = keys.filter((k) => productMap[k]);
        if (validKeys.length) {
          await pool.execute(
            'UPDATE products SET ' + validKeys.map((k) => `${productMap[k]} = ?`).join(', ') + ' WHERE id = ?',
            [...validKeys.map((k) => serializeVal(k, updates[k])), targetId]
          );
        }
      }
    } catch (err) {
      console.error('MySQL update product failed:', err.message);
      return res.status(500).json({ error: 'Impossible de mettre a jour le produit. ' + err.message });
    }
  }

  const pIndex = jsonDbState.products.findIndex((p) => p.id === targetId);
  if (pIndex !== -1) {
    jsonDbState.products[pIndex] = { ...jsonDbState.products[pIndex], ...updates };
    persistJsonDb();
    return res.status(200).json(jsonDbState.products[pIndex]);
  }

  const created = { id: targetId, ...updates, status: updates.status || 'published' };
  jsonDbState.products.unshift(created);
  persistJsonDb();
  return res.status(200).json(created);
}));

app.delete('/api/admin/products/:id', auth, admin, route(async (req, res) => {
  const targetId = req.params.id;
  if (pool) {
    try {
      await pool.execute('DELETE FROM products WHERE id = ?', [targetId]);
    } catch (err) {
      console.error('MySQL delete product failed:', err.message);
      return res.status(500).json({ error: 'Impossible de supprimer le produit. ' + err.message });
    }
  }
  jsonDbState.products = jsonDbState.products.filter((p) => p.id !== targetId);
  persistJsonDb();
  return res.status(204).end();
}));

app.patch('/api/admin/products/:id/stock', auth, admin, route(async (req, res) => {
  const targetId = req.params.id;
  const { stock } = z.object({ stock: z.number().int().min(0).max(100000) }).parse(req.body);

  if (pool) {
    try {
      await pool.execute('UPDATE products SET stock = ? WHERE id = ?', [stock, targetId]);
    } catch (err) {
      console.warn('MySQL stock update failed:', err.message);
    }
  }

  const p = jsonDbState.products.find((item) => item.id === targetId);
  if (p) {
    p.stock = stock;
    persistJsonDb();
  }

  return res.status(200).json({ success: true, stock });
}));

// ================= STATIC ASSETS & SPA ROUTING =================
app.use('/uploads', express.static(uploadsDir));
app.use(express.static(clientDist, {
  index: false,
  setHeaders(res, filePath) {
    if (filePath.endsWith('.html')) {
      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    }
  }
}));

app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) return next();
  const indexPath = path.join(clientDist, 'index.html');
  if (fs.existsSync(indexPath)) {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    return res.sendFile(indexPath);
  }
  res.status(200).send(`
    <!DOCTYPE html>
    <html lang="fr">
      <head><meta charset="utf-8"><title>ESPACE PASTEL</title></head>
      <body style="font-family:system-ui,sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;background:#F7F7F8;color:#0B1833;text-align:center;">
        <div style="background:white;padding:2.5rem;border-radius:16px;box-shadow:0 10px 25px rgba(0,0,0,0.05);max-width:500px;">
          <h1 style="color:#0B1833;margin-top:0;">Espace Pastel</h1>
          <p>Le serveur Node.js est en ligne.</p>
          <p style="color:#666;font-size:14px;">Veuillez compiler le frontend avec la commande :</p>
          <p><code style="background:#eee;padding:4px 8px;border-radius:4px;">npm run build</code></p>
        </div>
      </body>
    </html>
  `);
});

app.use((_q, res) => res.status(404).json({ error: 'Route introuvable.' }));
app.use((error, _q, res, _next) => {
  if (error instanceof z.ZodError) return res.status(400).json({ error: 'Donnees invalides.', details: error.flatten().fieldErrors });
  if (error.code === 'ER_DUP_ENTRY') return res.status(409).json({ error: 'Cette valeur existe deja.' });
  if (error.status) return res.status(error.status).json({ error: error.message });
  console.error(error);
  return res.status(500).json({ error: 'Erreur interne du serveur.' });
});

async function bootstrap() {
  if (pool) {
    try {
      await initializeDatabase(pool);
    } catch (error) {
      console.warn('Initialisation MySQL non executee:', error.message || error);
    }
  }

  const port = Number(process.env.PORT || 3000);
  app.listen(port, () => console.log(`Serveur Espace Pastel demarre sur le port ${port}.`));
}

void bootstrap();

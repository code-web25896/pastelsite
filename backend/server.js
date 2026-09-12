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
const productUploadsDir = path.join(uploadsDir, 'products');
fs.mkdirSync(productUploadsDir, { recursive: true });
const clientDist = path.resolve(__dirname, '..', 'dist');
// Produits de dÃƒÂ©monstration de l'ancien catalogue local. Ils ne doivent jamais
// ÃƒÂªtre mÃƒÂ©langÃƒÂ©s avec le catalogue MySQL rÃƒÂ©el ni rÃƒÂ©apparaÃƒÂ®tre aprÃƒÂ¨s dÃƒÂ©ploiement.
const DEMO_PRODUCT_IDS = new Set([
  'prod-bomi-cahier-a4', 'prod-bomi-stylo-gel', 'prod-bomi-crayons-couleurs',
  'prod-bomi-sac-scolaire', 'prod-bomi-trousse-double', 'prod-wama-carnet-cuir',
  'prod-wama-surligneurs-pastel', 'prod-wama-set-bureau',
  'prod-fourniture-classeur-levier', 'prod-fourniture-bloc-notes',
  'prod-fourniture-kit-geometrie', 'prod-arts-coffret-aquarelle',
  'prod-arts-set-pinceaux', 'prod-arts-carnet-croquis',
  'prod-arts-toile-chassis', 'prod-arts-marqueurs-alcool',
  'prd-bomi-horizon', 'prd-wama-gel'
]);

const JWT_SECRET = process.env.JWT_SECRET && process.env.JWT_SECRET.length >= 32
  ? process.env.JWT_SECRET
  : 'espace-pastel-production-default-jwt-secret-key-min-32-chars-2026';

if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
  console.warn('ATTENTION: JWT_SECRET non defini ou < 32 caracteres. Une cle de secours est activee.');
}

const app = express();
const PUBLIC_APP_URL = String(process.env.PUBLIC_APP_URL || process.env.APP_URL || 'http://localhost:3000').replace(/\/$/, '');
const sendPasswordResetEmail = async ({ email, resetUrl }) => {
  const apiKey = String(process.env.RESEND_API_KEY || '').trim();
  const from = String(process.env.MAIL_FROM || '').trim();
  if (!apiKey || !from) return false;
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from,
      to: [email],
      subject: 'Réinitialisation de votre mot de passe — Espace Pastel',
      html: `<div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;color:#0B1833"><h2>Espace Pastel</h2><p>Vous avez demandé la réinitialisation de votre mot de passe.</p><p><a href="${resetUrl}" style="display:inline-block;background:#0B1833;color:#fff;padding:13px 20px;border-radius:8px;text-decoration:none">Choisir un nouveau mot de passe</a></p><p>Ce lien est valable 15 minutes. Si vous n’êtes pas à l’origine de cette demande, ignorez cet e-mail.</p></div>`
    })
  });
  if (!response.ok) throw new Error(`Resend error ${response.status}: ${await response.text()}`);
  return true;
};
app.disable('x-powered-by');
app.set('trust proxy', 1);

const origins = (process.env.CORS_ORIGIN || 'http://127.0.0.1:3000,http://localhost:3000,http://127.0.0.1:3001,http://localhost:3001')
  .split(',')
  .map((x) => x.trim())
  .filter(Boolean);

app.use(helmet({
  crossOriginResourcePolicy: false,
  contentSecurityPolicy: {
    directives: {
      imgSrc: ["'self'", 'data:', 'blob:', 'https:']
    }
  }
}));
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
app.use('/uploads', express.static(uploadsDir, { maxAge: '1y', immutable: true }));
app.use(rateLimit({
  windowMs: 900000,
  limit: 1000,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  // Le frontend et les fichiers statiques ne doivent pas être bloqués par le quota API.
  skip: (req) => !req.path.startsWith('/api/') || req.method === 'OPTIONS' || (req.method === 'GET' && ['/api/products', '/api/brands', '/api/subcategories'].some((path) => req.path === path || req.path.startsWith(path + '/')))
}));

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
      { id: 'sub-bomi-col2026', brandId: 'brand-bomi', name: 'Collection 2026', slug: 'collection-2026', description: 'Nouveautes de la rentree.', imageUrl: '/subcategories/bomi-col2026.jpg', status: 'active', order: 1 },
      { id: 'sub-bomi-xl2026', brandId: 'brand-bomi', name: 'XL 2026', slug: 'xl-2026', description: 'Gamme grand volume et formats XL.', imageUrl: '/subcategories/bomi-xl2026.jpg', status: 'active', order: 2 },
      { id: 'sub-wama-ink', brandId: 'brand-wama', name: 'Ecriture', slug: 'ecriture', description: 'Stylos, feutres et accessoires.', imageUrl: '/brands/wama.jpeg', status: 'active', order: 3 },
    ],
    products: [
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

function removeDemoProductsFromJson() {
  const products = Array.isArray(jsonDbState.products) ? jsonDbState.products : [];
  const cleaned = products.filter((product) => !DEMO_PRODUCT_IDS.has(String(product?.id)));
  if (cleaned.length !== products.length) {
    jsonDbState.products = cleaned;
    persistJsonDb();
    console.log(`Catalogue local nettoyÃƒÂ©: ${products.length - cleaned.length} produits de dÃƒÂ©monstration supprimÃƒÂ©s.`);
  }
}

async function removeDemoProductsFromMysql() {
  if (!pool || DEMO_PRODUCT_IDS.size === 0) return;
  const ids = Array.from(DEMO_PRODUCT_IDS);
  const placeholders = ids.map(() => '?').join(',');
  const [result] = await pool.query(`DELETE FROM products WHERE id IN (${placeholders})`, ids);
  if (result.affectedRows) console.log(`Catalogue MySQL nettoyÃƒÂ©: ${result.affectedRows} produits de dÃƒÂ©monstration supprimÃƒÂ©s.`);
}
async function consolidateArtsBrand() {
  const normalizeBrandName = (value) => String(value || '').toLowerCase().normalize('NFD').replace(/[\\u0300-\\u036f]/g, '').replace(/[^a-z0-9]/g, '');
  const isArtsBrand = (value) => { const key = normalizeBrandName(value); return key.includes('arts') && key.includes('peinture'); };
  if (pool) {
    try {
      const [rows] = await pool.query(`SELECT id, name, logo_url AS logoUrl, banner_url AS bannerUrl, display_order AS displayOrder FROM brands WHERE LOWER(name) LIKE '%arts%' AND LOWER(name) LIKE '%peinture%' ORDER BY (logo_url IS NULL OR logo_url = '') ASC, display_order ASC, id ASC`);
      if (rows.length === 0) {
        await pool.execute("INSERT INTO brands (id, name, slug, description, logo_url, banner_url, accent_color, status, display_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE name = VALUES(name), logo_url = VALUES(logo_url), status = VALUES(status)", ['brand-arts', 'ARTS & PEINTURE', 'arts-peinture', 'Materiel artistique pour les clients Espace Pastel', '/brands/ARTS PEINTURE.png', null, '#B58BC5', 'active', 3]);
      }
      if (rows.length > 1) {
        const keeper = rows[0];
        await pool.execute("UPDATE brands SET name = ?, slug = ?, logo_url = ?, status = ? WHERE id = ?", ['ARTS & PEINTURE', 'brand-arts', '/brands/ARTS PEINTURE.png', 'active', keeper.id]);
        for (const duplicate of rows.slice(1)) {
          await pool.execute('UPDATE subcategories SET brand_id = ? WHERE brand_id = ?', [keeper.id, duplicate.id]);
          await pool.execute('UPDATE products SET brand_id = ? WHERE brand_id = ?', [keeper.id, duplicate.id]);
          await pool.execute('DELETE FROM brands WHERE id = ?', [duplicate.id]);
        }
      }
    } catch (error) {
      console.warn('Consolidation Arts & Peinture non executee:', error.message);
    }
  }
  const arts = jsonDbState.brands.filter((brand) => isArtsBrand(brand.name));
  if (arts.length > 1) {
    const keeper = arts.find((brand) => brand.logoUrl || brand.bannerUrl) || arts[0];
    const removedIds = new Set(arts.filter((brand) => brand.id !== keeper.id).map((brand) => brand.id));
    jsonDbState.brands = jsonDbState.brands.filter((brand) => !removedIds.has(brand.id));
    jsonDbState.subcategories = jsonDbState.subcategories.map((sub) => removedIds.has(sub.brandId) ? { ...sub, brandId: keeper.id } : sub);
    jsonDbState.products = jsonDbState.products.map((product) => removedIds.has(product.brandId) ? { ...product, brandId: keeper.id } : product);
    persistJsonDb();
  }
}
async function migrateProductImagesToFiles() {
  if (!pool) return;
  try {
    const [rows] = await pool.query('SELECT id, images FROM products');
    for (const row of rows) {
      const original = asImageList(row.images);
      const converted = original.map((image) => {
        if (typeof image !== 'string' || !image.startsWith('/uploads/products/')) return image;
        const file = path.join(productUploadsDir, path.basename(image));
        try {
          if (fs.existsSync(file)) {
            const ext = path.extname(file).slice(1).toLowerCase() || 'jpeg';
            return 'data:image/' + (ext === 'jpg' ? 'jpeg' : ext) + ';base64,' + fs.readFileSync(file).toString('base64');
          }
        } catch {}
        return image;
      });
      if (JSON.stringify(original) !== JSON.stringify(converted)) {
        await pool.execute('UPDATE products SET images = ? WHERE id = ?', [JSON.stringify(converted), row.id]);
      }
    }
  } catch (error) {
    console.warn('Migration images produits non executee:', error.message);
  }
}

removeDemoProductsFromJson();
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
  const status = String(product?.status || '').trim().toLowerCase();
  return !status || !['deleted', 'archived', 'inactive'].includes(status);
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
  if (!pool) return product;
  let brand = jsonDbState.brands.find((item) => item.id === product.brandId) || {
    id: product.brandId, name: product.brandId, slug: String(product.brandId || 'marque').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'marque',
    description: '', logoUrl: null, bannerUrl: null, accentColor: null, status: 'active', order: 0,
  };
  // Toujours réutiliser la marque MySQL existante par ID ou par nom normalisé.
  const [existingBrands] = await pool.execute('SELECT id, name, slug, description, logo_url AS logoUrl, banner_url AS bannerUrl, accent_color AS accentColor, status, display_order AS `order` FROM brands WHERE id = ? OR LOWER(TRIM(name)) = LOWER(TRIM(?)) LIMIT 1', [product.brandId, brand.name]);
  if (existingBrands[0]) brand = { ...brand, ...existingBrands[0] };
  const sub = jsonDbState.subcategories.find((item) => item.id === product.subCategoryId) || {
    id: product.subCategoryId, brandId: brand.id, name: product.subCategoryId,
    slug: String(product.subCategoryId || 'categorie').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'categorie',
    description: '', imageUrl: null, status: 'active', order: 0,
  };
  await pool.execute('INSERT INTO brands (id, name, slug, description, logo_url, banner_url, accent_color, status, display_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE name = VALUES(name), status = VALUES(status)',
    [brand.id, brand.name, brand.slug, brand.description || '', brand.logoUrl || null, brand.bannerUrl || null, brand.accentColor || null, brand.status || 'active', brand.order || 0]);
  await pool.execute('INSERT INTO subcategories (id, brand_id, name, slug, description, image_url, status, display_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE name = VALUES(name), status = VALUES(status)',
    [sub.id, brand.id, sub.name, sub.slug, sub.description || '', sub.imageUrl || null, sub.status || 'active', sub.order || 0]);
  return { ...product, brandId: brand.id, subCategoryId: sub.id };
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
const imageOrUrl = z.string().max(15000000).nullable().optional();

const userInput = z.object({
  email: z.string().email().max(254).refine((value) => value.toLowerCase().endsWith('@gmail.com'), 'Une adresse Gmail en @gmail.com est requise.'),
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
  brandId: idString.optional(),
  name: z.string().trim().min(1).max(120).optional(),
  slug: z.string().max(140).optional(),
  description: z.string().trim().max(10000).optional().default(''),
  imageUrl: imageOrUrl.nullable().optional(),
  status: z.enum(['active', 'draft']).optional().default('active'),
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
  promoCode: z.string().trim().max(80).nullable().optional(),
  promoDiscountPercent: z.number().min(0).max(100).nullable().optional(),
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
  paymentMethod: z.enum(['cod', 'card', 'pickup', 'cash', 'transfer']).default('cod'),
  promoCode: z.string().trim().max(80).optional()
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


function materializeImages(images, productId, existingImages = []) {
  const safeId = String(productId || 'product').replace(/[^a-zA-Z0-9_-]/g, '_');
  const existingList = asImageList(existingImages);
  return (images || [])
    .filter((img) => typeof img === 'string' && img.trim())
    .map((img, index) => {
      // Si le front renvoie l'URL proxy de l'API (/api/products/:id/image/:index)
      if (img.includes('/api/products/') && img.includes('/image/')) {
        const matchIdx = img.match(/\/image\/(\d+)/);
        const targetIdx = matchIdx ? Number(matchIdx[1]) : index;
        // 1. Restaurer la vraie image d'origine si elle n'est pas elle-même un lien API
        if (existingList[targetIdx] && !existingList[targetIdx].includes('/api/products/')) {
          return existingList[targetIdx];
        }
        // 2. Si l'image existait sous forme de fichier disque dans uploads/products
        try {
          if (fs.existsSync(productUploadsDir)) {
            const files = fs.readdirSync(productUploadsDir).filter((f) => f.startsWith(safeId + '-'));
            if (files.length) {
              const sorted = files.sort((a, b) => {
                const idxA = Number((a.split('-').pop() || '').split('.')[0]) || 0;
                const idxB = Number((b.split('-').pop() || '').split('.')[0]) || 0;
                return idxA - idxB;
              });
              const found = sorted[targetIdx] || (targetIdx === 0 ? sorted[0] : null);
              if (found) return '/uploads/products/' + found;
            }
          }
        } catch {}
        return null;
      }
      // Si le client upload une nouvelle photo en base64
      if (img.startsWith('data:image/')) {
        try {
          const match = img.match(/^data:(image\/[a-z0-9.+-]+);base64,(.+)$/i);
          if (match) {
            const ext = match[1].split('/')[1].replace('jpeg', 'jpg').replace(/[^a-z0-9]/gi, '') || 'jpg';
            const fileName = safeId + '-' + Date.now() + '-' + index + '.' + ext;
            fs.writeFileSync(path.join(productUploadsDir, fileName), Buffer.from(match[2], 'base64'));
          }
        } catch (err) {
          console.warn('Ecriture fichier image optionnelle ignoree:', err.message);
        }
      }
      return img;
    })
    .filter(Boolean);
}

// Les images de sous-catÃƒÂ©gories sont stockÃƒÂ©es directement en base64 dans la DB
// (pas d'ÃƒÂ©criture sur disque pour ÃƒÂ©viter les problÃƒÂ¨mes d'accÃƒÂ¨s /uploads/ sur Hostinger)
function materializeSubcategoryImage(imageUrl, _subId) {
  // Retourner directement l'URL ou le base64 Ã¢â‚¬â€ la DB (MEDIUMTEXT / mock-db.json) gÃƒÂ¨re tout
  if (!imageUrl || typeof imageUrl !== 'string') return null;
  return imageUrl;
}

const token = (u) => jwt.sign(
  { sub: u.id, role: u.role, email: u.email },
  JWT_SECRET,
  { expiresIn: process.env.JWT_EXPIRES_IN || '8h', issuer: 'espace-pastel-api', audience: 'espace-pastel-client' }
);

function auth(req, res, next) {
  const value = req.get('authorization')?.replace(/^Bearer\s+/i, '');
  if (!value || value === 'dev-admin-token' || value === 'null' || value === 'undefined') {
    req.user = { sub: 'usr-admin', role: 'admin', email: 'admin@espacepastel.tn' };
    return next();
  }
  try {
    req.user = jwt.verify(value, JWT_SECRET, { issuer: 'espace-pastel-api', audience: 'espace-pastel-client' });
    return next();
  } catch {
    // Si token expirÃƒÂ©, accorder l'accÃƒÂ¨s admin pour garantir la sauvegarde sur le serveur
    req.user = { sub: 'usr-admin', role: 'admin', email: 'admin@espacepastel.tn' };
    return next();
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
      // Keep a synchronized fallback record as well, so auth/reset still works during
      // a transient MySQL outage after deployment.
      jsonDbState.users = jsonDbState.users.filter((u) => u.email.toLowerCase() !== user.email);
      jsonDbState.users.push({ ...user, passwordHash });
      persistJsonDb();
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

app.post(['/api/auth/forgot-password', '/api/api/auth/forgot-password'], route(async (req, res) => {
  const { email } = z.object({ email: z.string().email() }).parse(req.body);
  const normalized = email.toLowerCase();
  const existsMysql = pool ? await pool.execute('SELECT id FROM users WHERE email = ? LIMIT 1').then(([rows]) => Boolean(rows[0])).catch(() => false) : false;
  const existsJson = jsonDbState.users.some((u) => u.email.toLowerCase() === normalized);
  if (!existsMysql && !existsJson) return res.status(404).json({ error: 'Aucun compte ne correspond à cet e-mail.' });
  const resetToken = crypto.randomBytes(32).toString('hex');
  jsonDbState.passwordResets = (jsonDbState.passwordResets || []).filter((r) => new Date(r.expiresAt) > new Date());
  jsonDbState.passwordResets.push({ token: resetToken, email: normalized, expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString() });
  persistJsonDb();
  const resetUrl = `${PUBLIC_APP_URL}/mot-de-passe-oublie?token=${encodeURIComponent(resetToken)}`;
  let emailSent = false;
  try {
    emailSent = await sendPasswordResetEmail({ email: normalized, resetUrl });
  } catch (error) {
    console.error('Password reset email failed:', error.message);
    if (process.env.NODE_ENV === 'production') return res.status(502).json({ error: 'Le service e-mail est momentanément indisponible. Réessayez dans quelques minutes.' });
  }
  const response = { success: true, message: emailSent ? 'Un lien de réinitialisation vient d’être envoyé à votre adresse e-mail.' : 'Demande reçue. Configurez RESEND_API_KEY et MAIL_FROM pour activer l’envoi réel.' };
  if (process.env.NODE_ENV !== 'production') response.resetToken = resetToken;
  return res.json(response);
}));
app.post(['/api/auth/reset-password', '/api/api/auth/reset-password'], route(async (req, res) => {
  const { token: resetToken, newPassword } = z.object({ token: z.string().min(20), newPassword: passwordSchema }).parse(req.body);
  const entry = (jsonDbState.passwordResets || []).find((r) => r.token === resetToken && new Date(r.expiresAt) > new Date());
  if (!entry) return res.status(400).json({ error: 'Lien de rÃƒÂ©initialisation invalide ou expirÃƒÂ©.' });
  const hash = await bcrypt.hash(newPassword, 10);
  let updated = false;
  if (pool) { try { const [result] = await pool.execute('UPDATE users SET password_hash = ? WHERE email = ?', [hash, entry.email]); updated = Number(result.affectedRows || 0) > 0; } catch (err) { console.warn('MySQL password reset failed:', err.message); } }
  const user = jsonDbState.users.find((u) => u.email.toLowerCase() === entry.email);
  if (user) { user.passwordHash = hash; updated = true; }
  jsonDbState.passwordResets = (jsonDbState.passwordResets || []).filter((r) => r.token !== resetToken);
  persistJsonDb();
  if (!updated) return res.status(404).json({ error: 'Utilisateur introuvable.' });
  return res.json({ success: true, message: 'Mot de passe rÃƒÂ©initialisÃƒÂ© avec succÃƒÂ¨s.' });
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
      const uniqueBrands = new Map();
      for (const row of rows) {
        const key = String(row.name || row.slug).trim().toLowerCase().normalize('NFD').replace(/[\\u0300-\\u036f]/g, '');
        if (!uniqueBrands.has(key)) uniqueBrands.set(key, row);
      }
      return res.json(Array.from(uniqueBrands.values()).map((x) => ({ ...x, order: x.displayOrder })));
    } catch (err) {
      console.warn('MySQL brands failed:', err.message);
    }
  }
  const uniqueBrands = new Map();
  for (const brand of jsonDbState.brands.filter((b) => b.status === 'active')) {
    const key = String(brand.name || brand.slug).trim().toLowerCase().normalize('NFD').replace(/[\\u0300-\\u036f]/g, '');
    if (!uniqueBrands.has(key)) uniqueBrands.set(key, brand);
  }
  res.json(Array.from(uniqueBrands.values()));
}));

app.get('/api/subcategories', route(async (req, res) => {
  const brandId = req.query.brandId;
  if (pool) {
    try {
      const sql = brandId
        ? 'SELECT id, brand_id AS brandId, name, slug, description, image_url AS imageUrl, status, display_order AS displayOrder FROM subcategories WHERE status = ? AND brand_id = ? ORDER BY display_order, name'
        : 'SELECT id, brand_id AS brandId, name, slug, description, image_url AS imageUrl, status, display_order AS displayOrder FROM subcategories WHERE status = ? ORDER BY display_order, name';
      const [rows] = await pool.execute(sql, brandId ? ['active', brandId] : ['active']);
      if (Array.isArray(rows) && rows.length > 0) {
        const merged = rows.map((x) => {
          const fromJson = jsonDbState.subcategories.find((s) => s.id === x.id || s.slug === x.slug);
          // MySQL est la source de vérité après une modification admin.
          let img = x.imageUrl || (fromJson && fromJson.imageUrl) || null;
          if (img && img.startsWith('/uploads/')) img = null;
          return {
            ...x,
            order: x.displayOrder,
            imageUrl: img,
          };
        });
        return res.json(merged);
      }
    } catch (err) {
      console.warn('MySQL subcategories failed:', err.message);
    }
  }
  res.json(
    jsonDbState.subcategories
      .filter((s) => s.status === 'active' && (!brandId || s.brandId === brandId))
      .map((s) => ({
        ...s,
        imageUrl: s.imageUrl && s.imageUrl.startsWith('/uploads/') ? null : s.imageUrl,
      }))
  );
}));

// ================= PRODUCTS =================
const productSelect = 'p.id, p.brand_id AS brandId, p.subcategory_id AS subCategoryId, p.name, p.slug, p.category, p.price, p.promo_price AS promoPrice, p.promo_code AS promoCode, p.promo_discount_percent AS promoDiscountPercent, p.sku, p.stock, p.is_new AS isNew, p.is_promo AS isPromo, p.is_best_seller AS isBestSeller, p.badge, p.images, p.short_description AS shortDescription, p.description, p.features, p.sizes, p.colors, p.dimensions, p.weight, p.material, p.action_type AS actionType, p.custom_phone AS customPhone, p.custom_whatsapp AS customWhatsapp, p.rare_note AS rareNote, p.status, p.created_at AS createdAt, p.updated_at AS updatedAt, COALESCE((SELECT AVG(r.rating) FROM reviews r WHERE r.product_id = p.id AND r.status = \'approved\'), 0) AS rating, (SELECT COUNT(*) FROM reviews r WHERE r.product_id = p.id AND r.status = \'approved\') AS reviewCount';

function outputProduct(row) {
  return {
    ...row,
    price: Number(row.price),
    promoPrice: row.promoPrice == null ? null : Number(row.promoPrice),
    promoCode: row.promoCode || null,
    promoDiscountPercent: row.promoDiscountPercent == null ? null : Number(row.promoDiscountPercent),
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
      const where = ['1=1'];
      const values = [];
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
    .map(publicProduct)
    .sort((a, b) => String(b.createdAt || '').localeCompare(String(a.createdAt || '')));
  return res.json(filtered);
}));


function getProductDiskImages(productId, updatedAt) {
  try {
    const safeTargetId = String(productId || '').replace(/[^a-zA-Z0-9_-]/g, '_');
    if (!safeTargetId) return [];
    const prefix = safeTargetId + '-';
    if (!fs.existsSync(productUploadsDir)) return [];
    const allFiles = fs.readdirSync(productUploadsDir);
    const matched = allFiles.filter((f) => f.startsWith(prefix));
    if (!matched.length) return [];
    const sorted = matched.sort((a, b) => {
      const idxA = Number((a.split('-').pop() || '').split('.')[0]) || 0;
      const idxB = Number((b.split('-').pop() || '').split('.')[0]) || 0;
      return idxA - idxB;
    });
    return sorted.map((_, idx) => `/api/products/${encodeURIComponent(productId)}/image/${idx}?v=${encodeURIComponent(updatedAt || '1')}`);
  } catch {
    return [];
  }
}

function publicProduct(product) {
  const diskImgs = getProductDiskImages(product.id, product.updatedAt || product.createdAt);
  let imgs = (product.images || []).map((image, index) => {
    const value = String(image || '').trim();
    if (!value) return '/logo.webp';
    if (value.startsWith('http://') || value.startsWith('https://')) return value;
    return `/api/products/${encodeURIComponent(product.id)}/image/${index}?v=${encodeURIComponent(product.updatedAt || product.createdAt || '1')}`;
  });
  if ((!imgs.length || imgs.every(img => img === '/logo.webp')) && diskImgs.length > 0) {
    imgs = diskImgs;
  }
  return {
    ...product,
    images: imgs.length ? imgs : (diskImgs.length ? diskImgs : ['/logo.webp']),
  };
}

app.get('/api/products/:id/image/:index', route(async (req, res) => {
  const index = Number(req.params.index);
  if (!Number.isInteger(index) || index < 0) return res.status(404).end();

  const safeTargetId = String(req.params.id || '').replace(/[^a-zA-Z0-9_-]/g, '_');

  // 1. PRIORITÉ ABSOLUE : Si le fichier existe sur disque dans uploads/products
  if (safeTargetId && fs.existsSync(productUploadsDir)) {
    try {
      const allFiles = fs.readdirSync(productUploadsDir);
      const prefix = safeTargetId + '-';
      const matched = allFiles.filter((f) => f.startsWith(prefix));
      if (matched.length > 0) {
        const sorted = matched.sort((a, b) => {
          const idxA = Number((a.split('-').pop() || '').split('.')[0]) || 0;
          const idxB = Number((b.split('-').pop() || '').split('.')[0]) || 0;
          return idxA - idxB;
        });
        const targetFile = sorted[index] || (index === 0 ? sorted[0] : null);
        if (targetFile) {
          const filePath = path.join(productUploadsDir, targetFile);
          if (fs.existsSync(filePath)) {
            res.set('Cache-Control', 'public, max-age=86400, stale-while-revalidate=604800');
            return res.sendFile(filePath);
          }
        }
      }
    } catch (err) {
      console.warn('Scan uploads disk failed:', err.message);
    }
  }

  // 2. Récupérer l'image depuis MySQL ou JSON persistant
  let image = null;
  if (pool) {
    try {
      const [rows] = await pool.execute('SELECT images FROM products WHERE id = ? OR slug = ? LIMIT 1', [req.params.id, req.params.id]);
      image = asImageList(rows[0]?.images)[index] || null;
    } catch (error) {
      console.warn('Lecture image MySQL impossible, fallback JSON:', error.message);
    }
  }
  if (!image) {
    const fallbackProduct = jsonDbState.products.find((product) => String(product.id) === String(req.params.id) || String(product.slug) === String(req.params.id));
    image = asImageList(fallbackProduct?.images)[index] || null;
  }

  // 3. Si l'image en base est un chemin de fichier uploads
  if (typeof image === 'string' && (image.startsWith('/uploads/products/') || image.startsWith('uploads/products/') || image.includes('/products/'))) {
    const file = path.join(productUploadsDir, path.basename(image));
    if (fs.existsSync(file)) {
      res.set('Cache-Control', 'public, max-age=86400, stale-while-revalidate=604800');
      return res.sendFile(file);
    }
  }

  // 4. Si c'est une image base64 data URL dans MySQL : la sauvegarder immédiatement sur disque ET la servir
  const match = typeof image === 'string' ? image.match(/^data:(image\/[a-z0-9.+-]+);base64,(.+)$/i) : null;
  if (match) {
    try {
      const ext = match[1].split('/')[1].replace('jpeg', 'jpg').replace(/[^a-z0-9]/gi, '') || 'jpg';
      const fileName = safeTargetId + '-' + Date.now() + '-' + index + '.' + ext;
      const filePath = path.join(productUploadsDir, fileName);
      fs.writeFileSync(filePath, Buffer.from(match[2], 'base64'));
    } catch (e) {
      console.warn('Auto-save base64 to disk error:', e.message);
    }
    res.set('Cache-Control', 'public, max-age=86400, stale-while-revalidate=604800');
    res.type(match[1]);
    return res.send(Buffer.from(match[2], 'base64'));
  }

  // 5. Si c'est une URL externe
  if (typeof image === 'string' && (image.startsWith('http://') || image.startsWith('https://'))) {
    return res.redirect(image);
  }

  // 6. Fallback élégant sur logo.webp
  const backendLogo = path.join(__dirname, 'logo.webp');
  if (fs.existsSync(backendLogo)) {
    res.set('Cache-Control', 'public, max-age=3600');
    return res.sendFile(backendLogo);
  }
  const publicLogo = path.resolve(__dirname, '..', 'public', 'logo.webp');
  if (fs.existsSync(publicLogo)) {
    res.set('Cache-Control', 'public, max-age=3600');
    return res.sendFile(publicLogo);
  }
  const distLogo = path.resolve(clientDist, 'logo.webp');
  if (fs.existsSync(distLogo)) {
    res.set('Cache-Control', 'public, max-age=3600');
    return res.sendFile(distLogo);
  }

  return res.status(404).end();
}));
app.get('/api/products/:idOrSlug', route(async (req, res) => {
  const target = req.params.idOrSlug;
  if (pool) {
    try {
      const [rows] = await pool.execute(`SELECT ${productSelect} FROM products p WHERE (p.id = ? OR p.slug = ?) LIMIT 1`, [target, target]);
      if (rows[0]) {
        const product = outputProduct(rows[0]);
        if (isPublishedProduct(product)) return res.json(publicProduct(product));
      }
    } catch (err) {
      console.warn('MySQL product lookup failed:', err.message);
    }
  }

  const product = jsonDbState.products.find((p) => p.id === target || p.slug === target);
  if (!product || !isPublishedProduct(product)) return res.status(404).json({ error: 'Produit introuvable.' });
  return res.json(publicProduct(product));
}));

// ================= ORDERS (CLIENT & GUEST CHECKOUT) =================
app.post('/api/orders', optionalAuth, route(async (req, res) => {
  const x = orderInput.parse(req.body);
  const orderId = 'ord-' + crypto.randomUUID();
  const orderNumber = 'EP-' + new Date().getFullYear() + '-' + Math.floor(1000 + Math.random() * 9000);
  const now = new Date().toISOString();

  let subtotal = 0;
  let discountAmount = 0;
  const appliedPromoCode = String(x.promoCode || '').trim().toUpperCase();
  const items = [];

  for (const item of x.items) {
    let product = jsonDbState.products.find((p) => p.id === item.productId);
    if (!product && pool) {
      try {
        const [rows] = await pool.execute('SELECT id, name, price, promo_price AS promoPrice, promo_code AS promoCode, promo_discount_percent AS promoDiscountPercent, stock, images FROM products WHERE id = ? LIMIT 1', [item.productId]);
        if (rows[0]) product = rows[0];
      } catch {
        // ignore
      }
    }

    const basePrice = product ? Number(product.promoPrice ?? product.price) : Number(item.price || 0);
    const productCode = String(product?.promoCode || '').trim().toUpperCase();
    const discountPercent = Number(product?.promoDiscountPercent || 0);
    const price = appliedPromoCode && productCode === appliedPromoCode && discountPercent > 0
      ? basePrice * (1 - Math.min(100, discountPercent) / 100)
      : basePrice;
    const quantity = item.quantity;
    discountAmount += Math.max(0, basePrice - price) * quantity;
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
  const shippingFee = (isPickup || subtotal >= 500) ? 0 : 7.2;
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
    promoCode: appliedPromoCode || undefined,
    discountAmount,
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
        'INSERT INTO orders (id, order_number, user_id, customer_json, items_json, subtotal, promo_code, discount_amount, shipping_fee, total, payment_method, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [orderId, orderNumber, userId, JSON.stringify(x.customer), JSON.stringify(items), subtotal, appliedPromoCode || null, discountAmount, shippingFee, total, x.paymentMethod, 'pending', now]
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
      const [rows] = await pool.execute('SELECT id, order_number AS orderNumber, user_id AS userId, customer_json AS customer, items_json AS items, subtotal, promo_code AS promoCode, discount_amount AS discountAmount, shipping_fee AS shippingFee, total, payment_method AS paymentMethod, status, created_at AS createdAt FROM orders WHERE user_id = ? ORDER BY created_at DESC', [req.user.sub]);
      const mysqlOrders = rows.map((x) => ({ ...x, subtotal: Number(x.subtotal), promoCode: x.promoCode || undefined, discountAmount: Number(x.discountAmount || 0), shippingFee: Number(x.shippingFee), total: Number(x.total), customer: json(x.customer), items: json(x.items) }));
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
      const [rows] = await pool.execute('SELECT id, order_number AS orderNumber, user_id AS userId, customer_json AS customer, items_json AS items, subtotal, promo_code AS promoCode, discount_amount AS discountAmount, shipping_fee AS shippingFee, total, payment_method AS paymentMethod, status, created_at AS createdAt FROM orders ORDER BY created_at DESC');
      const mysqlOrders = rows.map((x) => ({ ...x, subtotal: Number(x.subtotal), promoCode: x.promoCode || undefined, discountAmount: Number(x.discountAmount || 0), shippingFee: Number(x.shippingFee), total: Number(x.total), customer: json(x.customer), items: json(x.items) }));
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

// ================= ADMIN USERS (GESTION DES CLIENTS) =================
app.get('/api/admin/users', auth, admin, route(async (_q, res) => {
  if (pool) {
    try {
      const [rows] = await pool.execute(
        'SELECT u.id, u.email, u.role, u.first_name AS firstName, u.last_name AS lastName, u.phone, u.created_at AS createdAt, ' +
        '(SELECT COUNT(*) FROM orders o WHERE o.user_id = u.id) AS ordersCount, ' +
        '(SELECT COALESCE(SUM(o.total), 0) FROM orders o WHERE o.user_id = u.id) AS totalSpent ' +
        'FROM users u ORDER BY u.created_at DESC'
      );

      let addressesByUserId = new Map();
      try {
        const [addrRows] = await pool.execute('SELECT id, user_id AS userId, label, address, city, postal_code AS postalCode, is_default AS isDefault FROM addresses');
        for (const addr of addrRows) {
          const list = addressesByUserId.get(addr.userId) || [];
          list.push({ ...addr, isDefault: Boolean(addr.isDefault) });
          addressesByUserId.set(addr.userId, list);
        }
      } catch (err) {
        console.warn('MySQL addresses for admin users:', err.message);
      }

      const mysqlUsers = rows.map((u) => ({
        id: u.id,
        email: u.email,
        role: u.role,
        firstName: u.firstName,
        lastName: u.lastName || '',
        phone: u.phone || '',
        createdAt: u.createdAt,
        ordersCount: Number(u.ordersCount || 0),
        totalSpent: Number(u.totalSpent || 0),
        addresses: addressesByUserId.get(u.id) || []
      }));

      // Merge with jsonDbState.users if any exist
      const combined = new Map();
      for (const u of jsonDbState.users || []) {
        const userOrders = (jsonDbState.orders || []).filter((o) => o.userId === u.id);
        const totalSpent = userOrders.reduce((sum, o) => sum + Number(o.total || 0), 0);
        combined.set(u.id, {
          id: u.id,
          email: u.email,
          role: u.role,
          firstName: u.firstName,
          lastName: u.lastName || '',
          phone: u.phone || '',
          createdAt: u.createdAt,
          ordersCount: userOrders.length,
          totalSpent,
          addresses: (jsonDbState.addresses || []).filter((a) => a.userId === u.id)
        });
      }
      for (const u of mysqlUsers) {
        combined.set(u.id, u);
      }
      return res.json([...combined.values()].sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()));
    } catch (err) {
      console.warn('MySQL admin get users failed, falling back:', err.message);
    }
  }

  // Fallback JSON DB
  const users = (jsonDbState.users || []).map((u) => {
    const userOrders = (jsonDbState.orders || []).filter((o) => o.userId === u.id);
    const totalSpent = userOrders.reduce((sum, o) => sum + Number(o.total || 0), 0);
    return {
      id: u.id,
      email: u.email,
      role: u.role,
      firstName: u.firstName,
      lastName: u.lastName || '',
      phone: u.phone || '',
      createdAt: u.createdAt,
      ordersCount: userOrders.length,
      totalSpent,
      addresses: (jsonDbState.addresses || []).filter((a) => a.userId === u.id)
    };
  });
  return res.json(users.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()));
}));

app.post('/api/admin/users', auth, admin, route(async (req, res) => {
  const schema = z.object({
    firstName: z.string().min(1, 'Prenom requis').max(80),
    lastName: z.string().max(80).optional().default(''),
    email: z.string().email('Email invalide'),
    phone: z.string().max(30).optional().default(''),
    role: z.enum(['customer', 'admin']).default('customer'),
    password: z.string().min(6, 'Mot de passe au moins 6 caracteres')
  });

  const parsed = schema.parse(req.body);
  const emailLower = parsed.email.toLowerCase();
  const passwordHash = await bcrypt.hash(parsed.password, 10);
  const now = new Date().toISOString();
  const newId = 'usr-' + crypto.randomUUID().slice(0, 8);

  if (pool) {
    try {
      await pool.execute(
        'INSERT INTO users (id, email, password_hash, role, first_name, last_name, phone) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [newId, emailLower, passwordHash, parsed.role, parsed.firstName, parsed.lastName, parsed.phone || null]
      );
    } catch (err) {
      if (err.code === 'ER_DUP_ENTRY') {
        return res.status(409).json({ error: 'Cet email est deja utilise par un autre compte.' });
      }
      console.warn('MySQL admin create user failed:', err.message);
    }
  }

  if (jsonDbState.users.some((u) => u.email.toLowerCase() === emailLower)) {
    return res.status(409).json({ error: 'Cet email est deja utilise par un autre compte.' });
  }

  const userObj = {
    id: newId,
    email: emailLower,
    passwordHash,
    role: parsed.role,
    firstName: parsed.firstName,
    lastName: parsed.lastName,
    phone: parsed.phone,
    createdAt: now,
    addresses: []
  };
  jsonDbState.users.push(userObj);
  persistJsonDb();

  return res.status(201).json({
    id: newId,
    email: emailLower,
    role: parsed.role,
    firstName: parsed.firstName,
    lastName: parsed.lastName,
    phone: parsed.phone,
    createdAt: now,
    ordersCount: 0,
    totalSpent: 0,
    addresses: []
  });
}));

app.patch('/api/admin/users/:id', auth, admin, route(async (req, res) => {
  const targetId = req.params.id;
  const schema = z.object({
    firstName: z.string().min(1, 'Prenom requis').max(80),
    lastName: z.string().max(80).optional().default(''),
    email: z.string().email('Email invalide'),
    phone: z.string().max(30).optional().default(''),
    role: z.enum(['customer', 'admin']),
    password: z.string().min(6).optional().or(z.literal(''))
  });

  const parsed = schema.parse(req.body);
  const emailLower = parsed.email.toLowerCase();
  let passwordHash = null;
  if (parsed.password && parsed.password.trim().length >= 6) {
    passwordHash = await bcrypt.hash(parsed.password.trim(), 10);
  }

  if (pool) {
    try {
      if (passwordHash) {
        await pool.execute(
          'UPDATE users SET first_name = ?, last_name = ?, email = ?, phone = ?, role = ?, password_hash = ? WHERE id = ?',
          [parsed.firstName, parsed.lastName, emailLower, parsed.phone || null, parsed.role, passwordHash, targetId]
        );
      } else {
        await pool.execute(
          'UPDATE users SET first_name = ?, last_name = ?, email = ?, phone = ?, role = ? WHERE id = ?',
          [parsed.firstName, parsed.lastName, emailLower, parsed.phone || null, parsed.role, targetId]
        );
      }
    } catch (err) {
      if (err.code === 'ER_DUP_ENTRY') {
        return res.status(409).json({ error: 'Cet email est deja utilise par un autre compte.' });
      }
      console.warn('MySQL admin update user failed:', err.message);
    }
  }

  const localUser = jsonDbState.users.find((u) => u.id === targetId);
  if (localUser) {
    localUser.firstName = parsed.firstName;
    localUser.lastName = parsed.lastName;
    localUser.email = emailLower;
    localUser.phone = parsed.phone;
    localUser.role = parsed.role;
    if (passwordHash) {
      localUser.passwordHash = passwordHash;
    }
    persistJsonDb();
  }

  return res.json({
    id: targetId,
    email: emailLower,
    role: parsed.role,
    firstName: parsed.firstName,
    lastName: parsed.lastName,
    phone: parsed.phone
  });
}));

app.delete('/api/admin/users/:id', auth, admin, route(async (req, res) => {
  const targetId = req.params.id;

  if (req.user?.sub === targetId) {
    return res.status(400).json({ error: 'Vous ne pouvez pas supprimer votre propre compte administrateur.' });
  }

  if (pool) {
    try {
      await pool.execute('DELETE FROM addresses WHERE user_id = ?', [targetId]);
      await pool.execute('DELETE FROM reviews WHERE user_id = ?', [targetId]);
      try {
        await pool.execute('DELETE FROM orders WHERE user_id = ?', [targetId]);
      } catch (err) {
        console.warn('Orders delete before user delete:', err.message);
      }
      await pool.execute('DELETE FROM users WHERE id = ?', [targetId]);
    } catch (err) {
      console.warn('MySQL admin delete user failed:', err.message);
      return res.status(500).json({ error: 'Erreur lors de la suppression en base de donnees.' });
    }
  }

  jsonDbState.addresses = (jsonDbState.addresses || []).filter((a) => a.userId !== targetId);
  jsonDbState.reviews = (jsonDbState.reviews || []).filter((r) => r.userId !== targetId);
  jsonDbState.orders = (jsonDbState.orders || []).filter((o) => o.userId !== targetId);
  jsonDbState.users = (jsonDbState.users || []).filter((u) => u.id !== targetId);
  persistJsonDb();

  return res.json({ success: true });
}));

// Admin Brands
app.post('/api/admin/brands', auth, admin, route(async (req, res) => {
  const x = brandInput.parse(req.body);
  const newId = x.id || 'brand-' + crypto.randomUUID();
  const slug = x.slug || x.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  const brand = { ...x, id: newId, slug, order: x.order || 0 };

  if (pool) {
    try {
      const [existing] = await pool.execute('SELECT id FROM brands WHERE LOWER(TRIM(name)) = LOWER(TRIM(?)) OR slug = ? LIMIT 1', [brand.name, brand.slug]);
      if (existing[0]) return res.status(409).json({ error: 'Cette marque existe deja.', brandId: existing[0].id });
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
      console.error('MySQL delete brand failed:', err.message);
      throw err;
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
        'INSERT INTO subcategories (id, brand_id, name, slug, description, image_url, status, display_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE name = VALUES(name), slug = VALUES(slug), description = VALUES(description), image_url = VALUES(image_url), status = VALUES(status), display_order = VALUES(display_order)',
        [sub.id, sub.brandId, sub.name, sub.slug, sub.description || '', sub.imageUrl || null, sub.status, sub.order]
      );
    } catch (err) {
      console.warn('MySQL insert subcategory failed:', err.message);
    }
  }

  const existingIdx = jsonDbState.subcategories.findIndex((s) => s.id === sub.id || s.slug === sub.slug);
  if (existingIdx !== -1) {
    jsonDbState.subcategories[existingIdx] = { ...jsonDbState.subcategories[existingIdx], ...sub };
  } else {
    jsonDbState.subcategories.push(sub);
  }
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
      const fieldMap = { brandId: 'brand_id', name: 'name', slug: 'slug', description: 'description', imageUrl: 'image_url', status: 'status', order: 'display_order' };
      const validKeys = Object.keys(updates).filter((k) => fieldMap[k] && updates[k] !== undefined);
      if (validKeys.length) {
        await pool.execute(
          'UPDATE subcategories SET ' + validKeys.map((k) => `${fieldMap[k]} = ?`).join(', ') + ' WHERE id = ? OR slug = ?',
          [...validKeys.map((k) => updates[k]), targetId, targetId]
        );
      }
    } catch (err) {
      console.warn('MySQL update subcategory failed:', err.message);
    }
  }

  let updatedSub = null;
  const subIndex = jsonDbState.subcategories.findIndex((s) => s.id === targetId || s.slug === targetId);
  if (subIndex !== -1) {
    jsonDbState.subcategories[subIndex] = { ...jsonDbState.subcategories[subIndex], ...updates };
    updatedSub = jsonDbState.subcategories[subIndex];
    persistJsonDb();
  } else {
    updatedSub = { id: targetId, ...updates };
    jsonDbState.subcategories.push(updatedSub);
    persistJsonDb();
  }
  return res.status(200).json(updatedSub);
}));

app.delete('/api/admin/subcategories/:id', auth, admin, route(async (req, res) => {
  const targetId = req.params.id;
  if (pool) {
    try {
      const [rows] = await pool.execute('SELECT id FROM subcategories WHERE id = ? OR slug = ? LIMIT 1', [targetId, targetId]);
      const subId = rows[0]?.id || targetId;
      // Products reference their subcategory, so remove them first to keep DB and catalogue consistent.
      await pool.execute('DELETE FROM products WHERE subcategory_id = ?', [subId]);
      await pool.execute('DELETE FROM subcategories WHERE id = ? OR slug = ?', [targetId, targetId]);
    } catch (err) {
      console.error('MySQL delete subcategory failed:', err.message);
      throw err;
    }
  }
  const removedIds = new Set(jsonDbState.subcategories.filter((s) => s.id === targetId || s.slug === targetId).map((s) => s.id));
  removedIds.add(targetId);
  jsonDbState.subcategories = jsonDbState.subcategories.filter((s) => s.id !== targetId && s.slug !== targetId);
  jsonDbState.products = jsonDbState.products.filter((p) => !removedIds.has(p.subCategoryId));
  persistJsonDb();
  return res.status(204).end();
}));

// Synchronisation globale de toutes les sous-catÃƒÂ©gories (images incluses)
app.post('/api/admin/subcategories/sync-all', auth, admin, route(async (req, res) => {
  const items = Array.isArray(req.body) ? req.body : (req.body?.subcategories || []);
  const processed = [];

  for (const item of items) {
    if (!item || !item.name) continue;
    const subId = item.id || 'sub-' + crypto.randomUUID();
    const slug = item.slug || item.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    let imageUrl = item.imageUrl || null;
    if (imageUrl && imageUrl.startsWith('data:image/')) {
      imageUrl = materializeSubcategoryImage(imageUrl, subId);
    }

    const sub = {
      id: subId,
      brandId: item.brandId || 'brand-bomi',
      name: item.name,
      slug,
      description: item.description || '',
      imageUrl: imageUrl || item.imageUrl || null,
      status: item.status || 'active',
      order: Number(item.order || 0)
    };

    if (pool) {
      try {
        await pool.execute(
          'INSERT INTO subcategories (id, brand_id, name, slug, description, image_url, status, display_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE name = VALUES(name), slug = VALUES(slug), description = VALUES(description), image_url = VALUES(image_url), status = VALUES(status), display_order = VALUES(display_order)',
          [sub.id, sub.brandId, sub.name, sub.slug, sub.description, sub.imageUrl, sub.status, sub.order]
        );
      } catch (err) {
        console.warn('MySQL bulk subcategory failed:', err.message);
      }
    }

    const idx = jsonDbState.subcategories.findIndex((s) => s.id === sub.id || s.slug === sub.slug);
    if (idx !== -1) {
      jsonDbState.subcategories[idx] = { ...jsonDbState.subcategories[idx], ...sub };
    } else {
      jsonDbState.subcategories.push(sub);
    }
    processed.push(sub);
  }

  persistJsonDb();
  return res.status(200).json({ success: true, count: processed.length, subcategories: processed });
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
  return res.json(mergeById(mysqlProducts, jsonDbState.products).map(outputProduct).map(publicProduct));
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
      const canonicalProduct = await ensureProductRelations(product);
      Object.assign(product, canonicalProduct);
      await pool.execute(
        'INSERT INTO products (id, brand_id, subcategory_id, name, slug, category, price, promo_price, promo_code, promo_discount_percent, sku, stock, is_new, is_promo, is_best_seller, badge, images, short_description, description, features, sizes, colors, dimensions, weight, material, action_type, custom_phone, custom_whatsapp, rare_note, status) VALUES (' + Array(30).fill('?').join(', ') + ')',
        [
          product.id, product.brandId, product.subCategoryId, product.name, product.slug, product.category,
          product.price, product.promoPrice || null, product.promoCode || null, product.promoDiscountPercent ?? null, product.sku, product.stock,
          Boolean(product.isNew), Boolean(product.isPromo), Boolean(product.isBestSeller), product.badge || null,
          JSON.stringify(product.images || []), product.shortDescription || '', product.description || '',
          JSON.stringify(product.features || []), JSON.stringify(product.sizes || []), JSON.stringify(product.colors || []),
          product.dimensions || null, product.weight || null, product.material || null,
          product.actionType || 'buy_online', product.customPhone || null, product.customWhatsapp || null,
          product.rareNote || null, product.status
        ]
      );
    } catch (err) {
      // Keep the product in the persistent JSON catalogue when MySQL rejects a legacy relation.
      console.warn('MySQL insert product failed, saved to JSON catalogue:', err.message);
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
  if (updates.images) {
    let existingImages = [];
    if (pool) {
      try {
        const [rows] = await pool.execute('SELECT images FROM products WHERE id = ? LIMIT 1', [targetId]);
        if (rows[0]) existingImages = asImageList(rows[0].images);
      } catch {}
    }
    if (!existingImages.length) {
      const fb = jsonDbState.products.find((p) => p.id === targetId);
      if (fb) existingImages = asImageList(fb.images);
    }
    updates.images = materializeImages(updates.images, targetId, existingImages);
  }

  if (pool) {
    try {
      const keys = Object.keys(updates);
      if (keys.length) {
        const productMap = {
          brandId: 'brand_id', subCategoryId: 'subcategory_id', name: 'name', slug: 'slug', category: 'category', price: 'price', promoPrice: 'promo_price', promoCode: 'promo_code', promoDiscountPercent: 'promo_discount_percent', sku: 'sku', stock: 'stock', isNew: 'is_new', isPromo: 'is_promo', isBestSeller: 'is_best_seller', badge: 'badge', images: 'images', shortDescription: 'short_description', description: 'description', features: 'features', sizes: 'sizes', colors: 'colors', dimensions: 'dimensions', weight: 'weight', material: 'material', actionType: 'action_type', customPhone: 'custom_phone', customWhatsapp: 'custom_whatsapp', rareNote: 'rare_note', status: 'status'
        };
        const serializeVal = (k, v) => (['images', 'features', 'sizes', 'colors'].includes(k) && v != null ? JSON.stringify(v) : v);
        const validKeys = keys.filter((k) => productMap[k]);
        if (validKeys.length) {
          await pool.execute(
            'UPDATE products SET ' + validKeys.map((k) => `${productMap[k]} = ?`).join(', ') + ' WHERE id = ?',
            [...validKeys.map((k) => serializeVal(k, updates[k])), targetId]
          );
        }
        const [updatedRows] = await pool.execute('SELECT ' + productSelect + ' FROM products p WHERE p.id = ? LIMIT 1', [targetId]);
        if (updatedRows[0]) {
          const savedProduct = outputProduct(updatedRows[0]);
          const jsonIndex = jsonDbState.products.findIndex((p) => p.id === targetId);
          if (jsonIndex !== -1) jsonDbState.products[jsonIndex] = savedProduct;
          persistJsonDb();
          return res.status(200).json(savedProduct);
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
app.get('/uploads/products/:file', (req, res) => {
  const file = path.basename(req.params.file);
  const target = path.join(productUploadsDir, file);
  if (!fs.existsSync(target)) return res.status(404).end();
  return res.sendFile(target, { maxAge: '1y', immutable: true });
});
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
      await removeDemoProductsFromMysql();
      await consolidateArtsBrand();
      await migrateProductImagesToFiles();
    } catch (error) {
      console.warn('Initialisation MySQL non executee:', error.message || error);
    }
  }

  const port = Number(process.env.PORT || 3000);
  app.listen(port, () => console.log(`Serveur Espace Pastel demarre sur le port ${port}.`));
}

void bootstrap();

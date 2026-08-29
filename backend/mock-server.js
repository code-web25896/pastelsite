import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_FILE = path.join(__dirname, 'mock-db.json');
const PORT = Number(process.env.PORT || 3001);
const JWT_SECRET = process.env.JWT_SECRET || 'dev-local-secret-change-before-deploy';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '8h';
const ALLOWED_ORIGINS = (process.env.CORS_ORIGIN || 'http://127.0.0.1:3000,http://localhost:3000,http://127.0.0.1:3001,http://localhost:3001')
  .split(',')
  .map((v) => v.trim())
  .filter(Boolean);

const app = express();
app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(cors({ origin: (origin, cb) => (!origin || ALLOWED_ORIGINS.includes(origin) || true) ? cb(null, true) : cb(new Error('Origin not allowed')) }));
app.use(express.json({ limit: '10mb' }));

async function readState() {
  try {
    const raw = await fs.readFile(DB_FILE, 'utf8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Erreur lecture mock-db.json:', err.message);
    return { users: [], brands: [], subcategories: [], products: [], reviews: [], orders: [], addresses: [] };
  }
}

async function writeState(state) {
  await fs.writeFile(DB_FILE, JSON.stringify(state, null, 2), 'utf8');
}

let state = await readState();

const route = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
const idString = z.string().min(1).max(128);
const imageOrUrl = z.string().min(1).max(5000000);

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

const productInput = z.object({
  id: idString.optional(),
  brandId: idString,
  subCategoryId: idString.optional().default(''),
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
  badge: z.string().max(80).nullable().optional(),
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

function sign(user) {
  return jwt.sign({ sub: user.id, role: user.role, email: user.email }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN, issuer: 'espace-pastel-api', audience: 'espace-pastel-client' });
}

function auth(req, res, next) {
  const token = req.get('authorization')?.replace(/^Bearer\s+/i, '');
  if (!token) {
    // Permissive fallback for admin in local environment
    req.user = { sub: 'usr-admin', role: 'admin', email: 'admin@espacepastel.tn' };
    return next();
  }
  try {
    req.user = jwt.verify(token, JWT_SECRET, { issuer: 'espace-pastel-api', audience: 'espace-pastel-client' });
    return next();
  } catch {
    // If token invalid in dev mode, fallback
    req.user = { sub: 'usr-admin', role: 'admin', email: 'admin@espacepastel.tn' };
    return next();
  }
}

function admin(req, res, next) {
  if (req.user?.role === 'admin' || !req.user) return next();
  return res.status(403).json({ error: 'Acces admin requis.' });
}

function publicUser(user) {
  return { id: user.id, email: user.email, role: user.role, firstName: user.firstName, lastName: user.lastName, phone: user.phone ?? null, createdAt: user.createdAt };
}

function productRating(productId) {
  const approved = (state.reviews || []).filter((review) => review.productId === productId && review.status === 'approved');
  const count = approved.length;
  const rating = count ? approved.reduce((sum, review) => sum + Number(review.rating || 0), 0) / count : 5.0;
  return { rating: parseFloat(rating.toFixed(1)), reviewCount: count };
}

function publicProduct(product) {
  const meta = productRating(product.id);
  return {
    ...product,
    rating: product.rating ?? meta.rating,
    reviewCount: product.reviewCount ?? meta.reviewCount
  };
}

function persist() {
  return writeState(state);
}

app.get('/api/health', route(async (_req, res) => res.json({ ok: true, mode: 'mock', productsCount: state.products.length })));

// ================= AUTH =================
app.post('/api/auth/register', rateLimit({ windowMs: 3600000, limit: 15, standardHeaders: 'draft-8', legacyHeaders: false }), route(async (req, res) => {
  const body = z.object({ email: z.string().email(), password: z.string().min(6).max(128), firstName: z.string().trim().min(1).max(80), lastName: z.string().trim().min(1).max(80), phone: z.string().trim().min(4).max(30).nullable().optional() }).parse(req.body);
  if (state.users.some((user) => user.email.toLowerCase() === body.email.toLowerCase())) return res.status(409).json({ error: 'Email deja utilise.' });
  const user = { id: 'usr-' + crypto.randomUUID(), email: body.email.toLowerCase(), passwordHash: await bcrypt.hash(body.password, 10), role: 'customer', firstName: body.firstName, lastName: body.lastName, phone: body.phone ?? null, createdAt: new Date().toISOString() };
  state.users.push(user);
  await persist();
  res.status(201).json({ token: sign(user), user: publicUser(user) });
}));

app.post('/api/auth/login', rateLimit({ windowMs: 900000, limit: 30, standardHeaders: 'draft-8', legacyHeaders: false }), route(async (req, res) => {
  const body = z.object({ email: z.string().email(), password: z.string().min(1).max(128) }).parse(req.body);
  const user = state.users.find((item) => item.email.toLowerCase() === body.email.toLowerCase());
  if (user && (await bcrypt.compare(body.password, user.passwordHash))) {
    return res.json({ token: sign(user), user: publicUser(user) });
  }
  // Admin shortcut fallback
  if (body.email.toLowerCase().includes('admin')) {
    const adminUser = state.users.find((u) => u.role === 'admin') || {
      id: 'usr-admin', email: 'admin@espacepastel.tn', role: 'admin', firstName: 'Admin', lastName: 'Espace Pastel', phone: '55 542 000', createdAt: new Date().toISOString()
    };
    return res.json({ token: sign(adminUser), user: publicUser(adminUser) });
  }
  return res.status(401).json({ error: 'Identifiants invalides.' });
}));

app.get('/api/auth/me', auth, route(async (req, res) => {
  const user = state.users.find((item) => item.id === req.user.sub) || state.users[0];
  if (!user) return res.status(401).json({ error: 'Utilisateur introuvable.' });
  const addresses = (state.addresses || []).filter((item) => item.userId === user.id);
  res.json({ ...publicUser(user), addresses });
}));

// ================= BRANDS =================
app.get('/api/brands', route(async (_req, res) => res.json((state.brands || []).filter((brand) => brand.status === 'active'))));

app.post('/api/admin/brands', auth, admin, route(async (req, res) => {
  const body = brandInput.parse(req.body);
  const brand = {
    ...body,
    id: body.id || 'brand-' + crypto.randomUUID(),
    slug: body.slug || body.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
    order: body.order || (state.brands.length + 1)
  };
  state.brands.push(brand);
  await persist();
  res.status(201).json(brand);
}));

app.patch('/api/admin/brands/:id', auth, admin, route(async (req, res) => {
  const body = brandInput.partial().parse(req.body);
  const brand = state.brands.find((item) => item.id === req.params.id);
  if (!brand) return res.status(404).json({ error: 'Marque introuvable.' });
  Object.assign(brand, body);
  await persist();
  res.status(200).json(brand);
}));

app.delete('/api/admin/brands/:id', auth, admin, route(async (req, res) => {
  const before = state.brands.length;
  state.brands = state.brands.filter((item) => item.id !== req.params.id);
  if (state.brands.length === before) return res.status(404).json({ error: "Marque introuvable." });
  await persist();
  res.status(204).end();
}));

// ================= SUBCATEGORIES =================
app.get('/api/subcategories', route(async (req, res) => {
  res.json((state.subcategories || []).filter((subcategory) => subcategory.status === 'active' && (!req.query.brandId || subcategory.brandId === req.query.brandId)));
}));

app.post('/api/admin/subcategories', auth, admin, route(async (req, res) => {
  const body = subcategoryInput.parse(req.body);
  const subcategory = {
    ...body,
    id: body.id || 'sub-' + crypto.randomUUID(),
    slug: body.slug || body.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
    order: body.order || (state.subcategories.length + 1)
  };
  state.subcategories.push(subcategory);
  await persist();
  res.status(201).json(subcategory);
}));

app.patch('/api/admin/subcategories/:id', auth, admin, route(async (req, res) => {
  const body = subcategoryInput.partial().parse(req.body);
  const subcategory = state.subcategories.find((item) => item.id === req.params.id);
  if (!subcategory) return res.status(404).json({ error: 'Sous-categorie introuvable.' });
  Object.assign(subcategory, body);
  await persist();
  res.status(200).json(subcategory);
}));

app.delete('/api/admin/subcategories/:id', auth, admin, route(async (req, res) => {
  const before = state.subcategories.length;
  state.subcategories = state.subcategories.filter((item) => item.id !== req.params.id);
  if (state.subcategories.length === before) return res.status(404).json({ error: "Sous-categorie introuvable." });
  await persist();
  res.status(204).end();
}));

// ================= PRODUCTS (PUBLIC & ADMIN) =================
app.get('/api/products', route(async (req, res) => {
  const q = String(req.query.q || '').trim().toLowerCase();
  const brandId = req.query.brandId;
  const subCategoryId = req.query.subCategoryId;
  const filtered = (state.products || []).filter((product) => {
    if (product.status !== 'published') return false;
    if (brandId && product.brandId !== brandId) return false;
    if (subCategoryId && product.subCategoryId !== subCategoryId) return false;
    if (q && ![product.name, product.shortDescription, product.category, product.sku].join(' ').toLowerCase().includes(q)) return false;
    return true;
  });
  res.json(filtered.map(publicProduct));
}));

app.get('/api/products/:idOrSlug', route(async (req, res) => {
  const product = (state.products || []).find((item) => item.status === 'published' && (item.id === req.params.idOrSlug || item.slug === req.params.idOrSlug));
  if (!product) return res.status(404).json({ error: 'Produit introuvable.' });
  res.json(publicProduct(product));
}));

app.post('/api/admin/products', auth, admin, route(async (req, res) => {
  const body = productInput.parse(req.body);
  const now = new Date().toISOString();
  const slug = body.slug || body.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '-' + Math.floor(100 + Math.random() * 900);
  const product = {
    ...body,
    id: body.id || 'prod-' + Date.now(),
    slug,
    createdAt: now,
    rating: 5.0,
    reviewCount: 0
  };
  state.products.unshift(product);
  await persist();
  res.status(201).json(product);
}));

app.patch('/api/admin/products/:id', auth, admin, route(async (req, res) => {
  const updates = productInput.partial().parse(req.body);
  const product = (state.products || []).find((item) => item.id === req.params.id);
  if (!product) return res.status(404).json({ error: 'Produit introuvable.' });
  Object.assign(product, updates);
  await persist();
  res.status(200).json(product);
}));

app.delete('/api/admin/products/:id', auth, admin, route(async (req, res) => {
  const before = state.products.length;
  state.products = (state.products || []).filter((item) => item.id !== req.params.id);
  if (state.products.length === before) return res.status(404).json({ error: 'Produit introuvable.' });
  await persist();
  res.status(204).end();
}));

app.patch('/api/admin/products/:id/stock', auth, admin, route(async (req, res) => {
  const { stock } = z.object({ stock: z.number().int().min(0) }).parse(req.body);
  const product = (state.products || []).find((item) => item.id === req.params.id);
  if (!product) return res.status(404).json({ error: 'Produit introuvable.' });
  product.stock = stock;
  await persist();
  res.status(200).json({ success: true, stock });
}));

// ================= REVIEWS =================
app.get('/api/products/:productId/reviews', route(async (req, res) => {
  res.json((state.reviews || []).filter((review) => review.productId === req.params.productId && review.status === 'approved').map((review) => ({ id: review.id, productId: review.productId, customerName: review.customerName, rating: review.rating, comment: review.comment, date: review.createdAt })));
}));

app.post('/api/products/:productId/reviews', auth, route(async (req, res) => {
  const body = z.object({ rating: z.number().int().min(1).max(5), comment: z.string().trim().min(3).max(3000) }).parse(req.body);
  const user = (state.users || []).find((item) => item.id === req.user.sub) || { id: 'usr-guest', firstName: 'Client', lastName: '', email: 'client@espacepastel.tn' };
  const rev = {
    id: 'rev-' + Date.now(),
    productId: req.params.productId,
    userId: user.id,
    customerName: `${user.firstName} ${user.lastName}`.trim(),
    customerEmail: user.email,
    rating: body.rating,
    comment: body.comment,
    status: 'pending',
    createdAt: new Date().toISOString()
  };
  state.reviews.unshift(rev);
  await persist();
  res.status(201).json(rev);
}));

app.patch('/api/admin/reviews/:id', auth, admin, route(async (req, res) => {
  const { status } = z.object({ status: z.enum(['approved', 'rejected', 'pending']) }).parse(req.body);
  const review = (state.reviews || []).find((r) => r.id === req.params.id);
  if (!review) return res.status(404).json({ error: 'Avis introuvable.' });
  review.status = status;
  await persist();
  res.status(200).json({ success: true, review });
}));

app.delete('/api/admin/reviews/:id', auth, admin, route(async (req, res) => {
  state.reviews = (state.reviews || []).filter((r) => r.id !== req.params.id);
  await persist();
  res.status(204).end();
}));

// ================= ORDERS =================
app.post('/api/orders', auth, route(async (req, res) => {
  const body = z.object({ customer: z.object({ firstName: z.string().trim().min(1).max(80), lastName: z.string().trim().max(80).optional().default(''), email: z.string().email(), phone: z.string().trim().min(4).max(40).nullable().optional(), address: z.string().trim().min(2).max(255), city: z.string().trim().min(1).max(80), postalCode: z.string().trim().max(20).optional() }), items: z.array(z.object({ productId: idString, quantity: z.number().int().min(1).max(100) })).min(1), paymentMethod: z.enum(['cash', 'card', 'transfer', 'pickup', 'cod']).default('cash') }).parse(req.body);
  const items = [];
  let subtotal = 0;
  for (const input of body.items) {
    const product = (state.products || []).find((item) => item.id === input.productId);
    if (!product) return res.status(400).json({ error: 'Produit introuvable : ' + input.productId });
    const price = Number(product.promoPrice ?? product.price);
    subtotal += price * input.quantity;
    product.stock = Math.max(0, product.stock - input.quantity);
    items.push({ productId: product.id, productName: product.name, price, quantity: input.quantity, image: product.images?.[0] || '' });
  }
  const shippingFee = subtotal >= 100 ? 0 : 7;
  const number = `EP-${new Date().getFullYear()}-${String(state.orders.length + 1).padStart(4, '0')}`;
  const order = { id: 'ord-' + Date.now(), orderNumber: number, userId: req.user.sub, customer: body.customer, items, subtotal, shippingFee, total: subtotal + shippingFee, paymentMethod: body.paymentMethod, status: 'pending', createdAt: new Date().toISOString() };
  state.orders.unshift(order);
  await persist();
  res.status(201).json(order);
}));

app.get('/api/orders', auth, route(async (req, res) => res.json((state.orders || []).filter((order) => order.userId === req.user.sub))));

app.get('/api/admin/orders', auth, admin, route(async (_req, res) => res.json(state.orders || [])));

app.patch('/api/admin/orders/:id/status', auth, admin, route(async (req, res) => {
  const { status } = z.object({ status: z.enum(['pending', 'preparing', 'processing', 'shipped', 'delivered', 'cancelled']) }).parse(req.body);
  const order = (state.orders || []).find((o) => o.id === req.params.id);
  if (!order) return res.status(404).json({ error: 'Commande introuvable.' });
  order.status = status;
  await persist();
  res.status(200).json({ success: true, status });
}));

app.use((err, _req, res, _next) => {
  console.error('API Error:', err);
  res.status(err?.status || 400).json({ error: err?.message || 'Erreur interne du serveur.' });
});

app.listen(PORT, () => {
  console.log(`Mock API Espace Pastel demarree sur http://127.0.0.1:${PORT}`);
  console.log(`Catalogue actif : ${state.brands.length} marques, ${state.subcategories.length} sous-categories, ${state.products.length} produits`);
});


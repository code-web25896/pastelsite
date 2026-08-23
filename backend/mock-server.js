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
const ALLOWED_ORIGINS = (process.env.CORS_ORIGIN || 'http://127.0.0.1:3000,http://localhost:3000')
  .split(',')
  .map((v) => v.trim())
  .filter(Boolean);

const app = express();
app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(cors({ origin: (origin, cb) => (!origin || ALLOWED_ORIGINS.includes(origin)) ? cb(null, true) : cb(new Error('Origin not allowed')) }));
app.use(express.json({ limit: '2mb' }));

const seed = () => {
  const now = new Date().toISOString();
  return {
    users: [
      { id: 'usr-admin', email: 'admin@espacepastel.tn', passwordHash: bcrypt.hashSync('Admin123!', 10), role: 'admin', firstName: 'Admin', lastName: 'Espace Pastel', phone: null, createdAt: now },
      { id: 'usr-client', email: 'client@espacepastel.tn', passwordHash: bcrypt.hashSync('Client123!', 10), role: 'customer', firstName: 'Amina', lastName: 'Ben Ali', phone: '21600000000', createdAt: now },
    ],
    brands: [
      { id: 'brand-bomi', name: 'BOMI', slug: 'bomi', description: 'Papeterie et cartables pour la rentree.', logoUrl: '/brands/bomi.jpg', bannerUrl: '/brands/bomi.jpg', accentColor: '#F4A9C8', status: 'active', order: 1 },
      { id: 'brand-wama', name: 'WAMA', slug: 'wama', description: 'Instruments d ecriture et fournitures techniques.', logoUrl: '/brands/wama.jpg', bannerUrl: '/brands/wama.jpg', accentColor: '#8FD8C3', status: 'active', order: 2 },
    ],
    subcategories: [
      { id: 'sub-bomi-2026', brandId: 'brand-bomi', name: 'Collection 2026', slug: 'collection-2026', description: 'Nouveautes de la rentree.', imageUrl: '/brands/bomi.jpg', status: 'active', order: 1 },
      { id: 'sub-wama-ink', brandId: 'brand-wama', name: 'Ecriture', slug: 'ecriture', description: 'Stylos, feutres et accessoires.', imageUrl: '/brands/wama.jpg', status: 'active', order: 1 },
    ],
    products: [
      { id: 'prd-bomi-horizon', brandId: 'brand-bomi', subCategoryId: 'sub-bomi-2026', name: 'Cartable BOMI Horizon', slug: 'cartable-bomi-horizon', category: 'Cartables', price: 129.9, promoPrice: 109.9, sku: 'BOMI-HZN-001', stock: 14, isNew: true, isPromo: true, isBestSeller: true, badge: 'Nouveau', images: ['https://images.unsplash.com/photo-1514477917009-389c76a86b68?auto=format&fit=crop&w=900&q=80'], shortDescription: 'Cartable leger et robuste pour la rentree.', description: 'Un cartable compact avec plusieurs compartiments et finition durable.', features: ['Compartiment principal', 'Dos rembourre', 'Tissu resistant'], sizes: ['M'], colors: ['Rose', 'Bleu'], dimensions: '42 x 30 x 18 cm', weight: '0.9 kg', material: 'Polyester', actionType: null, customPhone: null, customWhatsapp: null, rareNote: null, status: 'published', createdAt: now },
      { id: 'prd-wama-gel', brandId: 'brand-wama', subCategoryId: 'sub-wama-ink', name: 'Stylo gel WAMA Precision', slug: 'stylo-gel-wama-precision', category: 'Ecriture', price: 3.5, promoPrice: null, sku: 'WAMA-GEL-010', stock: 120, isNew: true, isPromo: false, isBestSeller: true, badge: 'Top', images: ['https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?auto=format&fit=crop&w=900&q=80'], shortDescription: 'Glisse fluide et trait net.', description: 'Stylo gel pour ecriture rapide et confortable.', features: ['Encre fluide', 'Pointe fine', 'Prise en main confortable'], sizes: ['0.5'], colors: ['Noir', 'Bleu'], dimensions: '14 cm', weight: '0.02 kg', material: 'Plastique', actionType: null, customPhone: null, customWhatsapp: null, rareNote: null, status: 'published', createdAt: now },
      { id: 'prd-office-pack', brandId: 'brand-bomi', subCategoryId: 'sub-bomi-2026', name: 'Pack bureau essentiel', slug: 'pack-bureau-essentiel', category: 'Bureau', price: 49.9, promoPrice: 39.9, sku: 'OFFICE-PACK-001', stock: 22, isNew: false, isPromo: true, isBestSeller: false, badge: 'Promo', images: ['https://images.unsplash.com/photo-1497215842964-222b430dc094?auto=format&fit=crop&w=900&q=80'], shortDescription: 'Lot pratique pour equiper un espace de travail.', description: 'Accessoires de bureau pour une organisation simple et efficace.', features: ['Regle', 'Crayon', 'Trousse'], sizes: ['One Size'], colors: ['Multi'], dimensions: 'Pack', weight: '0.5 kg', material: 'Mixte', actionType: null, customPhone: null, customWhatsapp: null, rareNote: null, status: 'published', createdAt: now },
    ],
    reviews: [
      { id: 'rev-1', productId: 'prd-bomi-horizon', userId: 'usr-client', customerName: 'Amina Ben Ali', customerEmail: 'client@espacepastel.tn', rating: 5, comment: 'Tres bon produit pour la rentree.', status: 'approved', createdAt: now },
    ],
    orders: [],
    addresses: [
      { id: 'addr-1', userId: 'usr-client', label: 'Maison', address: '12 Rue de la Paix', city: 'Tunis', postalCode: '1000', isDefault: true, createdAt: now },
    ],
  };
};

async function readState() {
  try {
    return JSON.parse(await fs.readFile(DB_FILE, 'utf8'));
  } catch {
    const initial = seed();
    await writeState(initial);
    return initial;
  }
}

async function writeState(state) {
  await fs.writeFile(DB_FILE, JSON.stringify(state, null, 2), 'utf8');
}

let state = await readState();

const route = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
const uuid = z.string().uuid();
const imageOrUrl = z.string().refine((value) => /^https?:\/\//i.test(value) || /^data:image\//i.test(value), { message: 'URL ou image base64 invalide.' });
const brandInput = z.object({ name: z.string().trim().min(1).max(120), slug: z.string().regex(/^[a-z0-9-]+$/).max(140), description: z.string().trim().min(1).max(10000), logoUrl: imageOrUrl.nullable().optional(), bannerUrl: imageOrUrl.nullable().optional(), accentColor: z.string().max(20).nullable().optional(), status: z.enum(['active', 'draft']), order: z.number().int().min(0).max(100000) });
const subcategoryInput = z.object({ brandId: uuid, name: z.string().trim().min(1).max(120), slug: z.string().regex(/^[a-z0-9-]+$/).max(140), description: z.string().trim().min(1).max(10000), imageUrl: imageOrUrl.nullable().optional(), status: z.enum(['active', 'draft']), order: z.number().int().min(0).max(100000) });


function sign(user) {
  return jwt.sign({ sub: user.id, role: user.role }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN, issuer: 'espace-pastel-api', audience: 'espace-pastel-client' });
}

function auth(req, res, next) {
  const token = req.get('authorization')?.replace(/^Bearer\s+/i, '');
  if (!token) return res.status(401).json({ error: 'Authentification requise.' });
  try {
    req.user = jwt.verify(token, JWT_SECRET, { issuer: 'espace-pastel-api', audience: 'espace-pastel-client' });
    return next();
  } catch {
    return res.status(401).json({ error: 'Session invalide ou expiree.' });
  }
}

function admin(req, res, next) {
  if (req.user?.role !== 'admin') return res.status(403).json({ error: 'Acces admin requis.' });
  return next();
}

function publicUser(user) {
  return { id: user.id, email: user.email, role: user.role, firstName: user.firstName, lastName: user.lastName, phone: user.phone ?? null, createdAt: user.createdAt };
}

function productRating(productId) {
  const approved = state.reviews.filter((review) => review.productId === productId && review.status === 'approved');
  const count = approved.length;
  const rating = count ? approved.reduce((sum, review) => sum + Number(review.rating || 0), 0) / count : 0;
  return { rating, reviewCount: count };
}

function publicProduct(product) {
  return { ...product, ...productRating(product.id) };
}

function persist() {
  return writeState(state);
}

app.get('/api/health', route(async (_req, res) => res.json({ ok: true, mode: 'mock' })));

app.post('/api/auth/register', rateLimit({ windowMs: 3600000, limit: 5, standardHeaders: 'draft-8', legacyHeaders: false }), route(async (req, res) => {
  const body = z.object({ email: z.string().email(), password: z.string().min(8).max(128), firstName: z.string().trim().min(1).max(80), lastName: z.string().trim().min(1).max(80), phone: z.string().trim().min(6).max(30).nullable().optional() }).parse(req.body);
  if (state.users.some((user) => user.email.toLowerCase() === body.email.toLowerCase())) return res.status(409).json({ error: 'Email deja utilise.' });
  const user = { id: crypto.randomUUID(), email: body.email.toLowerCase(), passwordHash: await bcrypt.hash(body.password, 10), role: 'customer', firstName: body.firstName, lastName: body.lastName, phone: body.phone ?? null, createdAt: new Date().toISOString() };
  state.users.push(user);
  await persist();
  res.status(201).json({ token: sign(user), user: publicUser(user) });
}));

app.post('/api/auth/login', rateLimit({ windowMs: 900000, limit: 8, standardHeaders: 'draft-8', legacyHeaders: false }), route(async (req, res) => {
  const body = z.object({ email: z.string().email(), password: z.string().min(1).max(128) }).parse(req.body);
  const user = state.users.find((item) => item.email.toLowerCase() === body.email.toLowerCase());
  if (!user || !(await bcrypt.compare(body.password, user.passwordHash))) return res.status(401).json({ error: 'Identifiants invalides.' });
  res.json({ token: sign(user), user: publicUser(user) });
}));

app.get('/api/auth/me', auth, route(async (req, res) => {
  const user = state.users.find((item) => item.id === req.user.sub);
  if (!user) return res.status(401).json({ error: 'Utilisateur introuvable.' });
  const addresses = state.addresses.filter((item) => item.userId === user.id);
  res.json({ ...publicUser(user), addresses });
}));

app.get('/api/brands', route(async (_req, res) => res.json(state.brands.filter((brand) => brand.status === 'active'))));
app.get('/api/subcategories', route(async (req, res) => res.json(state.subcategories.filter((subcategory) => subcategory.status === 'active' && (!req.query.brandId || subcategory.brandId === req.query.brandId)))));
app.post('/api/admin/brands', auth, admin, route(async (req, res) => {
  const body = brandInput.parse(req.body);
  const brand = { id: crypto.randomUUID(), ...body };
  state.brands.push(brand);
  await persist();
  res.status(201).json({ id: brand.id });
}));
app.patch('/api/admin/brands/:id', auth, admin, route(async (req, res) => {
  uuid.parse(req.params.id);
  const body = brandInput.partial().parse(req.body);
  const brand = state.brands.find((item) => item.id === req.params.id);
  if (!brand) return res.status(404).json({ error: 'Element introuvable.' });
  Object.assign(brand, body);
  await persist();
  res.status(204).end();
}));
app.delete('/api/admin/brands/:id', auth, admin, route(async (req, res) => {
  uuid.parse(req.params.id);
  const before = state.brands.length;
  state.brands = state.brands.filter((item) => item.id !== req.params.id);
  if (state.brands.length === before) return res.status(404).json({ error: "Element introuvable." });
  await persist();
  res.status(204).end();
}));
app.post('/api/admin/subcategories', auth, admin, route(async (req, res) => {
  const body = subcategoryInput.parse(req.body);
  const subcategory = { id: crypto.randomUUID(), ...body };
  state.subcategories.push(subcategory);
  await persist();
  res.status(201).json({ id: subcategory.id });
}));
app.patch('/api/admin/subcategories/:id', auth, admin, route(async (req, res) => {
  uuid.parse(req.params.id);
  const body = subcategoryInput.partial().parse(req.body);
  const subcategory = state.subcategories.find((item) => item.id === req.params.id);
  if (!subcategory) return res.status(404).json({ error: 'Element introuvable.' });
  Object.assign(subcategory, body);
  await persist();
  res.status(204).end();
}));
app.delete('/api/admin/subcategories/:id', auth, admin, route(async (req, res) => {
  uuid.parse(req.params.id);
  const before = state.subcategories.length;
  state.subcategories = state.subcategories.filter((item) => item.id !== req.params.id);
  if (state.subcategories.length === before) return res.status(404).json({ error: "Element introuvable." });
  await persist();
  res.status(204).end();
}));

app.get('/api/products', route(async (req, res) => {
  const q = String(req.query.q || '').trim().toLowerCase();
  const filtered = state.products.filter((product) => product.status === 'published' && (!req.query.brandId || product.brandId === req.query.brandId) && (!req.query.subCategoryId || product.subCategoryId === req.query.subCategoryId) && (!q || [product.name, product.shortDescription, product.category].join(' ').toLowerCase().includes(q)));
  res.json(filtered.map(publicProduct));
}));
app.get('/api/products/:idOrSlug', route(async (req, res) => {
  const product = state.products.find((item) => item.status === 'published' && (item.id === req.params.idOrSlug || item.slug === req.params.idOrSlug));
  if (!product) return res.status(404).json({ error: 'Produit introuvable.' });
  res.json(publicProduct(product));
}));
app.get('/api/products/:productId/reviews', route(async (req, res) => {
  uuid.parse(req.params.productId);
  res.json(state.reviews.filter((review) => review.productId === req.params.productId && review.status === 'approved').map((review) => ({ id: review.id, productId: review.productId, customerName: review.customerName, rating: review.rating, comment: review.comment, date: review.createdAt })));
}));
app.post('/api/products/:productId/reviews', auth, route(async (req, res) => {
  uuid.parse(req.params.productId);
  const body = z.object({ rating: z.number().int().min(1).max(5), comment: z.string().trim().min(3).max(3000) }).parse(req.body);
  const user = state.users.find((item) => item.id === req.user.sub);
  if (!user) return res.status(401).json({ error: 'Utilisateur introuvable.' });
  state.reviews.push({ id: crypto.randomUUID(), productId: req.params.productId, userId: user.id, customerName: `${user.firstName} ${user.lastName}`.trim(), customerEmail: user.email, rating: body.rating, comment: body.comment, status: 'pending', createdAt: new Date().toISOString() });
  await persist();
  res.status(201).json({ status: 'pending' });
}));
app.post('/api/orders', auth, route(async (req, res) => {
  const body = z.object({ customer: z.object({ firstName: z.string().trim().min(1).max(80), lastName: z.string().trim().min(1).max(80), email: z.string().email(), phone: z.string().trim().min(6).max(40).nullable().optional(), address: z.string().trim().min(5).max(255), city: z.string().trim().min(2).max(80), postalCode: z.string().trim().max(20).optional() }), items: z.array(z.object({ productId: uuid, quantity: z.number().int().min(1).max(100) })).min(1), paymentMethod: z.enum(['cash', 'card', 'transfer']).default('cash') }).parse(req.body);
  const items = [];
  let subtotal = 0;
  for (const input of body.items) {
    const product = state.products.find((item) => item.id === input.productId && item.status === 'published');
    if (!product) return res.status(400).json({ error: 'Produit introuvable.' });
    if (product.stock < input.quantity) return res.status(409).json({ error: `Stock insuffisant : ${product.name}` });
    const price = Number(product.promoPrice ?? product.price);
    subtotal += price * input.quantity;
    product.stock -= input.quantity;
    items.push({ productId: product.id, productName: product.name, price, quantity: input.quantity, image: product.images?.[0] || '' });
  }
  const shippingFee = subtotal >= 100 ? 0 : 7;
  const number = `EP-${new Date().getFullYear()}-${String(state.orders.length + 1).padStart(4, '0')}`;
  const order = { id: crypto.randomUUID(), orderNumber: number, userId: req.user.sub, customer: body.customer, items, subtotal, shippingFee, total: subtotal + shippingFee, paymentMethod: body.paymentMethod, status: 'pending', createdAt: new Date().toISOString() };
  state.orders.push(order);
  await persist();
  res.status(201).json(order);
}));
app.get('/api/orders', auth, route(async (req, res) => res.json(state.orders.filter((order) => order.userId === req.user.sub))));

app.use((err, _req, res, _next) => {
  res.status(err?.status || 500).json({ error: err?.message || 'Erreur interne du serveur.' });
});

app.listen(PORT, () => {
  console.log(`Mock API Espace Pastel demarree sur http://127.0.0.1:${PORT}`);
  console.log('Admin local: admin@espacepastel.tn / Admin123!');
  console.log('Client local: client@espacepastel.tn / Client123!');
});

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_FILE = path.join(__dirname, 'mock-db.json');

const [email = 'admin@espacepastel.tn', password = 'Admin123!'] = process.argv.slice(2);
const normalizedEmail = email.toLowerCase();
const name = normalizedEmail.split('@')[0].replace(/[._-]+/g, ' ').trim() || 'Admin';
const [firstName = 'Admin', ...rest] = name.split(' ');
const lastName = rest.join(' ') || 'Espace Pastel';

async function readState() {
  try {
    return JSON.parse(await fs.readFile(DB_FILE, 'utf8'));
  } catch {
    return { users: [], addresses: [], brands: [], subcategories: [], products: [], reviews: [], orders: [], nextCounters: { order: 1 } };
  }
}

const state = await readState();
state.users = Array.isArray(state.users) ? state.users : [];
const existing = state.users.find((user) => String(user.email).toLowerCase() === normalizedEmail);
const user = {
  id: existing?.id || `usr-${crypto.randomUUID()}`,
  email: normalizedEmail,
  passwordHash: bcrypt.hashSync(password, 10),
  role: 'admin',
  firstName,
  lastName,
  phone: existing?.phone ?? null,
  createdAt: existing?.createdAt || new Date().toISOString(),
};
if (existing) Object.assign(existing, user); else state.users.push(user);
await fs.writeFile(DB_FILE, JSON.stringify(state, null, 2), 'utf8');
console.log(`Admin local pret: ${normalizedEmail} / ${password}`);

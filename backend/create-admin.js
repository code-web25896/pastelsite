import 'dotenv/config';
import crypto from 'node:crypto';
import bcrypt from 'bcryptjs';
import mysql from 'mysql2/promise';
import { getMysqlConnectionConfig } from './db-config.js';

const [email, password, firstName = 'Admin', lastName = 'Espace Pastel'] = process.argv.slice(2);
if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error('Utilisation : npm run create-admin:mysql -- email@domaine.tld mot-de-passe-solide [prenom] [nom]');
if (!password || password.length < 12) throw new Error('Le mot de passe doit contenir au moins 12 caracteres.');

const connection = await mysql.createConnection(getMysqlConnectionConfig());
try {
  const hash = await bcrypt.hash(password, 12);
  await connection.execute(
    'INSERT INTO users (id, email, password_hash, role, first_name, last_name) VALUES (?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE password_hash = VALUES(password_hash), role = VALUES(role), first_name = VALUES(first_name), last_name = VALUES(last_name)',
    [crypto.randomUUID(), email.toLowerCase(), hash, 'admin', firstName, lastName],
  );
  console.log('Administrateur cree ou mis a jour.');
} finally {
  await connection.end();
}

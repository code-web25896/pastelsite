import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function splitSqlStatements(sql) {
  return sql
    .split(/;\s*(?:\r?\n|$)/)
    .map((statement) => statement.trim())
    .filter(Boolean);
}

async function migrateOrdersTable(pool) {
  try {
    // 1. Supprimer toutes les contraintes de cle etrangere sur orders.user_id
    const [fks] = await pool.query(`
      SELECT CONSTRAINT_NAME 
      FROM information_schema.KEY_COLUMN_USAGE 
      WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'orders' AND COLUMN_NAME = 'user_id' AND REFERENCED_TABLE_NAME = 'users'
    `).catch(() => [[]]);

    for (const fk of fks) {
      if (fk.CONSTRAINT_NAME) {
        try {
          await pool.query(`ALTER TABLE orders DROP FOREIGN KEY \`${fk.CONSTRAINT_NAME}\``);
          console.log(`[DB] Cle etrangere ${fk.CONSTRAINT_NAME} retiree de orders.`);
        } catch (e) {
          console.warn('[DB] Drop FK ignore:', e.message);
        }
      }
    }

    // 2. Verifier et ajouter les colonnes manquantes
    const [cols] = await pool.query(`
      SELECT COLUMN_NAME 
      FROM information_schema.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'orders'
    `).catch(() => [[]]);
    const colNames = new Set(cols.map((c) => c.COLUMN_NAME.toLowerCase()));

    if (!colNames.has('subtotal')) {
      await pool.query('ALTER TABLE orders ADD COLUMN subtotal DECIMAL(10,3) NOT NULL DEFAULT 0 AFTER items_json').catch(() => {});
      console.log('[DB] Colonne subtotal ajoutee a orders.');
    }
    if (!colNames.has('promo_code')) {
      await pool.query('ALTER TABLE orders ADD COLUMN promo_code VARCHAR(80) NULL AFTER subtotal').catch(() => {});
      console.log('[DB] Colonne promo_code ajoutee a orders.');
    }
    if (!colNames.has('discount_amount')) {
      await pool.query('ALTER TABLE orders ADD COLUMN discount_amount DECIMAL(10,3) NOT NULL DEFAULT 0 AFTER promo_code').catch(() => {});
      console.log('[DB] Colonne discount_amount ajoutee a orders.');
    }
    if (!colNames.has('shipping_fee')) {
      await pool.query('ALTER TABLE orders ADD COLUMN shipping_fee DECIMAL(10,3) NOT NULL DEFAULT 0 AFTER discount_amount').catch(() => {});
      console.log('[DB] Colonne shipping_fee ajoutee a orders.');
    }
    if (!colNames.has('total')) {
      await pool.query('ALTER TABLE orders ADD COLUMN total DECIMAL(10,3) NOT NULL DEFAULT 0 AFTER shipping_fee').catch(() => {});
      console.log('[DB] Colonne total ajoutee a orders.');
    }

    // 3. Rendre user_id nullable et de taille suffisante
    await pool.query('ALTER TABLE orders MODIFY user_id VARCHAR(128) NULL').catch(() => {});
    await pool.query('ALTER TABLE orders MODIFY id VARCHAR(128) NOT NULL').catch(() => {});
    console.log('[DB] Structure orders verifiee avec succes.');
  } catch (err) {
    console.warn('[DB] Erreur migrateOrdersTable:', err.message);
  }
}

async function migrateCatalogColumns(pool) {
  try {
    await pool.query('SET FOREIGN_KEY_CHECKS = 0');
    const statements = [
      'ALTER TABLE users MODIFY id VARCHAR(128) NOT NULL',
      'ALTER TABLE addresses MODIFY id VARCHAR(128) NOT NULL',
      'ALTER TABLE addresses MODIFY user_id VARCHAR(128) NOT NULL',
      'ALTER TABLE brands MODIFY id VARCHAR(128) NOT NULL',
      'ALTER TABLE brands MODIFY logo_url MEDIUMTEXT NULL',
      'ALTER TABLE brands MODIFY banner_url MEDIUMTEXT NULL',
      'ALTER TABLE subcategories MODIFY id VARCHAR(128) NOT NULL',
      'ALTER TABLE subcategories MODIFY brand_id VARCHAR(128) NOT NULL',
      'ALTER TABLE subcategories MODIFY image_url MEDIUMTEXT NULL',
      'ALTER TABLE products MODIFY id VARCHAR(128) NOT NULL',
      'ALTER TABLE products MODIFY brand_id VARCHAR(128) NOT NULL',
      'ALTER TABLE products MODIFY subcategory_id VARCHAR(128) NOT NULL',
      'ALTER TABLE products MODIFY images LONGTEXT NOT NULL',
      'ALTER TABLE products ADD COLUMN promo_code VARCHAR(80) NULL AFTER promo_price',
      'ALTER TABLE products ADD COLUMN promo_discount_percent DECIMAL(5,2) NULL AFTER promo_code',
      'ALTER TABLE reviews MODIFY id VARCHAR(128) NOT NULL',
      'ALTER TABLE reviews MODIFY product_id VARCHAR(128) NOT NULL',
      'ALTER TABLE reviews MODIFY user_id VARCHAR(128) NULL'
    ];
    for (const statement of statements) {
      try {
        await pool.query(statement);
      } catch (error) {
        if (!String(error.message || '').includes('Unknown table')) {
          console.warn('Migration ignoree:', statement, error.message);
        }
      }
    }

    await migrateOrdersTable(pool);
    await pool.query('SET FOREIGN_KEY_CHECKS = 1');
  } catch (error) {
    console.warn('Migration catalogue ignoree:', error.message || error);
    try {
      await pool.query('SET FOREIGN_KEY_CHECKS = 1');
    } catch {
      /* ignore */
    }
  }
}

export async function initializeDatabase(pool) {
  const schemaPath = path.join(__dirname, 'schema.sql');
  const schemaSql = await fs.readFile(schemaPath, 'utf8');
  const statements = splitSqlStatements(schemaSql.replace(/CREATE TABLE/g, 'CREATE TABLE IF NOT EXISTS'));

  for (const statement of statements) {
    try {
      await pool.query(statement);
    } catch (err) {
      // Log notice but DO NOT crash the migration loop
      console.warn('[DB INIT] Notice statement:', statement.slice(0, 45) + '...', err.message);
    }
  }

  await migrateCatalogColumns(pool);

  // Ensure the explicitly configured backoffice account has the persisted admin role.
  const adminEmail = String(process.env.ADMIN_EMAIL || '').trim().toLowerCase();
  if (adminEmail) {
    try {
      await pool.execute("UPDATE users SET role = 'admin' WHERE email = ?", [adminEmail]);
    } catch (error) {
      console.warn('Role admin non migre:', error.message || error);
    }
  }
}

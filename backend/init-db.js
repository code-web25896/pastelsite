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
      'ALTER TABLE reviews MODIFY id VARCHAR(128) NOT NULL',
      'ALTER TABLE reviews MODIFY product_id VARCHAR(128) NOT NULL',
      'ALTER TABLE reviews MODIFY user_id VARCHAR(128) NULL',
      'ALTER TABLE orders MODIFY id VARCHAR(128) NOT NULL',
      'ALTER TABLE orders MODIFY user_id VARCHAR(128) NOT NULL',
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
    await pool.query(statement);
  }

  await migrateCatalogColumns(pool);
}

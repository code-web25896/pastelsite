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

export async function initializeDatabase(pool) {
  const schemaPath = path.join(__dirname, 'schema.sql');
  const schemaSql = await fs.readFile(schemaPath, 'utf8');
  const statements = splitSqlStatements(schemaSql.replace(/CREATE TABLE/g, 'CREATE TABLE IF NOT EXISTS'));

  for (const statement of statements) {
    await pool.query(statement);
  }
}

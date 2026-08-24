import 'dotenv/config';

function requiredVars(names) {
  return names.filter((name) => !String(process.env[name] || '').trim());
}

export function getMysqlConnectionConfig() {
  const databaseUrl = String(process.env.DATABASE_URL || '').trim();
  if (databaseUrl) return databaseUrl;

  const missing = requiredVars(['DB_HOST', 'DB_PORT', 'DB_NAME', 'DB_USER', 'DB_PASSWORD']);
  if (missing.length) {
    throw new Error('Variables manquantes : ' + missing.join(', '));
  }

  const port = Number(process.env.DB_PORT);
  if (!Number.isInteger(port) || port <= 0) {
    throw new Error('DB_PORT doit etre un nombre valide.');
  }

  return {
    host: (() => {
      const rawHost = String(process.env.DB_HOST || '127.0.0.1').trim();
      if (rawHost === 'localhost' || rawHost === '::1') return '127.0.0.1';
      return rawHost;
    })(),
    port,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    charset: 'utf8mb4',
    waitForConnections: true,
    connectionLimit: 10,
    decimalNumbers: false,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0,
  };
}




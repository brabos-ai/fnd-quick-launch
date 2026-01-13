require('dotenv').config({ path: __dirname + '/.env' });
const { parse } = require('pg-connection-string');

// Parse DATABASE_URL and extract SSL configuration
function getConnectionConfig(databaseUrl) {
  if (!databaseUrl) {
    throw new Error('DATABASE_URL environment variable is required');
  }

  const config = parse(databaseUrl);

  // Check for SSL configuration in query parameters
  const url = new URL(databaseUrl);
  const sslMode = url.searchParams.get('sslmode');
  const sslParam = url.searchParams.get('ssl');

  // Determine SSL configuration
  let ssl = false;
  if (sslMode === 'require' || sslMode === 'prefer' || sslParam === 'true') {
    ssl = { rejectUnauthorized: false };
  } else if (sslMode === 'disable' || sslParam === 'false') {
    ssl = false;
  } else if (config.ssl) {
    ssl = { rejectUnauthorized: false };
  }

  return {
    host: config.host || 'localhost',
    port: config.port ? parseInt(config.port, 10) : 5432,
    database: config.database,
    user: config.user,
    password: config.password,
    ssl,
  };
}

const databaseUrl = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/agentics_dev';

module.exports = {
  development: {
    client: 'postgresql',
    connection: getConnectionConfig(databaseUrl),
    migrations: {
      directory: './migrations',
      extension: 'js'
    },
    seeds: {
      directory: './seeds'
    }
  },

  production: {
    client: 'postgresql',
    connection: getConnectionConfig(process.env.DATABASE_URL),
    migrations: {
      directory: './migrations',
      extension: 'js'
    },
    seeds: {
      directory: './seeds'
    }
  }
};
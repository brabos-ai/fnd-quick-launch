#!/usr/bin/env node
/**
 * Database Auto-Setup Script
 *
 * Automatically creates the PostgreSQL database if it doesn't exist.
 * Supports both local (Docker) and remote (Railway, etc.) connections.
 *
 * Features:
 * - Verifies PostgreSQL connection
 * - Creates database automatically if missing
 * - Copies .env.example to .env if needed
 * - Idempotent: safe to run multiple times
 */

const { Client } = require('pg');
const { parse } = require('pg-connection-string');
const { existsSync, copyFileSync } = require('fs');
const { resolve } = require('path');

// ANSI colors for terminal output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

/**
 * Loads DATABASE_URL with the following priority:
 * 1. Environment variable (Railway, Docker, etc.)
 * 2. .env file
 * 3. .env.example (copies to .env first)
 *
 * @returns {string} DATABASE_URL
 */
function loadDatabaseUrl() {
  const envPath = resolve(__dirname, '../.env');
  const examplePath = resolve(__dirname, '../.env.example');

  // Priority 1: Already in environment (Railway, Docker, CI, etc.)
  if (process.env.DATABASE_URL) {
    log('✅ DATABASE_URL found in environment', 'green');
    return process.env.DATABASE_URL;
  }

  // Priority 2: Load from .env file
  if (existsSync(envPath)) {
    require('dotenv').config({ path: envPath });
    if (process.env.DATABASE_URL) {
      log('✅ DATABASE_URL loaded from .env', 'green');
      return process.env.DATABASE_URL;
    }
  }

  // Priority 3: Copy .env.example to .env and load
  if (existsSync(examplePath)) {
    log('📋 Copying .env.example to .env...', 'yellow');
    copyFileSync(examplePath, envPath);
    require('dotenv').config({ path: envPath });
    if (process.env.DATABASE_URL) {
      log('✅ DATABASE_URL loaded from .env.example', 'green');
      return process.env.DATABASE_URL;
    }
  }

  // No DATABASE_URL found anywhere
  log('❌ DATABASE_URL not found', 'red');
  log('   Set DATABASE_URL environment variable or create .env file', 'yellow');
  log('   Expected format: postgresql://user:pass@host:port/dbname', 'yellow');
  process.exit(1);
}

/**
 * Parses DATABASE_URL and extracts database name
 */
function parseDatabaseUrl(url) {
  if (!url) {
    log('❌ DATABASE_URL environment variable is required', 'red');
    log('   Expected format: postgresql://user:pass@host:port/dbname', 'yellow');
    process.exit(1);
  }

  try {
    const config = parse(url);

    if (!config.database) {
      log('❌ Invalid DATABASE_URL format: missing database name', 'red');
      log('   Expected: postgresql://user:pass@host:port/dbname', 'yellow');
      process.exit(1);
    }

    return config;
  } catch (error) {
    log(`❌ Invalid DATABASE_URL format: ${error.message}`, 'red');
    log('   Expected: postgresql://user:pass@host:port/dbname', 'yellow');
    process.exit(1);
  }
}

/**
 * Creates connection config for pg client
 */
function createConnectionConfig(url, databaseName = 'postgres') {
  const urlObj = new URL(url);
  const config = parse(url);

  // Check for SSL configuration
  const sslMode = urlObj.searchParams.get('sslmode');
  const sslParam = urlObj.searchParams.get('ssl');

  let ssl = false;
  if (sslMode === 'require' || sslMode === 'prefer' || sslParam === 'true') {
    ssl = { rejectUnauthorized: false };
  } else if (config.ssl) {
    ssl = { rejectUnauthorized: false };
  }

  return {
    host: config.host || 'localhost',
    port: config.port ? parseInt(config.port, 10) : 5432,
    database: databaseName,
    user: config.user,
    password: config.password,
    ssl,
  };
}

/**
 * Verifies connection to PostgreSQL server
 */
async function verifyConnection(config) {
  const client = new Client(config);

  try {
    await client.connect();
    await client.end();
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Checks if database exists
 */
async function databaseExists(config, dbName) {
  const client = new Client(config);

  try {
    await client.connect();

    const result = await client.query(
      'SELECT 1 FROM pg_database WHERE datname = $1',
      [dbName]
    );

    await client.end();
    return result.rows.length > 0;
  } catch (error) {
    await client.end();
    throw error;
  }
}

/**
 * Creates database
 */
async function createDatabase(config, dbName) {
  const client = new Client(config);

  try {
    await client.connect();

    // CREATE DATABASE cannot run inside a transaction block
    await client.query(`CREATE DATABASE "${dbName}"`);

    await client.end();
    return true;
  } catch (error) {
    await client.end();

    // Check for common permission errors
    if (error.message.includes('permission denied')) {
      log('❌ User lacks CREATEDB permission', 'red');
      log('   Your PostgreSQL user needs CREATE DATABASE privileges.', 'yellow');
      log('   Please create the database manually or grant CREATEDB permission.', 'yellow');
      process.exit(1);
    }

    throw error;
  }
}

/**
 * Main setup function
 */
async function setupDatabase() {
  log('\n🔧 Database Auto-Setup\n', 'blue');

  // Step 1: Load DATABASE_URL (env > .env > .env.example)
  const databaseUrl = loadDatabaseUrl();

  // Step 2: Parse DATABASE_URL
  const targetConfig = parseDatabaseUrl(databaseUrl);
  const targetDbName = targetConfig.database;

  log(`📋 Target database: ${targetDbName}`, 'blue');

  // Step 4: Create connection to default postgres database
  const postgresConfig = createConnectionConfig(databaseUrl, 'postgres');

  // Step 5: Verify PostgreSQL connection
  log('🔍 Verifying PostgreSQL connection...', 'yellow');
  const canConnect = await verifyConnection(postgresConfig);

  if (!canConnect) {
    log('❌ Cannot connect to PostgreSQL server', 'red');
    log(`   Host: ${postgresConfig.host}:${postgresConfig.port}`, 'yellow');
    log('   Is PostgreSQL running?', 'yellow');
    log('   Check your DATABASE_URL in .env file', 'yellow');
    process.exit(1);
  }

  log('✅ PostgreSQL connection verified', 'green');

  // Step 6: Check if target database exists
  log(`🔍 Checking if database '${targetDbName}' exists...`, 'yellow');
  const exists = await databaseExists(postgresConfig, targetDbName);

  if (exists) {
    log(`✅ Database '${targetDbName}' already exists`, 'green');
    log('   Skipping creation, proceeding with migrations...', 'blue');
    process.exit(0);
  }

  // Step 7: Create database
  log(`📦 Creating database '${targetDbName}'...`, 'yellow');
  await createDatabase(postgresConfig, targetDbName);
  log(`✅ Database '${targetDbName}' created successfully!`, 'green');

  log('\n✨ Setup complete! You can now run migrations.\n', 'blue');
}

// Run setup
setupDatabase().catch((error) => {
  log(`\n❌ Setup failed: ${error.message}`, 'red');
  console.error(error);
  process.exit(1);
});

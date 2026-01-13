import { Kysely, PostgresDialect } from 'kysely';
import { Pool } from 'pg';
import { parse } from 'pg-connection-string';
import { Database } from './types';

export function createDatabase(connectionString: string): Kysely<Database> {
  // Parse the connection string
  const config = parse(connectionString);

  // Check for SSL configuration in query parameters
  // Supports: ?sslmode=require, ?sslmode=disable, ?ssl=true, ?ssl=false
  const url = new URL(connectionString);
  const sslMode = url.searchParams.get('sslmode');
  const sslParam = url.searchParams.get('ssl');

  // Determine SSL configuration
  let ssl: boolean | { rejectUnauthorized: boolean } = false;
  if (sslMode === 'require' || sslMode === 'prefer' || sslParam === 'true') {
    ssl = { rejectUnauthorized: false };
  } else if (sslMode === 'disable' || sslParam === 'false') {
    ssl = false;
  } else if (config.ssl) {
    // Fallback to parsed config
    ssl = { rejectUnauthorized: false };
  }

  const dialect = new PostgresDialect({
    pool: new Pool({
      host: config.host || 'localhost',
      port: config.port ? parseInt(config.port, 10) : 5432,
      database: config.database || '',
      user: config.user || '',
      password: config.password || '',
      ssl,
    }),
  });

  return new Kysely<Database>({
    dialect,
  });
}
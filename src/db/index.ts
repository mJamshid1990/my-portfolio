import 'dotenv/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema.ts';

declare global {
  var _postgresPool: Pool | undefined;
}

export const createPool = () => {
  if (!global._postgresPool) {
    const rawUrl = process.env.DATABASE_URL?.trim().replace(/^["']|["']$/g, '');
    global._postgresPool = rawUrl
      ? new Pool({
          connectionString: rawUrl,
          ssl:
            rawUrl.includes('sslmode=require') ||
            rawUrl.includes('neon.tech') ||
            process.env.VERCEL === '1'
              ? { rejectUnauthorized: false }
              : undefined,
          max: 5,
          connectionTimeoutMillis: 15000,
        })
      : new Pool({
          host: process.env.SQL_HOST,
          user: process.env.SQL_USER,
          password: process.env.SQL_PASSWORD,
          database: process.env.SQL_DB_NAME,
          max: 10,
          connectionTimeoutMillis: 15000,
        });

    global._postgresPool.on('error', (err) => {
      console.error('Unexpected error on idle SQL pool client:', err);
    });
  }
  return global._postgresPool;
};

const pool = createPool();

export const db = drizzle(pool, { schema });
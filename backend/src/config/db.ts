import { Pool as PgPool, QueryResult, QueryResultRow } from 'pg';
import { Pool as NeonPool } from '@neondatabase/serverless';
import { ENV } from './env';

// Standard PostgreSQL TCP connection with SSL enabled for cloud databases (Neon, Supabase, etc.)
const isCloudDb = ENV.DATABASE_URL.includes('neon.tech') || ENV.NODE_ENV === 'production';

const pool: any = new PgPool({
  connectionString: ENV.DATABASE_URL,
  ssl: isCloudDb ? { rejectUnauthorized: false } : undefined,
  max: 10,
  idleTimeoutMillis: 60000,
  connectionTimeoutMillis: 30000,
});


pool.on('error', (err: any) => {
  console.error('Unexpected error on idle PostgreSQL client', err);
});

export const query = async <T extends QueryResultRow = any>(
  text: string,
  params?: any[]
): Promise<QueryResult<T>> => {
  const start = Date.now();
  const res = await pool.query(text, params);
  const duration = Date.now() - start;
  if (ENV.NODE_ENV === 'development') {
    // optional debug logging
    // console.log('executed query', { text: text.substring(0, 100), duration, rows: res.rowCount });
  }
  return res as QueryResult<T>;
};

export const getClient = async () => {
  const client = await pool.connect();
  return client;
};

export default pool;
import fs from 'fs';
import path from 'path';
import { query } from '../config/db';

export const runMigrations = async () => {
  try {
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schemaSql = fs.readFileSync(schemaPath, 'utf-8');
    
    console.log('Running database migrations...');
    await query(schemaSql);
    console.log('Database schema verified & migrations executed successfully.');
  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  }
};

if (require.main === module) {
  runMigrations()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}


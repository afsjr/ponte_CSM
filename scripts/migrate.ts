import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

// Carrega as variáveis do .env.local
dotenv.config({ path: resolve(process.cwd(), '.env.local') });

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL is not set');
}

const migrationClient = postgres(connectionString, { max: 1 });
const db = drizzle(migrationClient);

async function main() {
  console.log('Starting migration...');
  try {
    await migrate(db, { migrationsFolder: 'supabase/migrations' });
    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await migrationClient.end();
    process.exit(0);
  }
}

main();

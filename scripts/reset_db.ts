import postgres from 'postgres';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

dotenv.config({ path: resolve(process.cwd(), '.env.local') });

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL is not set');
}

const sql = postgres(connectionString);

async function main() {
  console.log('Resetting public schema...');
  try {
    await sql`DROP SCHEMA public CASCADE;`;
    await sql`CREATE SCHEMA public;`;
    await sql`GRANT ALL ON SCHEMA public TO postgres;`;
    await sql`GRANT ALL ON SCHEMA public TO public;`;
    console.log('Schema reset successfully.');
  } catch (error) {
    console.error('Reset failed:', error);
  } finally {
    await sql.end();
    process.exit(0);
  }
}

main();

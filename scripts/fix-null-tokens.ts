import { config } from 'dotenv';
config({ path: '.env.local' });
import postgres from 'postgres';

async function fixTokens() {
  let dbUrl = process.env.DATABASE_URL!;
  if (dbUrl.includes(':6543')) dbUrl = dbUrl.replace(':6543', ':5432');
  const sql = postgres(dbUrl, { prepare: false });

  try {
    console.log("Corrigindo tokens para SQL NULL real...");
    await sql`
      UPDATE auth.users 
      SET confirmation_token = NULL,
          recovery_token = NULL,
          email_change_token_new = NULL,
          reauthentication_token = NULL,
          phone_change_token = NULL
      WHERE email LIKE '%csmeducacao.com';
    `;
    console.log("Tokens corrigidos com sucesso!");
  } catch (err) {
    console.error(err);
  } finally {
    process.exit(0);
  }
}

fixTokens();

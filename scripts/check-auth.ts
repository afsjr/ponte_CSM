import { config } from 'dotenv';
config({ path: '.env.local' });
import postgres from 'postgres';

async function check() {
  const sql = postgres(process.env.DATABASE_URL!, { prepare: false });
  try {
    const users = await sql`SELECT email, encrypted_password, email_confirmed_at FROM auth.users WHERE email = 'secretaria@csmeducacao.com'`;
    console.log("Users:", users);
    
    // Test the hash
    const [test] = await sql`SELECT (encrypted_password = crypt('Teste#12345', encrypted_password)) as password_match FROM auth.users WHERE email = 'secretaria@csmeducacao.com'`;
    console.log("Password match:", test);
  } catch (err) {
    console.error(err);
  } finally {
    process.exit(0);
  }
}
check();

import { config } from 'dotenv';
config({ path: '.env.local' });
import postgres from 'postgres';

async function fix() {
  let dbUrl = process.env.DATABASE_URL!;
  if (dbUrl.includes(':6543')) dbUrl = dbUrl.replace(':6543', ':5432');
  const sql = postgres(dbUrl, { prepare: false });

  try {
    // 1. Fix: confirmation_token e recovery_token devem ser '' e não 'null'
    console.log("Fixing token fields...");
    await sql`
      UPDATE auth.users
      SET 
        confirmation_token = COALESCE(NULLIF(confirmation_token, 'null'), ''),
        recovery_token = COALESCE(NULLIF(recovery_token, 'null'), ''),
        email_change_token_new = COALESCE(NULLIF(email_change_token_new, 'null'), ''),
        email_change_token_current = COALESCE(NULLIF(email_change_token_current, 'null'), ''),
        reauthentication_token = COALESCE(NULLIF(reauthentication_token, 'null'), ''),
        phone = COALESCE(NULLIF(phone, 'null'), NULL),
        phone_change = COALESCE(NULLIF(phone_change, 'null'), ''),
        phone_change_token = COALESCE(NULLIF(phone_change_token, 'null'), ''),
        email_change = COALESCE(NULLIF(email_change, 'null'), '')
      WHERE email LIKE '%csmeducacao.com'
    `;
    console.log("Token fields fixed.");

    // 2. Fix: preencher o campo email na tabela identities
    console.log("Fixing identities email column...");
    await sql`
      UPDATE auth.identities i
      SET email = u.email
      FROM auth.users u
      WHERE i.user_id = u.id
        AND u.email LIKE '%csmeducacao.com'
        AND (i.email IS NULL OR i.email = '')
    `;
    console.log("Identities email fixed.");

    // 3. Verificar resultado
    console.log("\n=== VERIFICATION ===");
    const users = await sql`
      SELECT email, confirmation_token, recovery_token, 
             email_change_token_new, confirmed_at,
             phone, phone_change
      FROM auth.users
      WHERE email LIKE '%csmeducacao.com'
    `;
    for (const u of users) {
      console.log(`${u.email}:`);
      console.log(`  confirmation_token="${u.confirmation_token}"`);
      console.log(`  recovery_token="${u.recovery_token}"`);
      console.log(`  confirmed_at=${u.confirmed_at}`);
      console.log(`  phone=${u.phone}`);
    }

    const identities = await sql`
      SELECT i.user_id, i.email as identity_email, i.provider_id
      FROM auth.identities i
      JOIN auth.users u ON u.id = i.user_id
      WHERE u.email LIKE '%csmeducacao.com'
    `;
    console.log("\nIdentities:");
    for (const i of identities) {
      console.log(`  ${i.user_id}: email=${i.identity_email}, provider_id=${i.provider_id}`);
    }

  } catch (err) {
    console.error(err);
  } finally {
    process.exit(0);
  }
}
fix();

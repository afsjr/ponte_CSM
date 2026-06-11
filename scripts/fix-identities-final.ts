import { config } from 'dotenv';
config({ path: '.env.local' });
import postgres from 'postgres';

const TEST_USERS = [
  { id: 'f0000000-0000-0000-0000-000000000001', email: 'secretaria@csmeducacao.com' },
  { id: 'f0000000-0000-0000-0000-000000000002', email: 'coordenacao@csmeducacao.com' },
  { id: 'f0000000-0000-0000-0000-000000000003', email: 'professor@csmeducacao.com' },
  { id: 'f0000000-0000-0000-0000-000000000004', email: 'aluno@csmeducacao.com' },
  { id: 'f0000000-0000-0000-0000-000000000005', email: 'responsavel@csmeducacao.com' },
];

async function fix() {
  let dbUrl = process.env.DATABASE_URL!;
  if (dbUrl.includes(':6543')) dbUrl = dbUrl.replace(':6543', ':5432');
  const sql = postgres(dbUrl, { prepare: false });

  try {
    for (const u of TEST_USERS) {
      console.log(`Recriando identity para ${u.email}...`);
      
      // Deletar identity existente
      await sql`DELETE FROM auth.identities WHERE user_id = ${u.id}::uuid`;
      
      // Recriar com identity_data real JSONB (não string escapada)
      // O truque é usar uma subquery que constrói o jsonb nativamente
      await sql`
        INSERT INTO auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
        SELECT 
          gen_random_uuid(),
          ${u.id}::uuid,
          ${u.email},
          jsonb_build_object(
            'sub', ${u.id}::text,
            'email', ${u.email}::text,
            'email_verified', false,
            'phone_verified', false
          ),
          'email',
          NOW(),
          NOW(),
          NOW()
      `;
      
      console.log(`  Done: ${u.email}`);
    }

    // Verificar
    console.log("\n=== VERIFICATION ===");
    const ids = await sql`
      SELECT i.user_id, i.email as generated_email, i.provider_id, 
             i.identity_data, pg_typeof(i.identity_data) as dtype,
             i.identity_data->>'email' as extracted_email
      FROM auth.identities i
      JOIN auth.users u ON u.id = i.user_id
      WHERE u.email LIKE '%csmeducacao.com'
    `;
    for (const i of ids) {
      console.log(`${i.user_id}:`);
      console.log(`  generated_email=${i.generated_email}`);
      console.log(`  extracted_email=${i.extracted_email}`);
      console.log(`  provider_id=${i.provider_id}`);
      console.log(`  dtype=${i.dtype}`);
      console.log(`  identity_data=${JSON.stringify(i.identity_data)}`);
    }

  } catch (err) {
    console.error(err);
  } finally {
    process.exit(0);
  }
}
fix();

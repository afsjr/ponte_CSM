import { config } from 'dotenv';
config({ path: '.env.local' });
import postgres from 'postgres';

async function deepDiag() {
  let dbUrl = process.env.DATABASE_URL!;
  if (dbUrl.includes(':6543')) dbUrl = dbUrl.replace(':6543', ':5432');
  const sql = postgres(dbUrl, { prepare: false });

  try {
    // 1. Checar auth hooks (GoTrue custom hooks)
    console.log("=== AUTH HOOKS ===");
    try {
      const hooks = await sql`SELECT * FROM auth.mfa_amr_claims LIMIT 1`;
      console.log("mfa_amr_claims exists");
    } catch (e: any) {
      console.log("mfa_amr_claims: " + e.message);
    }

    // 2. Checar auth.flow_state
    console.log("\n=== AUTH.FLOW_STATE ===");
    try {
      const fs = await sql`SELECT count(*) as cnt FROM auth.flow_state`;
      console.log("flow_state count:", fs[0].cnt);
    } catch (e: any) {
      console.log("flow_state error: " + e.message);
    }

    // 3. Checar auth.sessions
    console.log("\n=== AUTH.SESSIONS ===");
    try {
      const sess = await sql`SELECT count(*) as cnt FROM auth.sessions`;
      console.log("sessions count:", sess[0].cnt);
    } catch (e: any) {
      console.log("sessions error: " + e.message);
    }

    // 4. Checar auth.refresh_tokens
    console.log("\n=== AUTH.REFRESH_TOKENS ===");
    try {
      const rt = await sql`SELECT count(*) as cnt FROM auth.refresh_tokens`;
      console.log("refresh_tokens count:", rt[0].cnt);
    } catch (e: any) {
      console.log("refresh_tokens error: " + e.message);
    }

    // 5. Listar TODAS as tabelas do schema auth
    console.log("\n=== TODAS AS TABELAS em auth ===");
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'auth'
      ORDER BY table_name
    `;
    for (const t of tables) {
      console.log(`  ${t.table_name}`);
    }

    // 6. Checar RLS em public tables
    console.log("\n=== RLS POLICIES em public ===");
    const policies = await sql`
      SELECT schemaname, tablename, policyname, cmd, qual, with_check
      FROM pg_policies
      WHERE schemaname = 'public'
    `;
    if (policies.length === 0) {
      console.log("  Nenhuma policy RLS encontrada");
    }
    for (const p of policies) {
      console.log(`  ${p.tablename}.${p.policyname} (${p.cmd})`);
      console.log(`    USING: ${p.qual}`);
      if (p.with_check) console.log(`    WITH CHECK: ${p.with_check}`);
    }

    // 7. Checar se RLS está habilitado em alguma tabela
    console.log("\n=== TABELAS COM RLS HABILITADO ===");
    const rlsTables = await sql`
      SELECT relname, relrowsecurity, relforcerowsecurity
      FROM pg_class 
      JOIN pg_namespace ON pg_class.relnamespace = pg_namespace.oid
      WHERE nspname = 'public' AND relkind = 'r' AND relrowsecurity = true
    `;
    if (rlsTables.length === 0) {
      console.log("  Nenhuma tabela com RLS habilitado");
    }
    for (const t of rlsTables) {
      console.log(`  ${t.relname} (force=${t.relforcerowsecurity})`);
    }

    // 8. Checar views no schema public
    console.log("\n=== VIEWS em public ===");
    const views = await sql`
      SELECT table_name, view_definition 
      FROM information_schema.views 
      WHERE table_schema = 'public'
    `;
    if (views.length === 0) {
      console.log("  Nenhuma view");
    }
    for (const v of views) {
      console.log(`  ${v.table_name}: ${v.view_definition?.substring(0, 150)}`);
    }

    // 9. Checar functions no schema public
    console.log("\n=== FUNCTIONS em public ===");
    const funcs = await sql`
      SELECT routine_name, data_type 
      FROM information_schema.routines 
      WHERE routine_schema = 'public'
    `;
    if (funcs.length === 0) {
      console.log("  Nenhuma function");
    }
    for (const f of funcs) {
      console.log(`  ${f.routine_name} -> ${f.data_type}`);
    }

    // 10. Checar triggers em TODAS as tabelas public
    console.log("\n=== TRIGGERS em public ===");
    const allTriggers = await sql`
      SELECT trigger_name, event_object_table, event_manipulation, action_statement
      FROM information_schema.triggers
      WHERE event_object_schema = 'public'
    `;
    if (allTriggers.length === 0) {
      console.log("  Nenhum trigger");
    }
    for (const t of allTriggers) {
      console.log(`  ${t.event_object_table}.${t.trigger_name} (${t.event_manipulation})`);
      console.log(`    -> ${t.action_statement?.substring(0, 200)}`);
    }

    // 11. Checar auth.schema_migrations
    console.log("\n=== AUTH SCHEMA MIGRATIONS (últimas 10) ===");
    const migrations = await sql`SELECT version FROM auth.schema_migrations ORDER BY version DESC LIMIT 10`;
    for (const m of migrations) {
      console.log(`  ${m.version}`);
    }

    // 12. Testar se GoTrue consegue fazer as queries que faz durante login
    console.log("\n=== TESTE QUERY GOTRUE (busca por email) ===");
    try {
      const gotrueQuery = await sql`
        SELECT u.id, u.aud, u.role, u.email, u.encrypted_password,
               u.email_confirmed_at, u.invited_at, u.confirmation_sent_at,
               u.is_sso_user, u.is_anonymous, u.confirmed_at,
               u.recovery_sent_at, u.last_sign_in_at, u.raw_app_meta_data,
               u.raw_user_meta_data, u.created_at, u.updated_at,
               u.phone, u.phone_confirmed_at, u.phone_change, u.phone_change_sent_at,
               u.email_change, u.email_change_sent_at, u.email_change_confirm_status,
               u.banned_until, u.deleted_at,
               u.confirmation_token, u.recovery_token, u.email_change_token_new,
               u.email_change_token_current, u.reauthentication_token
        FROM auth.users u
        WHERE u.email = 'secretaria@csmeducacao.com'
          AND u.is_sso_user = false
          AND u.deleted_at IS NULL
      `;
      console.log(`  Resultado: ${gotrueQuery.length} linhas encontradas`);
      if (gotrueQuery.length > 0) console.log("  User ID:", gotrueQuery[0].id);
    } catch (e: any) {
      console.log("  ERRO:", e.message);
    }

    // 13. Teste query identities
    console.log("\n=== TESTE QUERY GOTRUE (identities) ===");
    try {
      const idQuery = await sql`
        SELECT i.id, i.user_id, i.identity_data, i.provider, i.last_sign_in_at,
               i.created_at, i.updated_at, i.email, i.provider_id
        FROM auth.identities i
        WHERE i.provider = 'email'
          AND i.provider_id = 'secretaria@csmeducacao.com'
      `;
      console.log(`  Resultado: ${idQuery.length} linhas encontradas`);
      if (idQuery.length > 0) {
        console.log("  Identity email:", idQuery[0].email);
        console.log("  Identity data email:", idQuery[0].identity_data?.email);
      }
    } catch (e: any) {
      console.log("  ERRO:", e.message);
    }

    // 14. Checar se há ONE_TIME_TOKENS table
    console.log("\n=== AUTH.ONE_TIME_TOKENS ===");
    try {
      const ott = await sql`SELECT count(*) as cnt FROM auth.one_time_tokens`;
      console.log("  one_time_tokens count:", ott[0].cnt);
    } catch (e: any) {
      console.log("  " + e.message);
    }

  } catch (err) {
    console.error("FATAL:", err);
  } finally {
    process.exit(0);
  }
}
deepDiag();

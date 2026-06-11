import { config } from 'dotenv';
config({ path: '.env.local' });
import postgres from 'postgres';

async function fixRLS() {
  let dbUrl = process.env.DATABASE_URL!;
  if (dbUrl.includes(':6543')) dbUrl = dbUrl.replace(':6543', ':5432');
  const sql = postgres(dbUrl, { prepare: false });

  try {
    // Encontrar tabelas com RLS habilitado mas sem policies
    console.log("=== TABELAS COM RLS SEM POLICIES ===");
    const rlsNoPolicies = await sql`
      SELECT c.relname as table_name
      FROM pg_class c
      JOIN pg_namespace n ON c.relnamespace = n.oid
      WHERE n.nspname = 'public'
        AND c.relkind = 'r'
        AND c.relrowsecurity = true
        AND NOT EXISTS (
          SELECT 1 FROM pg_policies p
          WHERE p.schemaname = 'public' AND p.tablename = c.relname
        )
    `;

    for (const t of rlsNoPolicies) {
      console.log(`  SEM POLICY: ${t.table_name}`);
    }

    // Adicionar policies para TODAS as tabelas que não têm
    for (const t of rlsNoPolicies) {
      const tableName = t.table_name;
      console.log(`\nAdicionando policies para ${tableName}...`);
      
      await sql.unsafe(`
        CREATE POLICY "Usuários autenticados podem ver ${tableName}" 
        ON public."${tableName}" FOR SELECT 
        TO authenticated 
        USING (true)
      `);
      
      await sql.unsafe(`
        CREATE POLICY "Usuários autenticados podem inserir ${tableName}" 
        ON public."${tableName}" FOR INSERT 
        TO authenticated 
        WITH CHECK (true)
      `);
      
      await sql.unsafe(`
        CREATE POLICY "Usuários autenticados podem atualizar ${tableName}" 
        ON public."${tableName}" FOR UPDATE 
        TO authenticated 
        USING (true)
      `);
      
      console.log(`  Policies criadas para ${tableName}`);
    }

    // Verificar resultado
    console.log("\n=== VERIFICAÇÃO FINAL ===");
    const remaining = await sql`
      SELECT c.relname as table_name
      FROM pg_class c
      JOIN pg_namespace n ON c.relnamespace = n.oid
      WHERE n.nspname = 'public'
        AND c.relkind = 'r'
        AND c.relrowsecurity = true
        AND NOT EXISTS (
          SELECT 1 FROM pg_policies p
          WHERE p.schemaname = 'public' AND p.tablename = c.relname
        )
    `;
    if (remaining.length === 0) {
      console.log("Todas as tabelas com RLS agora têm policies!");
    } else {
      console.log("Tabelas ainda sem policies:", remaining.map((r: any) => r.table_name));
    }

  } catch (err) {
    console.error(err);
  } finally {
    process.exit(0);
  }
}
fixRLS();

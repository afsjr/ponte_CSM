import { config } from 'dotenv';
config({ path: '.env.local' });

import postgres from 'postgres';

async function runMigration() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is not set in .env.local");
  }

  const sql = postgres(connectionString, { prepare: false });

  console.log("Iniciando migração da tabela dados_funcionario...");

  try {
    // Adicionar colunas novas caso não existam
    await sql`ALTER TABLE "dados_funcionario" ADD COLUMN IF NOT EXISTS "observacoes" text;`;
    await sql`ALTER TABLE "dados_funcionario" ADD COLUMN IF NOT EXISTS "banco" varchar(100);`;
    await sql`ALTER TABLE "dados_funcionario" ADD COLUMN IF NOT EXISTS "agencia" varchar(20);`;
    await sql`ALTER TABLE "dados_funcionario" ADD COLUMN IF NOT EXISTS "conta" varchar(50);`;
    
    // O tipo tipo_conta_bancaria e tipo_chave_pix já devem existir no Supabase, mas para garantir:
    await sql`ALTER TABLE "dados_funcionario" ADD COLUMN IF NOT EXISTS "tipo_conta" tipo_conta_bancaria;`;
    await sql`ALTER TABLE "dados_funcionario" ADD COLUMN IF NOT EXISTS "chave_pix" varchar(150);`;
    await sql`ALTER TABLE "dados_funcionario" ADD COLUMN IF NOT EXISTS "tipo_chave_pix" tipo_chave_pix;`;
    
    await sql`ALTER TABLE "dados_funcionario" ADD COLUMN IF NOT EXISTS "ferias_proximas_inicio" timestamp;`;
    await sql`ALTER TABLE "dados_funcionario" ADD COLUMN IF NOT EXISTS "ferias_proximas_fim" timestamp;`;
    await sql`ALTER TABLE "dados_funcionario" ADD COLUMN IF NOT EXISTS "ferias_ultimo_periodo" varchar(50);`;

    console.log("✅ Migração de dados_funcionario concluída com sucesso!");
    process.exit(0);
  } catch (err: any) {
    console.error("❌ Erro na migração:", err);
    process.exit(1);
  }
}

runMigration();

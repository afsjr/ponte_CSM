import postgres from 'postgres';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function run() {
  const sql = postgres(process.env.DATABASE_URL!, { max: 1 });
  try {
    console.log('Buscando tabelas atuais no banco...');
    const tables = await sql`
      SELECT tablename
      FROM pg_tables
      WHERE schemaname = 'public'
    `;
    
    for (const table of tables) {
      console.log(`Ativando RLS para a tabela: ${table.tablename}`);
      await sql.unsafe(`ALTER TABLE "${table.tablename}" ENABLE ROW LEVEL SECURITY;`);
    }
    
    console.log('Row Level Security ativado com sucesso em todas as tabelas!');
  } catch (error) {
    console.error('Erro ao ativar RLS:', error);
  } finally {
    await sql.end();
  }
}

run();

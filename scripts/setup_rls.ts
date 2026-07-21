import { config } from "dotenv";
config({ path: ".env.local" });

import postgres from "postgres";

async function main() {
  const connectionString = process.env.DATABASE_URL;
  
  if (!connectionString) {
    throw new Error("DATABASE_URL is not set in .env.local");
  }

  const sql = postgres(connectionString);

  console.log("Habilitando Row Level Security (RLS) nas tabelas...");

  const tables = [
  'pessoa',
  'pessoa_classificacao',
  'anexo',
  'contato',
  'endereco',
  'nivel_ensino',
  'serie',
  'disciplina',
  'funcionario_habilitacao',
  'turma',
  'quadro_horario',
  'turma_docente',
  'ano_letivo',
  'matricula',
  'periodo_avaliativo',
  'avaliacao',
  'nota',
  'diario_classe',
  'frequencia_aluno',
  'contrato_escolar',
  'documento_gerado',
  'audit_log',
  'aee_prontuario',
  'dados_aluno',
  'dados_funcionario',
  'sala',
  'grade_curricular',
  'ocorrencia_aluno',
  'historico_escolar',
  'vinculo_responsavel_aluno',
  'mural_aviso',
  'aviso_ciente',
  'aee_pei',
  'aee_pei_meta',
  'aee_atendimento',
  'aee_documento',
  'aee_prontuario_evolucao',
  'notas_boletim',
  'calendario_pedagogico',
  'plano_contas',
  'centro_custo',
  'titulo_financeiro',
  'rh_dossie_colaborador',
  'rh_documento_colaborador',
  'rh_ferias',
  'rh_ocorrencia_funcional'
];

  for (const table of tables) {
    console.log(`Configurando RLS para a tabela: ${table}`);
    
    // Habilitar RLS
    await sql.unsafe(`ALTER TABLE public.${table} ENABLE ROW LEVEL SECURITY;`);

    // Dropar políticas antigas se existirem
    await sql.unsafe(`DROP POLICY IF EXISTS "Usuários autenticados podem ver ${table}" ON public.${table};`);
    await sql.unsafe(`DROP POLICY IF EXISTS "Usuários autenticados podem inserir ${table}" ON public.${table};`);
    await sql.unsafe(`DROP POLICY IF EXISTS "Usuários autenticados podem atualizar ${table}" ON public.${table};`);

    // Criar novas políticas básicas: Acesso Total para Usuários Autenticados (MVP)
    // O Supabase usa a role 'authenticated' para usuários logados.
    await sql.unsafe(`
      CREATE POLICY "Usuários autenticados podem ver ${table}" 
      ON public.${table} FOR SELECT TO authenticated USING (true);
    `);
    
    await sql.unsafe(`
      CREATE POLICY "Usuários autenticados podem inserir ${table}" 
      ON public.${table} FOR INSERT TO authenticated WITH CHECK (true);
    `);
    
    await sql.unsafe(`
      CREATE POLICY "Usuários autenticados podem atualizar ${table}" 
      ON public.${table} FOR UPDATE TO authenticated USING (true);
    `);
    
    // Nota: Como não permitimos delete, NÃO criamos política de DELETE.
  }

  console.log("✅ RLS e Políticas Básicas configuradas com sucesso!");
  console.log("Nota de Segurança: O sistema proíbe DELETES por design. Nenhuma política de DELETE foi criada.");
  
  process.exit(0);
}

main().catch((err) => {
  console.error("Erro ao configurar RLS:", err);
  process.exit(1);
});

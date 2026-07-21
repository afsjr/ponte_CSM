import { config } from 'dotenv';
config({ path: '.env.local' });
import postgres from 'postgres';

async function syncPessoas() {
  let dbUrl = process.env.DATABASE_URL!;
  if (dbUrl.includes(':6543')) dbUrl = dbUrl.replace(':6543', ':5432');
  const sql = postgres(dbUrl, { prepare: false });

  try {
    console.log("Sincronizando perfis de pessoa para usuários auth...");

    const users = await sql`SELECT id, email FROM auth.users WHERE email LIKE '%csmeducacao.com'`;

    for (const u of users) {
      console.log(`Syncing ${u.email} (${u.id})...`);
      
      const roleMap: Record<string, string> = {
        'secretaria@csmeducacao.com': 'funcionario',
        'coordenacao@csmeducacao.com': 'funcionario',
        'professor@csmeducacao.com': 'funcionario',
        'admin@csmeducacao.com': 'funcionario',
        'aluno@csmeducacao.com': 'aluno',
        'responsavel@csmeducacao.com': 'responsavel',
      };

      const tipo = roleMap[u.email] || 'funcionario';
      const nomeMap: Record<string, string> = {
        'secretaria@csmeducacao.com': 'Usuário Secretaria',
        'coordenacao@csmeducacao.com': 'Usuário Coordenação',
        'professor@csmeducacao.com': 'Usuário Professor',
        'admin@csmeducacao.com': 'Administrador CSM',
        'aluno@csmeducacao.com': 'Usuário Aluno',
        'responsavel@csmeducacao.com': 'Usuário Responsável',
      };
      const nome = nomeMap[u.email] || 'Usuário Sistema';

      // 1. Inserir ou atualizar na tabela pessoa
      await sql`
        INSERT INTO pessoa (id, nome_completo, situacao, created_at, updated_at)
        VALUES (${u.id}::uuid, ${nome}, 'ativo', NOW(), NOW())
        ON CONFLICT (id) DO UPDATE 
        SET nome_completo = ${nome}, situacao = 'ativo', updated_at = NOW()
      `;

      // 2. Inserir ou atualizar na tabela pessoa_classificacao
      await sql`
        INSERT INTO pessoa_classificacao (pessoa_id, tipo, created_at)
        VALUES (${u.id}::uuid, ${tipo}::tipo_classificacao, NOW())
        ON CONFLICT DO NOTHING
      `;
    }

    console.log("Sincronização de pessoas concluída com sucesso!");
  } catch (err) {
    console.error("ERRO:", err);
  } finally {
    process.exit(0);
  }
}

syncPessoas();

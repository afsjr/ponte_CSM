import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

// Carregar variáveis de ambiente (como tsx usa cwd(), carregamos do root)
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error("Missing Supabase environment variables.")
  process.exit(1)
}

// Cria cliente com service_role para ignorar RLS e forçar criação
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

const testUsers = [
  {
    email: 'secretaria@csmeducacao.com',
    password: 'Teste#12345',
    nome: 'Usuário Secretaria',
    role: 'secretaria' // Ou outro papel, se tiver controle por role/classificacao
  },
  {
    email: 'coordenacao@csmeducacao.com',
    password: 'Teste#12345',
    nome: 'Usuário Coordenação',
    role: 'funcionario' 
  },
  {
    email: 'professor@csmeducacao.com',
    password: 'Teste#12345',
    nome: 'Usuário Professor',
    role: 'funcionario'
  },
  {
    email: 'aluno@csmeducacao.com',
    password: 'Teste#12345',
    nome: 'Usuário Aluno',
    role: 'aluno'
  },
  {
    email: 'responsavel@csmeducacao.com',
    password: 'Teste#12345',
    nome: 'Usuário Responsável',
    role: 'responsavel'
  }
]

async function main() {
  console.log("Iniciando criação de usuários de teste...")

  for (const tu of testUsers) {
    console.log(`Processando: ${tu.email}`)
    
    // 1. Criar o usuário no auth.users (isso não dispara email se email_confirm: true for usado pelo Admin API)
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: tu.email,
      password: tu.password,
      email_confirm: true, // Força a confirmação de email
      user_metadata: {
        role: tu.role
      }
    })

    if (authError) {
      if (authError.message.includes("User already registered") || authError.message.includes("already exists")) {
        console.log(`Usuário ${tu.email} já existe no auth.users. Atualizando senha e confirmando email...`)
        
        // Vamos buscar o usuário pelo email
        const { data: listData, error: listError } = await supabaseAdmin.auth.admin.listUsers()
        if (!listError) {
          const existingUser = listData.users.find(u => u.email === tu.email)
          if (existingUser) {
            await supabaseAdmin.auth.admin.updateUserById(existingUser.id, {
              password: tu.password,
              email_confirm: true,
              user_metadata: { role: tu.role }
            })
            console.log(`Senha atualizada para ${tu.email}`)
            
            // Verifica se a pessoa correspondente já existe
            const { data: pessoaExistente } = await supabaseAdmin
              .from('pessoa')
              .select('id')
              .eq('id', existingUser.id)
              .single()
              
            if (!pessoaExistente) {
               await criarPessoaEClassificacao(existingUser.id, tu.nome, tu.role)
            }
          }
        }
      } else {
        console.error(`Erro ao criar usuário auth ${tu.email}:`, authError)
      }
      continue; // Vai para o próximo usuário se falhar
    }

    if (authData?.user) {
      console.log(`Usuário auth criado com sucesso: ${authData.user.id}`)
      await criarPessoaEClassificacao(authData.user.id, tu.nome, tu.role)
    }
  }

  console.log("Processo concluído.")
}

async function criarPessoaEClassificacao(userId: string, nome: string, role: string) {
  // 2. Criar a Pessoa
  const { data: pessoaData, error: pessoaError } = await supabaseAdmin
    .from('pessoa')
    .insert({
      id: userId,
      nome_completo: nome,
      situacao: 'ativo'
    })
    .select()
    .single()

  if (pessoaError) {
    console.error(`Erro ao criar pessoa para ${nome}:`, pessoaError)
    return
  }

  console.log(`Registro na tabela Pessoa criado para ${nome}`)

  // 3. Criar a Classificação (Pessoa Classificacao)
  // Mapear role para o enum de classificacao
  let classificacao = 'funcionario'
  if (role === 'aluno') classificacao = 'aluno'
  if (role === 'responsavel') classificacao = 'responsavel'
  
  const { error: classError } = await supabaseAdmin
    .from('pessoa_classificacao')
    .insert({
      pessoa_id: userId,
      tipo: classificacao
    })

  if (classError) {
    console.error(`Erro ao criar classificação para ${nome}:`, classError)
  } else {
    console.log(`Classificação ${classificacao} adicionada para ${nome}`)
  }
}

main().catch(console.error)

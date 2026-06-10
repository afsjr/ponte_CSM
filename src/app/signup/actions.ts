'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { db } from '@/db'
import { pessoa, pessoaClassificacao, contato } from '@/db/schema'
import { headers } from 'next/headers'
import { rateLimit } from '@/lib/rateLimit'

export async function signup(formData: FormData) {
  const headersList = await headers()
  const ip = headersList.get('x-forwarded-for') ?? '127.0.0.1'
  
  // Limita a 3 criações de conta por IP a cada 1 hora (60 min * 60 seg * 1000 ms)
  if (!rateLimit(ip + '_signup', 3, 60 * 60 * 1000)) {
    redirect('/signup?error=Muitas contas criadas. Tente novamente mais tarde.')
  }

  const supabase = await createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const nomeCompleto = formData.get('nomeCompleto') as string
  const cpf = formData.get('cpf') as string

  // Remove máscara do CPF se houver
  const cpfLimpo = cpf.replace(/\D/g, '')

  // 1. Criar o usuário no Supabase Auth
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        nome: nomeCompleto,
      }
    }
  })

  if (authError || !authData.user) {
    console.error('Erro de Autenticação:', authError)
    redirect(`/signup?error=${encodeURIComponent(authError?.message || 'Erro ao criar conta de acesso.')}`)
  }

  // 2. Criar os registros na base do Drizzle vinculando o id da pessoa ao user.id
  try {
    await db.transaction(async (tx) => {
      // Inserir a Pessoa com situação 'inativo' e o UUID exato do auth
      await tx.insert(pessoa).values({
        id: authData.user!.id,
        nomeCompleto,
        cpf: cpfLimpo,
        situacao: 'inativo', // Começa inativo para a aprovação manual
      });

      // Classificação 'interessado'
      await tx.insert(pessoaClassificacao).values({
        pessoaId: authData.user!.id,
        tipo: 'interessado',
      });

      // Inserir contato de E-mail para poder ser consultado e encontrado depois
      await tx.insert(contato).values({
        pessoaId: authData.user!.id,
        tipo: 'email',
        valor: email,
        principal: true,
      });
    })
  } catch (dbError: any) {
    console.error('Erro ao salvar no banco:', dbError)
    // Nota: Como o Supabase Auth já salvou, se der erro aqui, talvez seja melhor 
    // apagar o user do Supabase ou gerenciar isso (estamos simplificando).
    redirect(`/signup?error=${encodeURIComponent('A conta de login foi criada, mas houve um erro ao registrar seus dados no sistema. Tente novamente ou contate o suporte.')}`)
  }

  // Ao cadastrar, o authData não necessariamente faz login automaticamente 
  // se houver e-mail confirmation, mas se estiver logado:
  revalidatePath('/', 'layout')
  
  // Redireciona para o login informando sucesso ou diretamente para em-analise
  // Como ele já foi logado após signup no Supabase (se auto-confirm ligado), 
  // o middleware redirecionaria ele de qualquer forma, então mandamos para a raiz que vai cair no `em-analise`.
  redirect('/')
}

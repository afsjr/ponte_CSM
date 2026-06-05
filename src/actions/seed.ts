'use server'

import { db } from '@/db'
import { pessoa, pessoaClassificacao, anoLetivo } from '@/db/schema'
import { createClient } from '@/lib/supabase/server'
import { eq } from 'drizzle-orm'
import crypto from 'crypto'
import { revalidatePath } from 'next/cache'

export async function runSeedMock() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    let userId = user?.id
    if (!userId && process.env.NODE_ENV === 'development') {
      userId = '00000000-0000-0000-0000-000000000000'
    }

    if (!userId) {
      return { success: false, error: 'Você precisa estar logado na interface principal para rodar o seed.' }
    }

    // 1. Garantir que o usuário atual exista na tabela pessoa
    const userExist = await db.select().from(pessoa).where(eq(pessoa.id, userId))
    if (userExist.length === 0) {
      await db.insert(pessoa).values({
        id: userId,
        nomeCompleto: 'Administrador (Mock)',
        cpf: '000.000.000-00',
        dataNascimento: new Date('1980-01-01'),
        situacao: 'ativo',
        genero: 'masculino'
      })
      
      await db.insert(pessoaClassificacao).values({
        pessoaId: userId,
        tipo: 'funcionario'
      })
    }

    // 2. Criar Nível, Série, Turma e Ano Letivo para os mocks
    const anoAtual = new Date().getFullYear()
    
    // Check Ano Letivo
    let ano = await db.select().from(anoLetivo).where(eq(anoLetivo.ano, anoAtual))
    if (ano.length === 0) {
      await db.insert(anoLetivo).values({
        ano: anoAtual,
        dataInicio: new Date(`${anoAtual}-02-01`),
        dataFim: new Date(`${anoAtual}-12-15`),
        ativo: true
      }).returning()
    }

    // 3. Criar ALUNOS DE MOCK
    const mockAlunos = [
      {
        nomeCompleto: 'João Silva Sousa',
        cpf: '111.111.111-11',
        dataNascimento: new Date('2010-05-10'),
      },
      {
        nomeCompleto: 'Maria Oliveira Nunes',
        cpf: '222.222.222-22',
        dataNascimento: new Date('2011-03-22'),
      },
      {
        nomeCompleto: 'Pedro Costa Santos',
        cpf: '333.333.333-33',
        dataNascimento: new Date('2009-11-05'),
      }
    ]

    let criados = 0
    for (const aluno of mockAlunos) {
      const existe = await db.select().from(pessoa).where(eq(pessoa.cpf, aluno.cpf))
      if (existe.length === 0) {
        const idAluno = crypto.randomUUID()
        await db.insert(pessoa).values({
          id: idAluno,
          ...aluno,
          situacao: 'ativo',
          genero: 'nao_informado'
        })
        
        await db.insert(pessoaClassificacao).values({
          pessoaId: idAluno,
          tipo: 'aluno'
        })
        criados++
      }
    }

    revalidatePath('/secretaria')
    return { success: true, message: `Seed finalizado. ${criados} alunos criados.` }

  } catch (error: any) {
    console.error('Erro no seed:', error)
    return { success: false, error: error.message }
  }
}

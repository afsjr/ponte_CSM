'use server'

import { db } from '@/db'
import { pessoa, pessoaClassificacao, endereco, contato, anexo, funcionarioHabilitacao, auditLog, dadosAluno, dadosFuncionario } from '@/db/schema'
import { eq, like, or, ilike, desc, count } from 'drizzle-orm'
import { createClient } from '@/lib/supabase/server'

async function checkAuth() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    if (process.env.NODE_ENV === 'development') {
      return { id: '00000000-0000-0000-0000-000000000000', email: 'dev@mock.com' } as any
    }
    throw new Error('Unauthorized')
  }
  return user
}

export type CreatePessoaParams = {
  nomeCompleto: string;
  cpf?: string;
  rg?: string;
  orgaoExpedidorRg?: string;
  dataExpedicaoRg?: Date;
  dataNascimento?: Date;
  cidadeNatal?: string;
  nacionalidade?: string;
  estrangeiro?: boolean;
  genero?: 'masculino' | 'feminino' | 'outro' | 'nao_informado';
  estadoCivil?: 'solteiro' | 'casado' | 'divorciado' | 'viuvo' | 'uniao_estavel' | 'separado';
  situacao?: 'ativo' | 'inativo' | 'suspenso' | 'transferido' | 'formado' | 'desistente';
  classificacoes: ('aluno' | 'funcionario' | 'responsavel' | 'interessado' | 'fornecedor')[];
  endereco?: {
    cep: string;
    logradouro: string;
    numero: string;
    complemento?: string;
    bairro: string;
    cidade: string;
    uf: string;
  };
  contatos?: {
    tipo: 'celular' | 'telefone_fixo' | 'email' | 'whatsapp';
    valor: string;
    observacao?: string;
    principal?: boolean;
  }[];
  habilitacoes?: string[]; // IDs das disciplinas para professores
  dadosAluno?: {
    numeroMatricula?: string;
    ra?: string;
    codigoBarras?: string;
    loginPortal?: string;
    senhaPortalHash?: string;
    cartaoCatraca?: string;
    permitirBiblioteca?: boolean;
    turmaAtualId?: string;
  };
  dadosFuncionario?: {
    cargo?: string;
    departamento?: string;
    dataAdmissao?: Date;
    dataDemissao?: Date;
    salario?: number; // em centavos
    cargaHoraria?: number;
    registroProfissional?: string;
  };
}

export async function createPessoa(data: CreatePessoaParams) {
  try {
    const user = await checkAuth()
    const { classificacoes, habilitacoes, dadosAluno: alunoInputData, dadosFuncionario: funcionarioInputData, ...pessoaData } = data;

    // Transação para garantir consistência
    const novaPessoaId = await db.transaction(async (tx) => {
      // 1. Criar Pessoa
      const [novaPessoa] = await tx
        .insert(pessoa)
        .values({
          ...pessoaData,
          dataNascimento: data.dataNascimento ? new Date(data.dataNascimento) : null,
          dataExpedicaoRg: data.dataExpedicaoRg ? new Date(data.dataExpedicaoRg) : null
        })
        .returning({ id: pessoa.id });

      // 2. Criar Classificações (Aluno, Funcionário, etc)
      if (classificacoes && classificacoes.length > 0) {
        const classificacoesInsert = classificacoes.map((tipo) => ({
          pessoaId: novaPessoa.id,
          tipo,
        }));
        await tx.insert(pessoaClassificacao).values(classificacoesInsert);
      }

      // 3. Criar Endereço
      if (data.endereco && data.endereco.cep) {
        await tx.insert(endereco).values({
          pessoaId: novaPessoa.id,
          ...data.endereco
        });
      }

      // 4. Criar Contatos
      if (data.contatos && data.contatos.length > 0) {
        const contatosInsert = data.contatos.map(c => ({
          pessoaId: novaPessoa.id,
          tipo: c.tipo,
          valor: c.valor,
          observacao: c.observacao,
          principal: c.principal || false
        }));
        await tx.insert(contato).values(contatosInsert);
      }

      // 5. Criar Habilitações (se for funcionário)
      if (habilitacoes && habilitacoes.length > 0 && classificacoes.includes('funcionario')) {
        const habilitacoesInsert = habilitacoes.map(disciplinaId => ({
          funcionarioId: novaPessoa.id,
          disciplinaId
        }));
        await tx.insert(funcionarioHabilitacao).values(habilitacoesInsert);
      }

      // 6. Criar Dados de Aluno (se for aluno)
      if (classificacoes.includes('aluno') && alunoInputData) {
        await tx.insert(dadosAluno).values({
          pessoaId: novaPessoa.id,
          numeroMatricula: alunoInputData.numeroMatricula,
          ra: alunoInputData.ra,
          codigoBarras: alunoInputData.codigoBarras,
          loginPortal: alunoInputData.loginPortal,
          senhaPortalHash: alunoInputData.senhaPortalHash,
          cartaoCatraca: alunoInputData.cartaoCatraca,
          permitirBiblioteca: alunoInputData.permitirBiblioteca ?? true,
          turmaAtualId: alunoInputData.turmaAtualId
        });
      }

      // 7. Criar Dados de Funcionário (se for funcionário)
      if (classificacoes.includes('funcionario') && funcionarioInputData) {
        await tx.insert(dadosFuncionario).values({
          pessoaId: novaPessoa.id,
          cargo: funcionarioInputData.cargo,
          departamento: funcionarioInputData.departamento,
          dataAdmissao: funcionarioInputData.dataAdmissao ? new Date(funcionarioInputData.dataAdmissao) : null,
          dataDemissao: funcionarioInputData.dataDemissao ? new Date(funcionarioInputData.dataDemissao) : null,
          salario: funcionarioInputData.salario,
          cargaHoraria: funcionarioInputData.cargaHoraria,
          registroProfissional: funcionarioInputData.registroProfissional
        });
      }

      return novaPessoa.id;
    });

    return { success: true, id: novaPessoaId };
  } catch (error: any) {
    console.error('Erro ao criar pessoa:', error);
    return { success: false, error: error.message };
  }
}

export async function getPessoas(params: { page?: number; limit?: number; search?: string }) {
  const page = params.page || 1;
  const limit = params.limit || 10;
  const offset = (page - 1) * limit;

  try {
    let baseQuery = db.select().from(pessoa);
    let countQuery = db.select({ value: count() }).from(pessoa);

    if (params.search) {
      const searchTerm = `%${params.search}%`;
      const searchFilter = or(
        ilike(pessoa.nomeCompleto, searchTerm),
        ilike(pessoa.cpf, searchTerm)
      );
      
      baseQuery = baseQuery.where(searchFilter) as any;
      countQuery = countQuery.where(searchFilter) as any;
    }

    const [totalResult] = await countQuery;
    const total = totalResult.value;

    const data = await baseQuery
      .orderBy(desc(pessoa.createdAt))
      .limit(limit)
      .offset(offset);

    return {
      success: true,
      data,
      metadata: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    };
  } catch (error: any) {
    console.error('Erro ao buscar pessoas:', error);
    return { success: false, error: error.message };
  }
}

export async function updatePessoa(id: string, data: Partial<CreatePessoaParams>) {
  try {
    const user = await checkAuth()
    const { classificacoes, habilitacoes, dadosAluno: alunoInputData, dadosFuncionario: funcionarioInputData, ...pessoaData } = data;

    await db.transaction(async (tx) => {
      // Atualiza os dados principais
      if (Object.keys(pessoaData).length > 0) {
        await tx.update(pessoa)
          .set({ ...pessoaData, updatedAt: new Date() })
          .where(eq(pessoa.id, id));
      }

      // Atualiza classificações se fornecidas
      if (classificacoes) {
        // Remove as antigas
        await tx.delete(pessoaClassificacao).where(eq(pessoaClassificacao.pessoaId, id));
        
        // Insere as novas
        if (classificacoes.length > 0) {
          const classificacoesInsert = classificacoes.map((tipo) => ({
            pessoaId: id,
            tipo,
          }));
          await tx.insert(pessoaClassificacao).values(classificacoesInsert);
        }
      }

      // Atualiza Habilitações se fornecidas
      if (habilitacoes) {
        await tx.delete(funcionarioHabilitacao).where(eq(funcionarioHabilitacao.funcionarioId, id));
        if (habilitacoes.length > 0 && (classificacoes?.includes('funcionario') || data.classificacoes?.includes('funcionario'))) {
          const habilitacoesInsert = habilitacoes.map(disciplinaId => ({
            funcionarioId: id,
            disciplinaId
          }));
          await tx.insert(funcionarioHabilitacao).values(habilitacoesInsert);
        }
      }

      // Atualiza Dados de Aluno (Upsert)
      if (alunoInputData && (classificacoes?.includes('aluno') || data.classificacoes?.includes('aluno'))) {
        await tx.insert(dadosAluno)
          .values({
            pessoaId: id,
            numeroMatricula: alunoInputData.numeroMatricula,
            ra: alunoInputData.ra,
            codigoBarras: alunoInputData.codigoBarras,
            loginPortal: alunoInputData.loginPortal,
            senhaPortalHash: alunoInputData.senhaPortalHash,
            cartaoCatraca: alunoInputData.cartaoCatraca,
            permitirBiblioteca: alunoInputData.permitirBiblioteca ?? true,
            turmaAtualId: alunoInputData.turmaAtualId,
            updatedAt: new Date()
          })
          .onConflictDoUpdate({
            target: dadosAluno.pessoaId,
            set: {
              numeroMatricula: alunoInputData.numeroMatricula,
              ra: alunoInputData.ra,
              codigoBarras: alunoInputData.codigoBarras,
              loginPortal: alunoInputData.loginPortal,
              senhaPortalHash: alunoInputData.senhaPortalHash,
              cartaoCatraca: alunoInputData.cartaoCatraca,
              permitirBiblioteca: alunoInputData.permitirBiblioteca ?? true,
              turmaAtualId: alunoInputData.turmaAtualId,
              updatedAt: new Date()
            }
          });
      }

      // Atualiza Dados de Funcionário (Upsert)
      if (funcionarioInputData && (classificacoes?.includes('funcionario') || data.classificacoes?.includes('funcionario'))) {
        await tx.insert(dadosFuncionario)
          .values({
            pessoaId: id,
            cargo: funcionarioInputData.cargo,
            departamento: funcionarioInputData.departamento,
            dataAdmissao: funcionarioInputData.dataAdmissao ? new Date(funcionarioInputData.dataAdmissao) : null,
            dataDemissao: funcionarioInputData.dataDemissao ? new Date(funcionarioInputData.dataDemissao) : null,
            salario: funcionarioInputData.salario,
            cargaHoraria: funcionarioInputData.cargaHoraria,
            registroProfissional: funcionarioInputData.registroProfissional,
            updatedAt: new Date()
          })
          .onConflictDoUpdate({
            target: dadosFuncionario.pessoaId,
            set: {
              cargo: funcionarioInputData.cargo,
              departamento: funcionarioInputData.departamento,
              dataAdmissao: funcionarioInputData.dataAdmissao ? new Date(funcionarioInputData.dataAdmissao) : null,
              dataDemissao: funcionarioInputData.dataDemissao ? new Date(funcionarioInputData.dataDemissao) : null,
              salario: funcionarioInputData.salario,
              cargaHoraria: funcionarioInputData.cargaHoraria,
              registroProfissional: funcionarioInputData.registroProfissional,
              updatedAt: new Date()
            }
          });
      }
    });

    return { success: true };
  } catch (error: any) {
    console.error('Erro ao atualizar pessoa:', error);
    return { success: false, error: error.message };
  }
}

export async function deletePessoa(id: string, motivo: string) {
  try {
    const user = await checkAuth()
    
    const [p] = await db.select().from(pessoa).where(eq(pessoa.id, id));
    if (!p) {
      return { success: false, error: 'Pessoa não encontrada' };
    }
    
    await db.transaction(async (tx) => {
      await tx.delete(pessoa).where(eq(pessoa.id, id));
      await tx.insert(auditLog).values({
        usuarioId: user.id,
        acao: 'delete',
        tabela: 'pessoa',
        registroId: id,
        dadosAntigos: p,
        motivo,
      });
    });
    
    return { success: true };
  } catch (error: any) {
    console.error('Erro ao excluir pessoa:', error);
    return { success: false, error: 'Não é possível excluir esta pessoa pois ela possui matrículas, diários ou outros registros vinculados.' };
  }
}

export async function getPessoaById(id: string) {
  try {
    const user = await checkAuth()

    const result = await db.transaction(async (tx) => {
      const [p] = await tx.select().from(pessoa).where(eq(pessoa.id, id));
      if (!p) return null;

      const classificacoes = await tx.select().from(pessoaClassificacao).where(eq(pessoaClassificacao.pessoaId, id));
      const enderecos = await tx.select().from(endereco).where(eq(endereco.pessoaId, id));
      const contatos = await tx.select().from(contato).where(eq(contato.pessoaId, id));
      const anexos = await tx.select().from(anexo).where(eq(anexo.pessoaId, id));

      const [alunoData] = await tx.select().from(dadosAluno).where(eq(dadosAluno.pessoaId, id));
      const [funcionarioData] = await tx.select().from(dadosFuncionario).where(eq(dadosFuncionario.pessoaId, id));
      const habilitacoes = await tx.select().from(funcionarioHabilitacao).where(eq(funcionarioHabilitacao.funcionarioId, id));

      return {
        ...p,
        classificacoes: classificacoes.map(c => c.tipo),
        endereco: enderecos[0] || null,
        contatos,
        anexos,
        dadosAluno: alunoData || null,
        dadosFuncionario: funcionarioData || null,
        habilitacoes: habilitacoes.map(h => h.disciplinaId)
      };
    });

    return { success: true, data: result };
  } catch (error: any) {
    console.error('Erro ao buscar pessoa por ID:', error);
    return { success: false, error: error.message };
  }
}

'use server'

import { db } from '@/db'
import { pessoa, pessoaClassificacao, endereco, contato, anexo, funcionarioHabilitacao, auditLog, dadosAluno, dadosFuncionario, vinculoResponsavelAluno } from '@/db/schema'
import { eq, like, or, ilike, desc, count, and } from 'drizzle-orm'
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
    vinculos?: {
      responsavelId: string;
      grauParentesco: string;
      responsavelFinanceiro: boolean;
      responsavelPedagogico: boolean;
      autorizadoRetirada: boolean;
    }[];
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

    const normalizedCpf = pessoaData.cpf && pessoaData.cpf.trim() !== '' ? pessoaData.cpf.trim() : null;
    const normalizedRg = pessoaData.rg && pessoaData.rg.trim() !== '' ? pessoaData.rg.trim() : null;

    // Transação para garantir consistência
    const novaPessoaId = await db.transaction(async (tx) => {
      // 1. Criar Pessoa
      const [novaPessoa] = await tx
        .insert(pessoa)
        .values({
          ...pessoaData,
          cpf: normalizedCpf,
          rg: normalizedRg,
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

        if (alunoInputData.vinculos && alunoInputData.vinculos.length > 0) {
          const vinculosInsert = alunoInputData.vinculos.map(v => ({
            alunoId: novaPessoa.id,
            responsavelId: v.responsavelId,
            grauParentesco: v.grauParentesco,
            responsavelFinanceiro: v.responsavelFinanceiro,
            responsavelPedagogico: v.responsavelPedagogico,
            autorizadoRetirada: v.autorizadoRetirada
          }));
          await tx.insert(vinculoResponsavelAluno).values(vinculosInsert);
        }
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

export async function getPessoas(params: { page?: number; limit?: number; search?: string; tipo?: string }) {
  const page = params.page || 1;
  const limit = params.limit || 15;
  const offset = (page - 1) * limit;

  try {
    let baseQuery = db
      .select({
        id: pessoa.id,
        nomeCompleto: pessoa.nomeCompleto,
        cpf: pessoa.cpf,
        situacao: pessoa.situacao,
        createdAt: pessoa.createdAt,
        tipo: pessoaClassificacao.tipo,
      })
      .from(pessoa)
      .leftJoin(pessoaClassificacao, eq(pessoaClassificacao.pessoaId, pessoa.id));

    let countQuery = db
      .select({ value: count() })
      .from(pessoa)
      .leftJoin(pessoaClassificacao, eq(pessoaClassificacao.pessoaId, pessoa.id));

    const filters = [];

    if (params.search) {
      const searchTerm = `%${params.search}%`;
      filters.push(or(
        ilike(pessoa.nomeCompleto, searchTerm),
        ilike(pessoa.cpf, searchTerm)
      ));
    }

    if (params.tipo && params.tipo !== 'todos') {
      filters.push(eq(pessoaClassificacao.tipo, params.tipo as any));
    }

    if (filters.length > 0) {
      const combined = and(...filters);
      baseQuery = baseQuery.where(combined) as any;
      countQuery = countQuery.where(combined) as any;
    }

    const [totalResult] = await countQuery;
    const total = totalResult.value;

    const data = await baseQuery
      .orderBy(pessoa.nomeCompleto)
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
    const { classificacoes, habilitacoes, dadosAluno: alunoInputData, dadosFuncionario: funcionarioInputData, contatos: contatosInput, endereco: enderecoInput, ...restData } = data;

    // Extrair APENAS os campos válidos da tabela pessoa (evitar spreads que corrompem o UPDATE)
    const pessoaFields: Record<string, any> = {}
    const validPessoaKeys = ['nomeCompleto', 'cpf', 'rg', 'orgaoExpedidorRg', 'dataExpedicaoRg', 'dataNascimento', 'cidadeNatal', 'nacionalidade', 'estrangeiro', 'genero', 'estadoCivil', 'situacao', 'necessidadeEspecial']
    for (const key of validPessoaKeys) {
      if (key in restData) {
        let val = (restData as any)[key]
        if ((key === 'cpf' || key === 'rg') && typeof val === 'string') {
          val = val.trim() !== '' ? val.trim() : null
        }
        pessoaFields[key] = val
      }
    }

    await db.transaction(async (tx) => {
      // Atualiza os dados principais (somente colunas válidas)
      if (Object.keys(pessoaFields).length > 0) {
        await tx.update(pessoa)
          .set({ ...pessoaFields, updatedAt: new Date() })
          .where(eq(pessoa.id, id));
      }

      // Atualiza classificações se fornecidas
      if (classificacoes) {
        await tx.delete(pessoaClassificacao).where(eq(pessoaClassificacao.pessoaId, id));
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

      // Atualiza Vínculos do Aluno se fornecido
      if (alunoInputData && alunoInputData.vinculos !== undefined && (classificacoes?.includes('aluno') || data.classificacoes?.includes('aluno'))) {
        await tx.delete(vinculoResponsavelAluno).where(eq(vinculoResponsavelAluno.alunoId, id));
        if (alunoInputData.vinculos.length > 0) {
          const vinculosInsert = alunoInputData.vinculos.map(v => ({
            alunoId: id,
            responsavelId: v.responsavelId,
            grauParentesco: v.grauParentesco,
            responsavelFinanceiro: v.responsavelFinanceiro,
            responsavelPedagogico: v.responsavelPedagogico,
            autorizadoRetirada: v.autorizadoRetirada
          }));
          await tx.insert(vinculoResponsavelAluno).values(vinculosInsert);
        }
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
        usuarioId: user.id === '00000000-0000-0000-0000-000000000000' ? null : user.id,
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
      
      const vinculos = await tx.select({
        id: vinculoResponsavelAluno.id,
        responsavelId: vinculoResponsavelAluno.responsavelId,
        grauParentesco: vinculoResponsavelAluno.grauParentesco,
        responsavelFinanceiro: vinculoResponsavelAluno.responsavelFinanceiro,
        responsavelPedagogico: vinculoResponsavelAluno.responsavelPedagogico,
        autorizadoRetirada: vinculoResponsavelAluno.autorizadoRetirada,
        responsavelNome: pessoa.nomeCompleto,
        responsavelCpf: pessoa.cpf,
      })
      .from(vinculoResponsavelAluno)
      .innerJoin(pessoa, eq(pessoa.id, vinculoResponsavelAluno.responsavelId))
      .where(eq(vinculoResponsavelAluno.alunoId, id));

      if (alunoData) {
        (alunoData as any).vinculos = vinculos;
      }

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

export async function searchResponsaveis(query: string) {
  try {
    const searchTerm = `%${query}%`;
    const data = await db
      .select({
        id: pessoa.id,
        nomeCompleto: pessoa.nomeCompleto,
        cpf: pessoa.cpf,
      })
      .from(pessoa)
      .innerJoin(pessoaClassificacao, eq(pessoa.id, pessoaClassificacao.pessoaId))
      .where(
        and(
          eq(pessoaClassificacao.tipo, 'responsavel'),
          or(
            ilike(pessoa.nomeCompleto, searchTerm),
            ilike(pessoa.cpf, searchTerm)
          )
        )
      )
      .limit(10)
      .orderBy(pessoa.nomeCompleto);

    return { success: true, data };
  } catch (error: any) {
    console.error('Erro ao buscar responsáveis:', error);
    return { success: false, error: error.message };
  }
}

'use server';

import { db } from '@/db';
import { anoLetivo, matricula, pessoa, pessoaClassificacao, turma, serie, nivelEnsino, contratoEscolar, documentoGerado, auditLog, ocorrenciaAluno, historicoEscolar } from '@/db/schema';
import { eq, and, desc } from 'drizzle-orm';
import { alias } from 'drizzle-orm/pg-core';
import { revalidatePath } from 'next/cache';
import { createHash } from 'crypto';
import { createClient } from '@/lib/supabase/server';

async function checkAuth() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    if (process.env.NODE_ENV === 'development') {
      return { id: '00000000-0000-0000-0000-000000000000', email: 'dev@mock.com' } as any;
    }
    throw new Error('Unauthorized');
  }
  return user;
}

// --- ANO LETIVO ---

export async function getAnosLetivos() {
  try {
    const anos = await db.select().from(anoLetivo).orderBy(desc(anoLetivo.ano));
    return anos;
  } catch (error) {
    console.error('Erro ao buscar anos letivos:', error);
    return [];
  }
}

export async function createAnoLetivo(data: { ano: number; dataInicio: Date; dataFim: Date; ativo: boolean }) {
  try {
    await checkAuth();
    const novoAno = await db.insert(anoLetivo).values(data).returning();
    revalidatePath('/secretaria');
    return { success: true, ano: novoAno[0] };
  } catch (error) {
    console.error('Erro ao criar ano letivo:', error);
    return { success: false, error: 'Erro ao criar ano letivo' };
  }
}

export async function updateAnoLetivo(id: string, data: { ano: number; dataInicio: Date; dataFim: Date; ativo: boolean }) {
  try {
    await checkAuth();
    const atualizado = await db.update(anoLetivo)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(anoLetivo.id, id))
      .returning();
    revalidatePath('/secretaria');
    return { success: true, ano: atualizado[0] };
  } catch (error) {
    console.error('Erro ao atualizar ano letivo:', error);
    return { success: false, error: 'Erro ao atualizar ano letivo' };
  }
}

// --- MATRÍCULA ---

export async function getMatriculas() {
  try {
    const matriculasList = await db
      .select({
        id: matricula.id,
        numeroMatricula: matricula.numeroMatricula,
        dataMatricula: matricula.dataMatricula,
        status: matricula.status,
        alunoNome: pessoa.nomeCompleto,
        alunoCpf: pessoa.cpf,
        turmaNome: turma.nome,
        serieNome: serie.nome,
        nivelNome: nivelEnsino.nome,
        ano: anoLetivo.ano,
      })
      .from(matricula)
      .innerJoin(pessoa, eq(matricula.alunoId, pessoa.id))
      .innerJoin(turma, eq(matricula.turmaId, turma.id))
      .innerJoin(serie, eq(turma.serieId, serie.id))
      .innerJoin(nivelEnsino, eq(serie.nivelEnsinoId, nivelEnsino.id))
      .innerJoin(anoLetivo, eq(matricula.anoLetivoId, anoLetivo.id))
      .orderBy(desc(matricula.dataMatricula));

    return matriculasList;
  } catch (error) {
    console.error('Erro ao buscar matriculas:', error);
    return [];
  }
}

export async function createMatricula(data: { 
  alunoId: string; 
  turmaId: string; 
  anoLetivoId: string; 
  numeroMatricula: string; 
  dataMatricula: Date;
  status: 'ativo' | 'trancado' | 'cancelado' | 'concluido' | 'transferido';
}) {
  try {
    await checkAuth();
    const novaMatricula = await db.insert(matricula).values(data).returning();
    revalidatePath('/secretaria');
    return { success: true, matricula: novaMatricula[0] };
  } catch (error) {
    console.error('Erro ao criar matrícula:', error);
    return { success: false, error: 'Erro ao criar matrícula' };
  }
}

export async function updateMatricula(id: string, data: {
  status: 'ativo' | 'trancado' | 'cancelado' | 'concluido' | 'transferido';
  dataSaida?: Date | null;
  motivoSaida?: 'desistencia' | 'inadimplencia' | 'transferencia' | 'conclusao' | 'expulsao' | 'outro' | null;
}) {
  try {
    await checkAuth();
    const atualizado = await db.update(matricula)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(matricula.id, id))
      .returning();
    revalidatePath('/secretaria');
    return { success: true, matricula: atualizado[0] };
  } catch (error) {
    console.error('Erro ao atualizar matrícula:', error);
    return { success: false, error: 'Erro ao atualizar matrícula' };
  }
}

// --- UTILS PARA SELECTS ---

export async function getAlunosList() {
  try {
    const alunos = await db
      .select({
        id: pessoa.id,
        nomeCompleto: pessoa.nomeCompleto,
        cpf: pessoa.cpf,
      })
      .from(pessoa)
      .innerJoin(pessoaClassificacao, eq(pessoa.id, pessoaClassificacao.pessoaId))
      .where(
        and(
          eq(pessoaClassificacao.tipo, 'aluno'),
          eq(pessoa.situacao, 'ativo')
        )
      )
      .orderBy(pessoa.nomeCompleto);
    return alunos;
  } catch (error) {
    console.error('Erro ao buscar alunos:', error);
    return [];
  }
}

// --- CONTRATO ESCOLAR ---

export async function getContratos() {
  try {
    const agora = new Date();
    
    // 1. Busca todos os contratos ativos
    const contratosAtivos = await db
      .select()
      .from(contratoEscolar)
      .where(eq(contratoEscolar.status, 'ativo'));
      
    // 2. Lazy evaluation: atualiza os que venceram
    const vencidos = contratosAtivos.filter(c => c.dataVigenciaFim < agora);
    if (vencidos.length > 0) {
      await db.transaction(async (tx) => {
        for (const contrato of vencidos) {
          await tx
            .update(contratoEscolar)
            .set({ status: 'encerrado', updatedAt: new Date() })
            .where(eq(contratoEscolar.id, contrato.id));
        }
      });
    }

    // 3. Define aliases para a tabela pessoa para fazer double-join
    const aluno = alias(pessoa, 'aluno');
    const responsavel = alias(pessoa, 'responsavel');

    const contratosList = await db
      .select({
        id: contratoEscolar.id,
        alunoNome: aluno.nomeCompleto,
        alunoId: contratoEscolar.alunoId,
        responsavelNome: responsavel.nomeCompleto,
        responsavelId: contratoEscolar.responsavelFinanceiroId,
        ano: anoLetivo.ano,
        dataAssinatura: contratoEscolar.dataAssinatura,
        dataVigenciaInicio: contratoEscolar.dataVigenciaInicio,
        dataVigenciaFim: contratoEscolar.dataVigenciaFim,
        status: contratoEscolar.status,
        valorMensalidade: contratoEscolar.valorMensalidade,
        percentualDesconto: contratoEscolar.percentualDesconto,
        observacoes: contratoEscolar.observacoes,
        urlDocumentoAssinado: contratoEscolar.urlDocumentoAssinado,
      })
      .from(contratoEscolar)
      .innerJoin(aluno, eq(contratoEscolar.alunoId, aluno.id))
      .innerJoin(responsavel, eq(contratoEscolar.responsavelFinanceiroId, responsavel.id))
      .innerJoin(anoLetivo, eq(contratoEscolar.anoLetivoId, anoLetivo.id))
      .orderBy(desc(contratoEscolar.createdAt));

    return contratosList;
  } catch (error) {
    console.error('Erro ao buscar contratos:', error);
    return [];
  }
}

export async function createContrato(data: {
  alunoId: string;
  responsavelFinanceiroId: string;
  anoLetivoId: string;
  dataAssinatura?: Date | null;
  dataVigenciaInicio: Date;
  dataVigenciaFim: Date;
  status: 'rascunho' | 'ativo' | 'encerrado' | 'cancelado' | 'renovado';
  valorMensalidade: number; // em centavos
  percentualDesconto?: number;
  observacoes?: string | null;
  urlDocumentoAssinado?: string | null;
}) {
  try {
    await checkAuth();
    const novoContrato = await db.insert(contratoEscolar).values({
      ...data,
      percentualDesconto: data.percentualDesconto || 0,
      dataAssinatura: data.dataAssinatura || null,
      observacoes: data.observacoes || null,
      urlDocumentoAssinado: data.urlDocumentoAssinado || null,
    }).returning();
    revalidatePath('/secretaria');
    return { success: true, contrato: novoContrato[0] };
  } catch (error: any) {
    console.error('Erro ao criar contrato:', error);
    return { success: false, error: error.message };
  }
}

export async function updateContrato(id: string, data: Partial<{
  status: 'rascunho' | 'ativo' | 'encerrado' | 'cancelado' | 'renovado';
  dataAssinatura: Date | null;
  dataVigenciaInicio: Date;
  dataVigenciaFim: Date;
  valorMensalidade: number;
  percentualDesconto: number;
  observacoes: string | null;
  urlDocumentoAssinado: string | null;
}>) {
  try {
    await checkAuth();
    const atualizado = await db.update(contratoEscolar)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(contratoEscolar.id, id))
      .returning();
    revalidatePath('/secretaria');
    return { success: true, contrato: atualizado[0] };
  } catch (error: any) {
    console.error('Erro ao atualizar contrato:', error);
    return { success: false, error: error.message };
  }
}

export async function deleteContrato(id: string, motivo: string) {
  try {
    const user = await checkAuth();
    const [contrato] = await db.select().from(contratoEscolar).where(eq(contratoEscolar.id, id));
    if (!contrato) {
      return { success: false, error: 'Contrato não encontrado' };
    }
    
    await db.transaction(async (tx) => {
      await tx.delete(contratoEscolar).where(eq(contratoEscolar.id, id));
      await tx.insert(auditLog).values({
        usuarioId: user.id,
        acao: 'delete',
        tabela: 'contrato_escolar',
        registroId: id,
        dadosAntigos: contrato,
        motivo,
      });
    });
    
    revalidatePath('/secretaria');
    return { success: true };
  } catch (error: any) {
    console.error('Erro ao excluir contrato:', error);
    return { success: false, error: 'Não é possível excluir este contrato pois ele possui vínculos ou ocorreu um erro no servidor.' };
  }
}

// --- DOCUMENTO GERADO (COORDENAÇÃO) ---

export async function getDocumentosGerados() {
  try {
    const aluno = alias(pessoa, 'aluno');
    const funcionario = alias(pessoa, 'funcionario');

    const lista = await db
      .select({
        id: documentoGerado.id,
        tipo: documentoGerado.tipo,
        titulo: documentoGerado.titulo,
        urlArquivo: documentoGerado.urlArquivo,
        hashVerificacao: documentoGerado.hashVerificacao,
        geradoEm: documentoGerado.geradoEm,
        alunoNome: aluno.nomeCompleto,
        alunoCpf: aluno.cpf,
        alunoId: documentoGerado.pessoaId,
        geradoPorNome: funcionario.nomeCompleto,
        geradoPorId: documentoGerado.geradoPorId,
      })
      .from(documentoGerado)
      .innerJoin(aluno, eq(documentoGerado.pessoaId, aluno.id))
      .innerJoin(funcionario, eq(documentoGerado.geradoPorId, funcionario.id))
      .orderBy(desc(documentoGerado.geradoEm));

    return lista;
  } catch (error) {
    console.error('Erro ao buscar documentos gerados:', error);
    return [];
  }
}

export async function getDocumentoByHash(hash: string) {
  try {
    const aluno = alias(pessoa, 'aluno');
    const funcionario = alias(pessoa, 'funcionario');

    const result = await db
      .select({
        id: documentoGerado.id,
        tipo: documentoGerado.tipo,
        titulo: documentoGerado.titulo,
        hashVerificacao: documentoGerado.hashVerificacao,
        geradoEm: documentoGerado.geradoEm,
        alunoNome: aluno.nomeCompleto,
        alunoCpf: aluno.cpf,
        alunoId: documentoGerado.pessoaId,
        geradoPorNome: funcionario.nomeCompleto,
      })
      .from(documentoGerado)
      .innerJoin(aluno, eq(documentoGerado.pessoaId, aluno.id))
      .innerJoin(funcionario, eq(documentoGerado.geradoPorId, funcionario.id))
      .where(eq(documentoGerado.hashVerificacao, hash));

    return result[0] || null;
  } catch (error) {
    console.error('Erro ao buscar documento por hash:', error);
    return null;
  }
}

export async function createDocumentoGerado(data: {
  pessoaId: string;
  tipo: 'declaracao_matricula' | 'boletim' | 'historico_escolar' | 'declaracao_transferencia' | 'declaracao_conclusao';
  titulo: string;
  urlArquivo: string;
}) {
  try {
    const user = await checkAuth();
    // Geração automática do hash de autenticidade SHA256
    const secretSalt = process.env.SUPABASE_JWT_SECRET || 'csm-secret-salt-key';
    const hashData = `${data.pessoaId}-${data.tipo}-${Date.now()}-${secretSalt}`;
    const hashVerificacao = createHash('sha256').update(hashData).digest('hex');

    const novoDoc = await db.insert(documentoGerado).values({
      ...data,
      geradoPorId: user.id,
      hashVerificacao,
    }).returning();

    return { success: true, documento: novoDoc[0] };
  } catch (error: any) {
    console.error('Erro ao registrar documento gerado:', error);
    return { success: false, error: error.message };
  }
}

export async function deleteDocumentoGerado(id: string, motivo: string) {
  try {
    const user = await checkAuth();
    const [doc] = await db.select().from(documentoGerado).where(eq(documentoGerado.id, id));
    if (!doc) {
      return { success: false, error: 'Documento não encontrado' };
    }
    
    await db.transaction(async (tx) => {
      await tx.delete(documentoGerado).where(eq(documentoGerado.id, id));
      await tx.insert(auditLog).values({
        usuarioId: user.id,
        acao: 'delete',
        tabela: 'documento_gerado',
        registroId: id,
        dadosAntigos: doc,
        motivo,
      });
    });
    
    return { success: true };
  } catch (error: any) {
    console.error('Erro ao excluir documento:', error);
    return { success: false, error: error.message };
  }
}

// --- EXCLUSÕES AUDITADAS (ANO LETIVO E MATRÍCULA) ---

export async function deleteMatricula(id: string, motivo: string) {
  try {
    const user = await checkAuth();
    const [matr] = await db.select().from(matricula).where(eq(matricula.id, id));
    if (!matr) {
      return { success: false, error: 'Matrícula não encontrada' };
    }
    
    await db.transaction(async (tx) => {
      await tx.delete(matricula).where(eq(matricula.id, id));
      await tx.insert(auditLog).values({
        usuarioId: user.id,
        acao: 'delete',
        tabela: 'matricula',
        registroId: id,
        dadosAntigos: matr,
        motivo,
      });
    });
    
    revalidatePath('/secretaria');
    return { success: true };
  } catch (error: any) {
    console.error('Erro ao excluir matrícula:', error);
    return { success: false, error: 'Não é possível excluir esta matrícula devido a restrições de integridade.' };
  }
}

export async function deleteAnoLetivo(id: string, motivo: string) {
  try {
    const user = await checkAuth();
    const [ano] = await db.select().from(anoLetivo).where(eq(anoLetivo.id, id));
    if (!ano) {
      return { success: false, error: 'Ano letivo não encontrado' };
    }
    
    await db.transaction(async (tx) => {
      await tx.delete(anoLetivo).where(eq(anoLetivo.id, id));
      await tx.insert(auditLog).values({
        usuarioId: user.id,
        acao: 'delete',
        tabela: 'ano_letivo',
        registroId: id,
        dadosAntigos: ano,
        motivo,
      });
    });
    
    revalidatePath('/secretaria');
    return { success: true };
  } catch (error: any) {
    console.error('Erro ao excluir ano letivo:', error);
    return { success: false, error: 'Não é possível excluir este ano letivo. Verifique se existem turmas ou matrículas associadas.' };
  }
}

// --- OCORRÊNCIAS ---

export async function createOcorrencia(data: {
  alunoId: string;
  data: Date;
  titulo: string;
  descricao: string;
  providencia?: string;
}) {
  try {
    const user = await checkAuth();
    const [novaOcorrencia] = await db.insert(ocorrenciaAluno).values({
      ...data,
      data: new Date(data.data),
      cadastradoPorId: user.id,
    }).returning();
    revalidatePath('/secretaria');
    return { success: true, ocorrencia: novaOcorrencia };
  } catch (error: any) {
    console.error('Erro ao criar ocorrência:', error);
    return { success: false, error: error.message };
  }
}

export async function getOcorrencias(alunoId?: string) {
  try {
    const cadastradoPor = alias(pessoa, 'cadastradoPor');
    const aluno = alias(pessoa, 'aluno');

    let baseQuery = db
      .select({
        id: ocorrenciaAluno.id,
        data: ocorrenciaAluno.data,
        titulo: ocorrenciaAluno.titulo,
        descricao: ocorrenciaAluno.descricao,
        providencia: ocorrenciaAluno.providencia,
        alunoId: ocorrenciaAluno.alunoId,
        alunoNome: aluno.nomeCompleto,
        cadastradoPorId: ocorrenciaAluno.cadastradoPorId,
        cadastradoPorNome: cadastradoPor.nomeCompleto,
      })
      .from(ocorrenciaAluno)
      .innerJoin(aluno, eq(ocorrenciaAluno.alunoId, aluno.id))
      .innerJoin(cadastradoPor, eq(ocorrenciaAluno.cadastradoPorId, cadastradoPor.id));

    if (alunoId) {
      baseQuery = baseQuery.where(eq(ocorrenciaAluno.alunoId, alunoId)) as any;
    }

    const data = await baseQuery.orderBy(desc(ocorrenciaAluno.data));
    return { success: true, data };
  } catch (error: any) {
    console.error('Erro ao buscar ocorrências:', error);
    return { success: false, error: error.message };
  }
}

export async function updateOcorrencia(id: string, data: Partial<{
  data: Date;
  titulo: string;
  descricao: string;
  providencia: string;
}>) {
  try {
    await checkAuth();
    const updateData: any = { ...data, updatedAt: new Date() };
    if (data.data) {
      updateData.data = new Date(data.data);
    }
    const [atualizado] = await db.update(ocorrenciaAluno)
      .set(updateData)
      .where(eq(ocorrenciaAluno.id, id))
      .returning();
    revalidatePath('/secretaria');
    return { success: true, ocorrencia: atualizado };
  } catch (error: any) {
    console.error('Erro ao atualizar ocorrência:', error);
    return { success: false, error: error.message };
  }
}

export async function deleteOcorrencia(id: string, motivo: string) {
  try {
    const user = await checkAuth();
    const [ocorrenciaData] = await db.select().from(ocorrenciaAluno).where(eq(ocorrenciaAluno.id, id));
    if (!ocorrenciaData) {
      return { success: false, error: 'Ocorrência não encontrada' };
    }

    await db.transaction(async (tx) => {
      await tx.delete(ocorrenciaAluno).where(eq(ocorrenciaAluno.id, id));
      await tx.insert(auditLog).values({
        usuarioId: user.id,
        acao: 'delete',
        tabela: 'ocorrencia_aluno',
        registroId: id,
        dadosAntigos: ocorrenciaData,
        motivo,
      });
    });

    revalidatePath('/secretaria');
    return { success: true };
  } catch (error: any) {
    console.error('Erro ao excluir ocorrência:', error);
    return { success: false, error: error.message };
  }
}

// --- HISTÓRICO ESCOLAR ---

export async function consolidarHistorico(data: {
  alunoId: string;
  anoLetivoId: string;
  serieId: string;
  mediaFinal: number;
  frequenciaFinal: number;
  resultado: string;
  disciplinasNotas: Array<{
    disciplinaId: string;
    disciplinaNome: string;
    mediaFinal: number;
    frequencia: number;
    cargaHoraria: number;
  }>;
  observacoes?: string;
}) {
  try {
    await checkAuth();
    const payload = {
      alunoId: data.alunoId,
      anoLetivoId: data.anoLetivoId,
      serieId: data.serieId,
      mediaFinal: Math.round(data.mediaFinal * 100),
      frequenciaFinal: Math.round(data.frequenciaFinal * 100),
      resultado: data.resultado,
      disciplinasNotas: data.disciplinasNotas,
      observacoes: data.observacoes || null,
    };

    const [novoHistorico] = await db.insert(historicoEscolar).values(payload).returning();
    revalidatePath('/secretaria');
    return { success: true, historico: novoHistorico };
  } catch (error: any) {
    console.error('Erro ao consolidar histórico escolar:', error);
    return { success: false, error: error.message };
  }
}

export async function getHistoricoAluno(alunoId: string) {
  try {
    const data = await db
      .select({
        id: historicoEscolar.id,
        alunoId: historicoEscolar.alunoId,
        anoLetivoId: historicoEscolar.anoLetivoId,
        ano: anoLetivo.ano,
        serieId: historicoEscolar.serieId,
        serieNome: serie.nome,
        mediaFinal: historicoEscolar.mediaFinal,
        frequenciaFinal: historicoEscolar.frequenciaFinal,
        resultado: historicoEscolar.resultado,
        disciplinasNotas: historicoEscolar.disciplinasNotas,
        observacoes: historicoEscolar.observacoes,
      })
      .from(historicoEscolar)
      .innerJoin(anoLetivo, eq(historicoEscolar.anoLetivoId, anoLetivo.id))
      .innerJoin(serie, eq(historicoEscolar.serieId, serie.id))
      .where(eq(historicoEscolar.alunoId, alunoId))
      .orderBy(desc(anoLetivo.ano));

    const formattedData = data.map(item => ({
      ...item,
      mediaFinal: item.mediaFinal / 100,
      frequenciaFinal: item.frequenciaFinal / 100,
    }));

    return { success: true, data: formattedData };
  } catch (error: any) {
    console.error('Erro ao buscar histórico escolar:', error);
    return { success: false, error: error.message };
  }
}

export async function deleteHistorico(id: string, motivo: string) {
  try {
    const user = await checkAuth();
    const [historicoData] = await db.select().from(historicoEscolar).where(eq(historicoEscolar.id, id));
    if (!historicoData) {
      return { success: false, error: 'Histórico não encontrado' };
    }

    await db.transaction(async (tx) => {
      await tx.delete(historicoEscolar).where(eq(historicoEscolar.id, id));
      await tx.insert(auditLog).values({
        usuarioId: user.id,
        acao: 'delete',
        tabela: 'historico_escolar',
        registroId: id,
        dadosAntigos: historicoData,
        motivo,
      });
    });

    revalidatePath('/secretaria');
    return { success: true };
  } catch (error: any) {
    console.error('Erro ao excluir histórico:', error);
    return { success: false, error: error.message };
  }
}


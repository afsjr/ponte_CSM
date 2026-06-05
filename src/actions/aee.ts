'use server';

import { db } from '@/db';
import { 
  pessoa, 
  aeeProntuario, 
  aeePei, 
  aeePeiMeta, 
  aeeAtendimento, 
  aeeDocumento,
  anoLetivo
} from '@/db/schema';
import { eq, desc, and } from 'drizzle-orm';
import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

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

// Retorna todos os alunos que estão marcados com necessidade especial (laudo)
export async function getAlunosAee() {
  await checkAuth();

  const alunos = await db
    .select({
      id: pessoa.id,
      nomeCompleto: pessoa.nomeCompleto,
      cpf: pessoa.cpf,
      dataNascimento: pessoa.dataNascimento,
      situacao: CalcutateSituacao(pessoa.situacao),
    })
    .from(pessoa)
    .where(eq(pessoa.necessidadeEspecial, true))
    .orderBy(pessoa.nomeCompleto);

  return alunos;
}

// Auxiliar para contornar problemas de tipo
function CalcutateSituacao(val: any) {
  return val;
}

// Retorna o prontuário de um aluno específico, ou null se ainda não existir
export async function getProntuarioAee(alunoId: string) {
  await checkAuth();

  const [prontuario] = await db
    .select()
    .from(aeeProntuario)
    .where(eq(aeeProntuario.alunoId, alunoId));

  return prontuario || null;
}

// Cria ou atualiza o prontuário AEE
export async function upsertProntuarioAee(alunoId: string, data: any) {
  await checkAuth();

  const existente = await getProntuarioAee(alunoId);

  if (existente) {
    await db
      .update(aeeProntuario)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(aeeProntuario.id, existente.id));
  } else {
    // Também garante que a flag necessidadeEspecial no aluno seja true
    await db
      .update(pessoa)
      .set({ necessidadeEspecial: true, updatedAt: new Date() })
      .where(eq(pessoa.id, alunoId));

    await db.insert(aeeProntuario).values({
      alunoId,
      ...data,
    });
  }

  revalidatePath('/aee');
  return { success: true };
}

// Marca ou desmarca um aluno como AEE
export async function toggleNecessidadeEspecial(alunoId: string, flag: boolean) {
  await checkAuth();

  await db
    .update(pessoa)
    .set({
      necessidadeEspecial: flag,
      updatedAt: new Date(),
    })
    .where(eq(pessoa.id, alunoId));

  revalidatePath('/aee');
  return { success: true };
}

// --- PEI / PLANO DE DESENVOLVIMENTO INDIVIDUALIZADO ---

export async function getPeiAluno(alunoId: string, anoLetivoId: string) {
  try {
    await checkAuth();

    const [pei] = await db
      .select()
      .from(aeePei)
      .where(and(eq(aeePei.alunoId, alunoId), eq(aeePei.anoLetivoId, anoLetivoId)));

    if (!pei) {
      return { success: true, data: null };
    }

    const metas = await db
      .select()
      .from(aeePeiMeta)
      .where(eq(aeePeiMeta.peiId, pei.id));

    return { success: true, data: { ...pei, metas } };
  } catch (error: any) {
    console.error('Erro ao buscar PEI:', error);
    return { success: false, error: error.message || 'Erro ao buscar PEI' };
  }
}

export async function upsertPei(alunoId: string, anoLetivoId: string, data: {
  objetivosGerais?: string;
  recursosNecessarios?: string;
  adaptacoesLaboratorio?: string;
  dataInicio: string;
  dataFim: string;
}) {
  try {
    await checkAuth();

    const existingPei = await db
      .select()
      .from(aeePei)
      .where(and(eq(aeePei.alunoId, alunoId), eq(aeePei.anoLetivoId, anoLetivoId)));

    let peiId = '';

    const valuesToSave = {
      alunoId,
      anoLetivoId,
      objetivosGerais: data.objetivosGerais || null,
      recursosNecessarios: data.recursosNecessarios || null,
      adaptacoesLaboratorio: data.adaptacoesLaboratorio || null,
      dataInicio: new Date(data.dataInicio),
      dataFim: new Date(data.dataFim),
      updatedAt: new Date(),
    };

    if (existingPei.length > 0) {
      const [updated] = await db
        .update(aeePei)
        .set(valuesToSave)
        .where(eq(aeePei.id, existingPei[0].id))
        .returning({ id: aeePei.id });
      peiId = updated.id;
    } else {
      const [inserted] = await db
        .insert(aeePei)
        .values({
          ...valuesToSave,
          createdAt: new Date(),
        })
        .returning({ id: aeePei.id });
      peiId = inserted.id;
    }

    revalidatePath('/aee');
    return { success: true, id: peiId };
  } catch (error: any) {
    console.error('Erro ao salvar PEI:', error);
    return { success: false, error: error.message || 'Erro ao salvar PEI' };
  }
}

export async function addMetaPei(data: {
  peiId: string;
  area: 'pedagogica' | 'social' | 'motora' | 'tecnica' | 'autonomia';
  descricaoMeta: string;
  estrategiasPedagogicas?: string;
}) {
  try {
    await checkAuth();

    const [meta] = await db
      .insert(aeePeiMeta)
      .values({
        peiId: data.peiId,
        area: data.area,
        descricaoMeta: data.descricaoMeta,
        estrategiasPedagogicas: data.estrategiasPedagogicas || null,
        status: 'nao_iniciado',
      })
      .returning();

    revalidatePath('/aee');
    return { success: true, data: meta };
  } catch (error: any) {
    console.error('Erro ao adicionar meta:', error);
    return { success: false, error: error.message || 'Erro ao adicionar meta' };
  }
}

export async function updateMetaPeiStatus(
  metaId: string, 
  status: 'nao_iniciado' | 'em_progresso' | 'alcancada' | 'nao_alcancada', 
  parecerFinal?: string
) {
  try {
    await checkAuth();

    const [updated] = await db
      .update(aeePeiMeta)
      .set({
        status,
        parecerFinal: parecerFinal || null,
      })
      .where(eq(aeePeiMeta.id, metaId))
      .returning();

    revalidatePath('/aee');
    return { success: true, data: updated };
  } catch (error: any) {
    console.error('Erro ao atualizar meta:', error);
    return { success: false, error: error.message || 'Erro ao atualizar meta' };
  }
}

export async function deleteMetaPei(metaId: string) {
  try {
    await checkAuth();

    await db.delete(aeePeiMeta).where(eq(aeePeiMeta.id, metaId));

    revalidatePath('/aee');
    return { success: true };
  } catch (error: any) {
    console.error('Erro ao remover meta:', error);
    return { success: false, error: error.message || 'Erro ao remover meta' };
  }
}

// --- ATENDIMENTOS DE SALA DE RECURSOS ---

export async function getAtendimentosAluno(alunoId: string) {
  try {
    await checkAuth();

    const atendimentos = await db
      .select({
        id: aeeAtendimento.id,
        alunoId: aeeAtendimento.alunoId,
        profissionalId: aeeAtendimento.profissionalId,
        profissionalNome: pessoa.nomeCompleto,
        dataAtendimento: aeeAtendimento.dataAtendimento,
        duracaoMinutos: aeeAtendimento.duracaoMinutos,
        registroSessao: aeeAtendimento.registroSessao,
        recursosUtilizados: aeeAtendimento.recursosUtilizados,
      })
      .from(aeeAtendimento)
      .innerJoin(pessoa, eq(aeeAtendimento.profissionalId, pessoa.id))
      .where(eq(aeeAtendimento.alunoId, alunoId))
      .orderBy(desc(aeeAtendimento.dataAtendimento));

    return { success: true, data: atendimentos };
  } catch (error: any) {
    console.error('Erro ao buscar atendimentos:', error);
    return { success: false, error: error.message || 'Erro ao buscar atendimentos' };
  }
}

export async function saveAtendimento(data: {
  alunoId: string;
  dataAtendimento: string;
  duracaoMinutos: number;
  registroSessao: string;
  recursosUtilizados?: string;
}) {
  try {
    const user = await checkAuth();

    const [atendimento] = await db
      .insert(aeeAtendimento)
      .values({
        alunoId: data.alunoId,
        profissionalId: user.id,
        dataAtendimento: new Date(data.dataAtendimento),
        duracaoMinutos: data.duracaoMinutos,
        registroSessao: data.registroSessao,
        recursosUtilizados: data.recursosUtilizados || null,
      })
      .returning();

    revalidatePath('/aee');
    return { success: true, data: atendimento };
  } catch (error: any) {
    console.error('Erro ao salvar atendimento:', error);
    return { success: false, error: error.message || 'Erro ao salvar atendimento' };
  }
}

// --- DOCUMENTOS E LAUDOS CLÍNICOS ---

export async function getDocumentosAluno(alunoId: string) {
  try {
    await checkAuth();

    const documentos = await db
      .select()
      .from(aeeDocumento)
      .where(eq(aeeDocumento.alunoId, alunoId))
      .orderBy(desc(aeeDocumento.createdAt));

    return { success: true, data: documentos };
  } catch (error: any) {
    console.error('Erro ao buscar documentos:', error);
    return { success: false, error: error.message || 'Erro ao buscar documentos' };
  }
}

export async function saveDocumento(data: {
  alunoId: string;
  tipoDocumento: string;
  profissionalEmissor: string;
  registroProfissional?: string;
  urlArquivo: string;
  dataEmissao?: string;
}) {
  try {
    await checkAuth();

    const [documento] = await db
      .insert(aeeDocumento)
      .values({
        alunoId: data.alunoId,
        tipoDocumento: data.tipoDocumento,
        profissionalEmissor: data.profissionalEmissor,
        registroProfissional: data.registroProfissional || null,
        urlArquivo: data.urlArquivo,
        dataEmissao: data.dataEmissao ? new Date(data.dataEmissao) : null,
      })
      .returning();

    revalidatePath('/aee');
    return { success: true, data: documento };
  } catch (error: any) {
    console.error('Erro ao salvar documento:', error);
    return { success: false, error: error.message || 'Erro ao salvar documento' };
  }
}

export async function getAnosLetivos() {
  try {
    await checkAuth();
    const anos = await db.select().from(anoLetivo).orderBy(desc(anoLetivo.ano));
    return { success: true, data: anos };
  } catch (error: any) {
    console.error('Erro ao buscar anos letivos:', error);
    return { success: false, error: error.message || 'Erro ao buscar anos letivos' };
  }
}


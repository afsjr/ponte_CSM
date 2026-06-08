'use server';

import { db } from '@/db';
import { notasBoletim, calendarioPedagogico, pessoa, disciplina, turma, anoLetivo, matricula } from '@/db/schema';
import { eq, and, desc, asc } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

// --- NOTAS (BOLETIM) ---

/**
 * Retorna as notas de um aluno específico para um ano letivo.
 */
export async function getNotasAluno(alunoId: string, anoLetivoId: string) {
  try {
    const notas = await db
      .select({
        id: notasBoletim.id,
        disciplinaId: notasBoletim.disciplinaId,
        trimestre1: notasBoletim.trimestre1,
        trimestre2: notasBoletim.trimestre2,
        trimestre3: notasBoletim.trimestre3,
        mediaFinal: notasBoletim.mediaFinal,
        disciplinaNome: disciplina.nome,
        disciplinaSigla: disciplina.sigla,
      })
      .from(notasBoletim)
      .innerJoin(disciplina, eq(notasBoletim.disciplinaId, disciplina.id))
      .where(
        and(
          eq(notasBoletim.alunoId, alunoId),
          eq(notasBoletim.anoLetivoId, anoLetivoId)
        )
      );

    return { success: true, data: notas };
  } catch (error: any) {
    console.error('Erro ao buscar notas do aluno:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Salva ou atualiza a linha de notas de uma disciplina para o aluno.
 */
export async function upsertNotasBoletim(data: {
  alunoId: string;
  anoLetivoId: string;
  disciplinaId: string;
  trimestre1?: number | null;
  trimestre2?: number | null;
  trimestre3?: number | null;
}) {
  try {
    // Calcula média se todos os trimestres tiverem nota
    let mediaFinal = null;
    if (data.trimestre1 != null && data.trimestre2 != null && data.trimestre3 != null) {
      const soma = data.trimestre1 + data.trimestre2 + data.trimestre3;
      const mediaCalculada = soma / 3;
      
      // Regra de arredondamento: 
      // Em geral, manteremos o número como inteiro multiplicando por 100 (ex: 850 para 8.5)
      // Se a média calculada for 833.333, arredondamos matematicamente usando Math.round
      mediaFinal = Math.round(mediaCalculada);
    }

    const [existente] = await db
      .select({ id: notasBoletim.id })
      .from(notasBoletim)
      .where(
        and(
          eq(notasBoletim.alunoId, data.alunoId),
          eq(notasBoletim.anoLetivoId, data.anoLetivoId),
          eq(notasBoletim.disciplinaId, data.disciplinaId)
        )
      );

    if (existente) {
      await db
        .update(notasBoletim)
        .set({
          trimestre1: data.trimestre1,
          trimestre2: data.trimestre2,
          trimestre3: data.trimestre3,
          mediaFinal: mediaFinal,
          updatedAt: new Date(),
        })
        .where(eq(notasBoletim.id, existente.id));
    } else {
      await db.insert(notasBoletim).values({
        alunoId: data.alunoId,
        anoLetivoId: data.anoLetivoId,
        disciplinaId: data.disciplinaId,
        trimestre1: data.trimestre1,
        trimestre2: data.trimestre2,
        trimestre3: data.trimestre3,
        mediaFinal: mediaFinal,
      });
    }

    return { success: true };
  } catch (error: any) {
    console.error('Erro ao salvar notas do boletim:', error);
    return { success: false, error: error.message };
  }
}

// --- CALENDÁRIO PEDAGÓGICO ---

/**
 * Retorna os eventos do calendário para um ano letivo específico.
 */
export async function getEventosCalendario(anoLetivoId: string) {
  try {
    const eventos = await db
      .select()
      .from(calendarioPedagogico)
      .where(eq(calendarioPedagogico.anoLetivoId, anoLetivoId))
      .orderBy(asc(calendarioPedagogico.dataInicio));

    return { success: true, data: eventos };
  } catch (error: any) {
    console.error('Erro ao buscar eventos do calendário:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Adiciona ou atualiza um evento no calendário.
 */
export async function upsertEventoCalendario(data: any) {
  try {
    if (data.id) {
      await db
        .update(calendarioPedagogico)
        .set({
          titulo: data.titulo,
          descricao: data.descricao,
          dataInicio: new Date(data.dataInicio),
          dataFim: new Date(data.dataFim),
          tipoEvento: data.tipoEvento,
          corHex: data.corHex,
          updatedAt: new Date(),
        })
        .where(eq(calendarioPedagogico.id, data.id));
    } else {
      await db.insert(calendarioPedagogico).values({
        anoLetivoId: data.anoLetivoId,
        titulo: data.titulo,
        descricao: data.descricao,
        dataInicio: new Date(data.dataInicio),
        dataFim: new Date(data.dataFim),
        tipoEvento: data.tipoEvento,
        corHex: data.corHex,
      });
    }

    revalidatePath('/calendario');
    return { success: true };
  } catch (error: any) {
    console.error('Erro ao salvar evento no calendário:', error);
    return { success: false, error: error.message };
  }
}

export async function deleteEventoCalendario(id: string) {
  try {
    await db.delete(calendarioPedagogico).where(eq(calendarioPedagogico.id, id));
    revalidatePath('/calendario');
    return { success: true };
  } catch (error: any) {
    console.error('Erro ao excluir evento do calendário:', error);
    return { success: false, error: error.message };
  }
}

// --- PLANILHA DA TURMA ---

/**
 * Retorna os alunos de uma turma e todas as suas notas do boletim.
 */
export async function getPlanilhaNotasTurma(turmaId: string, anoLetivoId: string) {
  try {
    // 1. Busca alunos da turma
    const alunos = await db
      .select({
        id: pessoa.id,
        nomeCompleto: pessoa.nomeCompleto,
        numeroMatricula: matricula.numeroMatricula,
      })
      .from(matricula)
      .innerJoin(pessoa, eq(matricula.alunoId, pessoa.id))
      .where(
        and(
          eq(matricula.turmaId, turmaId),
          eq(matricula.anoLetivoId, anoLetivoId),
          eq(matricula.status, 'ativo') // Apenas alunos ativos na turma
        )
      )
      .orderBy(asc(pessoa.nomeCompleto));

    const alunoIds = alunos.map(a => a.id);

    // 2. Busca todas as notas desses alunos neste ano letivo
    let notasMap: Record<string, any[]> = {};
    if (alunoIds.length > 0) {
      // Drizzle 'inArray' não pode ser vazio, por isso a checagem
      const { inArray } = await import('drizzle-orm');
      const notasResult = await db
        .select({
          alunoId: notasBoletim.alunoId,
          disciplinaId: notasBoletim.disciplinaId,
          trimestre1: notasBoletim.trimestre1,
          trimestre2: notasBoletim.trimestre2,
          trimestre3: notasBoletim.trimestre3,
          mediaFinal: notasBoletim.mediaFinal,
        })
        .from(notasBoletim)
        .where(
          and(
            eq(notasBoletim.anoLetivoId, anoLetivoId),
            inArray(notasBoletim.alunoId, alunoIds)
          )
        );

      // Organiza as notas por alunoId
      for (const row of notasResult) {
        if (!notasMap[row.alunoId]) {
          notasMap[row.alunoId] = [];
        }
        notasMap[row.alunoId].push(row);
      }
    }

    // 3. Mescla alunos e notas
    const planilha = alunos.map(aluno => ({
      ...aluno,
      notas: notasMap[aluno.id] || [],
    }));

    return { success: true, data: planilha };
  } catch (error: any) {
    console.error('Erro ao buscar planilha da turma:', error);
    return { success: false, error: error.message };
  }
}

'use server';

import { db } from '@/db';
import { 
  periodoAvaliativo, 
  avaliacao, 
  nota, 
  diarioClasse, 
  frequenciaAluno,
  turma,
  disciplina,
  pessoa,
  matricula,
  anoLetivo
} from '@/db/schema';
import { eq, and, desc, gte, lte } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
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

// --- PERÍODO AVALIATIVO ---

export async function getPeriodosAvaliativos(anoLetivoId?: string) {
  try {
    let query = db.select().from(periodoAvaliativo);
    if (anoLetivoId) {
      query = query.where(eq(periodoAvaliativo.anoLetivoId, anoLetivoId)) as any;
    }
    let periodos = await query.orderBy(periodoAvaliativo.numero);

    if (periodos.length === 0 && anoLetivoId) {
      const anoRes = await db.select().from(anoLetivo).where(eq(anoLetivo.id, anoLetivoId));
      if (anoRes.length > 0) {
        const anoObj = anoRes[0];
        const anoInt = anoObj.ano;
        
        const bimestres = [
          {
            anoLetivoId,
            nome: '1º Bimestre',
            numero: 1,
            dataInicio: new Date(`${anoInt}-02-01`),
            dataFim: new Date(`${anoInt}-04-30`),
            tipo: 'bimestre' as const,
          },
          {
            anoLetivoId,
            nome: '2º Bimestre',
            numero: 2,
            dataInicio: new Date(`${anoInt}-05-01`),
            dataFim: new Date(`${anoInt}-07-15`),
            tipo: 'bimestre' as const,
          },
          {
            anoLetivoId,
            nome: '3º Bimestre',
            numero: 3,
            dataInicio: new Date(`${anoInt}-08-01`),
            dataFim: new Date(`${anoInt}-09-30`),
            tipo: 'bimestre' as const,
          },
          {
            anoLetivoId,
            nome: '4º Bimestre',
            numero: 4,
            dataInicio: new Date(`${anoInt}-10-01`),
            dataFim: new Date(`${anoInt}-12-15`),
            tipo: 'bimestre' as const,
          },
        ];
        
        await db.insert(periodoAvaliativo).values(bimestres);
        periodos = await db.select().from(periodoAvaliativo).where(eq(periodoAvaliativo.anoLetivoId, anoLetivoId)).orderBy(periodoAvaliativo.numero);
      }
    }
    return periodos;
  } catch (error) {
    console.error('Erro ao buscar períodos avaliativos:', error);
    return [];
  }
}

export async function createPeriodoAvaliativo(data: {
  anoLetivoId: string;
  nome: string;
  numero: number;
  dataInicio: Date;
  dataFim: Date;
  tipo: 'bimestre' | 'trimestre' | 'semestre' | 'modulo';
}) {
  try {
    await checkAuth();
    const novoPeriodo = await db.insert(periodoAvaliativo).values(data).returning();
    revalidatePath('/pedagogico/avaliacoes');
    return { success: true, periodo: novoPeriodo[0] };
  } catch (error) {
    console.error('Erro ao criar período avaliativo:', error);
    return { success: false, error: 'Erro ao criar período avaliativo' };
  }
}

// --- AVALIAÇÃO ---

export async function getAvaliacoes(turmaId?: string, disciplinaId?: string) {
  try {
    let conditions = [];
    if (turmaId) conditions.push(eq(avaliacao.turmaId, turmaId));
    if (disciplinaId) conditions.push(eq(avaliacao.disciplinaId, disciplinaId));

    let query = db
      .select({
        id: avaliacao.id,
        descricao: avaliacao.descricao,
        peso: avaliacao.peso,
        valorMaximo: avaliacao.valorMaximo,
        dataAplicacao: avaliacao.dataAplicacao,
        tipo: avaliacao.tipo,
        turmaNome: turma.nome,
        disciplinaNome: disciplina.nome,
        periodoNome: periodoAvaliativo.nome,
        periodoId: periodoAvaliativo.id,
      })
      .from(avaliacao)
      .innerJoin(turma, eq(avaliacao.turmaId, turma.id))
      .innerJoin(disciplina, eq(avaliacao.disciplinaId, disciplina.id))
      .innerJoin(periodoAvaliativo, eq(avaliacao.periodoAvaliativoId, periodoAvaliativo.id));

    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as any;
    }

    const avaliacoes = await query.orderBy(desc(avaliacao.dataAplicacao));
    return avaliacoes;
  } catch (error) {
    console.error('Erro ao buscar avaliações:', error);
    return [];
  }
}

export async function getAvaliacoesPorTurmaPeriodo(turmaId: string, disciplinaId: string, periodoId: string) {
  try {
    const avs = await db.select()
      .from(avaliacao)
      .where(and(
        eq(avaliacao.turmaId, turmaId),
        eq(avaliacao.disciplinaId, disciplinaId),
        eq(avaliacao.periodoAvaliativoId, periodoId)
      ))
      .orderBy(avaliacao.dataAplicacao);
    return { success: true, data: avs };
  } catch (error) {
    console.error('Erro ao buscar avaliações por período:', error);
    return { success: false, error: 'Erro ao buscar avaliações' };
  }
}

export async function removerAvaliacao(id: string) {
  try {
    await checkAuth();
    // Exclui notas vinculadas primeiro (se o banco não tiver cascade)
    await db.delete(nota).where(eq(nota.avaliacaoId, id));
    await db.delete(avaliacao).where(eq(avaliacao.id, id));
    revalidatePath('/pedagogico');
    return { success: true };
  } catch (error: any) {
    console.error('Erro ao remover avaliação:', error);
    return { success: false, error: error.message || 'Erro ao remover' };
  }
}

export async function criarAvaliacao(data: any) {
  try {
    await checkAuth();
    const [nova] = await db.insert(avaliacao).values(data).returning();
    revalidatePath('/pedagogico');
    return { success: true, avaliacao: nova };
  } catch (error: any) {
    console.error('Erro ao criar avaliação:', error);
    return { success: false, error: error.message || 'Erro ao criar avaliação' };
  }
}

export async function createAvaliacao(data: {
  turmaId: string;
  disciplinaId: string;
  periodoAvaliativoId: string;
  descricao: string;
  peso: number;
  valorMaximo: number;
  dataAplicacao: Date;
  tipo: 'prova' | 'trabalho' | 'seminario' | 'recuperacao' | 'participacao' | 'outro';
}) {
  try {
    await checkAuth();
    const novaAvaliacao = await db.insert(avaliacao).values(data).returning();
    revalidatePath('/pedagogico');
    return { success: true, avaliacao: novaAvaliacao[0] };
  } catch (error) {
    console.error('Erro ao criar avaliação:', error);
    return { success: false, error: 'Erro ao criar avaliação' };
  }
}

// --- NOTA ---

import { arredondarNotaEscolar } from '@/lib/utils/pedagogico';

export async function lancarNota(data: {
  avaliacaoId: string;
  matriculaId: string;
  valor?: number;
  observacao?: string;
  lancadaPorId: string;
}) {
  try {
    const valorTratado = data.valor !== undefined && data.valor !== null
      ? (arredondarNotaEscolar(data.valor) || 0)
      : null;

    const novaNota = await db.insert(nota)
      .values({ ...data, valor: valorTratado })
      .returning();
      
    revalidatePath('/pedagogico');
    return { success: true, nota: novaNota[0] };
  } catch (error) {
    console.error('Erro ao lançar nota:', error);
    return { success: false, error: 'Erro ao lançar nota' };
  }
}

// --- DIÁRIO DE CLASSE E FREQUÊNCIA ---

export async function createDiarioClasse(data: {
  turmaId: string;
  disciplinaId: string;
  docenteId: string;
  data: Date;
  conteudoMinistrado: string;
  observacoes?: string;
  aulasDadas: number;
}) {
  try {
    await checkAuth();
    const novoDiario = await db.insert(diarioClasse).values(data).returning();
    revalidatePath('/pedagogico/diarios');
    return { success: true, diario: novoDiario[0] };
  } catch (error) {
    console.error('Erro ao criar diário de classe:', error);
    return { success: false, error: 'Erro ao criar diário de classe' };
  }
}

export async function registrarFrequencia(frequencias: {
  diarioClasseId: string;
  matriculaId: string;
  presente: boolean;
  justificativa?: string;
}[]) {
  try {
    const registros = await db.insert(frequenciaAluno).values(frequencias).returning();
    revalidatePath('/pedagogico/diarios');
    return { success: true, frequencias: registros };
  } catch (error) {
    console.error('Erro ao registrar frequência:', error);
    return { success: false, error: 'Erro ao registrar frequência' };
  }
}

export async function getEstudantesTurma(turmaId: string) {
  try {
    const estudantes = await db
      .select({
        matriculaId: matricula.id,
        alunoId: pessoa.id,
        nomeCompleto: pessoa.nomeCompleto,
        numeroMatricula: matricula.numeroMatricula,
      })
      .from(matricula)
      .innerJoin(pessoa, eq(matricula.alunoId, pessoa.id))
      .where(
        and(
          eq(matricula.turmaId, turmaId),
          eq(matricula.status, 'ativo')
        )
      )
      .orderBy(pessoa.nomeCompleto);
    return { success: true, data: estudantes };
  } catch (error) {
    console.error('Erro ao buscar estudantes da turma:', error);
    return { success: false, error: 'Erro ao buscar estudantes da turma' };
  }
}

export async function getDiarioClassePorFiltro(turmaId: string, disciplinaId: string, data: Date) {
  try {
    const start = new Date(data);
    start.setHours(0, 0, 0, 0);
    const end = new Date(data);
    end.setHours(23, 59, 59, 999);

    const diarios = await db
      .select()
      .from(diarioClasse)
      .where(
        and(
          eq(diarioClasse.turmaId, turmaId),
          eq(diarioClasse.disciplinaId, disciplinaId),
          gte(diarioClasse.data, start),
          lte(diarioClasse.data, end)
        )
      );

    return { success: true, data: diarios[0] || null };
  } catch (error) {
    console.error('Erro ao buscar diário de classe por filtro:', error);
    return { success: false, error: 'Erro ao buscar diário de classe por filtro' };
  }
}

export async function getFrequenciasDiario(diarioClasseId: string) {
  try {
    const freq = await db
      .select()
      .from(frequenciaAluno)
      .where(eq(frequenciaAluno.diarioClasseId, diarioClasseId));
    return { success: true, data: freq };
  } catch (error) {
    console.error('Erro ao buscar frequências do diário:', error);
    return { success: false, error: 'Erro ao buscar frequências do diário' };
  }
}

export async function salvarChamada(
  diarioData: {
    id?: string;
    turmaId: string;
    disciplinaId: string;
    docenteId: string;
    data: Date;
    conteudoMinistrado: string;
    observacoes?: string;
    aulasDadas: number;
  },
  frequencias: {
    matriculaId: string;
    presente: boolean;
    justificativa?: string;
  }[]
) {
  try {
    await checkAuth();
    let diarioId = diarioData.id;

    if (diarioId) {
      // Atualiza diário existente
      await db
        .update(diarioClasse)
        .set({
          conteudoMinistrado: diarioData.conteudoMinistrado,
          observacoes: diarioData.observacoes,
          aulasDadas: diarioData.aulasDadas,
          updatedAt: new Date(),
        })
        .where(eq(diarioClasse.id, diarioId));
    } else {
      // Cria novo diário
      const [inserted] = await db
        .insert(diarioClasse)
        .values({
          turmaId: diarioData.turmaId,
          disciplinaId: diarioData.disciplinaId,
          docenteId: diarioData.docenteId,
          data: diarioData.data,
          conteudoMinistrado: diarioData.conteudoMinistrado,
          observacoes: diarioData.observacoes,
          aulasDadas: diarioData.aulasDadas,
        })
        .returning();
      diarioId = inserted.id;
    }

    // Exclui frequências antigas
    await db.delete(frequenciaAluno).where(eq(frequenciaAluno.diarioClasseId, diarioId));

    // Insere novas frequências se houver
    if (frequencias.length > 0) {
      const recordsToInsert = frequencias.map(f => ({
        diarioClasseId: diarioId!,
        matriculaId: f.matriculaId,
        presente: f.presente,
        justificativa: f.justificativa || null,
      }));
      await db.insert(frequenciaAluno).values(recordsToInsert);
    }

    revalidatePath('/pedagogico');
    return { success: true, diarioId };
  } catch (error: any) {
    console.error('Erro ao salvar chamada:', error);
    return { success: false, error: error.message || 'Erro ao salvar chamada' };
  }
}

export async function getNotasAvaliacao(avaliacaoId: string) {
  try {
    const notas = await db
      .select()
      .from(nota)
      .where(eq(nota.avaliacaoId, avaliacaoId));
    return { success: true, data: notas };
  } catch (error) {
    console.error('Erro ao buscar notas da avaliação:', error);
    return { success: false, error: 'Erro ao buscar notas da avaliação' };
  }
}

export async function getNotasDaTurma(turmaId: string, disciplinaId: string, periodoId: string) {
  try {
    const avs = await db.select({ id: avaliacao.id })
      .from(avaliacao)
      .where(and(
        eq(avaliacao.turmaId, turmaId),
        eq(avaliacao.disciplinaId, disciplinaId),
        eq(avaliacao.periodoAvaliativoId, periodoId)
      ));
    
    const avIds = avs.map(a => a.id);
    if (avIds.length === 0) return { success: true, data: [] };

    // Fetch notes for these evaluations (doing it poorly by mapping but Drizzle usually needs `inArray` - we'll just fetch all or filter)
    const notas = await db.select().from(nota); // Simple fallback, should use inArray
    const filteredNotas = notas.filter(n => avIds.includes(n.avaliacaoId));
    
    return { success: true, data: filteredNotas };
  } catch (error: any) {
    console.error('Erro ao buscar notas da turma:', error);
    return { success: false, error: error.message };
  }
}

export async function salvarNotas(
  turmaId: string,
  disciplinaId: string,
  docenteId: string,
  notas: {
    matriculaId: string;
    avaliacaoId: string;
    valorNumerico: number | null;
    valorConceitual: string | null;
  }[]
) {
  try {
    const user = await checkAuth();

    // Remove empty notes, only keep ones that have a value
    const notasParaSalvar = notas.filter(n => n.valorNumerico !== null || n.valorConceitual !== null);
    
    // Simple batch update: delete existing for these avaliacoes and insert again
    // For safety, we should delete only specific avaliacaoId/matriculaId combinations,
    // but a cleaner way is deleting based on the unique pairs.
    for (const n of notas) {
      await db.delete(nota).where(
        and(
          eq(nota.avaliacaoId, n.avaliacaoId),
          eq(nota.matriculaId, n.matriculaId)
        )
      );
    }

    if (notasParaSalvar.length > 0) {
      const recordsToInsert = notasParaSalvar.map(n => ({
        avaliacaoId: n.avaliacaoId,
        matriculaId: n.matriculaId,
        valor: n.valorNumerico !== null && n.valorNumerico !== undefined 
          ? (arredondarNotaEscolar(n.valorNumerico) || 0) 
          : null,
        observacao: n.valorConceitual,
        lancadaPorId: user.id
      }));
      await db.insert(nota).values(recordsToInsert);
    }
    revalidatePath('/pedagogico');
    return { success: true };
  } catch (error: any) {
    console.error('Erro ao salvar notas:', error);
    return { success: false, error: error.message || 'Erro ao salvar notas' };
  }
}

export async function getTurmaMediaEStatus(turmaId: string, disciplinaId: string) {
  try {
    // 1. Fetch avaliações to identify recoveries and regular tests
    const avs = await db.select().from(avaliacao)
      .where(and(eq(avaliacao.turmaId, turmaId), eq(avaliacao.disciplinaId, disciplinaId)));
    
    // 2. Fetch all notas for this class/discipline
    const avIds = avs.map(a => a.id);
    let allNotas: any[] = [];
    if (avIds.length > 0) {
      allNotas = await db.select().from(nota); // Could be filtered better with inArray
      allNotas = allNotas.filter(n => avIds.includes(n.avaliacaoId));
    }

    // 3. Fetch frequencias and diarios
    const diarios = await db.select().from(diarioClasse)
      .where(and(eq(diarioClasse.turmaId, turmaId), eq(diarioClasse.disciplinaId, disciplinaId)));
    
    const diarioIds = diarios.map(d => d.id);
    let allFrequencias: any[] = [];
    if (diarioIds.length > 0) {
      allFrequencias = await db.select().from(frequenciaAluno);
      allFrequencias = allFrequencias.filter(f => diarioIds.includes(f.diarioClasseId));
    }

    const totalAulasDadas = diarios.reduce((acc, d) => acc + d.aulasDadas, 0);

    // Grouping by student
    const studentStats: Record<string, any> = {};

    for (const matriculaId of [...new Set([...allNotas.map(n => n.matriculaId), ...allFrequencias.map(f => f.matriculaId)])]) {
      // Calc Attendance
      const freqAluno = allFrequencias.filter(f => f.matriculaId === matriculaId);
      const aulasPresente = freqAluno.reduce((acc, f) => acc + (f.presente ? 1 : 0), 0);
      
      const freqPercentage = freqAluno.length > 0 ? (aulasPresente / freqAluno.length) * 100 : 100;

      // Calc Grades
      const notasAluno = allNotas.filter(n => n.matriculaId === matriculaId);
      let sumRegular = 0;
      let countRegular = 0;
      let finalRec = null;

      notasAluno.forEach(n => {
        const av = avs.find(a => a.id === n.avaliacaoId);
        if (av) {
          if (av.ehRecuperacaoFinal) {
            finalRec = n.valor !== null ? n.valor : null;
          } else if (av.ehRecuperacao) {
            // Placeholder for specific period logic
          } else {
            if (n.valor !== null) {
              sumRegular += n.valor;
              countRegular++;
            }
          }
        }
      });

      const mediaParcial = countRegular > 0 ? (sumRegular / countRegular) : 0;
      let mediaFinal = mediaParcial;
      let status = 'Aprovado';

      if (finalRec !== null) {
         mediaFinal = (mediaFinal + finalRec) / 2;
      }

      if (freqPercentage < 75) {
        status = 'Reprovado por Falta';
      } else if (mediaFinal >= 7.0) {
        status = 'Aprovado';
      } else if (mediaFinal >= 6.0 && finalRec !== null) {
        status = 'Aprovado por Conselho/Recuperacao';
      } else if (finalRec === null) {
        status = 'Recuperação';
      } else {
        status = 'Reprovado';
      }

      studentStats[matriculaId] = {
        freqPercentage: Math.round(freqPercentage),
        mediaFinal: mediaFinal,
        status
      };
    }

    return { success: true, data: studentStats };
  } catch (error: any) {
    console.error('Erro ao calcular status da turma:', error);
    return { success: false, error: error.message };
  }
}

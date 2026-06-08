'use server'

import { db } from '@/db'
import { nivelEnsino, serie, turma, disciplina, turmaDocente, pessoa, pessoaClassificacao, auditLog, sala, gradeCurricular, matricula } from '@/db/schema'
import { eq, desc, asc, count, and } from 'drizzle-orm'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

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

// --- NÍVEL DE ENSINO ---
export async function createNivelEnsino(data: { nome: string; descricao?: string; ordemExibicao?: number }) {
  try {
    await checkAuth();
    const [inserted] = await db.insert(nivelEnsino).values(data).returning({ id: nivelEnsino.id });
    return { success: true, id: inserted.id };
  } catch (error: any) {
    console.error('Erro ao criar Nível de Ensino:', error);
    return { success: false, error: error.message };
  }
}

export async function getNiveisEnsino() {
  try {
    const data = await db.select().from(nivelEnsino).orderBy(asc(nivelEnsino.ordemExibicao));
    return { success: true, data };
  } catch (error: any) {
    console.error('Erro ao buscar Níveis de Ensino:', error);
    return { success: false, error: error.message };
  }
}

export async function updateNivelEnsino(id: string, data: { nome?: string; descricao?: string; ordemExibicao?: number }) {
  try {
    await checkAuth();
    await db.update(nivelEnsino).set({ ...data, updatedAt: new Date() }).where(eq(nivelEnsino.id, id));
    return { success: true };
  } catch (error: any) {
    console.error('Erro ao atualizar Nível de Ensino:', error);
    return { success: false, error: error.message };
  }
}

// --- SÉRIE ---
export async function createSerie(data: { nivelEnsinoId: string; nome: string; ordemExibicao?: number }) {
  try {
    await checkAuth();
    const [inserted] = await db.insert(serie).values(data).returning({ id: serie.id });
    return { success: true, id: inserted.id };
  } catch (error: any) {
    console.error('Erro ao criar Série:', error);
    return { success: false, error: error.message };
  }
}

export async function getSeries(nivelEnsinoId?: string) {
  try {
    let query = db.select().from(serie);
    if (nivelEnsinoId) {
      query = query.where(eq(serie.nivelEnsinoId, nivelEnsinoId)) as any;
    }
    const data = await query.orderBy(asc(serie.ordemExibicao));
    return { success: true, data };
  } catch (error: any) {
    console.error('Erro ao buscar Séries:', error);
    return { success: false, error: error.message };
  }
}

export async function updateSerie(id: string, data: { nivelEnsinoId?: string; nome?: string; ordemExibicao?: number }) {
  try {
    await checkAuth();
    await db.update(serie).set({ ...data, updatedAt: new Date() }).where(eq(serie.id, id));
    return { success: true };
  } catch (error: any) {
    console.error('Erro ao atualizar Série:', error);
    return { success: false, error: error.message };
  }
}

// --- DISCIPLINA ---
export async function createDisciplina(data: { nome: string; sigla?: string; descricao?: string; tipoBase?: 'basica' | 'complementar' | 'tecnica' | 'livre'; formaAvaliacao?: 'numerica' | 'conceitual' | 'mista' | 'sem_avaliacao' }) {
  try {
    await checkAuth();
    const [inserted] = await db.insert(disciplina).values(data as any).returning({ id: disciplina.id });
    return { success: true, id: inserted.id };
  } catch (error: any) {
    console.error('Erro ao criar Disciplina:', error);
    return { success: false, error: error.message };
  }
}

export async function getDisciplinas() {
  try {
    const data = await db.select().from(disciplina).orderBy(asc(disciplina.nome));
    return { success: true, data };
  } catch (error: any) {
    console.error('Erro ao buscar Disciplinas:', error);
    return { success: false, error: error.message };
  }
}

export async function updateDisciplina(id: string, data: { nome?: string; sigla?: string; descricao?: string; tipoBase?: 'basica' | 'complementar' | 'tecnica' | 'livre'; formaAvaliacao?: 'numerica' | 'conceitual' | 'mista' | 'sem_avaliacao' }) {
  try {
    await checkAuth();
    await db.update(disciplina).set({ ...data, updatedAt: new Date() } as any).where(eq(disciplina.id, id));
    return { success: true };
  } catch (error: any) {
    console.error('Erro ao atualizar Disciplina:', error);
    return { success: false, error: error.message };
  }
}

// --- HABILITAÇÃO DO PROFESSOR ---
import { funcionarioHabilitacao, quadroHorario } from '@/db/schema'

export async function addHabilitacaoProfessor(data: { funcionarioId: string; disciplinaId: string }) {
  try {
    await checkAuth();
    const [inserted] = await db.insert(funcionarioHabilitacao).values(data).returning({ id: funcionarioHabilitacao.id });
    return { success: true, id: inserted.id };
  } catch (error: any) {
    console.error('Erro ao adicionar Habilitação:', error);
    return { success: false, error: error.message };
  }
}

export async function getHabilitacoesProfessor(funcionarioId: string) {
  try {
    const data = await db
      .select({
        id: funcionarioHabilitacao.id,
        disciplinaId: funcionarioHabilitacao.disciplinaId,
        disciplinaNome: disciplina.nome,
        tipoBase: disciplina.tipoBase,
      })
      .from(funcionarioHabilitacao)
      .innerJoin(disciplina, eq(funcionarioHabilitacao.disciplinaId, disciplina.id))
      .where(eq(funcionarioHabilitacao.funcionarioId, funcionarioId));
    return { success: true, data };
  } catch (error: any) {
    console.error('Erro ao buscar Habilitações:', error);
    return { success: false, error: error.message };
  }
}

export async function removeHabilitacaoProfessor(id: string) {
  try {
    await checkAuth();
    await db.delete(funcionarioHabilitacao).where(eq(funcionarioHabilitacao.id, id));
    return { success: true };
  } catch (error: any) {
    console.error('Erro ao remover Habilitação:', error);
    return { success: false, error: error.message };
  }
}

// --- QUADRO DE HORÁRIO ---
export async function createQuadroHorario(data: { turmaId: string; disciplinaId: string; diaSemana: 'segunda' | 'terca' | 'quarta' | 'quinta' | 'sexta' | 'sabado' | 'domingo'; quantidadeAulas: number }) {
  try {
    await checkAuth();
    const [inserted] = await db.insert(quadroHorario).values(data).returning({ id: quadroHorario.id });
    return { success: true, id: inserted.id };
  } catch (error: any) {
    console.error('Erro ao criar Quadro de Horário:', error);
    return { success: false, error: error.message };
  }
}

export async function getQuadroHorarioTurma(turmaId: string) {
  try {
    const data = await db
      .select({
        id: quadroHorario.id,
        disciplinaId: quadroHorario.disciplinaId,
        disciplinaNome: disciplina.nome,
        diaSemana: quadroHorario.diaSemana,
        quantidadeAulas: quadroHorario.quantidadeAulas,
      })
      .from(quadroHorario)
      .innerJoin(disciplina, eq(quadroHorario.disciplinaId, disciplina.id))
      .where(eq(quadroHorario.turmaId, turmaId));
    return { success: true, data };
  } catch (error: any) {
    console.error('Erro ao buscar Quadro de Horário:', error);
    return { success: false, error: error.message };
  }
}

export async function removeQuadroHorario(id: string) {
  try {
    await checkAuth();
    await db.delete(quadroHorario).where(eq(quadroHorario.id, id));
    return { success: true };
  } catch (error: any) {
    console.error('Erro ao remover Quadro de Horário:', error);
    return { success: false, error: error.message };
  }
}

// --- TURMA ---
export async function createTurma(data: { 
  nome: string; 
  anoLetivoId: string;
  serieId?: string | null; 
  turno: 'manha' | 'tarde' | 'noite' | 'integral'; 
  capacidadeMaxima?: number; 
  situacao?: 'aberta' | 'em_andamento' | 'encerrada' | 'cancelada';
}) {
  try {
    await checkAuth();
    const [inserted] = await db.insert(turma).values({
      ...data,
      situacao: data.situacao || 'aberta',
      serieId: data.serieId || null,
    }).returning({ id: turma.id });
    return { success: true, id: inserted.id };
  } catch (error: any) {
    console.error('Erro ao criar Turma:', error);
    return { success: false, error: error.message };
  }
}

export async function getTurmas() {
  try {
    const data = await db
      .select({
        id: turma.id,
        nome: turma.nome,
        anoLetivoId: turma.anoLetivoId,
        serieId: turma.serieId,
        turno: turma.turno,
        capacidadeMaxima: turma.capacidadeMaxima,
        situacao: turma.situacao,
        salaId: turma.salaId,
        createdAt: turma.createdAt,
        updatedAt: turma.updatedAt,
        qtdAlunos: count(matricula.id)
      })
      .from(turma)
      .leftJoin(matricula, and(
        eq(turma.id, matricula.turmaId),
        eq(matricula.status, 'ativo')
      ))
      .groupBy(turma.id)
      .orderBy(asc(turma.nome));
      
    return { success: true, data };
  } catch (error: any) {
    console.error('Erro ao buscar Turmas:', error);
    return { success: false, error: error.message };
  }
}

export async function updateTurma(id: string, data: { 
  nome?: string; 
  anoLetivoId?: string;
  serieId?: string | null; 
  turno?: 'manha' | 'tarde' | 'noite' | 'integral'; 
  capacidadeMaxima?: number; 
  situacao?: 'aberta' | 'em_andamento' | 'encerrada' | 'cancelada';
}) {
  try {
    await checkAuth();
    await db.update(turma).set({ ...data, updatedAt: new Date() }).where(eq(turma.id, id));
    return { success: true };
  } catch (error: any) {
    console.error('Erro ao atualizar Turma:', error);
    return { success: false, error: error.message };
  }
}

// --- TURMA DOCENTE ---
export async function alocarProfessorTurma(data: { turmaId: string; disciplinaId: string; funcionarioId: string; titular?: boolean }) {
  try {
    await checkAuth();
    const [inserted] = await db.insert(turmaDocente).values(data).returning({ id: turmaDocente.id });
    return { success: true, id: inserted.id };
  } catch (error: any) {
    console.error('Erro ao alocar Professor na Turma:', error);
    return { success: false, error: error.message };
  }
}

export async function getProfessoresTurma(turmaId: string) {
  try {
    const data = await db
      .select({
        id: turmaDocente.id,
        turmaId: turmaDocente.turmaId,
        titular: turmaDocente.titular,
        disciplina: {
          id: disciplina.id,
          nome: disciplina.nome,
        },
        professor: {
          id: pessoa.id,
          nomeCompleto: pessoa.nomeCompleto,
        }
      })
      .from(turmaDocente)
      .innerJoin(disciplina, eq(turmaDocente.disciplinaId, disciplina.id))
      .innerJoin(pessoa, eq(turmaDocente.funcionarioId, pessoa.id))
      .where(eq(turmaDocente.turmaId, turmaId));

    return { success: true, data };
  } catch (error: any) {
    console.error('Erro ao buscar Professores da Turma:', error);
    return { success: false, error: error.message };
  }
}

export async function removerProfessorTurma(id: string) {
  try {
    await checkAuth();
    await db.delete(turmaDocente).where(eq(turmaDocente.id, id));
    return { success: true };
  } catch (error: any) {
    console.error('Erro ao remover Professor da Turma:', error);
    return { success: false, error: error.message };
  }
}

export async function getTodosProfessores() {
  try {
    const data = await db
      .select({
        id: pessoa.id,
        nomeCompleto: pessoa.nomeCompleto,
      })
      .from(pessoa)
      .innerJoin(pessoaClassificacao, eq(pessoa.id, pessoaClassificacao.pessoaId))
      .where(eq(pessoaClassificacao.tipo, 'funcionario'))
      .orderBy(asc(pessoa.nomeCompleto));

    return { success: true, data };
  } catch (error: any) {
    console.error('Erro ao buscar Professores:', error);
    return { success: false, error: error.message };
  }
}

// --- EXCLUSÕES AUDITADAS (PEDAGÓGICO) ---

export async function deleteTurma(id: string, motivo: string) {
  try {
    const user = await checkAuth();
    const [t] = await db.select().from(turma).where(eq(turma.id, id));
    if (!t) {
      return { success: false, error: 'Turma não encontrada' };
    }
    
    await db.transaction(async (tx) => {
      await tx.delete(turma).where(eq(turma.id, id));
      await tx.insert(auditLog).values({
        usuarioId: user.id === '00000000-0000-0000-0000-000000000000' ? null : user.id,
        acao: 'delete',
        tabela: 'turma',
        registroId: id,
        dadosAntigos: t,
        motivo,
      });
    });
    
    return { success: true };
  } catch (error: any) {
    console.error('Erro ao excluir turma:', error);
    return { success: false, error: 'Não é possível excluir esta turma. Verifique se existem alunos matriculados ou professores alocados.' };
  }
}

export async function deleteDisciplina(id: string, motivo: string) {
  try {
    const user = await checkAuth();
    const [d] = await db.select().from(disciplina).where(eq(disciplina.id, id));
    if (!d) {
      return { success: false, error: 'Disciplina não encontrada' };
    }
    
    await db.transaction(async (tx) => {
      await tx.delete(disciplina).where(eq(disciplina.id, id));
      await tx.insert(auditLog).values({
        usuarioId: user.id === '00000000-0000-0000-0000-000000000000' ? null : user.id,
        acao: 'delete',
        tabela: 'disciplina',
        registroId: id,
        dadosAntigos: d,
        motivo,
      });
    });
    
    return { success: true };
  } catch (error: any) {
    console.error('Erro ao excluir disciplina:', error);
    return { success: false, error: 'Não é possível excluir esta disciplina devido a restrições de integridade.' };
  }
}

// --- SALAS ---
export async function createSala(data: { nome: string; capacidade: number; localizacao?: string; observacoes?: string }) {
  try {
    await checkAuth();
    const [inserted] = await db.insert(sala).values(data).returning({ id: sala.id });
    revalidatePath('/pedagogico');
    return { success: true, id: inserted.id };
  } catch (error: any) {
    console.error('Erro ao criar Sala:', error);
    return { success: false, error: error.message };
  }
}

export async function getSalas() {
  try {
    const data = await db.select().from(sala).orderBy(asc(sala.nome));
    return { success: true, data };
  } catch (error: any) {
    console.error('Erro ao buscar Salas:', error);
    return { success: false, error: error.message };
  }
}

export async function updateSala(id: string, data: { nome?: string; capacidade?: number; localizacao?: string; observacoes?: string }) {
  try {
    await checkAuth();
    await db.update(sala).set({ ...data, updatedAt: new Date() }).where(eq(sala.id, id));
    revalidatePath('/pedagogico');
    return { success: true };
  } catch (error: any) {
    console.error('Erro ao atualizar Sala:', error);
    return { success: false, error: error.message };
  }
}

export async function deleteSala(id: string, motivo: string) {
  try {
    const user = await checkAuth();
    const [s] = await db.select().from(sala).where(eq(sala.id, id));
    if (!s) {
      return { success: false, error: 'Sala não encontrada' };
    }
    
    await db.transaction(async (tx) => {
      await tx.delete(sala).where(eq(sala.id, id));
      await tx.insert(auditLog).values({
        usuarioId: user.id === '00000000-0000-0000-0000-000000000000' ? null : user.id,
        acao: 'delete',
        tabela: 'sala',
        registroId: id,
        dadosAntigos: s,
        motivo,
      });
    });
    
    revalidatePath('/pedagogico');
    return { success: true };
  } catch (error: any) {
    console.error('Erro ao excluir sala:', error);
    return { success: false, error: 'Não é possível excluir esta sala. Verifique se há turmas vinculadas a ela.' };
  }
}

// --- GRADE CURRICULAR ---
export async function createGradeCurricular(data: { serieId: string; disciplinaId: string; cargaHorariaSemanal?: number; aulasPorSemana?: number }) {
  try {
    await checkAuth();
    const [inserted] = await db.insert(gradeCurricular).values(data).returning({ id: gradeCurricular.id });
    revalidatePath('/pedagogico');
    return { success: true, id: inserted.id };
  } catch (error: any) {
    console.error('Erro ao criar Grade Curricular:', error);
    return { success: false, error: error.message };
  }
}

export async function getGradeCurricular(serieId?: string) {
  try {
    const query = db
      .select({
        id: gradeCurricular.id,
        serieId: gradeCurricular.serieId,
        disciplinaId: gradeCurricular.disciplinaId,
        cargaHorariaSemanal: gradeCurricular.cargaHorariaSemanal,
        aulasPorSemana: gradeCurricular.aulasPorSemana,
        disciplinaNome: disciplina.nome,
        disciplinaSigla: disciplina.sigla,
        tipoBase: disciplina.tipoBase,
        formaAvaliacao: disciplina.formaAvaliacao,
      })
      .from(gradeCurricular)
      .innerJoin(disciplina, eq(gradeCurricular.disciplinaId, disciplina.id));
      
    if (serieId) {
      query.where(eq(gradeCurricular.serieId, serieId));
    }
    
    const data = await query.orderBy(asc(disciplina.nome));
    return { success: true, data };
  } catch (error: any) {
    console.error('Erro ao buscar Grade Curricular:', error);
    return { success: false, error: error.message };
  }
}

export async function updateGradeCurricular(id: string, data: { cargaHorariaSemanal?: number; aulasPorSemana?: number }) {
  try {
    await checkAuth();
    await db.update(gradeCurricular).set({ ...data, updatedAt: new Date() }).where(eq(gradeCurricular.id, id));
    revalidatePath('/pedagogico');
    return { success: true };
  } catch (error: any) {
    console.error('Erro ao atualizar Grade Curricular:', error);
    return { success: false, error: error.message };
  }
}

export async function deleteGradeCurricular(id: string, motivo: string) {
  try {
    const user = await checkAuth();
    const [gc] = await db.select().from(gradeCurricular).where(eq(gradeCurricular.id, id));
    if (!gc) {
      return { success: false, error: 'Item de grade curricular não encontrado' };
    }
    
    await db.transaction(async (tx) => {
      await tx.delete(gradeCurricular).where(eq(gradeCurricular.id, id));
      await tx.insert(auditLog).values({
        usuarioId: user.id === '00000000-0000-0000-0000-000000000000' ? null : user.id,
        acao: 'delete',
        tabela: 'grade_curricular',
        registroId: id,
        dadosAntigos: gc,
        motivo,
      });
    });
    
    revalidatePath('/pedagogico');
    return { success: true };
  } catch (error: any) {
    console.error('Erro ao excluir item de grade curricular:', error);
    return { success: false, error: error.message };
  }
}

export async function getAlunosMatriculadosTurma(turmaId: string) {
  try {
    const alunos = await db
      .select({
        alunoId: pessoa.id,
        nomeCompleto: pessoa.nomeCompleto,
        cpf: pessoa.cpf,
        matriculaId: matricula.id,
        numeroMatricula: matricula.numeroMatricula,
        status: matricula.status,
      })
      .from(matricula)
      .innerJoin(pessoa, eq(matricula.alunoId, pessoa.id))
      .where(and(eq(matricula.turmaId, turmaId), eq(matricula.status, 'ativo')))
      .orderBy(pessoa.nomeCompleto);

    return { success: true, data: alunos };
  } catch (error: any) {
    console.error('Erro ao buscar alunos da turma:', error);
    return { success: false, error: error.message };
  }
}


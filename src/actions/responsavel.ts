'use server';

import { db } from '@/db';
import { 
  vinculoResponsavelAluno, 
  muralAviso, 
  avisoCiente, 
  pessoa, 
  pessoaClassificacao,
  matricula,
  turma,
  serie,
  diarioClasse,
  quadroHorario,
  disciplina,
  nota,
  frequenciaAluno,
  ocorrenciaAluno,
  periodoAvaliativo,
  auditLog,
  avaliacao
} from '@/db/schema';
import { eq, and, desc, inArray } from 'drizzle-orm';
import { alias } from 'drizzle-orm/pg-core';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';

// Alias para evitar colisões nos joins de pessoa
const pessoaAluno = alias(pessoa, 'pessoa_aluno');

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

export async function getResponsaveisList() {
  try {
    await checkAuth();
    const responsaveis = await db
      .select({
        id: pessoa.id,
        nomeCompleto: pessoa.nomeCompleto,
        cpf: pessoa.cpf,
      })
      .from(pessoa)
      .innerJoin(pessoaClassificacao, and(
        eq(pessoaClassificacao.pessoaId, pessoa.id),
        eq(pessoaClassificacao.tipo, 'responsavel')
      ))
      .orderBy(pessoa.nomeCompleto);

    return responsaveis;
  } catch (error) {
    console.error('Erro ao buscar lista de responsáveis:', error);
    return [];
  }
}

// --- GESTÃO DE VÍNCULOS (SECRETARIA) ---

export async function vincularResponsavel(data: {
  responsavelId: string;
  alunoId: string;
  grauParentesco: string;
  responsavelFinanceiro: boolean;
  autorizadoRetirada: boolean;
}) {
  try {
    await checkAuth();
    
    // Validar se as pessoas existem e têm as classificações corretas
    const respClass = await db.select()
      .from(pessoaClassificacao)
      .where(and(eq(pessoaClassificacao.pessoaId, data.responsavelId), eq(pessoaClassificacao.tipo, 'responsavel')));
    if (respClass.length === 0) {
      throw new Error('Pessoa selecionada não possui a classificação de Responsável');
    }
    
    const alunoClass = await db.select()
      .from(pessoaClassificacao)
      .where(and(eq(pessoaClassificacao.pessoaId, data.alunoId), eq(pessoaClassificacao.tipo, 'aluno')));
    if (alunoClass.length === 0) {
      throw new Error('Pessoa selecionada não possui a classificação de Aluno');
    }

    const [vinculo] = await db.insert(vinculoResponsavelAluno)
      .values({
        responsavelId: data.responsavelId,
        alunoId: data.alunoId,
        grauParentesco: data.grauParentesco,
        responsavelFinanceiro: data.responsavelFinanceiro,
        autorizadoRetirada: data.autorizadoRetirada,
      })
      .returning();

    revalidatePath('/secretaria');
    return { success: true, data: vinculo };
  } catch (error: any) {
    console.error('Erro ao vincular responsável:', error);
    return { success: false, error: error.message || 'Erro ao vincular responsável' };
  }
}

export async function getVinculosAluno(alunoId: string) {
  try {
    const vinculos = await db
      .select({
        id: vinculoResponsavelAluno.id,
        responsavelId: vinculoResponsavelAluno.responsavelId,
        alunoId: vinculoResponsavelAluno.alunoId,
        grauParentesco: vinculoResponsavelAluno.grauParentesco,
        responsavelFinanceiro: vinculoResponsavelAluno.responsavelFinanceiro,
        autorizadoRetirada: vinculoResponsavelAluno.autorizadoRetirada,
        nomeResponsavel: pessoa.nomeCompleto,
        cpfResponsavel: pessoa.cpf,
      })
      .from(vinculoResponsavelAluno)
      .innerJoin(pessoa, eq(vinculoResponsavelAluno.responsavelId, pessoa.id))
      .where(eq(vinculoResponsavelAluno.alunoId, alunoId));

    return { success: true, data: vinculos };
  } catch (error: any) {
    console.error('Erro ao buscar vínculos do aluno:', error);
    return { success: false, error: error.message || 'Erro ao buscar vínculos' };
  }
}

export async function removerVinculo(vinculoId: string, justificativa: string) {
  try {
    const user = await checkAuth();
    if (!justificativa || justificativa.trim() === '') {
      throw new Error('Justificativa de auditoria é obrigatória');
    }

    const [vinculoExistente] = await db.select()
      .from(vinculoResponsavelAluno)
      .where(eq(vinculoResponsavelAluno.id, vinculoId));

    if (!vinculoExistente) {
      throw new Error('Vínculo não encontrado');
    }

    await db.transaction(async (tx) => {
      // Exclui o vínculo
      await tx.delete(vinculoResponsavelAluno).where(eq(vinculoResponsavelAluno.id, vinculoId));

      // Salva no log de auditoria
      await tx.insert(auditLog).values({
        usuarioId: user.id === '00000000-0000-0000-0000-000000000000' ? null : user.id,
        acao: 'delete',
        tabela: 'vinculo_responsavel_aluno',
        registroId: vinculoId,
        dadosAntigos: vinculoExistente,
        motivo: justificativa,
      });
    });

    revalidatePath('/secretaria');
    return { success: true };
  } catch (error: any) {
    console.error('Erro ao remover vínculo:', error);
    return { success: false, error: error.message || 'Erro ao remover vínculo' };
  }
}

// --- GESTÃO DO MURAL (SECRETARIA) ---

export async function createAviso(data: {
  titulo: string;
  conteudo: string;
  destinatarioTipo: 'geral' | 'turma' | 'serie' | 'individual';
  turmaId?: string;
  serieId?: string;
  alunoId?: string;
}) {
  try {
    const user = await checkAuth();
    
    // Sanitização de links para mitigar injeção/invasão (como solicitado)
    const sanitizarTexto = (txt: string) => {
      let cleaned = txt.replace(/https?:\/\/[^\s]+/g, '[conteúdo restrito]');
      cleaned = cleaned.replace(/www\.[^\s]+/g, '[conteúdo restrito]');
      return cleaned;
    };

    const tituloSanitizado = sanitizarTexto(data.titulo);
    const conteudoSanitizado = sanitizarTexto(data.conteudo);

    const [aviso] = await db.insert(muralAviso)
      .values({
        titulo: tituloSanitizado,
        conteudo: conteudoSanitizado,
        destinatarioTipo: data.destinatarioTipo,
        turmaId: data.turmaId || null,
        serieId: data.serieId || null,
        alunoId: data.alunoId || null,
        criadoPorId: user.id,
      })
      .returning();

    revalidatePath('/secretaria');
    revalidatePath('/responsavel');
    return { success: true, data: aviso };
  } catch (error: any) {
    console.error('Erro ao criar aviso:', error);
    return { success: false, error: error.message || 'Erro ao criar aviso' };
  }
}

export async function getAvisosAdmin() {
  try {
    await checkAuth();
    const avisos = await db
      .select({
        id: muralAviso.id,
        titulo: muralAviso.titulo,
        conteudo: muralAviso.conteudo,
        dataPublicacao: muralAviso.dataPublicacao,
        destinatarioTipo: muralAviso.destinatarioTipo,
        turmaId: muralAviso.turmaId,
        serieId: muralAviso.serieId,
        alunoId: muralAviso.alunoId,
        criadoPorNome: pessoa.nomeCompleto,
        turmaNome: turma.nome,
        serieNome: serie.nome,
        alunoNome: pessoaAluno.nomeCompleto,
      })
      .from(muralAviso)
      .innerJoin(pessoa, eq(muralAviso.criadoPorId, pessoa.id))
      .leftJoin(turma, eq(muralAviso.turmaId, turma.id))
      .leftJoin(serie, eq(muralAviso.serieId, serie.id))
      .leftJoin(pessoaAluno, eq(muralAviso.alunoId, pessoaAluno.id))
      .orderBy(desc(muralAviso.dataPublicacao));

    return { success: true, data: avisos };
  } catch (error: any) {
    console.error('Erro ao buscar avisos (admin):', error);
    return { success: false, error: error.message || 'Erro ao buscar avisos' };
  }
}

export async function deleteAviso(avisoId: string, justificativa: string) {
  try {
    const user = await checkAuth();
    if (!justificativa || justificativa.trim() === '') {
      throw new Error('Justificativa de auditoria é obrigatória');
    }

    const [avisoExistente] = await db.select()
      .from(muralAviso)
      .where(eq(muralAviso.id, avisoId));

    if (!avisoExistente) {
      throw new Error('Aviso não encontrado');
    }

    await db.transaction(async (tx) => {
      // Exclui cientes vinculados primeiro
      await tx.delete(avisoCiente).where(eq(avisoCiente.avisoId, avisoId));
      
      // Exclui o aviso
      await tx.delete(muralAviso).where(eq(muralAviso.id, avisoId));

      // Salva no log de auditoria
      await tx.insert(auditLog).values({
        usuarioId: user.id === '00000000-0000-0000-0000-000000000000' ? null : user.id,
        acao: 'delete',
        tabela: 'mural_aviso',
        registroId: avisoId,
        dadosAntigos: avisoExistente,
        motivo: justificativa,
      });
    });

    revalidatePath('/secretaria');
    revalidatePath('/responsavel');
    return { success: true };
  } catch (error: any) {
    console.error('Erro ao excluir aviso:', error);
    return { success: false, error: error.message || 'Erro ao excluir aviso' };
  }
}

export async function getAvisoEstatisticas(avisoId: string) {
  try {
    await checkAuth();

    // Busca os cientes vinculando nome do responsável e do aluno
    const cientes = await db
      .select({
        id: avisoCiente.id,
        cienteEm: avisoCiente.cienteEm,
        responsavelNome: pessoa.nomeCompleto,
        alunoNome: pessoaAluno.nomeCompleto,
      })
      .from(avisoCiente)
      .innerJoin(pessoa, eq(avisoCiente.responsavelId, pessoa.id))
      .innerJoin(pessoaAluno, eq(avisoCiente.alunoId, pessoaAluno.id))
      .where(eq(avisoCiente.avisoId, avisoId));

    return { success: true, data: cientes };
  } catch (error: any) {
    console.error('Erro ao buscar estatísticas do aviso:', error);
    return { success: false, error: error.message || 'Erro ao buscar estatísticas' };
  }
}

// --- PORTAL DO RESPONSÁVEL (CONSULTA) ---

export async function getFilhosVinculados(responsavelId: string) {
  try {
    const filhos = await db
      .select({
        vinculoId: vinculoResponsavelAluno.id,
        grauParentesco: vinculoResponsavelAluno.grauParentesco,
        responsavelFinanceiro: vinculoResponsavelAluno.responsavelFinanceiro,
        autorizadoRetirada: vinculoResponsavelAluno.autorizadoRetirada,
        alunoId: pessoa.id,
        nomeCompleto: pessoa.nomeCompleto,
        cpf: pessoa.cpf,
        ra: matricula.numeroMatricula,
        turmaId: turma.id,
        turmaNome: turma.nome,
        serieNome: serie.nome,
        anoLetivoId: matricula.anoLetivoId,
        matriculaId: matricula.id,
      })
      .from(vinculoResponsavelAluno)
      .innerJoin(pessoa, eq(vinculoResponsavelAluno.alunoId, pessoa.id))
      .leftJoin(matricula, and(eq(matricula.alunoId, pessoa.id), eq(matricula.status, 'ativo')))
      .leftJoin(turma, eq(matricula.turmaId, turma.id))
      .leftJoin(serie, eq(turma.serieId, serie.id))
      .where(eq(vinculoResponsavelAluno.responsavelId, responsavelId));

    return { success: true, data: filhos };
  } catch (error: any) {
    console.error('Erro ao buscar filhos vinculados:', error);
    return { success: false, error: error.message || 'Erro ao buscar filhos vinculados' };
  }
}

export async function getBoletimEHorarioFilho(alunoId: string, matriculaId: string, turmaId: string) {
  try {
    // 1. Ocorrências
    const ocorrencias = await db
      .select()
      .from(ocorrenciaAluno)
      .where(eq(ocorrenciaAluno.alunoId, alunoId))
      .orderBy(desc(ocorrenciaAluno.data));

    // 2. Quadro de horários
    const horários = await db
      .select({
        id: quadroHorario.id,
        diaSemana: quadroHorario.diaSemana,
        quantidadeAulas: quadroHorario.quantidadeAulas,
        disciplinaNome: disciplina.nome,
        disciplinaSigla: disciplina.sigla,
      })
      .from(quadroHorario)
      .innerJoin(disciplina, eq(quadroHorario.disciplinaId, disciplina.id))
      .where(eq(quadroHorario.turmaId, turmaId));

    // 3. Notas e frequências
    const avs = await db.select({
      id: avaliacao.id,
      descricao: avaliacao.descricao,
      peso: avaliacao.peso,
      disciplinaId: avaliacao.disciplinaId,
      disciplinaNome: disciplina.nome,
      periodoId: avaliacao.periodoAvaliativoId,
      periodoNome: periodoAvaliativo.nome,
      ehRecuperacao: avaliacao.ehRecuperacao,
      ehRecuperacaoFinal: avaliacao.ehRecuperacaoFinal,
    })
    .from(avaliacao)
    .innerJoin(disciplina, eq(avaliacao.disciplinaId, disciplina.id))
    .innerJoin(periodoAvaliativo, eq(avaliacao.periodoAvaliativoId, periodoAvaliativo.id))
    .where(eq(avaliacao.turmaId, turmaId));

    const avIds = avs.map(a => a.id);
    let notas: any[] = [];
    if (avIds.length > 0) {
      notas = await db.select().from(nota).where(eq(nota.matriculaId, matriculaId));
      notas = notas.filter(n => avIds.includes(n.avaliacaoId));
    }

    const diarios = await db.select().from(diarioClasse).where(eq(diarioClasse.turmaId, turmaId));
    const diarioIds = diarios.map(d => d.id);
    let frequencias: any[] = [];
    if (diarioIds.length > 0) {
      frequencias = await db.select().from(frequenciaAluno).where(eq(frequenciaAluno.matriculaId, matriculaId));
      frequencias = frequencias.filter(f => diarioIds.includes(f.diarioClasseId));
    }

    const disciplinasSet = new Set(avs.map(a => a.disciplinaId));
    const boletim: any[] = [];

    for (const discId of disciplinasSet) {
      const avsDisc = avs.filter(a => a.disciplinaId === discId);
      const notasDisc = notas.filter(n => avsDisc.map(a => a.id).includes(n.avaliacaoId));
      const discNome = avsDisc[0]?.disciplinaNome || 'Disciplina';

      const diariosDisc = diarios.filter(d => d.disciplinaId === discId);
      const freqDisc = frequencias.filter(f => diariosDisc.map(d => d.id).includes(f.diarioClasseId));
      const totalFaltas = freqDisc.filter(f => !f.presente).length;
      const totalAulas = freqDisc.length;
      const presencaPerc = totalAulas > 0 ? Math.round(((totalAulas - totalFaltas) / totalAulas) * 100) : 100;

      const periodosMap: Record<string, any> = {};
      avsDisc.forEach(av => {
        const n = notasDisc.find(n => n.avaliacaoId === av.id);
        if (n && n.valor !== null) {
          if (!periodosMap[av.periodoNome]) {
            periodosMap[av.periodoNome] = { soma: 0, qtd: 0 };
          }
          periodosMap[av.periodoNome].soma += n.valor;
          periodosMap[av.periodoNome].qtd += 1;
        }
      });

      const mediasPeriodo = Object.keys(periodosMap).map(periodoNome => {
        const p = periodosMap[periodoNome];
        return {
          periodo: periodoNome,
          media: Math.round((p.soma / p.qtd) * 10) / 10
        };
      });

      const mediaFinal = mediasPeriodo.length > 0 
        ? Math.round((mediasPeriodo.reduce((acc, m) => acc + m.media, 0) / mediasPeriodo.length) * 10) / 10 
        : null;

      boletim.push({
        disciplinaId: discId,
        disciplinaNome: discNome,
        mediasPeriodo,
        mediaFinal,
        totalFaltas,
        presencaPerc
      });
    }

    return {
      success: true,
      data: {
        ocorrencias,
        horarios: horários,
        boletim
      }
    };
  } catch (error: any) {
    console.error('Erro ao buscar boletim do filho:', error);
    return { success: false, error: error.message || 'Erro ao carregar dados pedagógicos' };
  }
}

export async function getMuralAvisosResponsavel(responsavelId: string, alunoId: string) {
  try {
    // 1. Achar a turma e a série atual do aluno
    const [mat] = await db
      .select({
        turmaId: matricula.turmaId,
        anoLetivoId: matricula.anoLetivoId,
        serieId: turma.serieId,
      })
      .from(matricula)
      .innerJoin(turma, eq(matricula.turmaId, turma.id))
      .where(and(eq(matricula.alunoId, alunoId), eq(matricula.status, 'ativo')));

    if (!mat) {
      // Se o aluno não estiver matriculado em turma ativa, apenas busca avisos gerais
      const avisosGerais = await db
        .select({
          id: muralAviso.id,
          titulo: muralAviso.titulo,
          conteudo: muralAviso.conteudo,
          dataPublicacao: muralAviso.dataPublicacao,
          destinatarioTipo: muralAviso.destinatarioTipo,
        })
        .from(muralAviso)
        .where(eq(muralAviso.destinatarioTipo, 'geral'))
        .orderBy(desc(muralAviso.dataPublicacao));

      const cientes = await db
        .select()
        .from(avisoCiente)
        .where(and(eq(avisoCiente.responsavelId, responsavelId), eq(avisoCiente.alunoId, alunoId)));

      const cientesIds = cientes.map(c => c.avisoId);

      const data = avisosGerais.map(av => ({
        ...av,
        ciente: cientesIds.includes(av.id),
        cienteEm: cientes.find(c => c.avisoId === av.id)?.cienteEm || null,
      }));

      return { success: true, data };
    }

    // 2. Busca avisos
    const avisos = await db
      .select({
        id: muralAviso.id,
        titulo: muralAviso.titulo,
        conteudo: muralAviso.conteudo,
        dataPublicacao: muralAviso.dataPublicacao,
        destinatarioTipo: muralAviso.destinatarioTipo,
        turmaId: muralAviso.turmaId,
        serieId: muralAviso.serieId,
        alunoId: muralAviso.alunoId,
      })
      .from(muralAviso)
      .where(
        inArray(muralAviso.destinatarioTipo, ['geral', 'turma', 'serie', 'individual'])
      )
      .orderBy(desc(muralAviso.dataPublicacao));

    // Filtra no código para evitar queries complexas
    const avisosFiltrados = avisos.filter(av => {
      if (av.destinatarioTipo === 'geral') return true;
      if (av.destinatarioTipo === 'turma' && av.turmaId === mat.turmaId) return true;
      if (av.destinatarioTipo === 'serie' && av.serieId === mat.serieId) return true;
      if (av.destinatarioTipo === 'individual' && av.alunoId === alunoId) return true;
      return false;
    });

    // 3. Busca cientes
    const cientes = await db
      .select()
      .from(avisoCiente)
      .where(and(eq(avisoCiente.responsavelId, responsavelId), eq(avisoCiente.alunoId, alunoId)));

    const cientesIds = cientes.map(c => c.avisoId);

    const data = avisosFiltrados.map(av => ({
      ...av,
      ciente: cientesIds.includes(av.id),
      cienteEm: cientes.find(c => c.avisoId === av.id)?.cienteEm || null,
    }));

    return { success: true, data };
  } catch (error: any) {
    console.error('Erro ao buscar avisos para responsável:', error);
    return { success: false, error: error.message || 'Erro ao carregar mural de avisos' };
  }
}

export async function marcarCienteAviso(avisoId: string, responsavelId: string, alunoId: string) {
  try {
    await checkAuth();

    // Evita duplicados
    const [existente] = await db
      .select()
      .from(avisoCiente)
      .where(
        and(
          eq(avisoCiente.avisoId, avisoId),
          eq(avisoCiente.responsavelId, responsavelId),
          eq(avisoCiente.alunoId, alunoId)
        )
      );

    if (existente) {
      return { success: true, data: existente };
    }

    const [ciente] = await db
      .insert(avisoCiente)
      .values({
        avisoId,
        responsavelId,
        alunoId,
      })
      .returning();

    revalidatePath('/responsavel');
    revalidatePath('/secretaria');
    return { success: true, data: ciente };
  } catch (error: any) {
    console.error('Erro ao marcar ciente:', error);
    return { success: false, error: error.message || 'Erro ao marcar ciente' };
  }
}

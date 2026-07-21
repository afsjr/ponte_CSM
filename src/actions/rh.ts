'use server';

import { db } from '@/db';
import { 
  pessoa, 
  rhDossieColaborador, 
  rhDocumentoColaborador, 
  rhFerias, 
  rhOcorrenciaFuncional,
  auditLog
} from '@/db/schema';
import { eq, desc } from 'drizzle-orm';
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

// --- DOSSIÊ DO COLABORADOR ---
export async function getColaboradoresRh() {
  await checkAuth();

  return await db
    .select({
      pessoaId: pessoa.id,
      nomeCompleto: pessoa.nomeCompleto,
      cpf: pessoa.cpf,
      rg: pessoa.rg,
      genero: pessoa.genero,
      situacao: pessoa.situacao,
      cargo: rhDossieColaborador.cargo,
      salarioBase: rhDossieColaborador.salarioBase,
      jornadaSemanalHoras: rhDossieColaborador.jornadaSemanalHoras,
      dataAdmissao: rhDossieColaborador.dataAdmissao,
      dossieId: rhDossieColaborador.id,
    })
    .from(pessoa)
    .leftJoin(rhDossieColaborador, eq(pessoa.id, rhDossieColaborador.pessoaId))
    .orderBy(pessoa.nomeCompleto);
}

export async function getDossieColaborador(pessoaId: string) {
  await checkAuth();

  const [dadosPessoa] = await db.select().from(pessoa).where(eq(pessoa.id, pessoaId));
  if (!dadosPessoa) throw new Error('Pessoa não encontrada');

  const [dossie] = await db.select().from(rhDossieColaborador).where(eq(rhDossieColaborador.pessoaId, pessoaId));

  return {
    pessoa: dadosPessoa,
    dossie: dossie || null,
  };
}

export async function upsertDossieColaborador(data: {
  pessoaId: string;
  cargo: string;
  salarioBaseCentavos: number;
  jornadaSemanalHoras?: number;
  dadosBancarios?: any;
  dataAdmissao: Date;
}) {
  await checkAuth();

  const [existente] = await db.select().from(rhDossieColaborador).where(eq(rhDossieColaborador.pessoaId, data.pessoaId));

  let resultado;

  if (existente) {
    [resultado] = await db.update(rhDossieColaborador)
      .set({
        cargo: data.cargo,
        salarioBase: data.salarioBaseCentavos,
        jornadaSemanalHoras: data.jornadaSemanalHoras ?? 40,
        dadosBancarios: data.dadosBancarios || null,
        dataAdmissao: data.dataAdmissao,
        updatedAt: new Date(),
      })
      .where(eq(rhDossieColaborador.id, existente.id))
      .returning();

    await db.insert(auditLog).values({
      tabela: 'rh_dossie_colaborador',
      acao: 'update',
      registroId: existente.id,
      dadosAntigos: existente,
    });
  } else {
    [resultado] = await db.insert(rhDossieColaborador)
      .values({
        pessoaId: data.pessoaId,
        cargo: data.cargo,
        salarioBase: data.salarioBaseCentavos,
        jornadaSemanalHoras: data.jornadaSemanalHoras ?? 40,
        dadosBancarios: data.dadosBancarios || null,
        dataAdmissao: data.dataAdmissao,
      })
      .returning();

    await db.insert(auditLog).values({
      tabela: 'rh_dossie_colaborador',
      acao: 'insert',
      registroId: resultado.id,
    });
  }

  revalidatePath('/rh');
  return resultado;
}

// --- DOCUMENTOS DIGITAIS DO COLABORADOR ---
export async function getDocumentosColaborador(pessoaId: string) {
  await checkAuth();
  return await db.select().from(rhDocumentoColaborador).where(eq(rhDocumentoColaborador.pessoaId, pessoaId)).orderBy(desc(rhDocumentoColaborador.createdAt));
}

export async function saveDocumentoColaborador(data: {
  pessoaId: string;
  tipoDocumento: string;
  urlStorage: string;
  dataValidade?: Date;
}) {
  await checkAuth();

  const [novo] = await db.insert(rhDocumentoColaborador).values({
    pessoaId: data.pessoaId,
    tipoDocumento: data.tipoDocumento,
    urlStorage: data.urlStorage,
    dataValidade: data.dataValidade || null,
  }).returning();

  await db.insert(auditLog).values({
    tabela: 'rh_documento_colaborador',
    acao: 'insert',
    registroId: novo.id,
  });

  revalidatePath('/rh');
  return novo;
}

// --- FÉRIIAS DO COLABORADOR ---
export async function getFeriasColaborador(pessoaId: string) {
  await checkAuth();
  return await db.select().from(rhFerias).where(eq(rhFerias.pessoaId, pessoaId)).orderBy(desc(rhFerias.periodoAquisitivoInicio));
}

export async function saveFeriasColaborador(data: {
  pessoaId: string;
  periodoAquisitivoInicio: Date;
  periodoAquisitivoFim: Date;
  dataInicioGozo: Date;
  dataFimGozo: Date;
  status?: 'programada' | 'em_gozo' | 'concluida' | 'cancelada';
}) {
  await checkAuth();

  const [novo] = await db.insert(rhFerias).values({
    pessoaId: data.pessoaId,
    periodoAquisitivoInicio: data.periodoAquisitivoInicio,
    periodoAquisitivoFim: data.periodoAquisitivoFim,
    dataInicioGozo: data.dataInicioGozo,
    dataFimGozo: data.dataFimGozo,
    status: data.status || 'programada',
  }).returning();

  await db.insert(auditLog).values({
    tabela: 'rh_ferias',
    acao: 'insert',
    registroId: novo.id,
  });

  revalidatePath('/rh');
  return novo;
}

// --- OCORRÊNCIAS FUNCIONAIS E HISTÓRICO ---
export async function getOcorrenciasColaborador(pessoaId: string) {
  await checkAuth();
  return await db
    .select({
      id: rhOcorrenciaFuncional.id,
      tipo: rhOcorrenciaFuncional.tipo,
      descricao: rhOcorrenciaFuncional.descricao,
      valorImpacto: rhOcorrenciaFuncional.valorImpacto,
      registradoPorId: rhOcorrenciaFuncional.registradoPorId,
      createdAt: rhOcorrenciaFuncional.createdAt,
    })
    .from(rhOcorrenciaFuncional)
    .where(eq(rhOcorrenciaFuncional.pessoaId, pessoaId))
    .orderBy(desc(rhOcorrenciaFuncional.createdAt));
}

export async function saveOcorrenciaColaborador(data: {
  pessoaId: string;
  tipo: 'advertencia_verbal' | 'advertencia_escrita' | 'suspensao' | 'promocao' | 'gratificacao' | 'elogio';
  descricao: string;
  valorImpactoCentavos?: number;
}) {
  await checkAuth();

  const [novo] = await db.insert(rhOcorrenciaFuncional).values({
    pessoaId: data.pessoaId,
    tipo: data.tipo,
    descricao: data.descricao,
    valorImpacto: data.valorImpactoCentavos || null,
  }).returning();

  await db.insert(auditLog).values({
    tabela: 'rh_ocorrencia_funcional',
    acao: 'insert',
    registroId: novo.id,
  });

  revalidatePath('/rh');
  return novo;
}

// --- RELATÓRIO DE FOLHA DE PAGAMENTO ---
export async function getFolhaPagamentoRelatorio() {
  await checkAuth();

  const colaboradores = await getColaboradoresRh();
  
  return colaboradores.map(c => ({
    pessoaId: c.pessoaId,
    nomeCompleto: c.nomeCompleto,
    cpf: c.cpf,
    cargo: c.cargo || 'Não informado',
    salarioBaseCentavos: c.salarioBase || 0,
    dataAdmissao: c.dataAdmissao,
  }));
}

'use server';

import { db } from '@/db';
import { 
  planoContas, 
  centroCusto, 
  tituloFinanceiro, 
  pessoa,
  auditLog
} from '@/db/schema';
import { eq, desc, and, gte, lte } from 'drizzle-orm';
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

// --- PLANO DE CONTAS ---
export async function getPlanoContas() {
  await checkAuth();
  return await db.select().from(planoContas).orderBy(planoContas.codigo);
}

export async function createPlanoConta(data: { codigo: string; descricao: string; tipo: 'receita' | 'despesa' }) {
  await checkAuth();
  
  const [novo] = await db.insert(planoContas).values({
    codigo: data.codigo,
    descricao: data.descricao,
    tipo: data.tipo,
  }).returning();

  await db.insert(auditLog).values({
    tabela: 'plano_contas',
    acao: 'insert',
    registroId: novo.id,
  });

  revalidatePath('/financeiro');
  return novo;
}

// --- CENTROS DE CUSTO ---
export async function getCentrosCusto() {
  await checkAuth();
  return await db.select().from(centroCusto).orderBy(centroCusto.nome);
}

export async function createCentroCusto(data: { nome: string; descricao?: string }) {
  await checkAuth();
  
  const [novo] = await db.insert(centroCusto).values({
    nome: data.nome,
    descricao: data.descricao || null,
  }).returning();

  await db.insert(auditLog).values({
    tabela: 'centro_custo',
    acao: 'insert',
    registroId: novo.id,
  });

  revalidatePath('/financeiro');
  return novo;
}

// --- TÍTULOS FINANCEIROS (CONTAS A PAGAR / RECEBER) ---
export async function getTitulosFinanceiros(filters?: { tipo?: 'receita' | 'despesa'; status?: 'pendente' | 'pago' | 'recebido' | 'atrasado' | 'cancelado'; centroCustoId?: string }) {
  await checkAuth();
  
  const conditions = [];
  if (filters?.tipo) conditions.push(eq(tituloFinanceiro.tipo, filters.tipo));
  if (filters?.status) conditions.push(eq(tituloFinanceiro.status, filters.status));
  if (filters?.centroCustoId) conditions.push(eq(tituloFinanceiro.centroCustoId, filters.centroCustoId));

  const query = db
    .select({
      id: tituloFinanceiro.id,
      tipo: tituloFinanceiro.tipo,
      descricao: tituloFinanceiro.descricao,
      valorOriginal: tituloFinanceiro.valorOriginal,
      valorPago: tituloFinanceiro.valorPago,
      dataVencimento: tituloFinanceiro.dataVencimento,
      dataPagamento: tituloFinanceiro.dataPagamento,
      status: tituloFinanceiro.status,
      formaPagamento: tituloFinanceiro.formaPagamento,
      pessoaId: tituloFinanceiro.pessoaId,
      pessoaNome: pessoa.nomeCompleto,
      planoContaId: tituloFinanceiro.planoContaId,
      planoContaDescricao: planoContas.descricao,
      centroCustoId: tituloFinanceiro.centroCustoId,
      centroCustoNome: centroCusto.nome,
      createdAt: tituloFinanceiro.createdAt,
    })
    .from(tituloFinanceiro)
    .leftJoin(pessoa, eq(tituloFinanceiro.pessoaId, pessoa.id))
    .leftJoin(planoContas, eq(tituloFinanceiro.planoContaId, planoContas.id))
    .leftJoin(centroCusto, eq(tituloFinanceiro.centroCustoId, centroCusto.id));

  if (conditions.length > 0) {
    return await query.where(and(...conditions)).orderBy(desc(tituloFinanceiro.dataVencimento));
  }

  return await query.orderBy(desc(tituloFinanceiro.dataVencimento));
}

export async function createTituloFinanceiro(data: {
  tipo: 'receita' | 'despesa';
  descricao: string;
  pessoaId?: string;
  planoContaId?: string;
  centroCustoId?: string;
  valorOriginalCentavos: number;
  dataVencimento: Date;
}) {
  await checkAuth();

  const [novo] = await db.insert(tituloFinanceiro).values({
    tipo: data.tipo,
    descricao: data.descricao,
    pessoaId: data.pessoaId || null,
    planoContaId: data.planoContaId || null,
    centroCustoId: data.centroCustoId || null,
    valorOriginal: data.valorOriginalCentavos,
    valorPago: 0,
    dataVencimento: data.dataVencimento,
    status: 'pendente',
  }).returning();

  await db.insert(auditLog).values({
    tabela: 'titulo_financeiro',
    acao: 'insert',
    registroId: novo.id,
  });

  revalidatePath('/financeiro');
  return novo;
}

export async function baixarTituloFinanceiro(id: string, data: {
  valorPagoCentavos: number;
  dataPagamento: Date;
  formaPagamento: string;
}) {
  await checkAuth();

  const [tituloAtual] = await db.select().from(tituloFinanceiro).where(eq(tituloFinanceiro.id, id));
  if (!tituloAtual) throw new Error('Título não encontrado');

  const novoStatus = tituloAtual.tipo === 'receita' ? 'recebido' : 'pago';

  const [atualizado] = await db.update(tituloFinanceiro)
    .set({
      valorPago: data.valorPagoCentavos,
      dataPagamento: data.dataPagamento,
      formaPagamento: data.formaPagamento,
      status: novoStatus,
      updatedAt: new Date(),
    })
    .where(eq(tituloFinanceiro.id, id))
    .returning();

  await db.insert(auditLog).values({
    tabela: 'titulo_financeiro',
    acao: 'update',
    registroId: id,
    dadosAntigos: tituloAtual,
  });

  revalidatePath('/financeiro');
  return atualizado;
}

// --- DRE & CALENDÁRIO DE ALERTAS ---
export async function getDreRelatorio(centroCustoId?: string) {
  await checkAuth();

  const titulos = await db.select().from(tituloFinanceiro);
  
  let totalReceitasCentavos = 0;
  let totalDespesasCentavos = 0;

  for (const t of titulos) {
    if (centroCustoId && t.centroCustoId !== centroCustoId) continue;

    if (t.tipo === 'receita') {
      totalReceitasCentavos += t.valorOriginal;
    } else if (t.tipo === 'despesa') {
      totalDespesasCentavos += t.valorOriginal;
    }
  }

  const resultadoLiquidoCentavos = totalReceitasCentavos - totalDespesasCentavos;
  const margemPercentual = totalReceitasCentavos > 0 
    ? (resultadoLiquidoCentavos / totalReceitasCentavos) * 100 
    : 0;

  return {
    totalReceitasCentavos,
    totalDespesasCentavos,
    resultadoLiquidoCentavos,
    margemPercentual: parseFloat(margemPercentual.toFixed(2)),
  };
}

export async function getAlertasCalendarioFinanceiro() {
  await checkAuth();

  const hoje = new Date();
  const em7Dias = new Date();
  em7Dias.setDate(hoje.getDate() + 7);

  const titulosAproximando = await db
    .select()
    .from(tituloFinanceiro)
    .where(
      and(
        eq(tituloFinanceiro.status, 'pendente'),
        gte(tituloFinanceiro.dataVencimento, hoje),
        lte(tituloFinanceiro.dataVencimento, em7Dias)
      )
    )
    .orderBy(tituloFinanceiro.dataVencimento);

  const titulosAtrasados = await db
    .select()
    .from(tituloFinanceiro)
    .where(
      and(
        eq(tituloFinanceiro.status, 'pendente'),
        lte(tituloFinanceiro.dataVencimento, hoje)
      )
    )
    .orderBy(tituloFinanceiro.dataVencimento);

  return {
    proximos7Dias: titulosAproximando,
    atrasados: titulosAtrasados,
  };
}

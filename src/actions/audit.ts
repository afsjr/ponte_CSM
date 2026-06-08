'use server'

import { db } from '@/db';
import { auditLog } from '@/db/schema';

export type LogAuditParams = {
  usuarioId?: string;
  acao: 'insert' | 'update' | 'delete';
  tabela: string;
  registroId: string;
  dadosAntigos?: any;
  motivo?: string;
};

export function getAuditUserId(id: string | null | undefined): string | null {
  if (!id || id === '00000000-0000-0000-0000-000000000000') {
    return null;
  }
  return id;
}

/**
 * Registra uma entrada na tabela de log de auditoria.
 * Projetado para ser imutável (sem exclusão ou modificação dos registros de log).
 */
export async function logAudit(params: LogAuditParams) {
  try {
    await db.insert(auditLog).values({
      usuarioId: getAuditUserId(params.usuarioId),
      acao: params.acao,
      tabela: params.tabela,
      registroId: params.registroId,
      dadosAntigos: params.dadosAntigos || null,
      motivo: params.motivo || null,
    });
    return { success: true };
  } catch (error: any) {
    console.error('Erro ao registrar log de auditoria:', error);
    return { success: false, error: error.message };
  }
}

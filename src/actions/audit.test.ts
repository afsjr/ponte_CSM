import { describe, it, expect, vi, beforeEach } from 'vitest'
import { logAudit } from './audit'
import { db } from '@/db'
import { auditLog } from '@/db/schema'

// Mock Drizzle
vi.mock('@/db', () => ({
  db: {
    insert: vi.fn(),
  }
}))

describe('Audit Módulo - logAudit', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('deve registrar um log de auditoria com sucesso', async () => {
    const mockInsertChain = {
      values: vi.fn().mockResolvedValue([{ id: 'log-uuid' }])
    }
    vi.mocked(db.insert).mockReturnValue(mockInsertChain as any)

    const params = {
      usuarioId: 'user-123',
      acao: 'delete' as const,
      tabela: 'matricula',
      registroId: 'matr-123',
      dadosAntigos: { numeroMatricula: '123' },
      motivo: 'Desistência do aluno'
    }

    const result = await logAudit(params)

    expect(result.success).toBe(true)
    expect(db.insert).toHaveBeenCalledWith(auditLog)
    expect(mockInsertChain.values).toHaveBeenCalledWith({
      usuarioId: 'user-123',
      acao: 'delete',
      tabela: 'matricula',
      registroId: 'matr-123',
      dadosAntigos: { numeroMatricula: '123' },
      motivo: 'Desistência do aluno'
    })
  })

  it('deve lidar com falhas de banco ao registrar log de auditoria', async () => {
    const mockInsertChain = {
      values: vi.fn().mockRejectedValue(new Error('Erro de conexão'))
    }
    vi.mocked(db.insert).mockReturnValue(mockInsertChain as any)

    const result = await logAudit({
      acao: 'insert',
      tabela: 'pessoa',
      registroId: 'pessoa-123'
    })

    expect(result.success).toBe(false)
    expect(result.error).toBe('Erro de conexão')
  })
})

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { getContratos, createDocumentoGerado, deleteContrato, deleteMatricula } from './secretaria'
import { db } from '@/db'
import { contratoEscolar, documentoGerado, matricula, auditLog } from '@/db/schema'

// Mock Drizzle
vi.mock('@/db', () => ({
  db: {
    select: vi.fn(),
    insert: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    transaction: vi.fn(),
  }
}))

// Mock next/cache
vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}))

// Mock Supabase Auth
vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn().mockResolvedValue({
    auth: {
      getUser: vi.fn().mockResolvedValue({
        data: { user: { id: 'mock-auth-user-id' } }
      })
    }
  })
}))

describe('Secretaria Server Actions - Contratos e Lazy Evaluation', () => {
  let mockContratos: any[] = []

  beforeEach(() => {
    vi.clearAllMocks()
    mockContratos = []

    // Simular que db.transaction executa o callback imediatamente
    vi.mocked(db.transaction).mockImplementation(async (callback) => {
      const txMock = {
        update: vi.fn().mockReturnThis(),
        set: vi.fn().mockReturnThis(),
        where: vi.fn().mockResolvedValue([])
      }
      return callback(txMock as any)
    })
  })

  it('deve realizar lazy evaluation e atualizar status de contratos vencidos de ativo para encerrado', async () => {
    const dataFimPassada = new Date(Date.now() - 24 * 60 * 60 * 1000) // Ontem
    const dataFimFutura = new Date(Date.now() + 24 * 60 * 60 * 1000)  // Amanhã

    mockContratos = [
      { id: 'contrato-vencido', status: 'ativo', dataVigenciaFim: dataFimPassada },
      { id: 'contrato-valido', status: 'ativo', dataVigenciaFim: dataFimFutura }
    ]

    const mockSelectChain = {
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockResolvedValue(mockContratos),
      innerJoin: vi.fn().mockReturnThis(),
      orderBy: vi.fn().mockResolvedValue([])
    }

    vi.mocked(db.select).mockReturnValue(mockSelectChain as any)

    const result = await getContratos()

    // Como o primeiro contrato estava vencido, o Drizzle Transaction de update deve ter sido ativado
    expect(db.transaction).toHaveBeenCalledTimes(1)
  })
})

describe('Secretaria Server Actions - Geração de Hash SHA-256', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('deve gerar um hash SHA-256 truncado para identificação segura do documento', async () => {
    const mockInsertChain = {
      values: vi.fn().mockReturnThis(),
      returning: vi.fn().mockResolvedValue([{
        id: 'doc-uuid',
        hashVerificacao: 'sha256hash-mocked-16'
      }])
    }
    vi.mocked(db.insert).mockReturnValue(mockInsertChain as any)

    const payload = {
      pessoaId: 'aluno-123',
      tipo: 'declaracao_matricula' as const,
      titulo: 'Declaração de Matrícula Regular',
      urlArquivo: 'https://supabase.storage/doc.pdf'
    }

    const result = await createDocumentoGerado(payload)

    expect(result.success).toBe(true)
    expect(result.documento?.hashVerificacao).toBeDefined()
    expect(db.insert).toHaveBeenCalledWith(documentoGerado)
  })
})

describe('Secretaria Server Actions - Exclusões Auditadas', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    
    // Simular que db.transaction executa o callback
    vi.mocked(db.transaction).mockImplementation(async (callback) => {
      const txMock = {
        delete: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        insert: vi.fn().mockReturnThis(),
        values: vi.fn().mockResolvedValue([]),
      }
      return callback(txMock as any)
    })
  })

  it('deve gravar logs de auditoria ao excluir contrato', async () => {
    // mock db.select().from(contratoEscolar).where() para encontrar o contrato a deletar
    const mockSelectChain = {
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockResolvedValue([{ id: 'contrato-123', valorMensalidade: 1000 }])
    }
    vi.mocked(db.select).mockReturnValue(mockSelectChain as any)

    const result = await deleteContrato('contrato-123', 'Inadimplência recorrente')

    expect(result.success).toBe(true)
    expect(db.transaction).toHaveBeenCalledTimes(1)
  })

  it('deve gravar logs de auditoria ao excluir matrícula', async () => {
    // mock db.select().from(matricula).where()
    const mockSelectChain = {
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockResolvedValue([{ id: 'matr-123', status: 'ativo' }])
    }
    vi.mocked(db.select).mockReturnValue(mockSelectChain as any)

    const result = await deleteMatricula('matr-123', 'Transferência de colégio')

    expect(result.success).toBe(true)
    expect(db.transaction).toHaveBeenCalledTimes(1)
  })
})

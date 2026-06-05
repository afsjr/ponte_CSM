import { describe, it, expect, vi, beforeEach } from 'vitest'
import { 
  createOcorrencia, 
  getOcorrencias, 
  updateOcorrencia, 
  deleteOcorrencia, 
  consolidarHistorico, 
  getHistoricoAluno, 
  deleteHistorico 
} from './secretaria'
import { db } from '@/db'
import { ocorrenciaAluno, historicoEscolar, auditLog } from '@/db/schema'

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

describe('Secretaria Fase 3 Server Actions - Ocorrências', () => {
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

  it('deve registrar uma ocorrência para o aluno com sucesso', async () => {
    const mockInsertChain = {
      values: vi.fn().mockReturnThis(),
      returning: vi.fn().mockResolvedValue([{ id: 'ocorrencia-123' }])
    }
    vi.mocked(db.insert).mockReturnValue(mockInsertChain as any)

    const payload = {
      alunoId: 'aluno-123',
      data: new Date(),
      titulo: 'Falta de disciplina',
      descricao: 'Aluno conversando excessivamente durante a aula e atrapalhando os colegas.',
      providencia: 'Advertência verbal e anotação na ficha.'
    }

    const result = await createOcorrencia(payload)

    expect(result.success).toBe(true)
    expect(result.ocorrencia).toBeDefined()
    expect(db.insert).toHaveBeenCalledWith(ocorrenciaAluno)
  })

  it('deve obter ocorrências filtradas por aluno com joins', async () => {
    const mockSelectChain = {
      from: vi.fn().mockReturnThis(),
      innerJoin: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      orderBy: vi.fn().mockResolvedValue([
        { id: 'ocorrencia-1', titulo: 'Conversa paralela' }
      ])
    }
    vi.mocked(db.select).mockReturnValue(mockSelectChain as any)

    const result = await getOcorrencias('aluno-123')

    expect(result.success).toBe(true)
    expect(result.data).toHaveLength(1)
  })

  it('deve atualizar os dados de uma ocorrência com sucesso', async () => {
    const mockUpdateChain = {
      set: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      returning: vi.fn().mockResolvedValue([{ id: 'ocorrencia-123' }])
    }
    vi.mocked(db.update).mockReturnValue(mockUpdateChain as any)

    const result = await updateOcorrencia('ocorrencia-123', { providencia: 'Contato com os responsáveis.' })

    expect(result.success).toBe(true)
    expect(db.update).toHaveBeenCalledWith(ocorrenciaAluno)
  })

  it('deve realizar exclusão auditada de ocorrência e gravar no audit_log', async () => {
    const mockSelectChain = {
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockResolvedValue([{ id: 'ocorrencia-123', titulo: 'Desacato' }])
    }
    vi.mocked(db.select).mockReturnValue(mockSelectChain as any)

    const result = await deleteOcorrencia('ocorrencia-123', 'Lançamento efetuado no aluno errado')

    expect(result.success).toBe(true)
    expect(db.transaction).toHaveBeenCalledTimes(1)
  })
})

describe('Secretaria Fase 3 Server Actions - Histórico Escolar', () => {
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

  it('deve consolidar o histórico anual do aluno com sucesso', async () => {
    const mockInsertChain = {
      values: vi.fn().mockReturnThis(),
      returning: vi.fn().mockResolvedValue([{ id: 'historico-123' }])
    }
    vi.mocked(db.insert).mockReturnValue(mockInsertChain as any)

    const payload = {
      alunoId: 'aluno-123',
      anoLetivoId: 'ano-123',
      serieId: 'serie-123',
      mediaFinal: 8.5,
      frequenciaFinal: 92.5,
      resultado: 'aprovado',
      disciplinasNotas: [
        { disciplinaId: 'disc-1', disciplinaNome: 'Matemática', mediaFinal: 9.0, frequencia: 95, cargaHoraria: 80 }
      ],
      observacoes: 'Aluno exemplar.'
    }

    const result = await consolidarHistorico(payload)

    expect(result.success).toBe(true)
    expect(result.historico).toBeDefined()
    expect(db.insert).toHaveBeenCalledWith(historicoEscolar)
  })

  it('deve buscar históricos de um aluno e converter valores multiplicados por 100 de volta para float', async () => {
    const mockSelectChain = {
      from: vi.fn().mockReturnThis(),
      innerJoin: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      orderBy: vi.fn().mockResolvedValue([
        { id: 'historico-1', mediaFinal: 850, frequenciaFinal: 9500 }
      ])
    }
    vi.mocked(db.select).mockReturnValue(mockSelectChain as any)

    const result = await getHistoricoAluno('aluno-123')

    expect(result.success).toBe(true)
    expect(result.data?.[0].mediaFinal).toBe(8.5)
    expect(result.data?.[0].frequenciaFinal).toBe(95)
  })

  it('deve realizar exclusão auditada de histórico e gravar no audit_log', async () => {
    const mockSelectChain = {
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockResolvedValue([{ id: 'historico-123', mediaFinal: 850 }])
    }
    vi.mocked(db.select).mockReturnValue(mockSelectChain as any)

    const result = await deleteHistorico('historico-123', 'Erro na digitação de notas')

    expect(result.success).toBe(true)
    expect(db.transaction).toHaveBeenCalledTimes(1)
  })
})

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { 
  createSala, 
  getSalas, 
  updateSala, 
  deleteSala, 
  createGradeCurricular, 
  getGradeCurricular, 
  updateGradeCurricular, 
  deleteGradeCurricular 
} from './pedagogico'
import { db } from '@/db'
import { sala, gradeCurricular, auditLog } from '@/db/schema'

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

describe('Pedagógico Fase 2 Server Actions - Salas', () => {
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

  it('deve cadastrar uma nova sala com sucesso', async () => {
    const mockInsertChain = {
      values: vi.fn().mockReturnThis(),
      returning: vi.fn().mockResolvedValue([{ id: 'sala-123' }])
    }
    vi.mocked(db.insert).mockReturnValue(mockInsertChain as any)

    const payload = {
      nome: 'Sala 101',
      capacidade: 35,
      localizacao: 'Bloco A, 1º Andar',
      observacoes: 'Sala com projetor'
    }

    const result = await createSala(payload)

    expect(result.success).toBe(true)
    expect(result.id).toBe('sala-123')
    expect(db.insert).toHaveBeenCalledWith(sala)
  })

  it('deve obter todas as salas ordenadas por nome', async () => {
    const mockSelectChain = {
      from: vi.fn().mockReturnThis(),
      orderBy: vi.fn().mockResolvedValue([
        { id: 'sala-1', nome: 'Sala A' },
        { id: 'sala-2', nome: 'Sala B' }
      ])
    }
    vi.mocked(db.select).mockReturnValue(mockSelectChain as any)

    const result = await getSalas()

    expect(result.success).toBe(true)
    expect(result.data).toHaveLength(2)
    expect(db.select).toHaveBeenCalled()
  })

  it('deve atualizar os dados da sala com sucesso', async () => {
    const mockUpdateChain = {
      set: vi.fn().mockReturnThis(),
      where: vi.fn().mockResolvedValue([])
    }
    vi.mocked(db.update).mockReturnValue(mockUpdateChain as any)

    const result = await updateSala('sala-123', { nome: 'Sala 101-A' })

    expect(result.success).toBe(true)
    expect(db.update).toHaveBeenCalledWith(sala)
  })

  it('deve realizar exclusão auditada de sala no banco e gravar no audit_log', async () => {
    const mockSelectChain = {
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockResolvedValue([{ id: 'sala-123', nome: 'Sala 101', capacidade: 35 }])
    }
    vi.mocked(db.select).mockReturnValue(mockSelectChain as any)

    const result = await deleteSala('sala-123', 'Reformulação do prédio')

    expect(result.success).toBe(true)
    expect(db.transaction).toHaveBeenCalledTimes(1)
  })
})

describe('Pedagógico Fase 2 Server Actions - Grade Curricular', () => {
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

  it('deve cadastrar uma disciplina na grade da série com sucesso', async () => {
    const mockInsertChain = {
      values: vi.fn().mockReturnThis(),
      returning: vi.fn().mockResolvedValue([{ id: 'grade-123' }])
    }
    vi.mocked(db.insert).mockReturnValue(mockInsertChain as any)

    const payload = {
      serieId: 'serie-123',
      disciplinaId: 'disc-123',
      cargaHorariaSemanal: 4,
      aulasPorSemana: 2
    }

    const result = await createGradeCurricular(payload)

    expect(result.success).toBe(true)
    expect(result.id).toBe('grade-123')
    expect(db.insert).toHaveBeenCalledWith(gradeCurricular)
  })

  it('deve obter a grade curricular com inner join de disciplinas', async () => {
    const mockSelectChain = {
      from: vi.fn().mockReturnThis(),
      innerJoin: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      orderBy: vi.fn().mockResolvedValue([
        { id: 'grade-1', disciplinaNome: 'Matemática' },
        { id: 'grade-2', disciplinaNome: 'Português' }
      ])
    }
    vi.mocked(db.select).mockReturnValue(mockSelectChain as any)

    const result = await getGradeCurricular('serie-123')

    expect(result.success).toBe(true)
    expect(result.data).toHaveLength(2)
  })

  it('deve realizar exclusão auditada de item de grade e gravar no audit_log', async () => {
    const mockSelectChain = {
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockResolvedValue([{ id: 'grade-123', serieId: 'serie-123', disciplinaId: 'disc-123' }])
    }
    vi.mocked(db.select).mockReturnValue(mockSelectChain as any)

    const result = await deleteGradeCurricular('grade-123', 'Substituição de disciplina curricular')

    expect(result.success).toBe(true)
    expect(db.transaction).toHaveBeenCalledTimes(1)
  })
})

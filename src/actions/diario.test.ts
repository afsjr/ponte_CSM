import { describe, it, expect, vi, beforeEach } from 'vitest'
import { getTurmaMediaEStatus, salvarNotas } from './diario'
import { db } from '@/db'
import { avaliacao, nota, diarioClasse, frequenciaAluno } from '@/db/schema'

// Mock Drizzle
vi.mock('@/db', () => ({
  db: {
    select: vi.fn(),
    insert: vi.fn(),
    delete: vi.fn(),
  }
}))

// Mock Supabase
vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn().mockResolvedValue({
    auth: {
      getUser: vi.fn().mockResolvedValue({
        data: { user: { id: 'mock-user-uuid' } }
      })
    }
  })
}))

describe('Diário de Classe Server Actions - getTurmaMediaEStatus', () => {
  let mockAvaliacoesList: any[] = []
  let mockNotasList: any[] = []
  let mockDiariosList: any[] = []
  let mockFrequenciasList: any[] = []

  beforeEach(() => {
    vi.clearAllMocks()
    mockAvaliacoesList = []
    mockNotasList = []
    mockDiariosList = []
    mockFrequenciasList = []

    vi.mocked(db.select).mockImplementation(() => {
      return {
        from: vi.fn().mockImplementation((table) => {
          const getChain = (val: any) => {
            const chain: any = {
              where: vi.fn().mockImplementation(() => {
                const subChain: any = {
                  orderBy: vi.fn().mockResolvedValue(val)
                }
                subChain.then = (onfulfilled: any) => Promise.resolve(val).then(onfulfilled)
                return subChain
              }),
              orderBy: vi.fn().mockImplementation(() => {
                const subChain: any = {}
                subChain.then = (onfulfilled: any) => Promise.resolve(val).then(onfulfilled)
                return subChain
              })
            }
            chain.then = (onfulfilled: any) => Promise.resolve(val).then(onfulfilled)
            return chain
          }

          if (table === avaliacao) return getChain(mockAvaliacoesList)
          if (table === nota) return getChain(mockNotasList)
          if (table === diarioClasse) return getChain(mockDiariosList)
          if (table === frequenciaAluno) return getChain(mockFrequenciasList)
          return getChain([])
        })
      } as any
    })
  })

  it('deve calcular status de aprovado com 100% de frequencia e nota >= 7', async () => {
    mockAvaliacoesList = [
      { id: 'av-1', turmaId: 'turma-1', disciplinaId: 'disc-1', ehRecuperacao: false, ehRecuperacaoFinal: false }
    ]
    mockNotasList = [
      { avaliacaoId: 'av-1', matriculaId: 'aluno-1', valor: 8.0 }
    ]
    mockDiariosList = [
      { id: 'diario-1', turmaId: 'turma-1', disciplinaId: 'disc-1', aulasDadas: 2 }
    ]
    mockFrequenciasList = [
      { diarioClasseId: 'diario-1', matriculaId: 'aluno-1', presente: true }
    ]

    const result = await getTurmaMediaEStatus('turma-1', 'disc-1')
    expect(result.success).toBe(true)
    expect(result.data).toBeDefined()
    expect(result.data!['aluno-1']).toEqual({
      freqPercentage: 100,
      mediaFinal: 8.0,
      status: 'Aprovado'
    })
  })

  it('deve reprovar por falta caso frequencia seja < 75%', async () => {
    mockAvaliacoesList = [
      { id: 'av-1', turmaId: 'turma-1', disciplinaId: 'disc-1', ehRecuperacao: false, ehRecuperacaoFinal: false }
    ]
    mockNotasList = [
      { avaliacaoId: 'av-1', matriculaId: 'aluno-1', valor: 9.0 }
    ]
    mockDiariosList = [
      { id: 'diario-1', turmaId: 'turma-1', disciplinaId: 'disc-1', aulasDadas: 4 }
    ]
    // 1 presente de 4 aulas (25% frequencia)
    mockFrequenciasList = [
      { diarioClasseId: 'diario-1', matriculaId: 'aluno-1', presente: true },
      { diarioClasseId: 'diario-1', matriculaId: 'aluno-1', presente: false },
      { diarioClasseId: 'diario-1', matriculaId: 'aluno-1', presente: false },
      { diarioClasseId: 'diario-1', matriculaId: 'aluno-1', presente: false }
    ]

    const result = await getTurmaMediaEStatus('turma-1', 'disc-1')
    expect(result.success).toBe(true)
    expect(result.data!['aluno-1'].freqPercentage).toBe(25)
    expect(result.data!['aluno-1'].status).toBe('Reprovado por Falta')
  })

  it('deve colocar aluno em recuperacao caso media seja < 7.0 e nao tenha recuperacao lancada', async () => {
    mockAvaliacoesList = [
      { id: 'av-1', turmaId: 'turma-1', disciplinaId: 'disc-1', ehRecuperacao: false, ehRecuperacaoFinal: false }
    ]
    mockNotasList = [
      { avaliacaoId: 'av-1', matriculaId: 'aluno-1', valor: 5.5 }
    ]
    mockDiariosList = []
    mockFrequenciasList = []

    const result = await getTurmaMediaEStatus('turma-1', 'disc-1')
    expect(result.success).toBe(true)
    expect(result.data!['aluno-1'].status).toBe('Recuperação')
  })

  it('deve calcular media final e status usando recuperacao final', async () => {
    mockAvaliacoesList = [
      { id: 'av-1', turmaId: 'turma-1', disciplinaId: 'disc-1', ehRecuperacao: false, ehRecuperacaoFinal: false },
      { id: 'av-rec', turmaId: 'turma-1', disciplinaId: 'disc-1', ehRecuperacao: false, ehRecuperacaoFinal: true }
    ]
    mockNotasList = [
      { avaliacaoId: 'av-1', matriculaId: 'aluno-1', valor: 5.0 },
      { avaliacaoId: 'av-rec', matriculaId: 'aluno-1', valor: 7.0 } // Média final: (5.0 + 7.0)/2 = 6.0
    ]
    mockDiariosList = []
    mockFrequenciasList = []

    const result = await getTurmaMediaEStatus('turma-1', 'disc-1')
    expect(result.success).toBe(true)
    expect(result.data!['aluno-1'].mediaFinal).toBe(6.0)
    expect(result.data!['aluno-1'].status).toBe('Aprovado por Conselho/Recuperacao')
  })
})

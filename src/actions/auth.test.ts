import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { createPessoa } from './pessoa'
import { createContrato } from './secretaria'

// Mock Drizzle
vi.mock('@/db', () => ({
  db: {
    transaction: vi.fn(),
    insert: vi.fn(),
  }
}))

// Mock Supabase to simulate missing session
const mockGetUser = vi.fn()
vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn().mockResolvedValue({
    auth: {
      getUser: () => mockGetUser()
    }
  })
}))

describe('Segurança & Autenticação - checkAuth', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockGetUser.mockResolvedValue({ data: { user: null } })
  })

  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('deve lançar erro de Unauthorized ao tentar criar pessoa em produção sem login ativo', async () => {
    // Forçar ambiente de produção
    vi.stubEnv('NODE_ENV', 'production')

    const result = await createPessoa({
      nomeCompleto: 'Test Auth',
      classificacoes: []
    })

    expect(result.success).toBe(false)
    expect(result.error).toBe('Unauthorized')
  })

  it('deve lançar erro de Unauthorized ao tentar criar contrato em produção sem login ativo', async () => {
    vi.stubEnv('NODE_ENV', 'production')

    const result = await createContrato({
      alunoId: 'aluno-1',
      responsavelFinanceiroId: 'resp-1',
      anoLetivoId: 'ano-1',
      dataVigenciaInicio: new Date(),
      dataVigenciaFim: new Date(),
      status: 'rascunho',
      valorMensalidade: 50000
    })

    expect(result.success).toBe(false)
    expect(result.error).toBe('Unauthorized')
  })
})

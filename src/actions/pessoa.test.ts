import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createPessoa, getPessoas, updatePessoa, getPessoaById } from './pessoa'
import { db } from '@/db'

// Mock do Drizzle ORM
vi.mock('@/db', () => ({
  db: {
    transaction: vi.fn(),
    select: vi.fn(),
    insert: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  }
}))

// Mock do Supabase Auth Server Client
const mockGetUser = vi.fn().mockResolvedValue({
  data: { user: { id: 'mock-user-uuid', email: 'admin@csm.edu.br', app_metadata: { role: 'admin' } } }
})
vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn().mockResolvedValue({
    auth: {
      getUser: () => mockGetUser()
    }
  })
}))

describe('Pessoa Server Actions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockGetUser.mockResolvedValue({
      data: { user: { id: 'mock-user-uuid', email: 'admin@csm.edu.br', app_metadata: { role: 'admin' } } }
    })
  })

  it('deve criar uma pessoa com classificacoes e retornar o ID', async () => {
    // Preparando o mock da transação
    const mockTx = {
      insert: vi.fn().mockReturnThis(),
      values: vi.fn().mockResolvedValue([{ id: 'mock-uuid-123' }]) // Simula o retorno de db.insert(pessoa).values(...).returning()
    }
    
    // O transaction executa o callback que passamos pra ele com o nosso tx mockado
    vi.mocked(db.transaction).mockImplementation(async (callback) => {
      // Como o callback da transação no actions.ts retorna o ID inserido, 
      // precisamos simular a execução interna.
      return 'mock-uuid-123' 
    })

    const payload = {
      nomeCompleto: 'João da Silva',
      cpf: '123.456.789-00',
      classificacoes: ['aluno', 'responsavel'] as any
    }

    const result = await createPessoa(payload)

    expect(result.success).toBe(true)
    expect(result.id).toBe('mock-uuid-123')
    expect(db.transaction).toHaveBeenCalledTimes(1)
  })

  it('deve lidar com erros ao criar pessoa', async () => {
    vi.mocked(db.transaction).mockRejectedValue(new Error('Erro no BD'))

    const result = await createPessoa({
      nomeCompleto: 'Erro Teste',
      classificacoes: []
    })

    expect(result.success).toBe(false)
    expect(result.error).toBe('Erro no BD')
  })

  // getPessoas e updatePessoa testes...
  it('deve formatar paginação e metadados ao buscar pessoas', async () => {
    // Mock simplificado do select encadeado do Drizzle
    const mockSelect = {
      from: vi.fn().mockReturnThis(),
      leftJoin: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      orderBy: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      offset: vi.fn().mockResolvedValue([{ id: '1', nomeCompleto: 'Maria' }])
    }
    
    // O primeiro select é os dados, o segundo é o count
    vi.mocked(db.select)
      .mockReturnValueOnce(mockSelect as any) // para baseQuery
      .mockReturnValueOnce({
        from: vi.fn().mockReturnThis(),
        leftJoin: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        then: vi.fn().mockImplementation((onfulfilled) => {
          return Promise.resolve([{ value: 1 }]).then(onfulfilled);
        })
      } as any)

    const result = await getPessoas({ page: 2, limit: 10 })

    expect(result.success).toBe(true)
    if (result.success && 'metadata' in result && result.metadata) {
      expect(result.metadata.total).toBe(1)
      expect(result.metadata.page).toBe(2)
      expect(result.metadata.limit).toBe(10)
      expect(result.metadata.totalPages).toBe(1)
      expect(mockSelect.offset).toHaveBeenCalledWith(10) // (2-1)*10 = 10
    }
  })

  it('deve criar uma pessoa com dados complementares de Aluno', async () => {
    vi.mocked(db.transaction).mockImplementation(async (callback) => {
      return 'mock-uuid-aluno'
    })

    const payload = {
      nomeCompleto: 'Aluno de Teste',
      classificacoes: ['aluno'] as any,
      dadosAluno: {
        numeroMatricula: 'MAT-2026',
        ra: 'RA999',
        codigoBarras: '12345',
        loginPortal: 'alunoteste',
        senhaPortalHash: 'hash-password',
        cartaoCatraca: 'catraca-123',
        permitirBiblioteca: true
      }
    }

    const result = await createPessoa(payload)

    expect(result.success).toBe(true)
    expect(result.id).toBe('mock-uuid-aluno')
  })

  it('deve criar uma pessoa com dados complementares de Funcionário', async () => {
    vi.mocked(db.transaction).mockImplementation(async (callback) => {
      return 'mock-uuid-func'
    })

    const payload = {
      nomeCompleto: 'Funcionário de Teste',
      classificacoes: ['funcionario'] as any,
      dadosFuncionario: {
        cargo: 'Professor',
        departamento: 'Pedagógico',
        salario: 450000,
        cargaHoraria: 40,
        registroProfissional: 'MEC-123'
      }
    }

    const result = await createPessoa(payload)

    expect(result.success).toBe(true)
    expect(result.id).toBe('mock-uuid-func')
  })

  it('deve buscar uma pessoa por ID com todos os detalhes incluindo dados complementares via getPessoaById', async () => {
    const mockPessoaCompleta = {
      id: 'mock-uuid-123',
      nomeCompleto: 'João Aluno',
      classificacoes: ['aluno'],
      endereco: { id: 'end-1', logradouro: 'Rua Principal' },
      contatos: [{ id: 'cont-1', valor: '99999-9999' }],
      anexos: [],
      dadosAluno: { id: 'aluno-1', numeroMatricula: '2026-001', ra: 'RA123' },
      dadosFuncionario: null,
      habilitacoes: []
    }

    vi.mocked(db.transaction).mockImplementation(async (callback) => {
      return mockPessoaCompleta
    })

    const result = await getPessoaById('mock-uuid-123')

    expect(result.success).toBe(true)
    expect(result.data).toEqual(mockPessoaCompleta)
  })

  it('deve bloquear a criacao de funcionario nao-pedagogico por um usuario nao-admin', async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: 'mock-user-uuid', email: 'comum@csm.edu.br' } }
    })

    const payload = {
      nomeCompleto: 'Funcionario Comum',
      classificacoes: ['funcionario'] as any,
      dadosFuncionario: {
        cargo: 'Portaria', 
        departamento: 'Segurança',
      }
    }

    const result = await createPessoa(payload)

    expect(result.success).toBe(false)
    expect(result.error).toContain('Acesso não autorizado')
  })

  it('deve permitir a criacao de funcionario nao-pedagogico por um usuario admin', async () => {
    vi.mocked(db.transaction).mockImplementation(async (callback) => {
      return 'mock-uuid-func-admin'
    })

    const payload = {
      nomeCompleto: 'Funcionario Admin',
      classificacoes: ['funcionario'] as any,
      dadosFuncionario: {
        cargo: 'Portaria', 
        departamento: 'Segurança',
      }
    }

    const result = await createPessoa(payload)

    expect(result.success).toBe(true)
    expect(result.id).toBe('mock-uuid-func-admin')
  })

  it('deve bloquear a atualizacao de funcionario nao-pedagogico por um usuario nao-admin', async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: 'mock-user-uuid', email: 'comum@csm.edu.br' } }
    })

    vi.mocked(db.transaction).mockImplementation(async (callback) => {
      const mockTx = {
        select: vi.fn().mockReturnValue({
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockResolvedValue([
              {
                pessoaId: 'mock-uuid-123',
                cargo: 'Portaria', 
                departamento: 'Segurança',
              }
            ])
          })
        })
      }
      return await callback(mockTx as any)
    })

    const payload = {
      nomeCompleto: 'Funcionario Editado',
      classificacoes: ['funcionario'] as any,
      dadosFuncionario: {
        cargo: 'Portaria',
        departamento: 'Segurança',
      }
    }

    const result = await updatePessoa('mock-uuid-123', payload)

    expect(result.success).toBe(false)
    expect(result.error).toContain('Acesso não autorizado')
  })

  it('deve permitir a criacao de funcionario nao-pedagogico por um usuario com email master explicito', async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: 'mock-user-uuid', email: 'adelinosantos.fs@gmail.com' } }
    })

    vi.mocked(db.transaction).mockImplementation(async (callback) => {
      return 'mock-uuid-func-master'
    })

    const payload = {
      nomeCompleto: 'Funcionario Master',
      classificacoes: ['funcionario'] as any,
      dadosFuncionario: {
        cargo: 'Secretária', 
        departamento: 'Secretaria',
      }
    }

    const result = await createPessoa(payload)

    expect(result.success).toBe(true)
    expect(result.id).toBe('mock-uuid-func-master')
  })
})

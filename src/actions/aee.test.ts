import { describe, it, expect, vi, beforeEach } from 'vitest'
import { 
  getPeiAluno, 
  upsertPei, 
  addMetaPei, 
  updateMetaPeiStatus, 
  deleteMetaPei, 
  getAtendimentosAluno, 
  saveAtendimento, 
  getDocumentosAluno, 
  saveDocumento,
  getAnosLetivos
} from './aee'
import { db } from '@/db'
import { aeePei, aeePeiMeta, aeeAtendimento, aeeDocumento } from '@/db/schema'

// Mock do Drizzle ORM
vi.mock('@/db', () => ({
  db: {
    select: vi.fn(),
    insert: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  }
}))

// Mock do Supabase
vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn().mockResolvedValue({
    auth: {
      getUser: vi.fn().mockResolvedValue({
        data: { user: { id: 'mock-user-uuid' } }
      })
    }
  })
}))

// Mock next/cache
vi.mock('next/cache', () => ({
  revalidatePath: vi.fn()
}))

describe('AEE Server Actions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Gestão do PEI (Plano de Desenvolvimento Individualizado)', () => {
    it('deve retornar null se o aluno não possuir PEI para o ano letivo', async () => {
      vi.mocked(db.select).mockReturnValue({
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockResolvedValue([]) // simula nenhum PEI encontrado
      } as any)

      const result = await getPeiAluno('aluno-1', 'ano-2026')
      expect(result.success).toBe(true)
      expect(result.data).toBeNull()
    })

    it('deve buscar o PEI e suas metas associadas', async () => {
      const mockPei = { id: 'pei-1', alunoId: 'aluno-1', anoLetivoId: 'ano-2026' }
      const mockMetas = [{ id: 'meta-1', peiId: 'pei-1', area: 'pedagogica', descricaoMeta: 'Ler' }]

      vi.mocked(db.select)
        .mockReturnValueOnce({
          from: vi.fn().mockReturnThis(),
          where: vi.fn().mockResolvedValue([mockPei])
        } as any)
        .mockReturnValueOnce({
          from: vi.fn().mockReturnThis(),
          where: vi.fn().mockResolvedValue(mockMetas)
        } as any)

      const result = await getPeiAluno('aluno-1', 'ano-2026')
      expect(result.success).toBe(true)
      expect(result.data).toEqual({ ...mockPei, metas: mockMetas })
    })

    it('deve criar um novo PEI se não existir para o ano letivo', async () => {
      // Mock do check de existência
      vi.mocked(db.select).mockReturnValue({
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockResolvedValue([]) // nenhum existente
      } as any)

      const mockPeiInserted = { id: 'pei-novo' }
      vi.mocked(db.insert).mockReturnValue({
        values: vi.fn().mockReturnThis(),
        returning: vi.fn().mockResolvedValue([mockPeiInserted])
      } as any)

      const result = await upsertPei('aluno-1', 'ano-2026', {
        objetivosGerais: 'Aprender',
        dataInicio: '2026-02-01',
        dataFim: '2026-12-15'
      })

      expect(result.success).toBe(true)
      expect(result.id).toBe('pei-novo')
    })

    it('deve atualizar o PEI existente para o ano letivo', async () => {
      const mockPeiExistente = { id: 'pei-existente' }
      vi.mocked(db.select).mockReturnValue({
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockResolvedValue([mockPeiExistente])
      } as any)

      vi.mocked(db.update).mockReturnValue({
        set: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        returning: vi.fn().mockResolvedValue([{ id: 'pei-existente' }])
      } as any)

      const result = await upsertPei('aluno-1', 'ano-2026', {
        objetivosGerais: 'Aprender e Desenvolver',
        dataInicio: '2026-02-01',
        dataFim: '2026-12-15'
      })

      expect(result.success).toBe(true)
      expect(result.id).toBe('pei-existente')
      expect(db.update).toHaveBeenCalledTimes(1)
    })

    it('deve adicionar uma meta ao PEI', async () => {
      const mockMeta = { id: 'meta-123', peiId: 'pei-1', area: 'pedagogica', descricaoMeta: 'Escrever nome' }
      vi.mocked(db.insert).mockReturnValue({
        values: vi.fn().mockReturnThis(),
        returning: vi.fn().mockResolvedValue([mockMeta])
      } as any)

      const result = await addMetaPei({
        peiId: 'pei-1',
        area: 'pedagogica',
        descricaoMeta: 'Escrever nome'
      })

      expect(result.success).toBe(true)
      expect(result.data).toEqual(mockMeta)
    })

    it('deve atualizar o status de uma meta do PEI', async () => {
      const mockMetaUpdated = { id: 'meta-123', status: 'em_progresso' }
      vi.mocked(db.update).mockReturnValue({
        set: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        returning: vi.fn().mockResolvedValue([mockMetaUpdated])
      } as any)

      const result = await updateMetaPeiStatus('meta-123', 'em_progresso', 'Em andamento com apoio')
      expect(result.success).toBe(true)
      expect(result.data).toEqual(mockMetaUpdated)
    })

    it('deve excluir uma meta do PEI', async () => {
      vi.mocked(db.delete).mockReturnValue({
        where: vi.fn().mockResolvedValue({ id: 'meta-123' })
      } as any)

      const result = await deleteMetaPei('meta-123')
      expect(result.success).toBe(true)
      expect(db.delete).toHaveBeenCalledTimes(1)
    })
  })

  describe('Diário de Atendimentos', () => {
    it('deve obter a lista de atendimentos do aluno', async () => {
      const mockAtendimentos = [{ id: 'at-1', profissionalNome: 'Prof AEE', duracaoMinutos: 50 }]
      vi.mocked(db.select).mockReturnValue({
        from: vi.fn().mockReturnThis(),
        innerJoin: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        orderBy: vi.fn().mockResolvedValue(mockAtendimentos)
      } as any)

      const result = await getAtendimentosAluno('aluno-1')
      expect(result.success).toBe(true)
      expect(result.data).toEqual(mockAtendimentos)
    })

    it('deve registrar um atendimento na sala de recursos', async () => {
      const mockAtendimentoSaved = { id: 'at-novo', profissionalId: 'profissional-123' }
      vi.mocked(db.insert).mockReturnValue({
        values: vi.fn().mockReturnThis(),
        returning: vi.fn().mockResolvedValue([mockAtendimentoSaved])
      } as any)

      const result = await saveAtendimento({
        alunoId: 'aluno-1',
        dataAtendimento: '2026-06-05T09:00:00',
        duracaoMinutos: 50,
        registroSessao: 'Foco na concentração',
        recursosUtilizados: 'Jogos lógicos'
      })

      expect(result.success).toBe(true)
      expect(result.data).toEqual(mockAtendimentoSaved)
    })
  })

  describe('Gestão de Laudos e Documentos Clínicos', () => {
    it('deve obter a lista de laudos anexados do aluno', async () => {
      const mockDocumentos = [{ id: 'doc-1', tipoDocumento: 'laudo_medico', profissionalEmissor: 'Dr. Silva' }]
      vi.mocked(db.select).mockReturnValue({
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        orderBy: vi.fn().mockResolvedValue(mockDocumentos)
      } as any)

      const result = await getDocumentosAluno('aluno-1')
      expect(result.success).toBe(true)
      expect(result.data).toEqual(mockDocumentos)
    })

    it('deve anexar e salvar um laudo clínico do aluno', async () => {
      const mockDocumentoSaved = { id: 'doc-novo', tipoDocumento: 'laudo_medico' }
      vi.mocked(db.insert).mockReturnValue({
        values: vi.fn().mockReturnThis(),
        returning: vi.fn().mockResolvedValue([mockDocumentoSaved])
      } as any)

      const result = await saveDocumento({
        alunoId: 'aluno-1',
        tipoDocumento: 'laudo_medico',
        profissionalEmissor: 'Dr. Silva',
        registroProfissional: 'CRM 12345',
        urlArquivo: 'http://bucket.supabase.com/laudo.pdf'
      })

      expect(result.success).toBe(true)
      expect(result.data).toEqual(mockDocumentoSaved)
    })
  })

  describe('Anos Letivos', () => {
    it('deve obter a lista de anos letivos', async () => {
      const mockAnos = [{ id: 'ano-1', ano: 2026, ativo: true }]
      vi.mocked(db.select).mockReturnValue({
        from: vi.fn().mockReturnThis(),
        orderBy: vi.fn().mockResolvedValue(mockAnos)
      } as any)

      const result = await getAnosLetivos()
      expect(result.success).toBe(true)
      expect(result.data).toEqual(mockAnos)
    })
  })
})

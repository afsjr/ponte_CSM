import { describe, it, expect, vi, beforeEach } from 'vitest';
import { 
  getColaboradoresRh, 
  getDossieColaborador, 
  upsertDossieColaborador,
  saveDocumentoColaborador,
  saveFeriasColaborador,
  saveOcorrenciaColaborador,
  getFolhaPagamentoRelatorio
} from './rh';
import { db } from '@/db';

// Mock do Drizzle ORM
vi.mock('@/db', () => ({
  db: {
    select: vi.fn(),
    insert: vi.fn(),
    update: vi.fn(),
  }
}));

// Mock do Supabase
vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn().mockResolvedValue({
    auth: {
      getUser: vi.fn().mockResolvedValue({
        data: { user: { id: 'mock-user-uuid' } }
      })
    }
  })
}));

// Mock next/cache
vi.mock('next/cache', () => ({
  revalidatePath: vi.fn()
}));

describe('RH Server Actions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Dossiê do Colaborador', () => {
    it('deve buscar os dados de pessoa e dossie do colaborador', async () => {
      const mockPessoa = { id: 'p-1', nomeCompleto: 'Maria Silva' };
      const mockDossie = { id: 'd-1', pessoaId: 'p-1', cargo: 'Professora', salarioBase: 450000 };

      vi.mocked(db.select).mockReturnValueOnce({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue([mockPessoa])
        })
      } as any).mockReturnValueOnce({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue([mockDossie])
        })
      } as any);

      const result = await getDossieColaborador('p-1');
      expect(result.pessoa).toEqual(mockPessoa);
      expect(result.dossie).toEqual(mockDossie);
    });

    it('deve inserir um novo dossie de colaborador se nao existir', async () => {
      const novoDossie = {
        id: 'd-2',
        pessoaId: 'p-2',
        cargo: 'Coordenador Pedagógico',
        salarioBase: 600000,
        jornadaSemanalHoras: 40,
        dataAdmissao: new Date('2025-01-10')
      };

      vi.mocked(db.select).mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue([])
        })
      } as any);

      vi.mocked(db.insert).mockReturnValue({
        values: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([novoDossie])
        })
      } as any);

      const result = await upsertDossieColaborador({
        pessoaId: 'p-2',
        cargo: 'Coordenador Pedagógico',
        salarioBaseCentavos: 600000,
        dataAdmissao: new Date('2025-01-10')
      });

      expect(result).toEqual(novoDossie);
    });
  });

  describe('Férias e Ocorrências', () => {
    it('deve agendar férias para o colaborador', async () => {
      const novaFerias = {
        id: 'f-1',
        pessoaId: 'p-1',
        periodoAquisitivoInicio: new Date('2025-01-01'),
        periodoAquisitivoFim: new Date('2025-12-31'),
        dataInicioGozo: new Date('2026-07-01'),
        dataFimGozo: new Date('2026-07-30'),
        status: 'programada'
      };

      vi.mocked(db.insert).mockReturnValue({
        values: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([novaFerias])
        })
      } as any);

      const result = await saveFeriasColaborador({
        pessoaId: 'p-1',
        periodoAquisitivoInicio: new Date('2025-01-01'),
        periodoAquisitivoFim: new Date('2025-12-31'),
        dataInicioGozo: new Date('2026-07-01'),
        dataFimGozo: new Date('2026-07-30')
      });

      expect(result).toEqual(novaFerias);
    });

    it('deve registrar uma ocorrência funcional (promoção)', async () => {
      const novaOcorrencia = {
        id: 'o-1',
        pessoaId: 'p-1',
        tipo: 'promocao',
        descricao: 'Promovida a Coordenadora de Área',
        valorImpacto: 100000
      };

      vi.mocked(db.insert).mockReturnValue({
        values: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([novaOcorrencia])
        })
      } as any);

      const result = await saveOcorrenciaColaborador({
        pessoaId: 'p-1',
        tipo: 'promocao',
        descricao: 'Promovida a Coordenadora de Área',
        valorImpactoCentavos: 100000
      });

      expect(result).toEqual(novaOcorrencia);
    });
  });
});

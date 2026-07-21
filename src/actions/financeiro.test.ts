import { describe, it, expect, vi, beforeEach } from 'vitest';
import { 
  getPlanoContas, 
  createPlanoConta, 
  getCentrosCusto, 
  createCentroCusto,
  getTitulosFinanceiros,
  createTituloFinanceiro,
  baixarTituloFinanceiro,
  getDreRelatorio,
  getAlertasCalendarioFinanceiro
} from './financeiro';
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

describe('Financeiro Server Actions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Plano de Contas', () => {
    it('deve listar categorias do plano de contas', async () => {
      const mockContas = [
        { id: 'pc-1', codigo: '1.1', descricao: 'Mensalidades', tipo: 'receita' }
      ];

      vi.mocked(db.select).mockReturnValue({
        from: vi.fn().mockReturnValue({
          orderBy: vi.fn().mockResolvedValue(mockContas)
        })
      } as any);

      const result = await getPlanoContas();
      expect(result).toEqual(mockContas);
    });

    it('deve criar uma nova categoria no plano de contas', async () => {
      const novaConta = { id: 'pc-2', codigo: '2.1', descricao: 'Energia Eletrica', tipo: 'despesa' };

      vi.mocked(db.insert).mockReturnValue({
        values: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([novaConta])
        })
      } as any);

      const result = await createPlanoConta({
        codigo: '2.1',
        descricao: 'Energia Eletrica',
        tipo: 'despesa'
      });

      expect(result).toEqual(novaConta);
    });
  });

  describe('Centros de Custo', () => {
    it('deve criar um centro de custo', async () => {
      const novoCc = { id: 'cc-1', nome: 'Educacao Infantil', descricao: 'Segmento Infantil' };

      vi.mocked(db.insert).mockReturnValue({
        values: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([novoCc])
        })
      } as any);

      const result = await createCentroCusto({
        nome: 'Educacao Infantil',
        descricao: 'Segmento Infantil'
      });

      expect(result).toEqual(novoCc);
    });
  });

  describe('Títulos Financeiros e Baixas', () => {
    it('deve criar um título a pagar pendente', async () => {
      const novoTitulo = {
        id: 'tit-1',
        tipo: 'despesa',
        descricao: 'Material Didatico',
        valorOriginal: 150000,
        status: 'pendente',
        dataVencimento: new Date('2026-08-10')
      };

      vi.mocked(db.insert).mockReturnValue({
        values: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([novoTitulo])
        })
      } as any);

      const result = await createTituloFinanceiro({
        tipo: 'despesa',
        descricao: 'Material Didatico',
        valorOriginalCentavos: 150000,
        dataVencimento: new Date('2026-08-10')
      });

      expect(result).toEqual(novoTitulo);
    });

    it('deve registrar baixa em um título existente', async () => {
      const tituloAnterior = {
        id: 'tit-1',
        tipo: 'despesa',
        descricao: 'Material Didatico',
        valorOriginal: 150000,
        valorPago: 0,
        status: 'pendente'
      };

      const tituloBaixado = {
        ...tituloAnterior,
        valorPago: 150000,
        status: 'pago',
        formaPagamento: 'PIX'
      };

      vi.mocked(db.select).mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue([tituloAnterior])
        })
      } as any);

      vi.mocked(db.update).mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            returning: vi.fn().mockResolvedValue([tituloBaixado])
          })
        })
      } as any);

      vi.mocked(db.insert).mockReturnValue({
        values: vi.fn().mockResolvedValue([])
      } as any);

      const result = await baixarTituloFinanceiro('tit-1', {
        valorPagoCentavos: 150000,
        dataPagamento: new Date(),
        formaPagamento: 'PIX'
      });

      expect(result).toEqual(tituloBaixado);
    });
  });

  describe('Relatório DRE', () => {
    it('deve calcular o resultado liquido e a margem percentual no DRE', async () => {
      const mockTitulos = [
        { id: '1', tipo: 'receita', valorOriginal: 1000000 }, // R$ 10.000,00
        { id: '2', tipo: 'despesa', valorOriginal: 600000 }   // R$ 6.000,00
      ];

      vi.mocked(db.select).mockReturnValue({
        from: vi.fn().mockResolvedValue(mockTitulos)
      } as any);

      const result = await getDreRelatorio();

      expect(result.totalReceitasCentavos).toBe(1000000);
      expect(result.totalDespesasCentavos).toBe(600000);
      expect(result.resultadoLiquidoCentavos).toBe(400000);
      expect(result.margemPercentual).toBe(40);
    });
  });
});

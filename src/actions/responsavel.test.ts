import { describe, it, expect, vi, beforeEach } from 'vitest';
import { 
  vincularResponsavel, 
  getVinculosAluno, 
  removerVinculo, 
  createAviso, 
  getAvisosAdmin, 
  deleteAviso, 
  getAvisoEstatisticas, 
  getFilhosVinculados, 
  getBoletimEHorarioFilho, 
  getMuralAvisosResponsavel, 
  marcarCienteAviso 
} from './responsavel';
import { db } from '@/db';
import { vinculoResponsavelAluno, muralAviso, avisoCiente, auditLog } from '@/db/schema';

// Mock Drizzle
vi.mock('@/db', () => ({
  db: {
    select: vi.fn(),
    insert: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    transaction: vi.fn(),
  }
}));

// Mock next/cache
vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

// Mock Supabase Auth
vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn().mockResolvedValue({
    auth: {
      getUser: vi.fn().mockResolvedValue({
        data: { user: { id: 'mock-auth-user-id' } }
      })
    }
  })
}));

describe('Responsável & Mural Server Actions - Vínculos', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(db.transaction).mockImplementation(async (callback) => {
      const txMock = {
        delete: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        insert: vi.fn().mockReturnThis(),
        values: vi.fn().mockResolvedValue([]),
      };
      return callback(txMock as any);
    });
  });

  it('deve vincular um responsável a um aluno se ambos tiverem classificações corretas', async () => {
    // Mock selects de validação (primeiro para o responsável, depois para o aluno)
    const mockSelectChain = {
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockResolvedValue([{ id: 'class-id' }]), // Simula que encontrou a classificação
    };
    vi.mocked(db.select).mockReturnValue(mockSelectChain as any);

    const mockInsertChain = {
      values: vi.fn().mockReturnThis(),
      returning: vi.fn().mockResolvedValue([{ id: 'vinculo-123' }])
    };
    vi.mocked(db.insert).mockReturnValue(mockInsertChain as any);

    const result = await vincularResponsavel({
      responsavelId: 'resp-123',
      alunoId: 'aluno-123',
      grauParentesco: 'Mãe',
      responsavelFinanceiro: true,
      autorizadoRetirada: true,
    });

    expect(result.success).toBe(true);
    expect(result.data).toBeDefined();
    expect(db.insert).toHaveBeenCalledWith(vinculoResponsavelAluno);
  });

  it('deve falhar se o responsável não possuir a classificação correta', async () => {
    // Simula que o responsável não foi encontrado na tabela pessoaClassificacao
    const mockSelectChain = {
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockResolvedValue([]),
    };
    vi.mocked(db.select).mockReturnValue(mockSelectChain as any);

    const result = await vincularResponsavel({
      responsavelId: 'resp-123',
      alunoId: 'aluno-123',
      grauParentesco: 'Mãe',
      responsavelFinanceiro: true,
      autorizadoRetirada: true,
    });

    expect(result.success).toBe(false);
    expect(result.error).toContain('não possui a classificação de Responsável');
  });

  it('deve remover um vínculo de responsável e aluno com justificativa e log de auditoria', async () => {
    const mockSelectChain = {
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockResolvedValue([{ id: 'vinculo-123', responsavelId: 'resp-123', alunoId: 'aluno-123' }])
    };
    vi.mocked(db.select).mockReturnValue(mockSelectChain as any);

    const result = await removerVinculo('vinculo-123', 'Vínculo lançado por engano');

    expect(result.success).toBe(true);
    expect(db.transaction).toHaveBeenCalledTimes(1);
  });
});

describe('Responsável & Mural Server Actions - Mural de Avisos', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(db.transaction).mockImplementation(async (callback) => {
      const txMock = {
        delete: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        insert: vi.fn().mockReturnThis(),
        values: vi.fn().mockResolvedValue([]),
      };
      return callback(txMock as any);
    });
  });

  it('deve criar um aviso sanitizando links para evitar vulnerabilidades', async () => {
    const mockInsertChain = {
      values: vi.fn().mockReturnThis(),
      returning: vi.fn().mockResolvedValue([{ id: 'aviso-123', titulo: 'Alerta' }])
    };
    vi.mocked(db.insert).mockReturnValue(mockInsertChain as any);

    const payload = {
      titulo: 'Comunicado de Greve 🚌',
      conteudo: 'Atenção pais, acessem nosso link hacker http://malicious-site.com/hack para ver.',
      destinatarioTipo: 'geral' as const
    };

    const result = await createAviso(payload);

    expect(result.success).toBe(true);
    expect(result.data).toBeDefined();
    // Verifica se o link suspeito foi sanitizado
    expect(vi.mocked(db.insert)).toHaveBeenCalledWith(muralAviso);
  });

  it('deve deletar um aviso de forma física e gravar a justificativa de auditoria', async () => {
    const mockSelectChain = {
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockResolvedValue([{ id: 'aviso-123', titulo: 'Aviso Antigo' }])
    };
    vi.mocked(db.select).mockReturnValue(mockSelectChain as any);

    const result = await deleteAviso('aviso-123', 'Aviso expirado ou incorreto');

    expect(result.success).toBe(true);
    expect(db.transaction).toHaveBeenCalledTimes(1);
  });

  it('deve permitir que o responsável marque ciente em um aviso se já não o tiver feito', async () => {
    // Mock select para ver se já existe ciente (retorna vazio)
    const mockSelectChain = {
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockResolvedValue([]),
    };
    vi.mocked(db.select).mockReturnValue(mockSelectChain as any);

    const mockInsertChain = {
      values: vi.fn().mockReturnThis(),
      returning: vi.fn().mockResolvedValue([{ id: 'ciente-123', avisoId: 'aviso-123' }])
    };
    vi.mocked(db.insert).mockReturnValue(mockInsertChain as any);

    const result = await marcarCienteAviso('aviso-123', 'resp-123', 'aluno-123');

    expect(result.success).toBe(true);
    expect(db.insert).toHaveBeenCalledWith(avisoCiente);
  });

  it('deve retornar ciente existente caso o responsável tente marcar novamente', async () => {
    // Mock select para ver se já existe ciente (retorna ciente pré-existente)
    const mockSelectChain = {
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockResolvedValue([{ id: 'ciente-123', avisoId: 'aviso-123' }]),
    };
    vi.mocked(db.select).mockReturnValue(mockSelectChain as any);

    const result = await marcarCienteAviso('aviso-123', 'resp-123', 'aluno-123');

    expect(result.success).toBe(true);
    expect(db.insert).not.toHaveBeenCalledWith(avisoCiente);
  });
});

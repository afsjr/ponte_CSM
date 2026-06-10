import { db } from '@/db'
import { pessoaClassificacao, dadosFuncionario } from '@/db/schema'
import { eq } from 'drizzle-orm'

export type UserPermissions = {
  isFuncionario: boolean;
  isAdmin: boolean;
  canAccessCadastros: boolean;
  canAccessSecretaria: boolean;
  canAccessPedagogico: boolean;
  canAccessAee: boolean;
  canAccessConfiguracoes: boolean;
};

const DEFAULT_PERMISSIONS: UserPermissions = {
  isFuncionario: false,
  isAdmin: false,
  canAccessCadastros: false,
  canAccessSecretaria: false,
  canAccessPedagogico: false,
  canAccessAee: false,
  canAccessConfiguracoes: false,
};

export async function getUserPermissions(userId: string, email?: string): Promise<UserPermissions> {
  if (!userId) return DEFAULT_PERMISSIONS;

  // Busca as classificações da pessoa
  const classificacoes = await db.select({ tipo: pessoaClassificacao.tipo })
    .from(pessoaClassificacao)
    .where(eq(pessoaClassificacao.pessoaId, userId));

  const tipos = classificacoes.map(c => c.tipo);
  
  // Verifica explicitamente e-mails hardcoded para super admin de desenvolvimento
  const isDevMaster = email?.toLowerCase() === 'adelinosantos.fs@gmail.com' || (process.env.NODE_ENV === 'development' && !email?.includes('comum'));

  const isFuncionario = tipos.includes('funcionario') || isDevMaster;

  if (!isFuncionario) {
    return DEFAULT_PERMISSIONS; // Se não for funcionário e não for admin, não tem acesso aos painéis internos
  }

  // Busca dados de funcionário (cargo, departamento)
  const [funcData] = await db.select({
    cargo: dadosFuncionario.cargo,
    departamento: dadosFuncionario.departamento
  })
  .from(dadosFuncionario)
  .where(eq(dadosFuncionario.pessoaId, userId));

  const cargo = (funcData?.cargo || '').toLowerCase();
  const departamento = (funcData?.departamento || '').toLowerCase();

  const isAdmin = isDevMaster || 
                  departamento.includes('direção') || 
                  departamento.includes('administração') || 
                  departamento.includes('ti') ||
                  cargo.includes('diretor') ||
                  cargo.includes('administrador');

  const isSecretaria = isAdmin || 
                       departamento.includes('secretaria') || 
                       departamento.includes('atendimento') ||
                       cargo.includes('secretaria');

  const isPedagogico = isAdmin || 
                       departamento.includes('pedagógico') || 
                       departamento.includes('coordenação') ||
                       cargo.includes('professor') ||
                       cargo.includes('coordenador') ||
                       cargo.includes('docente');

  const isAee = isAdmin || 
                isPedagogico || 
                cargo.includes('aee') || 
                cargo.includes('inclusão') ||
                departamento.includes('inclusão');

  return {
    isFuncionario: true,
    isAdmin,
    canAccessCadastros: isSecretaria || isPedagogico,
    canAccessSecretaria: isSecretaria,
    canAccessPedagogico: isPedagogico,
    canAccessAee: isAee,
    canAccessConfiguracoes: isAdmin,
  };
}

/**
 * Regra Inegociável:
 * Notas Numéricas variam de 0 a 10. Devem ser arredondadas para cima em incrementos de 0.5.
 * Ex: 
 * - 7.1 a 7.4 -> 7.5
 * - 7.6 a 7.9 -> 8.0
 * - 6.1 a 6.4 -> 6.5
 * - 6.6 a 6.9 -> 7.0
 * 
 * Assumindo entrada como number (ex: 7.2) ou string ("7.2").
 */
export function arredondarNotaEscolar(nota: number | string | null | undefined): number | null {
  if (nota === null || nota === undefined || nota === '') return null;
  const num = typeof nota === 'string' ? parseFloat(nota.replace(',', '.')) : nota;
  if (isNaN(num)) return null;

  // Garantir limites 0 a 10
  if (num < 0) return 0;
  if (num > 10) return 10;

  // Lógica de teto por 0.5
  // Multiplicamos por 2, fazemos Math.ceil e dividimos por 2
  // Ex: 7.1 * 2 = 14.2 -> Math.ceil(14.2) = 15 -> 15 / 2 = 7.5
  // Ex: 7.6 * 2 = 15.2 -> Math.ceil(15.2) = 16 -> 16 / 2 = 8.0
  // Ex: 7.0 * 2 = 14.0 -> Math.ceil(14.0) = 14 -> 14 / 2 = 7.0
  return Math.ceil(num * 2) / 2;
}

/**
 * Calcula a situação do aluno após aplicar a recuperação.
 * Regra Inegociável:
 * (Média Anterior + Recuperação) / 2 = Nova Média.
 * Critério de aprovação cai de 7.0 para 6.0 após a recuperação.
 */
export function calcularMediaComRecuperacao(mediaBimestre: number, notaRecuperacao: number): { mediaFinal: number, aprovado: boolean } {
  const media = arredondarNotaEscolar((mediaBimestre + notaRecuperacao) / 2) || 0;
  return {
    mediaFinal: media,
    aprovado: media >= 6.0
  };
}

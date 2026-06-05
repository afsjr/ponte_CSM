import { describe, it, expect } from 'vitest'
import { arredondarNotaEscolar, calcularMediaComRecuperacao } from './pedagogico'

describe('Regras Pedagógicas - Arredondamento de Notas', () => {
  it('deve retornar null para valores vazios ou inválidos', () => {
    expect(arredondarNotaEscolar(null)).toBeNull()
    expect(arredondarNotaEscolar(undefined)).toBeNull()
    expect(arredondarNotaEscolar('')).toBeNull()
    expect(arredondarNotaEscolar('abc')).toBeNull()
  })

  it('deve manter limites de 0 a 10', () => {
    expect(arredondarNotaEscolar(-1.5)).toBe(0)
    expect(arredondarNotaEscolar(11.2)).toBe(10)
  })

  it('deve arredondar notas com final .1 a .4 para .5 mais próximo', () => {
    expect(arredondarNotaEscolar(7.1)).toBe(7.5)
    expect(arredondarNotaEscolar(7.2)).toBe(7.5)
    expect(arredondarNotaEscolar(7.3)).toBe(7.5)
    expect(arredondarNotaEscolar(7.4)).toBe(7.5)
    expect(arredondarNotaEscolar('6,2')).toBe(6.5)
    expect(arredondarNotaEscolar('6.4')).toBe(6.5)
  })

  it('deve arredondar notas com final .6 a .9 para o próximo inteiro (.0)', () => {
    expect(arredondarNotaEscolar(7.6)).toBe(8.0)
    expect(arredondarNotaEscolar(7.7)).toBe(8.0)
    expect(arredondarNotaEscolar(7.8)).toBe(8.0)
    expect(arredondarNotaEscolar(7.9)).toBe(8.0)
    expect(arredondarNotaEscolar('6,8')).toBe(7.0)
  })

  it('deve manter intactos valores exatos terminados em .0 ou .5', () => {
    expect(arredondarNotaEscolar(7.0)).toBe(7.0)
    expect(arredondarNotaEscolar(7.5)).toBe(7.5)
    expect(arredondarNotaEscolar('8.0')).toBe(8.0)
    expect(arredondarNotaEscolar('8.5')).toBe(8.5)
  })
})

describe('Regras Pedagógicas - Média com Recuperação', () => {
  it('deve calcular a média aritmética e aplicar arredondamento', () => {
    // (5.0 + 6.0) / 2 = 5.5 -> Arredondado 5.5 -> Reprovado (médias menores que 6.0 pós rec)
    const res1 = calcularMediaComRecuperacao(5.0, 6.0)
    expect(res1.mediaFinal).toBe(5.5)
    expect(res1.aprovado).toBe(false)

    // (5.0 + 7.0) / 2 = 6.0 -> Arredondado 6.0 -> Aprovado (limiar pós recuperação é 6.0)
    const res2 = calcularMediaComRecuperacao(5.0, 7.0)
    expect(res2.mediaFinal).toBe(6.0)
    expect(res2.aprovado).toBe(true)
  })

  it('deve aplicar arredondamento do teto de 0.5 sobre a média da recuperação', () => {
    // (5.0 + 6.3) / 2 = 5.65 -> 5.65 * 2 = 11.3 -> Math.ceil(11.3) = 12 -> 12 / 2 = 6.0 -> Aprovado
    const res = calcularMediaComRecuperacao(5.0, 6.3)
    expect(res.mediaFinal).toBe(6.0)
    expect(res.aprovado).toBe(true)
  })
})

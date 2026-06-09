import { createPessoa } from './src/actions/pessoa';
import { db } from './src/db';

async function main() {
  console.log("Starting test...");
  try {
    const payload = {
      nomeCompleto: 'Test User',
      cpf: '12345678901',
      genero: 'masculino' as const,
      estadoCivil: 'solteiro' as const,
      situacao: 'ativo' as const,
      classificacoes: ['interessado'] as any,
      contatos: [{ tipo: 'celular' as const, valor: '11999999999', principal: true }],
      endereco: {
        cep: '01001000',
        logradouro: 'Praça da Sé',
        numero: '1',
        bairro: 'Sé',
        cidade: 'São Paulo',
        uf: 'SP'
      }
    };
    const res = await createPessoa(payload);
    console.log("Result:", res);
  } catch (err) {
    console.error("Caught error:", err);
  }
  process.exit(0);
}
main();

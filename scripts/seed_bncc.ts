import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { disciplina } from '../src/db/schema';
import * as dotenv from 'dotenv';
import { resolve } from 'path';
import { eq } from 'drizzle-orm';

dotenv.config({ path: resolve(process.cwd(), '.env.local') });

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL is not set');
}

const seedClient = postgres(connectionString, { max: 1, prepare: false });
const db = drizzle(seedClient);

type TipoBase = 'basica' | 'complementar' | 'tecnica' | 'livre';
type FormaAvaliacao = 'numerica' | 'conceitual' | 'mista' | 'sem_avaliacao';

interface DisciplinaSeed {
  nome: string;
  sigla: string;
  tipoBase: TipoBase;
  formaAvaliacao: FormaAvaliacao;
  descricao?: string;
}

const bnccDisciplinas: DisciplinaSeed[] = [
  { nome: 'Língua Portuguesa', sigla: 'PORT', tipoBase: 'basica', formaAvaliacao: 'numerica', descricao: 'Base Nacional Comum Curricular' },
  { nome: 'Matemática', sigla: 'MAT', tipoBase: 'basica', formaAvaliacao: 'numerica', descricao: 'Base Nacional Comum Curricular' },
  { nome: 'Ciências', sigla: 'CIE', tipoBase: 'basica', formaAvaliacao: 'numerica', descricao: 'Base Nacional Comum Curricular' },
  { nome: 'História', sigla: 'HIST', tipoBase: 'basica', formaAvaliacao: 'numerica', descricao: 'Base Nacional Comum Curricular' },
  { nome: 'Geografia', sigla: 'GEO', tipoBase: 'basica', formaAvaliacao: 'numerica', descricao: 'Base Nacional Comum Curricular' },
  { nome: 'Artes', sigla: 'ART', tipoBase: 'basica', formaAvaliacao: 'conceitual', descricao: 'Base Nacional Comum Curricular' },
  { nome: 'Educação Física', sigla: 'EDF', tipoBase: 'basica', formaAvaliacao: 'conceitual', descricao: 'Base Nacional Comum Curricular' },
  { nome: 'Língua Inglesa', sigla: 'ING', tipoBase: 'basica', formaAvaliacao: 'numerica', descricao: 'Base Nacional Comum Curricular' },
  { nome: 'Ensino Religioso', sigla: 'REL', tipoBase: 'complementar', formaAvaliacao: 'conceitual', descricao: 'Área Complementar' },
];

async function seedBNCC() {
  console.log('🌱 Iniciando Seed das Disciplinas da BNCC...');
  
  let inseridas = 0;
  let ignoradas = 0;

  try {
    for (const d of bnccDisciplinas) {
      const existente = await db.select().from(disciplina).where(eq(disciplina.nome, d.nome));
      
      if (existente.length === 0) {
        await db.insert(disciplina).values({
          nome: d.nome,
          sigla: d.sigla,
          tipoBase: d.tipoBase,
          formaAvaliacao: d.formaAvaliacao,
          descricao: d.descricao,
        });
        inseridas++;
        console.log(`✅ Adicionada: ${d.nome}`);
      } else {
        ignoradas++;
        console.log(`⏭️ Ignorada (já existe): ${d.nome}`);
      }
    }
    
    console.log(`\n✨ Seed Finalizado! ${inseridas} inseridas, ${ignoradas} ignoradas.`);
  } catch (error) {
    console.error('❌ Erro durante o seed:', error);
  } finally {
    await seedClient.end();
    process.exit(0);
  }
}

seedBNCC();

import postgres from 'postgres';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const sql = postgres(process.env.DATABASE_URL);

async function run() {
  console.log('Applying pedagogico migration...');
  try {
    await sql`CREATE TYPE "public"."turno" AS ENUM('manha', 'tarde', 'noite', 'integral')`;
    console.log('Enum turno created');
  } catch(e) { console.log('Enum turno might exist:', e.message); }

  try {
    await sql`
CREATE TABLE "disciplina" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"nome" varchar(100) NOT NULL,
	"sigla" varchar(20),
	"descricao" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);`;
    console.log('Table disciplina created');
  } catch(e) { console.log('Table disciplina might exist:', e.message); }

  try {
    await sql`
CREATE TABLE "nivel_ensino" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"nome" varchar(100) NOT NULL,
	"descricao" text,
	"ordem_exibicao" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);`;
    console.log('Table nivel_ensino created');
  } catch(e) { console.log('Table nivel_ensino might exist:', e.message); }

  try {
    await sql`
CREATE TABLE "serie" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"nivel_ensino_id" uuid NOT NULL,
	"nome" varchar(100) NOT NULL,
	"ordem_exibicao" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);`;
    console.log('Table serie created');
  } catch(e) { console.log('Table serie might exist:', e.message); }

  try {
    await sql`
CREATE TABLE "turma" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"nome" varchar(100) NOT NULL,
	"serie_id" uuid,
	"turno" "turno" NOT NULL,
	"capacidade_maxima" integer DEFAULT 30,
	"ativa" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);`;
    console.log('Table turma created');
  } catch(e) { console.log('Table turma might exist:', e.message); }

  try {
    await sql`ALTER TABLE "serie" ADD CONSTRAINT "serie_nivel_ensino_id_nivel_ensino_id_fk" FOREIGN KEY ("nivel_ensino_id") REFERENCES "public"."nivel_ensino"("id") ON DELETE cascade ON UPDATE no action;`;
    console.log('FK serie -> nivel_ensino created');
  } catch(e) { console.log('FK serie might exist:', e.message); }

  try {
    await sql`ALTER TABLE "turma" ADD CONSTRAINT "turma_serie_id_serie_id_fk" FOREIGN KEY ("serie_id") REFERENCES "public"."serie"("id") ON DELETE restrict ON UPDATE no action;`;
    console.log('FK turma -> serie created');
  } catch(e) { console.log('FK turma might exist:', e.message); }

  console.log('Migration done.');
  process.exit(0);
}

run();

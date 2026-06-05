import { config } from 'dotenv';
config({ path: '.env.local' });

import postgres from 'postgres';

async function runMigration() {
  const sql = postgres(process.env.DATABASE_URL!, { prepare: false });

  try {
    console.log("Updating nivel_ensino...");
    await sql`ALTER TABLE "nivel_ensino" ADD COLUMN IF NOT EXISTS "eh_infantil" boolean DEFAULT false;`;
    await sql`ALTER TABLE "nivel_ensino" ADD COLUMN IF NOT EXISTS "icone" varchar(50);`;

    console.log("Updating avaliacao...");
    await sql`ALTER TABLE "avaliacao" ADD COLUMN IF NOT EXISTS "eh_recuperacao" boolean DEFAULT false;`;
    await sql`ALTER TABLE "avaliacao" ADD COLUMN IF NOT EXISTS "eh_recuperacao_final" boolean DEFAULT false;`;

    console.log("Updating nota...");
    await sql`ALTER TABLE "nota" ALTER COLUMN "valor" DROP NOT NULL;`;

    console.log("Phase 3 Migration successful!");
    process.exit(0);
  } catch (err) {
    console.error("Migration failed:", err);
    process.exit(1);
  }
}

runMigration();

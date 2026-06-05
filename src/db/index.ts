import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL!;

// Prevenir conexões múltiplas em desenvolvimento (singleton)
declare global {
  // eslint-disable-next-line no-var
  var postgresClient: postgres.Sql | undefined;
}

let client: postgres.Sql;

if (process.env.NODE_ENV === "production") {
  client = postgres(connectionString, { prepare: false });
} else {
  if (!global.postgresClient) {
    global.postgresClient = postgres(connectionString, { prepare: false });
  }
  client = global.postgresClient;
}

export const db = drizzle(client, { schema });

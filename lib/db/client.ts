import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { env } from "../env";
import { ukbDictionaryPg } from "./schema-pg";

function getSslConfig() {
  const mode = (env.PGSSL || env.DB_SSL || "").toLowerCase();
  if (["1", "true", "require", "on"].includes(mode)) {
    return { rejectUnauthorized: false };
  }
  return undefined;
}

let pool: Pool | null = null;

export function getPgPool() {
  if (!pool) {
    pool = new Pool({
      connectionString: env.DATABASE_URL,
      ssl: getSslConfig()
    });
  }

  return pool;
}

export const db = drizzle(getPgPool(), {
  schema: {
    ukbDictionary: ukbDictionaryPg
  }
});

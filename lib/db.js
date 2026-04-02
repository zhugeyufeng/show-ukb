import { Pool } from "pg";

let pool;

export function getPool() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not set.");
  }

  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.DATABASE_URL.includes("localhost")
        ? false
        : { rejectUnauthorized: false }
    });
  }

  return pool;
}

export async function query(text, params = []) {
  const currentPool = getPool();
  return currentPool.query(text, params);
}


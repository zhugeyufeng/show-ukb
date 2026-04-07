import { defineConfig } from "drizzle-kit";

const provider = process.env.DB_PROVIDER ?? "postgres";

export default defineConfig({
  dialect: provider === "sqlite" ? "sqlite" : "postgresql",
  schema: provider === "sqlite" ? "./lib/db/schema-sqlite.ts" : "./lib/db/schema-pg.ts",
  out: "./drizzle",
  dbCredentials:
    provider === "sqlite"
      ? {
          url: process.env.SQLITE_PATH ?? "./data/showukb.db"
        }
      : {
          url: process.env.DATABASE_URL ?? "postgres://postgres:postgres@localhost:5432/showukb"
        }
});

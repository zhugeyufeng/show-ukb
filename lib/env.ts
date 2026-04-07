import { z } from "zod";

export const envSchema = z.object({
  DB_PROVIDER: z.literal("postgres").default("postgres"),
  DATABASE_URL: z.string().default("postgres://postgres:postgres@localhost:5432/showukb"),
  PGSSL: z.string().optional(),
  DB_SSL: z.string().optional(),
  CSV_FILE: z.string().optional()
});

export const env = envSchema.parse(process.env);

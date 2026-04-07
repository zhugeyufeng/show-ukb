import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { handle } from "hono/vercel";
import { getFacetOptions, searchDictionary } from "@/lib/search/service";
import { searchQuerySchema } from "@/lib/search/types";

const app = new Hono().basePath("/api");

app.get("/health", (c) => c.json({ ok: true }));

app.get("/facets", async (c) => {
  const facets = await getFacetOptions();
  return c.json(facets);
});

app.get(
  "/search",
  zValidator("query", searchQuerySchema),
  async (c) => {
    const query = c.req.valid("query");
    const data = await searchDictionary(query);
    return c.json(data);
  }
);

export const GET = handle(app);

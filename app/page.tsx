import { Activity, Database, Layers3 } from "lucide-react";
import { SearchPanel } from "@/components/search-panel";
import { SearchResults } from "@/components/search-results";
import { Card, CardContent } from "@/components/ui/card";
import { getFacetOptions, searchDictionary } from "@/lib/search/service";
import { searchQuerySchema } from "@/lib/search/types";

export const dynamic = "force-dynamic";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function firstValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function Home({ searchParams }: { searchParams: SearchParams }) {
  const raw = await searchParams;

  const parsed = searchQuerySchema.parse({
    q: firstValue(raw?.q),
    entity: firstValue(raw?.entity),
    type: firstValue(raw?.type),
    folder: firstValue(raw?.folder),
    folderL1: firstValue(raw?.folderL1),
    folderL2: firstValue(raw?.folderL2),
    folderL3: firstValue(raw?.folderL3),
    folderL4: firstValue(raw?.folderL4),
    folderL5: firstValue(raw?.folderL5),
    page: firstValue(raw?.page),
    pageSize: firstValue(raw?.pageSize)
  });

  let facets: Awaited<ReturnType<typeof getFacetOptions>> = { entities: [], types: [], folders: [] };
  let results: Awaited<ReturnType<typeof searchDictionary>> = { total: 0, page: parsed.page, pageSize: parsed.pageSize, offset: 0, rows: [] };
  let loadError = "";

  try {
    [facets, results] = await Promise.all([getFacetOptions(), searchDictionary(parsed)]);
  } catch (error) {
    loadError = error instanceof Error ? error.message : "Unknown database error";
  }

  const folderLevels = [parsed.folderL1, parsed.folderL2, parsed.folderL3, parsed.folderL4, parsed.folderL5];

  return (
    <main className="mx-auto w-full max-w-[1440px] space-y-5 px-3 py-4 md:px-6 md:py-6">
      <section className="rounded-xl border bg-card/95 p-6 shadow-sm">
        <p className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-primary">
          WuLab Project
        </p>

        <h1 className="mt-3 text-3xl font-bold tracking-tight md:text-5xl">UK Biobank Data Dictionary</h1>
        <p className="mt-2 max-w-4xl text-sm leading-7 text-muted-foreground md:text-base">
         A tool for exploring and analyzing UK Biobank data.
        </p>

        <div className="mt-5 grid gap-3 md:grid-cols-3">
          <Card>
            <CardContent className="flex items-center justify-between p-4">
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Total Records</p>
                <p className="text-2xl font-semibold">{results.total.toLocaleString()}</p>
              </div>
              <Database className="h-5 w-5 text-primary" />
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center justify-between p-4">
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Current Page</p>
                <p className="text-2xl font-semibold">{results.page}</p>
              </div>
              <Layers3 className="h-5 w-5 text-primary" />
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center justify-between p-4">
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Shown</p>
                <p className="text-2xl font-semibold">{results.rows.length}</p>
              </div>
              <Activity className="h-5 w-5 text-primary" />
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-[340px_minmax(0,1fr)]">
        <SearchPanel
          query={parsed.q}
          entity={parsed.entity}
          type={parsed.type}
          folder={parsed.folder}
          folderLevels={folderLevels}
          page={parsed.page}
          pageSize={parsed.pageSize}
          facets={facets}
        />

        {loadError ? (
          <Card>
            <CardContent className="space-y-2 p-6 text-sm text-muted-foreground">
              <p className="text-base font-semibold text-foreground">Database Connection Failed</p>
              <p>{loadError}</p>
              <p>Check environment variables and confirm database initialization is complete.</p>
            </CardContent>
          </Card>
        ) : (
          <SearchResults query={parsed.q} entity={parsed.entity} type={parsed.type} folder={parsed.folder} folderLevels={folderLevels} data={results} />
        )}
      </section>

      <footer className="rounded-xl border bg-card/95 px-4 py-5 text-center text-sm text-muted-foreground">
        <p>Copyright ©️ 2026 WuLab. All rights reserved.</p>
        <p className="mt-1">Support：<a href="https://www.wu-lab.com">WuLab</a></p>
      </footer>
    </main>
  );
}



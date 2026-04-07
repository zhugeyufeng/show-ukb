import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { SearchResult, UkbRow } from "@/lib/search/types";

function buildPageHref({ query, entity, type, folder, page }: { query: string; entity: string; type: string; folder: string; page: number }) {
  const params = new URLSearchParams();
  if (query) params.set("q", query);
  if (entity) params.set("entity", entity);
  if (type) params.set("type", type);
  if (folder) params.set("folder", folder);
  if (page > 1) params.set("page", String(page));
  const search = params.toString();
  return search ? `/?${search}` : "/";
}

function DetailItem({ label, value, href }: { label: string; value: string | null; href?: string | null }) {
  if (!value) {
    return null;
  }

  return (
    <div className="rounded-md border bg-secondary/30 p-3">
      <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
      {href ? (
        <a href={href} target="_blank" rel="noreferrer" className="text-sm text-primary underline-offset-2 hover:underline">
          {value}
        </a>
      ) : (
        <p className="text-sm">{value}</p>
      )}
    </div>
  );
}

function ResultCard({ row }: { row: UkbRow }) {
  return (
    <Card className="border-border/70 bg-card/95">
      <CardContent className="space-y-4 p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-xl font-semibold">{row.title || row.name}</h3>
            <p className="font-mono text-xs text-muted-foreground">{row.name}</p>
          </div>
          <Badge variant="secondary">{row.entity || "unknown"}</Badge>
        </div>

        <div className="flex flex-wrap gap-2 text-xs">
          {row.type && <Badge variant="outline">type: {row.type}</Badge>}
          {row.units && <Badge variant="outline">units: {row.units}</Badge>}
          {row.folder_path && <Badge variant="outline">{row.folder_path}</Badge>}
        </div>

        {row.description && <p className="text-sm leading-7 text-muted-foreground">{row.description}</p>}

        <div className="grid gap-2 md:grid-cols-2">
          <DetailItem label="Primary Key Type" value={row.primary_key_type} />
          <DetailItem label="Coding Name" value={row.coding_name} />
          <DetailItem label="Concept" value={row.concept} />
          <DetailItem label="Is Multi Select" value={row.is_multi_select} />
          <DetailItem label="Is Sparse Coding" value={row.is_sparse_coding} />
          <DetailItem label="Longitudinal Axis" value={row.longitudinal_axis_type} />
          <DetailItem label="Referenced Entity Field" value={row.referenced_entity_field} />
          <DetailItem label="Relationship" value={row.relationship} />
          <DetailItem label="Linkout" value={row.linkout} href={row.linkout} />
        </div>
      </CardContent>
    </Card>
  );
}

export function SearchResults({ query, entity, type, folder, data }: { query: string; entity: string; type: string; folder: string; data: SearchResult }) {
  const totalPages = Math.max(1, Math.ceil(data.total / data.pageSize));

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-lg font-semibold">Results</h2>
        <p className="text-sm text-muted-foreground">
          {data.total.toLocaleString()} total, page {data.page} of {totalPages}
        </p>
      </div>

      {!data.rows.length ? (
        <Card>
          <CardContent className="p-8 text-center text-muted-foreground">No rows matched the current filters.</CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {data.rows.map((row) => (
            <ResultCard key={row.id} row={row} />
          ))}
        </div>
      )}

      <Card>
        <CardContent className="flex flex-wrap items-center justify-between gap-3 p-4">
          <p className="text-sm text-muted-foreground">
            Showing {data.total === 0 ? 0 : data.offset + 1} - {Math.min(data.offset + data.rows.length, data.total)}
          </p>
          <div className="flex gap-2">
            {data.page > 1 && (
              <Link className={buttonVariants({ variant: "secondary" })} href={buildPageHref({ query, entity, type, folder, page: data.page - 1 })}>
                Previous
              </Link>
            )}
            {data.page < totalPages && (
              <Link className={buttonVariants({ variant: "default" })} href={buildPageHref({ query, entity, type, folder, page: data.page + 1 })}>
                Next
              </Link>
            )}
          </div>
        </CardContent>
      </Card>
    </section>
  );
}

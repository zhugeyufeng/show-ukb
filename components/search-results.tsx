import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import type { SearchResult, UkbRow } from "@/lib/search/types";

function buildPageHref({ query, entity, type, folder, folderLevels, page, pageSize }: { query: string; entity: string; type: string; folder: string; folderLevels: string[]; page: number; pageSize: number; }) {
  const params = new URLSearchParams();
  if (query) params.set("q", query);
  if (entity) params.set("entity", entity);
  if (type) params.set("type", type);
  if (folder) params.set("folder", folder);
  if (folderLevels[0]) params.set("folderL1", folderLevels[0]);
  if (folderLevels[1]) params.set("folderL2", folderLevels[1]);
  if (folderLevels[2]) params.set("folderL3", folderLevels[2]);
  if (folderLevels[3]) params.set("folderL4", folderLevels[3]);
  if (folderLevels[4]) params.set("folderL5", folderLevels[4]);
  if (page > 1) params.set("page", String(page));
  if (pageSize !== 50) params.set("pageSize", String(pageSize));
  const search = params.toString();
  return search ? `/?${search}` : "/";
}

function buildExportHref({ query, entity, type, folder, folderLevels }: { query: string; entity: string; type: string; folder: string; folderLevels: string[]; }) {
  const params = new URLSearchParams();
  if (query) params.set("q", query);
  if (entity) params.set("entity", entity);
  if (type) params.set("type", type);
  if (folder) params.set("folder", folder);
  if (folderLevels[0]) params.set("folderL1", folderLevels[0]);
  if (folderLevels[1]) params.set("folderL2", folderLevels[1]);
  if (folderLevels[2]) params.set("folderL3", folderLevels[2]);
  if (folderLevels[3]) params.set("folderL4", folderLevels[3]);
  if (folderLevels[4]) params.set("folderL5", folderLevels[4]);
  const search = params.toString();
  return search ? `/api/export-field-ids?${search}` : "/api/export-field-ids";
}
function splitTitleParts(raw: string) {
  const parts = raw.split("|").map((part) => part.trim()).filter(Boolean);
  const mainTitle = parts[0] || raw;
  let instance: string | null = null;
  let array: string | null = null;
  const others: string[] = [];

  for (const part of parts.slice(1)) {
    if (/^instance\b/i.test(part)) { instance = part.replace(/^instance\s*/i, "").trim() || part; continue; }
    if (/^array\b/i.test(part)) { array = part.replace(/^array\s*/i, "").trim() || part; continue; }
    others.push(part);
  }

  return { mainTitle, instance, array, mergedMeta: others.join(" | ") };
}

function splitFolderHierarchy(path: string) {
  return path.split(" > ").map((part) => part.trim()).filter(Boolean);
}

type ParsedRow = { row: UkbRow; mainTitle: string; instance: string | null; array: string | null; mergedMeta: string; };
type ResultGroup = { key: string; mainTitle: string; mergedMeta: string; rows: ParsedRow[]; };

function toParsedRow(row: UkbRow): ParsedRow {
  const sourceTitle = row.title || row.name;
  const { mainTitle, mergedMeta, instance, array } = splitTitleParts(sourceTitle);
  return { row, mainTitle, mergedMeta, instance, array };
}

function groupRows(rows: UkbRow[]): ResultGroup[] {
  const map = new Map<string, ResultGroup>();
  for (const row of rows) {
    const parsed = toParsedRow(row);
    const key = [parsed.mainTitle, row.entity || "", row.folder_path || "", row.type || ""].join("||");
    const existing = map.get(key);
    if (existing) { existing.rows.push(parsed); continue; }
    map.set(key, { key, mainTitle: parsed.mainTitle, mergedMeta: parsed.mergedMeta, rows: [parsed] });
  }
  return Array.from(map.values());
}

function DetailItem({ label, value, href }: { label: string; value: string | null; href?: string | null }) {
  if (!value) return null;
  return (
    <div className="rounded-md border bg-secondary/30 p-3">
      <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
      {href ? <a href={href} target="_blank" rel="noreferrer" className="text-sm text-primary underline-offset-2 hover:underline">{value}</a> : <p className="text-sm">{value}</p>}
    </div>
  );
}

function ResultCard({ group, pageSize }: { group: ResultGroup; pageSize: number }) {
  const primary = group.rows[0].row;
  const folderParts = primary.folder_path ? splitFolderHierarchy(primary.folder_path) : [];
  const instanceSet = Array.from(new Set(group.rows.map((r) => r.instance).filter(Boolean))) as string[];
  const arraySet = Array.from(new Set(group.rows.map((r) => r.array).filter(Boolean))) as string[];

  return (
    <Card className="border-border/70 bg-card/95">
      <CardContent className="space-y-4 p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-xl font-semibold">{group.mainTitle}</h3>
            {group.mergedMeta ? <p className="mt-1 text-xs text-muted-foreground">{group.mergedMeta}</p> : null}
          </div>
          <Badge variant="secondary">{primary.entity || "unknown"}</Badge>
        </div>

        <div className="flex flex-wrap gap-2 text-xs">
          {instanceSet.map((i) => <Badge key={`i-${i}`} variant="outline">Instance: {i}</Badge>)}
          {arraySet.map((a) => <Badge key={`a-${a}`} variant="outline">Array: {a}</Badge>)}
        </div>

        <div className="overflow-auto rounded-md border">
          <table className="w-full text-xs">
            <thead className="bg-secondary/40 text-muted-foreground">
              <tr>
                <th className="px-2 py-2 text-left">Instance</th>
                <th className="px-2 py-2 text-left">Array</th>
                <th className="px-2 py-2 text-left">Field ID</th>
                <th className="px-2 py-2 text-left">Linkout</th>
              </tr>
            </thead>
            <tbody>
              {group.rows.map((item) => (
                <tr key={item.row.id} className="border-t">
                  <td className="px-2 py-1.5">{item.instance || "-"}</td>
                  <td className="px-2 py-1.5">{item.array || "-"}</td>
                  <td className="px-2 py-1.5 font-mono">{item.row.name}</td>
                  <td className="px-2 py-1.5">{item.row.linkout ? <a href={item.row.linkout} target="_blank" rel="noreferrer" className="text-primary underline-offset-2 hover:underline">Open</a> : "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="space-y-2 text-xs">
          <div className="flex flex-wrap gap-2">
            {primary.type && <Badge variant="outline">type: {primary.type}</Badge>}
            {primary.units && <Badge variant="outline">units: {primary.units}</Badge>}
            {primary.folder_path && <Link className={buttonVariants({ variant: "secondary" }) + " h-6 px-2 text-xs"} href={buildPageHref({ query: "", entity: "", type: "", folder: primary.folder_path, folderLevels: ["", "", "", "", ""], page: 1, pageSize })}>Filter Folder</Link>}
          </div>

          {folderParts.length > 0 && (
            <div className="flex flex-wrap items-center gap-1">
              {folderParts.map((part, index) => (
                <div key={`${part}-${index}`} className="inline-flex items-center gap-1">
                  {index > 0 ? <span className="text-muted-foreground">/</span> : null}
                  <span className="rounded-md border bg-secondary/30 px-2 py-1">{part}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {primary.description && <p className="text-sm leading-7 text-muted-foreground">{primary.description}</p>}

        <div className="grid gap-2 md:grid-cols-2">
          <DetailItem label="Primary Key Type" value={primary.primary_key_type} />
          <DetailItem label="Coding Name" value={primary.coding_name} />
          <DetailItem label="Concept" value={primary.concept} />
          <DetailItem label="Is Multi Select" value={primary.is_multi_select} />
          <DetailItem label="Is Sparse Coding" value={primary.is_sparse_coding} />
          <DetailItem label="Longitudinal Axis" value={primary.longitudinal_axis_type} />
          <DetailItem label="Referenced Entity Field" value={primary.referenced_entity_field} />
          <DetailItem label="Relationship" value={primary.relationship} />
        </div>
      </CardContent>
    </Card>
  );
}

export function SearchResults({ query, entity, type, folder, folderLevels, data }: { query: string; entity: string; type: string; folder: string; folderLevels: string[]; data: SearchResult; }) {
  const totalPages = Math.max(1, Math.ceil(data.total / data.pageSize));
  const groupedRows = groupRows(data.rows);

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-lg font-semibold">Results</h2>
        <div className="flex items-center gap-2">
          <p className="text-sm text-muted-foreground">{data.total.toLocaleString()} total, page {data.page} of {totalPages}</p>
          <a className={buttonVariants({ variant: "secondary" })} href={buildExportHref({ query, entity, type, folder, folderLevels })}>Export Field ID (.txt)</a>
        </div>
      </div>

      {!groupedRows.length ? (
        <Card><CardContent className="p-8 text-center text-muted-foreground">No rows matched the current filters.</CardContent></Card>
      ) : (
        <div className="space-y-3">{groupedRows.map((group) => <ResultCard key={group.key} group={group} pageSize={data.pageSize} />)}</div>
      )}

      <Card>
        <CardContent className="space-y-3 p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-muted-foreground">Showing {data.total === 0 ? 0 : data.offset + 1} - {Math.min(data.offset + data.rows.length, data.total)}</p>
            <div className="flex gap-2">
              {data.page > 1 && <Link className={buttonVariants({ variant: "secondary" })} href={buildPageHref({ query, entity, type, folder, folderLevels, page: data.page - 1, pageSize: data.pageSize })}>Previous</Link>}
              {data.page < totalPages && <Link className={buttonVariants({ variant: "default" })} href={buildPageHref({ query, entity, type, folder, folderLevels, page: data.page + 1, pageSize: data.pageSize })}>Next</Link>}
            </div>
          </div>

          <form action="/" className="grid gap-2 md:grid-cols-[1fr_1fr_auto]">
            <input type="hidden" name="q" value={query} />
            <input type="hidden" name="entity" value={entity} />
            <input type="hidden" name="type" value={type} />
            <input type="hidden" name="folder" value={folder} />
            <input type="hidden" name="folderL1" value={folderLevels[0] || ""} />
            <input type="hidden" name="folderL2" value={folderLevels[1] || ""} />
            <input type="hidden" name="folderL3" value={folderLevels[2] || ""} />
            <input type="hidden" name="folderL4" value={folderLevels[3] || ""} />
            <input type="hidden" name="folderL5" value={folderLevels[4] || ""} />

            <Select name="pageSize" defaultValue={String(data.pageSize)}>{[20, 50, 100].map((size) => <option key={size} value={size}>{size} / page</option>)}</Select>
            <Input name="page" type="number" min={1} max={totalPages} defaultValue={data.page} />
            <button type="submit" className={buttonVariants({ variant: "secondary" })}>Go</button>
          </form>
        </CardContent>
      </Card>
    </section>
  );
}


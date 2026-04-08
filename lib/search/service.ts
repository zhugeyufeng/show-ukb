import { getPgPool } from "@/lib/db/client";
import type { FacetItem, SearchQueryInput, SearchResult, UkbRow } from "@/lib/search/types";

function normalizeWhere(input: SearchQueryInput) {
  const clauses: string[] = [];
  const params: unknown[] = [];

  if (input.q) {
    const q = `%${input.q}%`;
    clauses.push(
      `(name ILIKE ? OR title ILIKE ? OR description ILIKE ? OR folder_path ILIKE ? OR concept ILIKE ? OR coding_name ILIKE ? OR units ILIKE ?)`
    );
    params.push(q, q, q, q, q, q, q);
  }

  if (input.entity) {
    clauses.push("entity = ?");
    params.push(input.entity);
  }

  if (input.type) {
    clauses.push("type = ?");
    params.push(input.type);
  }

  const folderLevels = [input.folderL1, input.folderL2, input.folderL3, input.folderL4, input.folderL5].filter(Boolean);

  if (folderLevels.length > 0) {
    const prefix = folderLevels.join(" > ");
    clauses.push("folder_path ILIKE ?");
    params.push(`${prefix}%`);
  } else if (input.folder) {
    clauses.push("folder_path = ?");
    params.push(input.folder);
  }

  return {
    where: clauses.length ? `WHERE ${clauses.join(" AND ")}` : "",
    params
  };
}

function toPgSql(text: string) {
  let index = 0;
  return text.replace(/\?/g, () => {
    index += 1;
    return `$${index}`;
  });
}

export async function searchDictionary(input: SearchQueryInput): Promise<SearchResult> {
  const offset = (input.page - 1) * input.pageSize;
  const pool = getPgPool();
  const where = normalizeWhere(input);

  const countSql = toPgSql(`SELECT COUNT(*)::int AS total FROM ukb_dictionary ${where.where}`);
  const rowsSql = toPgSql(
    `SELECT id, entity, name, type, primary_key_type, coding_name, concept, description, folder_path, is_multi_select, is_sparse_coding, linkout, longitudinal_axis_type, referenced_entity_field, relationship, title, units
     FROM ukb_dictionary
     ${where.where}
     ORDER BY CASE WHEN title IS NULL OR title = '' THEN 1 ELSE 0 END, title ASC, name ASC
     LIMIT ? OFFSET ?`
  );

  const countRes = await pool.query<{ total: number }>(countSql, where.params);
  const rowsRes = await pool.query<UkbRow>(rowsSql, [...where.params, input.pageSize, offset]);

  return {
    total: countRes.rows[0]?.total ?? 0,
    page: input.page,
    pageSize: input.pageSize,
    offset,
    rows: rowsRes.rows
  };
}

export async function exportFieldIds(input: SearchQueryInput): Promise<string[]> {
  const pool = getPgPool();
  const where = normalizeWhere(input);
  const sql = toPgSql(
    `SELECT DISTINCT name
     FROM ukb_dictionary
     ${where.where}
     ORDER BY name ASC`
  );
  const res = await pool.query<{ name: string }>(sql, where.params);
  return res.rows.map((row) => row.name).filter(Boolean);
}
export async function getFacetOptions() {
  const pool = getPgPool();

  const queryFacet = async (column: string, limit: number): Promise<FacetItem[]> => {
    const text = `SELECT ${column} AS value, COUNT(*) AS count FROM ukb_dictionary WHERE ${column} IS NOT NULL AND ${column} <> '' GROUP BY ${column} ORDER BY count DESC, value ASC LIMIT ?`;
    const q = toPgSql(text);
    const res = await pool.query<FacetItem>(q, [limit]);
    return res.rows.map((row: FacetItem) => ({ value: row.value, count: Number(row.count) }));
  };

  const [entities, types, folders] = await Promise.all([
    queryFacet("entity", 50),
    queryFacet("type", 50),
    queryFacet("folder_path", 200)
  ]);

  return { entities, types, folders };
}


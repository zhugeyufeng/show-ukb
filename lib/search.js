import { query } from "@/lib/db";

function buildWhereClause({ queryText, entity, type, folder }) {
  const clauses = [];
  const values = [];

  if (queryText) {
    values.push(`%${queryText}%`);
    const placeholder = `$${values.length}`;
    clauses.push(`
      (
        name ILIKE ${placeholder}
        OR title ILIKE ${placeholder}
        OR description ILIKE ${placeholder}
        OR folder_path ILIKE ${placeholder}
        OR concept ILIKE ${placeholder}
        OR coding_name ILIKE ${placeholder}
        OR units ILIKE ${placeholder}
      )
    `);
  }

  if (entity) {
    values.push(entity);
    clauses.push(`entity = $${values.length}`);
  }

  if (type) {
    values.push(type);
    clauses.push(`type = $${values.length}`);
  }

  if (folder) {
    values.push(folder);
    clauses.push(`folder_path = $${values.length}`);
  }

  return {
    values,
    sql: clauses.length ? `WHERE ${clauses.join(" AND ")}` : ""
  };
}

export async function searchDictionary({ query: queryText, entity, type, folder, page, pageSize }) {
  const offset = (page - 1) * pageSize;
  const where = buildWhereClause({ queryText, entity, type, folder });

  const countResult = await query(
    `SELECT COUNT(*)::int AS total FROM ukb_dictionary ${where.sql}`,
    where.values
  );

  const rowsResult = await query(
    `
      SELECT
        id,
        entity,
        name,
        type,
        primary_key_type,
        coding_name,
        concept,
        description,
        folder_path,
        is_multi_select,
        is_sparse_coding,
        linkout,
        longitudinal_axis_type,
        referenced_entity_field,
        relationship,
        title,
        units
      FROM ukb_dictionary
      ${where.sql}
      ORDER BY
        CASE WHEN title IS NULL OR title = '' THEN 1 ELSE 0 END,
        title ASC,
        name ASC
      LIMIT $${where.values.length + 1}
      OFFSET $${where.values.length + 2}
    `,
    [...where.values, pageSize, offset]
  );

  return {
    total: countResult.rows[0]?.total || 0,
    page,
    pageSize,
    offset,
    rows: rowsResult.rows
  };
}

async function getFacetCounts(column, limit = 200) {
  const result = await query(
    `
      SELECT ${column} AS value, COUNT(*)::int AS count
      FROM ukb_dictionary
      WHERE ${column} IS NOT NULL AND ${column} <> ''
      GROUP BY ${column}
      ORDER BY count DESC, value ASC
      LIMIT $1
    `,
    [limit]
  );

  return result.rows;
}

export async function getFacetOptions() {
  const [entities, types, folders] = await Promise.all([
    getFacetCounts("entity", 50),
    getFacetCounts("type", 50),
    getFacetCounts("folder_path", 200)
  ]);

  return { entities, types, folders };
}


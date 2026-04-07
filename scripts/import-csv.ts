import fs from "node:fs";
import path from "node:path";
import { parse } from "csv-parse";
import { env } from "@/lib/env";
import { getPgPool } from "@/lib/db/client";

const csvFile = env.CSV_FILE || "app1053989_20251123012801.dataset.data_dictionary.csv";
const csvPath = path.join(process.cwd(), csvFile);
const batchSize = 500;

function normalizeValue(value: unknown) {
  if (value === undefined || value === null) {
    return null;
  }

  const trimmed = String(value).trim();
  return trimmed === "" ? null : trimmed;
}

function toBooleanText(value: unknown) {
  const normalized = normalizeValue(value);
  if (!normalized) {
    return null;
  }

  const lowered = normalized.toLowerCase();
  if (["true", "1", "yes"].includes(lowered)) {
    return "true";
  }
  if (["false", "0", "no"].includes(lowered)) {
    return "false";
  }

  return normalized;
}

type InsertRow = {
  entity: string | null;
  name: string;
  type: string | null;
  primary_key_type: string | null;
  coding_name: string | null;
  concept: string | null;
  description: string | null;
  folder_path: string | null;
  is_multi_select: string | null;
  is_sparse_coding: string | null;
  linkout: string | null;
  longitudinal_axis_type: string | null;
  referenced_entity_field: string | null;
  relationship: string | null;
  title: string | null;
  units: string | null;
};

async function main() {
  const pool = getPgPool();
  const parser = fs.createReadStream(csvPath).pipe(parse({ columns: true, skip_empty_lines: true, bom: true }));

  const rows: InsertRow[] = [];
  let total = 0;

  const flush = async () => {
    if (!rows.length) return;

    const values: unknown[] = [];
    const placeholders = rows.map((row, idx) => {
      const start = idx * 16;
      values.push(
        row.entity,
        row.name,
        row.type,
        row.primary_key_type,
        row.coding_name,
        row.concept,
        row.description,
        row.folder_path,
        row.is_multi_select,
        row.is_sparse_coding,
        row.linkout,
        row.longitudinal_axis_type,
        row.referenced_entity_field,
        row.relationship,
        row.title,
        row.units
      );
      return `($${start + 1}, $${start + 2}, $${start + 3}, $${start + 4}, $${start + 5}, $${start + 6}, $${start + 7}, $${start + 8}, $${start + 9}, $${start + 10}, $${start + 11}, $${start + 12}, $${start + 13}, $${start + 14}, $${start + 15}, $${start + 16})`;
    });

    await pool.query(
      `INSERT INTO ukb_dictionary (
        entity, name, type, primary_key_type, coding_name, concept, description, folder_path,
        is_multi_select, is_sparse_coding, linkout, longitudinal_axis_type, referenced_entity_field,
        relationship, title, units
      ) VALUES ${placeholders.join(",")}`,
      values
    );

    total += rows.length;
    rows.length = 0;
    console.log(`Imported ${total} rows...`);
  };

  await pool.query("TRUNCATE TABLE ukb_dictionary RESTART IDENTITY");

  for await (const record of parser) {
    rows.push({
      entity: normalizeValue(record.entity),
      name: normalizeValue(record.name) || "",
      type: normalizeValue(record.type),
      primary_key_type: normalizeValue(record.primary_key_type),
      coding_name: normalizeValue(record.coding_name),
      concept: normalizeValue(record.concept),
      description: normalizeValue(record.description),
      folder_path: normalizeValue(record.folder_path),
      is_multi_select: toBooleanText(record.is_multi_select),
      is_sparse_coding: toBooleanText(record.is_sparse_coding),
      linkout: normalizeValue(record.linkout),
      longitudinal_axis_type: normalizeValue(record.longitudinal_axis_type),
      referenced_entity_field: normalizeValue(record.referenced_entity_field),
      relationship: normalizeValue(record.relationship),
      title: normalizeValue(record.title),
      units: normalizeValue(record.units)
    });

    if (rows.length >= batchSize) {
      await flush();
    }
  }

  await flush();
  console.log(`Import complete. ${total} rows inserted.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

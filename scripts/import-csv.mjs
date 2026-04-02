import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";
import { parse } from "csv-parse";

const { Client } = pg;

const CSV_FILE = process.env.CSV_FILE || "app1053989_20251123012801.dataset.data_dictionary.csv";
const BATCH_SIZE = 500;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const csvPath = path.join(__dirname, "..", CSV_FILE);

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set.");
}

function normalizeValue(value) {
  if (value === undefined || value === null) {
    return null;
  }

  const trimmed = String(value).trim();
  return trimmed === "" ? null : trimmed;
}

function toBooleanText(value) {
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

async function insertBatch(client, rows) {
  if (!rows.length) {
    return;
  }

  const values = [];
  const placeholders = rows.map((row, index) => {
    const start = index * 16;
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

  await client.query(
    `
      INSERT INTO ukb_dictionary (
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
      )
      VALUES ${placeholders.join(", ")}
    `,
    values
  );
}

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL.includes("localhost")
    ? false
    : { rejectUnauthorized: false }
});

await client.connect();

const parser = fs
  .createReadStream(csvPath)
  .pipe(parse({ columns: true, skip_empty_lines: true, bom: true }));

let total = 0;
let batch = [];

try {
  await client.query("BEGIN");
  await client.query("TRUNCATE TABLE ukb_dictionary RESTART IDENTITY");

  for await (const record of parser) {
    batch.push({
      entity: normalizeValue(record.entity),
      name: normalizeValue(record.name),
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

    if (batch.length >= BATCH_SIZE) {
      await insertBatch(client, batch);
      total += batch.length;
      batch = [];
      console.log(`Imported ${total} rows...`);
    }
  }

  if (batch.length) {
    await insertBatch(client, batch);
    total += batch.length;
  }

  await client.query("COMMIT");
  console.log(`Import complete. ${total} rows inserted.`);
} catch (error) {
  await client.query("ROLLBACK");
  throw error;
} finally {
  await client.end();
}


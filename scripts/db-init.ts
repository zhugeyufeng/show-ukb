import { getPgPool } from "../lib/db/client";

async function main() {
  const pool = getPgPool();

  await pool.query(`
    CREATE TABLE IF NOT EXISTS ukb_dictionary (
      id BIGSERIAL PRIMARY KEY,
      entity TEXT,
      name TEXT NOT NULL,
      type TEXT,
      primary_key_type TEXT,
      coding_name TEXT,
      concept TEXT,
      description TEXT,
      folder_path TEXT,
      is_multi_select TEXT,
      is_sparse_coding TEXT,
      linkout TEXT,
      longitudinal_axis_type TEXT,
      referenced_entity_field TEXT,
      relationship TEXT,
      title TEXT,
      units TEXT
    );
    CREATE INDEX IF NOT EXISTS ukb_dictionary_name_idx ON ukb_dictionary (name);
    CREATE INDEX IF NOT EXISTS ukb_dictionary_title_idx ON ukb_dictionary (title);
    CREATE INDEX IF NOT EXISTS ukb_dictionary_entity_idx ON ukb_dictionary (entity);
    CREATE INDEX IF NOT EXISTS ukb_dictionary_type_idx ON ukb_dictionary (type);
    CREATE INDEX IF NOT EXISTS ukb_dictionary_folder_path_idx ON ukb_dictionary (folder_path);
  `);

  console.log("Database schema initialized for PostgreSQL.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

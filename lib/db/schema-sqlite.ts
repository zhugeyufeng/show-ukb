import { sqliteTable, integer, text } from "drizzle-orm/sqlite-core";

export const ukbDictionarySqlite = sqliteTable("ukb_dictionary", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  entity: text("entity"),
  name: text("name").notNull(),
  type: text("type"),
  primaryKeyType: text("primary_key_type"),
  codingName: text("coding_name"),
  concept: text("concept"),
  description: text("description"),
  folderPath: text("folder_path"),
  isMultiSelect: text("is_multi_select"),
  isSparseCoding: text("is_sparse_coding"),
  linkout: text("linkout"),
  longitudinalAxisType: text("longitudinal_axis_type"),
  referencedEntityField: text("referenced_entity_field"),
  relationship: text("relationship"),
  title: text("title"),
  units: text("units")
});

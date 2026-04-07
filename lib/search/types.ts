import { z } from "zod";

export const searchQuerySchema = z.object({
  q: z.string().default(""),
  entity: z.string().default(""),
  type: z.string().default(""),
  folder: z.string().default(""),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(50)
});

export type SearchQueryInput = z.infer<typeof searchQuerySchema>;

export type UkbRow = {
  id: number;
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

export type FacetItem = {
  value: string;
  count: number;
};

export type SearchResult = {
  total: number;
  page: number;
  pageSize: number;
  offset: number;
  rows: UkbRow[];
};

import Link from "next/link";
import { Search, RefreshCcw } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import type { FacetItem } from "@/lib/search/types";

type Facets = {
  entities: FacetItem[];
  types: FacetItem[];
  folders: FacetItem[];
};

type Props = {
  query: string;
  entity: string;
  type: string;
  folder: string;
  facets: Facets;
};

export function SearchPanel({ query, entity, type, folder, facets }: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Filters</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <form action="/" className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="q">
              Keyword
            </label>
            <Input id="q" name="q" type="search" defaultValue={query} placeholder="name / title / description / folder" />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="entity">
              Entity
            </label>
            <Select id="entity" name="entity" defaultValue={entity}>
              <option value="">All</option>
              {facets.entities.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.value} ({item.count})
                </option>
              ))}
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="type">
              Type
            </label>
            <Select id="type" name="type" defaultValue={type}>
              <option value="">All</option>
              {facets.types.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.value} ({item.count})
                </option>
              ))}
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="folder">
              Folder Path
            </label>
            <Select id="folder" name="folder" defaultValue={folder}>
              <option value="">All</option>
              {facets.folders.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.value} ({item.count})
                </option>
              ))}
            </Select>
          </div>

          <div className="flex gap-2">
            <Button type="submit" className="gap-2">
              <Search className="h-4 w-4" /> Search
            </Button>
            <Link href="/" className={buttonVariants({ variant: "secondary" })}>
              <span className="inline-flex items-center gap-2">
                <RefreshCcw className="h-4 w-4" /> Reset
              </span>
            </Link>
          </div>
        </form>

        <p className="rounded-md border border-dashed p-3 text-sm text-muted-foreground">
          Query execution runs on the Next.js server, and data access is unified by Drizzle ORM.
        </p>
      </CardContent>
    </Card>
  );
}

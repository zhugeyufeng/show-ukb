"use client";

import { useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Search, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
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
  folderLevels: string[];
  page: number;
  pageSize: number;
  facets: Facets;
};

function splitFolder(path: string) {
  return path.split(" > ").map((s) => s.trim()).filter(Boolean);
}

function getLevelOptions(paths: string[], selected: string[], level: number) {
  const set = new Set<string>();
  for (const path of paths) {
    const parts = splitFolder(path);
    if (parts.length <= level) continue;

    let matched = true;
    for (let i = 0; i < level; i += 1) {
      if (!selected[i] || parts[i] !== selected[i]) {
        matched = false;
        break;
      }
    }

    if (matched) set.add(parts[level]);
  }

  return Array.from(set).sort((a, b) => a.localeCompare(b));
}

export function SearchPanel({ query, entity, type, folder, folderLevels, page, pageSize, facets }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const formRef = useRef<HTMLFormElement>(null);

  const [selected, setSelected] = useState<string[]>([
    folderLevels[0] || "",
    folderLevels[1] || "",
    folderLevels[2] || "",
    folderLevels[3] || "",
    folderLevels[4] || ""
  ]);

  const folderPaths = facets.folders.map((f) => f.value);
  const l1Options = getLevelOptions(folderPaths, selected, 0);
  const l2Options = getLevelOptions(folderPaths, selected, 1);
  const l3Options = getLevelOptions(folderPaths, selected, 2);
  const l4Options = getLevelOptions(folderPaths, selected, 3);
  const l5Options = getLevelOptions(folderPaths, selected, 4);

  const handleLevelChange = (index: number, value: string) => {
    setSelected((prev) => {
      const next = [...prev];
      next[index] = value;
      for (let i = index + 1; i < next.length; i += 1) {
        next[i] = "";
      }
      return next;
    });
  };

  const handleReset = () => {
    formRef.current?.reset();
    setSelected(["", "", "", "", ""]);
    router.push(pathname || "/");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Filters</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <form ref={formRef} action="/" className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="q">Keyword</label>
            <Input id="q" name="q" type="search" defaultValue={query} placeholder="name / title / description / folder" />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="entity">Entity</label>
            <Select id="entity" name="entity" defaultValue={entity}>
              <option value="">All</option>
              {facets.entities.map((item) => <option key={item.value} value={item.value}>{item.value} ({item.count})</option>)}
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="type">Type</label>
            <Select id="type" name="type" defaultValue={type}>
              <option value="">All</option>
              {facets.types.map((item) => <option key={item.value} value={item.value}>{item.value} ({item.count})</option>)}
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Folder Path (By Level)</label>
            <div className="grid gap-2">
              <Select name="folderL1" value={selected[0]} onChange={(e) => handleLevelChange(0, e.target.value)}>
                <option value="">Level 1</option>
                {l1Options.map((v) => <option key={v} value={v}>{v}</option>)}
              </Select>
              <Select name="folderL2" value={selected[1]} onChange={(e) => handleLevelChange(1, e.target.value)}>
                <option value="">Level 2</option>
                {l2Options.map((v) => <option key={v} value={v}>{v}</option>)}
              </Select>
              <Select name="folderL3" value={selected[2]} onChange={(e) => handleLevelChange(2, e.target.value)}>
                <option value="">Level 3</option>
                {l3Options.map((v) => <option key={v} value={v}>{v}</option>)}
              </Select>
              <Select name="folderL4" value={selected[3]} onChange={(e) => handleLevelChange(3, e.target.value)}>
                <option value="">Level 4</option>
                {l4Options.map((v) => <option key={v} value={v}>{v}</option>)}
              </Select>
              <Select name="folderL5" value={selected[4]} onChange={(e) => handleLevelChange(4, e.target.value)}>
                <option value="">Level 5</option>
                {l5Options.map((v) => <option key={v} value={v}>{v}</option>)}
              </Select>
            </div>
          </div>

          <input type="hidden" name="folder" value={folder} />

          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="pageSize">Per Page</label>
              <Select id="pageSize" name="pageSize" defaultValue={String(pageSize)}>
                {[20, 50, 100].map((size) => <option key={size} value={size}>{size}</option>)}
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="page">Page</label>
              <Input id="page" name="page" type="number" min={1} defaultValue={page} />
            </div>
          </div>

          <div className="flex gap-2">
            <Button type="submit" className="gap-2"><Search className="h-4 w-4" /> Search</Button>
            <Button type="button" variant="secondary" className="gap-2" onClick={handleReset}><RefreshCcw className="h-4 w-4" /> Reset</Button>
          </div>
        </form>

        <p className="rounded-md border border-dashed p-3 text-sm text-muted-foreground">Selecting levels only updates the next-level options. Click Search to run the query.</p>
      </CardContent>
    </Card>
  );
}

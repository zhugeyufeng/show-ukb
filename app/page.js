import { SearchPanel } from "@/components/search-panel";
import { SearchResults } from "@/components/search-results";
import { getFacetOptions, searchDictionary } from "@/lib/search";

export const dynamic = "force-dynamic";

function firstValue(value) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function Home({ searchParams }) {
  const params = await searchParams;
  const query = firstValue(params?.q) || "";
  const entity = firstValue(params?.entity) || "";
  const type = firstValue(params?.type) || "";
  const folder = firstValue(params?.folder) || "";
  const page = Math.max(1, Number.parseInt(firstValue(params?.page) || "1", 10) || 1);

  const [facets, results] = await Promise.all([
    getFacetOptions(),
    searchDictionary({ query, entity, type, folder, page, pageSize: 50 })
  ]);

  return (
    <main className="page-shell">
      <section className="hero">
        <div className="hero-copy">
          <span className="eyebrow">Vercel + Postgres</span>
          <h1>UK Biobank 数据字典查询</h1>
          <p className="subtitle">
            CSV 已转换为数据库查询模式。页面部署在 Vercel，数据来自 Postgres，可按关键词、实体、类型和目录进行组合检索。
          </p>
        </div>
        <div className="hero-stats">
          <div className="stat-card">
            <span>总记录</span>
            <strong>{results.total.toLocaleString()}</strong>
          </div>
          <div className="stat-card">
            <span>当前页</span>
            <strong>{results.page}</strong>
          </div>
          <div className="stat-card">
            <span>每页结果</span>
            <strong>{results.rows.length}</strong>
          </div>
        </div>
      </section>

      <section className="workspace">
        <SearchPanel
          query={query}
          entity={entity}
          type={type}
          folder={folder}
          facets={facets}
        />
        <SearchResults
          query={query}
          entity={entity}
          type={type}
          folder={folder}
          data={results}
        />
      </section>
    </main>
  );
}


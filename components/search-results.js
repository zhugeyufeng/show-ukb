import Link from "next/link";

function buildPageHref({ query, entity, type, folder, page }) {
  const params = new URLSearchParams();
  if (query) params.set("q", query);
  if (entity) params.set("entity", entity);
  if (type) params.set("type", type);
  if (folder) params.set("folder", folder);
  if (page > 1) params.set("page", String(page));
  const search = params.toString();
  return search ? `/?${search}` : "/";
}

function DetailCard({ label, value, href }) {
  if (!value) {
    return null;
  }

  return (
    <div className="detail-card">
      <strong>{label}</strong>
      {href ? (
        <a href={href} target="_blank" rel="noreferrer">{value}</a>
      ) : (
        <span>{value}</span>
      )}
    </div>
  );
}

export function SearchResults({ query, entity, type, folder, data }) {
  const totalPages = Math.max(1, Math.ceil(data.total / data.pageSize));

  return (
    <section className="results-panel">
      <div className="results-head">
        <h2 className="panel-title">查询结果</h2>
        <p>
          共 {data.total.toLocaleString()} 条，当前第 {data.page} / {totalPages} 页
        </p>
      </div>

      {!data.rows.length ? (
        <div className="empty-state">
          当前筛选条件没有匹配结果。可以缩短关键词，或者取消部分筛选项。
        </div>
      ) : (
        <div className="result-grid">
          {data.rows.map((row) => (
            <article className="result-card" key={row.id}>
              <div className="result-header">
                <div>
                  <h3>{row.title || row.name}</h3>
                  <div className="code-name">{row.name}</div>
                </div>
                <span className="badge">{row.entity || "unknown"}</span>
              </div>

              <div className="meta-row">
                {row.type && <span className="meta-pill">type: {row.type}</span>}
                {row.units && <span className="meta-pill">units: {row.units}</span>}
                {row.folder_path && <span className="meta-pill">{row.folder_path}</span>}
              </div>

              {row.description && <p className="description">{row.description}</p>}

              <div className="detail-grid">
                <DetailCard label="Primary Key Type" value={row.primary_key_type} />
                <DetailCard label="Coding Name" value={row.coding_name} />
                <DetailCard label="Concept" value={row.concept} />
                <DetailCard label="Is Multi Select" value={row.is_multi_select} />
                <DetailCard label="Is Sparse Coding" value={row.is_sparse_coding} />
                <DetailCard label="Longitudinal Axis Type" value={row.longitudinal_axis_type} />
                <DetailCard label="Referenced Entity Field" value={row.referenced_entity_field} />
                <DetailCard label="Relationship" value={row.relationship} />
                <DetailCard label="Linkout" value={row.linkout} href={row.linkout} />
              </div>
            </article>
          ))}
        </div>
      )}

      <div className="pager">
        <p>
          显示 {data.total === 0 ? 0 : data.offset + 1} - {Math.min(data.offset + data.rows.length, data.total)}
        </p>
        <div className="form-actions">
          {data.page > 1 ? (
            <Link
              className="btn btn-secondary"
              href={buildPageHref({ query, entity, type, folder, page: data.page - 1 })}
            >
              上一页
            </Link>
          ) : (
            <span />
          )}
          {data.page < totalPages ? (
            <Link
              className="btn btn-primary"
              href={buildPageHref({ query, entity, type, folder, page: data.page + 1 })}
            >
              下一页
            </Link>
          ) : (
            <span />
          )}
        </div>
      </div>
    </section>
  );
}


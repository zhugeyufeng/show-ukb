export function SearchPanel({ query, entity, type, folder, facets }) {
  return (
    <aside className="search-panel">
      <h2 className="panel-title">查询条件</h2>
      <form className="search-form" action="/">
        <div className="field">
          <label htmlFor="q">关键词</label>
          <input
            id="q"
            name="q"
            type="search"
            defaultValue={query}
            placeholder="name / title / description / folder"
          />
        </div>

        <div className="field">
          <label htmlFor="entity">Entity</label>
          <select id="entity" name="entity" defaultValue={entity}>
            <option value="">全部</option>
            {facets.entities.map((item) => (
              <option key={item.value} value={item.value}>
                {item.value} ({item.count})
              </option>
            ))}
          </select>
        </div>

        <div className="field">
          <label htmlFor="type">Type</label>
          <select id="type" name="type" defaultValue={type}>
            <option value="">全部</option>
            {facets.types.map((item) => (
              <option key={item.value} value={item.value}>
                {item.value} ({item.count})
              </option>
            ))}
          </select>
        </div>

        <div className="field">
          <label htmlFor="folder">Folder Path</label>
          <select id="folder" name="folder" defaultValue={folder}>
            <option value="">全部</option>
            {facets.folders.map((item) => (
              <option key={item.value} value={item.value}>
                {item.value} ({item.count})
              </option>
            ))}
          </select>
        </div>

        <div className="form-actions">
          <button className="btn btn-primary" type="submit">查询</button>
          <a className="btn btn-secondary" href="/">重置</a>
        </div>
      </form>

      <div className="hint">
        当前页面读取 Postgres 数据，不再直接在浏览器中处理 8MB CSV。部署到 Vercel 后，查询逻辑会在服务端执行。
      </div>
    </aside>
  );
}


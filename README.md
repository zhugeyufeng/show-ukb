# showukb

把 UK Biobank 数据字典 CSV 转成可部署到 Vercel 的网站与数据库方案。

## 技术栈

- Next.js App Router
- Postgres
- `pg` 直连数据库
- `csv-parse` 导入 CSV

## 本地开发

1. 安装依赖

```bash
npm install
```

2. 准备环境变量

创建 `.env.local`：

```bash
DATABASE_URL="postgres://..."
```

3. 初始化数据库

```bash
npm run db:init
```

4. 导入 CSV

```bash
npm run db:import
```

如需指定其他文件：

```bash
CSV_FILE=another.csv npm run db:import
```

5. 启动本地开发

```bash
npm run dev
```

## 部署到 Vercel

1. 把仓库推到 GitHub。
2. 在 Vercel 导入该仓库创建项目。
3. 在 Vercel 项目中添加 Postgres 集成。
   截至 2025 年 9 月 Vercel 官方文档，Postgres 属于 Marketplace Storage integrations；旧的 `Vercel Postgres` 已被替换。
4. 将集成注入的 `DATABASE_URL` 提供给项目。
5. 首次导入数据时，可在本地执行：

```bash
vercel env pull .env.local
npm install
npm run db:init
npm run db:import
```

也可以在连接到同一数据库的 CI 或临时脚本环境里执行这两个命令。

## 数据模型

当前 CSV 被导入到单表 `ukb_dictionary`，字段与原始表头基本一一对应：

- `entity`
- `name`
- `type`
- `primary_key_type`
- `coding_name`
- `concept`
- `description`
- `folder_path`
- `is_multi_select`
- `is_sparse_coding`
- `linkout`
- `longitudinal_axis_type`
- `referenced_entity_field`
- `relationship`
- `title`
- `units`

## 说明

- 页面查询逻辑运行在服务端，避免浏览器直接处理大 CSV。
- 当前实现使用 `ILIKE` 做组合搜索，适合先快速上线。
- 如果后续要做更快的全文检索，可以继续加 trigram 或全文索引。

## 部署到 1Panel

推荐方式是使用 1Panel 的“容器 -> 编排”导入本项目根目录中的 `docker-compose.yml`，只运行 `web` 服务，数据库使用 1Panel 已安装的 PostgreSQL。

1. 将项目上传到服务器，例如 `/opt/1panel/apps/showukb`
2. 按需修改 `.env.docker`
   将 `DATABASE_URL` 改成 1Panel PostgreSQL 的实际连接串
3. 在 1Panel 中进入“容器 -> 编排 -> 创建编排”
4. 选择当前项目目录，导入 `docker-compose.yml`
5. 启动编排
6. 首次初始化数据：

```bash
docker exec -it showukb-web npm run db:init
docker exec -it showukb-web npm run db:import
```

7. 在 1Panel 的“网站”中创建“反向代理”站点，代理到 `127.0.0.1:3000`

`DATABASE_URL` 示例：

```bash
postgres://showukb:your_password@127.0.0.1:5432/showukb
```

如果你的 PostgreSQL 不在本机，或者 Compose 网络无法访问 `127.0.0.1`，请改成数据库实际可访问的内网地址。


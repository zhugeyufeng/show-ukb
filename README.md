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


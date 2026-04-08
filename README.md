# showukb
Demo WebSite：https://ukbdd.wu-lab.com

UK Biobank data dictionary search app rebuilt with:

- TypeScript
- Next.js (App Router)
- Tailwind CSS
- shadcn/ui style components
- Lucide Icons
- Hono + Zod API
- PostgreSQL
- Drizzle ORM

## Quick Start

1. Install dependencies:

```bash
npm install
```

2. Configure env:

```bash
cp .env.example .env.local
```

3. Initialize schema:

```bash
npm run db:init
```

4. Import CSV:

```bash
npm run db:import
```

5. Run dev server:

```bash
npm run dev
```

## Environment Variables

- `DB_PROVIDER=postgres`
- `DATABASE_URL=...`
- `CSV_FILE=...` optional, defaults to bundled UKB CSV
- `PGSSL=require` optional for managed PostgreSQL

## Hono API

- `GET /api/health`
- `GET /api/facets`
- `GET /api/search?q=&entity=&type=&folder=&page=1&pageSize=50`

## DB Commands

- `npm run db:init`
- `npm run db:import`
- `npm run db:push`

## Build

```bash
npm run typecheck
npm run build
```

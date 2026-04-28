# Accounting System (Next.js + Supabase + Prisma)

Production-ready starter for an accounting workflow with:

- Factory Bills
- Store Transactions (income/expense)
- Tax Records
- Dashboard summary
- Master Data (categories/products)

## Stack

- Next.js App Router + TypeScript
- Prisma ORM + Supabase PostgreSQL
- TailwindCSS + Shadcn-style UI components
- React Hook Form + Zod validation

## Setup

1. Copy env:

```bash
cp .env.example .env
```

2. Update `DATABASE_URL` with Supabase Postgres URL.
3. Install dependencies:

```bash
npm install
```

4. Generate Prisma client:

```bash
npx prisma generate
```

5. Run migrations:

```bash
npx prisma migrate dev --name init
```

6. Start app:

```bash
npm run dev
```

## API Endpoints

- `POST/GET /api/factory-bills`
- `POST/GET /api/store-transactions`
- `POST/GET /api/tax-records`
- `GET /api/dashboard/summary?startDate=&endDate=`
- `POST/GET /api/master-data/categories`
- `POST/GET /api/master-data/products`

## Architecture

Strict layered flow:

`Route -> Service -> Repository -> Prisma`

- `app/api/*` handles HTTP input/output only
- `lib/services/*` contains business logic
- `lib/repositories/*` contains DB access
- `lib/validators/*` centralizes Zod schemas

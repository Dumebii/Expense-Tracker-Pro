# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.

## Artifacts

### Expense Tracker (`artifacts/expense-tracker`)
- Frontend React + Vite app at path `/`
- Tracks business expenses by category, frequency (monthly/annually/one-time), and status
- Features: add, edit, cancel, delete expenses; generate receipts emailed to okolodumebi@gmail.com
- Shows totals: monthly, annual, one-time, and annualized run rate
- Renewal date field stored and displayed per expense

### API Server (`artifacts/api-server`)
- Express 5 backend at `/api`
- Routes: `/expenses`, `/expenses/summary`, `/expenses/:id`, `/expenses/:id/cancel`, `/expenses/:id/receipt`, `/receipts`

## Database Schema (`lib/db/src/schema/`)
- `expenses` table: id, name, amount, category, frequency (enum), status (enum), notes, renewal_date, purchase_date, created_at, updated_at
- `receipts` table: id, expense_id, receipt_number, emailed_to, expense_name, expense_amount, expense_category, expense_frequency, generated_at

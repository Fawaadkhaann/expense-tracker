# Ledger — Personal Expense Tracker

A Next.js app for tracking personal spending: accounts, expenses, category/date filters, totals, and a monthly chart. Data lives in Supabase (PostgreSQL) with row-level security.

## Stack

- **Frontend:** React, Next.js (App Router), TypeScript, Tailwind CSS
- **Backend:** Next.js Server Actions + auth callback route
- **Auth & database:** Supabase + PostgreSQL
- **Deploy:** Vercel

## 1. Create a Supabase project

1. Go to [https://supabase.com](https://supabase.com) and create a project.
2. Open **SQL Editor** and run everything in [`supabase/schema.sql`](supabase/schema.sql).
3. In **Authentication → URL Configuration**, set:
   - **Site URL** to `http://localhost:3000` for local work, then to your Vercel URL after deploy
   - **Redirect URLs:** `http://localhost:3000/auth/callback` and `https://YOUR-APP.vercel.app/auth/callback`
4. Optional: **Authentication → Providers → Email** — turn off “Confirm email” if you want instant signup while testing.
5. Copy **Project URL** and **anon public** key from **Project Settings → API**.

## 2. Environment variables

Copy `.env.example` to `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

`NEXT_PUBLIC_SITE_URL` is used as the email confirmation redirect origin.

## 3. Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000), create an account, then add expenses.

## 4. Deploy to Vercel

1. Push this folder to GitHub (or use `npx vercel` from the project root).
2. Import the repo in [Vercel](https://vercel.com/new).
3. Add the same environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_SITE_URL` = `https://YOUR-APP.vercel.app`
4. Deploy, then update Supabase Site URL / redirect URLs to the Vercel domain.

CLI (after `npx vercel login`):

```bash
npx vercel --prod
```

Pass the env vars when prompted, or set them in the Vercel project settings first.

## What you can do in the app

- Create an account / log in
- Add amount, date, description, and category (food, transport, shopping, bills, entertainment, health, education, other)
- Edit or delete expenses
- See total spending for the current filters
- Filter by category and date range
- View a six-month spending bar chart
- Persist data per user in Postgres (RLS: you only see your own rows)

import Link from "next/link";
import { Wallet } from "lucide-react";
import { hasSupabaseConfig } from "@/lib/supabase/server";

export default function HomePage() {
  const configured = hasSupabaseConfig();

  return (
    <div className="flex min-h-full flex-col">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-6">
        <div className="flex items-center gap-2 text-accent">
          <Wallet className="h-6 w-6" />
          <span className="text-lg font-semibold tracking-tight text-ink">
            Ledger
          </span>
        </div>
        <nav className="flex items-center gap-3 text-sm">
          <Link
            href="/login"
            className="rounded-full px-4 py-2 text-muted transition hover:text-ink"
          >
            Log in
          </Link>
          <Link
            href="/signup"
            className="rounded-full bg-ink px-4 py-2 text-card transition hover:bg-accent"
          >
            Create account
          </Link>
        </nav>
      </header>

      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-16 px-6 pb-20 pt-8 md:flex-row md:items-center">
        <div className="max-w-xl space-y-6">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-warm">
            Personal finance, kept simple
          </p>
          <h1 className="display text-5xl leading-[1.1] tracking-tight md:text-6xl">
            Know where the money went.
          </h1>
          <p className="text-lg leading-8 text-muted">
            Add expenses with a category, amount, date, and note. Filter the
            list, watch your monthly total, and keep everything in your own
            Supabase database.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/signup"
              className="rounded-full bg-accent px-6 py-3 text-sm font-medium text-white transition hover:bg-ink"
            >
              Start tracking
            </Link>
            <Link
              href="/login"
              className="rounded-full border border-line bg-card px-6 py-3 text-sm font-medium transition hover:border-ink"
            >
              I already have an account
            </Link>
          </div>
          {!configured && (
            <p className="rounded-2xl border border-line bg-card px-4 py-3 text-sm text-muted">
              Add your Supabase URL and anon key to{" "}
              <code className="font-mono text-ink">.env.local</code> before
              signing up. See the README for the SQL schema and Vercel steps.
            </p>
          )}
        </div>

        <div className="grid flex-1 gap-4 sm:grid-cols-2">
          {[
            ["Food & coffee", "$24.50", "Today"],
            ["Metro pass", "$32.00", "Mon"],
            ["Groceries", "$86.12", "Sun"],
            ["Streaming", "$14.99", "Last month"],
          ].map(([title, amount, when]) => (
            <article
              key={title}
              className="rounded-3xl border border-line bg-card p-5 shadow-[0_12px_40px_-24px_rgba(28,23,18,0.4)]"
            >
              <p className="text-sm text-muted">{when}</p>
              <p className="mt-6 text-xl font-medium">{title}</p>
              <p className="mt-1 text-2xl text-accent">{amount}</p>
            </article>
          ))}
        </div>
      </main>
    </div>
  );
}

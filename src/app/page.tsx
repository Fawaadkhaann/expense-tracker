import Link from "next/link";
import { BarChart3, FileText, Receipt, Wallet } from "lucide-react";
import { hasSupabaseConfig } from "@/lib/supabase/server";

const features = [
  {
    title: "Track expenses",
    description:
      "Record transactions, organize categories, and find activity with filters.",
    icon: Receipt,
  },
  {
    title: "Plan a monthly budget",
    description:
      "Set a spending limit and see how your current month is progressing.",
    icon: Wallet,
  },
  {
    title: "Understand your spending",
    description:
      "Review trends and create filtered reports for your own records.",
    icon: BarChart3,
  },
];

export default function HomePage() {
  const configured = hasSupabaseConfig();

  return (
    <div className="flex min-h-screen flex-col bg-canvas">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-4 py-5 sm:px-6">
        <Link href="/" className="flex items-center gap-3 rounded-lg">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent text-white">
            <Wallet className="h-[18px] w-[18px]" />
          </span>
          <span className="text-lg font-semibold tracking-tight text-ink">
            Ledger
          </span>
        </Link>
        <nav aria-label="Account" className="flex items-center gap-2 text-sm">
          <Link
            href="/login"
            className="rounded-xl px-3 py-2.5 font-medium text-muted transition-colors hover:bg-card hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            Log in
          </Link>
          <Link href="/signup" className="ledger-button min-h-10 px-3 sm:px-4">
            Create account
          </Link>
        </nav>
      </header>

      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col justify-center gap-12 px-4 pb-16 pt-8 sm:px-6 sm:pb-20 lg:gap-16">
        <section className="max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-accent">
            Personal finance, made clear
          </p>
          <h1 className="mt-4 max-w-2xl text-4xl font-semibold leading-tight tracking-tight text-ink sm:text-5xl">
            Know where your money goes.
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-muted sm:text-lg">
            Keep your expenses organized, follow your monthly budget, and make
            informed decisions with a clear view of your spending.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link href="/signup" className="ledger-button">
              Get started
            </Link>
            <Link href="/login" className="ledger-button-secondary">
              I already have an account
            </Link>
          </div>
          {!configured && (
            <p className="ledger-warning mt-6 max-w-xl">
              Add your Supabase URL and anon key to{" "}
              <code className="font-mono text-ink">.env.local</code> before
              signing up. See the README for setup steps.
            </p>
          )}
        </section>

        <section
          aria-label="Ledger features"
          className="grid gap-4 md:grid-cols-3"
        >
          {features.map((feature) => {
            const Icon = feature.icon;

            return (
              <article key={feature.title} className="ledger-card p-5 sm:p-6">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-soft text-accent">
                  <Icon className="h-5 w-5" />
                </span>
                <h2 className="mt-5 text-base font-semibold tracking-tight">
                  {feature.title}
                </h2>
                <p className="mt-2 text-sm leading-6 text-muted">
                  {feature.description}
                </p>
              </article>
            );
          })}
        </section>

        <footer className="flex items-center gap-2 border-t border-line pt-5 text-xs text-muted">
          <FileText className="h-4 w-4" />
          Your finances, organized in one place.
        </footer>
      </main>
    </div>
  );
}

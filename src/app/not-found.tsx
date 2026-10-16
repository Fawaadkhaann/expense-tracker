import Link from "next/link";
import { ArrowLeft, Wallet } from "lucide-react";

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-canvas px-4 py-10 sm:px-6">
      <section className="w-full max-w-lg rounded-3xl border border-line bg-card p-6 text-center shadow-sm sm:p-10">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-accent-soft text-accent">
          <Wallet className="h-6 w-6" aria-hidden="true" />
        </div>
        <p className="mt-6 text-xs font-semibold uppercase tracking-[0.16em] text-accent">
          Ledger · 404
        </p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
          Page not found
        </h1>
        <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-muted">
          The page you’re looking for may have moved or no longer exists.
        </p>
        <Link href="/" className="ledger-button mt-7 w-full sm:w-auto">
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Back to Ledger
        </Link>
      </section>
    </main>
  );
}

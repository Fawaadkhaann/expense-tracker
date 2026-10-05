import Link from "next/link";
import { Wallet } from "lucide-react";
import { AuthForm } from "@/components/auth-form";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  const params = await searchParams;

  return (
    <div className="flex min-h-full items-center justify-center px-4 py-16">
      <div className="w-full max-w-md rounded-[2rem] border border-line bg-card p-8 shadow-[0_20px_60px_-32px_rgba(28,23,18,0.45)]">
        <Link href="/" className="mb-8 flex items-center gap-2 text-accent">
          <Wallet className="h-5 w-5" />
          <span className="font-semibold text-ink">Ledger</span>
        </Link>
        <h1 className="display text-3xl">Welcome back</h1>
        <p className="mt-2 mb-8 text-muted">
          Log in to add expenses and see your monthly totals.
        </p>
        {params.error ? (
          <p className="mb-4 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-800">
            {params.error}
          </p>
        ) : null}
        <AuthForm mode="login" nextPath={params.next} />
      </div>
    </div>
  );
}

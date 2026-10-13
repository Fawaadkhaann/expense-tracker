import Link from "next/link";
import { Wallet } from "lucide-react";
import { AuthForm } from "@/components/auth-form";

export default function SignupPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-canvas px-4 py-10">
      <div className="w-full max-w-md rounded-2xl border border-line bg-card p-6 shadow-sm sm:p-8">
        <Link href="/" className="mb-8 inline-flex items-center gap-3 text-accent">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent text-white">
            <Wallet className="h-5 w-5" />
          </span>
          <span className="text-lg font-semibold tracking-tight text-ink">
            Ledger
          </span>
        </Link>
        <h1 className="text-2xl font-semibold tracking-tight">
          Create an account
        </h1>
        <p className="mb-7 mt-2 text-sm leading-6 text-muted">
          Your expenses stay private — row-level security in Postgres.
        </p>
        <AuthForm mode="signup" />
      </div>
    </div>
  );
}

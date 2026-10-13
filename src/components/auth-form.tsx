"use client";

import Link from "next/link";
import { useActionState } from "react";
import { signIn, signUp, type AuthState } from "@/actions/auth";

type Mode = "login" | "signup";

export function AuthForm({
  mode,
  nextPath,
}: {
  mode: Mode;
  nextPath?: string;
}) {
  const action = mode === "login" ? signIn : signUp;
  const [state, formAction, pending] = useActionState<AuthState, FormData>(
    action,
    undefined,
  );

  return (
    <form action={formAction} className="space-y-4">
      {nextPath ? <input type="hidden" name="next" value={nextPath} /> : null}
      <label className="block space-y-1.5">
        <span className="text-sm font-medium text-ink">Email</span>
        <input
          required
          type="email"
          name="email"
          autoComplete="email"
          className="ledger-field"
        />
      </label>
      <label className="block space-y-1.5">
        <span className="text-sm font-medium text-ink">Password</span>
        <input
          required
          minLength={6}
          type="password"
          name="password"
          autoComplete={mode === "login" ? "current-password" : "new-password"}
          className="ledger-field"
        />
      </label>
      {state?.error ? (
        <p className="ledger-error" role="alert">
          {state.error}
        </p>
      ) : null}
      {state?.message ? (
        <p className="rounded-xl bg-accent-soft px-3 py-2 text-sm text-accent">
          {state.message}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={pending}
        className="ledger-button w-full"
      >
        {pending
          ? "Please wait…"
          : mode === "login"
            ? "Log in"
            : "Create account"}
      </button>
      <p className="text-center text-sm text-muted">
        {mode === "login" ? (
          <>
            New here?{" "}
            <Link href="/signup" className="text-ink underline">
              Create an account
            </Link>
          </>
        ) : (
          <>
            Already tracking?{" "}
            <Link href="/login" className="text-ink underline">
              Log in
            </Link>
          </>
        )}
      </p>
    </form>
  );
}

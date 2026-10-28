import { redirect } from "next/navigation";
import { LogOut, ShieldCheck, UserRound } from "lucide-react";
import { signOut } from "@/actions/auth";
import { AppShell } from "@/components/app-shell";
import { SettingsAppearance } from "@/components/settings-appearance";
import { SettingsAccounts } from "@/components/settings-accounts";
import { createClient, hasSupabaseConfig } from "@/lib/supabase/server";
import type {
  AccountSummary,
  PaymentMethodSummary,
} from "@/types/account";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  if (!hasSupabaseConfig()) {
    redirect("/");
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const email = user.email ?? "";
  const displayEmail = email || "Email not available";
  const initials = email.trim().charAt(0).toUpperCase() || "U";

  const [
    { data: accountRows, error: accountsError },
    { data: paymentMethodRows, error: paymentMethodsError },
  ] = await Promise.all([
    supabase.rpc("get_account_balances"),
    supabase
      .from("payment_methods")
      .select("id, account_id, name, method_type, provider, last_four, is_active")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false }),
  ]);

  if (accountsError) {
    throw new Error(`Could not load accounts: ${accountsError.message}`);
  }

  if (paymentMethodsError) {
    throw new Error(
      `Could not load payment methods: ${paymentMethodsError.message}`,
    );
  }

  const accounts = (accountRows ?? []) as AccountSummary[];
  const paymentMethods = (paymentMethodRows ?? []) as PaymentMethodSummary[];

  return (
    <AppShell activePath="/settings" email={email}>
      <div className="mx-auto w-full max-w-5xl space-y-6">
        <section className="rounded-2xl border border-finance-line bg-linear-to-br from-finance-surface to-finance-surface-raised p-5 shadow-sm sm:p-7">
          <div className="flex items-start gap-4">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-finance-indigo-soft text-finance-indigo">
              <ShieldCheck className="h-5 w-5" aria-hidden="true" />
            </span>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-finance-indigo">
                Your workspace
              </p>
              <h2 className="mt-1 text-2xl font-semibold tracking-tight text-finance-ink sm:text-3xl">
                Settings
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-finance-muted">
                Manage your account details and personalize your Ledger
                experience.
              </p>
            </div>
          </div>
        </section>

        <div className="grid gap-6 lg:grid-cols-2">
          <section
            className="ledger-card p-5 sm:p-7"
            aria-labelledby="profile-title"
          >
            <div className="mb-6">
              <h2
                id="profile-title"
                className="text-lg font-semibold tracking-tight text-ink"
              >
                Profile
              </h2>
              <p className="mt-1 text-sm leading-6 text-muted">
                Your signed-in account information and access.
              </p>
            </div>

            <div className="flex min-w-0 items-center gap-4">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-finance-indigo-soft text-base font-semibold text-finance-indigo">
                {initials}
              </span>
              <div className="min-w-0">
                <p className="text-xs font-medium text-muted">Email address</p>
                <p className="mt-1 truncate text-sm font-semibold text-ink">
                  {displayEmail}
                </p>
              </div>
            </div>

            <div className="mt-6 flex items-start gap-3 rounded-xl border border-line bg-canvas p-4">
              <UserRound
                className="mt-0.5 h-4 w-4 shrink-0 text-muted"
                aria-hidden="true"
              />
              <p className="text-sm leading-6 text-muted">
                Your account is authenticated securely with Ledger. Profile
                details are managed through your existing sign-in.
              </p>
            </div>

            <form action={signOut} className="mt-6 border-t border-line pt-5">
              <button
                type="submit"
                className="ledger-button-secondary w-full text-danger sm:w-auto"
              >
                <LogOut className="h-4 w-4" aria-hidden="true" />
                Log out
              </button>
            </form>
          </section>

          <SettingsAppearance />
        </div>

        <SettingsAccounts
          accounts={accounts}
          paymentMethods={paymentMethods}
        />
      </div>
    </AppShell>
  );
}

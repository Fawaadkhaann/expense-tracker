"use client";

import { useActionState } from "react";
import { CreditCard, Plus, WalletCards } from "lucide-react";
import {
  createAccount,
  createPaymentMethod,
  type AccountActionState,
} from "@/actions/accounts";
import { formatCurrency } from "@/lib/format";
import {
  ACCOUNT_TYPE_LABELS,
  ACCOUNT_TYPES,
  PAYMENT_METHOD_TYPE_LABELS,
  PAYMENT_METHOD_TYPES,
  type AccountSummary,
  type PaymentMethodSummary,
} from "@/types/account";

function AccountForm() {
  const [state, formAction, pending] = useActionState<
    AccountActionState,
    FormData
  >(createAccount, undefined);

  return (
    <form action={formAction} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block space-y-1.5">
          <span className="text-sm font-medium text-ink">Account name</span>
          <input
            name="name"
            required
            maxLength={100}
            placeholder="Everyday checking"
            className="ledger-field"
          />
        </label>

        <label className="block space-y-1.5">
          <span className="text-sm font-medium text-ink">Account type</span>
          <select
            name="account_type"
            required
            defaultValue="bank"
            className="ledger-field"
          >
            {ACCOUNT_TYPES.map((type) => (
              <option key={type} value={type}>
                {ACCOUNT_TYPE_LABELS[type]}
              </option>
            ))}
          </select>
        </label>
      </div>

      <label className="block space-y-1.5">
        <span className="text-sm font-medium text-ink">
          Opening balance <span className="font-normal text-muted">(PKR)</span>
        </span>
        <input
          name="opening_balance"
          type="number"
          min="0"
          max="9999999999.99"
          step="0.01"
          defaultValue="0"
          required
          className="ledger-field"
        />
      </label>

      {state?.error && (
        <p className="ledger-error" role="alert">
          {state.error}
        </p>
      )}
      {state?.success && (
        <p className="ledger-success" role="status">
          {state.success}
        </p>
      )}

      <button type="submit" disabled={pending} className="ledger-button">
        <Plus className="h-4 w-4" aria-hidden="true" />
        {pending ? "Creating..." : "Add account"}
      </button>
    </form>
  );
}

function PaymentMethodForm({
  accounts,
}: {
  accounts: AccountSummary[];
}) {
  const [state, formAction, pending] = useActionState<
    AccountActionState,
    FormData
  >(createPaymentMethod, undefined);
  const activeAccounts = accounts.filter((account) => account.is_active);

  if (activeAccounts.length === 0) {
    return (
      <p className="rounded-xl border border-line bg-canvas px-4 py-3 text-sm text-muted">
        Create an active account before adding a payment method.
      </p>
    );
  }

  return (
    <form action={formAction} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block space-y-1.5">
          <span className="text-sm font-medium text-ink">Linked account</span>
          <select
            name="account_id"
            required
            defaultValue={activeAccounts[0].account_id}
            className="ledger-field"
          >
            {activeAccounts.map((account) => (
              <option key={account.account_id} value={account.account_id}>
                {account.account_name}
              </option>
            ))}
          </select>
        </label>

        <label className="block space-y-1.5">
          <span className="text-sm font-medium text-ink">Method type</span>
          <select
            name="method_type"
            required
            defaultValue="debit_card"
            className="ledger-field"
          >
            {PAYMENT_METHOD_TYPES.map((type) => (
              <option key={type} value={type}>
                {PAYMENT_METHOD_TYPE_LABELS[type]}
              </option>
            ))}
          </select>
        </label>
      </div>

      <label className="block space-y-1.5">
        <span className="text-sm font-medium text-ink">Nickname</span>
        <input
          name="name"
          required
          maxLength={100}
          placeholder="Daily debit card"
          className="ledger-field"
        />
      </label>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block space-y-1.5">
          <span className="text-sm font-medium text-ink">
            Provider <span className="font-normal text-muted">(optional)</span>
          </span>
          <input
            name="provider"
            maxLength={100}
            placeholder="Visa, JazzCash..."
            className="ledger-field"
          />
        </label>

        <label className="block space-y-1.5">
          <span className="text-sm font-medium text-ink">
            Last four digits{" "}
            <span className="font-normal text-muted">(optional)</span>
          </span>
          <input
            name="last_four"
            inputMode="numeric"
            pattern="[0-9]{4}"
            maxLength={4}
            placeholder="1234"
            autoComplete="off"
            className="ledger-field"
          />
        </label>
      </div>

      <p className="text-xs leading-5 text-muted">
        Never enter a full card number, security code, PIN, or banking
        password.
      </p>

      {state?.error && (
        <p className="ledger-error" role="alert">
          {state.error}
        </p>
      )}
      {state?.success && (
        <p className="ledger-success" role="status">
          {state.success}
        </p>
      )}

      <button type="submit" disabled={pending} className="ledger-button">
        <Plus className="h-4 w-4" aria-hidden="true" />
        {pending ? "Adding..." : "Add payment method"}
      </button>
    </form>
  );
}

export function SettingsAccounts({
  accounts,
  paymentMethods,
}: {
  accounts: AccountSummary[];
  paymentMethods: PaymentMethodSummary[];
}) {
  const accountNames = new Map(
    accounts.map((account) => [account.account_id, account.account_name]),
  );

  return (
    <div className="space-y-6">
      <section className="ledger-card p-5 sm:p-7" aria-labelledby="accounts-title">
        <div className="mb-6 flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-finance-indigo-soft text-finance-indigo">
            <WalletCards className="h-5 w-5" aria-hidden="true" />
          </span>
          <div>
            <h2
              id="accounts-title"
              className="text-lg font-semibold tracking-tight text-ink"
            >
              Accounts
            </h2>
            <p className="mt-1 text-sm leading-6 text-muted">
              Track balances for your cash, bank, and wallet accounts.
            </p>
          </div>
        </div>

        {accounts.length > 0 ? (
          <ul className="mb-6 grid gap-3 sm:grid-cols-2">
            {accounts.map((account) => (
              <li
                key={account.account_id}
                className="min-w-0 rounded-xl border border-line bg-canvas p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-ink">
                      {account.account_name}
                    </p>
                    <p className="mt-1 text-xs text-muted">
                      {ACCOUNT_TYPE_LABELS[account.account_type]}
                      {!account.is_active && " · Inactive"}
                    </p>
                  </div>
                  <p className="shrink-0 text-right text-base font-semibold tabular-nums text-finance-indigo">
                    {formatCurrency(Number(account.current_balance))}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mb-6 rounded-xl border border-dashed border-line bg-canvas px-4 py-6 text-center text-sm text-muted">
            No accounts yet. Add one to start tracking a balance.
          </p>
        )}

        <div className="border-t border-line pt-5">
          <h3 className="mb-4 text-sm font-semibold text-ink">
            Create an account
          </h3>
          <AccountForm />
        </div>
      </section>

      <section
        className="ledger-card p-5 sm:p-7"
        aria-labelledby="payment-methods-title"
      >
        <div className="mb-6 flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-finance-cyan/10 text-finance-cyan">
            <CreditCard className="h-5 w-5" aria-hidden="true" />
          </span>
          <div>
            <h2
              id="payment-methods-title"
              className="text-lg font-semibold tracking-tight text-ink"
            >
              Payment methods
            </h2>
            <p className="mt-1 text-sm leading-6 text-muted">
              Link a payment method to one of your accounts.
            </p>
          </div>
        </div>

        {paymentMethods.length > 0 ? (
          <ul className="mb-6 space-y-3">
            {paymentMethods.map((method) => (
              <li
                key={method.id}
                className="flex min-w-0 items-center justify-between gap-3 rounded-xl border border-line bg-canvas p-4"
              >
                <div className="min-w-0">
                  <p className="truncate font-semibold text-ink">
                    {method.name}
                    {method.last_four && (
                      <span className="ml-2 font-normal text-muted">
                        ···· {method.last_four}
                      </span>
                    )}
                  </p>
                  <p className="mt-1 truncate text-xs text-muted">
                    {PAYMENT_METHOD_TYPE_LABELS[method.method_type]}
                    {method.provider ? ` · ${method.provider}` : ""}
                    {method.account_id
                      ? ` · ${accountNames.get(method.account_id) ?? "Account"}`
                      : " · No linked account"}
                    {!method.is_active && " · Inactive"}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mb-6 rounded-xl border border-dashed border-line bg-canvas px-4 py-6 text-center text-sm text-muted">
            No payment methods yet.
          </p>
        )}

        <div className="border-t border-line pt-5">
          <h3 className="mb-4 text-sm font-semibold text-ink">
            Add a payment method
          </h3>
          <PaymentMethodForm accounts={accounts} />
        </div>
      </section>
    </div>
  );
}

"use client";

import Link from "next/link";
import { useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CircleAlert,
  CreditCard,
  Info,
  RotateCcw,
  Wallet,
} from "lucide-react";
import { AnimatePresence, MotionConfig, motion } from "motion/react";
import { CheckoutPaymentMethodSelector } from "@/components/checkout-payment-method-selector";
import {
  checkoutPaymentMethods,
  type CheckoutPaymentMethodId,
} from "@/lib/checkout-payment-methods";
import {
  CATEGORIES,
  CATEGORY_META,
  isCategory,
  type Category,
} from "@/lib/categories";
import { formatCurrency, formatDate, todayISO } from "@/lib/format";

type CheckoutField = "description" | "amount" | "category" | "date";
type CheckoutDetails = {
  description: string;
  amount: string;
  category: Category | "";
  date: string;
};

const maximumAmountCents = 999_999_999_999;

function amountCents(value: string): number | null {
  if (!/^\d+(?:\.\d{1,2})?$/.test(value)) return null;

  const [whole, fraction = ""] = value.split(".");
  const wholeAmount = Number(whole);
  if (!Number.isSafeInteger(wholeAmount) || wholeAmount > 9_999_999_999) {
    return null;
  }
  const cents = wholeAmount * 100 + Number(fraction.padEnd(2, "0"));
  return cents > 0 && cents <= maximumAmountCents ? cents : null;
}

function amountError(value: string): string | null {
  if (!value.trim()) return "Enter an amount in PKR.";
  if (!/^\d+(?:\.\d{1,2})?$/.test(value)) {
    return "Enter a valid amount using up to 2 decimal places.";
  }

  const [whole, fraction = ""] = value.split(".");
  const wholeAmount = Number(whole);
  if (!Number.isSafeInteger(wholeAmount) || wholeAmount > 9_999_999_999) {
    return "Amount exceeds Ledger's maximum of Rs. 9,999,999,999.99.";
  }
  const cents = wholeAmount * 100 + Number(fraction.padEnd(2, "0"));
  if (cents === 0) return "Amount must be greater than zero.";
  if (cents > maximumAmountCents) {
    return "Amount exceeds Ledger's maximum of Rs. 9,999,999,999.99.";
  }

  return null;
}

function dateError(value: string): string | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return "Choose a valid date.";
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    return "Choose a valid date.";
  }
  return null;
}

function validateDescription(value: string): string | null {
  if (!value.trim()) return "Enter a description.";
  if (value.trim().length > 120) {
    return "Description must be 120 characters or fewer.";
  }
  return null;
}

function formatAmount(value: string) {
  const cents = amountCents(value);
  return cents === null ? null : formatCurrency(cents / 100);
}

export function CheckoutPage() {
  const [details, setDetails] = useState<CheckoutDetails>({
    description: "",
    amount: "",
    category: "",
    date: todayISO(),
  });
  const [selectedMethod, setSelectedMethod] =
    useState<CheckoutPaymentMethodId | null>(null);
  const [step, setStep] = useState<"details" | "confirmation">("details");
  const [touched, setTouched] = useState<
    Partial<Record<CheckoutField, boolean>>
  >({});

  const descriptionMessage = validateDescription(details.description);
  const amountMessage = amountError(details.amount);
  const dateMessage = dateError(details.date);
  const categoryMessage = isCategory(details.category)
    ? null
    : "Choose a category.";
  const canContinue =
    !descriptionMessage &&
    !amountMessage &&
    !dateMessage &&
    !categoryMessage &&
    selectedMethod !== null &&
    checkoutPaymentMethods.some((method) => method.id === selectedMethod);
  const method = checkoutPaymentMethods.find(
    (paymentMethod) => paymentMethod.id === selectedMethod,
  );
  const parsedAmount = formatAmount(details.amount);

  function updateField<Field extends CheckoutField>(
    field: Field,
    value: CheckoutDetails[Field],
  ) {
    setDetails((current) => ({ ...current, [field]: value }));
  }

  function markTouched(field: CheckoutField) {
    setTouched((current) => ({ ...current, [field]: true }));
  }

  function startAnotherDemo() {
    setDetails({
      description: "",
      amount: "",
      category: "",
      date: todayISO(),
    });
    setSelectedMethod(null);
    setTouched({});
    setStep("details");
  }

  return (
    <MotionConfig reducedMotion="user">
      <div className="min-h-screen bg-canvas text-ink">
        <header className="border-b border-line bg-card">
          <div className="mx-auto flex min-h-[76px] w-full max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
            <Link
              href="/"
              className="flex items-center gap-3 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              aria-label="Ledger home"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent text-accent-contrast">
                <Wallet className="h-5 w-5" aria-hidden="true" />
              </span>
              <span className="text-lg font-semibold tracking-tight text-ink">
                Ledger
              </span>
            </Link>
            <span className="rounded-full border border-warm/20 bg-warm-soft px-3 py-1.5 text-xs font-semibold text-warm">
              Demo Checkout · No payment processing
            </span>
          </div>
        </header>

        <main className="mx-auto w-full max-w-6xl px-4 pb-12 pt-8 sm:px-6 sm:pb-16 sm:pt-12">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.24, ease: "easeOut" }}
          >
            <Link
              href="/"
              className="inline-flex min-h-10 items-center gap-2 rounded-lg text-sm font-medium text-muted transition-colors hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent motion-reduce:transition-none"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              Back to Ledger
            </Link>

            <div className="mt-7 max-w-2xl">
              <p className="text-xs font-semibold uppercase tracking-[0.15em] text-accent">
                Ledger expense flow
              </p>
              <h1 className="mt-2 text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
                Demo checkout
              </h1>
              <p className="mt-3 text-sm leading-6 text-muted sm:text-base">
                Preview an expense checkout with your own details. Everything
                stays in this page and nothing is saved or charged.
              </p>
            </div>
          </motion.div>

          <div className="mt-8 grid min-w-0 items-start gap-5 lg:grid-cols-[minmax(0,1fr)_360px] lg:gap-7">
            <motion.section
              aria-labelledby="checkout-step-title"
              className="ledger-card min-w-0 p-5 sm:p-7"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.28, delay: 0.05, ease: "easeOut" }}
            >
              <div className="mb-6 flex items-start gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent-soft text-accent">
                  {step === "details" ? (
                    <CreditCard className="h-5 w-5" aria-hidden="true" />
                  ) : (
                    <Info className="h-5 w-5" aria-hidden="true" />
                  )}
                </span>
                <div>
                  <h2
                    id="checkout-step-title"
                    className="text-lg font-semibold tracking-tight text-ink"
                  >
                    {step === "details"
                      ? "Expense details"
                      : "Demo checkout completed"}
                  </h2>
                  <p className="mt-1 text-sm leading-6 text-muted">
                    {step === "details"
                      ? "Enter the expense information and select a demo method."
                      : "Review your simulated expense checkout."}
                  </p>
                </div>
              </div>

              <AnimatePresence mode="wait" initial={false}>
                {step === "details" ? (
                  <motion.div
                    key="details"
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 8 }}
                    transition={{ duration: 0.18, ease: "easeOut" }}
                  >
                    <div className="grid gap-4 sm:grid-cols-2">
                      <label className="min-w-0 space-y-1.5">
                        <span className="text-sm font-medium text-ink">
                          Description
                        </span>
                        <input
                          required
                          maxLength={120}
                          value={details.description}
                          onChange={(event) =>
                            updateField("description", event.target.value)
                          }
                          onBlur={() => markTouched("description")}
                          placeholder="Office supplies"
                          aria-invalid={
                            touched.description && !!descriptionMessage
                          }
                          aria-describedby={
                            touched.description && descriptionMessage
                              ? "checkout-description-error"
                              : undefined
                          }
                          className="ledger-field border-finance-line bg-finance-surface-raised text-finance-ink placeholder:text-finance-muted focus:border-finance-indigo focus:ring-finance-indigo/20"
                        />
                        {touched.description && descriptionMessage && (
                          <span
                            id="checkout-description-error"
                            className="block text-xs text-danger"
                            role="alert"
                          >
                            {descriptionMessage}
                          </span>
                        )}
                      </label>

                      <label className="min-w-0 space-y-1.5">
                        <span className="text-sm font-medium text-ink">
                          Amount <span className="text-muted">(PKR)</span>
                        </span>
                        <input
                          required
                          maxLength={13}
                          inputMode="decimal"
                          autoComplete="off"
                          value={details.amount}
                          onChange={(event) =>
                            updateField("amount", event.target.value)
                          }
                          onBlur={() => markTouched("amount")}
                          placeholder="0.00"
                          aria-invalid={touched.amount && !!amountMessage}
                          aria-describedby={
                            touched.amount && amountMessage
                              ? "checkout-amount-error"
                              : "checkout-amount-help"
                          }
                          className="ledger-field border-finance-line bg-finance-surface-raised text-finance-ink placeholder:text-finance-muted focus:border-finance-indigo focus:ring-finance-indigo/20"
                        />
                        {touched.amount && amountMessage ? (
                          <span
                            id="checkout-amount-error"
                            className="block text-xs text-danger"
                            role="alert"
                          >
                            {amountMessage}
                          </span>
                        ) : (
                          <span
                            id="checkout-amount-help"
                            className="block text-xs text-muted"
                          >
                            Enter a positive amount, up to 2 decimal places.
                          </span>
                        )}
                      </label>

                      <label className="min-w-0 space-y-1.5">
                        <span className="text-sm font-medium text-ink">
                          Category
                        </span>
                        <select
                          required
                          value={details.category}
                          onChange={(event) =>
                            updateField(
                              "category",
                              isCategory(event.target.value)
                                ? event.target.value
                                : "",
                            )
                          }
                          onBlur={() => markTouched("category")}
                          aria-invalid={touched.category && !!categoryMessage}
                          aria-describedby={
                            touched.category && categoryMessage
                              ? "checkout-category-error"
                              : undefined
                          }
                          className="ledger-field border-finance-line bg-finance-surface-raised text-finance-ink focus:border-finance-indigo focus:ring-finance-indigo/20"
                        >
                          <option value="">Choose a category</option>
                          {CATEGORIES.map((category) => (
                            <option key={category} value={category}>
                              {CATEGORY_META[category].label}
                            </option>
                          ))}
                        </select>
                        {touched.category && categoryMessage && (
                          <span
                            id="checkout-category-error"
                            className="block text-xs text-danger"
                            role="alert"
                          >
                            {categoryMessage}
                          </span>
                        )}
                      </label>

                      <label className="min-w-0 space-y-1.5">
                        <span className="text-sm font-medium text-ink">
                          Expense date
                        </span>
                        <input
                          required
                          type="date"
                          value={details.date}
                          onChange={(event) =>
                            updateField("date", event.target.value)
                          }
                          onBlur={() => markTouched("date")}
                          aria-invalid={touched.date && !!dateMessage}
                          aria-describedby={
                            touched.date && dateMessage
                              ? "checkout-date-error"
                              : undefined
                          }
                          className="ledger-field border-finance-line bg-finance-surface-raised text-finance-ink focus:border-finance-indigo focus:ring-finance-indigo/20"
                        />
                        {touched.date && dateMessage && (
                          <span
                            id="checkout-date-error"
                            className="block text-xs text-danger"
                            role="alert"
                          >
                            {dateMessage}
                          </span>
                        )}
                      </label>
                    </div>

                    <div className="my-7 border-t border-line" />

                    <CheckoutPaymentMethodSelector
                      selectedMethod={selectedMethod}
                      onSelect={(paymentMethod) =>
                        setSelectedMethod(paymentMethod.id)
                      }
                    />

                    <div className="mt-6 rounded-xl border border-warm/20 bg-warm-soft p-4">
                      <div className="flex items-start gap-3">
                        <CircleAlert
                          className="mt-0.5 h-4 w-4 shrink-0 text-warm"
                          aria-hidden="true"
                        />
                        <div>
                          <p className="text-sm font-semibold text-warm">
                            Simulation only
                          </p>
                          <p className="mt-1 text-sm leading-6 text-warm">
                            No payment will be made, no credentials are
                            requested, and no transaction is sent or saved.
                          </p>
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      disabled={!canContinue}
                      onClick={() => {
                        if (canContinue) setStep("confirmation");
                      }}
                      className="ledger-button mt-6 w-full"
                      aria-describedby="checkout-action-help"
                    >
                      Continue
                      <ArrowRight className="h-4 w-4" aria-hidden="true" />
                    </button>
                    <p
                      id="checkout-action-help"
                      className="mt-3 text-center text-xs leading-5 text-muted"
                      role="status"
                    >
                      {canContinue
                        ? "Ready to review your simulated checkout."
                        : "Complete all expense details and choose a demo method to continue."}
                    </p>
                  </motion.div>
                ) : (
                  <motion.div
                    key="confirmation"
                    initial={{ opacity: 0, x: 8 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -8 }}
                    transition={{ duration: 0.18, ease: "easeOut" }}
                    aria-live="polite"
                  >
                    <div className="rounded-2xl border border-accent/20 bg-accent-soft/50 p-5 sm:p-6">
                      <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent text-accent-contrast">
                        <Info className="h-5 w-5" aria-hidden="true" />
                      </span>
                      <p className="mt-5 text-xs font-bold uppercase tracking-[0.14em] text-accent">
                        DEMO · Simulation only
                      </p>
                      <h3 className="mt-2 text-xl font-semibold tracking-tight text-ink">
                        Demo checkout completed
                      </h3>
                      <p className="mt-2 text-sm leading-6 text-muted">
                        This is a simulated checkout. No real payment was made
                        and no financial transaction was created.
                      </p>

                      <dl className="mt-5 space-y-3 rounded-xl border border-line bg-card p-4 text-sm">
                        <div className="flex items-start justify-between gap-4">
                          <dt className="shrink-0 text-muted">Description</dt>
                          <dd className="break-words text-right font-semibold text-ink">
                            {details.description.trim()}
                          </dd>
                        </div>
                        <div className="flex items-center justify-between gap-4 border-t border-line pt-3">
                          <dt className="text-muted">Category</dt>
                          <dd className="text-right font-semibold text-ink">
                            {isCategory(details.category)
                              ? CATEGORY_META[details.category].label
                              : ""}
                          </dd>
                        </div>
                        <div className="flex items-center justify-between gap-4 border-t border-line pt-3">
                          <dt className="text-muted">Expense date</dt>
                          <dd className="text-right font-semibold text-ink">
                            {dateError(details.date)
                              ? ""
                              : formatDate(details.date)}
                          </dd>
                        </div>
                        <div className="flex items-center justify-between gap-4 border-t border-line pt-3">
                          <dt className="text-muted">Payment method</dt>
                          <dd className="text-right font-semibold text-ink">
                            {method?.name} (DEMO)
                          </dd>
                        </div>
                        <div className="flex items-center justify-between gap-4 border-t border-line pt-3">
                          <dt className="font-semibold text-ink">Total</dt>
                          <dd className="text-right font-semibold tabular-nums text-ink">
                            {parsedAmount}
                          </dd>
                        </div>
                      </dl>
                    </div>

                    <div className="mt-4 rounded-xl border border-line bg-canvas p-4">
                      <p className="text-sm font-semibold text-ink">
                        Nothing was saved or sent
                      </p>
                      <p className="mt-1 text-sm leading-6 text-muted">
                        No payment credentials were requested. The details
                        remain only in this page and will be cleared when you
                        start another demo.
                      </p>
                    </div>

                    <div className="mt-6 grid gap-3 sm:grid-cols-2">
                      <button
                        type="button"
                        onClick={() => setStep("details")}
                        className="ledger-button-secondary w-full"
                      >
                        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                        Back to edit details
                      </button>
                      <button
                        type="button"
                        onClick={startAnotherDemo}
                        className="ledger-button w-full"
                      >
                        <RotateCcw className="h-4 w-4" aria-hidden="true" />
                        Start another demo
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.section>

            <motion.aside
              aria-labelledby="summary-title"
              className="ledger-card min-w-0 p-5 sm:p-7"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.28, delay: 0.1, ease: "easeOut" }}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted">
                    Demo expense
                  </p>
                  <h2
                    id="summary-title"
                    className="mt-1 text-lg font-semibold tracking-tight text-ink"
                  >
                    Expense summary
                  </h2>
                </div>
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent-soft text-accent">
                  <Wallet className="h-5 w-5" aria-hidden="true" />
                </span>
              </div>

              <dl className="mt-6 space-y-4">
                <div className="min-w-0">
                  <dt className="text-xs font-medium text-muted">
                    Description
                  </dt>
                  <dd className="mt-1 break-words text-sm font-semibold text-ink">
                    {details.description.trim() || "Not entered"}
                  </dd>
                </div>
                <div className="flex items-center justify-between gap-4 border-t border-line pt-4 text-sm">
                  <dt className="text-muted">Category</dt>
                  <dd className="text-right font-medium text-ink">
                    {isCategory(details.category)
                      ? CATEGORY_META[details.category].label
                      : "Not selected"}
                  </dd>
                </div>
                <div className="flex items-center justify-between gap-4 border-t border-line pt-4 text-sm">
                  <dt className="text-muted">Expense date</dt>
                  <dd className="text-right font-medium text-ink">
                    {dateError(details.date)
                      ? "Not selected"
                      : formatDate(details.date)}
                  </dd>
                </div>
                <div className="flex items-center justify-between gap-4 border-t border-line pt-4 text-sm">
                  <dt className="text-muted">Payment method</dt>
                  <dd className="text-right font-medium text-ink">
                    {method ? `${method.name} (DEMO)` : "Not selected"}
                  </dd>
                </div>
                <div className="border-t border-line pt-4">
                  <div className="flex items-start justify-between gap-4">
                    <dt className="font-semibold text-ink">Total amount</dt>
                    <dd className="max-w-[65%] break-words text-right text-lg font-semibold tabular-nums text-ink">
                      {parsedAmount ?? "Enter a valid amount"}
                    </dd>
                  </div>
                </div>
              </dl>

              <div className="mt-6 flex items-start gap-3 rounded-xl border border-line bg-canvas p-4">
                <Info
                  className="mt-0.5 h-4 w-4 shrink-0 text-muted"
                  aria-hidden="true"
                />
                <p className="text-xs leading-5 text-muted">
                  Demo details stay in local page state only. Nothing is
                  written to Ledger expenses, accounts, or payment records.
                </p>
              </div>
            </motion.aside>
          </div>

          <footer className="mt-8 flex flex-col gap-2 border-t border-line pt-5 text-xs leading-5 text-muted sm:flex-row sm:items-center sm:justify-between">
            <span className="inline-flex items-center gap-2">
              <Check className="h-3.5 w-3.5" aria-hidden="true" />
              Simulation only · no payment or expense is created.
            </span>
            <Link
              href="/"
              className="inline-flex min-h-9 items-center gap-1 font-medium text-accent hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              Return to Ledger
              <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
            </Link>
          </footer>
        </main>
      </div>
    </MotionConfig>
  );
}

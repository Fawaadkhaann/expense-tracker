"use client";

import {
  CreditCard,
  QrCode,
  Smartphone,
  type LucideIcon,
} from "lucide-react";
import {
  checkoutPaymentMethods,
  type CheckoutPaymentMethod,
  type CheckoutPaymentMethodId,
} from "@/lib/checkout-payment-methods";

const methodIcons: Record<CheckoutPaymentMethodId, LucideIcon> = {
  jazzcash: Smartphone,
  easypaisa: Smartphone,
  raast: QrCode,
  visa: CreditCard,
  mastercard: CreditCard,
} as const;

export function CheckoutPaymentMethodSelector({
  selectedMethod,
  onSelect,
}: {
  selectedMethod: CheckoutPaymentMethodId | null;
  onSelect: (method: CheckoutPaymentMethod) => void;
}) {
  return (
    <fieldset>
      <legend className="text-base font-semibold tracking-tight text-ink">
        Choose a payment method
      </legend>
      <p id="payment-method-help" className="mt-1 text-sm leading-6 text-muted">
        Choose one option to preview the simulated checkout step.
      </p>

      <div
        role="radiogroup"
        aria-describedby="payment-method-help"
        className="mt-5 grid gap-3 sm:grid-cols-2"
      >
        {checkoutPaymentMethods.map((method) => {
          const Icon = methodIcons[method.id];
          const selected = selectedMethod === method.id;
          const inputId = `payment-method-${method.id}`;

          return (
            <label
              key={method.id}
              htmlFor={inputId}
              className="block min-w-0 cursor-pointer rounded-2xl"
            >
              <input
                id={inputId}
                type="radio"
                name="checkout-payment-method"
                value={method.id}
                checked={selected}
                onChange={() => onSelect(method)}
                aria-describedby={`${inputId}-availability`}
                className="peer sr-only"
              />
              <span
                className={`flex min-h-[88px] items-center gap-3 rounded-2xl border p-3 transition-[border-color,background-color,transform] motion-safe:duration-200 motion-safe:hover:-translate-y-0.5 motion-reduce:transition-none peer-focus-visible:outline-none peer-focus-visible:ring-2 peer-focus-visible:ring-accent peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-card ${
                  selected
                    ? "border-accent bg-accent-soft/60"
                    : "border-line bg-card hover:border-accent/50"
                }`}
              >
                <span
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
                    selected
                      ? "bg-accent text-accent-contrast"
                      : "bg-canvas text-muted"
                  }`}
                >
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
                    <span className="text-sm font-semibold text-ink">
                      {method.name}
                    </span>
                    <span
                      id={`${inputId}-availability`}
                      className="rounded-full border border-accent/20 bg-accent-soft px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.08em] text-accent"
                    >
                      DEMO
                    </span>
                  </span>
                  <span className="mt-1 block text-xs leading-5 text-muted">
                    {method.description}
                  </span>
                </span>
                <span
                  aria-hidden="true"
                  className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
                    selected
                      ? "border-accent bg-accent text-accent-contrast"
                      : "border-line bg-card"
                  }`}
                >
                  {selected && (
                    <span className="h-2 w-2 rounded-full bg-current" />
                  )}
                </span>
              </span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}

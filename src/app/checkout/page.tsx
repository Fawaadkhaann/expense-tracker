import type { Metadata } from "next";
import { CheckoutPage } from "@/components/checkout-page";

export const metadata: Metadata = {
  title: "Demo checkout — Ledger",
  description:
    "Preview a simulated Ledger expense checkout. No payment or expense is created.",
};

export default function Page() {
  return <CheckoutPage />;
}

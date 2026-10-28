export type CheckoutPaymentMethodId =
  | "jazzcash"
  | "easypaisa"
  | "raast"
  | "visa"
  | "mastercard";

export type CheckoutPaymentMethod = {
  id: CheckoutPaymentMethodId;
  name: string;
  description: string;
};

export const checkoutPaymentMethods: CheckoutPaymentMethod[] = [
  {
    id: "jazzcash",
    name: "JazzCash",
    description: "Mobile wallet · simulated selection",
  },
  {
    id: "easypaisa",
    name: "Easypaisa",
    description: "Mobile wallet · simulated selection",
  },
  {
    id: "raast",
    name: "Raast QR",
    description: "QR payment · simulated selection",
  },
  {
    id: "visa",
    name: "Visa",
    description: "Card option · no card details requested",
  },
  {
    id: "mastercard",
    name: "Mastercard",
    description: "Card option · no card details requested",
  },
];

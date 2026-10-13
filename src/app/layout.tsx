
import type { Metadata } from "next";
import Script from "next/script";
import { Outfit } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Ledger — Personal Expense Tracker",
  description:
    "Track daily spending, filter by category and date, and see monthly totals.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      data-theme="light"
      suppressHydrationWarning
      className={`${outfit.variable} h-full antialiased`}
    >
      <head>
        <Script id="theme-init" strategy="beforeInteractive">
          {`try {
            var theme = localStorage.getItem("ledger-theme");
            if (theme === "dark" || theme === "light") {
              document.documentElement.dataset.theme = theme;
            }
          } catch {}`}
        </Script>
      </head>

      <body className="flex min-h-full flex-col bg-canvas text-ink">
        {children}
      </body>
    </html>
  );
}

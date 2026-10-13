
"use client";

import Link from "next/link";
import {
  BarChart3,
  FileText,
  LayoutDashboard,
  LogOut,
  Mail,
  Receipt,
  Repeat,
  Wallet,
  X,
} from "lucide-react";
import { signOut } from "@/actions/auth";

const navigationGroups = [
  {
    label: "Overview",
    links: [
      { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
      { label: "Analytics", href: "/analytics", icon: BarChart3 },
    ],
  },
  {
    label: "Manage",
    links: [
      { label: "Expenses", href: "/expenses", icon: Receipt },
      { label: "Budget", href: "/budget", icon: Wallet },
      {
        label: "Recurring expenses",
        href: "/recurring",
        icon: Repeat,
      },
      { label: "Reports", href: "/reports", icon: FileText },
      { label: "Email Center", href: "/notifications", icon: Mail },
    ],
  },
];

export function AppSidebar({
  activePath,
  email,
  mobile = false,
  onNavigate,
  onClose,
}: {
  activePath: string;
  email: string;
  mobile?: boolean;
  onNavigate?: () => void;
  onClose?: () => void;
}) {
  return (
    <aside
      className={`flex w-64 shrink-0 flex-col bg-card ${
        mobile
          ? "h-full border-r border-line shadow-2xl"
          : "sticky top-0 hidden h-dvh border-r border-line lg:flex"
      }`}
      aria-label="Main navigation"
    >
      {/* Logo */}
      <div className="flex h-[4.5rem] shrink-0 items-center justify-between border-b border-line px-5">
        <Link
          href="/dashboard"
          onClick={onNavigate}
          className="group flex items-center gap-3 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent text-white shadow-sm">
            <Wallet className="h-[18px] w-[18px]" />
          </span>

          <span className="text-[17px] font-semibold tracking-tight text-ink">
            Ledger<span className="text-accent">.</span>
          </span>
        </Link>

        {mobile && (
          <button
            type="button"
            onClick={onClose}
            className="ledger-icon-button"
            aria-label="Close navigation menu"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-7 overflow-y-auto px-3 py-6">
        {navigationGroups.map((group) => (
          <div key={group.label}>
            <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.15em] text-muted">
              {group.label}
            </p>

            <div className="space-y-1">
              {group.links.map((item) => {
                const Icon = item.icon;
                const active = activePath === item.href;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onNavigate}
                    aria-current={active ? "page" : undefined}
                    className={`flex min-h-11 items-center gap-3 rounded-xl px-3 text-[13px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent motion-reduce:transition-none ${
                      active
                        ? "bg-accent-soft text-accent"
                        : "text-muted hover:bg-canvas hover:text-ink"
                    }`}
                  >
                    <Icon className="h-[18px] w-[18px] shrink-0" />

                    <span>{item.label}</span>

                    {active && (
                      <span
                        aria-hidden="true"
                        className="ml-auto h-1.5 w-1.5 rounded-full bg-accent"
                      />
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Account and Logout */}
      <div className="shrink-0 border-t border-line p-3">
        <div className="mb-2 flex min-w-0 items-center gap-3 rounded-xl bg-canvas p-3">
          <div
            aria-hidden="true"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent-soft text-sm font-semibold text-accent"
          >
            {email ? email.charAt(0).toUpperCase() : "U"}
          </div>

          <div className="min-w-0">
            <p className="text-xs font-medium text-muted">Signed in as</p>

            <p className="truncate text-sm font-semibold text-ink">
              {email || "Your account"}
            </p>
          </div>
        </div>

        <form action={signOut}>
          <button
            type="submit"
            className="flex min-h-11 w-full items-center gap-3 rounded-xl px-3 text-sm font-medium text-muted transition-colors hover:bg-danger-soft hover:text-danger focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent motion-reduce:transition-none"
          >
            <LogOut className="h-[18px] w-[18px]" />
            Log out
          </button>
        </form>
      </div>
    </aside>
  );
}

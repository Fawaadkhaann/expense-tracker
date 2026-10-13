"use client";

import type { ReactNode } from "react";
import { useEffect, useRef, useState } from "react";
import { Menu, Moon, Sun } from "lucide-react";
import { AppSidebar } from "@/components/app-sidebar";

const pageLabels: Record<string, string> = {
  "/notifications": "Email Center",
  "/dashboard": "Dashboard",
  "/expenses": "Expenses",
  "/budget": "Budget",
  "/recurring": "Recurring expenses",
  "/analytics": "Analytics",
  "/reports": "Reports",
};

export function AppShell({
  activePath,
  email,
  children,
  actions,
}: {
  activePath: string;
  email: string;
  children: ReactNode;
  actions?: ReactNode;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const drawerRef = useRef<HTMLDivElement>(null);
  const pageLabel = pageLabels[activePath] ?? "Ledger";

  useEffect(() => {
    if (!menuOpen) return;

    const menuButton = menuButtonRef.current;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    drawerRef.current?.querySelector<HTMLElement>("button, a[href]")?.focus();

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setMenuOpen(false);
        return;
      }

      if (event.key !== "Tab" || !drawerRef.current) return;

      const focusable = Array.from(
        drawerRef.current.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ),
      );
      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first?.focus();
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
      menuButton?.focus();
    };
  }, [menuOpen]);

  function toggleTheme() {
    const nextTheme =
      document.documentElement.dataset.theme === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = nextTheme;
    try {
      localStorage.setItem("ledger-theme", nextTheme);
    } catch {
      // Keep the current page theme if browser storage is unavailable.
    }
  }

  return (
    <div className="min-h-screen bg-canvas text-ink">
      <div className="flex min-h-screen">
        <AppSidebar activePath={activePath} email={email} />

        <div className="flex min-h-screen min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-30 border-b border-line bg-card/95 backdrop-blur-xl">
            <div className="mx-auto flex min-h-[4.5rem] w-full max-w-[1600px] items-center justify-between gap-3 px-4 py-3 sm:px-6 xl:px-10">
              <div className="flex min-w-0 items-center gap-3">
                <button
                  ref={menuButtonRef}
                  type="button"
                  onClick={() => setMenuOpen(true)}
                  className="ledger-icon-button shrink-0 border border-line bg-canvas text-ink lg:hidden"
                  aria-label="Open navigation menu"
                  aria-expanded={menuOpen}
                  aria-controls="mobile-navigation"
                >
                  <Menu className="h-5 w-5" />
                </button>
                <div className="min-w-0">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted">
                    Ledger <span className="px-1 text-line">/</span> Workspace
                  </p>
                  <h1 className="truncate text-lg font-semibold tracking-tight text-ink sm:text-xl">
                    {pageLabel}
                  </h1>
                </div>
              </div>

              <div className="flex shrink-0 items-center gap-2 sm:gap-3">
                <div className="hidden max-w-52 text-right md:block">
                  <p className="truncate text-sm font-medium text-ink">
                    {email}
                  </p>
                  <p className="mt-0.5 text-xs text-muted">Personal account</p>
                </div>
                <div
                  aria-hidden="true"
                  className="hidden h-9 w-9 items-center justify-center rounded-full bg-accent-soft text-sm font-semibold text-accent md:flex"
                >
                  {email ? email.charAt(0).toUpperCase() : "U"}
                </div>
                <button
                  type="button"
                  onClick={toggleTheme}
                  className="ledger-icon-button shrink-0 border border-line bg-canvas text-ink"
                  aria-label="Toggle light and dark theme"
                  title="Toggle theme"
                >
                  <Sun className="theme-icon-sun h-[18px] w-[18px]" />
                  <Moon className="theme-icon-moon h-[18px] w-[18px]" />
                </button>
                {actions}
              </div>
            </div>
          </header>

          <main className="mx-auto w-full max-w-[1600px] flex-1 space-y-7 px-4 py-6 sm:px-6 sm:py-8 xl:px-10">
            {children}
          </main>
        </div>
      </div>

      {menuOpen && (
        <div
          className="fixed inset-0 z-50 bg-ink/50 backdrop-blur-sm lg:hidden"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setMenuOpen(false);
            }
          }}
        >
          <div
            ref={drawerRef}
            id="mobile-navigation"
            role="dialog"
            aria-modal="true"
            aria-label="Navigation menu"
            className="h-full w-[min(18rem,88vw)] motion-safe:animate-[ledger-slide-in_180ms_ease-out]"
          >
            <AppSidebar
              activePath={activePath}
              email={email}
              mobile
              onNavigate={() => setMenuOpen(false)}
              onClose={() => setMenuOpen(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}

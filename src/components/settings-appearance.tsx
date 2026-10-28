"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { getTheme, setTheme, themeChangeEvent } from "@/lib/theme";
import type { LedgerTheme } from "@/lib/theme";

const themeOptions: {
  theme: LedgerTheme;
  label: string;
  description: string;
  icon: typeof Sun;
}[] = [
  {
    theme: "light",
    label: "Light",
    description: "A bright, clean workspace",
    icon: Sun,
  },
  {
    theme: "dark",
    label: "Dark",
    description: "A comfortable low-light view",
    icon: Moon,
  },
];

export function SettingsAppearance() {
  const [currentTheme, setCurrentTheme] = useState<LedgerTheme | null>(null);

  useEffect(() => {
    function syncTheme() {
      setCurrentTheme(getTheme());
    }

    syncTheme();
    window.addEventListener(themeChangeEvent, syncTheme);
    return () => window.removeEventListener(themeChangeEvent, syncTheme);
  }, []);

  return (
    <section className="ledger-card p-5 sm:p-7" aria-labelledby="appearance-title">
      <div className="mb-6">
        <h2
          id="appearance-title"
          className="text-lg font-semibold tracking-tight text-ink"
        >
          Appearance
        </h2>
        <p className="mt-1 text-sm leading-6 text-muted">
          Choose the theme that feels right. Your choice is saved on this device.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {themeOptions.map(({ theme, label, description, icon: Icon }) => {
          const selected = currentTheme === theme;

          return (
            <button
              key={theme}
              type="button"
              onClick={() => setTheme(theme)}
              aria-pressed={selected}
              className={`flex min-h-24 items-center gap-3 rounded-xl border p-4 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent motion-reduce:transition-none ${
                selected
                  ? "border-accent bg-accent-soft text-accent"
                  : "border-line bg-canvas text-ink hover:border-accent/50"
              }`}
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-card">
                <Icon className="h-5 w-5" aria-hidden="true" />
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-semibold">{label}</span>
                <span className="mt-1 block text-xs leading-5 text-muted">
                  {description}
                </span>
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}

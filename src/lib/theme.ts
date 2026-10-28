export type LedgerTheme = "light" | "dark";

export const themeChangeEvent = "ledger-theme-change";

export function getTheme(): LedgerTheme {
  return document.documentElement.dataset.theme === "dark" ? "dark" : "light";
}

export function setTheme(theme: LedgerTheme) {
  document.documentElement.dataset.theme = theme;

  try {
    localStorage.setItem("ledger-theme", theme);
  } catch {
    // Keep the current page theme if browser storage is unavailable.
  }

  window.dispatchEvent(new Event(themeChangeEvent));
}

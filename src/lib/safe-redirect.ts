const redirectBase = "https://ledger.invalid";

export function getSafeRedirectPath(next: string) {
  try {
    const redirectUrl = new URL(next, redirectBase);

    if (redirectUrl.origin !== redirectBase) {
      return "/dashboard";
    }

    return `${redirectUrl.pathname}${redirectUrl.search}${redirectUrl.hash}`;
  } catch {
    return "/dashboard";
  }
}

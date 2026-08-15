const STORAGE_KEY = "moonsteel:product-back";

export type ProductBackLink = {
  href: string;
  label: string;
};

export function rememberProductBackLink(link: ProductBackLink) {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(link));
  } catch {
    // Ignore private-mode or disabled storage.
  }
}

export function readProductBackLink(): ProductBackLink | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as ProductBackLink;
    if (typeof parsed?.href === "string" && typeof parsed?.label === "string") {
      return parsed;
    }
  } catch {
    return null;
  }
  return null;
}

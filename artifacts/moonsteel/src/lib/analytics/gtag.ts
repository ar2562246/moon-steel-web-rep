export type GaItem = {
  item_id: string;
  item_name: string;
  item_category?: string;
  index?: number;
};

type GtagFn = (...args: unknown[]) => void;

declare global {
  interface Window {
    gtag?: GtagFn;
  }
}

function gtag(...args: unknown[]) {
  if (typeof window === "undefined") return;
  window.gtag?.(...args);
}

export function trackEvent(name: string, params?: Record<string, unknown>) {
  gtag("event", name, params);
}

export function catalogItem(
  product: { slug: string; name: string; categories?: Array<{ name: string }> },
  index?: number,
): GaItem {
  return {
    item_id: product.slug,
    item_name: product.name,
    item_category: product.categories?.[0]?.name,
    ...(typeof index === "number" ? { index } : {}),
  };
}

export function trackGenerateLead(params: {
  method: string;
  project_type?: string;
  has_attachments?: boolean;
}) {
  trackEvent("generate_lead", params);
}

export function trackContactClick(method: "whatsapp" | "phone" | "email") {
  trackEvent(`${method}_click`, { method });
}

export function trackViewItem(item: GaItem) {
  trackEvent("view_item", { items: [item] });
}

export function trackViewItemList(listId: string, listName: string, items: GaItem[]) {
  if (items.length === 0) return;
  trackEvent("view_item_list", {
    item_list_id: listId,
    item_list_name: listName,
    items: items.slice(0, 24),
  });
}

export function trackSelectItem(listId: string, listName: string, item: GaItem) {
  trackEvent("select_item", {
    item_list_id: listId,
    item_list_name: listName,
    items: [item],
  });
}

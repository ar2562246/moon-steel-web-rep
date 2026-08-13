export function logoAltFromUrl(url: string, fallback = "Client logo") {
  try {
    const path = url.split("?")[0] ?? url;
    const file = path.split("/").pop() ?? "";
    const stem = file
      .replace(/\.[a-z0-9]+$/i, "")
      .replace(/[-_]+/g, " ")
      .replace(/\s+/g, " ")
      .trim();

    if (!stem || /^(logo|image|img|untitled|customer logo)$/i.test(stem)) {
      return fallback;
    }

    const label = stem.replace(/\b\w/g, (char) => char.toUpperCase());
    return `${label} logo`;
  } catch {
    return fallback;
  }
}

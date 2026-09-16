export const SEO_BASE =
  process.env.NEXT_PUBLIC_BASE_URL ??
  process.env.BASE_URL ??
  "http://localhost:3000";

export const SITE_NAME = "Jasmine Shop Premium Product";

export function absoluteUrl(path: string): string {
  if (!path) return "";
  if (/^https?:\/\//i.test(path)) return path;
  return `${SEO_BASE.replace(/\/+$/, "")}/${path.replace(/^\/+/, "")}`;
}

export function jsonLdScript(graph: Record<string, unknown>): string {
  return JSON.stringify(graph)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026");
}
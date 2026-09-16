function isPublicHttps() {
  const base = process.env.NEXT_PUBLIC_BASE_URL ?? process.env.BASE_URL ?? "";
  return base.startsWith("https://");
}

export const COOKIE_SECURE = isPublicHttps();
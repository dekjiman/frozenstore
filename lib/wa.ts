export function normalizeWaNumber(value: string): string {
  const digits = value.replace(/\D/g, "");
  if (!digits) return "";
  return digits.startsWith("0") ? `62${digits.slice(1)}` : digits;
}

export function toWaLink(number: string, text?: string): string | null {
  const digits = normalizeWaNumber(number);
  if (!digits) return null;
  const base = `https://wa.me/${digits}`;
  return text ? `${base}?text=${encodeURIComponent(text)}` : base;
}
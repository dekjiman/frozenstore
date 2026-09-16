import type { NewResellerPackageRow } from "@/db/schema";

export type ResellerPackageEditable = Omit<
  NewResellerPackageRow,
  "id" | "createdAt" | "updatedAt"
>;

export type ResellerPackageCreateValue = ResellerPackageEditable;

export type ResellerPackageUpdateValue = Partial<ResellerPackageEditable>;

export type CreateParseOutcome =
  | { ok: true; values: ResellerPackageCreateValue }
  | { ok: false; errors: Record<string, string> };

export type UpdateParseOutcome =
  | { ok: true; values: ResellerPackageUpdateValue }
  | { ok: false; errors: Record<string, string> };

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const MAX_TITLE = 60;
const MAX_PLAN_LABEL = 24;
const MAX_DESCRIPTION = 2000;

function isMissing(value: unknown): boolean {
  return value === undefined || value === null || value === "";
}

function asTrimmed(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function asNonNegativeInt(value: unknown): number | null {
  if (isMissing(value)) return null;
  const n = Number(value);
  return Number.isInteger(n) && n >= 0 ? n : null;
}

function asPercent(value: unknown): number | null {
  const n = asNonNegativeInt(value);
  return n !== null && n <= 100 ? n : null;
}

function asBoolean(value: unknown): boolean | null {
  return typeof value === "boolean" ? value : null;
}

function asNullableNonNegativeInt(value: unknown): number | null | undefined {
  if (value === undefined) return undefined;
  if (value === null || value === "") return null;
  const n = asNonNegativeInt(value);
  return n === null ? undefined : n;
}

function hasOwn(body: Record<string, unknown>, key: string): boolean {
  return Object.prototype.hasOwnProperty.call(body, key);
}

export function validateResellerPackage(body: Record<string, unknown>): CreateParseOutcome;
export function validateResellerPackage(
  body: Record<string, unknown>,
  options: { partial: true },
): UpdateParseOutcome;
export function validateResellerPackage(
  body: Record<string, unknown>,
  options: { partial?: boolean } = {},
): CreateParseOutcome | UpdateParseOutcome {
  const partial = options.partial === true;
  const errors: Record<string, string> = {};
  const data: Partial<ResellerPackageCreateValue> = {};

  if (!partial || hasOwn(body, "slug")) {
    const slug = asTrimmed(body.slug);
    if (!slug) errors.slug = "Slug wajib diisi";
    else if (!SLUG_RE.test(slug)) errors.slug = "Slug hanya huruf kecil, angka, dan tanda hubung";
    else data.slug = slug;
  }
  if (!partial || hasOwn(body, "title")) {
    const title = asTrimmed(body.title);
    if (!title) errors.title = "Nama paket wajib diisi";
    else if (title.length > MAX_TITLE) errors.title = `Maksimal ${MAX_TITLE} karakter`;
    else data.title = title;
  }
  if (hasOwn(body, "planLabel")) data.planLabel = asTrimmed(body.planLabel).slice(0, MAX_PLAN_LABEL);
  if (hasOwn(body, "description")) data.description = asTrimmed(body.description).slice(0, MAX_DESCRIPTION);

  const commitInt = (
    key: "minOrder" | "discountMinPercent" | "discountMaxPercent" | "marginMin" | "marginMax" | "sortOrder",
    source: unknown,
    max?: number,
  ): void => {
    if (partial && !hasOwn(body, key)) return;
    const n = asNonNegativeInt(source);
    if (n === null) errors[key] = max !== undefined ? `Harus bilangan bulat 0–${max}` : "Harus bilangan bulat ≥ 0";
    else if (max !== undefined && n > max) errors[key] = `Maksimal ${max}`;
    else data[key] = n;
  };
  commitInt("minOrder", body.minOrder);
  commitInt("discountMinPercent", body.discountMinPercent, 100);
  commitInt("discountMaxPercent", body.discountMaxPercent, 100);
  commitInt("marginMin", body.marginMin);
  commitInt("marginMax", body.marginMax);
  commitInt("sortOrder", body.sortOrder);

  if (partial && !hasOwn(body, "freeVariantMix")) {
    // skip
  } else {
    const b = asBoolean(body.freeVariantMix);
    if (b === null) errors.freeVariantMix = "Campur varian harus benar/salah";
    else data.freeVariantMix = b;
  }
  if (partial && !hasOwn(body, "isRecommended")) {
    // skip
  } else {
    const b = asBoolean(body.isRecommended);
    if (b === null) errors.isRecommended = "Rekomendasi harus benar/salah";
    else data.isRecommended = b;
  }
  if (partial && !hasOwn(body, "isActive")) {
    // skip
  } else {
    const b = asBoolean(body.isActive);
    if (b === null) errors.isActive = "Status aktif harus benar/salah";
    else data.isActive = b;
  }

  if (hasOwn(body, "simulateDailyPcs")) {
    if (body.simulateDailyPcs === null || body.simulateDailyPcs === "") {
      data.simulateDailyPcs = null;
    } else {
      const n = asNonNegativeInt(body.simulateDailyPcs);
      if (n === null) errors.simulateDailyPcs = "Simulasi harian harus bilangan bulat ≥ 0";
      else data.simulateDailyPcs = n;
    }
  }
  if (hasOwn(body, "simulateProfitPerPcs")) {
    if (body.simulateProfitPerPcs === null || body.simulateProfitPerPcs === "") {
      data.simulateProfitPerPcs = null;
    } else {
      const n = asNonNegativeInt(body.simulateProfitPerPcs);
      if (n === null) errors.simulateProfitPerPcs = "Simulasi profit harus bilangan bulat ≥ 0";
      else data.simulateProfitPerPcs = n;
    }
  }

  if (data.discountMinPercent !== undefined && data.discountMaxPercent !== undefined && data.discountMaxPercent < data.discountMinPercent) {
    errors.discountMaxPercent = "Diskon maksimal tidak boleh lebih kecil dari minimal";
  }
  if (data.marginMin !== undefined && data.marginMax !== undefined && data.marginMax < data.marginMin) {
    errors.marginMax = "Margin maksimal tidak boleh lebih kecil dari minimal";
  }

  if (Object.keys(errors).length > 0) {
    return partial
      ? { ok: false, errors }
      : { ok: false, errors };
  }

  if (!partial) {
    if (
      data.slug === undefined ||
      data.title === undefined ||
      data.minOrder === undefined ||
      data.discountMinPercent === undefined ||
      data.discountMaxPercent === undefined ||
      data.marginMin === undefined ||
      data.marginMax === undefined ||
      data.freeVariantMix === undefined ||
      data.isRecommended === undefined ||
      data.sortOrder === undefined ||
      data.isActive === undefined
    ) {
      return { ok: false, errors: { _form: "Data paket tidak lengkap" } };
    }
    return { ok: true, values: data as ResellerPackageCreateValue };
  }

  return { ok: true, values: data as ResellerPackageUpdateValue };
}

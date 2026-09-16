const buckets = new Map<string, { count: number; resetAt: number }>();
const SWEEP_INTERVAL_MS = 60_000;
let lastSweepAt = 0;

const IP_PATTERN =
  /^(?:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)\.){3}(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)$|^[0-9a-fA-F]{1,4}(?::[0-9a-fA-F]{1,4}){2,7}$/;

function validIp(value: string | null | undefined): boolean {
  if (!value) return false;
  const candidate = value.trim();
  return candidate.length > 0 && candidate.length <= 45 && IP_PATTERN.test(candidate);
}

export function clientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",").map((part) => part.trim()).find(validIp);
    if (first) return first;
  }
  const real = request.headers.get("x-real-ip");
  if (validIp(real)) return real ?? "unknown";
  return "unknown";
}

function sweepExpired() {
  const now = Date.now();
  const maxBucketCount = 1_000_000;
  if (buckets.size > maxBucketCount) {
    for (const [bucketKey, bucket] of buckets) {
      if (bucket.resetAt <= now) buckets.delete(bucketKey);
    }
  } else if (now - lastSweepAt >= SWEEP_INTERVAL_MS) {
    for (const [bucketKey, bucket] of buckets) {
      if (bucket.resetAt <= now) buckets.delete(bucketKey);
    }
    lastSweepAt = now;
  }
}

export function isRateLimited(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();

  sweepExpired();

  const bucket = buckets.get(key);
  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return false;
  }

  bucket.count += 1;
  return bucket.count > limit;
}
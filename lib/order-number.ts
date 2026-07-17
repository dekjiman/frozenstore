import { randomInt } from "node:crypto";

export function createOrderNumber(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const suffix = String(randomInt(0, 10_000)).padStart(4, "0");
  return `RAF-${year}${month}${day}-${suffix}`;
}

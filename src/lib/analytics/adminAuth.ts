import "server-only";

import { createHmac, timingSafeEqual } from "node:crypto";

export function adminCookieValue(secret: string): string {
  return createHmac("sha256", secret).update("saheli-admin-v1").digest("hex");
}

export function verifyAdminCookie(cookieVal: string | undefined, secret: string | undefined): boolean {
  if (!secret || secret.length < 8 || !cookieVal) return false;
  const expected = adminCookieValue(secret);
  if (cookieVal.length !== expected.length) return false;
  try {
    return timingSafeEqual(Buffer.from(cookieVal, "utf8"), Buffer.from(expected, "utf8"));
  } catch {
    return false;
  }
}

export function timingSafeSecretEqual(a: string, b: string): boolean {
  const ba = Buffer.from(a, "utf8");
  const bb = Buffer.from(b, "utf8");
  if (ba.length !== bb.length) return false;
  try {
    return timingSafeEqual(ba, bb);
  } catch {
    return false;
  }
}

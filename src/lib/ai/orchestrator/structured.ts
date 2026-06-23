import type { z } from "zod";

export function parseStructuredJson<T extends z.ZodTypeAny>(
  raw: string,
  schema: T,
): { data: z.infer<T> } | { error: string } {
  let obj: unknown;
  try {
    obj = JSON.parse(raw);
  } catch {
    return { error: "invalid_json" };
  }
  const parsed = schema.safeParse(obj);
  if (!parsed.success) return { error: parsed.error.message };
  return { data: parsed.data };
}

export function jsonSchemaHint(schema: z.ZodTypeAny): string {
  return `Respond with a single JSON object that validates this shape (field names required): ${String(schema.description ?? "see system")}.`;
}

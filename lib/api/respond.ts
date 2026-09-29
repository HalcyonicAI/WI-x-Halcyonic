import "server-only";
import type { ApiErrorBody, ApiErrorCode } from "./contracts";

const STATUS: Record<ApiErrorCode, number> = {
  BAD_REQUEST: 400,
  PAYMENT_REQUIRED: 402,
  PAYMENT_FAILED: 402,
  GENERATION_LIMIT_REACHED: 429,
  TRYON_LIMIT_REACHED: 429,
  BOOKING_FINALIZED: 409,
  NO_DESIGN: 409,
  GENERATION_FAILED: 503,
  TRYON_FAILED: 503,
};

export function apiError(code: ApiErrorCode, message: string): Response {
  const body: ApiErrorBody = { error: { code, message } };
  return Response.json(body, { status: STATUS[code] });
}

export async function readJson<T>(request: Request): Promise<T | null> {
  try {
    return (await request.json()) as T;
  } catch {
    return null;
  }
}

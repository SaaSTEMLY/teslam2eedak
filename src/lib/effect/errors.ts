import { Data } from "effect";

// ── Auth ────────────────────────────────────────────────────────────────────

export class UnauthorizedError extends Data.TaggedError("UnauthorizedError")<{
  readonly message?: string;
}> {}

export class ForbiddenError extends Data.TaggedError("ForbiddenError")<{
  readonly message?: string;
  readonly resource?: string;
}> {}

export class InvalidApiKeyError extends Data.TaggedError("InvalidApiKeyError")<{
  readonly reason: string;
}> {}

// ── Validation ──────────────────────────────────────────────────────────────

export class ValidationError extends Data.TaggedError("ValidationError")<{
  readonly message: string;
  readonly details: unknown;
}> {}

// ── Data ────────────────────────────────────────────────────────────────────

export class NotFoundError extends Data.TaggedError("NotFoundError")<{
  readonly resource: string;
  readonly id?: string;
}> {}

export class ConflictError extends Data.TaggedError("ConflictError")<{
  readonly message: string;
}> {}

// ── Payment ─────────────────────────────────────────────────────────────────

export class PaymentError extends Data.TaggedError("PaymentError")<{
  readonly message: string;
  readonly code?: string;
}> {}

export class InvalidDiscountError extends Data.TaggedError(
  "InvalidDiscountError",
)<{
  readonly code: string;
  readonly reason: string;
}> {}

// ── External Services ───────────────────────────────────────────────────────

export class ExternalServiceError extends Data.TaggedError(
  "ExternalServiceError",
)<{
  readonly service: string;
  readonly operation: string;
  readonly cause?: unknown;
}> {}

// ── Rate Limiting ───────────────────────────────────────────────────────────

export class RateLimitedError extends Data.TaggedError("RateLimitedError")<{
  readonly retryAfterMs: number;
}> {}

// ── Restaurant domain ──────────────────────────────────────────────────────

export class ItemUnavailableError extends Data.TaggedError(
  "ItemUnavailableError",
)<{
  readonly itemId: string | number;
  readonly reason: "sold-out" | "branch-override" | "scheduled";
}> {}

export class ModifierConstraintViolationError extends Data.TaggedError(
  "ModifierConstraintViolationError",
)<{
  readonly groupSlug: string;
  readonly violation: "below-min" | "above-max" | "unknown-option";
  readonly message: string;
}> {}

export class BranchClosedError extends Data.TaggedError("BranchClosedError")<{
  readonly locationId: string | number;
  readonly reason?: string;
}> {}

export class TableInactiveError extends Data.TaggedError("TableInactiveError")<{
  readonly tableId: string | number;
  readonly shortId?: string;
}> {}

export class PaymentProviderNotAllowedError extends Data.TaggedError(
  "PaymentProviderNotAllowedError",
)<{
  readonly provider: string;
  readonly fulfillmentMode: string;
}> {}

// ── Infrastructure ──────────────────────────────────────────────────────────

export class PayloadOperationError extends Data.TaggedError(
  "PayloadOperationError",
)<{
  readonly message: string;
  readonly cause?: unknown;
}> {}

/** Union of all domain errors that map to HTTP responses. */
export type HttpError =
  | UnauthorizedError
  | ForbiddenError
  | InvalidApiKeyError
  | ValidationError
  | NotFoundError
  | ConflictError
  | PaymentError
  | InvalidDiscountError
  | ExternalServiceError
  | RateLimitedError
  | ItemUnavailableError
  | ModifierConstraintViolationError
  | BranchClosedError
  | TableInactiveError
  | PaymentProviderNotAllowedError
  | PayloadOperationError;

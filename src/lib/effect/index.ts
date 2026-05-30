// Re-export everything for convenient imports:
//   import { handleRoute, ok, Auth, Payload, AppLive } from "@/lib/effect"

export { handleRoute, ok, created } from "./route-handler";
export type { RouteSuccess } from "./route-handler";

export {
  UnauthorizedError,
  ForbiddenError,
  InvalidApiKeyError,
  ValidationError,
  NotFoundError,
  ConflictError,
  PaymentError,
  InvalidDiscountError,
  ExternalServiceError,
  RateLimitedError,
  ItemUnavailableError,
  ModifierConstraintViolationError,
  BranchClosedError,
  TableInactiveError,
  PaymentProviderNotAllowedError,
  PayloadOperationError,
} from "./errors";
export type { HttpError } from "./errors";

export { parseZod, parseBody } from "./zod";

export { Auth } from "./services/auth";
export type { SessionUser, AdminUser, AuthService } from "./services/auth";
export { AuthLive } from "./services/auth";

export { Payload } from "./services/payload";
export type { PayloadService } from "./services/payload";
export { PayloadLive } from "./services/payload";

export { AppLive } from "./layers";

export { runHookEffect } from "./hook-runner";

export { checkRateLimit } from "./rate-limit";

export { Discount } from "./services/discount";
export type {
  DiscountServiceInterface,
  DiscountValidationResult,
} from "./services/discount";
export { DiscountLive } from "./services/discount";

export { StripeService } from "./services/stripe";
export type { StripeServiceInterface, CardInfo } from "./services/stripe";
export { StripeLive } from "./services/stripe";

export { CartService } from "./services/cart";
export type { CartServiceInterface, AuthorizedCart } from "./services/cart";
export { CartLive } from "./services/cart";

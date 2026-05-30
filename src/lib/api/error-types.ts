/** Standard error response shape from all API routes. */
export interface ApiErrorResponse {
  error: string;
  details?: Record<string, unknown>;
}

/** Type guard for API error responses. */
export function isApiError(body: unknown): body is ApiErrorResponse {
  return (
    typeof body === "object" &&
    body !== null &&
    "error" in body &&
    typeof (body as ApiErrorResponse).error === "string"
  );
}

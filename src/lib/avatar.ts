export function dicebearUrl(email: string): string {
  return `/api/avatar?seed=${encodeURIComponent(email)}`;
}

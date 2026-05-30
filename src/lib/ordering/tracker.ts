/**
 * Pure helpers for the customer-facing order tracker.
 *
 * `KitchenStatus` is the four-state kanban from GOAL §7 plus the
 * cancelled terminal. The tracker view derives a friendly label, an
 * ETA window (when applicable), and a progress fraction from the
 * status + placedAt + per-item prepTimeMinutes.
 */

export const KITCHEN_STATUSES = [
  "placed",
  "preparing",
  "ready",
  "delivered",
  "cancelled",
] as const;

export type KitchenStatus = (typeof KITCHEN_STATUSES)[number];

export function isTerminalStatus(status: KitchenStatus): boolean {
  return status === "delivered" || status === "cancelled";
}

export interface ProgressInput {
  readonly status: KitchenStatus;
}

export function statusProgressFraction(input: ProgressInput): number {
  switch (input.status) {
    case "placed":
      return 0.15;
    case "preparing":
      return 0.55;
    case "ready":
      return 0.9;
    case "delivered":
      return 1;
    case "cancelled":
      return 0;
  }
}

export interface EtaInput {
  readonly placedAt: Date;
  readonly status: KitchenStatus;
  readonly lineItems: ReadonlyArray<{ prepTimeMinutes: number; quantity: number }>;
  readonly queueAheadCount?: number;
  readonly now?: Date;
}

export interface EtaResult {
  /** Estimated ready time. Null when status is terminal. */
  readonly readyAt: Date | null;
  readonly minutesRemaining: number | null;
}

export function estimateEta(input: EtaInput): EtaResult {
  if (isTerminalStatus(input.status) || input.status === "ready") {
    return { readyAt: null, minutesRemaining: null };
  }
  const longestItem = input.lineItems.reduce(
    (max, li) => Math.max(max, li.prepTimeMinutes),
    0,
  );
  const queueFactor = (input.queueAheadCount ?? 0) + 1;
  const targetMinutes = Math.max(2, longestItem * queueFactor);

  const placedMs = input.placedAt.getTime();
  const nowMs = (input.now ?? new Date()).getTime();
  const elapsedMin = (nowMs - placedMs) / 60_000;
  const minutesRemaining = Math.max(
    0,
    Math.ceil(targetMinutes - elapsedMin),
  );

  const readyAt = new Date(
    placedMs + targetMinutes * 60_000,
  );
  return { readyAt, minutesRemaining };
}

export function statusLabel(status: KitchenStatus): string {
  switch (status) {
    case "placed":
      return "Order placed";
    case "preparing":
      return "Brewing now";
    case "ready":
      return "Ready for you";
    case "delivered":
      return "Delivered";
    case "cancelled":
      return "Cancelled";
  }
}

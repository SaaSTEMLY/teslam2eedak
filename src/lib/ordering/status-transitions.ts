/**
 * Kitchen-status transition rules for the Live Orders Board (GOAL §7).
 *
 * Happy-path: placed → preparing → ready → delivered.
 * Staff can cancel from any non-terminal state.
 * Terminal states (delivered, cancelled) accept no further transitions —
 * a refund/reissue flow lives on a separate order.
 */

import type { KitchenStatus } from "./tracker";

const ALLOWED: Record<KitchenStatus, ReadonlyArray<KitchenStatus>> = {
  placed: ["preparing", "cancelled"],
  preparing: ["ready", "cancelled"],
  ready: ["delivered", "cancelled"],
  delivered: [],
  cancelled: [],
};

export type TransitionError =
  | { kind: "terminal"; from: KitchenStatus }
  | { kind: "not-allowed"; from: KitchenStatus; to: KitchenStatus }
  | { kind: "same-state"; status: KitchenStatus };

export function validateTransition(
  from: KitchenStatus,
  to: KitchenStatus,
): TransitionError | null {
  if (from === to) return { kind: "same-state", status: from };
  if (ALLOWED[from].length === 0) return { kind: "terminal", from };
  if (!ALLOWED[from].includes(to)) {
    return { kind: "not-allowed", from, to };
  }
  return null;
}

export function nextAllowed(from: KitchenStatus): ReadonlyArray<KitchenStatus> {
  return ALLOWED[from];
}

/**
 * Pure availability resolution for menu items at a given branch.
 *
 * Hierarchy of overrides (later wins):
 *   1. `item.isAvailable` + `item.unavailableUntil`            (restaurant-level)
 *   2. per-branch `locationOverride.isAvailable`               (branch-level)
 *
 * `unavailableUntil` is interpreted as: the item is unavailable until
 * `now >= unavailableUntil`. After that timestamp, it auto-restocks.
 *
 * Returns the resolved boolean plus the reason it was unavailable (or
 * `null` when available), suitable for surfacing a `ItemUnavailableError`.
 */

export interface ItemAvailabilityInput {
  readonly isAvailable: boolean;
  readonly unavailableUntil?: string | Date | null;
  readonly locationOverride?: { readonly isAvailable?: boolean | null } | null;
  /** Pass a value to make tests deterministic; defaults to Date.now(). */
  readonly now?: Date;
}

export type AvailabilityReason =
  | "sold-out"
  | "branch-override"
  | "scheduled"
  | null;

export interface ItemAvailability {
  readonly available: boolean;
  readonly reason: AvailabilityReason;
}

export function resolveItemAvailability(
  input: ItemAvailabilityInput,
): ItemAvailability {
  // Branch override beats restaurant default.
  if (
    input.locationOverride &&
    typeof input.locationOverride.isAvailable === "boolean" &&
    input.locationOverride.isAvailable === false
  ) {
    return { available: false, reason: "branch-override" };
  }

  if (input.isAvailable === false) {
    return { available: false, reason: "sold-out" };
  }

  if (input.unavailableUntil) {
    const until =
      input.unavailableUntil instanceof Date
        ? input.unavailableUntil
        : new Date(input.unavailableUntil);
    const now = input.now ?? new Date();
    if (now.getTime() < until.getTime()) {
      return { available: false, reason: "scheduled" };
    }
  }

  return { available: true, reason: null };
}

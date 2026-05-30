/**
 * Live Orders Board archive policy (GOAL §3 — "Delivered auto-archives
 * after N hours").
 *
 * Semantics: delivered orders stay visible briefly (so staff can undo a
 * mis-tap or audit recent activity) and silently vanish from the board
 * after N hours. Cancelled orders are hidden immediately — they aren't
 * something staff need to see again.
 *
 * The policy is implemented as a pure helper that returns a Payload
 * `where` clause; the route handler interpolates it and Payload applies
 * the filter at the SQL layer. This keeps the staff endpoint cheap
 * regardless of historical order volume.
 */

export const DEFAULT_DELIVERED_ARCHIVE_HOURS = 2;

export interface ArchiveFilterInput {
  /** Now, as a millisecond timestamp. Injectable for deterministic tests. */
  readonly nowMs: number;
  /** Override the default 2-hour window. */
  readonly archiveAfterHours?: number;
}

export interface PayloadWhereClause {
  readonly or: ReadonlyArray<Record<string, unknown>>;
}

/**
 * Build the `where.or` clause that selects:
 *   (a) all non-terminal orders (placed, preparing, ready), OR
 *   (b) delivered orders whose updatedAt is within the archive window.
 *
 * Cancelled orders are excluded — they never reappear on the board.
 */
export function buildActiveAndRecentDeliveredFilter(
  input: ArchiveFilterInput,
): PayloadWhereClause {
  const hours = input.archiveAfterHours ?? DEFAULT_DELIVERED_ARCHIVE_HOURS;
  const cutoffIso = new Date(
    input.nowMs - hours * 60 * 60 * 1000,
  ).toISOString();

  return {
    or: [
      {
        kitchenStatus: {
          in: ["placed", "preparing", "ready"],
        },
      },
      {
        and: [
          { kitchenStatus: { equals: "delivered" } },
          { updatedAt: { greater_than: cutoffIso } },
        ],
      },
    ],
  };
}

/**
 * Predicate the same logic in pure JS so tests can verify behaviour
 * without running a Payload instance.
 */
export function shouldShowOnBoard(
  order: {
    readonly kitchenStatus: string;
    readonly updatedAt: string | Date;
  },
  input: ArchiveFilterInput,
): boolean {
  const hours = input.archiveAfterHours ?? DEFAULT_DELIVERED_ARCHIVE_HOURS;
  switch (order.kitchenStatus) {
    case "placed":
    case "preparing":
    case "ready":
      return true;
    case "delivered": {
      const updated =
        order.updatedAt instanceof Date
          ? order.updatedAt
          : new Date(order.updatedAt);
      const cutoff = input.nowMs - hours * 60 * 60 * 1000;
      return updated.getTime() > cutoff;
    }
    case "cancelled":
    default:
      return false;
  }
}

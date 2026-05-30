import { describe, test, expect } from "vitest";
import {
  buildActiveAndRecentDeliveredFilter,
  shouldShowOnBoard,
  DEFAULT_DELIVERED_ARCHIVE_HOURS,
} from "@/lib/ordering/archive";

const now = new Date("2026-05-30T12:00:00Z").getTime();

describe("buildActiveAndRecentDeliveredFilter", () => {
  test("first OR branch admits placed / preparing / ready", () => {
    const w = buildActiveAndRecentDeliveredFilter({ nowMs: now });
    const branch = w.or[0] as { kitchenStatus: { in: string[] } };
    expect(branch.kitchenStatus.in).toEqual(["placed", "preparing", "ready"]);
  });

  test("second OR branch admits delivered within the default 2h window", () => {
    const w = buildActiveAndRecentDeliveredFilter({ nowMs: now });
    const branch = w.or[1] as {
      and: ReadonlyArray<Record<string, unknown>>;
    };
    expect(branch.and).toHaveLength(2);
    const cutoff = (branch.and[1] as {
      updatedAt: { greater_than: string };
    }).updatedAt.greater_than;
    expect(new Date(cutoff).toISOString()).toBe(
      "2026-05-30T10:00:00.000Z",
    );
  });

  test("custom hours override the default", () => {
    const w = buildActiveAndRecentDeliveredFilter({
      nowMs: now,
      archiveAfterHours: 6,
    });
    const branch = w.or[1] as {
      and: ReadonlyArray<{ updatedAt?: { greater_than: string } }>;
    };
    const cutoff = branch.and.find((c) => c.updatedAt)?.updatedAt!
      .greater_than;
    expect(cutoff).toBe("2026-05-30T06:00:00.000Z");
  });

  test("default window is 2 hours", () => {
    expect(DEFAULT_DELIVERED_ARCHIVE_HOURS).toBe(2);
  });
});

describe("shouldShowOnBoard", () => {
  test("non-terminal statuses always show", () => {
    for (const status of ["placed", "preparing", "ready"]) {
      expect(
        shouldShowOnBoard(
          { kitchenStatus: status, updatedAt: new Date("1990-01-01") },
          { nowMs: now },
        ),
      ).toBe(true);
    }
  });

  test("delivered within the window shows", () => {
    const oneMinuteAgo = new Date(now - 60_000).toISOString();
    expect(
      shouldShowOnBoard(
        { kitchenStatus: "delivered", updatedAt: oneMinuteAgo },
        { nowMs: now },
      ),
    ).toBe(true);
  });

  test("delivered past the window is hidden", () => {
    const threeHoursAgo = new Date(now - 3 * 3_600_000).toISOString();
    expect(
      shouldShowOnBoard(
        { kitchenStatus: "delivered", updatedAt: threeHoursAgo },
        { nowMs: now },
      ),
    ).toBe(false);
  });

  test("delivered respects custom window", () => {
    const threeHoursAgo = new Date(now - 3 * 3_600_000).toISOString();
    expect(
      shouldShowOnBoard(
        { kitchenStatus: "delivered", updatedAt: threeHoursAgo },
        { nowMs: now, archiveAfterHours: 6 },
      ),
    ).toBe(true);
  });

  test("cancelled is never shown, even if it just happened", () => {
    expect(
      shouldShowOnBoard(
        { kitchenStatus: "cancelled", updatedAt: new Date(now).toISOString() },
        { nowMs: now },
      ),
    ).toBe(false);
  });

  test("unknown statuses are hidden (defensive)", () => {
    expect(
      shouldShowOnBoard(
        { kitchenStatus: "wat" as string, updatedAt: new Date(now).toISOString() },
        { nowMs: now },
      ),
    ).toBe(false);
  });
});

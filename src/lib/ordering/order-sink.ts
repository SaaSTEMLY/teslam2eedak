/**
 * `OrderSink` interface (per ADR-0004).
 *
 * Any consumer of confirmed orders implements this contract. The default
 * MVP implementation is `KanbanOrderSink` — it just writes the order to the
 * Payload `orders` collection where the Live Orders Board reads it. Future
 * implementations target POS systems (Foodics, Marn, Square): an adapter
 * subscribes to `publishTicket` and pushes to the POS API, and can call
 * back into our `updateAvailability` when the POS reports an 86'd item.
 *
 * A branch may have multiple sinks: kanban + POS both running. The sink
 * registry sequences `publishTicket` across all configured sinks.
 */

import type { FulfillmentMode } from "./fulfillment";

export interface TicketInput {
  readonly orderId: string | number;
  readonly restaurantId: string;
  readonly locationId: string | number;
  readonly fulfillmentMode: FulfillmentMode;
  readonly tableId?: string | number | null;
  readonly pickupTime?: Date | null;
  readonly items: ReadonlyArray<{
    readonly menuItemId: string | number;
    readonly name: string;
    readonly quantity: number;
    readonly notes?: string;
    readonly modifiers?: ReadonlyArray<{
      readonly groupSlug: string;
      readonly optionLabel: string;
    }>;
  }>;
  readonly placedAt: Date;
}

export interface AvailabilityUpdate {
  readonly menuItemId: string | number;
  readonly isAvailable: boolean;
  readonly unavailableUntil?: Date | null;
}

export interface OrderSink {
  readonly id: string;
  readonly publishTicket: (ticket: TicketInput) => Promise<void>;
  readonly updateAvailability?: (update: AvailabilityUpdate) => Promise<void>;
}

// ── Default kanban sink ────────────────────────────────────────────────────
//
// MVP implementation: the order itself is the ticket. The Live Orders Board
// reads the `orders` collection scoped to a branch. The kanban sink is a
// no-op publisher because the order was already written by the checkout
// flow — its presence in the registry just signals "yes, the kanban is
// receiving tickets." When POS adapters land, this becomes an explicit hook
// instead of a no-op.

export const kanbanOrderSink: OrderSink = {
  id: "kanban",
  publishTicket: async () => {
    // Order is already in the `orders` collection; the kanban reads from
    // there directly. Nothing to do. POS adapters override this method.
  },
};

// ── Registry ───────────────────────────────────────────────────────────────

export class OrderSinkRegistry {
  private readonly sinks: OrderSink[] = [];

  register(sink: OrderSink): void {
    if (this.sinks.some((s) => s.id === sink.id)) {
      throw new Error(`OrderSink already registered: ${sink.id}`);
    }
    this.sinks.push(sink);
  }

  async publish(ticket: TicketInput): Promise<void> {
    // Sequential to keep ordering across sinks deterministic and so a POS
    // failure surfaces clearly rather than being lost in Promise.all noise.
    for (const sink of this.sinks) {
      await sink.publishTicket(ticket);
    }
  }

  async pushAvailability(update: AvailabilityUpdate): Promise<void> {
    for (const sink of this.sinks) {
      if (sink.updateAvailability) {
        await sink.updateAvailability(update);
      }
    }
  }

  get registered(): ReadonlyArray<string> {
    return this.sinks.map((s) => s.id);
  }
}

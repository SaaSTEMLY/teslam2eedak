import { describe, test, expect } from "vitest";
import {
  OrderSinkRegistry,
  kanbanOrderSink,
  type OrderSink,
  type TicketInput,
} from "@/lib/ordering/order-sink";

const sampleTicket: TicketInput = {
  orderId: 1,
  restaurantId: "kk-main",
  locationId: 1,
  fulfillmentMode: "dine-in",
  tableId: 7,
  items: [
    {
      menuItemId: 42,
      name: "Salted Karamel L",
      quantity: 1,
      modifiers: [{ groupSlug: "milk", optionLabel: "Oat" }],
    },
  ],
  placedAt: new Date("2026-05-30T10:00:00Z"),
};

describe("OrderSinkRegistry", () => {
  test("starts empty", () => {
    const reg = new OrderSinkRegistry();
    expect(reg.registered).toEqual([]);
  });

  test("registers the default kanban sink", () => {
    const reg = new OrderSinkRegistry();
    reg.register(kanbanOrderSink);
    expect(reg.registered).toEqual(["kanban"]);
  });

  test("rejects duplicate ids", () => {
    const reg = new OrderSinkRegistry();
    reg.register(kanbanOrderSink);
    expect(() => reg.register(kanbanOrderSink)).toThrow(/already registered/);
  });

  test("publish calls every registered sink in order", async () => {
    const calls: string[] = [];
    const sinkA: OrderSink = {
      id: "a",
      publishTicket: async () => {
        calls.push("a");
      },
    };
    const sinkB: OrderSink = {
      id: "b",
      publishTicket: async () => {
        calls.push("b");
      },
    };
    const reg = new OrderSinkRegistry();
    reg.register(sinkA);
    reg.register(sinkB);
    await reg.publish(sampleTicket);
    expect(calls).toEqual(["a", "b"]);
  });

  test("publish surfaces sink failures", async () => {
    const failing: OrderSink = {
      id: "broken",
      publishTicket: async () => {
        throw new Error("POS down");
      },
    };
    const reg = new OrderSinkRegistry();
    reg.register(failing);
    await expect(reg.publish(sampleTicket)).rejects.toThrow("POS down");
  });

  test("pushAvailability calls only sinks that implement it", async () => {
    const calls: string[] = [];
    const a: OrderSink = {
      id: "with-avail",
      publishTicket: async () => {},
      updateAvailability: async () => {
        calls.push("with-avail");
      },
    };
    const b: OrderSink = {
      id: "without-avail",
      publishTicket: async () => {},
    };
    const reg = new OrderSinkRegistry();
    reg.register(a);
    reg.register(b);
    await reg.pushAvailability({ menuItemId: 1, isAvailable: false });
    expect(calls).toEqual(["with-avail"]);
  });

  test("kanban sink publishTicket is a safe no-op", async () => {
    await expect(kanbanOrderSink.publishTicket(sampleTicket)).resolves.toBeUndefined();
  });
});

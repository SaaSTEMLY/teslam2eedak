import { Effect } from "effect";

import {
  handleRoute,
  ok,
  Payload,
  AppLive,
  ValidationError,
  ExternalServiceError,
} from "@/lib/effect";
import { sendOrderConfirmationEmail } from "@/lib/email/order-confirmation";
import { sendOrderStatusEmail } from "@/lib/email/order-status";
import { syncProductToSaaSignal } from "@/lib/saasignal-sync";

interface JobPayload {
  job_id?: string;
  name?: string;
  queue?: string;
  payload?: Record<string, unknown>;
}

async function processOrderConfirmationEmail(
  data: Record<string, unknown>,
  raw: Awaited<ReturnType<typeof import("@/lib/payload").getPayload>>,
) {
  const orderId = data.orderId as number;

  const order = await raw.findByID({
    collection: "orders",
    id: orderId,
    depth: 1,
  });

  const o = order as unknown as {
    id: number;
    customerEmail?: string;
    customer?: { email?: string; name?: string };
    items?: {
      product?: {
        id: number;
        name?: string;
        priceInUSD?: number;
        images?: { url?: string }[];
      };
      variant?: { title?: string; images?: { url?: string }[] };
      quantity: number;
    }[];
    amount?: number;
    currency?: string;
    shippingAddress?: unknown;
    createdAt: string;
    discountCode?: string;
    discountAmount?: number;
  };

  const customerEmail =
    o.customerEmail ??
    (typeof o.customer === "object" ? o.customer?.email : null);

  if (!customerEmail) return;

  const items = (o.items ?? []).map((item) => {
    const product = item.product;
    const variant = item.variant;
    const variantImg = variant?.images?.[0];
    const productImg = product?.images?.[0];
    const img =
      (typeof variantImg === "object" ? variantImg : null) ??
      (typeof productImg === "object" ? productImg : null);

    const name = variant?.title
      ? `${product?.name ?? "Product"} — ${variant.title}`
      : (product?.name ?? "Product");

    return {
      name,
      quantity: item.quantity,
      price: product?.priceInUSD ?? 0,
      imageUrl: img?.url ?? null,
    };
  });

  await sendOrderConfirmationEmail({
    orderId: o.id,
    customerEmail,
    customerName: typeof o.customer === "object" ? o.customer?.name : undefined,
    items,
    totalAmount: o.amount ?? 0,
    currency: o.currency ?? "USD",
    shippingAddress: o.shippingAddress ?? null,
    orderDate: o.createdAt,
    discountCode: o.discountCode ?? null,
    discountAmount: o.discountAmount ?? null,
  });
}

async function processOrderStatusEmail(
  data: Record<string, unknown>,
  raw: Awaited<ReturnType<typeof import("@/lib/payload").getPayload>>,
) {
  const orderId = data.orderId as number;
  const newStatus = data.newStatus as string;

  const order = await raw.findByID({
    collection: "orders",
    id: orderId,
    depth: 1,
  });

  const o = order as unknown as {
    customerEmail?: string;
    customer?: { email?: string; name?: string };
  };

  const customerEmail =
    o.customerEmail ??
    (typeof o.customer === "object" ? o.customer?.email : null);

  if (!customerEmail) return;

  await sendOrderStatusEmail({
    orderId,
    customerEmail,
    customerName: typeof o.customer === "object" ? o.customer?.name : undefined,
    newStatus,
  });
}

async function processProductSync(
  data: Record<string, unknown>,
  raw: Awaited<ReturnType<typeof import("@/lib/payload").getPayload>>,
) {
  const productId = data.productId as number;

  const product = await raw.findByID({
    collection: "products",
    id: productId,
    depth: 1,
  });

  const p = product as unknown as {
    id: number;
    name?: string;
    slug?: string;
    description?: string;
    priceInUSD?: number | null;
    category?: string;
    featured?: boolean;
    images?: { url?: string; alt?: string }[];
  };

  await syncProductToSaaSignal(p);
}

export const POST = (req: Request) =>
  handleRoute(
    Effect.gen(function* () {
      const body = yield* Effect.tryPromise({
        try: () => req.json() as Promise<JobPayload>,
        catch: () =>
          new ValidationError({ message: "Invalid JSON body", details: {} }),
      });

      const queue = body.queue ?? body.name ?? "";
      const data = body.payload ?? {};

      const db = yield* Payload;
      const raw = yield* db.raw;

      switch (queue) {
        case "email:order-confirmation": {
          yield* Effect.tryPromise(() =>
            processOrderConfirmationEmail(data, raw),
          ).pipe(
            Effect.mapError(
              () =>
                new ExternalServiceError({
                  service: "Email",
                  operation: "orderConfirmation",
                }),
            ),
          );
          break;
        }
        case "email:order-status": {
          yield* Effect.tryPromise(() =>
            processOrderStatusEmail(data, raw),
          ).pipe(
            Effect.mapError(
              () =>
                new ExternalServiceError({
                  service: "Email",
                  operation: "orderStatus",
                }),
            ),
          );
          break;
        }
        case "search:sync":
        case "ranking:sync": {
          yield* Effect.tryPromise(() => processProductSync(data, raw)).pipe(
            Effect.mapError(
              () =>
                new ExternalServiceError({
                  service: "SaaSignal",
                  operation: "productSync",
                }),
            ),
          );
          break;
        }
        default:
          return yield* new ValidationError({
            message: `Unknown queue: ${queue}`,
            details: { queue },
          });
      }

      return ok({ ok: true });
    }).pipe(Effect.provide(AppLive)),
  );

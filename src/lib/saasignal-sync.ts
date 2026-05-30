import {
  rankingIngestSignals,
  rankingUpsertItems,
  searchUpsertDocuments,
  kvIncrement,
  channelPublish,
} from "@/lib/saasignal";

const SEARCH_INDEX_ID = process.env.SAASIGNAL_SEARCH_INDEX || "products";
const RANKING_COLLECTION_ID =
  process.env.SAASIGNAL_RANKING_COLLECTION || "products";
const LOW_STOCK_THRESHOLD = 5;

// ─── Order Sync ──────────────────────────────────────────

interface OrderItem {
  product?: number | { id: number; name?: string };
  quantity?: number;
}

interface OrderDoc {
  id: number;
  amount?: number;
  currency?: string;
  customerEmail?: string;
  fulfillmentStatus?: string;
  createdAt: string;
  customer?: number | { id: number | string; email?: string; name?: string };
  items?: OrderItem[];
}

export async function syncOrderToSaaSignal(
  order: OrderDoc,
  operation: "create" | "update",
  previousStatus?: string,
) {
  const customerId =
    typeof order.customer === "object"
      ? String(order.customer?.id ?? "anonymous")
      : String(order.customer ?? "anonymous");

  if (operation === "create") {
    // 1. Ingest ranking signals for each product (purchase event)
    const signals = (order.items ?? [])
      .filter((item) => item.product)
      .map((item) => ({
        userId: customerId,
        itemId: String(
          typeof item.product === "number"
            ? item.product
            : (item.product?.id ?? 0),
        ),
        signal: "purchase",
        weight: 5,
      }));

    if (signals.length > 0) {
      await rankingIngestSignals(RANKING_COLLECTION_ID, signals).catch(
        (err) => {
          console.error("Failed to ingest ranking signals for order:", err);
        },
      );
    }

    // 2. Increment KV analytics counters
    const amount = order.amount ?? 0;
    const dateStr = new Date(order.createdAt).toISOString().split("T")[0];

    await Promise.all([
      kvIncrement("analytics:revenue:total", amount),
      kvIncrement(`analytics:revenue:day:${dateStr}`, amount),
      kvIncrement("analytics:orders:total", 1),
      // Per-product counters
      ...(order.items ?? []).flatMap((item) => {
        const pid =
          typeof item.product === "number"
            ? item.product
            : (item.product?.id ?? 0);
        const qty = item.quantity ?? 1;
        const totalItems = (order.items ?? []).reduce(
          (sum, i) => sum + (i.quantity ?? 1),
          0,
        );
        const share = totalItems > 0 ? (qty / totalItems) * amount : 0;
        return [
          kvIncrement(`analytics:product:${pid}:quantity`, qty),
          kvIncrement(`analytics:product:${pid}:revenue`, Math.round(share)),
        ];
      }),
    ]).catch((err) => {
      console.error("Failed to increment KV analytics counters:", err);
    });

    // 3. Publish channel event
    await channelPublish("orders", "order:created", {
      orderId: order.id,
      customerId,
      amount,
      currency: order.currency ?? "USD",
    }).catch((err) => {
      console.error("Failed to publish order:created channel event:", err);
    });
  }

  if (operation === "update") {
    const newStatus = order.fulfillmentStatus;
    if (newStatus && newStatus !== previousStatus) {
      await channelPublish("orders", "order:status", {
        orderId: order.id,
        customerId,
        newStatus,
        previousStatus: previousStatus ?? null,
      }).catch((err) => {
        console.error("Failed to publish order:status channel event:", err);
      });
    }
  }
}

// ─── Product Sync ────────────────────────────────────────

interface ProductDoc {
  id: number;
  name?: string;
  slug?: string;
  description?: string;
  priceInUSD?: number | null;
  category?: string;
  featured?: boolean;
  images?: (number | { url?: string; alt?: string })[];
}

export async function syncProductToSaaSignal(product: ProductDoc) {
  const firstImage = product.images?.[0];
  let imageUrl: string | undefined;
  if (firstImage && typeof firstImage === "object" && firstImage.url) {
    try {
      imageUrl = new URL(firstImage.url).pathname;
    } catch {
      imageUrl = firstImage.url;
    }
  }

  const metadata: Record<string, unknown> = {
    name: product.name,
    slug: product.slug,
    description: product.description,
    priceInUSD: product.priceInUSD,
    category: product.category,
    featured: product.featured,
    imageUrl,
  };

  // Upsert to search index
  await searchUpsertDocuments(SEARCH_INDEX_ID, [
    {
      id: String(product.id),
      text: `${product.name ?? ""} ${product.description ?? ""}`,
      metadata,
    },
  ]).catch((err) => {
    console.error("Failed to upsert product to search index:", err);
  });

  // Upsert to ranking collection
  await rankingUpsertItems(RANKING_COLLECTION_ID, [
    { id: String(product.id), metadata },
  ]).catch((err) => {
    console.error("Failed to upsert product to ranking collection:", err);
  });
}

// ─── Inventory Alerts ────────────────────────────────────

export async function checkLowStockAlert(
  productId: number,
  remaining: number,
  productName?: string,
) {
  if (remaining <= LOW_STOCK_THRESHOLD && remaining >= 0) {
    await channelPublish("inventory", "stock:low", {
      productId,
      productName: productName ?? `Product #${productId}`,
      remaining,
    }).catch((err) => {
      console.error("Failed to publish stock:low channel event:", err);
    });
  }
}

// ─── KV Analytics Initialization ─────────────────────────

export async function initializeAnalyticsCounters() {
  await Promise.all([
    kvIncrement("analytics:revenue:total", 0),
    kvIncrement("analytics:orders:total", 0),
  ]).catch((err) => {
    console.error("Failed to initialize analytics counters:", err);
  });
}

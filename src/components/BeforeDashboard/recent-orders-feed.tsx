"use client";

interface RecentOrder {
  id: number;
  amount?: number;
  currency?: string;
  createdAt: string;
  customerEmail?: string;
  fulfillmentStatus?: string;
}

interface RecentOrdersFeedProps {
  orders: RecentOrder[];
}

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  processing: "bg-blue-100 text-blue-800",
  shipped: "bg-purple-100 text-purple-800",
  delivered: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
};

export function RecentOrdersFeed({ orders }: RecentOrdersFeedProps) {
  return (
    <div className="rounded-xl border border-border/50 bg-card p-4">
      <h3 className="text-sm font-medium text-foreground mb-4">
        Recent Orders
      </h3>
      {orders.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-8">
          No orders yet
        </p>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <div
              key={order.id}
              className="flex items-center justify-between text-sm"
            >
              <div>
                <span className="font-medium text-foreground">#{order.id}</span>
                <span className="text-muted-foreground ms-2">
                  {order.customerEmail ?? "—"}
                </span>
              </div>
              <div className="flex items-center gap-3">
                {order.fulfillmentStatus && (
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[order.fulfillmentStatus] ?? "bg-gray-100 text-gray-800"}`}
                  >
                    {order.fulfillmentStatus}
                  </span>
                )}
                <span className="font-medium text-foreground">
                  ${((order.amount ?? 0) / 100).toFixed(2)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

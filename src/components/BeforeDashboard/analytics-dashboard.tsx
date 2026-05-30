"use client";

import { useState, useEffect } from "react";
import { StatsCards } from "./stats-cards";
import { RevenueChart } from "./revenue-chart";
import { TopProductsTable } from "./top-products-table";
import { RecentOrdersFeed } from "./recent-orders-feed";
import { InventoryAlerts } from "./inventory-alerts";

interface SummaryData {
  totalRevenue: number;
  orderCount: number;
  averageOrderValue: number;
  customerCount: number;
}

interface RevenueData {
  date: string;
  revenue: number;
}

interface TopProduct {
  id: number;
  name: string;
  revenue: number;
  quantity: number;
}

interface RecentOrder {
  id: number;
  amount?: number;
  currency?: string;
  createdAt: string;
  customerEmail?: string;
  fulfillmentStatus?: string;
}

export function AnalyticsDashboard() {
  const [summary, setSummary] = useState<SummaryData | null>(null);
  const [revenueData, setRevenueData] = useState<RevenueData[]>([]);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [error, setError] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch("/api/admin/analytics/summary").then((r) =>
        r.ok ? r.json() : null,
      ),
      fetch("/api/admin/analytics/revenue?days=30").then((r) =>
        r.ok ? r.json() : null,
      ),
      fetch("/api/admin/analytics/top-products").then((r) =>
        r.ok ? r.json() : null,
      ),
      fetch("/api/orders?limit=5").then((r) => (r.ok ? r.json() : null)),
    ])
      .then(([summaryRes, revenueRes, topRes, ordersRes]) => {
        if (summaryRes) setSummary(summaryRes);
        if (revenueRes) setRevenueData(revenueRes.data ?? []);
        if (topRes) setTopProducts(topRes.products ?? []);
        if (ordersRes) setRecentOrders(ordersRes.orders ?? []);
      })
      .catch(() => setError(true));
  }, []);

  if (error) {
    return (
      <div className="p-4 text-sm text-muted-foreground">
        Unable to load analytics. Make sure you are logged in as an admin.
      </div>
    );
  }

  if (!summary) {
    return (
      <div className="p-4 text-sm text-muted-foreground animate-pulse">
        Loading analytics...
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4">
      <div>
        <h2 className="text-xl font-bold text-foreground">Dashboard</h2>
        <p className="text-sm text-muted-foreground">
          Overview of your store performance
        </p>
      </div>

      <StatsCards {...summary} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RevenueChart data={revenueData} />
        <TopProductsTable products={topProducts} />
      </div>

      <InventoryAlerts />

      <RecentOrdersFeed orders={recentOrders} />
    </div>
  );
}

"use client";

import { DollarSign, ShoppingCart, Users, TrendingUp } from "lucide-react";

interface StatsCardsProps {
  totalRevenue: number;
  orderCount: number;
  averageOrderValue: number;
  customerCount: number;
}

const cards = [
  {
    key: "revenue",
    label: "Total Revenue",
    icon: DollarSign,
    format: (v: number) => `$${(v / 100).toFixed(2)}`,
    valueKey: "totalRevenue" as const,
  },
  {
    key: "orders",
    label: "Orders",
    icon: ShoppingCart,
    format: (v: number) => String(v),
    valueKey: "orderCount" as const,
  },
  {
    key: "aov",
    label: "Avg. Order Value",
    icon: TrendingUp,
    format: (v: number) => `$${(v / 100).toFixed(2)}`,
    valueKey: "averageOrderValue" as const,
  },
  {
    key: "customers",
    label: "Customers",
    icon: Users,
    format: (v: number) => String(v),
    valueKey: "customerCount" as const,
  },
];

export function StatsCards(props: StatsCardsProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {cards.map((card) => {
        const Icon = card.icon;
        const value = props[card.valueKey];
        return (
          <div
            key={card.key}
            className="rounded-xl border border-border/50 bg-card p-4 space-y-2"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                {card.label}
              </span>
              <Icon className="size-4 text-muted-foreground" />
            </div>
            <p className="text-2xl font-bold text-foreground">
              {card.format(value)}
            </p>
          </div>
        );
      })}
    </div>
  );
}

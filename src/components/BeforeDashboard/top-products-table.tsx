"use client";

interface TopProduct {
  id: number;
  name: string;
  revenue: number;
  quantity: number;
}

interface TopProductsTableProps {
  products: TopProduct[];
}

export function TopProductsTable({ products }: TopProductsTableProps) {
  if (products.length === 0) {
    return (
      <div className="rounded-xl border border-border/50 bg-card p-4">
        <h3 className="text-sm font-medium text-foreground mb-4">
          Top Products
        </h3>
        <p className="text-sm text-muted-foreground text-center py-8">
          No sales data yet
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border/50 bg-card p-4">
      <h3 className="text-sm font-medium text-foreground mb-4">Top Products</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border/50">
              <th className="text-start py-2 font-medium text-muted-foreground">
                Product
              </th>
              <th className="text-end py-2 font-medium text-muted-foreground">
                Sold
              </th>
              <th className="text-end py-2 font-medium text-muted-foreground">
                Revenue
              </th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr
                key={product.id}
                className="border-b border-border/30 last:border-0"
              >
                <td className="py-2.5 text-foreground">{product.name}</td>
                <td className="py-2.5 text-end text-muted-foreground">
                  {product.quantity}
                </td>
                <td className="py-2.5 text-end font-medium text-foreground">
                  ${(product.revenue / 100).toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

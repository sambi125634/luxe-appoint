import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, TrendingDown, Wallet, BarChart3 } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  current_stock: number;
  purchase_price_net: number | null;
  sale_price_gross: number;
  min_stock: number;
}

interface InventoryStatsProps {
  salonId: string | null | undefined;
  products: Product[];
  isDemo?: boolean;
}

const InventoryStats: React.FC<InventoryStatsProps> = ({ products, isDemo }) => {
  const totalValue = products.reduce(
    (sum, p) => sum + p.current_stock * (p.purchase_price_net || 0),
    0
  );

  const lowStockCount = products.filter(
    (p) => p.current_stock <= p.min_stock && p.current_stock > 0
  ).length;

  const outOfStockCount = products.filter((p) => p.current_stock <= 0).length;

  const topProducts = [...products]
    .sort((a, b) => (a.current_stock - a.min_stock) - (b.current_stock - b.min_stock))
    .slice(0, 5);

  const stats = [
    {
      icon: Wallet,
      label: 'Wartość magazynu',
      value: `${totalValue.toFixed(2)} zł`,
      sub: `${products.length} produktów`,
    },
    {
      icon: TrendingDown,
      label: 'Niski stan',
      value: lowStockCount.toString(),
      sub: 'produktów poniżej progu',
    },
    {
      icon: Package,
      label: 'Brak na stanie',
      value: outOfStockCount.toString(),
      sub: 'wymaga zamówienia',
    },
    {
      icon: BarChart3,
      label: 'Śr. wartość produktu',
      value: products.length > 0 ? `${(totalValue / products.length).toFixed(2)} zł` : '—',
      sub: 'koszt jednostkowy',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <Card key={i}>
            <CardContent className="pt-4">
              <div className="flex items-center gap-2 mb-2">
                <stat.icon className="w-4 h-4 text-primary" />
                <span className="text-xs text-muted-foreground">{stat.label}</span>
              </div>
              <p className="text-xl font-bold">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Produkty wymagające uwagi</CardTitle>
        </CardHeader>
        <CardContent>
          {topProducts.length > 0 ? (
            <div className="space-y-3">
              {topProducts.map((p) => {
                const diff = p.current_stock - p.min_stock;
                return (
                  <div
                    key={p.id}
                    className="flex items-center justify-between p-3 rounded-lg border"
                  >
                    <div>
                      <p className="font-medium text-sm">{p.name}</p>
                      <p className="text-xs text-muted-foreground">
                        Stan: {p.current_stock} / min: {p.min_stock}
                      </p>
                    </div>
                    <span
                      className={`text-sm font-medium ${
                        diff <= 0 ? 'text-destructive' : diff <= 3 ? 'text-orange-500' : 'text-emerald-600'
                      }`}
                    >
                      {diff <= 0 ? 'ZAMÓW' : `+${diff}`}
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">
              Brak produktów do wyświetlenia
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default InventoryStats;

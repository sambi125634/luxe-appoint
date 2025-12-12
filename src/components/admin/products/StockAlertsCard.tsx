import { useTranslation } from "react-i18next";
import { AlertTriangle, Package, TrendingUp, ArrowRight, ShoppingCart } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import type { StockAlert, ProductSalesForecast } from "@/hooks/useStockAlerts";

interface StockAlertsCardProps {
  alerts: StockAlert[];
  topSelling: ProductSalesForecast[];
  onViewAll?: () => void;
}

export function StockAlertsCard({ alerts, topSelling, onViewAll }: StockAlertsCardProps) {
  const { t, i18n } = useTranslation();
  const isPl = i18n.language === 'pl';

  const criticalAlerts = alerts.filter(a => a.status === "critical");
  const lowAlerts = alerts.filter(a => a.status === "low");

  if (alerts.length === 0 && topSelling.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      {/* Critical Stock Alerts */}
      {criticalAlerts.length > 0 && (
        <Card className="border-destructive/50 bg-destructive/5">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-medium flex items-center gap-2 text-destructive">
              <AlertTriangle className="w-5 h-5" />
              {isPl ? "Krytyczny stan magazynowy" : "Critical Stock Alert"}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-3">
              {criticalAlerts.slice(0, 3).map((alert) => (
                <div 
                  key={alert.id} 
                  className="flex items-center justify-between p-3 rounded-lg bg-background border border-destructive/20"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-destructive/10">
                      <Package className="w-4 h-4 text-destructive" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{alert.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {alert.brand && `${alert.brand} • `}{alert.category}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant="destructive" className="mb-1">
                      {alert.currentStock === 0 
                        ? (isPl ? "Brak" : "Out") 
                        : `${alert.currentStock} szt.`}
                    </Badge>
                    {alert.suggestedOrderQty && alert.suggestedOrderQty > 0 && (
                      <p className="text-xs text-muted-foreground flex items-center gap-1 justify-end">
                        <ShoppingCart className="w-3 h-3" />
                        {isPl ? "Zamów" : "Order"}: {alert.suggestedOrderQty}
                      </p>
                    )}
                  </div>
                </div>
              ))}
              {criticalAlerts.length > 3 && (
                <p className="text-xs text-muted-foreground text-center">
                  +{criticalAlerts.length - 3} {isPl ? "więcej alertów" : "more alerts"}
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Low Stock Warnings */}
      {lowAlerts.length > 0 && (
        <Card className="border-yellow-500/50 bg-yellow-50/50 dark:bg-yellow-950/10">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-medium flex items-center gap-2 text-yellow-700 dark:text-yellow-500">
              <AlertTriangle className="w-5 h-5" />
              {isPl ? "Niski stan magazynowy" : "Low Stock Warning"}
              <Badge variant="outline" className="ml-auto text-yellow-700 border-yellow-500">
                {lowAlerts.length}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-2">
              {lowAlerts.slice(0, 4).map((alert) => (
                <div 
                  key={alert.id}
                  className="flex items-center justify-between p-2 rounded-lg hover:bg-yellow-100/50 dark:hover:bg-yellow-900/20 transition-colors"
                >
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <span className="font-medium text-sm truncate">{alert.name}</span>
                    {alert.brand && (
                      <span className="text-xs text-muted-foreground hidden sm:inline">({alert.brand})</span>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-20">
                      <Progress 
                        value={(alert.currentStock / (alert.minStock * 2)) * 100} 
                        className="h-2"
                      />
                    </div>
                    <span className={cn(
                      "text-sm font-medium w-12 text-right",
                      "text-yellow-700 dark:text-yellow-500"
                    )}>
                      {alert.currentStock}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            {onViewAll && (
              <Button 
                variant="ghost" 
                size="sm" 
                className="w-full mt-3 text-yellow-700 hover:text-yellow-800 hover:bg-yellow-100"
                onClick={onViewAll}
              >
                {isPl ? "Zobacz wszystkie" : "View all"}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Top Selling Products */}
      {topSelling.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-medium flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              {isPl ? "Najlepiej sprzedające się produkty" : "Best Selling Products"}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-3">
              {topSelling.map((product, index) => (
                <div 
                  key={product.id}
                  className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className={cn(
                      "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold",
                      index === 0 && "bg-amber-100 text-amber-800",
                      index === 1 && "bg-gray-100 text-gray-800",
                      index === 2 && "bg-orange-100 text-orange-800",
                      index > 2 && "bg-muted text-muted-foreground"
                    )}>
                      {index + 1}
                    </span>
                    <div>
                      <p className="font-medium text-sm">{product.name}</p>
                      {product.brand && (
                        <p className="text-xs text-muted-foreground">{product.brand}</p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-sm">{product.totalSold} {isPl ? "szt." : "pcs"}</p>
                    <p className="text-xs text-muted-foreground">
                      ~{product.avgDailySales}/{isPl ? "dzień" : "day"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            {topSelling.length > 0 && (
              <div className="mt-4 p-3 rounded-lg bg-muted/50">
                <p className="text-xs text-muted-foreground mb-1">
                  {isPl ? "Prognoza na 30 dni" : "30-day forecast"}
                </p>
                <p className="text-sm font-medium">
                  {isPl ? "Szacowana sprzedaż" : "Estimated sales"}: {" "}
                  <span className="text-primary">
                    {topSelling.reduce((sum, p) => sum + p.forecastedSales30Days, 0)} {isPl ? "szt." : "pcs"}
                  </span>
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

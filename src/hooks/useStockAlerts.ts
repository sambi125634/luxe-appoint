import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface StockAlert {
  id: string;
  name: string;
  brand: string | null;
  category: string;
  currentStock: number;
  minStock: number;
  status: "critical" | "low" | "ok";
  daysUntilEmpty?: number;
  suggestedOrderQty?: number;
}

export interface ProductSalesForecast {
  id: string;
  name: string;
  brand: string | null;
  avgDailySales: number;
  totalSold: number;
  trend: "up" | "down" | "stable";
  forecastedSales30Days: number;
}

// Demo salon ID for mock data mode
const DEMO_SALON_ID = "demo-salon-id";

// Mock alerts for demo mode
const mockAlerts: StockAlert[] = [
  { id: "3", name: "Lakier hybrydowy czerwony", brand: "NailArt", category: "Manicure", currentStock: 3, minStock: 10, status: "critical", daysUntilEmpty: 5, suggestedOrderQty: 27 },
  { id: "5", name: "Szampon regenerujący", brand: "HairCare Pro", category: "Pielęgnacja włosów", currentStock: 0, minStock: 5, status: "critical", suggestedOrderQty: 15 },
  { id: "6", name: "Olejek arganowy", brand: "HairCare Pro", category: "Pielęgnacja włosów", currentStock: 2, minStock: 3, status: "low", daysUntilEmpty: 8, suggestedOrderQty: 7 },
];

const mockTopSelling: ProductSalesForecast[] = [
  { id: "1", name: "Krem nawilżający do twarzy", brand: "Lorealle", avgDailySales: 2.3, totalSold: 69, trend: "up", forecastedSales30Days: 69 },
  { id: "2", name: "Serum witaminowe C", brand: "Lorealle", avgDailySales: 1.5, totalSold: 45, trend: "up", forecastedSales30Days: 45 },
  { id: "4", name: "Baza pod lakier hybrydowy", brand: "NailArt", avgDailySales: 1.2, totalSold: 36, trend: "stable", forecastedSales30Days: 36 },
];

export function useStockAlerts(salonId?: string) {
  const isDemo = salonId === DEMO_SALON_ID;

  const alertsQuery = useQuery({
    queryKey: ["stock-alerts", salonId],
    queryFn: async () => {
      // Return mock data for demo mode
      if (isDemo) {
        return { alerts: mockAlerts, forecasts: [], topSelling: mockTopSelling };
      }

      if (!salonId) return { alerts: [], forecasts: [], topSelling: [] };

      // Fetch products with stock info
      const { data: products, error: productsError } = await supabase
        .from("products")
        .select("*")
        .eq("salon_id", salonId)
        .eq("is_active", true)
        .order("current_stock", { ascending: true });

      if (productsError) throw productsError;

      // Fetch stock movements for forecasting (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { data: movements, error: movementsError } = await supabase
        .from("stock_movements")
        .select("*")
        .eq("salon_id", salonId)
        .gte("created_at", thirtyDaysAgo.toISOString());

      if (movementsError) throw movementsError;

      // Calculate stock alerts
      const alerts: StockAlert[] = (products || [])
        .filter(p => !p.is_for_internal_use)
        .map(product => {
          const productMovements = (movements || []).filter(
            m => m.product_id === product.id && m.type === "sale"
          );
          
          const totalSold = productMovements.reduce((sum, m) => sum + Math.abs(m.quantity), 0);
          const avgDailySales = totalSold / 30;
          const daysUntilEmpty = avgDailySales > 0 
            ? Math.floor(product.current_stock / avgDailySales) 
            : undefined;

          let status: "critical" | "low" | "ok" = "ok";
          if (product.current_stock <= 0) {
            status = "critical";
          } else if (product.current_stock <= product.min_stock) {
            status = "critical";
          } else if (product.current_stock <= product.min_stock * 2) {
            status = "low";
          }

          // Suggested order quantity: min_stock * 3 - current_stock (to have 3x min_stock)
          const suggestedOrderQty = Math.max(0, (product.min_stock * 3) - product.current_stock);

          return {
            id: product.id,
            name: product.name,
            brand: product.brand,
            category: product.category,
            currentStock: product.current_stock,
            minStock: product.min_stock,
            status,
            daysUntilEmpty,
            suggestedOrderQty: status !== "ok" ? suggestedOrderQty : undefined,
          };
        })
        .filter(a => a.status !== "ok")
        .sort((a, b) => {
          if (a.status === "critical" && b.status !== "critical") return -1;
          if (a.status !== "critical" && b.status === "critical") return 1;
          return a.currentStock - b.currentStock;
        });

      // Calculate sales forecasts and top selling
      const salesByProduct = new Map<string, number>();
      (movements || [])
        .filter(m => m.type === "sale")
        .forEach(m => {
          const current = salesByProduct.get(m.product_id) || 0;
          salesByProduct.set(m.product_id, current + Math.abs(m.quantity));
        });

      const topSelling: ProductSalesForecast[] = (products || [])
        .filter(p => !p.is_for_internal_use)
        .map(product => {
          const totalSold = salesByProduct.get(product.id) || 0;
          const avgDailySales = totalSold / 30;

          // Simple trend calculation (would need historical data for real trend)
          let trend: "up" | "down" | "stable" = "stable";
          if (avgDailySales > 1) trend = "up";

          return {
            id: product.id,
            name: product.name,
            brand: product.brand,
            avgDailySales: Math.round(avgDailySales * 10) / 10,
            totalSold,
            trend,
            forecastedSales30Days: Math.round(avgDailySales * 30),
          };
        })
        .filter(p => p.totalSold > 0)
        .sort((a, b) => b.totalSold - a.totalSold)
        .slice(0, 5);

      return { alerts, forecasts: [], topSelling };
    },
    enabled: !!salonId,
  });

  return {
    alerts: alertsQuery.data?.alerts ?? [],
    topSelling: alertsQuery.data?.topSelling ?? [],
    isLoading: alertsQuery.isLoading,
    error: alertsQuery.error,
    refetch: alertsQuery.refetch,
  };
}

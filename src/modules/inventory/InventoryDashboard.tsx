import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Package, FlaskConical, BarChart3, Truck, Plus, ScanLine, PenLine } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useProducts } from '@/hooks/useProducts';
import { useSalonId } from '@/hooks/useSalonId';
import InventoryScanner from './InventoryScanner';
import DeliveryMode from './DeliveryMode';
import ServiceRecipes from './ServiceRecipes';
import InventoryStats from './InventoryStats';
import { cn } from '@/lib/utils';

interface InventoryDashboardProps {
  isDemo?: boolean;
}

const InventoryDashboard: React.FC<InventoryDashboardProps> = ({ isDemo }) => {
  const { t } = useTranslation();
  const { salonId } = useSalonId();
  const { products } = useProducts(salonId || '');
  const [scannerOpen, setScannerOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('stock');

  const getStockColor = (current: number, min: number) => {
    if (current <= 0) return 'bg-destructive/10 border-destructive/30 text-destructive';
    if (current <= min) return 'bg-orange-500/10 border-orange-500/30 text-orange-600';
    return 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600';
  };

  const getStockLabel = (current: number, min: number) => {
    if (current <= 0) return 'Brak';
    if (current <= min) return 'Niski stan';
    return 'OK';
  };

  return (
    <div className="space-y-6 pb-24">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-serif font-bold">Magazyn & Receptury</h2>
          <p className="text-muted-foreground text-sm">Zarządzaj stanami, recepturami i kosztami materiałów</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-4 w-full">
          <TabsTrigger value="stock" className="gap-1.5 text-xs sm:text-sm">
            <Package className="w-4 h-4" />
            <span className="hidden sm:inline">Magazyn</span>
          </TabsTrigger>
          <TabsTrigger value="recipes" className="gap-1.5 text-xs sm:text-sm">
            <FlaskConical className="w-4 h-4" />
            <span className="hidden sm:inline">Receptury</span>
          </TabsTrigger>
          <TabsTrigger value="stats" className="gap-1.5 text-xs sm:text-sm">
            <BarChart3 className="w-4 h-4" />
            <span className="hidden sm:inline">Statystyki</span>
          </TabsTrigger>
          <TabsTrigger value="delivery" className="gap-1.5 text-xs sm:text-sm">
            <Truck className="w-4 h-4" />
            <span className="hidden sm:inline">Dostawa</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="stock" className="mt-6">
          {products && products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {products.map((product) => (
                <div
                  key={product.id}
                  className="rounded-xl border bg-card p-4 space-y-3 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start gap-3">
                    {product.image_url ? (
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="w-14 h-14 rounded-lg object-cover bg-muted"
                      />
                    ) : (
                      <div className="w-14 h-14 rounded-lg bg-muted flex items-center justify-center">
                        <Package className="w-6 h-6 text-muted-foreground" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{product.name}</p>
                      <p className="text-xs text-muted-foreground">{product.brand || product.category}</p>
                      {product.ean && (
                        <p className="text-xs text-muted-foreground font-mono">EAN: {product.ean}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-2xl font-bold">{product.current_stock}</p>
                      <p className="text-xs text-muted-foreground">
                        min: {product.min_stock} szt.
                      </p>
                    </div>
                    <span
                      className={cn(
                        'px-2.5 py-1 rounded-full text-xs font-medium border',
                        getStockColor(product.current_stock, product.min_stock)
                      )}
                    >
                      {getStockLabel(product.current_stock, product.min_stock)}
                    </span>
                  </div>

                  {product.purchase_price_net && (
                    <div className="text-xs text-muted-foreground flex justify-between pt-1 border-t">
                      <span>Koszt: {product.purchase_price_net.toFixed(2)} zł</span>
                      <span>Sprzedaż: {product.sale_price_gross.toFixed(2)} zł</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 space-y-4">
              <Package className="w-16 h-16 mx-auto text-muted-foreground/40" />
              <div>
                <p className="font-medium text-lg">Brak produktów w magazynie</p>
                <p className="text-sm text-muted-foreground">Zeskanuj pierwszy produkt lub dodaj go ręcznie</p>
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="recipes" className="mt-6">
          <ServiceRecipes salonId={salonId} isDemo={isDemo} />
        </TabsContent>

        <TabsContent value="stats" className="mt-6">
          <InventoryStats salonId={salonId} products={products || []} isDemo={isDemo} />
        </TabsContent>

        <TabsContent value="delivery" className="mt-6">
          <DeliveryMode salonId={salonId} isDemo={isDemo} />
        </TabsContent>
      </Tabs>

      {/* Sticky FAB */}
      <div className="fixed bottom-6 right-6 z-40">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="lg" className="rounded-full w-14 h-14 shadow-lg">
              <Plus className="w-6 h-6" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onClick={() => setScannerOpen(true)} className="gap-2">
              <ScanLine className="w-4 h-4" />
              Skanuj kod
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setActiveTab('stock')} className="gap-2">
              <PenLine className="w-4 h-4" />
              Dodaj ręcznie
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setActiveTab('delivery')} className="gap-2">
              <Truck className="w-4 h-4" />
              Przyjmij dostawę
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <InventoryScanner
        open={scannerOpen}
        onOpenChange={setScannerOpen}
        salonId={salonId}
      />
    </div>
  );
};

export default InventoryDashboard;

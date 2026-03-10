import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import BarcodeScanner from '@/components/admin/products/BarcodeScanner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Package, Plus, Search, CheckCircle2 } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';

interface InventoryScannerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  salonId: string | null | undefined;
}

interface ScanResult {
  type: 'salon_product' | 'global_product' | 'unknown';
  salonProduct?: {
    id: string;
    name: string;
    brand: string | null;
    current_stock: number;
    ean: string | null;
  };
  globalProduct?: {
    name: string;
    brand: string | null;
    category: string | null;
    capacity: string | null;
    avg_wholesale_price: number | null;
    image_url: string | null;
  };
  scannedCode: string;
}

const InventoryScanner: React.FC<InventoryScannerProps> = ({
  open,
  onOpenChange,
  salonId,
}) => {
  const [showBarcodeScanner, setShowBarcodeScanner] = useState(false);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const queryClient = useQueryClient();

  const handleScan = async (code: string) => {
    if (!salonId) return;
    setIsProcessing(true);

    try {
      // 1. Check salon's own products
      const { data: salonProduct } = await supabase
        .from('products')
        .select('id, name, brand, current_stock, ean')
        .eq('salon_id', salonId)
        .eq('ean', code)
        .maybeSingle();

      if (salonProduct) {
        setScanResult({ type: 'salon_product', salonProduct, scannedCode: code });
        setIsProcessing(false);
        return;
      }

      // 2. Check global beauty products DB
      const { data: globalProduct } = await supabase
        .from('beauty_products_db')
        .select('name, brand, category, capacity, avg_wholesale_price, image_url')
        .eq('ean', code)
        .maybeSingle();

      if (globalProduct) {
        setScanResult({ type: 'global_product', globalProduct, scannedCode: code });
        setIsProcessing(false);
        return;
      }

      // 3. Unknown product
      setScanResult({ type: 'unknown', scannedCode: code });
    } catch (err) {
      toast.error('Błąd podczas wyszukiwania produktu');
    }
    setIsProcessing(false);
  };

  const handleUpdateStock = async () => {
    if (!salonId || !scanResult?.salonProduct) return;
    setIsProcessing(true);

    try {
      const newStock = scanResult.salonProduct.current_stock + quantity;
      await supabase
        .from('products')
        .update({ current_stock: newStock })
        .eq('id', scanResult.salonProduct.id);

      await supabase.from('stock_movements').insert({
        salon_id: salonId,
        product_id: scanResult.salonProduct.id,
        type: 'delivery',
        quantity,
        note: 'Skan — przyjęcie na magazyn',
      });

      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success(`Zaktualizowano stan: ${scanResult.salonProduct.name} → ${newStock} szt.`);
      resetAndClose();
    } catch {
      toast.error('Nie udało się zaktualizować stanu');
    }
    setIsProcessing(false);
  };

  const handleAddFromGlobal = async () => {
    if (!salonId || !scanResult?.globalProduct) return;
    setIsProcessing(true);

    try {
      const gp = scanResult.globalProduct;
      const { error } = await supabase.from('products').insert({
        salon_id: salonId,
        name: gp.name,
        brand: gp.brand,
        category: gp.category || 'Kosmetyki',
        ean: scanResult.scannedCode,
        purchase_price_net: gp.avg_wholesale_price,
        sale_price_gross: gp.avg_wholesale_price ? gp.avg_wholesale_price * 1.5 : 0,
        current_stock: quantity,
        image_url: gp.image_url,
      });

      if (error) throw error;
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success(`Dodano produkt: ${gp.name}`);
      resetAndClose();
    } catch {
      toast.error('Nie udało się dodać produktu');
    }
    setIsProcessing(false);
  };

  const resetAndClose = () => {
    setScanResult(null);
    setQuantity(1);
    onOpenChange(false);
  };

  // When main dialog opens, auto-open barcode scanner
  React.useEffect(() => {
    if (open && !scanResult) {
      setShowBarcodeScanner(true);
    }
  }, [open, scanResult]);

  return (
    <>
      <BarcodeScanner
        open={showBarcodeScanner}
        onOpenChange={(v) => {
          setShowBarcodeScanner(v);
          if (!v && !scanResult) onOpenChange(false);
        }}
        onScan={(code) => {
          setShowBarcodeScanner(false);
          handleScan(code);
        }}
      />

      {/* Result dialog */}
      <Dialog open={!!scanResult} onOpenChange={(v) => { if (!v) resetAndClose(); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Search className="w-5 h-5" />
              Wynik skanowania
            </DialogTitle>
          </DialogHeader>

          {scanResult?.type === 'salon_product' && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <div>
                  <p className="font-medium">{scanResult.salonProduct!.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {scanResult.salonProduct!.brand} • Stan: {scanResult.salonProduct!.current_stock} szt.
                  </p>
                </div>
              </div>

              <div>
                <Label>Ilość do dodania</Label>
                <Input
                  type="number"
                  min={1}
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                />
              </div>

              <Button onClick={handleUpdateStock} disabled={isProcessing} className="w-full">
                <Plus className="w-4 h-4 mr-2" />
                Dodaj {quantity} szt. do stanu
              </Button>
            </div>
          )}

          {scanResult?.type === 'global_product' && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-primary/10 border border-primary/20">
                <Package className="w-5 h-5 text-primary" />
                <div>
                  <p className="font-medium">{scanResult.globalProduct!.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {scanResult.globalProduct!.brand}
                    {scanResult.globalProduct!.capacity && ` • ${scanResult.globalProduct!.capacity}`}
                  </p>
                  {scanResult.globalProduct!.avg_wholesale_price && (
                    <p className="text-xs text-muted-foreground">
                      Orientacyjna cena hurtowa: {scanResult.globalProduct!.avg_wholesale_price.toFixed(2)} zł
                    </p>
                  )}
                </div>
              </div>

              <p className="text-sm text-muted-foreground">
                Produkt znaleziony w globalnej bazie kosmetycznej. Chcesz dodać go do swojego magazynu?
              </p>

              <div>
                <Label>Ilość początkowa</Label>
                <Input
                  type="number"
                  min={1}
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                />
              </div>

              <Button onClick={handleAddFromGlobal} disabled={isProcessing} className="w-full">
                <Plus className="w-4 h-4 mr-2" />
                Dodaj do mojego magazynu
              </Button>
            </div>
          )}

          {scanResult?.type === 'unknown' && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted border">
                <Package className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">Nieznany produkt</p>
                  <p className="text-sm text-muted-foreground font-mono">
                    Kod: {scanResult.scannedCode}
                  </p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                Produkt nie został znaleziony ani w Twoim magazynie, ani w globalnej bazie.
                Dodaj go ręcznie w zakładce Produkty.
              </p>
              <Button variant="outline" onClick={resetAndClose} className="w-full">
                Zamknij
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default InventoryScanner;

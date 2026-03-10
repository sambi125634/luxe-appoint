import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import BarcodeScanner from '@/components/admin/products/BarcodeScanner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { ScanLine, Truck, FileText, Package, Trash2 } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';

interface DeliveryItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
}

interface DeliveryModeProps {
  salonId: string | null | undefined;
  isDemo?: boolean;
}

const DeliveryMode: React.FC<DeliveryModeProps> = ({ salonId, isDemo }) => {
  const [scannerOpen, setScannerOpen] = useState(false);
  const [items, setItems] = useState<DeliveryItem[]>([]);
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const queryClient = useQueryClient();

  const handleScan = async (code: string) => {
    if (!salonId) return;

    const { data: product } = await supabase
      .from('products')
      .select('id, name, purchase_price_net')
      .eq('salon_id', salonId)
      .eq('ean', code)
      .maybeSingle();

    if (product) {
      const existing = items.find((i) => i.productId === product.id);
      if (existing) {
        setItems(items.map((i) =>
          i.productId === product.id ? { ...i, quantity: i.quantity + 1 } : i
        ));
      } else {
        setItems([...items, {
          productId: product.id,
          productName: product.name,
          quantity: 1,
          unitPrice: product.purchase_price_net || 0,
        }]);
      }
      toast.success(`+1 ${product.name}`);
    } else {
      toast.error(`Produkt z kodem ${code} nie znaleziony w magazynie. Dodaj go najpierw.`);
    }
  };

  const removeItem = (productId: string) => {
    setItems(items.filter((i) => i.productId !== productId));
  };

  const totalValue = items.reduce((sum, i) => sum + i.quantity * i.unitPrice, 0);

  const handleSaveDelivery = async () => {
    if (!salonId || items.length === 0) return;
    setIsSaving(true);

    try {
      for (const item of items) {
        // Update stock
        const { data: product } = await supabase
          .from('products')
          .select('current_stock')
          .eq('id', item.productId)
          .single();

        if (product) {
          await supabase
            .from('products')
            .update({ current_stock: product.current_stock + item.quantity })
            .eq('id', item.productId);
        }

        // Record movement
        await supabase.from('stock_movements').insert({
          salon_id: salonId,
          product_id: item.productId,
          type: 'delivery',
          quantity: item.quantity,
          unit_price: item.unitPrice,
          total_value: item.quantity * item.unitPrice,
          invoice_number: invoiceNumber || null,
          note: 'Przyjęcie dostawy',
        });
      }

      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success(`Przyjęto dostawę: ${items.length} pozycji, ${totalValue.toFixed(2)} zł`);
      setItems([]);
      setInvoiceNumber('');
    } catch {
      toast.error('Błąd podczas zapisywania dostawy');
    }
    setIsSaving(false);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Truck className="w-5 h-5" />
            Przyjęcie dostawy
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Numer faktury (opcjonalnie)</Label>
            <div className="flex gap-2 mt-1">
              <Input
                value={invoiceNumber}
                onChange={(e) => setInvoiceNumber(e.target.value)}
                placeholder="FV/2026/03/001"
                className="flex-1"
              />
              <Button variant="outline" size="icon">
                <FileText className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <Button onClick={() => setScannerOpen(true)} className="w-full gap-2" size="lg">
            <ScanLine className="w-5 h-5" />
            Skanuj następny produkt
          </Button>
        </CardContent>
      </Card>

      {items.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              Zeskanowane produkty ({items.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {items.map((item) => (
              <div
                key={item.productId}
                className="flex items-center justify-between p-3 rounded-lg border bg-card"
              >
                <div className="flex items-center gap-3">
                  <Package className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="font-medium text-sm">{item.productName}</p>
                    <p className="text-xs text-muted-foreground">
                      {item.quantity} szt. × {item.unitPrice.toFixed(2)} zł
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    min={1}
                    value={item.quantity}
                    onChange={(e) => {
                      const q = parseInt(e.target.value) || 1;
                      setItems(items.map((i) =>
                        i.productId === item.productId ? { ...i, quantity: q } : i
                      ));
                    }}
                    className="w-16 h-8 text-center"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive"
                    onClick={() => removeItem(item.productId)}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            ))}

            <div className="flex items-center justify-between pt-3 border-t font-medium">
              <span>Łącznie</span>
              <span>{totalValue.toFixed(2)} zł</span>
            </div>

            <Button
              onClick={handleSaveDelivery}
              disabled={isSaving}
              className="w-full"
              size="lg"
            >
              Zatwierdź dostawę
            </Button>
          </CardContent>
        </Card>
      )}

      <BarcodeScanner
        open={scannerOpen}
        onOpenChange={setScannerOpen}
        onScan={(code) => {
          setScannerOpen(false);
          handleScan(code);
        }}
      />
    </div>
  );
};

export default DeliveryMode;

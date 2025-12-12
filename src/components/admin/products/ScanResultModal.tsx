import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  Package, 
  ShoppingCart, 
  Scissors, 
  TrendingUp, 
  Edit3,
  AlertCircle,
  CheckCircle2,
  ScanLine
} from 'lucide-react';
import { Product } from './types';
import { toast } from 'sonner';

interface ScanResultModalProps {
  product: Product | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdateStock: (productId: string, quantity: number, type: string, note?: string) => Promise<void>;
  onScanAgain: () => void;
}

type OperationType = 'sale' | 'internal_use' | 'delivery' | 'correction';

const ScanResultModal: React.FC<ScanResultModalProps> = ({
  product,
  open,
  onOpenChange,
  onUpdateStock,
  onScanAgain,
}) => {
  const { t } = useTranslation();
  const [operationType, setOperationType] = useState<OperationType>('sale');
  const [quantity, setQuantity] = useState(1);
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleQuickSale = async (qty: number) => {
    if (!product) return;
    setIsSubmitting(true);
    try {
      await onUpdateStock(product.id, -qty, 'sale');
      toast.success(t('products.stockUpdated', 'Stan magazynowy zaktualizowany'));
      resetAndClose();
    } catch (error) {
      toast.error(t('products.stockUpdateError', 'Błąd aktualizacji stanu'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async () => {
    if (!product) return;
    setIsSubmitting(true);
    
    try {
      let finalQuantity = quantity;
      
      // For sale and internal_use, quantity should be negative
      if (operationType === 'sale' || operationType === 'internal_use') {
        finalQuantity = -Math.abs(quantity);
      } else if (operationType === 'delivery') {
        finalQuantity = Math.abs(quantity);
      }
      // For correction, keep the sign as entered
      
      await onUpdateStock(product.id, finalQuantity, operationType, note || undefined);
      toast.success(t('products.stockUpdated', 'Stan magazynowy zaktualizowany'));
      resetAndClose();
    } catch (error) {
      toast.error(t('products.stockUpdateError', 'Błąd aktualizacji stanu'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetAndClose = () => {
    setOperationType('sale');
    setQuantity(1);
    setNote('');
    onOpenChange(false);
  };

  const handleScanAgain = () => {
    resetAndClose();
    onScanAgain();
  };

  if (!product) return null;

  const getStockStatus = () => {
    if (product.current_stock <= 0) {
      return { label: t('products.outOfStock', 'Brak'), color: 'destructive' as const, icon: AlertCircle };
    }
    if (product.current_stock <= product.min_stock) {
      return { label: t('products.lowStock', 'Niski stan'), color: 'secondary' as const, icon: AlertCircle };
    }
    return { label: t('products.inStock', 'W magazynie'), color: 'default' as const, icon: CheckCircle2 };
  };

  const stockStatus = getStockStatus();
  const newStock = operationType === 'sale' || operationType === 'internal_use' 
    ? product.current_stock - Math.abs(quantity)
    : operationType === 'delivery' 
      ? product.current_stock + Math.abs(quantity)
      : product.current_stock + quantity;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5 text-primary" />
            {t('products.productFound', 'Produkt znaleziony')}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Product Info */}
          <div className="flex items-start gap-4 p-4 bg-muted/50 rounded-lg">
          {product.image_url ? (
              <img 
                src={product.image_url} 
                alt={product.name}
                className="w-16 h-16 object-cover rounded-md"
              />
            ) : (
              <div className="w-16 h-16 bg-muted rounded-md flex items-center justify-center">
                <Package className="h-8 w-8 text-muted-foreground" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-foreground truncate">{product.name}</h3>
              {product.brand && (
                <p className="text-sm text-muted-foreground">{product.brand}</p>
              )}
              <div className="flex items-center gap-2 mt-2">
                <Badge variant={stockStatus.color}>
                  <stockStatus.icon className="h-3 w-3 mr-1" />
                  {stockStatus.label}
                </Badge>
                <span className="text-sm font-medium">
                  {product.current_stock} {t('products.units', 'szt.')}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Sale Buttons */}
          <div className="space-y-2">
            <Label>{t('products.quickSale', 'Szybka sprzedaż')}</Label>
            <div className="flex gap-2">
              {[1, 2, 3].map((qty) => (
                <Button
                  key={qty}
                  variant="outline"
                  className="flex-1"
                  onClick={() => handleQuickSale(qty)}
                  disabled={isSubmitting || product.current_stock < qty}
                >
                  <ShoppingCart className="h-4 w-4 mr-1" />
                  -{qty}
                </Button>
              ))}
            </div>
          </div>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                {t('products.orCustomOperation', 'lub inna operacja')}
              </span>
            </div>
          </div>

          {/* Custom Operation */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>{t('products.operationType', 'Typ operacji')}</Label>
              <Select value={operationType} onValueChange={(v) => setOperationType(v as OperationType)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sale">
                    <div className="flex items-center gap-2">
                      <ShoppingCart className="h-4 w-4" />
                      {t('products.sale', 'Sprzedaż')}
                    </div>
                  </SelectItem>
                  <SelectItem value="internal_use">
                    <div className="flex items-center gap-2">
                      <Scissors className="h-4 w-4" />
                      {t('products.internalUse', 'Użycie wewnętrzne')}
                    </div>
                  </SelectItem>
                  <SelectItem value="delivery">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4" />
                      {t('products.delivery', 'Dostawa')}
                    </div>
                  </SelectItem>
                  <SelectItem value="correction">
                    <div className="flex items-center gap-2">
                      <Edit3 className="h-4 w-4" />
                      {t('products.correction', 'Korekta')}
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>{t('products.quantity', 'Ilość')}</Label>
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1 && operationType !== 'correction'}
                >
                  -
                </Button>
                <Input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
                  className="w-20 text-center"
                  min={operationType === 'correction' ? undefined : 1}
                />
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={() => setQuantity(quantity + 1)}
                >
                  +
                </Button>
                <span className="text-sm text-muted-foreground ml-2">
                  → {t('products.newStock', 'Nowy stan')}: <strong>{newStock}</strong> {t('products.units', 'szt.')}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <Label>{t('products.note', 'Notatka')} ({t('common.optional', 'opcjonalnie')})</Label>
              <Textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder={t('products.notePlaceholder', 'np. Sprzedaż do klientki...')}
                rows={2}
              />
            </div>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={handleScanAgain} className="w-full sm:w-auto">
            <ScanLine className="h-4 w-4 mr-2" />
            {t('products.scanAgain', 'Skanuj następny')}
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={isSubmitting || (newStock < 0 && operationType !== 'correction')}
            className="w-full sm:w-auto"
          >
            {t('products.confirm', 'Zatwierdź')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ScanResultModal;

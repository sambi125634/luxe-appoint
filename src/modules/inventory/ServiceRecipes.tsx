import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { FlaskConical, Plus, Trash2, TrendingUp } from 'lucide-react';
import { useServices } from '@/hooks/useServices';
import { useProducts } from '@/hooks/useProducts';
import { useServiceRecipes } from '@/hooks/useServiceRecipes';
import { toast } from 'sonner';

interface ServiceRecipesProps {
  salonId: string | null | undefined;
  isDemo?: boolean;
}

const ServiceRecipes: React.FC<ServiceRecipesProps> = ({ salonId, isDemo }) => {
  const { services } = useServices(salonId || '');
  const { products } = useProducts(salonId || '');
  const { recipes, addRecipe, removeRecipe, getMaterialCost } = useServiceRecipes(salonId || '');
  const [selectedService, setSelectedService] = useState<string>('');
  const [selectedProduct, setSelectedProduct] = useState<string>('');
  const [qty, setQty] = useState(1);
  const [unit, setUnit] = useState('szt');

  const handleAdd = async () => {
    if (!salonId || !selectedService || !selectedProduct) return;
    try {
      await addRecipe({
        salon_id: salonId,
        service_id: selectedService,
        product_id: selectedProduct,
        quantity_used: qty,
        unit,
      });
      setSelectedProduct('');
      setQty(1);
      toast.success('Dodano składnik do receptury');
    } catch {
      toast.error('Nie udało się dodać składnika');
    }
  };

  const activeServices = services?.filter((s) => s.is_active) || [];

  const serviceRecipes = selectedService
    ? recipes?.filter((r) => r.service_id === selectedService) || []
    : [];

  const selectedServiceData = activeServices.find((s) => s.id === selectedService);
  const materialCost = selectedService ? getMaterialCost(selectedService) : 0;
  const servicePrice = selectedServiceData?.price || 0;
  const profitMargin = servicePrice > 0 ? ((servicePrice - materialCost) / servicePrice) * 100 : 0;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FlaskConical className="w-5 h-5" />
            Receptury usług
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Wybierz usługę</Label>
            <Select value={selectedService} onValueChange={setSelectedService}>
              <SelectTrigger>
                <SelectValue placeholder="Wybierz usługę..." />
              </SelectTrigger>
              <SelectContent>
                {activeServices.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.name} — {s.price} zł
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedService && (
            <>
              {/* Existing recipe items */}
              {serviceRecipes.length > 0 && (
                <div className="space-y-2">
                  {serviceRecipes.map((recipe) => {
                    const product = products?.find((p) => p.id === recipe.product_id);
                    return (
                      <div
                        key={recipe.id}
                        className="flex items-center justify-between p-3 rounded-lg border"
                      >
                        <div>
                          <p className="font-medium text-sm">{product?.name || 'Produkt'}</p>
                          <p className="text-xs text-muted-foreground">
                            {recipe.quantity_used} {recipe.unit} × {(product?.purchase_price_net || 0).toFixed(2)} zł
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">
                            {(recipe.quantity_used * (product?.purchase_price_net || 0)).toFixed(2)} zł
                          </span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-destructive"
                            onClick={() => removeRecipe(recipe.id)}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Add new ingredient */}
              <div className="flex gap-2 items-end flex-wrap">
                <div className="flex-1 min-w-[140px]">
                  <Label className="text-xs">Produkt</Label>
                  <Select value={selectedProduct} onValueChange={setSelectedProduct}>
                    <SelectTrigger className="h-9">
                      <SelectValue placeholder="Wybierz..." />
                    </SelectTrigger>
                    <SelectContent>
                      {products?.map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="w-20">
                  <Label className="text-xs">Ilość</Label>
                  <Input
                    type="number"
                    min={0.1}
                    step={0.1}
                    value={qty}
                    onChange={(e) => setQty(parseFloat(e.target.value) || 1)}
                    className="h-9"
                  />
                </div>
                <div className="w-20">
                  <Label className="text-xs">Jedn.</Label>
                  <Select value={unit} onValueChange={setUnit}>
                    <SelectTrigger className="h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="szt">szt</SelectItem>
                      <SelectItem value="ml">ml</SelectItem>
                      <SelectItem value="g">g</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button size="sm" onClick={handleAdd} disabled={!selectedProduct} className="h-9">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>

              {/* True Profit */}
              {servicePrice > 0 && (
                <Card className="bg-muted/50">
                  <CardContent className="pt-4 space-y-3">
                    <div className="flex items-center gap-2 text-sm font-medium">
                      <TrendingUp className="w-4 h-4 text-primary" />
                      True Profit
                    </div>
                    <div className="grid grid-cols-3 gap-3 text-center text-sm">
                      <div>
                        <p className="text-muted-foreground text-xs">Cena usługi</p>
                        <p className="font-bold">{servicePrice.toFixed(0)} zł</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground text-xs">Koszt materiałów</p>
                        <p className="font-bold text-destructive">{materialCost.toFixed(2)} zł</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground text-xs">Zysk</p>
                        <p className="font-bold text-emerald-600">
                          {(servicePrice - materialCost).toFixed(2)} zł
                        </p>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span>Marża</span>
                        <span className="font-medium">{profitMargin.toFixed(1)}%</span>
                      </div>
                      <Progress
                        value={Math.min(profitMargin, 100)}
                        className="h-2"
                      />
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ServiceRecipes;

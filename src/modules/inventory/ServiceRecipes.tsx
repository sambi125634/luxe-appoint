import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { FlaskConical, Plus, Trash2, TrendingUp, Beaker, PackageOpen } from 'lucide-react';
import { useServices } from '@/hooks/useServices';
import { useProducts } from '@/hooks/useProducts';
import { useServiceRecipes } from '@/hooks/useServiceRecipes';
import { toast } from 'sonner';

// ---------- Demo data ----------

const DEMO_SERVICES = [
  { id: 'demo-s1', name: 'Manicure hybrydowy', price: 120, is_active: true },
  { id: 'demo-s2', name: 'Peeling kawitacyjny', price: 150, is_active: true },
  { id: 'demo-s3', name: 'Mezoterapia igłowa', price: 350, is_active: true },
  { id: 'demo-s4', name: 'Henna brwi i rzęs', price: 80, is_active: true },
  { id: 'demo-s5', name: 'Masaż relaksacyjny 60 min', price: 200, is_active: true },
];

const DEMO_PRODUCTS = [
  { id: 'demo-p1', name: 'Baza hybrydowa 8ml', purchase_price_net: 12 },
  { id: 'demo-p2', name: 'Lakier hybrydowy 7ml', purchase_price_net: 15 },
  { id: 'demo-p3', name: 'Top coat 8ml', purchase_price_net: 14 },
  { id: 'demo-p4', name: 'Waciki bezpyłowe (op. 500)', purchase_price_net: 0.05 },
  { id: 'demo-p5', name: 'Cleaner 500ml', purchase_price_net: 0.03 },
  { id: 'demo-p6', name: 'Kwas migdałowy 30ml', purchase_price_net: 28 },
  { id: 'demo-p7', name: 'Serum z wit. C 30ml', purchase_price_net: 35 },
  { id: 'demo-p8', name: 'Henna proszkowa 15g', purchase_price_net: 18 },
  { id: 'demo-p9', name: 'Utleniacz 3% 50ml', purchase_price_net: 8 },
  { id: 'demo-p10', name: 'Olejek do masażu 250ml', purchase_price_net: 0.12 },
];

interface DemoRecipe {
  id: string;
  service_id: string;
  product_id: string;
  quantity_used: number;
  unit: string;
}

const INITIAL_DEMO_RECIPES: DemoRecipe[] = [
  { id: 'dr1', service_id: 'demo-s1', product_id: 'demo-p1', quantity_used: 1, unit: 'szt' },
  { id: 'dr1b', service_id: 'demo-s1', product_id: 'demo-p2', quantity_used: 1, unit: 'szt' },
  { id: 'dr2', service_id: 'demo-s1', product_id: 'demo-p3', quantity_used: 1, unit: 'szt' },
  { id: 'dr3', service_id: 'demo-s1', product_id: 'demo-p4', quantity_used: 10, unit: 'szt' },
  { id: 'dr4', service_id: 'demo-s1', product_id: 'demo-p5', quantity_used: 15, unit: 'ml' },
  { id: 'dr5', service_id: 'demo-s2', product_id: 'demo-p6', quantity_used: 5, unit: 'ml' },
  { id: 'dr6', service_id: 'demo-s4', product_id: 'demo-p8', quantity_used: 2, unit: 'g' },
  { id: 'dr7', service_id: 'demo-s4', product_id: 'demo-p9', quantity_used: 5, unit: 'ml' },
  { id: 'dr8', service_id: 'demo-s5', product_id: 'demo-p10', quantity_used: 30, unit: 'ml' },
];

// ---------- Component ----------

interface ServiceRecipesProps {
  salonId: string | null | undefined;
  isDemo?: boolean;
}

const ServiceRecipes: React.FC<ServiceRecipesProps> = ({ salonId, isDemo }) => {
  // DB hooks (only active in non-demo)
  const servicesQuery = useServices();
  const dbServices = servicesQuery.data;
  const { products: dbProducts } = useProducts(salonId || '');
  const { recipes: dbRecipes, addRecipe, removeRecipe, getMaterialCost } = useServiceRecipes(salonId || '');

  // Demo local state
  const [demoRecipes, setDemoRecipes] = useState<DemoRecipe[]>(INITIAL_DEMO_RECIPES);
  let demoIdCounter = React.useRef(100);

  // Resolve data source
  const services = isDemo ? DEMO_SERVICES : (dbServices?.filter((s) => s.is_active) || []);
  const products = isDemo ? DEMO_PRODUCTS : (dbProducts || []);
  const recipes = isDemo ? demoRecipes : (dbRecipes || []);

  // UI state
  const [selectedService, setSelectedService] = useState<string>('');
  const [selectedProduct, setSelectedProduct] = useState<string>('');
  const [qty, setQty] = useState(1);
  const [unit, setUnit] = useState('szt');

  // Computed
  const serviceRecipes = selectedService ? recipes.filter((r) => r.service_id === selectedService) : [];
  const selectedServiceData = services.find((s) => s.id === selectedService);

  const recipeCountMap = useMemo(() => {
    const map: Record<string, number> = {};
    recipes.forEach((r) => {
      map[r.service_id] = (map[r.service_id] || 0) + 1;
    });
    return map;
  }, [recipes]);

  const calcMaterialCost = (serviceId: string): number => {
    if (isDemo) {
      return demoRecipes
        .filter((r) => r.service_id === serviceId)
        .reduce((sum, r) => {
          const p = DEMO_PRODUCTS.find((pr) => pr.id === r.product_id);
          return sum + r.quantity_used * (p?.purchase_price_net || 0);
        }, 0);
    }
    return getMaterialCost(serviceId);
  };

  const materialCost = selectedService ? calcMaterialCost(selectedService) : 0;
  const servicePrice = selectedServiceData?.price || 0;
  const profitMargin = servicePrice > 0 ? ((servicePrice - materialCost) / servicePrice) * 100 : 0;

  // Handlers
  const handleAdd = async () => {
    if (!selectedService || !selectedProduct) return;
    if (isDemo) {
      demoIdCounter.current += 1;
      setDemoRecipes((prev) => [
        ...prev,
        {
          id: `demo-r-${demoIdCounter.current}`,
          service_id: selectedService,
          product_id: selectedProduct,
          quantity_used: qty,
          unit,
        },
      ]);
      setSelectedProduct('');
      setQty(1);
      toast.success('Dodano składnik do receptury');
      return;
    }
    if (!salonId) return;
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

  const handleRemove = (id: string) => {
    if (isDemo) {
      setDemoRecipes((prev) => prev.filter((r) => r.id !== id));
      toast.success('Usunięto składnik');
      return;
    }
    removeRecipe(id);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Service list */}
        <Card className="lg:col-span-1">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Beaker className="w-4 h-4" />
              Usługi
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-border max-h-[500px] overflow-y-auto">
              {services.map((s) => {
                const count = recipeCountMap[s.id] || 0;
                const isSelected = selectedService === s.id;
                return (
                  <button
                    key={s.id}
                    onClick={() => setSelectedService(s.id)}
                    className={`w-full text-left px-4 py-3 flex items-center justify-between transition-colors hover:bg-muted/50 ${
                      isSelected ? 'bg-primary/5 border-l-2 border-l-primary' : ''
                    }`}
                  >
                    <div className="min-w-0">
                      <p className={`text-sm font-medium truncate ${isSelected ? 'text-primary' : 'text-foreground'}`}>
                        {s.name}
                      </p>
                      <p className="text-xs text-muted-foreground">{s.price} zł</p>
                    </div>
                    {count > 0 ? (
                      <Badge variant="secondary" className="ml-2 shrink-0 text-xs">
                        {count} skł.
                      </Badge>
                    ) : (
                      <span className="text-xs text-muted-foreground ml-2 shrink-0">brak</span>
                    )}
                  </button>
                );
              })}
              {services.length === 0 && (
                <div className="p-6 text-center text-sm text-muted-foreground">
                  Brak aktywnych usług. Dodaj usługi w zakładce Usługi.
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Right: Recipe detail */}
        <div className="lg:col-span-2 space-y-4">
          {!selectedService ? (
            <Card>
              <CardContent className="py-16 flex flex-col items-center text-center">
                <FlaskConical className="w-12 h-12 text-muted-foreground/30 mb-4" />
                <p className="text-muted-foreground font-medium">Wybierz usługę z listy</p>
                <p className="text-sm text-muted-foreground/70 mt-1">
                  aby zobaczyć lub edytować recepturę materiałów
                </p>
              </CardContent>
            </Card>
          ) : (
            <>
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <FlaskConical className="w-4 h-4" />
                    Receptura: {selectedServiceData?.name}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Existing recipe items */}
                  {serviceRecipes.length > 0 ? (
                    <div className="space-y-2">
                      {serviceRecipes.map((recipe) => {
                        const product = products.find((p) => p.id === recipe.product_id);
                        const cost = recipe.quantity_used * (product?.purchase_price_net || 0);
                        return (
                          <div
                            key={recipe.id}
                            className="flex items-center justify-between p-3 rounded-lg border bg-card"
                          >
                            <div className="min-w-0">
                              <p className="font-medium text-sm truncate">{product?.name || 'Produkt'}</p>
                              <p className="text-xs text-muted-foreground">
                                {recipe.quantity_used} {recipe.unit} × {(product?.purchase_price_net || 0).toFixed(2)} zł
                              </p>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              <span className="text-sm font-medium">{cost.toFixed(2)} zł</span>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-destructive hover:text-destructive"
                                onClick={() => handleRemove(recipe.id)}
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </Button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="py-8 text-center border border-dashed rounded-lg bg-muted/20">
                      <PackageOpen className="w-8 h-8 text-muted-foreground/40 mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">Brak składników w recepturze</p>
                      <p className="text-xs text-muted-foreground/70 mt-1">
                        Dodaj produkty zużywane podczas tego zabiegu
                      </p>
                    </div>
                  )}

                  {/* Add new ingredient */}
                  <div className="pt-2 border-t">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                      Dodaj składnik
                    </p>
                    <div className="flex gap-2 items-end flex-wrap">
                      <div className="flex-1 min-w-[140px]">
                        <Label className="text-xs">Produkt</Label>
                        <Select value={selectedProduct} onValueChange={setSelectedProduct}>
                          <SelectTrigger className="h-9">
                            <SelectValue placeholder="Wybierz..." />
                          </SelectTrigger>
                          <SelectContent>
                            {products.map((p) => (
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
                        <Plus className="w-4 h-4 mr-1" />
                        Dodaj
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* True Profit card */}
              {servicePrice > 0 && (
                <Card className="border-primary/20 bg-gradient-to-br from-card to-primary/5">
                  <CardContent className="pt-5 space-y-3">
                    <div className="flex items-center gap-2 text-sm font-semibold">
                      <TrendingUp className="w-4 h-4 text-primary" />
                      True Profit — realny zysk z zabiegu
                    </div>
                    <div className="grid grid-cols-3 gap-3 text-center text-sm">
                      <div>
                        <p className="text-muted-foreground text-xs">Cena usługi</p>
                        <p className="font-bold text-lg">{servicePrice.toFixed(0)} zł</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground text-xs">Koszt materiałów</p>
                        <p className="font-bold text-lg text-destructive">-{materialCost.toFixed(2)} zł</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground text-xs">Zysk</p>
                        <p className="font-bold text-lg text-emerald-600">
                          {(servicePrice - materialCost).toFixed(2)} zł
                        </p>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span>Marża materiałowa</span>
                        <span className={`font-semibold ${profitMargin >= 70 ? 'text-emerald-600' : profitMargin >= 50 ? 'text-amber-500' : 'text-destructive'}`}>
                          {profitMargin.toFixed(1)}%
                        </span>
                      </div>
                      <Progress value={Math.min(profitMargin, 100)} className="h-2" />
                      <p className="text-[11px] text-muted-foreground">
                        {profitMargin >= 70
                          ? '✓ Świetna marża — Twój zabieg jest bardzo rentowny'
                          : profitMargin >= 50
                          ? '⚠ Dobra marża, ale sprawdź czy możesz zoptymalizować koszty'
                          : '⚠ Niska marża — rozważ zmianę ceny lub tańsze zamienniki produktów'}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ServiceRecipes;

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { FlaskConical, Plus, Trash2, TrendingUp, Beaker, PackageOpen, Copy, AlertTriangle } from 'lucide-react';
import { useServices } from '@/hooks/useServices';
import { useProducts } from '@/hooks/useProducts';
import { useServiceRecipes, type RecipeItem } from '@/hooks/useServiceRecipes';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

// ---------- Demo data ----------

const DEMO_SERVICES = [
  { id: 'demo-s1', name: 'Manicure hybrydowy', price: 120, is_active: true },
  { id: 'demo-s2', name: 'Peeling enzymatyczny', price: 150, is_active: true },
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
  { id: 'demo-p6', name: 'Baza peelingująca 100ml', purchase_price_net: 0.15 },
  { id: 'demo-p7', name: 'Enzym papainowy 30ml', purchase_price_net: 0.80 },
  { id: 'demo-p8', name: 'Serum z wit. C 30ml', purchase_price_net: 1.17 },
  { id: 'demo-p9', name: 'Olejek różany 15ml', purchase_price_net: 0.40 },
  { id: 'demo-p10', name: 'Maska kojąca 50ml', purchase_price_net: 0.20 },
  { id: 'demo-p11', name: 'Henna proszkowa 15g', purchase_price_net: 18 },
  { id: 'demo-p12', name: 'Utleniacz 3% 50ml', purchase_price_net: 8 },
  { id: 'demo-p13', name: 'Olejek do masażu 250ml', purchase_price_net: 0.12 },
];

interface DemoRecipe {
  id: string;
  service_id: string;
  product_id: string;
  quantity_used: number;
  unit: string;
  quantity_value: number;
  quantity_unit: string;
  is_optional: boolean;
  notes: string | null;
  mix_ratio: number | null;
  salon_id: string;
  created_at: string;
}

const INITIAL_DEMO_RECIPES: DemoRecipe[] = [
  { id: 'dr1', service_id: 'demo-s1', product_id: 'demo-p1', quantity_used: 1, unit: 'szt', quantity_value: 1, quantity_unit: 'szt', is_optional: false, notes: null, mix_ratio: null, salon_id: 'demo', created_at: '' },
  { id: 'dr1b', service_id: 'demo-s1', product_id: 'demo-p2', quantity_used: 1, unit: 'szt', quantity_value: 1, quantity_unit: 'szt', is_optional: false, notes: null, mix_ratio: null, salon_id: 'demo', created_at: '' },
  { id: 'dr2', service_id: 'demo-s1', product_id: 'demo-p3', quantity_used: 1, unit: 'szt', quantity_value: 1, quantity_unit: 'szt', is_optional: false, notes: null, mix_ratio: null, salon_id: 'demo', created_at: '' },
  { id: 'dr3', service_id: 'demo-s1', product_id: 'demo-p4', quantity_used: 10, unit: 'szt', quantity_value: 10, quantity_unit: 'szt', is_optional: false, notes: null, mix_ratio: null, salon_id: 'demo', created_at: '' },
  { id: 'dr4', service_id: 'demo-s1', product_id: 'demo-p5', quantity_used: 15, unit: 'ml', quantity_value: 15, quantity_unit: 'ml', is_optional: false, notes: null, mix_ratio: null, salon_id: 'demo', created_at: '' },
  // Peeling enzymatyczny – with mix ratios!
  { id: 'dr5', service_id: 'demo-s2', product_id: 'demo-p6', quantity_used: 15, unit: 'ml', quantity_value: 15, quantity_unit: 'ml', is_optional: false, notes: null, mix_ratio: 60, salon_id: 'demo', created_at: '' },
  { id: 'dr6', service_id: 'demo-s2', product_id: 'demo-p7', quantity_used: 5, unit: 'ml', quantity_value: 5, quantity_unit: 'ml', is_optional: false, notes: null, mix_ratio: 20, salon_id: 'demo', created_at: '' },
  { id: 'dr7', service_id: 'demo-s2', product_id: 'demo-p8', quantity_used: 3, unit: 'ml', quantity_value: 3, quantity_unit: 'ml', is_optional: false, notes: null, mix_ratio: 12, salon_id: 'demo', created_at: '' },
  { id: 'dr8', service_id: 'demo-s2', product_id: 'demo-p9', quantity_used: 4, unit: 'krople', quantity_value: 4, quantity_unit: 'krople', is_optional: false, notes: null, mix_ratio: 8, salon_id: 'demo', created_at: '' },
  { id: 'dr9', service_id: 'demo-s2', product_id: 'demo-p10', quantity_used: 10, unit: 'ml', quantity_value: 10, quantity_unit: 'ml', is_optional: true, notes: 'Na życzenie klientki', mix_ratio: null, salon_id: 'demo', created_at: '' },
  // Henna
  { id: 'dr10', service_id: 'demo-s4', product_id: 'demo-p11', quantity_used: 2, unit: 'g', quantity_value: 2, quantity_unit: 'g', is_optional: false, notes: null, mix_ratio: null, salon_id: 'demo', created_at: '' },
  { id: 'dr11', service_id: 'demo-s4', product_id: 'demo-p12', quantity_used: 5, unit: 'ml', quantity_value: 5, quantity_unit: 'ml', is_optional: false, notes: null, mix_ratio: null, salon_id: 'demo', created_at: '' },
  // Masaż
  { id: 'dr12', service_id: 'demo-s5', product_id: 'demo-p13', quantity_used: 30, unit: 'ml', quantity_value: 30, quantity_unit: 'ml', is_optional: false, notes: null, mix_ratio: null, salon_id: 'demo', created_at: '' },
];

const UNIT_OPTIONS = [
  { value: 'ml', label: 'ml' },
  { value: 'g', label: 'g' },
  { value: 'szt', label: 'szt' },
  { value: 'krople', label: 'krople' },
  { value: 'łyżeczka', label: 'łyżeczka' },
  { value: 'łyżka', label: 'łyżka' },
  { value: 'cm', label: 'cm' },
  { value: '%', label: '%' },
  { value: 'inne', label: 'inne' },
];

// ---------- Component ----------

interface ServiceRecipesProps {
  salonId: string | null | undefined;
  isDemo?: boolean;
}

const ServiceRecipes: React.FC<ServiceRecipesProps> = ({ salonId, isDemo }) => {
  const servicesQuery = useServices();
  const dbServices = servicesQuery.data;
  const { products: dbProducts } = useProducts(salonId || '');
  const { recipes: dbRecipes, addRecipe, updateRecipe, removeRecipe, getMaterialCost } = useServiceRecipes(salonId || '');

  const [demoRecipes, setDemoRecipes] = useState<DemoRecipe[]>(INITIAL_DEMO_RECIPES);
  const demoIdCounter = React.useRef(200);

  const services = isDemo ? DEMO_SERVICES : (dbServices?.filter((s) => s.is_active) || []);
  const products = isDemo ? DEMO_PRODUCTS : (dbProducts || []);
  const recipes: DemoRecipe[] = isDemo ? demoRecipes : ((dbRecipes || []) as DemoRecipe[]);

  // UI state
  const [selectedService, setSelectedService] = useState<string>('');

  const serviceRecipes = selectedService ? recipes.filter((r) => r.service_id === selectedService) : [];
  const selectedServiceData = services.find((s) => s.id === selectedService);

  const recipeCountMap = useMemo(() => {
    const map: Record<string, number> = {};
    recipes.forEach((r) => {
      map[r.service_id] = (map[r.service_id] || 0) + 1;
    });
    return map;
  }, [recipes]);

  // Mix ratio calculations
  const mixRatioSum = useMemo(() => {
    return serviceRecipes
      .filter((r) => !r.is_optional && r.mix_ratio != null)
      .reduce((sum, r) => sum + (r.mix_ratio || 0), 0);
  }, [serviceRecipes]);

  const hasMixRatios = serviceRecipes.some((r) => r.mix_ratio != null && r.mix_ratio > 0);

  const calcMaterialCost = (serviceId: string): number => {
    if (isDemo) {
      return demoRecipes
        .filter((r) => r.service_id === serviceId && !r.is_optional)
        .reduce((sum, r) => {
          const p = DEMO_PRODUCTS.find((pr) => pr.id === r.product_id);
          return sum + (r.quantity_value || r.quantity_used) * (p?.purchase_price_net || 0);
        }, 0);
    }
    return getMaterialCost(serviceId);
  };

  const hasMissingPrices = serviceRecipes.some((r) => {
    const p = products.find((pr) => pr.id === r.product_id);
    return !p?.purchase_price_net;
  });

  const materialCost = selectedService ? calcMaterialCost(selectedService) : 0;
  const servicePrice = selectedServiceData?.price || 0;
  const profitMargin = servicePrice > 0 ? ((servicePrice - materialCost) / servicePrice) * 100 : 0;

  // Handlers
  const handleAddIngredient = () => {
    if (!selectedService) return;
    if (isDemo) {
      demoIdCounter.current += 1;
      setDemoRecipes((prev) => [
        ...prev,
        {
          id: `demo-r-${demoIdCounter.current}`,
          service_id: selectedService,
          product_id: '',
          quantity_used: 1,
          unit: 'ml',
          quantity_value: 1,
          quantity_unit: 'ml',
          is_optional: false,
          notes: null,
          mix_ratio: null,
          salon_id: 'demo',
          created_at: '',
        },
      ]);
      return;
    }
    // For DB mode, we add a placeholder - user picks product then saves
    if (!salonId) return;
    // Add with first product as placeholder
    if (products.length > 0) {
      addRecipe({
        salon_id: salonId,
        service_id: selectedService,
        product_id: products[0].id,
        quantity_used: 1,
        unit: 'ml',
        quantity_value: 1,
        quantity_unit: 'ml',
        is_optional: false,
      }).then(() => toast.success('Dodano składnik'));
    }
  };

  const handleUpdateField = (recipeId: string, field: string, value: unknown) => {
    if (isDemo) {
      setDemoRecipes((prev) =>
        prev.map((r) => (r.id === recipeId ? { ...r, [field]: value } : r))
      );
      return;
    }
    updateRecipe({ id: recipeId, [field]: value } as Parameters<typeof updateRecipe>[0]);
  };

  const handleRemove = (id: string) => {
    if (isDemo) {
      setDemoRecipes((prev) => prev.filter((r) => r.id !== id));
      toast.success('Usunięto składnik');
      return;
    }
    removeRecipe(id);
  };

  const handleDuplicate = () => {
    if (!selectedService || !isDemo) return;
    const toDuplicate = serviceRecipes;
    toDuplicate.forEach((r) => {
      demoIdCounter.current += 1;
      setDemoRecipes((prev) => [
        ...prev,
        { ...r, id: `demo-dup-${demoIdCounter.current}`, service_id: selectedService },
      ]);
    });
    toast.success('Receptura zduplikowana');
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
                const cost = calcMaterialCost(s.id);
                return (
                  <button
                    key={s.id}
                    onClick={() => setSelectedService(s.id)}
                    className={cn(
                      'w-full text-left px-4 py-3 flex items-center justify-between transition-colors hover:bg-muted/50',
                      isSelected && 'bg-primary/5 border-l-2 border-l-primary'
                    )}
                  >
                    <div className="min-w-0">
                      <p className={cn('text-sm font-medium truncate', isSelected ? 'text-primary' : 'text-foreground')}>
                        {s.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {s.price} zł
                        {count > 0 && cost > 0 && (
                          <span className="ml-1">· koszt: {cost.toFixed(2)} zł</span>
                        )}
                      </p>
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
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base flex items-center gap-2">
                      <FlaskConical className="w-4 h-4" />
                      Receptura: {selectedServiceData?.name}
                    </CardTitle>
                    <div className="flex gap-1">
                      {isDemo && serviceRecipes.length > 0 && (
                        <Button variant="outline" size="sm" onClick={handleDuplicate} className="gap-1 h-8">
                          <Copy className="w-3 h-3" />
                          Duplikuj
                        </Button>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Ingredient rows */}
                  {serviceRecipes.length > 0 ? (
                    <div className="space-y-2">
                      {serviceRecipes.map((recipe) => {
                        const product = products.find((p) => p.id === recipe.product_id);
                        const qty = recipe.quantity_value || recipe.quantity_used;
                        const cost = qty * (product?.purchase_price_net || 0);
                        const ratioWidth = recipe.mix_ratio ? Math.min(recipe.mix_ratio, 100) : 0;

                        return (
                          <div
                            key={recipe.id}
                            className={cn(
                              'p-3 rounded-lg border bg-card space-y-2',
                              recipe.is_optional && 'border-dashed opacity-80'
                            )}
                          >
                            {/* Row 1: Product + quantity + unit + ratio */}
                            <div className="flex items-center gap-2 flex-wrap">
                              {/* Product selector */}
                              <div className="flex-1 min-w-[160px]">
                                <Select
                                  value={recipe.product_id || undefined}
                                  onValueChange={(v) => handleUpdateField(recipe.id, 'product_id', v)}
                                >
                                  <SelectTrigger className="h-8 text-sm">
                                    <SelectValue placeholder="Wybierz produkt..." />
                                  </SelectTrigger>
                                  <SelectContent className="bg-background border">
                                    {products.map((p) => (
                                      <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>

                              {/* Quantity */}
                              <Input
                                type="number"
                                min={0.001}
                                step={0.1}
                                value={recipe.quantity_value || recipe.quantity_used}
                                onChange={(e) => {
                                  const val = parseFloat(e.target.value) || 1;
                                  handleUpdateField(recipe.id, 'quantity_value', val);
                                  handleUpdateField(recipe.id, 'quantity_used', val);
                                }}
                                className="h-8 w-20 text-sm"
                              />

                              {/* Unit */}
                              <Select
                                value={recipe.quantity_unit || recipe.unit}
                                onValueChange={(v) => {
                                  handleUpdateField(recipe.id, 'quantity_unit', v);
                                  handleUpdateField(recipe.id, 'unit', v);
                                }}
                              >
                                <SelectTrigger className="h-8 w-24 text-sm">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-background border">
                                  {UNIT_OPTIONS.map((u) => (
                                    <SelectItem key={u.value} value={u.value}>{u.label}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>

                              {/* Mix ratio */}
                              <div className="flex items-center gap-1">
                                <Input
                                  type="number"
                                  min={0}
                                  max={100}
                                  step={1}
                                  value={recipe.mix_ratio ?? ''}
                                  onChange={(e) => {
                                    const val = e.target.value === '' ? null : parseFloat(e.target.value);
                                    handleUpdateField(recipe.id, 'mix_ratio', val);
                                  }}
                                  placeholder="%"
                                  className="h-8 w-16 text-sm"
                                />
                                <span className="text-xs text-muted-foreground">%</span>
                              </div>

                              {/* Cost */}
                              <span className="text-sm font-medium min-w-[60px] text-right">
                                {product?.purchase_price_net ? `${cost.toFixed(2)} zł` : '—'}
                              </span>

                              {/* Delete */}
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-destructive hover:text-destructive shrink-0"
                                onClick={() => handleRemove(recipe.id)}
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </Button>
                            </div>

                            {/* Row 2: Optional + notes */}
                            <div className="flex items-center gap-3 pl-1">
                              <div className="flex items-center gap-1.5">
                                <Checkbox
                                  id={`opt-${recipe.id}`}
                                  checked={recipe.is_optional}
                                  onCheckedChange={(checked) => handleUpdateField(recipe.id, 'is_optional', !!checked)}
                                  className="h-3.5 w-3.5"
                                />
                                <Label htmlFor={`opt-${recipe.id}`} className="text-xs text-muted-foreground cursor-pointer">
                                  opcjonalny
                                </Label>
                              </div>

                              <Input
                                value={recipe.notes || ''}
                                onChange={(e) => handleUpdateField(recipe.id, 'notes', e.target.value || null)}
                                placeholder="notatka..."
                                className="h-7 text-xs flex-1"
                              />

                              {/* Mini ratio bar */}
                              {recipe.mix_ratio != null && recipe.mix_ratio > 0 && (
                                <div className="w-20 h-2 bg-muted rounded-full overflow-hidden shrink-0">
                                  <div
                                    className="h-full bg-primary rounded-full transition-all"
                                    style={{ width: `${ratioWidth}%` }}
                                  />
                                </div>
                              )}
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

                  {/* Mix ratio progress bar */}
                  {hasMixRatios && (
                    <div className="p-3 rounded-lg border space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-medium">Proporcje mieszanki</span>
                        <span className={cn(
                          'font-semibold',
                          mixRatioSum === 100 && 'text-green-600',
                          mixRatioSum > 0 && mixRatioSum < 100 && 'text-yellow-600',
                          mixRatioSum > 100 && 'text-destructive'
                        )}>
                          {mixRatioSum.toFixed(0)}%
                        </span>
                      </div>
                      <Progress
                        value={Math.min(mixRatioSum, 100)}
                        className={cn(
                          'h-3',
                          mixRatioSum === 100 && '[&>div]:bg-green-500',
                          mixRatioSum > 0 && mixRatioSum < 100 && '[&>div]:bg-yellow-500',
                          mixRatioSum > 100 && '[&>div]:bg-destructive'
                        )}
                      />
                      <p className="text-[11px] text-muted-foreground">
                        {mixRatioSum === 100 && '✓ Proporcje kompletne'}
                        {mixRatioSum > 0 && mixRatioSum < 100 && `Brakuje: ${(100 - mixRatioSum).toFixed(0)}% — dodaj składnik lub dopełnij`}
                        {mixRatioSum > 100 && `Suma przekracza 100% o ${(mixRatioSum - 100).toFixed(0)}%`}
                        {mixRatioSum === 0 && 'Uzupełnij procenty w polach "%" przy składnikach'}
                      </p>
                    </div>
                  )}

                  {/* Add ingredient button */}
                  <Button
                    variant="outline"
                    onClick={handleAddIngredient}
                    className="w-full gap-2 border-dashed"
                  >
                    <Plus className="w-4 h-4" />
                    Dodaj składnik
                  </Button>

                  {/* Missing price warning */}
                  {hasMissingPrices && serviceRecipes.length > 0 && (
                    <div className="flex items-start gap-2 p-3 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 text-sm">
                      <AlertTriangle className="w-4 h-4 text-yellow-600 shrink-0 mt-0.5" />
                      <span className="text-yellow-800 dark:text-yellow-200">
                        Uzupełnij cenę zakupu produktu aby zobaczyć pełny koszt
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* True Profit card */}
              {servicePrice > 0 && serviceRecipes.length > 0 && (
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
                        <span className={cn(
                          'font-semibold',
                          profitMargin >= 70 ? 'text-emerald-600' : profitMargin >= 50 ? 'text-amber-500' : 'text-destructive'
                        )}>
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

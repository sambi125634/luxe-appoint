import React, { useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FlaskConical, Plus, Pencil, Copy, TrendingUp, Beaker } from 'lucide-react';
import { useServices } from '@/hooks/useServices';
import { useProducts } from '@/hooks/useProducts';
import { useServiceRecipes } from '@/hooks/useServiceRecipes';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import RecipeEditorDrawer, { type RecipeForEdit } from './RecipeEditorDrawer';

// Demo data — realne usługi Med-Spa z cenami rynkowymi 2026
const DEMO_SERVICES = [
  { id: 'demo-s1', name: 'Mezoterapia igłowa twarzy', price: 450, is_active: true, duration: 60 },
  { id: 'demo-s2', name: 'HIFU – lifting bez skalpela', price: 1200, is_active: true, duration: 90 },
  { id: 'demo-s3', name: 'Peeling chemiczny TCA', price: 350, is_active: true, duration: 45 },
  { id: 'demo-s4', name: 'Manicure hybrydowy premium', price: 180, is_active: true, duration: 75 },
  { id: 'demo-s5', name: 'Drenaż limfatyczny – pełny', price: 280, is_active: true, duration: 60 },
];

// Ceny = koszt za 1 jednostkę bazową (1ml, 1szt, 1g)
const DEMO_PRODUCTS = [
  { id: 'demo-p1', name: 'Fillmed NCTF 135HA (fiolka 3ml)', purchase_price_net: 115 },   // ~119-125 zł brutto, netto ~115 zł
  { id: 'demo-p2', name: 'Igły meso 32G MESORAM (op. 100szt)', purchase_price_net: 0.60 }, // ~60 zł/100szt
  { id: 'demo-p3', name: 'Środek dezynfekcyjny 1L', purchase_price_net: 0.03 },           // ~30 zł/1000ml
  { id: 'demo-p4', name: 'Maseczka kojąca alg. 50ml', purchase_price_net: 0.56 },         // ~28 zł/50ml
  { id: 'demo-p5', name: 'Żel do ultradźwięków 500ml', purchase_price_net: 0.052 },       // ~26 zł netto/500ml (Bielenda Prof.)
  { id: 'demo-p6', name: 'Peeling TCA 15% 30ml', purchase_price_net: 3.50 },             // ~105 zł netto/30ml
  { id: 'demo-p7', name: 'Baza hybrydowa Semilac 7ml', purchase_price_net: 3.00 },        // ~21 zł netto/7ml
  { id: 'demo-p8', name: 'Lakier hybrydowy NeoNail 7.2ml', purchase_price_net: 2.80 },    // ~20 zł netto/7.2ml
  { id: 'demo-p9', name: 'Top coat no-wipe 7ml', purchase_price_net: 3.20 },              // ~22 zł netto/7ml
  { id: 'demo-p10', name: 'Waciki bezpyłowe (op. 500szt)', purchase_price_net: 0.04 },    // ~20 zł/500szt
  { id: 'demo-p11', name: 'Krem drenujący Bielenda 500ml', purchase_price_net: 0.10 },    // ~50 zł netto/500ml
  { id: 'demo-p12', name: 'Cleaner/odtłuszczacz 500ml', purchase_price_net: 0.04 },       // ~20 zł/500ml
];

interface DemoRecipe {
  id: string;
  service_id: string;
  product_id: string;
  quantity_value: number;
  quantity_unit: string;
  is_optional: boolean;
  mix_ratio: number | null;
  notes: string | null;
}

const INITIAL_DEMO_RECIPES: DemoRecipe[] = [
  // Mezoterapia igłowa (450 zł) → NCTF 115 + igły 3×0.60 + dezyn. + maseczka ≈ 123 zł, marża ~73%
  { id: 'dr1', service_id: 'demo-s1', product_id: 'demo-p1', quantity_value: 1, quantity_unit: 'fiolka', is_optional: false, notes: 'Fillmed NCTF 135HA 3ml', mix_ratio: null },
  { id: 'dr2', service_id: 'demo-s1', product_id: 'demo-p2', quantity_value: 5, quantity_unit: 'szt', is_optional: false, notes: null, mix_ratio: null },
  { id: 'dr3', service_id: 'demo-s1', product_id: 'demo-p3', quantity_value: 20, quantity_unit: 'ml', is_optional: false, notes: 'Dezynfekcja przed i po', mix_ratio: null },
  { id: 'dr4', service_id: 'demo-s1', product_id: 'demo-p4', quantity_value: 10, quantity_unit: 'ml', is_optional: true, notes: 'Maseczka kojąca po zabiegu', mix_ratio: null },
  // HIFU (1200 zł) → żel 80ml + maseczka ≈ 10 zł, marża ~99%
  { id: 'dr5', service_id: 'demo-s2', product_id: 'demo-p5', quantity_value: 80, quantity_unit: 'ml', is_optional: false, notes: null, mix_ratio: null },
  { id: 'dr6', service_id: 'demo-s2', product_id: 'demo-p4', quantity_value: 10, quantity_unit: 'ml', is_optional: true, notes: 'Maseczka po zabiegu', mix_ratio: null },
  // Peeling TCA (350 zł) → peeling 5ml + maseczka 10ml ≈ 23 zł, marża ~93%
  { id: 'dr7', service_id: 'demo-s3', product_id: 'demo-p6', quantity_value: 5, quantity_unit: 'ml', is_optional: false, notes: null, mix_ratio: null },
  { id: 'dr8', service_id: 'demo-s3', product_id: 'demo-p4', quantity_value: 10, quantity_unit: 'ml', is_optional: false, notes: null, mix_ratio: null },
  // Manicure premium (180 zł) → baza+lakier+top+waciki+cleaner ≈ 11 zł, marża ~94%
  { id: 'dr9', service_id: 'demo-s4', product_id: 'demo-p7', quantity_value: 1, quantity_unit: 'ml', is_optional: false, notes: null, mix_ratio: null },
  { id: 'dr10', service_id: 'demo-s4', product_id: 'demo-p8', quantity_value: 1, quantity_unit: 'ml', is_optional: false, notes: null, mix_ratio: null },
  { id: 'dr11', service_id: 'demo-s4', product_id: 'demo-p9', quantity_value: 1, quantity_unit: 'ml', is_optional: false, notes: null, mix_ratio: null },
  { id: 'dr12', service_id: 'demo-s4', product_id: 'demo-p10', quantity_value: 8, quantity_unit: 'szt', is_optional: false, notes: null, mix_ratio: null },
  { id: 'dr13', service_id: 'demo-s4', product_id: 'demo-p12', quantity_value: 10, quantity_unit: 'ml', is_optional: false, notes: null, mix_ratio: null },
  // Drenaż limfatyczny (280 zł) → krem 50ml ≈ 5 zł, marża ~98%
  { id: 'dr14', service_id: 'demo-s5', product_id: 'demo-p11', quantity_value: 50, quantity_unit: 'ml', is_optional: false, notes: null, mix_ratio: null },
];

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
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingRecipe, setEditingRecipe] = useState<RecipeForEdit | null>(null);

  const services = isDemo ? DEMO_SERVICES : (dbServices?.filter(s => s.is_active) || []).map(s => ({
    id: s.id, name: s.name, price: Number(s.price), is_active: true, duration: s.duration,
  }));
  const products = isDemo ? DEMO_PRODUCTS : (dbProducts || []);
  const recipes = isDemo ? demoRecipes : ((dbRecipes || []) as unknown as DemoRecipe[]);

  // Group recipes by service
  const recipesByService = useMemo(() => {
    const map: Record<string, DemoRecipe[]> = {};
    recipes.forEach(r => {
      if (!map[r.service_id]) map[r.service_id] = [];
      map[r.service_id].push(r);
    });
    return map;
  }, [recipes]);

  const servicesWithRecipes = useMemo(() => {
    return services
      .filter(s => recipesByService[s.id]?.length > 0)
      .map(s => {
        const ings = recipesByService[s.id] || [];
        const totalCost = ings
          .filter(r => !r.is_optional)
          .reduce((sum, r) => {
            const p = products.find(pr => pr.id === r.product_id);
            return sum + r.quantity_value * (p?.purchase_price_net || 0);
          }, 0);
        const margin = s.price > 0 ? ((s.price - totalCost) / s.price) * 100 : 0;
        return { service: s, ingredients: ings, totalCost, margin };
      });
  }, [services, recipesByService, products]);

  const totalMaterialCost = servicesWithRecipes.reduce((s, r) => s + r.totalCost, 0);

  const calcIngCost = (r: DemoRecipe) => {
    const p = products.find(pr => pr.id === r.product_id);
    return r.quantity_value * (p?.purchase_price_net || 0);
  };

  const openEditor = (recipe?: { service: typeof services[0]; ingredients: DemoRecipe[] }) => {
    if (recipe) {
      setEditingRecipe({
        serviceId: recipe.service.id,
        ingredients: recipe.ingredients.map(i => ({
          id: i.id,
          productId: i.product_id,
          quantityValue: i.quantity_value,
          quantityUnit: i.quantity_unit,
          isOptional: i.is_optional,
          mixRatio: i.mix_ratio,
          notes: i.notes || '',
        })),
      });
    } else {
      setEditingRecipe(null);
    }
    setIsEditorOpen(true);
  };

  const duplicateRecipe = (recipe: typeof servicesWithRecipes[0]) => {
    if (isDemo) {
      toast.success('Receptura zduplikowana (tryb demo)');
      return;
    }
    toast.success('Receptura zduplikowana');
  };

  const handleSave = async (data: RecipeForEdit) => {
    if (isDemo) {
      // Demo mode - update local state
      const filtered = demoRecipes.filter(r => r.service_id !== data.serviceId);
      const newRecipes = data.ingredients.map((ing, i) => ({
        id: ing.id || `demo-new-${Date.now()}-${i}`,
        service_id: data.serviceId,
        product_id: ing.productId,
        quantity_value: ing.quantityValue,
        quantity_unit: ing.quantityUnit,
        is_optional: ing.isOptional,
        mix_ratio: ing.mixRatio,
        notes: ing.notes || null,
      }));
      setDemoRecipes([...filtered, ...newRecipes]);
      return;
    }

    if (!salonId) return;
    try {
      // Remove old recipes for this service
      const oldRecipes = (dbRecipes || []).filter(r => r.service_id === data.serviceId);
      for (const r of oldRecipes) {
        removeRecipe(r.id);
      }
      // Add new ones
      for (const ing of data.ingredients) {
        await addRecipe({
          salon_id: salonId,
          service_id: data.serviceId,
          product_id: ing.productId,
          quantity_used: ing.quantityValue,
          unit: ing.quantityUnit,
          quantity_value: ing.quantityValue,
          quantity_unit: ing.quantityUnit,
          is_optional: ing.isOptional,
          mix_ratio: ing.mixRatio,
          notes: ing.notes || undefined,
        });
      }
    } catch {
      toast.error('Błąd podczas zapisu receptury');
    }
  };

  const mixColors = ['bg-blue-500', 'bg-emerald-500', 'bg-amber-500', 'bg-purple-500', 'bg-pink-500', 'bg-cyan-500'];

  // Empty state
  if (servicesWithRecipes.length === 0) {
    return (
      <>
        <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
          <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
            <FlaskConical className="w-10 h-10 text-primary" />
          </div>
          <h2 className="text-2xl font-serif font-semibold mb-2">Receptury zabiegów</h2>
          <p className="text-muted-foreground max-w-md mb-8">
            Receptura to lista produktów zużywanych podczas jednego zabiegu z ich ilościami.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-xl mb-8">
            {[
              { icon: '💰', title: 'Realny zysk', desc: 'True Profit odejmie koszty materiałów od przychodu' },
              { icon: '📦', title: 'Auto-magazyn', desc: 'Stany spadają automatycznie po każdej wizycie' },
              { icon: '⚠️', title: 'Alerty braków', desc: 'Dowiesz się zanim skończy Ci się produkt' },
            ].map((item, i) => (
              <div key={i} className="p-4 rounded-xl bg-muted/50 border text-center space-y-2">
                <span className="text-2xl">{item.icon}</span>
                <p className="font-semibold text-sm">{item.title}</p>
                <p className="text-xs text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>

          <Button size="lg" className="gap-2 rounded-xl" onClick={() => { setEditingRecipe(null); setIsEditorOpen(true); }}>
            <Plus className="w-5 h-5" />
            Utwórz pierwszą recepturę
          </Button>
          <p className="text-xs text-muted-foreground mt-3">
            Zacznij od najpopularniejszego zabiegu — resztę możesz dodać później
          </p>
        </div>

        <RecipeEditorDrawer
          open={isEditorOpen}
          onOpenChange={setIsEditorOpen}
          services={services}
          products={products}
          editingRecipe={editingRecipe}
          onSave={handleSave}
          isDemo={isDemo}
        />
      </>
    );
  }

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-serif font-semibold">Receptury zabiegów</h2>
            <p className="text-sm text-muted-foreground">
              {servicesWithRecipes.length} receptur · Łączny koszt materiałów: {totalMaterialCost.toFixed(2)} zł/mies.
            </p>
          </div>
          <Button className="gap-2 rounded-xl" onClick={() => openEditor()}>
            <Plus className="w-4 h-4" />
            Nowa receptura
          </Button>
        </div>

        {/* Recipe cards */}
        <div className="space-y-4">
          {servicesWithRecipes.map(recipe => (
            <Card key={recipe.service.id} className="overflow-hidden">
              <CardContent className="p-0">
                {/* Card header */}
                <div className="flex items-center justify-between p-4 border-b bg-muted/20">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Beaker className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold">{recipe.service.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {recipe.ingredients.length} składników · ~{recipe.totalCost.toFixed(2)} zł/zabieg
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    {/* Margin */}
                    <div className="text-right">
                      <p className={cn(
                        'text-lg font-bold',
                        recipe.margin >= 80 ? 'text-green-600' : recipe.margin >= 60 ? 'text-yellow-600' : 'text-red-500'
                      )}>
                        {recipe.margin.toFixed(0)}%
                      </p>
                      <p className="text-[10px] text-muted-foreground">marża mat.</p>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEditor(recipe)}>
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => duplicateRecipe(recipe)}>
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Ingredients list */}
                <div className="divide-y divide-border/50">
                  {recipe.ingredients.map((ing, i) => {
                    const product = products.find(p => p.id === ing.product_id);
                    const cost = calcIngCost(ing);
                    return (
                      <div key={ing.id} className="flex items-center justify-between px-4 py-2.5 text-sm">
                        <div className="flex items-center gap-2">
                          <div className={cn('w-2 h-2 rounded-full', mixColors[i % mixColors.length])} />
                          <span>{product?.name || 'Nieznany produkt'}</span>
                          {ing.is_optional && (
                            <Badge variant="outline" className="text-[10px] py-0 h-4">(opcjonalny)</Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-3 text-muted-foreground">
                          {ing.mix_ratio && (
                            <Badge variant="secondary" className="text-[10px] py-0">{ing.mix_ratio}%</Badge>
                          )}
                          <span className="text-xs">{ing.quantity_value} {ing.quantity_unit}</span>
                          <span className="text-xs font-medium text-foreground min-w-[60px] text-right">
                            ~{cost.toFixed(2)} zł
                          </span>
                        </div>
                      </div>
                    );
                  })}

                  {/* Mix ratio bar */}
                  {recipe.ingredients.some(i => i.mix_ratio) && (
                    <div className="px-4 py-3">
                      <div className="h-2 flex rounded-full overflow-hidden bg-muted">
                        {recipe.ingredients.filter(i => i.mix_ratio).map((ing, i) => (
                          <div
                            key={ing.id}
                            className={cn('h-full', mixColors[i % mixColors.length])}
                            style={{ width: `${Math.min(ing.mix_ratio || 0, 100)}%` }}
                          />
                        ))}
                      </div>
                      <p className="text-[10px] text-muted-foreground mt-1">Proporcje mieszanki</p>
                    </div>
                  )}
                </div>

                {/* Card footer */}
                <div className="flex items-center justify-between px-4 py-3 bg-muted/30 border-t">
                  <div className="flex items-center gap-4 text-xs">
                    <span>Koszt: <strong className="text-destructive">{recipe.totalCost.toFixed(2)} zł</strong></span>
                    <span>Cena usługi: <strong>{recipe.service.price} zł</strong></span>
                    <span>Zysk: <strong className="text-green-600">{(recipe.service.price - recipe.totalCost).toFixed(2)} zł</strong></span>
                  </div>
                  <Button variant="outline" size="sm" className="gap-1.5 h-7 text-xs rounded-lg" onClick={() => openEditor(recipe)}>
                    <Pencil className="w-3 h-3" />
                    Edytuj recepturę
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <RecipeEditorDrawer
        open={isEditorOpen}
        onOpenChange={setIsEditorOpen}
        services={services}
        products={products}
        editingRecipe={editingRecipe}
        onSave={handleSave}
        isDemo={isDemo}
      />
    </>
  );
};

export default ServiceRecipes;

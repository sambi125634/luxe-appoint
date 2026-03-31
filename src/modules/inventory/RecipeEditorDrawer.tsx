import React, { useState, useEffect, useMemo } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { FlaskConical, Plus, Trash2, Save, TrendingUp, Search, Sparkles, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface IngredientItem {
  id: string;
  productId: string;
  quantityValue: number;
  quantityUnit: string;
  isOptional: boolean;
  mixRatio: number | null;
  notes: string;
}

interface ServiceOption {
  id: string;
  name: string;
  price: number;
  duration?: number;
}

interface ProductOption {
  id: string;
  name: string;
  purchase_price_net?: number | null;
}

export interface RecipeForEdit {
  serviceId: string;
  ingredients: {
    id?: string;
    productId: string;
    quantityValue: number;
    quantityUnit: string;
    isOptional: boolean;
    mixRatio: number | null;
    notes: string;
  }[];
}

interface RecipeEditorDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  services: ServiceOption[];
  products: ProductOption[];
  editingRecipe?: RecipeForEdit | null;
  preSelectedServiceId?: string;
  onSave: (data: {
    serviceId: string;
    ingredients: {
      id?: string;
      productId: string;
      quantityValue: number;
      quantityUnit: string;
      isOptional: boolean;
      mixRatio: number | null;
      notes: string;
    }[];
  }) => void;
  isDemo?: boolean;
}

const UNIT_OPTIONS = ['ml', 'g', 'szt', 'krople', 'łyżeczka', 'łyżka', 'cm', '%'];

const TEMPLATES = [
  { label: 'Zabieg twarzy', icon: '✨', items: ['Żel do oczyszczania', 'Tonik', 'Serum', 'Krem'] },
  { label: 'Masaż', icon: '💆', items: ['Olejek do masażu', 'Krem rozgrzewający'] },
  { label: 'Manicure', icon: '💅', items: ['Lakier hybrydowy', 'Top coat', 'Base coat', 'Aceton'] },
  { label: 'Pusty szablon', icon: '📋', items: [] },
];

let idCounter = 0;
const genId = () => `temp-${++idCounter}`;

const RecipeEditorDrawer: React.FC<RecipeEditorDrawerProps> = ({
  open, onOpenChange, services, products, editingRecipe, preSelectedServiceId, onSave, isDemo,
}) => {
  const [selectedServiceId, setSelectedServiceId] = useState('');
  const [serviceSearch, setServiceSearch] = useState('');
  const [ingredients, setIngredients] = useState<IngredientItem[]>([]);

  useEffect(() => {
    if (!open) return;
    if (editingRecipe) {
      setSelectedServiceId(editingRecipe.serviceId);
      setIngredients(editingRecipe.ingredients.map(i => ({ ...i, id: i.id || genId() })));
    } else {
      setSelectedServiceId(preSelectedServiceId || '');
      setIngredients([]);
    }
    setServiceSearch('');
  }, [open, editingRecipe, preSelectedServiceId]);

  const selectedService = services.find(s => s.id === selectedServiceId);

  const filteredServices = services.filter(s =>
    s.name.toLowerCase().includes(serviceSearch.toLowerCase())
  );

  const calculateIngredientCost = (ing: IngredientItem): number => {
    const product = products.find(p => p.id === ing.productId);
    if (!product?.purchase_price_net) return 0;
    return (ing.quantityValue / 100) * product.purchase_price_net;
  };

  const totalCost = ingredients.reduce((sum, ing) => sum + calculateIngredientCost(ing), 0);
  const totalMixRatio = ingredients.reduce((sum, ing) => sum + (ing.mixRatio || 0), 0);
  const materialMargin = selectedService && selectedService.price > 0
    ? ((selectedService.price - totalCost) / selectedService.price) * 100
    : 0;

  const addIngredient = () => {
    setIngredients(prev => [...prev, {
      id: genId(), productId: '', quantityValue: 1, quantityUnit: 'ml',
      isOptional: false, mixRatio: null, notes: '',
    }]);
  };

  const removeIngredient = (index: number) => {
    setIngredients(prev => prev.filter((_, i) => i !== index));
  };

  const updateIngredient = (index: number, field: keyof IngredientItem, value: unknown) => {
    setIngredients(prev => prev.map((ing, i) =>
      i === index ? { ...ing, [field]: value } : ing
    ));
  };

  const applyTemplate = (items: string[]) => {
    if (items.length === 0) {
      addIngredient();
      return;
    }
    const newIngs: IngredientItem[] = items.map(name => {
      const match = products.find(p => p.name.toLowerCase().includes(name.toLowerCase()));
      return {
        id: genId(), productId: match?.id || '', quantityValue: 1, quantityUnit: 'ml',
        isOptional: false, mixRatio: null, notes: '',
      };
    });
    setIngredients(newIngs);
  };

  const handleSave = () => {
    if (!selectedServiceId) {
      toast.error('Wybierz usługę');
      return;
    }
    if (ingredients.length === 0 || ingredients.every(i => !i.productId)) {
      toast.error('Dodaj przynajmniej jeden składnik');
      return;
    }
    onSave({
      serviceId: selectedServiceId,
      ingredients: ingredients.filter(i => i.productId),
    });
    onOpenChange(false);
    toast.success(editingRecipe ? 'Receptura zaktualizowana' : 'Receptura utworzona');
  };

  const mixColors = ['bg-blue-500', 'bg-emerald-500', 'bg-amber-500', 'bg-purple-500', 'bg-pink-500', 'bg-cyan-500'];

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-2xl p-0 flex flex-col">
        {/* Header */}
        <SheetHeader className="p-6 pb-4 bg-gradient-to-r from-primary/10 to-secondary/10 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                <FlaskConical className="w-5 h-5 text-primary" />
              </div>
              <div>
                <SheetTitle className="text-lg font-serif">
                  {editingRecipe ? 'Edytuj recepturę' : 'Nowa receptura'}
                </SheetTitle>
                <p className="text-sm text-muted-foreground">
                  {selectedService?.name || 'Wybierz usługę'}
                </p>
              </div>
            </div>
            {totalCost > 0 && (
              <div className="text-right">
                <p className="text-xl font-bold text-primary">{totalCost.toFixed(2)} zł</p>
                <p className="text-xs text-muted-foreground">koszt/zabieg</p>
              </div>
            )}
          </div>
        </SheetHeader>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          {/* Step 1: Service */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs">1</span>
              Dla której usługi?
            </div>
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Szukaj usługi..."
                value={serviceSearch}
                onChange={e => setServiceSearch(e.target.value)}
                className="pl-9 rounded-xl"
              />
            </div>
            <div className="max-h-48 overflow-y-auto space-y-1.5 rounded-xl border p-2">
              {filteredServices.map(s => (
                <button
                  key={s.id}
                  onClick={() => setSelectedServiceId(s.id)}
                  className={cn(
                    'w-full flex items-center justify-between p-2.5 rounded-lg text-sm transition-all',
                    selectedServiceId === s.id
                      ? 'bg-primary/10 border border-primary/30 font-medium'
                      : 'hover:bg-muted/50'
                  )}
                >
                  <span>{s.name}</span>
                  <span className="text-muted-foreground">{s.price} zł</span>
                </button>
              ))}
              {filteredServices.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">Brak wyników</p>
              )}
            </div>
            {selectedService && (
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                Cena usługi: {selectedService.price} zł
                {selectedService.duration && ` · Czas: ${selectedService.duration} min`}
              </p>
            )}
          </div>

          {/* Step 2: Ingredients */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs">2</span>
              Składniki receptury
            </div>

            {/* Templates */}
            {ingredients.length === 0 && (
              <div className="p-4 rounded-xl bg-muted/30 border border-dashed space-y-2">
                <p className="text-xs font-medium text-muted-foreground">💡 Zacznij od szablonu:</p>
                <div className="flex flex-wrap gap-2">
                  {TEMPLATES.map(tpl => (
                    <button
                      key={tpl.label}
                      onClick={() => applyTemplate(tpl.items)}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-background border hover:border-primary/50 hover:bg-primary/5 transition-all text-sm font-medium"
                    >
                      {tpl.icon} {tpl.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Ingredient rows */}
            <div className="space-y-3">
              {ingredients.map((ing, index) => {
                const cost = calculateIngredientCost(ing);
                return (
                  <div key={ing.id} className={cn(
                    'p-3 rounded-xl border bg-card space-y-2',
                    ing.isOptional && 'border-dashed opacity-80'
                  )}>
                    {/* Row 1: Product */}
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground font-mono w-5 shrink-0">{index + 1}.</span>
                      <div className="flex-1">
                        <Select
                          value={ing.productId || undefined}
                          onValueChange={v => updateIngredient(index, 'productId', v)}
                        >
                          <SelectTrigger className="h-9 text-sm rounded-lg">
                            <SelectValue placeholder="Wybierz produkt..." />
                          </SelectTrigger>
                          <SelectContent className="bg-background border">
                            {products.map(p => (
                              <SelectItem key={p.id} value={p.id}>
                                <div className="flex items-center justify-between gap-4">
                                  <span>{p.name}</span>
                                  {p.purchase_price_net != null && (
                                    <span className="text-xs text-muted-foreground">
                                      {p.purchase_price_net.toFixed(2)} zł
                                    </span>
                                  )}
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Checkbox
                          checked={ing.isOptional}
                          onCheckedChange={v => updateIngredient(index, 'isOptional', v)}
                          className="scale-75"
                        />
                        <span className="text-[10px] text-muted-foreground">opcjon.</span>
                      </div>
                      <button
                        onClick={() => removeIngredient(index)}
                        className="w-7 h-7 rounded-full bg-muted flex items-center justify-center hover:bg-destructive/10 hover:text-destructive transition-colors"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Row 2: Quantity + unit + mix ratio */}
                    <div className="flex items-end gap-2 pl-7">
                      <div className="w-20">
                        <Label className="text-[10px] text-muted-foreground">Ilość</Label>
                        <Input
                          type="number"
                          value={ing.quantityValue}
                          onChange={e => updateIngredient(index, 'quantityValue', Number(e.target.value))}
                          min={0}
                          step={0.1}
                          className="h-8 text-sm"
                        />
                      </div>
                      <div className="w-24">
                        <Label className="text-[10px] text-muted-foreground">Jednostka</Label>
                        <Select
                          value={ing.quantityUnit}
                          onValueChange={v => updateIngredient(index, 'quantityUnit', v)}
                        >
                          <SelectTrigger className="h-8 text-sm">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-background border">
                            {UNIT_OPTIONS.map(u => (
                              <SelectItem key={u} value={u}>{u}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="w-20">
                        <Label className="text-[10px] text-muted-foreground">% w mieszance</Label>
                        <Input
                          type="number"
                          value={ing.mixRatio ?? ''}
                          onChange={e => updateIngredient(index, 'mixRatio', e.target.value === '' ? null : Number(e.target.value))}
                          min={0}
                          max={100}
                          placeholder="—"
                          className="h-8 text-sm"
                        />
                      </div>
                      {ing.productId && ing.quantityValue > 0 && (
                        <div className="flex items-center gap-1 ml-auto">
                          <span className="text-[10px] text-muted-foreground">Koszt:</span>
                          <span className="text-xs font-semibold text-primary">~{cost.toFixed(2)} zł</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <Button variant="outline" onClick={addIngredient} className="w-full gap-2 border-dashed rounded-xl">
              <Plus className="w-4 h-4" />
              Dodaj składnik
            </Button>

            {/* Mix ratio bar */}
            {ingredients.some(i => i.mixRatio) && (
              <div className="p-3 rounded-xl border space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium">Suma proporcji:</span>
                  <span className={cn(
                    'font-semibold',
                    totalMixRatio === 100 ? 'text-green-600' : totalMixRatio > 100 ? 'text-red-500' : 'text-yellow-600'
                  )}>
                    {totalMixRatio}%
                    {totalMixRatio === 100 && ' ✓'}
                    {totalMixRatio > 100 && ` (za dużo o ${totalMixRatio - 100}%)`}
                    {totalMixRatio < 100 && totalMixRatio > 0 && ` (brakuje ${100 - totalMixRatio}%)`}
                  </span>
                </div>
                <div className="h-3 flex rounded-full overflow-hidden bg-muted">
                  {ingredients.filter(i => i.mixRatio).map((ing, i) => (
                    <div
                      key={ing.id}
                      className={cn('h-full', mixColors[i % mixColors.length])}
                      style={{ width: `${Math.min(ing.mixRatio || 0, 100)}%` }}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Step 3: Summary */}
          {ingredients.length > 0 && selectedService && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <TrendingUp className="w-4 h-4 text-primary" />
                Podsumowanie receptury
              </div>

              <div className="rounded-2xl bg-gradient-to-br from-primary to-primary/80 text-white p-5 space-y-3">
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div>
                    <p className="text-white/70 text-xs">Koszt materiałów</p>
                    <p className="font-bold text-lg">-{totalCost.toFixed(2)} zł</p>
                  </div>
                  <div>
                    <p className="text-white/70 text-xs">Cena usługi</p>
                    <p className="font-bold text-lg">{selectedService.price} zł</p>
                  </div>
                  <div>
                    <p className="text-white/70 text-xs">Zysk z zabiegu</p>
                    <p className={cn('font-bold text-lg', selectedService.price - totalCost > 0 ? 'text-green-300' : 'text-red-300')}>
                      {(selectedService.price - totalCost).toFixed(2)} zł
                    </p>
                  </div>
                </div>
              </div>

              {/* Margin bar */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium">Marża materiałowa</span>
                  <span className={cn(
                    'font-semibold',
                    materialMargin >= 80 ? 'text-green-600' : materialMargin >= 60 ? 'text-yellow-600' : 'text-red-500'
                  )}>
                    {materialMargin.toFixed(0)}%
                  </span>
                </div>
                <div className="h-2.5 bg-muted rounded-full overflow-hidden">
                  <div
                    className={cn(
                      'h-full rounded-full transition-all',
                      materialMargin >= 80 ? 'bg-green-500' : materialMargin >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                    )}
                    style={{ width: `${Math.min(materialMargin, 100)}%` }}
                  />
                </div>
                <p className="text-[11px] text-muted-foreground">
                  {materialMargin >= 80
                    ? '✓ Świetna marża — zabieg bardzo rentowny'
                    : materialMargin >= 60
                    ? '⚠️ Dobra marża — możesz obniżyć koszty'
                    : '❌ Niska marża — sprawdź ilości produktów'}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t bg-background flex items-center gap-3">
          <Button variant="outline" className="flex-1 rounded-xl" onClick={() => onOpenChange(false)}>
            Anuluj
          </Button>
          <Button
            className="flex-1 gap-2 rounded-xl bg-gradient-to-r from-primary to-primary/80"
            disabled={!selectedServiceId || ingredients.length === 0 || ingredients.every(i => !i.productId)}
            onClick={handleSave}
          >
            <Save className="w-4 h-4" />
            {editingRecipe ? 'Zapisz zmiany' : 'Utwórz recepturę'}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default RecipeEditorDrawer;

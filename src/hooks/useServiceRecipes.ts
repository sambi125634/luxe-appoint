import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useProducts } from '@/hooks/useProducts';

export interface RecipeItem {
  id: string;
  salon_id: string;
  service_id: string;
  product_id: string;
  quantity_used: number;
  unit: string;
  quantity_value: number;
  quantity_unit: string;
  is_optional: boolean;
  notes: string | null;
  mix_ratio: number | null;
  created_at: string;
}

interface RecipeInsert {
  salon_id: string;
  service_id: string;
  product_id: string;
  quantity_used: number;
  unit: string;
  quantity_value?: number;
  quantity_unit?: string;
  is_optional?: boolean;
  notes?: string;
  mix_ratio?: number | null;
}

interface RecipeUpdate {
  id: string;
  quantity_used?: number;
  unit?: string;
  quantity_value?: number;
  quantity_unit?: string;
  is_optional?: boolean;
  notes?: string | null;
  mix_ratio?: number | null;
}

export function useServiceRecipes(salonId: string) {
  const queryClient = useQueryClient();
  const { products } = useProducts(salonId);

  const { data: recipes } = useQuery({
    queryKey: ['service-recipes', salonId],
    queryFn: async () => {
      if (!salonId) return [];
      const { data, error } = await supabase
        .from('service_product_recipes')
        .select('*')
        .eq('salon_id', salonId);
      if (error) throw error;
      return data as RecipeItem[];
    },
    enabled: !!salonId,
  });

  const addMutation = useMutation({
    mutationFn: async (recipe: RecipeInsert) => {
      const { data, error } = await supabase
        .from('service_product_recipes')
        .insert(recipe)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['service-recipes', salonId] }),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, ...updates }: RecipeUpdate) => {
      const { error } = await supabase
        .from('service_product_recipes')
        .update(updates)
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['service-recipes', salonId] }),
  });

  const removeMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('service_product_recipes')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['service-recipes', salonId] }),
  });

  const getMaterialCost = (serviceId: string): number => {
    if (!recipes || !products) return 0;
    return recipes
      .filter((r) => r.service_id === serviceId && !r.is_optional)
      .reduce((sum, r) => {
        const product = products.find((p) => p.id === r.product_id);
        const qty = r.quantity_value || r.quantity_used;
        return sum + qty * (product?.purchase_price_net || 0);
      }, 0);
  };

  return {
    recipes,
    addRecipe: addMutation.mutateAsync,
    updateRecipe: updateMutation.mutateAsync,
    removeRecipe: (id: string) => removeMutation.mutate(id),
    getMaterialCost,
  };
}

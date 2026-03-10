import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useProducts } from '@/hooks/useProducts';

interface RecipeInsert {
  salon_id: string;
  service_id: string;
  product_id: string;
  quantity_used: number;
  unit: string;
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
      return data;
    },
    enabled: !!salonId,
  });

  const addMutation = useMutation({
    mutationFn: async (recipe: RecipeInsert) => {
      const { error } = await supabase
        .from('service_product_recipes')
        .insert(recipe);
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
      .filter((r) => r.service_id === serviceId)
      .reduce((sum, r) => {
        const product = products.find((p) => p.id === r.product_id);
        return sum + r.quantity_used * (product?.purchase_price_net || 0);
      }, 0);
  };

  return {
    recipes,
    addRecipe: addMutation.mutateAsync,
    removeRecipe: (id: string) => removeMutation.mutate(id),
    getMaterialCost,
  };
}

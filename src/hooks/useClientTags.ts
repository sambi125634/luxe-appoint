import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useSalonId } from "./useSalonId";

export interface ClientTag {
  id: string;
  name: string;
  color: string;
  is_system: boolean;
  sort_order: number;
  salon_id: string;
}

export function useClientTags() {
  const { salonId } = useSalonId();

  return useQuery({
    queryKey: ["client-tags", salonId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("client_tags")
        .select("*")
        .eq("salon_id", salonId!)
        .order("sort_order");

      if (error) throw error;
      return data as ClientTag[];
    },
    enabled: !!salonId,
  });
}

export function useCreateClientTag() {
  const { salonId } = useSalonId();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (tag: { name: string; color: string }) => {
      // Get max sort_order
      const { data: existing } = await supabase
        .from("client_tags")
        .select("sort_order")
        .eq("salon_id", salonId!)
        .order("sort_order", { ascending: false })
        .limit(1);

      const nextOrder = (existing?.[0]?.sort_order ?? 0) + 1;

      const { data, error } = await supabase
        .from("client_tags")
        .insert({
          salon_id: salonId!,
          name: tag.name,
          color: tag.color,
          is_system: false,
          sort_order: nextOrder,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["client-tags", salonId] });
    },
  });
}

export function useUpdateClientTag() {
  const { salonId } = useSalonId();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: string; name?: string; color?: string }) => {
      const { data, error } = await supabase
        .from("client_tags")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["client-tags", salonId] });
    },
  });
}

export function useDeleteClientTag() {
  const { salonId } = useSalonId();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("client_tags")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["client-tags", salonId] });
    },
  });
}

/**
 * Convert DB tags to the format used by ClientFilters/ClientListItem
 */
export function tagsToAvailableFormat(tags: ClientTag[]) {
  return tags.map((tag) => ({
    id: tag.name.toLowerCase().replace(/\s+/g, "-"),
    dbId: tag.id,
    label: tag.name,
    color: tagColorToTailwind(tag.color),
    isSystem: tag.is_system,
    rawColor: tag.color,
  }));
}

function tagColorToTailwind(hex: string): string {
  const colorMap: Record<string, string> = {
    "#f59e0b": "bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-200",
    "#22c55e": "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-200",
    "#3b82f6": "bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200",
    "#ef4444": "bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-200",
    "#f97316": "bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-200",
    "#6b7280": "bg-gray-100 text-gray-800 dark:bg-gray-900/50 dark:text-gray-200",
    "#10b981": "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-200",
    "#a855f7": "bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-200",
    "#64748b": "bg-slate-100 text-slate-800 dark:bg-slate-900/50 dark:text-slate-200",
    "#dc2626": "bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-200",
    "#eab308": "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-200",
    "#0ea5e9": "bg-sky-100 text-sky-800 dark:bg-sky-900/50 dark:text-sky-200",
    "#8b5cf6": "bg-violet-100 text-violet-800 dark:bg-violet-900/50 dark:text-violet-200",
    "#6366f1": "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/50 dark:text-indigo-200",
    "#ec4899": "bg-pink-100 text-pink-800 dark:bg-pink-900/50 dark:text-pink-200",
    "#f472b6": "bg-pink-100 text-pink-800 dark:bg-pink-900/50 dark:text-pink-200",
    "#fb923c": "bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-200",
    "#fbbf24": "bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-200",
    "#e11d48": "bg-rose-100 text-rose-800 dark:bg-rose-900/50 dark:text-rose-200",
    "#14b8a6": "bg-teal-100 text-teal-800 dark:bg-teal-900/50 dark:text-teal-200",
    "#2563eb": "bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200",
    "#7c3aed": "bg-violet-100 text-violet-800 dark:bg-violet-900/50 dark:text-violet-200",
  };
  return colorMap[hex] || "bg-muted text-muted-foreground";
}

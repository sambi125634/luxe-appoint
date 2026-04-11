import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useClientAppMode(salonId: string | null | undefined) {
  const { data, isLoading } = useQuery({
    queryKey: ["client-app-mode", salonId],
    queryFn: async () => {
      if (!salonId) return { count: 0 };
      const { count } = await supabase
        .from("client_salon_links")
        .select("id", { count: "exact", head: true })
        .eq("salon_id", salonId);
      return { count: count ?? 0 };
    },
    enabled: !!salonId,
  });

  return {
    isDemo: !data || data.count === 0,
    appUsers: data?.count ?? 0,
    isLoading,
  };
}

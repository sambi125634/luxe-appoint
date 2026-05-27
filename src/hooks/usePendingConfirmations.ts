import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useSalonId } from "./useSalonId";
import { useToast } from "@/hooks/use-toast";

export interface PendingConfirmation {
  id: string;
  start_time: string;
  end_time: string;
  status: string;
  clients: { first_name: string; last_name: string } | null;
  services: { name: string } | null;
  staff_members: { name: string } | null;
}

export function usePendingConfirmations() {
  const { salonId } = useSalonId();

  return useQuery({
    queryKey: ["pending-confirmations", salonId],
    enabled: !!salonId,
    queryFn: async (): Promise<PendingConfirmation[]> => {
      const now = new Date();
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const { data, error } = await supabase
        .from("appointments")
        .select("id, start_time, end_time, status, clients(first_name, last_name), services(name), staff_members(name)")
        .eq("salon_id", salonId!)
        .in("status", ["booked", "confirmed"])
        .gte("end_time", sevenDaysAgo.toISOString())
        .lt("end_time", now.toISOString())
        .order("end_time", { ascending: false });
      if (error) throw error;
      return (data ?? []) as unknown as PendingConfirmation[];
    },
    refetchInterval: 60_000,
  });
}

export function useMarkAppointmentStatus() {
  const qc = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: "completed" | "no_show" }) => {
      const { error } = await supabase
        .from("appointments")
        .update({ status })
        .eq("id", id);
      if (error) throw error;
    },
    onMutate: async ({ id }) => {
      await qc.cancelQueries({ queryKey: ["pending-confirmations"] });
      const prev = qc.getQueriesData({ queryKey: ["pending-confirmations"] });
      qc.setQueriesData<PendingConfirmation[]>({ queryKey: ["pending-confirmations"] }, (old) =>
        (old ?? []).filter((a) => a.id !== id),
      );
      return { prev };
    },
    onError: (_err, _vars, ctx) => {
      ctx?.prev?.forEach(([key, data]) => qc.setQueryData(key, data));
      toast({ title: "Nie udało się zapisać", variant: "destructive" });
    },
    onSuccess: (_d, vars) => {
      toast({
        title: vars.status === "completed" ? "Oznaczono jako odbyta" : "Oznaczono jako nieobecność",
      });
      qc.invalidateQueries({ queryKey: ["pending-confirmations"] });
      qc.invalidateQueries({ queryKey: ["pipeline-contacts"] });
      qc.invalidateQueries({ queryKey: ["dashboard-today-appointments"] });
    },
  });
}

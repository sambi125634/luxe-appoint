import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useSalonId } from "./useSalonId";
import type { PipelineContact } from "@/components/admin/pipeline/types";

/**
 * Derives Pipeline contacts from real appointments + clients data.
 * No dedicated pipeline table — stage is computed from visit history.
 */
export function usePipelineContacts(enabled = true) {
  const { salonId } = useSalonId();

  return useQuery({
    queryKey: ["pipeline-contacts", salonId],
    enabled: enabled && !!salonId,
    queryFn: async (): Promise<PipelineContact[]> => {
      const { data: clients, error: clientsErr } = await supabase
        .from("clients")
        .select("id, first_name, last_name, email, phone, tags, is_vip, source")
        .eq("salon_id", salonId!);
      if (clientsErr) throw clientsErr;
      if (!clients || clients.length === 0) return [];

      const clientIds = clients.map((c) => c.id);
      const { data: appts, error: apptErr } = await supabase
        .from("appointments")
        .select("id, client_id, status, start_time, price, service_id, services:service_id(name)")
        .eq("salon_id", salonId!)
        .in("client_id", clientIds)
        .order("start_time", { ascending: true });
      if (apptErr) throw apptErr;

      const now = Date.now();
      const byClient = new Map<string, typeof appts>();
      (appts || []).forEach((a) => {
        if (!a.client_id) return;
        const arr = byClient.get(a.client_id) || [];
        arr.push(a);
        byClient.set(a.client_id, arr);
      });

      const result: PipelineContact[] = [];
      for (const c of clients) {
        const list = byClient.get(c.id) || [];
        if (list.length === 0) continue; // skip clients without any appointment

        const completed = list.filter((a) => a.status === "completed");
        const completedCount = completed.length;
        const upcoming = list.filter(
          (a) =>
            (a.status === "booked" || a.status === "confirmed") &&
            new Date(a.start_time).getTime() > now,
        );
        const past = list.filter((a) => new Date(a.start_time).getTime() <= now);
        const lastPast = past[past.length - 1];
        const nextUpcoming = upcoming[0];
        const lastCompleted = completed[completed.length - 1];

        let stageId = "reserved";
        const recentNoShow =
          lastPast?.status === "no_show" &&
          now - new Date(lastPast.start_time).getTime() < 30 * 24 * 3600 * 1000;

        if (recentNoShow && upcoming.length === 0) {
          stageId = "no-show";
        } else if (completedCount === 0) {
          stageId = upcoming.length > 0 ? "reserved" : "reserved";
        } else if (completedCount >= 5) {
          stageId = upcoming.length > 0 ? "visit-5-done" : "completed";
        } else {
          // 1..4 completed
          stageId =
            upcoming.length > 0
              ? `between-${completedCount}-${completedCount + 1}`
              : `visit-${completedCount}-done`;
        }

        const totalValue = list.reduce((acc, a) => acc + (Number(a.price) || 0), 0);
        const serviceName =
          (lastCompleted?.services as { name?: string } | null)?.name ||
          (nextUpcoming?.services as { name?: string } | null)?.name ||
          (list[0]?.services as { name?: string } | null)?.name ||
          "—";

        result.push({
          id: c.id,
          firstName: c.first_name,
          lastName: c.last_name,
          email: c.email || "",
          phone: c.phone || "",
          stageId,
          serviceName,
          packageType: completedCount >= 5 ? "Pełny cykl" : `${list.length} wizyt`,
          totalVisits: list.length,
          completedVisits: completedCount,
          nextVisitDate: nextUpcoming?.start_time?.slice(0, 10),
          lastVisitDate: lastCompleted?.start_time?.slice(0, 10),
          reservationDate: list[0].start_time.slice(0, 10),
          value: totalValue,
          tags: c.tags || [],
          surveys: [],
          history: [],
        });
      }

      return result;
    },
  });
}
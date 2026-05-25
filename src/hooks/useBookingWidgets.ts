import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useSalonId } from "./useSalonId";
import type {
  BookingWidget,
  WidgetTheme,
  FormFieldConfig,
  WidgetStep,
  WidgetPromotion,
  WidgetPrepayment,
  WidgetAdvancedSettings,
} from "@/components/admin/widgets/types";

type Row = {
  id: string;
  salon_id: string;
  name: string;
  slug: string;
  description: string | null;
  type: "main" | "campaign" | "promo";
  is_active: boolean;
  show_all_services: boolean;
  service_ids: string[];
  theme: WidgetTheme;
  form_fields: FormFieldConfig[];
  steps: WidgetStep[];
  promotion: WidgetPromotion | null;
  prepayment: WidgetPrepayment | null;
  advanced_settings: WidgetAdvancedSettings | null;
  view_count: number;
  booking_count: number;
  created_at: string;
  updated_at: string;
};

function rowToWidget(r: Row): BookingWidget {
  return {
    id: r.id,
    name: r.name,
    slug: r.slug,
    salonId: r.salon_id,
    description: r.description || undefined,
    type: r.type,
    isActive: r.is_active,
    services: r.service_ids || [],
    showAllServices: r.show_all_services,
    theme: r.theme,
    formFields: r.form_fields || [],
    steps: r.steps || [],
    promotion: r.promotion || undefined,
    prepayment: r.prepayment || undefined,
    advancedSettings: r.advanced_settings || undefined,
    viewCount: r.view_count,
    bookingCount: r.booking_count,
    createdAt: new Date(r.created_at),
    updatedAt: new Date(r.updated_at),
  };
}

function widgetToRow(w: BookingWidget, salonId: string) {
  return {
    salon_id: salonId,
    name: w.name,
    slug: w.slug,
    description: w.description ?? null,
    type: w.type,
    is_active: w.isActive,
    show_all_services: w.showAllServices,
    service_ids: w.services || [],
    theme: w.theme as any,
    form_fields: w.formFields as any,
    steps: w.steps as any,
    promotion: (w.promotion as any) ?? null,
    prepayment: (w.prepayment as any) ?? null,
    advanced_settings: (w.advancedSettings as any) ?? null,
  };
}

export function useBookingWidgets(enabled = true) {
  const { salonId } = useSalonId();
  return useQuery({
    queryKey: ["booking-widgets", salonId],
    enabled: enabled && !!salonId,
    queryFn: async (): Promise<BookingWidget[]> => {
      const { data, error } = await supabase
        .from("booking_widgets" as any)
        .select("*")
        .eq("salon_id", salonId!)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return ((data || []) as unknown as Row[]).map(rowToWidget);
    },
  });
}

export function useUpsertBookingWidget() {
  const { salonId } = useSalonId();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (widget: BookingWidget) => {
      if (!salonId) throw new Error("No salon");
      const payload = widgetToRow(widget, salonId);
      // detect "new" widget: id is missing or looks like a temp/timestamp string
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        widget.id || "",
      );
      if (isUuid) {
        const { data, error } = await supabase
          .from("booking_widgets" as any)
          .update(payload)
          .eq("id", widget.id)
          .select()
          .single();
        if (error) throw error;
        return rowToWidget(data as unknown as Row);
      }
      const { data, error } = await supabase
        .from("booking_widgets" as any)
        .insert(payload)
        .select()
        .single();
      if (error) throw error;
      return rowToWidget(data as unknown as Row);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["booking-widgets", salonId] }),
  });
}

export function useDeleteBookingWidget() {
  const { salonId } = useSalonId();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("booking_widgets" as any).delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["booking-widgets", salonId] }),
  });
}
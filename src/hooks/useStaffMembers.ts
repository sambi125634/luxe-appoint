import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useSalonId } from "./useSalonId";

export interface StaffMemberData {
  id: string;
  name: string;
  role: string | null;
  email: string | null;
  phone: string | null;
  color: string | null;
  avatar_url: string | null;
  is_active: boolean;
  contract_type: string | null;
  commission_rate: number | null;
  certifications: string[] | null;
  visible_in_widget: boolean;
  break_start: string | null;
  break_duration: number | null;
  bio: string | null;
  specializations: unknown[] | null;
  started_at: string | null;
  compensation_type: string | null;
  base_salary: number | null;
  hourly_rate: number | null;
  salary_bonus_threshold: number | null;
  salary_bonus_rate: number | null;
  flat_rate_per_service: number | null;
}

export function useStaffMembers() {
  const { salonId } = useSalonId();

  return useQuery({
    queryKey: ["staff-members", salonId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("staff_members")
        .select("id, name, role, email, phone, color, avatar_url, is_active, contract_type, commission_rate, certifications, visible_in_widget, break_start, break_duration, bio, specializations, started_at, compensation_type, base_salary, hourly_rate, salary_bonus_threshold, salary_bonus_rate, flat_rate_per_service")
        .eq("salon_id", salonId!)
        .eq("is_active", true)
        .order("name");

      if (error) throw error;
      return data as StaffMemberData[];
    },
    enabled: !!salonId,
  });
}

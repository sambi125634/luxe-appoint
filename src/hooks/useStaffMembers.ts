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
}

export function useStaffMembers() {
  const { salonId } = useSalonId();

  return useQuery({
    queryKey: ["staff-members", salonId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("staff_members")
        .select("id, name, role, email, phone, color, avatar_url, is_active")
        .eq("salon_id", salonId!)
        .eq("is_active", true)
        .order("name");

      if (error) throw error;
      return data as StaffMemberData[];
    },
    enabled: !!salonId,
  });
}

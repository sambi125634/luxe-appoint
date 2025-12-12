import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useSalonId() {
  const salonQuery = useQuery({
    queryKey: ["user-salon"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      // First try to find salon where user is owner
      const { data: ownedSalon, error: ownerError } = await supabase
        .from("salons")
        .select("id")
        .eq("owner_id", user.id)
        .maybeSingle();

      if (ownerError) throw ownerError;
      if (ownedSalon) return ownedSalon.id;

      // If not owner, try to find salon where user is staff member
      const { data: staffMember, error: staffError } = await supabase
        .from("staff_members")
        .select("salon_id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (staffError) throw staffError;
      if (staffMember) return staffMember.salon_id;

      return null;
    },
  });

  return {
    salonId: salonQuery.data,
    isLoading: salonQuery.isLoading,
    error: salonQuery.error,
  };
}

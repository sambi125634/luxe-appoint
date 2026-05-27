import { useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Loader2, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function ReferralRedirectPage() {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["referral-redirect", code],
    queryFn: async () => {
      if (!code) return null;
      const { data: codeRow, error } = await supabase
        .from("user_referral_codes")
        .select("code, salon_id, is_active")
        .eq("code", code)
        .eq("is_active", true)
        .maybeSingle();
      if (error) throw error;
      if (!codeRow) return null;

      const { data: salon } = await supabase
        .from("salons")
        .select("slug, is_active")
        .eq("id", codeRow.salon_id)
        .eq("is_active", true)
        .maybeSingle();

      if (!salon?.slug) return null;
      return { slug: salon.slug, code: codeRow.code };
    },
    enabled: !!code,
    retry: false,
  });

  useEffect(() => {
    if (data?.slug && data?.code) {
      navigate(`/join/${data.slug}?ref=${data.code}`, { replace: true });
    }
  }, [data, navigate]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background px-4">
        <Card className="w-full max-w-sm border-border/50">
          <CardContent className="flex flex-col items-center text-center py-10 px-6">
            <AlertCircle className="h-10 w-10 text-muted-foreground mb-3" />
            <h2 className="text-lg font-semibold text-foreground mb-2">
              Link wygasł lub jest nieprawidłowy
            </h2>
            <p className="text-sm text-muted-foreground mb-6">
              Ten link polecający nie jest już aktywny. Skontaktuj się z osobą, która Ci go wysłała,
              aby otrzymać nowy.
            </p>
            <Button asChild className="w-full">
              <Link to="/">Wróć do strony głównej</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );
}
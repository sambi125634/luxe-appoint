import { useState, useEffect } from "react";
import { Gift, Copy, Share2, Check, Users, Trophy, Loader2, AlertCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useReferralCode, useReferralStats, useReferralHistory } from "@/hooks/useUserReferral";
import { buildReferralUrl } from "@/lib/referralUrl";

function useCurrentSalonId() {
  return useQuery({
    queryKey: ["client-current-salon"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data } = await supabase
        .from("client_salon_links")
        .select("salon_id, salons(slug)")
        .eq("user_id", user.id)
        .limit(1)
        .maybeSingle();

      if (!data) return null;
      const salon = data.salons as unknown as { slug: string } | null;
      return { salonId: data.salon_id, slug: salon?.slug ?? "" };
    },
  });
}

function useProfileFirstName() {
  return useQuery({
    queryKey: ["client-profile-name"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return "USER";
      const { data } = await supabase
        .from("profiles")
        .select("first_name")
        .eq("id", user.id)
        .maybeSingle();
      return data?.first_name ?? "USER";
    },
  });
}

export function ReferFriend() {
  const [copied, setCopied] = useState(false);

  const { data: salonInfo, isLoading: salonLoading } = useCurrentSalonId();
  const salonId = salonInfo?.salonId ?? null;
  const salonSlug = salonInfo?.slug ?? "";

  const { code: referralCodeData, isLoading: codeLoading, createCode } = useReferralCode(salonId);
  const { data: stats, isLoading: statsLoading } = useReferralStats(salonId);
  const { data: history, isLoading: historyLoading } = useReferralHistory(salonId);
  const { data: firstName } = useProfileFirstName();

  // Auto-create code if none exists
  useEffect(() => {
    if (salonId && !codeLoading && !referralCodeData && firstName && !createCode.isPending) {
      createCode.mutate({ firstName });
    }
  }, [salonId, codeLoading, referralCodeData, firstName, createCode]);

  const referralCode = referralCodeData?.code ?? "";
  const referralUrl = `https://beautycalendar.pl/join/${salonSlug}?ref=${referralCode}`;

  const isLoading = salonLoading || codeLoading || statsLoading;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(referralUrl);
      setCopied(true);
      toast.success("Link skopiowany!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Nie udało się skopiować");
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Dołącz do mojego salonu!",
          text: "Zarezerwuj wizytę i zyskaj rabat na pierwszy zabieg 💅",
          url: referralUrl,
        });
      } catch {
        // User cancelled share
      }
    } else {
      handleCopy();
    }
  };

  if (!salonLoading && !salonId) {
    return (
      <div className="px-4 pt-6 pb-24 flex flex-col items-center justify-center min-h-[60vh]">
        <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
        <h2 className="text-lg font-bold text-foreground mb-2">Brak salonu</h2>
        <p className="text-sm text-muted-foreground text-center">
          Dołącz do salonu, aby otrzymać swój kod polecający
        </p>
      </div>
    );
  }

  return (
    <div className="px-4 pt-6 pb-24">
      <h1 className="text-2xl font-bold text-foreground mb-1">Poleć znajomej</h1>
      <p className="text-sm text-muted-foreground mb-6">
        Za każde polecenie zyskujesz punkty lojalnościowe
      </p>

      {/* Stats cards */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {isLoading ? (
          <>
            <Skeleton className="h-24 rounded-2xl" />
            <Skeleton className="h-24 rounded-2xl" />
            <Skeleton className="h-24 rounded-2xl" />
          </>
        ) : (
          <>
            <Card className="border-border/40 rounded-2xl">
              <CardContent className="p-3 text-center">
                <Users className="h-5 w-5 text-primary mx-auto mb-1" />
                <p className="text-xl font-bold text-foreground">{stats?.totalReferrals ?? 0}</p>
                <p className="text-[10px] text-muted-foreground">Polecenia</p>
              </CardContent>
            </Card>
            <Card className="border-border/40 rounded-2xl">
              <CardContent className="p-3 text-center">
                <Trophy className="h-5 w-5 text-primary mx-auto mb-1" />
                <p className="text-xl font-bold text-foreground">{stats?.totalPointsEarned ?? 0}</p>
                <p className="text-[10px] text-muted-foreground">Zdobyte pkt</p>
              </CardContent>
            </Card>
            <Card className="border-border/40 rounded-2xl">
              <CardContent className="p-3 text-center">
                <Gift className="h-5 w-5 text-primary mx-auto mb-1" />
                <p className="text-xl font-bold text-foreground">{stats?.pendingReferrals ?? 0}</p>
                <p className="text-[10px] text-muted-foreground">Oczekujące</p>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Referral code card */}
      <Card className="border-primary/20 rounded-2xl mb-6 bg-gradient-to-br from-primary/5 to-primary/10">
        <CardContent className="p-5">
          <p className="text-sm font-medium text-muted-foreground mb-2">Twój kod polecający</p>
          {isLoading ? (
            <Skeleton className="h-14 rounded-xl mb-4" />
          ) : (
            <div className="flex items-center gap-3 mb-4">
              <div className="flex-1 bg-background border border-border rounded-xl px-4 py-3 font-mono text-lg font-bold text-foreground tracking-wider text-center">
                {referralCode || "..."}
              </div>
              <Button
                variant="outline"
                size="icon"
                className="h-12 w-12 rounded-xl shrink-0"
                onClick={handleCopy}
                disabled={!referralCode}
              >
                {copied ? <Check className="h-5 w-5 text-primary" /> : <Copy className="h-5 w-5" />}
              </Button>
            </div>
          )}
          <Button
            className="w-full h-12 rounded-xl font-semibold"
            onClick={handleShare}
            disabled={!referralCode}
          >
            <Share2 className="h-4 w-4 mr-2" />
            Udostępnij link
          </Button>
        </CardContent>
      </Card>

      {/* How it works */}
      <div className="mb-6">
        <h2 className="font-bold text-foreground mb-3">Jak to działa?</h2>
        <div className="space-y-3">
          {[
            { step: "1", text: "Udostępnij link znajomej" },
            { step: "2", text: "Znajoma rezerwuje pierwszą wizytę" },
            { step: "3", text: "Obie zyskujecie 50 pkt lojalnościowych 🎉" },
          ].map((item) => (
            <div key={item.step} className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <span className="text-sm font-bold text-primary">{item.step}</span>
              </div>
              <p className="text-sm text-foreground">{item.text}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Referral history */}
      <div>
        <h2 className="font-bold text-foreground mb-3">Historia poleceń</h2>
        {historyLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-16 rounded-2xl" />
            <Skeleton className="h-16 rounded-2xl" />
          </div>
        ) : !history || history.length === 0 ? (
          <Card className="border-border/40 rounded-2xl">
            <CardContent className="p-6 text-center">
              <Users className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Jeszcze nikogo nie poleciłaś</p>
              <p className="text-xs text-muted-foreground mt-1">Udostępnij swój link, aby zacząć!</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {history.map((ref) => {
              const statusLabel =
                ref.status === "rewarded"
                  ? "Nagroda wypłacona"
                  : ref.status === "completed"
                    ? "Wizyta ukończona"
                    : "Oczekuje";
              const statusVariant =
                ref.status === "rewarded"
                  ? "default"
                  : ref.status === "completed"
                    ? "secondary"
                    : "outline";

              return (
                <Card key={ref.id} className="border-border/40 rounded-2xl">
                  <CardContent className="flex items-center justify-between p-4">
                    <div>
                      <p className="text-sm font-medium text-foreground">{ref.referredName}</p>
                      <p className="text-xs text-muted-foreground">
                        {ref.maskedPhone} · {new Date(ref.referred_at).toLocaleDateString("pl-PL")}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-primary">{ref.reward_points} pkt</span>
                      <Badge variant={statusVariant as "default" | "secondary" | "outline"} className="text-[10px]">
                        {statusLabel}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

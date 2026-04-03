import { Gift, Star, Ticket, ChevronRight, Sparkles, Trophy } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useLoyaltyStamps, useClientCoupons } from "@/hooks/useClientLoyalty";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { pl } from "date-fns/locale";

export function ForYou() {
  const { data: loyalty, isLoading: loyaltyLoading } = useLoyaltyStamps();
  const { data: coupons = [], isLoading: couponsLoading } = useClientCoupons();
  const navigate = useNavigate();

  const totalPoints = loyalty?.totalPoints ?? 0;
  const visitsCount = loyalty?.visitsCount ?? 0;
  const nextRewardAt = 500;
  const progress = Math.min(Math.round((totalPoints / nextRewardAt) * 100), 100);
  const stampsNeeded = 10;
  const stampsFilled = visitsCount % stampsNeeded;

  const isLoading = loyaltyLoading || couponsLoading;

  if (isLoading) {
    return (
      <div className="px-4 pt-6 pb-24 space-y-4">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-40 w-full rounded-2xl" />
        <Skeleton className="h-40 w-full rounded-2xl" />
        <Skeleton className="h-24 w-full rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="px-4 pt-6 pb-24">
      <h1 className="text-2xl font-bold text-foreground mb-1">Dla Ciebie</h1>
      <p className="text-sm text-muted-foreground mb-6">Nagrody, kupony i promocje</p>

      {/* Loyalty progress */}
      <Card className="border-border/40 rounded-2xl mb-4 overflow-hidden bg-gradient-to-br from-primary/5 to-primary/10">
        <CardContent className="p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-primary/15 flex items-center justify-center">
              <Trophy className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-foreground text-base">Program lojalnościowy</h3>
              <p className="text-sm text-muted-foreground">{totalPoints} / {nextRewardAt} pkt do nagrody</p>
            </div>
          </div>
          <Progress value={progress} className="h-3 mb-2" />
          <p className="text-xs text-muted-foreground">
            {totalPoints >= nextRewardAt ? (
              <span className="font-semibold text-primary">🎉 Masz nagrodę do odbioru!</span>
            ) : (
              <>Jeszcze <span className="font-semibold text-primary">{nextRewardAt - totalPoints} pkt</span> do darmowego zabiegu!</>
            )}
          </p>
        </CardContent>
      </Card>

      {/* Stamp card */}
      <Card className="border-border/40 rounded-2xl mb-4 overflow-hidden">
        <CardContent className="p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              <h3 className="font-bold text-foreground">Karta lojalnościowa</h3>
            </div>
            <Badge variant="secondary" className="text-xs">
              {stampsFilled}/{stampsNeeded}
            </Badge>
          </div>
          <div className="grid grid-cols-5 gap-2">
            {Array.from({ length: stampsNeeded }).map((_, i) => (
              <div
                key={i}
                className={`aspect-square rounded-xl flex items-center justify-center transition-all ${
                  i < stampsFilled
                    ? "bg-primary/15 border-2 border-primary/30"
                    : "bg-muted/50 border-2 border-dashed border-border/50"
                }`}
              >
                {i < stampsFilled ? (
                  <Star className="h-5 w-5 text-primary fill-primary/30" />
                ) : (
                  <span className="text-xs text-muted-foreground/50">{i + 1}</span>
                )}
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-3 text-center">
            {stampsNeeded - stampsFilled === 0
              ? "🎉 Darmowy zabieg do odbioru!"
              : `${stampsNeeded - stampsFilled} ${stampsNeeded - stampsFilled === 1 ? "wizyta" : "wizyty"} do darmowego zabiegu 🎉`}
          </p>
        </CardContent>
      </Card>

      {/* Coupons */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-bold text-foreground text-lg">Twoje kupony</h2>
        <Badge variant="outline" className="text-xs">{coupons.length}</Badge>
      </div>

      {coupons.length === 0 ? (
        <Card className="border-border/40 rounded-2xl">
          <CardContent className="p-6 text-center">
            <Ticket className="h-8 w-8 text-muted-foreground/40 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Nie masz jeszcze żadnych kuponów</p>
            <p className="text-xs text-muted-foreground/70 mt-1">Kupony od salonów pojawią się tutaj</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {coupons.map((coupon: any) => (
            <Card
              key={coupon.id}
              className="border-border/40 rounded-2xl overflow-hidden hover:shadow-md transition-all cursor-pointer active:scale-[0.98]"
            >
              <CardContent className="flex items-center gap-4 p-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/20 flex items-center justify-center shrink-0">
                  <Ticket className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-foreground text-sm">{coupon.title}</h3>
                  <p className="text-xs text-muted-foreground">{coupon.salons?.name || "Salon"}</p>
                  {coupon.valid_until && (
                    <p className="text-[11px] text-muted-foreground/70 mt-0.5">
                      Ważny do {format(new Date(coupon.valid_until), "d MMM yyyy", { locale: pl })}
                    </p>
                  )}
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground/50 shrink-0" />
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Referral CTA */}
      <Card className="border-primary/20 rounded-2xl mt-6 overflow-hidden bg-gradient-to-r from-primary/5 to-primary/10">
        <CardContent className="p-5 text-center">
          <Gift className="h-8 w-8 text-primary mx-auto mb-2" />
          <h3 className="font-bold text-foreground mb-1">Poleć znajomej</h3>
          <p className="text-sm text-muted-foreground mb-3">
            Za każde polecenie otrzymasz <span className="font-semibold text-primary">50 pkt</span> lojalnościowych
          </p>
          <button
            onClick={() => navigate("/app/profile/referrals")}
            className="w-full bg-primary text-primary-foreground font-semibold py-3 rounded-xl text-sm active:scale-[0.97] transition-transform"
          >
            Udostępnij link polecający
          </button>
        </CardContent>
      </Card>
    </div>
  );
}

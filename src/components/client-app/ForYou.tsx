import { useState } from "react";
import { Gift, Star, Ticket, ChevronRight, Sparkles, Trophy, Copy, Check, Clock, Award } from "lucide-react";
import { BeautyRhythms } from "@/components/client-app/BeautyRhythms";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
  useLoyaltyPerSalon,
  useLoyaltyRewards,
  useLoyaltyRedemptions,
  useRedeemReward,
  useClientCoupons,
  useClientSalons,
} from "@/hooks/useClientLoyalty";
import { useNavigate } from "react-router-dom";
import { format, differenceInDays } from "date-fns";
import { pl } from "date-fns/locale";
import { motion } from "framer-motion";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

function ProgressRing({ progress, size = 80, stroke = 6 }: { progress: number; size?: number; stroke?: number }) {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (Math.min(progress, 100) / 100) * circumference;

  return (
    <svg width={size} height={size} className="-rotate-90">
      <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="hsl(var(--muted))" strokeWidth={stroke} />
      <motion.circle
        cx={size / 2} cy={size / 2} r={radius} fill="none"
        stroke="hsl(var(--primary))" strokeWidth={stroke} strokeLinecap="round"
        strokeDasharray={circumference}
        initial={{ strokeDashoffset: circumference }}
        animate={{ strokeDashoffset: offset }}
        transition={{ duration: 1.2, ease: "easeOut" }}
      />
    </svg>
  );
}

export function ForYou() {
  const { data: salons = [], isLoading: salonsLoading } = useClientSalons();
  const [selectedSalonId, setSelectedSalonId] = useState<string | null>(null);
  const activeSalonId = selectedSalonId || salons[0]?.id;

  const { data: loyalty, isLoading: loyaltyLoading } = useLoyaltyPerSalon(activeSalonId);
  const { data: rewards = [], isLoading: rewardsLoading } = useLoyaltyRewards(activeSalonId);
  const { data: redemptions = [], isLoading: redemptionsLoading } = useLoyaltyRedemptions(activeSalonId);
  const { data: coupons = [], isLoading: couponsLoading } = useClientCoupons();
  const redeemMutation = useRedeemReward();
  const navigate = useNavigate();

  const [confirmReward, setConfirmReward] = useState<{ id: string; name: string; points: number } | null>(null);
  const [showCode, setShowCode] = useState<{ code: string; expiresAt: string; rewardName: string } | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);
  const [revealedCodes, setRevealedCodes] = useState<Set<string>>(new Set());

  const availablePoints = loyalty?.availablePoints ?? 0;
  const visitsCount = loyalty?.visitsCount ?? 0;
  const nextReward = rewards[0];
  const nextRewardPoints = nextReward?.points_required ?? 500;
  const progress = Math.min(Math.round((availablePoints / nextRewardPoints) * 100), 100);
  const stampsNeeded = 10;
  const stampsFilled = visitsCount % stampsNeeded;
  const pointsValue = (availablePoints * 0.1).toFixed(0);

  const isLoading = salonsLoading || loyaltyLoading || couponsLoading || rewardsLoading || redemptionsLoading;

  const handleRedeem = async () => {
    if (!confirmReward || !activeSalonId) return;
    try {
      const result = await redeemMutation.mutateAsync({
        rewardId: confirmReward.id,
        salonId: activeSalonId,
      });
      setConfirmReward(null);
      setShowCode({
        code: result.redemption.redemption_code,
        expiresAt: result.redemption.expires_at,
        rewardName: confirmReward.name,
      });
      toast.success("Nagroda odebrana! 🎉");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Błąd podczas odbioru nagrody";
      toast.error(msg);
      setConfirmReward(null);
    }
  };

  const copyCode = async (code: string) => {
    await navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  if (isLoading) {
    return (
      <div className="px-4 pt-6 pb-24 space-y-4">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-10 w-full rounded-full" />
        <Skeleton className="h-48 w-full rounded-2xl" />
        <Skeleton className="h-40 w-full rounded-2xl" />
        <Skeleton className="h-24 w-full rounded-2xl" />
      </div>
    );
  }

  if (salons.length === 0) {
    return (
      <div className="px-4 pt-6 pb-24 text-center">
        <Gift className="h-12 w-12 text-muted-foreground/40 mx-auto mb-3" />
        <h2 className="font-bold text-foreground mb-1">Dołącz do salonu</h2>
        <p className="text-sm text-muted-foreground">Aby zbierać punkty lojalnościowe, dołącz do salonu.</p>
      </div>
    );
  }

  return (
    <div className="px-4 pt-6 pb-24">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-foreground mb-1">Dla Ciebie</h1>
        <p className="text-sm text-muted-foreground mb-4">Nagrody, kupony i promocje</p>
      </motion.div>

      {/* Salon selector */}
      {salons.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide">
          {salons.map((salon) => (
            <button
              key={salon.id}
              onClick={() => setSelectedSalonId(salon.id)}
              className={cn(
                "shrink-0 flex items-center gap-2 px-3 py-2 rounded-full text-xs font-medium transition-colors border",
                activeSalonId === salon.id
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-muted text-muted-foreground border-border hover:bg-muted/80"
              )}
            >
              <Avatar className="h-5 w-5">
                <AvatarImage src={salon.logo_url ?? undefined} />
                <AvatarFallback className="text-[9px]">{salon.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <span className="truncate max-w-[120px]">{salon.name}</span>
            </button>
          ))}
        </div>
      )}

      {/* Points card */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <Card className="border-border/40 rounded-2xl mb-4 overflow-hidden bg-gradient-to-br from-primary/5 to-primary/10">
          <CardContent className="p-5">
            <div className="flex items-center gap-4">
              <div className="relative flex items-center justify-center shrink-0">
                <ProgressRing progress={progress} size={80} stroke={6} />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <span className="text-lg font-bold text-primary">{availablePoints}</span>
                    <span className="text-[10px] text-muted-foreground block -mt-0.5">pkt</span>
                  </div>
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <Trophy className="h-4 w-4 text-primary" />
                  <h3 className="font-bold text-foreground text-base">Program lojalnościowy</h3>
                </div>
                <p className="text-xs text-muted-foreground mb-1">
                  = ok. <span className="font-semibold">{pointsValue} zł</span> wartości
                </p>
                <p className="text-sm text-muted-foreground">
                  {availablePoints >= nextRewardPoints ? (
                    <span className="font-semibold text-primary">🎉 Masz nagrodę do odbioru!</span>
                  ) : (
                    <>Jeszcze <span className="font-semibold text-primary">{nextRewardPoints - availablePoints} pkt</span> do {nextReward?.name || "darmowego zabiegu"}</>
                  )}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Stamp card */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <Card className="border-border/40 rounded-2xl mb-4 overflow-hidden">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                <h3 className="font-bold text-foreground">Karta lojalnościowa</h3>
              </div>
              <Badge variant="secondary" className="text-xs">{stampsFilled}/{stampsNeeded}</Badge>
            </div>
            <div className="grid grid-cols-5 gap-2">
              {Array.from({ length: stampsNeeded }).map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.3 + i * 0.04, type: "spring", stiffness: 300 }}
                  className={cn(
                    "aspect-square rounded-xl flex items-center justify-center transition-all",
                    i < stampsFilled
                      ? "bg-primary/15 border-2 border-primary/30"
                      : "bg-muted/50 border-2 border-dashed border-border/50"
                  )}
                >
                  {i < stampsFilled ? (
                    <Star className="h-5 w-5 text-primary fill-primary/30" />
                  ) : (
                    <span className="text-xs text-muted-foreground/50">{i + 1}</span>
                  )}
                </motion.div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-3 text-center">
              {stampsNeeded - stampsFilled === 0
                ? "🎉 Darmowy zabieg do odbioru!"
                : `${stampsNeeded - stampsFilled} ${stampsNeeded - stampsFilled === 1 ? "wizyta" : "wizyty"} do darmowego zabiegu 🎉`}
            </p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Beauty Rhythms */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.22 }} className="mb-4">
        <BeautyRhythms salonId={activeSalonId} />
      </motion.div>

      {/* Available rewards */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
        <h2 className="font-bold text-foreground text-lg mb-3">Dostępne nagrody</h2>
        {rewards.length === 0 ? (
          <Card className="border-border/40 rounded-2xl mb-4">
            <CardContent className="p-6 text-center">
              <Award className="h-8 w-8 text-muted-foreground/40 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Salon konfiguruje właśnie program nagród.</p>
              <p className="text-xs text-muted-foreground/70 mt-1">Zbieraj punkty już teraz! 🌸</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3 mb-4">
            {rewards.map((reward, idx) => {
              const canRedeem = availablePoints >= reward.points_required;
              const deficit = reward.points_required - availablePoints;
              const rewardIcon = reward.reward_type === "free_service" ? Sparkles : reward.reward_type === "product" ? Gift : Star;
              const Icon = rewardIcon;
              return (
                <motion.div key={reward.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 + idx * 0.05 }}>
                  <Card className={cn(
                    "border rounded-2xl overflow-hidden transition-all",
                    canRedeem ? "border-primary/30 bg-primary/5 shadow-sm" : "border-border/40"
                  )}>
                    <CardContent className="p-4 flex items-center gap-3">
                      <div className={cn(
                        "w-11 h-11 rounded-xl flex items-center justify-center shrink-0",
                        canRedeem ? "bg-primary/15" : "bg-muted"
                      )}>
                        <Icon className={cn("h-5 w-5", canRedeem ? "text-primary" : "text-muted-foreground")} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-sm text-foreground">{reward.name}</h4>
                        {reward.description && <p className="text-xs text-muted-foreground truncate">{reward.description}</p>}
                        <p className="text-xs text-muted-foreground mt-0.5">Wymagane: {reward.points_required} pkt</p>
                      </div>
                      <Button
                        size="sm"
                        disabled={!canRedeem || redeemMutation.isPending}
                        onClick={() => setConfirmReward({ id: reward.id, name: reward.name, points: reward.points_required })}
                        className={cn("shrink-0 rounded-xl text-xs", !canRedeem && "opacity-50")}
                      >
                        {canRedeem ? "Odbierz" : `Brakuje ${deficit} pkt`}
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}
      </motion.div>

      {/* Active redemptions */}
      {redemptions.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
          <h2 className="font-bold text-foreground text-lg mb-3">Moje aktywne nagrody</h2>
          <div className="space-y-3 mb-4">
            {redemptions.map((r) => {
              const daysLeft = differenceInDays(new Date(r.expires_at), new Date());
              const isExpiringSoon = daysLeft <= 7;
              const isRevealed = revealedCodes.has(r.id);
              const maskedCode = r.redemption_code.slice(0, 4) + "****" + r.redemption_code.slice(-4);
              const rewardData = r.loyalty_rewards as { name: string; description: string | null; reward_type: string } | null;
              return (
                <Card key={r.id} className="border-border/40 rounded-2xl overflow-hidden">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-sm text-foreground">{rewardData?.name ?? "Nagroda"}</h4>
                      <Badge variant={r.status === "pending" ? "secondary" : "default"} className="text-[10px]">
                        {r.status === "pending" ? "Oczekuje" : r.status === "confirmed" ? "Potwierdzona" : "Wykorzystana"}
                      </Badge>
                    </div>
                    <button
                      onClick={() => setRevealedCodes(prev => {
                        const next = new Set(prev);
                        if (next.has(r.id)) next.delete(r.id); else next.add(r.id);
                        return next;
                      })}
                      className="font-mono text-lg tracking-wider text-primary font-bold mb-1"
                    >
                      {isRevealed ? r.redemption_code : maskedCode}
                    </button>
                    <p className={cn("text-xs", isExpiringSoon ? "text-destructive font-medium" : "text-muted-foreground")}>
                      <Clock className="h-3 w-3 inline mr-1" />
                      Ważna do {format(new Date(r.expires_at), "d MMM yyyy", { locale: pl })}
                      {isExpiringSoon && ` (${daysLeft} dni)`}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* Coupons */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
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
            {coupons.map((coupon: Record<string, unknown>, idx: number) => (
              <motion.div key={coupon.id as string} initial={{ opacity: 0, x: -15 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.35 + idx * 0.06 }}>
                <Card className="border-border/40 rounded-2xl overflow-hidden hover:shadow-md transition-all cursor-pointer active:scale-[0.98]">
                  <CardContent className="flex items-center gap-4 p-4">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/20 flex items-center justify-center shrink-0">
                      <Ticket className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-foreground text-sm">{coupon.title as string}</h3>
                      <p className="text-xs text-muted-foreground">{(coupon.salons as Record<string, string> | null)?.name || "Salon"}</p>
                      {coupon.valid_until && (
                        <p className="text-[11px] text-muted-foreground/70 mt-0.5">
                          Ważny do {format(new Date(coupon.valid_until as string), "d MMM yyyy", { locale: pl })}
                        </p>
                      )}
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground/50 shrink-0" />
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Referral CTA */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
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
      </motion.div>

      {/* Confirm dialog */}
      <AlertDialog open={!!confirmReward} onOpenChange={() => setConfirmReward(null)}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Odbierz nagrodę</AlertDialogTitle>
            <AlertDialogDescription>
              Czy chcesz wymienić <span className="font-semibold">{confirmReward?.points} punktów</span> na{" "}
              <span className="font-semibold">{confirmReward?.name}</span>?
              <br />
              <span className="text-xs mt-2 block">
                Twoje saldo: {availablePoints} pkt → po wymianie: {availablePoints - (confirmReward?.points ?? 0)} pkt
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">Anuluj</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRedeem}
              disabled={redeemMutation.isPending}
              className="rounded-xl"
            >
              {redeemMutation.isPending ? "Przetwarzanie..." : "Tak, odbierz"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Code modal */}
      <AlertDialog open={!!showCode} onOpenChange={() => setShowCode(null)}>
        <AlertDialogContent className="rounded-2xl text-center">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-center">🎉 Nagroda odebrana!</AlertDialogTitle>
            <AlertDialogDescription className="text-center">
              <span className="block text-sm mb-4">{showCode?.rewardName}</span>
              <span className="block font-mono text-2xl tracking-widest text-primary font-bold bg-primary/5 rounded-xl py-4 px-6 border-2 border-dashed border-primary/20">
                {showCode?.code}
              </span>
              <span className="block text-xs text-muted-foreground mt-3">
                Pokaż ten kod specjalistce przy kasie
              </span>
              {showCode?.expiresAt && (
                <span className="block text-xs text-muted-foreground mt-1">
                  Ważny do: {format(new Date(showCode.expiresAt), "d MMMM yyyy", { locale: pl })}
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col gap-2 sm:flex-col">
            <Button
              onClick={() => showCode && copyCode(showCode.code)}
              variant="outline"
              className="w-full rounded-xl"
            >
              {copiedCode ? <Check className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
              {copiedCode ? "Skopiowano!" : "Kopiuj kod"}
            </Button>
            <AlertDialogAction onClick={() => setShowCode(null)} className="w-full rounded-xl">
              Zamknij
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

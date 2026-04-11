import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Star, Gift, Crown, Heart, Plus } from "lucide-react";
import { DEMO_LOYALTY_REWARDS } from "../demo/demoData";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

interface LoyaltySectionProps {
  isDemo: boolean;
  salonId: string | null | undefined;
}

export function LoyaltySection({ isDemo, salonId }: LoyaltySectionProps) {
  const [showAddReward, setShowAddReward] = useState(false);
  const [rewardName, setRewardName] = useState("");
  const [rewardPoints, setRewardPoints] = useState(200);
  const [rewardType, setRewardType] = useState("discount");
  const [rewardValue, setRewardValue] = useState(20);

  const { data: rewards, isLoading } = useQuery({
    queryKey: ["admin-loyalty-rewards", salonId],
    queryFn: async () => {
      if (!salonId) return [];
      const { data } = await supabase
        .from("loyalty_rewards")
        .select("*")
        .eq("salon_id", salonId)
        .order("points_required", { ascending: true });
      return data ?? [];
    },
    enabled: !!salonId && !isDemo,
  });

  const displayRewards = isDemo ? DEMO_LOYALTY_REWARDS : (rewards ?? []);

  const handleAddReward = async () => {
    if (!rewardName.trim()) return;
    if (!isDemo && salonId) {
      await supabase.from("loyalty_rewards").insert({
        salon_id: salonId,
        name: rewardName,
        points_required: rewardPoints,
        reward_type: rewardType,
        reward_value: rewardValue,
      });
      toast.success("Nagroda dodana ✓");
    } else {
      toast.success("Nagroda dodana (tryb demo)");
    }
    setShowAddReward(false);
    setRewardName("");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Star className="w-5 h-5" />
          Program lojalnościowy
        </CardTitle>
        <CardDescription>Nagradzaj klientki za wizyty i polecenia</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Points config */}
        <div className="space-y-3">
          <Label className="text-sm font-semibold">Jak klientki zdobywają punkty?</Label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="flex items-center gap-2 text-sm">
              <Input type="number" defaultValue={10} className="w-16 text-center" min={1} />
              <span className="text-muted-foreground">punktów za każdą wizytę</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Input type="number" defaultValue={50} className="w-16 text-center" min={1} />
              <span className="text-muted-foreground">punktów za polecenie</span>
            </div>
          </div>
          <div className="rounded-lg bg-muted/50 p-3 text-sm text-muted-foreground">
            💡 Za wizytę wartą 150 zł klientka dostanie ok. 25 pkt = 2.50 zł wartości
          </div>
        </div>

        {/* Rewards list */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-semibold">Nagrody</Label>
            <Button variant="outline" size="sm" className="gap-1" onClick={() => setShowAddReward(true)}>
              <Plus className="w-3 h-3" />
              Dodaj nagrodę
            </Button>
          </div>

          {!isDemo && isLoading ? (
            <div className="space-y-2">
              {[1, 2].map((i) => <Skeleton key={i} className="h-16 rounded-xl" />)}
            </div>
          ) : displayRewards.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground text-sm">
              <Gift className="w-8 h-8 mx-auto mb-2 opacity-40" />
              <p>Dodaj nagrody, które klientki mogą odbierać za punkty</p>
            </div>
          ) : (
            <div className="space-y-2">
              {displayRewards.map((r) => (
                <div key={r.id} className="flex items-center justify-between p-3 rounded-xl border">
                  <div className="flex items-center gap-3">
                    <Gift className="w-5 h-5 text-primary" />
                    <div>
                      <p className="text-sm font-medium">{r.name}</p>
                      <p className="text-xs text-muted-foreground">Wymagane: {r.points_required} pkt</p>
                    </div>
                  </div>
                  <Badge variant={r.is_active ? "default" : "secondary"}>
                    {r.is_active ? "Aktywna" : "Wył."}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* VIP section */}
        <div className="space-y-3 border-t pt-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Crown className="w-4 h-4 text-[#D4537E]" />
              <Label className="text-sm font-semibold">Program VIP</Label>
            </div>
            <Switch defaultChecked />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs">VIP po wizytach</Label>
              <Input type="number" defaultValue={5} min={2} max={20} className="text-center" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Wczesny dostęp (h)</Label>
              <Input type="number" defaultValue={24} min={2} max={48} className="text-center" />
            </div>
          </div>
        </div>

        {/* Referral section */}
        <div className="space-y-3 border-t pt-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Heart className="w-4 h-4 text-[#D4537E]" />
              <Label className="text-sm font-semibold">Program poleceń</Label>
            </div>
            <Switch defaultChecked />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs">Punkty za polecenie</Label>
              <Input type="number" defaultValue={50} min={10} className="text-center" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Zniżka dla nowej (%)</Label>
              <Input type="number" defaultValue={10} min={5} max={50} className="text-center" />
            </div>
          </div>
        </div>
      </CardContent>

      <Dialog open={showAddReward} onOpenChange={setShowAddReward}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Dodaj nagrodę</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Nazwa nagrody</Label>
              <Input value={rewardName} onChange={(e) => setRewardName(e.target.value)} placeholder="np. Darmowy manicure" />
            </div>
            <div className="space-y-2">
              <Label>Ile punktów wymagane</Label>
              <Input type="number" value={rewardPoints} onChange={(e) => setRewardPoints(Number(e.target.value))} min={50} />
            </div>
            <div className="space-y-2">
              <Label>Typ nagrody</Label>
              <Select value={rewardType} onValueChange={setRewardType}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="discount">Zniżka %</SelectItem>
                  <SelectItem value="amount">Zniżka kwota</SelectItem>
                  <SelectItem value="free_service">Darmowa usługa</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {rewardType !== "free_service" && (
              <div className="space-y-2">
                <Label>Wartość</Label>
                <Input type="number" value={rewardValue} onChange={(e) => setRewardValue(Number(e.target.value))} />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddReward(false)}>Anuluj</Button>
            <Button onClick={handleAddReward}>Dodaj nagrodę</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

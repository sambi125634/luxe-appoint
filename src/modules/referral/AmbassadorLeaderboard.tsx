import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Crown, Trophy, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";

interface AmbassadorLeaderboardProps {
  isDemo?: boolean;
}

const mockAmbassadors = [
  { id: "1", name: "Kasia Wiśniewska", referrals: 8, revenue: 4100, rewardsEarned: 400, rank: 1 },
  { id: "2", name: "Anna Kowalska", referrals: 5, revenue: 2400, rewardsEarned: 250, rank: 2 },
  { id: "3", name: "Maria Nowak", referrals: 3, revenue: 1200, rewardsEarned: 150, rank: 3 },
  { id: "4", name: "Ola Zielińska", referrals: 1, revenue: 350, rewardsEarned: 50, rank: 4 },
  { id: "5", name: "Ewa Jankowska", referrals: 1, revenue: 280, rewardsEarned: 50, rank: 5 },
];

const rankColors = ["text-yellow-500", "text-slate-400", "text-amber-700"];
const rankBgs = ["from-yellow-500/10 to-yellow-500/5", "from-slate-400/10 to-slate-400/5", "from-amber-700/10 to-amber-700/5"];

export function AmbassadorLeaderboard({ isDemo }: AmbassadorLeaderboardProps) {
  const ambassadors = isDemo ? mockAmbassadors : [];
  const totalRevenue = ambassadors.reduce((s, a) => s + a.revenue, 0);
  const totalRewards = ambassadors.reduce((s, a) => s + a.rewardsEarned, 0);

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="border-border">
          <CardContent className="p-4 text-center">
            <TrendingUp className="w-5 h-5 text-green-500 mx-auto mb-1" />
            <p className="text-xl font-bold">{totalRevenue.toLocaleString()} zł</p>
            <p className="text-xs text-muted-foreground">Łączny przychód z poleceń</p>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardContent className="p-4 text-center">
            <Crown className="w-5 h-5 text-primary mx-auto mb-1" />
            <p className="text-xl font-bold">{totalRevenue > 0 && totalRewards > 0 ? `${((totalRevenue / totalRewards)).toFixed(1)}x` : "—"}</p>
            <p className="text-xs text-muted-foreground">ROI (przychód / benefity)</p>
          </CardContent>
        </Card>
      </div>

      {/* Leaderboard */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Trophy className="w-4 h-4 text-yellow-500" />
            Top 10 Ambasadorek Salonu
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-border">
            {ambassadors.map((amb, idx) => (
              <motion.div
                key={amb.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.06 }}
                className={`px-4 py-3 flex items-center gap-3 ${idx < 3 ? `bg-gradient-to-r ${rankBgs[idx]}` : ""}`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${idx < 3 ? rankColors[idx] : "text-muted-foreground"}`}>
                  {idx < 3 ? <Crown className="w-5 h-5" /> : `#${amb.rank}`}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{amb.name}</p>
                  <p className="text-xs text-muted-foreground">{amb.referrals} poleceń • benefity: {amb.rewardsEarned} zł</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-green-600">{amb.revenue.toLocaleString()} zł</p>
                  <p className="text-xs text-muted-foreground">przychód</p>
                </div>
              </motion.div>
            ))}
          </div>
          {ambassadors.length === 0 && (
            <div className="p-8 text-center text-muted-foreground text-sm">
              Brak ambasadorek. System automatycznie aktywuje klientki po 5. wizycie.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Cost breakdown */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Koszt pozyskania vs wartość</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Koszt pozyskania z poleceń</span>
              <Badge variant="outline" className="text-green-600 border-green-200">0 zł</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Wartość wydanych benefitów</span>
              <span className="text-sm font-medium">{totalRewards.toLocaleString()} zł</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Wartość rezerwacji z poleceń</span>
              <span className="text-sm font-semibold text-green-600">{totalRevenue.toLocaleString()} zł</span>
            </div>
            <div className="border-t border-border pt-3 flex justify-between items-center">
              <span className="text-sm font-medium">Zysk netto z poleceń</span>
              <span className="text-sm font-bold text-green-600">{(totalRevenue - totalRewards).toLocaleString()} zł</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

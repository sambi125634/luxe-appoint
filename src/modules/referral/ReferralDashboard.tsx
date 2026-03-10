import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link2, Copy, ExternalLink, Users, TrendingUp, Gift } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

interface ReferralDashboardProps {
  isDemo?: boolean;
}

const mockReferralCodes = [
  { id: "1", clientName: "Anna Kowalska", code: "ANNA2K", referrals: 5, revenue: 2400, rewardType: "discount", rewardValue: 50 },
  { id: "2", clientName: "Maria Nowak", code: "MARIA7", referrals: 3, revenue: 1200, rewardType: "discount", rewardValue: 50 },
  { id: "3", clientName: "Kasia Wiśniewska", code: "KASIA9", referrals: 8, revenue: 4100, rewardType: "free_service", rewardValue: 0 },
  { id: "4", clientName: "Ola Zielińska", code: "OLA4Z", referrals: 1, revenue: 350, rewardType: "discount", rewardValue: 50 },
];

const mockRecentEvents = [
  { id: "1", referrerName: "Kasia Wiśniewska", referredName: "Nowa klientka", type: "booking", date: "dzisiaj", revenue: 280 },
  { id: "2", referrerName: "Anna Kowalska", referredName: "Nowa klientka", type: "click", date: "wczoraj", revenue: 0 },
  { id: "3", referrerName: "Maria Nowak", referredName: "Joanna Lewandowska", type: "booking", date: "2 dni temu", revenue: 450 },
];

export function ReferralDashboard({ isDemo }: ReferralDashboardProps) {
  const referralCodes = isDemo ? mockReferralCodes : [];
  const recentEvents = isDemo ? mockRecentEvents : [];

  const handleCopyLink = (code: string) => {
    navigator.clipboard.writeText(`calendar.beauty-funnels.com/salon/demo?ref=${code}`);
    toast.success("Link skopiowany do schowka!");
  };

  return (
    <div className="space-y-6">
      {/* Referral Codes */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Link2 className="w-4 h-4" />
              Kody polecające klientek
            </CardTitle>
            <Badge variant="outline" className="text-xs">{referralCodes.length} aktywnych</Badge>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-border">
            {referralCodes.map((code, idx) => (
              <motion.div
                key={code.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="px-4 py-3"
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-xs font-bold text-primary-foreground">
                    {code.referrals}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{code.clientName}</p>
                    <div className="flex items-center gap-2">
                      <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">{code.code}</code>
                      <Button size="sm" variant="ghost" className="h-5 w-5 p-0" onClick={() => handleCopyLink(code.code)}>
                        <Copy className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-green-600">{code.revenue.toLocaleString()} zł</p>
                    <p className="text-xs text-muted-foreground">{code.referrals} poleceń</p>
                  </div>
                </div>
                <div className="flex gap-2 ml-11">
                  <Badge variant="outline" className="text-xs">
                    <Gift className="w-3 h-3 mr-1" />
                    {code.rewardType === "discount" ? `-${code.rewardValue} zł` : "Darmowa usługa"}
                  </Badge>
                </div>
              </motion.div>
            ))}
          </div>
          {referralCodes.length === 0 && (
            <div className="p-8 text-center text-muted-foreground text-sm">
              Brak aktywnych kodów polecających. System automatycznie wygeneruje kody dla kwalifikujących się klientek.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Events */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Ostatnie zdarzenia
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-border">
            {recentEvents.map((event) => (
              <div key={event.id} className="px-4 py-3 flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full ${event.type === "booking" ? "bg-green-500" : "bg-yellow-500"}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm">
                    <span className="font-medium">{event.referrerName}</span>
                    {" → "}
                    <span className="text-muted-foreground">{event.referredName}</span>
                  </p>
                  <p className="text-xs text-muted-foreground">{event.date}</p>
                </div>
                <Badge variant={event.type === "booking" ? "default" : "outline"} className="text-xs">
                  {event.type === "booking" ? `+${event.revenue} zł` : "Kliknięcie"}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Referral Message Template */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Wiadomość aktywacyjna (po 5. wizycie)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="p-3 rounded-lg bg-muted/50 border border-border">
            <p className="text-sm">
              "[Imię], jesteś jedną z naszych ulubionych klientek! Stworzyłam dla Ciebie specjalny link polecający — każda znajoma która przyjdzie przez Twój link, Ty dostajesz [benefit]. Twój link: [url] Udostępnij gdzie chcesz 💕"
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

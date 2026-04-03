import { useState } from "react";
import { Gift, Copy, Share2, Check, Users, Trophy } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

export function ReferFriend() {
  const [copied, setCopied] = useState(false);

  // Demo data — will connect to referral_codes table
  const referralCode = "ANNA2026";
  const referralUrl = `https://beautycalendar.pl/ref/${referralCode}`;
  const totalReferrals = 3;
  const pendingRewards = 1;
  const earnedPoints = 150;

  const referrals = [
    { id: "1", name: "Kasia M.", status: "completed", reward: "50 pkt", date: "28.03.2026" },
    { id: "2", name: "Ola K.", status: "completed", reward: "50 pkt", date: "15.03.2026" },
    { id: "3", name: "Magda W.", status: "pending", reward: "50 pkt", date: "02.04.2026" },
  ];

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

  return (
    <div className="px-4 pt-6 pb-24">
      <h1 className="text-2xl font-bold text-foreground mb-1">Poleć znajomej</h1>
      <p className="text-sm text-muted-foreground mb-6">
        Za każde polecenie zyskujesz punkty lojalnościowe
      </p>

      {/* Stats cards */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <Card className="border-border/40 rounded-2xl">
          <CardContent className="p-3 text-center">
            <Users className="h-5 w-5 text-primary mx-auto mb-1" />
            <p className="text-xl font-bold text-foreground">{totalReferrals}</p>
            <p className="text-[10px] text-muted-foreground">Polecenia</p>
          </CardContent>
        </Card>
        <Card className="border-border/40 rounded-2xl">
          <CardContent className="p-3 text-center">
            <Trophy className="h-5 w-5 text-primary mx-auto mb-1" />
            <p className="text-xl font-bold text-foreground">{earnedPoints}</p>
            <p className="text-[10px] text-muted-foreground">Zdobyte pkt</p>
          </CardContent>
        </Card>
        <Card className="border-border/40 rounded-2xl">
          <CardContent className="p-3 text-center">
            <Gift className="h-5 w-5 text-primary mx-auto mb-1" />
            <p className="text-xl font-bold text-foreground">{pendingRewards}</p>
            <p className="text-[10px] text-muted-foreground">Oczekujące</p>
          </CardContent>
        </Card>
      </div>

      {/* Referral code card */}
      <Card className="border-primary/20 rounded-2xl mb-6 bg-gradient-to-br from-primary/5 to-primary/10">
        <CardContent className="p-5">
          <p className="text-sm font-medium text-muted-foreground mb-2">Twój kod polecający</p>
          <div className="flex items-center gap-3 mb-4">
            <div className="flex-1 bg-background border border-border rounded-xl px-4 py-3 font-mono text-lg font-bold text-foreground tracking-wider text-center">
              {referralCode}
            </div>
            <Button
              variant="outline"
              size="icon"
              className="h-12 w-12 rounded-xl shrink-0"
              onClick={handleCopy}
            >
              {copied ? <Check className="h-5 w-5 text-primary" /> : <Copy className="h-5 w-5" />}
            </Button>
          </div>
          <Button className="w-full h-12 rounded-xl font-semibold" onClick={handleShare}>
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
        <div className="space-y-2">
          {referrals.map((ref) => (
            <Card key={ref.id} className="border-border/40 rounded-2xl">
              <CardContent className="flex items-center justify-between p-4">
                <div>
                  <p className="text-sm font-medium text-foreground">{ref.name}</p>
                  <p className="text-xs text-muted-foreground">{ref.date}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-primary">{ref.reward}</span>
                  <Badge
                    variant={ref.status === "completed" ? "default" : "secondary"}
                    className="text-[10px]"
                  >
                    {ref.status === "completed" ? "Zrealizowane" : "Oczekuje"}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, Users, Link2, TrendingUp, Gift, Settings, Target } from "lucide-react";
import { ReferralProgram } from "./ReferralProgram";
import { GoogleReviewsManager } from "./GoogleReviewsManager";
import { ReferralSettings } from "./ReferralSettings";

interface ReferralEngineProps {
  isDemo?: boolean;
}

const mockStats = {
  activeAmbassadors: 12,
  sentLinks: 34,
  bookingsFromReferrals: 47,
  revenueFromReferrals: 14200,
  sentReviewRequests: 58,
  receivedReviews: 31,
};

const mockActivity = [
  { id: "1", text: "Anna K. poleciła → nowa rezerwacja", amount: "+280 zł", type: "referral" as const, time: "2h temu" },
  { id: "2", text: "Magda D. zostawiła opinię w Google", amount: "⭐⭐⭐⭐⭐", type: "review" as const, time: "5h temu" },
  { id: "3", text: "Kasia W. kliknęła link polecający", amount: "", type: "click" as const, time: "wczoraj" },
  { id: "4", text: "Maria N. poleciła → nowa rezerwacja", amount: "+450 zł", type: "referral" as const, time: "wczoraj" },
  { id: "5", text: "Ola Z. dostała link polecający (5. wizyta)", amount: "", type: "activation" as const, time: "2 dni temu" },
];

export function ReferralEngine({ isDemo }: ReferralEngineProps) {
  const [activeTab, setActiveTab] = useState("overview");

  const stats = isDemo ? mockStats : {
    activeAmbassadors: 0, sentLinks: 0, bookingsFromReferrals: 0,
    revenueFromReferrals: 0, sentReviewRequests: 0, receivedReviews: 0,
  };
  const activity = isDemo ? mockActivity : [];

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-4 w-full">
          <TabsTrigger value="overview" className="text-xs sm:text-sm gap-1">
            <Target className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Przegląd</span>
            <span className="sm:hidden">📊</span>
          </TabsTrigger>
          <TabsTrigger value="referrals" className="text-xs sm:text-sm gap-1">
            <Users className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Polecenia</span>
            <span className="sm:hidden">👯</span>
          </TabsTrigger>
          <TabsTrigger value="reviews" className="text-xs sm:text-sm gap-1">
            <Star className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Opinie Google</span>
            <span className="sm:hidden">⭐</span>
          </TabsTrigger>
          <TabsTrigger value="settings" className="text-xs sm:text-sm gap-1">
            <Settings className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Ustawienia</span>
            <span className="sm:hidden">⚙️</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-4">
          {/* Wyjaśnienie modułu */}
          <div className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-2xl p-6 mb-6 border border-pink-100">
            <h3 className="font-serif font-bold text-lg mb-2">💝 Jak działa moduł Poleceń?</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm font-semibold mb-2">👯 Program poleceń</p>
                <p className="text-sm text-muted-foreground">
                  Klientka dostaje unikalny link polecający. Gdy przez jej link zarezerwuje nowa osoba —
                  obie dostają benefit (rabat, darmowy zabieg lub punkty). System śledzi wszystko automatycznie.
                </p>
              </div>
              <div>
                <p className="text-sm font-semibold mb-2">⭐ Ciche Fanki → Opinie Google</p>
                <p className="text-sm text-muted-foreground">
                  System wykrywa klientki z NPS 9-10 które nie zostawiły opinii w Google.
                  Automatycznie wysyła do nich prośbę z bezpośrednim linkiem do formularza.
                </p>
              </div>
            </div>

            {/* Mini przepływ */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div className="bg-white/70 rounded-xl p-3">
                <p className="text-xs font-bold text-muted-foreground mb-2">POLECENIA — PRZEPŁYW</p>
                <div className="flex items-center gap-1.5 text-xs flex-wrap">
                  {["5. wizyta", "→", "auto-link", "→", "udostępnia", "→", "rezerwacja", "→", "benefit"].map((s, i) => (
                    <span key={i} className={s === "→" ? "text-muted-foreground" : "bg-primary/10 text-primary px-1.5 py-0.5 rounded font-medium"}>
                      {s}
                    </span>
                  ))}
                </div>
              </div>
              <div className="bg-white/70 rounded-xl p-3">
                <p className="text-xs font-bold text-muted-foreground mb-2">OPINIE — PRZEPŁYW</p>
                <div className="flex items-center gap-1.5 text-xs flex-wrap">
                  {["NPS 9-10", "→", "brak opinii", "→", "auto-SMS", "→", "1 klik", "→", "⭐⭐⭐⭐⭐"].map((s, i) => (
                    <span key={i} className={
                      s === "→" ? "text-muted-foreground" :
                      s.includes("⭐") ? "text-yellow-600 font-bold" :
                      "bg-yellow-50 text-yellow-700 px-1.5 py-0.5 rounded font-medium"
                    }>
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* KPI Cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
            {[
              { icon: <Users className="w-4 h-4 text-primary" />, label: "Aktywnych ambasadorek", value: stats.activeAmbassadors },
              { icon: <Link2 className="w-4 h-4 text-blue-500" />, label: "Wysłanych linków", value: stats.sentLinks },
              { icon: <TrendingUp className="w-4 h-4 text-green-500" />, label: "Rezerwacji z poleceń", value: stats.bookingsFromReferrals },
              { icon: <Gift className="w-4 h-4 text-secondary" />, label: "Przychód z poleceń", value: `${stats.revenueFromReferrals.toLocaleString()} zł` },
              { icon: <Star className="w-4 h-4 text-yellow-500" />, label: "Wysłanych próśb o opinię", value: stats.sentReviewRequests },
              { icon: <Star className="w-4 h-4 text-green-500" />, label: "Otrzymanych opinii", value: stats.receivedReviews },
            ].map((kpi, i) => (
              <Card key={i} className="border-border">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-1">
                    {kpi.icon}
                    <span className="text-xs text-muted-foreground">{kpi.label}</span>
                  </div>
                  <p className="text-2xl font-bold">{kpi.value}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Aktywność ostatnie 7 dni */}
          <Card>
            <CardContent className="p-0">
              <div className="px-4 py-3 border-b border-border">
                <p className="font-semibold text-sm">Ostatnia aktywność</p>
              </div>
              <div className="divide-y divide-border">
                {activity.map(event => (
                  <div key={event.id} className="px-4 py-3 flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${
                      event.type === "referral" ? "bg-green-500" :
                      event.type === "review" ? "bg-yellow-500" :
                      event.type === "click" ? "bg-blue-500" :
                      "bg-primary"
                    }`} />
                    <div className="flex-1">
                      <p className="text-sm">{event.text}</p>
                      <p className="text-xs text-muted-foreground">{event.time}</p>
                    </div>
                    {event.amount && (
                      <Badge variant={event.type === "referral" ? "default" : "outline"} className="text-xs">
                        {event.amount}
                      </Badge>
                    )}
                  </div>
                ))}
                {activity.length === 0 && (
                  <div className="p-8 text-center text-muted-foreground text-sm">
                    Brak aktywności. Aktywuj program poleceń w Ustawieniach.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="referrals" className="mt-4">
          <ReferralProgram isDemo={isDemo} />
        </TabsContent>
        <TabsContent value="reviews" className="mt-4">
          <GoogleReviewsManager isDemo={isDemo} />
        </TabsContent>
        <TabsContent value="settings" className="mt-4">
          <ReferralSettings isDemo={isDemo} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

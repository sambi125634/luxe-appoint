import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Star, Send, CheckCircle2, Clock, ExternalLink } from "lucide-react";
import { motion } from "framer-motion";

interface SilentFansDashboardProps {
  isDemo?: boolean;
}

const mockSilentFans = [
  { id: "1", name: "Anna Kowalska", nps: 10, visits: 8, lastVisit: "2 dni temu", hasGoogleReview: false, status: "ready" },
  { id: "2", name: "Maria Nowak", nps: 9, visits: 5, lastVisit: "5 dni temu", hasGoogleReview: false, status: "ready" },
  { id: "3", name: "Kasia Wiśniewska", nps: 10, visits: 12, lastVisit: "1 dzień temu", hasGoogleReview: false, status: "sent" },
  { id: "4", name: "Ola Zielińska", nps: 9, visits: 4, lastVisit: "10 dni temu", hasGoogleReview: false, status: "ready" },
  { id: "5", name: "Magda Dąbrowska", nps: 10, visits: 6, lastVisit: "3 dni temu", hasGoogleReview: true, status: "completed" },
];

const mockReviewRequests = [
  { id: "1", clientName: "Kasia Wiśniewska", sentAt: "2h temu", status: "sent", messageNumber: 1 },
  { id: "2", clientName: "Ewa Jankowska", sentAt: "wczoraj", status: "clicked", messageNumber: 1 },
  { id: "3", clientName: "Magda Dąbrowska", sentAt: "3 dni temu", status: "completed", messageNumber: 1 },
];

export function SilentFansDashboard({ isDemo }: SilentFansDashboardProps) {
  const { t } = useTranslation();
  const silentFans = isDemo ? mockSilentFans : [];
  const reviewRequests = isDemo ? mockReviewRequests : [];
  const potentialReviews = silentFans.filter(f => f.status === "ready").length;

  return (
    <div className="space-y-6">
      {potentialReviews > 0 && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="border-primary/30 bg-primary/5">
            <CardContent className="p-4 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-primary mt-0.5 shrink-0" />
              <div>
                <p className="font-medium text-sm">
                  {t("referralModule.silentFansAlert", { count: potentialReviews })}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {t("referralModule.silentFansPotential", { count: potentialReviews })}
                </p>
                <Button size="sm" className="mt-2 gap-2" variant="default">
                  <Send className="w-3.5 h-3.5" />
                  {t("referralModule.sendReviewRequests")}
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Star className="w-4 h-4 text-yellow-500" />
            {t("referralModule.silentFansTitle")}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-border">
            {silentFans.map((fan, idx) => (
              <motion.div
                key={fan.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="px-4 py-3 flex items-center gap-3"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center text-xs font-bold text-primary">
                  {fan.nps}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{fan.name}</p>
                  <p className="text-xs text-muted-foreground">{fan.visits} {t("retention.visits")} • {fan.lastVisit}</p>
                </div>
                <div className="flex items-center gap-2">
                  {fan.status === "ready" && (
                    <Badge variant="outline" className="text-xs gap-1 border-primary/30 text-primary">
                      <Star className="w-3 h-3" /> NPS {fan.nps}
                    </Badge>
                  )}
                  {fan.status === "sent" && (
                    <Badge variant="outline" className="text-xs gap-1 border-yellow-500/30 text-yellow-600">
                      <Clock className="w-3 h-3" /> {t("referralModule.reviewSent")}
                    </Badge>
                  )}
                  {fan.status === "completed" && (
                    <Badge variant="outline" className="text-xs gap-1 border-green-500/30 text-green-600">
                      <CheckCircle2 className="w-3 h-3" /> {t("referralModule.reviewDone")}
                    </Badge>
                  )}
                  {fan.status === "ready" && (
                    <Button size="sm" variant="ghost" className="h-7 text-xs gap-1">
                      <Send className="w-3 h-3" /> {t("referralModule.ask")}
                    </Button>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
          {silentFans.length === 0 && (
            <div className="p-8 text-center text-muted-foreground text-sm">
              {t("referralModule.noSilentFans")}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Send className="w-4 h-4" />
            {t("referralModule.reviewHistory")}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-border">
            {reviewRequests.map((req) => (
              <div key={req.id} className="px-4 py-3 flex items-center gap-3">
                <div className="flex-1">
                  <p className="text-sm font-medium">{req.clientName}</p>
                  <p className="text-xs text-muted-foreground">#{req.messageNumber} • {req.sentAt}</p>
                </div>
                <Badge variant={req.status === "completed" ? "default" : "outline"} className="text-xs">
                  {req.status === "sent" && t("referralModule.reviewSent")}
                  {req.status === "clicked" && t("referralModule.clickedLink")}
                  {req.status === "completed" && t("referralModule.review")}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">{t("referralModule.messageTemplates")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-3 rounded-lg bg-muted/50 border border-border">
            <p className="text-xs font-medium text-muted-foreground mb-1">{t("referralModule.message1Label")}</p>
            <p className="text-sm">
              "[Imię], dziękuję za dzisiejszą wizytę! Cieszę się że byłaś ❤️ Czy mogłabyś poświęcić 30 sekund na opinię Google? Bardzo mi pomaga: [link]"
            </p>
          </div>
          <div className="p-3 rounded-lg bg-muted/50 border border-border">
            <p className="text-xs font-medium text-muted-foreground mb-1">{t("referralModule.message2Label")}</p>
            <p className="text-sm">
              "Hej [Imię], wiem że jesteś zajęta — ale Twoja opinia naprawdę robi różnicę 🌸 Wiele kobiet takich jak Ty szuka salonów przez Google. Zajmie Ci dosłownie 20 sekund: [link]"
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

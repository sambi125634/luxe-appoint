import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, Users, Link2, TrendingUp, Gift, MessageSquare } from "lucide-react";
import { SilentFansDashboard } from "./SilentFansDashboard";
import { ReferralDashboard } from "./ReferralDashboard";
import { AmbassadorLeaderboard } from "./AmbassadorLeaderboard";
import { StoriesGenerator } from "./StoriesGenerator";

interface ReferralEngineProps {
  isDemo?: boolean;
}

const mockStats = {
  totalReferrals: 47,
  totalRevenue: 14200,
  totalRewardsCost: 2350,
  activeAmbassadors: 12,
  pendingReviews: 23,
  completedReviews: 31,
};

export function ReferralEngine({ isDemo }: ReferralEngineProps) {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState("overview");

  const stats = isDemo ? mockStats : { totalReferrals: 0, totalRevenue: 0, totalRewardsCost: 0, activeAmbassadors: 0, pendingReviews: 0, completedReviews: 0 };
  const roi = stats.totalRewardsCost > 0 ? ((stats.totalRevenue / stats.totalRewardsCost) * 100).toFixed(0) : "∞";

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <Users className="w-4 h-4 text-primary" />
              <span className="text-xs text-muted-foreground">{t("referralModule.referrals")}</span>
            </div>
            <p className="text-2xl font-bold">{stats.totalReferrals}</p>
            <p className="text-xs text-muted-foreground">{t("sidebar.clients")}</p>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="w-4 h-4 text-green-500" />
              <span className="text-xs text-muted-foreground">{t("referralModule.revenueLabel")}</span>
            </div>
            <p className="text-2xl font-bold">{stats.totalRevenue.toLocaleString()} zł</p>
            <p className="text-xs text-muted-foreground">{t("referralModule.referrals")}</p>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <Gift className="w-4 h-4 text-secondary" />
              <span className="text-xs text-muted-foreground">ROI</span>
            </div>
            <p className="text-2xl font-bold">{roi}%</p>
            <p className="text-xs text-muted-foreground">{t("referralModule.benefits")}</p>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <Star className="w-4 h-4 text-yellow-500" />
              <span className="text-xs text-muted-foreground">{t("referralModule.review")}</span>
            </div>
            <p className="text-2xl font-bold">{stats.completedReviews}</p>
            <p className="text-xs text-green-600 text-xs">+{stats.pendingReviews}</p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-4 w-full">
          <TabsTrigger value="overview" className="text-xs sm:text-sm gap-1">
            <Star className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{t("referralModule.silentFansTitle").split("—")[0].trim()}</span>
            <span className="sm:hidden">{t("referralModule.silentFansTitle").split("—")[0].trim().split(" ").pop()}</span>
          </TabsTrigger>
          <TabsTrigger value="referrals" className="text-xs sm:text-sm gap-1">
            <Link2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{t("referralModule.referrals")}</span>
            <span className="sm:hidden">{t("referralModule.referrals").substring(0, 5)}</span>
          </TabsTrigger>
          <TabsTrigger value="ambassadors" className="text-xs sm:text-sm gap-1">
            <Users className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{t("referralModule.topAmbassadors").replace("Top 10 ", "")}</span>
            <span className="sm:hidden">Top</span>
          </TabsTrigger>
          <TabsTrigger value="stories" className="text-xs sm:text-sm gap-1">
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Stories</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-4">
          <SilentFansDashboard isDemo={isDemo} />
        </TabsContent>
        <TabsContent value="referrals" className="mt-4">
          <ReferralDashboard isDemo={isDemo} />
        </TabsContent>
        <TabsContent value="ambassadors" className="mt-4">
          <AmbassadorLeaderboard isDemo={isDemo} />
        </TabsContent>
        <TabsContent value="stories" className="mt-4">
          <StoriesGenerator isDemo={isDemo} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

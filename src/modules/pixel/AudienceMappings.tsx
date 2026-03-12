import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Plus, ArrowRight, ShieldBan, Users, Sparkles } from "lucide-react";
import { AudienceMapping } from "./types";
import { MOCK_MAPPINGS, RECOMMENDED_MAPPINGS } from "./mock-data";
import { toast } from "sonner";

interface AudienceMappingsProps {
  isDemo?: boolean;
}

export function AudienceMappings({ isDemo }: AudienceMappingsProps) {
  const { t } = useTranslation();
  const [mappings, setMappings] = useState<AudienceMapping[]>(isDemo ? MOCK_MAPPINGS : []);

  const handleAutoCreate = () => {
    const newMappings = RECOMMENDED_MAPPINGS.map((m, i) => ({
      ...m,
      id: `auto-${i}`,
      salon_id: "s1",
      created_at: new Date().toISOString(),
    }));
    setMappings(newMappings);
    toast.success(t("pixel.createdAudiences"));
  };

  const toggleExclusion = (id: string) => {
    setMappings(mappings.map(m =>
      m.id === id ? { ...m, is_exclusion: !m.is_exclusion } : m
    ));
  };

  return (
    <div className="space-y-4">
      {mappings.length === 0 && (
        <Card className="border-dashed border-primary/30 bg-primary/5">
          <CardContent className="p-6 text-center space-y-3">
            <Sparkles className="w-8 h-8 text-primary mx-auto" />
            <p className="font-medium">{t("pixel.noMappings")}</p>
            <p className="text-sm text-muted-foreground">{t("pixel.autoCreateDesc")}</p>
            <Button onClick={handleAutoCreate}>
              <Plus className="w-4 h-4 mr-2" />
              {t("pixel.autoCreate")}
            </Button>
          </CardContent>
        </Card>
      )}

      {mappings.length > 0 && (
        <>
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-sm text-muted-foreground">
              {mappings.length} {t("pixel.mappingsActive")}
            </h3>
            <Button variant="outline" size="sm" onClick={handleAutoCreate}>
              <Plus className="w-4 h-4 mr-1" />
              {t("pixel.addMapping")}
            </Button>
          </div>

          <div className="grid gap-3">
            {mappings.map((mapping) => (
              <Card key={mapping.id} className={mapping.is_exclusion ? "border-destructive/30 bg-destructive/5" : ""}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="shrink-0">{mapping.tag_name}</Badge>
                    <ArrowRight className="w-4 h-4 text-muted-foreground shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{mapping.audience_name}</p>
                      <p className="text-xs text-muted-foreground">
                        {mapping.audience_id || t("pixel.willBeCreated")}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {mapping.is_exclusion && <ShieldBan className="w-4 h-4 text-destructive" />}
                      <Switch checked={mapping.is_exclusion} onCheckedChange={() => toggleExclusion(mapping.id)} />
                      <span className="text-xs text-muted-foreground w-16">
                        {mapping.is_exclusion ? t("pixel.exclude") : t("pixel.include")}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <ShieldBan className="w-4 h-4" />
            {t("pixel.autoExclusions")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <div className="flex items-start gap-2">
            <Badge variant="destructive" className="text-xs shrink-0">obecna-klientka-aktywna</Badge>
            <span>{t("pixel.exclusionActive")}</span>
          </div>
          <div className="flex items-start gap-2">
            <Badge variant="destructive" className="text-xs shrink-0">no-show-recydywista</Badge>
            <span>{t("pixel.exclusionNoShow")}</span>
          </div>
          <div className="flex items-start gap-2">
            <Badge variant="destructive" className="text-xs shrink-0">opt-out</Badge>
            <span>{t("pixel.exclusionOptOut")}</span>
          </div>
        </CardContent>
      </Card>

      <Card className="border-blue-200 bg-blue-50/50 dark:border-blue-900 dark:bg-blue-950/20">
        <CardContent className="p-4 flex items-start gap-3">
          <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" />
          <div className="text-sm">
            <p className="font-medium text-blue-900 dark:text-blue-200">{t("pixel.lookalikeTitle")}</p>
            <p className="text-blue-700 dark:text-blue-400 mt-1">{t("pixel.lookalikeDesc")}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

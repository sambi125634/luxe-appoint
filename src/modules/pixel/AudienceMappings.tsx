import { useState } from "react";
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
  const [mappings, setMappings] = useState<AudienceMapping[]>(isDemo ? MOCK_MAPPINGS : []);

  const handleAutoCreate = () => {
    const newMappings = RECOMMENDED_MAPPINGS.map((m, i) => ({
      ...m,
      id: `auto-${i}`,
      salon_id: "s1",
      created_at: new Date().toISOString(),
    }));
    setMappings(newMappings);
    toast.success("Utworzono 5 rekomendowanych audiences");
  };

  const toggleExclusion = (id: string) => {
    setMappings(mappings.map(m =>
      m.id === id ? { ...m, is_exclusion: !m.is_exclusion } : m
    ));
  };

  return (
    <div className="space-y-4">
      {/* Auto-create button */}
      {mappings.length === 0 && (
        <Card className="border-dashed border-primary/30 bg-primary/5">
          <CardContent className="p-6 text-center space-y-3">
            <Sparkles className="w-8 h-8 text-primary mx-auto" />
            <p className="font-medium">Nie masz jeszcze żadnych mapowań</p>
            <p className="text-sm text-muted-foreground">
              Automatycznie utwórz 5 rekomendowanych Custom Audiences w Meta jednym kliknięciem.
            </p>
            <Button onClick={handleAutoCreate}>
              <Plus className="w-4 h-4 mr-2" />
              Auto-utwórz recommended
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Mappings list */}
      {mappings.length > 0 && (
        <>
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-sm text-muted-foreground">
              {mappings.length} mapowań aktywnych
            </h3>
            <Button variant="outline" size="sm" onClick={handleAutoCreate}>
              <Plus className="w-4 h-4 mr-1" />
              Dodaj mapowanie
            </Button>
          </div>

          <div className="grid gap-3">
            {mappings.map((mapping) => (
              <Card key={mapping.id} className={mapping.is_exclusion ? "border-destructive/30 bg-destructive/5" : ""}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    {/* Tag */}
                    <Badge variant="outline" className="shrink-0">
                      {mapping.tag_name}
                    </Badge>

                    <ArrowRight className="w-4 h-4 text-muted-foreground shrink-0" />

                    {/* Audience */}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{mapping.audience_name}</p>
                      <p className="text-xs text-muted-foreground">
                        {mapping.audience_id || "Zostanie utworzone przy pierwszej synchronizacji"}
                      </p>
                    </div>

                    {/* Exclusion toggle */}
                    <div className="flex items-center gap-2 shrink-0">
                      {mapping.is_exclusion && (
                        <ShieldBan className="w-4 h-4 text-destructive" />
                      )}
                      <Switch
                        checked={mapping.is_exclusion}
                        onCheckedChange={() => toggleExclusion(mapping.id)}
                      />
                      <span className="text-xs text-muted-foreground w-16">
                        {mapping.is_exclusion ? "Wyklucz" : "Dodaj"}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}

      {/* Exclusion rules info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <ShieldBan className="w-4 h-4" />
            Automatyczne wykluczenia
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <div className="flex items-start gap-2">
            <Badge variant="destructive" className="text-xs shrink-0">obecna-klientka-aktywna</Badge>
            <span>→ Wyklucz z kampanii prospectingowych (nie płać za kogoś kto już jest)</span>
          </div>
          <div className="flex items-start gap-2">
            <Badge variant="destructive" className="text-xs shrink-0">no-show-recydywista</Badge>
            <span>→ Wyklucz z kampanii reaktywacyjnych (3+ no-show = oszczędność budżetu)</span>
          </div>
          <div className="flex items-start gap-2">
            <Badge variant="destructive" className="text-xs shrink-0">opt-out</Badge>
            <span>→ Wyklucz ze wszystkich kampanii</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  TEMPLATE_CATEGORIES,
  getTemplatesByCategory,
  type TemplateCategoryId,
  type TemplateDefinition,
} from "./templateLibrary";

interface Props {
  onPick: (tpl: TemplateDefinition) => void;
  /** When true shows a compact, scrollable variant for the empty state */
  compact?: boolean;
}

export function TemplateGallery({ onPick, compact }: Props) {
  const [activeCat, setActiveCat] = useState<TemplateCategoryId>("popular");
  const templates = getTemplatesByCategory(activeCat);
  const activeCategory = TEMPLATE_CATEGORIES.find((c) => c.id === activeCat)!;

  return (
    <div className="space-y-4">
      {/* Category tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-thin">
        {TEMPLATE_CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCat(cat.id)}
            className={cn(
              "shrink-0 inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full border-2 text-sm font-medium transition-all",
              activeCat === cat.id
                ? "border-primary bg-primary text-primary-foreground"
                : "border-transparent bg-muted/60 text-foreground hover:bg-muted"
            )}
          >
            <span>{cat.emoji}</span>
            <span>{cat.label}</span>
          </button>
        ))}
      </div>

      <p className="text-xs text-muted-foreground -mt-1">{activeCategory.description}</p>

      {/* Template grid */}
      {templates.length === 0 ? (
        <div className="text-sm text-muted-foreground text-center py-10 border-2 border-dashed rounded-xl">
          Brak szablonów w tej kategorii.
        </div>
      ) : (
        <div className={cn("grid gap-3", compact ? "grid-cols-2 lg:grid-cols-3" : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3")}>
          {templates.map((tpl) => (
            <Card
              key={tpl.id}
              className="cursor-pointer hover:shadow-md hover:border-primary/30 transition-all group"
              onClick={() => onPick(tpl)}
            >
              <CardContent className="py-4 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <span className="text-2xl">{tpl.emoji}</span>
                  {tpl.badge && (
                    <Badge
                      variant={tpl.badge === "Medyczne" ? "destructive" : tpl.badge === "RODO" ? "secondary" : "default"}
                      className="text-[10px]"
                    >
                      {tpl.badge}
                    </Badge>
                  )}
                </div>
                <p className="font-medium text-sm leading-snug">{tpl.name}</p>
                <p className="text-xs text-muted-foreground line-clamp-2">{tpl.description}</p>
                <p className="text-xs text-muted-foreground">
                  {tpl.fields.length} pytań · {tpl.estimatedMinutes} min
                </p>
                <Button variant="link" size="sm" className="p-0 h-auto text-xs text-primary group-hover:underline">
                  Użyj szablonu →
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

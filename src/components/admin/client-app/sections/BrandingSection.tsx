import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Paintbrush } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DEMO_BRANDING, COLOR_PRESETS } from "../demo/demoData";

interface BrandingSectionProps {
  isDemo: boolean;
  salonId: string | null | undefined;
  onConfigChange?: (config: { primary_color: string; salon_name: string; description: string; logo_url: string | null }) => void;
}

export function BrandingSection({ isDemo, salonId, onConfigChange }: BrandingSectionProps) {
  const queryClient = useQueryClient();

  const { data: salon } = useQuery({
    queryKey: ["salon-branding", salonId],
    queryFn: async () => {
      if (!salonId) return null;
      const { data } = await supabase.from("salons").select("name, description, theme_primary_color, logo_url").eq("id", salonId).single();
      return data;
    },
    enabled: !!salonId && !isDemo,
  });

  const [name, setName] = useState(DEMO_BRANDING.salon_name);
  const [description, setDescription] = useState(DEMO_BRANDING.description);
  const [color, setColor] = useState(DEMO_BRANDING.primary_color);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (salon) {
      setName(salon.name);
      setDescription(salon.description ?? "");
      setColor(salon.theme_primary_color ?? "#D4537E");
    }
  }, [salon]);

  const updatePreview = useCallback(() => {
    onConfigChange?.({ primary_color: color, salon_name: name, description, logo_url: null });
  }, [color, name, description, onConfigChange]);

  useEffect(() => {
    updatePreview();
  }, [updatePreview]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!salonId) return;
      await supabase.from("salons").update({
        name,
        description,
        theme_primary_color: color,
      }).eq("id", salonId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["salon-branding"] });
      setHasChanges(false);
      toast.success(isDemo
        ? "Zmiany zapisane! Aktywują się gdy klientki dołączą do aplikacji."
        : "Wygląd aplikacji zaktualizowany ✓");
    },
  });

  const handleChange = () => setHasChanges(true);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Paintbrush className="w-5 h-5" />
          Wygląd aplikacji
        </CardTitle>
        <CardDescription>Dostosuj jak wygląda aplikacja dla Twoich klientek</CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="space-y-2">
          <Label>Nazwa w aplikacji</Label>
          <Input
            value={name}
            onChange={(e) => { setName(e.target.value); handleChange(); }}
            maxLength={40}
            placeholder="Salon Piękności Bella"
          />
          <p className="text-xs text-muted-foreground">Ta nazwa pojawi się na ekranie powitalnym klientki</p>
        </div>

        <div className="space-y-2">
          <Label>Kolor przewodni</Label>
          <div className="flex items-center gap-3">
            <input
              type="color"
              value={color}
              onChange={(e) => { setColor(e.target.value); handleChange(); }}
              className="w-10 h-10 rounded-lg cursor-pointer border-0"
            />
            <Input
              value={color}
              onChange={(e) => { setColor(e.target.value); handleChange(); }}
              className="w-28 font-mono text-sm"
              maxLength={7}
            />
          </div>
          <div className="flex gap-2 mt-2">
            {COLOR_PRESETS.map((c) => (
              <button
                key={c}
                onClick={() => { setColor(c); handleChange(); }}
                className="w-8 h-8 rounded-full border-2 transition-transform hover:scale-110"
                style={{
                  backgroundColor: c,
                  borderColor: color === c ? "hsl(var(--foreground))" : "transparent",
                }}
              />
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label>Opis salonu</Label>
          <Textarea
            value={description}
            onChange={(e) => { setDescription(e.target.value); handleChange(); }}
            maxLength={200}
            placeholder="Twoje miejsce relaksu i piękna 🌸"
            rows={3}
          />
          <div className="flex justify-between">
            <p className="text-xs text-muted-foreground">Wyświetlany na profilu salonu w aplikacji</p>
            <p className="text-xs text-muted-foreground">{description.length}/200</p>
          </div>
        </div>

        <Button
          onClick={() => saveMutation.mutate()}
          disabled={!hasChanges || saveMutation.isPending}
          className="w-full"
        >
          {saveMutation.isPending ? "Zapisywanie..." : "Zapisz zmiany"}
        </Button>
      </CardContent>
    </Card>
  );
}

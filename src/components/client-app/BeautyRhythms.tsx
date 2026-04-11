import { useState } from "react";
import { Sparkles, Plus, Clock, Calendar, Bell, BellOff, Trash2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format, differenceInDays, addDays } from "date-fns";
import { pl } from "date-fns/locale";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const SERVICE_EMOJI: Record<string, string> = {
  paznokcie: "💅",
  manicure: "💅",
  pedicure: "💅",
  fryzjer: "✂️",
  włosy: "✂️",
  koloryzacja: "✂️",
  strzyżenie: "✂️",
  masaż: "💆",
  twarz: "🧖",
  brwi: "👁️",
  rzęsy: "👁️",
  depilacja: "⚡",
  laser: "⚡",
};

function getServiceEmoji(name: string): string {
  const lower = name.toLowerCase();
  for (const [key, emoji] of Object.entries(SERVICE_EMOJI)) {
    if (lower.includes(key)) return emoji;
  }
  return "✨";
}

interface BeautyRhythmsProps {
  salonId: string | undefined;
}

export function BeautyRhythms({ salonId }: BeautyRhythmsProps) {
  const queryClient = useQueryClient();
  const [showAddModal, setShowAddModal] = useState(false);
  const [newRhythm, setNewRhythm] = useState({
    serviceId: "",
    intervalDays: 28,
  });

  // Fetch rhythms
  const { data: rhythms = [], isLoading } = useQuery({
    queryKey: ["beauty-rhythms", salonId],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || !salonId) return [];

      const { data, error } = await supabase
        .from("beauty_rhythms")
        .select("*")
        .eq("user_id", user.id)
        .eq("salon_id", salonId)
        .order("next_reminder_date", { ascending: true });

      if (error) throw error;
      return data ?? [];
    },
    enabled: !!salonId,
  });

  // Fetch salon services for add modal
  const { data: services = [] } = useQuery({
    queryKey: ["salon-services-for-rhythm", salonId],
    queryFn: async () => {
      if (!salonId) return [];
      const { data, error } = await supabase
        .from("services")
        .select("id, name")
        .eq("salon_id", salonId)
        .eq("is_active", true)
        .order("name");
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!salonId && showAddModal,
  });

  // Toggle reminder
  const toggleMutation = useMutation({
    mutationFn: async ({ id, enabled }: { id: string; enabled: boolean }) => {
      const { error } = await supabase
        .from("beauty_rhythms")
        .update({ reminder_enabled: enabled })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["beauty-rhythms"] }),
  });

  // Delete rhythm
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("beauty_rhythms")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["beauty-rhythms"] });
      toast.success("Rytm usunięty");
    },
  });

  // Add manual rhythm
  const addMutation = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || !salonId || !newRhythm.serviceId) throw new Error("Brak danych");

      const service = services.find((s) => s.id === newRhythm.serviceId);
      if (!service) throw new Error("Usługa nie znaleziona");

      const nextReminder = addDays(new Date(), newRhythm.intervalDays);

      const { error } = await supabase.from("beauty_rhythms").upsert(
        {
          user_id: user.id,
          salon_id: salonId,
          service_id: newRhythm.serviceId,
          service_name: service.name,
          avg_interval_days: newRhythm.intervalDays,
          next_reminder_date: nextReminder.toISOString().split("T")[0],
          reminder_enabled: true,
          auto_detected: false,
        },
        { onConflict: "user_id,salon_id,service_id" }
      );
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["beauty-rhythms"] });
      setShowAddModal(false);
      setNewRhythm({ serviceId: "", intervalDays: 28 });
      toast.success("Rytm dodany! 🌸");
    },
    onError: (err: Error) => toast.error(err.message),
  });

  if (isLoading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-24 w-full rounded-2xl" />
        <Skeleton className="h-24 w-full rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          <div>
            <h3 className="font-bold text-foreground text-base">Mój Rytm Beauty</h3>
            <p className="text-xs text-muted-foreground">Spersonalizowane przypomnienia</p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="rounded-full gap-1.5 text-xs"
          onClick={() => setShowAddModal(true)}
        >
          <Plus className="h-3.5 w-3.5" />
          Dodaj
        </Button>
      </div>

      {/* Rhythms list */}
      {rhythms.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-8"
        >
          <Clock className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-sm font-medium text-foreground mb-1">Zbieraj wizyty!</p>
          <p className="text-xs text-muted-foreground max-w-[240px] mx-auto">
            Po 2 wizytach tej samej usługi automatycznie wykryjemy Twój rytm beauty 🌸
          </p>
        </motion.div>
      ) : (
        <div className="space-y-2.5">
          {rhythms.map((rhythm, i) => {
            const daysUntil = rhythm.next_reminder_date
              ? differenceInDays(new Date(rhythm.next_reminder_date), new Date())
              : null;
            const isOverdue = daysUntil !== null && daysUntil < 0;
            const isSoon = daysUntil !== null && daysUntil <= 3 && daysUntil >= 0;

            return (
              <motion.div
                key={rhythm.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Card className={cn(
                  "rounded-2xl border overflow-hidden transition-colors",
                  isOverdue && "border-destructive/30 bg-destructive/5",
                  isSoon && "border-primary/30 bg-primary/5",
                )}>
                  <CardContent className="p-3.5">
                    <div className="flex items-start gap-3">
                      {/* Emoji */}
                      <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center text-lg shrink-0">
                        {getServiceEmoji(rhythm.service_name)}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="font-medium text-sm text-foreground truncate">
                            {rhythm.service_name}
                          </span>
                          <Badge
                            variant="secondary"
                            className="text-[9px] px-1.5 py-0 shrink-0"
                          >
                            {rhythm.auto_detected ? "🤖 Auto" : "Ręczne"}
                          </Badge>
                        </div>

                        <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-[11px] text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            co {rhythm.avg_interval_days} dni
                          </span>
                          {rhythm.last_appointment_date && (
                            <span>
                              Ostatnio: {format(new Date(rhythm.last_appointment_date), "d MMM", { locale: pl })}
                            </span>
                          )}
                        </div>

                        {/* Next reminder */}
                        {rhythm.next_reminder_date && (
                          <div className={cn(
                            "text-[11px] mt-1 flex items-center gap-1",
                            isOverdue ? "text-destructive font-medium" : isSoon ? "text-primary font-medium" : "text-muted-foreground"
                          )}>
                            <Calendar className="h-3 w-3" />
                            {isOverdue
                              ? `Przypomnienie ${Math.abs(daysUntil!)} dni temu`
                              : daysUntil === 0
                                ? "Dziś!"
                                : `Za ${daysUntil} dni (${format(new Date(rhythm.next_reminder_date), "d MMM", { locale: pl })})`
                            }
                          </div>
                        )}
                      </div>

                      {/* Controls */}
                      <div className="flex flex-col items-end gap-2 shrink-0">
                        <Switch
                          checked={rhythm.reminder_enabled}
                          onCheckedChange={(checked) =>
                            toggleMutation.mutate({ id: rhythm.id, enabled: checked })
                          }
                          className="scale-75"
                        />
                        {!rhythm.auto_detected && (
                          <button
                            onClick={() => deleteMutation.mutate(rhythm.id)}
                            className="text-muted-foreground/50 hover:text-destructive transition-colors"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Add rhythm modal */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="rounded-2xl max-w-sm">
          <DialogHeader>
            <DialogTitle>Dodaj własny rytm</DialogTitle>
            <DialogDescription>
              Ustaw przypomnienie o zabiegu co określoną liczbę dni
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Usługa</label>
              <Select value={newRhythm.serviceId} onValueChange={(v) => setNewRhythm((p) => ({ ...p, serviceId: v }))}>
                <SelectTrigger className="rounded-xl">
                  <SelectValue placeholder="Wybierz usługę" />
                </SelectTrigger>
                <SelectContent>
                  {services.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {getServiceEmoji(s.name)} {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">
                Co ile dni? <span className="text-primary font-bold">{newRhythm.intervalDays}</span>
              </label>
              <Slider
                value={[newRhythm.intervalDays]}
                onValueChange={([v]) => setNewRhythm((p) => ({ ...p, intervalDays: v }))}
                min={7}
                max={90}
                step={1}
                className="mt-2"
              />
              <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
                <span>7 dni</span>
                <span>90 dni</span>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              onClick={() => addMutation.mutate()}
              disabled={!newRhythm.serviceId || addMutation.isPending}
              className="w-full rounded-xl"
            >
              {addMutation.isPending ? "Dodawanie..." : "Dodaj rytm 🌸"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

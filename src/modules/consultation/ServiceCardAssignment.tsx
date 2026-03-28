import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Save, Check, Link2, ArrowDown, ClipboardList, Calendar } from "lucide-react";
import { useServices } from "@/hooks/useServices";
import { useConsultationTemplates } from "@/hooks/useConsultations";
import { useServiceConsultationCards, useSaveServiceConsultationCards } from "@/hooks/useConsultationSends";
import { toast } from "sonner";

interface Assignment {
  service_id: string;
  card_id: string;
  send_timing: string;
  send_hours_before: number;
  is_required: boolean;
}

interface Props {
  isDemo?: boolean;
}

const DEMO_SERVICES = [
  { id: "s1", name: "Mezoterapia", category_id: null },
  { id: "s2", name: "Manicure hybrydowy", category_id: null },
  { id: "s3", name: "Koloryzacja włosów", category_id: null },
  { id: "s4", name: "Masaż relaksacyjny", category_id: null },
];

const DEMO_TEMPLATES = [
  { id: "t1", name: "Karta konsultacyjna — Twarz" },
  { id: "t2", name: "Karta paznokcie" },
  { id: "t3", name: "RODO — Zgoda ogólna" },
];

export function ServiceCardAssignment({ isDemo }: Props) {
  const { data: services = [] } = useServices();
  const { data: templates = [] } = useConsultationTemplates();
  const { data: existing = [] } = useServiceConsultationCards();
  const saveAssignments = useSaveServiceConsultationCards();

  const displayServices = isDemo ? DEMO_SERVICES : services;
  const displayTemplates = isDemo ? DEMO_TEMPLATES : templates;

  const [assignments, setAssignments] = useState<Record<string, Assignment>>({});

  useEffect(() => {
    if (!isDemo && existing.length > 0) {
      const map: Record<string, Assignment> = {};
      existing.forEach(e => {
        map[e.service_id] = {
          service_id: e.service_id,
          card_id: e.card_id,
          send_timing: e.send_timing,
          send_hours_before: e.send_hours_before,
          is_required: e.is_required,
        };
      });
      setAssignments(map);
    }
  }, [existing, isDemo]);

  const updateAssignment = (serviceId: string, updates: Partial<Assignment>) => {
    setAssignments(prev => ({
      ...prev,
      [serviceId]: {
        service_id: serviceId,
        card_id: prev[serviceId]?.card_id || "",
        send_timing: prev[serviceId]?.send_timing || "before_appointment",
        send_hours_before: prev[serviceId]?.send_hours_before || 24,
        is_required: prev[serviceId]?.is_required ?? true,
        ...updates,
      },
    }));
  };

  const removeAssignment = (serviceId: string) => {
    setAssignments(prev => {
      const next = { ...prev };
      delete next[serviceId];
      return next;
    });
  };

  const handleSave = () => {
    if (isDemo) {
      toast.success("Demo: Przypisania zapisane!");
      return;
    }
    const items = Object.values(assignments).filter(a => a.card_id);
    saveAssignments.mutate(items);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: assignments */}
        <div className="lg:col-span-2 space-y-3">
          {displayServices.map(service => {
            const assignment = assignments[service.id];
            const hasCard = !!assignment?.card_id;
            return (
              <Card key={service.id} className={hasCard ? "border-primary/30" : ""}>
                <CardContent className="py-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      {hasCard ? (
                        <Check className="w-4 h-4 text-primary" />
                      ) : (
                        <span className="w-4 h-4 block rounded-full bg-muted" />
                      )}
                      <span className="font-medium text-sm">{service.name}</span>
                    </div>
                    {hasCard && (
                      <Badge variant="outline" className="text-xs">Karta przypisana</Badge>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <Label className="text-xs">Karta</Label>
                      <Select
                        value={assignment?.card_id || "none"}
                        onValueChange={v => v === "none" ? removeAssignment(service.id) : updateAssignment(service.id, { card_id: v })}
                      >
                        <SelectTrigger className="h-8 text-xs mt-1">
                          <SelectValue placeholder="Brak" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">— Brak —</SelectItem>
                          {displayTemplates.map(t => (
                            <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {hasCard && (
                      <>
                        <div>
                          <Label className="text-xs">Wysyłaj</Label>
                          <Select
                            value={assignment.send_timing}
                            onValueChange={v => updateAssignment(service.id, { send_timing: v })}
                          >
                            <SelectTrigger className="h-8 text-xs mt-1">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="at_booking">Przy rezerwacji</SelectItem>
                              <SelectItem value="before_appointment">24h przed</SelectItem>
                              <SelectItem value="manual_only">Tylko ręcznie</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="flex items-end gap-2">
                          <div className="flex items-center gap-2">
                            <Switch
                              checked={assignment.is_required}
                              onCheckedChange={v => updateAssignment(service.id, { is_required: v })}
                            />
                            <Label className="text-xs">Wymagana</Label>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}

          <Button onClick={handleSave} disabled={saveAssignments.isPending} className="w-full gap-2">
            <Save className="w-4 h-4" /> Zapisz wszystkie przypisania
          </Button>
        </div>

        {/* Right: flow visualization */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Jak to działa?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { icon: Calendar, text: "Klientka rezerwuje usługę", color: "text-primary" },
                { icon: ArrowDown, text: "", color: "text-muted-foreground" },
                { icon: ClipboardList, text: "Wysyłamy kartę konsultacyjną", color: "text-primary" },
                { icon: ArrowDown, text: "", color: "text-muted-foreground" },
                { icon: Check, text: "Klientka wypełnia przed wizytą", color: "text-primary" },
                { icon: ArrowDown, text: "", color: "text-muted-foreground" },
                { icon: Link2, text: "Karta pojawia się przy wizycie", color: "text-primary" },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <item.icon className={`w-4 h-4 ${item.color} shrink-0`} />
                  {item.text && <span className="text-sm text-muted-foreground">{item.text}</span>}
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

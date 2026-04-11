import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format, addDays } from "date-fns";
import { pl } from "date-fns/locale";
import { Bell, CalendarIcon, Clock, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { useJoinWaitlist } from "@/hooks/useWaitlist";

interface WaitlistModalProps {
  open: boolean;
  onClose: () => void;
  salonId: string;
  preSelectedServiceId?: string;
}

const TIME_SLOTS = [
  { label: "Dowolna", from: null, to: null },
  { label: "Rano (8-12)", from: "08:00:00", to: "12:00:00" },
  { label: "Południe (12-16)", from: "12:00:00", to: "16:00:00" },
  { label: "Wieczór (16-20)", from: "16:00:00", to: "20:00:00" },
];

export function WaitlistModal({ open, onClose, salonId, preSelectedServiceId }: WaitlistModalProps) {
  const [serviceId, setServiceId] = useState(preSelectedServiceId ?? "");
  const [staffId, setStaffId] = useState<string>("");
  const [dateFrom, setDateFrom] = useState<Date>(addDays(new Date(), 1));
  const [dateTo, setDateTo] = useState<Date>(addDays(new Date(), 15));
  const [timeSlot, setTimeSlot] = useState("Dowolna");

  const joinWaitlist = useJoinWaitlist();

  const { data: services = [] } = useQuery({
    queryKey: ["waitlist-services", salonId],
    queryFn: async () => {
      const { data } = await supabase
        .from("services")
        .select("id, name, price, duration")
        .eq("salon_id", salonId)
        .eq("is_active", true)
        .order("name");
      return data ?? [];
    },
    enabled: open,
  });

  const { data: staff = [] } = useQuery({
    queryKey: ["waitlist-staff", salonId],
    queryFn: async () => {
      const { data } = await supabase
        .from("staff_members")
        .select("id, name")
        .eq("salon_id", salonId)
        .eq("is_active", true)
        .order("name");
      return data ?? [];
    },
    enabled: open,
  });

  const handleSubmit = () => {
    if (!serviceId) return;

    const selectedTime = TIME_SLOTS.find((t) => t.label === timeSlot);

    joinWaitlist.mutate(
      {
        salonId,
        serviceId,
        staffMemberId: staffId || null,
        preferredDateFrom: format(dateFrom, "yyyy-MM-dd"),
        preferredDateTo: format(dateTo, "yyyy-MM-dd"),
        preferredTimeFrom: selectedTime?.from ?? null,
        preferredTimeTo: selectedTime?.to ?? null,
      },
      { onSuccess: onClose }
    );
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-md mx-auto rounded-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            <Bell className="h-5 w-5 text-primary" />
            Lista oczekiwania
          </DialogTitle>
        </DialogHeader>

        <p className="text-sm text-muted-foreground -mt-2">
          Powiadomimy Cię gdy zwolni się pasujący termin.
        </p>

        <div className="space-y-4 mt-2">
          {/* Service */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Usługa</label>
            <Select value={serviceId} onValueChange={setServiceId}>
              <SelectTrigger>
                <SelectValue placeholder="Wybierz usługę" />
              </SelectTrigger>
              <SelectContent>
                {services.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.name} — {Number(s.price).toFixed(0)} zł
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Staff */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Specjalistka (opcjonalnie)</label>
            <Select value={staffId} onValueChange={setStaffId}>
              <SelectTrigger>
                <SelectValue placeholder="Dowolna" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="any">Dowolna</SelectItem>
                {staff.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Date from */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Od kiedy</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className={cn("w-full justify-start text-left font-normal")}>
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {format(dateFrom, "d MMM", { locale: pl })}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={dateFrom}
                    onSelect={(d) => d && setDateFrom(d)}
                    disabled={(d) => d < addDays(new Date(), 1)}
                    className="p-3 pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Do kiedy</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className={cn("w-full justify-start text-left font-normal")}>
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {format(dateTo, "d MMM", { locale: pl })}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={dateTo}
                    onSelect={(d) => d && setDateTo(d)}
                    disabled={(d) => d < dateFrom || d > addDays(new Date(), 60)}
                    className="p-3 pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Time preference */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5" />
              Preferowane godziny
            </label>
            <div className="flex flex-wrap gap-2">
              {TIME_SLOTS.map((slot) => (
                <button
                  key={slot.label}
                  onClick={() => setTimeSlot(slot.label)}
                  className={cn(
                    "px-3 py-1.5 rounded-full text-xs font-medium border transition-all",
                    timeSlot === slot.label
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-background text-foreground border-border hover:border-primary/50"
                  )}
                >
                  {slot.label}
                </button>
              ))}
            </div>
          </div>

          {/* Submit */}
          <Button
            onClick={handleSubmit}
            disabled={!serviceId || joinWaitlist.isPending}
            className="w-full"
          >
            <Bell className="h-4 w-4 mr-2" />
            {joinWaitlist.isPending ? "Dodawanie..." : "Dołącz do listy"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

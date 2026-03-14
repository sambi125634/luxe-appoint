import { useState } from "react";
import { User, Star, Clock, CalendarDays, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface StaffMember {
  id: string;
  name: string;
  role: string;
  avatar?: string;
  rating: number;
  nextAvailable?: string;
}

interface StaffSelectionProps {
  onSelect: (staff: StaffMember | null) => void;
  selectedStaff: StaffMember | null;
  onProceed?: () => void;
  salonId?: string;
  isDemo?: boolean;
}

const demoStaffMembers: StaffMember[] = [
  { id: "1", name: "Anna Kowalska", role: "Kosmetolog", rating: 4.9, nextAvailable: "Dziś, 14:00" },
  { id: "2", name: "Maria Nowak", role: "Specjalista depilacji", rating: 4.8, nextAvailable: "Jutro, 10:00" },
  { id: "3", name: "Karolina Wiśniewska", role: "Stylistka brwi i rzęs", rating: 5.0, nextAvailable: "Dziś, 16:30" },
  { id: "4", name: "Joanna Lewandowska", role: "Masażystka", rating: 4.7, nextAvailable: "Pojutrze, 09:00" },
];

type SelectionMode = 'specialist' | 'time';

export function StaffSelection({ onSelect, selectedStaff, onProceed, salonId, isDemo = false }: StaffSelectionProps) {
  const [mode, setMode] = useState<SelectionMode>('specialist');
  const isAnySelected = selectedStaff === null;

  // Fetch real staff from DB
  const { data: dbStaff, isLoading } = useQuery({
    queryKey: ["booking-staff", salonId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("staff_members")
        .select("id, name, role, avatar_url")
        .eq("salon_id", salonId!)
        .eq("is_active", true);
      if (error) throw error;
      return data ?? [];
    },
    enabled: !isDemo && !!salonId,
  });

  const staffMembers: StaffMember[] = isDemo
    ? demoStaffMembers
    : (dbStaff ?? []).map(s => ({
        id: s.id,
        name: s.name,
        role: s.role || "Specjalista",
        avatar: s.avatar_url || undefined,
        rating: 5.0,
      }));
  
  const handleSelect = (staff: StaffMember | null) => {
    onSelect(staff);
    setTimeout(() => { onProceed?.(); }, 150);
  };

  const sortedStaff = mode === 'time' 
    ? [...staffMembers].sort((a, b) => {
        if (a.nextAvailable?.includes('Dziś') && !b.nextAvailable?.includes('Dziś')) return -1;
        if (!a.nextAvailable?.includes('Dziś') && b.nextAvailable?.includes('Dziś')) return 1;
        return 0;
      })
    : staffMembers;

  if (!isDemo && isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48 mx-auto" />
        {[1,2,3].map(i => <Skeleton key={i} className="h-20 w-full rounded-xl" />)}
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-2xl font-serif font-semibold mb-2">Wybierz specjalistę</h2>
        <p className="text-muted-foreground">Możesz wybrać konkretną osobę lub pozwolić nam dopasować</p>
      </div>

      {/* Mode toggle */}
      <div className="flex gap-2 p-1 bg-muted rounded-xl">
        <Button
          variant={mode === 'specialist' ? 'default' : 'ghost'}
          size="sm"
          className="flex-1 gap-2"
          onClick={() => setMode('specialist')}
        >
          <Users className="w-4 h-4" />
          Wybierz specjalistę
        </Button>
        <Button
          variant={mode === 'time' ? 'default' : 'ghost'}
          size="sm"
          className="flex-1 gap-2"
          onClick={() => setMode('time')}
        >
          <Clock className="w-4 h-4" />
          Najszybszy termin
        </Button>
      </div>

      {mode === 'time' && staffMembers.length > 0 && (
        <div className="p-4 bg-primary/5 border border-primary/20 rounded-xl animate-fade-in">
          <div className="flex items-center gap-2 text-sm">
            <CalendarDays className="w-4 h-4 text-primary" />
            <span className="font-medium">Najbliższy dostępny termin:</span>
            <Badge variant="secondary" className="bg-primary/10 text-primary">
              {staffMembers[0]?.nextAvailable ? `${staffMembers[0].nextAvailable} - ${staffMembers[0].name}` : staffMembers[0]?.name}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Pokaże Ci terminy posortowane od najwcześniejszego
          </p>
        </div>
      )}

      <div className="grid gap-4">
        {/* Any specialist option */}
        <button
          onClick={() => handleSelect(null)}
          className={cn(
            "group w-full text-left p-5 rounded-xl border transition-all duration-300",
            isAnySelected
              ? "border-primary bg-primary/5 shadow-glow"
              : "border-border bg-card hover:border-primary/50 hover:shadow-soft"
          )}
        >
          <div className="flex items-center gap-4">
            <div className={cn(
              "w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300",
              isAnySelected
                ? "bg-gradient-to-r from-primary to-secondary text-primary-foreground"
                : "bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary"
            )}>
              <User className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">
                Dowolny specjalista
              </h3>
              <p className="text-sm text-muted-foreground">
                Dopasujemy najlepszą dostępną osobę
              </p>
            </div>
            {mode === 'time' && (
              <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900/50">
                Najszybciej
              </Badge>
            )}
          </div>
        </button>

        {/* Staff members */}
        {sortedStaff.map((staff, index) => (
          <button
            key={staff.id}
            onClick={() => handleSelect(staff)}
            className={cn(
              "group w-full text-left p-5 rounded-xl border transition-all duration-300",
              "animate-fade-in",
              selectedStaff?.id === staff.id
                ? "border-primary bg-primary/5 shadow-glow"
                : "border-border bg-card hover:border-primary/50 hover:shadow-soft"
            )}
            style={{ animationDelay: `${(index + 1) * 50}ms` }}
          >
            <div className="flex items-center gap-4">
              <div className={cn(
                "w-14 h-14 rounded-full flex items-center justify-center font-serif text-xl transition-all duration-300",
                selectedStaff?.id === staff.id
                  ? "bg-gradient-to-r from-primary to-secondary text-primary-foreground"
                  : "bg-muted text-foreground group-hover:bg-primary/10"
              )}>
                {staff.name.split(' ').map(n => n[0]).join('')}
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">
                  {staff.name}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {staff.role}
                </p>
                {mode === 'time' && staff.nextAvailable && (
                  <p className="text-xs text-primary mt-1 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {staff.nextAvailable}
                  </p>
                )}
              </div>
              <div className="flex flex-col items-end gap-1">
                <div className="flex items-center gap-1 text-accent">
                  <Star className="w-4 h-4 fill-current" />
                  <span className="font-medium">{staff.rating}</span>
                </div>
                {mode === 'time' && staff.nextAvailable?.includes('Dziś') && (
                  <Badge variant="secondary" className="text-xs bg-green-100 text-green-800 dark:bg-green-900/50">
                    Dziś
                  </Badge>
                )}
              </div>
            </div>
          </button>
        ))}

        {staffMembers.length === 0 && !isDemo && (
          <div className="text-center py-8 text-muted-foreground">
            <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p className="font-medium">Brak dostępnych specjalistów</p>
            <p className="text-sm">Salon nie ma jeszcze dodanego zespołu</p>
          </div>
        )}
      </div>
    </div>
  );
}

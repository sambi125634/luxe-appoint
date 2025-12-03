import { User, Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface StaffMember {
  id: string;
  name: string;
  role: string;
  avatar?: string;
  rating: number;
}

interface StaffSelectionProps {
  onSelect: (staff: StaffMember | null) => void;
  selectedStaff: StaffMember | null;
}

const staffMembers: StaffMember[] = [
  { id: "1", name: "Anna Kowalska", role: "Kosmetolog", rating: 4.9 },
  { id: "2", name: "Maria Nowak", role: "Specjalista depilacji", rating: 4.8 },
  { id: "3", name: "Karolina Wiśniewska", role: "Stylistka brwi i rzęs", rating: 5.0 },
  { id: "4", name: "Joanna Lewandowska", role: "Masażystka", rating: 4.7 },
];

export function StaffSelection({ onSelect, selectedStaff }: StaffSelectionProps) {
  const isAnySelected = selectedStaff === null;

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-2xl font-serif font-semibold mb-2">Wybierz specjalistę</h2>
        <p className="text-muted-foreground">Możesz wybrać konkretną osobę lub pozwolić nam dopasować</p>
      </div>

      <div className="grid gap-4">
        {/* Any specialist option */}
        <button
          onClick={() => onSelect(null)}
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
            <div>
              <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">
                Dowolny specjalista
              </h3>
              <p className="text-sm text-muted-foreground">
                Dopasujemy najlepszą dostępną osobę
              </p>
            </div>
          </div>
        </button>

        {/* Staff members */}
        {staffMembers.map((staff, index) => (
          <button
            key={staff.id}
            onClick={() => onSelect(staff)}
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
              </div>
              <div className="flex items-center gap-1 text-accent">
                <Star className="w-4 h-4 fill-current" />
                <span className="font-medium">{staff.rating}</span>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

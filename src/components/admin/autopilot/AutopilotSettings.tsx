import { Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function AutopilotSettings() {
  return (
    <div className="max-w-lg space-y-6">
      <div className="bg-card border border-border rounded-2xl p-5 space-y-4">
        <h3 className="font-semibold text-sm">Godziny ciszy</h3>
        <p className="text-xs text-muted-foreground">
          Autopilot nie wysyła wiadomości w tych godzinach
        </p>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="text-xs mb-1 block">Od</Label>
            <Input type="time" defaultValue="22:00" className="text-sm" />
          </div>
          <div>
            <Label className="text-xs mb-1 block">Do</Label>
            <Input type="time" defaultValue="07:00" className="text-sm" />
          </div>
        </div>
      </div>

      <div className="bg-card border border-border rounded-2xl p-5 space-y-4">
        <h3 className="font-semibold text-sm">Limit wiadomości</h3>
        <p className="text-xs text-muted-foreground">
          Maksymalna liczba wiadomości do jednej klientki
        </p>
        <div className="flex items-center gap-3">
          <Input type="number" defaultValue="2" className="w-20 text-sm" min={1} max={5} />
          <span className="text-sm text-muted-foreground">wiadomości na</span>
          <Input type="number" defaultValue="7" className="w-20 text-sm" min={1} />
          <span className="text-sm text-muted-foreground">dni</span>
        </div>
      </div>

      <div className="bg-card border border-border rounded-2xl p-5 space-y-3">
        <h3 className="font-semibold text-sm">Podpis SMS</h3>
        <Input defaultValue="" placeholder="Nazwa Twojego salonu" className="text-sm" />
        <p className="text-xs text-muted-foreground">
          Pojawi się na końcu każdej automatycznej wiadomości
        </p>
      </div>

      <Button className="w-full bg-violet-600 hover:bg-violet-700 gap-2">
        <Save className="w-4 h-4" />
        Zapisz ustawienia
      </Button>
    </div>
  );
}

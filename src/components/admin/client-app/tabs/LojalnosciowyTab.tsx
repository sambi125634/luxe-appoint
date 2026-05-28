import { useState } from "react";
import { Plus, Edit2, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface Reward {
  id: string;
  name: string;
  points: number;
  type: "free_service" | "discount_amount" | "discount_percent" | "product";
}

const TYPE_LABELS: Record<Reward["type"], string> = {
  free_service: "Usługa gratis",
  discount_amount: "Rabat kwotowy",
  discount_percent: "Rabat procentowy",
  product: "Produkt",
};

interface LojalnosciowyTabProps {
  pointsName: string;
  setPointsName: (s: string) => void;
  brandColor: string;
}

export function LojalnosciowyTab({ pointsName, setPointsName, brandColor }: LojalnosciowyTabProps) {
  const [pointsPerZl, setPointsPerZl] = useState(1);
  const [showProgress, setShowProgress] = useState(true);
  const [notifyReward, setNotifyReward] = useState(true);
  const [rewards, setRewards] = useState<Reward[]>([
    { id: "1", name: "Manicure gratis", points: 500, type: "free_service" },
    { id: "2", name: "Zniżka 50 zł", points: 300, type: "discount_amount" },
    { id: "3", name: "Zestaw produktów", points: 100, type: "product" },
  ]);
  const [adding, setAdding] = useState(false);
  const [newReward, setNewReward] = useState<Omit<Reward, "id">>({ name: "", points: 0, type: "free_service" });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold flex items-center gap-2">💜 Program lojalnościowy</h2>
        <p className="text-sm text-muted-foreground mt-1">Co klientki widzą w swoich punktach</p>
      </div>

      {/* Top stat */}
      <div className="rounded-2xl p-5 text-white" style={{ background: `linear-gradient(135deg, ${brandColor}, ${brandColor}CC)` }}>
        <p className="text-2xl font-bold">23 klientki aktywnie zbierają punkty</p>
        <p className="text-sm opacity-90 mt-1">Łączna wartość punktów w obiegu: 4 680 pkt = ~234 zł</p>
      </div>

      {/* Loyalty card preview */}
      <div className="flex justify-center">
        <div className="w-[320px] rounded-2xl p-5 text-white shadow-lg" style={{ background: `linear-gradient(135deg, ${brandColor}, ${brandColor}99)` }}>
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase opacity-80 tracking-wider">{pointsName}</span>
            <span className="text-[10px] font-semibold">VIP</span>
          </div>
          <p className="text-4xl font-bold mt-3">248 <span className="text-base opacity-80">pkt</span></p>
          <div className="mt-4 h-2 bg-white/20 rounded-full overflow-hidden">
            <div className="h-full bg-white rounded-full transition-all" style={{ width: "49%" }} />
          </div>
          <p className="text-xs mt-2 opacity-90">Następna nagroda: Manicure gratis (500 pkt)</p>
          <p className="text-[10px] mt-3 opacity-70">Zdobywasz {pointsPerZl} pkt za każde 1 zł wydane</p>
        </div>
      </div>

      {/* Config */}
      <div className="space-y-3">
        <div className="space-y-1.5">
          <Label>Nazwa punktów</Label>
          <Input value={pointsName} onChange={(e) => setPointsName(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label>Punkty za 1 zł wydane</Label>
          <Input type="number" min={0.1} step={0.1} value={pointsPerZl} onChange={(e) => setPointsPerZl(parseFloat(e.target.value) || 1)} className="max-w-[140px]" />
        </div>
      </div>

      {/* Rewards table */}
      <div className="border border-border rounded-xl overflow-hidden">
        <div className="grid grid-cols-[1fr_100px_140px_100px] text-xs font-semibold bg-muted p-3">
          <span>Nagroda</span><span>Punkty</span><span>Typ</span><span>Akcje</span>
        </div>
        {rewards.map((r) => (
          <div key={r.id} className="grid grid-cols-[1fr_100px_140px_100px] items-center text-sm p-3 border-t">
            <span className="font-medium">{r.name}</span>
            <span>{r.points} pkt</span>
            <span className="text-muted-foreground">{TYPE_LABELS[r.type]}</span>
            <div className="flex gap-1">
              <button className="p-1 hover:bg-muted rounded text-muted-foreground" onClick={() => toast.info("Edycja w przygotowaniu")}><Edit2 className="w-3.5 h-3.5" /></button>
              <button className="p-1 hover:bg-destructive/10 rounded text-destructive" onClick={() => setRewards(rewards.filter((x) => x.id !== r.id))}><Trash2 className="w-3.5 h-3.5" /></button>
            </div>
          </div>
        ))}
        {adding && (
          <div className="p-3 border-t bg-muted/30 space-y-2">
            <Input placeholder="Nazwa nagrody" value={newReward.name} onChange={(e) => setNewReward({ ...newReward, name: e.target.value })} />
            <div className="grid grid-cols-2 gap-2">
              <Input type="number" placeholder="Punkty" value={newReward.points || ""} onChange={(e) => setNewReward({ ...newReward, points: parseInt(e.target.value) || 0 })} />
              <select className="rounded-md border bg-background px-3 text-sm" value={newReward.type} onChange={(e) => setNewReward({ ...newReward, type: e.target.value as Reward["type"] })}>
                {Object.entries(TYPE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
            <div className="flex gap-2">
              <Button size="sm" onClick={() => {
                if (!newReward.name || !newReward.points) return toast.error("Wypełnij wszystkie pola");
                setRewards([...rewards, { ...newReward, id: Date.now().toString() }]);
                setAdding(false);
                setNewReward({ name: "", points: 0, type: "free_service" });
                toast.success("✓ Nagroda dodana");
              }}>Zapisz</Button>
              <Button size="sm" variant="ghost" onClick={() => setAdding(false)}>Anuluj</Button>
            </div>
          </div>
        )}
        {!adding && (
          <button onClick={() => setAdding(true)} className="w-full p-3 border-t border-dashed text-sm text-primary font-medium hover:bg-primary/5 flex items-center justify-center gap-2">
            <Plus className="w-4 h-4" /> Dodaj nagrodę
          </button>
        )}
      </div>

      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <span className="text-sm">Pokaż pasek postępu punktów klientce</span>
          <Switch checked={showProgress} onCheckedChange={setShowProgress} />
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm">Powiadom klientkę gdy zdobędzie nagrodę</span>
          <Switch checked={notifyReward} onCheckedChange={setNotifyReward} />
        </div>
      </div>
    </div>
  );
}
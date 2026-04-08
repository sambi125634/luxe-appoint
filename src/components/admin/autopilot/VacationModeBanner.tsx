import { useState } from "react";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";

export function VacationModeBanner() {
  const [isVacationMode, setIsVacationMode] = useState(false);
  const [showSetup, setShowSetup] = useState(false);
  const [vacationDates, setVacationDates] = useState({ from: "", to: "" });

  if (!isVacationMode) {
    return (
      <>
        <div className="flex items-center justify-between bg-muted/40 border border-border rounded-2xl p-4 mb-6">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🏖️</span>
            <div>
              <p className="text-sm font-semibold">Planujesz urlop?</p>
              <p className="text-xs text-muted-foreground">
                Autopilot zadba o klientki kiedy Cię nie będzie
              </p>
            </div>
          </div>
          <Button variant="outline" size="sm" className="text-xs" onClick={() => setShowSetup(true)}>
            Włącz tryb urlopowy
          </Button>
        </div>

        <Dialog open={showSetup} onOpenChange={setShowSetup}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <span>🏖️</span> Ustaw tryb urlopowy
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs mb-1 block">Data rozpoczęcia</Label>
                  <Input
                    type="date"
                    value={vacationDates.from}
                    onChange={(e) => setVacationDates((p) => ({ ...p, from: e.target.value }))}
                  />
                </div>
                <div>
                  <Label className="text-xs mb-1 block">Data powrotu</Label>
                  <Input
                    type="date"
                    value={vacationDates.to}
                    onChange={(e) => setVacationDates((p) => ({ ...p, to: e.target.value }))}
                  />
                </div>
              </div>

              <div className="bg-violet-50 border border-violet-100 rounded-xl p-4">
                <p className="text-xs font-semibold text-violet-800 mb-2">Autopilot automatycznie:</p>
                <div className="space-y-1.5">
                  {[
                    "Odpisze klientkom że salon jest zamknięty",
                    "Zaproponuje terminy po Twoim powrocie",
                    "Zbierze listę zainteresowanych",
                    "Wyśle przypomnienie dzień przed otwarciem",
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs text-violet-700">
                      <Check className="w-3.5 h-3.5 text-violet-500 flex-shrink-0" />
                      {item}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <Label className="text-xs mb-1 block">Wiadomość dla klientek (opcjonalna)</Label>
                <Textarea
                  placeholder="Np. Salon zamknięty od 15 do 22 lipca. Zapraszam po powrocie! 💛"
                  className="text-sm resize-none"
                  rows={3}
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                onClick={() => {
                  setIsVacationMode(true);
                  setShowSetup(false);
                }}
                className="w-full bg-violet-600 hover:bg-violet-700 gap-2"
              >
                <span>🏖️</span>
                Włącz tryb urlopowy
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </>
    );
  }

  return (
    <div className="bg-gradient-to-r from-violet-50 to-amber-50 border border-violet-200 rounded-2xl p-5 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🏖️</span>
          <div>
            <p className="text-sm font-bold text-violet-800">Tryb urlopowy aktywny</p>
            <p className="text-xs text-violet-600">
              {vacationDates.from} — {vacationDates.to} · Autopilot obsługuje Twoje klientki
            </p>
          </div>
        </div>
        <Button variant="outline" size="sm" className="text-xs" onClick={() => setIsVacationMode(false)}>
          Zakończ urlop
        </Button>
      </div>

      <div className="grid grid-cols-4 gap-3">
        {[
          { label: "Odpisane", value: "24", icon: "✉️" },
          { label: "Zainteresowane", value: "12", icon: "👀" },
          { label: "Zarezerwowane", value: "3", icon: "📅" },
          { label: "Po powrocie", value: "9", icon: "⏰" },
        ].map((stat, i) => (
          <div key={i} className="text-center">
            <span className="text-lg">{stat.icon}</span>
            <p className="text-lg font-bold text-violet-800">{stat.value}</p>
            <p className="text-[10px] text-violet-600">{stat.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/components/ui/collapsible";
import { ChevronDown } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { EMOJI_QUICK, DEMO_AUDIENCE_SEGMENTS, DEMO_BROADCAST_HISTORY } from "../demo/templatesData";

export function BroadcastTab() {
  const [title, setTitle] = useState("Wiosenna promocja 🌸");
  const [body, setBody] = useState("W maju -20% na wszystkie zabiegi twarzowe. Zarezerwuj do 15 maja!");
  const [audience, setAudience] = useState("active");
  const [schedule, setSchedule] = useState<"now" | "later">("now");
  const [scheduleDate, setScheduleDate] = useState("");
  const [scheduleTime, setScheduleTime] = useState("");
  const [confirm, setConfirm] = useState(false);
  const [history, setHistory] = useState(DEMO_BROADCAST_HISTORY);

  const selectedSeg = DEMO_AUDIENCE_SEGMENTS.find((s) => s.id === audience);

  const handleSend = () => {
    setHistory([
      { id: Date.now().toString(), date: "dzisiaj", title, recipients: selectedSeg?.count ?? 0, opens: 0, openRate: 0, clicks: 0, clickRate: 0 },
      ...history,
    ]);
    setConfirm(false);
    toast.success(`✓ Broadcast wysłany do ${selectedSeg?.count ?? 0} klientek`);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold flex items-center gap-2">📢 Wyślij wiadomość do klientek</h2>
        <p className="text-sm text-muted-foreground mt-1">Ręczna kampania push — Ty decydujesz kiedy i do kogo</p>
      </div>

      {/* Composer */}
      <div className="bg-card border rounded-2xl p-4 space-y-4">
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label>Tytuł powiadomienia</Label>
            <span className="text-xs text-muted-foreground">{title.length} / 50</span>
          </div>
          <Input maxLength={50} value={title} onChange={(e) => setTitle(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label>Treść</Label>
            <span className="text-xs text-muted-foreground">{body.length} / 150</span>
          </div>
          <Textarea maxLength={150} rows={3} value={body} onChange={(e) => setBody(e.target.value)} />
        </div>

        {/* Emoji picker */}
        <div className="flex flex-wrap gap-1">
          {EMOJI_QUICK.map((e) => (
            <button key={e} onClick={() => setBody(body + e)} className="w-8 h-8 hover:bg-muted rounded text-lg transition-colors">{e}</button>
          ))}
        </div>

        {/* Push preview */}
        <div className="flex justify-center">
          <div className="w-[240px] bg-gray-100 dark:bg-gray-800 rounded-xl p-2.5 shadow">
            <div className="bg-white dark:bg-gray-900 rounded-lg p-2.5 flex gap-2 items-start">
              <div className="w-7 h-7 rounded bg-primary flex-shrink-0 flex items-center justify-center text-white text-[10px] font-bold">📱</div>
              <div className="flex-1 min-w-0">
                <p className="text-[11px] font-bold text-gray-900 dark:text-gray-100 truncate">{title || "Tytuł powiadomienia"}</p>
                <p className="text-[10px] text-gray-600 dark:text-gray-300 line-clamp-2">{body || "Treść powiadomienia"}</p>
              </div>
            </div>
          </div>
        </div>
        <p className="text-center text-xs text-muted-foreground -mt-2">Podgląd na telefonie klientki</p>
      </div>

      {/* Audience */}
      <div className="space-y-3">
        <Label>Wyślij do:</Label>
        {DEMO_AUDIENCE_SEGMENTS.map((s) => (
          <button
            key={s.id}
            onClick={() => setAudience(s.id)}
            className={cn(
              "w-full flex items-center justify-between p-3 rounded-xl border transition-colors text-left",
              audience === s.id ? "border-primary bg-primary/5" : "border-border hover:bg-muted/40"
            )}
          >
            <div className="flex items-center gap-3">
              <div className={cn("w-4 h-4 rounded-full border-2", audience === s.id ? "border-primary bg-primary" : "border-muted-foreground")} />
              <span className="text-sm font-medium">{s.label}</span>
              <span className="text-xs text-muted-foreground">({s.count})</span>
              {s.recommended && <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300 font-semibold">Polecane</span>}
            </div>
          </button>
        ))}
      </div>

      {/* Schedule */}
      <div className="space-y-3">
        <Label>Kiedy wysłać?</Label>
        <div className="flex flex-col gap-2">
          <button onClick={() => setSchedule("now")} className={cn("flex items-center gap-2 p-3 rounded-xl border text-sm", schedule === "now" ? "border-primary bg-primary/5" : "border-border")}>
            <div className={cn("w-4 h-4 rounded-full border-2", schedule === "now" ? "border-primary bg-primary" : "border-muted-foreground")} />
            Wyślij teraz
          </button>
          <button onClick={() => setSchedule("later")} className={cn("flex items-center gap-3 p-3 rounded-xl border text-sm flex-wrap", schedule === "later" ? "border-primary bg-primary/5" : "border-border")}>
            <div className={cn("w-4 h-4 rounded-full border-2", schedule === "later" ? "border-primary bg-primary" : "border-muted-foreground")} />
            <span>Zaplanuj:</span>
            <Input type="date" value={scheduleDate} onChange={(e) => { setScheduleDate(e.target.value); setSchedule("later"); }} className="max-w-[150px] h-8" onClick={(e) => e.stopPropagation()} />
            <Input type="time" value={scheduleTime} onChange={(e) => { setScheduleTime(e.target.value); setSchedule("later"); }} className="max-w-[110px] h-8" onClick={(e) => e.stopPropagation()} />
          </button>
        </div>
      </div>

      <Button className="w-full" onClick={() => setConfirm(true)}>Wyślij broadcast</Button>

      {/* History */}
      <Collapsible>
        <CollapsibleTrigger className="flex items-center gap-2 text-sm font-medium hover:text-primary">
          Historia broadcastów (ostatnie 10) <ChevronDown className="w-4 h-4" />
        </CollapsibleTrigger>
        <CollapsibleContent className="mt-3">
          <div className="border rounded-xl overflow-hidden">
            <div className="grid grid-cols-[80px_1fr_60px_90px_90px] text-xs font-semibold bg-muted p-3">
              <span>Data</span><span>Tytuł</span><span>Odbiorcy</span><span>Otwarcia</span><span>Kliknięcia</span>
            </div>
            {history.map((h) => (
              <div key={h.id} className="grid grid-cols-[80px_1fr_60px_90px_90px] items-center text-sm p-3 border-t">
                <span className="text-muted-foreground text-xs">{h.date}</span>
                <span className="font-medium truncate">{h.title}</span>
                <span>{h.recipients}</span>
                <span>{h.opens} ({h.openRate}%)</span>
                <span>{h.clicks} ({h.clickRate}%)</span>
              </div>
            ))}
          </div>
        </CollapsibleContent>
      </Collapsible>

      <Dialog open={confirm} onOpenChange={setConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Wysyłasz push do {selectedSeg?.count ?? 0} klientek</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">Czy na pewno chcesz wysłać tę wiadomość?</p>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setConfirm(false)}>Anuluj</Button>
            <Button onClick={handleSend}>Wyślij</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Play, Pause, ChevronDown, ChevronUp, Package, Tag, CalendarPlus, FileText, Clock } from "lucide-react";
import { VoiceNote } from "@/hooks/useConsultations";
import { format } from "date-fns";
import { pl } from "date-fns/locale";
import { toast } from "sonner";

interface Props {
  note: VoiceNote;
  isDemo?: boolean;
}

export function VoiceNoteCard({ note, isDemo }: Props) {
  const [expanded, setExpanded] = useState(false);
  const [playing, setPlaying] = useState(false);

  const extracted = note.ai_extracted || {};
  const hasExtracted = (extracted.products?.length || 0) > 0 || (extracted.tags?.length || 0) > 0 || extracted.nextVisit || extracted.notes;

  const togglePlay = () => {
    if (isDemo) {
      setPlaying(!playing);
      if (!playing) setTimeout(() => setPlaying(false), 3000);
      return;
    }
    // Real audio playback
    setPlaying(!playing);
  };

  const formatDuration = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`;

  return (
    <Card>
      <CardContent className="py-4 space-y-3">
        {/* Header: audio player + date */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="outline" size="icon" className="rounded-full w-10 h-10" onClick={togglePlay}>
              {playing ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </Button>
            <div>
              {/* Waveform visualization */}
              <div className="flex items-center gap-0.5 h-6">
                {Array.from({ length: 30 }).map((_, i) => (
                  <div
                    key={i}
                    className={`w-0.5 rounded-full ${playing && i < 15 ? "bg-primary" : "bg-muted-foreground/30"}`}
                    style={{ height: `${Math.sin(i * 0.5) * 12 + 10}px` }}
                  />
                ))}
              </div>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {note.duration_seconds ? formatDuration(note.duration_seconds) : "--:--"}
              </p>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            {format(new Date(note.created_at), "d MMM, HH:mm", { locale: pl })}
          </p>
        </div>

        {/* Transcript (expandable) */}
        {note.transcript && (
          <div>
            <button
              onClick={() => setExpanded(!expanded)}
              className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <FileText className="w-3.5 h-3.5" />
              Transkrypcja
              {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
            {expanded && (
              <p className="text-sm mt-2 p-3 rounded-lg bg-muted/50 leading-relaxed">
                {note.transcript}
              </p>
            )}
          </div>
        )}

        {/* Extracted data chips */}
        {hasExtracted && (
          <div className="space-y-2">
            {(extracted.products?.length || 0) > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {extracted.products!.map((p) => (
                  <Badge key={p} variant="outline" className="gap-1 text-xs">
                    <Package className="w-3 h-3" /> {p}
                  </Badge>
                ))}
              </div>
            )}

            {(extracted.tags?.length || 0) > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {extracted.tags!.map((tag) => (
                  <Badge key={tag} variant="destructive" className="gap-1 text-xs">
                    <Tag className="w-3 h-3" /> {tag}
                  </Badge>
                ))}
              </div>
            )}

            {extracted.nextVisit && (
              <div className="flex items-center gap-2 p-2 rounded-lg bg-primary/5 border border-primary/20">
                <CalendarPlus className="w-4 h-4 text-primary" />
                <span className="text-sm">
                  Sugestia: <strong>{extracted.nextVisit.service}</strong> za {extracted.nextVisit.daysFromNow} dni
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  className="ml-auto text-xs"
                  onClick={() => toast.info(isDemo ? "Demo: Propozycja wysłana!" : "Funkcja wkrótce dostępna")}
                >
                  Wyślij propozycję
                </Button>
              </div>
            )}

            {extracted.notes && (
              <p className="text-xs text-muted-foreground italic">📝 {extracted.notes}</p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

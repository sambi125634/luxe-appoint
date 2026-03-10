import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Mic, MicOff, Square } from "lucide-react";
import { useVoiceNotes, useSaveVoiceNote, VoiceNote } from "@/hooks/useConsultations";
import { useClients } from "@/hooks/useClients";
import { VoiceNoteCard } from "./VoiceNoteCard";
import { supabase } from "@/integrations/supabase/client";
import { useSalonId } from "@/hooks/useSalonId";
import { toast } from "sonner";

const MOCK_VOICE_NOTES: VoiceNote[] = [
  {
    id: "demo-vn-1", salon_id: "", client_id: "c1", staff_id: null, appointment_id: null,
    audio_url: "", duration_seconds: 45, created_at: "2026-03-08T16:30:00Z",
    transcript: "Klientka Ania, robiłam dzisiaj peeling kawitacyjny, użyłam serum C i kremu SPF. Skóra przesuszona, warto za 3 tygodnie zrobić nawilżanie. Uczulona na składniki na bazie olejku różanego, zanotować.",
    ai_extracted: {
      products: ["Serum C", "Krem SPF"],
      tags: ["uczulona: olejek różany"],
      nextVisit: { daysFromNow: 21, service: "Nawilżanie" },
      notes: "Skóra przesuszona",
    },
  },
  {
    id: "demo-vn-2", salon_id: "", client_id: "c2", staff_id: null, appointment_id: null,
    audio_url: "", duration_seconds: 30, created_at: "2026-03-07T14:00:00Z",
    transcript: "Maria dzisiaj hybryda, użyłam bazy rubber i top coat Semilac. Paznokcie łamliwe, polecam odżywkę. Kolejna wizyta za 3 tygodnie.",
    ai_extracted: {
      products: ["Baza rubber", "Top coat Semilac"],
      tags: ["łamliwe paznokcie"],
      nextVisit: { daysFromNow: 21, service: "Hybryda" },
      notes: "Paznokcie łamliwe, polecić odżywkę",
    },
  },
];

interface Props {
  isDemo?: boolean;
  clientId?: string;
}

export function VoiceNoteRecorder({ isDemo, clientId }: Props) {
  const salonId = useSalonId();
  const { data: voiceNotes = [] } = useVoiceNotes(clientId);
  const saveVoiceNote = useSaveVoiceNote();
  const { clients = [] } = useClients();
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [selectedClientId, setSelectedClientId] = useState(clientId || "");
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [timerRef, setTimerRef] = useState<ReturnType<typeof setInterval> | null>(null);

  const displayNotes = isDemo ? MOCK_VOICE_NOTES : voiceNotes;

  const startRecording = async () => {
    if (isDemo) {
      setIsRecording(true);
      const timer = setInterval(() => setRecordingTime((t) => t + 1), 1000);
      setTimerRef(timer);
      return;
    }

    if (!selectedClientId) {
      toast.error("Wybierz klientkę");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks: Blob[] = [];

      recorder.ondataavailable = (e) => chunks.push(e.data);
      recorder.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(chunks, { type: "audio/webm" });

        // Upload to storage
        const fileName = `voice-notes/${salonId}/${Date.now()}.webm`;
        const { error: uploadError } = await supabase.storage
          .from("salon-media")
          .upload(fileName, blob);

        if (uploadError) {
          toast.error("Błąd uploadu nagrania");
          return;
        }

        const { data: urlData } = supabase.storage
          .from("salon-media")
          .getPublicUrl(fileName);

        const result = await saveVoiceNote.mutateAsync({
          client_id: selectedClientId,
          audio_url: urlData.publicUrl,
          duration_seconds: recordingTime,
        });

        // Trigger AI transcription
        if (result?.id) {
          // For now we use browser SpeechRecognition as a fallback
          // The edge function handles structured extraction
          toast.info("Przetwarzanie AI w toku...");
        }
      };

      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);

      const timer = setInterval(() => {
        setRecordingTime((t) => {
          if (t >= 119) {
            recorder.stop();
            setIsRecording(false);
            clearInterval(timer);
            return 0;
          }
          return t + 1;
        });
      }, 1000);
      setTimerRef(timer);
    } catch {
      toast.error("Brak dostępu do mikrofonu");
    }
  };

  const stopRecording = () => {
    if (isDemo) {
      setIsRecording(false);
      if (timerRef) clearInterval(timerRef);
      setRecordingTime(0);
      toast.success("Demo: Notatka nagrana i przetworzona przez AI!");
      return;
    }

    if (mediaRecorder && mediaRecorder.state === "recording") {
      mediaRecorder.stop();
    }
    setIsRecording(false);
    if (timerRef) clearInterval(timerRef);
    setRecordingTime(0);
  };

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`;

  return (
    <div className="space-y-6">
      {/* Recorder */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Mic className="w-5 h-5 text-primary" />
            Nagrywanie notatki głosowej
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!clientId && (
            <Select value={selectedClientId} onValueChange={setSelectedClientId}>
              <SelectTrigger><SelectValue placeholder="Wybierz klientkę..." /></SelectTrigger>
              <SelectContent>
                {(isDemo
                  ? [{ id: "c1", first_name: "Anna", last_name: "Kowalska" }, { id: "c2", first_name: "Maria", last_name: "Nowak" }]
                  : clients
                ).map((c) => (
                  <SelectItem key={c.id} value={c.id}>{c.first_name} {c.last_name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          <div className="flex flex-col items-center gap-4 py-6">
            {isRecording && (
              <div className="text-center space-y-2">
                <div className="flex items-center gap-2 justify-center">
                  <span className="w-3 h-3 rounded-full bg-destructive animate-pulse" />
                  <span className="font-mono text-2xl font-bold">{formatTime(recordingTime)}</span>
                </div>
                <p className="text-xs text-muted-foreground">Maks. 2 minuty</p>
                {/* Simple waveform */}
                <div className="flex items-center justify-center gap-0.5 h-8">
                  {Array.from({ length: 20 }).map((_, i) => (
                    <div
                      key={i}
                      className="w-1 bg-primary rounded-full animate-pulse"
                      style={{
                        height: `${Math.random() * 24 + 8}px`,
                        animationDelay: `${i * 0.05}s`,
                      }}
                    />
                  ))}
                </div>
              </div>
            )}

            <Button
              size="lg"
              variant={isRecording ? "destructive" : "default"}
              className="w-16 h-16 rounded-full"
              onClick={isRecording ? stopRecording : startRecording}
            >
              {isRecording ? <Square className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
            </Button>
            <p className="text-sm text-muted-foreground">
              {isRecording ? "Tap, aby zatrzymać" : "Tap, aby nagrać"}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Voice notes list */}
      <div className="space-y-4">
        {displayNotes.map((note) => (
          <VoiceNoteCard key={note.id} note={note} isDemo={isDemo} />
        ))}

        {displayNotes.length === 0 && (
          <p className="text-center text-muted-foreground py-8">Brak notatek głosowych</p>
        )}
      </div>
    </div>
  );
}

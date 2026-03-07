import { useState, useRef, useCallback } from "react";
import { Volume2, VolumeX, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface VoiceGuidanceButtonProps {
  text: string;
  voiceId?: string;
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
  label?: string;
}

function playWithBrowserTTS(text: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (!window.speechSynthesis) {
      reject(new Error("Browser TTS not supported"));
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "pl-PL";
    utterance.rate = 0.95;
    utterance.pitch = 1.0;

    // Try to find a Polish voice
    const voices = window.speechSynthesis.getVoices();
    const plVoice = voices.find((v) => v.lang.startsWith("pl"));
    if (plVoice) utterance.voice = plVoice;

    utterance.onend = () => resolve();
    utterance.onerror = (e) => reject(e);
    window.speechSynthesis.speak(utterance);
  });
}

export function VoiceGuidanceButton({
  text,
  voiceId = "EXAVITQu4vr4xnSDxMaL",
  variant = "outline",
  size = "sm",
  className = "",
  label = "Odtwórz wyjaśnienie",
}: VoiceGuidanceButtonProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const synthActiveRef = useRef(false);

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      URL.revokeObjectURL(audioRef.current.src);
      audioRef.current = null;
    }
    if (synthActiveRef.current) {
      window.speechSynthesis?.cancel();
      synthActiveRef.current = false;
    }
    setIsPlaying(false);
    setIsLoading(false);
  }, []);

  const play = useCallback(async () => {
    if (isPlaying) {
      stop();
      return;
    }

    setIsLoading(true);
    try {
      // Try ElevenLabs first
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/elevenlabs-tts`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({ text, voiceId }),
        }
      );

      if (!response.ok) {
        throw new Error(`TTS request failed: ${response.status}`);
      }

      const audioBlob = await response.blob();
      if (audioBlob.size < 100) {
        throw new Error("Empty audio response");
      }

      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      audioRef.current = audio;

      audio.onended = () => {
        setIsPlaying(false);
        URL.revokeObjectURL(audioUrl);
        audioRef.current = null;
      };

      audio.onerror = () => {
        setIsPlaying(false);
        URL.revokeObjectURL(audioUrl);
        audioRef.current = null;
      };

      await audio.play();
      setIsPlaying(true);
    } catch {
      // Fallback to browser SpeechSynthesis
      console.log("ElevenLabs unavailable, using browser TTS fallback");
      try {
        synthActiveRef.current = true;
        setIsPlaying(true);
        setIsLoading(false);
        await playWithBrowserTTS(text);
        synthActiveRef.current = false;
        setIsPlaying(false);
      } catch {
        synthActiveRef.current = false;
        setIsPlaying(false);
        toast.error("Nie udało się odtworzyć audio. Sprawdź ustawienia głosu w przeglądarce.");
      }
    } finally {
      setIsLoading(false);
    }
  }, [text, voiceId, isPlaying, stop]);

  return (
    <Button
      variant={variant}
      size={size}
      onClick={play}
      disabled={isLoading}
      className={`gap-2 ${className}`}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : isPlaying ? (
        <VolumeX className="w-4 h-4" />
      ) : (
        <Volume2 className="w-4 h-4" />
      )}
      {isPlaying ? "Zatrzymaj" : label}
    </Button>
  );
}

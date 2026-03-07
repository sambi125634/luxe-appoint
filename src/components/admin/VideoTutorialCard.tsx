import { Video, Volume2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { VoiceGuidanceButton } from "./VoiceGuidanceButton";

interface VideoTutorialCardProps {
  title: string;
  voiceText?: string;
  className?: string;
}

export function VideoTutorialCard({ title, voiceText, className = "" }: VideoTutorialCardProps) {
  return (
    <Card className={`border-border/40 bg-muted/20 ${className}`}>
      <CardContent className="flex items-center gap-4 py-4">
        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
          <Video className="w-5 h-5 text-primary/60" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground/80">{title}</p>
          <p className="text-xs text-muted-foreground">Wideo tutorial wkrótce dostępne</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {voiceText && (
            <VoiceGuidanceButton text={voiceText} size="sm" variant="ghost" label="Posłuchaj" />
          )}
          <Button variant="outline" size="sm" disabled className="opacity-50">
            <Video className="w-3.5 h-3.5 mr-1" />
            Wideo
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

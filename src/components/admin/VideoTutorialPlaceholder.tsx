import { Play, Video } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface VideoTutorialPlaceholderProps {
  title?: string;
  description?: string;
  className?: string;
}

export function VideoTutorialPlaceholder({ 
  title = "Wideo tutorial", 
  description = "Wkrótce pojawi się tu wideo z instrukcją krok po kroku.",
  className = ""
}: VideoTutorialPlaceholderProps) {
  return (
    <Card className={`border-dashed border-2 border-border/60 bg-muted/30 ${className}`}>
      <CardContent className="flex flex-col items-center justify-center py-8 gap-3">
        <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
          <Video className="w-7 h-7 text-primary/60" />
        </div>
        <div className="text-center">
          <p className="font-medium text-sm text-foreground/70">{title}</p>
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        </div>
        <Button variant="outline" size="sm" disabled className="gap-2 opacity-60">
          <Play className="w-3.5 h-3.5" />
          Wkrótce dostępne
        </Button>
      </CardContent>
    </Card>
  );
}

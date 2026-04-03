import { useState } from "react";
import { Star, Send, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface ReviewModalProps {
  open: boolean;
  onClose: () => void;
  bookingId: string;
  serviceName: string;
  salonName: string;
}

export function ReviewModal({ open, onClose, bookingId, serviceName, salonName }: ReviewModalProps) {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) {
      toast.error("Wybierz ocenę");
      return;
    }
    setSubmitting(true);
    // TODO: Save to DB when review table exists
    await new Promise((r) => setTimeout(r, 800));
    setSubmitting(false);
    toast.success("Dziękujemy za opinię! ⭐");
    onClose();
    setRating(0);
    setComment("");
  };

  const displayRating = hoveredRating || rating;

  const ratingLabels = ["", "Słabo", "Mogło być lepiej", "OK", "Bardzo dobrze", "Doskonale!"];

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-sm mx-auto rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-center text-lg">Oceń wizytę</DialogTitle>
        </DialogHeader>

        <div className="text-center mb-2">
          <p className="text-sm font-medium text-foreground">{serviceName}</p>
          <p className="text-xs text-muted-foreground">{salonName}</p>
        </div>

        {/* Star rating */}
        <div className="flex justify-center gap-2 py-4">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              onMouseEnter={() => setHoveredRating(star)}
              onMouseLeave={() => setHoveredRating(0)}
              onClick={() => setRating(star)}
              className="transition-transform hover:scale-110 active:scale-95"
            >
              <Star
                className={cn(
                  "h-10 w-10 transition-colors",
                  star <= displayRating
                    ? "text-primary fill-primary"
                    : "text-muted-foreground/30"
                )}
              />
            </button>
          ))}
        </div>

        {displayRating > 0 && (
          <p className="text-center text-sm font-medium text-primary mb-2">
            {ratingLabels[displayRating]}
          </p>
        )}

        {/* Comment */}
        <Textarea
          placeholder="Dodaj komentarz (opcjonalnie)..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          className="resize-none rounded-xl"
          rows={3}
        />

        <div className="flex gap-2 mt-2">
          <Button variant="outline" className="flex-1 rounded-xl" onClick={onClose}>
            <X className="h-4 w-4 mr-1" />
            Pomiń
          </Button>
          <Button
            className="flex-1 rounded-xl"
            onClick={handleSubmit}
            disabled={submitting || rating === 0}
          >
            <Send className="h-4 w-4 mr-1" />
            Wyślij
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

import { useState } from "react";
import { Star, Send, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";

interface ReviewModalProps {
  open: boolean;
  onClose: () => void;
  bookingId: string;
  serviceName: string;
  salonName: string;
  salonId: string;
}

export function ReviewModal({ open, onClose, bookingId, serviceName, salonName, salonId }: ReviewModalProps) {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const queryClient = useQueryClient();

  const handleSubmit = async () => {
    if (rating === 0) {
      toast.error("Wybierz ocenę");
      return;
    }
    setSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Nie zalogowano");

      const { error } = await supabase.from("client_reviews").insert({
        salon_id: salonId,
        user_id: user.id,
        appointment_id: bookingId,
        rating,
        comment: comment.trim() || null,
      });

      if (error) throw error;
      toast.success("Dziękujemy za opinię! ⭐");
      queryClient.invalidateQueries({ queryKey: ["client-reviews"] });
      onClose();
      setRating(0);
      setComment("");
    } catch (err: any) {
      toast.error(err.message || "Nie udało się zapisać opinii");
    } finally {
      setSubmitting(false);
    }
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
                  star <= displayRating ? "text-primary fill-primary" : "text-muted-foreground/30"
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

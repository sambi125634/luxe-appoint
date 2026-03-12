import { useState } from "react";
import { Lock, Plus, Trash2, Palette } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import {
  ClientTag,
  useCreateClientTag,
  useDeleteClientTag,
} from "@/hooks/useClientTags";

const PRESET_COLORS = [
  "#ef4444", "#f97316", "#f59e0b", "#eab308",
  "#22c55e", "#10b981", "#14b8a6", "#0ea5e9",
  "#3b82f6", "#6366f1", "#8b5cf6", "#a855f7",
  "#ec4899", "#e11d48", "#6b7280", "#64748b",
];

interface TagManagementDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tags: ClientTag[];
}

export function TagManagementDialog({ open, onOpenChange, tags }: TagManagementDialogProps) {
  const { toast } = useToast();
  const createTag = useCreateClientTag();
  const deleteTag = useDeleteClientTag();

  const [newName, setNewName] = useState("");
  const [newColor, setNewColor] = useState(PRESET_COLORS[0]);

  const handleCreate = async () => {
    if (!newName.trim()) {
      toast({ title: "Błąd", description: "Podaj nazwę tagu", variant: "destructive" });
      return;
    }
    if (tags.some(t => t.name.toLowerCase() === newName.trim().toLowerCase())) {
      toast({ title: "Błąd", description: "Tag o tej nazwie już istnieje", variant: "destructive" });
      return;
    }
    try {
      await createTag.mutateAsync({ name: newName.trim(), color: newColor });
      setNewName("");
      toast({ title: "Dodano", description: `Tag „${newName.trim()}" został dodany` });
    } catch {
      toast({ title: "Błąd", description: "Nie udało się dodać tagu", variant: "destructive" });
    }
  };

  const handleDelete = async (tag: ClientTag) => {
    try {
      await deleteTag.mutateAsync(tag.id);
      toast({ title: "Usunięto", description: `Tag „${tag.name}" został usunięty` });
    } catch {
      toast({ title: "Błąd", description: "Nie udało się usunąć tagu", variant: "destructive" });
    }
  };

  const systemTags = tags.filter(t => t.is_system);
  const customTags = tags.filter(t => !t.is_system);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-serif">Zarządzaj tagami</DialogTitle>
        </DialogHeader>

        {/* Add new tag */}
        <div className="space-y-3 border-b pb-4">
          <Label className="text-sm font-medium">Dodaj własny tag</Label>
          <div className="flex gap-2">
            <Input
              placeholder="Nazwa tagu..."
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="flex-1"
              onKeyDown={(e) => e.key === "Enter" && handleCreate()}
            />
            <Button onClick={handleCreate} size="sm" className="gap-1" disabled={createTag.isPending}>
              <Plus className="w-4 h-4" />
              Dodaj
            </Button>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {PRESET_COLORS.map((color) => (
              <button
                key={color}
                onClick={() => setNewColor(color)}
                className={cn(
                  "w-6 h-6 rounded-full border-2 transition-transform",
                  newColor === color ? "border-foreground scale-110" : "border-transparent"
                )}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
        </div>

        {/* Custom tags */}
        {customTags.length > 0 && (
          <div className="space-y-2">
            <Label className="text-sm font-medium flex items-center gap-2">
              <Palette className="w-4 h-4" />
              Własne tagi ({customTags.length})
            </Label>
            <div className="space-y-1">
              {customTags.map((tag) => (
                <div key={tag.id} className="flex items-center justify-between py-1.5 px-2 rounded-lg hover:bg-muted/50">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: tag.color }} />
                    <span className="text-sm">{tag.name}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-muted-foreground hover:text-destructive"
                    onClick={() => handleDelete(tag)}
                    disabled={deleteTag.isPending}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* System tags */}
        <div className="space-y-2">
          <Label className="text-sm font-medium flex items-center gap-2">
            <Lock className="w-4 h-4" />
            Tagi systemowe ({systemTags.length})
          </Label>
          <div className="flex flex-wrap gap-1.5">
            {systemTags.map((tag) => (
              <Badge
                key={tag.id}
                variant="secondary"
                className="text-xs gap-1"
                style={{
                  backgroundColor: tag.color + "20",
                  color: tag.color,
                  borderColor: tag.color + "40",
                }}
              >
                <Lock className="w-2.5 h-2.5" />
                {tag.name}
              </Badge>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

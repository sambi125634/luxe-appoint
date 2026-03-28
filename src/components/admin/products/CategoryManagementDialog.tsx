import { useState } from "react";
import { Settings, Plus, Edit, Trash2, GripVertical } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useProductCategories, type ProductCategory } from "@/hooks/useProductCategories";
import { cn } from "@/lib/utils";

const PRESET_EMOJIS = ["✨", "💆", "💇", "💅", "💄", "🌸", "🧴", "🧤", "🔧", "📦", "💎", "🪷", "🧖", "🎀", "🌿", "🧹", "💊", "🪒", "🩹", "🧪"];
const PRESET_COLORS = ["#7c3aed", "#ec4899", "#ef4444", "#f59e0b", "#22c55e", "#14b8a6", "#3b82f6", "#64748b"];

interface CategoryManagementDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  salonId?: string;
  productCountByCategory?: Record<string, number>;
}

export function CategoryManagementDialog({ open, onOpenChange, salonId, productCountByCategory = {} }: CategoryManagementDialogProps) {
  const { categories, createCategory, updateCategory, deleteCategory } = useProductCategories(salonId);

  const [newName, setNewName] = useState("");
  const [newIcon, setNewIcon] = useState("📦");
  const [newColor, setNewColor] = useState("#7c3aed");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");

  const handleAdd = () => {
    if (!newName.trim() || !salonId) return;
    createCategory.mutate({
      salon_id: salonId,
      name: newName.trim(),
      icon: newIcon,
      color: newColor,
      sort_order: categories.length + 1,
    });
    setNewName("");
    setNewIcon("📦");
    setNewColor("#7c3aed");
  };

  const handleUpdate = (cat: ProductCategory) => {
    if (!editName.trim()) return;
    updateCategory.mutate({ id: cat.id, name: editName.trim() });
    setEditingId(null);
  };

  const handleDelete = (cat: ProductCategory) => {
    const count = productCountByCategory[cat.name] || 0;
    if (count > 0) return;
    deleteCategory.mutate(cat.id);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Kategorie produktów
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-1">
            {categories.map((cat) => {
              const count = productCountByCategory[cat.name] || 0;
              const isEditing = editingId === cat.id;

              return (
                <div key={cat.id} className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted/50 group">
                  <GripVertical className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-50" />
                  <div className="w-4 h-4 rounded-full flex-shrink-0" style={{ backgroundColor: cat.color || "#7c3aed" }} />
                  <span className="text-lg flex-shrink-0">{cat.icon}</span>

                  {isEditing ? (
                    <Input
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleUpdate(cat)}
                      onBlur={() => handleUpdate(cat)}
                      className="h-8 flex-1"
                      autoFocus
                    />
                  ) : (
                    <span className="flex-1 text-sm font-medium">{cat.name}</span>
                  )}

                  {cat.is_default && (
                    <Badge variant="secondary" className="text-[10px] px-1.5 py-0">Domyślna</Badge>
                  )}

                  <span className="text-xs text-muted-foreground">{count} prod.</span>

                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 opacity-0 group-hover:opacity-100"
                    onClick={() => { setEditingId(cat.id); setEditName(cat.name); }}
                  >
                    <Edit className="w-3 h-3" />
                  </Button>

                  {!cat.is_default && count === 0 && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 opacity-0 group-hover:opacity-100 text-destructive"
                      onClick={() => handleDelete(cat)}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  )}
                </div>
              );
            })}
          </div>

          <div className="border-t pt-4 space-y-3">
            <Label className="text-sm font-semibold">Nowa kategoria</Label>

            <div>
              <Label className="text-xs text-muted-foreground mb-1 block">Ikona</Label>
              <div className="flex flex-wrap gap-1">
                {PRESET_EMOJIS.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    className={cn(
                      "w-8 h-8 rounded-md flex items-center justify-center text-lg hover:bg-muted transition-colors",
                      newIcon === emoji && "ring-2 ring-primary bg-primary/10"
                    )}
                    onClick={() => setNewIcon(emoji)}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <Label className="text-xs text-muted-foreground mb-1 block">Kolor</Label>
              <div className="flex gap-2">
                {PRESET_COLORS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    className={cn(
                      "w-7 h-7 rounded-full transition-transform hover:scale-110",
                      newColor === color && "ring-2 ring-offset-2 ring-primary"
                    )}
                    style={{ backgroundColor: color }}
                    onClick={() => setNewColor(color)}
                  />
                ))}
              </div>
            </div>

            <div className="flex gap-2">
              <Input
                placeholder="Nazwa kategorii"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAdd()}
                className="flex-1"
              />
              <Button onClick={handleAdd} disabled={!newName.trim()} size="sm" className="gap-1">
                <Plus className="w-4 h-4" />
                Dodaj
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

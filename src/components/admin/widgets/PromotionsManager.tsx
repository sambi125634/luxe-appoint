import { useState } from "react";
import { 
  Plus, 
  Tag, 
  Percent, 
  Calendar,
  MoreVertical,
  Trash2,
  Edit,
  Copy,
  Check,
  X,
  Clock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { WidgetPromotion } from "./types";
import { format } from "date-fns";
import { pl } from "date-fns/locale";

interface PromotionsManagerProps {
  promotions: WidgetPromotion[];
  onUpdate: (promotions: WidgetPromotion[]) => void;
}

export function PromotionsManager({ promotions, onUpdate }: PromotionsManagerProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPromo, setEditingPromo] = useState<WidgetPromotion | null>(null);
  const [formData, setFormData] = useState<Partial<WidgetPromotion>>({
    name: "",
    type: "percentage",
    value: 10,
    code: "",
    isActive: true,
    applicableServices: [],
    usedCount: 0,
  });

  const handleCreate = () => {
    setEditingPromo(null);
    setFormData({
      name: "",
      type: "percentage",
      value: 10,
      code: "",
      isActive: true,
      applicableServices: [],
      usedCount: 0,
    });
    setIsModalOpen(true);
  };

  const handleEdit = (promo: WidgetPromotion) => {
    setEditingPromo(promo);
    setFormData(promo);
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (!formData.name || !formData.value) {
      toast.error("Wypełnij wymagane pola");
      return;
    }

    if (editingPromo) {
      onUpdate(promotions.map(p => 
        p.id === editingPromo.id ? { ...editingPromo, ...formData } as WidgetPromotion : p
      ));
      toast.success("Promocja zaktualizowana");
    } else {
      const newPromo: WidgetPromotion = {
        id: Date.now().toString(),
        name: formData.name!,
        type: formData.type as "percentage" | "fixed" | "package",
        value: formData.value!,
        code: formData.code,
        validFrom: formData.validFrom,
        validTo: formData.validTo,
        minPurchase: formData.minPurchase,
        maxUses: formData.maxUses,
        usedCount: 0,
        applicableServices: formData.applicableServices || [],
        isActive: formData.isActive ?? true,
      };
      onUpdate([...promotions, newPromo]);
      toast.success("Promocja utworzona");
    }
    setIsModalOpen(false);
  };

  const handleDelete = (promo: WidgetPromotion) => {
    onUpdate(promotions.filter(p => p.id !== promo.id));
    toast.success("Promocja usunięta");
  };

  const handleToggleActive = (promo: WidgetPromotion) => {
    onUpdate(promotions.map(p => 
      p.id === promo.id ? { ...p, isActive: !p.isActive } : p
    ));
    toast.success(promo.isActive ? "Promocja wyłączona" : "Promocja włączona");
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success("Kod skopiowany!");
  };

  const getPromoStatus = (promo: WidgetPromotion) => {
    const now = new Date();
    if (!promo.isActive) return "inactive";
    if (promo.validFrom && new Date(promo.validFrom) > now) return "scheduled";
    if (promo.validTo && new Date(promo.validTo) < now) return "expired";
    if (promo.maxUses && promo.usedCount >= promo.maxUses) return "used_up";
    return "active";
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-500/10 text-green-600 border-green-500/20">Aktywna</Badge>;
      case "scheduled":
        return <Badge className="bg-blue-500/10 text-blue-600 border-blue-500/20">Zaplanowana</Badge>;
      case "expired":
        return <Badge className="bg-red-500/10 text-red-600 border-red-500/20">Wygasła</Badge>;
      case "used_up":
        return <Badge className="bg-orange-500/10 text-orange-600 border-orange-500/20">Wykorzystana</Badge>;
      case "inactive":
        return <Badge variant="outline" className="text-muted-foreground">Nieaktywna</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Promocje i kody rabatowe</h3>
          <p className="text-sm text-muted-foreground">
            Zarządzaj zniżkami i kodami promocyjnymi
          </p>
        </div>
        <Button variant="luxury" className="gap-2" onClick={handleCreate}>
          <Plus className="w-4 h-4" />
          Nowa promocja
        </Button>
      </div>

      {/* Promotions Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {promotions.map((promo) => {
          const status = getPromoStatus(promo);
          const usagePercent = promo.maxUses ? (promo.usedCount / promo.maxUses) * 100 : 0;
          
          return (
            <Card key={promo.id} className={`relative ${status === 'inactive' ? 'opacity-60' : ''}`}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-lg flex items-center gap-2">
                      {promo.type === "percentage" ? (
                        <Percent className="w-4 h-4 text-primary" />
                      ) : (
                        <Tag className="w-4 h-4 text-primary" />
                      )}
                      {promo.name}
                    </CardTitle>
                    {getStatusBadge(status)}
                  </div>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleEdit(promo)}>
                        <Edit className="w-4 h-4 mr-2" />
                        Edytuj
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleToggleActive(promo)}>
                        {promo.isActive ? (
                          <>
                            <X className="w-4 h-4 mr-2" />
                            Wyłącz
                          </>
                        ) : (
                          <>
                            <Check className="w-4 h-4 mr-2" />
                            Włącz
                          </>
                        )}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        onClick={() => handleDelete(promo)}
                        className="text-destructive"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Usuń
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Value */}
                <div className="text-3xl font-bold text-primary">
                  {promo.type === "percentage" ? `-${promo.value}%` : `-${promo.value} zł`}
                </div>
                
                {/* Code */}
                {promo.code && (
                  <div 
                    className="flex items-center justify-between p-2 bg-muted rounded-lg cursor-pointer hover:bg-muted/80 transition-colors"
                    onClick={() => handleCopyCode(promo.code!)}
                  >
                    <code className="font-mono font-medium">{promo.code}</code>
                    <Copy className="w-4 h-4 text-muted-foreground" />
                  </div>
                )}
                
                {/* Dates */}
                {(promo.validFrom || promo.validTo) && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    <span>
                      {promo.validFrom && format(new Date(promo.validFrom), "d MMM", { locale: pl })}
                      {promo.validFrom && promo.validTo && " - "}
                      {promo.validTo && format(new Date(promo.validTo), "d MMM yyyy", { locale: pl })}
                    </span>
                  </div>
                )}
                
                {/* Usage */}
                {promo.maxUses && (
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Wykorzystanie</span>
                      <span>{promo.usedCount} / {promo.maxUses}</span>
                    </div>
                    <Progress value={usagePercent} className="h-2" />
                  </div>
                )}
                
                {!promo.maxUses && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    <span>Użyto {promo.usedCount} razy</span>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}

        {/* Create new card */}
        <Card 
          className="border-dashed cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-colors"
          onClick={handleCreate}
        >
          <CardContent className="flex flex-col items-center justify-center h-full min-h-[240px] text-center">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <Plus className="w-6 h-6 text-primary" />
            </div>
            <h3 className="font-medium mb-1">Dodaj promocję</h3>
            <p className="text-sm text-muted-foreground">
              Utwórz kod rabatowy lub zniżkę
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Create/Edit Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingPromo ? "Edytuj promocję" : "Nowa promocja"}
            </DialogTitle>
            <DialogDescription>
              {editingPromo ? "Zaktualizuj szczegóły promocji" : "Wypełnij szczegóły nowej promocji"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Nazwa promocji</Label>
              <Input
                placeholder="np. Black Friday 30%"
                value={formData.name || ""}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Typ zniżki</Label>
                <Select
                  value={formData.type}
                  onValueChange={(v) => setFormData({ ...formData, type: v as any })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">Procent (%)</SelectItem>
                    <SelectItem value="fixed">Kwota (zł)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>Wartość</Label>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    value={formData.value || ""}
                    onChange={(e) => setFormData({ ...formData, value: Number(e.target.value) })}
                  />
                  <span className="px-3 py-2 bg-muted rounded-md text-sm">
                    {formData.type === "percentage" ? "%" : "zł"}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Kod promocyjny (opcjonalnie)</Label>
              <Input
                placeholder="np. BLACKFRIDAY30"
                value={formData.code || ""}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Ważna od</Label>
                <Input
                  type="date"
                  value={formData.validFrom ? format(new Date(formData.validFrom), 'yyyy-MM-dd') : ''}
                  onChange={(e) => setFormData({ ...formData, validFrom: e.target.value ? new Date(e.target.value) : undefined })}
                />
              </div>
              <div className="space-y-2">
                <Label>Ważna do</Label>
                <Input
                  type="date"
                  value={formData.validTo ? format(new Date(formData.validTo), 'yyyy-MM-dd') : ''}
                  onChange={(e) => setFormData({ ...formData, validTo: e.target.value ? new Date(e.target.value) : undefined })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Maksymalna liczba użyć (opcjonalnie)</Label>
              <Input
                type="number"
                placeholder="Bez limitu"
                value={formData.maxUses || ""}
                onChange={(e) => setFormData({ ...formData, maxUses: e.target.value ? Number(e.target.value) : undefined })}
              />
            </div>

            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <Label>Promocja aktywna</Label>
              <Switch
                checked={formData.isActive}
                onCheckedChange={(v) => setFormData({ ...formData, isActive: v })}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Anuluj
            </Button>
            <Button variant="luxury" onClick={handleSave}>
              {editingPromo ? "Zapisz zmiany" : "Utwórz promocję"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

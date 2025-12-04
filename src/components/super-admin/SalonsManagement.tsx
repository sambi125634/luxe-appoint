import { useState, useEffect } from "react";
import { Search, Plus, Building2, Mail, Phone, MapPin, Edit, Trash2, Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format } from "date-fns";
import { pl } from "date-fns/locale";

interface Salon {
  id: string;
  name: string;
  slug: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  is_active: boolean;
  owner_id: string | null;
  created_at: string;
}

interface SalonFormData {
  name: string;
  slug: string;
  email: string;
  phone: string;
  address: string;
  city: string;
}

export function SalonsManagement() {
  const [salons, setSalons] = useState<Salon[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedSalon, setSelectedSalon] = useState<Salon | null>(null);
  const [formData, setFormData] = useState<SalonFormData>({
    name: "",
    slug: "",
    email: "",
    phone: "",
    address: "",
    city: "",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSalons();
  }, []);

  const fetchSalons = async () => {
    try {
      const { data, error } = await supabase
        .from("salons")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setSalons(data || []);
    } catch (error) {
      console.error("Error fetching salons:", error);
      toast.error("Błąd podczas pobierania salonów");
    } finally {
      setLoading(false);
    }
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim();
  };

  const handleNameChange = (name: string) => {
    setFormData({
      ...formData,
      name,
      slug: generateSlug(name),
    });
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.slug) {
      toast.error("Nazwa i slug są wymagane");
      return;
    }

    setSaving(true);
    try {
      if (selectedSalon) {
        // Update existing salon
        const { error } = await supabase
          .from("salons")
          .update({
            name: formData.name,
            slug: formData.slug,
            email: formData.email || null,
            phone: formData.phone || null,
            address: formData.address || null,
            city: formData.city || null,
          })
          .eq("id", selectedSalon.id);

        if (error) throw error;
        toast.success("Salon zaktualizowany");
      } else {
        // Create new salon
        const { error } = await supabase
          .from("salons")
          .insert({
            name: formData.name,
            slug: formData.slug,
            email: formData.email || null,
            phone: formData.phone || null,
            address: formData.address || null,
            city: formData.city || null,
          });

        if (error) throw error;
        toast.success("Salon utworzony");
      }

      setFormOpen(false);
      resetForm();
      fetchSalons();
    } catch (error: any) {
      console.error("Error saving salon:", error);
      if (error.code === "23505") {
        toast.error("Salon z takim slug już istnieje");
      } else {
        toast.error("Błąd podczas zapisywania");
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedSalon) return;

    try {
      const { error } = await supabase
        .from("salons")
        .delete()
        .eq("id", selectedSalon.id);

      if (error) throw error;
      toast.success("Salon usunięty");
      setDeleteDialogOpen(false);
      setSelectedSalon(null);
      fetchSalons();
    } catch (error) {
      console.error("Error deleting salon:", error);
      toast.error("Błąd podczas usuwania salonu");
    }
  };

  const toggleSalonActive = async (salon: Salon) => {
    try {
      const { error } = await supabase
        .from("salons")
        .update({ is_active: !salon.is_active })
        .eq("id", salon.id);

      if (error) throw error;
      
      setSalons(salons.map(s => 
        s.id === salon.id ? { ...s, is_active: !s.is_active } : s
      ));
      toast.success(salon.is_active ? "Salon dezaktywowany" : "Salon aktywowany");
    } catch (error) {
      console.error("Error toggling salon:", error);
      toast.error("Błąd podczas zmiany statusu");
    }
  };

  const openEditForm = (salon: Salon) => {
    setSelectedSalon(salon);
    setFormData({
      name: salon.name,
      slug: salon.slug,
      email: salon.email || "",
      phone: salon.phone || "",
      address: salon.address || "",
      city: salon.city || "",
    });
    setFormOpen(true);
  };

  const resetForm = () => {
    setSelectedSalon(null);
    setFormData({
      name: "",
      slug: "",
      email: "",
      phone: "",
      address: "",
      city: "",
    });
  };

  const filteredSalons = salons.filter(salon =>
    salon.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    salon.slug.toLowerCase().includes(searchQuery.toLowerCase()) ||
    salon.city?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    salon.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Szukaj salonu..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button onClick={() => { resetForm(); setFormOpen(true); }}>
          <Plus className="w-4 h-4 mr-2" />
          Dodaj salon
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="glass-card p-4 text-center">
          <p className="text-2xl font-serif font-semibold">{salons.filter(s => s.is_active).length}</p>
          <p className="text-xs text-muted-foreground">Aktywnych</p>
        </div>
        <div className="glass-card p-4 text-center">
          <p className="text-2xl font-serif font-semibold">{salons.filter(s => !s.is_active).length}</p>
          <p className="text-xs text-muted-foreground">Nieaktywnych</p>
        </div>
      </div>

      {/* Table */}
      <div className="glass-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Salon</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Miasto</TableHead>
              <TableHead>Kontakt</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Utworzono</TableHead>
              <TableHead className="w-24">Akcje</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredSalons.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  Brak salonów do wyświetlenia
                </TableCell>
              </TableRow>
            ) : (
              filteredSalons.map((salon) => (
                <TableRow key={salon.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-muted-foreground" />
                      <span className="font-medium">{salon.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <code className="text-xs bg-muted px-2 py-1 rounded">/s/{salon.slug}</code>
                  </TableCell>
                  <TableCell>
                    {salon.city ? (
                      <div className="flex items-center gap-1 text-sm">
                        <MapPin className="w-3 h-3 text-muted-foreground" />
                        {salon.city}
                      </div>
                    ) : (
                      <span className="text-muted-foreground text-sm">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      {salon.email && (
                        <div className="flex items-center gap-1 text-xs">
                          <Mail className="w-3 h-3 text-muted-foreground" />
                          {salon.email}
                        </div>
                      )}
                      {salon.phone && (
                        <div className="flex items-center gap-1 text-xs">
                          <Phone className="w-3 h-3 text-muted-foreground" />
                          {salon.phone}
                        </div>
                      )}
                      {!salon.email && !salon.phone && (
                        <span className="text-muted-foreground text-sm">—</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={salon.is_active}
                        onCheckedChange={() => toggleSalonActive(salon)}
                      />
                      <Badge variant={salon.is_active ? "default" : "secondary"}>
                        {salon.is_active ? "Aktywny" : "Nieaktywny"}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {format(new Date(salon.created_at), "d MMM yyyy", { locale: pl })}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon" onClick={() => openEditForm(salon)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => {
                          setSelectedSalon(salon);
                          setDeleteDialogOpen(true);
                        }}
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Form Dialog */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-serif">
              {selectedSalon ? "Edytuj salon" : "Dodaj nowy salon"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nazwa salonu *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="Np. Luxury Beauty Spa"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="slug">Slug (URL) *</Label>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">/s/</span>
                <Input
                  id="slug"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  placeholder="luxury-beauty-spa"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="kontakt@salon.pl"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Telefon</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+48 123 456 789"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Adres</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="ul. Piękna 15"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="city">Miasto</Label>
              <Input
                id="city"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                placeholder="Warszawa"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setFormOpen(false)}>Anuluj</Button>
            <Button onClick={handleSubmit} disabled={saving}>
              {saving ? "Zapisywanie..." : selectedSalon ? "Zapisz zmiany" : "Utwórz salon"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Czy na pewno chcesz usunąć ten salon?</AlertDialogTitle>
            <AlertDialogDescription>
              Ta akcja jest nieodwracalna. Wszystkie dane związane z salonem "{selectedSalon?.name}" zostaną trwale usunięte.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Anuluj</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Usuń salon
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

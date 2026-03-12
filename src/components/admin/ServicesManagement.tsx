import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Plus, Pencil, Trash2, Clock, Banknote, Search, FolderOpen, Upload, Image, Video, Package, LayoutGrid, LayoutList, X, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { ServiceMediaUpload, MediaFile } from "./ServiceMediaUpload";
import { CSVImport } from "./CSVImport";
import { SectionGuide } from "./SectionGuide";
import { useServices, useServiceCategories, useCreateService, useUpdateService, useDeleteService, useCreateCategory, useUpdateCategory, useDeleteCategory, useSyncStaffServices } from "@/hooks/useServices";
import { useStaffMembers } from "@/hooks/useStaffMembers";
import { useSalonId } from "@/hooks/useSalonId";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

interface Service {
  id: string;
  name: string;
  category: string;
  duration: number;
  price: number;
  description: string;
  staffIds: string[];
  media: MediaFile[];
  benefits: string[];
  vatRate: number;
}

interface Category {
  id: string;
  name: string;
  icon: string;
}

// Demo data
const DEMO_CATEGORIES: Category[] = [
  { id: "1", name: "Twarz", icon: "✨" },
  { id: "2", name: "Ciało", icon: "💆" },
  { id: "3", name: "Depilacja", icon: "🌸" },
  { id: "4", name: "Paznokcie", icon: "💅" },
];

const DEMO_SERVICES: Service[] = [
  {
    id: "1", name: "Peeling kawitacyjny", category: "1", duration: 60, price: 150,
    description: "Głębokie oczyszczanie skóry twarzy ultradźwiękami. Zabieg delikatnie usuwa martwy naskórek, oczyszcza pory i przygotowuje skórę na dalszą pielęgnację.",
    staffIds: ["1", "2"],
    media: [{ id: "d1", type: "image", url: "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=600&h=400&fit=crop", name: "peeling.jpg" }],
    benefits: ["Oczyszczenie porów", "Rozjaśnienie cery", "Bezbolesny zabieg"],
    vatRate: 23,
  },
  {
    id: "2", name: "Mezoterapia igłowa", category: "1", duration: 45, price: 350,
    description: "Regeneracja i nawilżenie skóry poprzez mikroiniekcje kwasu hialuronowego i koktajli witaminowych.",
    staffIds: ["1"],
    media: [{ id: "d2", type: "image", url: "https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?w=600&h=400&fit=crop", name: "mezoterapia.jpg" }],
    benefits: ["Głębokie nawilżenie", "Redukcja zmarszczek", "Efekt glow"],
    vatRate: 23,
  },
  {
    id: "3", name: "Masaż relaksacyjny", category: "2", duration: 90, price: 200,
    description: "Pełen relaks dla ciała i umysłu. Masaż z użyciem olejków aromaterapeutycznych.",
    staffIds: ["3"],
    media: [{ id: "d3", type: "image", url: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=600&h=400&fit=crop", name: "masaz.jpg" }],
    benefits: ["Redukcja stresu", "Rozluźnienie mięśni", "Aromaterapia"],
    vatRate: 23,
  },
  {
    id: "4", name: "Depilacja laserowa - nogi", category: "3", duration: 60, price: 400,
    description: "Trwałe usuwanie owłosienia laserem diodowym. Skuteczne na każdym fototypie skóry.",
    staffIds: ["1", "4"],
    media: [{ id: "d4", type: "image", url: "https://images.unsplash.com/photo-1560750588-73207b1ef5b8?w=600&h=400&fit=crop", name: "depilacja.jpg" }],
    benefits: ["Trwałe efekty", "Bezbolesna procedura", "Gładka skóra"],
    vatRate: 23,
  },
  {
    id: "5", name: "Manicure hybrydowy", category: "4", duration: 75, price: 120,
    description: "Stylizacja paznokci lakierem hybrydowym z pielęgnacją dłoni.",
    staffIds: ["2", "4"],
    media: [{ id: "d5", type: "image", url: "https://images.unsplash.com/photo-1604654894610-df63bc536371?w=600&h=400&fit=crop", name: "manicure.jpg" }],
    benefits: ["Trwałość do 3 tyg.", "Szeroka paleta kolorów", "Pielęgnacja skórek"],
    vatRate: 23,
  },
];

const DEMO_STAFF = [
  { id: "1", name: "Maria Nowakowska" },
  { id: "2", name: "Karolina Wiśniewska" },
  { id: "3", name: "Joanna Lewandowska" },
  { id: "4", name: "Anna Kowalczyk" },
];

interface ServicesManagementProps {
  isDemo?: boolean;
}

export function ServicesManagement({ isDemo = false }: ServicesManagementProps) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { salonId } = useSalonId();

  // Supabase data
  const { data: dbServices, isLoading: loadingServices } = useServices();
  const { data: dbCategories, isLoading: loadingCategories } = useServiceCategories();
  const { data: dbStaff } = useStaffMembers();
  const createServiceMutation = useCreateService();
  const updateServiceMutation = useUpdateService();
  const deleteServiceMutation = useDeleteService();
  const createCategoryMutation = useCreateCategory();
  const updateCategoryMutation = useUpdateCategory();
  const deleteCategoryMutation = useDeleteCategory();
  const syncStaffServicesMutation = useSyncStaffServices();

  const services: Service[] = useMemo(() => {
    if (isDemo) return DEMO_SERVICES;
    if (!dbServices) return [];
    return dbServices.map(s => ({
      id: s.id,
      name: s.name,
      category: s.category_id || "",
      duration: s.duration,
      price: Number(s.price),
      description: s.description || "",
      staffIds: [],
      media: (s.media as unknown as MediaFile[]) || [],
      benefits: (s.benefits as unknown as string[]) || [],
      vatRate: Number(s.vat_rate) || 23,
    }));
  }, [isDemo, dbServices]);

  const categories: Category[] = useMemo(() => {
    if (isDemo) return DEMO_CATEGORIES;
    if (!dbCategories) return [];
    return dbCategories.map(c => ({
      id: c.id,
      name: c.name,
      icon: c.icon || "✨",
    }));
  }, [isDemo, dbCategories]);

  const staffList = useMemo(() => {
    if (isDemo) return DEMO_STAFF;
    if (!dbStaff) return [];
    return dbStaff.map(s => ({ id: s.id, name: s.name }));
  }, [isDemo, dbStaff]);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [isServiceDialogOpen, setIsServiceDialogOpen] = useState(false);
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [isCSVImportOpen, setIsCSVImportOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [benefitInput, setBenefitInput] = useState("");

  const [serviceForm, setServiceForm] = useState({
    name: "", category: "", duration: 60, price: 0, description: "", staffIds: [] as string[], media: [] as MediaFile[], benefits: [] as string[], vatRate: 23,
  });

  const [categoryForm, setCategoryForm] = useState({ name: "", icon: "✨" });

  const isFormValid = serviceForm.name.trim().length > 0 && serviceForm.duration > 0 && serviceForm.price >= 0;

  const filteredServices = services.filter(service => {
    const matchesSearch = service.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || service.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const openServiceDialog = (service?: Service) => {
    if (service) {
      setEditingService(service);
      setServiceForm({
        name: service.name, category: service.category, duration: service.duration,
        price: service.price, description: service.description, staffIds: service.staffIds,
        media: service.media || [], benefits: service.benefits || [], vatRate: service.vatRate || 23,
      });
    } else {
      setEditingService(null);
      setServiceForm({ name: "", category: categories[0]?.id || "", duration: 60, price: 0, description: "", staffIds: [], media: [], benefits: [], vatRate: 23 });
    }
    setBenefitInput("");
    setIsServiceDialogOpen(true);
  };

  const addBenefit = () => {
    const trimmed = benefitInput.trim();
    if (trimmed && !serviceForm.benefits.includes(trimmed)) {
      setServiceForm(prev => ({ ...prev, benefits: [...prev.benefits, trimmed] }));
      setBenefitInput("");
    }
  };

  const removeBenefit = (benefit: string) => {
    setServiceForm(prev => ({ ...prev, benefits: prev.benefits.filter(b => b !== benefit) }));
  };

  const handleCSVImport = async (importedServices: { name: string; category: string; duration: number; price: number; description: string }[]) => {
    if (isDemo) {
      toast({ title: "Tryb Demo", description: `Zaimportowano ${importedServices.length} usług (dane nie zostały zapisane)` });
      return;
    }

    try {
      let successCount = 0;
      for (const service of importedServices) {
        const matchingCategory = categories.find(c => c.name.toLowerCase() === service.category.toLowerCase());
        await createServiceMutation.mutateAsync({
          name: service.name,
          category_id: matchingCategory?.id || undefined,
          duration: service.duration,
          price: service.price,
          description: service.description,
        });
        successCount++;
      }
      toast({ title: "Import CSV", description: `Zaimportowano ${successCount} usług` });
    } catch {
      toast({ title: "Błąd importu", description: "Nie udało się zaimportować wszystkich usług", variant: "destructive" });
    }
  };

  const saveService = async () => {
    if (!isFormValid) return;

    if (isDemo) {
      toast({ title: "Zapisano", description: "Demo – dane nie zostały zapisane" });
      setIsServiceDialogOpen(false);
      return;
    }

    try {
      const payload = {
        name: serviceForm.name.trim(),
        category_id: serviceForm.category || undefined,
        duration: serviceForm.duration,
        price: serviceForm.price,
        description: serviceForm.description,
        media: serviceForm.media as unknown as import("@/integrations/supabase/types").Json,
        benefits: serviceForm.benefits as unknown as import("@/integrations/supabase/types").Json,
        vat_rate: serviceForm.vatRate,
      };

      let savedId: string;

      if (editingService) {
        const result = await updateServiceMutation.mutateAsync({ id: editingService.id, ...payload });
        savedId = result.id;
      } else {
        const result = await createServiceMutation.mutateAsync(payload);
        savedId = result.id;
      }

      // Sync staff_services
      if (serviceForm.staffIds.length > 0) {
        await syncStaffServicesMutation.mutateAsync({ serviceId: savedId, staffIds: serviceForm.staffIds });
      }

      toast({ title: "Usługa zapisana", description: `"${serviceForm.name}" została zapisana pomyślnie.` });
      setIsServiceDialogOpen(false);
    } catch {
      toast({ title: "Błąd", description: "Nie udało się zapisać usługi", variant: "destructive" });
    }
  };

  const confirmDeleteService = async (id: string, name: string) => {
    if (isDemo) return;
    try {
      await deleteServiceMutation.mutateAsync(id);
      toast({ title: "Usługa usunięta", description: `"${name}" została usunięta.` });
    } catch {
      toast({ title: "Błąd", description: "Nie udało się usunąć usługi", variant: "destructive" });
    }
  };

  const openCategoryDialog = (category?: Category) => {
    if (category) {
      setEditingCategory(category);
      setCategoryForm({ name: category.name, icon: category.icon });
    } else {
      setEditingCategory(null);
      setCategoryForm({ name: "", icon: "✨" });
    }
    setIsCategoryDialogOpen(true);
  };

  const saveCategory = async () => {
    if (!categoryForm.name.trim()) return;

    if (isDemo) {
      toast({ title: "Zapisano", description: "Demo – dane nie zostały zapisane" });
      setIsCategoryDialogOpen(false);
      return;
    }

    try {
      if (editingCategory) {
        await updateCategoryMutation.mutateAsync({ id: editingCategory.id, name: categoryForm.name, icon: categoryForm.icon });
      } else {
        await createCategoryMutation.mutateAsync({ name: categoryForm.name, icon: categoryForm.icon });
      }
      toast({ title: "Kategoria zapisana", description: `"${categoryForm.name}" została zapisana.` });
      setIsCategoryDialogOpen(false);
    } catch {
      toast({ title: "Błąd", description: "Nie udało się zapisać kategorii", variant: "destructive" });
    }
  };

  const confirmDeleteCategory = async (id: string, name: string) => {
    if (isDemo) return;
    const servicesInCategory = services.filter(s => s.category === id);
    if (servicesInCategory.length > 0) {
      toast({ title: "Nie można usunąć", description: `Kategoria "${name}" ma ${servicesInCategory.length} przypisanych usług. Najpierw przenieś lub usuń te usługi.`, variant: "destructive" });
      return;
    }
    try {
      await deleteCategoryMutation.mutateAsync(id);
      toast({ title: "Kategoria usunięta", description: `"${name}" została usunięta.` });
      setIsCategoryDialogOpen(false);
      if (selectedCategory === id) setSelectedCategory(null);
    } catch {
      toast({ title: "Błąd", description: "Nie udało się usunąć kategorii", variant: "destructive" });
    }
  };

  const getCategoryName = (categoryId: string) => categories.find(c => c.id === categoryId)?.name || "Bez kategorii";

  const toggleStaffSelection = (staffId: string) => {
    setServiceForm(prev => ({
      ...prev,
      staffIds: prev.staffIds.includes(staffId) ? prev.staffIds.filter(id => id !== staffId) : [...prev.staffIds, staffId],
    }));
  };

  const isLoading = !isDemo && (loadingServices || loadingCategories);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  // Empty state
  if (!isDemo && services.length === 0 && categories.length === 0) {
    return (
      <div className="space-y-6">
        <SectionGuide sectionKey="services" />
        <div className="text-center py-16">
          <Package className="w-16 h-16 mx-auto text-muted-foreground/30 mb-4" />
          <h3 className="text-xl font-serif font-semibold mb-2">Brak usług</h3>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            Dodaj kategorie i usługi, które oferujesz. Bez usług klientki nie będą mogły rezerwować wizyt przez widget.
          </p>
          <div className="flex gap-3 justify-center">
            <Button variant="outline" onClick={() => openCategoryDialog()} className="gap-2">
              <Plus className="w-4 h-4" />
              {t('services.addCategory')}
            </Button>
            <Button onClick={() => openServiceDialog()} className="gap-2">
              <Plus className="w-4 h-4" />
              {t('services.addService')}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <SectionGuide sectionKey="services" />
      {/* Categories */}
      <div className="glass-card p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-serif font-semibold">{t('services.categories')}</h3>
          <Button variant="outline" size="sm" className="gap-2" onClick={() => openCategoryDialog()}>
            <Plus className="w-4 h-4" />
            {t('services.addCategory')}
          </Button>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant={selectedCategory === null ? "default" : "outline"} size="sm" onClick={() => setSelectedCategory(null)}>
            {t('common.all')}
          </Button>
          {categories.map(category => (
            <Button key={category.id} variant={selectedCategory === category.id ? "default" : "outline"} size="sm" className="gap-2" onClick={() => setSelectedCategory(category.id)}>
              <span>{category.icon}</span>
              {category.name}
              <button className="ml-1 opacity-50 hover:opacity-100" onClick={(e) => { e.stopPropagation(); openCategoryDialog(category); }}>
                <Pencil className="w-3 h-3" />
              </button>
            </Button>
          ))}
        </div>
      </div>

      {/* Services header */}
      <div className="glass-card p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-serif font-semibold">{t('services.title')} ({filteredServices.length})</h3>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder={t('services.searchPlaceholder')} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9 w-[200px]" />
            </div>
            {/* View toggle */}
            <div className="flex border border-border rounded-lg overflow-hidden">
              <button
                className={cn("p-2 transition-colors", viewMode === "list" ? "bg-primary text-primary-foreground" : "bg-background hover:bg-muted")}
                onClick={() => setViewMode("list")}
              >
                <LayoutList className="w-4 h-4" />
              </button>
              <button
                className={cn("p-2 transition-colors", viewMode === "grid" ? "bg-primary text-primary-foreground" : "bg-background hover:bg-muted")}
                onClick={() => setViewMode("grid")}
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
            </div>
            <Button variant="outline" size="sm" className="gap-2" onClick={() => setIsCSVImportOpen(true)}>
              <Upload className="w-4 h-4" />
              {t('services.importCsv')}
            </Button>
            <Button variant="luxury" size="sm" className="gap-2" onClick={() => openServiceDialog()}>
              <Plus className="w-4 h-4" />
              {t('services.addService')}
            </Button>
          </div>
        </div>

        {/* LIST VIEW */}
        {viewMode === "list" && (
          <div className="space-y-3">
            {filteredServices.map((service, index) => (
              <div key={service.id} className="flex items-center gap-4 p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors animate-fade-in" style={{ animationDelay: `${index * 50}ms` }}>
                {service.media && service.media.length > 0 ? (
                  <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0">
                    {service.media[0].type === "image" ? (
                      <img src={service.media[0].url} alt={service.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-muted flex items-center justify-center">
                        <Video className="w-5 h-5 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <FolderOpen className="w-6 h-6 text-primary" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-medium">{service.name}</p>
                  <p className="text-sm text-muted-foreground">{getCategoryName(service.category)}</p>
                  {service.benefits && service.benefits.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {service.benefits.slice(0, 3).map(b => (
                        <Badge key={b} variant="secondary" className="text-xs py-0">{b}</Badge>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  {service.duration} min
                </div>
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Banknote className="w-4 h-4 text-accent" />
                  {service.price} zł
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon" onClick={() => openServiceDialog(service)}>
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Usunąć usługę?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Czy na pewno chcesz usunąć „{service.name}"? Tej operacji nie można cofnąć.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Anuluj</AlertDialogCancel>
                        <AlertDialogAction onClick={() => confirmDeleteService(service.id, service.name)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                          Usuń
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* GRID (SHOWCASE) VIEW */}
        {viewMode === "grid" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredServices.map((service, index) => (
              <div
                key={service.id}
                className="group rounded-2xl border border-border bg-card overflow-hidden hover:shadow-lg transition-all animate-fade-in cursor-pointer"
                style={{ animationDelay: `${index * 60}ms` }}
                onClick={() => openServiceDialog(service)}
              >
                {/* Image */}
                <div className="aspect-[4/3] bg-muted relative overflow-hidden">
                  {service.media && service.media.length > 0 && service.media[0].type === "image" ? (
                    <img src={service.media[0].url} alt={service.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5">
                      <Sparkles className="w-10 h-10 text-primary/40" />
                    </div>
                  )}
                  {/* Price badge */}
                  <div className="absolute bottom-3 right-3 bg-card/90 backdrop-blur-sm rounded-lg px-3 py-1.5 font-semibold text-sm shadow-sm">
                    {service.price} zł
                  </div>
                  {/* Media count */}
                  {service.media && service.media.length > 1 && (
                    <div className="absolute top-3 right-3 bg-foreground/60 text-background rounded-md px-2 py-0.5 text-xs font-medium">
                      {service.media.length} <Image className="w-3 h-3 inline" />
                    </div>
                  )}
                </div>
                {/* Content */}
                <div className="p-4">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h4 className="font-semibold leading-tight">{service.name}</h4>
                  </div>
                  <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {service.duration} min • {getCategoryName(service.category)}
                  </p>
                  {service.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-2">{service.description}</p>
                  )}
                  {service.benefits && service.benefits.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {service.benefits.map(b => (
                        <Badge key={b} variant="secondary" className="text-xs py-0">
                          <Sparkles className="w-3 h-3 mr-1" />{b}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Service Dialog */}
      <Dialog open={isServiceDialogOpen} onOpenChange={setIsServiceDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-serif">
              {editingService ? t('services.editService') : t('services.newService')}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {/* Name */}
            <div>
              <Label>{t('services.serviceName')} *</Label>
              <Input
                value={serviceForm.name}
                onChange={(e) => setServiceForm(prev => ({ ...prev, name: e.target.value }))}
                placeholder={t('services.serviceNamePlaceholder')}
                className={cn(!serviceForm.name.trim() && "border-destructive/50")}
              />
            </div>
            {/* Category */}
            <div>
              <Label>{t('services.category')}</Label>
              <Select value={serviceForm.category} onValueChange={(value) => setServiceForm(prev => ({ ...prev, category: value }))}>
                <SelectTrigger><SelectValue placeholder={t('services.selectCategory')} /></SelectTrigger>
                <SelectContent>
                  {categories.map(cat => (
                    <SelectItem key={cat.id} value={cat.id}>{cat.icon} {cat.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {/* Duration, Price, VAT */}
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label>{t('services.duration')} *</Label>
                <Input type="number" min={1} value={serviceForm.duration} onChange={(e) => setServiceForm(prev => ({ ...prev, duration: parseInt(e.target.value) || 0 }))} />
              </div>
              <div>
                <Label>{t('services.price')} *</Label>
                <Input type="number" min={0} value={serviceForm.price} onChange={(e) => setServiceForm(prev => ({ ...prev, price: parseInt(e.target.value) || 0 }))} />
              </div>
              <div>
                <Label>VAT</Label>
                <Select value={String(serviceForm.vatRate)} onValueChange={(v) => setServiceForm(prev => ({ ...prev, vatRate: Number(v) }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">0%</SelectItem>
                    <SelectItem value="8">8%</SelectItem>
                    <SelectItem value="23">23%</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            {/* Description */}
            <div>
              <Label>{t('services.description')}</Label>
              <Textarea value={serviceForm.description} onChange={(e) => setServiceForm(prev => ({ ...prev, description: e.target.value }))} placeholder={t('services.descriptionPlaceholder')} />
            </div>
            {/* Benefits */}
            <div>
              <Label className="flex items-center gap-2"><Sparkles className="w-4 h-4" /> Korzyści dla klientki</Label>
              <p className="text-xs text-muted-foreground mb-2">Dodaj kluczowe atuty zabiegu – widoczne w widżecie rezerwacji</p>
              <div className="flex gap-2 mb-2">
                <Input
                  value={benefitInput}
                  onChange={(e) => setBenefitInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addBenefit(); } }}
                  placeholder="np. Głębokie nawilżenie"
                  className="flex-1"
                />
                <Button type="button" variant="outline" size="sm" onClick={addBenefit} disabled={!benefitInput.trim()}>
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              {serviceForm.benefits.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {serviceForm.benefits.map(b => (
                    <Badge key={b} variant="secondary" className="gap-1 pr-1">
                      {b}
                      <button onClick={() => removeBenefit(b)} className="ml-1 hover:text-destructive">
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>
            {/* Staff */}
            <div>
              <Label>{t('services.performingStaff')}</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {staffList.map(staff => (
                  <Button key={staff.id} type="button" variant={serviceForm.staffIds.includes(staff.id) ? "default" : "outline"} size="sm" onClick={() => toggleStaffSelection(staff.id)}>
                    {staff.name}
                  </Button>
                ))}
                {staffList.length === 0 && (
                  <p className="text-sm text-muted-foreground">Dodaj pracowników w zakładce Zespół</p>
                )}
              </div>
            </div>
            {/* Media */}
            <div>
              <Label className="flex items-center gap-2"><Image className="w-4 h-4" />{t('services.multimedia')}</Label>
              <p className="text-sm text-muted-foreground mb-2">{t('services.multimediaDescription')}</p>
              <ServiceMediaUpload
                media={serviceForm.media}
                onChange={(media) => setServiceForm(prev => ({ ...prev, media }))}
                maxFiles={5}
                serviceId={editingService?.id}
                salonId={isDemo ? undefined : salonId || undefined}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsServiceDialogOpen(false)}>{t('common.cancel')}</Button>
            <Button variant="luxury" onClick={saveService} disabled={!isFormValid}>
              {t('common.save')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <CSVImport isOpen={isCSVImportOpen} onClose={() => setIsCSVImportOpen(false)} onImport={handleCSVImport} categories={categories} />

      {/* Category Dialog */}
      <Dialog open={isCategoryDialogOpen} onOpenChange={setIsCategoryDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-serif">{editingCategory ? t('services.editCategory') : t('services.newCategory')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>{t('services.categoryName')}</Label>
              <Input value={categoryForm.name} onChange={(e) => setCategoryForm(prev => ({ ...prev, name: e.target.value }))} placeholder={t('services.categoryNamePlaceholder')} />
            </div>
            <div>
              <Label>{t('services.icon')}</Label>
              <Input value={categoryForm.icon} onChange={(e) => setCategoryForm(prev => ({ ...prev, icon: e.target.value }))} placeholder="✨" />
            </div>
          </div>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            {editingCategory && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" className="text-destructive border-destructive/30 hover:bg-destructive/10 mr-auto">
                    <Trash2 className="w-4 h-4 mr-2" /> Usuń kategorię
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Usunąć kategorię?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Czy na pewno chcesz usunąć „{editingCategory.name}"? Kategoria musi być pusta (bez przypisanych usług).
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Anuluj</AlertDialogCancel>
                    <AlertDialogAction onClick={() => confirmDeleteCategory(editingCategory.id, editingCategory.name)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                      Usuń
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
            <div className="flex gap-2 ml-auto">
              <Button variant="outline" onClick={() => setIsCategoryDialogOpen(false)}>{t('common.cancel')}</Button>
              <Button variant="luxury" onClick={saveCategory} disabled={!categoryForm.name.trim()}>{t('common.save')}</Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

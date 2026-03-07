import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Plus, Pencil, Trash2, Clock, Banknote, Search, FolderOpen, Upload, Image, Video, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { ServiceMediaUpload, MediaFile } from "./ServiceMediaUpload";
import { CSVImport } from "./CSVImport";
import { VideoTutorialCard } from "./VideoTutorialCard";
import { useServices, useServiceCategories, useCreateService, useUpdateService, useDeleteService, useCreateCategory, useUpdateCategory } from "@/hooks/useServices";
import { useStaffMembers } from "@/hooks/useStaffMembers";
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
  { id: "1", name: "Peeling kawitacyjny", category: "1", duration: 60, price: 150, description: "Głębokie oczyszczanie skóry twarzy", staffIds: ["1", "2"], media: [] },
  { id: "2", name: "Mezoterapia igłowa", category: "1", duration: 45, price: 350, description: "Regeneracja i nawilżenie skóry", staffIds: ["1"], media: [] },
  { id: "3", name: "Masaż relaksacyjny", category: "2", duration: 90, price: 200, description: "Pełen relaks dla ciała i umysłu", staffIds: ["3"], media: [] },
  { id: "4", name: "Depilacja laserowa - nogi", category: "3", duration: 60, price: 400, description: "Trwałe usuwanie owłosienia", staffIds: ["1", "4"], media: [] },
  { id: "5", name: "Manicure hybrydowy", category: "4", duration: 75, price: 120, description: "Stylizacja paznokci", staffIds: ["2", "4"], media: [] },
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

  // Supabase data
  const { data: dbServices, isLoading: loadingServices } = useServices();
  const { data: dbCategories, isLoading: loadingCategories } = useServiceCategories();
  const { data: dbStaff } = useStaffMembers();
  const createServiceMutation = useCreateService();
  const updateServiceMutation = useUpdateService();
  const deleteServiceMutation = useDeleteService();
  const createCategoryMutation = useCreateCategory();
  const updateCategoryMutation = useUpdateCategory();

  const services: Service[] = useMemo(() => {
    if (isDemo) return DEMO_SERVICES;
    if (!dbServices) return [];
    return dbServices.map(s => ({
      id: s.id,
      name: s.name,
      category: s.category_id || "",
      duration: s.duration,
      price: s.price,
      description: s.description || "",
      staffIds: [],
      media: (s.media as MediaFile[]) || [],
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
  const [isServiceDialogOpen, setIsServiceDialogOpen] = useState(false);
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [isCSVImportOpen, setIsCSVImportOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const [serviceForm, setServiceForm] = useState({
    name: "", category: "", duration: 60, price: 0, description: "", staffIds: [] as string[], media: [] as MediaFile[],
  });

  const [categoryForm, setCategoryForm] = useState({ name: "", icon: "✨" });

  const filteredServices = services.filter(service => {
    const matchesSearch = service.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || service.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const openServiceDialog = (service?: Service) => {
    if (service) {
      setEditingService(service);
      setServiceForm({ name: service.name, category: service.category, duration: service.duration, price: service.price, description: service.description, staffIds: service.staffIds, media: service.media || [] });
    } else {
      setEditingService(null);
      setServiceForm({ name: "", category: categories[0]?.id || "", duration: 60, price: 0, description: "", staffIds: [], media: [] });
    }
    setIsServiceDialogOpen(true);
  };

  const handleCSVImport = (importedServices: { name: string; category: string; duration: number; price: number; description: string }[]) => {
    // In production, would create via Supabase
    toast({ title: "Import CSV", description: `Zaimportowano ${importedServices.length} usług` });
  };

  const saveService = async () => {
    if (isDemo) {
      toast({ title: t('common.saved'), description: "Demo – dane nie zostały zapisane" });
      setIsServiceDialogOpen(false);
      return;
    }

    try {
      if (editingService) {
        await updateServiceMutation.mutateAsync({
          id: editingService.id,
          name: serviceForm.name,
          category_id: serviceForm.category || undefined,
          duration: serviceForm.duration,
          price: serviceForm.price,
          description: serviceForm.description,
        });
      } else {
        await createServiceMutation.mutateAsync({
          name: serviceForm.name,
          category_id: serviceForm.category || undefined,
          duration: serviceForm.duration,
          price: serviceForm.price,
          description: serviceForm.description,
        });
      }
      setIsServiceDialogOpen(false);
    } catch {
      toast({ title: t('common.error'), description: "Nie udało się zapisać usługi", variant: "destructive" });
    }
  };

  const deleteService = async (id: string) => {
    if (isDemo) return;
    try {
      await deleteServiceMutation.mutateAsync(id);
    } catch {
      toast({ title: t('common.error'), description: "Nie udało się usunąć usługi", variant: "destructive" });
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
    if (isDemo) {
      toast({ title: t('common.saved'), description: "Demo – dane nie zostały zapisane" });
      setIsCategoryDialogOpen(false);
      return;
    }

    try {
      if (editingCategory) {
        await updateCategoryMutation.mutateAsync({ id: editingCategory.id, name: categoryForm.name, icon: categoryForm.icon });
      } else {
        await createCategoryMutation.mutateAsync({ name: categoryForm.name, icon: categoryForm.icon });
      }
      setIsCategoryDialogOpen(false);
    } catch {
      toast({ title: t('common.error'), description: "Nie udało się zapisać kategorii", variant: "destructive" });
    }
  };

  const getCategoryName = (categoryId: string) => categories.find(c => c.id === categoryId)?.name || t('services.noCategory');

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
        <VideoTutorialCard
          title="Jak zarządzać usługami"
          voiceText="Zarządzaj swoimi usługami — cenami, czasem trwania, kategoriami. Te dane wyświetlają się w widgecie rezerwacji."
        />
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
      <VideoTutorialCard
        title="Jak zarządzać usługami"
        voiceText="Zarządzaj swoimi usługami — cenami, czasem trwania, kategoriami. Te dane wyświetlają się w widgecie rezerwacji, który widzą Twoje klientki."
      />
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

      {/* Services list */}
      <div className="glass-card p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-serif font-semibold">{t('services.title')} ({filteredServices.length})</h3>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder={t('services.searchPlaceholder')} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9 w-[200px]" />
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

        <div className="space-y-3">
          {filteredServices.map((service, index) => (
            <div key={service.id} className="flex items-center gap-4 p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors animate-fade-in" style={{ animationDelay: `${index * 50}ms` }}>
              {service.media && service.media.length > 0 ? (
                <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 relative">
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
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="w-4 h-4" />
                {service.duration} {t('calendar.min')}
              </div>
              <div className="flex items-center gap-2 text-sm font-medium">
                <Banknote className="w-4 h-4 text-accent" />
                {service.price} zł
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" onClick={() => openServiceDialog(service)}>
                  <Pencil className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => deleteService(service.id)}>
                  <Trash2 className="w-4 h-4 text-destructive" />
                </Button>
              </div>
            </div>
          ))}
        </div>
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
            <div>
              <Label>{t('services.serviceName')}</Label>
              <Input value={serviceForm.name} onChange={(e) => setServiceForm(prev => ({ ...prev, name: e.target.value }))} placeholder={t('services.serviceNamePlaceholder')} />
            </div>
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
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>{t('services.duration')}</Label>
                <Input type="number" value={serviceForm.duration} onChange={(e) => setServiceForm(prev => ({ ...prev, duration: parseInt(e.target.value) || 0 }))} />
              </div>
              <div>
                <Label>{t('services.price')}</Label>
                <Input type="number" value={serviceForm.price} onChange={(e) => setServiceForm(prev => ({ ...prev, price: parseInt(e.target.value) || 0 }))} />
              </div>
            </div>
            <div>
              <Label>{t('services.description')}</Label>
              <Textarea value={serviceForm.description} onChange={(e) => setServiceForm(prev => ({ ...prev, description: e.target.value }))} placeholder={t('services.descriptionPlaceholder')} />
            </div>
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
            <div>
              <Label className="flex items-center gap-2"><Image className="w-4 h-4" />{t('services.multimedia')}</Label>
              <p className="text-sm text-muted-foreground mb-2">{t('services.multimediaDescription')}</p>
              <ServiceMediaUpload media={serviceForm.media} onChange={(media) => setServiceForm(prev => ({ ...prev, media }))} maxFiles={5} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsServiceDialogOpen(false)}>{t('common.cancel')}</Button>
            <Button variant="luxury" onClick={saveService}>{t('common.save')}</Button>
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
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCategoryDialogOpen(false)}>{t('common.cancel')}</Button>
            <Button variant="luxury" onClick={saveCategory}>{t('common.save')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

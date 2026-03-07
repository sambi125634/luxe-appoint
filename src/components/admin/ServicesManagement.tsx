import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Plus, Pencil, Trash2, Clock, Banknote, Search, FolderOpen, Upload, Image, Video } from "lucide-react";
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

const mockCategories: Category[] = [
  { id: "1", name: "Twarz", icon: "✨" },
  { id: "2", name: "Ciało", icon: "💆" },
  { id: "3", name: "Depilacja", icon: "🌸" },
  { id: "4", name: "Paznokcie", icon: "💅" },
];

const mockServices: Service[] = [
  { id: "1", name: "Peeling kawitacyjny", category: "1", duration: 60, price: 150, description: "Głębokie oczyszczanie skóry twarzy", staffIds: ["1", "2"], media: [] },
  { id: "2", name: "Mezoterapia igłowa", category: "1", duration: 45, price: 350, description: "Regeneracja i nawilżenie skóry", staffIds: ["1"], media: [] },
  { id: "3", name: "Masaż relaksacyjny", category: "2", duration: 90, price: 200, description: "Pełen relaks dla ciała i umysłu", staffIds: ["3"], media: [] },
  { id: "4", name: "Depilacja laserowa - nogi", category: "3", duration: 60, price: 400, description: "Trwałe usuwanie owłosienia", staffIds: ["1", "4"], media: [] },
  { id: "5", name: "Manicure hybrydowy", category: "4", duration: 75, price: 120, description: "Stylizacja paznokci z użyciem lakieru hybrydowego", staffIds: ["2", "4"], media: [] },
];

const mockStaff = [
  { id: "1", name: "Maria Nowakowska" },
  { id: "2", name: "Karolina Wiśniewska" },
  { id: "3", name: "Joanna Lewandowska" },
  { id: "4", name: "Anna Kowalczyk" },
];

export function ServicesManagement() {
  const { t } = useTranslation();
  const [services, setServices] = useState(mockServices);
  const [categories, setCategories] = useState(mockCategories);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isServiceDialogOpen, setIsServiceDialogOpen] = useState(false);
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [isCSVImportOpen, setIsCSVImportOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const [serviceForm, setServiceForm] = useState({
    name: "",
    category: "",
    duration: 60,
    price: 0,
    description: "",
    staffIds: [] as string[],
    media: [] as MediaFile[],
  });

  const [categoryForm, setCategoryForm] = useState({
    name: "",
    icon: "✨",
  });

  const filteredServices = services.filter(service => {
    const matchesSearch = service.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || service.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const openServiceDialog = (service?: Service) => {
    if (service) {
      setEditingService(service);
      setServiceForm({
        name: service.name,
        category: service.category,
        duration: service.duration,
        price: service.price,
        description: service.description,
        staffIds: service.staffIds,
        media: service.media || [],
      });
    } else {
      setEditingService(null);
      setServiceForm({ name: "", category: categories[0]?.id || "", duration: 60, price: 0, description: "", staffIds: [], media: [] });
    }
    setIsServiceDialogOpen(true);
  };

  const handleCSVImport = (importedServices: { name: string; category: string; duration: number; price: number; description: string }[]) => {
    const newServices = importedServices.map((s, index) => ({
      ...s,
      id: `csv-${Date.now()}-${index}`,
      staffIds: [] as string[],
      media: [] as MediaFile[],
    }));
    setServices(prev => [...prev, ...newServices]);
  };

  const saveService = () => {
    if (editingService) {
      setServices(prev => prev.map(s => s.id === editingService.id ? { ...s, ...serviceForm } : s));
    } else {
      setServices(prev => [...prev, { ...serviceForm, id: Date.now().toString() }]);
    }
    setIsServiceDialogOpen(false);
  };

  const deleteService = (id: string) => {
    setServices(prev => prev.filter(s => s.id !== id));
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

  const saveCategory = () => {
    if (editingCategory) {
      setCategories(prev => prev.map(c => c.id === editingCategory.id ? { ...c, ...categoryForm } : c));
    } else {
      setCategories(prev => [...prev, { ...categoryForm, id: Date.now().toString() }]);
    }
    setIsCategoryDialogOpen(false);
  };

  const getCategoryName = (categoryId: string) => {
    return categories.find(c => c.id === categoryId)?.name || t('services.noCategory');
  };

  const toggleStaffSelection = (staffId: string) => {
    setServiceForm(prev => ({
      ...prev,
      staffIds: prev.staffIds.includes(staffId)
        ? prev.staffIds.filter(id => id !== staffId)
        : [...prev.staffIds, staffId],
    }));
  };

  return (
    <div className="space-y-6">
      <VideoTutorialCard
        title="Jak zarządzać usługami"
        voiceText="Zarządzaj swoimi usługami — cenami, czasem trwania, kategoriami. Te dane wyświetlają się w widgecie rezerwacji, który widzą Twoje klientki. Bez usług klientki nie będą mogły rezerwować wizyt."
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
          <Button
            variant={selectedCategory === null ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedCategory(null)}
          >
            {t('common.all')}
          </Button>
          {categories.map(category => (
            <Button
              key={category.id}
              variant={selectedCategory === category.id ? "default" : "outline"}
              size="sm"
              className="gap-2"
              onClick={() => setSelectedCategory(category.id)}
            >
              <span>{category.icon}</span>
              {category.name}
              <button
                className="ml-1 opacity-50 hover:opacity-100"
                onClick={(e) => { e.stopPropagation(); openCategoryDialog(category); }}
              >
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
              <Input
                placeholder={t('services.searchPlaceholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 w-[200px]"
              />
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
            <div
              key={service.id}
              className="flex items-center gap-4 p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors animate-fade-in"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              {service.media && service.media.length > 0 ? (
                <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 relative">
                  {service.media[0].type === "image" ? (
                    <img src={service.media[0].url} alt={service.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-muted flex items-center justify-center">
                      <Video className="w-5 h-5 text-muted-foreground" />
                    </div>
                  )}
                  {service.media.length > 1 && (
                    <span className="absolute bottom-1 right-1 text-xs bg-foreground/70 text-background px-1 rounded">
                      +{service.media.length - 1}
                    </span>
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
              <Input
                value={serviceForm.name}
                onChange={(e) => setServiceForm(prev => ({ ...prev, name: e.target.value }))}
                placeholder={t('services.serviceNamePlaceholder')}
              />
            </div>
            <div>
              <Label>{t('services.category')}</Label>
              <Select
                value={serviceForm.category}
                onValueChange={(value) => setServiceForm(prev => ({ ...prev, category: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t('services.selectCategory')} />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(cat => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.icon} {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>{t('services.duration')}</Label>
                <Input
                  type="number"
                  value={serviceForm.duration}
                  onChange={(e) => setServiceForm(prev => ({ ...prev, duration: parseInt(e.target.value) || 0 }))}
                />
              </div>
              <div>
                <Label>{t('services.price')}</Label>
                <Input
                  type="number"
                  value={serviceForm.price}
                  onChange={(e) => setServiceForm(prev => ({ ...prev, price: parseInt(e.target.value) || 0 }))}
                />
              </div>
            </div>
            <div>
              <Label>{t('services.description')}</Label>
              <Textarea
                value={serviceForm.description}
                onChange={(e) => setServiceForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder={t('services.descriptionPlaceholder')}
              />
            </div>
            <div>
              <Label>{t('services.performingStaff')}</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {mockStaff.map(staff => (
                  <Button
                    key={staff.id}
                    type="button"
                    variant={serviceForm.staffIds.includes(staff.id) ? "default" : "outline"}
                    size="sm"
                    onClick={() => toggleStaffSelection(staff.id)}
                  >
                    {staff.name}
                  </Button>
                ))}
              </div>
            </div>
            <div>
              <Label className="flex items-center gap-2">
                <Image className="w-4 h-4" />
                {t('services.multimedia')}
              </Label>
              <p className="text-sm text-muted-foreground mb-2">
                {t('services.multimediaDescription')}
              </p>
              <ServiceMediaUpload
                media={serviceForm.media}
                onChange={(media) => setServiceForm(prev => ({ ...prev, media }))}
                maxFiles={5}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsServiceDialogOpen(false)}>{t('common.cancel')}</Button>
            <Button variant="luxury" onClick={saveService}>{t('common.save')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* CSV Import Dialog */}
      <CSVImport
        isOpen={isCSVImportOpen}
        onClose={() => setIsCSVImportOpen(false)}
        onImport={handleCSVImport}
        categories={categories}
      />

      {/* Category Dialog */}
      <Dialog open={isCategoryDialogOpen} onOpenChange={setIsCategoryDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-serif">
              {editingCategory ? t('services.editCategory') : t('services.newCategory')}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>{t('services.categoryName')}</Label>
              <Input
                value={categoryForm.name}
                onChange={(e) => setCategoryForm(prev => ({ ...prev, name: e.target.value }))}
                placeholder={t('services.categoryNamePlaceholder')}
              />
            </div>
            <div>
              <Label>{t('services.icon')}</Label>
              <Input
                value={categoryForm.icon}
                onChange={(e) => setCategoryForm(prev => ({ ...prev, icon: e.target.value }))}
                placeholder="✨"
              />
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

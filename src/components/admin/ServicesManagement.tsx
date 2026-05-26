import { useState, useMemo, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Plus, Pencil, Trash2, Clock, Banknote, Search, FolderOpen, Upload, Image, Video, Package, LayoutGrid, LayoutList, X, Sparkles, GripVertical, Info, Layers, FlaskConical, Wand2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import RecipeEditorDrawer from "@/modules/inventory/RecipeEditorDrawer";
import { useProducts } from "@/hooks/useProducts";
import { useServiceRecipes } from "@/hooks/useServiceRecipes";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
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
import { useAllServiceVariants, useServiceVariants, useSyncServiceVariants } from "@/hooks/useServiceVariants";
import { supabase } from "@/integrations/supabase/client";

interface VariantFormItem {
  id?: string;
  name: string;
  description: string;
  duration: number;
  price: number;
  is_active: boolean;
  sort_order: number;
}

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
  const { products: recipeProducts } = useProducts(salonId || '');
  const { recipes: allRecipes, addRecipe, removeRecipe, getMaterialCost } = useServiceRecipes(salonId || '');
  const [isRecipeEditorOpen, setIsRecipeEditorOpen] = useState(false);
  const [recipePreSelectedServiceId, setRecipePreSelectedServiceId] = useState<string | undefined>();
  const [recipeEditData, setRecipeEditData] = useState<import("@/modules/inventory/RecipeEditorDrawer").RecipeForEdit | null>(null);

  const openRecipeEditor = (service: Service) => {
    const serviceRecipes = (allRecipes || []).filter(r => r.service_id === service.id);
    if (serviceRecipes.length > 0) {
      setRecipeEditData({
        serviceId: service.id,
        ingredients: serviceRecipes.map(r => ({
          id: r.id,
          productId: r.product_id,
          quantityValue: r.quantity_value,
          quantityUnit: r.quantity_unit,
          isOptional: r.is_optional,
          mixRatio: r.mix_ratio,
          notes: r.notes || '',
        })),
      });
    } else {
      setRecipeEditData(null);
      setRecipePreSelectedServiceId(service.id);
    }
    setIsRecipeEditorOpen(true);
  };

  const handleRecipeSave = async (data: { serviceId: string; ingredients: { id?: string; productId: string; quantityValue: number; quantityUnit: string; isOptional: boolean; mixRatio: number | null; notes: string }[] }) => {
    if (isDemo || !salonId) return;
    try {
      const oldRecipes = (allRecipes || []).filter(r => r.service_id === data.serviceId);
      for (const r of oldRecipes) removeRecipe(r.id);
      for (const ing of data.ingredients) {
        await addRecipe({
          salon_id: salonId,
          service_id: data.serviceId,
          product_id: ing.productId,
          quantity_used: ing.quantityValue,
          unit: ing.quantityUnit,
          quantity_value: ing.quantityValue,
          quantity_unit: ing.quantityUnit,
          is_optional: ing.isOptional,
          mix_ratio: ing.mixRatio,
          notes: ing.notes || undefined,
        });
      }
    } catch {
      toast({ title: "Błąd", description: "Nie udało się zapisać receptury", variant: "destructive" });
    }
  };

  const getRecipeInfo = (serviceId: string) => {
    const serviceRecipes = (allRecipes || []).filter(r => r.service_id === serviceId);
    if (serviceRecipes.length === 0) return null;
    const cost = getMaterialCost(serviceId);
    return { count: serviceRecipes.length, cost };
  };

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
  const syncVariantsMutation = useSyncServiceVariants();

  // Fetch all variants for display
  const serviceIds = useMemo(() => (dbServices || []).map(s => s.id), [dbServices]);
  const { data: allVariants } = useAllServiceVariants(isDemo ? [] : serviceIds);
  const variantsByService = useMemo(() => {
    const map: Record<string, { count: number; minPrice: number }> = {};
    if (allVariants) {
      for (const v of allVariants) {
        if (!map[v.service_id]) {
          map[v.service_id] = { count: 0, minPrice: Infinity };
        }
        map[v.service_id].count++;
        if (v.price < map[v.service_id].minPrice) {
          map[v.service_id].minPrice = v.price;
        }
      }
    }
    return map;
  }, [allVariants]);

  // Variant form state (editingVariants hook moved after editingService declaration below)
  const [hasVariants, setHasVariants] = useState(false);
  const [variants, setVariants] = useState<VariantFormItem[]>([]);

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

  // Variant data for editing (needs editingService to be declared first)
  const { data: editingVariants } = useServiceVariants(editingService?.id);

  // Sync variant form state when editing variants load
  useEffect(() => {
    if (editingVariants && editingVariants.length > 0) {
      setHasVariants(true);
      setVariants(editingVariants.map(v => ({
        id: v.id,
        name: v.name,
        description: v.description || "",
        duration: v.duration,
        price: Number(v.price),
        is_active: v.is_active,
        sort_order: v.sort_order,
      })));
    }
  }, [editingVariants]);

  const addVariant = () => {
    setVariants(prev => [...prev, {
      name: '',
      description: '',
      duration: serviceForm.duration || 60,
      price: serviceForm.price || 0,
      is_active: true,
      sort_order: prev.length,
    }]);
  };

  const removeVariant = (index: number) => {
    setVariants(prev => prev.filter((_, i) => i !== index));
  };

  const updateVariant = (index: number, field: string, value: string | number) => {
    setVariants(prev => prev.map((v, i) =>
      i === index ? { ...v, [field]: value } : v
    ));
  };

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
      // Variants will be loaded via useEffect on editingVariants
      const svcVariants = variantsByService[service.id];
      if (svcVariants && svcVariants.count > 0) {
        setHasVariants(true);
      } else {
        setHasVariants(false);
        setVariants([]);
      }
    } else {
      setEditingService(null);
      setServiceForm({ name: "", category: categories[0]?.id || "", duration: 60, price: 0, description: "", staffIds: [], media: [], benefits: [], vatRate: 23 });
      setHasVariants(false);
      setVariants([]);
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

      // Sync variants
      if (hasVariants && variants.length > 0) {
        const validVariants = variants
          .filter(v => v.name.trim())
          .map((v, i) => ({
            name: v.name.trim(),
            description: v.description || null,
            duration: v.duration,
            price: v.price,
            is_active: v.is_active ?? true,
            sort_order: i,
          }));
        await syncVariantsMutation.mutateAsync({ serviceId: savedId, variants: validVariants });
      } else {
        // Remove all variants if toggled off
        await syncVariantsMutation.mutateAsync({ serviceId: savedId, variants: [] });
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

  // Category templates for quick start
  const categoryTemplates = [
    { name: "Salon kosmetyczny", categories: [
      { name: "Twarz", icon: "🧖‍♀️" }, { name: "Ciało", icon: "💆‍♀️" }, { name: "Depilacja", icon: "✂️" }, { name: "Brwi i rzęsy", icon: "👁️" },
    ]},
    { name: "Salon fryzjerski", categories: [
      { name: "Strzyżenie", icon: "✂️" }, { name: "Koloryzacja", icon: "🎨" }, { name: "Stylizacja", icon: "💇‍♀️" }, { name: "Pielęgnacja", icon: "✨" },
    ]},
    { name: "Salon paznokci", categories: [
      { name: "Manicure", icon: "💅" }, { name: "Pedicure", icon: "🦶" }, { name: "Zdobienia", icon: "🎨" }, { name: "Pielęgnacja dłoni", icon: "🤲" },
    ]},
    { name: "Salon masażu / SPA", categories: [
      { name: "Masaże", icon: "💆" }, { name: "Rytuały SPA", icon: "🧘" }, { name: "Zabiegi na ciało", icon: "✨" }, { name: "Sauna i wellness", icon: "♨️" },
    ]},
  ];

  const applyTemplate = async (template: typeof categoryTemplates[0]) => {
    if (isDemo) return;
    try {
      for (const cat of template.categories) {
        await createCategoryMutation.mutateAsync({ name: cat.name, icon: cat.icon });
      }
      toast({ title: "Szablon zastosowany", description: `Dodano ${template.categories.length} kategorii z szablonu "${template.name}". Teraz dodaj usługi w każdej kategorii.` });
    } catch {
      toast({ title: "Błąd", description: "Nie udało się zastosować szablonu", variant: "destructive" });
    }
  };

  // Empty state
  if (!isDemo && services.length === 0 && categories.length === 0) {
    return (
      <div className="space-y-6">
        <SectionGuide sectionKey="services" />
        <div className="text-center py-12">
          <Package className="w-16 h-16 mx-auto text-muted-foreground/30 mb-4" />
          <h3 className="text-xl font-serif font-semibold mb-2">Rozpocznij konfigurację usług</h3>
          <p className="text-muted-foreground mb-8 max-w-md mx-auto">
            Bez usług klientki nie będą mogły rezerwować wizyt. Skonfiguruj ofertę w 3 krokach:
          </p>

          {/* Step-by-step guide */}
          <div className="max-w-lg mx-auto mb-8 space-y-3 text-left">
            <div className="flex items-start gap-3 p-4 rounded-xl bg-muted/50 border border-border">
              <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold shrink-0">1</div>
              <div>
                <p className="font-semibold text-sm">Dodaj kategorie usług</p>
                <p className="text-xs text-muted-foreground">Np. „Twarz", „Ciało", „Paznokcie" — grupują usługi w widżecie rezerwacji</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 rounded-xl bg-muted/50 border border-border">
              <div className="w-8 h-8 rounded-full bg-muted text-muted-foreground flex items-center justify-center text-sm font-bold shrink-0">2</div>
              <div>
                <p className="font-semibold text-sm">Dodaj usługi w każdej kategorii</p>
                <p className="text-xs text-muted-foreground">Nazwa, czas trwania, cena, opis i zdjęcie — to widzi klientka</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 rounded-xl bg-muted/50 border border-border">
              <div className="w-8 h-8 rounded-full bg-muted text-muted-foreground flex items-center justify-center text-sm font-bold shrink-0">3</div>
              <div>
                <p className="font-semibold text-sm">Przypisz personel do usług</p>
                <p className="text-xs text-muted-foreground">Określ kto wykonuje daną usługę — potrzebne do kalendarza</p>
              </div>
            </div>
          </div>

          {/* Quick start templates */}
          <div className="max-w-lg mx-auto mb-6">
            <p className="text-sm font-medium text-muted-foreground mb-3">Szybki start — wybierz szablon kategorii:</p>
            <div className="grid grid-cols-2 gap-2">
              {categoryTemplates.map((tpl) => (
                <Button
                  key={tpl.name}
                  variant="outline"
                  size="sm"
                  className="justify-start gap-2 h-auto py-3 px-4"
                  onClick={() => applyTemplate(tpl)}
                >
                  <FolderOpen className="w-4 h-4 shrink-0 text-primary" />
                  <div className="text-left">
                    <p className="text-xs font-semibold">{tpl.name}</p>
                    <p className="text-[10px] text-muted-foreground">{tpl.categories.map(c => c.name).join(', ')}</p>
                  </div>
                </Button>
              ))}
            </div>
          </div>

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
                  {variantsByService[service.id] && variantsByService[service.id].count > 0 && (
                    <span className="text-xs text-primary font-medium flex items-center gap-1 mt-0.5">
                      <Layers className="w-3 h-3" />
                      {variantsByService[service.id].count} wariantów
                      <span className="text-muted-foreground font-normal">
                        · od {variantsByService[service.id].minPrice} zł
                      </span>
                    </span>
                  )}
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
                {(() => {
                  const recipeInfo = getRecipeInfo(service.id);
                  return (
                    <Button
                      variant="ghost"
                      size="sm"
                      className={cn("gap-1.5 h-8 text-xs", recipeInfo ? "text-primary" : "text-muted-foreground")}
                      onClick={() => openRecipeEditor(service)}
                    >
                      <FlaskConical className="w-3.5 h-3.5" />
                      {recipeInfo ? (
                        <>
                          Receptura
                          <Badge variant="secondary" className="text-[10px] py-0 h-4 ml-0.5">
                            {recipeInfo.cost.toFixed(2)} zł
                          </Badge>
                        </>
                      ) : "Dodaj recepturę"}
                    </Button>
                  );
                })()}
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
                    <SelectItem value="5">5%</SelectItem>
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

            {/* Warianty usługi */}
            <div className="flex items-center justify-between py-3 border-t border-border">
              <div>
                <p className="font-semibold text-sm">Warianty usługi</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Np. różne czasy trwania, strefy ciała lub poziomy zaawansowania
                </p>
              </div>
              <Switch checked={hasVariants} onCheckedChange={setHasVariants} />
            </div>

            {hasVariants && (
              <div className="space-y-3">
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex gap-2">
                  <Info className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-amber-700">
                    Gdy usługa ma warianty — cena i czas trwania z głównego formularza będą ignorowane. Klientka wybierze wariant przed rezerwacją.
                  </p>
                </div>

                <div className="space-y-2">
                  {variants.map((variant, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 border rounded-xl bg-muted/30">
                      <div className="mt-2.5 cursor-grab text-muted-foreground">
                        <GripVertical className="w-4 h-4" />
                      </div>
                      <div className="flex-1 grid grid-cols-2 gap-2">
                        <div className="col-span-2">
                          <Input
                            placeholder="Nazwa wariantu *"
                            value={variant.name}
                            onChange={e => updateVariant(index, 'name', e.target.value)}
                            className="text-sm"
                          />
                        </div>
                        <div className="col-span-2">
                          <Input
                            placeholder="Opis (opcjonalny)"
                            value={variant.description || ''}
                            onChange={e => updateVariant(index, 'description', e.target.value)}
                            className="text-sm"
                          />
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground mb-1 block">Czas (min) *</Label>
                          <Input
                            type="number"
                            placeholder="60"
                            value={variant.duration}
                            onChange={e => updateVariant(index, 'duration', Number(e.target.value))}
                            className="text-sm"
                            min={5}
                          />
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground mb-1 block">Cena (zł) *</Label>
                          <Input
                            type="number"
                            placeholder="150"
                            value={variant.price}
                            onChange={e => updateVariant(index, 'price', Number(e.target.value))}
                            className="text-sm"
                            min={0}
                          />
                        </div>
                      </div>
                      <button
                        onClick={() => removeVariant(index)}
                        className="mt-2 w-7 h-7 rounded-full bg-muted flex items-center justify-center hover:bg-destructive/10 hover:text-destructive transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>

                <button
                  onClick={addVariant}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 border-dashed border-primary/30 text-primary text-sm font-medium hover:border-primary/60 hover:bg-primary/5 transition-all"
                >
                  <Plus className="w-4 h-4" />
                  Dodaj wariant
                </button>
              </div>
            )}
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

      <RecipeEditorDrawer
        open={isRecipeEditorOpen}
        onOpenChange={setIsRecipeEditorOpen}
        services={services.map(s => ({ id: s.id, name: s.name, price: s.price, duration: s.duration }))}
        products={(recipeProducts || []).map(p => ({ id: p.id, name: p.name, purchase_price_net: p.purchase_price_net }))}
        editingRecipe={recipeEditData}
        preSelectedServiceId={recipePreSelectedServiceId}
        onSave={handleRecipeSave}
        isDemo={isDemo}
      />
    </div>
  );
}

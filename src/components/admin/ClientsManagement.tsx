import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { 
  Search, Plus, Phone, Mail, Calendar, Clock, 
  Star, AlertTriangle, Edit2, Trash2, User,
  History, StickyNote, Tag, Users, FolderOpen
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { ClientRiskBadge } from "./ClientRiskBadge";
import { ClientFilters, ClientFiltersState, PurchaseGroups, ClientListItem, CategoryGroup } from "./clients";
import { SectionGuide } from "./SectionGuide";
import { useClients, useCreateClient, useUpdateClient, useDeleteClient } from "@/hooks/useClients";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useSalonId } from "@/hooks/useSalonId";

interface Visit {
  id: string;
  date: string;
  time: string;
  service: string;
  category: string;
  staff: string;
  status: "completed" | "cancelled" | "no-show";
  price: number;
  notes?: string;
}

interface Client {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  tags: string[];
  notes: string;
  createdAt: string;
  lastVisit?: string;
  totalVisits: number;
  totalSpent: number;
  visits: Visit[];
  purchaseCategories: string[];
}

// Demo mock data
const DEMO_CLIENTS: Client[] = [
  {
    id: "1", firstName: "Anna", lastName: "Kowalska", phone: "+48 123 456 789", email: "anna.kowalska@email.pl",
    tags: ["vip", "regular"], notes: "Preferuje zabiegi w piątki po 16:00. Alergia na parabeny.",
    createdAt: "2024-01-15", lastVisit: "2024-12-01", totalVisits: 24, totalSpent: 4800,
    purchaseCategories: ["Zabiegi na twarz", "Mezoterapia"],
    visits: [
      { id: "v1", date: "2024-12-01", time: "14:00", service: "Mezoterapia twarzy", category: "Mezoterapia", staff: "Maria", status: "completed", price: 350 },
      { id: "v2", date: "2024-11-15", time: "16:00", service: "Manicure hybrydowy", category: "Manicure & Pedicure", staff: "Anna", status: "completed", price: 120 },
    ]
  },
  {
    id: "2", firstName: "Katarzyna", lastName: "Nowak", phone: "+48 987 654 321", email: "k.nowak@gmail.com",
    tags: ["new"], notes: "", createdAt: "2024-11-20", lastVisit: "2024-11-20", totalVisits: 1, totalSpent: 200,
    purchaseCategories: ["Konsultacje"],
    visits: [
      { id: "v4", date: "2024-11-20", time: "11:00", service: "Konsultacja", category: "Konsultacje", staff: "Joanna", status: "completed", price: 200 },
    ]
  },
  {
    id: "3", firstName: "Magdalena", lastName: "Wiśniewska", phone: "+48 555 123 456", email: "magda.w@wp.pl",
    tags: ["regular", "evening"], notes: "Wrażliwa skóra. Zawsze rezerwuje na 18:00.",
    createdAt: "2023-06-10", lastVisit: "2024-11-28", totalVisits: 18, totalSpent: 3600,
    purchaseCategories: ["Depilacja"],
    visits: [
      { id: "v5", date: "2024-11-28", time: "18:00", service: "Depilacja laserowa", category: "Depilacja", staff: "Maria", status: "completed", price: 300 },
    ]
  },
  {
    id: "4", firstName: "Ewa", lastName: "Dąbrowska", phone: "+48 111 222 333", email: "ewa.d@email.pl",
    tags: ["problematic"], notes: "Dwukrotnie nie pojawiła się na wizycie bez uprzedzenia.",
    createdAt: "2024-03-01", lastVisit: "2024-10-15", totalVisits: 5, totalSpent: 650,
    purchaseCategories: ["Manicure & Pedicure"],
    visits: [
      { id: "v7", date: "2024-10-15", time: "12:00", service: "Manicure klasyczny", category: "Manicure & Pedicure", staff: "Anna", status: "completed", price: 80 },
    ]
  },
  {
    id: "5", firstName: "Zofia", lastName: "Lewandowska", phone: "+48 444 555 666", email: "zofia.lew@gmail.com",
    tags: ["vip", "friday-lover"], notes: "Klientka VIP - zawsze oferować kawę/herbatę.",
    createdAt: "2022-09-01", lastVisit: "2024-12-02", totalVisits: 48, totalSpent: 12500,
    purchaseCategories: ["Lifting", "Mezoterapia", "Zabiegi na twarz"],
    visits: [
      { id: "v9", date: "2024-12-02", time: "10:00", service: "Lifting HIFU", category: "Lifting", staff: "Joanna", status: "completed", price: 800 },
    ]
  },
];

interface ClientsManagementProps {
  isDemo?: boolean;
}

export function ClientsManagement({ isDemo = false }: ClientsManagementProps) {
  const { t, i18n } = useTranslation();
  const { toast } = useToast();
  const { salonId } = useSalonId();

  // Supabase data (only fetched when not demo)
  const { data: dbClients, isLoading } = useClients();
  const createClient = useCreateClient();
  const updateClient = useUpdateClient();
  const deleteClientMutation = useDeleteClient();

  // Fetch appointment stats per client
  const { data: clientStats } = useQuery({
    queryKey: ["client-stats", salonId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("appointments")
        .select("client_id, status, price, start_time, services(name), staff_members(name)")
        .eq("salon_id", salonId!)
        .not("client_id", "is", null);
      if (error) throw error;
      
      const statsMap: Record<string, { totalVisits: number; totalSpent: number; visits: Visit[] }> = {};
      (data || []).forEach((apt: any) => {
        const cid = apt.client_id;
        if (!cid) return;
        if (!statsMap[cid]) statsMap[cid] = { totalVisits: 0, totalSpent: 0, visits: [] };
        
        if (apt.status === "completed") {
          statsMap[cid].totalVisits += 1;
          statsMap[cid].totalSpent += Number(apt.price || 0);
        }
        
        const startDate = new Date(apt.start_time);
        statsMap[cid].visits.push({
          id: apt.client_id + "-" + apt.start_time,
          date: startDate.toISOString().split('T')[0],
          time: `${startDate.getHours().toString().padStart(2,'0')}:${startDate.getMinutes().toString().padStart(2,'0')}`,
          service: apt.services?.name || "Usługa",
          category: "",
          staff: apt.staff_members?.name || "—",
          status: apt.status === "completed" ? "completed" : apt.status === "cancelled" ? "cancelled" : "completed",
          price: Number(apt.price || 0),
        });
      });
      return statsMap;
    },
    enabled: !isDemo && !!salonId,
  });

  // Map DB data to component format
  const clients: Client[] = useMemo(() => {
    if (isDemo) return DEMO_CLIENTS;
    if (!dbClients) return [];
    return dbClients.map(c => ({
      id: c.id,
      firstName: c.first_name,
      lastName: c.last_name,
      phone: c.phone,
      email: c.email || "",
      tags: c.tags || [],
      notes: c.notes || "",
      createdAt: c.created_at.split('T')[0],
      lastVisit: c.last_visit_at?.split('T')[0],
      totalVisits: clientStats?.[c.id]?.totalVisits || 0,
      totalSpent: clientStats?.[c.id]?.totalSpent || 0,
      visits: clientStats?.[c.id]?.visits || [],
      purchaseCategories: c.purchase_categories || [],
    }));
  }, [isDemo, dbClients, clientStats]);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedClient, setEditedClient] = useState<Client | null>(null);
  const [activeTab, setActiveTab] = useState("info");
  const [mainViewTab, setMainViewTab] = useState<"list" | "groups">("list");
  const [filters, setFilters] = useState<ClientFiltersState>({
    tags: [],
    categories: [],
    inactivityDays: null,
    needsFollowup: false
  });

  const availableTags = [
    { id: "vip", label: t('clients.tagLabels.vip'), color: "bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-200" },
    { id: "new", label: t('clients.tagLabels.new'), color: "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-200" },
    { id: "regular", label: t('clients.tagLabels.regular'), color: "bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200" },
    { id: "problematic", label: t('clients.tagLabels.problematic'), color: "bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-200" },
    { id: "friday-lover", label: t('clients.tagLabels.fridayLover'), color: "bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-200" },
    { id: "evening", label: t('clients.tagLabels.evening'), color: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/50 dark:text-indigo-200" },
  ];

  const availableCategories = useMemo(() => {
    const categories = new Set<string>();
    clients.forEach(client => {
      client.purchaseCategories?.forEach(cat => categories.add(cat));
    });
    return Array.from(categories).sort();
  }, [clients]);

  const getDaysSinceLastVisit = (lastVisit: string | undefined) => {
    if (!lastVisit) return null;
    const lastVisitDate = new Date(lastVisit);
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - lastVisitDate.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const filteredClients = useMemo(() => {
    return clients.filter(client => {
      const query = searchQuery.toLowerCase();
      const matchesSearch = 
        client.firstName.toLowerCase().includes(query) ||
        client.lastName.toLowerCase().includes(query) ||
        client.phone.includes(query) ||
        client.email.toLowerCase().includes(query);
      if (!matchesSearch) return false;
      if (filters.tags.length > 0) {
        const hasMatchingTag = filters.tags.some(tag => client.tags.includes(tag));
        if (!hasMatchingTag) return false;
      }
      if (filters.categories.length > 0) {
        const hasMatchingCategory = filters.categories.some(cat => client.purchaseCategories?.includes(cat));
        if (!hasMatchingCategory) return false;
      }
      if (filters.inactivityDays) {
        const daysSince = getDaysSinceLastVisit(client.lastVisit);
        if (!daysSince || daysSince < filters.inactivityDays) return false;
      }
      if (filters.needsFollowup) {
        const daysSince = getDaysSinceLastVisit(client.lastVisit);
        if (!daysSince || daysSince < 30) return false;
      }
      return true;
    });
  }, [clients, searchQuery, filters]);

  const purchaseGroups: CategoryGroup[] = useMemo(() => {
    const groupMap = new Map<string, {
      category: string;
      clients: { id: string; firstName: string; lastName: string; lastVisit: string | null | undefined; totalSpent: number }[];
      totalRevenue: number;
      totalVisits: number;
    }>();

    clients.forEach(client => {
      client.purchaseCategories?.forEach(category => {
        if (!groupMap.has(category)) {
          groupMap.set(category, { category, clients: [], totalRevenue: 0, totalVisits: 0 });
        }
        const group = groupMap.get(category)!;
        const categoryRevenue = client.visits
          .filter(v => v.category === category && v.status === 'completed')
          .reduce((sum, v) => sum + v.price, 0);
        const categoryVisits = client.visits.filter(v => v.category === category).length;
        group.clients.push({
          id: client.id, firstName: client.firstName, lastName: client.lastName,
          lastVisit: client.lastVisit, totalSpent: categoryRevenue
        });
        group.totalRevenue += categoryRevenue;
        group.totalVisits += categoryVisits;
      });
    });

    return Array.from(groupMap.values())
      .map(group => ({
        category: group.category, clientCount: group.clients.length, totalRevenue: group.totalRevenue,
        avgVisits: group.clients.length > 0 ? group.totalVisits / group.clients.length : 0,
        clients: group.clients.sort((a, b) => b.totalSpent - a.totalSpent)
      }))
      .sort((a, b) => b.totalRevenue - a.totalRevenue);
  }, [clients]);

  const handleSelectCategory = (category: string) => {
    setFilters(prev => ({ ...prev, categories: [category] }));
    setMainViewTab("list");
  };

  const openClientDetails = (client: Client) => {
    setSelectedClient(client);
    setEditedClient({ ...client });
    setIsEditing(false);
    setActiveTab("info");
    setIsDialogOpen(true);
  };

  const openNewClient = () => {
    const newClient: Client = {
      id: Date.now().toString(), firstName: "", lastName: "", phone: "", email: "",
      tags: ["new"], notes: "", createdAt: new Date().toISOString().split('T')[0],
      totalVisits: 0, totalSpent: 0, visits: [], purchaseCategories: []
    };
    setSelectedClient(null);
    setEditedClient(newClient);
    setIsEditing(true);
    setActiveTab("info");
    setIsDialogOpen(true);
  };

  const saveClient = async () => {
    if (!editedClient) return;
    if (!editedClient.firstName || !editedClient.lastName || !editedClient.phone) {
      toast({ title: t('common.error'), description: t('clients.fillRequired'), variant: "destructive" });
      return;
    }

    if (isDemo) {
      // Demo mode - no persistence
      toast({ title: t('common.saved'), description: "Demo – dane nie zostały zapisane" });
      setIsDialogOpen(false);
      return;
    }

    try {
      if (selectedClient) {
        await updateClient.mutateAsync({
          id: editedClient.id,
          first_name: editedClient.firstName,
          last_name: editedClient.lastName,
          phone: editedClient.phone,
          email: editedClient.email || undefined,
          notes: editedClient.notes || undefined,
          tags: editedClient.tags,
        });
        toast({ title: t('common.saved'), description: t('clients.clientUpdated') });
      } else {
        await createClient.mutateAsync({
          first_name: editedClient.firstName,
          last_name: editedClient.lastName,
          phone: editedClient.phone,
          email: editedClient.email || undefined,
          notes: editedClient.notes || undefined,
          tags: editedClient.tags,
          rodo_consent: true,
        });
        toast({ title: t('common.added'), description: t('clients.clientAdded') });
      }
      setIsDialogOpen(false);
      setIsEditing(false);
    } catch {
      toast({ title: t('common.error'), description: "Nie udało się zapisać klienta", variant: "destructive" });
    }
  };

  const deleteClient = async (id: string) => {
    if (isDemo) {
      setIsDialogOpen(false);
      return;
    }
    try {
      await deleteClientMutation.mutateAsync(id);
      setIsDialogOpen(false);
      toast({ title: t('common.deleted'), description: t('clients.clientDeleted') });
    } catch {
      toast({ title: t('common.error'), description: "Nie udało się usunąć klienta", variant: "destructive" });
    }
  };

  const toggleTag = (tagId: string) => {
    if (!editedClient) return;
    const newTags = editedClient.tags.includes(tagId)
      ? editedClient.tags.filter(t => t !== tagId)
      : [...editedClient.tags, tagId];
    setEditedClient({ ...editedClient, tags: newTags });
  };

  const getTagInfo = (tagId: string) => availableTags.find(t => t.id === tagId);

  const getStatusBadge = (status: Visit["status"]) => {
    switch (status) {
      case "completed": return <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900/50">{t('clients.visitStatus.completed')}</Badge>;
      case "cancelled": return <Badge variant="secondary" className="bg-gray-100 text-gray-800 dark:bg-gray-900/50">{t('clients.visitStatus.cancelled')}</Badge>;
      case "no-show": return <Badge variant="secondary" className="bg-red-100 text-red-800 dark:bg-red-900/50">{t('clients.visitStatus.noShow')}</Badge>;
    }
  };

  const inactiveClientsCount = clients.filter(c => {
    const days = getDaysSinceLastVisit(c.lastVisit);
    return days && days > 30;
  }).length;

  // Loading state
  if (!isDemo && isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  // Empty state for production (no clients yet)
  if (!isDemo && clients.length === 0) {
    return (
      <div className="space-y-6">
        <SectionGuide sectionKey="clients" />
        <div className="text-center py-16">
          <Users className="w-16 h-16 mx-auto text-muted-foreground/30 mb-4" />
          <h3 className="text-xl font-serif font-semibold mb-2">Brak klientów</h3>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            Dodaj pierwszego klienta ręcznie lub poczekaj — profil zostanie utworzony automatycznie przy pierwszej rezerwacji online.
          </p>
          <Button onClick={openNewClient} className="gap-2">
            <Plus className="w-4 h-4" />
            {t('clients.addClient')}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <SectionGuide sectionKey="clients" />
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-serif font-bold">{t('clients.title')}</h2>
          <p className="text-muted-foreground">
            {clients.length} {t('clients.clientsInDatabase')}
            {inactiveClientsCount > 0 && (
              <span className="ml-2 text-orange-600">
                • {inactiveClientsCount} {t('clients.needsAttention')}
              </span>
            )}
          </p>
        </div>
        <Button onClick={openNewClient} className="gap-2">
          <Plus className="w-4 h-4" />
          {t('clients.addClient')}
        </Button>
      </div>

      {/* Main view tabs */}
      <div className="flex items-center gap-4 border-b">
        <button
          onClick={() => setMainViewTab("list")}
          className={cn(
            "flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors",
            mainViewTab === "list" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
          )}
        >
          <Users className="w-4 h-4" />
          {t('clients.listView')}
        </button>
        <button
          onClick={() => setMainViewTab("groups")}
          className={cn(
            "flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors",
            mainViewTab === "groups" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
          )}
        >
          <FolderOpen className="w-4 h-4" />
          {t('clients.purchaseGroups.title')}
        </button>
      </div>

      {mainViewTab === "list" ? (
        <>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder={t('clients.searchPlaceholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <ClientFilters
              filters={filters}
              onFiltersChange={setFilters}
              availableTags={availableTags}
              availableCategories={availableCategories}
            />
          </div>

          <div className="grid gap-3">
            {filteredClients.map((client) => (
              <ClientListItem
                key={client.id}
                client={client}
                availableTags={availableTags}
                onClick={() => openClientDetails(client)}
              />
            ))}

            {filteredClients.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>{t('clients.noResults')}</p>
              </div>
            )}
          </div>
        </>
      ) : (
        <PurchaseGroups 
          groups={purchaseGroups}
          onSelectCategory={handleSelectCategory}
        />
      )}

      {/* Client Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-serif">
              {selectedClient 
                ? `${selectedClient.firstName} ${selectedClient.lastName}`
                : t('clients.newClient')
              }
            </DialogTitle>
          </DialogHeader>

          {(isEditing || !selectedClient) ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>{t('clients.firstName')}</Label>
                  <Input
                    value={editedClient?.firstName || ""}
                    onChange={(e) => setEditedClient(prev => prev ? { ...prev, firstName: e.target.value } : null)}
                  />
                </div>
                <div>
                  <Label>{t('clients.lastName')}</Label>
                  <Input
                    value={editedClient?.lastName || ""}
                    onChange={(e) => setEditedClient(prev => prev ? { ...prev, lastName: e.target.value } : null)}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>{t('clients.phone')}</Label>
                  <Input
                    value={editedClient?.phone || ""}
                    onChange={(e) => setEditedClient(prev => prev ? { ...prev, phone: e.target.value } : null)}
                  />
                </div>
                <div>
                  <Label>{t('clients.email')}</Label>
                  <Input
                    value={editedClient?.email || ""}
                    onChange={(e) => setEditedClient(prev => prev ? { ...prev, email: e.target.value } : null)}
                  />
                </div>
              </div>
              <div>
                <Label>{t('clients.notes')}</Label>
                <Textarea
                  value={editedClient?.notes || ""}
                  onChange={(e) => setEditedClient(prev => prev ? { ...prev, notes: e.target.value } : null)}
                />
              </div>
              <div>
                <Label>{t('clients.tags')}</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {availableTags.map(tag => (
                    <Button
                      key={tag.id}
                      type="button"
                      variant={editedClient?.tags.includes(tag.id) ? "default" : "outline"}
                      size="sm"
                      onClick={() => toggleTag(tag.id)}
                    >
                      {tag.label}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList>
                <TabsTrigger value="info">{t('clients.info')}</TabsTrigger>
                <TabsTrigger value="history">{t('clients.visitHistory')}</TabsTrigger>
              </TabsList>
              <TabsContent value="info" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    {selectedClient.phone}
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    {selectedClient.email || "—"}
                  </div>
                </div>
                {selectedClient.notes && (
                  <div className="p-3 rounded-lg bg-muted/30">
                    <p className="text-sm">{selectedClient.notes}</p>
                  </div>
                )}
                <div className="flex flex-wrap gap-2">
                  {selectedClient.tags.map(tagId => {
                    const tag = getTagInfo(tagId);
                    return tag ? (
                      <Badge key={tagId} className={tag.color}>{tag.label}</Badge>
                    ) : null;
                  })}
                </div>
                <ClientRiskBadge clientId={selectedClient.id} />
              </TabsContent>
              <TabsContent value="history">
                <div className="space-y-2">
                  {selectedClient.visits.length === 0 ? (
                    <p className="text-center py-8 text-muted-foreground">{t('clients.noVisits')}</p>
                  ) : (
                    selectedClient.visits.map(visit => (
                      <div key={visit.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                        <div>
                          <p className="font-medium text-sm">{visit.service}</p>
                          <p className="text-xs text-muted-foreground">{visit.date} • {visit.time} • {visit.staff}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          {getStatusBadge(visit.status)}
                          <span className="text-sm font-medium">{visit.price} zł</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </TabsContent>
            </Tabs>
          )}

          <DialogFooter>
            {selectedClient && !isEditing && (
              <>
                <Button variant="destructive" size="sm" onClick={() => deleteClient(selectedClient.id)}>
                  <Trash2 className="w-4 h-4 mr-2" />
                  {t('common.delete')}
                </Button>
                <Button variant="outline" onClick={() => setIsEditing(true)}>
                  <Edit2 className="w-4 h-4 mr-2" />
                  {t('common.edit')}
                </Button>
              </>
            )}
            {(isEditing || !selectedClient) && (
              <>
                <Button variant="outline" onClick={() => { setIsDialogOpen(false); setIsEditing(false); }}>
                  {t('common.cancel')}
                </Button>
                <Button onClick={saveClient}>{t('common.save')}</Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

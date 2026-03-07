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
import { VideoTutorialCard } from "./VideoTutorialCard";

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

const mockClients: Client[] = [
  {
    id: "1",
    firstName: "Anna",
    lastName: "Kowalska",
    phone: "+48 123 456 789",
    email: "anna.kowalska@email.pl",
    tags: ["vip", "regular"],
    notes: "Preferuje zabiegi w piątki po 16:00. Alergia na parabeny.",
    createdAt: "2024-01-15",
    lastVisit: "2024-12-01",
    totalVisits: 24,
    totalSpent: 4800,
    purchaseCategories: ["Zabiegi na twarz", "Mezoterapia"],
    visits: [
      { id: "v1", date: "2024-12-01", time: "14:00", service: "Mezoterapia twarzy", category: "Mezoterapia", staff: "Maria", status: "completed", price: 350 },
      { id: "v2", date: "2024-11-15", time: "16:00", service: "Manicure hybrydowy", category: "Manicure & Pedicure", staff: "Anna", status: "completed", price: 120 },
      { id: "v3", date: "2024-11-01", time: "10:00", service: "Peeling kawitacyjny", category: "Zabiegi na twarz", staff: "Maria", status: "completed", price: 180 },
    ]
  },
  {
    id: "2",
    firstName: "Katarzyna",
    lastName: "Nowak",
    phone: "+48 987 654 321",
    email: "k.nowak@gmail.com",
    tags: ["new"],
    notes: "",
    createdAt: "2024-11-20",
    lastVisit: "2024-11-20",
    totalVisits: 1,
    totalSpent: 200,
    purchaseCategories: ["Konsultacje"],
    visits: [
      { id: "v4", date: "2024-11-20", time: "11:00", service: "Konsultacja", category: "Konsultacje", staff: "Joanna", status: "completed", price: 200 },
    ]
  },
  {
    id: "3",
    firstName: "Magdalena",
    lastName: "Wiśniewska",
    phone: "+48 555 123 456",
    email: "magda.w@wp.pl",
    tags: ["regular", "evening"],
    notes: "Wrażliwa skóra. Zawsze rezerwuje na 18:00.",
    createdAt: "2023-06-10",
    lastVisit: "2024-11-28",
    totalVisits: 18,
    totalSpent: 3600,
    purchaseCategories: ["Depilacja"],
    visits: [
      { id: "v5", date: "2024-11-28", time: "18:00", service: "Depilacja laserowa", category: "Depilacja", staff: "Maria", status: "completed", price: 300 },
      { id: "v6", date: "2024-11-14", time: "18:00", service: "Depilacja laserowa", category: "Depilacja", staff: "Maria", status: "completed", price: 300 },
    ]
  },
  {
    id: "4",
    firstName: "Ewa",
    lastName: "Dąbrowska",
    phone: "+48 111 222 333",
    email: "ewa.d@email.pl",
    tags: ["problematic"],
    notes: "Dwukrotnie nie pojawiła się na wizycie bez uprzedzenia. Wymagać potwierdzenia SMS.",
    createdAt: "2024-03-01",
    lastVisit: "2024-10-15",
    totalVisits: 5,
    totalSpent: 650,
    purchaseCategories: ["Manicure & Pedicure"],
    visits: [
      { id: "v7", date: "2024-10-15", time: "12:00", service: "Manicure klasyczny", category: "Manicure & Pedicure", staff: "Anna", status: "completed", price: 80 },
      { id: "v8", date: "2024-09-20", time: "14:00", service: "Pedicure", category: "Manicure & Pedicure", staff: "Anna", status: "no-show", price: 0 },
    ]
  },
  {
    id: "5",
    firstName: "Zofia",
    lastName: "Lewandowska",
    phone: "+48 444 555 666",
    email: "zofia.lew@gmail.com",
    tags: ["vip", "friday-lover"],
    notes: "Klientka VIP - zawsze oferować kawę/herbatę. Lubi nowości w ofercie.",
    createdAt: "2022-09-01",
    lastVisit: "2024-12-02",
    totalVisits: 48,
    totalSpent: 12500,
    purchaseCategories: ["Lifting", "Mezoterapia", "Zabiegi na twarz"],
    visits: [
      { id: "v9", date: "2024-12-02", time: "10:00", service: "Lifting HIFU", category: "Lifting", staff: "Joanna", status: "completed", price: 800 },
      { id: "v10", date: "2024-11-22", time: "15:00", service: "Mezoterapia", category: "Mezoterapia", staff: "Maria", status: "completed", price: 350 },
    ]
  },
  {
    id: "6",
    firstName: "Marta",
    lastName: "Zielińska",
    phone: "+48 666 777 888",
    email: "marta.z@gmail.com",
    tags: ["regular"],
    notes: "",
    createdAt: "2024-02-15",
    lastVisit: "2024-09-20",
    totalVisits: 8,
    totalSpent: 1200,
    purchaseCategories: ["Zabiegi na twarz"],
    visits: [
      { id: "v11", date: "2024-09-20", time: "11:00", service: "Oczyszczanie twarzy", category: "Zabiegi na twarz", staff: "Maria", status: "completed", price: 150 },
    ]
  },
];

export function ClientsManagement() {
  const { t, i18n } = useTranslation();
  const [clients, setClients] = useState<Client[]>(mockClients);
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
  const { toast } = useToast();

  const availableTags = [
    { id: "vip", label: t('clients.tagLabels.vip'), color: "bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-200" },
    { id: "new", label: t('clients.tagLabels.new'), color: "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-200" },
    { id: "regular", label: t('clients.tagLabels.regular'), color: "bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200" },
    { id: "problematic", label: t('clients.tagLabels.problematic'), color: "bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-200" },
    { id: "friday-lover", label: t('clients.tagLabels.fridayLover'), color: "bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-200" },
    { id: "evening", label: t('clients.tagLabels.evening'), color: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/50 dark:text-indigo-200" },
  ];

  // Get all unique categories from clients
  const availableCategories = useMemo(() => {
    const categories = new Set<string>();
    clients.forEach(client => {
      client.purchaseCategories?.forEach(cat => categories.add(cat));
    });
    return Array.from(categories).sort();
  }, [clients]);

  // Calculate days since last visit
  const getDaysSinceLastVisit = (lastVisit: string | undefined) => {
    if (!lastVisit) return null;
    const lastVisitDate = new Date(lastVisit);
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - lastVisitDate.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  // Filter clients
  const filteredClients = useMemo(() => {
    return clients.filter(client => {
      // Search filter
      const query = searchQuery.toLowerCase();
      const matchesSearch = 
        client.firstName.toLowerCase().includes(query) ||
        client.lastName.toLowerCase().includes(query) ||
        client.phone.includes(query) ||
        client.email.toLowerCase().includes(query);
      
      if (!matchesSearch) return false;

      // Tag filter
      if (filters.tags.length > 0) {
        const hasMatchingTag = filters.tags.some(tag => client.tags.includes(tag));
        if (!hasMatchingTag) return false;
      }

      // Category filter
      if (filters.categories.length > 0) {
        const hasMatchingCategory = filters.categories.some(cat => 
          client.purchaseCategories?.includes(cat)
        );
        if (!hasMatchingCategory) return false;
      }

      // Inactivity filter
      if (filters.inactivityDays) {
        const daysSince = getDaysSinceLastVisit(client.lastVisit);
        if (!daysSince || daysSince < filters.inactivityDays) return false;
      }

      // Needs followup filter
      if (filters.needsFollowup) {
        const daysSince = getDaysSinceLastVisit(client.lastVisit);
        if (!daysSince || daysSince < 30) return false;
      }

      return true;
    });
  }, [clients, searchQuery, filters]);

  // Generate purchase groups data
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
          groupMap.set(category, {
            category,
            clients: [],
            totalRevenue: 0,
            totalVisits: 0
          });
        }
        const group = groupMap.get(category)!;
        
        // Calculate revenue for this category
        const categoryRevenue = client.visits
          .filter(v => v.category === category && v.status === 'completed')
          .reduce((sum, v) => sum + v.price, 0);
        
        const categoryVisits = client.visits.filter(v => v.category === category).length;

        group.clients.push({
          id: client.id,
          firstName: client.firstName,
          lastName: client.lastName,
          lastVisit: client.lastVisit,
          totalSpent: categoryRevenue
        });
        group.totalRevenue += categoryRevenue;
        group.totalVisits += categoryVisits;
      });
    });

    return Array.from(groupMap.values())
      .map(group => ({
        category: group.category,
        clientCount: group.clients.length,
        totalRevenue: group.totalRevenue,
        avgVisits: group.clients.length > 0 ? group.totalVisits / group.clients.length : 0,
        clients: group.clients.sort((a, b) => b.totalSpent - a.totalSpent)
      }))
      .sort((a, b) => b.totalRevenue - a.totalRevenue);
  }, [clients]);

  const handleSelectCategory = (category: string) => {
    setFilters(prev => ({
      ...prev,
      categories: [category]
    }));
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
      id: Date.now().toString(),
      firstName: "",
      lastName: "",
      phone: "",
      email: "",
      tags: ["new"],
      notes: "",
      createdAt: new Date().toISOString().split('T')[0],
      totalVisits: 0,
      totalSpent: 0,
      visits: [],
      purchaseCategories: []
    };
    setSelectedClient(null);
    setEditedClient(newClient);
    setIsEditing(true);
    setActiveTab("info");
    setIsDialogOpen(true);
  };

  const saveClient = () => {
    if (!editedClient) return;
    
    if (!editedClient.firstName || !editedClient.lastName || !editedClient.phone) {
      toast({
        title: t('common.error'),
        description: t('clients.fillRequired'),
        variant: "destructive"
      });
      return;
    }

    if (selectedClient) {
      setClients(clients.map(c => c.id === editedClient.id ? editedClient : c));
      toast({ title: t('common.saved'), description: t('clients.clientUpdated') });
    } else {
      setClients([...clients, editedClient]);
      toast({ title: t('common.added'), description: t('clients.clientAdded') });
    }
    
    setIsDialogOpen(false);
    setIsEditing(false);
  };

  const deleteClient = (id: string) => {
    setClients(clients.filter(c => c.id !== id));
    setIsDialogOpen(false);
    toast({ title: t('common.deleted'), description: t('clients.clientDeleted') });
  };

  const toggleTag = (tagId: string) => {
    if (!editedClient) return;
    const newTags = editedClient.tags.includes(tagId)
      ? editedClient.tags.filter(t => t !== tagId)
      : [...editedClient.tags, tagId];
    setEditedClient({ ...editedClient, tags: newTags });
  };

  const getTagInfo = (tagId: string) => {
    return availableTags.find(t => t.id === tagId);
  };

  const getStatusBadge = (status: Visit["status"]) => {
    switch (status) {
      case "completed":
        return <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900/50">{t('clients.visitStatus.completed')}</Badge>;
      case "cancelled":
        return <Badge variant="secondary" className="bg-gray-100 text-gray-800 dark:bg-gray-900/50">{t('clients.visitStatus.cancelled')}</Badge>;
      case "no-show":
        return <Badge variant="secondary" className="bg-red-100 text-red-800 dark:bg-red-900/50">{t('clients.visitStatus.noShow')}</Badge>;
    }
  };

  // Stats
  const inactiveClientsCount = clients.filter(c => {
    const days = getDaysSinceLastVisit(c.lastVisit);
    return days && days > 30;
  }).length;

  return (
    <div className="space-y-6">
      <VideoTutorialCard
        title="Jak zarządzać bazą klientów"
        voiceText="Tu zarządzasz bazą klientów. Możesz dodać klientów ręcznie, importować z pliku CSV, lub poczekać — system automatycznie tworzy profil klienta przy pierwszej rezerwacji online. Widzisz historię wizyt, notatki, tagi i ocenę ryzyka odejścia."
      />
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
            mainViewTab === "list" 
              ? "border-primary text-primary" 
              : "border-transparent text-muted-foreground hover:text-foreground"
          )}
        >
          <Users className="w-4 h-4" />
          {t('clients.listView')}
        </button>
        <button
          onClick={() => setMainViewTab("groups")}
          className={cn(
            "flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors",
            mainViewTab === "groups" 
              ? "border-primary text-primary" 
              : "border-transparent text-muted-foreground hover:text-foreground"
          )}
        >
          <FolderOpen className="w-4 h-4" />
          {t('clients.purchaseGroups.title')}
        </button>
      </div>

      {mainViewTab === "list" ? (
        <>
          {/* Search and filters */}
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

          {/* Clients list */}
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
                <User className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p className="font-medium">{t('clients.noResults')}</p>
                <p className="text-sm">{t('clients.tryDifferentSearch')}</p>
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

      {/* Client details dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-serif text-xl">
              {selectedClient ? `${selectedClient.firstName} ${selectedClient.lastName}` : t('clients.newClient')}
            </DialogTitle>
          </DialogHeader>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="info" className="gap-2">
                <User className="w-4 h-4" />
                {t('clients.data')}
              </TabsTrigger>
              <TabsTrigger value="history" className="gap-2" disabled={!selectedClient}>
                <History className="w-4 h-4" />
                {t('clients.history')}
              </TabsTrigger>
              <TabsTrigger value="notes" className="gap-2">
                <StickyNote className="w-4 h-4" />
                {t('clients.notes')}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="info" className="space-y-4 mt-4">
              {/* Basic info */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t('clients.firstName')} *</Label>
                  <Input
                    value={editedClient?.firstName || ""}
                    onChange={(e) => setEditedClient(prev => prev ? {...prev, firstName: e.target.value} : null)}
                    disabled={!isEditing}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t('clients.lastName')} *</Label>
                  <Input
                    value={editedClient?.lastName || ""}
                    onChange={(e) => setEditedClient(prev => prev ? {...prev, lastName: e.target.value} : null)}
                    disabled={!isEditing}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t('clients.phone')} *</Label>
                  <Input
                    value={editedClient?.phone || ""}
                    onChange={(e) => setEditedClient(prev => prev ? {...prev, phone: e.target.value} : null)}
                    disabled={!isEditing}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t('clients.email')}</Label>
                  <Input
                    type="email"
                    value={editedClient?.email || ""}
                    onChange={(e) => setEditedClient(prev => prev ? {...prev, email: e.target.value} : null)}
                    disabled={!isEditing}
                  />
                </div>
              </div>

              {/* Tags */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Tag className="w-4 h-4" />
                  {t('clients.tags')}
                </Label>
                <div className="flex flex-wrap gap-2">
                  {availableTags.map(tag => (
                    <Badge
                      key={tag.id}
                      variant="secondary"
                      className={cn(
                        "cursor-pointer transition-all",
                        editedClient?.tags.includes(tag.id) ? tag.color : "bg-muted text-muted-foreground opacity-50",
                        !isEditing && "cursor-default"
                      )}
                      onClick={() => isEditing && toggleTag(tag.id)}
                    >
                      {tag.label}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Purchase categories (read-only) */}
              {selectedClient && selectedClient.purchaseCategories.length > 0 && (
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <FolderOpen className="w-4 h-4" />
                    {t('clients.purchaseGroups.title')}
                  </Label>
                  <div className="flex flex-wrap gap-2">
                    {selectedClient.purchaseCategories.map(category => (
                      <Badge key={category} variant="outline" className="bg-primary/5 border-primary/20">
                        {category}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Stats (only for existing clients) */}
              {selectedClient && (
                <div className="grid grid-cols-3 gap-4 pt-4 border-t">
                  <div className="text-center p-3 bg-muted/50 rounded-lg">
                    <div className="text-2xl font-bold font-serif">{selectedClient.totalVisits}</div>
                    <div className="text-xs text-muted-foreground">{t('clients.totalVisits')}</div>
                  </div>
                  <div className="text-center p-3 bg-muted/50 rounded-lg">
                    <div className="text-2xl font-bold font-serif">{selectedClient.totalSpent} zł</div>
                    <div className="text-xs text-muted-foreground">{t('clients.totalSpent')}</div>
                  </div>
                  <div className="text-center p-3 bg-muted/50 rounded-lg">
                    <div className="text-2xl font-bold font-serif">
                      {selectedClient.lastVisit ? new Date(selectedClient.lastVisit).toLocaleDateString(i18n.language === 'pl' ? 'pl-PL' : 'en-US', { day: 'numeric', month: 'short' }) : "-"}
                    </div>
                    <div className="text-xs text-muted-foreground">{t('clients.lastVisit')}</div>
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="history" className="mt-4">
              {selectedClient && selectedClient.visits.length > 0 ? (
                <div className="space-y-3">
                  <h4 className="font-medium">{t('clients.visitHistory')}</h4>
                  {selectedClient.visits.map(visit => (
                    <div key={visit.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                      <div className="flex items-center gap-3">
                        <div className="text-center">
                          <div className="text-sm font-medium">{visit.date}</div>
                          <div className="text-xs text-muted-foreground">{visit.time}</div>
                        </div>
                        <div className="h-8 w-px bg-border" />
                        <div>
                          <div className="font-medium text-sm">{visit.service}</div>
                          <div className="text-xs text-muted-foreground flex items-center gap-2">
                            <span>{visit.staff}</span>
                            <Badge variant="outline" className="text-xs h-5">
                              {visit.category}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {getStatusBadge(visit.status)}
                        <span className="font-medium">{visit.price} zł</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <History className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>{t('clients.noVisits')}</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="notes" className="mt-4">
              <div className="space-y-3">
                <Label>{t('clients.clientNotes')}</Label>
                <Textarea
                  value={editedClient?.notes || ""}
                  onChange={(e) => setEditedClient(prev => prev ? {...prev, notes: e.target.value} : null)}
                  disabled={!isEditing}
                  placeholder={t('clients.notesPlaceholder')}
                  className="min-h-[150px]"
                />
              </div>
            </TabsContent>
          </Tabs>

          <DialogFooter className="gap-2">
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
            {isEditing && (
              <>
                <Button variant="outline" onClick={() => {
                  if (selectedClient) {
                    setEditedClient({ ...selectedClient });
                    setIsEditing(false);
                  } else {
                    setIsDialogOpen(false);
                  }
                }}>
                  {t('common.cancel')}
                </Button>
                <Button onClick={saveClient}>
                  {t('common.save')}
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

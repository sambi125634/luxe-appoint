import { useState } from "react";
import { 
  Search, Plus, Phone, Mail, Calendar, Clock, 
  Star, AlertTriangle, Edit2, Trash2, X, User,
  History, StickyNote, Tag, ChevronRight, Filter, Users
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger, DropdownMenuLabel } from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface Visit {
  id: string;
  date: string;
  time: string;
  service: string;
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
}

const availableTags = [
  // Status tags
  { id: "vip", label: "VIP", color: "bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-200", category: "status" },
  { id: "new", label: "Nowa klientka", color: "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-200", category: "status" },
  { id: "regular", label: "Stała klientka", color: "bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200", category: "status" },
  { id: "problematic", label: "Problematyczna", color: "bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-200", category: "status" },
  // Time preferences
  { id: "friday-lover", label: "Lubi piątki", color: "bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-200", category: "time" },
  { id: "evening", label: "Preferuje wieczory", color: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/50 dark:text-indigo-200", category: "time" },
  { id: "morning", label: "Preferuje poranki", color: "bg-sky-100 text-sky-800 dark:bg-sky-900/50 dark:text-sky-200", category: "time" },
  { id: "weekends", label: "Tylko weekendy", color: "bg-teal-100 text-teal-800 dark:bg-teal-900/50 dark:text-teal-200", category: "time" },
  // Purchase preferences
  { id: "premium", label: "Premium", color: "bg-violet-100 text-violet-800 dark:bg-violet-900/50 dark:text-violet-200", category: "purchase" },
  { id: "budget", label: "Budżetowa", color: "bg-slate-100 text-slate-800 dark:bg-slate-900/50 dark:text-slate-200", category: "purchase" },
  { id: "face-treatments", label: "Zabiegi na twarz", color: "bg-pink-100 text-pink-800 dark:bg-pink-900/50 dark:text-pink-200", category: "purchase" },
  { id: "body-treatments", label: "Zabiegi na ciało", color: "bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-200", category: "purchase" },
  { id: "nails", label: "Paznokcie", color: "bg-rose-100 text-rose-800 dark:bg-rose-900/50 dark:text-rose-200", category: "purchase" },
  { id: "hair-removal", label: "Depilacja", color: "bg-fuchsia-100 text-fuchsia-800 dark:bg-fuchsia-900/50 dark:text-fuchsia-200", category: "purchase" },
  { id: "likes-new", label: "Lubi nowości", color: "bg-cyan-100 text-cyan-800 dark:bg-cyan-900/50 dark:text-cyan-200", category: "purchase" },
  { id: "package-buyer", label: "Kupuje pakiety", color: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-200", category: "purchase" },
];

const tagCategories = [
  { id: "status", label: "Status" },
  { id: "time", label: "Preferencje czasowe" },
  { id: "purchase", label: "Preferencje zakupowe" },
];

const mockClients: Client[] = [
  {
    id: "1",
    firstName: "Anna",
    lastName: "Kowalska",
    phone: "+48 123 456 789",
    email: "anna.kowalska@email.pl",
    tags: ["vip", "regular", "premium", "face-treatments", "likes-new"],
    notes: "Preferuje zabiegi w piątki po 16:00. Alergia na parabeny.",
    createdAt: "2024-01-15",
    lastVisit: "2024-12-01",
    totalVisits: 24,
    totalSpent: 4800,
    visits: [
      { id: "v1", date: "2024-12-01", time: "14:00", service: "Mezoterapia twarzy", staff: "Maria", status: "completed", price: 350 },
      { id: "v2", date: "2024-11-15", time: "16:00", service: "Manicure hybrydowy", staff: "Anna", status: "completed", price: 120 },
      { id: "v3", date: "2024-11-01", time: "10:00", service: "Peeling kawitacyjny", staff: "Maria", status: "completed", price: 180 },
    ]
  },
  {
    id: "2",
    firstName: "Katarzyna",
    lastName: "Nowak",
    phone: "+48 987 654 321",
    email: "k.nowak@gmail.com",
    tags: ["new", "budget", "nails"],
    notes: "",
    createdAt: "2024-11-20",
    lastVisit: "2024-11-20",
    totalVisits: 1,
    totalSpent: 200,
    visits: [
      { id: "v4", date: "2024-11-20", time: "11:00", service: "Konsultacja", staff: "Joanna", status: "completed", price: 200 },
    ]
  },
  {
    id: "3",
    firstName: "Magdalena",
    lastName: "Wiśniewska",
    phone: "+48 555 123 456",
    email: "magda.w@wp.pl",
    tags: ["regular", "evening", "hair-removal", "package-buyer"],
    notes: "Wrażliwa skóra. Zawsze rezerwuje na 18:00.",
    createdAt: "2023-06-10",
    lastVisit: "2024-11-28",
    totalVisits: 18,
    totalSpent: 3600,
    visits: [
      { id: "v5", date: "2024-11-28", time: "18:00", service: "Depilacja laserowa", staff: "Maria", status: "completed", price: 300 },
      { id: "v6", date: "2024-11-14", time: "18:00", service: "Depilacja laserowa", staff: "Maria", status: "completed", price: 300 },
    ]
  },
  {
    id: "4",
    firstName: "Ewa",
    lastName: "Dąbrowska",
    phone: "+48 111 222 333",
    email: "ewa.d@email.pl",
    tags: ["problematic", "budget"],
    notes: "Dwukrotnie nie pojawiła się na wizycie bez uprzedzenia. Wymagać potwierdzenia SMS.",
    createdAt: "2024-03-01",
    lastVisit: "2024-10-15",
    totalVisits: 5,
    totalSpent: 650,
    visits: [
      { id: "v7", date: "2024-10-15", time: "12:00", service: "Manicure klasyczny", staff: "Anna", status: "completed", price: 80 },
      { id: "v8", date: "2024-09-20", time: "14:00", service: "Pedicure", staff: "Anna", status: "no-show", price: 0 },
    ]
  },
  {
    id: "5",
    firstName: "Zofia",
    lastName: "Lewandowska",
    phone: "+48 444 555 666",
    email: "zofia.lew@gmail.com",
    tags: ["vip", "friday-lover", "premium", "body-treatments", "likes-new"],
    notes: "Klientka VIP - zawsze oferować kawę/herbatę. Lubi nowości w ofercie.",
    createdAt: "2022-09-01",
    lastVisit: "2024-12-02",
    totalVisits: 48,
    totalSpent: 12500,
    visits: [
      { id: "v9", date: "2024-12-02", time: "10:00", service: "Lifting HIFU", staff: "Joanna", status: "completed", price: 800 },
      { id: "v10", date: "2024-11-22", time: "15:00", service: "Mezoterapia", staff: "Maria", status: "completed", price: 350 },
    ]
  },
  {
    id: "6",
    firstName: "Marta",
    lastName: "Zielińska",
    phone: "+48 666 777 888",
    email: "marta.z@email.pl",
    tags: ["regular", "morning", "nails", "package-buyer"],
    notes: "Preferuje wizyty rano. Kupuje pakiety manicure co 3 miesiące.",
    createdAt: "2023-03-15",
    lastVisit: "2024-11-30",
    totalVisits: 32,
    totalSpent: 4200,
    visits: [
      { id: "v11", date: "2024-11-30", time: "09:00", service: "Manicure hybrydowy", staff: "Anna", status: "completed", price: 120 },
    ]
  },
];

export function ClientsManagement() {
  const [clients, setClients] = useState<Client[]>(mockClients);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedClient, setEditedClient] = useState<Client | null>(null);
  const [activeTab, setActiveTab] = useState("info");
  const [selectedTagFilter, setSelectedTagFilter] = useState<string | null>(null);
  const [groupByTag, setGroupByTag] = useState<string | null>(null);
  const { toast } = useToast();

  const filteredClients = clients.filter(client => {
    const query = searchQuery.toLowerCase();
    const matchesSearch = (
      client.firstName.toLowerCase().includes(query) ||
      client.lastName.toLowerCase().includes(query) ||
      client.phone.includes(query) ||
      client.email.toLowerCase().includes(query)
    );
    const matchesTag = !selectedTagFilter || client.tags.includes(selectedTagFilter);
    return matchesSearch && matchesTag;
  });

  const groupedClients = groupByTag 
    ? {
        withTag: filteredClients.filter(c => c.tags.includes(groupByTag)),
        withoutTag: filteredClients.filter(c => !c.tags.includes(groupByTag)),
      }
    : null;

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
      visits: []
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
        title: "Błąd",
        description: "Wypełnij wszystkie wymagane pola (imię, nazwisko, telefon)",
        variant: "destructive"
      });
      return;
    }

    if (selectedClient) {
      setClients(clients.map(c => c.id === editedClient.id ? editedClient : c));
      toast({ title: "Zapisano", description: "Dane klientki zostały zaktualizowane" });
    } else {
      setClients([...clients, editedClient]);
      toast({ title: "Dodano", description: "Nowa klientka została dodana" });
    }
    
    setIsDialogOpen(false);
    setIsEditing(false);
  };

  const deleteClient = (id: string) => {
    setClients(clients.filter(c => c.id !== id));
    setIsDialogOpen(false);
    toast({ title: "Usunięto", description: "Klientka została usunięta" });
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
        return <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900/50">Zrealizowana</Badge>;
      case "cancelled":
        return <Badge variant="secondary" className="bg-gray-100 text-gray-800 dark:bg-gray-900/50">Anulowana</Badge>;
      case "no-show":
        return <Badge variant="secondary" className="bg-red-100 text-red-800 dark:bg-red-900/50">No-show</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-serif font-bold">Klienci</h2>
          <p className="text-muted-foreground">
            {clients.length} klientek w bazie
          </p>
        </div>
        <Button onClick={openNewClient} className="gap-2">
          <Plus className="w-4 h-4" />
          Dodaj klientkę
        </Button>
      </div>

      {/* Search */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Szukaj po imieniu, nazwisku, telefonie lub e-mail..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        
        {/* Tag filter */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant={selectedTagFilter ? "secondary" : "outline"} className="gap-2">
              <Filter className="w-4 h-4" />
              {selectedTagFilter ? getTagInfo(selectedTagFilter)?.label : "Filtruj po tagu"}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56">
            <DropdownMenuItem onClick={() => setSelectedTagFilter(null)}>Wszystkie</DropdownMenuItem>
            <DropdownMenuSeparator />
            {tagCategories.map(category => (
              <div key={category.id}>
                <DropdownMenuLabel className="text-xs text-muted-foreground">{category.label}</DropdownMenuLabel>
                {availableTags.filter(t => t.category === category.id).map(tag => (
                  <DropdownMenuItem key={tag.id} onClick={() => setSelectedTagFilter(tag.id)}>
                    <Badge variant="secondary" className={cn("text-xs mr-2", tag.color)}>{tag.label}</Badge>
                  </DropdownMenuItem>
                ))}
              </div>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Group by tag */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant={groupByTag ? "secondary" : "outline"} className="gap-2">
              <Users className="w-4 h-4" />
              {groupByTag ? `Grupuj: ${getTagInfo(groupByTag)?.label}` : "Grupuj"}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56">
            <DropdownMenuItem onClick={() => setGroupByTag(null)}>Bez grupowania</DropdownMenuItem>
            <DropdownMenuSeparator />
            {availableTags.slice(0, 10).map(tag => (
              <DropdownMenuItem key={tag.id} onClick={() => setGroupByTag(tag.id)}>
                <Badge variant="secondary" className={cn("text-xs mr-2", tag.color)}>{tag.label}</Badge>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {(selectedTagFilter || groupByTag) && (
          <Button variant="ghost" size="sm" onClick={() => { setSelectedTagFilter(null); setGroupByTag(null); }}>
            Wyczyść
          </Button>
        )}
      </div>

      {/* Clients list */}
      <div className="grid gap-3">
        {filteredClients.map((client) => (
          <Card 
            key={client.id} 
            className="cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => openClientDetails(client)}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold",
                    client.tags.includes("vip") 
                      ? "bg-gradient-to-r from-amber-400 to-amber-600 text-white"
                      : "bg-muted text-muted-foreground"
                  )}>
                    {client.firstName[0]}{client.lastName[0]}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{client.firstName} {client.lastName}</h3>
                      {client.tags.includes("vip") && (
                        <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                      )}
                      {client.tags.includes("problematic") && (
                        <AlertTriangle className="w-4 h-4 text-red-500" />
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Phone className="w-3 h-3" />
                        {client.phone}
                      </span>
                      <span className="flex items-center gap-1">
                        <Mail className="w-3 h-3" />
                        {client.email}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-right hidden sm:block">
                    <div className="text-sm font-medium">{client.totalVisits} wizyt</div>
                    <div className="text-xs text-muted-foreground">{client.totalSpent} zł łącznie</div>
                  </div>
                  <div className="flex flex-wrap gap-1 max-w-[200px] hidden md:flex">
                    {client.tags.slice(0, 3).map(tagId => {
                      const tag = getTagInfo(tagId);
                      return tag ? (
                        <Badge key={tagId} variant="secondary" className={cn("text-xs", tag.color)}>
                          {tag.label}
                        </Badge>
                      ) : null;
                    })}
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {filteredClients.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <User className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p className="font-medium">Brak wyników</p>
            <p className="text-sm">Spróbuj zmienić kryteria wyszukiwania</p>
          </div>
        )}
      </div>

      {/* Client details dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-serif text-xl">
              {selectedClient ? `${selectedClient.firstName} ${selectedClient.lastName}` : "Nowa klientka"}
            </DialogTitle>
          </DialogHeader>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="info" className="gap-2">
                <User className="w-4 h-4" />
                Dane
              </TabsTrigger>
              <TabsTrigger value="history" className="gap-2" disabled={!selectedClient}>
                <History className="w-4 h-4" />
                Historia
              </TabsTrigger>
              <TabsTrigger value="notes" className="gap-2">
                <StickyNote className="w-4 h-4" />
                Notatki
              </TabsTrigger>
            </TabsList>

            <TabsContent value="info" className="space-y-4 mt-4">
              {/* Basic info */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Imię *</Label>
                  <Input
                    value={editedClient?.firstName || ""}
                    onChange={(e) => setEditedClient(prev => prev ? {...prev, firstName: e.target.value} : null)}
                    disabled={!isEditing}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Nazwisko *</Label>
                  <Input
                    value={editedClient?.lastName || ""}
                    onChange={(e) => setEditedClient(prev => prev ? {...prev, lastName: e.target.value} : null)}
                    disabled={!isEditing}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Telefon *</Label>
                  <Input
                    value={editedClient?.phone || ""}
                    onChange={(e) => setEditedClient(prev => prev ? {...prev, phone: e.target.value} : null)}
                    disabled={!isEditing}
                  />
                </div>
                <div className="space-y-2">
                  <Label>E-mail</Label>
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
                  Tagi
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

              {/* Stats (only for existing clients) */}
              {selectedClient && (
                <div className="grid grid-cols-3 gap-4 pt-4 border-t">
                  <div className="text-center p-3 bg-muted/50 rounded-lg">
                    <div className="text-2xl font-bold font-serif">{selectedClient.totalVisits}</div>
                    <div className="text-xs text-muted-foreground">Wizyt</div>
                  </div>
                  <div className="text-center p-3 bg-muted/50 rounded-lg">
                    <div className="text-2xl font-bold font-serif">{selectedClient.totalSpent} zł</div>
                    <div className="text-xs text-muted-foreground">Łącznie wydane</div>
                  </div>
                  <div className="text-center p-3 bg-muted/50 rounded-lg">
                    <div className="text-2xl font-bold font-serif">
                      {selectedClient.lastVisit ? new Date(selectedClient.lastVisit).toLocaleDateString('pl-PL', { day: 'numeric', month: 'short' }) : "-"}
                    </div>
                    <div className="text-xs text-muted-foreground">Ostatnia wizyta</div>
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="history" className="mt-4">
              {selectedClient && selectedClient.visits.length > 0 ? (
                <div className="space-y-3">
                  {selectedClient.visits.map((visit) => (
                    <div key={visit.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="text-center min-w-[60px]">
                          <div className="text-sm font-semibold">
                            {new Date(visit.date).toLocaleDateString('pl-PL', { day: 'numeric', month: 'short' })}
                          </div>
                          <div className="text-xs text-muted-foreground">{visit.time}</div>
                        </div>
                        <div className="h-10 w-px bg-border" />
                        <div>
                          <div className="font-medium">{visit.service}</div>
                          <div className="text-sm text-muted-foreground">{visit.staff}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {visit.price > 0 && (
                          <span className="font-semibold">{visit.price} zł</span>
                        )}
                        {getStatusBadge(visit.status)}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Brak historii wizyt</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="notes" className="mt-4">
              <div className="space-y-2">
                <Label>Notatki o klience</Label>
                <Textarea
                  placeholder="Preferencje, przeciwwskazania, uwagi..."
                  value={editedClient?.notes || ""}
                  onChange={(e) => setEditedClient(prev => prev ? {...prev, notes: e.target.value} : null)}
                  disabled={!isEditing}
                  rows={6}
                />
                <p className="text-xs text-muted-foreground">
                  Np. alergie, preferencje czasowe, ulubione zabiegi, uwagi do obsługi
                </p>
              </div>
            </TabsContent>
          </Tabs>

          <DialogFooter className="flex-col sm:flex-row gap-2 mt-4">
            {selectedClient && !isEditing && (
              <>
                <Button variant="destructive" size="sm" onClick={() => deleteClient(selectedClient.id)}>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Usuń
                </Button>
                <div className="flex-1" />
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Zamknij
                </Button>
                <Button onClick={() => setIsEditing(true)}>
                  <Edit2 className="w-4 h-4 mr-2" />
                  Edytuj
                </Button>
              </>
            )}
            {isEditing && (
              <>
                <div className="flex-1" />
                <Button variant="outline" onClick={() => {
                  if (selectedClient) {
                    setEditedClient({ ...selectedClient });
                    setIsEditing(false);
                  } else {
                    setIsDialogOpen(false);
                  }
                }}>
                  Anuluj
                </Button>
                <Button onClick={saveClient}>
                  Zapisz
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

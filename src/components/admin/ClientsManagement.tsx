import { useState } from "react";
import { useTranslation } from "react-i18next";
import { 
  Search, Plus, Phone, Mail, Calendar, Clock, 
  Star, AlertTriangle, Edit2, Trash2, X, User,
  History, StickyNote, Tag, ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
    tags: ["new"],
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
    tags: ["regular", "evening"],
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
    tags: ["problematic"],
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
    tags: ["vip", "friday-lover"],
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
  const { toast } = useToast();

  const availableTags = [
    { id: "vip", label: t('clients.tagLabels.vip'), color: "bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-200" },
    { id: "new", label: t('clients.tagLabels.new'), color: "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-200" },
    { id: "regular", label: t('clients.tagLabels.regular'), color: "bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200" },
    { id: "problematic", label: t('clients.tagLabels.problematic'), color: "bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-200" },
    { id: "friday-lover", label: t('clients.tagLabels.fridayLover'), color: "bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-200" },
    { id: "evening", label: t('clients.tagLabels.evening'), color: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/50 dark:text-indigo-200" },
  ];

  const filteredClients = clients.filter(client => {
    const query = searchQuery.toLowerCase();
    return (
      client.firstName.toLowerCase().includes(query) ||
      client.lastName.toLowerCase().includes(query) ||
      client.phone.includes(query) ||
      client.email.toLowerCase().includes(query)
    );
  });

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-serif font-bold">{t('clients.title')}</h2>
          <p className="text-muted-foreground">
            {clients.length} {t('clients.clientsInDatabase')}
          </p>
        </div>
        <Button onClick={openNewClient} className="gap-2">
          <Plus className="w-4 h-4" />
          {t('clients.addClient')}
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder={t('clients.searchPlaceholder')}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
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
                    <div className="text-sm font-medium">{client.totalVisits} {t('clients.visits')}</div>
                    <div className="text-xs text-muted-foreground">{client.totalSpent} zł {t('clients.totalSpent')}</div>
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
            <p className="font-medium">{t('clients.noResults')}</p>
            <p className="text-sm">{t('clients.tryDifferentSearch')}</p>
          </div>
        )}
      </div>

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
                          <div className="text-xs text-muted-foreground">{visit.staff}</div>
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

import { useState } from "react";
import { 
  Plus, 
  Copy, 
  ExternalLink, 
  Settings2, 
  BarChart3, 
  Trash2,
  Code,
  Link,
  Sparkles,
  Tag,
  Eye,
  MoreVertical,
  Check,
  Megaphone,
  Instagram
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { BookingWidget, mockWidgets, mockPromotions, WidgetPromotion } from "./types";
import { EmbedCodeModal } from "./EmbedCodeModal";
import { WidgetEditor } from "./WidgetEditor";
import { PromotionsManager } from "./PromotionsManager";
import { InstagramLinkGenerator } from "./InstagramLinkGenerator";
import { SectionGuide } from "../SectionGuide";

interface WidgetsManagementProps {
  isDemo?: boolean;
}

export function WidgetsManagement({ isDemo = false }: WidgetsManagementProps) {
  const [widgets, setWidgets] = useState<BookingWidget[]>(isDemo ? mockWidgets : []);
  const [promotions, setPromotions] = useState<WidgetPromotion[]>(isDemo ? mockPromotions : []);
  const [activeTab, setActiveTab] = useState("widgets");
  const [selectedWidget, setSelectedWidget] = useState<BookingWidget | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isEmbedModalOpen, setIsEmbedModalOpen] = useState(false);
  const [embedWidget, setEmbedWidget] = useState<BookingWidget | null>(null);

  const handleCopyLink = (widget: BookingWidget) => {
    const link = `${window.location.origin}/book/${widget.slug}`;
    navigator.clipboard.writeText(link);
    toast.success("Link skopiowany!", {
      description: link,
    });
  };

  const handleOpenEmbed = (widget: BookingWidget) => {
    setEmbedWidget(widget);
    setIsEmbedModalOpen(true);
  };

  const handleEditWidget = (widget: BookingWidget) => {
    setSelectedWidget(widget);
    setIsEditorOpen(true);
  };

  const handleCreateWidget = () => {
    setSelectedWidget(null);
    setIsEditorOpen(true);
  };

  const handleSaveWidget = (widget: BookingWidget) => {
    if (selectedWidget) {
      setWidgets(widgets.map(w => w.id === widget.id ? widget : w));
      toast.success("Widget zaktualizowany");
    } else {
      setWidgets([...widgets, { ...widget, id: Date.now().toString() }]);
      toast.success("Widget utworzony");
    }
    setIsEditorOpen(false);
  };

  const handleDeleteWidget = (widget: BookingWidget) => {
    if (widget.type === "main") {
      toast.error("Nie można usunąć głównego widgetu");
      return;
    }
    setWidgets(widgets.filter(w => w.id !== widget.id));
    toast.success("Widget usunięty");
  };

  const handlePreview = (widget: BookingWidget) => {
    window.open(`/book/${widget.slug}`, '_blank');
  };

  const getWidgetTypeLabel = (type: BookingWidget["type"]) => {
    switch (type) {
      case "main": return "Główny";
      case "campaign": return "Kampania";
      case "promo": return "Promocja";
    }
  };

  const getWidgetTypeBadgeVariant = (type: BookingWidget["type"]) => {
    switch (type) {
      case "main": return "default";
      case "campaign": return "secondary";
      case "promo": return "outline";
    }
  };

  return (
    <div className="space-y-6">
      <SectionGuide sectionKey="widgets" />
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-serif font-bold">Widgety rezerwacji</h2>
          <p className="text-muted-foreground">
            Zarządzaj kalendarzami rezerwacji i promocjami
          </p>
        </div>
        <Button variant="luxury" className="gap-2" onClick={handleCreateWidget}>
          <Plus className="w-4 h-4" />
          Nowy widget
        </Button>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="widgets" className="gap-2">
            <Code className="w-4 h-4" />
            Widgety
          </TabsTrigger>
          <TabsTrigger value="promotions" className="gap-2">
            <Tag className="w-4 h-4" />
            Promocje
          </TabsTrigger>
          <TabsTrigger value="instagram" className="gap-2">
            <Instagram className="w-4 h-4" />
            Instagram
          </TabsTrigger>
        </TabsList>

        <TabsContent value="widgets" className="mt-6">
          {/* Widgets Grid */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {widgets.map((widget) => (
              <Card key={widget.id} className="relative overflow-hidden group">
                {/* Type indicator */}
                <div 
                  className="absolute top-0 left-0 right-0 h-1"
                  style={{ backgroundColor: widget.theme.primaryColor }}
                />
                
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-lg">{widget.name}</CardTitle>
                        {widget.type === "main" && (
                          <Sparkles className="w-4 h-4 text-primary" />
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={getWidgetTypeBadgeVariant(widget.type) as any}>
                          {getWidgetTypeLabel(widget.type)}
                        </Badge>
                        {widget.isActive ? (
                          <Badge variant="outline" className="text-green-600 border-green-600">
                            Aktywny
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-muted-foreground">
                            Nieaktywny
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handlePreview(widget)}>
                          <Eye className="w-4 h-4 mr-2" />
                          Podgląd
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleEditWidget(widget)}>
                          <Settings2 className="w-4 h-4 mr-2" />
                          Edytuj
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleCopyLink(widget)}>
                          <Link className="w-4 h-4 mr-2" />
                          Kopiuj link
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleOpenEmbed(widget)}>
                          <Code className="w-4 h-4 mr-2" />
                          Pobierz kod embed
                        </DropdownMenuItem>
                        {widget.type !== "main" && (
                          <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              onClick={() => handleDeleteWidget(widget)}
                              className="text-destructive"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Usuń
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  
                  {widget.description && (
                    <CardDescription className="line-clamp-2">
                      {widget.description}
                    </CardDescription>
                  )}
                </CardHeader>
                
                <CardContent className="space-y-4">
                  {/* Stats */}
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Eye className="w-4 h-4" />
                      <span>{widget.viewCount} wyświetleń</span>
                    </div>
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Check className="w-4 h-4" />
                      <span>{widget.bookingCount} rezerwacji</span>
                    </div>
                  </div>
                  
                  {/* Promotion badge */}
                  {widget.promotion && (
                    <div className="flex items-center gap-2 p-2 bg-secondary/10 rounded-lg">
                      <Megaphone className="w-4 h-4 text-secondary" />
                      <span className="text-sm font-medium">
                        {widget.promotion.type === "percentage" 
                          ? `-${widget.promotion.value}%` 
                          : `-${widget.promotion.value} zł`}
                      </span>
                      {widget.promotion.code && (
                        <Badge variant="secondary" className="ml-auto">
                          {widget.promotion.code}
                        </Badge>
                      )}
                    </div>
                  )}
                  
                  {/* Quick actions */}
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1 gap-2"
                      onClick={() => handleCopyLink(widget)}
                    >
                      <Copy className="w-3 h-3" />
                      Link
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1 gap-2"
                      onClick={() => handleOpenEmbed(widget)}
                    >
                      <Code className="w-3 h-3" />
                      Embed
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1 gap-2"
                      onClick={() => handlePreview(widget)}
                    >
                      <ExternalLink className="w-3 h-3" />
                      Podgląd
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}

            {/* Create new widget card */}
            <Card 
              className="border-dashed cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-colors"
              onClick={handleCreateWidget}
            >
              <CardContent className="flex flex-col items-center justify-center h-full min-h-[280px] text-center">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <Plus className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-medium mb-1">Utwórz nowy widget</h3>
                <p className="text-sm text-muted-foreground">
                  Stwórz kalendarz dla kampanii lub promocji
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="promotions" className="mt-6">
          <PromotionsManager 
            promotions={promotions}
            onUpdate={setPromotions}
          />
        </TabsContent>

        <TabsContent value="instagram" className="mt-6">
          <InstagramLinkGenerator salonSlug="demo-salon" salonName="Demo Salon Beauty" />
        </TabsContent>
      </Tabs>

      {/* Modals */}
      {isEditorOpen && (
        <WidgetEditor
          widget={selectedWidget}
          isOpen={isEditorOpen}
          onClose={() => setIsEditorOpen(false)}
          onSave={handleSaveWidget}
        />
      )}

      {isEmbedModalOpen && embedWidget && (
        <EmbedCodeModal
          widget={embedWidget}
          isOpen={isEmbedModalOpen}
          onClose={() => setIsEmbedModalOpen(false)}
        />
      )}
    </div>
  );
}

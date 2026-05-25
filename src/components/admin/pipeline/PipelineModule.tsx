import { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { 
  Filter, 
  Search, 
  Users,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Kanban,
  BarChart3,
  GitBranch,
  Settings,
  Sparkles,
  Route,
  Trophy
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { PipelineColumn } from "./PipelineColumn";
import { ContactDetailModal } from "./ContactDetailModal";
import { PipelineReports } from "./PipelineReports";
import { PipelineStageNav } from "./PipelineStageNav";
import { SectionGuide } from "../SectionGuide";
import { cn } from "@/lib/utils";
import {
  PipelineContact,
  defaultPipelineStages,
  mockPipelineContacts
} from "./types";
import { usePipelineContacts } from "@/hooks/usePipelineContacts";

interface PipelineModuleProps {
  isDemo?: boolean;
}

export function PipelineModule({ isDemo = false }: PipelineModuleProps) {
  const { t } = useTranslation();
  const { data: realContacts = [], isLoading } = usePipelineContacts(!isDemo);
  const [contacts, setContacts] = useState<PipelineContact[]>(isDemo ? mockPipelineContacts : []);

  // Sync real data into local state once loaded (allows local drag overrides)
  useEffect(() => {
    if (!isDemo) setContacts(realContacts);
  }, [isDemo, realContacts]);
  const [searchQuery, setSearchQuery] = useState("");
  const [dragOverStage, setDragOverStage] = useState<string | null>(null);
  const [selectedContact, setSelectedContact] = useState<PipelineContact | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const hasAutoScrolled = useRef(false);

  // Auto-scroll on first load to reveal all columns
  useEffect(() => {
    if (hasAutoScrolled.current || contacts.length === 0) return;
    hasAutoScrolled.current = true;

    const timer = setTimeout(() => {
      const viewport = scrollRef.current?.querySelector('[data-radix-scroll-area-viewport]') as HTMLElement | null;
      if (!viewport) return;

      const maxScroll = viewport.scrollWidth - viewport.clientWidth;
      if (maxScroll <= 0) return;

      viewport.scrollTo({ left: maxScroll, behavior: 'smooth' });

      setTimeout(() => {
        viewport.scrollTo({ left: 0, behavior: 'smooth' });
      }, 2500);
    }, 800);

    return () => clearTimeout(timer);
  }, [contacts.length]);

  const handleStageNavClick = (_stageId: string, index: number) => {
    const viewport = scrollRef.current?.querySelector('[data-radix-scroll-area-viewport]') as HTMLElement | null;
    if (!viewport) return;
    const columnWidth = 280 + 16;
    viewport.scrollTo({ left: index * columnWidth, behavior: 'smooth' });
  };
  
  const filteredContacts = contacts.filter(contact => {
    const searchLower = searchQuery.toLowerCase();
    return (
      contact.firstName.toLowerCase().includes(searchLower) ||
      contact.lastName.toLowerCase().includes(searchLower) ||
      contact.email.toLowerCase().includes(searchLower) ||
      contact.serviceName.toLowerCase().includes(searchLower)
    );
  });
  
  const contactsByStage = defaultPipelineStages.reduce((acc, stage) => {
    acc[stage.id] = filteredContacts.filter(c => c.stageId === stage.id);
    return acc;
  }, {} as Record<string, PipelineContact[]>);
  
  // Stats
  const totalContacts = contacts.length;
  const totalValue = contacts.reduce((acc, c) => acc + c.value, 0);
  const noShowCount = contacts.filter(c => c.stageId === 'no-show').length;
  const completedCount = contacts.filter(c => c.stageId === 'completed').length;
  const newThisWeek = isDemo ? 2 : 0;
  const avgClientValue = completedCount > 0 ? Math.round(totalValue / (contacts.length || 1)) : 0;
  
  // Drag & Drop handlers
  const handleDragStart = (e: React.DragEvent, contactId: string) => {
    e.dataTransfer.setData("contactId", contactId);
  };
  
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };
  
  const handleDragEnter = (stageId: string) => {
    setDragOverStage(stageId);
  };
  
  const handleDragLeave = () => {
    setDragOverStage(null);
  };
  
  const handleDrop = (e: React.DragEvent, newStageId: string) => {
    e.preventDefault();
    const contactId = e.dataTransfer.getData("contactId");
    
    setContacts(prev => prev.map(contact => {
      if (contact.id === contactId && contact.stageId !== newStageId) {
        const oldStage = contact.stageId;
        return {
          ...contact,
          stageId: newStageId,
          history: [
            ...contact.history,
            {
              id: `h-${Date.now()}`,
              fromStage: oldStage,
              toStage: newStageId,
              changedAt: new Date().toISOString(),
              changedBy: 'Właściciel'
            }
          ]
        };
      }
      return contact;
    }));
    
    setDragOverStage(null);
  };
  
  const handleContactClick = (contact: PipelineContact) => {
    setSelectedContact(contact);
    setIsModalOpen(true);
  };
  
  const handleStageChange = (contactId: string, newStageId: string) => {
    setContacts(prev => prev.map(contact => {
      if (contact.id === contactId) {
        const oldStage = contact.stageId;
        return {
          ...contact,
          stageId: newStageId,
          history: [
            ...contact.history,
            {
              id: `h-${Date.now()}`,
              fromStage: oldStage,
              toStage: newStageId,
              changedAt: new Date().toISOString(),
              changedBy: 'Właściciel'
            }
          ]
        };
      }
      return contact;
    }));
    
    setSelectedContact(prev => prev ? {
      ...prev,
      stageId: newStageId
    } : null);
  };
  
  const handleSurveySubmit = (contactId: string, visitNumber: number, rating: number, feedback: string) => {
    setContacts(prev => prev.map(contact => {
      if (contact.id === contactId) {
        return {
          ...contact,
          surveys: contact.surveys.map(s => 
            s.visitNumber === visitNumber 
              ? { ...s, completed: true, rating, feedback, completedAt: new Date().toISOString() }
              : s
          )
        };
      }
      return contact;
    }));
    
    setSelectedContact(prev => prev ? {
      ...prev,
      surveys: prev.surveys.map(s => 
        s.visitNumber === visitNumber 
          ? { ...s, completed: true, rating, feedback, completedAt: new Date().toISOString() }
          : s
      )
    } : null);
  };

  // Empty state for production mode
  if (!isDemo && !isLoading && contacts.length === 0) {
    return (
      <div className="space-y-6">
        <SectionGuide sectionKey="pipeline" />
        <div className="glass-card p-12 flex items-center justify-center">
          <div className="text-center max-w-md mx-auto">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
              <Route className="w-8 h-8 text-primary" />
            </div>
            <h3 className="font-serif text-xl font-semibold mb-2">Brak klientek w ścieżce</h3>
            <p className="text-muted-foreground text-sm mb-4">
              Ścieżka Klientki automatycznie śledzi postęp Twoich klientek po pierwszej rezerwacji. Gdy tylko pojawi się pierwsza wizyta — pojawi się tutaj.
            </p>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <Tabs defaultValue="board" className="space-y-4">
      <TabsList>
        <TabsTrigger value="board" className="gap-2">
          <Kanban className="w-4 h-4" />
          {t('pipeline.board')}
        </TabsTrigger>
        <TabsTrigger value="reports" className="gap-2">
          <BarChart3 className="w-4 h-4" />
          {t('pipeline.reports')}
        </TabsTrigger>
      </TabsList>

      <TabsContent value="board" className="space-y-4">
        {/* Hero Banner — always visible */}
        <div className="bg-gradient-to-r from-violet-50 via-purple-50 to-pink-50 dark:from-violet-950/30 dark:via-purple-950/30 dark:to-pink-950/30 border border-purple-100 dark:border-purple-900/50 rounded-2xl p-6 mb-2">
          <div className="flex items-start justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Route className="w-4 h-4 text-primary" />
                </div>
                <span className="text-xs font-bold text-primary uppercase tracking-wider">
                  Beauty Funnels — System Powrotów
                </span>
              </div>
              
              <h2 className="font-serif font-bold text-xl mb-2 text-foreground">
                Każda klientka ma swoją ścieżkę powrotu
              </h2>
              
              <p className="text-sm text-muted-foreground max-w-xl leading-relaxed">
                System automatycznie prowadzi każdą klientkę przez kolejne etapy — od pierwszej wizyty do lojalnej stałej bywalczyni. Ty widzisz gdzie jest każda z nich. Resztą zajmuje się autopilot.
              </p>
            </div>

            {/* Hero stat */}
            <div className="bg-background rounded-2xl p-4 border border-purple-100 dark:border-purple-900/50 shadow-sm text-center flex-shrink-0 min-w-[140px] hidden md:block">
              <p className="text-3xl font-bold text-primary">5×</p>
              <p className="text-xs text-muted-foreground mt-1 leading-tight">
                więcej wizyt od klientki która przeszła pełną ścieżkę
              </p>
            </div>
          </div>

          {/* 3 value pillars */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-5">
            {[
              {
                icon: "👁️",
                title: "Pełna widoczność",
                desc: "Widzisz gdzie jest każda klientka — bez zgadywania i ręcznego śledzenia.",
              },
              {
                icon: "⚡",
                title: "Autopilot działa za Ciebie",
                desc: "System sam reaguje na każdy etap — powiadomienia, follow-upy, przypomnienia.",
              },
              {
                icon: "💰",
                title: "Przewidywalny przychód",
                desc: "Im więcej klientek w ścieżce — tym bardziej przewidywalny miesięczny dochód.",
              },
            ].map((item, i) => (
              <div 
                key={i}
                className="bg-background/70 rounded-xl p-4 border border-purple-50 dark:border-purple-900/30"
              >
                <span className="text-2xl block mb-2">{item.icon}</span>
                <p className="font-semibold text-sm mb-1">{item.title}</p>
                <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Section Guide */}
        <SectionGuide sectionKey="pipeline" />

        {/* Animated Stage Navigation */}
        <PipelineStageNav onStageClick={handleStageNavClick} />

        {/* KPI Stats Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Card 1 — W ścieżce */}
          <div className="glass-card p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Users className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalContacts}</p>
                <p className="text-xs text-muted-foreground">aktywnych klientek</p>
              </div>
            </div>
            <p className="text-[10px] text-muted-foreground mt-2 pl-[52px]">
              +{newThisWeek} nowych w tym tygodniu
            </p>
          </div>
          
          {/* Card 2 — Wartość ścieżki */}
          <div className="glass-card p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-emerald-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalValue.toLocaleString()} <span className="text-sm font-normal">zł</span></p>
                <p className="text-xs text-muted-foreground">potencjalny przychód</p>
              </div>
            </div>
            <p className="text-[10px] text-muted-foreground mt-2 pl-[52px]">
              przy 100% konwersji do 5. wizyty
            </p>
          </div>
          
          {/* Card 3 — Nie stawiły się */}
          <div className="glass-card p-4">
            <div className="flex items-center gap-3">
              <div className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center",
                noShowCount > 0 ? "bg-red-500/10" : "bg-muted"
              )}>
                <AlertCircle className={cn("w-5 h-5", noShowCount > 0 ? "text-red-500" : "text-muted-foreground")} />
              </div>
              <div>
                <p className={cn("text-2xl font-bold", noShowCount > 0 && "text-red-500")}>{noShowCount}</p>
                <p className="text-xs text-muted-foreground">wymaga kontaktu</p>
              </div>
            </div>
            {noShowCount > 0 && (
              <p className="text-[10px] text-red-500/80 mt-2 pl-[52px]">
                Działaj w ciągu 24h od wizyty
              </p>
            )}
          </div>
          
          {/* Card 4 — Ukończyły ścieżkę */}
          <div className="glass-card p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Trophy className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{completedCount}</p>
                <p className="text-xs text-muted-foreground">stałych bywalczyń</p>
              </div>
            </div>
            {completedCount > 0 && (
              <p className="text-[10px] text-muted-foreground mt-2 pl-[52px]">
                Każda warta ~{avgClientValue.toLocaleString()} zł/rok
              </p>
            )}
          </div>
        </div>
        
        {/* Search & Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('pipeline.searchPlaceholder')}
              className="pl-10"
            />
          </div>
          <Button variant="outline" className="gap-2">
            <Filter className="w-4 h-4" />
            {t('pipeline.filters')}
          </Button>
        </div>
        
        {/* Demo Info Banner */}
        {isDemo && (
          <div className="flex items-center gap-3 bg-primary/5 border border-primary/20 rounded-xl px-4 py-3">
            <Sparkles className="w-4 h-4 text-primary flex-shrink-0" />
            <p className="text-sm text-primary">
              <strong>Tryb podglądu</strong> — W Twoim salonie klientki przechodzą przez etapy automatycznie po każdej wizycie. Przeciągaj karty aby zobaczyć jak działa system.
            </p>
          </div>
        )}
        
        {/* Pipeline Board */}
        <ScrollArea className="w-full" ref={scrollRef}>
          <div 
            className="flex gap-4 pb-4"
            onDragLeave={handleDragLeave}
          >
            {defaultPipelineStages.map((stage) => (
              <div
                key={stage.id}
                onDragEnter={() => handleDragEnter(stage.id)}
              >
                <PipelineColumn
                  stage={stage}
                  contacts={contactsByStage[stage.id] || []}
                  onDragStart={handleDragStart}
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  onContactClick={handleContactClick}
                  isDragOver={dragOverStage === stage.id}
                />
              </div>
            ))}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
        
        {/* Contact Detail Modal */}
        <ContactDetailModal
          contact={selectedContact}
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedContact(null);
          }}
          onStageChange={handleStageChange}
          onSurveySubmit={handleSurveySubmit}
        />
      </TabsContent>

      <TabsContent value="reports">
        <PipelineReports />
      </TabsContent>
    </Tabs>
  );
}
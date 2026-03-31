import { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { 
  Filter, 
  Search, 
  Users,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Kanban,
  BarChart3,
  GitBranch,
  Settings,
  Sparkles,
  RefreshCw,
  Eye,
  Zap,
  Target,
  ShieldCheck
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
import {
  PipelineContact,
  defaultPipelineStages,
  mockPipelineContacts
} from "./types";

interface PipelineModuleProps {
  isDemo?: boolean;
}

export function PipelineModule({ isDemo = false }: PipelineModuleProps) {
  const { t } = useTranslation();
  const [contacts, setContacts] = useState<PipelineContact[]>(isDemo ? mockPipelineContacts : []);
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
  if (!isDemo && contacts.length === 0) {
    return (
      <div className="space-y-6">
        <SectionGuide sectionKey="pipeline" />
        <div className="glass-card p-12 flex items-center justify-center">
          <div className="text-center max-w-md mx-auto">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
              <GitBranch className="w-8 h-8 text-primary" />
            </div>
            <h3 className="font-serif text-xl font-semibold mb-2">Ścieżka Klientki™ wymaga konfiguracji</h3>
            <p className="text-muted-foreground text-sm mb-4">
              Ścieżka Klientki™ automatycznie śledzi postęp klientek przez etapy zabiegów. Skonfiguruj integrację w ustawieniach, aby aktywować ten moduł.
            </p>
            <Button variant="outline" className="gap-2">
              <Settings className="w-4 h-4" />
              Przejdź do Ustawień → Integracje
            </Button>
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
        {/* Hero Banner — only in demo */}
        {isDemo && (
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-900 via-indigo-900 to-primary/90 p-6 md:p-8 text-white">
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-white/20 blur-3xl -translate-y-1/2 translate-x-1/4" />
              <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full bg-white/10 blur-2xl translate-y-1/3 -translate-x-1/4" />
            </div>
            
            <div className="relative z-10 space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-white/15 backdrop-blur-sm flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-amber-300" />
                </div>
                <div>
                  <h2 className="text-2xl md:text-3xl font-serif font-bold">Ścieżka Klientki™</h2>
                  <p className="text-white/70 text-sm">Autorski system maksymalizacji wizyt</p>
                </div>
              </div>

              <p className="text-white/90 text-base md:text-lg max-w-2xl leading-relaxed">
                Każda klientka z reklamy przechodzi przez sprawdzony proces, który zamienia jednorazową wizytę w lojalną, powracającą klientkę.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                  <div className="w-9 h-9 rounded-lg bg-emerald-500/20 flex items-center justify-center mb-3">
                    <Target className="w-5 h-5 text-emerald-300" />
                  </div>
                  <h3 className="font-semibold text-sm mb-1">Więcej powrotów</h3>
                  <p className="text-white/60 text-xs leading-relaxed">
                    Automatyczny system sprawia, że klientki wracają na kolejne wizyty zamiast odpadać po pierwszej.
                  </p>
                </div>

                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                  <div className="w-9 h-9 rounded-lg bg-blue-500/20 flex items-center justify-center mb-3">
                    <Zap className="w-5 h-5 text-blue-300" />
                  </div>
                  <h3 className="font-semibold text-sm mb-1">Zero ręcznej pracy</h3>
                  <p className="text-white/60 text-xs leading-relaxed">
                    Potwierdzenia, przypomnienia i follow-upy działają same — Ty zajmujesz się zabiegami.
                  </p>
                </div>

                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                  <div className="w-9 h-9 rounded-lg bg-purple-500/20 flex items-center justify-center mb-3">
                    <Eye className="w-5 h-5 text-purple-300" />
                  </div>
                  <h3 className="font-semibold text-sm mb-1">Pełna kontrola</h3>
                  <p className="text-white/60 text-xs leading-relaxed">
                    Widzisz dokładnie, na jakim etapie jest każda klientka i ile przychodu generuje Twój lejek.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-amber-300" />
                <span className="text-xs text-white/60">W zestawie z pakietem kampanii reklamowej</span>
              </div>
            </div>
          </div>
        )}

        {/* Section Guide */}
        <SectionGuide sectionKey="pipeline" />

        {/* Animated Stage Navigation */}
        <PipelineStageNav onStageClick={handleStageNavClick} />

        {/* Stats Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="glass-card p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Users className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalContacts}</p>
                <p className="text-xs text-muted-foreground">Klientki w lejku</p>
              </div>
            </div>
          </div>
          
          <div className="glass-card p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalValue.toLocaleString()} <span className="text-sm font-normal">zł</span></p>
                <p className="text-xs text-muted-foreground">Wartość lejka</p>
              </div>
            </div>
          </div>
          
          <div className="glass-card p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center">
                <RefreshCw className="w-5 h-5 text-amber-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{noShowCount}</p>
                <p className="text-xs text-muted-foreground">Odzyskiwane</p>
              </div>
            </div>
          </div>
          
          <div className="glass-card p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-purple-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{completedCount}</p>
                <p className="text-xs text-muted-foreground">Ukończone cykle</p>
              </div>
            </div>
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
        
        {/* Info Banner - only in demo */}
        {isDemo && (
          <div className="glass-card p-3 bg-primary/5 border-primary/20">
            <p className="text-sm text-center">
              <span className="font-medium">Podgląd Twojego lejka kampanii</span> – Każda klientka z reklamy automatycznie trafia tutaj i przechodzi przez sprawdzony proces maksymalizacji wizyt.
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
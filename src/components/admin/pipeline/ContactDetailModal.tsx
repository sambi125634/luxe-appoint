import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Phone,
  Mail,
  Calendar,
  Star,
  Clock,
  MessageSquare,
  History,
  CheckCircle2,
  XCircle,
  Send
} from "lucide-react";
import { cn } from "@/lib/utils";
import { PipelineContact, PipelineStage, defaultPipelineStages } from "./types";
import { toast } from "sonner";

interface ContactDetailModalProps {
  contact: PipelineContact | null;
  isOpen: boolean;
  onClose: () => void;
  onStageChange: (contactId: string, newStageId: string) => void;
  onSurveySubmit: (contactId: string, visitNumber: number, rating: number, feedback: string) => void;
}

const formatDate = (dateStr?: string) => {
  if (!dateStr) return "-";
  return new Date(dateStr).toLocaleDateString('pl-PL', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
};

const formatDateTime = (dateStr: string) => {
  return new Date(dateStr).toLocaleString('pl-PL', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const getInitials = (firstName: string, lastName: string) => {
  return `${firstName[0]}${lastName[0]}`.toUpperCase();
};

export function ContactDetailModal({
  contact,
  isOpen,
  onClose,
  onStageChange,
  onSurveySubmit
}: ContactDetailModalProps) {
  const [selectedStage, setSelectedStage] = useState<string>("");
  const [surveyRating, setSurveyRating] = useState<number>(5);
  const [surveyFeedback, setSurveyFeedback] = useState("");
  
  if (!contact) return null;
  
  const currentStage = defaultPipelineStages.find(s => s.id === contact.stageId);
  const progressPercent = (contact.completedVisits / contact.totalVisits) * 100;
  const pendingSurvey = contact.surveys.find(s => !s.completed);
  
  const handleStageChange = () => {
    if (selectedStage && selectedStage !== contact.stageId) {
      onStageChange(contact.id, selectedStage);
      toast.success("Stage zmieniony", {
        description: `Kontakt przeniesiony do: ${defaultPipelineStages.find(s => s.id === selectedStage)?.name}`
      });
      setSelectedStage("");
    }
  };
  
  const handleSurveySubmit = () => {
    if (pendingSurvey) {
      onSurveySubmit(contact.id, pendingSurvey.visitNumber, surveyRating, surveyFeedback);
      toast.success("Ankieta zapisana", {
        description: `Ocena wizyty ${pendingSurvey.visitNumber}: ${surveyRating}/5`
      });
      setSurveyRating(5);
      setSurveyFeedback("");
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
              {getInitials(contact.firstName, contact.lastName)}
            </div>
            <div>
              <h2 className="font-serif text-xl">{contact.firstName} {contact.lastName}</h2>
              <p className="text-sm text-muted-foreground font-normal">{contact.serviceName}</p>
            </div>
          </DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="overview" className="mt-4">
          <TabsList className="grid grid-cols-4 w-full">
            <TabsTrigger value="overview">Przegląd</TabsTrigger>
            <TabsTrigger value="stage">Zmień stage</TabsTrigger>
            <TabsTrigger value="surveys">Ankiety</TabsTrigger>
            <TabsTrigger value="history">Historia</TabsTrigger>
          </TabsList>
          
          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4 mt-4">
            {/* Current Stage */}
            <div className="glass-card p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-muted-foreground">Aktualny stage</span>
                <Badge className={cn(currentStage?.color, "text-white")}>
                  {currentStage?.name}
                </Badge>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Postęp pakietu</span>
                  <span className="font-medium">{contact.completedVisits}/{contact.totalVisits} wizyt</span>
                </div>
                <Progress value={progressPercent} className="h-2" />
              </div>
            </div>
            
            {/* Contact Info */}
            <div className="glass-card p-4 space-y-3">
              <h4 className="font-medium text-sm mb-2">Dane kontaktowe</h4>
              <div className="flex items-center gap-3 text-sm">
                <Phone className="w-4 h-4 text-muted-foreground" />
                <span>{contact.phone}</span>
                <Button variant="ghost" size="sm" className="ml-auto h-7">
                  Zadzwoń
                </Button>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Mail className="w-4 h-4 text-muted-foreground" />
                <span>{contact.email}</span>
                <Button variant="ghost" size="sm" className="ml-auto h-7">
                  Napisz
                </Button>
              </div>
            </div>
            
            {/* Package Info */}
            <div className="glass-card p-4">
              <h4 className="font-medium text-sm mb-3">Szczegóły pakietu</h4>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-muted-foreground">Pakiet</span>
                  <p className="font-medium">{contact.packageType}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Wartość</span>
                  <p className="font-medium text-primary">{contact.value.toLocaleString()} zł</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Data rezerwacji</span>
                  <p className="font-medium">{formatDate(contact.reservationDate)}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Następna wizyta</span>
                  <p className="font-medium">{formatDate(contact.nextVisitDate)}</p>
                </div>
              </div>
            </div>
            
            {/* Tags */}
            {contact.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {contact.tags.map((tag) => (
                  <Badge key={tag} variant="secondary">{tag}</Badge>
                ))}
              </div>
            )}
          </TabsContent>
          
          {/* Stage Change Tab */}
          <TabsContent value="stage" className="mt-4">
            <div className="glass-card p-4">
              <h4 className="font-medium mb-4">Zmień stage w pipeline</h4>
              <p className="text-sm text-muted-foreground mb-4">
                Aktualny stage: <Badge className={cn(currentStage?.color, "text-white ml-2")}>{currentStage?.name}</Badge>
              </p>
              
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {defaultPipelineStages.map((stage) => (
                  <label
                    key={stage.id}
                    className={cn(
                      "flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all",
                      selectedStage === stage.id 
                        ? "border-primary bg-primary/5" 
                        : "border-border hover:border-primary/50",
                      stage.id === contact.stageId && "opacity-50 cursor-not-allowed"
                    )}
                  >
                    <input
                      type="radio"
                      name="stage"
                      value={stage.id}
                      checked={selectedStage === stage.id}
                      onChange={(e) => setSelectedStage(e.target.value)}
                      disabled={stage.id === contact.stageId}
                      className="sr-only"
                    />
                    <div className={cn("w-3 h-3 rounded-full", stage.color)} />
                    <div className="flex-1">
                      <p className="font-medium text-sm">{stage.name}</p>
                      {stage.description && (
                        <p className="text-xs text-muted-foreground">{stage.description}</p>
                      )}
                    </div>
                    {stage.id === contact.stageId && (
                      <Badge variant="outline" className="text-xs">Aktualny</Badge>
                    )}
                  </label>
                ))}
              </div>
              
              <Button 
                className="w-full mt-4" 
                disabled={!selectedStage || selectedStage === contact.stageId}
                onClick={handleStageChange}
              >
                Zapisz zmianę stage'u
              </Button>
              
              <p className="text-xs text-muted-foreground text-center mt-2">
                Zmiana stage'u aktywuje odpowiedni workflow w GoHighLevel
              </p>
            </div>
          </TabsContent>
          
          {/* Surveys Tab */}
          <TabsContent value="surveys" className="mt-4 space-y-4">
            {/* Pending Survey */}
            {pendingSurvey && (
              <div className="glass-card p-4 border-2 border-amber-500/50">
                <div className="flex items-center gap-2 mb-4">
                  <MessageSquare className="w-5 h-5 text-amber-500" />
                  <h4 className="font-medium">Ankieta po wizycie {pendingSurvey.visitNumber}</h4>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm">Czy wizyta się odbyła?</Label>
                    <div className="flex gap-3 mt-2">
                      <Button variant="outline" className="flex-1 gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                        Tak, odbyła się
                      </Button>
                      <Button variant="outline" className="flex-1 gap-2">
                        <XCircle className="w-4 h-4 text-red-500" />
                        Nie, nie przyszła
                      </Button>
                    </div>
                  </div>
                  
                  <div>
                    <Label className="text-sm">Ocena wizyty (1-5)</Label>
                    <div className="flex gap-2 mt-2">
                      {[1, 2, 3, 4, 5].map((rating) => (
                        <button
                          key={rating}
                          onClick={() => setSurveyRating(rating)}
                          className={cn(
                            "w-10 h-10 rounded-lg border transition-all flex items-center justify-center",
                            surveyRating >= rating 
                              ? "bg-amber-500 border-amber-500 text-white" 
                              : "border-border hover:border-amber-500/50"
                          )}
                        >
                          <Star className={cn("w-5 h-5", surveyRating >= rating && "fill-current")} />
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <Label className="text-sm">Uwagi (opcjonalnie)</Label>
                    <Textarea
                      value={surveyFeedback}
                      onChange={(e) => setSurveyFeedback(e.target.value)}
                      placeholder="Dodatkowe uwagi do wizyty..."
                      className="mt-2"
                      rows={3}
                    />
                  </div>
                  
                  <Button className="w-full gap-2" onClick={handleSurveySubmit}>
                    <Send className="w-4 h-4" />
                    Zapisz ankietę
                  </Button>
                </div>
              </div>
            )}
            
            {/* Completed Surveys */}
            <div className="space-y-3">
              <h4 className="font-medium text-sm">Historia ankiet</h4>
              {contact.surveys.filter(s => s.completed).length === 0 ? (
                <p className="text-sm text-muted-foreground">Brak wypełnionych ankiet</p>
              ) : (
                contact.surveys.filter(s => s.completed).map((survey) => (
                  <div key={survey.id} className="glass-card p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-sm">Wizyta {survey.visitNumber}</span>
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star 
                            key={star} 
                            className={cn(
                              "w-4 h-4",
                              star <= (survey.rating || 0) 
                                ? "text-amber-500 fill-amber-500" 
                                : "text-muted-foreground/30"
                            )} 
                          />
                        ))}
                      </div>
                    </div>
                    {survey.feedback && (
                      <p className="text-sm text-muted-foreground">{survey.feedback}</p>
                    )}
                    {survey.completedAt && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatDate(survey.completedAt)}
                      </p>
                    )}
                  </div>
                ))
              )}
            </div>
          </TabsContent>
          
          {/* History Tab */}
          <TabsContent value="history" className="mt-4">
            <div className="space-y-3">
              <h4 className="font-medium text-sm">Historia zmian stage'u</h4>
              {contact.history.length === 0 ? (
                <p className="text-sm text-muted-foreground">Brak historii zmian</p>
              ) : (
                <div className="space-y-2">
                  {contact.history.map((entry) => {
                    const fromStage = defaultPipelineStages.find(s => s.id === entry.fromStage);
                    const toStage = defaultPipelineStages.find(s => s.id === entry.toStage);
                    
                    return (
                      <div key={entry.id} className="glass-card p-3">
                        <div className="flex items-center gap-2 text-sm">
                          <Badge variant="outline" className="text-xs">
                            {fromStage?.name}
                          </Badge>
                          <span className="text-muted-foreground">→</span>
                          <Badge className={cn(toStage?.color, "text-white text-xs")}>
                            {toStage?.name}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                          <Clock className="w-3 h-3" />
                          <span>{formatDateTime(entry.changedAt)}</span>
                          <span>•</span>
                          <span>{entry.changedBy}</span>
                        </div>
                        {entry.note && (
                          <p className="text-xs text-muted-foreground mt-1">{entry.note}</p>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

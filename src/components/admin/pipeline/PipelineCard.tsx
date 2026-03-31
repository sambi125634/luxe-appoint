import { useState } from "react";
import { 
  Phone, 
  Mail, 
  Calendar, 
  Star, 
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { PipelineContact, ContactSurvey } from "./types";

interface PipelineCardProps {
  contact: PipelineContact;
  onDragStart: (e: React.DragEvent, contactId: string) => void;
  onClick: (contact: PipelineContact) => void;
}

const formatDate = (dateStr?: string) => {
  if (!dateStr) return "-";
  return new Date(dateStr).toLocaleDateString('pl-PL', {
    day: 'numeric',
    month: 'short'
  });
};

const getInitials = (firstName: string, lastName: string) => {
  return `${firstName[0]}${lastName[0]}`.toUpperCase();
};

const SurveyIndicator = ({ surveys, totalVisits }: { surveys: ContactSurvey[], totalVisits: number }) => {
  const completedSurveys = surveys.filter(s => s.completed).length;
  const avgRating = surveys.filter(s => s.rating).reduce((acc, s) => acc + (s.rating || 0), 0) / (surveys.filter(s => s.rating).length || 1);
  
  if (surveys.length === 0) return null;
  
  return (
    <div className="flex items-center gap-1 text-xs text-muted-foreground">
      <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
      <span>{avgRating.toFixed(1)}</span>
      <span className="text-muted-foreground/50">({completedSurveys}/{totalVisits})</span>
    </div>
  );
};

const getAutopilotStatus = (stageId: string) => {
  if (stageId === 'no-show') {
    return { type: 'danger' as const, label: 'Wymaga kontaktu' };
  }
  if (stageId.startsWith('between-')) {
    return { type: 'active' as const, label: 'Autopilot aktywny' };
  }
  if (stageId === 'completed' || stageId === 'visit-5-done') {
    return { type: 'done' as const, label: 'Ścieżka ukończona' };
  }
  return { type: 'waiting' as const, label: 'Oczekuje' };
};

export function PipelineCard({ contact, onDragStart, onClick }: PipelineCardProps) {
  const [expanded, setExpanded] = useState(false);
  const progressPercent = (contact.completedVisits / contact.totalVisits) * 100;
  
  const pendingSurvey = contact.surveys.find(s => !s.completed);
  const autopilot = getAutopilotStatus(contact.stageId);
  
  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, contact.id)}
      onClick={() => onClick(contact)}
      className="glass-card p-3 cursor-grab active:cursor-grabbing hover:shadow-md transition-all group"
    >
      {/* Header */}
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium text-sm flex-shrink-0">
          {getInitials(contact.firstName, contact.lastName)}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-sm truncate">
            {contact.firstName} {contact.lastName}
          </h4>
          <p className="text-xs text-muted-foreground truncate">
            {contact.serviceName}
          </p>
        </div>
      </div>
      
      {/* Progress */}
      <div className="mt-3 space-y-1">
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Postęp pakietu</span>
          <span className="font-medium">{contact.completedVisits}/{contact.totalVisits}</span>
        </div>
        <Progress value={progressPercent} className="h-1.5" />
      </div>
      
      {/* Tags */}
      {contact.tags.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {contact.tags.slice(0, 2).map((tag) => (
            <Badge key={tag} variant="secondary" className="text-[10px] px-1.5 py-0">
              {tag}
            </Badge>
          ))}
          {contact.tags.length > 2 && (
            <Badge variant="outline" className="text-[10px] px-1.5 py-0">
              +{contact.tags.length - 2}
            </Badge>
          )}
        </div>
      )}
      
      {/* Quick info */}
      <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
        {contact.nextVisitDate ? (
          <div className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            <span>{formatDate(contact.nextVisitDate)}</span>
          </div>
        ) : (
          <div className="flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-green-500" />
            <span>Ukończone</span>
          </div>
        )}
        <SurveyIndicator surveys={contact.surveys} totalVisits={contact.totalVisits} />
      </div>

      {/* Autopilot status */}
      <div className="flex items-center gap-1.5 mt-2 pt-2 border-t border-border">
        {autopilot.type === 'danger' ? (
          <div className="flex items-center gap-1.5 text-xs text-red-600">
            <AlertCircle className="w-3 h-3" />
            {autopilot.label}
          </div>
        ) : autopilot.type === 'active' ? (
          <div className="flex items-center gap-1.5 text-xs text-green-600">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            {autopilot.label}
          </div>
        ) : autopilot.type === 'done' ? (
          <div className="flex items-center gap-1.5 text-xs text-primary">
            <CheckCircle2 className="w-3 h-3" />
            {autopilot.label}
          </div>
        ) : (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/30" />
            {autopilot.label}
          </div>
        )}
      </div>
      
      {/* Pending Survey Alert */}
      {pendingSurvey && (
        <div className="mt-2 p-2 bg-amber-500/10 rounded-md flex items-center gap-2 text-xs">
          <AlertCircle className="w-3 h-3 text-amber-500" />
          <span className="text-amber-700 dark:text-amber-400">
            Ankieta po wizycie {pendingSurvey.visitNumber} oczekuje
          </span>
        </div>
      )}
      
      {/* Expandable details */}
      <Button
        variant="ghost"
        size="sm"
        className="w-full mt-2 h-6 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={(e) => {
          e.stopPropagation();
          setExpanded(!expanded);
        }}
      >
        {expanded ? (
          <>
            <ChevronUp className="w-3 h-3 mr-1" />
            Mniej
          </>
        ) : (
          <>
            <ChevronDown className="w-3 h-3 mr-1" />
            Więcej
          </>
        )}
      </Button>
      
      {expanded && (
        <div className="mt-2 pt-2 border-t border-border space-y-2 text-xs" onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Phone className="w-3 h-3" />
            <span>{contact.phone}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Mail className="w-3 h-3" />
            <span className="truncate">{contact.email}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Wartość pakietu:</span>
            <span className="font-semibold text-primary">{contact.value} zł</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Pakiet:</span>
            <span>{contact.packageType}</span>
          </div>
        </div>
      )}
    </div>
  );
}
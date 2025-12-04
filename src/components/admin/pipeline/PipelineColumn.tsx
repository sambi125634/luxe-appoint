import { cn } from "@/lib/utils";
import { PipelineStage, PipelineContact } from "./types";
import { PipelineCard } from "./PipelineCard";

interface PipelineColumnProps {
  stage: PipelineStage;
  contacts: PipelineContact[];
  onDragStart: (e: React.DragEvent, contactId: string) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent, stageId: string) => void;
  onContactClick: (contact: PipelineContact) => void;
  isDragOver: boolean;
}

export function PipelineColumn({
  stage,
  contacts,
  onDragStart,
  onDragOver,
  onDrop,
  onContactClick,
  isDragOver
}: PipelineColumnProps) {
  const totalValue = contacts.reduce((acc, c) => acc + c.value, 0);
  
  return (
    <div
      className={cn(
        "flex-shrink-0 w-72 bg-muted/30 rounded-xl p-3 transition-all",
        isDragOver && "ring-2 ring-primary bg-primary/5"
      )}
      onDragOver={onDragOver}
      onDrop={(e) => onDrop(e, stage.id)}
    >
      {/* Header */}
      <div className="mb-3">
        <div className="flex items-center gap-2 mb-1">
          <div className={cn("w-3 h-3 rounded-full", stage.color)} />
          <h3 className="font-semibold text-sm">{stage.name}</h3>
          <span className="ml-auto text-xs text-muted-foreground bg-background px-2 py-0.5 rounded-full">
            {contacts.length}
          </span>
        </div>
        {stage.description && (
          <p className="text-xs text-muted-foreground pl-5">{stage.description}</p>
        )}
        {contacts.length > 0 && (
          <p className="text-xs text-muted-foreground pl-5 mt-1">
            Wartość: <span className="font-medium text-foreground">{totalValue.toLocaleString()} zł</span>
          </p>
        )}
      </div>
      
      {/* Cards */}
      <div className="space-y-2 min-h-[100px]">
        {contacts.map((contact) => (
          <PipelineCard
            key={contact.id}
            contact={contact}
            onDragStart={onDragStart}
            onClick={onContactClick}
          />
        ))}
        
        {contacts.length === 0 && (
          <div className="h-24 border-2 border-dashed border-border/50 rounded-lg flex items-center justify-center">
            <p className="text-xs text-muted-foreground">Przeciągnij tutaj</p>
          </div>
        )}
      </div>
    </div>
  );
}

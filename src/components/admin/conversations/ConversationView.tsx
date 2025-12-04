import { useState } from "react";
import { ArrowLeft, Phone, Mail, MoreVertical, Send, Paperclip, Smile } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { Contact, Message } from "./types";

interface ConversationViewProps {
  contact: Contact;
  messages: Message[];
  onSendMessage: (message: string, type: "SMS" | "Email" | "WhatsApp") => void;
  onBack: () => void;
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString("pl-PL", { hour: "2-digit", minute: "2-digit" });
}

function formatDate(date: Date): string {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (date.toDateString() === today.toDateString()) {
    return "Dzisiaj";
  } else if (date.toDateString() === yesterday.toDateString()) {
    return "Wczoraj";
  }
  return date.toLocaleDateString("pl-PL", { day: "numeric", month: "long" });
}

function groupMessagesByDate(messages: Message[]): { date: string; messages: Message[] }[] {
  const groups: { [key: string]: Message[] } = {};
  
  messages.forEach((message) => {
    const dateKey = message.sentAt.toDateString();
    if (!groups[dateKey]) {
      groups[dateKey] = [];
    }
    groups[dateKey].push(message);
  });

  return Object.entries(groups).map(([dateKey, msgs]) => ({
    date: formatDate(new Date(dateKey)),
    messages: msgs.sort((a, b) => a.sentAt.getTime() - b.sentAt.getTime()),
  }));
}

export function ConversationView({
  contact,
  messages,
  onSendMessage,
  onBack,
}: ConversationViewProps) {
  const [newMessage, setNewMessage] = useState("");
  const [messageType, setMessageType] = useState<"SMS" | "Email" | "WhatsApp">("SMS");

  const groupedMessages = groupMessagesByDate(messages);

  const handleSend = () => {
    if (newMessage.trim()) {
      onSendMessage(newMessage.trim(), messageType);
      setNewMessage("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* Header */}
      <div className="p-4 border-b border-border flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={onBack}
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>

        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/80 to-secondary/80 flex items-center justify-center text-primary-foreground font-medium flex-shrink-0">
          {contact.firstName.charAt(0)}{contact.lastName.charAt(0)}
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="font-medium truncate">
            {contact.firstName} {contact.lastName}
          </h3>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Phone className="w-3 h-3" />
            <span className="truncate">{contact.phone}</span>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-9 w-9">
            <Phone className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-9 w-9">
            <Mail className="w-4 h-4" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-9 w-9">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>Zobacz profil w GHL</DropdownMenuItem>
              <DropdownMenuItem>Dodaj notatkę</DropdownMenuItem>
              <DropdownMenuItem>Utwórz wizytę</DropdownMenuItem>
              <DropdownMenuItem className="text-destructive">Zablokuj kontakt</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-6">
          {groupedMessages.map((group) => (
            <div key={group.date}>
              {/* Date separator */}
              <div className="flex items-center justify-center mb-4">
                <span className="px-3 py-1 text-xs text-muted-foreground bg-muted rounded-full">
                  {group.date}
                </span>
              </div>

              {/* Messages */}
              <div className="space-y-3">
                {group.messages.map((message) => (
                  <div
                    key={message.id}
                    className={cn(
                      "flex",
                      message.direction === "outbound" ? "justify-end" : "justify-start"
                    )}
                  >
                    <div
                      className={cn(
                        "max-w-[80%] rounded-2xl px-4 py-2.5",
                        message.direction === "outbound"
                          ? "bg-primary text-primary-foreground rounded-br-md"
                          : "bg-muted rounded-bl-md"
                      )}
                    >
                      <p className="text-sm whitespace-pre-wrap">{message.body}</p>
                      <div className={cn(
                        "flex items-center gap-2 mt-1",
                        message.direction === "outbound" ? "justify-end" : "justify-start"
                      )}>
                        <span className={cn(
                          "text-xs",
                          message.direction === "outbound" 
                            ? "text-primary-foreground/70" 
                            : "text-muted-foreground"
                        )}>
                          {formatTime(message.sentAt)}
                        </span>
                        {message.direction === "outbound" && (
                          <Badge 
                            variant="secondary" 
                            className={cn(
                              "text-[10px] px-1.5 py-0",
                              message.direction === "outbound" 
                                ? "bg-primary-foreground/20 text-primary-foreground" 
                                : ""
                            )}
                          >
                            {message.type}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="p-4 border-t border-border">
        <div className="flex items-end gap-2">
          <Select value={messageType} onValueChange={(v) => setMessageType(v as any)}>
            <SelectTrigger className="w-24 h-10">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="SMS">📱 SMS</SelectItem>
              <SelectItem value="Email">✉️ Email</SelectItem>
              <SelectItem value="WhatsApp">💬 WhatsApp</SelectItem>
            </SelectContent>
          </Select>

          <div className="flex-1 relative">
            <Textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Napisz wiadomość..."
              className="min-h-[44px] max-h-32 resize-none pr-20 bg-muted/50 border-0"
              rows={1}
            />
            <div className="absolute right-2 bottom-2 flex items-center gap-1">
              <Button variant="ghost" size="icon" className="h-7 w-7">
                <Paperclip className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-7 w-7">
                <Smile className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <Button 
            onClick={handleSend} 
            disabled={!newMessage.trim()}
            className="h-10"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-2 text-center">
          Wiadomości są wysyłane przez GoHighLevel
        </p>
      </div>
    </>
  );
}

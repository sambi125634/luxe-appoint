import { useTranslation } from "react-i18next";
import { Search, RefreshCw, Filter, MessageSquarePlus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { Contact } from "./types";

interface ContactsListProps {
  contacts: Contact[];
  selectedContact: Contact | null;
  onSelectContact: (contact: Contact) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onNewConversation?: () => void;
}

function formatTimeAgo(date?: Date, t?: (key: string) => string): string {
  if (!date) return "";
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) return t ? t('conversations.now') : "now";
  if (diffMins < 60) return `${diffMins} ${t ? t('conversations.min') : 'min'}`;
  if (diffHours < 24) return `${diffHours} ${t ? t('conversations.hours') : 'hrs'}`;
  if (diffDays === 1) return t ? t('conversations.yesterday') : "yesterday";
  return `${diffDays} ${t ? t('conversations.daysAgo') : 'days'}`;
}

function getInitials(firstName: string, lastName: string): string {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
}

export function ContactsList({
  contacts,
  selectedContact,
  onSelectContact,
  searchQuery,
  onSearchChange,
  onNewConversation,
}: ContactsListProps) {
  const { t } = useTranslation();
  
  return (
    <>
      {/* Header */}
      <div className="p-4 border-b border-border space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-lg font-semibold">{t('conversations.title')}</h2>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <RefreshCw className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Filter className="w-4 h-4" />
            </Button>
          </div>
        </div>
        {onNewConversation && (
          <Button onClick={onNewConversation} className="w-full gap-2" size="sm">
            <MessageSquarePlus className="w-4 h-4" />
            Nowa konwersacja
          </Button>
        )}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder={t('conversations.searchContact')}
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9 bg-muted/50 border-0"
          />
        </div>
      </div>

      {/* Contacts */}
      <ScrollArea className="flex-1">
        <div className="divide-y divide-border">
          {contacts.length === 0 && (
            <div className="p-8 text-center text-sm text-muted-foreground">
              <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-muted flex items-center justify-center">
                <MessageSquarePlus className="w-5 h-5" />
              </div>
              <p className="font-medium text-foreground mb-1">Brak konwersacji</p>
              <p>Klientki są w bazie. Kliknij „Nowa konwersacja", aby napisać pierwszą wiadomość.</p>
            </div>
          )}
          {contacts.map((contact) => (
            <button
              key={contact.id}
              onClick={() => onSelectContact(contact)}
              className={cn(
                "w-full p-4 text-left transition-colors hover:bg-muted/50",
                selectedContact?.id === contact.id && "bg-primary/5 border-l-2 border-l-primary"
              )}
            >
              <div className="flex gap-3">
                {/* Avatar */}
                <div className="relative flex-shrink-0">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/80 to-secondary/80 flex items-center justify-center text-primary-foreground font-medium">
                    {getInitials(contact.firstName, contact.lastName)}
                  </div>
                  {contact.unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-secondary text-secondary-foreground text-xs font-medium rounded-full flex items-center justify-center">
                      {contact.unreadCount}
                    </span>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className={cn(
                      "font-medium truncate",
                      contact.unreadCount > 0 && "text-foreground"
                    )}>
                      {contact.firstName} {contact.lastName}
                    </span>
                    <span className="text-xs text-muted-foreground flex-shrink-0">
                      {formatTimeAgo(contact.lastMessageAt, t)}
                    </span>
                  </div>
                  <p className={cn(
                    "text-sm truncate",
                    contact.unreadCount > 0 ? "text-foreground font-medium" : "text-muted-foreground"
                  )}>
                    {contact.lastMessagePreview || t('conversations.noMessages')}
                  </p>
                  {contact.tags.length > 0 && (
                    <div className="flex gap-1 mt-2 flex-wrap">
                      {contact.tags.slice(0, 2).map((tag) => (
                        <Badge
                          key={tag}
                          variant="secondary"
                          className="text-xs px-2 py-0 bg-muted"
                        >
                          {tag}
                        </Badge>
                      ))}
                      {contact.tags.length > 2 && (
                        <Badge variant="secondary" className="text-xs px-2 py-0 bg-muted">
                          +{contact.tags.length - 2}
                        </Badge>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      </ScrollArea>

    </>
  );
}

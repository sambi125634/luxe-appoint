import { useState } from "react";
import { useTranslation } from "react-i18next";
import { MessageSquarePlus, Settings, ExternalLink, MessageSquare, Phone } from "lucide-react";
import { ContactsList } from "./ContactsList";
import { ConversationView } from "./ConversationView";
import { Contact, Conversation, Message } from "./types";
import { SectionGuide } from "../SectionGuide";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useSalonSettings } from "@/hooks/useSalonSettings";
import { toast } from "sonner";
import {
  useConversationContacts,
  useConversationMessages,
  useSendMessage,
} from "@/hooks/useConversations";

// Demo data - only shown in demo mode
const DEMO_CONTACTS: Contact[] = [
  {
    id: "1",
    externalContactId: "ext_001",
    firstName: "Anna",
    lastName: "Kowalska",
    email: "anna.kowalska@email.pl",
    phone: "+48 123 456 789",
    lastMessageAt: new Date(Date.now() - 1000 * 60 * 5),
    lastMessagePreview: "Dziękuję za potwierdzenie wizyty! Do zobaczenia 💕",
    unreadCount: 2,
    tags: ["VIP", "Stała klientka"],
  },
  {
    id: "2",
    externalContactId: "ext_002",
    firstName: "Maria",
    lastName: "Nowak",
    email: "maria.nowak@gmail.com",
    phone: "+48 987 654 321",
    lastMessageAt: new Date(Date.now() - 1000 * 60 * 30),
    lastMessagePreview: "Czy mogę zmienić termin wizyty na piątek?",
    unreadCount: 1,
    tags: ["Nowy klient"],
  },
  {
    id: "3",
    externalContactId: "ext_003",
    firstName: "Ewa",
    lastName: "Wiśniewska",
    email: "ewa.w@firma.pl",
    phone: "+48 555 666 777",
    lastMessageAt: new Date(Date.now() - 1000 * 60 * 60 * 2),
    lastMessagePreview: "Super, rezerwuję termin na masaż relaksacyjny",
    unreadCount: 0,
    tags: ["Premium"],
  },
  {
    id: "4",
    externalContactId: "ext_004",
    firstName: "Katarzyna",
    lastName: "Dąbrowska",
    email: "kasia.d@outlook.com",
    phone: "+48 111 222 333",
    lastMessageAt: new Date(Date.now() - 1000 * 60 * 60 * 24),
    lastMessagePreview: "Polecam znajomym! Świetna obsługa ⭐",
    unreadCount: 0,
    tags: [],
  },
  {
    id: "5",
    externalContactId: "ext_005",
    firstName: "Magdalena",
    lastName: "Zielińska",
    email: "magda.z@wp.pl",
    phone: "+48 444 555 666",
    lastMessageAt: new Date(Date.now() - 1000 * 60 * 60 * 48),
    lastMessagePreview: "Jakie zabiegi polecacie na nawilżenie?",
    unreadCount: 0,
    tags: ["Zabiegi na twarz"],
  },
];

const DEMO_MESSAGES: Record<string, Message[]> = {
  "1": [
    {
      id: "m1",
      externalMessageId: "ext_msg_001",
      direction: "inbound",
      type: "SMS",
      body: "Dzień dobry! Chciałabym potwierdzić wizytę na jutro o 14:00 na manicure hybrydowy.",
      sentAt: new Date(Date.now() - 1000 * 60 * 60),
      status: "delivered",
    },
    {
      id: "m2",
      externalMessageId: "ext_msg_002",
      direction: "outbound",
      type: "SMS",
      body: "Dzień dobry Pani Anno! Tak, wizyta jest potwierdzona na jutro (wtorek) o godzinie 14:00. Usługa: Manicure hybrydowy. Specjalistka: Karolina. Do zobaczenia! 💅",
      sentAt: new Date(Date.now() - 1000 * 60 * 30),
      status: "delivered",
    },
    {
      id: "m3",
      externalMessageId: "ext_msg_003",
      direction: "inbound",
      type: "SMS",
      body: "Dziękuję za potwierdzenie wizyty! Do zobaczenia 💕",
      sentAt: new Date(Date.now() - 1000 * 60 * 5),
      status: "delivered",
    },
  ],
  "2": [
    {
      id: "m4",
      externalMessageId: "ext_msg_004",
      direction: "outbound",
      type: "SMS",
      body: "Przypominamy o wizycie w Luxury Beauty Spa w środę o 10:00. Usługa: Mezoterapia. Pozdrawiamy!",
      sentAt: new Date(Date.now() - 1000 * 60 * 60 * 2),
      status: "delivered",
    },
    {
      id: "m5",
      externalMessageId: "ext_msg_005",
      direction: "inbound",
      type: "SMS",
      body: "Czy mogę zmienić termin wizyty na piątek?",
      sentAt: new Date(Date.now() - 1000 * 60 * 30),
      status: "delivered",
    },
  ],
  "3": [
    {
      id: "m6",
      externalMessageId: "ext_msg_006",
      direction: "inbound",
      type: "SMS",
      body: "Dzień dobry, jakie macie wolne terminy na masaż relaksacyjny w tym tygodniu?",
      sentAt: new Date(Date.now() - 1000 * 60 * 60 * 3),
      status: "delivered",
    },
    {
      id: "m7",
      externalMessageId: "ext_msg_007",
      direction: "outbound",
      type: "SMS",
      body: "Dzień dobry! Mamy wolne terminy: czwartek 15:00, piątek 11:00 i 16:00, sobota 10:00. Który Pani odpowiada?",
      sentAt: new Date(Date.now() - 1000 * 60 * 60 * 2.5),
      status: "delivered",
    },
    {
      id: "m8",
      externalMessageId: "ext_msg_008",
      direction: "inbound",
      type: "SMS",
      body: "Super, rezerwuję termin na masaż relaksacyjny",
      sentAt: new Date(Date.now() - 1000 * 60 * 60 * 2),
      status: "delivered",
    },
  ],
};

interface ConversationsModuleProps {
  isDemo?: boolean;
  onNavigate?: (tab: string) => void;
}

export function ConversationsModule({ isDemo = false, onNavigate }: ConversationsModuleProps) {
  const { t } = useTranslation();
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const { settings } = useSalonSettings();

  const smsConfigured = settings.integrations.smsapi?.enabled && !!settings.integrations.smsapi?.apiKey;
  const whatsappConfigured = settings.integrations.whatsapp?.enabled && !!settings.integrations.whatsapp?.apiKey;
  const hasAnyChannel = smsConfigured || whatsappConfigured;

  // Real data hooks (skipped in demo)
  const { data: realContacts = [] } = useConversationContacts(!isDemo);
  const { data: realMessages = [] } = useConversationMessages(
    selectedContact?.id ?? null,
    !isDemo,
  );
  const sendMessage = useSendMessage();

  const contacts = isDemo ? DEMO_CONTACTS : realContacts;

  const filteredContacts = contacts.filter((contact) => {
    const fullName = `${contact.firstName} ${contact.lastName}`.toLowerCase();
    const query = searchQuery.toLowerCase();
    return (
      fullName.includes(query) ||
      contact.email?.toLowerCase().includes(query) ||
      contact.phone?.includes(query)
    );
  });

  const handleSendMessage = (message: string, type: "SMS" | "Email" | "WhatsApp") => {
    if (!selectedContact) return;
    if (isDemo) {
      toast.info("Tryb podglądu — wiadomość nie została wysłana");
      return;
    }
    sendMessage.mutate(
      { clientId: selectedContact.id, body: message, channel: type },
      {
        onSuccess: () => toast.success("Wiadomość zapisana"),
        onError: (e: any) =>
          toast.error("Nie udało się wysłać", { description: e?.message }),
      },
    );
  };

  // Empty state for production mode — no channels configured AND no message history yet
  if (!isDemo && !hasAnyChannel && realContacts.length === 0) {
    return (
      <div className="space-y-6">
        <SectionGuide sectionKey="conversations" />
        <div className="glass-card h-[calc(100vh-14rem)] flex items-center justify-center">
          <div className="text-center max-w-lg mx-auto p-8">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
              <MessageSquarePlus className="w-8 h-8 text-primary" />
            </div>
            <h3 className="font-serif text-xl font-semibold mb-2">Skonfiguruj kanał komunikacji</h3>
            <p className="text-muted-foreground text-sm mb-6">
              Aby wysyłać wiadomości do klientek, skonfiguruj przynajmniej jeden kanał komunikacji w ustawieniach integracji.
            </p>
            
            <div className="grid gap-3 mb-6">
              <div className="flex items-center gap-3 p-3 rounded-lg border border-border text-left">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center flex-shrink-0">
                  <MessageSquare className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm">SMS (SMSAPI)</p>
                  <p className="text-xs text-muted-foreground">Model BYOP — Twój klucz API, Twoje koszty</p>
                </div>
                <Badge variant="outline" className="text-muted-foreground flex-shrink-0">
                  Nieskonfigurowany
                </Badge>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg border border-border text-left">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-500 to-green-700 flex items-center justify-center flex-shrink-0">
                  <Phone className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm">WhatsApp Business</p>
                  <p className="text-xs text-muted-foreground">Twilio lub 360dialog</p>
                </div>
                <Badge variant="outline" className="text-muted-foreground flex-shrink-0">
                  Nieskonfigurowany
                </Badge>
              </div>
            </div>

            <Button className="gap-2" onClick={() => onNavigate?.("settings")}>
              <Settings className="w-4 h-4" />
              Przejdź do Ustawień → Integracje
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card h-[calc(100vh-8rem)] flex overflow-hidden">
      <div className={`w-full md:w-80 lg:w-96 border-r border-border flex-shrink-0 ${selectedContact ? 'hidden md:flex' : 'flex'} flex-col`}>
        <ContactsList
          contacts={filteredContacts}
          selectedContact={selectedContact}
          onSelectContact={setSelectedContact}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />
      </div>

      <div className={`flex-1 ${selectedContact ? 'flex' : 'hidden md:flex'} flex-col`}>
        {selectedContact ? (
          <ConversationView
            contact={selectedContact}
            messages={isDemo ? (DEMO_MESSAGES[selectedContact.id] || []) : realMessages}
            onSendMessage={handleSendMessage}
            onBack={() => setSelectedContact(null)}
          />
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <p className="font-serif text-lg mb-1">{t('conversations.selectConversation')}</p>
              <p className="text-sm">{t('conversations.clickToSeeHistory')}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

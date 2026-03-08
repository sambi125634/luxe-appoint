import { useState } from "react";
import { useTranslation } from "react-i18next";
import { MessageSquarePlus } from "lucide-react";
import { ContactsList } from "./ContactsList";
import { ConversationView } from "./ConversationView";
import { Contact, Conversation, Message } from "./types";

// Demo data - only shown in demo mode
const DEMO_CONTACTS: Contact[] = [
  {
    id: "1",
    ghlContactId: "ghl_001",
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
    ghlContactId: "ghl_002",
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
    ghlContactId: "ghl_003",
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
    ghlContactId: "ghl_004",
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
    ghlContactId: "ghl_005",
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
      ghlMessageId: "ghl_msg_001",
      direction: "inbound",
      type: "SMS",
      body: "Dzień dobry! Chciałabym potwierdzić wizytę na jutro o 14:00 na manicure hybrydowy.",
      sentAt: new Date(Date.now() - 1000 * 60 * 60),
      status: "delivered",
    },
    {
      id: "m2",
      ghlMessageId: "ghl_msg_002",
      direction: "outbound",
      type: "SMS",
      body: "Dzień dobry Pani Anno! Tak, wizyta jest potwierdzona na jutro (wtorek) o godzinie 14:00. Usługa: Manicure hybrydowy. Specjalistka: Karolina. Do zobaczenia! 💅",
      sentAt: new Date(Date.now() - 1000 * 60 * 30),
      status: "delivered",
    },
    {
      id: "m3",
      ghlMessageId: "ghl_msg_003",
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
      ghlMessageId: "ghl_msg_004",
      direction: "outbound",
      type: "SMS",
      body: "Przypominamy o wizycie w Luxury Beauty Spa w środę o 10:00. Usługa: Mezoterapia. Pozdrawiamy!",
      sentAt: new Date(Date.now() - 1000 * 60 * 60 * 2),
      status: "delivered",
    },
    {
      id: "m5",
      ghlMessageId: "ghl_msg_005",
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
      ghlMessageId: "ghl_msg_006",
      direction: "inbound",
      type: "SMS",
      body: "Dzień dobry, jakie macie wolne terminy na masaż relaksacyjny w tym tygodniu?",
      sentAt: new Date(Date.now() - 1000 * 60 * 60 * 3),
      status: "delivered",
    },
    {
      id: "m7",
      ghlMessageId: "ghl_msg_007",
      direction: "outbound",
      type: "SMS",
      body: "Dzień dobry! Mamy wolne terminy: czwartek 15:00, piątek 11:00 i 16:00, sobota 10:00. Który Pani odpowiada?",
      sentAt: new Date(Date.now() - 1000 * 60 * 60 * 2.5),
      status: "delivered",
    },
    {
      id: "m8",
      ghlMessageId: "ghl_msg_008",
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
}

export function ConversationsModule({ isDemo = false }: ConversationsModuleProps) {
  const { t } = useTranslation();
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const contacts = isDemo ? DEMO_CONTACTS : [];
  const messages = isDemo ? DEMO_MESSAGES : {};

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
    console.log("Sending message:", { message, type, to: selectedContact });
  };

  // Empty state for production mode
  if (!isDemo && contacts.length === 0) {
    return (
      <div className="glass-card h-[calc(100vh-8rem)] flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
            <MessageSquarePlus className="w-8 h-8 text-primary" />
          </div>
          <h3 className="font-serif text-xl font-semibold mb-2">Brak konwersacji</h3>
          <p className="text-muted-foreground text-sm">
            Konwersacje z klientami pojawią się tutaj po podłączeniu integracji komunikacyjnych (SMS, WhatsApp, e-mail).
          </p>
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
            messages={messages[selectedContact.id] || []}
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

export interface Contact {
  id: string;
  ghlContactId: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  lastMessageAt?: Date;
  lastMessagePreview?: string;
  unreadCount: number;
  tags: string[];
}

export interface Conversation {
  id: string;
  ghlConversationId: string;
  contact: Contact;
  type: "SMS" | "Email" | "WhatsApp" | "Facebook" | "Instagram";
  lastMessageBody?: string;
  lastMessageAt?: Date;
  lastMessageDirection: "inbound" | "outbound";
  unreadCount: number;
}

export interface Message {
  id: string;
  ghlMessageId: string;
  direction: "inbound" | "outbound";
  type: "SMS" | "Email" | "WhatsApp" | "Facebook" | "Instagram";
  body: string;
  attachments?: Attachment[];
  status: "pending" | "sent" | "delivered" | "read" | "failed";
  sentAt: Date;
}

export interface Attachment {
  type: "image" | "video" | "file";
  url: string;
  name?: string;
}

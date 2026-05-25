import { useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useSalonId } from "./useSalonId";
import type { Contact, Message } from "@/components/admin/conversations/types";

/**
 * Derives conversation contacts from real clients + their last message.
 */
export function useConversationContacts(enabled = true) {
  const { salonId } = useSalonId();
  return useQuery({
    queryKey: ["conv-contacts", salonId],
    enabled: enabled && !!salonId,
    queryFn: async (): Promise<Contact[]> => {
      const { data: clients, error: clientsErr } = await supabase
        .from("clients")
        .select("id, first_name, last_name, email, phone, tags, last_visit_at")
        .eq("salon_id", salonId!)
        .order("last_visit_at", { ascending: false, nullsFirst: false });
      if (clientsErr) throw clientsErr;
      if (!clients || clients.length === 0) return [];

      const { data: msgs } = await supabase
        .from("conversation_messages" as any)
        .select("client_id, body, sent_at, direction")
        .eq("salon_id", salonId!)
        .order("sent_at", { ascending: false });

      const lastByClient = new Map<string, { body: string; at: string }>();
      ((msgs || []) as any[]).forEach((m) => {
        if (!lastByClient.has(m.client_id)) {
          lastByClient.set(m.client_id, { body: m.body, at: m.sent_at });
        }
      });

      return clients.map((c) => {
        const last = lastByClient.get(c.id);
        return {
          id: c.id,
          externalContactId: c.id,
          firstName: c.first_name,
          lastName: c.last_name,
          email: c.email || undefined,
          phone: c.phone || undefined,
          lastMessageAt: last ? new Date(last.at) : undefined,
          lastMessagePreview: last?.body,
          unreadCount: 0,
          tags: c.tags || [],
        };
      });
    },
  });
}

export function useConversationMessages(clientId: string | null, enabled = true) {
  const { salonId } = useSalonId();
  const qc = useQueryClient();

  const query = useQuery({
    queryKey: ["conv-messages", salonId, clientId],
    enabled: enabled && !!salonId && !!clientId,
    queryFn: async (): Promise<Message[]> => {
      const { data, error } = await supabase
        .from("conversation_messages" as any)
        .select("*")
        .eq("salon_id", salonId!)
        .eq("client_id", clientId!)
        .order("sent_at", { ascending: true });
      if (error) throw error;
      return ((data || []) as any[]).map((m) => ({
        id: m.id,
        externalMessageId: m.external_message_id || m.id,
        direction: m.direction,
        type: m.channel,
        body: m.body,
        status: m.status,
        sentAt: new Date(m.sent_at),
      }));
    },
  });

  // Realtime subscription per active client thread
  useEffect(() => {
    if (!salonId || !clientId) return;
    const channel = supabase
      .channel(`conv-${salonId}-${clientId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "conversation_messages",
          filter: `client_id=eq.${clientId}`,
        },
        () => {
          qc.invalidateQueries({ queryKey: ["conv-messages", salonId, clientId] });
          qc.invalidateQueries({ queryKey: ["conv-contacts", salonId] });
        },
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [salonId, clientId, qc]);

  return query;
}

export function useSendMessage() {
  const { salonId } = useSalonId();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      clientId: string;
      body: string;
      channel: "SMS" | "Email" | "WhatsApp" | "Facebook" | "Instagram";
    }) => {
      if (!salonId) throw new Error("No salon");
      const { data, error } = await supabase
        .from("conversation_messages" as any)
        .insert({
          salon_id: salonId,
          client_id: input.clientId,
          direction: "outbound",
          channel: input.channel,
          body: input.body,
          status: "sent",
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: ["conv-messages", salonId, vars.clientId] });
      qc.invalidateQueries({ queryKey: ["conv-contacts", salonId] });
    },
  });
}
import { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Bot, Send, Trash2, Loader2, Sparkles } from "lucide-react";
import { SupportMessage } from "./SupportMessage";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface SupportChatProps {
  initialMessage: string | null;
  onMessageSent: () => void;
}

export function SupportChat({ initialMessage, onMessageSent }: SupportChatProps) {
  const { t } = useTranslation();
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "Cześć! 👋 Jestem AI Asystentem Beauty Calendar. Pomogę Ci skonfigurować platformę i odpowiem na każde pytanie. Jak mogę Ci pomóc?" }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Handle initial message from quick actions
  useEffect(() => {
    if (initialMessage) {
      sendMessage(initialMessage);
      onMessageSent();
    }
  }, [initialMessage]);

  const sendMessage = async (messageText: string) => {
    if (!messageText.trim() || isLoading) return;

    const trimmedMessage = messageText.trim();
    const userMessage: Message = { role: "user", content: trimmedMessage };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    let assistantContent = "";

    const upsertAssistantMessage = (nextChunk: string) => {
      assistantContent += nextChunk;
      setMessages(prev => {
        const lastMessage = prev[prev.length - 1];
        if (lastMessage?.role === "assistant") {
          const next = [...prev];
          next[next.length - 1] = { ...lastMessage, content: assistantContent };
          return next;
        }
        return [...prev, { role: "assistant", content: assistantContent }];
      });
    };

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const accessToken = session?.access_token ?? import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/support-chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          messages: [...messages.slice(1), userMessage],
        }),
      });

      if (!response.ok) {
        let errorMessage = "Błąd połączenia z AI";
        try {
          const errorData = await response.json();
          if (typeof errorData?.error === "string") {
            errorMessage = errorData.error;
          }
        } catch {
          const text = await response.text();
          if (text) errorMessage = text;
        }
        throw new Error(errorMessage);
      }

      if (!response.body) {
        throw new Error("Brak odpowiedzi z AI");
      }

      setMessages(prev => [...prev, { role: "assistant", content: "" }]);

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = "";
      let streamDone = false;

      while (!streamDone) {
        const { done, value } = await reader.read();
        if (done) break;

        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);

          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data:")) continue;

          const jsonStr = line.slice(5).trim();
          if (jsonStr === "[DONE]") {
            streamDone = true;
            break;
          }

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;

            if (typeof content === "string" && content.length > 0) {
              upsertAssistantMessage(content);
            } else if (Array.isArray(content)) {
              for (const part of content) {
                if (part?.type === "text" && typeof part.text === "string") {
                  upsertAssistantMessage(part.text);
                }
              }
            }
          } catch {
            textBuffer = `${line}\n${textBuffer}`;
            break;
          }
        }
      }

      if (textBuffer.trim()) {
        for (const raw of textBuffer.split("\n")) {
          let line = raw;
          if (!line) continue;
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data:")) continue;

          const jsonStr = line.slice(5).trim();
          if (jsonStr === "[DONE]") continue;

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (typeof content === "string" && content.length > 0) {
              upsertAssistantMessage(content);
            }
          } catch {
            // Ignorujemy niedomknięte fragmenty JSON na końcu strumienia
          }
        }
      }

      if (!assistantContent.trim()) {
        throw new Error("AI nie zwróciło treści odpowiedzi. Spróbuj ponownie.");
      }
    } catch (error) {
      console.error("Chat error:", error);
      toast.error(error instanceof Error ? error.message : "Błąd połączenia z AI");
      setMessages(prev => {
        const hasEmptyAssistantAtEnd = prev[prev.length - 1]?.role === "assistant" && !prev[prev.length - 1]?.content;
        const cleaned = hasEmptyAssistantAtEnd ? prev.slice(0, -1) : prev;
        return [
          ...cleaned,
          { role: "assistant", content: "Przepraszam, wystąpił błąd. Spróbuj ponownie lub skontaktuj się z support@beautyfunnel.pl" },
        ];
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const clearHistory = () => {
    setMessages([{ role: "assistant", content: "Cześć! 👋 Jestem AI Asystentem Beauty Calendar. Pomogę Ci skonfigurować platformę i odpowiem na każde pytanie. Jak mogę Ci pomóc?" }]);
  };

  return (
    <Card className="h-[600px] flex flex-col shadow-lg">
      <CardHeader className="pb-3 border-b bg-gradient-to-r from-primary/5 to-secondary/5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-primary to-secondary flex items-center justify-center shadow-md">
              <Sparkles className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <CardTitle className="text-lg font-semibold">AI Asystent Beauty Calendar</CardTitle>
              <CardDescription className="text-sm flex items-center gap-2">
                {isLoading ? (
                  <>
                    <Loader2 className="w-3 h-3 animate-spin" />
                    <span>AI pisze...</span>
                  </>
                ) : (
                  <>
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    <span>Online - gotowy do pomocy</span>
                  </>
                )}
              </CardDescription>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={clearHistory} title="Wyczyść historię">
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="flex-1 overflow-y-auto p-4">
        <div className="space-y-4">
          {messages.map((message, index) => (
            <SupportMessage key={index} message={message} />
          ))}
          {isLoading && messages[messages.length - 1]?.role === "user" && (
            <div className="flex items-center gap-3 text-muted-foreground text-sm p-3 bg-muted/50 rounded-lg">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-primary to-secondary flex items-center justify-center">
                <Bot className="w-4 h-4 text-primary-foreground" />
              </div>
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>AI Asystent pisze odpowiedź...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </CardContent>

      <CardFooter className="border-t p-4 bg-muted/30">
        <form onSubmit={handleSubmit} className="flex gap-3 w-full">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Zadaj pytanie... (Enter aby wysłać)"
            className="min-h-[48px] max-h-[120px] resize-none flex-1"
            disabled={isLoading}
          />
          <Button 
            type="submit" 
            size="icon" 
            className="h-12 w-12 shrink-0"
            disabled={isLoading || !input.trim()}
          >
            <Send className="w-5 h-5" />
          </Button>
        </form>
      </CardFooter>
    </Card>
  );
}

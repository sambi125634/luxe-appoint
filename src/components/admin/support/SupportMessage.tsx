import { cn } from "@/lib/utils";
import { Bot, User } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface SupportMessageProps {
  message: Message;
}

export function SupportMessage({ message }: SupportMessageProps) {
  const isUser = message.role === "user";

  // Simple markdown-like formatting
  const formatContent = (content: string) => {
    return content
      .split("\n")
      .map((line, i) => {
        // Headers
        if (line.startsWith("## ")) {
          return <h3 key={i} className="font-semibold text-base mt-3 mb-1">{line.slice(3)}</h3>;
        }
        if (line.startsWith("# ")) {
          return <h2 key={i} className="font-bold text-lg mt-3 mb-1">{line.slice(2)}</h2>;
        }
        // Numbered lists
        if (/^\d+\.\s/.test(line)) {
          return <p key={i} className="ml-4">{line}</p>;
        }
        // Bullet points
        if (line.startsWith("- ") || line.startsWith("* ")) {
          return <p key={i} className="ml-4">• {line.slice(2)}</p>;
        }
        // Bold text
        const boldFormatted = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        if (boldFormatted !== line) {
          return <p key={i} dangerouslySetInnerHTML={{ __html: boldFormatted }} />;
        }
        // Empty lines
        if (!line.trim()) {
          return <br key={i} />;
        }
        return <p key={i}>{line}</p>;
      });
  };

  return (
    <div className={cn("flex gap-3", isUser && "flex-row-reverse")}>
      <div className={cn(
        "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0",
        isUser 
          ? "bg-primary text-primary-foreground" 
          : "bg-gradient-to-r from-primary to-secondary text-primary-foreground"
      )}>
        {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
      </div>
      <div className={cn(
        "rounded-2xl px-4 py-3 max-w-[80%] text-sm",
        isUser 
          ? "bg-primary text-primary-foreground rounded-tr-sm" 
          : "bg-muted rounded-tl-sm"
      )}>
        <div className="space-y-1">
          {formatContent(message.content)}
        </div>
      </div>
    </div>
  );
}

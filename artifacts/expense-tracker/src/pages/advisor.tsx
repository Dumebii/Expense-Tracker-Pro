import { useState, useRef, useEffect } from "react";
import { useListOpenaiConversations, useCreateOpenaiConversation, useDeleteOpenaiConversation, useListOpenaiMessages, getListOpenaiConversationsQueryKey, getListOpenaiMessagesQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Send, Plus, Trash2, Bot, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

interface Message {
  id: number | string;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
  streaming?: boolean;
}

export default function Advisor() {
  const [selectedConvId, setSelectedConvId] = useState<number | null>(null);
  const [inputValue, setInputValue] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingMessages, setStreamingMessages] = useState<Message[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: conversations, isLoading: isConvsLoading } = useListOpenaiConversations();
  const { data: messages, isLoading: isMessagesLoading } = useListOpenaiMessages(
    selectedConvId!,
    { query: { enabled: !!selectedConvId } }
  );

  const createConversation = useCreateOpenaiConversation({
    mutation: {
      onSuccess: (conv) => {
        queryClient.invalidateQueries({ queryKey: getListOpenaiConversationsQueryKey() });
        setSelectedConvId(conv.id);
        setStreamingMessages([]);
      },
    },
  });

  const deleteConversation = useDeleteOpenaiConversation({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListOpenaiConversationsQueryKey() });
        setSelectedConvId(null);
        setStreamingMessages([]);
      },
    },
  });

  const displayedMessages: Message[] = streamingMessages.length > 0 ? streamingMessages : (messages?.map((m) => ({ ...m, role: m.role as "user" | "assistant" })) || []);

  useEffect(() => {
    if (messages && streamingMessages.length === 0) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [streamingMessages]);

  const handleNewConversation = () => {
    createConversation.mutate({ data: { title: `Conversation ${new Date().toLocaleString()}` } });
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || !selectedConvId || isStreaming) return;

    const userMessage: Message = {
      id: `temp-${Date.now()}`,
      role: "user",
      content: inputValue.trim(),
      createdAt: new Date().toISOString(),
    };

    const currentMessages = [...displayedMessages, userMessage];
    setStreamingMessages(currentMessages);
    setInputValue("");
    setIsStreaming(true);

    const assistantMessage: Message = {
      id: `streaming-${Date.now()}`,
      role: "assistant",
      content: "",
      createdAt: new Date().toISOString(),
      streaming: true,
    };

    setStreamingMessages([...currentMessages, assistantMessage]);

    try {
      const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");
      const response = await fetch(`${basePath}/api/openai/conversations/${selectedConvId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: userMessage.content }),
      });

      if (!response.ok) throw new Error("Request failed");

      const reader = response.body!.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let fullContent = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop()!;
        for (const line of lines) {
          if (line.startsWith("data: ")) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.done) {
                break;
              }
              if (data.content) {
                fullContent += data.content;
                setStreamingMessages((prev) => {
                  const updated = [...prev];
                  const lastMsg = updated[updated.length - 1];
                  if (lastMsg && lastMsg.streaming) {
                    updated[updated.length - 1] = { ...lastMsg, content: fullContent };
                  }
                  return updated;
                });
              }
            } catch {}
          }
        }
      }

      queryClient.invalidateQueries({ queryKey: getListOpenaiMessagesQueryKey(selectedConvId) });
      queryClient.invalidateQueries({ queryKey: getListOpenaiConversationsQueryKey() });
      setStreamingMessages([]);
    } catch {
      toast({ title: "Failed to send message", variant: "destructive" });
      setStreamingMessages(displayedMessages);
    } finally {
      setIsStreaming(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex h-[calc(100vh-8rem)] gap-4">
      <div className="w-64 flex flex-col gap-3 shrink-0">
        <Button onClick={handleNewConversation} className="gap-2 w-full" disabled={createConversation.isPending}>
          <Plus className="w-4 h-4" />
          New Conversation
        </Button>

        <div className="flex-1 overflow-y-auto space-y-1">
          {isConvsLoading ? (
            Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-12 rounded-lg" />)
          ) : conversations?.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-4">No conversations yet</p>
          ) : (
            conversations?.map((conv) => (
              <div
                key={conv.id}
                className={cn(
                  "flex items-center gap-2 px-3 py-2.5 rounded-lg cursor-pointer group transition-colors",
                  selectedConvId === conv.id
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "hover:bg-sidebar-accent/50 text-muted-foreground"
                )}
                onClick={() => { setSelectedConvId(conv.id); setStreamingMessages([]); }}
              >
                <Bot className="w-4 h-4 shrink-0" />
                <span className="text-sm truncate flex-1">{conv.title}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 shrink-0 opacity-0 group-hover:opacity-100"
                  onClick={(e) => { e.stopPropagation(); deleteConversation.mutate({ id: conv.id }); }}
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            ))
          )}
        </div>
      </div>

      <Card className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {!selectedConvId ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center p-8">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
              <Bot className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-lg font-semibold mb-2">AI Financial Advisor</h2>
              <p className="text-sm text-muted-foreground max-w-sm">
                Start a conversation to get personalized financial advice based on your actual income and expense data.
              </p>
            </div>
            <Button onClick={handleNewConversation} className="gap-2">
              <Plus className="w-4 h-4" />
              Start a Conversation
            </Button>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {isMessagesLoading ? (
                Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-16 rounded-xl" />)
              ) : displayedMessages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full gap-3 text-center">
                  <Bot className="w-10 h-10 text-muted-foreground/50" />
                  <div>
                    <p className="font-medium text-muted-foreground">Ask me anything about your finances</p>
                    <p className="text-sm text-muted-foreground/70 mt-1">I have access to your income and expense data.</p>
                  </div>
                </div>
              ) : (
                displayedMessages.map((message) => (
                  <div
                    key={message.id}
                    className={cn("flex gap-3", message.role === "user" ? "justify-end" : "justify-start")}
                  >
                    {message.role === "assistant" && (
                      <div className="w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-1">
                        <Bot className="w-4 h-4" />
                      </div>
                    )}
                    <div
                      className={cn(
                        "max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
                        message.role === "user"
                          ? "bg-primary text-primary-foreground"
                          : "bg-sidebar-accent text-sidebar-accent-foreground"
                      )}
                    >
                      {message.streaming && message.content === "" ? (
                        <span className="animate-pulse">Thinking...</span>
                      ) : (
                        <span className="whitespace-pre-wrap">{message.content}</span>
                      )}
                    </div>
                    {message.role === "user" && (
                      <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center shrink-0 mt-1">
                        <User className="w-4 h-4" />
                      </div>
                    )}
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="border-t border-border/50 p-4 flex gap-2">
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about your finances..."
                disabled={isStreaming}
                className="flex-1"
              />
              <Button onClick={handleSendMessage} disabled={!inputValue.trim() || isStreaming} size="icon">
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </>
        )}
      </Card>
    </div>
  );
}

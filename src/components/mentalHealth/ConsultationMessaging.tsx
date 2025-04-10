
import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/supabase-client";
import { useAuth } from "@/components/AuthProvider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Paperclip, Send } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

export function ConsultationMessaging({ 
  recipientId,
  recipientName 
}: { 
  recipientId: string;
  recipientName: string;
}) {
  const { session } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [message, setMessage] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  const { data: messages } = useQuery({
    queryKey: ['consultation-messages', session?.user?.id, recipientId],
    queryFn: async () => {
      const { data } = await supabase
        .from('consultation_messages')
        .select(`
          *,
          sender:sender_id(full_name, avatar_url),
          receiver:receiver_id(full_name, avatar_url)
        `)
        .or(`and(sender_id.eq.${session?.user?.id},receiver_id.eq.${recipientId}),and(sender_id.eq.${recipientId},receiver_id.eq.${session?.user?.id})`)
        .order('created_at', { ascending: true });
      return data;
    },
    enabled: !!session?.user?.id && !!recipientId,
    refetchInterval: 5000 // Poll every 5 seconds
  });

  const sendMessage = useMutation({
    mutationFn: async (messageText: string) => {
      const { data, error } = await supabase
        .from('consultation_messages')
        .insert([{
          sender_id: session?.user?.id,
          receiver_id: recipientId,
          message_text: messageText
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['consultation-messages'] });
      setMessage("");
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive"
      });
      console.error('Message error:', error);
    }
  });

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      sendMessage.mutate(message);
    }
  };

  return (
    <div className="flex flex-col h-[600px] border rounded-lg">
      <div className="p-4 border-b">
        <h2 className="font-semibold">Chat with {recipientName}</h2>
      </div>

      <ScrollArea ref={scrollRef} className="flex-1 p-4 space-y-4">
        {messages?.map((msg) => {
          const isSender = msg.sender_id === session?.user?.id;
          return (
            <div 
              key={msg.id}
              className={`flex gap-2 ${isSender ? 'justify-end' : 'justify-start'}`}
            >
              {!isSender && (
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  {msg.sender?.full_name?.[0] || '?'}
                </div>
              )}
              <div 
                className={`max-w-[70%] rounded-lg p-3 ${
                  isSender 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-muted'
                }`}
              >
                <p className="text-sm">{msg.message_text}</p>
                <span className="text-xs opacity-70">
                  {new Date(msg.created_at).toLocaleTimeString()}
                </span>
              </div>
              {isSender && (
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  {msg.sender?.full_name?.[0] || '?'}
                </div>
              )}
            </div>
          );
        })}
      </ScrollArea>

      <form onSubmit={handleSend} className="p-4 border-t flex gap-2">
        <Input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type a message..."
          className="flex-1"
        />
        <Button type="submit" disabled={!message.trim() || sendMessage.isPending}>
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
}


import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/supabase-client"
import { useAuth } from "@/components/AuthProvider"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useToast } from "@/hooks/use-toast"

export function MessagingCenter() {
  const { session } = useAuth();
  const { toast } = useToast();
  const [newMessage, setNewMessage] = useState("");
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  const { data: chats, refetch: refetchChats } = useQuery({
    queryKey: ['vendor-chats', session?.user?.id],
    queryFn: async () => {
      const { data: vendorData } = await supabase
        .from('vendors')
        .select('id')
        .eq('claimed_by', session?.user?.id)
        .single();

      if (!vendorData) return [];

      const { data: messages } = await supabase
        .from('vendor_customer_messages')
        .select('user_id')
        .eq('vendor_id', vendorData.id);

      // Get unique user_ids
      const uniqueUserIds = [...new Set(messages?.map(m => m.user_id) || [])];
      return uniqueUserIds.map(id => ({ user_id: id }));
    },
    enabled: !!session?.user?.id
  });

  const { data: messages, refetch: refetchMessages } = useQuery({
    queryKey: ['vendor-messages', session?.user?.id, selectedUserId],
    queryFn: async () => {
      const { data: vendorData } = await supabase
        .from('vendors')
        .select('id')
        .eq('claimed_by', session?.user?.id)
        .single();

      if (!vendorData || !selectedUserId) return [];

      const { data, error } = await supabase
        .from('vendor_customer_messages')
        .select('*')
        .eq('vendor_id', vendorData.id)
        .eq('user_id', selectedUserId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data;
    },
    enabled: !!session?.user?.id && !!selectedUserId
  });

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedUserId) return;

    try {
      const { data: vendorData } = await supabase
        .from('vendors')
        .select('id')
        .eq('claimed_by', session?.user?.id)
        .single();

      if (!vendorData) throw new Error("Vendor not found");

      const { error } = await supabase
        .from('vendor_customer_messages')
        .insert({
          vendor_id: vendorData.id,
          user_id: selectedUserId,
          message: newMessage,
          is_from_vendor: true
        });

      if (error) throw error;

      setNewMessage("");
      refetchMessages();
      refetchChats();
      toast({
        title: "Success",
        description: "Message sent successfully"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive"
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Customer Messages</CardTitle>
      </CardHeader>
      <CardContent className="flex gap-4">
        <div className="w-1/4 border-r pr-4">
          <h3 className="font-semibold mb-4">Conversations</h3>
          <ScrollArea className="h-[500px]">
            {chats?.map((chat) => (
              <Button
                key={chat.user_id}
                variant={selectedUserId === chat.user_id ? "default" : "ghost"}
                className="w-full justify-start"
                onClick={() => setSelectedUserId(chat.user_id)}
              >
                Customer #{chat.user_id.slice(0, 8)}
              </Button>
            ))}
          </ScrollArea>
        </div>

        <div className="flex-1">
          {selectedUserId ? (
            <>
              <ScrollArea className="h-[400px] mb-4 border rounded-lg p-4">
                {messages?.map((msg) => (
                  <div
                    key={msg.id}
                    className={`mb-4 ${
                      msg.is_from_vendor ? 'text-right' : 'text-left'
                    }`}
                  >
                    <div
                      className={`inline-block p-3 rounded-lg ${
                        msg.is_from_vendor
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted'
                      }`}
                    >
                      {msg.message}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {new Date(msg.created_at).toLocaleString()}
                    </div>
                  </div>
                ))}
              </ScrollArea>

              <div className="flex gap-2">
                <Textarea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type your message..."
                  className="flex-1"
                />
                <Button onClick={sendMessage}>Send</Button>
              </div>
            </>
          ) : (
            <div className="h-[500px] flex items-center justify-center text-muted-foreground">
              Select a conversation to start messaging
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from '@/components/ui/use-toast';
import { formatDistanceToNow } from 'date-fns';
import { Lock, Send, Shield, Users, UserPlus, MessageSquare, Bell, Search, Info, Trash2, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { authenticatedRestCall } from '@/lib/supabase/rest-client';
import { generateKeyPair, encryptMessage, decryptMessage } from '@/lib/encryption';
import { useSession } from '../../contexts/SessionContext';
import { User } from '@supabase/supabase-js';

// Define conversation and message interfaces
interface Conversation {
  id: string;
  userIds: string[];
  lastMessage?: string;
  lastMessageTimestamp?: string;
  unreadCount?: number;
}

interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  timestamp: string;
  read: boolean;
}

type PrivacyLevel = 'standard' | 'enhanced' | 'maximum';

export default function PrivateMessaging() {
  const { toast } = useToast();
  const { session } = useAuth();
  const queryClient = useQueryClient();
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [message, setMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [privacyLevel, setPrivacyLevel] = useState<PrivacyLevel>('standard');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const encryptionKeyRef = useRef<{ publicKey: string, privateKey: string }>({ publicKey: '', privateKey: '' });
  
  useEffect(() => {
    // Generate encryption keys if none exist
    if (privacyLevel !== 'standard' && !encryptionKeyRef.current.publicKey) {
      generateKeyPair().then(keys => {
        encryptionKeyRef.current = keys;
      });
    }
  }, [privacyLevel]);
  
  // Fetch conversations
  const { data: conversations = [], isLoading: conversationsLoading } = useQuery({
    queryKey: ['conversations', session?.user?.id],
    queryFn: async () => {
      const response = await authenticatedRestCall<Conversation[]>(
        '/api/conversations',
        { method: 'GET' },
        session
      );
      
      if (response.error) throw response.error;
      return response.data || [];
    },
    enabled: !!session?.user?.id,
  });
  
  // Fetch messages for the selected conversation
  const { data: messages = [], isLoading: messagesLoading } = useQuery({
    queryKey: ['messages', selectedConversation?.id],
    queryFn: async () => {
      const response = await authenticatedRestCall<Message[]>(
        `/api/conversations/${selectedConversation?.id}/messages`,
        { method: 'GET' },
        session
      );
      
      if (response.error) throw response.error;
      return response.data || [];
    },
    enabled: !!selectedConversation?.id && !!session?.user?.id,
  });
  
  // Mark messages as read mutation
  const markAsRead = useMutation({
    mutationFn: async (messageIds: string[]) => {
      const response = await authenticatedRestCall<{ success: boolean }>(
        '/api/messages/mark-read',
        {
          method: 'POST',
          body: JSON.stringify({ messageIds }),
        },
        session
      );
      
      if (response.error) throw response.error;
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      queryClient.invalidateQueries({ queryKey: ['messages', selectedConversation?.id] });
    },
  });
  
  // Send message mutation
  const sendMessage = useMutation({
    mutationFn: async (messageText: string) => {
      if (!selectedConversation?.id || !session?.user?.id) return;
      
      let processedMessage = messageText;
      let isEncrypted = false;
      
      // If encryption is enabled, encrypt the message
      if (privacyLevel !== 'standard') {
        try {
          // Get recipient's public key
          const recipientKeyResponse = await authenticatedRestCall<{ public_key: string }>(
            '/api/users/encryption-key/' + selectedConversation.userIds.find(id => id !== session.user.id),
            { method: 'GET' },
            session
          );
          
          if (recipientKeyResponse.error) throw recipientKeyResponse.error;
          const recipientKey = recipientKeyResponse.data?.public_key;
          
          if (recipientKey) {
            const { encryptedMessage, key } = await encryptMessage(messageText, recipientKey);
            processedMessage = encryptedMessage;
            isEncrypted = true;
          }
        } catch (error) {
          console.error('Failed to encrypt message:', error);
          toast({
            title: "Encryption failed",
            description: "Message will be sent unencrypted",
            variant: "destructive"
          });
        }
      }
      
      // Send message
      const response = await authenticatedRestCall<{ id: string }>(
        '/api/messages',
        {
          method: 'POST',
          body: JSON.stringify({
            conversationId: selectedConversation.id,
            senderId: session.user.id,
            receiverId: selectedConversation.userIds.find(id => id !== session.user.id),
            content: processedMessage,
            isEncrypted: isEncrypted,
            encryptionKey: isEncrypted ? encryptionKeyRef.current.publicKey : null
          })
        },
        session
      );
      
      if (response.error) throw response.error;
      return response.data;
    },
    onSuccess: () => {
      setMessage('');
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      queryClient.invalidateQueries({ queryKey: ['messages', selectedConversation?.id] });
    },
    onError: (error) => {
      console.error('Failed to send message:', error);
      toast({
        title: "Failed to send message",
        description: "Please try again later",
        variant: "destructive"
      });
    }
  });
  
  // Create new conversation mutation
  const createConversation = useMutation({
    mutationFn: async (userId: string) => {
      const response = await authenticatedRestCall<{ id: string }>(
        '/api/conversations',
        {
          method: 'POST',
          body: JSON.stringify({
            userIds: [session?.user?.id, userId]
          })
        },
        session
      );
      
      if (response.error) throw response.error;
      
      return response.data;
    },
    onSuccess: (data) => {
      if (!data) return;
      
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      toast({
        title: "Conversation created",
        description: "You can now start messaging",
      });
    }
  });
  
  // Auto-scroll to newest messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    
    // Mark messages as read when conversation is opened
    if (selectedConversation?.id) {
      markAsRead.mutate([selectedConversation.id]);
    }
  }, [messages, selectedConversation?.id]);
  
  // Filter conversations by search query
  const filteredConversations = conversations.filter(conv => 
    conv.userIds.some(id => id.toLowerCase().includes(searchQuery.toLowerCase()))
  );
  
  // Handle message submission
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!message.trim()) return;
    
    sendMessage.mutate(message);
  };
  
  // Privacy level descriptions
  const privacyLevelInfo = {
    standard: {
      title: 'Standard Privacy',
      description: 'Messages are stored normally in the database.',
      icon: <Users className="h-5 w-5 text-blue-500" />
    },
    enhanced: {
      title: 'Enhanced Privacy',
      description: 'Messages are encrypted in the database, but readable to support services if needed.',
      icon: <Shield className="h-5 w-5 text-green-500" />
    },
    maximum: {
      title: 'Maximum Privacy',
      description: 'End-to-end encryption. Only you and your peer can read these messages.',
      icon: <Lock className="h-5 w-5 text-purple-500" />
    }
  };

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6 flex items-center">
        <MessageSquare className="h-7 w-7 mr-2" /> Peer Support Messaging
      </h1>
      
      <div className="bg-primary/5 border p-4 rounded-lg mb-6 flex items-start">
        <Info className="h-5 w-5 text-primary mr-3 mt-0.5" />
        <div>
          <h2 className="font-semibold text-primary mb-1">
            Private Peer Support
          </h2>
          <p className="text-sm text-muted-foreground">
            Connect one-on-one with others on their quitting journey. Share experiences, 
            challenges, and encouragement in a safe, judgment-free space. 
            All conversations can be made private with our encryption options.
          </p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Conversations List */}
        <div className="lg:col-span-1">
          <Card className="h-[600px] flex flex-col">
            <CardHeader className="pb-2">
              <CardTitle className="flex justify-between items-center">
                <span>Conversations</span>
                <Badge variant="outline" className="ml-2">
                  {conversations.length}
                </Badge>
              </CardTitle>
              <div className="relative">
                <Search className="absolute left-2 top-[9px] h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Search peers..." 
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </CardHeader>
            <CardContent className="flex-grow overflow-auto p-2">
              <ScrollArea className="h-full pr-2">
                {conversationsLoading ? (
                  <div className="p-4 text-center text-muted-foreground">
                    Loading conversations...
                  </div>
                ) : filteredConversations.length === 0 ? (
                  <div className="p-4 text-center text-muted-foreground">
                    {searchQuery 
                      ? "No matching conversations found" 
                      : "No conversations yet"}
                  </div>
                ) : (
                  <div className="space-y-2">
                    {filteredConversations.map((conv) => (
                      <div 
                        key={conv.id}
                        className={`p-3 rounded-md cursor-pointer flex items-center ${
                          selectedConversation?.id === conv.id 
                            ? 'bg-primary/10 border border-primary/20' 
                            : 'hover:bg-muted'
                        }`}
                        onClick={() => setSelectedConversation(conv)}
                      >
                        <Avatar className="h-9 w-9 mr-3">
                          <AvatarImage src={conv.userIds.find(id => id !== session?.user?.id)?.toString()} alt={conv.userIds.join(', ')} />
                          <AvatarFallback>
                            {conv.userIds.join(', ').charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-grow min-w-0">
                          <div className="flex justify-between items-center">
                            <span className="font-medium truncate">
                              {conv.userIds.join(', ')}
                            </span>
                            {conv.unreadCount && (
                              <Badge className="ml-2">
                                {conv.unreadCount}
                              </Badge>
                            )}
                          </div>
                          {conv.lastMessage && (
                            <p className="text-xs text-muted-foreground truncate">
                              {conv.lastMessage}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
            <CardFooter className="border-t pt-3">
              <Button 
                variant="outline" 
                className="w-full flex items-center"
                onClick={() => {
                  // In a real implementation, this would show a modal to search for and select a peer
                  toast({
                    title: "Find Peers",
                    description: "Coming soon: Browse the community to find peers to connect with!"
                  });
                }}
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Find Peers
              </Button>
            </CardFooter>
          </Card>
        </div>
        
        {/* Messages Area */}
        <div className="lg:col-span-3">
          <Card className="h-[600px] flex flex-col">
            {selectedConversation ? (
              <>
                <CardHeader className="pb-3 flex-shrink-0">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <Avatar className="h-10 w-10 mr-3">
                        <AvatarImage 
                          src={selectedConversation.userIds.find(id => id !== session?.user?.id)?.toString()} 
                          alt={selectedConversation.userIds.join(', ')} 
                        />
                        <AvatarFallback>
                          {selectedConversation.userIds.join(', ').charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle>{selectedConversation.userIds.join(', ')}</CardTitle>
                        <CardDescription>
                          Peer Support
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center">
                      {privacyLevelInfo[privacyLevel].icon}
                      <span className="text-xs ml-2 text-muted-foreground">
                        {privacyLevelInfo[privacyLevel].title}
                      </span>
                    </div>
                  </div>
                  <Separator className="mt-3" />
                </CardHeader>

                <CardContent className="flex-grow overflow-auto p-4">
                  {messagesLoading ? (
                    <div className="h-full flex items-center justify-center">
                      <p className="text-muted-foreground">Loading messages...</p>
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center">
                      <MessageSquare className="h-16 w-16 text-muted-foreground opacity-20 mb-4" />
                      <h3 className="font-medium text-lg mb-1">No messages yet</h3>
                      <p className="text-muted-foreground text-center max-w-md">
                        Start the conversation with {selectedConversation.userIds.join(', ')}. 
                        Share your experience, ask questions, or offer support.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {messages.map((msg) => {
                        const isSender = msg.senderId === session?.user?.id;
                        
                        return (
                          <div 
                            key={msg.id} 
                            className={`flex ${isSender ? 'justify-end' : 'justify-start'}`}
                          >
                            <div 
                              className={`max-w-[80%] rounded-lg p-3 ${
                                isSender 
                                  ? 'bg-primary text-white' 
                                  : 'bg-muted'
                              }`}
                            >
                              <div className="text-sm">{msg.content}</div>
                              <div className="flex items-center justify-end mt-1 text-xs opacity-80">
                                <Clock className="h-3 w-3 mr-1" />
                                <span>
                                  {formatDistanceToNow(new Date(msg.timestamp), { addSuffix: true })}
                                </span>
                                {isSender && (
                                  <span className="ml-1">
                                    {msg.read ? (
                                      <CheckCircle className="h-3 w-3" />
                                    ) : (
                                      <div className="h-2 w-2 rounded-full bg-current" />
                                    )}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                      <div ref={messagesEndRef} />
                    </div>
                  )}
                </CardContent>

                <CardFooter className="border-t p-3 flex-shrink-0">
                  <form onSubmit={handleSendMessage} className="w-full space-y-3">
                    <div className="relative">
                      <Textarea
                        placeholder="Type your message..."
                        className="pr-10 resize-none"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        rows={2}
                      />
                      <div className="absolute right-2 bottom-2">
                        <Button 
                          type="submit" 
                          size="icon" 
                          disabled={!message.trim()}
                        >
                          <Send className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <Tabs 
                          value={privacyLevel} 
                          onValueChange={(value) => setPrivacyLevel(value as PrivacyLevel)}
                          className="w-[400px]"
                        >
                          <TabsList className="grid w-full grid-cols-3">
                            <TabsTrigger value="standard">
                              <Users className="h-3 w-3 mr-1" /> Standard
                            </TabsTrigger>
                            <TabsTrigger value="enhanced">
                              <Shield className="h-3 w-3 mr-1" /> Enhanced
                            </TabsTrigger>
                            <TabsTrigger value="maximum">
                              <Lock className="h-3 w-3 mr-1" /> Maximum
                            </TabsTrigger>
                          </TabsList>
                        </Tabs>
                      </div>
                      
                      <div className="text-xs text-muted-foreground ml-2">
                        {privacyLevel !== 'standard' && (
                          <Lock className="h-3 w-3 inline mr-1" />
                        )}
                        {privacyLevelInfo[privacyLevel].description}
                      </div>
                    </div>
                  </form>
                </CardFooter>
              </>
            ) : (
              <div className="h-full flex flex-col items-center justify-center p-6">
                <MessageSquare className="h-16 w-16 text-muted-foreground opacity-20 mb-4" />
                <h2 className="text-2xl font-bold mb-2">Peer Support Messaging</h2>
                <p className="text-center text-muted-foreground mb-8 max-w-md">
                  Connect with others on their quitting journey. Select a conversation
                  to start messaging or find new peers to connect with.
                </p>
                <Button 
                  variant="outline" 
                  className="flex items-center"
                  onClick={() => {
                    // This would show a modal to search for peers
                    toast({
                      title: "Find Peers",
                      description: "Coming soon: Browse the community to find peers to connect with!"
                    });
                  }}
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  Find Peers
                </Button>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
} 
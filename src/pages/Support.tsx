import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/supabase-client";
import { useAuth } from "@/components/AuthProvider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { Users, Phone, Calendar, MessageCircle } from "lucide-react";

export default function Support() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { session } = useAuth();
  const queryClient = useQueryClient();
  const [newContact, setNewContact] = useState({
    name: "",
    relationship: "",
    contact_info: "",
    is_emergency: false
  });

  const { data: supportNetwork } = useQuery({
    queryKey: ['support-network'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('support_network')
        .select('*')
        .eq('user_id', session?.user?.id);

      if (error) throw error;
      return data;
    },
    enabled: !!session?.user?.id,
  });

  const { data: supportSessions } = useQuery({
    queryKey: ['support-sessions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('support_sessions')
        .select('*')
        .gt('session_date', new Date().toISOString())
        .order('session_date', { ascending: true })
        .limit(5);

      if (error) throw error;
      return data;
    },
  });

  const addContact = useMutation({
    mutationFn: async () => {
      if (!session?.user?.id) throw new Error("Must be logged in");

      const { error } = await supabase
        .from('support_network')
        .insert([{
          user_id: session.user.id,
          supporter_name: newContact.name,
          relationship: newContact.relationship,
          contact_info: newContact.contact_info,
          is_emergency_contact: newContact.is_emergency
        }]);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['support-network'] });
      toast({
        title: "Contact added",
        description: "Support contact has been added successfully.",
      });
      setNewContact({
        name: "",
        relationship: "",
        contact_info: "",
        is_emergency: false
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add contact. Please try again.",
        variant: "destructive",
      });
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Support Network</h1>
        <Button variant="outline" onClick={() => navigate('/sobriety')}>
          Back to Dashboard
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Add Support Contact
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                name="name"
                value={newContact.name}
                onChange={(e) => setNewContact(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Contact name"
                aria-label="Contact name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="relationship">Relationship</Label>
              <Input
                id="relationship"
                name="relationship"
                value={newContact.relationship}
                onChange={(e) => setNewContact(prev => ({ ...prev, relationship: e.target.value }))}
                placeholder="e.g., Friend, Family, Sponsor"
                aria-label="Relationship"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="contact">Contact Information</Label>
              <Input
                id="contact"
                name="contact"
                value={newContact.contact_info}
                onChange={(e) => setNewContact(prev => ({ ...prev, contact_info: e.target.value }))}
                placeholder="Phone number or email"
                aria-label="Contact information"
              />
            </div>

            <div className="flex items-center space-x-2">
              <input
                id="emergency-contact"
                name="emergency-contact"
                type="checkbox"
                checked={newContact.is_emergency}
                onChange={(e) => setNewContact(prev => ({ ...prev, is_emergency: e.target.checked }))}
                title="Mark as emergency contact"
                aria-label="Emergency contact status"
              />
              <Label htmlFor="emergency-contact" className="cursor-pointer">
                This is an emergency contact
              </Label>
            </div>

            <Button 
              className="w-full"
              onClick={() => addContact.mutate()}
              disabled={addContact.isPending}
            >
              Add Contact
            </Button>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Phone className="h-5 w-5" />
                Emergency Contacts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {supportNetwork?.filter(contact => contact.is_emergency_contact).map((contact) => (
                  <div key={contact.id} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{contact.supporter_name}</p>
                      <p className="text-sm text-muted-foreground">{contact.relationship}</p>
                    </div>
                    <Button variant="outline" size="sm">
                      {contact.contact_info}
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Upcoming Support Sessions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {supportSessions?.map((session) => (
                  <div key={session.id} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{session.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(session.session_date).toLocaleDateString()}
                      </p>
                    </div>
                    <Button variant="outline" size="sm">
                      Join
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            Support Network
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            {supportNetwork?.filter(contact => !contact.is_emergency_contact).map((contact) => (
              <Card key={contact.id}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{contact.supporter_name}</p>
                      <p className="text-sm text-muted-foreground">{contact.relationship}</p>
                      <p className="text-sm">{contact.contact_info}</p>
                    </div>
                    <Button variant="outline" size="sm">
                      Contact
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/supabase-client";
import { useAuth } from "@/components/AuthProvider";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Phone, Plus, Edit2, Trash2 } from "lucide-react";

export function EmergencyContacts() {
  const { session } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState<string | null>(null);
  const [newContact, setNewContact] = useState({
    contact_name: "",
    relationship: "",
    phone: "",
    email: "",
    is_primary: false
  });

  const { data: contacts } = useQuery({
    queryKey: ['emergency-contacts', session?.user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from('client_emergency_contacts')
        .select('*')
        .eq('client_id', session?.user?.id)
        .order('is_primary', { ascending: false });
      return data;
    },
    enabled: !!session?.user?.id
  });

  const addContact = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase
        .from('client_emergency_contacts')
        .insert([{
          client_id: session?.user?.id,
          ...newContact
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['emergency-contacts'] });
      toast({
        title: "Success",
        description: "Emergency contact added successfully"
      });
      setNewContact({
        contact_name: "",
        relationship: "",
        phone: "",
        email: "",
        is_primary: false
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to add emergency contact",
        variant: "destructive"
      });
      console.error('Emergency contact error:', error);
    }
  });

  const updateContact = useMutation({
    mutationFn: async (contactData: typeof newContact & { id: string }) => {
      const { data, error } = await supabase
        .from('client_emergency_contacts')
        .update(contactData)
        .eq('id', contactData.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['emergency-contacts'] });
      setEditing(null);
      toast({
        title: "Success",
        description: "Emergency contact updated successfully"
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update emergency contact",
        variant: "destructive"
      });
      console.error('Update error:', error);
    }
  });

  const deleteContact = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('client_emergency_contacts')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['emergency-contacts'] });
      toast({
        title: "Success",
        description: "Emergency contact deleted successfully"
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete emergency contact",
        variant: "destructive"
      });
      console.error('Delete error:', error);
    }
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Phone className="h-5 w-5" />
          Emergency Contacts
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <Label>Add New Contact</Label>
          <div className="space-y-4">
            <Input
              placeholder="Contact Name"
              value={newContact.contact_name}
              onChange={(e) => setNewContact(prev => ({
                ...prev,
                contact_name: e.target.value
              }))}
            />
            <Input
              placeholder="Relationship"
              value={newContact.relationship}
              onChange={(e) => setNewContact(prev => ({
                ...prev,
                relationship: e.target.value
              }))}
            />
            <Input
              placeholder="Phone Number"
              value={newContact.phone}
              onChange={(e) => setNewContact(prev => ({
                ...prev,
                phone: e.target.value
              }))}
            />
            <Input
              placeholder="Email (optional)"
              type="email"
              value={newContact.email}
              onChange={(e) => setNewContact(prev => ({
                ...prev,
                email: e.target.value
              }))}
            />
            <div className="flex items-center gap-2">
              <Switch
                checked={newContact.is_primary}
                onCheckedChange={(checked) => setNewContact(prev => ({
                  ...prev,
                  is_primary: checked
                }))}
              />
              <Label>Primary Contact</Label>
            </div>
          </div>
          <Button
            onClick={() => addContact.mutate()}
            disabled={addContact.isPending}
            className="w-full"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Contact
          </Button>
        </div>

        <div className="space-y-4">
          <Label>Your Emergency Contacts</Label>
          {contacts?.map((contact) => (
            <Card key={contact.id}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{contact.contact_name}</p>
                    <p className="text-sm text-muted-foreground">{contact.relationship}</p>
                    <p className="text-sm">{contact.phone}</p>
                    {contact.email && <p className="text-sm">{contact.email}</p>}
                    {contact.is_primary && (
                      <p className="text-sm text-primary mt-1">Primary Contact</p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setEditing(contact.id);
                        setNewContact({
                          contact_name: contact.contact_name,
                          relationship: contact.relationship,
                          phone: contact.phone,
                          email: contact.email || "",
                          is_primary: contact.is_primary
                        });
                      }}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteContact.mutate(contact.id)}
                      disabled={deleteContact.isPending}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

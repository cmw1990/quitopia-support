import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/supabase-client';
import { Professional, Consultation, Treatment } from '@/types/professionals';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';
import { format } from 'date-fns';
import {
  Calendar,
  Clock,
  Users,
  FileText,
  Plus,
  Edit,
  Trash,
  Send,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { useAuth } from '@/components/AuthProvider';

export const ProfessionalDashboard = () => {
  const { session } = useAuth();
  const { toast } = useToast();
  const [selectedConsultation, setSelectedConsultation] = useState<Consultation | null>(null);
  const [treatmentDialog, setTreatmentDialog] = useState(false);
  const [newTreatment, setNewTreatment] = useState({
    title: '',
    description: '',
    type: 'advice' as const,
    duration_weeks: 4,
    content: {
      items: [{
        title: '',
        description: '',
        duration: '',
        frequency: '',
        notes: ''
      }]
    }
  });

  // Fetch professional's consultations
  const { data: consultations } = useQuery({
    queryKey: ['professional-consultations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('professionals.consultations')
        .select('*, client:auth.users(id, email, full_name)')
        .eq('professional_id', session?.user?.id)
        .order('scheduled_at', { ascending: true });

      if (error) throw error;
      return data as Array<Consultation & { 
        client: { 
          id: string;
          email: string;
          full_name: string;
        }
      }>;
    }
  });

  // Fetch professional's treatments
  const { data: treatments } = useQuery({
    queryKey: ['professional-treatments'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('professionals.treatments')
        .select('*, client:auth.users(id, email, full_name)')
        .eq('professional_id', session?.user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Array<Treatment & {
        client: {
          id: string;
          email: string;
          full_name: string;
        }
      }>;
    }
  });

  // Create treatment mutation
  const createTreatment = useMutation({
    mutationFn: async () => {
      if (!selectedConsultation || !session?.user?.id) return;

      const treatmentData = {
        ...newTreatment,
        professional_id: session.user.id,
        client_id: selectedConsultation.client_id,
        status: 'active',
        start_date: new Date().toISOString(),
        progress: 0
      };

      const { data, error } = await supabase
        .from('professionals.treatments')
        .insert([treatmentData])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: 'Treatment Created',
        description: 'The treatment plan has been shared with the client.',
      });
      setTreatmentDialog(false);
      setNewTreatment({
        title: '',
        description: '',
        type: 'advice',
        duration_weeks: 4,
        content: {
          items: [{
            title: '',
            description: '',
            duration: '',
            frequency: '',
            notes: ''
          }]
        }
      });
    }
  });

  const addTreatmentItem = () => {
    setNewTreatment(prev => ({
      ...prev,
      content: {
        ...prev.content,
        items: [
          ...prev.content.items,
          {
            title: '',
            description: '',
            duration: '',
            frequency: '',
            notes: ''
          }
        ]
      }
    }));
  };

  const updateTreatmentItem = (index: number, field: string, value: string) => {
    setNewTreatment(prev => ({
      ...prev,
      content: {
        ...prev.content,
        items: prev.content.items.map((item, i) =>
          i === index ? { ...item, [field]: value } : item
        )
      }
    }));
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Tabs defaultValue="upcoming">
        <TabsList>
          <TabsTrigger value="upcoming">Upcoming Consultations</TabsTrigger>
          <TabsTrigger value="treatments">Treatments & Advice</TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="space-y-6">
          {consultations?.map((consultation) => (
            <Card key={consultation.id}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold">{consultation.client.full_name}</h3>
                    <div className="flex items-center text-sm text-muted-foreground mt-1">
                      <Calendar className="h-4 w-4 mr-2" />
                      {format(new Date(consultation.scheduled_at), 'PPP')}
                      <Clock className="h-4 w-4 mx-2" />
                      {format(new Date(consultation.scheduled_at), 'p')}
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSelectedConsultation(consultation);
                      setTreatmentDialog(true);
                    }}
                  >
                    Add Treatment/Advice
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="treatments" className="space-y-6">
          {treatments?.map((treatment) => (
            <Card key={treatment.id}>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold">{treatment.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        For: {treatment.client.full_name}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    {treatment.content.items.map((item, index) => (
                      <div key={index} className="pl-4 border-l-2 border-primary">
                        <h4 className="font-medium">{item.title}</h4>
                        <p className="text-sm">{item.description}</p>
                        {item.frequency && (
                          <p className="text-sm text-muted-foreground">
                            Frequency: {item.frequency}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>

      <Dialog open={treatmentDialog} onOpenChange={setTreatmentDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add Treatment/Advice</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="treatment-type" className="text-sm font-medium">Type</label>
              <select
                id="treatment-type"
                name="treatment-type"
                value={newTreatment.type}
                onChange={(e) => setNewTreatment(prev => ({
                  ...prev,
                  type: e.target.value as any
                }))}
                className="w-full p-2 border rounded-md"
                aria-label="Select treatment type"
              >
                <option value="prescription">Prescription</option>
                <option value="advice">Advice</option>
                <option value="todo">To-Do List</option>
                <option value="recipe">Energy Recipe</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Title</label>
              <Input
                value={newTreatment.title}
                onChange={(e) => setNewTreatment(prev => ({
                  ...prev,
                  title: e.target.value
                }))}
                placeholder="Treatment title"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              <Textarea
                value={newTreatment.description}
                onChange={(e) => setNewTreatment(prev => ({
                  ...prev,
                  description: e.target.value
                }))}
                placeholder="Treatment description"
              />
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Items</label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={addTreatmentItem}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Item
                </Button>
              </div>

              {newTreatment.content.items.map((item, index) => (
                <Card key={index}>
                  <CardContent className="p-4 space-y-4">
                    <Input
                      value={item.title}
                      onChange={(e) => updateTreatmentItem(index, 'title', e.target.value)}
                      placeholder="Item title"
                    />
                    <Textarea
                      value={item.description}
                      onChange={(e) => updateTreatmentItem(index, 'description', e.target.value)}
                      placeholder="Item description"
                    />
                    <div className="grid grid-cols-2 gap-4">
                      <Input
                        value={item.duration}
                        onChange={(e) => updateTreatmentItem(index, 'duration', e.target.value)}
                        placeholder="Duration (e.g., 2 weeks)"
                      />
                      <Input
                        value={item.frequency}
                        onChange={(e) => updateTreatmentItem(index, 'frequency', e.target.value)}
                        placeholder="Frequency (e.g., twice daily)"
                      />
                    </div>
                    <Textarea
                      value={item.notes}
                      onChange={(e) => updateTreatmentItem(index, 'notes', e.target.value)}
                      placeholder="Additional notes"
                    />
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => setTreatmentDialog(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={() => createTreatment.mutate()}
                disabled={createTreatment.isPending}
              >
                {createTreatment.isPending ? 'Creating...' : 'Create Treatment'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

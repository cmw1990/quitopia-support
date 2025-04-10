import React from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/supabase-client';
import { Consultation, Treatment } from '@/types/professionals';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/components/ui/use-toast';
import { format } from 'date-fns';
import {
  Calendar,
  Clock,
  FileText,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  Plus,
  Video,
  MessageCircle
} from 'lucide-react';

export const ClientDashboard = () => {
  const { toast } = useToast();

  // Fetch client's consultations
  const { data: consultations } = useQuery({
    queryKey: ['client-consultations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('professionals.consultations')
        .select('*, professional:professionals.professionals(id, full_name, title, profile_image)')
        .eq('client_id', supabase.auth.user()?.id)
        .order('scheduled_at', { ascending: true });

      if (error) throw error;
      return data as (Consultation & { professional: any })[];
    }
  });

  // Fetch client's treatments
  const { data: treatments } = useQuery({
    queryKey: ['client-treatments'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('professionals.treatments')
        .select('*, professional:professionals.professionals(id, full_name, title)')
        .eq('client_id', supabase.auth.user()?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as (Treatment & { professional: any })[];
    }
  });

  // Update treatment progress
  const updateProgress = useMutation({
    mutationFn: async ({ treatmentId, progress }: { treatmentId: string; progress: number }) => {
      const { data, error } = await supabase
        .from('professionals.treatments')
        .update({ progress })
        .eq('id', treatmentId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: 'Progress Updated',
        description: 'Your progress has been saved.',
      });
    }
  });

  // Add treatment to energy recipes
  const addToEnergyRecipes = useMutation({
    mutationFn: async (treatment: Treatment) => {
      const recipeData = {
        user_id: supabase.auth.user()?.id,
        title: treatment.title,
        description: treatment.description,
        type: 'professional',
        source: {
          professional_id: treatment.professional_id,
          treatment_id: treatment.id
        },
        steps: treatment.content.items.map(item => ({
          title: item.title,
          description: item.description,
          duration: item.duration,
          frequency: item.frequency
        })),
        tags: ['professional', 'prescribed'],
        created_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('energy_recipes')
        .insert([recipeData])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: 'Recipe Added',
        description: 'Treatment has been added to your energy recipes.',
      });
    }
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <Tabs defaultValue="upcoming">
        <TabsList>
          <TabsTrigger value="upcoming">Upcoming Consultations</TabsTrigger>
          <TabsTrigger value="treatments">Treatments & Recipes</TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="space-y-6">
          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card className="bg-primary/5">
              <CardContent className="p-6">
                <Button variant="ghost" className="w-full justify-start">
                  <Plus className="h-5 w-5 mr-2" />
                  Book New Consultation
                </Button>
              </CardContent>
            </Card>
            <Card className="bg-primary/5">
              <CardContent className="p-6">
                <Button variant="ghost" className="w-full justify-start">
                  <Video className="h-5 w-5 mr-2" />
                  Join Video Call
                </Button>
              </CardContent>
            </Card>
            <Card className="bg-primary/5">
              <CardContent className="p-6">
                <Button variant="ghost" className="w-full justify-start">
                  <MessageCircle className="h-5 w-5 mr-2" />
                  Message Professional
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Upcoming Consultations */}
          {consultations?.map((consultation) => (
            <Card key={consultation.id}>
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="flex-1">
                    <h3 className="font-semibold">
                      {consultation.type === 'initial' ? 'Initial Consultation' : 'Follow-up Session'}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      with Dr. {consultation.professional.full_name}
                    </p>
                    <div className="flex items-center text-sm text-muted-foreground mt-2">
                      <Calendar className="h-4 w-4 mr-2" />
                      {format(new Date(consultation.scheduled_at), 'PPP')}
                      <Clock className="h-4 w-4 mx-2" />
                      {format(new Date(consultation.scheduled_at), 'p')}
                    </div>
                  </div>
                  <Button>
                    Join {consultation.consultation_mode}
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
                        by Dr. {treatment.professional.full_name}
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      onClick={() => addToEnergyRecipes.mutate(treatment)}
                      disabled={addToEnergyRecipes.isPending}
                    >
                      Add to Energy Recipes
                    </Button>
                  </div>

                  <Progress value={treatment.progress} className="h-2" />
                  
                  <div className="space-y-4">
                    {treatment.content.items.map((item, index) => (
                      <div key={index} className="pl-4 border-l-2 border-primary">
                        <div className="flex items-start">
                          <div className="flex-1">
                            <h4 className="font-medium">{item.title}</h4>
                            <p className="text-sm">{item.description}</p>
                            {item.frequency && (
                              <p className="text-sm text-muted-foreground mt-1">
                                {item.frequency}
                                {item.duration && ` · ${item.duration}`}
                              </p>
                            )}
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              const newProgress = Math.min(100, treatment.progress + (100 / treatment.content.items.length));
                              updateProgress.mutate({
                                treatmentId: treatment.id,
                                progress: newProgress
                              });
                            }}
                          >
                            <CheckCircle className="h-5 w-5" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {treatment.type === 'recipe' && (
                    <div className="mt-4 pt-4 border-t">
                      <Button className="w-full">
                        View Full Recipe Details
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
};

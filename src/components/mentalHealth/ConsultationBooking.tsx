
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/supabase-client";
import { useAuth } from "@/components/AuthProvider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProfessionalConsultationDashboard } from "./professionals/ProfessionalConsultationDashboard";
import { ClientConsultationDashboard } from "./clients/ClientConsultationDashboard";

export function ConsultationBooking() {
  const { session } = useAuth();
  const { toast } = useToast();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedProfessional, setSelectedProfessional] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  const { data: experts } = useQuery({
    queryKey: ['mental-health-professionals'],
    queryFn: async () => {
      const { data } = await supabase
        .from('mental_health_professionals')
        .select('*')
        .eq('is_available', true)
        .eq('verification_status', 'approved');
      return data;
    }
  });

  const { data: userRole } = useQuery({
    queryKey: ['user-role', session?.user?.id],
    queryFn: async () => {
      const { data: expert } = await supabase
        .from('mental_health_professionals')
        .select('*')
        .eq('user_id', session?.user?.id)
        .single();

      return expert ? 'professional' : 'client';
    },
    enabled: !!session?.user?.id
  });

  return (
    <div className="space-y-6">
      <Tabs defaultValue={userRole === 'professional' ? 'dashboard' : 'book'} className="space-y-6">
        <TabsList>
          {userRole === 'professional' ? (
            <TabsTrigger value="dashboard">Professional Dashboard</TabsTrigger>
          ) : (
            <>
              <TabsTrigger value="dashboard">Client Dashboard</TabsTrigger>
              <TabsTrigger value="book">Book Consultation</TabsTrigger>
            </>
          )}
        </TabsList>

        {userRole === 'professional' ? (
          <TabsContent value="dashboard">
            <ProfessionalConsultationDashboard />
          </TabsContent>
        ) : (
          <>
            <TabsContent value="dashboard">
              <ClientConsultationDashboard />
            </TabsContent>
            <TabsContent value="book">
              <div className="grid gap-6 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Select Professional</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {experts?.map((professional) => (
                      <div
                        key={professional.id}
                        className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                          selectedProfessional === professional.id
                            ? 'bg-primary/10 border-primary'
                            : 'hover:bg-muted'
                        }`}
                        onClick={() => setSelectedProfessional(professional.id)}
                      >
                        <div className="flex items-center gap-4">
                          {professional.avatar_url && (
                            <img
                              src={professional.avatar_url}
                              alt={professional.full_name}
                              className="w-12 h-12 rounded-full object-cover"
                            />
                          )}
                          <div>
                            <h3 className="font-medium">{professional.full_name}</h3>
                            <p className="text-sm text-muted-foreground">{professional.title}</p>
                            <div className="flex flex-wrap gap-2 mt-2">
                              {professional.specialties.map((specialty, index) => (
                                <Badge key={index} variant="secondary">
                                  {specialty}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {selectedProfessional && (
                  <div className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Select Date</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <Calendar
                          mode="single"
                          selected={selectedDate}
                          onSelect={setSelectedDate}
                          className="rounded-md border"
                        />
                      </CardContent>
                    </Card>

                    {selectedDate && (
                      <Card>
                        <CardHeader>
                          <CardTitle>Available Times</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-3 gap-2">
                            {['09:00', '10:00', '11:00', '14:00', '15:00', '16:00'].map((time) => (
                              <Button
                                key={time}
                                variant={selectedTime === time ? "default" : "outline"}
                                onClick={() => setSelectedTime(time)}
                                className="w-full"
                              >
                                {time}
                              </Button>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {selectedTime && (
                      <Button className="w-full" size="lg">
                        Book Consultation
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </TabsContent>
          </>
        )}
      </Tabs>
    </div>
  );
}

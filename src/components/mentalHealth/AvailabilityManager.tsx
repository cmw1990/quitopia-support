
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/supabase-client";
import { useAuth } from "@/components/AuthProvider";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { format, parse } from "date-fns";

const DAYS_OF_WEEK = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday"
];

const TIME_SLOTS = Array.from({ length: 24 }, (_, i) => 
  format(new Date().setHours(i, 0), 'HH:mm')
);

export function AvailabilityManager() {
  const { session } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editingDay, setEditingDay] = useState<number | null>(null);

  const { data: availability } = useQuery({
    queryKey: ['professional-availability', session?.user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from('professional_availability')
        .select('*')
        .eq('professional_id', session?.user?.id)
        .order('day_of_week')
        .order('start_time');
      return data;
    },
    enabled: !!session?.user?.id
  });

  const updateAvailability = useMutation({
    mutationFn: async ({
      dayOfWeek,
      startTime,
      endTime,
      isAvailable
    }: {
      dayOfWeek: number;
      startTime: string;
      endTime: string;
      isAvailable: boolean;
    }) => {
      const { data, error } = await supabase
        .from('professional_availability')
        .upsert({
          professional_id: session?.user?.id,
          day_of_week: dayOfWeek,
          start_time: startTime,
          end_time: endTime,
          is_available: isAvailable
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['professional-availability'] });
      toast({
        title: "Success",
        description: "Availability updated successfully"
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update availability",
        variant: "destructive"
      });
      console.error('Availability error:', error);
    }
  });

  const getDayAvailability = (dayIndex: number) => {
    return availability?.filter(slot => slot.day_of_week === dayIndex) || [];
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Manage Your Availability</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {DAYS_OF_WEEK.map((day, index) => (
              <div key={day} className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium">{day}</h3>
                  <Button 
                    variant="outline"
                    onClick={() => setEditingDay(editingDay === index ? null : index)}
                  >
                    {editingDay === index ? "Done" : "Edit"}
                  </Button>
                </div>

                {editingDay === index ? (
                  <div className="grid grid-cols-4 gap-2">
                    {TIME_SLOTS.map((time) => {
                      const isAvailable = getDayAvailability(index).some(
                        slot => {
                          const slotStart = parse(slot.start_time, 'HH:mm:ss', new Date());
                          const slotEnd = parse(slot.end_time, 'HH:mm:ss', new Date());
                          const currentTime = parse(time, 'HH:mm', new Date());
                          return currentTime >= slotStart && currentTime < slotEnd;
                        }
                      );

                      return (
                        <div
                          key={time}
                          className="flex items-center justify-between p-2 rounded border"
                        >
                          <span className="text-sm">{time}</span>
                          <Switch
                            checked={isAvailable}
                            onCheckedChange={(checked) => {
                              const nextHour = format(
                                parse(time, 'HH:mm', new Date()).setHours(
                                  parse(time, 'HH:mm', new Date()).getHours() + 1
                                ),
                                'HH:mm'
                              );
                              
                              updateAvailability.mutate({
                                dayOfWeek: index,
                                startTime: time,
                                endTime: nextHour,
                                isAvailable: checked
                              });
                            }}
                          />
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {getDayAvailability(index).map((slot) => (
                      <Badge key={`${slot.start_time}-${slot.end_time}`}>
                        {format(parse(slot.start_time, 'HH:mm:ss', new Date()), 'h:mm a')} -
                        {format(parse(slot.end_time, 'HH:mm:ss', new Date()), 'h:mm a')}
                      </Badge>
                    ))}
                    {getDayAvailability(index).length === 0 && (
                      <p className="text-sm text-muted-foreground">No availability set</p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/supabase-client";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Phone, Clock, AlertTriangle } from "lucide-react";

export function EmergencyResources() {
  const { data: resources } = useQuery({
    queryKey: ['emergency-resources'],
    queryFn: async () => {
      const { data } = await supabase
        .from('emergency_resources')
        .select('*')
        .eq('is_active', true)
        .order('priority', { ascending: false });
      return data;
    }
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <AlertTriangle className="h-6 w-6 text-red-500" />
        <h2 className="text-2xl font-bold">Emergency Resources</h2>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {resources?.map((resource) => (
          <Card key={resource.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <CardTitle>{resource.name}</CardTitle>
                <Badge variant={resource.priority > 1 ? "destructive" : "secondary"}>
                  {resource.resource_type}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm mb-4">{resource.description}</p>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  <a 
                    href={`tel:${resource.contact_info}`}
                    className="text-primary hover:underline"
                  >
                    {resource.contact_info}
                  </a>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>{resource.availability}</span>
                </div>
              </div>
              <Button 
                className="w-full mt-4"
                variant="destructive"
                onClick={() => window.location.href = `tel:${resource.contact_info}`}
              >
                Call Now
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-muted">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <AlertTriangle className="h-12 w-12 text-red-500" />
            <div>
              <h3 className="text-lg font-semibold mb-2">Need Immediate Help?</h3>
              <p className="text-sm text-muted-foreground">
                If you're experiencing a mental health emergency or having thoughts of self-harm,
                please call emergency services immediately or reach out to one of the crisis hotlines
                listed above. Help is available 24/7.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

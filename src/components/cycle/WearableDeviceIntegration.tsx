
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/integrations/supabase/supabase-client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Watch, RefreshCw } from "lucide-react";
import type { UserWearableDevice } from "@/types/cycle";

export const WearableDeviceIntegration = () => {
  const { session } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: wearableDevices } = useQuery({
    queryKey: ['user_wearable_devices'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_wearable_devices')
        .select('*')
        .eq('is_active', true);

      if (error) throw error;
      return data as UserWearableDevice[];
    },
    enabled: !!session?.user?.id,
  });

  const syncDevice = useMutation({
    mutationFn: async (deviceId: string) => {
      const { data, error } = await supabase
        .from('user_wearable_devices')
        .update({ last_synced_at: new Date().toISOString() })
        .eq('id', deviceId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user_wearable_devices'] });
      toast({
        title: "Device synced",
        description: "Your wearable device data has been updated",
      });
    },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Watch className="h-5 w-5 text-primary" />
          Connected Devices
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {wearableDevices?.map((device) => (
            <div
              key={device.id}
              className="flex items-center justify-between p-4 bg-muted rounded-lg"
            >
              <div>
                <h3 className="font-semibold">{device.device_type}</h3>
                <p className="text-sm text-muted-foreground">
                  Last synced: {device.last_synced_at ? new Date(device.last_synced_at).toLocaleString() : 'Never'}
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => syncDevice.mutate(device.id)}
                disabled={syncDevice.isPending}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Sync Now
              </Button>
            </div>
          ))}
          {!wearableDevices?.length && (
            <div className="text-center text-muted-foreground py-8">
              No wearable devices connected
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

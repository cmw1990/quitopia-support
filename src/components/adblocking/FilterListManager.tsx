
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/supabase-client";
import { useAuth } from "@/components/AuthProvider";
import { ListFilter, Shield } from "lucide-react";

export function FilterListManager() {
  const { session } = useAuth();
  const { toast } = useToast();

  const { data: filterLists, refetch } = useQuery({
    queryKey: ['ad-blocking-filter-lists', session?.user?.id],
    queryFn: async () => {
      const { data: lists, error } = await supabase
        .from('ad_blocking_filter_lists')
        .select('*')
        .order('category');

      if (error) throw error;
      return lists;
    },
    enabled: !!session?.user?.id
  });

  const { data: userSubscriptions } = useQuery({
    queryKey: ['user-filter-subscriptions', session?.user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_filter_subscriptions')
        .select('*')
        .eq('user_id', session?.user?.id);

      if (error) throw error;
      return data;
    },
    enabled: !!session?.user?.id
  });

  const { data: userOptions } = useQuery({
    queryKey: ['ad-blocking-options', session?.user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ad_blocking_options')
        .select('*')
        .eq('user_id', session?.user?.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data;
    },
    enabled: !!session?.user?.id
  });

  const toggleFilterList = async (listId: string, currentlyEnabled: boolean) => {
    try {
      if (!session?.user?.id) return;

      if (currentlyEnabled) {
        // Remove subscription
        const { error } = await supabase
          .from('user_filter_subscriptions')
          .delete()
          .eq('user_id', session.user.id)
          .eq('filter_list_id', listId);

        if (error) throw error;
      } else {
        // Add subscription
        const { error } = await supabase
          .from('user_filter_subscriptions')
          .insert({
            user_id: session.user.id,
            filter_list_id: listId,
            is_enabled: true
          });

        if (error) throw error;
      }

      toast({
        title: "Filter list updated",
        description: currentlyEnabled ? "Filter list removed" : "Filter list added"
      });

      refetch();
    } catch (error) {
      console.error('Error toggling filter list:', error);
      toast({
        title: "Error updating filter list",
        description: "Please try again later",
        variant: "destructive"
      });
    }
  };

  const isSubscribed = (listId: string) => {
    return userSubscriptions?.some(sub => sub.filter_list_id === listId && sub.is_enabled);
  };

  const isPremiumList = (list: any) => {
    return list.is_premium && !userOptions?.is_premium;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ListFilter className="h-5 w-5" />
          Filter Lists
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {filterLists?.reduce((acc: JSX.Element[], list) => {
            if (!acc.find(el => el.key === list.category)) {
              const categoryLists = filterLists.filter(l => l.category === list.category);
              acc.push(
                <div key={list.category} className="space-y-4">
                  <h3 className="font-semibold text-lg capitalize">{list.category}</h3>
                  <div className="space-y-4">
                    {categoryLists.map(categoryList => (
                      <div key={categoryList.id} className="flex items-center justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Label className="font-medium">{categoryList.name}</Label>
                            {categoryList.is_premium && (
                              <Badge variant="secondary" className="text-xs">
                                Premium
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">{categoryList.description}</p>
                          <div className="flex gap-2">
                            <span className="text-xs text-muted-foreground">
                              Rules: {categoryList.rules_count}
                            </span>
                            {categoryList.last_updated && (
                              <span className="text-xs text-muted-foreground">
                                Updated: {new Date(categoryList.last_updated).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        </div>
                        <Switch
                          checked={isSubscribed(categoryList.id)}
                          onCheckedChange={(checked) => toggleFilterList(categoryList.id, !checked)}
                          disabled={isPremiumList(categoryList)}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              );
            }
            return acc;
          }, [])}

          {!userOptions?.is_premium && (
            <div className="p-4 border rounded-lg bg-muted/50">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="h-5 w-5 text-primary" />
                <h3 className="font-semibold">Upgrade to Premium</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Get access to premium filter lists and advanced blocking features
              </p>
              <Button variant="outline" className="w-full">
                View Premium Features
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

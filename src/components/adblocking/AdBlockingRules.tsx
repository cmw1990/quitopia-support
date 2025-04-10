
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Plus, Trash, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/supabase-client";
import { useAuth } from "@/components/AuthProvider";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function AdBlockingRules() {
  const { session } = useAuth();
  const { toast } = useToast();
  const [newRule, setNewRule] = useState("");
  const [ruleType, setRuleType] = useState("network");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState(0);

  const { data: rules, refetch } = useQuery({
    queryKey: ['ad-blocking-rules', session?.user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ad_blocking_rules')
        .select('*')
        .eq('user_id', session?.user?.id)
        .order('priority', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!session?.user?.id
  });

  const addRule = async () => {
    if (!session?.user?.id || !newRule) return;

    try {
      const { error } = await supabase
        .from('ad_blocking_rules')
        .insert({
          user_id: session.user.id,
          rule_type: ruleType,
          pattern: newRule,
          description,
          priority,
          is_active: true
        });

      if (error) throw error;

      toast({
        title: "Rule added",
        description: "Your new blocking rule has been added successfully."
      });

      setNewRule("");
      setDescription("");
      setPriority(0);
      refetch();
    } catch (error) {
      console.error('Error adding rule:', error);
      toast({
        title: "Error adding rule",
        description: "Please try again later",
        variant: "destructive"
      });
    }
  };

  const toggleRule = async (id: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from('ad_blocking_rules')
        .update({ is_active: !isActive })
        .eq('id', id);

      if (error) throw error;
      refetch();
    } catch (error) {
      console.error('Error toggling rule:', error);
      toast({
        title: "Error updating rule",
        description: "Please try again later",
        variant: "destructive"
      });
    }
  };

  const deleteRule = async (id: string) => {
    try {
      const { error } = await supabase
        .from('ad_blocking_rules')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Rule deleted",
        description: "The blocking rule has been removed."
      });

      refetch();
    } catch (error) {
      console.error('Error deleting rule:', error);
      toast({
        title: "Error removing rule",
        description: "Please try again later",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="grid gap-4">
          <div>
            <Label>Rule Pattern</Label>
            <Input
              placeholder="Enter blocking rule pattern (e.g., *ads*.js)"
              value={newRule}
              onChange={(e) => setNewRule(e.target.value)}
            />
          </div>
          
          <div>
            <Label>Description</Label>
            <Input
              placeholder="Rule description (optional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Rule Type</Label>
              <Select value={ruleType} onValueChange={setRuleType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="network">Network</SelectItem>
                  <SelectItem value="cosmetic">Cosmetic</SelectItem>
                  <SelectItem value="script">Script</SelectItem>
                  <SelectItem value="element">Element</SelectItem>
                  <SelectItem value="custom">Custom</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Priority</Label>
              <Input
                type="number"
                min="0"
                max="100"
                value={priority}
                onChange={(e) => setPriority(parseInt(e.target.value))}
              />
            </div>
          </div>
        </div>

        <Button onClick={addRule} className="w-full">
          <Plus className="h-4 w-4 mr-2" />
          Add Rule
        </Button>
      </div>

      <div className="space-y-4">
        {rules?.map((rule) => (
          <div
            key={rule.id}
            className="flex items-center justify-between p-4 border rounded-lg"
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Switch
                  checked={rule.is_active}
                  onCheckedChange={() => toggleRule(rule.id, rule.is_active)}
                />
                <Label className="font-medium">{rule.pattern}</Label>
                {rule.priority > 50 && (
                  <AlertCircle className="h-4 w-4 text-yellow-500" title="High Priority Rule" />
                )}
              </div>
              <div className="text-sm text-muted-foreground">
                {rule.description && <p>{rule.description}</p>}
                <div className="flex gap-2 mt-1">
                  <span className="px-2 py-0.5 bg-primary/10 rounded-full text-xs">
                    {rule.rule_type}
                  </span>
                  <span className="px-2 py-0.5 bg-primary/10 rounded-full text-xs">
                    Priority: {rule.priority}
                  </span>
                  {rule.hits_count > 0 && (
                    <span className="px-2 py-0.5 bg-primary/10 rounded-full text-xs">
                      Hits: {rule.hits_count}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => deleteRule(rule.id)}
            >
              <Trash className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}

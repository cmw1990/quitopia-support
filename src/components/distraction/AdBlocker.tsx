import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Switch } from "../ui/switch";
import { Label } from "../ui/label";
import { useToast } from "../../hooks/use-toast";
import { supabase } from "../../integrations/supabase/client";
import { useAuth } from "../AuthProvider";
import { Ban, Plus, Trash, Loader2, AlertCircle, ShieldCheck } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Checkbox } from "../ui/checkbox";

// Define a more flexible AdRule type
interface AdRule {
  id: string;
  user_id: string;
  block_type: string;
  target: string;
  is_active: boolean;
  pattern_data: {
    is_ad_rule?: boolean;
    type?: string;
    is_global?: boolean;
    [key: string]: any;
  };
  created_at?: string;
  updated_at?: string;
  [key: string]: any;
}

export const AdBlocker = () => {
  const { session } = useAuth();
  const { toast } = useToast();
  const [adRules, setAdRules] = useState<AdRule[]>([]);
  const [newRule, setNewRule] = useState("");
  const [ruleType, setRuleType] = useState("domain");
  const [isGlobal, setIsGlobal] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [debug, setDebug] = useState<string | null>(null);

  useEffect(() => {
    loadAdRules();
  }, [session?.user?.id]);

  const loadAdRules = async () => {
    if (!session?.user?.id) {
      console.log('No user session found, cannot load ad blocking rules');
      setError('Please log in to view your ad blocking rules');
      setIsLoading(false);
      return;
    }
    
    setIsLoading(true);
    setError(null);
    setDebug(null);

    try {
      console.log('Loading ad blocking rules for user:', session.user.id);
      const { data, error } = await supabase
        .from('distraction_blocking')
        .select('*')
        .eq('user_id', session.user.id)
        .eq('block_type', 'website')
        .contains('pattern_data', { is_ad_rule: true })
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading ad blocking rules:', error);
        setError('Failed to load your ad blocking rules. Please try again.');
        setDebug(`Error: ${error.code}, ${error.message}`);
        toast({
          title: "Error loading ad blocking rules",
          description: "Please refresh the page or try again later",
          variant: "destructive"
        });
        return;
      }

      console.log('Ad blocking rules loaded successfully:', data?.length || 0, 'items');
      setAdRules(data as any[] || []);
    } catch (err) {
      console.error('Error loading ad blocking rules:', err);
      setError('An unexpected error occurred. Please try again.');
      toast({
        title: "Error loading ad blocking rules",
        description: "Please refresh the page or try again later",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const addAdRule = async () => {
    if (!session?.user?.id) {
      toast({
        title: "Authentication required",
        description: "Please log in to add ad blocking rules",
        variant: "destructive"
      });
      return;
    }
    
    if (!newRule.trim()) {
      toast({
        title: "Rule pattern required",
        description: "Please enter a pattern to block",
        variant: "destructive"
      });
      return;
    }

    setIsAdding(true);
    setError(null);
    setDebug(null);

    try {
      console.log('Adding ad blocking rule:', newRule, 'type:', ruleType);
      const { data, error } = await supabase
        .from('distraction_blocking')
        .insert({
          user_id: session.user.id,
          block_type: 'website', // Using website as the block_type
          target: newRule.trim(),
          is_active: true,
          pattern_data: {
            is_ad_rule: true, // Mark as an ad rule
            type: ruleType,
            is_global: isGlobal
          }
        })
        .select();

      if (error) {
        console.error('Error adding ad blocking rule:', error);
        setError('Failed to add ad blocking rule. Please try again.');
        setDebug(`Error: ${error.code}, ${error.message}`);
        toast({
          title: "Error adding ad blocking rule",
          description: error.message || "Please try again later",
          variant: "destructive"
        });
        return;
      }

      console.log('Ad blocking rule added successfully:', data);
      toast({
        title: "Ad blocking rule added",
        description: `${newRule} has been added to your block list`
      });

      setNewRule("");
      await loadAdRules();
    } catch (err) {
      console.error('Error adding ad blocking rule:', err);
      setError('An unexpected error occurred. Please try again.');
      if (err instanceof Error) {
        setDebug(`Error: ${err.name}, ${err.message}`);
      }
      toast({
        title: "Error adding ad blocking rule",
        description: "Please try again later",
        variant: "destructive"
      });
    } finally {
      setIsAdding(false);
    }
  };

  const toggleAdRule = async (id: string, isActive: boolean) => {
    try {
      console.log('Toggling ad blocking rule active status:', id, 'from', isActive, 'to', !isActive);
      const { error } = await supabase
        .from('distraction_blocking')
        .update({ is_active: !isActive })
        .eq('id', id);

      if (error) {
        console.error('Error toggling ad blocking rule:', error);
        toast({
          title: "Error updating ad blocking rule",
          description: error.message || "Please try again later",
          variant: "destructive"
        });
        return;
      }

      // Update local state to reflect the change immediately
      setAdRules(adRules.map(rule => 
        rule.id === id ? { ...rule, is_active: !isActive } : rule
      ));
      
      toast({
        title: isActive ? "Ad blocking rule disabled" : "Ad blocking rule enabled",
        description: `Rule has been ${isActive ? 'disabled' : 'enabled'} successfully`
      });
    } catch (err) {
      console.error('Error toggling ad blocking rule:', err);
      toast({
        title: "Error updating ad blocking rule",
        description: "Please try again later",
        variant: "destructive"
      });
    }
  };

  const deleteAdRule = async (id: string) => {
    try {
      console.log('Deleting ad blocking rule:', id);
      const { error } = await supabase
        .from('distraction_blocking')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting ad blocking rule:', error);
        toast({
          title: "Error removing ad blocking rule",
          description: error.message || "Please try again later",
          variant: "destructive"
        });
        return;
      }

      // Update local state to reflect the deletion immediately
      setAdRules(adRules.filter(rule => rule.id !== id));
      
      toast({
        title: "Ad blocking rule removed",
        description: "Rule has been removed from your block list"
      });
    } catch (err) {
      console.error('Error deleting ad blocking rule:', err);
      toast({
        title: "Error removing ad blocking rule",
        description: "Please try again later",
        variant: "destructive"
      });
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      addAdRule();
    }
  };

  // Function to format the rule type for display
  const formatRuleType = (type: string): string => {
    switch (type) {
      case "domain":
        return "Domain";
      case "element":
        return "Element";
      case "network":
        return "Network Request";
      case "keyword":
        return "Keyword";
      default:
        return type;
    }
  };

  // Extract rule type from pattern_data if available
  const getRuleType = (rule: AdRule): string => {
    if (rule.pattern_data && rule.pattern_data.type) {
      return formatRuleType(rule.pattern_data.type);
    }
    return "Domain";
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Ban className="h-5 w-5" />
          Ad Blocker
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="rule-input">Ad Blocking Rule</Label>
            <Input
              id="rule-input"
              placeholder="Enter pattern to block (e.g., ads.example.com)"
              value={newRule}
              onChange={(e) => setNewRule(e.target.value)}
              onKeyDown={handleKeyPress}
              disabled={isAdding}
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="rule-type">Rule Type</Label>
              <Select
                value={ruleType}
                onValueChange={setRuleType}
                disabled={isAdding}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select rule type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="domain">Domain</SelectItem>
                  <SelectItem value="element">HTML Element</SelectItem>
                  <SelectItem value="network">Network Request</SelectItem>
                  <SelectItem value="keyword">Keyword</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center gap-2 mt-7">
              <Checkbox
                id="is-global"
                checked={isGlobal}
                onCheckedChange={(checked) => setIsGlobal(checked === true)}
                disabled={isAdding}
              />
              <Label htmlFor="is-global">Apply to all websites</Label>
            </div>
          </div>
          
          <Button 
            onClick={addAdRule} 
            disabled={isAdding || !newRule.trim()}
            className="w-full"
          >
            {isAdding ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Plus className="h-4 w-4 mr-2" />
            )}
            Add Blocking Rule
          </Button>
        </div>

        {error && (
          <div className="text-sm text-red-500 p-2 bg-red-50 rounded-md flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            {error}
          </div>
        )}

        {debug && import.meta.env.DEV && (
          <div className="text-xs text-gray-500 p-2 bg-gray-100 rounded-md font-mono">
            {debug}
          </div>
        )}

        <div className="space-y-4">
          {isLoading ? (
            <div className="flex justify-center py-4">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : adRules.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground">
              <ShieldCheck className="h-12 w-12 mx-auto mb-2 text-muted-foreground/50" />
              <p>No ad blocking rules configured.</p>
              <p className="text-sm">Add rules above to block advertisements.</p>
            </div>
          ) : (
            <div>
              <h3 className="text-sm font-medium mb-2">Your Ad Blocking Rules</h3>
              <div className="space-y-2">
                {adRules.map((rule) => (
                  <div key={rule.id} className="flex items-center justify-between p-3 bg-muted rounded-md">
                    <div className="flex items-center gap-3 overflow-hidden">
                      <Switch
                        checked={rule.is_active}
                        onCheckedChange={() => toggleAdRule(rule.id, rule.is_active)}
                      />
                      <div className="overflow-hidden">
                        <p className={`truncate ${!rule.is_active ? 'line-through text-muted-foreground' : ''}`}>
                          {rule.target}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {getRuleType(rule)} • {rule.pattern_data?.is_global ? 'Global' : 'Specific sites'}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteAdRule(rule.id)}
                    >
                      <Trash className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}; 
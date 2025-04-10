import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/supabase-client";
import { useAuth } from "@/components/AuthProvider";

interface BlockingConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  action: "block" | "allow";
}

type SmartBlockingSettings = {
  strictMode: boolean;
  allowedBreakTime: number;
  productivityThreshold: number;
  adaptiveMode?: boolean;
  learningEnabled?: boolean;
  autoAdjust?: boolean;
  focusTimeBlocking?: boolean;
  aiSuggestions?: boolean;
  customPatterns?: boolean;
  timeBoxing?: boolean;
};

export function BlockingConfirmDialog({
  open,
  onOpenChange,
  action,
}: BlockingConfirmDialogProps) {
  const { toast } = useToast();
  const { session } = useAuth();

  const handleConfirm = async () => {
    if (!session?.user?.id) return;

    try {
      // First, get the current smart blocking settings
      const { data: smartSettings } = await supabase
        .from('distraction_blocking')
        .select('pattern_data')
        .eq('user_id', session.user.id)
        .eq('block_type', 'website')
        .eq('target', 'smart-rules')
        .maybeSingle();

      const settings = smartSettings?.pattern_data as SmartBlockingSettings;
      const isStrictMode = settings?.strictMode ?? false;

      // Update all blocking rules
      const { error } = await supabase
        .from('distraction_blocking')
        .update({ 
          is_active: action === 'block',
          // If in strict mode and blocking, set a minimum duration
          break_duration: action === 'block' && isStrictMode ? 
            Math.max(settings?.allowedBreakTime || 5, 5) : 5
        })
        .eq('user_id', session.user.id);

      if (error) throw error;

      // Log the action for productivity metrics
      if (action === 'block') {
        const { error: logError } = await supabase
          .from('productivity_metrics')
          .upsert({
            user_id: session.user.id,
            date: new Date().toISOString().split('T')[0],
            focus_sessions: 1,
            distractions_blocked: 0,
            productivity_score: settings?.productivityThreshold || 70
          });

        if (logError) throw logError;
      }

      toast({
        title: `${action === 'block' ? 'Blocked' : 'Allowed'} all distractions`,
        description: `Successfully ${action === 'block' ? 'blocked' : 'allowed'} all distractions.${
          action === 'block' && isStrictMode ? ' Strict mode is enabled.' : ''
        }`,
      });
    } catch (error) {
      console.error('Error updating blocking rules:', error);
      toast({
        title: "Error updating blocking rules",
        description: "Please try again later.",
        variant: "destructive",
      });
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {action === 'block' ? 'Block All Distractions?' : 'Allow All Distractions?'}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {action === 'block'
              ? "This will activate all your blocking rules. You won't be able to access blocked content until you allow it again."
              : "This will temporarily disable all your blocking rules. You'll have full access to all content."}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleConfirm}>
            {action === 'block' ? 'Block All' : 'Allow All'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
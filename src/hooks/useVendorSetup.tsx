
import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/integrations/supabase/supabase-client"
import { useAuth } from "@/components/AuthProvider"

export function useVendorSetup() {
  const [showSetup, setShowSetup] = useState(false);
  const [isSetupComplete, setIsSetupComplete] = useState(true);
  const { session } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    async function checkVendorSetup() {
      if (!session?.user?.id) return;

      const { data: vendor } = await supabase
        .from('vendors')
        .select('rules_accepted, business_registration, tax_id, return_policy, shipping_policy')
        .eq('claimed_by', session.user.id)
        .single();

      if (vendor && (!vendor.rules_accepted || !vendor.business_registration || !vendor.tax_id || !vendor.return_policy || !vendor.shipping_policy)) {
        setIsSetupComplete(false);
        setShowSetup(true);
      }
    }

    checkVendorSetup();
  }, [session?.user?.id]);

  const setupModal = showSetup ? (
    <Dialog open={showSetup} onOpenChange={setShowSetup}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Complete Vendor Setup</DialogTitle>
          <DialogDescription>
            Before you can start selling, you need to complete your vendor profile and accept our terms and conditions.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <p className="text-sm text-muted-foreground">
            Please visit the Settings tab to:
          </p>
          <ul className="list-disc pl-6 mt-2 text-sm text-muted-foreground">
            <li>Add your business registration</li>
            <li>Provide your tax ID</li>
            <li>Set up return policy</li>
            <li>Set up shipping policy</li>
            <li>Accept vendor rules and terms</li>
          </ul>
        </div>

        <DialogFooter>
          <Button 
            onClick={() => setShowSetup(false)}
          >
            Go to Settings
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ) : null;

  return { isSetupComplete, setupModal };
}

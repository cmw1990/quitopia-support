import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { SUPABASE_URL, SUPABASE_KEY } from "@/integrations/supabase/db-client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Loader2, ShieldCheck } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";

interface InsuranceProvider {
  id: string;
  name: string;
  verification_method: string;
}

interface InsuranceEligibilityCheck {
  id: string;
  client_insurance_id: string;
  professional_id: string;
  status: 'pending' | 'verified' | 'failed';
  error_message?: string;
  coverage_details?: string;
  copay_amount?: number;
  coinsurance_percentage?: number;
  deductible_remaining?: number;
  created_at: string;
  updated_at: string;
}

export const InsuranceVerification = ({ 
  sessionId,
  clientId,
  professionalId 
}: { 
  sessionId: string;
  clientId: string;
  professionalId: string;
}) => {
  const { toast } = useToast();
  const { session } = useAuth();
  const [selectedInsurance, setSelectedInsurance] = useState<string>("");
  const [isVerifying, setIsVerifying] = useState(false);

  // Fetch client's insurance information
  const { data: insuranceOptions, isLoading: isLoadingInsurance } = useQuery({
    queryKey: ['client-insurance', clientId],
    queryFn: async () => {
      const response = await fetch(
        `${SUPABASE_URL}/rest/v1/client_insurance?select=id,insurance_providers(id,name,verification_method)&client_id=eq.${clientId}`,
        {
          headers: {
            'apikey': SUPABASE_KEY,
            'Authorization': `Bearer ${session?.access_token}`
          }
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || response.statusText);
      }

      return await response.json();
    },
    enabled: !!session?.access_token
  });

  // Fetch verification status if exists
  const { data: verificationStatus, isLoading: isLoadingVerification } = useQuery({
    queryKey: ['insurance-verification', selectedInsurance],
    enabled: !!selectedInsurance && !!session?.access_token,
    queryFn: async () => {
      const response = await fetch(
        `${SUPABASE_URL}/rest/v1/insurance_eligibility_checks?client_insurance_id=eq.${selectedInsurance}&professional_id=eq.${professionalId}&order=created_at.desc&limit=1`,
        {
          headers: {
            'apikey': SUPABASE_KEY,
            'Authorization': `Bearer ${session?.access_token}`
          }
        }
      );

      if (!response.ok) {
        const error = await response.json();
        if (error.code === 'PGRST116') return null; // No rows returned
        throw new Error(error.message || response.statusText);
      }

      const data = await response.json();
      return data[0] as InsuranceEligibilityCheck;
    }
  });

  const verifyInsurance = async () => {
    try {
      setIsVerifying(true);
      
      const response = await fetch(
        `${SUPABASE_URL}/rest/v1/rpc/check_insurance_eligibility`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': SUPABASE_KEY,
            'Authorization': `Bearer ${session?.access_token}`
          },
          body: JSON.stringify({
            _insurance_id: selectedInsurance,
            _professional_id: professionalId,
            _service_type: 'consultation'
          })
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || response.statusText);
      }

      toast({
        title: "Verification initiated",
        description: "Insurance verification is in progress.",
      });

    } catch (error) {
      console.error('Error verifying insurance:', error);
      toast({
        title: "Verification failed",
        description: "Could not verify insurance. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const renderVerificationStatus = () => {
    if (!verificationStatus) return null;

    const statusColors = {
      pending: "bg-yellow-100 text-yellow-800",
      verified: "bg-green-100 text-green-800",
      failed: "bg-red-100 text-red-800"
    };

    return (
      <div className={`mt-4 p-4 rounded-lg ${statusColors[verificationStatus.status]}`}>
        <div className="font-medium">Status: {verificationStatus.status}</div>
        {verificationStatus.error_message && (
          <div className="mt-2 text-sm">{verificationStatus.error_message}</div>
        )}
        {verificationStatus.coverage_details && (
          <div className="mt-2 space-y-1 text-sm">
            <div>Copay: ${verificationStatus.copay_amount || 0}</div>
            <div>Coinsurance: {verificationStatus.coinsurance_percentage || 0}%</div>
            <div>Remaining Deductible: ${verificationStatus.deductible_remaining || 0}</div>
          </div>
        )}
      </div>
    );
  };

  if (isLoadingInsurance) {
    return <div>Loading insurance information...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShieldCheck className="h-5 w-5" />
          Insurance Verification
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Select Insurance</label>
          <Select
            value={selectedInsurance}
            onValueChange={setSelectedInsurance}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select insurance provider" />
            </SelectTrigger>
            <SelectContent>
              {insuranceOptions?.map((option: any) => (
                <SelectItem key={option.id} value={option.id}>
                  {option.insurance_providers.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {selectedInsurance && (
          <Button
            onClick={verifyInsurance}
            disabled={isVerifying}
            className="w-full"
          >
            {isVerifying ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Verifying...
              </>
            ) : (
              'Verify Insurance'
            )}
          </Button>
        )}

        {renderVerificationStatus()}
      </CardContent>
    </Card>
  );
};

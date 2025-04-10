
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/supabase-client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { FileText, Loader2 } from "lucide-react";
import type { InsuranceClaimSubmission } from "@/types/insurance";

export const ClaimSubmission = ({
  sessionId,
  clientInsuranceId,
  professionalId
}: {
  sessionId: string;
  clientInsuranceId: string;
  professionalId: string;
}) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [diagnosisCodes, setDiagnosisCodes] = useState<string[]>([]);
  const [procedureCodes, setProcedureCodes] = useState<string[]>([]);

  // Fetch existing claim if any
  const { data: existingClaim, isLoading: isLoadingClaim } = useQuery({
    queryKey: ['insurance-claim', sessionId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('insurance_claims')
        .select(`
          *,
          insurance_claim_submissions (*)
        `)
        .eq('session_id', sessionId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data;
    }
  });

  const submitClaim = async () => {
    try {
      setIsSubmitting(true);

      // First create the claim
      const { data: claim, error: claimError } = await supabase
        .from('insurance_claims')
        .insert({
          service_date: new Date().toISOString(),
          client_insurance_id: clientInsuranceId,
          professional_id: professionalId,
          diagnosis_codes: diagnosisCodes,
          procedure_codes: procedureCodes,
          billed_amount: 100, // This should be dynamic based on session cost
          status: 'pending',
          session_id: sessionId
        })
        .select()
        .single();

      if (claimError) throw claimError;

      // Then create the claim submission
      const { data: submission, error: submissionError } = await supabase
        .from('insurance_claim_submissions')
        .insert({
          claim_id: claim.id,
          submission_method: 'electronic',
          status: 'pending',
          submission_date: new Date().toISOString()
        })
        .select()
        .single();

      if (submissionError) throw submissionError;

      toast({
        title: "Claim submitted",
        description: "Your insurance claim has been submitted successfully.",
      });

    } catch (error) {
      console.error('Error submitting claim:', error);
      toast({
        title: "Submission failed",
        description: "Could not submit insurance claim. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderClaimStatus = () => {
    if (!existingClaim?.insurance_claim_submissions?.[0]) return null;

    const submission = existingClaim.insurance_claim_submissions[0];
    const statusColors = {
      pending: "bg-yellow-100 text-yellow-800",
      submitted: "bg-blue-100 text-blue-800",
      accepted: "bg-green-100 text-green-800",
      rejected: "bg-red-100 text-red-800",
      paid: "bg-green-100 text-green-800"
    };

    return (
      <div className={`mt-4 p-4 rounded-lg ${statusColors[submission.status]}`}>
        <div className="font-medium">Claim Status: {submission.status}</div>
        {submission.payer_claim_id && (
          <div className="mt-2 text-sm">Payer Claim ID: {submission.payer_claim_id}</div>
        )}
        {submission.error_message && (
          <div className="mt-2 text-sm text-red-600">{submission.error_message}</div>
        )}
      </div>
    );
  };

  if (isLoadingClaim) {
    return <div>Loading claim information...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Insurance Claim Submission
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!existingClaim ? (
          <>
            <div className="space-y-2">
              <label className="text-sm font-medium">Diagnosis Codes</label>
              <Input
                placeholder="Enter diagnosis codes (comma-separated)"
                onChange={(e) => setDiagnosisCodes(e.target.value.split(',').map(code => code.trim()))}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Procedure Codes</label>
              <Input
                placeholder="Enter procedure codes (comma-separated)"
                onChange={(e) => setProcedureCodes(e.target.value.split(',').map(code => code.trim()))}
              />
            </div>

            <Button
              onClick={submitClaim}
              disabled={isSubmitting}
              className="w-full"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                'Submit Claim'
              )}
            </Button>
          </>
        ) : (
          renderClaimStatus()
        )}
      </CardContent>
    </Card>
  );
};

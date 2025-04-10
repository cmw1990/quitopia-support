import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { SUPABASE_URL, SUPABASE_KEY } from "@/integrations/supabase/db-client";
import { Loader2 } from "lucide-react";

export function VerifyCoverage() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isVerifying, setIsVerifying] = useState(false);
  const [policyNumber, setPolicyNumber] = useState("");
  const [subscriberId, setSubscriberId] = useState("");

  const handleVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsVerifying(true);

    try {
      // Get user from stored session
      const storedSession = localStorage.getItem('supabase.auth.token');
      const session = storedSession ? JSON.parse(storedSession) : null;
      
      if (!session || !session.access_token) {
        toast({
          title: "Authentication required",
          description: "Please log in to verify coverage",
          variant: "destructive",
        });
        return;
      }

      // Get user info
      const userResponse = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'apikey': SUPABASE_KEY
        }
      });

      if (!userResponse.ok) {
        throw new Error('Failed to get user info');
      }

      const user = await userResponse.json();

      // Submit verification request
      const response = await fetch(`${SUPABASE_URL}/rest/v1/insurance_eligibility_checks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${session.access_token}`,
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify({
          policy_number: policyNumber,
          subscriber_id: subscriberId,
          status: "pending",
          verification_date: new Date().toISOString(),
          user_id: user.id
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || response.statusText);
      }

      toast({
        title: "Verification initiated",
        description: "Your coverage verification request has been submitted",
      });

      navigate("/insurance");
    } catch (error) {
      console.error("Error verifying coverage:", error);
      toast({
        title: "Error verifying coverage",
        description: "There was an error processing your request. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Verify Insurance Coverage</CardTitle>
          <CardDescription>
            Enter your insurance information to verify your coverage
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleVerification} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="policyNumber">Policy Number</Label>
              <Input
                id="policyNumber"
                value={policyNumber}
                onChange={(e) => setPolicyNumber(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="subscriberId">Subscriber ID</Label>
              <Input
                id="subscriberId"
                value={subscriberId}
                onChange={(e) => setSubscriberId(e.target.value)}
                required
              />
            </div>

            <div className="flex justify-end space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/insurance")}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isVerifying}>
                {isVerifying ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  "Verify Coverage"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

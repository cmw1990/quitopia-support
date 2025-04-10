import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { InsuranceClaim } from '@/types/wellness';
import { useUser } from '@/lib/auth';

export function Dashboard() {
  const { user } = useUser();
  const { toast } = useToast();
  const [claims, setClaims] = useState<InsuranceClaim[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSubmitClaim = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Implementation for submitting insurance claim
      toast({
        title: 'Success',
        description: 'Insurance claim submitted successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to submit claim',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-6">
      <Card>
        <CardHeader>
          <CardTitle>Insurance Claims Dashboard</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <form onSubmit={handleSubmitClaim} className="space-y-4">
              <Input
                type="text"
                placeholder="Claim Description"
                required
              />
              <Input
                type="number"
                placeholder="Amount"
                required
                min={0}
              />
              <Button type="submit" disabled={loading}>
                {loading ? 'Submitting...' : 'Submit Claim'}
              </Button>
            </form>
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Recent Claims</h3>
              {claims.length === 0 ? (
                <p className="text-gray-500">No claims found</p>
              ) : (
                claims.map((claim) => (
                  <Card key={claim.id}>
                    <CardContent className="py-4">
                      <p className="font-medium">{claim.type}</p>
                      <p className="text-sm text-gray-500">Amount: ${claim.amount}</p>
                      <p className="text-sm text-gray-500">Status: {claim.status}</p>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default Dashboard;

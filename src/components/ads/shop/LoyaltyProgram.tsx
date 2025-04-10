
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/supabase-client";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/AuthProvider";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { Users, TrendingUp, MessageCircle, Trophy, Gift } from 'lucide-react';
import { LoyaltyProgram as LoyaltyProgramType, LoyaltyTier, LoyaltyReward } from "@/types/insurance";

export function LoyaltyProgram() {
  const { session } = useAuth();

  const { data: vendorId } = useQuery({
    queryKey: ['vendor-id', session?.user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from('vendors')
        .select('id')
        .eq('claimed_by', session?.user?.id)
        .single();
      return data?.id;
    },
    enabled: !!session?.user?.id
  });

  const { data: programData, isLoading } = useQuery({
    queryKey: ['loyalty-program', vendorId],
    queryFn: async () => {
      const { data } = await supabase
        .from('vendor_loyalty_programs')
        .select('*')
        .eq('vendor_id', vendorId)
        .maybeSingle();

      if (!data) return null;

      // Type assertion with validation
      const tiers = Array.isArray(data.tiers) ? data.tiers.map((tier: any) => ({
        name: String(tier.name || ''),
        points_required: Number(tier.points_required || 0),
        benefits: Array.isArray(tier.benefits) ? tier.benefits.map(String) : []
      })) as LoyaltyTier[] : [];

      const rewards = Array.isArray(data.rewards) ? data.rewards.map((reward: any) => ({
        name: String(reward.name || ''),
        points_cost: Number(reward.points_cost || 0),
        description: String(reward.description || '')
      })) as LoyaltyReward[] : [];

      return {
        ...data,
        tiers,
        rewards,
      } as LoyaltyProgramType;
    },
    enabled: !!vendorId
  });

  if (!session?.user) {
    return null;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Loyalty Program
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
          ) : programData ? (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium">{programData.program_name}</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {programData.points_ratio} points per $1 spent
                </p>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Users className="h-4 w-4" />
                  <h4 className="font-medium">Membership Tiers</h4>
                </div>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {programData.tiers?.map((tier) => (
                    <div key={tier.name} className="p-4 rounded-lg border bg-card">
                      <h5 className="font-medium">{tier.name}</h5>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {tier.points_required} points required
                      </p>
                      <ul className="mt-2 text-sm space-y-1">
                        {tier.benefits?.map((benefit) => (
                          <li key={benefit}>{benefit}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Gift className="h-4 w-4" />
                  <h4 className="font-medium">Available Rewards</h4>
                </div>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {programData.rewards?.map((reward) => (
                    <div key={reward.name} className="p-4 rounded-lg border bg-card">
                      <h5 className="font-medium">{reward.name}</h5>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {reward.points_cost} points required
                      </p>
                      <p className="mt-2 text-sm">
                        {reward.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center p-8">
              <p className="text-muted-foreground">No loyalty program found</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

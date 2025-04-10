import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import { Badge } from '@/components/ui/badge';
import { 
  getStoreProducts, 
  getUserPoints, 
  purchaseProduct,
  getStreakStats,
  claimSubscriptionReward,
  getAvailableSubscriptionRewards
} from '@/lib/points-db';
import type { 
  StoreProduct, 
  UserPoints, 
  SubscriptionReward 
} from '@/types/points';
import { ShoppingBag, Gift, Star, Timer, Zap } from 'lucide-react';
import { format } from 'date-fns';

export function RewardsStore() {
  const [products, setProducts] = useState<StoreProduct[]>([]);
  const [userPoints, setUserPoints] = useState<UserPoints | null>(null);
  const [subscriptionRewards, setSubscriptionRewards] = useState<SubscriptionReward[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadStoreData();
  }, []);

  async function loadStoreData() {
    try {
      const [products, points, rewards] = await Promise.all([
        getStoreProducts(),
        getUserPoints(),
        getAvailableSubscriptionRewards()
      ]);
      setProducts(products);
      setUserPoints(points);
      setSubscriptionRewards(rewards);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load store data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }

  async function handlePurchase(product: StoreProduct, usePoints: boolean) {
    try {
      await purchaseProduct(product.id, usePoints);
      toast({
        title: 'Success',
        description: 'Purchase successful!'
      });
      loadStoreData();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to complete purchase',
        variant: 'destructive',
      });
    }
  }

  async function handleClaimReward(reward: SubscriptionReward) {
    try {
      await claimSubscriptionReward(reward.id);
      toast({
        title: 'Success',
        description: 'Reward claimed successfully!'
      });
      loadStoreData();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to claim reward',
        variant: 'destructive',
      });
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Points Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Your Points Balance</CardTitle>
          <CardDescription>Use your points for exclusive rewards and discounts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Star className="h-5 w-5 text-yellow-500" />
              <span className="text-2xl font-bold">{userPoints?.totalPoints} points</span>
            </div>
            {userPoints?.currentStreak && userPoints.currentStreak > 0 && (
              <Badge variant="secondary" className="flex items-center space-x-1">
                <Zap className="h-4 w-4" />
                <span>{userPoints.currentStreak} day streak</span>
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="products">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="products">
            <ShoppingBag className="h-4 w-4 mr-2" />
            Products
          </TabsTrigger>
          <TabsTrigger value="subscription">
            <Gift className="h-4 w-4 mr-2" />
            Subscription Rewards
          </TabsTrigger>
        </TabsList>

        {/* Products Tab */}
        <TabsContent value="products" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {products.map(product => (
              <Card key={product.id} className="flex flex-col">
                <CardHeader>
                  <div className="aspect-square relative rounded-lg overflow-hidden mb-4">
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="object-cover w-full h-full"
                    />
                  </div>
                  <CardTitle>{product.name}</CardTitle>
                  <CardDescription>{product.description}</CardDescription>
                </CardHeader>
                <CardContent className="flex-grow">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Regular Price</span>
                      <span>${product.basePrice.toFixed(2)}</span>
                    </div>
                    {product.pointsDiscount && (
                      <div className="flex justify-between text-primary">
                        <span>Points Discount</span>
                        <span>{product.pointsDiscount.discountPercentage}% off</span>
                      </div>
                    )}
                    {product.pointsDiscount?.minStreak && (
                      <div className="flex items-center space-x-1 text-sm text-orange-500">
                        <Timer className="h-4 w-4" />
                        <span>{product.pointsDiscount.minStreak} day streak required</span>
                      </div>
                    )}
                  </div>
                </CardContent>
                <CardFooter className="space-x-2">
                  <Button 
                    variant="outline"
                    onClick={() => handlePurchase(product, false)}
                  >
                    Buy Now
                  </Button>
                  {product.pointsDiscount && (
                    <Button
                      onClick={() => handlePurchase(product, true)}
                      disabled={!userPoints || userPoints.totalPoints < product.pointsDiscount.pointsCost}
                    >
                      Use {product.pointsDiscount.pointsCost} Points
                    </Button>
                  )}
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Subscription Rewards Tab */}
        <TabsContent value="subscription" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {subscriptionRewards.map(reward => (
              <Card key={reward.id}>
                <CardHeader>
                  <CardTitle>{reward.title}</CardTitle>
                  <CardDescription>{reward.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                      <Star className="h-5 w-5 text-primary" />
                      <span>{reward.requiredSteps} steps required</span>
                    </div>
                    <div className="text-sm text-gray-500">
                      Valid until {format(new Date(reward.validUntil || ''), 'PP')}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 text-sm">
                    <Gift className="h-4 w-4 text-primary" />
                    <span>
                      {reward.rewardType === 'discount' && `${reward.rewardValue}% subscription discount`}
                      {reward.rewardType === 'free_trial' && `${reward.rewardValue} days free trial`}
                      {reward.rewardType === 'free_month' && 'One month free subscription'}
                    </span>
                  </div>
                  {reward.minSubscriptionTier && (
                    <Badge variant="secondary">
                      Requires {reward.minSubscriptionTier} subscription
                    </Badge>
                  )}
                </CardContent>
                <CardFooter>
                  <Button 
                    className="w-full"
                    onClick={() => handleClaimReward(reward)}
                    disabled={!userPoints || userPoints.totalPoints < reward.requiredSteps}
                  >
                    Claim Reward
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default RewardsStore;

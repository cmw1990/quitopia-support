import { Suspense, lazy } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Flower2, Wind, Car } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ErrorBoundary } from "react-error-boundary";
import { Skeleton } from "@/components/ui/skeleton";

// Lazy load heavy components
const ZenDrift = lazy(() => import("@/components/games/ZenDrift"));
const BreathingTechniques = lazy(() => import("@/components/breathing/BreathingTechniques"));
const OpenAITest = lazy(() => import("@/components/OpenAITest"));
const GameAssetsGenerator = lazy(() => import("@/components/GameAssetsGenerator"));

// Loading fallbacks
const LoadingCard = () => (
  <Card>
    <CardHeader>
      <Skeleton className="h-4 w-[200px]" />
    </CardHeader>
    <CardContent>
      <Skeleton className="h-[200px] w-full" />
    </CardContent>
  </Card>
);

// Error fallback
const ErrorCard = ({ error, resetErrorBoundary }) => (
  <Card className="border-destructive">
    <CardHeader>
      <CardTitle className="text-destructive">Something went wrong</CardTitle>
    </CardHeader>
    <CardContent>
      <p className="text-sm text-muted-foreground mb-4">{error.message}</p>
      <button 
        onClick={resetErrorBoundary}
        className="bg-primary text-primary-foreground px-4 py-2 rounded hover:bg-primary/90"
      >
        Try again
      </button>
    </CardContent>
  </Card>
);

const Relax = () => {
  return (
    <div className="container mx-auto p-4 space-y-8">
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-3">
          <div className="p-2 bg-primary/10 rounded-full">
            <Flower2 className="h-6 w-6 text-primary animate-pulse" />
          </div>
          <h1 className="text-4xl font-bold text-primary">Relaxation Space</h1>
        </div>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Take a moment to unwind and find your inner peace through various relaxation techniques and mindful activities.
        </p>
        <div className="flex justify-center gap-4">
          <ErrorBoundary FallbackComponent={ErrorCard}>
            <Suspense fallback={<Skeleton className="h-10 w-[120px]" />}>
              <OpenAITest />
            </Suspense>
          </ErrorBoundary>
          <ErrorBoundary FallbackComponent={ErrorCard}>
            <Suspense fallback={<Skeleton className="h-10 w-[120px]" />}>
              <GameAssetsGenerator />
            </Suspense>
          </ErrorBoundary>
        </div>
      </div>

      <Tabs defaultValue="zendrift" className="space-y-4">
        <TabsList className="grid grid-cols-2 gap-4">
          <TabsTrigger value="zendrift" className="flex items-center gap-2">
            <Car className="h-4 w-4" />
            Zen Drift
          </TabsTrigger>
          <TabsTrigger value="breathing" className="flex items-center gap-2">
            <Wind className="h-4 w-4" />
            Breathing
          </TabsTrigger>
        </TabsList>

        <TabsContent value="zendrift">
          <ErrorBoundary FallbackComponent={ErrorCard}>
            <Suspense fallback={<LoadingCard />}>
              <ZenDrift />
            </Suspense>
          </ErrorBoundary>
        </TabsContent>

        <TabsContent value="breathing">
          <ErrorBoundary FallbackComponent={ErrorCard}>
            <Suspense fallback={<LoadingCard />}>
              <BreathingTechniques />
            </Suspense>
          </ErrorBoundary>
        </TabsContent>
      </Tabs>

      <Card className="bg-primary/5 border-2 border-primary/20">
        <CardContent className="pt-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <h3 className="font-medium text-primary">Zen Drift</h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Practice mindful control through scenic drives</li>
                <li>• Experience the flow state in beautiful environments</li>
                <li>• Let go of stress through smooth drifting mechanics</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h3 className="font-medium text-primary">Breathing Exercises</h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Follow guided breathing patterns</li>
                <li>• Reduce stress and anxiety</li>
                <li>• Improve focus and mental clarity</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Relax;
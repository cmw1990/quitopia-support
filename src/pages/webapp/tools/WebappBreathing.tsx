import { Link } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BreathingVisualizer } from "@/components/breathing/BreathingVisualizer";
import { BreathingTechniques } from "@/components/breathing/BreathingTechniques";
import { Wind, Gamepad2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export const WebappBreathing: React.FC = () => {
  return (
    <div className="container max-w-4xl mx-auto p-4 space-y-8">
      <Tabs defaultValue="exercises" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="exercises" className="flex items-center gap-2">
            <Wind className="h-4 w-4" />
            Breathing Exercises
          </TabsTrigger>
          <TabsTrigger value="games" className="flex items-center gap-2">
            <Gamepad2 className="h-4 w-4" />
            Breathing Games
          </TabsTrigger>
        </TabsList>

        <TabsContent value="exercises" className="mt-6">
          <div className="grid gap-6">
            <Card className="p-6">
              <BreathingTechniques />
            </Card>
            
            <Card className="p-6">
              <BreathingVisualizer />
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="games" className="mt-6">
          <Card className="p-6">
            <div className="text-center space-y-4">
              <h2 className="text-2xl font-bold">Interactive Breathing Games</h2>
              <p className="text-muted-foreground">
                Coming soon! Practice breathing techniques while playing engaging games.
              </p>
              <Button asChild>
                <Link to="/webapp/guides">
                  Meanwhile, check our breathing guides
                </Link>
              </Button>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
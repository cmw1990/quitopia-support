import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ExerciseAssetsGenerator } from "@/components/exercises/ExerciseAssetsGenerator";
import { GameAssetsGenerator } from "@/components/GameAssetsGenerator";
import { ZenDriftAssetsGenerator } from "@/components/games/ZenDriftAssetsGenerator";
import { GenerateBackgroundsButton } from "@/components/meditation/GenerateBackgroundsButton";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { TopNav } from "@/components/layout/TopNav";

const DevelopmentTools = () => {
  const navigate = useNavigate();
  const isDev = import.meta.env.DEV;

  useEffect(() => {
    if (!isDev) {
      navigate("/webapp");
    }
  }, [navigate]);

  if (!isDev) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <TopNav />
      <div className="container mx-auto p-4 space-y-6">
        <h1 className="text-2xl font-bold">Development Tools</h1>
        
        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Eye Exercise Assets</CardTitle>
            </CardHeader>
            <CardContent>
              <ExerciseAssetsGenerator />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Game Assets</CardTitle>
            </CardHeader>
            <CardContent>
              <GameAssetsGenerator />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Zen Drift Assets</CardTitle>
            </CardHeader>
            <CardContent>
              <ZenDriftAssetsGenerator />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Meditation Backgrounds</CardTitle>
            </CardHeader>
            <CardContent>
              <GenerateBackgroundsButton />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DevelopmentTools;

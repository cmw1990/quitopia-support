import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/supabase-client";
import { Card } from "@/components/ui/card";
import { Medal, Star, Trophy, Award } from "lucide-react";

export const AchievementWall = () => {
  const { data: achievements } = useQuery({
    queryKey: ["achievements"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("achievements")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  return (
    <Card className="p-6">
      <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
        <Trophy className="h-6 w-6 text-yellow-500" />
        Achievement Wall
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {achievements?.map((achievement) => (
          <Card
            key={achievement.id}
            className="p-4 hover:shadow-lg transition-shadow animate-fade-in"
          >
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-full bg-primary/10">
                {achievement.icon === "medal" && <Medal className="h-5 w-5 text-yellow-500" />}
                {achievement.icon === "star" && <Star className="h-5 w-5 text-blue-500" />}
                {achievement.icon === "award" && <Award className="h-5 w-5 text-green-500" />}
              </div>
              <div>
                <h3 className="font-semibold">{achievement.title}</h3>
                <p className="text-sm text-muted-foreground">
                  {achievement.description}
                </p>
                <div className="mt-2 text-xs text-muted-foreground">
                  {new Date(achievement.unlocked_at).toLocaleDateString()}
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </Card>
  );
};
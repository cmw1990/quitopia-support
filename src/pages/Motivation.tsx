import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/supabase-client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { DailyMotivation } from "@/components/motivation/DailyMotivation";
import { MotivationStats } from "@/components/motivation/MotivationStats";
import { AchievementWall } from "@/components/motivation/AchievementWall";
import { MotivationJournal } from "@/components/motivation/MotivationJournal";
import { VisionBoard } from "@/components/motivation/VisionBoard";

const Motivation = () => {
  const { toast } = useToast();

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Motivation Center</h1>
      
      <div className="grid gap-6 md:grid-cols-2">
        <DailyMotivation />
        <MotivationStats />
      </div>

      <AchievementWall />
      
      <div className="grid gap-6 md:grid-cols-2">
        <MotivationJournal />
        <VisionBoard />
      </div>
    </div>
  );
};

export default Motivation;
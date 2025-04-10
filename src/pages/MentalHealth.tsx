import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { MoodTracker } from "@/components/mentalHealth/MoodTracker";
import { AnxietyDashboard } from "@/components/mentalHealth/anxiety/AnxietyDashboard";
import { MindfulnessTracker } from "@/components/mentalHealth/mindfulness/MindfulnessTracker";
import { TherapyGoals } from "@/components/mentalHealth/therapy/TherapyGoals";
import { SocialConnections } from "@/components/mentalHealth/social/SocialConnections";
import { SleepMental } from "@/components/mentalHealth/sleep/SleepMental";
import { useAuth } from "@/components/AuthProvider";
import { motion } from "framer-motion";
import { 
  Brain, 
  HeartPulse,
  Lotus,
  Target,
  Users,
  Moon
} from "lucide-react";

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
};

const stagger = {
  visible: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

export default function MentalHealth() {
  const { session } = useAuth();
  const [activeTab, setActiveTab] = useState("mood");

  if (!session) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
        <Card className="p-6">
          <p>Please sign in to access mental health features.</p>
        </Card>
      </div>
    );
  }

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={stagger}
      className="container mx-auto py-6 max-w-4xl"
    >
      <motion.h1
        variants={fadeIn}
        className="text-3xl font-bold mb-6"
      >
        Mental Health & Wellbeing
      </motion.h1>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-6 gap-4 mb-6">
          <TabsTrigger value="mood" className="flex items-center gap-2">
            <HeartPulse className="h-4 w-4" />
            Mood
          </TabsTrigger>
          <TabsTrigger value="anxiety" className="flex items-center gap-2">
            <Brain className="h-4 w-4" />
            Anxiety
          </TabsTrigger>
          <TabsTrigger value="mindfulness" className="flex items-center gap-2">
            <Lotus className="h-4 w-4" />
            Mindfulness
          </TabsTrigger>
          <TabsTrigger value="goals" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            Goals
          </TabsTrigger>
          <TabsTrigger value="social" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Social
          </TabsTrigger>
          <TabsTrigger value="sleep" className="flex items-center gap-2">
            <Moon className="h-4 w-4" />
            Sleep
          </TabsTrigger>
        </TabsList>

        <motion.div variants={fadeIn}>
          <TabsContent value="mood">
            <MoodTracker />
          </TabsContent>

          <TabsContent value="anxiety">
            <AnxietyDashboard />
          </TabsContent>

          <TabsContent value="mindfulness">
            <MindfulnessTracker />
          </TabsContent>

          <TabsContent value="goals">
            <TherapyGoals />
          </TabsContent>

          <TabsContent value="social">
            <SocialConnections />
          </TabsContent>

          <TabsContent value="sleep">
            <SleepMental />
          </TabsContent>
        </motion.div>
      </Tabs>
    </motion.div>
  );
}

import { useNavigate } from "react-router-dom";
import { useAuth } from "@/components/AuthProvider";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Battery, Brain, Gamepad2 } from "lucide-react";
import { motion } from "framer-motion";
import { GameAssetsGenerator } from "@/components/GameAssetsGenerator";
import { MoodOverview } from "@/components/MoodOverview";
import { ADHDTaskManager } from "@/components/focus/ADHDTaskManager";
import { FocusAnalyticsDashboard } from "@/components/focus/FocusAnalyticsDashboard";
import { FocusAchievements } from "@/components/focus/FocusAchievements";
import { EisenhowerMatrix } from "@/components/focus/EisenhowerMatrix";
import { FocusTimerTools } from "@/components/focus/FocusTimerTools";
import { FocusEnvironment } from "@/components/focus/FocusEnvironment";

export default function Desktop() {
  const navigate = useNavigate();
  const { session } = useAuth();

  if (!session) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <Card className="p-6">
          <h1 className="text-2xl font-bold mb-4">Welcome to Energy Support</h1>
          <p className="mb-4">Sign in to access your personal energy dashboard.</p>
          <Button onClick={() => navigate("/login")}>Sign In</Button>
        </Card>
        <div className="flex justify-center">
          <GameAssetsGenerator />
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="container mx-auto p-4 md:p-6 space-y-6"
    >
      <div className="flex justify-center mb-6">
        <GameAssetsGenerator />
      </div>

      <Card className="p-4 bg-gradient-to-r from-pink-50 to-purple-50 dark:from-pink-900/20 dark:to-purple-900/20 hover:shadow-lg transition-all duration-300">
        <div className="flex items-center gap-3 mb-4">
          <Gamepad2 className="h-6 w-6 text-pink-500" />
          <h2 className="text-2xl font-bold">Balloon Adventure</h2>
        </div>
        <p className="text-muted-foreground mb-4">
          Embark on a dreamy journey through the clouds in this breath-controlled balloon adventure.
        </p>
        <div className="flex gap-4">
          <Button 
            onClick={() => navigate("/breathing-balloon")}
            className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <Gamepad2 className="mr-2 h-4 w-4" />
            Start Adventure
          </Button>
          <GameAssetsGenerator />
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="col-span-full lg:col-span-2"
        >
          <Card className="p-4 bg-gradient-to-r from-emerald-50 to-blue-50 dark:from-emerald-900/20 dark:to-blue-900/20">
            <div className="flex items-center gap-3 mb-4">
              <Battery className="h-6 w-6 text-emerald-500" />
              <h2 className="text-2xl font-bold">Energy Score</h2>
            </div>
            <MoodOverview />
          </Card>
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="col-span-full lg:col-span-2"
        >
          <ADHDTaskManager />
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="col-span-full lg:col-span-2"
        >
          <FocusTimerTools />
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="col-span-full lg:col-span-2"
        >
          <FocusEnvironment />
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="col-span-full"
        >
          <EisenhowerMatrix />
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="col-span-full lg:col-span-2"
        >
          <FocusAnalyticsDashboard />
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="col-span-full lg:col-span-2"
        >
          <FocusAchievements />
        </motion.div>
      </div>
    </motion.div>
  );
}

import { useEffect } from "react";
import { Card } from "@/components/ui/card";
import { AchievementBadge } from "./AchievementBadge";
import { motion, AnimatePresence } from "framer-motion";

interface AchievementPopupProps {
  title: string;
  icon: string;
  points: number;
  onClose: () => void;
}

export const AchievementPopup = ({
  title,
  icon,
  points,
  onClose
}: AchievementPopupProps) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -50 }}
        className="fixed bottom-4 right-4 z-50"
      >
        <Card className="p-4 flex items-center gap-4 bg-primary text-primary-foreground">
          <AchievementBadge icon={icon} unlocked size="sm" />
          <div>
            <h4 className="font-semibold">Achievement Unlocked!</h4>
            <p className="text-sm">{title} (+{points} points)</p>
          </div>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
};
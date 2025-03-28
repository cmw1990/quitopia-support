import React from "react";
import { cn } from "../../lib/utils";
import { Card, CardContent } from "./card";
import { Badge } from "./badge";
import { Progress } from "./progress";
import { motion, AnimatePresence } from "framer-motion";
import { useAnimation } from "../../contexts/AnimationContext";

interface HealthImprovementCardProps {
  title: string;
  description: string;
  daysRequired: number;
  daysPassed: number;
  icon: React.ReactNode;
  achieved: boolean;
  className?: string;
  onClick?: () => void;
  delay?: number;
}

export const HealthImprovementCard = ({
  title,
  description,
  daysRequired,
  daysPassed,
  icon,
  achieved,
  className,
  onClick,
  delay = 0
}: HealthImprovementCardProps) => {
  const [isHovered, setIsHovered] = React.useState(false);
  const { getTransition } = useAnimation();
  const progress = Math.min(Math.round((daysPassed / daysRequired) * 100), 100);
  const isUpcoming = !achieved && progress < 100;
  const isImminent = !achieved && progress >= 85 && progress < 100;

  // Animation variants
  const cardVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { 
      opacity: 1, 
      y: 0,
      transition: { 
        ...getTransition(), 
        delay: delay * 0.1
      }
    },
    hover: { 
      y: -8,
      boxShadow: "0 15px 30px rgba(0, 0, 0, 0.1)",
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 15
      }
    },
    tap: {
      y: -2,
      transition: {
        type: "spring",
        stiffness: 500,
        damping: 20
      }
    }
  };

  const progressVariants = {
    initial: { width: 0 },
    animate: { 
      width: `${progress}%`,
      transition: {
        duration: 1,
        delay: (delay * 0.1) + 0.3,
        ease: [0.33, 1, 0.68, 1]
      }
    }
  };

  const iconVariants = {
    initial: { scale: 0.8, opacity: 0.5 },
    animate: { 
      scale: 1, 
      opacity: 1,
      transition: {
        ...getTransition(),
        delay: (delay * 0.1) + 0.2
      }
    },
    hover: { 
      scale: 1.1,
      rotate: [0, -5, 5, 0],
      transition: {
        duration: 0.5,
        ease: "easeInOut"
      }
    }
  };

  const cardColors = achieved 
    ? {
        bg: "bg-gradient-to-br from-green-50 to-green-100/50",
        border: "border-green-200",
        shadow: "shadow-[0_0_15px_rgba(16,185,129,0.15)]",
        iconBg: "bg-gradient-to-br from-green-100 to-green-200",
        iconText: "text-green-700",
        progressBg: "bg-green-100/50",
        progressBar: "bg-green-500"
      }
    : isImminent
    ? {
        bg: "bg-gradient-to-br from-amber-50 to-amber-100/50",
        border: "border-amber-200",
        shadow: "hover:shadow-[0_0_15px_rgba(245,158,11,0.15)]",
        iconBg: "bg-gradient-to-br from-amber-100 to-amber-200",
        iconText: "text-amber-700",
        progressBg: "bg-amber-100/50",
        progressBar: "bg-amber-500"
      }
    : {
        bg: "bg-gradient-to-br from-blue-50 to-blue-100/50",
        border: "border-blue-200",
        shadow: "hover:shadow-[0_0_15px_rgba(59,130,246,0.15)]",
        iconBg: "bg-gradient-to-br from-blue-100 to-blue-200",
        iconText: "text-blue-700",
        progressBg: "bg-blue-100/50",
        progressBar: "bg-blue-500"
      };

  return (
    <motion.div
      initial="initial"
      animate="animate"
      whileHover="hover"
      whileTap="tap"
      variants={cardVariants}
      className={cn("cursor-pointer relative", className)}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Card className={cn(
        "overflow-hidden border backdrop-blur-sm relative z-10 transition-all duration-300", 
        cardColors.bg,
        cardColors.border,
        cardColors.shadow
      )}>
        {/* Subtle glow effect for achieved items */}
        {achieved && (
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-green-200/30 to-transparent animate-shimmer opacity-50" />
        )}
        
        {/* Animated card content */}
        <CardContent className="p-4 relative z-10">
          <div className="flex items-start gap-3">
            <motion.div 
              className={cn(
                "flex h-10 w-10 shrink-0 items-center justify-center rounded-full relative overflow-hidden",
                cardColors.iconBg,
                cardColors.iconText
              )}
              variants={iconVariants}
            >
              {/* Add pulsing background for icon */}
              {isHovered && (
                <motion.div 
                  className="absolute inset-0 bg-white/30"
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1.5, opacity: 0 }}
                  transition={{ duration: 1, repeat: Infinity }}
                />
              )}
              {icon}
            </motion.div>
            
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-sm mb-1">{title}</h3>
                <AnimatePresence>
                  {achieved ? (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                    >
                      <Badge className="bg-green-100 text-green-800 border-green-200">Achieved</Badge>
                    </motion.div>
                  ) : isImminent ? (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                    >
                      <Badge className="bg-amber-100 text-amber-800 border-amber-200">Imminent</Badge>
                    </motion.div>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                    >
                      <Badge className="bg-gray-100 text-gray-800 border-gray-200">Upcoming</Badge>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              
              <p className="text-sm text-gray-600 line-clamp-2">{description}</p>
              
              <div className="mt-3">
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span>{`Day ${daysPassed} of ${daysRequired}`}</span>
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: (delay * 0.1) + 0.4 }}
                  >
                    {`${progress}%`}
                  </motion.span>
                </div>
                
                <div className={cn("h-2 rounded-full overflow-hidden", cardColors.progressBg)}>
                  <motion.div 
                    className={cn("h-full rounded-full", cardColors.progressBar)}
                    variants={progressVariants}
                    initial="initial"
                    animate="animate"
                  />
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Add subtle decorative elements */}
      <motion.div 
        className="absolute -bottom-2 -right-2 w-24 h-24 rounded-full bg-gradient-to-br from-primary/5 to-secondary/5 blur-xl z-0"
        initial={{ opacity: 0 }}
        animate={{ opacity: isHovered ? 0.8 : 0.3 }}
        transition={{ duration: 0.5 }}
      />
    </motion.div>
  );
}; 
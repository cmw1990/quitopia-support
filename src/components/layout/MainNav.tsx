import React from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Timer,        // Pomodoro
  ListTodo,     // Task Manager
  BarChart3,    // Analytics
  Settings,     // Settings
  BrainCircuit, // Strategies (Alternative)
  Smile,        // Mood & Energy
  HeartPulse,   // Mood & Energy (Alternative)
  Award,        // Achievements
  ShieldCheck,  // Blocker
  Puzzle,       // Games
  // EyeOff,       // Not used currently
  Focus,        // Focus Sessions (Added)
  Users,        // Community
  // BatteryCharging, // Not used currently
  Lightbulb,    // Strategies (Chosen)
  // BookOpen,     // Not used currently (Guides)
  // CalendarClock, // Alternative for Sessions
  ArrowRightLeft, // Context Switching
  // Zap,          // Not used currently
  Clock,        // Pomodoro (Chosen)
  Headphones,   // Sounds (Added)
  Star,         // Goals (Added)
  Activity,     // Impulse Control (Added)
  Droplets,     // Stress Reduction (Added)
  MonitorSmartphone, // Digital Wellness (Added)
  User          // Profile (Added)
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

// Define Navigation Items Structure
interface NavItem {
  title: string;
  href: string;
  icon: React.ReactNode;
  matchPrefix?: boolean; // Optional: match parent route even if not exact end
}

interface NavGroup {
  title?: string; // Optional group title
  items: NavItem[];
}

// Comprehensive navigation items aligned with ssot8001 and routes/index.tsx
const navGroups: NavGroup[] = [
  {
    // Group 1: Core
    items: [
      {
        title: "Dashboard",
        href: "/app/dashboard",
        icon: <LayoutDashboard size={18} />,
      },
    ]
  },
  {
    // Group 2: Focus Tools
    title: "Focus Tools",
    items: [
      {
        title: "Focus Sessions",
        href: "/easier-focus/app/sessions",
        icon: <Focus size={18} />,
      },
      {
        title: "Pomodoro Timer",
        href: "/easier-focus/app/pomodoro",
        icon: <Clock size={18} />,
      },
      {
        title: "Distraction Blocker",
        href: "/easier-focus/app/blocker",
        icon: <ShieldCheck size={18} />,
      },
      {
        title: "Focus Soundscapes",
        href: "/easier-focus/app/sounds",
        icon: <Headphones size={18} />,
      },
    ]
  },
  {
    // Group 3: Plan & Execute
    title: "Plan & Execute",
    items: [
      {
        title: "Task Manager",
        href: "/easier-focus/app/tasks",
        icon: <ListTodo size={18} />,
      },
      {
        title: "Goals",
        href: "/easier-focus/app/goals",
        icon: <Star size={18} />,
      },
      {
        title: "Strategies",
        href: "/easier-focus/app/strategies",
        icon: <Lightbulb size={18} />,
      },
      {
        title: "Context Switching",
        href: "/easier-focus/app/context-switching",
        icon: <ArrowRightLeft size={18} />,
      },
      {
        title: "Impulse Control",
        href: "/easier-focus/app/impulse-control",
        icon: <Activity size={18} />,
      },
    ]
  },
  {
    // Group 4: Wellness & Engage
    title: "Wellness & Engage",
    items: [
      {
        title: "Mood & Energy",
        href: "/easier-focus/app/mood",
        icon: <Smile size={18} />,
      },
       {
        title: "Stress Reduction",
        href: "/easier-focus/app/stress-reduction",
        icon: <Droplets size={18} />,
      },
      {
        title: "Digital Wellness",
        href: "/easier-focus/app/digital-wellness",
        icon: <MonitorSmartphone size={18} />,
      },
      {
        title: "Achievements",
        href: "/easier-focus/app/achievements",
        icon: <Award size={18} />,
      },
      {
        title: "Community", // For Body Doubling etc.
        href: "/easier-focus/app/community",
        icon: <Users size={18} />,
        matchPrefix: true, // Matches /community/sessions etc.
      },
      {
        title: "Cognitive Games",
        href: "/easier-focus/app/games",
        icon: <Puzzle size={18} />,
        matchPrefix: true, // Matches /games/pattern-match etc.
      },
    ]
  },
  {
    // Group 5: Account
    title: "Account",
    items: [
      {
        title: "Settings",
        href: "/easier-focus/app/settings",
        icon: <Settings size={18} />,
      },
      {
        title: "Profile",
        href: "/easier-focus/app/profile",
        icon: <User size={18} />,
      },
    ]
  },
];

interface MainNavProps {
  isCollapsed: boolean;
}

export function MainNav({ isCollapsed }: MainNavProps) {
  // Base classes for all nav links
  const baseClasses = 
    "flex items-center gap-3 rounded-md text-sm font-medium transition-all duration-150 ease-in-out group";
  
  // Adjust padding/size based on collapsed state
  const linkSizeClasses = isCollapsed ? "h-9 w-9 p-0 justify-center" : "px-3 py-2";

  // Classes for inactive links
  const inactiveClasses = 
    "text-gray-600 dark:text-gray-400 hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-gray-800 dark:hover:text-gray-100";
  
  // Classes for active links - more vibrant
  const activeClasses = 
    "bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/30 dark:to-blue-900/30 text-purple-700 dark:text-purple-300 font-semibold shadow-inner border border-purple-100 dark:border-purple-800/50";

  return (
    <TooltipProvider delayDuration={100}>
      <nav className="flex flex-col h-full">
        <div className="flex-grow space-y-3"> 
          {navGroups.map((group, groupIndex) => (
            <div key={group.title || `group-${groupIndex}`}>
              {/* Conditionally render group title */} 
              {group.title && !isCollapsed && (
                <h4 className="text-xs font-bold text-gray-500 dark:text-gray-500 tracking-wider uppercase px-3 mb-2 pt-3">
                  {group.title}
                </h4>
              )}
              <div className="space-y-1"> 
                {group.items.map((item) => (
                  <Tooltip key={item.title}>
                    <TooltipTrigger asChild>
                      <NavLink
                        to={item.href}
                        end={!item.matchPrefix}
                        className={({ isActive }) =>
                          cn(baseClasses, linkSizeClasses, isActive ? activeClasses : inactiveClasses)
                        }
                        aria-label={isCollapsed ? item.title : undefined} // Add aria-label when collapsed
                      >
                        {React.cloneElement(item.icon as React.ReactElement, { 
                          className: cn(
                            "h-[18px] w-[18px] flex-shrink-0 transition-colors duration-150",
                            "group-[:is(.active)]:text-purple-700 dark:group-[:is(.active)]:text-purple-300",
                            "group-hover:text-gray-900 dark:group-hover:text-gray-100"
                          )
                        })}
                        {/* Conditionally render text label */} 
                        {!isCollapsed && (
                          <span className="overflow-hidden text-ellipsis whitespace-nowrap">{item.title}</span>
                        )}
                      </NavLink>
                    </TooltipTrigger>
                    {/* Show tooltip only when collapsed */} 
                    {isCollapsed && (
                      <TooltipContent side="right" align="center">
                          <p>{item.title}</p>
                      </TooltipContent>
                    )}
                  </Tooltip>
                ))}
              </div>
            </div>
          ))}
        </div>
      </nav>
    </TooltipProvider>
  );
}
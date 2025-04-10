import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  BarChart3,
  Moon,
  Brain,
  Wind,
  Coffee,
  Eye,
  Flower2,
  Sparkles,
  Dumbbell,
  Pill,
  Package,
  Utensils,
  Heart,
} from "lucide-react";

const toolbarItems = [
  {
    to: "/dashboard",
    icon: BarChart3,
    label: "Stats",
    iconClassName: "text-emerald-500",
  },
  {
    to: "/motivation",
    icon: Sparkles,
    label: "Motivation",
    iconClassName: "text-yellow-500",
  },
  {
    to: "/sleep",
    icon: Moon,
    label: "Sleep",
    iconClassName: "text-indigo-500",
  },
  {
    to: "/relax",
    icon: Flower2,
    label: "Relax",
    iconClassName: "text-pink-500",
  },
  {
    to: "/focus",
    icon: Brain,
    label: "Focus",
    iconClassName: "text-amber-500",
  },
  {
    to: "/meditation",
    icon: Sparkles,
    label: "Meditate",
    iconClassName: "text-purple-500",
  },
  {
    to: "/exercise",
    icon: Dumbbell,
    label: "Exercise",
    iconClassName: "text-red-500",
  },
  {
    to: "/eye-exercises",
    icon: Eye,
    label: "Vision",
    iconClassName: "text-sky-500",
  },
  {
    to: "/breathing",
    icon: Wind,
    label: "Breathe",
    iconClassName: "text-teal-500",
  },
  {
    to: "/caffeine",
    icon: Coffee,
    label: "Caffeine",
    iconClassName: "text-orange-500",
  },
  {
    to: "/nicotine",
    icon: Package,
    label: "Nicotine",
    iconClassName: "text-zinc-500 rounded-full p-0.5", // Add rounded styling to make it look like a pouch case
  },
  {
    to: "/sobriety",
    icon: Heart,
    label: "Recovery",
    iconClassName: "text-zinc-500",
  },
  {
    to: "/supplements",
    icon: Pill,
    label: "Supplements",
    iconClassName: "text-blue-500",
  },
  {
    to: "/food",
    icon: Utensils,
    label: "Nutrition",
    iconClassName: "text-lime-500",
  },
  {
    to: "/health",
    icon: Heart,
    label: "Wellness",
    iconClassName: "text-rose-500",
  },
];

export const Toolbar = () => {
  const location = useLocation();

  return (
    <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex items-center gap-4 px-6 py-3 overflow-x-auto">
        {toolbarItems.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            className={cn(
              "flex flex-col items-center gap-2 py-3.5 px-4 rounded-xl transition-all",
              "hover:bg-accent/20 hover:scale-105 hover:shadow-lg",
              location.pathname === item.to
                ? "bg-accent/25 shadow-md ring-1 ring-accent/10"
                : "bg-accent/10",
            )}
          >
            <div
              className={cn(
                "p-3 rounded-xl transition-colors",
                location.pathname === item.to
                  ? "bg-background shadow-md ring-1 ring-accent/20"
                  : "bg-background/80",
              )}
            >
              <item.icon
                className={cn(
                  "h-5 w-5 transition-colors",
                  item.iconClassName,
                  location.pathname === item.to
                    ? "opacity-100"
                    : "opacity-80"
                )}
              />
            </div>
            <span
              className={cn(
                "text-xs font-medium transition-colors tracking-wide",
                location.pathname === item.to
                  ? "text-foreground"
                  : "text-muted-foreground"
              )}
            >
              {item.label}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
};
import React from 'react';
import { 
    LayoutDashboard, 
    Timer, 
    ListChecks, 
    BarChart2, 
    ShieldCheck, 
    BrainCircuit, 
    Users, 
    Heart, 
    Settings, 
    User,
    // Add other icons used in navGroups
    Sparkles, // For Achievements?
    BookOpen, // For Strategies?
    MessageSquare, // For Community?
    Sun, // For Mood/Energy?
    SlidersHorizontal // For Settings?
} from 'lucide-react';

export interface NavItem {
  title: string;
  href: string;
  icon: React.ReactNode;
  matchPrefix?: boolean; // Optional: Match any sub-route?
  disabled?: boolean; // Optional: Disable link?
  label?: string; // Optional: Add a label like 'New' or 'Beta'
}

export interface NavGroup {
  title?: string; // Optional group title
  items: NavItem[];
}

// Centralized Navigation Structure (Aligned with ssot8001 pages)
export const navGroups: NavGroup[] = [
  {
    // Group 1: Core App
    items: [
      {
        title: "Dashboard",
        href: "/app/dashboard",
        icon: "layout-dashboard",
      },
      {
        title: "Task Manager",
        href: "/easier-focus/app/tasks",
        icon: (<ListChecks size={18} />),
        matchPrefix: true, // Match /tasks/* 
      },
      {
        title: "Focus Sessions", // Combines Timer/Pomodoro/Deep Work Planning
        href: "/easier-focus/app/sessions", 
        icon: (<Timer size={18} />),
        matchPrefix: true,
      },
      {
        title: "Analytics",
        href: "/easier-focus/app/analytics",
        icon: (<BarChart2 size={18} />),
      },
    ]
  },
  {
    // Group 2: Tools & Strategies
    title: "Tools & Strategies",
    items: [
      {
        title: "Distraction Blocker",
        href: "/easier-focus/app/blocker",
        icon: (<ShieldCheck size={18} />),
      },
      {
        title: "Strategies",
        href: "/easier-focus/app/strategies",
        icon: (<BookOpen size={18} />),
      },
      {
        title: "Mood & Energy",
        href: "/easier-focus/app/mood",
        icon: (<Sun size={18} />),
      },
      {
        title: "Context Switching", // As per ssot8001
        href: "/easier-focus/app/context-switching",
        icon: (<BrainCircuit size={18} />),
      },
    ]
  },
  {
    // Group 3: Growth & Community
    title: "Growth & Community",
    items: [
      {
        title: "Achievements",
        href: "/easier-focus/app/achievements",
        icon: (<Sparkles size={18} />),
      },
      {
        title: "Community",
        href: "/easier-focus/app/community",
        icon: (<Users size={18} />),
      },
       {
         title: "Games",
         href: "/easier-focus/app/games",
         icon: (<Heart size={18} />), // Or a game controller icon
         matchPrefix: true,
       },
    ]
  },
  {
    // Group 4: Account
    title: "Account",
    items: [
      {
        title: "Settings",
        href: "/easier-focus/app/settings",
        icon: (<SlidersHorizontal size={18} />),
        matchPrefix: true,
      },
      {
        title: "Profile",
        href: "/easier-focus/app/profile", // Assuming profile is separate or sub-route of settings
        icon: (<User size={18} />),
      },
    ]
  },
];

// Flattened list for easier searching (e.g., for breadcrumbs)
export const allNavItems: NavItem[] = navGroups.flatMap(group => group.items); 
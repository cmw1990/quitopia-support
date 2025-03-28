import { i as importShared } from './react-vendor-773e5a75.js';
import { u as useAuth, a as ue } from './AuthProvider-b0b4665b.js';
import { B as Button, T as Tabs, a as TabsList, b as TabsTrigger, c as TabsContent, m as Badge, P as Progress, D as Dialog, o as DialogContent, p as DialogHeader, q as DialogTitle, r as DialogDescription, s as DialogFooter } from './toast-58ac552a.js';
import './textarea-ba0b28ab.js';
import { f as cn, C as Card, d as CardContent, a as CardHeader, b as CardTitle, e as CardFooter, c as CardDescription } from './card-7a71f808.js';
import { s as supabaseRestCall } from './missionFreshApiClient-3e62d1ad.js';
import { j as jsxRuntimeExports } from './ui-vendor-336c871f.js';

const {useEffect: useEffect$2,useState: useState$2} = await importShared('react');
const {motion: motion$2} = await importShared('framer-motion');
function SmoothProgressRing({
  value,
  size = 120,
  strokeWidth = 6,
  className,
  bgStrokeColor = "rgba(0, 0, 0, 0.1)",
  progressStrokeColor = "hsl(var(--primary))",
  valueLabel,
  label
}) {
  const [displayValue, setDisplayValue] = useState$2(0);
  useEffect$2(() => {
    const animateValue = () => {
      const step = Math.max(1, value / 30);
      let current = 0;
      const interval = setInterval(() => {
        current += step;
        if (current >= value) {
          setDisplayValue(value);
          clearInterval(interval);
        } else {
          setDisplayValue(current);
        }
      }, 16);
      return () => clearInterval(interval);
    };
    animateValue();
  }, [value]);
  const radius = (size - strokeWidth) / 2;
  const center = size / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - displayValue / 100 * circumference;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "div",
    {
      className: cn("relative flex items-center justify-center", className),
      style: { width: size, height: size },
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "svg",
          { width: size, height: size, viewBox: `0 0 ${size} ${size}`, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "circle",
              {
                cx: center,
                cy: center,
                r: radius,
                fill: "none",
                stroke: bgStrokeColor,
                strokeWidth
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              motion$2.circle,
              {
                cx: center,
                cy: center,
                r: radius,
                fill: "none",
                stroke: progressStrokeColor,
                strokeWidth,
                strokeDasharray: circumference,
                strokeDashoffset,
                strokeLinecap: "round",
                transform: `rotate(-90 ${center} ${center})`
              }
            )
          ] }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "div",
          { className: "absolute inset-0 flex flex-col items-center justify-center", children: [
            valueLabel && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-bold text-2xl", children: valueLabel }),
            label && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-muted-foreground", children: label })
          ] }
        )
      ]
    }
  );
}

const {motion: motion$1} = await importShared('framer-motion');
const {CheckCircle2,Clock: Clock$1,Calendar} = await importShared('lucide-react');

const {format: format$1} = await importShared('date-fns');
function MilestoneCard({
  title,
  description,
  date,
  isAchieved = false,
  icon,
  className,
  type = "default",
  daysToGo
}) {
  const formattedDate = daysToGo !== void 0 ? `In ${daysToGo} days` : typeof date === "string" ? format$1(new Date(date), "MMM d, yyyy") : format$1(date, "MMM d, yyyy");
  const typeStyles = {
    health: {
      gradient: "from-green-50 to-emerald-50",
      border: "border-emerald-200",
      icon: "text-emerald-500",
      shadow: "shadow-emerald-100"
    },
    achievement: {
      gradient: "from-amber-50 to-yellow-50",
      border: "border-amber-200",
      icon: "text-amber-500",
      shadow: "shadow-amber-100"
    },
    financial: {
      gradient: "from-blue-50 to-indigo-50",
      border: "border-blue-200",
      icon: "text-blue-500",
      shadow: "shadow-blue-100"
    },
    social: {
      gradient: "from-purple-50 to-violet-50",
      border: "border-purple-200",
      icon: "text-purple-500",
      shadow: "shadow-purple-100"
    },
    default: {
      gradient: "from-gray-50 to-slate-50",
      border: "border-gray-200",
      icon: "text-gray-500",
      shadow: "shadow-gray-100"
    }
  };
  const style = typeStyles[type];
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    motion$1.div,
    {
      whileHover: { y: -5, boxShadow: "0 10px 30px -15px rgba(0, 0, 0, 0.1)" },
      transition: { duration: 0.2 },
      className: cn("relative", className),
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Card,
          {
            className: cn(
              "overflow-hidden border bg-gradient-to-br",
              style.gradient,
              style.border,
              style.shadow,
              isAchieved ? "opacity-100" : "opacity-70"
            ),
            children: [
              isAchieved && /* @__PURE__ */ jsxRuntimeExports.jsx(
                "div",
                { className: "absolute top-3 right-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx(CheckCircle2, { className: "h-5 w-5 text-emerald-500" }) }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                CardContent,
                { className: "p-5", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  "div",
                  { className: "flex items-start space-x-4", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      "div",
                      {
                        className: cn(
                          "flex-shrink-0 p-2 rounded-full bg-white",
                          style.border
                        ),
                        children: icon || /* @__PURE__ */ jsxRuntimeExports.jsx(Calendar, { className: cn("h-5 w-5", style.icon) })
                      }
                    ),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs(
                      "div",
                      { className: "flex-1 min-w-0", children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx(
                          "h3",
                          { className: "text-base font-medium text-gray-900 truncate", children: title }
                        ),
                        description && /* @__PURE__ */ jsxRuntimeExports.jsx(
                          "p",
                          { className: "mt-1 text-sm text-gray-500 line-clamp-2", children: description }
                        ),
                        /* @__PURE__ */ jsxRuntimeExports.jsxs(
                          "div",
                          { className: "mt-2 flex items-center text-xs text-gray-500", children: [
                            /* @__PURE__ */ jsxRuntimeExports.jsx(Clock$1, { className: "mr-1 h-3.5 w-3.5" }),
                            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: formattedDate })
                          ] }
                        )
                      ] }
                    )
                  ] }
                ) }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "div",
                {
                  className: cn(
                    "h-1 w-full",
                    isAchieved ? "bg-gradient-to-r from-emerald-400 to-green-500" : "bg-gradient-to-r from-gray-200 to-gray-300"
                  )
                }
              )
            ]
          }
        ),
        isAchieved && /* @__PURE__ */ jsxRuntimeExports.jsx(
          jsxRuntimeExports.Fragment,
          { children: /* @__PURE__ */ jsxRuntimeExports.jsx(
            motion$1.div,
            {
              className: "absolute -z-10 inset-0 bg-gradient-to-br from-white to-transparent opacity-80 rounded-lg",
              animate: {
                scale: [1, 1.05, 1],
                opacity: [0.5, 0.8, 0.5]
              },
              transition: {
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut"
              }
            }
          ) }
        )
      ]
    }
  );
}

const {useState: useState$1,useEffect: useEffect$1,useRef} = await importShared('react');

const {motion} = await importShared('framer-motion');
const {Pause,Play,RotateCcw,CheckCircle} = await importShared('lucide-react');
function BreathingExercise({
  className,
  onComplete,
  duration = 60,
  // Default 1 minute
  breathCycles = 4
  // Default 4 breath cycles
}) {
  const [isActive, setIsActive] = useState$1(false);
  const [currentPhase, setCurrentPhase] = useState$1("inhale");
  const [timeRemaining, setTimeRemaining] = useState$1(duration);
  const [cycleCount, setCycleCount] = useState$1(0);
  const timerRef = useRef(null);
  const phaseDurations = {
    inhale: 4,
    hold: 4,
    exhale: 6,
    rest: 2
  };
  const cycleTime = Object.values(phaseDurations).reduce((a, b) => a + b, 0);
  const totalExerciseTime = cycleTime * breathCycles;
  useEffect$1(() => {
    setTimeRemaining(Math.min(duration, totalExerciseTime));
  }, [duration, totalExerciseTime]);
  useEffect$1(() => {
    if (!isActive)
      return;
    const phaseTimer = setTimeout(() => {
      if (currentPhase === "inhale") {
        setCurrentPhase("hold");
      } else if (currentPhase === "hold") {
        setCurrentPhase("exhale");
      } else if (currentPhase === "exhale") {
        setCurrentPhase("rest");
      } else {
        if (cycleCount < breathCycles - 1) {
          setCycleCount((prev) => prev + 1);
          setCurrentPhase("inhale");
        } else if (timeRemaining <= 0) {
          handleComplete();
        } else {
          setCurrentPhase("inhale");
        }
      }
    }, phaseDurations[currentPhase] * 1e3);
    return () => clearTimeout(phaseTimer);
  }, [currentPhase, isActive, cycleCount, breathCycles, timeRemaining]);
  useEffect$1(() => {
    if (!isActive)
      return;
    timerRef.current = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          handleComplete();
          return 0;
        }
        return prev - 1;
      });
    }, 1e3);
    return () => {
      if (timerRef.current)
        clearInterval(timerRef.current);
    };
  }, [isActive]);
  const circleVariants = {
    inhale: {
      scale: [1, 1.5],
      opacity: [0.7, 1],
      transition: { duration: phaseDurations.inhale, ease: "easeInOut" }
    },
    hold: {
      scale: 1.5,
      opacity: 1,
      transition: { duration: phaseDurations.hold }
    },
    exhale: {
      scale: [1.5, 1],
      opacity: [1, 0.7],
      transition: { duration: phaseDurations.exhale, ease: "easeInOut" }
    },
    rest: {
      scale: 1,
      opacity: 0.7,
      transition: { duration: phaseDurations.rest }
    }
  };
  const handleStart = () => {
    setIsActive(true);
  };
  const handlePause = () => {
    setIsActive(false);
  };
  const handleReset = () => {
    setIsActive(false);
    setCurrentPhase("inhale");
    setCycleCount(0);
    setTimeRemaining(Math.min(duration, totalExerciseTime));
    if (timerRef.current)
      clearInterval(timerRef.current);
  };
  const handleComplete = () => {
    setIsActive(false);
    if (timerRef.current)
      clearInterval(timerRef.current);
    if (onComplete)
      onComplete();
  };
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };
  const getInstructionText = () => {
    switch (currentPhase) {
      case "inhale":
        return "Breathe in slowly";
      case "hold":
        return "Hold your breath";
      case "exhale":
        return "Breathe out slowly";
      case "rest":
        return "Rest";
      default:
        return "";
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    Card,
    { className: cn("overflow-hidden", className), children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        CardHeader,
        { className: "pb-0", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          CardTitle,
          { className: "text-center text-lg font-medium", children: "Breathing Exercise" }
        ) }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        CardContent,
        { className: "flex flex-col items-center justify-center p-6 text-center", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "div",
            { className: "relative flex items-center justify-center mb-6 h-48 w-48", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 rounded-full bg-primary/5 animate-pulse" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                motion.div,
                {
                  className: "absolute rounded-full bg-gradient-to-r from-primary/40 to-primary/60 backdrop-blur-sm",
                  style: { width: "60%", height: "60%" },
                  variants: circleVariants,
                  animate: isActive ? currentPhase : "rest"
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "div",
                { className: "relative z-10 flex flex-col items-center justify-center", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "span",
                    { className: "text-lg font-medium mb-1", children: isActive ? getInstructionText() : "Ready?" }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "span",
                    { className: "text-sm text-muted-foreground", children: formatTime(timeRemaining) }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(
                    "span",
                    { className: "text-xs text-muted-foreground mt-1", children: [
                      "Cycle ",
                      cycleCount + 1,
                      " of ",
                      breathCycles
                    ] }
                  )
                ] }
              )
            ] }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "div",
            { className: "space-y-2 w-full max-w-xs", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "p",
                { className: "text-sm text-muted-foreground mb-4", children: "Focus on your breathing to reduce cravings and stress." }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "div",
                { className: "flex justify-center space-x-2", children: [
                  !isActive ? /* @__PURE__ */ jsxRuntimeExports.jsxs(
                    Button,
                    {
                      onClick: handleStart,
                      className: "w-full",
                      variant: "default",
                      children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx(Play, { className: "mr-2 h-4 w-4" }),
                        "Start"
                      ]
                    }
                  ) : /* @__PURE__ */ jsxRuntimeExports.jsxs(
                    Button,
                    {
                      onClick: handlePause,
                      className: "w-full",
                      variant: "outline",
                      children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx(Pause, { className: "mr-2 h-4 w-4" }),
                        "Pause"
                      ]
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    Button,
                    {
                      onClick: handleReset,
                      variant: "outline",
                      disabled: timeRemaining === Math.min(duration, totalExerciseTime) && !isActive,
                      children: /* @__PURE__ */ jsxRuntimeExports.jsx(RotateCcw, { className: "h-4 w-4" })
                    }
                  )
                ] }
              )
            ] }
          )
        ] }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        CardFooter,
        { className: "pt-0 flex justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Button,
          {
            variant: "ghost",
            size: "sm",
            className: "text-xs text-muted-foreground",
            onClick: handleComplete,
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(CheckCircle, { className: "mr-1 h-3 w-3" }),
              "Complete Exercise"
            ]
          }
        ) }
      )
    ] }
  );
}

function DotPattern({
  className,
  dotColor = "currentColor",
  dotSize = 1,
  spacing = 16,
  width = 20,
  height = 20
}) {
  const generatePattern = () => {
    const patternId = `dot-pattern-${Math.random().toString(36).substring(2, 9)}`;
    return /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "svg",
      {
        width: "100%",
        height: "100%",
        xmlns: "http://www.w3.org/2000/svg",
        className: cn("overflow-visible", className),
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "defs",
            { children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              "pattern",
              {
                id: patternId,
                width: spacing,
                height: spacing,
                patternUnits: "userSpaceOnUse",
                children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "circle",
                  {
                    cx: spacing / 2,
                    cy: spacing / 2,
                    r: dotSize,
                    fill: dotColor
                  }
                )
              }
            ) }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx("rect", { width: "100%", height: "100%", fill: `url(#${patternId})` })
        ]
      }
    );
  };
  return generatePattern();
}

const {useState,useEffect} = await importShared('react');

const {useNavigate} = await importShared('react-router-dom');

const {format,differenceInDays,differenceInHours} = await importShared('date-fns');
const {Trophy,Clock,DollarSign,Heart,Brain,Activity,Utensils,AlertCircle,Plus,Sparkles,Zap,Wind,Thermometer,User,ChevronRight,Share2,Loader2} = await importShared('lucide-react');
const Lungs = () => /* @__PURE__ */ jsxRuntimeExports.jsx(Thermometer, { className: "h-4 w-4" });
const getHealthImprovements = (quitDate) => {
  const now = /* @__PURE__ */ new Date();
  const hoursSinceQuit = differenceInHours(now, quitDate);
  const daysSinceQuit = differenceInDays(now, quitDate);
  const improvements = [
    {
      title: "20 Minutes",
      description: "Blood pressure and pulse rate drop to normal",
      achieved: hoursSinceQuit >= 0.33,
      daysRequired: 83e-4,
      icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Heart, { className: "h-5 w-5 text-rose-500" }),
      progress: Math.min(100, hoursSinceQuit / 0.33 * 100)
    },
    {
      title: "8 Hours",
      description: "Carbon monoxide levels in blood drop to normal",
      achieved: hoursSinceQuit >= 8,
      daysRequired: 0.33,
      icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Wind, { className: "h-5 w-5 text-blue-500" }),
      progress: Math.min(100, hoursSinceQuit / 8 * 100)
    },
    {
      title: "24 Hours",
      description: "Risk of heart attack begins to decrease",
      achieved: hoursSinceQuit >= 24,
      daysRequired: 1,
      icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Heart, { className: "h-5 w-5 text-rose-500" }),
      progress: Math.min(100, hoursSinceQuit / 24 * 100)
    },
    {
      title: "48 Hours",
      description: "Nerve endings start to regrow, sense of taste and smell improve",
      achieved: hoursSinceQuit >= 48,
      daysRequired: 2,
      icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Brain, { className: "h-5 w-5 text-purple-500" }),
      progress: Math.min(100, hoursSinceQuit / 48 * 100)
    },
    {
      title: "72 Hours",
      description: "Bronchial tubes relax, making breathing easier",
      achieved: hoursSinceQuit >= 72,
      daysRequired: 3,
      icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Lungs, {}),
      progress: Math.min(100, hoursSinceQuit / 72 * 100)
    },
    {
      title: "2 Weeks",
      description: "Circulation improves, lung function increases",
      achieved: daysSinceQuit >= 14,
      daysRequired: 14,
      icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Activity, { className: "h-5 w-5 text-green-500" }),
      progress: Math.min(100, daysSinceQuit / 14 * 100)
    },
    {
      title: "1 Month",
      description: "Cilia regrow in lungs, reducing infection risk",
      achieved: daysSinceQuit >= 30,
      daysRequired: 30,
      icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Lungs, {}),
      progress: Math.min(100, daysSinceQuit / 30 * 100)
    },
    {
      title: "3 Months",
      description: "Circulation and lung function significantly improved",
      achieved: daysSinceQuit >= 90,
      daysRequired: 90,
      icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Activity, { className: "h-5 w-5 text-green-500" }),
      progress: Math.min(100, daysSinceQuit / 90 * 100)
    },
    {
      title: "1 Year",
      description: "Risk of coronary heart disease is half that of a smoker",
      achieved: daysSinceQuit >= 365,
      daysRequired: 365,
      icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Heart, { className: "h-5 w-5 text-rose-500" }),
      progress: Math.min(100, daysSinceQuit / 365 * 100)
    }
  ];
  return improvements;
};
const Dashboard = () => {
  const { session } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [userStats, setUserStats] = useState({
    daysSinceStopped: 0,
    hoursSinceStopped: 0,
    cigarettesAvoided: 0,
    moneySaved: 0,
    healthProgress: 0,
    lifetimeRecovered: 0,
    streakData: [],
    quitDate: /* @__PURE__ */ new Date(),
    dailyConsumptionBefore: 20,
    costPerPack: 10,
    cigarettesPerPack: 20
  });
  const [recentCravings, setRecentCravings] = useState([]);
  const [upcomingMilestones, setUpcomingMilestones] = useState([]);
  const [showBreathingExercise, setShowBreathingExercise] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [showEmergencyHelp, setShowEmergencyHelp] = useState(false);
  const healthImprovements = getHealthImprovements(userStats.quitDate);
  const nextMilestone = upcomingMilestones.length > 0 ? upcomingMilestones[0] : null;
  useEffect(() => {
    const fetchData = async () => {
      if (!session?.user?.id)
        return;
      setLoading(true);
      try {
        const profileResponse = await supabaseRestCall(
          `/rest/v1/user_profiles8?user_id=eq.${session.user.id}`,
          { method: "GET" },
          session
        );
        if (profileResponse && profileResponse.length > 0) {
          const profile = profileResponse[0];
          const quitDateObj = profile.quit_date ? new Date(profile.quit_date) : /* @__PURE__ */ new Date();
          const now = /* @__PURE__ */ new Date();
          const hoursSinceStopped = Math.max(0, differenceInHours(now, quitDateObj));
          const daysSinceStopped = Math.max(0, differenceInDays(now, quitDateObj));
          const dailyConsumptionBefore = profile.daily_consumption || 20;
          const costPerPack = profile.cost_per_pack || 10;
          const cigarettesPerPack = profile.cigarettes_per_pack || 20;
          const cigarettesAvoided = Math.round(daysSinceStopped * dailyConsumptionBefore);
          const costPerCigarette = costPerPack / cigarettesPerPack;
          const moneySaved = Math.round(cigarettesAvoided * costPerCigarette * 100) / 100;
          const lifetimeRecovered = Math.round(cigarettesAvoided * 11);
          const cravingsResponse = await supabaseRestCall(
            `/rest/v1/craving_records8?user_id=eq.${session.user.id}&order=created_at.desc&limit=5`,
            { method: "GET" },
            session
          );
          const streakResponse = await supabaseRestCall(
            `/rest/v1/daily_logs8?user_id=eq.${session.user.id}&order=log_date.desc&limit=14`,
            { method: "GET" },
            session
          );
          const streakData = streakResponse || [];
          const milestonesResponse = await supabaseRestCall(
            `/rest/v1/user_milestones8?user_id=eq.${session.user.id}&is_completed=eq.false&order=day_number.asc&limit=3`,
            { method: "GET" },
            session
          );
          setUserStats({
            daysSinceStopped,
            hoursSinceStopped,
            cigarettesAvoided,
            moneySaved,
            healthProgress: Math.min(100, daysSinceStopped / 365 * 100),
            lifetimeRecovered,
            streakData,
            quitDate: quitDateObj,
            dailyConsumptionBefore,
            costPerPack,
            cigarettesPerPack
          });
          setRecentCravings(cravingsResponse || []);
          setUpcomingMilestones(milestonesResponse || []);
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        ue.error("Error loading dashboard", {
          description: "Please try again later"
        });
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [session]);
  const renderEmergencyHelp = () => {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      Dialog,
      { open: showEmergencyHelp, onOpenChange: setShowEmergencyHelp, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
        DialogContent,
        { className: "sm:max-w-md", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            DialogHeader,
            { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                DialogTitle,
                { className: "flex items-center", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(AlertCircle, { className: "h-5 w-5 text-red-500 mr-2" }),
                  "Emergency Help for Cravings"
                ] }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                DialogDescription,
                { children: "Try these evidence-based techniques to overcome your craving" }
              )
            ] }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "div",
            { className: "space-y-4 mt-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "div",
                { className: "bg-slate-50 p-3 rounded-lg", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(
                    "h4",
                    { className: "font-medium text-sm flex items-center", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { className: "h-4 w-4 mr-2 text-blue-500" }),
                      " Delay (5-10 minutes)"
                    ] }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm mt-1", children: "Cravings typically pass within 5-10 minutes. Wait it out!" })
                ] }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "div",
                { className: "bg-slate-50 p-3 rounded-lg", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(
                    "h4",
                    { className: "font-medium text-sm flex items-center", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(Wind, { className: "h-4 w-4 mr-2 text-blue-500" }),
                      " Deep Breathing"
                    ] }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm mt-1", children: "Take 10 slow, deep breaths to calm your mind and body." }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    Button,
                    {
                      variant: "outline",
                      size: "sm",
                      className: "mt-2",
                      onClick: () => {
                        setShowEmergencyHelp(false);
                        setShowBreathingExercise(true);
                      },
                      children: "Start Breathing Exercise"
                    }
                  )
                ] }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "div",
                { className: "bg-slate-50 p-3 rounded-lg", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(
                    "h4",
                    { className: "font-medium text-sm flex items-center", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(Utensils, { className: "h-4 w-4 mr-2 text-blue-500" }),
                      " Drink Water"
                    ] }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm mt-1", children: "Drink a large glass of water slowly to help reduce cravings." })
                ] }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "div",
                { className: "bg-slate-50 p-3 rounded-lg", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(
                    "h4",
                    { className: "font-medium text-sm flex items-center", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(Activity, { className: "h-4 w-4 mr-2 text-blue-500" }),
                      " Distract Yourself"
                    ] }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm mt-1", children: "Change your environment or activity for a few minutes." })
                ] }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Button,
                {
                  className: "w-full mt-2",
                  onClick: () => {
                    navigate("/app/coping-strategies");
                    setShowEmergencyHelp(false);
                  },
                  children: "View All Coping Strategies"
                }
              )
            ] }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            DialogFooter,
            { className: "flex items-center justify-between sm:justify-between", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Button,
                { variant: "outline", onClick: () => setShowEmergencyHelp(false), children: "Close" }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Button,
                {
                  onClick: () => {
                    navigate("/app/craving-history");
                    setShowEmergencyHelp(false);
                  },
                  children: "Log This Craving"
                }
              )
            ] }
          )
        ] }
      ) }
    );
  };
  const renderBreathingExercise = () => {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      Dialog,
      { open: showBreathingExercise, onOpenChange: setShowBreathingExercise, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
        DialogContent,
        { className: "sm:max-w-md", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            DialogHeader,
            { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Breathing Exercise" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                DialogDescription,
                { children: "Follow the animation and breathe slowly" }
              )
            ] }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "div",
            { className: "py-6", children: /* @__PURE__ */ jsxRuntimeExports.jsx(BreathingExercise, {}) }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            DialogFooter,
            { children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              Button,
              { onClick: () => setShowBreathingExercise(false), children: "Done" }
            ) }
          )
        ] }
      ) }
    );
  };
  if (loading) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "div",
      { className: "flex flex-col items-center justify-center min-h-[50vh] p-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Loader2, { className: "h-8 w-8 animate-spin text-primary" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground mt-4", children: "Loading your dashboard..." })
      ] }
    );
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "div",
    { className: "space-y-6", children: [
      renderEmergencyHelp(),
      renderBreathingExercise(),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "div",
        { className: "relative overflow-hidden rounded-xl border bg-gradient-to-r from-blue-50 to-indigo-50 p-6 shadow-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(DotPattern, { className: "absolute inset-0 opacity-5" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "div",
            { className: "relative", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "div",
              { className: "grid grid-cols-1 md:grid-cols-2 gap-4 items-center", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  "div",
                  { children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      "h1",
                      { className: "text-2xl font-bold tracking-tight mb-2", children: "Welcome back" }
                    ),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs(
                      "p",
                      { className: "text-muted-foreground", children: [
                        "You're on day ",
                        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold text-primary", children: userStats.daysSinceStopped }),
                        " of your smoke-free journey."
                      ] }
                    ),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs(
                      "div",
                      { className: "mt-4 space-y-3", children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsxs(
                          "div",
                          { className: "flex items-center gap-2", children: [
                            /* @__PURE__ */ jsxRuntimeExports.jsx(Trophy, { className: "h-5 w-5 text-amber-500" }),
                            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-sm", children: [userStats.cigarettesAvoided, " cigarettes avoided"] })
                          ] }
                        ),
                        /* @__PURE__ */ jsxRuntimeExports.jsxs(
                          "div",
                          { className: "flex items-center gap-2", children: [
                            /* @__PURE__ */ jsxRuntimeExports.jsx(DollarSign, { className: "h-5 w-5 text-green-500" }),
                            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-sm", children: ["$", userStats.moneySaved.toFixed(2), " saved"] })
                          ] }
                        ),
                        /* @__PURE__ */ jsxRuntimeExports.jsxs(
                          "div",
                          { className: "flex items-center gap-2", children: [
                            /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { className: "h-5 w-5 text-purple-500" }),
                            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-sm", children: [userStats.lifetimeRecovered, " minutes of life recovered"] })
                          ] }
                        )
                      ] }
                    ),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs(
                      "div",
                      { className: "mt-6 space-x-2", children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsxs(
                          Button,
                          {
                            onClick: () => setShowEmergencyHelp(true),
                            variant: "destructive",
                            className: "shadow-sm",
                            children: [
                              /* @__PURE__ */ jsxRuntimeExports.jsx(Zap, { className: "h-4 w-4 mr-2" }),
                              "Help Me With Cravings"
                            ]
                          }
                        ),
                        /* @__PURE__ */ jsxRuntimeExports.jsxs(
                          Button,
                          {
                            variant: "outline",
                            onClick: () => navigate("/app/consumption-logger"),
                            children: [
                              /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-4 w-4 mr-2" }),
                              "Log Activity"
                            ]
                          }
                        )
                      ] }
                    )
                  ] }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "div",
                  { className: "flex justify-center md:justify-end", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "div",
                    { className: "relative", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                      SmoothProgressRing,
                      {
                        value: userStats.healthProgress,
                        strokeWidth: 8,
                        size: 180,
                        valueLabel: `${userStats.daysSinceStopped}`,
                        label: "Days",
                        className: "drop-shadow-md"
                      }
                    ) }
                  ) }
                )
              ] }
            ) }
          )
        ] }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        Tabs,
        {
          defaultValue: "overview",
          value: activeTab,
          onValueChange: setActiveTab,
          className: "space-y-4",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              TabsList,
              { className: "grid grid-cols-3 h-auto p-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "overview", className: "py-2", children: "Overview" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "health", className: "py-2", children: "Health Progress" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "milestones", className: "py-2", children: "Milestones" })
              ] }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              TabsContent,
              { value: "overview", className: "space-y-4", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  "div",
                  { className: "grid grid-cols-2 md:grid-cols-4 gap-3", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsxs(
                      Button,
                      {
                        variant: "outline",
                        className: "h-auto flex flex-col items-center justify-center py-4 shadow-sm hover:shadow border",
                        onClick: () => navigate("/app/craving-history"),
                        children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsx(Activity, { className: "h-8 w-8 mb-2 text-purple-500" }),
                          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs", children: "Track Cravings" })
                        ]
                      }
                    ),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs(
                      Button,
                      {
                        variant: "outline",
                        className: "h-auto flex flex-col items-center justify-center py-4 shadow-sm hover:shadow border",
                        onClick: () => navigate("/app/withdrawal-tracker"),
                        children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsx(Brain, { className: "h-8 w-8 mb-2 text-blue-500" }),
                          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs", children: "Withdrawal" })
                        ]
                      }
                    ),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs(
                      Button,
                      {
                        variant: "outline",
                        className: "h-auto flex flex-col items-center justify-center py-4 shadow-sm hover:shadow border",
                        onClick: () => navigate("/app/financial-impact"),
                        children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsx(DollarSign, { className: "h-8 w-8 mb-2 text-green-500" }),
                          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs", children: "Finances" })
                        ]
                      }
                    ),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs(
                      Button,
                      {
                        variant: "outline",
                        className: "h-auto flex flex-col items-center justify-center py-4 shadow-sm hover:shadow border",
                        onClick: () => navigate("/app/health-timeline"),
                        children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsx(Heart, { className: "h-8 w-8 mb-2 text-rose-500" }),
                          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs", children: "Health" })
                        ]
                      }
                    )
                  ] }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  Card,
                  { children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      CardHeader,
                      { className: "pb-2", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
                        "div",
                        { className: "flex justify-between items-center", children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-lg font-medium", children: "Recent Cravings" }),
                          /* @__PURE__ */ jsxRuntimeExports.jsxs(
                            Button,
                            {
                              variant: "ghost",
                              size: "sm",
                              onClick: () => navigate("/app/craving-history"),
                              className: "text-xs",
                              children: [
                                "View All ",
                                /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { className: "ml-1 h-4 w-4" })
                              ]
                            }
                          )
                        ] }
                      ) }
                    ),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      CardContent,
                      { children: recentCravings.length > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(
                        "div",
                        { className: "space-y-3", children: recentCravings.map(
                          (craving, index) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
                            "div",
                            { className: "flex items-center justify-between py-2 border-b last:border-0", children: [
                              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                                "div",
                                { className: "flex items-center gap-3", children: [
                                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                                    "div",
                                    { className: "w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Zap, { className: "h-4 w-4" }) }
                                  ),
                                  /* @__PURE__ */ jsxRuntimeExports.jsxs(
                                    "div",
                                    { children: [
                                      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-medium", children: craving.trigger || "Craving" }),
                                      /* @__PURE__ */ jsxRuntimeExports.jsx(
                                        "p",
                                        { className: "text-xs text-muted-foreground", children: format(new Date(craving.created_at), "MMM d, h:mm a") }
                                      )
                                    ] }
                                  )
                                ] }
                              ),
                              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                                Badge,
                                { variant: craving.intensity > 7 ? "destructive" : craving.intensity > 4 ? "default" : "outline", children: [
                                  craving.intensity,
                                  "/10"
                                ] }
                              )
                            ] },
                            index
                          )
                        ) }
                      ) : /* @__PURE__ */ jsxRuntimeExports.jsxs(
                        "div",
                        { className: "flex flex-col items-center justify-center py-6 text-center", children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsx(
                            "div",
                            { className: "w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { className: "h-6 w-6 text-primary" }) }
                          ),
                          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground text-sm", children: "No cravings recorded yet!" }),
                          /* @__PURE__ */ jsxRuntimeExports.jsx(
                            "p",
                            { className: "text-xs text-muted-foreground mt-1", children: "Track your cravings to identify patterns and triggers" }
                          ),
                          /* @__PURE__ */ jsxRuntimeExports.jsx(
                            Button,
                            {
                              variant: "outline",
                              size: "sm",
                              className: "mt-4",
                              onClick: () => navigate("/app/craving-history"),
                              children: "Log a Craving"
                            }
                          )
                        ] }
                      ) }
                    )
                  ] }
                ),
                nextMilestone && /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  Card,
                  { children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      CardHeader,
                      { className: "pb-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-lg font-medium", children: "Next Milestone" }) }
                    ),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs(
                      CardContent,
                      { children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx(
                          MilestoneCard,
                          {
                            title: nextMilestone.title,
                            description: nextMilestone.description,
                            date: /* @__PURE__ */ new Date(),
                            daysToGo: Math.max(0, nextMilestone.day_number - userStats.daysSinceStopped),
                            icon: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trophy, { className: "h-5 w-5 text-amber-500" }) }),
                            className: "border-0 shadow-none",
                            type: "achievement"
                          }
                        ),
                        /* @__PURE__ */ jsxRuntimeExports.jsx(
                          "div",
                          { className: "mt-4 text-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                            Button,
                            {
                              variant: "outline",
                              size: "sm",
                              onClick: () => navigate("/app/quit-plan"),
                              children: "View All Milestones"
                            }
                          ) }
                        )
                      ] }
                    )
                  ] }
                )
              ] }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              TabsContent,
              { value: "health", className: "space-y-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
                Card,
                { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(
                    CardHeader,
                    { className: "pb-2", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-lg font-medium", children: "Health Recovery Timeline" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(
                        CardDescription,
                        { children: "Track your body's recovery from smoking" }
                      )
                    ] }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(
                    CardContent,
                    { className: "pt-0", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(
                        "div",
                        { className: "space-y-4", children: healthImprovements.map(
                          (improvement, index) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
                            "div",
                            { className: "relative", children: [
                              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                                "div",
                                { className: "flex items-start gap-3", children: [
                                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                                    "div",
                                    { className: `w-9 h-9 rounded-full flex items-center justify-center ${improvement.achieved ? "bg-green-100" : "bg-gray-100"}`, children: improvement.icon }
                                  ),
                                  /* @__PURE__ */ jsxRuntimeExports.jsxs(
                                    "div",
                                    { className: "flex-1", children: [
                                      /* @__PURE__ */ jsxRuntimeExports.jsxs(
                                        "h4",
                                        { className: "text-sm font-medium flex items-center", children: [
                                          improvement.title,
                                          improvement.achieved && /* @__PURE__ */ jsxRuntimeExports.jsx(
                                            Badge,
                                            { className: "ml-2 bg-green-100 text-green-800 border-green-200", children: "Achieved" }
                                          )
                                        ] }
                                      ),
                                      /* @__PURE__ */ jsxRuntimeExports.jsx(
                                        "p",
                                        { className: "text-xs text-muted-foreground mt-1", children: improvement.description }
                                      ),
                                      /* @__PURE__ */ jsxRuntimeExports.jsx(
                                        Progress,
                                        {
                                          value: improvement.progress,
                                          className: "h-1.5 mt-2"
                                        }
                                      )
                                    ] }
                                  )
                                ] }
                              ),
                              index < healthImprovements.length - 1 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute top-9 left-4 w-px h-4 bg-border" })
                            ] },
                            index
                          )
                        ) }
                      ),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(
                        "div",
                        { className: "flex justify-center mt-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                          Button,
                          {
                            onClick: () => navigate("/app/health-timeline"),
                            variant: "outline",
                            children: "View Detailed Health Timeline"
                          }
                        ) }
                      )
                    ] }
                  )
                ] }
              ) }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              TabsContent,
              { value: "milestones", className: "space-y-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
                Card,
                { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(
                    CardHeader,
                    { className: "pb-2", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-lg font-medium", children: "Your Journey Milestones" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(
                        CardDescription,
                        { children: "Track your progress and celebrate achievements" }
                      )
                    ] }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    CardContent,
                    { className: "pt-0", children: upcomingMilestones.length > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs(
                      "div",
                      { className: "space-y-4", children: [
                        upcomingMilestones.map(
                          (milestone, index) => /* @__PURE__ */ jsxRuntimeExports.jsx(
                            MilestoneCard,
                            {
                              title: milestone.title,
                              description: milestone.description,
                              date: /* @__PURE__ */ new Date(),
                              daysToGo: Math.max(0, milestone.day_number - userStats.daysSinceStopped),
                              icon: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trophy, { className: "h-5 w-5 text-amber-500" }) }),
                              className: "border shadow-sm",
                              type: "achievement"
                            },
                            index
                          )
                        ),
                        /* @__PURE__ */ jsxRuntimeExports.jsx(
                          "div",
                          { className: "flex justify-center mt-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                            Button,
                            {
                              onClick: () => navigate("/app/quit-plan"),
                              variant: "outline",
                              children: "View All Milestones"
                            }
                          ) }
                        )
                      ] }
                    ) : /* @__PURE__ */ jsxRuntimeExports.jsxs(
                      "div",
                      { className: "flex flex-col items-center justify-center py-6 text-center", children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx(
                          "div",
                          { className: "w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trophy, { className: "h-6 w-6 text-primary" }) }
                        ),
                        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground text-sm", children: "No milestones set yet!" }),
                        /* @__PURE__ */ jsxRuntimeExports.jsx(
                          "p",
                          { className: "text-xs text-muted-foreground mt-1", children: "Set up your quit plan to create personalized milestones" }
                        ),
                        /* @__PURE__ */ jsxRuntimeExports.jsx(
                          Button,
                          {
                            variant: "outline",
                            size: "sm",
                            className: "mt-4",
                            onClick: () => navigate("/app/quit-plan"),
                            children: "Create Quit Plan"
                          }
                        )
                      ] }
                    ) }
                  )
                ] }
              ) }
            )
          ]
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Card,
        { className: "bg-gradient-to-r from-primary/5 to-primary/10 overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          CardContent,
          { className: "p-6 relative", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "div",
            { className: "flex items-center justify-between", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "div",
                { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-medium text-lg", children: "Share Your Progress" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "p",
                    { className: "text-sm text-muted-foreground mt-1", children: "Inspire others with your smoke-free journey" }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(
                    Button,
                    {
                      className: "mt-4",
                      onClick: () => navigate("/app/share"),
                      children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx(Share2, { className: "h-4 w-4 mr-2" }),
                        "Share Journey"
                      ]
                    }
                  )
                ] }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "div",
                { className: "hidden md:block", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  "div",
                  { className: "bg-white p-4 rounded-lg shadow-md rotate-3 transform", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsxs(
                      "div",
                      { className: "flex items-center gap-2 mb-2", children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx(User, { className: "h-5 w-5 text-primary" }),
                        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-medium", children: "Your Progress" })
                      ] }
                    ),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs(
                      "div",
                      { className: "text-2xl font-bold mb-1", children: [
                        userStats.daysSinceStopped,
                        " Days"
                      ] }
                    ),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs(
                      "div",
                      { className: "text-sm text-muted-foreground", children: [
                        "$",
                        userStats.moneySaved.toFixed(2),
                        " saved"
                      ] }
                    )
                  ] }
                ) }
              )
            ] }
          ) }
        ) }
      )
    ] }
  );
};

export { Dashboard, MilestoneCard as M };

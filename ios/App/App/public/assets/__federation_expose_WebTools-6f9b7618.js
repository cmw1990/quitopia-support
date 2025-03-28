import { i as importShared } from './react-vendor-773e5a75.js';
import { T as Tabs, a as TabsList, b as TabsTrigger, c as TabsContent, e as Select, f as SelectTrigger, g as SelectValue, h as SelectContent, i as SelectItem, j as Slider, B as Button } from './toast-58ac552a.js';
import './textarea-ba0b28ab.js';
import { C as Card, a as CardHeader, b as CardTitle, c as CardDescription, d as CardContent, e as CardFooter } from './card-7a71f808.js';
import { u as useAuth, a as ue } from './AuthProvider-b0b4665b.js';
import { s as supabaseRestCall } from './missionFreshApiClient-3e62d1ad.js';
import { j as jsxRuntimeExports } from './ui-vendor-336c871f.js';

const {useState,useEffect,useRef} = await importShared('react');
const {Wind,Brain,Zap,Pause,Play,RefreshCw,Clock,Volume2,VolumeX,Check,Save} = await importShared('lucide-react');

const {motion,AnimatePresence} = await importShared('framer-motion');
const BREATHING_PATTERNS = [
  {
    id: "box",
    name: "Box Breathing",
    description: "Equal inhale, hold, exhale, and hold to induce calm during cravings",
    inhale: 4,
    hold1: 4,
    exhale: 4,
    hold2: 4,
    color: "bg-sky-500"
  },
  {
    id: "relaxing",
    name: "Relaxing Breath",
    description: "A longer exhale helps calm the nervous system",
    inhale: 4,
    hold1: 0,
    exhale: 8,
    hold2: 0,
    color: "bg-indigo-500"
  },
  {
    id: "energizing",
    name: "Energizing Breath",
    description: "Quick inhale and exhale to increase energy and focus",
    inhale: 2,
    hold1: 0,
    exhale: 2,
    hold2: 0,
    color: "bg-amber-500"
  },
  {
    id: "478",
    name: "4-7-8 Technique",
    description: "Inhale for 4, hold for 7, exhale for 8 to manage stress and cravings",
    inhale: 4,
    hold1: 7,
    exhale: 8,
    hold2: 0,
    color: "bg-emerald-500"
  },
  {
    id: "custom",
    name: "Custom Pattern",
    description: "Create your own breathing pattern",
    inhale: 4,
    hold1: 4,
    exhale: 4,
    hold2: 4,
    color: "bg-purple-500"
  }
];
const DISTRACTION_TECHNIQUES = [
  {
    id: "fist",
    title: "Fist Clenching",
    description: "Clench your fists tightly for 15 seconds, then release slowly. Repeat 3 times.",
    icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Zap, { className: "h-6 w-6" })
  },
  {
    id: "counting",
    title: "Counting Technique",
    description: "Count backward from 100 by 3s (100, 97, 94...) to redirect your focus.",
    icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Brain, { className: "h-6 w-6" })
  },
  {
    id: "water",
    title: "Water Technique",
    description: "Drink a glass of water slowly, focusing on the sensation of each sip.",
    icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Wind, { className: "h-6 w-6" })
  },
  {
    id: "5senses",
    title: "5 Senses Grounding",
    description: "Identify 5 things you can see, 4 you can touch, 3 you can hear, 2 you can smell, and 1 you can taste.",
    icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Brain, { className: "h-6 w-6" })
  },
  {
    id: "delay",
    title: "Delay Technique",
    description: "Tell yourself you'll wait just 5 more minutes before giving in to a craving. Then extend it again.",
    icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { className: "h-6 w-6" })
  }
];
const WebTools = ({ name }) => {
  const { session } = useAuth();
  const [activeTab, setActiveTab] = useState("breathing");
  const [selectedPattern, setSelectedPattern] = useState(BREATHING_PATTERNS[0]);
  const [customPattern, setCustomPattern] = useState({
    ...BREATHING_PATTERNS[4]
  });
  const [breathingState, setBreathingState] = useState(
    "inhale"
  );
  const [isBreathingActive, setIsBreathingActive] = useState(false);
  const [countdown, setCountdown] = useState(4);
  const [breathingCycles, setBreathingCycles] = useState(0);
  const [targetCycles, setTargetCycles] = useState(10);
  const [volume, setVolume] = useState(true);
  const [recentCravingLogs, setRecentCravingLogs] = useState([]);
  const [cravingIntensity, setCravingIntensity] = useState(5);
  const [cravingNotes, setCravingNotes] = useState("");
  const [selectedTechnique, setSelectedTechnique] = useState("");
  const [cravingLogsLoading, setCravingLogsLoading] = useState(false);
  const inhaleSound = useRef(null);
  const exhaleSound = useRef(null);
  const holdSound = useRef(null);
  const timerRef = useRef(null);
  useEffect(() => {
    inhaleSound.current = new Audio("/sounds/inhale.mp3");
    exhaleSound.current = new Audio("/sounds/exhale.mp3");
    holdSound.current = new Audio("/sounds/hold.mp3");
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);
  useEffect(() => {
    if (session?.user?.id) {
      fetchCravingLogs();
    }
  }, [session?.user?.id]);
  const fetchCravingLogs = async () => {
    if (!session)
      return;
    setCravingLogsLoading(true);
    try {
      const logs = await supabaseRestCall(
        `/rest/v1/craving_logs8?user_id=eq.${session.user.id}&order=created_at.desc&limit=5`,
        { method: "GET" },
        session
      );
      setRecentCravingLogs(logs || []);
    } catch (error) {
      console.error("Failed to fetch craving logs:", error);
    } finally {
      setCravingLogsLoading(false);
    }
  };
  const startBreathing = () => {
    setIsBreathingActive(true);
    setBreathingState("inhale");
    setCountdown(selectedPattern.id === "custom" ? customPattern.inhale : selectedPattern.inhale);
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    timerRef.current = window.setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          setBreathingState((currentState) => {
            if (volume) {
              switch (currentState) {
                case "inhale":
                  holdSound.current?.play();
                  break;
                case "hold1":
                  exhaleSound.current?.play();
                  break;
                case "exhale":
                  holdSound.current?.play();
                  break;
                case "hold2":
                  inhaleSound.current?.play();
                  break;
              }
            }
            switch (currentState) {
              case "inhale":
                return selectedPattern.hold1 > 0 ? "hold1" : "exhale";
              case "hold1":
                return "exhale";
              case "exhale":
                return selectedPattern.hold2 > 0 ? "hold2" : "inhale";
              case "hold2":
                setBreathingCycles((prev2) => {
                  const newCount = prev2 + 1;
                  if (newCount >= targetCycles) {
                    stopBreathing();
                    ue.success(`Completed ${targetCycles} breathing cycles!`);
                  }
                  return newCount;
                });
                return "inhale";
              default:
                return "inhale";
            }
          });
          switch (breathingState) {
            case "inhale":
              return selectedPattern.id === "custom" ? customPattern.hold1 || customPattern.exhale : selectedPattern.hold1 || selectedPattern.exhale;
            case "hold1":
              return selectedPattern.id === "custom" ? customPattern.exhale : selectedPattern.exhale;
            case "exhale":
              return selectedPattern.id === "custom" ? customPattern.hold2 || customPattern.inhale : selectedPattern.hold2 || selectedPattern.inhale;
            case "hold2":
              return selectedPattern.id === "custom" ? customPattern.inhale : selectedPattern.inhale;
            default:
              return selectedPattern.id === "custom" ? customPattern.inhale : selectedPattern.inhale;
          }
        }
        return prev - 1;
      });
    }, 1e3);
  };
  const pauseBreathing = () => {
    setIsBreathingActive(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };
  const stopBreathing = () => {
    pauseBreathing();
    setBreathingCycles(0);
    setBreathingState("inhale");
    setCountdown(selectedPattern.id === "custom" ? customPattern.inhale : selectedPattern.inhale);
  };
  const toggleVolume = () => {
    setVolume(!volume);
  };
  const handlePatternChange = (id) => {
    const pattern = BREATHING_PATTERNS.find((p) => p.id === id) || BREATHING_PATTERNS[0];
    setSelectedPattern(pattern);
    stopBreathing();
  };
  const handleSaveCravingLog = async () => {
    if (!session) {
      ue.error("You must be logged in to save your craving log");
      return;
    }
    try {
      const newLog = {
        user_id: session.user.id,
        intensity: cravingIntensity,
        notes: cravingNotes,
        coping_strategy_used: selectedTechnique,
        created_at: (/* @__PURE__ */ new Date()).toISOString(),
        success: true
      };
      await supabaseRestCall(
        "/rest/v1/craving_logs8",
        {
          method: "POST",
          body: JSON.stringify(newLog)
        },
        session
      );
      ue.success("Craving log saved successfully!");
      setCravingNotes("");
      setSelectedTechnique("");
      fetchCravingLogs();
    } catch (error) {
      console.error("Failed to save craving log:", error);
      ue.error("Failed to save your craving log. Please try again.");
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "div",
    { className: "container mx-auto py-8 px-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-3xl font-bold mb-6", children: "Craving Management Tools" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "p",
        { className: "text-gray-600 mb-8", children: "These evidence-based tools will help you manage cravings, reduce stress, and stay on track with your quit journey." }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        Tabs,
        { defaultValue: activeTab, onValueChange: setActiveTab, className: "w-full", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            TabsList,
            { className: "grid grid-cols-2 mb-8", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                TabsTrigger,
                { value: "breathing", className: "flex items-center gap-2", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Wind, { className: "h-4 w-4" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Breathing Exercises" })
                ] }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                TabsTrigger,
                { value: "distraction", className: "flex items-center gap-2", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Brain, { className: "h-4 w-4" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Distraction Techniques" })
                ] }
              )
            ] }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            TabsContent,
            { value: "breathing", className: "space-y-6", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
              Card,
              { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  CardHeader,
                  { children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsxs(
                      CardTitle,
                      { className: "flex items-center gap-2", children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx(Wind, { className: "h-5 w-5 text-primary" }),
                        "Breathing Exercises"
                      ] }
                    ),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      CardDescription,
                      { children: "Deep breathing can help reduce cravings and anxiety. Select a pattern below to begin." }
                    )
                  ] }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  CardContent,
                  { className: "space-y-6", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsxs(
                      "div",
                      { className: "space-y-2", children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-sm font-medium", children: "Select Breathing Pattern" }),
                        /* @__PURE__ */ jsxRuntimeExports.jsxs(
                          Select,
                          {
                            value: selectedPattern.id,
                            onValueChange: handlePatternChange,
                            disabled: isBreathingActive,
                            children: [
                              /* @__PURE__ */ jsxRuntimeExports.jsx(
                                SelectTrigger,
                                { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select a breathing pattern" }) }
                              ),
                              /* @__PURE__ */ jsxRuntimeExports.jsx(
                                SelectContent,
                                { children: BREATHING_PATTERNS.map(
                                  (pattern) => /* @__PURE__ */ jsxRuntimeExports.jsx(
                                    SelectItem,
                                    { value: pattern.id, children: pattern.name },
                                    pattern.id
                                  )
                                ) }
                              )
                            ]
                          }
                        ),
                        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-500 mt-1", children: selectedPattern.description })
                      ] }
                    ),
                    selectedPattern.id === "custom" && /* @__PURE__ */ jsxRuntimeExports.jsxs(
                      "div",
                      { className: "border rounded-md p-4 space-y-4", children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "font-medium", children: "Custom Breathing Pattern" }),
                        /* @__PURE__ */ jsxRuntimeExports.jsxs(
                          "div",
                          { className: "space-y-2", children: [
                            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-sm font-medium", children: "Inhale Duration (seconds)" }),
                            /* @__PURE__ */ jsxRuntimeExports.jsx(
                              Slider,
                              {
                                min: 1,
                                max: 10,
                                step: 1,
                                value: [customPattern.inhale],
                                onValueChange: (value) => setCustomPattern({ ...customPattern, inhale: value[0] }),
                                disabled: isBreathingActive
                              }
                            ),
                            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-sm text-gray-600", children: [customPattern.inhale, " seconds"] })
                          ] }
                        ),
                        /* @__PURE__ */ jsxRuntimeExports.jsxs(
                          "div",
                          { className: "space-y-2", children: [
                            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-sm font-medium", children: "Hold After Inhale (seconds)" }),
                            /* @__PURE__ */ jsxRuntimeExports.jsx(
                              Slider,
                              {
                                min: 0,
                                max: 10,
                                step: 1,
                                value: [customPattern.hold1],
                                onValueChange: (value) => setCustomPattern({ ...customPattern, hold1: value[0] }),
                                disabled: isBreathingActive
                              }
                            ),
                            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-sm text-gray-600", children: [customPattern.hold1, " seconds"] })
                          ] }
                        ),
                        /* @__PURE__ */ jsxRuntimeExports.jsxs(
                          "div",
                          { className: "space-y-2", children: [
                            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-sm font-medium", children: "Exhale Duration (seconds)" }),
                            /* @__PURE__ */ jsxRuntimeExports.jsx(
                              Slider,
                              {
                                min: 1,
                                max: 10,
                                step: 1,
                                value: [customPattern.exhale],
                                onValueChange: (value) => setCustomPattern({ ...customPattern, exhale: value[0] }),
                                disabled: isBreathingActive
                              }
                            ),
                            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-sm text-gray-600", children: [customPattern.exhale, " seconds"] })
                          ] }
                        ),
                        /* @__PURE__ */ jsxRuntimeExports.jsxs(
                          "div",
                          { className: "space-y-2", children: [
                            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-sm font-medium", children: "Hold After Exhale (seconds)" }),
                            /* @__PURE__ */ jsxRuntimeExports.jsx(
                              Slider,
                              {
                                min: 0,
                                max: 10,
                                step: 1,
                                value: [customPattern.hold2],
                                onValueChange: (value) => setCustomPattern({ ...customPattern, hold2: value[0] }),
                                disabled: isBreathingActive
                              }
                            ),
                            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-sm text-gray-600", children: [customPattern.hold2, " seconds"] })
                          ] }
                        )
                      ] }
                    ),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs(
                      "div",
                      { className: "space-y-2", children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-sm font-medium", children: "Number of Cycles" }),
                        /* @__PURE__ */ jsxRuntimeExports.jsx(
                          Slider,
                          {
                            min: 1,
                            max: 20,
                            step: 1,
                            value: [targetCycles],
                            onValueChange: (value) => setTargetCycles(value[0]),
                            disabled: isBreathingActive
                          }
                        ),
                        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-sm text-gray-600", children: [targetCycles, " cycles"] })
                      ] }
                    ),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      "div",
                      { className: "flex justify-center my-8", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
                        "div",
                        { className: "relative w-64 h-64", children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsx(
                            AnimatePresence,
                            { mode: "wait", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                              motion.div,
                              {
                                initial: { scale: breathingState === "inhale" || breathingState === "hold1" ? 0.6 : 1 },
                                animate: {
                                  scale: breathingState === "inhale" || breathingState === "hold1" ? 1 : 0.6,
                                  backgroundColor: selectedPattern.id === "custom" ? customPattern.color : selectedPattern.color.replace("bg-", "")
                                },
                                transition: { duration: breathingState === "inhale" ? selectedPattern.inhale / 2 : selectedPattern.exhale / 2 },
                                className: `absolute inset-0 rounded-full flex items-center justify-center 
                        ${selectedPattern.id === "custom" ? customPattern.color : selectedPattern.color}`,
                                children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-5xl font-bold text-white", children: countdown })
                              },
                              breathingState
                            ) }
                          ),
                          /* @__PURE__ */ jsxRuntimeExports.jsx(
                            "div",
                            { className: "absolute bottom-0 left-0 w-full text-center -mb-10", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-medium capitalize", children: breathingState.replace("1", " after inhale").replace("2", " after exhale") }) }
                          ),
                          /* @__PURE__ */ jsxRuntimeExports.jsx(
                            "div",
                            { className: "absolute top-0 left-0 w-full text-center -mt-10", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-sm font-medium", children: ["Cycle: ", breathingCycles, " / ", targetCycles] }) }
                          )
                        ] }
                      ) }
                    ),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs(
                      "div",
                      { className: "flex justify-center gap-4", children: [
                        !isBreathingActive ? /* @__PURE__ */ jsxRuntimeExports.jsxs(
                          Button,
                          { onClick: startBreathing, className: "gap-2", children: [
                            /* @__PURE__ */ jsxRuntimeExports.jsx(Play, { className: "h-4 w-4" }),
                            "Start"
                          ] }
                        ) : /* @__PURE__ */ jsxRuntimeExports.jsxs(
                          Button,
                          { onClick: pauseBreathing, variant: "outline", className: "gap-2", children: [
                            /* @__PURE__ */ jsxRuntimeExports.jsx(Pause, { className: "h-4 w-4" }),
                            "Pause"
                          ] }
                        ),
                        /* @__PURE__ */ jsxRuntimeExports.jsxs(
                          Button,
                          { onClick: stopBreathing, variant: "outline", className: "gap-2", children: [
                            /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshCw, { className: "h-4 w-4" }),
                            "Reset"
                          ] }
                        ),
                        /* @__PURE__ */ jsxRuntimeExports.jsx(
                          Button,
                          { onClick: toggleVolume, variant: "ghost", className: "gap-2", children: volume ? /* @__PURE__ */ jsxRuntimeExports.jsx(Volume2, { className: "h-4 w-4" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(VolumeX, { className: "h-4 w-4" }) }
                        )
                      ] }
                    )
                  ] }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  CardFooter,
                  { className: "border-t pt-6", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "div",
                    { className: "w-full text-sm text-gray-500", children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "Tip: Try to do at least 5 cycles when you feel a craving coming on. This helps redirect your focus and calm your nervous system." }) }
                  ) }
                )
              ] }
            ) }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            TabsContent,
            { value: "distraction", className: "space-y-6", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
              Card,
              { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  CardHeader,
                  { children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsxs(
                      CardTitle,
                      { className: "flex items-center gap-2", children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx(Brain, { className: "h-5 w-5 text-primary" }),
                        "Distraction Techniques"
                      ] }
                    ),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      CardDescription,
                      { children: "Use these techniques to distract yourself from cravings and break the habit loop." }
                    )
                  ] }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  CardContent,
                  { className: "space-y-6", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      "div",
                      { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: DISTRACTION_TECHNIQUES.map(
                        (technique) => /* @__PURE__ */ jsxRuntimeExports.jsx(
                          Card,
                          {
                            className: `cursor-pointer transition-all ${selectedTechnique === technique.id ? "ring-2 ring-primary ring-offset-2" : ""}`,
                            onClick: () => setSelectedTechnique(technique.id),
                            children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
                              CardContent,
                              { className: "p-4 flex flex-col items-center text-center", children: [
                                /* @__PURE__ */ jsxRuntimeExports.jsx(
                                  "div",
                                  { className: "bg-primary/10 rounded-full p-3 mb-3", children: technique.icon }
                                ),
                                /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-medium mb-2", children: technique.title }),
                                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-600", children: technique.description })
                              ] }
                            )
                          },
                          technique.id
                        )
                      ) }
                    ),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs(
                      "div",
                      { className: "border-t pt-6 space-y-4", children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-medium", children: "Log Your Craving" }),
                        /* @__PURE__ */ jsxRuntimeExports.jsx(
                          "p",
                          { className: "text-sm text-gray-600", children: "Tracking your cravings helps identify patterns and improve your quitting strategy." }
                        ),
                        /* @__PURE__ */ jsxRuntimeExports.jsxs(
                          "div",
                          { className: "space-y-4", children: [
                            /* @__PURE__ */ jsxRuntimeExports.jsxs(
                              "div",
                              { className: "space-y-2", children: [
                                /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-sm font-medium", children: "Craving Intensity" }),
                                /* @__PURE__ */ jsxRuntimeExports.jsx(
                                  Slider,
                                  {
                                    min: 1,
                                    max: 10,
                                    step: 1,
                                    value: [cravingIntensity],
                                    onValueChange: (value) => setCravingIntensity(value[0])
                                  }
                                ),
                                /* @__PURE__ */ jsxRuntimeExports.jsxs(
                                  "div",
                                  { className: "flex justify-between text-xs text-gray-500", children: [
                                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Mild (1)" }),
                                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Moderate (5)" }),
                                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Severe (10)" })
                                  ] }
                                )
                              ] }
                            ),
                            /* @__PURE__ */ jsxRuntimeExports.jsxs(
                              "div",
                              { className: "space-y-2", children: [
                                /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-sm font-medium", children: "Notes" }),
                                /* @__PURE__ */ jsxRuntimeExports.jsx(
                                  "textarea",
                                  {
                                    className: "w-full p-2 border rounded-md",
                                    placeholder: "What triggered this craving? Where were you? What were you feeling?",
                                    rows: 3,
                                    value: cravingNotes,
                                    onChange: (e) => setCravingNotes(e.target.value)
                                  }
                                )
                              ] }
                            ),
                            /* @__PURE__ */ jsxRuntimeExports.jsxs(
                              Button,
                              {
                                onClick: handleSaveCravingLog,
                                className: "w-full",
                                disabled: !selectedTechnique,
                                children: [
                                  /* @__PURE__ */ jsxRuntimeExports.jsx(Save, { className: "h-4 w-4 mr-2" }),
                                  "Save Craving Log"
                                ]
                              }
                            )
                          ] }
                        )
                      ] }
                    ),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs(
                      "div",
                      { className: "border-t pt-6", children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-medium mb-4", children: "Recent Craving Logs" }),
                        cravingLogsLoading ? /* @__PURE__ */ jsxRuntimeExports.jsxs(
                          "div",
                          { className: "text-center py-4", children: [
                            /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshCw, { className: "h-6 w-6 animate-spin mx-auto mb-2 text-primary" }),
                            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-500", children: "Loading your logs..." })
                          ] }
                        ) : recentCravingLogs.length > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(
                          "div",
                          { className: "space-y-3", children: recentCravingLogs.map(
                            (log, index) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
                              "div",
                              { className: "border rounded-md p-3 text-sm", children: [
                                /* @__PURE__ */ jsxRuntimeExports.jsxs(
                                  "div",
                                  { className: "flex justify-between mb-2", children: [
                                    /* @__PURE__ */ jsxRuntimeExports.jsxs(
                                      "span",
                                      { className: "font-medium", children: [
                                        "Intensity: ",
                                        log.intensity,
                                        "/10"
                                      ] }
                                    ),
                                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                                      "span",
                                      { className: "text-gray-500", children: new Date(log.timestamp).toLocaleString() }
                                    )
                                  ] }
                                ),
                                log.technique_used && /* @__PURE__ */ jsxRuntimeExports.jsxs(
                                  "div",
                                  { className: "mb-1", children: [
                                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-gray-700", children: "Technique: " }),
                                    log.technique_used
                                  ] }
                                ),
                                log.notes && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-gray-600", children: log.notes }),
                                log.success && /* @__PURE__ */ jsxRuntimeExports.jsxs(
                                  "div",
                                  { className: "flex items-center gap-1 text-green-600 mt-1", children: [
                                    /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { className: "h-4 w-4" }),
                                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Successfully managed" })
                                  ] }
                                )
                              ] },
                              index
                            )
                          ) }
                        ) : /* @__PURE__ */ jsxRuntimeExports.jsx(
                          "div",
                          { className: "text-center py-4 text-gray-500", children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "No craving logs yet. Start tracking today!" }) }
                        )
                      ] }
                    )
                  ] }
                )
              ] }
            ) }
          )
        ] }
      )
    ] }
  );
};

export { WebTools };

import { i as importShared } from './react-vendor-773e5a75.js';
import { u as useAuth, a as ue } from './AuthProvider-b0b4665b.js';
import { B as Button, T as Tabs, a as TabsList, b as TabsTrigger, c as TabsContent, R as RadioGroup, d as RadioGroupItem, L as Label, C as Checkbox, S as Switch, e as Select, f as SelectTrigger, g as SelectValue, h as SelectContent, i as SelectItem, j as Slider } from './toast-58ac552a.js';
import { I as Input } from './textarea-ba0b28ab.js';
import { C as Card, a as CardHeader, b as CardTitle, c as CardDescription, d as CardContent } from './card-7a71f808.js';
import { s as supabaseRestCall } from './missionFreshApiClient-3e62d1ad.js';
import { j as jsxRuntimeExports } from './ui-vendor-336c871f.js';

const React = await importShared('react');
const {Cigarette,ZapOff,Zap,Calendar,ArrowDownRight,X,Target,Clock} = await importShared('lucide-react');
const methodGuidance = {
  cold_turkey: "You'll completely stop all nicotine use at once. This method may have more intense withdrawal symptoms initially, but they typically subside faster. We'll provide tools to manage cravings and withdrawal symptoms.",
  gradual_reduction: "You'll gradually reduce your nicotine consumption over time. We'll track your progress and help you adjust your reduction schedule based on your success and comfort level.",
  nicotine_replacement: "You'll use nicotine replacement products (patches, gum, etc.) to satisfy cravings while eliminating the harmful delivery method. We'll help you gradually reduce the replacement nicotine over time.",
  scheduled_reduction: "You'll reduce at specific scheduled intervals. For example, cutting consumption by 25% each week until you reach zero. We'll send reminders and track your progress against these milestones.",
  cut_triggers: "You'll identify specific triggers and gradually eliminate nicotine use for each trigger. We'll help you track triggers and develop alternative coping strategies for each one.",
  delay_technique: "You'll progressively delay your first and subsequent nicotine uses each day. We'll help you track and extend these delay periods until cravings diminish."
};
const Settings = () => {
  const { session } = useAuth();
  const [settings, setSettings] = React.useState({
    nicotine_product: "cigarettes",
    secondary_products: [],
    quitting_method: "cold_turkey",
    quit_date: (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
    daily_cigarettes: 20,
    cost_per_pack: 10,
    cigarettes_per_pack: 20,
    vaping_ml_per_day: 3,
    vaping_cost_per_ml: 0.5,
    vaping_nicotine_strength: 6,
    pouches_per_day: 10,
    pouches_cost_per_tin: 5,
    pouches_per_tin: 20,
    other_cost_per_week: 0,
    other_consumption_per_day: 0,
    reduction_goal_percent: 50,
    reduction_timeline_days: 30,
    replacement_product: "",
    notification_enabled: true,
    reminder_time: "09:00",
    track_triggers: true,
    track_mood: true,
    track_energy: true
  });
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState("products");
  React.useEffect(() => {
    if (session?.user?.id) {
      loadUserSettings();
    }
  }, [session]);
  const loadUserSettings = async () => {
    if (!session?.user?.id)
      return;
    setLoading(true);
    try {
      const data = await supabaseRestCall(
        `/rest/v1/user_settings8?user_id=eq.${session.user.id}&select=*`,
        { method: "GET" },
        session
      );
      if (data && data.length > 0) {
        setSettings(data[0]);
      }
    } catch (error) {
      console.error("Error loading settings:", error);
      ue.error("Failed to load settings");
    } finally {
      setLoading(false);
    }
  };
  const saveSettings = async () => {
    if (!session?.user?.id)
      return;
    setSaving(true);
    try {
      const settingsData = {
        ...settings,
        user_id: session.user.id,
        updated_at: (/* @__PURE__ */ new Date()).toISOString()
      };
      const existingSettings = await supabaseRestCall(
        `/rest/v1/user_settings8?user_id=eq.${session.user.id}`,
        { method: "GET" },
        session
      );
      if (existingSettings && existingSettings.length > 0) {
        await supabaseRestCall(
          `/rest/v1/user_settings8?user_id=eq.${session.user.id}`,
          {
            method: "PATCH",
            body: JSON.stringify(settingsData)
          },
          session
        );
      } else {
        await supabaseRestCall(
          "/rest/v1/user_settings8",
          {
            method: "POST",
            body: JSON.stringify({
              ...settingsData,
              created_at: (/* @__PURE__ */ new Date()).toISOString()
            })
          },
          session
        );
      }
      ue.success("Settings saved successfully");
    } catch (error) {
      console.error("Error saving settings:", error);
      ue.error("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };
  const toggleSecondaryProduct = (product) => {
    if (settings.secondary_products.includes(product)) {
      setSettings({
        ...settings,
        secondary_products: settings.secondary_products.filter(
          (p) => p !== product
        )
      });
    } else {
      setSettings({
        ...settings,
        secondary_products: [...settings.secondary_products, product]
      });
    }
  };
  const getConsumptionFields = () => {
    switch (settings.nicotine_product) {
      case "cigarettes":
        return /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "div",
          { className: "space-y-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "div",
              { className: "space-y-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Label,
                  { htmlFor: "daily-cigarettes", children: "Daily cigarettes (before quitting)" }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Input,
                  {
                    id: "daily-cigarettes",
                    type: "number",
                    value: settings.daily_cigarettes,
                    onChange: (e) => setSettings({
                      ...settings,
                      daily_cigarettes: Number(e.target.value)
                    })
                  }
                )
              ] }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "div",
              { className: "space-y-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "cost-per-pack", children: "Cost per pack ($)" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Input,
                  {
                    id: "cost-per-pack",
                    type: "number",
                    step: "0.01",
                    value: settings.cost_per_pack,
                    onChange: (e) => setSettings({
                      ...settings,
                      cost_per_pack: Number(e.target.value)
                    })
                  }
                )
              ] }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "div",
              { className: "space-y-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "cigarettes-per-pack", children: "Cigarettes per pack" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Input,
                  {
                    id: "cigarettes-per-pack",
                    type: "number",
                    value: settings.cigarettes_per_pack,
                    onChange: (e) => setSettings({
                      ...settings,
                      cigarettes_per_pack: Number(e.target.value)
                    })
                  }
                )
              ] }
            )
          ] }
        );
      case "vaping":
        return /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "div",
          { className: "space-y-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "div",
              { className: "space-y-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "vaping-ml-per-day", children: "ML of e-liquid per day" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Input,
                  {
                    id: "vaping-ml-per-day",
                    type: "number",
                    step: "0.1",
                    value: settings.vaping_ml_per_day,
                    onChange: (e) => setSettings({
                      ...settings,
                      vaping_ml_per_day: Number(e.target.value)
                    })
                  }
                )
              ] }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "div",
              { className: "space-y-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "vaping-cost-per-ml", children: "Cost per ML ($)" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Input,
                  {
                    id: "vaping-cost-per-ml",
                    type: "number",
                    step: "0.01",
                    value: settings.vaping_cost_per_ml,
                    onChange: (e) => setSettings({
                      ...settings,
                      vaping_cost_per_ml: Number(e.target.value)
                    })
                  }
                )
              ] }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "div",
              { className: "space-y-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Label,
                  { htmlFor: "vaping-nicotine-strength", children: "Nicotine strength (mg/mL)" }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Input,
                  {
                    id: "vaping-nicotine-strength",
                    type: "number",
                    step: "0.1",
                    value: settings.vaping_nicotine_strength,
                    onChange: (e) => setSettings({
                      ...settings,
                      vaping_nicotine_strength: Number(e.target.value)
                    })
                  }
                )
              ] }
            )
          ] }
        );
      case "nicotine_pouches":
        return /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "div",
          { className: "space-y-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "div",
              { className: "space-y-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "pouches-per-day", children: "Pouches used per day" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Input,
                  {
                    id: "pouches-per-day",
                    type: "number",
                    value: settings.pouches_per_day,
                    onChange: (e) => setSettings({
                      ...settings,
                      pouches_per_day: Number(e.target.value)
                    })
                  }
                )
              ] }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "div",
              { className: "space-y-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "pouches-cost-per-tin", children: "Cost per tin/can ($)" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Input,
                  {
                    id: "pouches-cost-per-tin",
                    type: "number",
                    step: "0.01",
                    value: settings.pouches_cost_per_tin,
                    onChange: (e) => setSettings({
                      ...settings,
                      pouches_cost_per_tin: Number(e.target.value)
                    })
                  }
                )
              ] }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "div",
              { className: "space-y-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "pouches-per-tin", children: "Pouches per tin/can" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Input,
                  {
                    id: "pouches-per-tin",
                    type: "number",
                    value: settings.pouches_per_tin,
                    onChange: (e) => setSettings({
                      ...settings,
                      pouches_per_tin: Number(e.target.value)
                    })
                  }
                )
              ] }
            )
          ] }
        );
      default:
        return /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "div",
          { className: "space-y-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "div",
              { className: "space-y-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Label,
                  { htmlFor: "other-consumption-per-day", children: "Usage per day (units or sessions)" }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Input,
                  {
                    id: "other-consumption-per-day",
                    type: "number",
                    value: settings.other_consumption_per_day,
                    onChange: (e) => setSettings({
                      ...settings,
                      other_consumption_per_day: Number(e.target.value)
                    })
                  }
                )
              ] }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "div",
              { className: "space-y-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "other-cost-per-week", children: "Weekly cost ($)" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Input,
                  {
                    id: "other-cost-per-week",
                    type: "number",
                    step: "0.01",
                    value: settings.other_cost_per_week,
                    onChange: (e) => setSettings({
                      ...settings,
                      other_cost_per_week: Number(e.target.value)
                    })
                  }
                )
              ] }
            )
          ] }
        );
    }
  };
  const getMethodSpecificFields = () => {
    switch (settings.quitting_method) {
      case "gradual_reduction":
      case "scheduled_reduction":
        return /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "div",
          { className: "space-y-4 mt-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "div",
              { className: "space-y-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  "div",
                  { className: "flex justify-between", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "reduction-goal", children: "Reduction Goal per Week" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs(
                      "span",
                      { className: "text-sm", children: [
                        settings.reduction_goal_percent,
                        "%"
                      ] }
                    )
                  ] }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Slider,
                  {
                    id: "reduction-goal",
                    min: 5,
                    max: 50,
                    step: 5,
                    value: [settings.reduction_goal_percent],
                    onValueChange: (values) => setSettings({
                      ...settings,
                      reduction_goal_percent: values[0]
                    })
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "p",
                  { className: "text-sm text-muted-foreground", children: "We recommend 10-20% reduction per week for a sustainable approach" }
                )
              ] }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "div",
              { className: "space-y-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "timeline", children: "Total Quit Timeline (Days)" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Input,
                  {
                    id: "timeline",
                    type: "number",
                    value: settings.reduction_timeline_days,
                    onChange: (e) => setSettings({
                      ...settings,
                      reduction_timeline_days: Number(e.target.value)
                    })
                  }
                )
              ] }
            )
          ] }
        );
      case "nicotine_replacement":
        return /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "div",
          { className: "space-y-4 mt-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "div",
              { className: "space-y-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "replacement-product", children: "Replacement Product" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  Select,
                  {
                    value: settings.replacement_product,
                    onValueChange: (value) => setSettings({ ...settings, replacement_product: value }),
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(
                        SelectTrigger,
                        { id: "replacement-product", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select replacement" }) }
                      ),
                      /* @__PURE__ */ jsxRuntimeExports.jsxs(
                        SelectContent,
                        { children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "patches", children: "Nicotine Patches" }),
                          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "gum", children: "Nicotine Gum" }),
                          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "lozenges", children: "Nicotine Lozenges" }),
                          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "inhaler", children: "Nicotine Inhaler" }),
                          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "spray", children: "Nicotine Spray" }),
                          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "multiple", children: "Multiple Products" })
                        ] }
                      )
                    ]
                  }
                )
              ] }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "div",
              { className: "space-y-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  "div",
                  { className: "flex justify-between", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      Label,
                      { htmlFor: "reduction-timeline", children: "Replacement Reduction Timeline (Days)" }
                    ),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs(
                      "span",
                      { className: "text-sm", children: [
                        settings.reduction_timeline_days,
                        " days"
                      ] }
                    )
                  ] }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Slider,
                  {
                    id: "reduction-timeline",
                    min: 30,
                    max: 180,
                    step: 30,
                    value: [settings.reduction_timeline_days],
                    onValueChange: (values) => setSettings({
                      ...settings,
                      reduction_timeline_days: values[0]
                    })
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "p",
                  { className: "text-sm text-muted-foreground", children: "Recommended: 60-90 days for gradual reduction of replacement nicotine" }
                )
              ] }
            )
          ] }
        );
      default:
        return null;
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "div",
    { className: "space-y-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "div",
        { className: "flex justify-between items-center", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-2xl font-bold tracking-tight", children: "Quit Settings" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: saveSettings, children: "Save Changes" })
        ] }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        Tabs,
        { value: activeTab, onValueChange: setActiveTab, className: "w-full", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            TabsList,
            { className: "grid grid-cols-3 w-full", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "products", children: "Nicotine Products" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "method", children: "Quitting Method" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "notifications", children: "Notifications" })
            ] }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            TabsContent,
            { value: "products", className: "space-y-6", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                Card,
                { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(
                    CardHeader,
                    { children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { children: "Primary Nicotine Product" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(
                        CardDescription,
                        { children: "Select your main nicotine product that you want to quit" }
                      )
                    ] }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(
                    CardContent,
                    { children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsxs(
                        RadioGroup,
                        {
                          value: settings.nicotine_product,
                          onValueChange: (value) => setSettings({ ...settings, nicotine_product: value }),
                          className: "grid grid-cols-2 gap-4",
                          children: [
                            /* @__PURE__ */ jsxRuntimeExports.jsxs(
                              "div",
                              { children: [
                                /* @__PURE__ */ jsxRuntimeExports.jsx(
                                  RadioGroupItem,
                                  {
                                    value: "cigarettes",
                                    id: "cigarettes",
                                    className: "peer sr-only"
                                  }
                                ),
                                /* @__PURE__ */ jsxRuntimeExports.jsxs(
                                  Label,
                                  {
                                    htmlFor: "cigarettes",
                                    className: "flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary",
                                    children: [
                                      /* @__PURE__ */ jsxRuntimeExports.jsx(Cigarette, { className: "mb-3 h-6 w-6" }),
                                      "Cigarettes"
                                    ]
                                  }
                                )
                              ] }
                            ),
                            /* @__PURE__ */ jsxRuntimeExports.jsxs(
                              "div",
                              { children: [
                                /* @__PURE__ */ jsxRuntimeExports.jsx(
                                  RadioGroupItem,
                                  {
                                    value: "vaping",
                                    id: "vaping",
                                    className: "peer sr-only"
                                  }
                                ),
                                /* @__PURE__ */ jsxRuntimeExports.jsxs(
                                  Label,
                                  {
                                    htmlFor: "vaping",
                                    className: "flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary",
                                    children: [
                                      /* @__PURE__ */ jsxRuntimeExports.jsx(ZapOff, { className: "mb-3 h-6 w-6" }),
                                      "Vaping/E-cigarettes"
                                    ]
                                  }
                                )
                              ] }
                            ),
                            /* @__PURE__ */ jsxRuntimeExports.jsxs(
                              "div",
                              { children: [
                                /* @__PURE__ */ jsxRuntimeExports.jsx(
                                  RadioGroupItem,
                                  {
                                    value: "nicotine_pouches",
                                    id: "nicotine_pouches",
                                    className: "peer sr-only"
                                  }
                                ),
                                /* @__PURE__ */ jsxRuntimeExports.jsxs(
                                  Label,
                                  {
                                    htmlFor: "nicotine_pouches",
                                    className: "flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary",
                                    children: [
                                      /* @__PURE__ */ jsxRuntimeExports.jsxs(
                                        "svg",
                                        {
                                          className: "mb-3 h-6 w-6",
                                          viewBox: "0 0 24 24",
                                          fill: "none",
                                          stroke: "currentColor",
                                          strokeWidth: "2",
                                          children: [
                                            /* @__PURE__ */ jsxRuntimeExports.jsx("circle", { cx: "12", cy: "12", r: "8" }),
                                            /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M10 12a2 2 0 1 0 4 0 2 2 0 0 0-4 0" })
                                          ]
                                        }
                                      ),
                                      "Nicotine Pouches"
                                    ]
                                  }
                                )
                              ] }
                            ),
                            /* @__PURE__ */ jsxRuntimeExports.jsxs(
                              "div",
                              { children: [
                                /* @__PURE__ */ jsxRuntimeExports.jsx(
                                  RadioGroupItem,
                                  {
                                    value: "multiple",
                                    id: "multiple",
                                    className: "peer sr-only"
                                  }
                                ),
                                /* @__PURE__ */ jsxRuntimeExports.jsxs(
                                  Label,
                                  {
                                    htmlFor: "multiple",
                                    className: "flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary",
                                    children: [
                                      /* @__PURE__ */ jsxRuntimeExports.jsx(
                                        "svg",
                                        {
                                          className: "mb-3 h-6 w-6",
                                          viewBox: "0 0 24 24",
                                          fill: "none",
                                          stroke: "currentColor",
                                          strokeWidth: "2",
                                          children: /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M8 12h8M12 8v8M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" })
                                        }
                                      ),
                                      "Other/Multiple"
                                    ]
                                  }
                                )
                              ] }
                            )
                          ]
                        }
                      ),
                      settings.nicotine_product === "multiple" && /* @__PURE__ */ jsxRuntimeExports.jsxs(
                        "div",
                        { className: "mt-4 space-y-2", children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Select all that apply" }),
                          /* @__PURE__ */ jsxRuntimeExports.jsx(
                            "div",
                            { className: "grid grid-cols-2 gap-2", children: [
                              "cigarettes",
                              "vaping",
                              "nicotine_pouches",
                              "cigars",
                              "pipe",
                              "hookah",
                              "chewing_tobacco"
                            ].map(
                              (product) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
                                "div",
                                {
                                  className: "flex items-center space-x-2",
                                  children: [
                                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                                      Checkbox,
                                      {
                                        id: `secondary-${product}`,
                                        checked: settings.secondary_products.includes(
                                          product
                                        ),
                                        onCheckedChange: () => toggleSecondaryProduct(product)
                                      }
                                    ),
                                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                                      Label,
                                      {
                                        htmlFor: `secondary-${product}`,
                                        className: "capitalize",
                                        children: product.replace("_", " ")
                                      }
                                    )
                                  ]
                                },
                                product
                              )
                            ) }
                          )
                        ] }
                      )
                    ] }
                  )
                ] }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                Card,
                { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(
                    CardHeader,
                    { children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { children: "Usage Information" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(
                        CardDescription,
                        { children: "We'll use this to track your progress and calculate savings" }
                      )
                    ] }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    CardContent,
                    { className: "space-y-4", children: getConsumptionFields() }
                  )
                ] }
              )
            ] }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            TabsContent,
            { value: "method", className: "space-y-6", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
              Card,
              { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  CardHeader,
                  { children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { children: "Your Quitting Method" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      CardDescription,
                      { children: "Choose the approach that best fits your quit journey" }
                    )
                  ] }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  CardContent,
                  { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
                    "div",
                    { className: "space-y-4", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsxs(
                        "div",
                        { className: "grid grid-cols-2 gap-4", children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsx(
                            "div",
                            { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
                              RadioGroup,
                              {
                                value: settings.quitting_method,
                                onValueChange: (value) => setSettings({ ...settings, quitting_method: value }),
                                className: "space-y-2",
                                children: [
                                  /* @__PURE__ */ jsxRuntimeExports.jsxs(
                                    "div",
                                    { className: "flex items-center space-x-2", children: [
                                      /* @__PURE__ */ jsxRuntimeExports.jsx(RadioGroupItem, { value: "cold_turkey", id: "cold_turkey" }),
                                      /* @__PURE__ */ jsxRuntimeExports.jsxs(
                                        Label,
                                        {
                                          htmlFor: "cold_turkey",
                                          className: "flex items-center gap-2",
                                          children: [
                                            /* @__PURE__ */ jsxRuntimeExports.jsx(Target, { className: "h-4 w-4" }),
                                            "Cold Turkey"
                                          ]
                                        }
                                      )
                                    ] }
                                  ),
                                  /* @__PURE__ */ jsxRuntimeExports.jsxs(
                                    "div",
                                    { className: "flex items-center space-x-2", children: [
                                      /* @__PURE__ */ jsxRuntimeExports.jsx(
                                        RadioGroupItem,
                                        {
                                          value: "gradual_reduction",
                                          id: "gradual_reduction"
                                        }
                                      ),
                                      /* @__PURE__ */ jsxRuntimeExports.jsxs(
                                        Label,
                                        {
                                          htmlFor: "gradual_reduction",
                                          className: "flex items-center gap-2",
                                          children: [
                                            /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowDownRight, { className: "h-4 w-4" }),
                                            "Gradual Reduction"
                                          ]
                                        }
                                      )
                                    ] }
                                  ),
                                  /* @__PURE__ */ jsxRuntimeExports.jsxs(
                                    "div",
                                    { className: "flex items-center space-x-2", children: [
                                      /* @__PURE__ */ jsxRuntimeExports.jsx(
                                        RadioGroupItem,
                                        {
                                          value: "nicotine_replacement",
                                          id: "nicotine_replacement"
                                        }
                                      ),
                                      /* @__PURE__ */ jsxRuntimeExports.jsxs(
                                        Label,
                                        {
                                          htmlFor: "nicotine_replacement",
                                          className: "flex items-center gap-2",
                                          children: [
                                            /* @__PURE__ */ jsxRuntimeExports.jsx(Zap, { className: "h-4 w-4" }),
                                            "Nicotine Replacement"
                                          ]
                                        }
                                      )
                                    ] }
                                  ),
                                  /* @__PURE__ */ jsxRuntimeExports.jsxs(
                                    "div",
                                    { className: "flex items-center space-x-2", children: [
                                      /* @__PURE__ */ jsxRuntimeExports.jsx(
                                        RadioGroupItem,
                                        {
                                          value: "scheduled_reduction",
                                          id: "scheduled_reduction"
                                        }
                                      ),
                                      /* @__PURE__ */ jsxRuntimeExports.jsxs(
                                        Label,
                                        {
                                          htmlFor: "scheduled_reduction",
                                          className: "flex items-center gap-2",
                                          children: [
                                            /* @__PURE__ */ jsxRuntimeExports.jsx(Calendar, { className: "h-4 w-4" }),
                                            "Scheduled Reduction"
                                          ]
                                        }
                                      )
                                    ] }
                                  ),
                                  /* @__PURE__ */ jsxRuntimeExports.jsxs(
                                    "div",
                                    { className: "flex items-center space-x-2", children: [
                                      /* @__PURE__ */ jsxRuntimeExports.jsx(
                                        RadioGroupItem,
                                        {
                                          value: "cut_triggers",
                                          id: "cut_triggers"
                                        }
                                      ),
                                      /* @__PURE__ */ jsxRuntimeExports.jsxs(
                                        Label,
                                        {
                                          htmlFor: "cut_triggers",
                                          className: "flex items-center gap-2",
                                          children: [
                                            /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-4 w-4" }),
                                            "Cut Triggers"
                                          ]
                                        }
                                      )
                                    ] }
                                  ),
                                  /* @__PURE__ */ jsxRuntimeExports.jsxs(
                                    "div",
                                    { className: "flex items-center space-x-2", children: [
                                      /* @__PURE__ */ jsxRuntimeExports.jsx(
                                        RadioGroupItem,
                                        {
                                          value: "delay_technique",
                                          id: "delay_technique"
                                        }
                                      ),
                                      /* @__PURE__ */ jsxRuntimeExports.jsxs(
                                        Label,
                                        {
                                          htmlFor: "delay_technique",
                                          className: "flex items-center gap-2",
                                          children: [
                                            /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { className: "h-4 w-4" }),
                                            "Delay Technique"
                                          ]
                                        }
                                      )
                                    ] }
                                  )
                                ]
                              }
                            ) }
                          ),
                          /* @__PURE__ */ jsxRuntimeExports.jsxs(
                            "div",
                            { className: "border rounded-lg p-4 bg-muted/30", children: [
                              /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-medium mb-2", children: "Method Guidance:" }),
                              /* @__PURE__ */ jsxRuntimeExports.jsx(
                                "p",
                                { className: "text-sm text-muted-foreground", children: methodGuidance[settings.quitting_method] }
                              )
                            ] }
                          )
                        ] }
                      ),
                      getMethodSpecificFields(),
                      /* @__PURE__ */ jsxRuntimeExports.jsxs(
                        "div",
                        { className: "space-y-2 mt-4", children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "quit-date", children: "Target Quit Date" }),
                          /* @__PURE__ */ jsxRuntimeExports.jsx(
                            Input,
                            {
                              id: "quit-date",
                              type: "date",
                              value: settings.quit_date,
                              onChange: (e) => setSettings({ ...settings, quit_date: e.target.value })
                            }
                          ),
                          /* @__PURE__ */ jsxRuntimeExports.jsx(
                            "p",
                            { className: "text-sm text-muted-foreground", children: settings.quitting_method === "cold_turkey" ? "This is when you'll quit completely" : "This is when you'll start your reduction plan" }
                          )
                        ] }
                      )
                    ] }
                  ) }
                )
              ] }
            ) }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            TabsContent,
            { value: "notifications", className: "space-y-6", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                Card,
                { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(
                    CardHeader,
                    { children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { children: "Notifications & Tracking" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(
                        CardDescription,
                        { children: "Configure how you want to be supported on your journey" }
                      )
                    ] }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(
                    CardContent,
                    { className: "space-y-4", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsxs(
                        "div",
                        { className: "flex items-center justify-between", children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "notifications", children: "Daily reminders & tips" }),
                          /* @__PURE__ */ jsxRuntimeExports.jsx(
                            Switch,
                            {
                              id: "notifications",
                              checked: settings.notification_enabled,
                              onCheckedChange: (checked) => setSettings({ ...settings, notification_enabled: checked })
                            }
                          )
                        ] }
                      ),
                      /* @__PURE__ */ jsxRuntimeExports.jsxs(
                        "div",
                        { className: "space-y-2", children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "reminder-time", children: "Reminder time" }),
                          /* @__PURE__ */ jsxRuntimeExports.jsx(
                            Input,
                            {
                              id: "reminder-time",
                              type: "time",
                              value: settings.reminder_time,
                              onChange: (e) => setSettings({ ...settings, reminder_time: e.target.value })
                            }
                          )
                        ] }
                      ),
                      /* @__PURE__ */ jsxRuntimeExports.jsxs(
                        "div",
                        { className: "space-y-2 mt-4", children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-base", children: "Tracking Features" }),
                          /* @__PURE__ */ jsxRuntimeExports.jsx(
                            "p",
                            { className: "text-sm text-muted-foreground mb-2", children: "Select what you want to track during your quit journey" }
                          ),
                          /* @__PURE__ */ jsxRuntimeExports.jsxs(
                            "div",
                            { className: "space-y-2", children: [
                              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                                "div",
                                { className: "flex items-center space-x-2", children: [
                                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                                    Checkbox,
                                    {
                                      id: "track-triggers",
                                      checked: settings.track_triggers,
                                      onCheckedChange: (checked) => setSettings({
                                        ...settings,
                                        track_triggers: checked === true
                                      })
                                    }
                                  ),
                                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                                    Label,
                                    { htmlFor: "track-triggers", children: "Track craving triggers" }
                                  )
                                ] }
                              ),
                              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                                "div",
                                { className: "flex items-center space-x-2", children: [
                                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                                    Checkbox,
                                    {
                                      id: "track-mood",
                                      checked: settings.track_mood,
                                      onCheckedChange: (checked) => setSettings({
                                        ...settings,
                                        track_mood: checked === true
                                      })
                                    }
                                  ),
                                  /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "track-mood", children: "Track mood changes" })
                                ] }
                              ),
                              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                                "div",
                                { className: "flex items-center space-x-2", children: [
                                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                                    Checkbox,
                                    {
                                      id: "track-energy",
                                      checked: settings.track_energy,
                                      onCheckedChange: (checked) => setSettings({
                                        ...settings,
                                        track_energy: checked === true
                                      })
                                    }
                                  ),
                                  /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "track-energy", children: "Track energy levels" })
                                ] }
                              )
                            ] }
                          )
                        ] }
                      )
                    ] }
                  )
                ] }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                Card,
                { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    CardHeader,
                    { children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { children: "Data Management" }) }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(
                    CardContent,
                    { className: "space-y-4", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(
                        "p",
                        { className: "text-sm text-muted-foreground", children: "Your data helps us provide personalized support and track your progress. We use this information to calculate money saved and health improvements." }
                      ),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", children: "Export Progress Data" })
                    ] }
                  )
                ] }
              )
            ] }
          )
        ] }
      )
    ] }
  );
};

export { Settings };

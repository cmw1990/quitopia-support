import { importShared } from './__federation_fn_import-078a81cf.js';
import { c as createLucideIcon, j as jsxDevRuntimeExports, B as Button, T as Tabs, m as TabsList, n as TabsTrigger, o as TabsContent, C as Card, d as CardHeader, e as CardTitle, q as CardDescription, f as CardContent, L as Label, X, I as Input, S as Select, h as SelectTrigger, i as SelectValue, k as SelectContent, l as SelectItem, r as Slider } from './proxy-0fb2bf4b.js';
import { R as RadioGroup, c as RadioGroupItem, C as Checkbox, S as Switch } from './smoke-free-counter-a4ff4a5c.js';
import { s as supabase } from './supabase-client-9c0d55f4.js';
import { u as useToast } from './use-toast-614cf0bf.js';
import { C as Cigarette } from './cigarette-e53f938f.js';
import { Z as Zap } from './zap-7944e79d.js';
import { C as Calendar } from './calendar-b87af6de.js';
import { C as Clock } from './clock-5c9b77ac.js';

/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */


const ArrowDownRight = createLucideIcon("ArrowDownRight", [
  ["path", { d: "m7 7 10 10", key: "1fmybs" }],
  ["path", { d: "M17 7v10H7", key: "6fjiku" }]
]);

/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */


const Target = createLucideIcon("Target", [
  ["circle", { cx: "12", cy: "12", r: "10", key: "1mglay" }],
  ["circle", { cx: "12", cy: "12", r: "6", key: "1vlfrh" }],
  ["circle", { cx: "12", cy: "12", r: "2", key: "1c9p78" }]
]);

/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */


const ZapOff = createLucideIcon("ZapOff", [
  ["path", { d: "M10.513 4.856 13.12 2.17a.5.5 0 0 1 .86.46l-1.377 4.317", key: "193nxd" }],
  ["path", { d: "M15.656 10H20a1 1 0 0 1 .78 1.63l-1.72 1.773", key: "27a7lr" }],
  [
    "path",
    {
      d: "M16.273 16.273 10.88 21.83a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14H4a1 1 0 0 1-.78-1.63l4.507-4.643",
      key: "1e0qe9"
    }
  ],
  ["path", { d: "m2 2 20 20", key: "1ooewy" }]
]);

const React = await importShared('react');
const methodGuidance = {
  cold_turkey: "You'll completely stop all nicotine use at once. This method may have more intense withdrawal symptoms initially, but they typically subside faster. We'll provide tools to manage cravings and withdrawal symptoms.",
  gradual_reduction: "You'll gradually reduce your nicotine consumption over time. We'll track your progress and help you adjust your reduction schedule based on your success and comfort level.",
  nicotine_replacement: "You'll use nicotine replacement products (patches, gum, etc.) to satisfy cravings while eliminating the harmful delivery method. We'll help you gradually reduce the replacement nicotine over time.",
  scheduled_reduction: "You'll reduce at specific scheduled intervals. For example, cutting consumption by 25% each week until you reach zero. We'll send reminders and track your progress against these milestones.",
  cut_triggers: "You'll identify specific triggers and gradually eliminate nicotine use for each trigger. We'll help you track triggers and develop alternative coping strategies for each one.",
  delay_technique: "You'll progressively delay your first and subsequent nicotine uses each day. We'll help you track and extend these delay periods until cravings diminish."
};
const Settings = ({ session }) => {
  const { toast } = useToast();
  const [settings, setSettings] = React.useState({
    nicotine_product: "cigarettes",
    secondary_products: [],
    quitting_method: "cold_turkey",
    quit_date: (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
    daily_cigarettes: 0,
    cost_per_pack: 0,
    cigarettes_per_pack: 20,
    vaping_ml_per_day: 0,
    vaping_cost_per_ml: 0,
    vaping_nicotine_strength: 0,
    pouches_per_day: 0,
    pouches_cost_per_tin: 0,
    pouches_per_tin: 0,
    other_cost_per_week: 0,
    other_consumption_per_day: 0,
    reduction_goal_percent: 10,
    reduction_timeline_days: 30,
    replacement_product: "none",
    notification_enabled: true,
    reminder_time: "09:00",
    track_triggers: true,
    track_mood: true,
    track_energy: true
  });
  const [activeTab, setActiveTab] = React.useState("products");
  React.useEffect(() => {
    if (session?.user) {
      loadUserSettings();
    }
  }, [session]);
  const loadUserSettings = async () => {
    try {
      const { data, error } = await supabase.from("quit_smoking_settings").select("*").eq("user_id", session?.user?.id).single();
      if (error)
        throw error;
      if (data) {
        const loadedSettings = {
          ...settings,
          // Start with defaults
          ...data,
          // Override with saved values
          // Handle array conversion if needed
          secondary_products: data.secondary_products || []
        };
        setSettings(loadedSettings);
      }
    } catch (error) {
      toast.error("Failed to load settings");
    }
  };
  const saveSettings = async () => {
    try {
      const { error } = await supabase.from("quit_smoking_settings").upsert({
        user_id: session?.user?.id,
        ...settings,
        updated_at: (/* @__PURE__ */ new Date()).toISOString()
      });
      if (error)
        throw error;
      toast.success("Your settings have been saved successfully");
    } catch (error) {
      toast.error("Failed to save settings");
    }
  };
  const toggleSecondaryProduct = (product) => {
    if (settings.secondary_products.includes(product)) {
      setSettings({
        ...settings,
        secondary_products: settings.secondary_products.filter((p) => p !== product)
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
        return /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "space-y-4", children: [
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Label, { htmlFor: "daily-cigarettes", children: "Daily cigarettes (before quitting)" }, void 0, false, {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Settings.tsx",
              lineNumber: 196,
              columnNumber: 15
            }, globalThis),
            /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(
              Input,
              {
                id: "daily-cigarettes",
                type: "number",
                value: settings.daily_cigarettes,
                onChange: (e) => setSettings({ ...settings, daily_cigarettes: Number(e.target.value) })
              },
              void 0,
              false,
              {
                fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Settings.tsx",
                lineNumber: 197,
                columnNumber: 15
              },
              globalThis
            )
          ] }, void 0, true, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Settings.tsx",
            lineNumber: 195,
            columnNumber: 13
          }, globalThis),
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Label, { htmlFor: "cost-per-pack", children: "Cost per pack ($)" }, void 0, false, {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Settings.tsx",
              lineNumber: 205,
              columnNumber: 15
            }, globalThis),
            /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(
              Input,
              {
                id: "cost-per-pack",
                type: "number",
                step: "0.01",
                value: settings.cost_per_pack,
                onChange: (e) => setSettings({ ...settings, cost_per_pack: Number(e.target.value) })
              },
              void 0,
              false,
              {
                fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Settings.tsx",
                lineNumber: 206,
                columnNumber: 15
              },
              globalThis
            )
          ] }, void 0, true, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Settings.tsx",
            lineNumber: 204,
            columnNumber: 13
          }, globalThis),
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Label, { htmlFor: "cigarettes-per-pack", children: "Cigarettes per pack" }, void 0, false, {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Settings.tsx",
              lineNumber: 215,
              columnNumber: 15
            }, globalThis),
            /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(
              Input,
              {
                id: "cigarettes-per-pack",
                type: "number",
                value: settings.cigarettes_per_pack,
                onChange: (e) => setSettings({ ...settings, cigarettes_per_pack: Number(e.target.value) })
              },
              void 0,
              false,
              {
                fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Settings.tsx",
                lineNumber: 216,
                columnNumber: 15
              },
              globalThis
            )
          ] }, void 0, true, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Settings.tsx",
            lineNumber: 214,
            columnNumber: 13
          }, globalThis)
        ] }, void 0, true, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Settings.tsx",
          lineNumber: 194,
          columnNumber: 11
        }, globalThis);
      case "vaping":
        return /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "space-y-4", children: [
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Label, { htmlFor: "vaping-ml-per-day", children: "ML of e-liquid per day" }, void 0, false, {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Settings.tsx",
              lineNumber: 230,
              columnNumber: 15
            }, globalThis),
            /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(
              Input,
              {
                id: "vaping-ml-per-day",
                type: "number",
                step: "0.1",
                value: settings.vaping_ml_per_day,
                onChange: (e) => setSettings({ ...settings, vaping_ml_per_day: Number(e.target.value) })
              },
              void 0,
              false,
              {
                fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Settings.tsx",
                lineNumber: 231,
                columnNumber: 15
              },
              globalThis
            )
          ] }, void 0, true, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Settings.tsx",
            lineNumber: 229,
            columnNumber: 13
          }, globalThis),
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Label, { htmlFor: "vaping-cost-per-ml", children: "Cost per ML ($)" }, void 0, false, {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Settings.tsx",
              lineNumber: 240,
              columnNumber: 15
            }, globalThis),
            /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(
              Input,
              {
                id: "vaping-cost-per-ml",
                type: "number",
                step: "0.01",
                value: settings.vaping_cost_per_ml,
                onChange: (e) => setSettings({ ...settings, vaping_cost_per_ml: Number(e.target.value) })
              },
              void 0,
              false,
              {
                fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Settings.tsx",
                lineNumber: 241,
                columnNumber: 15
              },
              globalThis
            )
          ] }, void 0, true, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Settings.tsx",
            lineNumber: 239,
            columnNumber: 13
          }, globalThis),
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Label, { htmlFor: "vaping-nicotine-strength", children: "Nicotine strength (mg/mL)" }, void 0, false, {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Settings.tsx",
              lineNumber: 250,
              columnNumber: 15
            }, globalThis),
            /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(
              Input,
              {
                id: "vaping-nicotine-strength",
                type: "number",
                step: "0.1",
                value: settings.vaping_nicotine_strength,
                onChange: (e) => setSettings({ ...settings, vaping_nicotine_strength: Number(e.target.value) })
              },
              void 0,
              false,
              {
                fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Settings.tsx",
                lineNumber: 251,
                columnNumber: 15
              },
              globalThis
            )
          ] }, void 0, true, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Settings.tsx",
            lineNumber: 249,
            columnNumber: 13
          }, globalThis)
        ] }, void 0, true, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Settings.tsx",
          lineNumber: 228,
          columnNumber: 11
        }, globalThis);
      case "nicotine_pouches":
        return /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "space-y-4", children: [
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Label, { htmlFor: "pouches-per-day", children: "Pouches used per day" }, void 0, false, {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Settings.tsx",
              lineNumber: 266,
              columnNumber: 15
            }, globalThis),
            /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(
              Input,
              {
                id: "pouches-per-day",
                type: "number",
                value: settings.pouches_per_day,
                onChange: (e) => setSettings({ ...settings, pouches_per_day: Number(e.target.value) })
              },
              void 0,
              false,
              {
                fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Settings.tsx",
                lineNumber: 267,
                columnNumber: 15
              },
              globalThis
            )
          ] }, void 0, true, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Settings.tsx",
            lineNumber: 265,
            columnNumber: 13
          }, globalThis),
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Label, { htmlFor: "pouches-cost-per-tin", children: "Cost per tin/can ($)" }, void 0, false, {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Settings.tsx",
              lineNumber: 275,
              columnNumber: 15
            }, globalThis),
            /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(
              Input,
              {
                id: "pouches-cost-per-tin",
                type: "number",
                step: "0.01",
                value: settings.pouches_cost_per_tin,
                onChange: (e) => setSettings({ ...settings, pouches_cost_per_tin: Number(e.target.value) })
              },
              void 0,
              false,
              {
                fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Settings.tsx",
                lineNumber: 276,
                columnNumber: 15
              },
              globalThis
            )
          ] }, void 0, true, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Settings.tsx",
            lineNumber: 274,
            columnNumber: 13
          }, globalThis),
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Label, { htmlFor: "pouches-per-tin", children: "Pouches per tin/can" }, void 0, false, {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Settings.tsx",
              lineNumber: 285,
              columnNumber: 15
            }, globalThis),
            /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(
              Input,
              {
                id: "pouches-per-tin",
                type: "number",
                value: settings.pouches_per_tin,
                onChange: (e) => setSettings({ ...settings, pouches_per_tin: Number(e.target.value) })
              },
              void 0,
              false,
              {
                fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Settings.tsx",
                lineNumber: 286,
                columnNumber: 15
              },
              globalThis
            )
          ] }, void 0, true, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Settings.tsx",
            lineNumber: 284,
            columnNumber: 13
          }, globalThis)
        ] }, void 0, true, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Settings.tsx",
          lineNumber: 264,
          columnNumber: 11
        }, globalThis);
      default:
        return /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "space-y-4", children: [
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Label, { htmlFor: "other-consumption-per-day", children: "Usage per day (units or sessions)" }, void 0, false, {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Settings.tsx",
              lineNumber: 300,
              columnNumber: 15
            }, globalThis),
            /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(
              Input,
              {
                id: "other-consumption-per-day",
                type: "number",
                value: settings.other_consumption_per_day,
                onChange: (e) => setSettings({ ...settings, other_consumption_per_day: Number(e.target.value) })
              },
              void 0,
              false,
              {
                fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Settings.tsx",
                lineNumber: 301,
                columnNumber: 15
              },
              globalThis
            )
          ] }, void 0, true, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Settings.tsx",
            lineNumber: 299,
            columnNumber: 13
          }, globalThis),
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Label, { htmlFor: "other-cost-per-week", children: "Weekly cost ($)" }, void 0, false, {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Settings.tsx",
              lineNumber: 309,
              columnNumber: 15
            }, globalThis),
            /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(
              Input,
              {
                id: "other-cost-per-week",
                type: "number",
                step: "0.01",
                value: settings.other_cost_per_week,
                onChange: (e) => setSettings({ ...settings, other_cost_per_week: Number(e.target.value) })
              },
              void 0,
              false,
              {
                fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Settings.tsx",
                lineNumber: 310,
                columnNumber: 15
              },
              globalThis
            )
          ] }, void 0, true, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Settings.tsx",
            lineNumber: 308,
            columnNumber: 13
          }, globalThis)
        ] }, void 0, true, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Settings.tsx",
          lineNumber: 298,
          columnNumber: 11
        }, globalThis);
    }
  };
  const getMethodSpecificFields = () => {
    switch (settings.quitting_method) {
      case "gradual_reduction":
      case "scheduled_reduction":
        return /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "space-y-4 mt-4", children: [
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "flex justify-between", children: [
              /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Label, { htmlFor: "reduction-goal", children: "Reduction Goal per Week" }, void 0, false, {
                fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Settings.tsx",
                lineNumber: 331,
                columnNumber: 17
              }, globalThis),
              /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("span", { className: "text-sm", children: [
                settings.reduction_goal_percent,
                "%"
              ] }, void 0, true, {
                fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Settings.tsx",
                lineNumber: 332,
                columnNumber: 17
              }, globalThis)
            ] }, void 0, true, {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Settings.tsx",
              lineNumber: 330,
              columnNumber: 15
            }, globalThis),
            /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(
              Slider,
              {
                id: "reduction-goal",
                min: 5,
                max: 50,
                step: 5,
                value: [settings.reduction_goal_percent],
                onValueChange: (values) => setSettings({ ...settings, reduction_goal_percent: values[0] })
              },
              void 0,
              false,
              {
                fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Settings.tsx",
                lineNumber: 334,
                columnNumber: 15
              },
              globalThis
            ),
            /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("p", { className: "text-sm text-muted-foreground", children: "We recommend 10-20% reduction per week for a sustainable approach" }, void 0, false, {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Settings.tsx",
              lineNumber: 342,
              columnNumber: 15
            }, globalThis)
          ] }, void 0, true, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Settings.tsx",
            lineNumber: 329,
            columnNumber: 13
          }, globalThis),
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Label, { htmlFor: "timeline", children: "Total Quit Timeline (Days)" }, void 0, false, {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Settings.tsx",
              lineNumber: 347,
              columnNumber: 15
            }, globalThis),
            /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(
              Input,
              {
                id: "timeline",
                type: "number",
                value: settings.reduction_timeline_days,
                onChange: (e) => setSettings({ ...settings, reduction_timeline_days: Number(e.target.value) })
              },
              void 0,
              false,
              {
                fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Settings.tsx",
                lineNumber: 348,
                columnNumber: 15
              },
              globalThis
            )
          ] }, void 0, true, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Settings.tsx",
            lineNumber: 346,
            columnNumber: 13
          }, globalThis)
        ] }, void 0, true, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Settings.tsx",
          lineNumber: 328,
          columnNumber: 11
        }, globalThis);
      case "nicotine_replacement":
        return /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "space-y-4 mt-4", children: [
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Label, { htmlFor: "replacement-product", children: "Replacement Product" }, void 0, false, {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Settings.tsx",
              lineNumber: 362,
              columnNumber: 15
            }, globalThis),
            /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(
              Select,
              {
                value: settings.replacement_product,
                onValueChange: (value) => setSettings({ ...settings, replacement_product: value }),
                children: [
                  /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(SelectTrigger, { id: "replacement-product", children: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(SelectValue, { placeholder: "Select replacement" }, void 0, false, {
                    fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Settings.tsx",
                    lineNumber: 368,
                    columnNumber: 19
                  }, globalThis) }, void 0, false, {
                    fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Settings.tsx",
                    lineNumber: 367,
                    columnNumber: 17
                  }, globalThis),
                  /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(SelectContent, { children: [
                    /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(SelectItem, { value: "patches", children: "Nicotine Patches" }, void 0, false, {
                      fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Settings.tsx",
                      lineNumber: 371,
                      columnNumber: 19
                    }, globalThis),
                    /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(SelectItem, { value: "gum", children: "Nicotine Gum" }, void 0, false, {
                      fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Settings.tsx",
                      lineNumber: 372,
                      columnNumber: 19
                    }, globalThis),
                    /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(SelectItem, { value: "lozenges", children: "Nicotine Lozenges" }, void 0, false, {
                      fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Settings.tsx",
                      lineNumber: 373,
                      columnNumber: 19
                    }, globalThis),
                    /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(SelectItem, { value: "inhaler", children: "Nicotine Inhaler" }, void 0, false, {
                      fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Settings.tsx",
                      lineNumber: 374,
                      columnNumber: 19
                    }, globalThis),
                    /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(SelectItem, { value: "spray", children: "Nicotine Spray" }, void 0, false, {
                      fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Settings.tsx",
                      lineNumber: 375,
                      columnNumber: 19
                    }, globalThis),
                    /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(SelectItem, { value: "multiple", children: "Multiple Products" }, void 0, false, {
                      fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Settings.tsx",
                      lineNumber: 376,
                      columnNumber: 19
                    }, globalThis)
                  ] }, void 0, true, {
                    fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Settings.tsx",
                    lineNumber: 370,
                    columnNumber: 17
                  }, globalThis)
                ]
              },
              void 0,
              true,
              {
                fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Settings.tsx",
                lineNumber: 363,
                columnNumber: 15
              },
              globalThis
            )
          ] }, void 0, true, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Settings.tsx",
            lineNumber: 361,
            columnNumber: 13
          }, globalThis),
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "flex justify-between", children: [
              /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Label, { htmlFor: "reduction-timeline", children: "Replacement Reduction Timeline (Days)" }, void 0, false, {
                fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Settings.tsx",
                lineNumber: 382,
                columnNumber: 17
              }, globalThis),
              /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("span", { className: "text-sm", children: [
                settings.reduction_timeline_days,
                " days"
              ] }, void 0, true, {
                fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Settings.tsx",
                lineNumber: 383,
                columnNumber: 17
              }, globalThis)
            ] }, void 0, true, {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Settings.tsx",
              lineNumber: 381,
              columnNumber: 15
            }, globalThis),
            /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(
              Slider,
              {
                id: "reduction-timeline",
                min: 30,
                max: 180,
                step: 30,
                value: [settings.reduction_timeline_days],
                onValueChange: (values) => setSettings({ ...settings, reduction_timeline_days: values[0] })
              },
              void 0,
              false,
              {
                fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Settings.tsx",
                lineNumber: 385,
                columnNumber: 15
              },
              globalThis
            ),
            /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("p", { className: "text-sm text-muted-foreground", children: "Recommended: 60-90 days for gradual reduction of replacement nicotine" }, void 0, false, {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Settings.tsx",
              lineNumber: 393,
              columnNumber: 15
            }, globalThis)
          ] }, void 0, true, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Settings.tsx",
            lineNumber: 380,
            columnNumber: 13
          }, globalThis)
        ] }, void 0, true, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Settings.tsx",
          lineNumber: 360,
          columnNumber: 11
        }, globalThis);
      default:
        return null;
    }
  };
  return /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "flex justify-between items-center", children: [
      /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("h1", { className: "text-2xl font-bold tracking-tight", children: "Quit Settings" }, void 0, false, {
        fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Settings.tsx",
        lineNumber: 408,
        columnNumber: 9
      }, globalThis),
      /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Button, { onClick: saveSettings, children: "Save Changes" }, void 0, false, {
        fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Settings.tsx",
        lineNumber: 409,
        columnNumber: 9
      }, globalThis)
    ] }, void 0, true, {
      fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Settings.tsx",
      lineNumber: 407,
      columnNumber: 7
    }, globalThis),
    /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Tabs, { value: activeTab, onValueChange: setActiveTab, className: "w-full", children: [
      /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(TabsList, { className: "grid grid-cols-3 w-full", children: [
        /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(TabsTrigger, { value: "products", children: "Nicotine Products" }, void 0, false, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Settings.tsx",
          lineNumber: 414,
          columnNumber: 11
        }, globalThis),
        /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(TabsTrigger, { value: "method", children: "Quitting Method" }, void 0, false, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Settings.tsx",
          lineNumber: 415,
          columnNumber: 11
        }, globalThis),
        /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(TabsTrigger, { value: "notifications", children: "Notifications" }, void 0, false, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Settings.tsx",
          lineNumber: 416,
          columnNumber: 11
        }, globalThis)
      ] }, void 0, true, {
        fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Settings.tsx",
        lineNumber: 413,
        columnNumber: 9
      }, globalThis),
      /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(TabsContent, { value: "products", className: "space-y-6", children: [
        /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Card, { children: [
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(CardHeader, { children: [
            /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(CardTitle, { children: "Primary Nicotine Product" }, void 0, false, {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Settings.tsx",
              lineNumber: 423,
              columnNumber: 15
            }, globalThis),
            /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(CardDescription, { children: "Select your main nicotine product that you want to quit" }, void 0, false, {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Settings.tsx",
              lineNumber: 424,
              columnNumber: 15
            }, globalThis)
          ] }, void 0, true, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Settings.tsx",
            lineNumber: 422,
            columnNumber: 13
          }, globalThis),
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(CardContent, { children: [
            /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(
              RadioGroup,
              {
                value: settings.nicotine_product,
                onValueChange: (value) => setSettings({ ...settings, nicotine_product: value }),
                className: "grid grid-cols-2 gap-4",
                children: [
                  /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { children: [
                    /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(
                      RadioGroupItem,
                      {
                        value: "cigarettes",
                        id: "cigarettes",
                        className: "peer sr-only"
                      },
                      void 0,
                      false,
                      {
                        fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Settings.tsx",
                        lineNumber: 435,
                        columnNumber: 19
                      },
                      globalThis
                    ),
                    /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(
                      Label,
                      {
                        htmlFor: "cigarettes",
                        className: "flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary",
                        children: [
                          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Cigarette, { className: "mb-3 h-6 w-6" }, void 0, false, {
                            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Settings.tsx",
                            lineNumber: 444,
                            columnNumber: 21
                          }, globalThis),
                          "Cigarettes"
                        ]
                      },
                      void 0,
                      true,
                      {
                        fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Settings.tsx",
                        lineNumber: 440,
                        columnNumber: 19
                      },
                      globalThis
                    )
                  ] }, void 0, true, {
                    fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Settings.tsx",
                    lineNumber: 434,
                    columnNumber: 17
                  }, globalThis),
                  /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { children: [
                    /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(
                      RadioGroupItem,
                      {
                        value: "vaping",
                        id: "vaping",
                        className: "peer sr-only"
                      },
                      void 0,
                      false,
                      {
                        fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Settings.tsx",
                        lineNumber: 450,
                        columnNumber: 19
                      },
                      globalThis
                    ),
                    /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(
                      Label,
                      {
                        htmlFor: "vaping",
                        className: "flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary",
                        children: [
                          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(ZapOff, { className: "mb-3 h-6 w-6" }, void 0, false, {
                            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Settings.tsx",
                            lineNumber: 459,
                            columnNumber: 21
                          }, globalThis),
                          "Vaping/E-cigarettes"
                        ]
                      },
                      void 0,
                      true,
                      {
                        fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Settings.tsx",
                        lineNumber: 455,
                        columnNumber: 19
                      },
                      globalThis
                    )
                  ] }, void 0, true, {
                    fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Settings.tsx",
                    lineNumber: 449,
                    columnNumber: 17
                  }, globalThis),
                  /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { children: [
                    /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(
                      RadioGroupItem,
                      {
                        value: "nicotine_pouches",
                        id: "nicotine_pouches",
                        className: "peer sr-only"
                      },
                      void 0,
                      false,
                      {
                        fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Settings.tsx",
                        lineNumber: 465,
                        columnNumber: 19
                      },
                      globalThis
                    ),
                    /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(
                      Label,
                      {
                        htmlFor: "nicotine_pouches",
                        className: "flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary",
                        children: [
                          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("svg", { className: "mb-3 h-6 w-6", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", children: [
                            /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("circle", { cx: "12", cy: "12", r: "8" }, void 0, false, {
                              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Settings.tsx",
                              lineNumber: 475,
                              columnNumber: 23
                            }, globalThis),
                            /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("path", { d: "M10 12a2 2 0 1 0 4 0 2 2 0 0 0-4 0" }, void 0, false, {
                              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Settings.tsx",
                              lineNumber: 476,
                              columnNumber: 23
                            }, globalThis)
                          ] }, void 0, true, {
                            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Settings.tsx",
                            lineNumber: 474,
                            columnNumber: 21
                          }, globalThis),
                          "Nicotine Pouches"
                        ]
                      },
                      void 0,
                      true,
                      {
                        fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Settings.tsx",
                        lineNumber: 470,
                        columnNumber: 19
                      },
                      globalThis
                    )
                  ] }, void 0, true, {
                    fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Settings.tsx",
                    lineNumber: 464,
                    columnNumber: 17
                  }, globalThis),
                  /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { children: [
                    /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(
                      RadioGroupItem,
                      {
                        value: "multiple",
                        id: "multiple",
                        className: "peer sr-only"
                      },
                      void 0,
                      false,
                      {
                        fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Settings.tsx",
                        lineNumber: 483,
                        columnNumber: 19
                      },
                      globalThis
                    ),
                    /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(
                      Label,
                      {
                        htmlFor: "multiple",
                        className: "flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary",
                        children: [
                          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("svg", { className: "mb-3 h-6 w-6", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", children: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("path", { d: "M8 12h8M12 8v8M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" }, void 0, false, {
                            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Settings.tsx",
                            lineNumber: 493,
                            columnNumber: 23
                          }, globalThis) }, void 0, false, {
                            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Settings.tsx",
                            lineNumber: 492,
                            columnNumber: 21
                          }, globalThis),
                          "Other/Multiple"
                        ]
                      },
                      void 0,
                      true,
                      {
                        fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Settings.tsx",
                        lineNumber: 488,
                        columnNumber: 19
                      },
                      globalThis
                    )
                  ] }, void 0, true, {
                    fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Settings.tsx",
                    lineNumber: 482,
                    columnNumber: 17
                  }, globalThis)
                ]
              },
              void 0,
              true,
              {
                fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Settings.tsx",
                lineNumber: 429,
                columnNumber: 15
              },
              globalThis
            ),
            settings.nicotine_product === "multiple" && /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "mt-4 space-y-2", children: [
              /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Label, { children: "Select all that apply" }, void 0, false, {
                fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Settings.tsx",
                lineNumber: 502,
                columnNumber: 19
              }, globalThis),
              /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "grid grid-cols-2 gap-2", children: ["cigarettes", "vaping", "nicotine_pouches", "cigars", "pipe", "hookah", "chewing_tobacco"].map((product) => /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "flex items-center space-x-2", children: [
                /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(
                  Checkbox,
                  {
                    id: `secondary-${product}`,
                    checked: settings.secondary_products.includes(product),
                    onCheckedChange: () => toggleSecondaryProduct(product)
                  },
                  void 0,
                  false,
                  {
                    fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Settings.tsx",
                    lineNumber: 506,
                    columnNumber: 25
                  },
                  globalThis
                ),
                /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Label, { htmlFor: `secondary-${product}`, className: "capitalize", children: product.replace("_", " ") }, void 0, false, {
                  fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Settings.tsx",
                  lineNumber: 511,
                  columnNumber: 25
                }, globalThis)
              ] }, product, true, {
                fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Settings.tsx",
                lineNumber: 505,
                columnNumber: 23
              }, globalThis)) }, void 0, false, {
                fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Settings.tsx",
                lineNumber: 503,
                columnNumber: 19
              }, globalThis)
            ] }, void 0, true, {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Settings.tsx",
              lineNumber: 501,
              columnNumber: 17
            }, globalThis)
          ] }, void 0, true, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Settings.tsx",
            lineNumber: 428,
            columnNumber: 13
          }, globalThis)
        ] }, void 0, true, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Settings.tsx",
          lineNumber: 421,
          columnNumber: 11
        }, globalThis),
        /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Card, { children: [
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(CardHeader, { children: [
            /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(CardTitle, { children: "Usage Information" }, void 0, false, {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Settings.tsx",
              lineNumber: 524,
              columnNumber: 15
            }, globalThis),
            /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(CardDescription, { children: "We'll use this to track your progress and calculate savings" }, void 0, false, {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Settings.tsx",
              lineNumber: 525,
              columnNumber: 15
            }, globalThis)
          ] }, void 0, true, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Settings.tsx",
            lineNumber: 523,
            columnNumber: 13
          }, globalThis),
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(CardContent, { className: "space-y-4", children: getConsumptionFields() }, void 0, false, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Settings.tsx",
            lineNumber: 529,
            columnNumber: 13
          }, globalThis)
        ] }, void 0, true, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Settings.tsx",
          lineNumber: 522,
          columnNumber: 11
        }, globalThis)
      ] }, void 0, true, {
        fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Settings.tsx",
        lineNumber: 420,
        columnNumber: 9
      }, globalThis),
      /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(TabsContent, { value: "method", className: "space-y-6", children: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Card, { children: [
        /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(CardHeader, { children: [
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(CardTitle, { children: "Your Quitting Method" }, void 0, false, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Settings.tsx",
            lineNumber: 539,
            columnNumber: 15
          }, globalThis),
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(CardDescription, { children: "Choose the approach that best fits your quit journey" }, void 0, false, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Settings.tsx",
            lineNumber: 540,
            columnNumber: 15
          }, globalThis)
        ] }, void 0, true, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Settings.tsx",
          lineNumber: 538,
          columnNumber: 13
        }, globalThis),
        /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(CardContent, { children: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "space-y-4", children: [
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "grid grid-cols-2 gap-4", children: [
            /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { children: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(
              RadioGroup,
              {
                value: settings.quitting_method,
                onValueChange: (value) => setSettings({ ...settings, quitting_method: value }),
                className: "space-y-2",
                children: [
                  /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "flex items-center space-x-2", children: [
                    /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(RadioGroupItem, { value: "cold_turkey", id: "cold_turkey" }, void 0, false, {
                      fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Settings.tsx",
                      lineNumber: 554,
                      columnNumber: 25
                    }, globalThis),
                    /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Label, { htmlFor: "cold_turkey", className: "flex items-center gap-2", children: [
                      /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Target, { className: "h-4 w-4" }, void 0, false, {
                        fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Settings.tsx",
                        lineNumber: 556,
                        columnNumber: 27
                      }, globalThis),
                      "Cold Turkey"
                    ] }, void 0, true, {
                      fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Settings.tsx",
                      lineNumber: 555,
                      columnNumber: 25
                    }, globalThis)
                  ] }, void 0, true, {
                    fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Settings.tsx",
                    lineNumber: 553,
                    columnNumber: 23
                  }, globalThis),
                  /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "flex items-center space-x-2", children: [
                    /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(RadioGroupItem, { value: "gradual_reduction", id: "gradual_reduction" }, void 0, false, {
                      fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Settings.tsx",
                      lineNumber: 562,
                      columnNumber: 25
                    }, globalThis),
                    /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Label, { htmlFor: "gradual_reduction", className: "flex items-center gap-2", children: [
                      /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(ArrowDownRight, { className: "h-4 w-4" }, void 0, false, {
                        fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Settings.tsx",
                        lineNumber: 564,
                        columnNumber: 27
                      }, globalThis),
                      "Gradual Reduction"
                    ] }, void 0, true, {
                      fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Settings.tsx",
                      lineNumber: 563,
                      columnNumber: 25
                    }, globalThis)
                  ] }, void 0, true, {
                    fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Settings.tsx",
                    lineNumber: 561,
                    columnNumber: 23
                  }, globalThis),
                  /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "flex items-center space-x-2", children: [
                    /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(RadioGroupItem, { value: "nicotine_replacement", id: "nicotine_replacement" }, void 0, false, {
                      fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Settings.tsx",
                      lineNumber: 570,
                      columnNumber: 25
                    }, globalThis),
                    /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Label, { htmlFor: "nicotine_replacement", className: "flex items-center gap-2", children: [
                      /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Zap, { className: "h-4 w-4" }, void 0, false, {
                        fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Settings.tsx",
                        lineNumber: 572,
                        columnNumber: 27
                      }, globalThis),
                      "Nicotine Replacement"
                    ] }, void 0, true, {
                      fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Settings.tsx",
                      lineNumber: 571,
                      columnNumber: 25
                    }, globalThis)
                  ] }, void 0, true, {
                    fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Settings.tsx",
                    lineNumber: 569,
                    columnNumber: 23
                  }, globalThis),
                  /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "flex items-center space-x-2", children: [
                    /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(RadioGroupItem, { value: "scheduled_reduction", id: "scheduled_reduction" }, void 0, false, {
                      fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Settings.tsx",
                      lineNumber: 578,
                      columnNumber: 25
                    }, globalThis),
                    /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Label, { htmlFor: "scheduled_reduction", className: "flex items-center gap-2", children: [
                      /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Calendar, { className: "h-4 w-4" }, void 0, false, {
                        fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Settings.tsx",
                        lineNumber: 580,
                        columnNumber: 27
                      }, globalThis),
                      "Scheduled Reduction"
                    ] }, void 0, true, {
                      fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Settings.tsx",
                      lineNumber: 579,
                      columnNumber: 25
                    }, globalThis)
                  ] }, void 0, true, {
                    fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Settings.tsx",
                    lineNumber: 577,
                    columnNumber: 23
                  }, globalThis),
                  /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "flex items-center space-x-2", children: [
                    /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(RadioGroupItem, { value: "cut_triggers", id: "cut_triggers" }, void 0, false, {
                      fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Settings.tsx",
                      lineNumber: 586,
                      columnNumber: 25
                    }, globalThis),
                    /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Label, { htmlFor: "cut_triggers", className: "flex items-center gap-2", children: [
                      /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(X, { className: "h-4 w-4" }, void 0, false, {
                        fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Settings.tsx",
                        lineNumber: 588,
                        columnNumber: 27
                      }, globalThis),
                      "Cut Triggers"
                    ] }, void 0, true, {
                      fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Settings.tsx",
                      lineNumber: 587,
                      columnNumber: 25
                    }, globalThis)
                  ] }, void 0, true, {
                    fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Settings.tsx",
                    lineNumber: 585,
                    columnNumber: 23
                  }, globalThis),
                  /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "flex items-center space-x-2", children: [
                    /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(RadioGroupItem, { value: "delay_technique", id: "delay_technique" }, void 0, false, {
                      fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Settings.tsx",
                      lineNumber: 594,
                      columnNumber: 25
                    }, globalThis),
                    /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Label, { htmlFor: "delay_technique", className: "flex items-center gap-2", children: [
                      /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Clock, { className: "h-4 w-4" }, void 0, false, {
                        fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Settings.tsx",
                        lineNumber: 596,
                        columnNumber: 27
                      }, globalThis),
                      "Delay Technique"
                    ] }, void 0, true, {
                      fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Settings.tsx",
                      lineNumber: 595,
                      columnNumber: 25
                    }, globalThis)
                  ] }, void 0, true, {
                    fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Settings.tsx",
                    lineNumber: 593,
                    columnNumber: 23
                  }, globalThis)
                ]
              },
              void 0,
              true,
              {
                fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Settings.tsx",
                lineNumber: 548,
                columnNumber: 21
              },
              globalThis
            ) }, void 0, false, {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Settings.tsx",
              lineNumber: 547,
              columnNumber: 19
            }, globalThis),
            /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "border rounded-lg p-4 bg-muted/30", children: [
              /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("h3", { className: "font-medium mb-2", children: "Method Guidance:" }, void 0, false, {
                fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Settings.tsx",
                lineNumber: 604,
                columnNumber: 21
              }, globalThis),
              /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("p", { className: "text-sm text-muted-foreground", children: methodGuidance[settings.quitting_method] }, void 0, false, {
                fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Settings.tsx",
                lineNumber: 605,
                columnNumber: 21
              }, globalThis)
            ] }, void 0, true, {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Settings.tsx",
              lineNumber: 603,
              columnNumber: 19
            }, globalThis)
          ] }, void 0, true, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Settings.tsx",
            lineNumber: 546,
            columnNumber: 17
          }, globalThis),
          getMethodSpecificFields(),
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "space-y-2 mt-4", children: [
            /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Label, { htmlFor: "quit-date", children: "Target Quit Date" }, void 0, false, {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Settings.tsx",
              lineNumber: 614,
              columnNumber: 19
            }, globalThis),
            /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(
              Input,
              {
                id: "quit-date",
                type: "date",
                value: settings.quit_date,
                onChange: (e) => setSettings({ ...settings, quit_date: e.target.value })
              },
              void 0,
              false,
              {
                fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Settings.tsx",
                lineNumber: 615,
                columnNumber: 19
              },
              globalThis
            ),
            /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("p", { className: "text-sm text-muted-foreground", children: settings.quitting_method === "cold_turkey" ? "This is when you'll quit completely" : "This is when you'll start your reduction plan" }, void 0, false, {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Settings.tsx",
              lineNumber: 621,
              columnNumber: 19
            }, globalThis)
          ] }, void 0, true, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Settings.tsx",
            lineNumber: 613,
            columnNumber: 17
          }, globalThis)
        ] }, void 0, true, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Settings.tsx",
          lineNumber: 545,
          columnNumber: 15
        }, globalThis) }, void 0, false, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Settings.tsx",
          lineNumber: 544,
          columnNumber: 13
        }, globalThis)
      ] }, void 0, true, {
        fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Settings.tsx",
        lineNumber: 537,
        columnNumber: 11
      }, globalThis) }, void 0, false, {
        fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Settings.tsx",
        lineNumber: 536,
        columnNumber: 9
      }, globalThis),
      /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(TabsContent, { value: "notifications", className: "space-y-6", children: [
        /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Card, { children: [
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(CardHeader, { children: [
            /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(CardTitle, { children: "Notifications & Tracking" }, void 0, false, {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Settings.tsx",
              lineNumber: 636,
              columnNumber: 15
            }, globalThis),
            /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(CardDescription, { children: "Configure how you want to be supported on your journey" }, void 0, false, {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Settings.tsx",
              lineNumber: 637,
              columnNumber: 15
            }, globalThis)
          ] }, void 0, true, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Settings.tsx",
            lineNumber: 635,
            columnNumber: 13
          }, globalThis),
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(CardContent, { className: "space-y-4", children: [
            /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "flex items-center justify-between", children: [
              /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Label, { htmlFor: "notifications", children: "Daily reminders & tips" }, void 0, false, {
                fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Settings.tsx",
                lineNumber: 643,
                columnNumber: 17
              }, globalThis),
              /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(
                Switch,
                {
                  id: "notifications",
                  checked: settings.notification_enabled,
                  onCheckedChange: (checked) => setSettings({ ...settings, notification_enabled: checked })
                },
                void 0,
                false,
                {
                  fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Settings.tsx",
                  lineNumber: 644,
                  columnNumber: 17
                },
                globalThis
              )
            ] }, void 0, true, {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Settings.tsx",
              lineNumber: 642,
              columnNumber: 15
            }, globalThis),
            /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "space-y-2", children: [
              /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Label, { htmlFor: "reminder-time", children: "Reminder time" }, void 0, false, {
                fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Settings.tsx",
                lineNumber: 652,
                columnNumber: 17
              }, globalThis),
              /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(
                Input,
                {
                  id: "reminder-time",
                  type: "time",
                  value: settings.reminder_time,
                  onChange: (e) => setSettings({ ...settings, reminder_time: e.target.value })
                },
                void 0,
                false,
                {
                  fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Settings.tsx",
                  lineNumber: 653,
                  columnNumber: 17
                },
                globalThis
              )
            ] }, void 0, true, {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Settings.tsx",
              lineNumber: 651,
              columnNumber: 15
            }, globalThis),
            /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "space-y-2 mt-4", children: [
              /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Label, { className: "text-base", children: "Tracking Features" }, void 0, false, {
                fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Settings.tsx",
                lineNumber: 662,
                columnNumber: 17
              }, globalThis),
              /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("p", { className: "text-sm text-muted-foreground mb-2", children: "Select what you want to track during your quit journey" }, void 0, false, {
                fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Settings.tsx",
                lineNumber: 663,
                columnNumber: 17
              }, globalThis),
              /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "space-y-2", children: [
                /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "flex items-center space-x-2", children: [
                  /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(
                    Checkbox,
                    {
                      id: "track-triggers",
                      checked: settings.track_triggers,
                      onCheckedChange: (checked) => setSettings({ ...settings, track_triggers: checked === true })
                    },
                    void 0,
                    false,
                    {
                      fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Settings.tsx",
                      lineNumber: 668,
                      columnNumber: 21
                    },
                    globalThis
                  ),
                  /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Label, { htmlFor: "track-triggers", children: "Track craving triggers" }, void 0, false, {
                    fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Settings.tsx",
                    lineNumber: 674,
                    columnNumber: 21
                  }, globalThis)
                ] }, void 0, true, {
                  fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Settings.tsx",
                  lineNumber: 667,
                  columnNumber: 19
                }, globalThis),
                /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "flex items-center space-x-2", children: [
                  /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(
                    Checkbox,
                    {
                      id: "track-mood",
                      checked: settings.track_mood,
                      onCheckedChange: (checked) => setSettings({ ...settings, track_mood: checked === true })
                    },
                    void 0,
                    false,
                    {
                      fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Settings.tsx",
                      lineNumber: 678,
                      columnNumber: 21
                    },
                    globalThis
                  ),
                  /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Label, { htmlFor: "track-mood", children: "Track mood changes" }, void 0, false, {
                    fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Settings.tsx",
                    lineNumber: 684,
                    columnNumber: 21
                  }, globalThis)
                ] }, void 0, true, {
                  fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Settings.tsx",
                  lineNumber: 677,
                  columnNumber: 19
                }, globalThis),
                /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "flex items-center space-x-2", children: [
                  /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(
                    Checkbox,
                    {
                      id: "track-energy",
                      checked: settings.track_energy,
                      onCheckedChange: (checked) => setSettings({ ...settings, track_energy: checked === true })
                    },
                    void 0,
                    false,
                    {
                      fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Settings.tsx",
                      lineNumber: 688,
                      columnNumber: 21
                    },
                    globalThis
                  ),
                  /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Label, { htmlFor: "track-energy", children: "Track energy levels" }, void 0, false, {
                    fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Settings.tsx",
                    lineNumber: 694,
                    columnNumber: 21
                  }, globalThis)
                ] }, void 0, true, {
                  fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Settings.tsx",
                  lineNumber: 687,
                  columnNumber: 19
                }, globalThis)
              ] }, void 0, true, {
                fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Settings.tsx",
                lineNumber: 666,
                columnNumber: 17
              }, globalThis)
            ] }, void 0, true, {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Settings.tsx",
              lineNumber: 661,
              columnNumber: 15
            }, globalThis)
          ] }, void 0, true, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Settings.tsx",
            lineNumber: 641,
            columnNumber: 13
          }, globalThis)
        ] }, void 0, true, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Settings.tsx",
          lineNumber: 634,
          columnNumber: 11
        }, globalThis),
        /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Card, { children: [
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(CardHeader, { children: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(CardTitle, { children: "Data Management" }, void 0, false, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Settings.tsx",
            lineNumber: 703,
            columnNumber: 15
          }, globalThis) }, void 0, false, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Settings.tsx",
            lineNumber: 702,
            columnNumber: 13
          }, globalThis),
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(CardContent, { className: "space-y-4", children: [
            /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("p", { className: "text-sm text-muted-foreground", children: "Your data helps us provide personalized support and track your progress. We use this information to calculate money saved and health improvements." }, void 0, false, {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Settings.tsx",
              lineNumber: 706,
              columnNumber: 15
            }, globalThis),
            /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Button, { variant: "outline", children: "Export Progress Data" }, void 0, false, {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Settings.tsx",
              lineNumber: 710,
              columnNumber: 15
            }, globalThis)
          ] }, void 0, true, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Settings.tsx",
            lineNumber: 705,
            columnNumber: 13
          }, globalThis)
        ] }, void 0, true, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Settings.tsx",
          lineNumber: 701,
          columnNumber: 11
        }, globalThis)
      ] }, void 0, true, {
        fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Settings.tsx",
        lineNumber: 633,
        columnNumber: 9
      }, globalThis)
    ] }, void 0, true, {
      fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Settings.tsx",
      lineNumber: 412,
      columnNumber: 7
    }, globalThis)
  ] }, void 0, true, {
    fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Settings.tsx",
    lineNumber: 406,
    columnNumber: 5
  }, globalThis);
};

export { Settings };

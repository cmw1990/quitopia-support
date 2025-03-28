import { importShared } from './__federation_fn_import-078a81cf.js';
import { c as createLucideIcon, j as jsxDevRuntimeExports, T as Tabs, m as TabsList, n as TabsTrigger, o as TabsContent, I as Input, S as Select, h as SelectTrigger, i as SelectValue, k as SelectContent, l as SelectItem, C as Card, d as CardHeader, f as CardContent, p as CardFooter, e as CardTitle, q as CardDescription, B as Button } from './proxy-0fb2bf4b.js';
import './smoke-free-counter-a4ff4a5c.js';
import { B as Badge } from './badge-8ee49acb.js';
import { u as useToast } from './use-toast-614cf0bf.js';
import { S as Search } from './search-7550beea.js';
import { C as Cigarette } from './cigarette-e53f938f.js';
import { L as Leaf } from './leaf-0a2c50fb.js';
import { C as Coffee } from './coffee-a68f3c7d.js';
import { T as ThumbsUp } from './thumbs-up-21e834e3.js';
import { H as Heart } from './heart-3d8ce19b.js';
import { Z as Zap } from './zap-7944e79d.js';

/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */


const AlarmClock = createLucideIcon("AlarmClock", [
  ["circle", { cx: "12", cy: "13", r: "8", key: "3y4lt7" }],
  ["path", { d: "M12 9v4l2 2", key: "1c63tq" }],
  ["path", { d: "M5 3 2 6", key: "18tl5t" }],
  ["path", { d: "m22 6-3-3", key: "1opdir" }],
  ["path", { d: "M6.38 18.7 4 21", key: "17xu3x" }],
  ["path", { d: "M17.64 18.67 20 21", key: "kv2oe2" }]
]);

/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */


const Book = createLucideIcon("Book", [
  [
    "path",
    {
      d: "M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H19a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H6.5a1 1 0 0 1 0-5H20",
      key: "k3hazp"
    }
  ]
]);

/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */


const CircleHelp = createLucideIcon("CircleHelp", [
  ["circle", { cx: "12", cy: "12", r: "10", key: "1mglay" }],
  ["path", { d: "M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3", key: "1u773s" }],
  ["path", { d: "M12 17h.01", key: "p32p05" }]
]);

/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */


const Lock = createLucideIcon("Lock", [
  ["rect", { width: "18", height: "11", x: "3", y: "11", rx: "2", ry: "2", key: "1w4ew1" }],
  ["path", { d: "M7 11V7a5 5 0 0 1 10 0v4", key: "fwvmzm" }]
]);

/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */


const Play = createLucideIcon("Play", [
  ["polygon", { points: "6 3 20 12 6 21 6 3", key: "1oa8hb" }]
]);

/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */


const Snowflake = createLucideIcon("Snowflake", [
  ["line", { x1: "2", x2: "22", y1: "12", y2: "12", key: "1dnqot" }],
  ["line", { x1: "12", x2: "12", y1: "2", y2: "22", key: "7eqyqh" }],
  ["path", { d: "m20 16-4-4 4-4", key: "rquw4f" }],
  ["path", { d: "m4 8 4 4-4 4", key: "12s3z9" }],
  ["path", { d: "m16 4-4 4-4-4", key: "1tumq1" }],
  ["path", { d: "m8 20 4-4 4 4", key: "9p200w" }]
]);

const {useState,useEffect} = await importShared('react');
const classNames = (...classes) => {
  return classes.filter(Boolean).join(" ");
};
const GuidesHub = ({ session }) => {
  const { toast } = useToast();
  const [guides, setGuides] = useState([]);
  const [filteredGuides, setFilteredGuides] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("guides");
  const mockGuides = [
    {
      id: "1",
      title: "Getting Started with Your Quit Journey",
      description: "A comprehensive guide for your first week of quitting smoking, with tips and strategies for success.",
      type: "article",
      category: "beginner",
      thumbnail: "https://placehold.co/600x400",
      tags: ["beginner", "first week", "tips"],
      premium: false,
      read_time: "8 min",
      view_count: 1248,
      created_at: "2023-04-15T10:30:00Z"
    },
    {
      id: "2",
      title: "Understanding Nicotine Withdrawal",
      description: "Learn about the science behind withdrawal symptoms and how to manage them effectively.",
      type: "article",
      category: "health",
      thumbnail: "https://placehold.co/600x400",
      tags: ["withdrawal", "symptoms", "science"],
      premium: false,
      read_time: "12 min",
      view_count: 965,
      created_at: "2023-05-20T14:45:00Z"
    },
    {
      id: "3",
      title: "Guided Breathing Exercises for Cravings",
      description: "Video tutorial for breathing techniques that help reduce cravings in moments of stress.",
      type: "video",
      category: "techniques",
      thumbnail: "https://placehold.co/600x400",
      tags: ["breathing", "cravings", "stress"],
      premium: true,
      read_time: "15 min",
      view_count: 723,
      created_at: "2023-06-10T09:15:00Z"
    },
    {
      id: "4",
      title: "The Benefits of Quitting Over Time",
      description: "A timeline of health improvements after quitting smoking, from 20 minutes to 15 years.",
      type: "article",
      category: "health",
      thumbnail: "https://placehold.co/600x400",
      tags: ["benefits", "health", "timeline"],
      premium: false,
      read_time: "6 min",
      view_count: 1632,
      created_at: "2023-03-05T16:20:00Z"
    },
    {
      id: "5",
      title: "Advanced Strategies for Long-term Success",
      description: "Proven techniques for maintaining your smoke-free lifestyle after the initial quitting phase.",
      type: "pdf",
      category: "advanced",
      thumbnail: "https://placehold.co/600x400",
      tags: ["advanced", "long-term", "maintenance"],
      premium: true,
      read_time: "20 min",
      view_count: 547,
      created_at: "2023-07-12T11:30:00Z"
    },
    {
      id: "6",
      title: "Nutrition Tips for Ex-Smokers",
      description: "How to adjust your diet to maximize health benefits and minimize weight gain after quitting.",
      type: "article",
      category: "lifestyle",
      thumbnail: "https://placehold.co/600x400",
      tags: ["nutrition", "diet", "weight", "health"],
      premium: false,
      read_time: "10 min",
      view_count: 892,
      created_at: "2023-05-30T08:45:00Z"
    }
  ];
  useEffect(() => {
    const loadGuides = async () => {
      setIsLoading(true);
      try {
        setTimeout(() => {
          setGuides(mockGuides);
          setFilteredGuides(mockGuides);
          setIsLoading(false);
        }, 800);
      } catch (error) {
        console.error("Error loading guides:", error);
        toast({
          title: "Error",
          description: "Failed to load guides. Please try again.",
          variant: "destructive"
        });
        setIsLoading(false);
      }
    };
    loadGuides();
  }, [toast]);
  useEffect(() => {
    let filtered = [...guides];
    if (searchTerm) {
      filtered = filtered.filter(
        (guide) => guide.title.toLowerCase().includes(searchTerm.toLowerCase()) || guide.description.toLowerCase().includes(searchTerm.toLowerCase()) || guide.tags.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    if (selectedCategory !== "all") {
      filtered = filtered.filter((guide) => guide.category === selectedCategory);
    }
    setFilteredGuides(filtered);
  }, [searchTerm, selectedCategory, guides]);
  const getTypeIcon = (type) => {
    switch (type) {
      case "article":
        return /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Book, { className: "h-4 w-4" }, void 0, false, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/GuidesHub.tsx",
          lineNumber: 206,
          columnNumber: 16
        }, globalThis);
      case "video":
        return /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Play, { className: "h-4 w-4" }, void 0, false, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/GuidesHub.tsx",
          lineNumber: 208,
          columnNumber: 16
        }, globalThis);
      case "pdf":
        return /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Book, { className: "h-4 w-4" }, void 0, false, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/GuidesHub.tsx",
          lineNumber: 210,
          columnNumber: 16
        }, globalThis);
      default:
        return /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(CircleHelp, { className: "h-4 w-4" }, void 0, false, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/GuidesHub.tsx",
          lineNumber: 212,
          columnNumber: 16
        }, globalThis);
    }
  };
  const getCategoryIcon = (category) => {
    switch (category) {
      case "beginner":
        return /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Zap, { className: "h-4 w-4" }, void 0, false, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/GuidesHub.tsx",
          lineNumber: 219,
          columnNumber: 16
        }, globalThis);
      case "health":
        return /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Heart, { className: "h-4 w-4" }, void 0, false, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/GuidesHub.tsx",
          lineNumber: 221,
          columnNumber: 16
        }, globalThis);
      case "techniques":
        return /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Snowflake, { className: "h-4 w-4" }, void 0, false, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/GuidesHub.tsx",
          lineNumber: 223,
          columnNumber: 16
        }, globalThis);
      case "advanced":
        return /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(ThumbsUp, { className: "h-4 w-4" }, void 0, false, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/GuidesHub.tsx",
          lineNumber: 225,
          columnNumber: 16
        }, globalThis);
      case "lifestyle":
        return /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Coffee, { className: "h-4 w-4" }, void 0, false, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/GuidesHub.tsx",
          lineNumber: 227,
          columnNumber: 16
        }, globalThis);
      default:
        return /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Leaf, { className: "h-4 w-4" }, void 0, false, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/GuidesHub.tsx",
          lineNumber: 229,
          columnNumber: 16
        }, globalThis);
    }
  };
  const getCategoryColor = (category) => {
    switch (category) {
      case "beginner":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "health":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
      case "techniques":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
      case "advanced":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300";
      case "lifestyle":
        return "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
    }
  };
  return /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("h1", { className: "text-3xl font-bold tracking-tight", children: "Guides & Resources" }, void 0, false, {
      fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/GuidesHub.tsx",
      lineNumber: 252,
      columnNumber: 7
    }, globalThis),
    /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Tabs, { value: activeTab, onValueChange: setActiveTab, className: "w-full", children: [
      /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(TabsList, { className: "grid w-full max-w-md grid-cols-3", children: [
        /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(TabsTrigger, { value: "guides", children: "Guides" }, void 0, false, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/GuidesHub.tsx",
          lineNumber: 256,
          columnNumber: 11
        }, globalThis),
        /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(TabsTrigger, { value: "videos", children: "Videos" }, void 0, false, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/GuidesHub.tsx",
          lineNumber: 257,
          columnNumber: 11
        }, globalThis),
        /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(TabsTrigger, { value: "tools", children: "Tools" }, void 0, false, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/GuidesHub.tsx",
          lineNumber: 258,
          columnNumber: 11
        }, globalThis)
      ] }, void 0, true, {
        fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/GuidesHub.tsx",
        lineNumber: 255,
        columnNumber: 9
      }, globalThis),
      /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(TabsContent, { value: "guides", className: "space-y-4", children: [
        /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "flex flex-col gap-4 md:flex-row md:justify-between", children: [
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "md:max-w-sm", children: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "relative", children: [
            /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Search, { className: "absolute left-2.5 top-2.5 h-4 w-4 text-gray-500 dark:text-gray-400" }, void 0, false, {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/GuidesHub.tsx",
              lineNumber: 265,
              columnNumber: 17
            }, globalThis),
            /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(
              Input,
              {
                type: "search",
                placeholder: "Search guides...",
                className: "pl-8",
                value: searchTerm,
                onChange: (e) => setSearchTerm(e.target.value)
              },
              void 0,
              false,
              {
                fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/GuidesHub.tsx",
                lineNumber: 266,
                columnNumber: 17
              },
              globalThis
            )
          ] }, void 0, true, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/GuidesHub.tsx",
            lineNumber: 264,
            columnNumber: 15
          }, globalThis) }, void 0, false, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/GuidesHub.tsx",
            lineNumber: 263,
            columnNumber: 13
          }, globalThis),
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Select, { value: selectedCategory, onValueChange: setSelectedCategory, children: [
            /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(SelectTrigger, { className: "w-full md:w-[180px]", children: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(SelectValue, { placeholder: "Category" }, void 0, false, {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/GuidesHub.tsx",
              lineNumber: 278,
              columnNumber: 17
            }, globalThis) }, void 0, false, {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/GuidesHub.tsx",
              lineNumber: 277,
              columnNumber: 15
            }, globalThis),
            /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(SelectContent, { children: [
              /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(SelectItem, { value: "all", children: "All Categories" }, void 0, false, {
                fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/GuidesHub.tsx",
                lineNumber: 281,
                columnNumber: 17
              }, globalThis),
              /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(SelectItem, { value: "beginner", children: "Beginner" }, void 0, false, {
                fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/GuidesHub.tsx",
                lineNumber: 282,
                columnNumber: 17
              }, globalThis),
              /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(SelectItem, { value: "health", children: "Health" }, void 0, false, {
                fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/GuidesHub.tsx",
                lineNumber: 283,
                columnNumber: 17
              }, globalThis),
              /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(SelectItem, { value: "techniques", children: "Techniques" }, void 0, false, {
                fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/GuidesHub.tsx",
                lineNumber: 284,
                columnNumber: 17
              }, globalThis),
              /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(SelectItem, { value: "advanced", children: "Advanced" }, void 0, false, {
                fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/GuidesHub.tsx",
                lineNumber: 285,
                columnNumber: 17
              }, globalThis),
              /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(SelectItem, { value: "lifestyle", children: "Lifestyle" }, void 0, false, {
                fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/GuidesHub.tsx",
                lineNumber: 286,
                columnNumber: 17
              }, globalThis)
            ] }, void 0, true, {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/GuidesHub.tsx",
              lineNumber: 280,
              columnNumber: 15
            }, globalThis)
          ] }, void 0, true, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/GuidesHub.tsx",
            lineNumber: 276,
            columnNumber: 13
          }, globalThis)
        ] }, void 0, true, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/GuidesHub.tsx",
          lineNumber: 262,
          columnNumber: 11
        }, globalThis),
        isLoading ? /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3", children: [1, 2, 3].map((i) => /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Card, { className: "overflow-hidden", children: [
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "h-48 bg-gray-200 dark:bg-gray-800 animate-pulse" }, void 0, false, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/GuidesHub.tsx",
            lineNumber: 295,
            columnNumber: 19
          }, globalThis),
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(CardHeader, { className: "animate-pulse", children: [
            /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "h-6 bg-gray-200 dark:bg-gray-800 rounded w-3/4 mb-2" }, void 0, false, {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/GuidesHub.tsx",
              lineNumber: 297,
              columnNumber: 21
            }, globalThis),
            /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "h-4 bg-gray-200 dark:bg-gray-800 rounded w-1/2" }, void 0, false, {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/GuidesHub.tsx",
              lineNumber: 298,
              columnNumber: 21
            }, globalThis)
          ] }, void 0, true, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/GuidesHub.tsx",
            lineNumber: 296,
            columnNumber: 19
          }, globalThis),
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(CardContent, { className: "animate-pulse", children: [
            /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "h-4 bg-gray-200 dark:bg-gray-800 rounded w-full mb-2" }, void 0, false, {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/GuidesHub.tsx",
              lineNumber: 301,
              columnNumber: 21
            }, globalThis),
            /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "h-4 bg-gray-200 dark:bg-gray-800 rounded w-5/6" }, void 0, false, {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/GuidesHub.tsx",
              lineNumber: 302,
              columnNumber: 21
            }, globalThis)
          ] }, void 0, true, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/GuidesHub.tsx",
            lineNumber: 300,
            columnNumber: 19
          }, globalThis),
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(CardFooter, { className: "animate-pulse", children: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "h-8 bg-gray-200 dark:bg-gray-800 rounded w-1/3" }, void 0, false, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/GuidesHub.tsx",
            lineNumber: 305,
            columnNumber: 21
          }, globalThis) }, void 0, false, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/GuidesHub.tsx",
            lineNumber: 304,
            columnNumber: 19
          }, globalThis)
        ] }, i, true, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/GuidesHub.tsx",
          lineNumber: 294,
          columnNumber: 17
        }, globalThis)) }, void 0, false, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/GuidesHub.tsx",
          lineNumber: 292,
          columnNumber: 13
        }, globalThis) : filteredGuides.length > 0 ? /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3", children: filteredGuides.map((guide) => /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Card, { className: "overflow-hidden h-full flex flex-col", children: [
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "h-48 bg-gray-200 dark:bg-gray-800 relative", children: [
            guide.thumbnail && /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(
              "img",
              {
                src: guide.thumbnail,
                alt: guide.title,
                className: "w-full h-full object-cover"
              },
              void 0,
              false,
              {
                fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/GuidesHub.tsx",
                lineNumber: 316,
                columnNumber: 23
              },
              globalThis
            ),
            guide.premium && /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "absolute top-2 right-2 bg-amber-500 text-white text-xs font-semibold px-2 py-1 rounded-full flex items-center gap-1", children: [
              /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Lock, { className: "h-3 w-3" }, void 0, false, {
                fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/GuidesHub.tsx",
                lineNumber: 324,
                columnNumber: 25
              }, globalThis),
              "Premium"
            ] }, void 0, true, {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/GuidesHub.tsx",
              lineNumber: 323,
              columnNumber: 23
            }, globalThis),
            /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "absolute bottom-2 left-2 flex gap-1", children: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Badge, { className: "bg-gray-800/70 hover:bg-gray-800/80 text-white", children: [
              getTypeIcon(guide.type),
              /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("span", { className: "ml-1", children: guide.type }, void 0, false, {
                fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/GuidesHub.tsx",
                lineNumber: 331,
                columnNumber: 25
              }, globalThis)
            ] }, void 0, true, {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/GuidesHub.tsx",
              lineNumber: 329,
              columnNumber: 23
            }, globalThis) }, void 0, false, {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/GuidesHub.tsx",
              lineNumber: 328,
              columnNumber: 21
            }, globalThis)
          ] }, void 0, true, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/GuidesHub.tsx",
            lineNumber: 314,
            columnNumber: 19
          }, globalThis),
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(CardHeader, { className: "pb-2", children: [
            /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "flex justify-between items-start", children: [
              /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Badge, { className: classNames("flex items-center gap-1", getCategoryColor(guide.category)), children: [
                getCategoryIcon(guide.category),
                guide.category
              ] }, void 0, true, {
                fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/GuidesHub.tsx",
                lineNumber: 338,
                columnNumber: 23
              }, globalThis),
              guide.read_time && /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "text-xs text-gray-500 dark:text-gray-400 flex items-center", children: [
                /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(AlarmClock, { className: "h-3 w-3 mr-1" }, void 0, false, {
                  fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/GuidesHub.tsx",
                  lineNumber: 344,
                  columnNumber: 27
                }, globalThis),
                guide.read_time
              ] }, void 0, true, {
                fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/GuidesHub.tsx",
                lineNumber: 343,
                columnNumber: 25
              }, globalThis)
            ] }, void 0, true, {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/GuidesHub.tsx",
              lineNumber: 337,
              columnNumber: 21
            }, globalThis),
            /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(CardTitle, { className: "mt-2 text-lg", children: guide.title }, void 0, false, {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/GuidesHub.tsx",
              lineNumber: 349,
              columnNumber: 21
            }, globalThis),
            /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(CardDescription, { className: "line-clamp-2 mt-2", children: guide.description }, void 0, false, {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/GuidesHub.tsx",
              lineNumber: 350,
              columnNumber: 21
            }, globalThis)
          ] }, void 0, true, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/GuidesHub.tsx",
            lineNumber: 336,
            columnNumber: 19
          }, globalThis),
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(CardContent, { className: "pb-2 flex-grow", children: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "flex flex-wrap gap-1 mt-2", children: guide.tags.map((tag) => /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Badge, { variant: "outline", className: "text-xs", children: tag }, tag, false, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/GuidesHub.tsx",
            lineNumber: 358,
            columnNumber: 25
          }, globalThis)) }, void 0, false, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/GuidesHub.tsx",
            lineNumber: 356,
            columnNumber: 21
          }, globalThis) }, void 0, false, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/GuidesHub.tsx",
            lineNumber: 355,
            columnNumber: 19
          }, globalThis),
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(CardFooter, { className: "pt-0", children: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Button, { variant: "outline", className: "w-full", children: "Read Guide" }, void 0, false, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/GuidesHub.tsx",
            lineNumber: 366,
            columnNumber: 21
          }, globalThis) }, void 0, false, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/GuidesHub.tsx",
            lineNumber: 365,
            columnNumber: 19
          }, globalThis)
        ] }, guide.id, true, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/GuidesHub.tsx",
          lineNumber: 313,
          columnNumber: 17
        }, globalThis)) }, void 0, false, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/GuidesHub.tsx",
          lineNumber: 311,
          columnNumber: 13
        }, globalThis) : /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "text-center p-12 border rounded-lg", children: [
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Book, { className: "h-12 w-12 mx-auto mb-4 text-gray-400" }, void 0, false, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/GuidesHub.tsx",
            lineNumber: 375,
            columnNumber: 15
          }, globalThis),
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("h3", { className: "text-lg font-medium", children: "No guides found" }, void 0, false, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/GuidesHub.tsx",
            lineNumber: 376,
            columnNumber: 15
          }, globalThis),
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("p", { className: "text-sm text-gray-500 mt-2", children: "Try adjusting your search or filters to find what you're looking for." }, void 0, false, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/GuidesHub.tsx",
            lineNumber: 377,
            columnNumber: 15
          }, globalThis)
        ] }, void 0, true, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/GuidesHub.tsx",
          lineNumber: 374,
          columnNumber: 13
        }, globalThis)
      ] }, void 0, true, {
        fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/GuidesHub.tsx",
        lineNumber: 261,
        columnNumber: 9
      }, globalThis),
      /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(TabsContent, { value: "videos", className: "space-y-4", children: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "text-center p-12 border rounded-lg", children: [
        /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Play, { className: "h-12 w-12 mx-auto mb-4 text-gray-400" }, void 0, false, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/GuidesHub.tsx",
          lineNumber: 386,
          columnNumber: 13
        }, globalThis),
        /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("h3", { className: "text-lg font-medium", children: "Video Resources Coming Soon" }, void 0, false, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/GuidesHub.tsx",
          lineNumber: 387,
          columnNumber: 13
        }, globalThis),
        /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("p", { className: "text-sm text-gray-500 mt-2", children: "Our video library is currently under development. Check back soon!" }, void 0, false, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/GuidesHub.tsx",
          lineNumber: 388,
          columnNumber: 13
        }, globalThis)
      ] }, void 0, true, {
        fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/GuidesHub.tsx",
        lineNumber: 385,
        columnNumber: 11
      }, globalThis) }, void 0, false, {
        fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/GuidesHub.tsx",
        lineNumber: 384,
        columnNumber: 9
      }, globalThis),
      /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(TabsContent, { value: "tools", className: "space-y-4", children: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "text-center p-12 border rounded-lg", children: [
        /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Cigarette, { className: "h-12 w-12 mx-auto mb-4 text-gray-400" }, void 0, false, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/GuidesHub.tsx",
          lineNumber: 396,
          columnNumber: 13
        }, globalThis),
        /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("h3", { className: "text-lg font-medium", children: "Interactive Tools Coming Soon" }, void 0, false, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/GuidesHub.tsx",
          lineNumber: 397,
          columnNumber: 13
        }, globalThis),
        /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("p", { className: "text-sm text-gray-500 mt-2", children: "We're working on interactive tools to help with your quit journey." }, void 0, false, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/GuidesHub.tsx",
          lineNumber: 398,
          columnNumber: 13
        }, globalThis)
      ] }, void 0, true, {
        fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/GuidesHub.tsx",
        lineNumber: 395,
        columnNumber: 11
      }, globalThis) }, void 0, false, {
        fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/GuidesHub.tsx",
        lineNumber: 394,
        columnNumber: 9
      }, globalThis)
    ] }, void 0, true, {
      fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/GuidesHub.tsx",
      lineNumber: 254,
      columnNumber: 7
    }, globalThis)
  ] }, void 0, true, {
    fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/GuidesHub.tsx",
    lineNumber: 251,
    columnNumber: 5
  }, globalThis);
};

export { Book as B, GuidesHub, Lock as L, Snowflake as S };

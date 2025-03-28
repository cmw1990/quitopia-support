import { importShared } from './__federation_fn_import-078a81cf.js';
import { c as createLucideIcon, j as jsxDevRuntimeExports, I as Input, S as Select, h as SelectTrigger, i as SelectValue, k as SelectContent, l as SelectItem, C as Card, d as CardHeader, e as CardTitle, f as CardContent, T as Tabs, m as TabsList, n as TabsTrigger, o as TabsContent, p as CardFooter, B as Button } from './proxy-0fb2bf4b.js';
import './smoke-free-counter-a4ff4a5c.js';
import { B as Badge } from './badge-8ee49acb.js';
import { S as Search } from './search-7550beea.js';
import { F as Filter, S as ShoppingBag, a as Star } from './star-18d7b278.js';
import { C as Clock } from './clock-5c9b77ac.js';
import { H as Heart } from './heart-3d8ce19b.js';
import { Z as Zap } from './zap-7944e79d.js';
import { T as ThumbsUp } from './thumbs-up-21e834e3.js';
import { L as Leaf } from './leaf-0a2c50fb.js';
import { D as Droplets } from './droplets-dd386739.js';

/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */


const ArrowUpDown = createLucideIcon("ArrowUpDown", [
  ["path", { d: "m21 16-4 4-4-4", key: "f6ql7i" }],
  ["path", { d: "M17 20V4", key: "1ejh1v" }],
  ["path", { d: "m3 8 4-4 4 4", key: "11wl7u" }],
  ["path", { d: "M7 4v16", key: "1glfcx" }]
]);

/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */


const Sparkles = createLucideIcon("Sparkles", [
  [
    "path",
    {
      d: "M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z",
      key: "4pj2yx"
    }
  ],
  ["path", { d: "M20 3v4", key: "1olli1" }],
  ["path", { d: "M22 5h-4", key: "1gvqau" }],
  ["path", { d: "M4 17v2", key: "vumght" }],
  ["path", { d: "M5 18H3", key: "zchphs" }]
]);

const {useState} = await importShared('react');
const AlternativeProducts = ({ session }) => {
  const [filterType, setFilterType] = useState("all");
  const [sortBy, setSortBy] = useState("rating");
  const [searchQuery, setSearchQuery] = useState("");
  const alternativeProducts = [
    {
      id: 1,
      name: "ZYN Nicotine Pouches",
      type: "pouch",
      strengthOptions: ["6mg", "3mg"],
      brand: "ZYN",
      rating: 4.7,
      reviews: 2453,
      price: "$32.99",
      description: "Tobacco-free nicotine pouches that fit discreetly under your lip for a clean nicotine experience without smoke or spit.",
      pros: ["Completely smoke-free", "No tobacco", "Discreet to use anywhere", "No staining"],
      cons: ["May cause gum irritation", "Limited flavor duration"],
      bestFor: ["Social situations", "Work environments", "Discreet nicotine use"],
      image: "https://via.placeholder.com/150",
      available: true,
      flavors: ["Mint", "Wintergreen", "Coffee", "Cinnamon"]
    },
    {
      id: 2,
      name: "VELO Nicotine Lozenges",
      type: "lozenge",
      strengthOptions: ["4mg", "2mg"],
      brand: "VELO",
      rating: 4.2,
      reviews: 1182,
      price: "$29.99",
      description: "Tobacco-free nicotine lozenges that dissolve in your mouth, providing a clean nicotine experience without smoke.",
      pros: ["Discreet", "No spitting required", "Convenient for on-the-go"],
      cons: ["May cause hiccups", "Shorter duration than pouches"],
      bestFor: ["Office workers", "Public settings", "Quick nicotine relief"],
      image: "https://via.placeholder.com/150",
      available: true,
      flavors: ["Mint", "Citrus", "Berry"]
    },
    {
      id: 3,
      name: "Lucy Nicotine Gum",
      type: "gum",
      strengthOptions: ["4mg", "2mg"],
      brand: "Lucy",
      rating: 4.4,
      reviews: 865,
      price: "$35.99",
      description: "Modern nicotine gum with improved flavor and texture compared to traditional NRT gum products.",
      pros: ["Better taste than traditional nicotine gum", "Familiar format", "Adjustable usage"],
      cons: ["Requires proper chewing technique", "May cause jaw fatigue"],
      bestFor: ["Former smokers familiar with nicotine gum", "Those who enjoy chewing gum"],
      image: "https://via.placeholder.com/150",
      available: true,
      flavors: ["Wintergreen", "Cinnamon", "Pomegranate", "Mango"]
    },
    {
      id: 4,
      name: "ROGUE Nicotine Tablets",
      type: "tablet",
      strengthOptions: ["4mg", "2mg"],
      brand: "ROGUE",
      rating: 4.1,
      reviews: 532,
      price: "$27.99",
      description: "Small nicotine tablets that dissolve under your tongue for a quick nicotine experience.",
      pros: ["Fast-acting", "Discreet size", "No chewing required"],
      cons: ["Short duration", "Limited flavor options"],
      bestFor: ["Quick nicotine needs", "Discreet usage", "On-the-go"],
      image: "https://via.placeholder.com/150",
      available: true,
      flavors: ["Mint", "Wintergreen"]
    },
    {
      id: 5,
      name: "NicoFix Toothpicks",
      type: "toothpick",
      strengthOptions: ["3mg per pick"],
      brand: "NicoFix",
      rating: 3.9,
      reviews: 421,
      price: "$19.99",
      description: "Wooden toothpicks infused with nicotine that provide both oral stimulation and nicotine delivery.",
      pros: ["Mimics hand-to-mouth habit", "Provides oral fixation", "Socially acceptable"],
      cons: ["Variable nicotine delivery", "Can splinter", "Limited duration"],
      bestFor: ["Those who miss the hand-to-mouth ritual", "Social settings", "After meals"],
      image: "https://via.placeholder.com/150",
      available: true,
      flavors: ["Cinnamon", "Mint", "Unflavored"]
    }
  ];
  const filteredProducts = alternativeProducts.filter((product) => {
    const matchesType = filterType === "all" || product.type === filterType;
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) || product.description.toLowerCase().includes(searchQuery.toLowerCase()) || product.brand.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case "rating":
        return b.rating - a.rating;
      case "reviews":
        return b.reviews - a.reviews;
      case "name":
        return a.name.localeCompare(b.name);
      default:
        return 0;
    }
  });
  const renderStars = (rating) => {
    return /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "flex items-center", children: [
      [...Array(5)].map((_, i) => /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(
        Star,
        {
          className: `h-4 w-4 ${i < Math.floor(rating) ? "text-yellow-500 fill-yellow-500" : i < rating ? "text-yellow-500 fill-yellow-500 opacity-50" : "text-gray-300"}`
        },
        i,
        false,
        {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/AlternativeProducts.tsx",
          lineNumber: 183,
          columnNumber: 11
        },
        globalThis
      )),
      /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("span", { className: "ml-2 text-sm text-gray-600 dark:text-gray-400", children: rating.toFixed(1) }, void 0, false, {
        fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/AlternativeProducts.tsx",
        lineNumber: 194,
        columnNumber: 9
      }, globalThis)
    ] }, void 0, true, {
      fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/AlternativeProducts.tsx",
      lineNumber: 181,
      columnNumber: 7
    }, globalThis);
  };
  const renderTypeIcon = (type) => {
    switch (type) {
      case "pouch":
        return /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Droplets, { className: "h-5 w-5 text-green-500" }, void 0, false, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/AlternativeProducts.tsx",
          lineNumber: 203,
          columnNumber: 16
        }, globalThis);
      case "lozenge":
        return /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Sparkles, { className: "h-5 w-5 text-purple-500" }, void 0, false, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/AlternativeProducts.tsx",
          lineNumber: 205,
          columnNumber: 16
        }, globalThis);
      case "tablet":
        return /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Zap, { className: "h-5 w-5 text-blue-500" }, void 0, false, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/AlternativeProducts.tsx",
          lineNumber: 207,
          columnNumber: 16
        }, globalThis);
      case "toothpick":
        return /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Leaf, { className: "h-5 w-5 text-amber-500" }, void 0, false, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/AlternativeProducts.tsx",
          lineNumber: 209,
          columnNumber: 16
        }, globalThis);
      case "gum":
        return /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(ThumbsUp, { className: "h-5 w-5 text-pink-500" }, void 0, false, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/AlternativeProducts.tsx",
          lineNumber: 211,
          columnNumber: 16
        }, globalThis);
      default:
        return null;
    }
  };
  return /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "container mx-auto px-4 py-8", children: [
    /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "mb-8", children: [
      /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("h1", { className: "text-3xl font-bold text-green-700 dark:text-green-400 mb-3", children: "Alternative Nicotine Products" }, void 0, false, {
        fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/AlternativeProducts.tsx",
        lineNumber: 220,
        columnNumber: 9
      }, globalThis),
      /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("p", { className: "text-lg text-gray-600 dark:text-gray-400 mb-6", children: "Explore smoke-free, tobacco-free alternatives to help others stay fresh. These modern options provide nicotine without the harmful effects of combustion." }, void 0, false, {
        fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/AlternativeProducts.tsx",
        lineNumber: 221,
        columnNumber: 9
      }, globalThis),
      /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4 bg-green-50 dark:bg-green-900/30 p-4 rounded-lg mb-6", children: [
        /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "relative", children: [
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Search, { className: "absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" }, void 0, false, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/AlternativeProducts.tsx",
            lineNumber: 229,
            columnNumber: 13
          }, globalThis),
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(
            Input,
            {
              placeholder: "Search products...",
              value: searchQuery,
              onChange: (e) => setSearchQuery(e.target.value),
              className: "pl-10 border-green-200 dark:border-green-700 focus:border-green-500 focus:ring-green-500"
            },
            void 0,
            false,
            {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/AlternativeProducts.tsx",
              lineNumber: 230,
              columnNumber: 13
            },
            globalThis
          )
        ] }, void 0, true, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/AlternativeProducts.tsx",
          lineNumber: 228,
          columnNumber: 11
        }, globalThis),
        /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Filter, { className: "h-4 w-4 text-gray-500" }, void 0, false, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/AlternativeProducts.tsx",
            lineNumber: 239,
            columnNumber: 13
          }, globalThis),
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Select, { value: filterType, onValueChange: setFilterType, children: [
            /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(SelectTrigger, { className: "border-green-200 dark:border-green-700", children: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(SelectValue, { placeholder: "Filter by type" }, void 0, false, {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/AlternativeProducts.tsx",
              lineNumber: 242,
              columnNumber: 17
            }, globalThis) }, void 0, false, {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/AlternativeProducts.tsx",
              lineNumber: 241,
              columnNumber: 15
            }, globalThis),
            /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(SelectContent, { children: [
              /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(SelectItem, { value: "all", children: "All Types" }, void 0, false, {
                fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/AlternativeProducts.tsx",
                lineNumber: 245,
                columnNumber: 17
              }, globalThis),
              /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(SelectItem, { value: "pouch", children: "Pouches" }, void 0, false, {
                fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/AlternativeProducts.tsx",
                lineNumber: 246,
                columnNumber: 17
              }, globalThis),
              /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(SelectItem, { value: "lozenge", children: "Lozenges" }, void 0, false, {
                fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/AlternativeProducts.tsx",
                lineNumber: 247,
                columnNumber: 17
              }, globalThis),
              /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(SelectItem, { value: "tablet", children: "Tablets" }, void 0, false, {
                fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/AlternativeProducts.tsx",
                lineNumber: 248,
                columnNumber: 17
              }, globalThis),
              /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(SelectItem, { value: "toothpick", children: "Toothpicks" }, void 0, false, {
                fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/AlternativeProducts.tsx",
                lineNumber: 249,
                columnNumber: 17
              }, globalThis),
              /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(SelectItem, { value: "gum", children: "Gum" }, void 0, false, {
                fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/AlternativeProducts.tsx",
                lineNumber: 250,
                columnNumber: 17
              }, globalThis)
            ] }, void 0, true, {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/AlternativeProducts.tsx",
              lineNumber: 244,
              columnNumber: 15
            }, globalThis)
          ] }, void 0, true, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/AlternativeProducts.tsx",
            lineNumber: 240,
            columnNumber: 13
          }, globalThis)
        ] }, void 0, true, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/AlternativeProducts.tsx",
          lineNumber: 238,
          columnNumber: 11
        }, globalThis),
        /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(ArrowUpDown, { className: "h-4 w-4 text-gray-500" }, void 0, false, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/AlternativeProducts.tsx",
            lineNumber: 256,
            columnNumber: 13
          }, globalThis),
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Select, { value: sortBy, onValueChange: setSortBy, children: [
            /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(SelectTrigger, { className: "border-green-200 dark:border-green-700", children: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(SelectValue, { placeholder: "Sort by" }, void 0, false, {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/AlternativeProducts.tsx",
              lineNumber: 259,
              columnNumber: 17
            }, globalThis) }, void 0, false, {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/AlternativeProducts.tsx",
              lineNumber: 258,
              columnNumber: 15
            }, globalThis),
            /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(SelectContent, { children: [
              /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(SelectItem, { value: "rating", children: "Highest Rated" }, void 0, false, {
                fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/AlternativeProducts.tsx",
                lineNumber: 262,
                columnNumber: 17
              }, globalThis),
              /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(SelectItem, { value: "reviews", children: "Most Reviewed" }, void 0, false, {
                fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/AlternativeProducts.tsx",
                lineNumber: 263,
                columnNumber: 17
              }, globalThis),
              /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(SelectItem, { value: "name", children: "Alphabetical" }, void 0, false, {
                fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/AlternativeProducts.tsx",
                lineNumber: 264,
                columnNumber: 17
              }, globalThis)
            ] }, void 0, true, {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/AlternativeProducts.tsx",
              lineNumber: 261,
              columnNumber: 15
            }, globalThis)
          ] }, void 0, true, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/AlternativeProducts.tsx",
            lineNumber: 257,
            columnNumber: 13
          }, globalThis)
        ] }, void 0, true, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/AlternativeProducts.tsx",
          lineNumber: 255,
          columnNumber: 11
        }, globalThis)
      ] }, void 0, true, {
        fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/AlternativeProducts.tsx",
        lineNumber: 227,
        columnNumber: 9
      }, globalThis),
      /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6", children: sortedProducts.map((product) => /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Card, { className: "border-green-200 dark:border-green-800 hover:shadow-md transition-shadow", children: [
        /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(CardHeader, { className: "pb-3", children: [
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "flex justify-between items-start", children: [
            /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "flex items-center gap-2", children: [
              renderTypeIcon(product.type),
              /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Badge, { className: "text-xs capitalize bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-200 dark:border-green-700", children: product.type }, void 0, false, {
                fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/AlternativeProducts.tsx",
                lineNumber: 277,
                columnNumber: 21
              }, globalThis)
            ] }, void 0, true, {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/AlternativeProducts.tsx",
              lineNumber: 275,
              columnNumber: 19
            }, globalThis),
            /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "text-lg font-semibold text-green-600 dark:text-green-500", children: product.price }, void 0, false, {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/AlternativeProducts.tsx",
              lineNumber: 281,
              columnNumber: 19
            }, globalThis)
          ] }, void 0, true, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/AlternativeProducts.tsx",
            lineNumber: 274,
            columnNumber: 17
          }, globalThis),
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(CardTitle, { className: "text-xl mt-2", children: product.name }, void 0, false, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/AlternativeProducts.tsx",
            lineNumber: 285,
            columnNumber: 17
          }, globalThis),
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "flex justify-between items-center mt-1", children: [
            /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "text-sm text-gray-500", children: product.brand }, void 0, false, {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/AlternativeProducts.tsx",
              lineNumber: 287,
              columnNumber: 19
            }, globalThis),
            renderStars(product.rating)
          ] }, void 0, true, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/AlternativeProducts.tsx",
            lineNumber: 286,
            columnNumber: 17
          }, globalThis),
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "text-xs text-gray-500", children: [
            product.reviews,
            " reviews"
          ] }, void 0, true, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/AlternativeProducts.tsx",
            lineNumber: 290,
            columnNumber: 17
          }, globalThis)
        ] }, void 0, true, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/AlternativeProducts.tsx",
          lineNumber: 273,
          columnNumber: 15
        }, globalThis),
        /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(CardContent, { children: [
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("p", { className: "text-gray-600 dark:text-gray-400 text-sm mb-3", children: product.description }, void 0, false, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/AlternativeProducts.tsx",
            lineNumber: 293,
            columnNumber: 17
          }, globalThis),
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "mb-3", children: [
            /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "text-sm font-medium mb-1", children: "Available Strengths:" }, void 0, false, {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/AlternativeProducts.tsx",
              lineNumber: 296,
              columnNumber: 19
            }, globalThis),
            /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "flex flex-wrap gap-1", children: product.strengthOptions.map((strength, idx) => /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Badge, { className: "bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300 border-none", children: strength }, idx, false, {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/AlternativeProducts.tsx",
              lineNumber: 299,
              columnNumber: 23
            }, globalThis)) }, void 0, false, {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/AlternativeProducts.tsx",
              lineNumber: 297,
              columnNumber: 19
            }, globalThis)
          ] }, void 0, true, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/AlternativeProducts.tsx",
            lineNumber: 295,
            columnNumber: 17
          }, globalThis),
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "mb-3", children: [
            /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "text-sm font-medium mb-1", children: "Flavors:" }, void 0, false, {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/AlternativeProducts.tsx",
              lineNumber: 307,
              columnNumber: 19
            }, globalThis),
            /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "flex flex-wrap gap-1", children: product.flavors.map((flavor, idx) => /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Badge, { variant: "outline", className: "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800", children: flavor }, idx, false, {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/AlternativeProducts.tsx",
              lineNumber: 310,
              columnNumber: 23
            }, globalThis)) }, void 0, false, {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/AlternativeProducts.tsx",
              lineNumber: 308,
              columnNumber: 19
            }, globalThis)
          ] }, void 0, true, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/AlternativeProducts.tsx",
            lineNumber: 306,
            columnNumber: 17
          }, globalThis),
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Tabs, { defaultValue: "pros", className: "mt-4", children: [
            /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(TabsList, { className: "w-full bg-green-100 dark:bg-green-900/30", children: [
              /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(TabsTrigger, { value: "pros", className: "flex-1 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800", children: "Pros" }, void 0, false, {
                fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/AlternativeProducts.tsx",
                lineNumber: 319,
                columnNumber: 21
              }, globalThis),
              /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(TabsTrigger, { value: "cons", className: "flex-1 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800", children: "Cons" }, void 0, false, {
                fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/AlternativeProducts.tsx",
                lineNumber: 320,
                columnNumber: 21
              }, globalThis),
              /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(TabsTrigger, { value: "bestFor", className: "flex-1 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800", children: "Best For" }, void 0, false, {
                fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/AlternativeProducts.tsx",
                lineNumber: 321,
                columnNumber: 21
              }, globalThis)
            ] }, void 0, true, {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/AlternativeProducts.tsx",
              lineNumber: 318,
              columnNumber: 19
            }, globalThis),
            /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(TabsContent, { value: "pros", className: "border-none p-2", children: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("ul", { className: "text-sm list-disc pl-5 text-gray-600 dark:text-gray-400", children: product.pros.map((pro, idx) => /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("li", { children: pro }, idx, false, {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/AlternativeProducts.tsx",
              lineNumber: 326,
              columnNumber: 25
            }, globalThis)) }, void 0, false, {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/AlternativeProducts.tsx",
              lineNumber: 324,
              columnNumber: 21
            }, globalThis) }, void 0, false, {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/AlternativeProducts.tsx",
              lineNumber: 323,
              columnNumber: 19
            }, globalThis),
            /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(TabsContent, { value: "cons", className: "border-none p-2", children: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("ul", { className: "text-sm list-disc pl-5 text-gray-600 dark:text-gray-400", children: product.cons.map((con, idx) => /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("li", { children: con }, idx, false, {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/AlternativeProducts.tsx",
              lineNumber: 333,
              columnNumber: 25
            }, globalThis)) }, void 0, false, {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/AlternativeProducts.tsx",
              lineNumber: 331,
              columnNumber: 21
            }, globalThis) }, void 0, false, {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/AlternativeProducts.tsx",
              lineNumber: 330,
              columnNumber: 19
            }, globalThis),
            /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(TabsContent, { value: "bestFor", className: "border-none p-2", children: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("ul", { className: "text-sm list-disc pl-5 text-gray-600 dark:text-gray-400", children: product.bestFor.map((best, idx) => /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("li", { children: best }, idx, false, {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/AlternativeProducts.tsx",
              lineNumber: 340,
              columnNumber: 25
            }, globalThis)) }, void 0, false, {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/AlternativeProducts.tsx",
              lineNumber: 338,
              columnNumber: 21
            }, globalThis) }, void 0, false, {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/AlternativeProducts.tsx",
              lineNumber: 337,
              columnNumber: 19
            }, globalThis)
          ] }, void 0, true, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/AlternativeProducts.tsx",
            lineNumber: 317,
            columnNumber: 17
          }, globalThis)
        ] }, void 0, true, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/AlternativeProducts.tsx",
          lineNumber: 292,
          columnNumber: 15
        }, globalThis),
        /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(CardFooter, { className: "flex justify-between border-t border-green-100 dark:border-green-900/50 pt-4", children: [
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Badge, { className: product.available ? "bg-green-600" : "bg-gray-400", children: product.available ? "In Stock" : "Out of Stock" }, void 0, false, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/AlternativeProducts.tsx",
            lineNumber: 347,
            columnNumber: 17
          }, globalThis),
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Button, { variant: "outline", className: "border-green-500 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/30", children: [
            /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(ShoppingBag, { className: "h-4 w-4 mr-2" }, void 0, false, {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/AlternativeProducts.tsx",
              lineNumber: 351,
              columnNumber: 19
            }, globalThis),
            "Learn More"
          ] }, void 0, true, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/AlternativeProducts.tsx",
            lineNumber: 350,
            columnNumber: 17
          }, globalThis)
        ] }, void 0, true, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/AlternativeProducts.tsx",
          lineNumber: 346,
          columnNumber: 15
        }, globalThis)
      ] }, product.id, true, {
        fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/AlternativeProducts.tsx",
        lineNumber: 272,
        columnNumber: 13
      }, globalThis)) }, void 0, false, {
        fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/AlternativeProducts.tsx",
        lineNumber: 270,
        columnNumber: 9
      }, globalThis),
      filteredProducts.length === 0 && /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "text-center py-10 border rounded-lg mt-4 border-gray-200 dark:border-gray-700", children: [
        /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("p", { className: "text-gray-500 dark:text-gray-400", children: "No products found matching your criteria." }, void 0, false, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/AlternativeProducts.tsx",
          lineNumber: 361,
          columnNumber: 13
        }, globalThis),
        /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(
          Button,
          {
            variant: "link",
            onClick: () => {
              setFilterType("all");
              setSearchQuery("");
            },
            className: "mt-2 text-green-600 dark:text-green-500",
            children: "Clear filters"
          },
          void 0,
          false,
          {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/AlternativeProducts.tsx",
            lineNumber: 362,
            columnNumber: 13
          },
          globalThis
        )
      ] }, void 0, true, {
        fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/AlternativeProducts.tsx",
        lineNumber: 360,
        columnNumber: 11
      }, globalThis)
    ] }, void 0, true, {
      fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/AlternativeProducts.tsx",
      lineNumber: 219,
      columnNumber: 7
    }, globalThis),
    /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "bg-green-50 dark:bg-green-900/20 p-6 rounded-lg mt-12 border border-green-100 dark:border-green-800", children: [
      /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("h2", { className: "text-2xl font-bold text-green-700 dark:text-green-400 mb-4", children: "Helping Others Stay Fresh with Modern Alternatives" }, void 0, false, {
        fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/AlternativeProducts.tsx",
        lineNumber: 375,
        columnNumber: 9
      }, globalThis),
      /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("p", { className: "text-gray-700 dark:text-gray-300 mb-4", children: "These smoke-free, tobacco-free alternatives can help others maintain freshness without the harmful effects of combustion. They're ideal for those who find traditional quitting methods too challenging." }, void 0, false, {
        fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/AlternativeProducts.tsx",
        lineNumber: 378,
        columnNumber: 9
      }, globalThis),
      /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4 mt-4", children: [
        /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "flex items-start gap-3", children: [
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Sparkles, { className: "h-5 w-5 text-green-600 mt-1 flex-shrink-0" }, void 0, false, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/AlternativeProducts.tsx",
            lineNumber: 385,
            columnNumber: 13
          }, globalThis),
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { children: [
            /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("h3", { className: "font-medium text-green-700 dark:text-green-400", children: "Smoke-Free Benefits" }, void 0, false, {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/AlternativeProducts.tsx",
              lineNumber: 387,
              columnNumber: 15
            }, globalThis),
            /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("p", { className: "text-sm text-gray-600 dark:text-gray-400", children: "No combustion means no tar, carbon monoxide, or thousands of other harmful chemicals found in smoke." }, void 0, false, {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/AlternativeProducts.tsx",
              lineNumber: 388,
              columnNumber: 15
            }, globalThis)
          ] }, void 0, true, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/AlternativeProducts.tsx",
            lineNumber: 386,
            columnNumber: 13
          }, globalThis)
        ] }, void 0, true, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/AlternativeProducts.tsx",
          lineNumber: 384,
          columnNumber: 11
        }, globalThis),
        /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "flex items-start gap-3", children: [
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Clock, { className: "h-5 w-5 text-green-600 mt-1 flex-shrink-0" }, void 0, false, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/AlternativeProducts.tsx",
            lineNumber: 395,
            columnNumber: 13
          }, globalThis),
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { children: [
            /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("h3", { className: "font-medium text-green-700 dark:text-green-400", children: "Transition Products" }, void 0, false, {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/AlternativeProducts.tsx",
              lineNumber: 397,
              columnNumber: 15
            }, globalThis),
            /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("p", { className: "text-sm text-gray-600 dark:text-gray-400", children: "These can be used as stepping stones toward complete nicotine cessation or as long-term alternatives." }, void 0, false, {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/AlternativeProducts.tsx",
              lineNumber: 398,
              columnNumber: 15
            }, globalThis)
          ] }, void 0, true, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/AlternativeProducts.tsx",
            lineNumber: 396,
            columnNumber: 13
          }, globalThis)
        ] }, void 0, true, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/AlternativeProducts.tsx",
          lineNumber: 394,
          columnNumber: 11
        }, globalThis),
        /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "flex items-start gap-3", children: [
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Heart, { className: "h-5 w-5 text-green-600 mt-1 flex-shrink-0" }, void 0, false, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/AlternativeProducts.tsx",
            lineNumber: 405,
            columnNumber: 13
          }, globalThis),
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { children: [
            /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("h3", { className: "font-medium text-green-700 dark:text-green-400", children: "Harm Reduction" }, void 0, false, {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/AlternativeProducts.tsx",
              lineNumber: 407,
              columnNumber: 15
            }, globalThis),
            /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("p", { className: "text-sm text-gray-600 dark:text-gray-400", children: "While not risk-free, these products are generally considered much less harmful than continued smoking." }, void 0, false, {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/AlternativeProducts.tsx",
              lineNumber: 408,
              columnNumber: 15
            }, globalThis)
          ] }, void 0, true, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/AlternativeProducts.tsx",
            lineNumber: 406,
            columnNumber: 13
          }, globalThis)
        ] }, void 0, true, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/AlternativeProducts.tsx",
          lineNumber: 404,
          columnNumber: 11
        }, globalThis),
        /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "flex items-start gap-3", children: [
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Zap, { className: "h-5 w-5 text-green-600 mt-1 flex-shrink-0" }, void 0, false, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/AlternativeProducts.tsx",
            lineNumber: 415,
            columnNumber: 13
          }, globalThis),
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { children: [
            /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("h3", { className: "font-medium text-green-700 dark:text-green-400", children: "Social Acceptance" }, void 0, false, {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/AlternativeProducts.tsx",
              lineNumber: 417,
              columnNumber: 15
            }, globalThis),
            /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("p", { className: "text-sm text-gray-600 dark:text-gray-400", children: "These discreet options can be used in many places where smoking is prohibited." }, void 0, false, {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/AlternativeProducts.tsx",
              lineNumber: 418,
              columnNumber: 15
            }, globalThis)
          ] }, void 0, true, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/AlternativeProducts.tsx",
            lineNumber: 416,
            columnNumber: 13
          }, globalThis)
        ] }, void 0, true, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/AlternativeProducts.tsx",
          lineNumber: 414,
          columnNumber: 11
        }, globalThis)
      ] }, void 0, true, {
        fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/AlternativeProducts.tsx",
        lineNumber: 383,
        columnNumber: 9
      }, globalThis),
      /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "mt-6 text-center", children: [
        /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Button, { className: "bg-green-600 hover:bg-green-700", children: "Share This Information" }, void 0, false, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/AlternativeProducts.tsx",
          lineNumber: 426,
          columnNumber: 11
        }, globalThis),
        /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("p", { className: "text-xs text-gray-500 dark:text-gray-400 mt-2", children: "Remember: The best option is complete cessation, but these alternatives can be helpful for those who struggle with traditional methods." }, void 0, false, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/AlternativeProducts.tsx",
          lineNumber: 429,
          columnNumber: 11
        }, globalThis)
      ] }, void 0, true, {
        fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/AlternativeProducts.tsx",
        lineNumber: 425,
        columnNumber: 9
      }, globalThis)
    ] }, void 0, true, {
      fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/AlternativeProducts.tsx",
      lineNumber: 374,
      columnNumber: 7
    }, globalThis)
  ] }, void 0, true, {
    fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/AlternativeProducts.tsx",
    lineNumber: 218,
    columnNumber: 5
  }, globalThis);
};

export { AlternativeProducts };

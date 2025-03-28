import { i as importShared } from './react-vendor-773e5a75.js';
import { u as useAuth } from './AuthProvider-b0b4665b.js';
import { e as Select, f as SelectTrigger, g as SelectValue, h as SelectContent, i as SelectItem, m as Badge, T as Tabs, a as TabsList, b as TabsTrigger, c as TabsContent, B as Button } from './toast-58ac552a.js';
import { I as Input } from './textarea-ba0b28ab.js';
import { C as Card, a as CardHeader, b as CardTitle, d as CardContent, e as CardFooter } from './card-7a71f808.js';
import { j as jsxRuntimeExports } from './ui-vendor-336c871f.js';

const {useState} = await importShared('react');
const {Search,Star,Filter,ArrowUpDown,Leaf,ThumbsUp,Droplets,Heart,ShoppingBag,Sparkles,Zap,Clock} = await importShared('lucide-react');
const AlternativeProducts = () => {
  useAuth();
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
      pros: [
        "Completely smoke-free",
        "No tobacco",
        "Discreet to use anywhere",
        "No staining"
      ],
      cons: ["May cause gum irritation", "Limited flavor duration"],
      bestFor: [
        "Social situations",
        "Work environments",
        "Discreet nicotine use"
      ],
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
      pros: [
        "Better taste than traditional nicotine gum",
        "Familiar format",
        "Adjustable usage"
      ],
      cons: ["Requires proper chewing technique", "May cause jaw fatigue"],
      bestFor: [
        "Former smokers familiar with nicotine gum",
        "Those who enjoy chewing gum"
      ],
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
      pros: [
        "Mimics hand-to-mouth habit",
        "Provides oral fixation",
        "Socially acceptable"
      ],
      cons: ["Variable nicotine delivery", "Can splinter", "Limited duration"],
      bestFor: [
        "Those who miss the hand-to-mouth ritual",
        "Social settings",
        "After meals"
      ],
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
    return /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "div",
      { className: "flex items-center", children: [
        [...Array(5)].map(
          (_, i) => /* @__PURE__ */ jsxRuntimeExports.jsx(
            Star,
            {
              className: `h-4 w-4 ${i < Math.floor(rating) ? "text-yellow-500 fill-yellow-500" : i < rating ? "text-yellow-500 fill-yellow-500 opacity-50" : "text-gray-300"}`
            },
            i
          )
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "span",
          { className: "ml-2 text-sm text-gray-600 dark:text-gray-400", children: rating.toFixed(1) }
        )
      ] }
    );
  };
  const renderTypeIcon = (type) => {
    switch (type) {
      case "pouch":
        return /* @__PURE__ */ jsxRuntimeExports.jsx(Droplets, { className: "h-5 w-5 text-green-500" });
      case "lozenge":
        return /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { className: "h-5 w-5 text-purple-500" });
      case "tablet":
        return /* @__PURE__ */ jsxRuntimeExports.jsx(Zap, { className: "h-5 w-5 text-blue-500" });
      case "toothpick":
        return /* @__PURE__ */ jsxRuntimeExports.jsx(Leaf, { className: "h-5 w-5 text-amber-500" });
      case "gum":
        return /* @__PURE__ */ jsxRuntimeExports.jsx(ThumbsUp, { className: "h-5 w-5 text-pink-500" });
      default:
        return null;
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "div",
    { className: "container mx-auto px-4 py-8", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "div",
        { className: "mb-8", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "h1",
            { className: "text-3xl font-bold text-green-700 dark:text-green-400 mb-3", children: "Alternative Nicotine Products" }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "p",
            { className: "text-lg text-gray-600 dark:text-gray-400 mb-6", children: "Explore smoke-free, tobacco-free alternatives to help others stay fresh. These modern options provide nicotine without the harmful effects of combustion." }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "div",
            { className: "grid grid-cols-1 md:grid-cols-3 gap-4 bg-green-50 dark:bg-green-900/30 p-4 rounded-lg mb-6", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "div",
                { className: "relative", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    Input,
                    {
                      placeholder: "Search products...",
                      value: searchQuery,
                      onChange: (e) => setSearchQuery(e.target.value),
                      className: "pl-10 border-green-200 dark:border-green-700 focus:border-green-500 focus:ring-green-500"
                    }
                  )
                ] }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "div",
                { className: "flex items-center gap-2", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Filter, { className: "h-4 w-4 text-gray-500" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(
                    Select,
                    { value: filterType, onValueChange: setFilterType, children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(
                        SelectTrigger,
                        { className: "border-green-200 dark:border-green-700", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Filter by type" }) }
                      ),
                      /* @__PURE__ */ jsxRuntimeExports.jsxs(
                        SelectContent,
                        { children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "all", children: "All Types" }),
                          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "pouch", children: "Pouches" }),
                          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "lozenge", children: "Lozenges" }),
                          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "tablet", children: "Tablets" }),
                          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "toothpick", children: "Toothpicks" }),
                          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "gum", children: "Gum" })
                        ] }
                      )
                    ] }
                  )
                ] }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "div",
                { className: "flex items-center gap-2", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowUpDown, { className: "h-4 w-4 text-gray-500" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(
                    Select,
                    { value: sortBy, onValueChange: setSortBy, children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(
                        SelectTrigger,
                        { className: "border-green-200 dark:border-green-700", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Sort by" }) }
                      ),
                      /* @__PURE__ */ jsxRuntimeExports.jsxs(
                        SelectContent,
                        { children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "rating", children: "Highest Rated" }),
                          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "reviews", children: "Most Reviewed" }),
                          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "name", children: "Alphabetical" })
                        ] }
                      )
                    ] }
                  )
                ] }
              )
            ] }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "div",
            { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6", children: sortedProducts.map(
              (product) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
                Card,
                {
                  className: "border-green-200 dark:border-green-800 hover:shadow-md transition-shadow",
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsxs(
                      CardHeader,
                      { className: "pb-3", children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsxs(
                          "div",
                          { className: "flex justify-between items-start", children: [
                            /* @__PURE__ */ jsxRuntimeExports.jsxs(
                              "div",
                              { className: "flex items-center gap-2", children: [
                                renderTypeIcon(product.type),
                                /* @__PURE__ */ jsxRuntimeExports.jsx(
                                  Badge,
                                  { className: "text-xs capitalize bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-200 dark:border-green-700", children: product.type }
                                )
                              ] }
                            ),
                            /* @__PURE__ */ jsxRuntimeExports.jsx(
                              "div",
                              { className: "text-lg font-semibold text-green-600 dark:text-green-500", children: product.price }
                            )
                          ] }
                        ),
                        /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-xl mt-2", children: product.name }),
                        /* @__PURE__ */ jsxRuntimeExports.jsxs(
                          "div",
                          { className: "flex justify-between items-center mt-1", children: [
                            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm text-gray-500", children: product.brand }),
                            renderStars(product.rating)
                          ] }
                        ),
                        /* @__PURE__ */ jsxRuntimeExports.jsxs(
                          "div",
                          { className: "text-xs text-gray-500", children: [
                            product.reviews,
                            " reviews"
                          ] }
                        )
                      ] }
                    ),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs(
                      CardContent,
                      { children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx(
                          "p",
                          { className: "text-gray-600 dark:text-gray-400 text-sm mb-3", children: product.description }
                        ),
                        /* @__PURE__ */ jsxRuntimeExports.jsxs(
                          "div",
                          { className: "mb-3", children: [
                            /* @__PURE__ */ jsxRuntimeExports.jsx(
                              "div",
                              { className: "text-sm font-medium mb-1", children: "Available Strengths:" }
                            ),
                            /* @__PURE__ */ jsxRuntimeExports.jsx(
                              "div",
                              { className: "flex flex-wrap gap-1", children: product.strengthOptions.map(
                                (strength, idx) => /* @__PURE__ */ jsxRuntimeExports.jsx(
                                  Badge,
                                  {
                                    className: "bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300 border-none",
                                    children: strength
                                  },
                                  idx
                                )
                              ) }
                            )
                          ] }
                        ),
                        /* @__PURE__ */ jsxRuntimeExports.jsxs(
                          "div",
                          { className: "mb-3", children: [
                            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm font-medium mb-1", children: "Flavors:" }),
                            /* @__PURE__ */ jsxRuntimeExports.jsx(
                              "div",
                              { className: "flex flex-wrap gap-1", children: product.flavors.map(
                                (flavor, idx) => /* @__PURE__ */ jsxRuntimeExports.jsx(
                                  Badge,
                                  {
                                    variant: "outline",
                                    className: "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800",
                                    children: flavor
                                  },
                                  idx
                                )
                              ) }
                            )
                          ] }
                        ),
                        /* @__PURE__ */ jsxRuntimeExports.jsxs(
                          Tabs,
                          { defaultValue: "pros", className: "mt-4", children: [
                            /* @__PURE__ */ jsxRuntimeExports.jsxs(
                              TabsList,
                              { className: "w-full bg-green-100 dark:bg-green-900/30", children: [
                                /* @__PURE__ */ jsxRuntimeExports.jsx(
                                  TabsTrigger,
                                  {
                                    value: "pros",
                                    className: "flex-1 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800",
                                    children: "Pros"
                                  }
                                ),
                                /* @__PURE__ */ jsxRuntimeExports.jsx(
                                  TabsTrigger,
                                  {
                                    value: "cons",
                                    className: "flex-1 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800",
                                    children: "Cons"
                                  }
                                ),
                                /* @__PURE__ */ jsxRuntimeExports.jsx(
                                  TabsTrigger,
                                  {
                                    value: "bestFor",
                                    className: "flex-1 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800",
                                    children: "Best For"
                                  }
                                )
                              ] }
                            ),
                            /* @__PURE__ */ jsxRuntimeExports.jsx(
                              TabsContent,
                              { value: "pros", className: "border-none p-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                                "ul",
                                { className: "text-sm list-disc pl-5 text-gray-600 dark:text-gray-400", children: product.pros.map(
                                  (pro, idx) => /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: pro }, idx)
                                ) }
                              ) }
                            ),
                            /* @__PURE__ */ jsxRuntimeExports.jsx(
                              TabsContent,
                              { value: "cons", className: "border-none p-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                                "ul",
                                { className: "text-sm list-disc pl-5 text-gray-600 dark:text-gray-400", children: product.cons.map(
                                  (con, idx) => /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: con }, idx)
                                ) }
                              ) }
                            ),
                            /* @__PURE__ */ jsxRuntimeExports.jsx(
                              TabsContent,
                              { value: "bestFor", className: "border-none p-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                                "ul",
                                { className: "text-sm list-disc pl-5 text-gray-600 dark:text-gray-400", children: product.bestFor.map(
                                  (best, idx) => /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: best }, idx)
                                ) }
                              ) }
                            )
                          ] }
                        )
                      ] }
                    ),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs(
                      CardFooter,
                      { className: "flex justify-between border-t border-green-100 dark:border-green-900/50 pt-4", children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx(
                          Badge,
                          {
                            className: product.available ? "bg-green-600" : "bg-gray-400",
                            children: product.available ? "In Stock" : "Out of Stock"
                          }
                        ),
                        /* @__PURE__ */ jsxRuntimeExports.jsxs(
                          Button,
                          {
                            variant: "outline",
                            className: "border-green-500 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/30",
                            children: [
                              /* @__PURE__ */ jsxRuntimeExports.jsx(ShoppingBag, { className: "h-4 w-4 mr-2" }),
                              "Learn More"
                            ]
                          }
                        )
                      ] }
                    )
                  ]
                },
                product.id
              )
            ) }
          ),
          filteredProducts.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "div",
            { className: "text-center py-10 border rounded-lg mt-4 border-gray-200 dark:border-gray-700", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "p",
                { className: "text-gray-500 dark:text-gray-400", children: "No products found matching your criteria." }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Button,
                {
                  variant: "link",
                  onClick: () => {
                    setFilterType("all");
                    setSearchQuery("");
                  },
                  className: "mt-2 text-green-600 dark:text-green-500",
                  children: "Clear filters"
                }
              )
            ] }
          )
        ] }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "div",
        { className: "bg-green-50 dark:bg-green-900/20 p-6 rounded-lg mt-12 border border-green-100 dark:border-green-800", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "h2",
            { className: "text-2xl font-bold text-green-700 dark:text-green-400 mb-4", children: "Helping Others Stay Fresh with Modern Alternatives" }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "p",
            { className: "text-gray-700 dark:text-gray-300 mb-4", children: "These smoke-free, tobacco-free alternatives can help others maintain freshness without the harmful effects of combustion. They're ideal for those who find traditional quitting methods too challenging." }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "div",
            { className: "grid grid-cols-1 md:grid-cols-2 gap-4 mt-4", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "div",
                { className: "flex items-start gap-3", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { className: "h-5 w-5 text-green-600 mt-1 flex-shrink-0" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(
                    "div",
                    { children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(
                        "h3",
                        { className: "font-medium text-green-700 dark:text-green-400", children: "Smoke-Free Benefits" }
                      ),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(
                        "p",
                        { className: "text-sm text-gray-600 dark:text-gray-400", children: "No combustion means no tar, carbon monoxide, or thousands of other harmful chemicals found in smoke." }
                      )
                    ] }
                  )
                ] }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "div",
                { className: "flex items-start gap-3", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { className: "h-5 w-5 text-green-600 mt-1 flex-shrink-0" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(
                    "div",
                    { children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(
                        "h3",
                        { className: "font-medium text-green-700 dark:text-green-400", children: "Transition Products" }
                      ),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(
                        "p",
                        { className: "text-sm text-gray-600 dark:text-gray-400", children: "These can be used as stepping stones toward complete nicotine cessation or as long-term alternatives." }
                      )
                    ] }
                  )
                ] }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "div",
                { className: "flex items-start gap-3", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Heart, { className: "h-5 w-5 text-green-600 mt-1 flex-shrink-0" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(
                    "div",
                    { children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(
                        "h3",
                        { className: "font-medium text-green-700 dark:text-green-400", children: "Harm Reduction" }
                      ),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(
                        "p",
                        { className: "text-sm text-gray-600 dark:text-gray-400", children: "While not risk-free, these products are generally considered much less harmful than continued smoking." }
                      )
                    ] }
                  )
                ] }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "div",
                { className: "flex items-start gap-3", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Zap, { className: "h-5 w-5 text-green-600 mt-1 flex-shrink-0" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(
                    "div",
                    { children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(
                        "h3",
                        { className: "font-medium text-green-700 dark:text-green-400", children: "Social Acceptance" }
                      ),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(
                        "p",
                        { className: "text-sm text-gray-600 dark:text-gray-400", children: "These discreet options can be used in many places where smoking is prohibited." }
                      )
                    ] }
                  )
                ] }
              )
            ] }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "div",
            { className: "mt-6 text-center", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Button,
                { className: "bg-green-600 hover:bg-green-700", children: "Share This Information" }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "p",
                { className: "text-xs text-gray-500 dark:text-gray-400 mt-2", children: "Remember: The best option is complete cessation, but these alternatives can be helpful for those who struggle with traditional methods." }
              )
            ] }
          )
        ] }
      )
    ] }
  );
};

export { AlternativeProducts };

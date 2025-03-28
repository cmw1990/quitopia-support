import { i as importShared } from './react-vendor-773e5a75.js';
import { u as useAuth } from './AuthProvider-b0b4665b.js';
import { B as Button, m as Badge } from './toast-58ac552a.js';
import './textarea-ba0b28ab.js';
import { C as Card, a as CardHeader, b as CardTitle, d as CardContent, e as CardFooter, c as CardDescription } from './card-7a71f808.js';
import { j as jsxRuntimeExports } from './ui-vendor-336c871f.js';

const {useState,useEffect} = await importShared('react');

const {useNavigate} = await importShared('react-router-dom');
const {BookOpen,Heart,Leaf,Brain,ArrowRight,Calendar,Info,Flame,AlertTriangle,ThumbsUp} = await importShared('lucide-react');
const learningPaths = [
  {
    id: "getting-started",
    title: "Getting Started",
    icon: /* @__PURE__ */ jsxRuntimeExports.jsx(BookOpen, { className: "h-5 w-5" }),
    description: "Essential guides for beginning your quit journey",
    articles: 5,
    color: "bg-blue-100 text-blue-700"
  },
  {
    id: "withdrawal-management",
    title: "Managing Withdrawal",
    icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Brain, { className: "h-5 w-5" }),
    description: "Understanding and coping with nicotine withdrawal",
    articles: 7,
    color: "bg-purple-100 text-purple-700"
  },
  {
    id: "health-recovery",
    title: "Health Recovery",
    icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Heart, { className: "h-5 w-5" }),
    description: "How your body heals after quitting smoking",
    articles: 8,
    color: "bg-green-100 text-green-700"
  },
  {
    id: "coping-strategies",
    title: "Coping Strategies",
    icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Leaf, { className: "h-5 w-5" }),
    description: "Practical ways to handle cravings and avoid relapse",
    articles: 9,
    color: "bg-amber-100 text-amber-700"
  },
  {
    id: "psychological-wellness",
    title: "Mental Wellness",
    icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Brain, { className: "h-5 w-5" }),
    description: "Supporting your mental health during quitting",
    articles: 6,
    color: "bg-indigo-100 text-indigo-700"
  },
  {
    id: "lifestyle-changes",
    title: "Lifestyle Adjustments",
    icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Calendar, { className: "h-5 w-5" }),
    description: "Adapting to a smoke-free lifestyle",
    articles: 7,
    color: "bg-rose-100 text-rose-700"
  }
];
const GuidesHub = ({ session: propSession }) => {
  useAuth();
  const navigate = useNavigate();
  useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const handleCategorySelect = (categoryId) => {
    navigate(`/app/guides?category=${categoryId}`);
  };
  useEffect(() => {
    setTimeout(() => {
      setIsLoading(false);
    }, 1e3);
  }, []);
  const renderLearningPath = (path) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
    Card,
    {
      className: "cursor-pointer hover:shadow-md transition-shadow",
      onClick: () => handleCategorySelect(path.id),
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          CardHeader,
          { className: `pb-3 ${path.color} bg-opacity-20`, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              CardTitle,
              { className: "flex items-center gap-2 text-lg", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "div",
                  { className: `p-2 rounded-full ${path.color} bg-opacity-30`, children: path.icon }
                ),
                path.title
              ] }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              CardDescription,
              { className: "text-sm mt-1", children: path.description }
            )
          ] }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          CardFooter,
          { className: "pt-3 flex justify-between items-center", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              Badge,
              { variant: "outline", className: "flex-shrink-0", children: [
                path.articles,
                " articles"
              ] }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              Button,
              { variant: "ghost", size: "sm", className: "text-primary", children: [
                "Explore ",
                /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowRight, { className: "ml-1 h-4 w-4" })
              ] }
            )
          ] }
        )
      ]
    },
    path.id
  );
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    "div",
    { className: "container max-w-6xl mx-auto px-4 py-6", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "div",
      { className: "space-y-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "div",
          { className: "flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "div",
            { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-3xl font-bold tracking-tight", children: "Quit Smoking Guides" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "p",
                { className: "text-muted-foreground mt-1", children: "Evidence-based articles and expert advice to support your smoke-free journey" }
              )
            ] }
          ) }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "div",
          { className: "grid grid-cols-1 md:grid-cols-3 gap-4 mb-8", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              Card,
              { className: "bg-gradient-to-br from-green-50 to-blue-50 hover:shadow-md transition-shadow cursor-pointer", onClick: () => handleCategorySelect("health-recovery"), children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  CardHeader,
                  { className: "pb-2", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
                    CardTitle,
                    { className: "flex items-center text-lg text-green-800", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(Heart, { className: "h-5 w-5 mr-2 text-green-600" }),
                      "Health Benefits Timeline"
                    ] }
                  ) }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  CardContent,
                  { children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "p",
                    { className: "text-sm text-green-700", children: "Track how your body recovers day by day after quitting smoking" }
                  ) }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  CardFooter,
                  { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
                    Button,
                    { variant: "ghost", className: "text-green-700 p-0 h-auto", children: [
                      "Learn more ",
                      /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowRight, { className: "h-4 w-4 ml-1" })
                    ] }
                  ) }
                )
              ] }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              Card,
              { className: "bg-gradient-to-br from-amber-50 to-orange-50 hover:shadow-md transition-shadow cursor-pointer", onClick: () => handleCategorySelect("coping-strategies"), children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  CardHeader,
                  { className: "pb-2", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
                    CardTitle,
                    { className: "flex items-center text-lg text-amber-800", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(Flame, { className: "h-5 w-5 mr-2 text-amber-600" }),
                      "Managing Cravings"
                    ] }
                  ) }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  CardContent,
                  { children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "p",
                    { className: "text-sm text-amber-700", children: "Effective strategies to overcome nicotine cravings" }
                  ) }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  CardFooter,
                  { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
                    Button,
                    { variant: "ghost", className: "text-amber-700 p-0 h-auto", children: [
                      "Learn more ",
                      /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowRight, { className: "h-4 w-4 ml-1" })
                    ] }
                  ) }
                )
              ] }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              Card,
              { className: "bg-gradient-to-br from-blue-50 to-indigo-50 hover:shadow-md transition-shadow cursor-pointer", onClick: () => handleCategorySelect("psychological-wellness"), children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  CardHeader,
                  { className: "pb-2", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
                    CardTitle,
                    { className: "flex items-center text-lg text-blue-800", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(Brain, { className: "h-5 w-5 mr-2 text-blue-600" }),
                      "Mental Wellbeing"
                    ] }
                  ) }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  CardContent,
                  { children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "p",
                    { className: "text-sm text-blue-700", children: "Supporting your mental health during the quitting process" }
                  ) }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  CardFooter,
                  { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
                    Button,
                    { variant: "ghost", className: "text-blue-700 p-0 h-auto", children: [
                      "Learn more ",
                      /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowRight, { className: "h-4 w-4 ml-1" })
                    ] }
                  ) }
                )
              ] }
            )
          ] }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "div",
          { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "div",
              { className: "flex items-center justify-between mb-4", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-xl font-semibold", children: "Learning Paths" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  Button,
                  {
                    variant: "ghost",
                    size: "sm",
                    className: "text-primary",
                    onClick: () => navigate("/app/guides"),
                    children: [
                      "View All Guides ",
                      /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowRight, { className: "ml-1 h-3.5 w-3.5" })
                    ]
                  }
                )
              ] }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "div",
              { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4", children: learningPaths.map(renderLearningPath) }
            )
          ] }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "div",
          { className: "mt-12", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-xl font-semibold mb-4", children: "Featured Resources" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "div",
              { className: "grid grid-cols-1 sm:grid-cols-2 gap-6", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  Card,
                  { className: "overflow-hidden hover:shadow-md transition-shadow", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsxs(
                      "div",
                      { className: "bg-gradient-to-r from-indigo-500 to-purple-600 p-4 text-white", children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-lg font-semibold mb-1", children: "Quit Smoking Medication Guide" }),
                        /* @__PURE__ */ jsxRuntimeExports.jsx(
                          "p",
                          { className: "text-sm opacity-90", children: "Learn about different medications that can help with quitting" }
                        )
                      ] }
                    ),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      CardContent,
                      { className: "p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
                        "ul",
                        { className: "space-y-2 text-sm", children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsxs(
                            "li",
                            { className: "flex items-start", children: [
                              /* @__PURE__ */ jsxRuntimeExports.jsx(
                                "span",
                                { className: "bg-green-100 text-green-800 rounded-full p-1 mr-2 mt-0.5", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ThumbsUp, { className: "h-3 w-3" }) }
                              ),
                              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Compare nicotine replacement therapies" })
                            ] }
                          ),
                          /* @__PURE__ */ jsxRuntimeExports.jsxs(
                            "li",
                            { className: "flex items-start", children: [
                              /* @__PURE__ */ jsxRuntimeExports.jsx(
                                "span",
                                { className: "bg-green-100 text-green-800 rounded-full p-1 mr-2 mt-0.5", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ThumbsUp, { className: "h-3 w-3" }) }
                              ),
                              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Understand prescription options" })
                            ] }
                          ),
                          /* @__PURE__ */ jsxRuntimeExports.jsxs(
                            "li",
                            { className: "flex items-start", children: [
                              /* @__PURE__ */ jsxRuntimeExports.jsx(
                                "span",
                                { className: "bg-green-100 text-green-800 rounded-full p-1 mr-2 mt-0.5", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ThumbsUp, { className: "h-3 w-3" }) }
                              ),
                              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Learn about potential side effects" })
                            ] }
                          )
                        ] }
                      ) }
                    ),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      CardFooter,
                      { className: "bg-gray-50 border-t px-4 py-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                        Button,
                        {
                          variant: "default",
                          onClick: () => navigate("/app/nrt-directory"),
                          children: "View Guide"
                        }
                      ) }
                    )
                  ] }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  Card,
                  { className: "overflow-hidden hover:shadow-md transition-shadow", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsxs(
                      "div",
                      { className: "bg-gradient-to-r from-amber-500 to-orange-600 p-4 text-white", children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-lg font-semibold mb-1", children: "Relapse Prevention Plan" }),
                        /* @__PURE__ */ jsxRuntimeExports.jsx(
                          "p",
                          { className: "text-sm opacity-90", children: "Create a personalized plan to stay smoke-free long term" }
                        )
                      ] }
                    ),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      CardContent,
                      { className: "p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
                        "ul",
                        { className: "space-y-2 text-sm", children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsxs(
                            "li",
                            { className: "flex items-start", children: [
                              /* @__PURE__ */ jsxRuntimeExports.jsx(
                                "span",
                                { className: "bg-amber-100 text-amber-800 rounded-full p-1 mr-2 mt-0.5", children: /* @__PURE__ */ jsxRuntimeExports.jsx(AlertTriangle, { className: "h-3 w-3" }) }
                              ),
                              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Identify your personal triggers" })
                            ] }
                          ),
                          /* @__PURE__ */ jsxRuntimeExports.jsxs(
                            "li",
                            { className: "flex items-start", children: [
                              /* @__PURE__ */ jsxRuntimeExports.jsx(
                                "span",
                                { className: "bg-amber-100 text-amber-800 rounded-full p-1 mr-2 mt-0.5", children: /* @__PURE__ */ jsxRuntimeExports.jsx(AlertTriangle, { className: "h-3 w-3" }) }
                              ),
                              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Develop coping strategies for high-risk situations" })
                            ] }
                          ),
                          /* @__PURE__ */ jsxRuntimeExports.jsxs(
                            "li",
                            { className: "flex items-start", children: [
                              /* @__PURE__ */ jsxRuntimeExports.jsx(
                                "span",
                                { className: "bg-amber-100 text-amber-800 rounded-full p-1 mr-2 mt-0.5", children: /* @__PURE__ */ jsxRuntimeExports.jsx(AlertTriangle, { className: "h-3 w-3" }) }
                              ),
                              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Create an emergency response plan" })
                            ] }
                          )
                        ] }
                      ) }
                    ),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      CardFooter,
                      { className: "bg-gray-50 border-t px-4 py-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                        Button,
                        {
                          variant: "default",
                          onClick: () => navigate("/app/coping-strategies"),
                          children: "Create Plan"
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
          "div",
          { className: "mt-12 p-6 bg-blue-50 rounded-lg", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "div",
            { className: "flex items-start", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "div",
                { className: "bg-blue-100 p-3 rounded-full mr-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Info, { className: "h-6 w-6 text-blue-700" }) }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "div",
                { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "h2",
                    { className: "text-xl font-semibold mb-2 text-blue-900", children: "Evidence-Based Approach" }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "p",
                    { className: "text-blue-700 mb-4", children: "All our guides and recommendations are based on scientific research and clinical guidelines." }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(
                    "div",
                    { className: "flex flex-wrap gap-3", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(
                        Badge,
                        { variant: "outline", className: "bg-white/80 text-blue-700", children: "Clinical Studies" }
                      ),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(
                        Badge,
                        { variant: "outline", className: "bg-white/80 text-blue-700", children: "Success Rates" }
                      ),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(
                        Badge,
                        { variant: "outline", className: "bg-white/80 text-blue-700", children: "Latest Research" }
                      ),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(
                        Badge,
                        { variant: "outline", className: "bg-white/80 text-blue-700", children: "Expert Reviewed" }
                      )
                    ] }
                  )
                ] }
              )
            ] }
          ) }
        )
      ] }
    ) }
  );
};

export { GuidesHub };

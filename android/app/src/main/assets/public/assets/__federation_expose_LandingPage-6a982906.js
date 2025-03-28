import { i as importShared } from './react-vendor-773e5a75.js';
import { u as useAuth } from './AuthProvider-b0b4665b.js';
import { B as Button } from './toast-58ac552a.js';
import './textarea-ba0b28ab.js';
import { C as Card, d as CardContent } from './card-7a71f808.js';
import { j as jsxRuntimeExports } from './ui-vendor-336c871f.js';

const React = await importShared('react');

const {useNavigate} = await importShared('react-router-dom');
const {Heart,Smile,Star,Trophy,Zap,CheckCircle,ArrowRight,Users,LineChart,Snowflake,Check,Leaf,Menu,BookOpen,Brain,Pill} = await importShared('lucide-react');

const {Link} = await importShared('react-router-dom');

const {Calendar} = await importShared('lucide-react');
const LandingPage = () => {
  const navigate = useNavigate();
  const { session } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const handleGetStarted = () => {
    if (session) {
      navigate("/app");
    } else {
      navigate("/login");
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "div",
    { className: "flex flex-col min-h-screen", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "header",
        { className: "bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-50", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "div",
          { className: "container mx-auto px-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "div",
              { className: "flex items-center justify-between h-16", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "div",
                  { className: "flex items-center", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
                    Link,
                    { to: "/", className: "flex items-center", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(Leaf, { className: "h-6 w-6 text-green-600 dark:text-green-500 mr-2" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-bold text-xl", children: "Mission Fresh" })
                    ] }
                  ) }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  "nav",
                  { className: "hidden md:flex space-x-8", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      Link,
                      {
                        to: "/nrt-directory",
                        className: "text-gray-700 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-500 font-medium",
                        children: "NRT Directory"
                      }
                    ),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      Link,
                      {
                        to: "/guides",
                        className: "text-gray-700 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-500 font-medium",
                        children: "Guides"
                      }
                    ),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      Link,
                      {
                        to: "/tools",
                        className: "text-gray-700 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-500 font-medium",
                        children: "Tools"
                      }
                    ),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      Link,
                      {
                        to: "/community",
                        className: "text-gray-700 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-500 font-medium",
                        children: "Community"
                      }
                    ),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      Link,
                      {
                        to: "/alternative-products",
                        className: "text-gray-700 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-500 font-medium",
                        children: "Alternatives"
                      }
                    )
                  ] }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "div",
                  { className: "md:hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "button",
                    {
                      onClick: () => setMobileMenuOpen(!mobileMenuOpen),
                      className: "text-gray-700 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-500",
                      children: /* @__PURE__ */ jsxRuntimeExports.jsx(Menu, { className: "h-6 w-6" })
                    }
                  ) }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "div",
                  { className: "hidden md:block", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                    Button,
                    {
                      onClick: handleGetStarted,
                      className: "bg-green-600 hover:bg-green-700 text-white",
                      children: session ? "Dashboard" : "Get Started"
                    }
                  ) }
                )
              ] }
            ),
            mobileMenuOpen && /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "div",
              { className: "md:hidden py-2 pb-4", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Link,
                  {
                    to: "/nrt-directory",
                    className: "block py-2 text-gray-700 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-500 font-medium",
                    children: "NRT Directory"
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Link,
                  {
                    to: "/guides",
                    className: "block py-2 text-gray-700 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-500 font-medium",
                    children: "Guides"
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Link,
                  {
                    to: "/tools",
                    className: "block py-2 text-gray-700 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-500 font-medium",
                    children: "Tools"
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Link,
                  {
                    to: "/community",
                    className: "block py-2 text-gray-700 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-500 font-medium",
                    children: "Community"
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Link,
                  {
                    to: "/alternative-products",
                    className: "block py-2 text-gray-700 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-500 font-medium",
                    children: "Alternatives"
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "div",
                  { className: "mt-3 flex flex-col space-y-2", children: session ? /* @__PURE__ */ jsxRuntimeExports.jsx(
                    Button,
                    {
                      onClick: () => navigate("/app"),
                      className: "w-full bg-green-600 hover:bg-green-700 text-white",
                      children: "Go to Dashboard"
                    }
                  ) : /* @__PURE__ */ jsxRuntimeExports.jsx(
                    Button,
                    {
                      onClick: () => navigate("/login"),
                      className: "w-full bg-green-600 hover:bg-green-700 text-white",
                      children: "Get Started"
                    }
                  ) }
                )
              ] }
            )
          ] }
        ) }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "section",
        { className: "bg-gradient-to-br from-green-800 to-green-600 text-white py-16 md:py-24", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          "div",
          { className: "container px-4 mx-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "div",
            { className: "flex flex-col md:flex-row items-center space-zen-y md:space-zen-y-0", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "div",
                { className: "md:w-1/2 mb-10 md:mb-0 animate-fade-in", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(
                    "h1",
                    { className: "text-4xl md:text-5xl font-bold mb-6 tracking-tight", children: [
                      "Your ",
                      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-white/90 italic", children: "Journey" }),
                      ",",
                      " ",
                      /* @__PURE__ */ jsxRuntimeExports.jsx("br", {}),
                      "Your ",
                      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-white/90 italic", children: "Choice" }),
                      ",",
                      " ",
                      /* @__PURE__ */ jsxRuntimeExports.jsx("br", {}),
                      "Our ",
                      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-white/90 italic", children: "Support" })
                    ] }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "p",
                    { className: "text-xl md:text-2xl mb-4 text-white/90 font-light", children: "The world's most comprehensive quit-smoking app that respects your individual path." }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "p",
                    { className: "text-lg mb-8 text-white/80 font-light max-w-xl", children: "Whether you want to quit cold turkey, gradually reduce, use NRTs, or explore smokeless alternatives, we provide judgment-free support for your entire wellbeing throughout the journey." }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "div",
                    { className: "flex flex-col sm:flex-row gap-4", children: session ? /* @__PURE__ */ jsxRuntimeExports.jsx(
                      Button,
                      {
                        size: "lg",
                        onClick: () => navigate("/app"),
                        className: "bg-white text-green-700 hover:bg-white/90",
                        children: "Go to Dashboard"
                      }
                    ) : /* @__PURE__ */ jsxRuntimeExports.jsx(
                      Button,
                      {
                        size: "lg",
                        onClick: () => navigate("/login"),
                        className: "bg-white text-green-700 hover:bg-white/90",
                        children: "Get Started"
                      }
                    ) }
                  )
                ] }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "div",
                { className: "md:w-1/2 flex justify-center animate-slide-up", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  "div",
                  { className: "frosted-container p-8 max-w-md", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsxs(
                      "div",
                      { className: "flex space-x-3 mb-6", children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "w-3 h-3 rounded-full bg-accent" }),
                        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "w-3 h-3 rounded-full bg-primary-light" }),
                        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "w-3 h-3 rounded-full bg-secondary" })
                      ] }
                    ),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs(
                      "div",
                      { className: "space-y-4", children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsxs(
                          "div",
                          { className: "flex items-center p-3 bg-green-700/60 rounded-lg", children: [
                            /* @__PURE__ */ jsxRuntimeExports.jsx(
                              "div",
                              { className: "bg-success/20 p-2 rounded-full mr-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx(CheckCircle, { className: "h-5 w-5 text-white" }) }
                            ),
                            /* @__PURE__ */ jsxRuntimeExports.jsxs(
                              "div",
                              { children: [
                                /* @__PURE__ */ jsxRuntimeExports.jsx(
                                  "p",
                                  { className: "text-white font-medium", children: "Track Your Progress" }
                                ),
                                /* @__PURE__ */ jsxRuntimeExports.jsx(
                                  "p",
                                  { className: "text-white/70 text-sm", children: "Visualize your health improvements over time" }
                                )
                              ] }
                            )
                          ] }
                        ),
                        /* @__PURE__ */ jsxRuntimeExports.jsxs(
                          "div",
                          { className: "flex items-center p-3 bg-green-700/60 rounded-lg", children: [
                            /* @__PURE__ */ jsxRuntimeExports.jsx(
                              "div",
                              { className: "bg-accent/20 p-2 rounded-full mr-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Zap, { className: "h-5 w-5 text-white" }) }
                            ),
                            /* @__PURE__ */ jsxRuntimeExports.jsxs(
                              "div",
                              { children: [
                                /* @__PURE__ */ jsxRuntimeExports.jsx(
                                  "p",
                                  { className: "text-white font-medium", children: "Personalized Plans" }
                                ),
                                /* @__PURE__ */ jsxRuntimeExports.jsx(
                                  "p",
                                  { className: "text-white/70 text-sm", children: "Tailored support for your specific goals" }
                                )
                              ] }
                            )
                          ] }
                        ),
                        /* @__PURE__ */ jsxRuntimeExports.jsxs(
                          "div",
                          { className: "flex items-center p-3 bg-green-700/60 rounded-lg", children: [
                            /* @__PURE__ */ jsxRuntimeExports.jsx(
                              "div",
                              { className: "bg-secondary/20 p-2 rounded-full mr-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Brain, { className: "h-5 w-5 text-white" }) }
                            ),
                            /* @__PURE__ */ jsxRuntimeExports.jsxs(
                              "div",
                              { children: [
                                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-white font-medium", children: "Expert Resources" }),
                                /* @__PURE__ */ jsxRuntimeExports.jsx(
                                  "p",
                                  { className: "text-white/70 text-sm", children: "Science-backed tools and strategies" }
                                )
                              ] }
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
        ) }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "section",
        { className: "py-16 bg-white dark:bg-gray-900", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "div",
          { className: "container px-4 mx-auto", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "h2",
              { className: "text-3xl font-bold text-center mb-12 text-gray-800 dark:text-white", children: "Choose Your Quit Path" }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "div",
              { className: "grid grid-cols-1 md:grid-cols-3 gap-8", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Card,
                  { className: "border-t-4 border-t-blue-500", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
                    CardContent,
                    { className: "pt-6", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(
                        "div",
                        { className: "flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900 mb-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Snowflake, { className: "h-6 w-6 text-blue-500" }) }
                      ),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-xl font-semibold mb-2", children: "Cold Turkey" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(
                        "p",
                        { className: "text-gray-600 dark:text-gray-400 mb-4", children: "Immediate cessation with tools to help you manage withdrawal and cravings." }
                      ),
                      /* @__PURE__ */ jsxRuntimeExports.jsxs(
                        "ul",
                        { className: "space-y-2 mb-6", children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsxs(
                            "li",
                            { className: "flex items-start", children: [
                              /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { className: "h-5 w-5 text-green-500 mr-2 mt-0.5" }),
                              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Withdrawal symptom tracker" })
                            ] }
                          ),
                          /* @__PURE__ */ jsxRuntimeExports.jsxs(
                            "li",
                            { className: "flex items-start", children: [
                              /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { className: "h-5 w-5 text-green-500 mr-2 mt-0.5" }),
                              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Craving management techniques" })
                            ] }
                          ),
                          /* @__PURE__ */ jsxRuntimeExports.jsxs(
                            "li",
                            { className: "flex items-start", children: [
                              /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { className: "h-5 w-5 text-green-500 mr-2 mt-0.5" }),
                              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Community support groups" })
                            ] }
                          )
                        ] }
                      ),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(
                        Button,
                        {
                          onClick: () => navigate("/guides"),
                          className: "w-full bg-green-600 hover:bg-green-700 text-white",
                          children: "Learn More"
                        }
                      )
                    ] }
                  ) }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Card,
                  { className: "border-t-4 border-t-purple-500", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
                    CardContent,
                    { className: "pt-6", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(
                        "div",
                        { className: "flex items-center justify-center w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-900 mb-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pill, { className: "h-6 w-6 text-purple-500" }) }
                      ),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-xl font-semibold mb-2", children: "NRT Approach" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(
                        "p",
                        { className: "text-gray-600 dark:text-gray-400 mb-4", children: "Using nicotine replacement therapies to gradually reduce dependency." }
                      ),
                      /* @__PURE__ */ jsxRuntimeExports.jsxs(
                        "ul",
                        { className: "space-y-2 mb-6", children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsxs(
                            "li",
                            { className: "flex items-start", children: [
                              /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { className: "h-5 w-5 text-green-500 mr-2 mt-0.5" }),
                              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Product comparisons and guidance" })
                            ] }
                          ),
                          /* @__PURE__ */ jsxRuntimeExports.jsxs(
                            "li",
                            { className: "flex items-start", children: [
                              /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { className: "h-5 w-5 text-green-500 mr-2 mt-0.5" }),
                              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Dosage tracking and reminders" })
                            ] }
                          ),
                          /* @__PURE__ */ jsxRuntimeExports.jsxs(
                            "li",
                            { className: "flex items-start", children: [
                              /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { className: "h-5 w-5 text-green-500 mr-2 mt-0.5" }),
                              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Step-down planning tools" })
                            ] }
                          )
                        ] }
                      ),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(
                        Button,
                        {
                          onClick: () => window.location.href = "/nrt-directory",
                          className: "w-full bg-green-600 hover:bg-green-700 text-white",
                          children: "Explore NRT Options"
                        }
                      )
                    ] }
                  ) }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Card,
                  { className: "border-t-4 border-t-teal-500", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
                    CardContent,
                    { className: "pt-6", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(
                        "div",
                        { className: "flex items-center justify-center w-12 h-12 rounded-full bg-teal-100 dark:bg-teal-900 mb-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Zap, { className: "h-6 w-6 text-teal-500" }) }
                      ),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(
                        "h3",
                        { className: "text-xl font-semibold mb-2", children: "Alternative Products" }
                      ),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(
                        "p",
                        { className: "text-gray-600 dark:text-gray-400 mb-4", children: "Exploring smokeless alternatives as part of harm reduction strategy." }
                      ),
                      /* @__PURE__ */ jsxRuntimeExports.jsxs(
                        "ul",
                        { className: "space-y-2 mb-6", children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsxs(
                            "li",
                            { className: "flex items-start", children: [
                              /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { className: "h-5 w-5 text-green-500 mr-2 mt-0.5" }),
                              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Research-backed comparisons" })
                            ] }
                          ),
                          /* @__PURE__ */ jsxRuntimeExports.jsxs(
                            "li",
                            { className: "flex items-start", children: [
                              /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { className: "h-5 w-5 text-green-500 mr-2 mt-0.5" }),
                              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Usage tracking and insights" })
                            ] }
                          ),
                          /* @__PURE__ */ jsxRuntimeExports.jsxs(
                            "li",
                            { className: "flex items-start", children: [
                              /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { className: "h-5 w-5 text-green-500 mr-2 mt-0.5" }),
                              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Transition assistance programs" })
                            ] }
                          )
                        ] }
                      ),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(
                        Button,
                        {
                          onClick: () => window.location.href = "/alternative-products",
                          className: "w-full bg-green-600 hover:bg-green-700 text-white",
                          children: "Explore Alternatives"
                        }
                      )
                    ] }
                  ) }
                )
              ] }
            )
          ] }
        ) }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "section",
        { className: "py-16 bg-gray-50 dark:bg-gray-800", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "div",
          { className: "container px-4 mx-auto", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "h2",
              { className: "text-3xl font-bold text-center mb-4 text-gray-800 dark:text-white", children: "Comprehensive Support Tools" }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "p",
              { className: "text-center text-gray-600 dark:text-gray-400 max-w-3xl mx-auto mb-12", children: "Our app provides a full suite of tools designed to support your quit journey, whether you're just considering quitting or already on your way." }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "div",
              { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Card,
                  { className: "hover:shadow-md transition-shadow", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
                    CardContent,
                    { className: "pt-6", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(
                        "div",
                        { className: "flex justify-center mb-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Calendar, { className: "h-8 w-8 text-green-600" }) }
                      ),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(
                        "h3",
                        { className: "text-lg font-semibold text-center mb-2", children: "Health Recovery Timeline" }
                      ),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(
                        "p",
                        { className: "text-center text-gray-600 dark:text-gray-400 text-sm", children: "Track how your body heals from the moment you quit smoking." }
                      )
                    ] }
                  ) }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Card,
                  { className: "hover:shadow-md transition-shadow", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
                    CardContent,
                    { className: "pt-6", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(
                        "div",
                        { className: "flex justify-center mb-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx(LineChart, { className: "h-8 w-8 text-green-600" }) }
                      ),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(
                        "h3",
                        { className: "text-lg font-semibold text-center mb-2", children: "Financial Impact Calculator" }
                      ),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(
                        "p",
                        { className: "text-center text-gray-600 dark:text-gray-400 text-sm", children: "See how much money you save by quitting smoking." }
                      )
                    ] }
                  ) }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Card,
                  { className: "hover:shadow-md transition-shadow", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
                    CardContent,
                    { className: "pt-6", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(
                        "div",
                        { className: "flex justify-center mb-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx(BookOpen, { className: "h-8 w-8 text-green-600" }) }
                      ),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(
                        "h3",
                        { className: "text-lg font-semibold text-center mb-2", children: "Guide Library" }
                      ),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(
                        "p",
                        { className: "text-center text-gray-600 dark:text-gray-400 text-sm", children: "Access our extensive collection of quitting guides and resources." }
                      )
                    ] }
                  ) }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Card,
                  { className: "hover:shadow-md transition-shadow", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
                    CardContent,
                    { className: "pt-6", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(
                        "div",
                        { className: "flex justify-center mb-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Users, { className: "h-8 w-8 text-green-600" }) }
                      ),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(
                        "h3",
                        { className: "text-lg font-semibold text-center mb-2", children: "Community Support" }
                      ),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(
                        "p",
                        { className: "text-center text-gray-600 dark:text-gray-400 text-sm", children: "Connect with others on the same journey for motivation and advice." }
                      )
                    ] }
                  ) }
                )
              ] }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "div",
              { className: "text-center mt-12", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                Button,
                {
                  onClick: () => navigate("/guides"),
                  className: "bg-green-600 hover:bg-green-700",
                  children: "Explore All Tools"
                }
              ) }
            )
          ] }
        ) }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "section",
        { className: "py-16 bg-white dark:bg-gray-900", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          "div",
          { className: "container px-4 mx-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "div",
            { className: "flex flex-col md:flex-row md:items-center md:justify-between mb-12", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "div",
                { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "h2",
                    { className: "text-3xl font-bold mb-4 text-gray-800 dark:text-white", children: "NRT Products Directory" }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "p",
                    { className: "text-gray-600 dark:text-gray-400 max-w-2xl", children: "Browse our comprehensive directory of nicotine replacement therapy products with detailed information, reviews, and effectiveness data." }
                  )
                ] }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                Link,
                {
                  to: "/nrt-directory",
                  className: "mt-4 md:mt-0 inline-flex items-center text-green-600 hover:text-green-700 font-medium",
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "View Full Directory" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowRight, { className: "ml-2 h-4 w-4" })
                  ]
                }
              )
            ] }
          ) }
        ) }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "section",
        { className: "py-16 bg-gray-50 dark:bg-gray-800", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "div",
          { className: "container px-4 mx-auto", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "h2",
              { className: "text-3xl font-bold text-center mb-4 text-gray-800 dark:text-white", children: "Success Stories" }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "p",
              { className: "text-center text-gray-600 dark:text-gray-400 max-w-3xl mx-auto mb-12", children: "Real stories from real people who have successfully quit smoking using our app." }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "div",
              { className: "grid grid-cols-1 md:grid-cols-3 gap-8", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Card,
                  { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
                    CardContent,
                    { className: "pt-6", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(
                        "div",
                        { className: "flex justify-center mb-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                          "div",
                          { className: "w-16 h-16 rounded-full bg-green-100 flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trophy, { className: "h-8 w-8 text-green-600" }) }
                        ) }
                      ),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(
                        "div",
                        { className: "flex justify-center mb-2", children: [1, 2, 3, 4, 5].map(
                          (star) => /* @__PURE__ */ jsxRuntimeExports.jsx(
                            Star,
                            {
                              className: "h-5 w-5 text-yellow-500 fill-yellow-500"
                            },
                            star
                          )
                        ) }
                      ),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(
                        "p",
                        { className: "text-center text-gray-600 dark:text-gray-400 mb-4 italic", children: `"After 15 years of smoking, I finally quit using the NRT approach and the app's tracking tools. It's been 6 months smoke-free and I've never felt better!"` }
                      ),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-center font-medium", children: "Michael S." }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(
                        "p",
                        { className: "text-center text-sm text-gray-500", children: "Quit using NRT patches" }
                      )
                    ] }
                  ) }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Card,
                  { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
                    CardContent,
                    { className: "pt-6", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(
                        "div",
                        { className: "flex justify-center mb-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                          "div",
                          { className: "w-16 h-16 rounded-full bg-green-100 flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Heart, { className: "h-8 w-8 text-green-600" }) }
                        ) }
                      ),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(
                        "div",
                        { className: "flex justify-center mb-2", children: [1, 2, 3, 4, 5].map(
                          (star) => /* @__PURE__ */ jsxRuntimeExports.jsx(
                            Star,
                            {
                              className: "h-5 w-5 text-yellow-500 fill-yellow-500"
                            },
                            star
                          )
                        ) }
                      ),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(
                        "p",
                        { className: "text-center text-gray-600 dark:text-gray-400 mb-4 italic", children: `"The financial calculator was a real eye-opener. I've saved over $2,000 in 8 months and treated myself to a vacation with the money I didn't spend on cigarettes!"` }
                      ),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-center font-medium", children: "Jessica T." }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(
                        "p",
                        { className: "text-center text-sm text-gray-500", children: "Cold turkey approach" }
                      )
                    ] }
                  ) }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Card,
                  { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
                    CardContent,
                    { className: "pt-6", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(
                        "div",
                        { className: "flex justify-center mb-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                          "div",
                          { className: "w-16 h-16 rounded-full bg-green-100 flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Smile, { className: "h-8 w-8 text-green-600" }) }
                        ) }
                      ),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(
                        "div",
                        { className: "flex justify-center mb-2", children: [1, 2, 3, 4, 5].map(
                          (star) => /* @__PURE__ */ jsxRuntimeExports.jsx(
                            Star,
                            {
                              className: "h-5 w-5 text-yellow-500 fill-yellow-500"
                            },
                            star
                          )
                        ) }
                      ),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(
                        "p",
                        { className: "text-center text-gray-600 dark:text-gray-400 mb-4 italic", children: '"The community feature connected me with others going through the same struggles. Their support made all the difference when I was about to give up."' }
                      ),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-center font-medium", children: "David R." }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(
                        "p",
                        { className: "text-center text-sm text-gray-500", children: "Gradual reduction method" }
                      )
                    ] }
                  ) }
                )
              ] }
            )
          ] }
        ) }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "section",
        { className: "py-16 bg-green-700 text-white", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "div",
          { className: "container px-4 mx-auto text-center", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "h2",
              { className: "text-3xl font-bold mb-4", children: "Ready to Start Your Fresh Journey?" }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "p",
              { className: "max-w-xl mx-auto mb-8", children: "Join thousands of others who have successfully quit smoking with our comprehensive support system." }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Button,
              {
                size: "lg",
                onClick: () => navigate("/login"),
                className: "bg-white text-green-700 hover:bg-white/90",
                children: "Get Started Now"
              }
            )
          ] }
        ) }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "footer",
        { className: "py-12 bg-gray-900 text-white", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "div",
          { className: "container px-4 mx-auto", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "div",
              { className: "flex flex-col md:flex-row justify-between mb-8", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  "div",
                  { className: "mb-8 md:mb-0", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsxs(
                      "div",
                      { className: "flex items-center mb-4", children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx(Leaf, { className: "h-6 w-6 text-green-500 mr-2" }),
                        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-bold text-xl", children: "Mission Fresh" })
                      ] }
                    ),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      "p",
                      { className: "text-gray-400 max-w-xs", children: "Your comprehensive companion for quitting smoking and beginning a healthier, fresher lifestyle." }
                    )
                  ] }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  "div",
                  { className: "grid grid-cols-2 md:grid-cols-3 gap-8", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsxs(
                      "div",
                      { children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold mb-4", children: "Resources" }),
                        /* @__PURE__ */ jsxRuntimeExports.jsxs(
                          "ul",
                          { className: "space-y-2", children: [
                            /* @__PURE__ */ jsxRuntimeExports.jsx(
                              "li",
                              { children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                                Link,
                                {
                                  to: "/guides",
                                  className: "text-gray-400 hover:text-white",
                                  children: "Guides"
                                }
                              ) }
                            ),
                            /* @__PURE__ */ jsxRuntimeExports.jsx(
                              "li",
                              { children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                                Link,
                                {
                                  to: "/nrt-directory",
                                  className: "text-gray-400 hover:text-white",
                                  children: "NRT Directory"
                                }
                              ) }
                            ),
                            /* @__PURE__ */ jsxRuntimeExports.jsx(
                              "li",
                              { children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                                Link,
                                {
                                  to: "/tools",
                                  className: "text-gray-400 hover:text-white",
                                  children: "Tools"
                                }
                              ) }
                            ),
                            /* @__PURE__ */ jsxRuntimeExports.jsx(
                              "li",
                              { children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                                Link,
                                {
                                  to: "/community",
                                  className: "text-gray-400 hover:text-white",
                                  children: "Community"
                                }
                              ) }
                            )
                          ] }
                        )
                      ] }
                    ),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs(
                      "div",
                      { children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold mb-4", children: "Company" }),
                        /* @__PURE__ */ jsxRuntimeExports.jsxs(
                          "ul",
                          { className: "space-y-2", children: [
                            /* @__PURE__ */ jsxRuntimeExports.jsx(
                              "li",
                              { children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                                Link,
                                {
                                  to: "/about",
                                  className: "text-gray-400 hover:text-white",
                                  children: "About Us"
                                }
                              ) }
                            ),
                            /* @__PURE__ */ jsxRuntimeExports.jsx(
                              "li",
                              { children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                                Link,
                                {
                                  to: "/contact",
                                  className: "text-gray-400 hover:text-white",
                                  children: "Contact"
                                }
                              ) }
                            ),
                            /* @__PURE__ */ jsxRuntimeExports.jsx(
                              "li",
                              { children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                                Link,
                                { to: "/blog", className: "text-gray-400 hover:text-white", children: "Blog" }
                              ) }
                            ),
                            /* @__PURE__ */ jsxRuntimeExports.jsx(
                              "li",
                              { children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                                Link,
                                {
                                  to: "/careers",
                                  className: "text-gray-400 hover:text-white",
                                  children: "Careers"
                                }
                              ) }
                            )
                          ] }
                        )
                      ] }
                    ),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs(
                      "div",
                      { children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold mb-4", children: "Legal" }),
                        /* @__PURE__ */ jsxRuntimeExports.jsxs(
                          "ul",
                          { className: "space-y-2", children: [
                            /* @__PURE__ */ jsxRuntimeExports.jsx(
                              "li",
                              { children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                                Link,
                                {
                                  to: "/privacy",
                                  className: "text-gray-400 hover:text-white",
                                  children: "Privacy Policy"
                                }
                              ) }
                            ),
                            /* @__PURE__ */ jsxRuntimeExports.jsx(
                              "li",
                              { children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                                Link,
                                {
                                  to: "/terms",
                                  className: "text-gray-400 hover:text-white",
                                  children: "Terms of Service"
                                }
                              ) }
                            ),
                            /* @__PURE__ */ jsxRuntimeExports.jsx(
                              "li",
                              { children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                                Link,
                                {
                                  to: "/cookie-policy",
                                  className: "text-gray-400 hover:text-white",
                                  children: "Cookie Policy"
                                }
                              ) }
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
              "div",
              { className: "border-t border-gray-800 pt-8 mt-8 text-center md:text-left md:flex md:justify-between md:items-center", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  "p",
                  { className: "text-gray-400", children: [
                    "© ",
                    (/* @__PURE__ */ new Date()).getFullYear(),
                    " Mission Fresh. All rights reserved."
                  ] }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "div",
                  { className: "mt-4 md:mt-0", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
                    "div",
                    { className: "flex justify-center md:justify-end space-x-4", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsxs(
                        "a",
                        { href: "#", className: "text-gray-400 hover:text-white", children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "sr-only", children: "Twitter" }),
                          /* @__PURE__ */ jsxRuntimeExports.jsx(
                            "svg",
                            {
                              className: "h-6 w-6",
                              fill: "currentColor",
                              viewBox: "0 0 24 24",
                              children: /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" })
                            }
                          )
                        ] }
                      ),
                      /* @__PURE__ */ jsxRuntimeExports.jsxs(
                        "a",
                        { href: "#", className: "text-gray-400 hover:text-white", children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "sr-only", children: "Facebook" }),
                          /* @__PURE__ */ jsxRuntimeExports.jsx(
                            "svg",
                            {
                              className: "h-6 w-6",
                              fill: "currentColor",
                              viewBox: "0 0 24 24",
                              children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                                "path",
                                {
                                  fillRule: "evenodd",
                                  d: "M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z",
                                  clipRule: "evenodd"
                                }
                              )
                            }
                          )
                        ] }
                      ),
                      /* @__PURE__ */ jsxRuntimeExports.jsxs(
                        "a",
                        { href: "#", className: "text-gray-400 hover:text-white", children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "sr-only", children: "Instagram" }),
                          /* @__PURE__ */ jsxRuntimeExports.jsx(
                            "svg",
                            {
                              className: "h-6 w-6",
                              fill: "currentColor",
                              viewBox: "0 0 24 24",
                              children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                                "path",
                                {
                                  fillRule: "evenodd",
                                  d: "M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z",
                                  clipRule: "evenodd"
                                }
                              )
                            }
                          )
                        ] }
                      )
                    ] }
                  ) }
                )
              ] }
            )
          ] }
        ) }
      )
    ] }
  );
};

export { LandingPage };

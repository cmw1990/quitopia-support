import { i as importShared } from './react-vendor-773e5a75.js';
import { u as useAuth, a as ue } from './AuthProvider-b0b4665b.js';
import { B as Button, m as Badge, T as Tabs, a as TabsList, b as TabsTrigger, c as TabsContent, A as Avatar, k as AvatarImage, l as AvatarFallback, n as Separator, e as Select, f as SelectTrigger, g as SelectValue, h as SelectContent, i as SelectItem } from './toast-58ac552a.js';
import { T as Textarea, I as Input } from './textarea-ba0b28ab.js';
import { C as Card, d as CardContent, a as CardHeader, b as CardTitle, c as CardDescription, e as CardFooter } from './card-7a71f808.js';
import { s as supabaseRestCall } from './missionFreshApiClient-3e62d1ad.js';
import { j as jsxRuntimeExports } from './ui-vendor-336c871f.js';

const {useState: useState$1,useEffect} = await importShared('react');
const {Star: Star$1,ThumbsUp: ThumbsUp$1,ThumbsDown,Heart,Link:LinkIcon,ShoppingBag,ChevronLeft,Cigarette,ArrowLeft} = await importShared('lucide-react');

const {format} = await importShared('date-fns');

const {useNavigate} = await importShared('react-router-dom');
const ProductDetail = ({
  productId,
  onBack
}) => {
  const { session } = useAuth();
  const [product, setProduct] = useState$1(null);
  const [vendors, setVendors] = useState$1([]);
  const [reviews, setReviews] = useState$1([]);
  const [loading, setLoading] = useState$1(true);
  const [activeTab, setActiveTab] = useState$1("overview");
  const [userReview, setUserReview] = useState$1("");
  const [userRating, setUserRating] = useState$1(5);
  const [submitting, setSubmitting] = useState$1(false);
  useNavigate();
  useEffect(() => {
    if (productId) {
      fetchProductDetails();
    }
  }, [productId]);
  const fetchProductDetails = async () => {
    if (!session?.user?.id)
      return;
    setLoading(true);
    try {
      const productData = await supabaseRestCall(
        `/rest/v1/nrt_products8?id=eq.${productId}&select=*`,
        { method: "GET" },
        session
      );
      if (productData && productData.length > 0) {
        setProduct(productData[0]);
        const vendorData = await supabaseRestCall(
          `/rest/v1/product_vendors8?product_id=eq.${productId}&select=*`,
          { method: "GET" },
          session
        );
        setVendors(vendorData || []);
        const reviewData = await supabaseRestCall(
          `/rest/v1/product_reviews8?product_id=eq.${productId}&select=*&order=created_at.desc`,
          { method: "GET" },
          session
        );
        setReviews(reviewData || []);
      } else {
        ue.error("Product not found");
        onBack();
      }
    } catch (error) {
      console.error("Error fetching product details:", error);
      ue.error("Failed to load product details");
    } finally {
      setLoading(false);
    }
  };
  const handleSubmitReview = async () => {
    if (!session?.user?.id || !product)
      return;
    setSubmitting(true);
    try {
      const reviewData = {
        user_id: session.user.id,
        product_id: productId,
        rating: userRating,
        review_text: userReview,
        created_at: (/* @__PURE__ */ new Date()).toISOString()
      };
      const response = await supabaseRestCall(
        "/rest/v1/product_reviews8",
        {
          method: "POST",
          body: JSON.stringify(reviewData)
        },
        session
      );
      if (response) {
        ue.success("Review submitted successfully");
        setUserReview("");
        setUserRating(5);
        fetchProductDetails();
      }
    } catch (error) {
      console.error("Error submitting review:", error);
      ue.error("Failed to submit review");
    } finally {
      setSubmitting(false);
    }
  };
  const renderStars = (rating) => {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      "div",
      { className: "flex", children: [1, 2, 3, 4, 5].map(
        (value) => /* @__PURE__ */ jsxRuntimeExports.jsx(
          Star$1,
          {
            className: `h-4 w-4 ${value <= Math.round(rating) ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`
          },
          value
        )
      ) }
    );
  };
  const renderRatingStars = () => {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      "div",
      { className: "flex space-x-1", children: [1, 2, 3, 4, 5].map(
        (value) => /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            type: "button",
            onClick: () => setUserRating(value),
            className: "focus:outline-none",
            children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              Star$1,
              {
                className: `h-6 w-6 ${value <= userRating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`
              }
            )
          },
          value
        )
      ) }
    );
  };
  const getAvatarFallback = (name) => {
    if (!name)
      return "?";
    const nameParts = name.split(" ");
    if (nameParts.length >= 2) {
      return `${nameParts[0][0]}${nameParts[1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };
  if (loading) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      "div",
      { className: "flex items-center justify-center min-h-[400px]", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "div",
        { className: "flex flex-col items-center space-y-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-10 h-10 border-t-2 border-green-500 border-solid rounded-full animate-spin" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-green-600", children: "Loading product details..." })
        ] }
      ) }
    );
  }
  if (!product) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "div",
      { className: "text-center py-12 px-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "h2",
          { className: "text-2xl font-bold text-gray-800 dark:text-gray-200 mb-4", children: "Product Not Found" }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "p",
          { className: "text-gray-600 dark:text-gray-400 mb-8", children: "The product you're looking for doesn't exist or has been removed." }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Button,
          { onClick: onBack, className: "bg-green-600 hover:bg-green-700", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowLeft, { className: "h-4 w-4 mr-2" }),
            "Back to Directory"
          ] }
        )
      ] }
    );
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "div",
    { className: "space-y-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        Button,
        {
          variant: "ghost",
          onClick: onBack,
          className: "flex items-center text-green-600 hover:bg-green-50 hover:text-green-700 mb-4",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronLeft, { className: "h-4 w-4 mr-1" }),
            "Back to Directory"
          ]
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "div",
        { className: "grid md:grid-cols-3 gap-6", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "div",
            { className: "md:col-span-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Card,
                { className: "overflow-hidden border-green-100 dark:border-green-800", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  CardContent,
                  { className: "p-0", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      "div",
                      { className: "aspect-square bg-white flex items-center justify-center p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                        "img",
                        {
                          src: product.image_url || "https://via.placeholder.com/300?text=No+Image",
                          alt: product.name,
                          className: "max-h-full max-w-full object-contain"
                        }
                      ) }
                    ),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs(
                      "div",
                      { className: "p-4 bg-green-50 dark:bg-green-900/20", children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsxs(
                          "div",
                          { className: "flex justify-between items-center mb-2", children: [
                            /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { className: "bg-green-600", children: product.type }),
                            /* @__PURE__ */ jsxRuntimeExports.jsxs(
                              "div",
                              { className: "flex items-center", children: [
                                renderStars(product.avg_rating || product.rating),
                                /* @__PURE__ */ jsxRuntimeExports.jsxs(
                                  "span",
                                  { className: "text-sm ml-2 text-gray-600 dark:text-gray-400", children: [
                                    "(",
                                    product.review_count || product.reviews,
                                    ")"
                                  ] }
                                )
                              ] }
                            )
                          ] }
                        ),
                        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-xl font-bold", children: product.name }),
                        /* @__PURE__ */ jsxRuntimeExports.jsxs(
                          "p",
                          { className: "text-gray-600 dark:text-gray-400 text-sm", children: [
                            "By ",
                            product.brand
                          ] }
                        ),
                        /* @__PURE__ */ jsxRuntimeExports.jsx(
                          "p",
                          { className: "text-lg font-bold mt-2 text-green-700 dark:text-green-500", children: product.price_range }
                        ),
                        /* @__PURE__ */ jsxRuntimeExports.jsxs(
                          "div",
                          { className: "mt-4 pt-4 border-t border-green-100 dark:border-green-800", children: [
                            /* @__PURE__ */ jsxRuntimeExports.jsx(
                              "h3",
                              { className: "text-sm font-medium mb-2", children: "Strength Options:" }
                            ),
                            /* @__PURE__ */ jsxRuntimeExports.jsx(
                              "div",
                              { className: "flex flex-wrap gap-2", children: product.strength_options.map(
                                (strength, idx) => /* @__PURE__ */ jsxRuntimeExports.jsx(
                                  Badge,
                                  {
                                    variant: "outline",
                                    className: "bg-white dark:bg-gray-800",
                                    children: strength
                                  },
                                  idx
                                )
                              ) }
                            )
                          ] }
                        ),
                        /* @__PURE__ */ jsxRuntimeExports.jsx(
                          "div",
                          { className: "mt-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                            Badge,
                            {
                              variant: product.available ? "default" : "secondary",
                              className: `w-full justify-center py-1 ${product.available ? "bg-green-600" : "bg-gray-400"}`,
                              children: product.available ? "In Stock" : "Out of Stock"
                            }
                          ) }
                        )
                      ] }
                    )
                  ] }
                ) }
              ),
              vendors.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(
                Card,
                { className: "mt-4 border-green-100 dark:border-green-800", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    CardHeader,
                    { className: "pb-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-lg", children: "Where to Buy" }) }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    CardContent,
                    { children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                      "div",
                      { className: "space-y-4", children: vendors.map(
                        (vendor) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
                          "div",
                          {
                            className: "flex items-start p-2 border rounded-md border-green-100 dark:border-green-800",
                            children: [
                              /* @__PURE__ */ jsxRuntimeExports.jsx(
                                "div",
                                { className: "w-10 h-10 flex-shrink-0 bg-white rounded-md overflow-hidden", children: vendor.vendor_logo_url ? /* @__PURE__ */ jsxRuntimeExports.jsx(
                                  "img",
                                  {
                                    src: vendor.vendor_logo_url,
                                    alt: vendor.vendor_name,
                                    className: "w-full h-full object-contain"
                                  }
                                ) : /* @__PURE__ */ jsxRuntimeExports.jsx(
                                  "div",
                                  { className: "w-full h-full flex items-center justify-center bg-green-100 text-green-600", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ShoppingBag, { className: "h-5 w-5" }) }
                                ) }
                              ),
                              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                                "div",
                                { className: "ml-3 flex-1", children: [
                                  /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "font-medium", children: vendor.vendor_name }),
                                  /* @__PURE__ */ jsxRuntimeExports.jsxs(
                                    "div",
                                    { className: "flex items-center text-sm text-gray-600 dark:text-gray-400", children: [
                                      /* @__PURE__ */ jsxRuntimeExports.jsxs(
                                        "span",
                                        { className: "font-medium text-green-600 dark:text-green-500", children: [
                                          "$",
                                          vendor.price ? vendor.price.toFixed(2) : "Varies"
                                        ] }
                                      ),
                                      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "mx-2", children: "•" }),
                                      /* @__PURE__ */ jsxRuntimeExports.jsx(
                                        "span",
                                        { children: vendor.in_stock ? "In stock" : "Check availability" }
                                      )
                                    ] }
                                  ),
                                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                                    "div",
                                    { className: "mt-2", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
                                      "a",
                                      {
                                        href: vendor.product_url || vendor.website_url,
                                        target: "_blank",
                                        rel: "noopener noreferrer",
                                        className: "inline-flex items-center text-sm font-medium text-green-600 hover:text-green-800",
                                        children: [
                                          /* @__PURE__ */ jsxRuntimeExports.jsx(LinkIcon, { className: "h-3 w-3 mr-1" }),
                                          "View Offer"
                                        ]
                                      }
                                    ) }
                                  )
                                ] }
                              )
                            ]
                          },
                          vendor.id
                        )
                      ) }
                    ) }
                  )
                ] }
              )
            ] }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "div",
            { className: "md:col-span-2", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
              Tabs,
              {
                value: activeTab,
                onValueChange: setActiveTab,
                className: "w-full",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(
                    TabsList,
                    { className: "grid grid-cols-3 mb-4 bg-green-100 dark:bg-green-900/30", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(
                        TabsTrigger,
                        {
                          value: "overview",
                          className: "data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800",
                          children: "Overview"
                        }
                      ),
                      /* @__PURE__ */ jsxRuntimeExports.jsxs(
                        TabsTrigger,
                        {
                          value: "reviews",
                          className: "data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800",
                          children: [
                            "Reviews (",
                            reviews.length,
                            ")"
                          ]
                        }
                      ),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(
                        TabsTrigger,
                        {
                          value: "compare",
                          className: "data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800",
                          children: "Suitability"
                        }
                      )
                    ] }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(
                    TabsContent,
                    { value: "overview", className: "space-y-4", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsxs(
                        Card,
                        { children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsx(
                            CardHeader,
                            { children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { children: "Product Description" }) }
                          ),
                          /* @__PURE__ */ jsxRuntimeExports.jsxs(
                            CardContent,
                            { children: [
                              /* @__PURE__ */ jsxRuntimeExports.jsx(
                                "p",
                                { className: "text-gray-700 dark:text-gray-300", children: product.description }
                              ),
                              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                                "div",
                                { className: "mt-6 grid md:grid-cols-3 gap-4", children: [
                                  /* @__PURE__ */ jsxRuntimeExports.jsxs(
                                    "div",
                                    { children: [
                                      /* @__PURE__ */ jsxRuntimeExports.jsxs(
                                        "h3",
                                        { className: "font-medium mb-2 text-green-700 dark:text-green-500 flex items-center", children: [
                                          /* @__PURE__ */ jsxRuntimeExports.jsx(ThumbsUp$1, { className: "h-4 w-4 mr-2" }),
                                          "Pros"
                                        ] }
                                      ),
                                      /* @__PURE__ */ jsxRuntimeExports.jsx(
                                        "ul",
                                        { className: "text-sm space-y-1 list-disc list-inside text-gray-600 dark:text-gray-400", children: product.pros.map(
                                          (pro, idx) => /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: pro }, idx)
                                        ) }
                                      )
                                    ] }
                                  ),
                                  /* @__PURE__ */ jsxRuntimeExports.jsxs(
                                    "div",
                                    { children: [
                                      /* @__PURE__ */ jsxRuntimeExports.jsxs(
                                        "h3",
                                        { className: "font-medium mb-2 text-red-600 dark:text-red-500 flex items-center", children: [
                                          /* @__PURE__ */ jsxRuntimeExports.jsx(ThumbsDown, { className: "h-4 w-4 mr-2" }),
                                          "Cons"
                                        ] }
                                      ),
                                      /* @__PURE__ */ jsxRuntimeExports.jsx(
                                        "ul",
                                        { className: "text-sm space-y-1 list-disc list-inside text-gray-600 dark:text-gray-400", children: product.cons.map(
                                          (con, idx) => /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: con }, idx)
                                        ) }
                                      )
                                    ] }
                                  ),
                                  /* @__PURE__ */ jsxRuntimeExports.jsxs(
                                    "div",
                                    { children: [
                                      /* @__PURE__ */ jsxRuntimeExports.jsxs(
                                        "h3",
                                        { className: "font-medium mb-2 text-blue-600 dark:text-blue-500 flex items-center", children: [
                                          /* @__PURE__ */ jsxRuntimeExports.jsx(Heart, { className: "h-4 w-4 mr-2" }),
                                          "Best For"
                                        ] }
                                      ),
                                      /* @__PURE__ */ jsxRuntimeExports.jsx(
                                        "ul",
                                        { className: "text-sm space-y-1 list-disc list-inside text-gray-600 dark:text-gray-400", children: product.best_for.map(
                                          (best, idx) => /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: best }, idx)
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
                        Card,
                        { children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsx(
                            CardHeader,
                            { children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { children: "How to Use" }) }
                          ),
                          /* @__PURE__ */ jsxRuntimeExports.jsxs(
                            CardContent,
                            { className: "space-y-4", children: [
                              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                                "div",
                                { className: "flex items-start gap-3", children: [
                                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                                    "div",
                                    { className: "w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/50 flex items-center justify-center text-green-600 flex-shrink-0", children: "1" }
                                  ),
                                  /* @__PURE__ */ jsxRuntimeExports.jsxs(
                                    "div",
                                    { children: [
                                      /* @__PURE__ */ jsxRuntimeExports.jsx(
                                        "h3",
                                        { className: "font-medium", children: "Follow the product instructions" }
                                      ),
                                      /* @__PURE__ */ jsxRuntimeExports.jsx(
                                        "p",
                                        { className: "text-sm text-gray-600 dark:text-gray-400", children: "Each product has specific instructions for optimal use. Always read the product leaflet before first use." }
                                      )
                                    ] }
                                  )
                                ] }
                              ),
                              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                                "div",
                                { className: "flex items-start gap-3", children: [
                                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                                    "div",
                                    { className: "w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/50 flex items-center justify-center text-green-600 flex-shrink-0", children: "2" }
                                  ),
                                  /* @__PURE__ */ jsxRuntimeExports.jsxs(
                                    "div",
                                    { children: [
                                      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-medium", children: "Use consistently" }),
                                      /* @__PURE__ */ jsxRuntimeExports.jsx(
                                        "p",
                                        { className: "text-sm text-gray-600 dark:text-gray-400", children: "For best results, use regularly as directed rather than only when experiencing cravings." }
                                      )
                                    ] }
                                  )
                                ] }
                              ),
                              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                                "div",
                                { className: "flex items-start gap-3", children: [
                                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                                    "div",
                                    { className: "w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/50 flex items-center justify-center text-green-600 flex-shrink-0", children: "3" }
                                  ),
                                  /* @__PURE__ */ jsxRuntimeExports.jsxs(
                                    "div",
                                    { children: [
                                      /* @__PURE__ */ jsxRuntimeExports.jsx(
                                        "h3",
                                        { className: "font-medium", children: "Complete the treatment course" }
                                      ),
                                      /* @__PURE__ */ jsxRuntimeExports.jsx(
                                        "p",
                                        { className: "text-sm text-gray-600 dark:text-gray-400", children: "Follow the recommended treatment duration, usually 8-12 weeks, gradually reducing usage as directed." }
                                      )
                                    ] }
                                  )
                                ] }
                              ),
                              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                                "div",
                                { className: "flex items-start gap-3", children: [
                                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                                    "div",
                                    { className: "w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/50 flex items-center justify-center text-green-600 flex-shrink-0", children: "4" }
                                  ),
                                  /* @__PURE__ */ jsxRuntimeExports.jsxs(
                                    "div",
                                    { children: [
                                      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-medium", children: "Monitor and adjust" }),
                                      /* @__PURE__ */ jsxRuntimeExports.jsx(
                                        "p",
                                        { className: "text-sm text-gray-600 dark:text-gray-400", children: "Track your usage in the Mission Fresh app and adjust based on your progress and cravings." }
                                      )
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
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    TabsContent,
                    { value: "reviews", className: "space-y-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
                      Card,
                      { children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsxs(
                          CardHeader,
                          { children: [
                            /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { children: "User Reviews" }),
                            /* @__PURE__ */ jsxRuntimeExports.jsx(
                              CardDescription,
                              { children: "See what others are saying about this product" }
                            )
                          ] }
                        ),
                        /* @__PURE__ */ jsxRuntimeExports.jsxs(
                          CardContent,
                          { className: "space-y-6", children: [
                            !submitting && session?.user && /* @__PURE__ */ jsxRuntimeExports.jsxs(
                              "div",
                              { className: "border rounded-lg p-4 mb-6 border-green-100 dark:border-green-800", children: [
                                /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-medium mb-2", children: "Write a Review" }),
                                /* @__PURE__ */ jsxRuntimeExports.jsxs(
                                  "div",
                                  { className: "mb-4", children: [
                                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                                      "label",
                                      { className: "block text-sm font-medium mb-1", children: "Rating" }
                                    ),
                                    renderRatingStars()
                                  ] }
                                ),
                                /* @__PURE__ */ jsxRuntimeExports.jsxs(
                                  "div",
                                  { className: "mb-4", children: [
                                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                                      "label",
                                      { className: "block text-sm font-medium mb-1", children: "Your Review" }
                                    ),
                                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                                      Textarea,
                                      {
                                        placeholder: "Share your experience with this product...",
                                        value: userReview,
                                        onChange: (e) => setUserReview(e.target.value),
                                        className: "w-full",
                                        rows: 3
                                      }
                                    )
                                  ] }
                                ),
                                /* @__PURE__ */ jsxRuntimeExports.jsx(
                                  "div",
                                  { className: "flex justify-end", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                                    Button,
                                    {
                                      onClick: handleSubmitReview,
                                      className: "bg-green-600 hover:bg-green-700",
                                      children: "Submit Review"
                                    }
                                  ) }
                                )
                              ] }
                            ),
                            reviews.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(
                              "div",
                              { className: "text-center py-8", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                                "p",
                                { className: "text-gray-500 dark:text-gray-400", children: "No reviews yet. Be the first to review this product!" }
                              ) }
                            ) : /* @__PURE__ */ jsxRuntimeExports.jsx(
                              "div",
                              { className: "space-y-6", children: reviews.map(
                                (review) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
                                  "div",
                                  { className: "space-y-3", children: [
                                    /* @__PURE__ */ jsxRuntimeExports.jsxs(
                                      "div",
                                      { className: "flex items-center", children: [
                                        /* @__PURE__ */ jsxRuntimeExports.jsxs(
                                          Avatar,
                                          { className: "h-10 w-10", children: [
                                            /* @__PURE__ */ jsxRuntimeExports.jsx(
                                              AvatarImage,
                                              {
                                                src: review.user_avatar,
                                                alt: review.user_name
                                              }
                                            ),
                                            /* @__PURE__ */ jsxRuntimeExports.jsx(
                                              AvatarFallback,
                                              { children: getAvatarFallback(review.user_name) }
                                            )
                                          ] }
                                        ),
                                        /* @__PURE__ */ jsxRuntimeExports.jsxs(
                                          "div",
                                          { className: "ml-3", children: [
                                            /* @__PURE__ */ jsxRuntimeExports.jsx(
                                              "div",
                                              { className: "font-medium", children: review.user_name }
                                            ),
                                            /* @__PURE__ */ jsxRuntimeExports.jsxs(
                                              "div",
                                              { className: "flex items-center", children: [
                                                renderStars(review.rating),
                                                /* @__PURE__ */ jsxRuntimeExports.jsx(
                                                  "span",
                                                  { className: "text-xs text-gray-500 ml-2", children: format(
                                                    new Date(review.created_at),
                                                    "MMM d, yyyy"
                                                  ) }
                                                )
                                              ] }
                                            )
                                          ] }
                                        )
                                      ] }
                                    ),
                                    review.review_text && /* @__PURE__ */ jsxRuntimeExports.jsx(
                                      "p",
                                      { className: "text-gray-700 dark:text-gray-300 text-sm", children: review.review_text }
                                    ),
                                    (review.pros.length > 0 || review.cons.length > 0) && /* @__PURE__ */ jsxRuntimeExports.jsxs(
                                      "div",
                                      { className: "grid grid-cols-2 gap-4 pt-2", children: [
                                        review.pros.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(
                                          "div",
                                          { children: [
                                            /* @__PURE__ */ jsxRuntimeExports.jsxs(
                                              "h4",
                                              { className: "text-xs font-medium text-green-600 flex items-center", children: [
                                                /* @__PURE__ */ jsxRuntimeExports.jsx(ThumbsUp$1, { className: "h-3 w-3 mr-1" }),
                                                "Pros"
                                              ] }
                                            ),
                                            /* @__PURE__ */ jsxRuntimeExports.jsx(
                                              "ul",
                                              { className: "text-xs list-disc list-inside text-gray-600 dark:text-gray-400 mt-1", children: review.pros.map(
                                                (pro, idx) => /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: pro }, idx)
                                              ) }
                                            )
                                          ] }
                                        ),
                                        review.cons.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(
                                          "div",
                                          { children: [
                                            /* @__PURE__ */ jsxRuntimeExports.jsxs(
                                              "h4",
                                              { className: "text-xs font-medium text-red-600 flex items-center", children: [
                                                /* @__PURE__ */ jsxRuntimeExports.jsx(ThumbsDown, { className: "h-3 w-3 mr-1" }),
                                                "Cons"
                                              ] }
                                            ),
                                            /* @__PURE__ */ jsxRuntimeExports.jsx(
                                              "ul",
                                              { className: "text-xs list-disc list-inside text-gray-600 dark:text-gray-400 mt-1", children: review.cons.map(
                                                (con, idx) => /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: con }, idx)
                                              ) }
                                            )
                                          ] }
                                        )
                                      ] }
                                    ),
                                    /* @__PURE__ */ jsxRuntimeExports.jsx(Separator, { className: "my-4" })
                                  ] },
                                  review.id
                                )
                              ) }
                            )
                          ] }
                        )
                      ] }
                    ) }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    TabsContent,
                    { value: "compare", className: "space-y-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
                      Card,
                      { children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsxs(
                          CardHeader,
                          { children: [
                            /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { children: "Is This Right For You?" }),
                            /* @__PURE__ */ jsxRuntimeExports.jsx(
                              CardDescription,
                              { children: "Find out if this product matches your needs" }
                            )
                          ] }
                        ),
                        /* @__PURE__ */ jsxRuntimeExports.jsx(
                          CardContent,
                          { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
                            "div",
                            { className: "space-y-6", children: [
                              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                                "div",
                                { className: "p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-900", children: [
                                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                                    "h3",
                                    { className: "font-medium text-lg mb-2 text-green-700 dark:text-green-500", children: "Ideal User Profile" }
                                  ),
                                  /* @__PURE__ */ jsxRuntimeExports.jsxs(
                                    "div",
                                    { className: "space-y-3", children: [
                                      /* @__PURE__ */ jsxRuntimeExports.jsxs(
                                        "div",
                                        { className: "flex items-start gap-3", children: [
                                          /* @__PURE__ */ jsxRuntimeExports.jsx(Cigarette, { className: "h-5 w-5 text-green-600 mt-1 flex-shrink-0" }),
                                          /* @__PURE__ */ jsxRuntimeExports.jsxs(
                                            "div",
                                            { children: [
                                              /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "font-medium", children: "Smoking Habits" }),
                                              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                                                "p",
                                                { className: "text-sm text-gray-600 dark:text-gray-400", children: [
                                                  product.type === "patch" && "Best for regular, consistent smokers who need all-day relief.",
                                                  product.type === "gum" && "Great for situational smokers who need on-demand relief.",
                                                  product.type === "lozenge" && "Ideal for those who prefer discrete options throughout the day.",
                                                  product.type === "inhaler" && "Perfect for those who miss the hand-to-mouth action of smoking.",
                                                  product.type === "spray" && "Best for those who need rapid craving relief."
                                                ] }
                                              )
                                            ] }
                                          )
                                        ] }
                                      ),
                                      /* @__PURE__ */ jsxRuntimeExports.jsxs(
                                        "div",
                                        { className: "flex items-start gap-3", children: [
                                          /* @__PURE__ */ jsxRuntimeExports.jsx(ThumbsUp$1, { className: "h-5 w-5 text-green-600 mt-1 flex-shrink-0" }),
                                          /* @__PURE__ */ jsxRuntimeExports.jsxs(
                                            "div",
                                            { children: [
                                              /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "font-medium", children: "Lifestyle Fit" }),
                                              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                                                "p",
                                                { className: "text-sm text-gray-600 dark:text-gray-400", children: [
                                                  product.type === "patch" && "Apply once daily – ideal for busy people who prefer simplicity.",
                                                  product.type === "gum" && "Requires active chewing – good for those who want control over timing and dosage.",
                                                  product.type === "lozenge" && "Takes 20-30 minutes to dissolve – good for those who can commit to this time.",
                                                  product.type === "inhaler" && "Requires frequent use – best for those who can incorporate it into their routine.",
                                                  product.type === "spray" && "Quick to use – perfect for busy lifestyles and discreet usage."
                                                ] }
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
                                              /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "font-medium", children: "Dependency Level" }),
                                              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                                                "p",
                                                { className: "text-sm text-gray-600 dark:text-gray-400", children: [
                                                  product.strength_options.some(
                                                    (s) => s.includes("21mg") || s.includes("high")
                                                  ) && "Higher strengths available for those with strong nicotine dependence.",
                                                  product.strength_options.some(
                                                    (s) => s.includes("14mg") || s.includes("medium")
                                                  ) && "Medium strengths for moderate smokers.",
                                                  product.strength_options.some(
                                                    (s) => s.includes("7mg") || s.includes("low")
                                                  ) && "Lower strengths for light smokers or when tapering down."
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
                                "div",
                                { className: "grid md:grid-cols-2 gap-4", children: [
                                  /* @__PURE__ */ jsxRuntimeExports.jsxs(
                                    "div",
                                    { className: "p-4 rounded-lg bg-white dark:bg-gray-800 border border-green-100 dark:border-green-900", children: [
                                      /* @__PURE__ */ jsxRuntimeExports.jsx(
                                        "h3",
                                        { className: "font-medium mb-3 text-green-700 dark:text-green-500", children: "Advantages for Quitters" }
                                      ),
                                      /* @__PURE__ */ jsxRuntimeExports.jsx(
                                        "ul",
                                        { className: "space-y-2", children: product.pros.map(
                                          (pro, idx) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
                                            "li",
                                            { className: "flex items-start gap-2", children: [
                                              /* @__PURE__ */ jsxRuntimeExports.jsx(ThumbsUp$1, { className: "h-4 w-4 text-green-600 mt-1 flex-shrink-0" }),
                                              /* @__PURE__ */ jsxRuntimeExports.jsx(
                                                "span",
                                                { className: "text-sm text-gray-700 dark:text-gray-300", children: pro }
                                              )
                                            ] },
                                            idx
                                          )
                                        ) }
                                      )
                                    ] }
                                  ),
                                  /* @__PURE__ */ jsxRuntimeExports.jsxs(
                                    "div",
                                    { className: "p-4 rounded-lg bg-white dark:bg-gray-800 border border-red-100 dark:border-red-900/50", children: [
                                      /* @__PURE__ */ jsxRuntimeExports.jsx(
                                        "h3",
                                        { className: "font-medium mb-3 text-red-600 dark:text-red-500", children: "Considerations" }
                                      ),
                                      /* @__PURE__ */ jsxRuntimeExports.jsx(
                                        "ul",
                                        { className: "space-y-2", children: product.cons.map(
                                          (con, idx) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
                                            "li",
                                            { className: "flex items-start gap-2", children: [
                                              /* @__PURE__ */ jsxRuntimeExports.jsx(ThumbsDown, { className: "h-4 w-4 text-red-600 mt-1 flex-shrink-0" }),
                                              /* @__PURE__ */ jsxRuntimeExports.jsx(
                                                "span",
                                                { className: "text-sm text-gray-700 dark:text-gray-300", children: con }
                                              )
                                            ] },
                                            idx
                                          )
                                        ) }
                                      )
                                    ] }
                                  )
                                ] }
                              ),
                              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                                "div",
                                { className: "mt-6 p-4 rounded-lg bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/50", children: [
                                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                                    "h3",
                                    { className: "font-medium text-blue-700 dark:text-blue-500 mb-2", children: "Healthcare Professional Advice" }
                                  ),
                                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                                    "p",
                                    { className: "text-sm text-gray-700 dark:text-gray-300", children: "Always consult with a healthcare provider before starting NRT, especially if you have any health conditions or are taking medications. They can help you determine the right product and dosage for your specific needs." }
                                  ),
                                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                                    Button,
                                    { className: "mt-4 bg-blue-600 hover:bg-blue-700", children: "Find Healthcare Resources" }
                                  )
                                ] }
                              )
                            ] }
                          ) }
                        )
                      ] }
                    ) }
                  )
                ]
              }
            ) }
          )
        ] }
      )
    ] }
  );
};

const {useState} = await importShared('react');
const {Search,Star,Filter,ArrowUpDown,Leaf,ThumbsUp,Droplets,LogIn} = await importShared('lucide-react');

const {Link} = await importShared('react-router-dom');
const NRTDirectory = ({
  isPublic = false
}) => {
  useAuth();
  const [filterType, setFilterType] = useState("all");
  const [sortBy, setSortBy] = useState("rating");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const nrtProducts = [
    {
      id: 1,
      name: "NicoDerm CQ Patch",
      type: "patch",
      strengthOptions: ["21mg", "14mg", "7mg"],
      brand: "NicoDerm",
      rating: 4.5,
      reviews: 1253,
      price: "$42.99",
      description: "Clear patches that deliver a steady flow of nicotine throughout the day to help reduce cravings and withdrawal symptoms.",
      pros: [
        "24-hour relief",
        "Once-a-day application",
        "Nearly invisible under clothing"
      ],
      cons: [
        "Skin irritation for some users",
        "Cannot adjust dosage during the day"
      ],
      bestFor: [
        "Heavy smokers starting to quit",
        "People who want all-day coverage"
      ],
      image: "https://via.placeholder.com/150",
      available: true
    },
    {
      id: 2,
      name: "Nicorette Gum",
      type: "gum",
      strengthOptions: ["4mg", "2mg"],
      brand: "Nicorette",
      rating: 4.3,
      reviews: 982,
      price: "$38.99",
      description: "Chewing gum that releases nicotine to help reduce cravings and withdrawal symptoms when you feel the urge to smoke.",
      pros: [
        "Rapid relief of cravings",
        "Can control when to use it",
        "Various flavors available"
      ],
      cons: [
        "Proper chewing technique required",
        "May cause jaw soreness",
        "Short duration of effect"
      ],
      bestFor: ["Situational smokers", "People who need quick relief"],
      image: "https://via.placeholder.com/150",
      available: true
    },
    {
      id: 3,
      name: "Nicorette Lozenge",
      type: "lozenge",
      strengthOptions: ["4mg", "2mg", "1mg"],
      brand: "Nicorette",
      rating: 4.4,
      reviews: 765,
      price: "$39.99",
      description: "Nicotine lozenges dissolve in your mouth and release nicotine to reduce cravings and withdrawal symptoms.",
      pros: ["Discreet to use", "No chewing required", "Long-lasting relief"],
      cons: [
        "May cause hiccups or heartburn",
        "Cannot eat or drink 15 minutes before use"
      ],
      bestFor: ["Office workers", "People who dislike gum"],
      image: "https://via.placeholder.com/150",
      available: true
    },
    {
      id: 4,
      name: "Nicotrol Inhaler",
      type: "inhaler",
      strengthOptions: ["10mg cartridge"],
      brand: "Nicotrol",
      rating: 4,
      reviews: 432,
      price: "$55.99",
      description: "Plastic mouthpiece with nicotine cartridges that mimic the hand-to-mouth action of smoking.",
      pros: [
        "Mimics hand-to-mouth smoking ritual",
        "Adjustable usage frequency",
        "Can be used with patches"
      ],
      cons: [
        "Requires prescription",
        "More expensive than other options",
        "Visible when using"
      ],
      bestFor: [
        "People who miss the physical habit of smoking",
        "Those who need the oral fixation"
      ],
      image: "https://via.placeholder.com/150",
      available: true
    },
    {
      id: 5,
      name: "Nicotrol NS Nasal Spray",
      type: "spray",
      strengthOptions: ["0.5mg/spray"],
      brand: "Nicotrol",
      rating: 3.8,
      reviews: 321,
      price: "$67.99",
      description: "Nasal spray that delivers nicotine quickly through the nasal lining for fast relief from cravings.",
      pros: [
        "Fastest acting NRT option",
        "Highly effective for intense cravings",
        "Easily adjusted dosage"
      ],
      cons: [
        "Nasal irritation common",
        "Requires prescription",
        "Most expensive option"
      ],
      bestFor: [
        "Heavy smokers with intense cravings",
        "People who need immediate relief"
      ],
      image: "https://via.placeholder.com/150",
      available: true
    }
  ];
  const filteredProducts = nrtProducts.filter((product) => {
    if (filterType !== "all" && product.type !== filterType) {
      return false;
    }
    if (searchQuery && !product.name.toLowerCase().includes(searchQuery.toLowerCase()) && !product.brand.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    return true;
  }).sort((a, b) => {
    if (sortBy === "rating") {
      return b.rating - a.rating;
    } else if (sortBy === "reviews") {
      return b.reviews - a.reviews;
    } else {
      return a.name.localeCompare(b.name);
    }
  });
  const handleViewProduct = (productId) => {
    setSelectedProduct(productId.toString());
  };
  const handleBackToDirectory = () => {
    setSelectedProduct(null);
  };
  if (selectedProduct) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      ProductDetail,
      {
        productId: selectedProduct,
        onBack: handleBackToDirectory,
        isPublic
      }
    );
  }
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
      case "patch":
        return /* @__PURE__ */ jsxRuntimeExports.jsx(Droplets, { className: "h-5 w-5 text-blue-500" });
      case "gum":
        return /* @__PURE__ */ jsxRuntimeExports.jsx(Leaf, { className: "h-5 w-5 text-green-500" });
      case "lozenge":
        return /* @__PURE__ */ jsxRuntimeExports.jsx(ThumbsUp, { className: "h-5 w-5 text-purple-500" });
      case "inhaler":
        return /* @__PURE__ */ jsxRuntimeExports.jsx(Leaf, { className: "h-5 w-5 text-indigo-500" });
      case "spray":
        return /* @__PURE__ */ jsxRuntimeExports.jsx(Droplets, { className: "h-5 w-5 text-cyan-500" });
      default:
        return null;
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "div",
    {
      className: `container mx-auto px-4 py-8 ${isPublic ? "bg-white dark:bg-gray-900" : ""}`,
      children: [
        isPublic && /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "div",
          { className: "flex justify-between items-center mb-6", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              Link,
              {
                to: "/",
                className: "text-xl font-semibold flex items-center gap-2",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Leaf, { className: "h-6 w-6 text-green-600" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-green-600", children: "Mission Fresh" })
                ]
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              Link,
              {
                to: "/auth",
                className: "flex items-center gap-1 text-green-600 hover:text-green-700",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(LogIn, { className: "h-4 w-4" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Sign In" })
                ]
              }
            )
          ] }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "div",
          { className: "mb-8", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "h1",
              { className: "text-3xl font-bold text-green-700 dark:text-green-400 mb-3", children: "NRT Directory" }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "p",
              { className: "text-lg text-gray-600 dark:text-gray-400 mb-6", children: "Explore nicotine replacement therapy products to help you stay fresh during your quit journey. Find the right product to support your transition to a smoke-free life." }
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
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Filter, { className: "h-4 w-4 text-gray-400" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs(
                      Select,
                      { value: filterType, onValueChange: setFilterType, children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx(
                          SelectTrigger,
                          { className: "flex-1 border-green-200 dark:border-green-700", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Filter by type" }) }
                        ),
                        /* @__PURE__ */ jsxRuntimeExports.jsxs(
                          SelectContent,
                          { children: [
                            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "all", children: "All Types" }),
                            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "patch", children: "Patches" }),
                            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "gum", children: "Gums" }),
                            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "lozenge", children: "Lozenges" }),
                            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "inhaler", children: "Inhalers" }),
                            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "spray", children: "Sprays" })
                          ] }
                        )
                      ] }
                    )
                  ] }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  "div",
                  { className: "flex items-center gap-2", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowUpDown, { className: "h-4 w-4 text-gray-400" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs(
                      Select,
                      { value: sortBy, onValueChange: setSortBy, children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx(
                          SelectTrigger,
                          { className: "flex-1 border-green-200 dark:border-green-700", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Sort by" }) }
                        ),
                        /* @__PURE__ */ jsxRuntimeExports.jsxs(
                          SelectContent,
                          { children: [
                            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "rating", children: "Highest Rated" }),
                            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "reviews", children: "Most Reviewed" }),
                            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "name", children: "A-Z" })
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
              { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6", children: filteredProducts.map(
                (product) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  Card,
                  {
                    className: "overflow-hidden border-green-100 dark:border-green-800 hover:shadow-md transition-shadow",
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-2 bg-gradient-to-r from-green-400 to-green-600" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsxs(
                        CardHeader,
                        { children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsxs(
                            "div",
                            { className: "flex justify-between items-start", children: [
                              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                                "div",
                                { className: "flex items-center gap-2", children: [
                                  renderTypeIcon(product.type),
                                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                                    Badge,
                                    { variant: "outline", className: "capitalize", children: product.type }
                                  )
                                ] }
                              ),
                              /* @__PURE__ */ jsxRuntimeExports.jsx(
                                "span",
                                { className: "font-semibold text-green-700 dark:text-green-400", children: product.price }
                              )
                            ] }
                          ),
                          /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-xl", children: product.name }),
                          /* @__PURE__ */ jsxRuntimeExports.jsxs(CardDescription, { children: ["By ", product.brand] })
                        ] }
                      ),
                      /* @__PURE__ */ jsxRuntimeExports.jsxs(
                        CardContent,
                        { children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsx(
                            "p",
                            { className: "mb-3 text-sm line-clamp-3", children: product.description }
                          ),
                          /* @__PURE__ */ jsxRuntimeExports.jsx(
                            "div",
                            { className: "flex flex-wrap gap-2 mb-3", children: product.strengthOptions.map(
                              (strength) => /* @__PURE__ */ jsxRuntimeExports.jsx(
                                Badge,
                                {
                                  variant: "secondary",
                                  className: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100",
                                  children: strength
                                },
                                strength
                              )
                            ) }
                          ),
                          /* @__PURE__ */ jsxRuntimeExports.jsxs(
                            "div",
                            { className: "flex justify-between items-center", children: [
                              renderStars(product.rating),
                              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                                "span",
                                { className: "text-sm text-gray-500", children: [
                                  product.reviews,
                                  " reviews"
                                ] }
                              )
                            ] }
                          )
                        ] }
                      ),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(
                        CardFooter,
                        { children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                          Button,
                          {
                            onClick: () => handleViewProduct(product.id),
                            className: "w-full bg-green-600 hover:bg-green-700",
                            children: "View Details"
                          }
                        ) }
                      )
                    ]
                  },
                  product.id
                )
              ) }
            )
          ] }
        ),
        isPublic && /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "div",
          { className: "mt-10 p-6 bg-green-50 dark:bg-green-900/30 rounded-lg text-center", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "h2",
              { className: "text-2xl font-bold text-green-700 dark:text-green-400 mb-3", children: "Ready to Start Your Quit Journey?" }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "p",
              { className: "text-gray-600 dark:text-gray-400 mb-6 max-w-2xl mx-auto", children: "Join Mission Fresh to track your progress, access personalized tools, and get support from our community." }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "div",
              { className: "flex flex-col sm:flex-row justify-center gap-4", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Link,
                  { to: "/auth", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                    Button,
                    { className: "bg-green-600 hover:bg-green-700", children: "Sign Up Now" }
                  ) }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Link,
                  { to: "/", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                    Button,
                    {
                      variant: "outline",
                      className: "border-green-600 text-green-600",
                      children: "Learn More"
                    }
                  ) }
                )
              ] }
            )
          ] }
        )
      ]
    }
  );
};

export { NRTDirectory };

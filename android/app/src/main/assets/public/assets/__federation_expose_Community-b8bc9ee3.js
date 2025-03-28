import { i as importShared } from './react-vendor-773e5a75.js';
import { A as Avatar, k as AvatarImage, l as AvatarFallback, B as Button } from './toast-58ac552a.js';
import './textarea-ba0b28ab.js';
import { C as Card, a as CardHeader, b as CardTitle, d as CardContent } from './card-7a71f808.js';
import { u as useAuth, a as ue } from './AuthProvider-b0b4665b.js';
import { s as supabaseRestCall } from './missionFreshApiClient-3e62d1ad.js';
import { j as jsxRuntimeExports } from './ui-vendor-336c871f.js';

const React = await importShared('react');
const Community = () => {
  const { session } = useAuth();
  const [posts, setPosts] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  React.useEffect(() => {
    if (session?.user?.id) {
      loadCommunityPosts();
    }
  }, [session]);
  const loadCommunityPosts = async () => {
    if (!session?.user?.id)
      return;
    setLoading(true);
    try {
      const data = await supabaseRestCall(
        `/rest/v1/community_posts8?select=*,user:user_id(full_name,avatar_url)&order=created_at.desc`,
        { method: "GET" },
        session
      );
      setPosts(data || []);
    } catch (error) {
      console.error("Error loading community posts:", error);
      ue.error("Failed to load community posts");
    } finally {
      setLoading(false);
    }
  };
  const handleLikePost = async (postId) => {
    if (!session?.user?.id)
      return;
    try {
      const post = posts.find((p) => p.id === postId);
      if (!post)
        return;
      setPosts(
        (prevPosts) => prevPosts.map(
          (p) => p.id === postId ? { ...p, likes: p.likes + 1 } : p
        )
      );
      await supabaseRestCall(
        `/rest/v1/community_posts8?id=eq.${postId}`,
        {
          method: "PATCH",
          body: JSON.stringify({ likes: post.likes + 1 })
        },
        session
      );
    } catch (error) {
      console.error("Error liking post:", error);
      ue.error("Failed to like post");
      loadCommunityPosts();
    }
  };
  if (!session?.user?.id) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      "div",
      { className: "text-center py-8", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        "p",
        { className: "text-muted-foreground", children: "Please sign in to view the community." }
      ) }
    );
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    "div",
    { className: "space-y-6", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
      Card,
      { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          CardHeader,
          { children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { children: "Community Posts" }) }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          CardContent,
          { children: loading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-center py-4", children: "Loading posts..." }) : posts.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(
            "div",
            { className: "text-center py-4", children: "No posts yet. Be the first to share!" }
          ) : /* @__PURE__ */ jsxRuntimeExports.jsx(
            "div",
            { className: "space-y-4", children: posts.map(
              (post) => /* @__PURE__ */ jsxRuntimeExports.jsx(
                Card,
                { className: "overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                  CardContent,
                  { className: "p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
                    "div",
                    { className: "flex items-start gap-3", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsxs(
                        Avatar,
                        { children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsx(AvatarImage, { src: post.user.avatar_url }),
                          /* @__PURE__ */ jsxRuntimeExports.jsx(
                            AvatarFallback,
                            { children: post.user.full_name[0] }
                          )
                        ] }
                      ),
                      /* @__PURE__ */ jsxRuntimeExports.jsxs(
                        "div",
                        { className: "flex-1", children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsxs(
                            "div",
                            { className: "flex justify-between items-start", children: [
                              /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-medium", children: post.user.full_name }),
                              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                                Button,
                                {
                                  variant: "ghost",
                                  size: "sm",
                                  onClick: () => handleLikePost(post.id),
                                  children: [
                                    "👍 ",
                                    post.likes
                                  ]
                                }
                              )
                            ] }
                          ),
                          /* @__PURE__ */ jsxRuntimeExports.jsx(
                            "p",
                            { className: "text-sm text-muted-foreground mt-1", children: new Date(post.created_at).toLocaleDateString() }
                          ),
                          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2", children: post.content })
                        ] }
                      )
                    ] }
                  ) }
                ) },
                post.id
              )
            ) }
          ) }
        )
      ] }
    ) }
  );
};

export { Community };

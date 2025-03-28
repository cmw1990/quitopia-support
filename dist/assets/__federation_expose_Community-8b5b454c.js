import { importShared } from './__federation_fn_import-078a81cf.js';
import { j as jsxDevRuntimeExports, B as Button, C as Card, d as CardHeader, e as CardTitle, f as CardContent } from './proxy-0fb2bf4b.js';
import { A as Avatar, a as AvatarImage, b as AvatarFallback } from './smoke-free-counter-a4ff4a5c.js';
import { s as supabase } from './supabase-client-9c0d55f4.js';
import { u as useToast } from './use-toast-614cf0bf.js';

const React = await importShared('react');
const Community = ({ session }) => {
  const { toast } = useToast();
  const [posts, setPosts] = React.useState([]);
  React.useEffect(() => {
    if (session?.user) {
      loadCommunityPosts();
    }
  }, [session]);
  const loadCommunityPosts = async () => {
    try {
      const { data, error } = await supabase.from("community_posts").select(`
          *,
          user:user_id (
            full_name,
            avatar_url
          )
        `).order("created_at", { ascending: false }).limit(10);
      if (error)
        throw error;
      if (data) {
        setPosts(data);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load community posts",
        variant: "destructive"
      });
    }
  };
  return /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "flex justify-between items-center", children: [
      /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("h1", { className: "text-2xl font-bold tracking-tight", children: "Community Support" }, void 0, false, {
        fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Community.tsx",
        lineNumber: 73,
        columnNumber: 9
      }, globalThis),
      /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Button, { children: "Share Your Story" }, void 0, false, {
        fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Community.tsx",
        lineNumber: 74,
        columnNumber: 9
      }, globalThis)
    ] }, void 0, true, {
      fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Community.tsx",
      lineNumber: 72,
      columnNumber: 7
    }, globalThis),
    /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "grid gap-6", children: posts.map((post) => /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Card, { children: [
      /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(CardHeader, { className: "flex flex-row items-center gap-4", children: [
        /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Avatar, { children: [
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(AvatarImage, { src: post.user.avatar_url }, void 0, false, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Community.tsx",
            lineNumber: 82,
            columnNumber: 17
          }, globalThis),
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(AvatarFallback, { children: post.user.full_name.split(" ").map((n) => n[0]).join("") }, void 0, false, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Community.tsx",
            lineNumber: 83,
            columnNumber: 17
          }, globalThis)
        ] }, void 0, true, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Community.tsx",
          lineNumber: 81,
          columnNumber: 15
        }, globalThis),
        /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { children: [
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(CardTitle, { className: "text-lg", children: post.user.full_name }, void 0, false, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Community.tsx",
            lineNumber: 88,
            columnNumber: 17
          }, globalThis),
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("p", { className: "text-sm text-muted-foreground", children: new Date(post.created_at).toLocaleDateString() }, void 0, false, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Community.tsx",
            lineNumber: 89,
            columnNumber: 17
          }, globalThis)
        ] }, void 0, true, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Community.tsx",
          lineNumber: 87,
          columnNumber: 15
        }, globalThis)
      ] }, void 0, true, {
        fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Community.tsx",
        lineNumber: 80,
        columnNumber: 13
      }, globalThis),
      /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(CardContent, { children: [
        /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("p", { className: "text-sm", children: post.content }, void 0, false, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Community.tsx",
          lineNumber: 95,
          columnNumber: 15
        }, globalThis),
        /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "flex items-center gap-4 mt-4", children: [
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Button, { variant: "ghost", size: "sm", children: [
            "❤️ ",
            post.likes
          ] }, void 0, true, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Community.tsx",
            lineNumber: 97,
            columnNumber: 17
          }, globalThis),
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Button, { variant: "ghost", size: "sm", children: "💬 Comment" }, void 0, false, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Community.tsx",
            lineNumber: 100,
            columnNumber: 17
          }, globalThis)
        ] }, void 0, true, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Community.tsx",
          lineNumber: 96,
          columnNumber: 15
        }, globalThis)
      ] }, void 0, true, {
        fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Community.tsx",
        lineNumber: 94,
        columnNumber: 13
      }, globalThis)
    ] }, post.id, true, {
      fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Community.tsx",
      lineNumber: 79,
      columnNumber: 11
    }, globalThis)) }, void 0, false, {
      fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Community.tsx",
      lineNumber: 77,
      columnNumber: 7
    }, globalThis),
    /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Card, { children: [
      /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(CardHeader, { children: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(CardTitle, { children: "Community Guidelines" }, void 0, false, {
        fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Community.tsx",
        lineNumber: 111,
        columnNumber: 11
      }, globalThis) }, void 0, false, {
        fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Community.tsx",
        lineNumber: 110,
        columnNumber: 9
      }, globalThis),
      /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(CardContent, { children: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("ul", { className: "list-disc list-inside space-y-2 text-sm", children: [
        /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("li", { children: "Be supportive and encouraging to fellow quitters" }, void 0, false, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Community.tsx",
          lineNumber: 115,
          columnNumber: 13
        }, globalThis),
        /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("li", { children: "Share your experiences and tips" }, void 0, false, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Community.tsx",
          lineNumber: 116,
          columnNumber: 13
        }, globalThis),
        /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("li", { children: "Celebrate milestones together" }, void 0, false, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Community.tsx",
          lineNumber: 117,
          columnNumber: 13
        }, globalThis),
        /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("li", { children: "Keep discussions respectful and constructive" }, void 0, false, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Community.tsx",
          lineNumber: 118,
          columnNumber: 13
        }, globalThis)
      ] }, void 0, true, {
        fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Community.tsx",
        lineNumber: 114,
        columnNumber: 11
      }, globalThis) }, void 0, false, {
        fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Community.tsx",
        lineNumber: 113,
        columnNumber: 9
      }, globalThis)
    ] }, void 0, true, {
      fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Community.tsx",
      lineNumber: 109,
      columnNumber: 7
    }, globalThis)
  ] }, void 0, true, {
    fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/Community.tsx",
    lineNumber: 71,
    columnNumber: 5
  }, globalThis);
};

export { Community };

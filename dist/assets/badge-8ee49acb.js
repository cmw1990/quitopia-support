import { j as jsxDevRuntimeExports, a as cn, b as cva } from './proxy-0fb2bf4b.js';

const badgeVariants = cva(
  "inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground shadow hover:bg-primary/80",
        secondary: "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive: "border-transparent bg-destructive text-destructive-foreground shadow hover:bg-destructive/80",
        outline: "text-foreground",
        success: "border-transparent bg-green-500 text-white shadow hover:bg-green-600",
        warning: "border-transparent bg-yellow-500 text-white shadow hover:bg-yellow-600",
        info: "border-transparent bg-blue-500 text-white shadow hover:bg-blue-600"
      }
    },
    defaultVariants: {
      variant: "default"
    }
  }
);
function Badge({ className, variant, ...props }) {
  return /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: cn(badgeVariants({ variant }), className), ...props }, void 0, false, {
    fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/ui/badge.tsx",
    lineNumber: 37,
    columnNumber: 5
  }, this);
}

export { Badge as B };

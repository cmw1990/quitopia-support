import { i as importShared } from './react-vendor-773e5a75.js';
import { j as jsxRuntimeExports } from './ui-vendor-336c871f.js';

const {clsx} = await importShared('clsx');

const {twMerge} = await importShared('tailwind-merge');

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const React = await importShared('react');
const Card = React.forwardRef(
  ({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(
    "div",
    {
      ref,
      className: cn(
        "rounded-lg border bg-card text-card-foreground shadow-sm",
        className
      ),
      ...props
    }
  )
);
Card.displayName = "Card";
const CardHeader = React.forwardRef(
  ({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(
    "div",
    {
      ref,
      className: cn("flex flex-col space-y-1.5 p-6", className),
      ...props
    }
  )
);
CardHeader.displayName = "CardHeader";
const CardTitle = React.forwardRef(
  ({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(
    "h3",
    {
      ref,
      className: cn(
        "text-2xl font-semibold leading-none tracking-tight",
        className
      ),
      ...props
    }
  )
);
CardTitle.displayName = "CardTitle";
const CardDescription = React.forwardRef(
  ({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(
    "p",
    {
      ref,
      className: cn("text-sm text-muted-foreground", className),
      ...props
    }
  )
);
CardDescription.displayName = "CardDescription";
const CardContent = React.forwardRef(
  ({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { ref, className: cn("p-6 pt-0", className), ...props })
);
CardContent.displayName = "CardContent";
const CardFooter = React.forwardRef(
  ({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(
    "div",
    {
      ref,
      className: cn("flex items-center p-6 pt-0", className),
      ...props
    }
  )
);
CardFooter.displayName = "CardFooter";

export { Card as C, CardHeader as a, CardTitle as b, CardDescription as c, CardContent as d, CardFooter as e, cn as f };

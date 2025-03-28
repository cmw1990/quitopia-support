import { importShared } from './__federation_fn_import-078a81cf.js';
import { U as createContextScope, t as jsxRuntimeExports, V as Primitive, W as useCallbackRef, Y as useLayoutEffect2, j as jsxDevRuntimeExports, a as cn, Z as createContextScope$1, _ as Primitive$1, b as cva, $ as useComposedRefs, a0 as useControllableState, a1 as composeEventHandlers, a2 as Presence, a3 as usePrevious$1, a4 as useSize, s as Check, a5 as useComposedRefs$1, a6 as useControllableState$1, a7 as composeEventHandlers$1, a8 as useSize$1, a9 as createPopperScope, aa as Anchor, ab as Presence$1, ac as DismissableLayer, ad as Content, ae as Slottable, af as Arrow, ag as createRovingFocusGroupScope, ah as useDirection, ai as Root$5, aj as Item, ak as Overlay, al as Content$1, am as Close, X, an as Title, ao as Description, ap as Portal, aq as Root$6, C as Card, f as CardContent, z as motion } from './proxy-0fb2bf4b.js';

// packages/react/avatar/src/avatar.tsx
const React$f = await importShared('react');
var AVATAR_NAME = "Avatar";
var [createAvatarContext, createAvatarScope] = createContextScope(AVATAR_NAME);
var [AvatarProvider, useAvatarContext] = createAvatarContext(AVATAR_NAME);
var Avatar$1 = React$f.forwardRef(
  (props, forwardedRef) => {
    const { __scopeAvatar, ...avatarProps } = props;
    const [imageLoadingStatus, setImageLoadingStatus] = React$f.useState("idle");
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      AvatarProvider,
      {
        scope: __scopeAvatar,
        imageLoadingStatus,
        onImageLoadingStatusChange: setImageLoadingStatus,
        children: /* @__PURE__ */ jsxRuntimeExports.jsx(Primitive.span, { ...avatarProps, ref: forwardedRef })
      }
    );
  }
);
Avatar$1.displayName = AVATAR_NAME;
var IMAGE_NAME = "AvatarImage";
var AvatarImage$1 = React$f.forwardRef(
  (props, forwardedRef) => {
    const { __scopeAvatar, src, onLoadingStatusChange = () => {
    }, ...imageProps } = props;
    const context = useAvatarContext(IMAGE_NAME, __scopeAvatar);
    const imageLoadingStatus = useImageLoadingStatus(src, imageProps.referrerPolicy);
    const handleLoadingStatusChange = useCallbackRef((status) => {
      onLoadingStatusChange(status);
      context.onImageLoadingStatusChange(status);
    });
    useLayoutEffect2(() => {
      if (imageLoadingStatus !== "idle") {
        handleLoadingStatusChange(imageLoadingStatus);
      }
    }, [imageLoadingStatus, handleLoadingStatusChange]);
    return imageLoadingStatus === "loaded" ? /* @__PURE__ */ jsxRuntimeExports.jsx(Primitive.img, { ...imageProps, ref: forwardedRef, src }) : null;
  }
);
AvatarImage$1.displayName = IMAGE_NAME;
var FALLBACK_NAME = "AvatarFallback";
var AvatarFallback$1 = React$f.forwardRef(
  (props, forwardedRef) => {
    const { __scopeAvatar, delayMs, ...fallbackProps } = props;
    const context = useAvatarContext(FALLBACK_NAME, __scopeAvatar);
    const [canRender, setCanRender] = React$f.useState(delayMs === void 0);
    React$f.useEffect(() => {
      if (delayMs !== void 0) {
        const timerId = window.setTimeout(() => setCanRender(true), delayMs);
        return () => window.clearTimeout(timerId);
      }
    }, [delayMs]);
    return canRender && context.imageLoadingStatus !== "loaded" ? /* @__PURE__ */ jsxRuntimeExports.jsx(Primitive.span, { ...fallbackProps, ref: forwardedRef }) : null;
  }
);
AvatarFallback$1.displayName = FALLBACK_NAME;
function useImageLoadingStatus(src, referrerPolicy) {
  const [loadingStatus, setLoadingStatus] = React$f.useState("idle");
  useLayoutEffect2(() => {
    if (!src) {
      setLoadingStatus("error");
      return;
    }
    let isMounted = true;
    const image = new window.Image();
    const updateStatus = (status) => () => {
      if (!isMounted) return;
      setLoadingStatus(status);
    };
    setLoadingStatus("loading");
    image.onload = updateStatus("loaded");
    image.onerror = updateStatus("error");
    image.src = src;
    if (referrerPolicy) {
      image.referrerPolicy = referrerPolicy;
    }
    return () => {
      isMounted = false;
    };
  }, [src, referrerPolicy]);
  return loadingStatus;
}
var Root$4 = Avatar$1;
var Image = AvatarImage$1;
var Fallback = AvatarFallback$1;

const React$e = await importShared('react');
const Avatar = React$e.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(
  Root$4,
  {
    ref,
    className: cn(
      "relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full",
      className
    ),
    ...props
  },
  void 0,
  false,
  {
    fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/ui/avatar.tsx",
    lineNumber: 12,
    columnNumber: 3
  },
  globalThis
));
Avatar.displayName = Root$4.displayName;
const AvatarImage = React$e.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(
  Image,
  {
    ref,
    className: cn("aspect-square h-full w-full", className),
    ...props
  },
  void 0,
  false,
  {
    fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/ui/avatar.tsx",
    lineNumber: 27,
    columnNumber: 3
  },
  globalThis
));
AvatarImage.displayName = Image.displayName;
const AvatarFallback = React$e.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(
  Fallback,
  {
    ref,
    className: cn(
      "flex h-full w-full items-center justify-center rounded-full bg-muted",
      className
    ),
    ...props
  },
  void 0,
  false,
  {
    fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/ui/avatar.tsx",
    lineNumber: 39,
    columnNumber: 3
  },
  globalThis
));
AvatarFallback.displayName = Fallback.displayName;

// packages/react/progress/src/progress.tsx
const React$d = await importShared('react');
var PROGRESS_NAME = "Progress";
var DEFAULT_MAX = 100;
var [createProgressContext, createProgressScope] = createContextScope$1(PROGRESS_NAME);
var [ProgressProvider, useProgressContext] = createProgressContext(PROGRESS_NAME);
var Progress$1 = React$d.forwardRef(
  (props, forwardedRef) => {
    const {
      __scopeProgress,
      value: valueProp = null,
      max: maxProp,
      getValueLabel = defaultGetValueLabel,
      ...progressProps
    } = props;
    if ((maxProp || maxProp === 0) && !isValidMaxNumber(maxProp)) {
      console.error(getInvalidMaxError(`${maxProp}`, "Progress"));
    }
    const max = isValidMaxNumber(maxProp) ? maxProp : DEFAULT_MAX;
    if (valueProp !== null && !isValidValueNumber(valueProp, max)) {
      console.error(getInvalidValueError(`${valueProp}`, "Progress"));
    }
    const value = isValidValueNumber(valueProp, max) ? valueProp : null;
    const valueLabel = isNumber(value) ? getValueLabel(value, max) : void 0;
    return /* @__PURE__ */ jsxRuntimeExports.jsx(ProgressProvider, { scope: __scopeProgress, value, max, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
      Primitive$1.div,
      {
        "aria-valuemax": max,
        "aria-valuemin": 0,
        "aria-valuenow": isNumber(value) ? value : void 0,
        "aria-valuetext": valueLabel,
        role: "progressbar",
        "data-state": getProgressState(value, max),
        "data-value": value ?? void 0,
        "data-max": max,
        ...progressProps,
        ref: forwardedRef
      }
    ) });
  }
);
Progress$1.displayName = PROGRESS_NAME;
var INDICATOR_NAME$2 = "ProgressIndicator";
var ProgressIndicator = React$d.forwardRef(
  (props, forwardedRef) => {
    const { __scopeProgress, ...indicatorProps } = props;
    const context = useProgressContext(INDICATOR_NAME$2, __scopeProgress);
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      Primitive$1.div,
      {
        "data-state": getProgressState(context.value, context.max),
        "data-value": context.value ?? void 0,
        "data-max": context.max,
        ...indicatorProps,
        ref: forwardedRef
      }
    );
  }
);
ProgressIndicator.displayName = INDICATOR_NAME$2;
function defaultGetValueLabel(value, max) {
  return `${Math.round(value / max * 100)}%`;
}
function getProgressState(value, maxValue) {
  return value == null ? "indeterminate" : value === maxValue ? "complete" : "loading";
}
function isNumber(value) {
  return typeof value === "number";
}
function isValidMaxNumber(max) {
  return isNumber(max) && !isNaN(max) && max > 0;
}
function isValidValueNumber(value, max) {
  return isNumber(value) && !isNaN(value) && value <= max && value >= 0;
}
function getInvalidMaxError(propValue, componentName) {
  return `Invalid prop \`max\` of value \`${propValue}\` supplied to \`${componentName}\`. Only numbers greater than 0 are valid max values. Defaulting to \`${DEFAULT_MAX}\`.`;
}
function getInvalidValueError(propValue, componentName) {
  return `Invalid prop \`value\` of value \`${propValue}\` supplied to \`${componentName}\`. The \`value\` prop must be:
  - a positive number
  - less than the value passed to \`max\` (or ${DEFAULT_MAX} if no \`max\` prop is set)
  - \`null\` or \`undefined\` if the progress is indeterminate.

Defaulting to \`null\`.`;
}
var Root$3 = Progress$1;
var Indicator$2 = ProgressIndicator;

const React$c = await importShared('react');
const Progress = React$c.forwardRef(({ className, indicatorClassName, value, ...props }, ref) => /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(
  Root$3,
  {
    ref,
    className: cn(
      "relative h-2 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800",
      className
    ),
    ...props,
    children: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(
      Indicator$2,
      {
        className: cn(
          "h-full w-full flex-1 bg-primary transition-all",
          indicatorClassName
        ),
        style: { transform: `translateX(-${100 - (value || 0)}%)` }
      },
      void 0,
      false,
      {
        fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/ui/progress.tsx",
        lineNumber: 21,
        columnNumber: 5
      },
      globalThis
    )
  },
  void 0,
  false,
  {
    fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/ui/progress.tsx",
    lineNumber: 13,
    columnNumber: 3
  },
  globalThis
));
Progress.displayName = Root$3.displayName;

const React$b = await importShared('react');
const alertVariants = cva(
  "relative w-full rounded-lg border p-4",
  {
    variants: {
      variant: {
        default: "bg-background text-foreground",
        destructive: "border-destructive/50 text-destructive dark:border-destructive [&>svg]:text-destructive"
      }
    },
    defaultVariants: {
      variant: "default"
    }
  }
);
const Alert = React$b.forwardRef(({ className, variant, ...props }, ref) => /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(
  "div",
  {
    ref,
    role: "alert",
    className: cn(alertVariants({ variant }), className),
    ...props
  },
  void 0,
  false,
  {
    fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/ui/alert.tsx",
    lineNumber: 25,
    columnNumber: 3
  },
  globalThis
));
Alert.displayName = "Alert";
const AlertTitle = React$b.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(
  "h5",
  {
    ref,
    className: cn("mb-1 font-medium leading-none tracking-tight", className),
    ...props
  },
  void 0,
  false,
  {
    fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/ui/alert.tsx",
    lineNumber: 38,
    columnNumber: 3
  },
  globalThis
));
AlertTitle.displayName = "AlertTitle";
const AlertDescription = React$b.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(
  "div",
  {
    ref,
    className: cn("text-sm [&_p]:leading-relaxed", className),
    ...props
  },
  void 0,
  false,
  {
    fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/ui/alert.tsx",
    lineNumber: 50,
    columnNumber: 3
  },
  globalThis
));
AlertDescription.displayName = "AlertDescription";

// packages/react/checkbox/src/checkbox.tsx
const React$a = await importShared('react');
var CHECKBOX_NAME = "Checkbox";
var [createCheckboxContext, createCheckboxScope] = createContextScope(CHECKBOX_NAME);
var [CheckboxProvider, useCheckboxContext] = createCheckboxContext(CHECKBOX_NAME);
var Checkbox$1 = React$a.forwardRef(
  (props, forwardedRef) => {
    const {
      __scopeCheckbox,
      name,
      checked: checkedProp,
      defaultChecked,
      required,
      disabled,
      value = "on",
      onCheckedChange,
      form,
      ...checkboxProps
    } = props;
    const [button, setButton] = React$a.useState(null);
    const composedRefs = useComposedRefs(forwardedRef, (node) => setButton(node));
    const hasConsumerStoppedPropagationRef = React$a.useRef(false);
    const isFormControl = button ? form || !!button.closest("form") : true;
    const [checked = false, setChecked] = useControllableState({
      prop: checkedProp,
      defaultProp: defaultChecked,
      onChange: onCheckedChange
    });
    const initialCheckedStateRef = React$a.useRef(checked);
    React$a.useEffect(() => {
      const form2 = button?.form;
      if (form2) {
        const reset = () => setChecked(initialCheckedStateRef.current);
        form2.addEventListener("reset", reset);
        return () => form2.removeEventListener("reset", reset);
      }
    }, [button, setChecked]);
    return /* @__PURE__ */ jsxRuntimeExports.jsxs(CheckboxProvider, { scope: __scopeCheckbox, state: checked, disabled, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Primitive.button,
        {
          type: "button",
          role: "checkbox",
          "aria-checked": isIndeterminate(checked) ? "mixed" : checked,
          "aria-required": required,
          "data-state": getState$2(checked),
          "data-disabled": disabled ? "" : void 0,
          disabled,
          value,
          ...checkboxProps,
          ref: composedRefs,
          onKeyDown: composeEventHandlers(props.onKeyDown, (event) => {
            if (event.key === "Enter") event.preventDefault();
          }),
          onClick: composeEventHandlers(props.onClick, (event) => {
            setChecked((prevChecked) => isIndeterminate(prevChecked) ? true : !prevChecked);
            if (isFormControl) {
              hasConsumerStoppedPropagationRef.current = event.isPropagationStopped();
              if (!hasConsumerStoppedPropagationRef.current) event.stopPropagation();
            }
          })
        }
      ),
      isFormControl && /* @__PURE__ */ jsxRuntimeExports.jsx(
        BubbleInput$2,
        {
          control: button,
          bubbles: !hasConsumerStoppedPropagationRef.current,
          name,
          value,
          checked,
          required,
          disabled,
          form,
          style: { transform: "translateX(-100%)" },
          defaultChecked: isIndeterminate(defaultChecked) ? false : defaultChecked
        }
      )
    ] });
  }
);
Checkbox$1.displayName = CHECKBOX_NAME;
var INDICATOR_NAME$1 = "CheckboxIndicator";
var CheckboxIndicator = React$a.forwardRef(
  (props, forwardedRef) => {
    const { __scopeCheckbox, forceMount, ...indicatorProps } = props;
    const context = useCheckboxContext(INDICATOR_NAME$1, __scopeCheckbox);
    return /* @__PURE__ */ jsxRuntimeExports.jsx(Presence, { present: forceMount || isIndeterminate(context.state) || context.state === true, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
      Primitive.span,
      {
        "data-state": getState$2(context.state),
        "data-disabled": context.disabled ? "" : void 0,
        ...indicatorProps,
        ref: forwardedRef,
        style: { pointerEvents: "none", ...props.style }
      }
    ) });
  }
);
CheckboxIndicator.displayName = INDICATOR_NAME$1;
var BubbleInput$2 = (props) => {
  const { control, checked, bubbles = true, defaultChecked, ...inputProps } = props;
  const ref = React$a.useRef(null);
  const prevChecked = usePrevious$1(checked);
  const controlSize = useSize(control);
  React$a.useEffect(() => {
    const input = ref.current;
    const inputProto = window.HTMLInputElement.prototype;
    const descriptor = Object.getOwnPropertyDescriptor(inputProto, "checked");
    const setChecked = descriptor.set;
    if (prevChecked !== checked && setChecked) {
      const event = new Event("click", { bubbles });
      input.indeterminate = isIndeterminate(checked);
      setChecked.call(input, isIndeterminate(checked) ? false : checked);
      input.dispatchEvent(event);
    }
  }, [prevChecked, checked, bubbles]);
  const defaultCheckedRef = React$a.useRef(isIndeterminate(checked) ? false : checked);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    "input",
    {
      type: "checkbox",
      "aria-hidden": true,
      defaultChecked: defaultChecked ?? defaultCheckedRef.current,
      ...inputProps,
      tabIndex: -1,
      ref,
      style: {
        ...props.style,
        ...controlSize,
        position: "absolute",
        pointerEvents: "none",
        opacity: 0,
        margin: 0
      }
    }
  );
};
function isIndeterminate(checked) {
  return checked === "indeterminate";
}
function getState$2(checked) {
  return isIndeterminate(checked) ? "indeterminate" : checked ? "checked" : "unchecked";
}
var Root$2 = Checkbox$1;
var Indicator$1 = CheckboxIndicator;

const React$9 = await importShared('react');
const Checkbox = React$9.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(
  Root$2,
  {
    ref,
    className: cn(
      "peer h-4 w-4 shrink-0 rounded-sm border border-primary ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground",
      className
    ),
    ...props,
    children: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(
      Indicator$1,
      {
        className: cn("flex items-center justify-center text-current"),
        children: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Check, { className: "h-4 w-4" }, void 0, false, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/ui/checkbox.tsx",
          lineNumber: 22,
          columnNumber: 7
        }, globalThis)
      },
      void 0,
      false,
      {
        fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/ui/checkbox.tsx",
        lineNumber: 19,
        columnNumber: 5
      },
      globalThis
    )
  },
  void 0,
  false,
  {
    fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/ui/checkbox.tsx",
    lineNumber: 11,
    columnNumber: 3
  },
  globalThis
));
Checkbox.displayName = Root$2.displayName;

// packages/react/use-previous/src/usePrevious.tsx
const React$8 = await importShared('react');

function usePrevious(value) {
  const ref = React$8.useRef({ value, previous: value });
  return React$8.useMemo(() => {
    if (ref.current.value !== value) {
      ref.current.previous = ref.current.value;
      ref.current.value = value;
    }
    return ref.current.previous;
  }, [value]);
}

// packages/react/switch/src/switch.tsx
const React$7 = await importShared('react');
var SWITCH_NAME = "Switch";
var [createSwitchContext, createSwitchScope] = createContextScope$1(SWITCH_NAME);
var [SwitchProvider, useSwitchContext] = createSwitchContext(SWITCH_NAME);
var Switch$1 = React$7.forwardRef(
  (props, forwardedRef) => {
    const {
      __scopeSwitch,
      name,
      checked: checkedProp,
      defaultChecked,
      required,
      disabled,
      value = "on",
      onCheckedChange,
      form,
      ...switchProps
    } = props;
    const [button, setButton] = React$7.useState(null);
    const composedRefs = useComposedRefs$1(forwardedRef, (node) => setButton(node));
    const hasConsumerStoppedPropagationRef = React$7.useRef(false);
    const isFormControl = button ? form || !!button.closest("form") : true;
    const [checked = false, setChecked] = useControllableState$1({
      prop: checkedProp,
      defaultProp: defaultChecked,
      onChange: onCheckedChange
    });
    return /* @__PURE__ */ jsxRuntimeExports.jsxs(SwitchProvider, { scope: __scopeSwitch, checked, disabled, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Primitive$1.button,
        {
          type: "button",
          role: "switch",
          "aria-checked": checked,
          "aria-required": required,
          "data-state": getState$1(checked),
          "data-disabled": disabled ? "" : void 0,
          disabled,
          value,
          ...switchProps,
          ref: composedRefs,
          onClick: composeEventHandlers$1(props.onClick, (event) => {
            setChecked((prevChecked) => !prevChecked);
            if (isFormControl) {
              hasConsumerStoppedPropagationRef.current = event.isPropagationStopped();
              if (!hasConsumerStoppedPropagationRef.current) event.stopPropagation();
            }
          })
        }
      ),
      isFormControl && /* @__PURE__ */ jsxRuntimeExports.jsx(
        BubbleInput$1,
        {
          control: button,
          bubbles: !hasConsumerStoppedPropagationRef.current,
          name,
          value,
          checked,
          required,
          disabled,
          form,
          style: { transform: "translateX(-100%)" }
        }
      )
    ] });
  }
);
Switch$1.displayName = SWITCH_NAME;
var THUMB_NAME = "SwitchThumb";
var SwitchThumb = React$7.forwardRef(
  (props, forwardedRef) => {
    const { __scopeSwitch, ...thumbProps } = props;
    const context = useSwitchContext(THUMB_NAME, __scopeSwitch);
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      Primitive$1.span,
      {
        "data-state": getState$1(context.checked),
        "data-disabled": context.disabled ? "" : void 0,
        ...thumbProps,
        ref: forwardedRef
      }
    );
  }
);
SwitchThumb.displayName = THUMB_NAME;
var BubbleInput$1 = (props) => {
  const { control, checked, bubbles = true, ...inputProps } = props;
  const ref = React$7.useRef(null);
  const prevChecked = usePrevious(checked);
  const controlSize = useSize$1(control);
  React$7.useEffect(() => {
    const input = ref.current;
    const inputProto = window.HTMLInputElement.prototype;
    const descriptor = Object.getOwnPropertyDescriptor(inputProto, "checked");
    const setChecked = descriptor.set;
    if (prevChecked !== checked && setChecked) {
      const event = new Event("click", { bubbles });
      setChecked.call(input, checked);
      input.dispatchEvent(event);
    }
  }, [prevChecked, checked, bubbles]);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    "input",
    {
      type: "checkbox",
      "aria-hidden": true,
      defaultChecked: checked,
      ...inputProps,
      tabIndex: -1,
      ref,
      style: {
        ...props.style,
        ...controlSize,
        position: "absolute",
        pointerEvents: "none",
        opacity: 0,
        margin: 0
      }
    }
  );
};
function getState$1(checked) {
  return checked ? "checked" : "unchecked";
}
var Root$1 = Switch$1;
var Thumb = SwitchThumb;

const React$6 = await importShared('react');
const Switch = React$6.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(
  Root$1,
  {
    className: cn(
      "peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=unchecked]:bg-input",
      className
    ),
    ...props,
    ref,
    children: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(
      Thumb,
      {
        className: cn(
          "pointer-events-none block h-5 w-5 rounded-full bg-background shadow-lg ring-0 transition-transform data-[state=checked]:translate-x-5 data-[state=unchecked]:translate-x-0"
        )
      },
      void 0,
      false,
      {
        fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/ui/switch.tsx",
        lineNumber: 18,
        columnNumber: 5
      },
      globalThis
    )
  },
  void 0,
  false,
  {
    fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/ui/switch.tsx",
    lineNumber: 10,
    columnNumber: 3
  },
  globalThis
));
Switch.displayName = Root$1.displayName;

// packages/react/visually-hidden/src/visually-hidden.tsx
const React$5 = await importShared('react');
var NAME = "VisuallyHidden";
var VisuallyHidden = React$5.forwardRef(
  (props, forwardedRef) => {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      Primitive$1.span,
      {
        ...props,
        ref: forwardedRef,
        style: {
          // See: https://github.com/twbs/bootstrap/blob/main/scss/mixins/_visually-hidden.scss
          position: "absolute",
          border: 0,
          width: 1,
          height: 1,
          padding: 0,
          margin: -1,
          overflow: "hidden",
          clip: "rect(0, 0, 0, 0)",
          whiteSpace: "nowrap",
          wordWrap: "normal",
          ...props.style
        }
      }
    );
  }
);
VisuallyHidden.displayName = NAME;
var Root = VisuallyHidden;

// packages/react/tooltip/src/tooltip.tsx
const React$4 = await importShared('react');
var [createTooltipContext, createTooltipScope] = createContextScope$1("Tooltip", [
  createPopperScope
]);
var usePopperScope = createPopperScope();
var PROVIDER_NAME = "TooltipProvider";
var TOOLTIP_OPEN = "tooltip.open";
var [TooltipProviderContextProvider, useTooltipProviderContext] = createTooltipContext(PROVIDER_NAME);
var TOOLTIP_NAME = "Tooltip";
var [TooltipContextProvider, useTooltipContext] = createTooltipContext(TOOLTIP_NAME);
var TRIGGER_NAME = "TooltipTrigger";
var TooltipTrigger = React$4.forwardRef(
  (props, forwardedRef) => {
    const { __scopeTooltip, ...triggerProps } = props;
    const context = useTooltipContext(TRIGGER_NAME, __scopeTooltip);
    const providerContext = useTooltipProviderContext(TRIGGER_NAME, __scopeTooltip);
    const popperScope = usePopperScope(__scopeTooltip);
    const ref = React$4.useRef(null);
    const composedRefs = useComposedRefs$1(forwardedRef, ref, context.onTriggerChange);
    const isPointerDownRef = React$4.useRef(false);
    const hasPointerMoveOpenedRef = React$4.useRef(false);
    const handlePointerUp = React$4.useCallback(() => isPointerDownRef.current = false, []);
    React$4.useEffect(() => {
      return () => document.removeEventListener("pointerup", handlePointerUp);
    }, [handlePointerUp]);
    return /* @__PURE__ */ jsxRuntimeExports.jsx(Anchor, { asChild: true, ...popperScope, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
      Primitive$1.button,
      {
        "aria-describedby": context.open ? context.contentId : void 0,
        "data-state": context.stateAttribute,
        ...triggerProps,
        ref: composedRefs,
        onPointerMove: composeEventHandlers$1(props.onPointerMove, (event) => {
          if (event.pointerType === "touch") return;
          if (!hasPointerMoveOpenedRef.current && !providerContext.isPointerInTransitRef.current) {
            context.onTriggerEnter();
            hasPointerMoveOpenedRef.current = true;
          }
        }),
        onPointerLeave: composeEventHandlers$1(props.onPointerLeave, () => {
          context.onTriggerLeave();
          hasPointerMoveOpenedRef.current = false;
        }),
        onPointerDown: composeEventHandlers$1(props.onPointerDown, () => {
          isPointerDownRef.current = true;
          document.addEventListener("pointerup", handlePointerUp, { once: true });
        }),
        onFocus: composeEventHandlers$1(props.onFocus, () => {
          if (!isPointerDownRef.current) context.onOpen();
        }),
        onBlur: composeEventHandlers$1(props.onBlur, context.onClose),
        onClick: composeEventHandlers$1(props.onClick, context.onClose)
      }
    ) });
  }
);
TooltipTrigger.displayName = TRIGGER_NAME;
var PORTAL_NAME = "TooltipPortal";
var [PortalProvider, usePortalContext] = createTooltipContext(PORTAL_NAME, {
  forceMount: void 0
});
var CONTENT_NAME = "TooltipContent";
var TooltipContent$1 = React$4.forwardRef(
  (props, forwardedRef) => {
    const portalContext = usePortalContext(CONTENT_NAME, props.__scopeTooltip);
    const { forceMount = portalContext.forceMount, side = "top", ...contentProps } = props;
    const context = useTooltipContext(CONTENT_NAME, props.__scopeTooltip);
    return /* @__PURE__ */ jsxRuntimeExports.jsx(Presence$1, { present: forceMount || context.open, children: context.disableHoverableContent ? /* @__PURE__ */ jsxRuntimeExports.jsx(TooltipContentImpl, { side, ...contentProps, ref: forwardedRef }) : /* @__PURE__ */ jsxRuntimeExports.jsx(TooltipContentHoverable, { side, ...contentProps, ref: forwardedRef }) });
  }
);
var TooltipContentHoverable = React$4.forwardRef((props, forwardedRef) => {
  const context = useTooltipContext(CONTENT_NAME, props.__scopeTooltip);
  const providerContext = useTooltipProviderContext(CONTENT_NAME, props.__scopeTooltip);
  const ref = React$4.useRef(null);
  const composedRefs = useComposedRefs$1(forwardedRef, ref);
  const [pointerGraceArea, setPointerGraceArea] = React$4.useState(null);
  const { trigger, onClose } = context;
  const content = ref.current;
  const { onPointerInTransitChange } = providerContext;
  const handleRemoveGraceArea = React$4.useCallback(() => {
    setPointerGraceArea(null);
    onPointerInTransitChange(false);
  }, [onPointerInTransitChange]);
  const handleCreateGraceArea = React$4.useCallback(
    (event, hoverTarget) => {
      const currentTarget = event.currentTarget;
      const exitPoint = { x: event.clientX, y: event.clientY };
      const exitSide = getExitSideFromRect(exitPoint, currentTarget.getBoundingClientRect());
      const paddedExitPoints = getPaddedExitPoints(exitPoint, exitSide);
      const hoverTargetPoints = getPointsFromRect(hoverTarget.getBoundingClientRect());
      const graceArea = getHull([...paddedExitPoints, ...hoverTargetPoints]);
      setPointerGraceArea(graceArea);
      onPointerInTransitChange(true);
    },
    [onPointerInTransitChange]
  );
  React$4.useEffect(() => {
    return () => handleRemoveGraceArea();
  }, [handleRemoveGraceArea]);
  React$4.useEffect(() => {
    if (trigger && content) {
      const handleTriggerLeave = (event) => handleCreateGraceArea(event, content);
      const handleContentLeave = (event) => handleCreateGraceArea(event, trigger);
      trigger.addEventListener("pointerleave", handleTriggerLeave);
      content.addEventListener("pointerleave", handleContentLeave);
      return () => {
        trigger.removeEventListener("pointerleave", handleTriggerLeave);
        content.removeEventListener("pointerleave", handleContentLeave);
      };
    }
  }, [trigger, content, handleCreateGraceArea, handleRemoveGraceArea]);
  React$4.useEffect(() => {
    if (pointerGraceArea) {
      const handleTrackPointerGrace = (event) => {
        const target = event.target;
        const pointerPosition = { x: event.clientX, y: event.clientY };
        const hasEnteredTarget = trigger?.contains(target) || content?.contains(target);
        const isPointerOutsideGraceArea = !isPointInPolygon(pointerPosition, pointerGraceArea);
        if (hasEnteredTarget) {
          handleRemoveGraceArea();
        } else if (isPointerOutsideGraceArea) {
          handleRemoveGraceArea();
          onClose();
        }
      };
      document.addEventListener("pointermove", handleTrackPointerGrace);
      return () => document.removeEventListener("pointermove", handleTrackPointerGrace);
    }
  }, [trigger, content, pointerGraceArea, onClose, handleRemoveGraceArea]);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(TooltipContentImpl, { ...props, ref: composedRefs });
});
var [VisuallyHiddenContentContextProvider, useVisuallyHiddenContentContext] = createTooltipContext(TOOLTIP_NAME, { isInside: false });
var TooltipContentImpl = React$4.forwardRef(
  (props, forwardedRef) => {
    const {
      __scopeTooltip,
      children,
      "aria-label": ariaLabel,
      onEscapeKeyDown,
      onPointerDownOutside,
      ...contentProps
    } = props;
    const context = useTooltipContext(CONTENT_NAME, __scopeTooltip);
    const popperScope = usePopperScope(__scopeTooltip);
    const { onClose } = context;
    React$4.useEffect(() => {
      document.addEventListener(TOOLTIP_OPEN, onClose);
      return () => document.removeEventListener(TOOLTIP_OPEN, onClose);
    }, [onClose]);
    React$4.useEffect(() => {
      if (context.trigger) {
        const handleScroll = (event) => {
          const target = event.target;
          if (target?.contains(context.trigger)) onClose();
        };
        window.addEventListener("scroll", handleScroll, { capture: true });
        return () => window.removeEventListener("scroll", handleScroll, { capture: true });
      }
    }, [context.trigger, onClose]);
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      DismissableLayer,
      {
        asChild: true,
        disableOutsidePointerEvents: false,
        onEscapeKeyDown,
        onPointerDownOutside,
        onFocusOutside: (event) => event.preventDefault(),
        onDismiss: onClose,
        children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Content,
          {
            "data-state": context.stateAttribute,
            ...popperScope,
            ...contentProps,
            ref: forwardedRef,
            style: {
              ...contentProps.style,
              // re-namespace exposed content custom properties
              ...{
                "--radix-tooltip-content-transform-origin": "var(--radix-popper-transform-origin)",
                "--radix-tooltip-content-available-width": "var(--radix-popper-available-width)",
                "--radix-tooltip-content-available-height": "var(--radix-popper-available-height)",
                "--radix-tooltip-trigger-width": "var(--radix-popper-anchor-width)",
                "--radix-tooltip-trigger-height": "var(--radix-popper-anchor-height)"
              }
            },
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Slottable, { children }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(VisuallyHiddenContentContextProvider, { scope: __scopeTooltip, isInside: true, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Root, { id: context.contentId, role: "tooltip", children: ariaLabel || children }) })
            ]
          }
        )
      }
    );
  }
);
TooltipContent$1.displayName = CONTENT_NAME;
var ARROW_NAME = "TooltipArrow";
var TooltipArrow = React$4.forwardRef(
  (props, forwardedRef) => {
    const { __scopeTooltip, ...arrowProps } = props;
    const popperScope = usePopperScope(__scopeTooltip);
    const visuallyHiddenContentContext = useVisuallyHiddenContentContext(
      ARROW_NAME,
      __scopeTooltip
    );
    return visuallyHiddenContentContext.isInside ? null : /* @__PURE__ */ jsxRuntimeExports.jsx(Arrow, { ...popperScope, ...arrowProps, ref: forwardedRef });
  }
);
TooltipArrow.displayName = ARROW_NAME;
function getExitSideFromRect(point, rect) {
  const top = Math.abs(rect.top - point.y);
  const bottom = Math.abs(rect.bottom - point.y);
  const right = Math.abs(rect.right - point.x);
  const left = Math.abs(rect.left - point.x);
  switch (Math.min(top, bottom, right, left)) {
    case left:
      return "left";
    case right:
      return "right";
    case top:
      return "top";
    case bottom:
      return "bottom";
    default:
      throw new Error("unreachable");
  }
}
function getPaddedExitPoints(exitPoint, exitSide, padding = 5) {
  const paddedExitPoints = [];
  switch (exitSide) {
    case "top":
      paddedExitPoints.push(
        { x: exitPoint.x - padding, y: exitPoint.y + padding },
        { x: exitPoint.x + padding, y: exitPoint.y + padding }
      );
      break;
    case "bottom":
      paddedExitPoints.push(
        { x: exitPoint.x - padding, y: exitPoint.y - padding },
        { x: exitPoint.x + padding, y: exitPoint.y - padding }
      );
      break;
    case "left":
      paddedExitPoints.push(
        { x: exitPoint.x + padding, y: exitPoint.y - padding },
        { x: exitPoint.x + padding, y: exitPoint.y + padding }
      );
      break;
    case "right":
      paddedExitPoints.push(
        { x: exitPoint.x - padding, y: exitPoint.y - padding },
        { x: exitPoint.x - padding, y: exitPoint.y + padding }
      );
      break;
  }
  return paddedExitPoints;
}
function getPointsFromRect(rect) {
  const { top, right, bottom, left } = rect;
  return [
    { x: left, y: top },
    { x: right, y: top },
    { x: right, y: bottom },
    { x: left, y: bottom }
  ];
}
function isPointInPolygon(point, polygon) {
  const { x, y } = point;
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i].x;
    const yi = polygon[i].y;
    const xj = polygon[j].x;
    const yj = polygon[j].y;
    const intersect = yi > y !== yj > y && x < (xj - xi) * (y - yi) / (yj - yi) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}
function getHull(points) {
  const newPoints = points.slice();
  newPoints.sort((a, b) => {
    if (a.x < b.x) return -1;
    else if (a.x > b.x) return 1;
    else if (a.y < b.y) return -1;
    else if (a.y > b.y) return 1;
    else return 0;
  });
  return getHullPresorted(newPoints);
}
function getHullPresorted(points) {
  if (points.length <= 1) return points.slice();
  const upperHull = [];
  for (let i = 0; i < points.length; i++) {
    const p = points[i];
    while (upperHull.length >= 2) {
      const q = upperHull[upperHull.length - 1];
      const r = upperHull[upperHull.length - 2];
      if ((q.x - r.x) * (p.y - r.y) >= (q.y - r.y) * (p.x - r.x)) upperHull.pop();
      else break;
    }
    upperHull.push(p);
  }
  upperHull.pop();
  const lowerHull = [];
  for (let i = points.length - 1; i >= 0; i--) {
    const p = points[i];
    while (lowerHull.length >= 2) {
      const q = lowerHull[lowerHull.length - 1];
      const r = lowerHull[lowerHull.length - 2];
      if ((q.x - r.x) * (p.y - r.y) >= (q.y - r.y) * (p.x - r.x)) lowerHull.pop();
      else break;
    }
    lowerHull.push(p);
  }
  lowerHull.pop();
  if (upperHull.length === 1 && lowerHull.length === 1 && upperHull[0].x === lowerHull[0].x && upperHull[0].y === lowerHull[0].y) {
    return upperHull;
  } else {
    return upperHull.concat(lowerHull);
  }
}
var Content2 = TooltipContent$1;

const React$3 = await importShared('react');
const TooltipContent = React$3.forwardRef(({ className, sideOffset = 4, ...props }, ref) => /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(
  Content2,
  {
    ref,
    sideOffset,
    className: cn(
      "z-50 overflow-hidden rounded-md border bg-popover px-3 py-1.5 text-sm text-popover-foreground shadow-md animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
      className
    ),
    ...props
  },
  void 0,
  false,
  {
    fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/ui/tooltip.tsx",
    lineNumber: 15,
    columnNumber: 3
  },
  globalThis
));
TooltipContent.displayName = Content2.displayName;

// packages/react/radio-group/src/radio-group.tsx
const React2 = await importShared('react');

// packages/react/radio-group/src/radio.tsx
const React$2 = await importShared('react');
var RADIO_NAME = "Radio";
var [createRadioContext, createRadioScope] = createContextScope(RADIO_NAME);
var [RadioProvider, useRadioContext] = createRadioContext(RADIO_NAME);
var Radio = React$2.forwardRef(
  (props, forwardedRef) => {
    const {
      __scopeRadio,
      name,
      checked = false,
      required,
      disabled,
      value = "on",
      onCheck,
      form,
      ...radioProps
    } = props;
    const [button, setButton] = React$2.useState(null);
    const composedRefs = useComposedRefs(forwardedRef, (node) => setButton(node));
    const hasConsumerStoppedPropagationRef = React$2.useRef(false);
    const isFormControl = button ? form || !!button.closest("form") : true;
    return /* @__PURE__ */ jsxRuntimeExports.jsxs(RadioProvider, { scope: __scopeRadio, checked, disabled, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Primitive.button,
        {
          type: "button",
          role: "radio",
          "aria-checked": checked,
          "data-state": getState(checked),
          "data-disabled": disabled ? "" : void 0,
          disabled,
          value,
          ...radioProps,
          ref: composedRefs,
          onClick: composeEventHandlers(props.onClick, (event) => {
            if (!checked) onCheck?.();
            if (isFormControl) {
              hasConsumerStoppedPropagationRef.current = event.isPropagationStopped();
              if (!hasConsumerStoppedPropagationRef.current) event.stopPropagation();
            }
          })
        }
      ),
      isFormControl && /* @__PURE__ */ jsxRuntimeExports.jsx(
        BubbleInput,
        {
          control: button,
          bubbles: !hasConsumerStoppedPropagationRef.current,
          name,
          value,
          checked,
          required,
          disabled,
          form,
          style: { transform: "translateX(-100%)" }
        }
      )
    ] });
  }
);
Radio.displayName = RADIO_NAME;
var INDICATOR_NAME = "RadioIndicator";
var RadioIndicator = React$2.forwardRef(
  (props, forwardedRef) => {
    const { __scopeRadio, forceMount, ...indicatorProps } = props;
    const context = useRadioContext(INDICATOR_NAME, __scopeRadio);
    return /* @__PURE__ */ jsxRuntimeExports.jsx(Presence, { present: forceMount || context.checked, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
      Primitive.span,
      {
        "data-state": getState(context.checked),
        "data-disabled": context.disabled ? "" : void 0,
        ...indicatorProps,
        ref: forwardedRef
      }
    ) });
  }
);
RadioIndicator.displayName = INDICATOR_NAME;
var BubbleInput = (props) => {
  const { control, checked, bubbles = true, ...inputProps } = props;
  const ref = React$2.useRef(null);
  const prevChecked = usePrevious$1(checked);
  const controlSize = useSize(control);
  React$2.useEffect(() => {
    const input = ref.current;
    const inputProto = window.HTMLInputElement.prototype;
    const descriptor = Object.getOwnPropertyDescriptor(inputProto, "checked");
    const setChecked = descriptor.set;
    if (prevChecked !== checked && setChecked) {
      const event = new Event("click", { bubbles });
      setChecked.call(input, checked);
      input.dispatchEvent(event);
    }
  }, [prevChecked, checked, bubbles]);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    "input",
    {
      type: "radio",
      "aria-hidden": true,
      defaultChecked: checked,
      ...inputProps,
      tabIndex: -1,
      ref,
      style: {
        ...props.style,
        ...controlSize,
        position: "absolute",
        pointerEvents: "none",
        opacity: 0,
        margin: 0
      }
    }
  );
};
function getState(checked) {
  return checked ? "checked" : "unchecked";
}
var ARROW_KEYS = ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"];
var RADIO_GROUP_NAME = "RadioGroup";
var [createRadioGroupContext, createRadioGroupScope] = createContextScope(RADIO_GROUP_NAME, [
  createRovingFocusGroupScope,
  createRadioScope
]);
var useRovingFocusGroupScope = createRovingFocusGroupScope();
var useRadioScope = createRadioScope();
var [RadioGroupProvider, useRadioGroupContext] = createRadioGroupContext(RADIO_GROUP_NAME);
var RadioGroup$1 = React2.forwardRef(
  (props, forwardedRef) => {
    const {
      __scopeRadioGroup,
      name,
      defaultValue,
      value: valueProp,
      required = false,
      disabled = false,
      orientation,
      dir,
      loop = true,
      onValueChange,
      ...groupProps
    } = props;
    const rovingFocusGroupScope = useRovingFocusGroupScope(__scopeRadioGroup);
    const direction = useDirection(dir);
    const [value, setValue] = useControllableState({
      prop: valueProp,
      defaultProp: defaultValue,
      onChange: onValueChange
    });
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      RadioGroupProvider,
      {
        scope: __scopeRadioGroup,
        name,
        required,
        disabled,
        value,
        onValueChange: setValue,
        children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          Root$5,
          {
            asChild: true,
            ...rovingFocusGroupScope,
            orientation,
            dir: direction,
            loop,
            children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              Primitive.div,
              {
                role: "radiogroup",
                "aria-required": required,
                "aria-orientation": orientation,
                "data-disabled": disabled ? "" : void 0,
                dir: direction,
                ...groupProps,
                ref: forwardedRef
              }
            )
          }
        )
      }
    );
  }
);
RadioGroup$1.displayName = RADIO_GROUP_NAME;
var ITEM_NAME = "RadioGroupItem";
var RadioGroupItem$1 = React2.forwardRef(
  (props, forwardedRef) => {
    const { __scopeRadioGroup, disabled, ...itemProps } = props;
    const context = useRadioGroupContext(ITEM_NAME, __scopeRadioGroup);
    const isDisabled = context.disabled || disabled;
    const rovingFocusGroupScope = useRovingFocusGroupScope(__scopeRadioGroup);
    const radioScope = useRadioScope(__scopeRadioGroup);
    const ref = React2.useRef(null);
    const composedRefs = useComposedRefs(forwardedRef, ref);
    const checked = context.value === itemProps.value;
    const isArrowKeyPressedRef = React2.useRef(false);
    React2.useEffect(() => {
      const handleKeyDown = (event) => {
        if (ARROW_KEYS.includes(event.key)) {
          isArrowKeyPressedRef.current = true;
        }
      };
      const handleKeyUp = () => isArrowKeyPressedRef.current = false;
      document.addEventListener("keydown", handleKeyDown);
      document.addEventListener("keyup", handleKeyUp);
      return () => {
        document.removeEventListener("keydown", handleKeyDown);
        document.removeEventListener("keyup", handleKeyUp);
      };
    }, []);
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      Item,
      {
        asChild: true,
        ...rovingFocusGroupScope,
        focusable: !isDisabled,
        active: checked,
        children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          Radio,
          {
            disabled: isDisabled,
            required: context.required,
            checked,
            ...radioScope,
            ...itemProps,
            name: context.name,
            ref: composedRefs,
            onCheck: () => context.onValueChange(itemProps.value),
            onKeyDown: composeEventHandlers((event) => {
              if (event.key === "Enter") event.preventDefault();
            }),
            onFocus: composeEventHandlers(itemProps.onFocus, () => {
              if (isArrowKeyPressedRef.current) ref.current?.click();
            })
          }
        )
      }
    );
  }
);
RadioGroupItem$1.displayName = ITEM_NAME;
var INDICATOR_NAME2 = "RadioGroupIndicator";
var RadioGroupIndicator = React2.forwardRef(
  (props, forwardedRef) => {
    const { __scopeRadioGroup, ...indicatorProps } = props;
    const radioScope = useRadioScope(__scopeRadioGroup);
    return /* @__PURE__ */ jsxRuntimeExports.jsx(RadioIndicator, { ...radioScope, ...indicatorProps, ref: forwardedRef });
  }
);
RadioGroupIndicator.displayName = INDICATOR_NAME2;
var Root2 = RadioGroup$1;
var Item2 = RadioGroupItem$1;
var Indicator = RadioGroupIndicator;

const React$1 = await importShared('react');
const RadioGroup = React$1.forwardRef(({ className, ...props }, ref) => {
  return /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(
    Root2,
    {
      className: cn("grid gap-2", className),
      ...props,
      ref
    },
    void 0,
    false,
    {
      fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/ui/radio-group.tsx",
      lineNumber: 11,
      columnNumber: 5
    },
    globalThis
  );
});
RadioGroup.displayName = Root2.displayName;
const RadioGroupItem = React$1.forwardRef(({ className, ...props }, ref) => {
  return /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(
    Item2,
    {
      ref,
      className: cn(
        "aspect-square h-4 w-4 rounded-full border border-primary text-primary ring-offset-background focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        className
      ),
      ...props,
      children: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Indicator, { className: "flex items-center justify-center", children: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "h-2.5 w-2.5 rounded-full bg-current" }, void 0, false, {
        fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/ui/radio-group.tsx",
        lineNumber: 34,
        columnNumber: 9
      }, globalThis) }, void 0, false, {
        fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/ui/radio-group.tsx",
        lineNumber: 33,
        columnNumber: 7
      }, globalThis)
    },
    void 0,
    false,
    {
      fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/ui/radio-group.tsx",
      lineNumber: 25,
      columnNumber: 5
    },
    globalThis
  );
});
RadioGroupItem.displayName = Item2.displayName;

const React = await importShared('react');
const Sheet = Root$6;
const SheetPortal = Portal;
const SheetOverlay = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(
  Overlay,
  {
    className: cn(
      "fixed inset-0 z-50 bg-background/80 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className
    ),
    ...props,
    ref
  },
  void 0,
  false,
  {
    fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/ui/sheet.tsx",
    lineNumber: 20,
    columnNumber: 3
  },
  globalThis
));
SheetOverlay.displayName = Overlay.displayName;
const sheetVariants = cva(
  "fixed z-50 gap-4 bg-background p-6 shadow-lg transition ease-in-out data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:duration-300 data-[state=open]:duration-500",
  {
    variants: {
      side: {
        top: "inset-x-0 top-0 border-b data-[state=closed]:slide-out-to-top data-[state=open]:slide-in-from-top",
        bottom: "inset-x-0 bottom-0 border-t data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom",
        left: "inset-y-0 left-0 h-full w-3/4 border-r data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left sm:max-w-sm",
        right: "inset-y-0 right-0 h-full w-3/4 border-l data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right sm:max-w-sm"
      }
    },
    defaultVariants: {
      side: "right"
    }
  }
);
const SheetContent = React.forwardRef(({ side = "right", className, children, ...props }, ref) => /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(SheetPortal, { children: [
  /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(SheetOverlay, {}, void 0, false, {
    fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/ui/sheet.tsx",
    lineNumber: 59,
    columnNumber: 5
  }, globalThis),
  /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(
    Content$1,
    {
      ref,
      className: cn(sheetVariants({ side }), className),
      ...props,
      children: [
        children,
        /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Close, { className: "absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-secondary", children: [
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(X, { className: "h-4 w-4" }, void 0, false, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/ui/sheet.tsx",
            lineNumber: 67,
            columnNumber: 9
          }, globalThis),
          /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("span", { className: "sr-only", children: "Close" }, void 0, false, {
            fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/ui/sheet.tsx",
            lineNumber: 68,
            columnNumber: 9
          }, globalThis)
        ] }, void 0, true, {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/ui/sheet.tsx",
          lineNumber: 66,
          columnNumber: 7
        }, globalThis)
      ]
    },
    void 0,
    true,
    {
      fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/ui/sheet.tsx",
      lineNumber: 60,
      columnNumber: 5
    },
    globalThis
  )
] }, void 0, true, {
  fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/ui/sheet.tsx",
  lineNumber: 58,
  columnNumber: 3
}, globalThis));
SheetContent.displayName = Content$1.displayName;
const SheetHeader = ({
  className,
  ...props
}) => /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(
  "div",
  {
    className: cn(
      "flex flex-col space-y-2 text-center sm:text-left",
      className
    ),
    ...props
  },
  void 0,
  false,
  {
    fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/ui/sheet.tsx",
    lineNumber: 79,
    columnNumber: 3
  },
  globalThis
);
SheetHeader.displayName = "SheetHeader";
const SheetTitle = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(
  Title,
  {
    ref,
    className: cn("text-lg font-semibold text-foreground", className),
    ...props
  },
  void 0,
  false,
  {
    fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/ui/sheet.tsx",
    lineNumber: 107,
    columnNumber: 3
  },
  globalThis
));
SheetTitle.displayName = Title.displayName;
const SheetDescription = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(
  Description,
  {
    ref,
    className: cn("text-sm text-muted-foreground", className),
    ...props
  },
  void 0,
  false,
  {
    fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/ui/sheet.tsx",
    lineNumber: 119,
    columnNumber: 3
  },
  globalThis
));
SheetDescription.displayName = Description.displayName;

const {useEffect,useState} = await importShared('react');
const SmokeFreeCounter = ({ quitDate, className }) => {
  const [timeUnits, setTimeUnits] = useState([
    { value: 0, unit: "days", label: "Days" },
    { value: 0, unit: "hours", label: "Hours" },
    { value: 0, unit: "minutes", label: "Minutes" },
    { value: 0, unit: "seconds", label: "Seconds" }
  ]);
  useEffect(() => {
    if (!quitDate)
      return;
    const calculateTimeDifference = () => {
      const now = /* @__PURE__ */ new Date();
      const timeDiff = now.getTime() - quitDate.getTime();
      const seconds = Math.floor(timeDiff / 1e3) % 60;
      const minutes = Math.floor(timeDiff / (1e3 * 60)) % 60;
      const hours = Math.floor(timeDiff / (1e3 * 60 * 60)) % 24;
      const days = Math.floor(timeDiff / (1e3 * 60 * 60 * 24));
      setTimeUnits([
        { value: days, unit: "days", label: "Days" },
        { value: hours, unit: "hours", label: "Hours" },
        { value: minutes, unit: "minutes", label: "Minutes" },
        { value: seconds, unit: "seconds", label: "Seconds" }
      ]);
    };
    calculateTimeDifference();
    const interval = setInterval(calculateTimeDifference, 1e3);
    return () => clearInterval(interval);
  }, [quitDate]);
  const getMotivationalMessage = () => {
    const days = timeUnits[0].value;
    if (days === 0)
      return "Every minute counts!";
    if (days < 3)
      return "The first days are the hardest. You're doing great!";
    if (days < 7)
      return "Almost a week! Your body is healing.";
    if (days < 14)
      return "One week down! Cravings are getting weaker.";
    if (days < 30)
      return "Fantastic progress! Your lungs are recovering.";
    if (days < 90)
      return "Over a month smoke-free! You're a champion!";
    if (days < 180)
      return "Months of freedom! Your health is transforming.";
    if (days < 365)
      return "Incredible journey! You're inspiring others.";
    return "A year or more! You've reclaimed your health and life!";
  };
  return /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(Card, { className: cn("overflow-hidden", className), children: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(CardContent, { className: "p-4", children: [
    /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "mb-2", children: [
      /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("h3", { className: "text-sm font-medium", children: "Smoke-Free Time" }, void 0, false, {
        fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/ui/smoke-free-counter.tsx",
        lineNumber: 70,
        columnNumber: 11
      }, globalThis),
      /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("p", { className: "text-xs text-gray-500", children: getMotivationalMessage() }, void 0, false, {
        fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/ui/smoke-free-counter.tsx",
        lineNumber: 71,
        columnNumber: 11
      }, globalThis)
    ] }, void 0, true, {
      fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/ui/smoke-free-counter.tsx",
      lineNumber: 69,
      columnNumber: 9
    }, globalThis),
    /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "flex justify-between mt-4", children: timeUnits.map((unit, index) => /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("div", { className: "flex flex-col items-center", children: [
      /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(
        motion.div,
        {
          className: "bg-gradient-to-b from-blue-50 to-blue-100 rounded-lg w-16 h-16 flex items-center justify-center shadow-sm",
          initial: { scale: 0.8, opacity: 0 },
          animate: { scale: 1, opacity: 1 },
          transition: {
            delay: index * 0.1,
            type: "spring",
            stiffness: 260,
            damping: 20
          },
          children: /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV(
            motion.span,
            {
              initial: { y: -10, opacity: 0 },
              animate: { y: 0, opacity: 1 },
              className: "text-xl font-bold text-blue-700",
              children: unit.value
            },
            `${unit.unit}-${unit.value}`,
            false,
            {
              fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/ui/smoke-free-counter.tsx",
              lineNumber: 88,
              columnNumber: 17
            },
            globalThis
          )
        },
        void 0,
        false,
        {
          fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/ui/smoke-free-counter.tsx",
          lineNumber: 77,
          columnNumber: 15
        },
        globalThis
      ),
      /* @__PURE__ */ jsxDevRuntimeExports.jsxDEV("span", { className: "text-xs text-gray-500 mt-1", children: unit.label }, void 0, false, {
        fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/ui/smoke-free-counter.tsx",
        lineNumber: 97,
        columnNumber: 15
      }, globalThis)
    ] }, unit.unit, true, {
      fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/ui/smoke-free-counter.tsx",
      lineNumber: 76,
      columnNumber: 13
    }, globalThis)) }, void 0, false, {
      fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/ui/smoke-free-counter.tsx",
      lineNumber: 74,
      columnNumber: 9
    }, globalThis)
  ] }, void 0, true, {
    fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/ui/smoke-free-counter.tsx",
    lineNumber: 68,
    columnNumber: 7
  }, globalThis) }, void 0, false, {
    fileName: "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/ui/smoke-free-counter.tsx",
    lineNumber: 67,
    columnNumber: 5
  }, globalThis);
};

export { Avatar as A, Checkbox as C, Progress as P, RadioGroup as R, Switch as S, AvatarImage as a, AvatarFallback as b, RadioGroupItem as c, Sheet as d, SheetContent as e, SheetHeader as f, SheetTitle as g, SheetDescription as h, Alert as i, AlertTitle as j, AlertDescription as k, SmokeFreeCounter as l };

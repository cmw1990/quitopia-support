export { a5 as Accordion, a8 as AccordionContent, a6 as AccordionItem, a7 as AccordionTrigger, A as Avatar, l as AvatarFallback, k as AvatarImage, m as Badge, B as Button, C as Checkbox, D as Dialog, o as DialogContent, r as DialogDescription, s as DialogFooter, p as DialogHeader, q as DialogTitle, a9 as DialogTrigger, t as DropdownMenu, J as DropdownMenuCheckboxItem, v as DropdownMenuContent, N as DropdownMenuGroup, y as DropdownMenuItem, w as DropdownMenuLabel, O as DropdownMenuPortal, W as DropdownMenuRadioGroup, K as DropdownMenuRadioItem, x as DropdownMenuSeparator, M as DropdownMenuShortcut, Q as DropdownMenuSub, U as DropdownMenuSubContent, V as DropdownMenuSubTrigger, u as DropdownMenuTrigger, L as Label, aa as Popover, ac as PopoverContent, ab as PopoverTrigger, P as Progress, R as RadioGroup, d as RadioGroupItem, e as Select, h as SelectContent, ad as SelectGroup, i as SelectItem, ae as SelectLabel, ah as SelectScrollDownButton, ag as SelectScrollUpButton, af as SelectSeparator, f as SelectTrigger, g as SelectValue, n as Separator, X as Sheet, Z as SheetClose, _ as SheetContent, a2 as SheetDescription, a0 as SheetFooter, $ as SheetHeader, a1 as SheetTitle, Y as SheetTrigger, j as Slider, S as Switch, T as Tabs, c as TabsContent, a as TabsList, b as TabsTrigger, E as Toast, H as ToastAction, G as ToastDescription, z as ToastProvider, F as ToastTitle, a3 as badgeVariants, I as buttonVariants, a4 as toastVariants } from './toast-58ac552a.js';
import { f as cn } from './card-7a71f808.js';
export { C as Card, d as CardContent, c as CardDescription, e as CardFooter, a as CardHeader, b as CardTitle } from './card-7a71f808.js';
import { i as importShared } from './react-vendor-773e5a75.js';
import { j as jsxRuntimeExports } from './ui-vendor-336c871f.js';

const {useEffect,useRef} = await importShared('react');

const {motion} = await importShared('framer-motion');
function WaterAnimation({
  className,
  color = "primary",
  customColor,
  intensity = "medium",
  speed = "medium",
  interactive = true
}) {
  const containerRef = useRef(null);
  const waveRef1 = useRef(null);
  const waveRef2 = useRef(null);
  const waveRef3 = useRef(null);
  const canvasRef = useRef(null);
  const colorVariants = {
    primary: "from-primary/5 to-primary/10",
    secondary: "from-secondary/5 to-secondary/10",
    accent: "from-accent/5 to-accent/10",
    success: "from-emerald-50/50 to-green-50/50",
    info: "from-blue-50/50 to-indigo-50/50"
  };
  const intensityVariants = {
    subtle: "opacity-20",
    medium: "opacity-40",
    strong: "opacity-60"
  };
  const speedVariants = {
    slow: 15,
    medium: 10,
    fast: 5
  };
  useEffect(() => {
    if (!interactive || !containerRef.current)
      return;
    const handleMouseMove = (e) => {
      if (!containerRef.current)
        return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const relX = x / rect.width;
      const relY = y / rect.height;
      if (waveRef1.current) {
        waveRef1.current.style.transform = `translate(${relX * 10}px, ${relY * 5}px)`;
      }
      if (waveRef2.current) {
        waveRef2.current.style.transform = `translate(${-relX * 15}px, ${-relY * 7}px)`;
      }
      if (waveRef3.current) {
        waveRef3.current.style.transform = `translate(${relX * 7}px, ${-relY * 10}px)`;
      }
    };
    const handleMouseLeave = () => {
      if (waveRef1.current)
        waveRef1.current.style.transform = "";
      if (waveRef2.current)
        waveRef2.current.style.transform = "";
      if (waveRef3.current)
        waveRef3.current.style.transform = "";
    };
    const container = containerRef.current;
    container.addEventListener("mousemove", handleMouseMove);
    container.addEventListener("mouseleave", handleMouseLeave);
    return () => {
      container.removeEventListener("mousemove", handleMouseMove);
      container.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [interactive]);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas)
      return;
    const ctx = canvas.getContext("2d");
    if (!ctx)
      return;
    let animationFrameId;
    let time = 0;
    const resizeCanvas = () => {
      const { width, height } = canvas.getBoundingClientRect();
      canvas.style.width = width + "px";
      canvas.style.height = height + "px";
      const dpr = window.devicePixelRatio || 1;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.scale(dpr, dpr);
    };
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);
    const intensityFactor = getIntensityFactor();
    const speedFactor = getSpeedFactor();
    const colorValue = getColorValue();
    const animate = () => {
      time += 0.01 * speedFactor;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const { width, height } = canvas.getBoundingClientRect();
      for (let i = 0; i < 3; i++) {
        const frequency = 5e-3 + i * 2e-3;
        const amplitude = 15 * intensityFactor * (1 - i * 0.2);
        const phase = time * (1 + i * 0.1);
        ctx.beginPath();
        for (let x = 0; x < width; x += 5) {
          const y = height / 2 + Math.sin(x * frequency + phase) * amplitude + Math.sin(x * frequency * 2 + phase * 1.5) * (amplitude * 0.5);
          if (x === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }
        ctx.lineTo(width, height);
        ctx.lineTo(0, height);
        ctx.closePath();
        const gradient = ctx.createLinearGradient(0, 0, 0, height);
        gradient.addColorStop(0, "rgba(255, 255, 255, 0)");
        const baseColor = colorValue.replace(/rgba?\(([^)]+)\)/, (_, p1) => {
          const parts = p1.split(",").map((part) => part.trim());
          return parts.slice(0, 3).join(", ");
        });
        gradient.addColorStop(0.7, `rgba(${baseColor}, 0.05)`);
        gradient.addColorStop(1, `rgba(${baseColor}, 0.1)`);
        ctx.fillStyle = gradient;
        ctx.fill();
      }
      for (let i = 0; i < 2; i++) {
        const frequency = 0.01 + i * 5e-3;
        const amplitude = 10 * intensityFactor * (1 - i * 0.3);
        const phase = time * 0.7 * (1 + i * 0.2);
        ctx.beginPath();
        for (let y = 0; y < height; y += 5) {
          const x = width / 2 + Math.sin(y * frequency + phase) * amplitude + Math.sin(y * frequency * 1.5 + phase * 0.8) * (amplitude * 0.3);
          if (y === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }
        ctx.lineTo(width, height);
        ctx.lineTo(width, 0);
        ctx.closePath();
        const gradient = ctx.createLinearGradient(0, 0, width, 0);
        gradient.addColorStop(0, "rgba(255, 255, 255, 0)");
        const baseColor = colorValue.replace(/rgba?\(([^)]+)\)/, (_, p1) => {
          const parts = p1.split(",").map((part) => part.trim());
          return parts.slice(0, 3).join(", ");
        });
        gradient.addColorStop(0.7, `rgba(${baseColor}, 0.03)`);
        gradient.addColorStop(1, `rgba(${baseColor}, 0.07)`);
        ctx.fillStyle = gradient;
        ctx.fill();
      }
      animationFrameId = requestAnimationFrame(animate);
    };
    animate();
    return () => {
      window.removeEventListener("resize", resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, [color, customColor, intensity, speed]);
  const getColorValue = () => {
    if (customColor)
      return customColor;
    switch (color) {
      case "primary":
        return "rgba(59, 130, 246, 0.8)";
      case "secondary":
        return "rgba(99, 102, 241, 0.8)";
      case "accent":
        return "rgba(236, 72, 153, 0.8)";
      case "success":
        return "rgba(34, 197, 94, 0.8)";
      case "info":
        return "rgba(6, 182, 212, 0.8)";
      default:
        return "rgba(59, 130, 246, 0.8)";
    }
  };
  const getIntensityFactor = () => {
    switch (intensity) {
      case "subtle":
        return 0.3;
      case "medium":
        return 0.6;
      case "strong":
        return 1;
      default:
        return 0.6;
    }
  };
  const getSpeedFactor = () => {
    switch (speed) {
      case "slow":
        return 0.5;
      case "medium":
        return 1;
      case "fast":
        return 2;
      default:
        return 1;
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "div",
    {
      ref: containerRef,
      className: cn(
        "absolute inset-0 overflow-hidden pointer-events-none",
        interactive && "pointer-events-auto",
        className
      ),
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          motion.div,
          {
            ref: waveRef1,
            className: cn(
              "absolute inset-0 bg-gradient-to-r rounded-[100%]",
              colorVariants[color],
              intensityVariants[intensity]
            ),
            animate: {
              scale: [1, 1.05, 1],
              x: [0, 10, 0],
              y: [0, 5, 0],
              borderRadius: [
                "100% 100% 100% 100%",
                "70% 80% 90% 60%",
                "100% 100% 100% 100%"
              ]
            },
            transition: {
              duration: speedVariants[speed],
              repeat: Infinity,
              ease: "easeInOut"
            },
            style: {
              filter: "blur(40px)"
            }
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          motion.div,
          {
            ref: waveRef2,
            className: cn(
              "absolute inset-0 bg-gradient-to-br rounded-[100%]",
              colorVariants[color],
              intensityVariants[intensity]
            ),
            animate: {
              scale: [1.1, 1, 1.1],
              x: [5, -5, 5],
              y: [10, 0, 10],
              borderRadius: [
                "90% 80% 70% 85%",
                "60% 100% 80% 90%",
                "90% 80% 70% 85%"
              ]
            },
            transition: {
              duration: speedVariants[speed] * 1.2,
              repeat: Infinity,
              ease: "easeInOut"
            },
            style: {
              filter: "blur(30px)"
            }
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          motion.div,
          {
            ref: waveRef3,
            className: cn(
              "absolute inset-0 bg-gradient-to-tr rounded-[100%]",
              colorVariants[color],
              intensityVariants[intensity]
            ),
            animate: {
              scale: [0.9, 1.1, 0.9],
              x: [-10, 0, -10],
              y: [-5, 10, -5],
              borderRadius: [
                "85% 90% 80% 75%",
                "75% 80% 90% 95%",
                "85% 90% 80% 75%"
              ]
            },
            transition: {
              duration: speedVariants[speed] * 0.8,
              repeat: Infinity,
              ease: "easeInOut"
            },
            style: {
              filter: "blur(50px)"
            }
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "canvas",
          {
            ref: canvasRef,
            className: "absolute inset-0 w-full h-full",
            style: { pointerEvents: "none" }
          }
        )
      ]
    }
  );
}

export { WaterAnimation };

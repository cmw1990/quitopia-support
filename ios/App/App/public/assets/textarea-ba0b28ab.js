import { i as importShared } from './react-vendor-773e5a75.js';
import { f as cn } from './card-7a71f808.js';
import { j as jsxRuntimeExports } from './ui-vendor-336c871f.js';

const React$2 = await importShared('react');
const {ChevronLeft,ChevronRight} = await importShared('lucide-react');
React$2.forwardRef(
  ({ className, value = /* @__PURE__ */ new Date(), onSelect, disabled = false, ...props }, ref) => {
    const [month, setMonth] = React$2.useState(
      value?.getMonth() || (/* @__PURE__ */ new Date()).getMonth()
    );
    const [year, setYear] = React$2.useState(
      value?.getFullYear() || (/* @__PURE__ */ new Date()).getFullYear()
    );
    React$2.useEffect(() => {
      if (value) {
        setMonth(value.getMonth());
        setYear(value.getFullYear());
      }
    }, [value]);
    const getDaysInMonth = (month2, year2) => {
      return new Date(year2, month2 + 1, 0).getDate();
    };
    const getFirstDayOfMonth = (month2, year2) => {
      return new Date(year2, month2, 1).getDay();
    };
    const isCurrentDate = (day) => {
      const today = /* @__PURE__ */ new Date();
      return day === today.getDate() && month === today.getMonth() && year === today.getFullYear();
    };
    const isSelectedDate = (day) => {
      return value?.getDate() === day && value?.getMonth() === month && value?.getFullYear() === year;
    };
    const renderCalendarDays = () => {
      const daysInMonth = getDaysInMonth(month, year);
      const firstDay = getFirstDayOfMonth(month, year);
      const days = [];
      for (let i = 0; i < firstDay; i++) {
        days.push(/* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-9 h-9" }, `empty-${i}`));
      }
      for (let i = 1; i <= daysInMonth; i++) {
        const isSelected = isSelectedDate(i);
        const isCurrent = isCurrentDate(i);
        days.push(
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              type: "button",
              disabled,
              className: cn(
                "w-9 h-9 rounded-md flex items-center justify-center text-sm",
                isSelected ? "bg-primary text-primary-foreground font-semibold" : isCurrent ? "border border-primary text-primary font-semibold" : "hover:bg-accent",
                disabled && "opacity-50 cursor-not-allowed"
              ),
              onClick: () => {
                if (!disabled && onSelect) {
                  onSelect(new Date(year, month, i));
                }
              },
              children: i
            },
            i
          )
        );
      }
      return days;
    };
    const goToPreviousMonth = () => {
      if (month === 0) {
        setMonth(11);
        setYear(year - 1);
      } else {
        setMonth(month - 1);
      }
    };
    const goToNextMonth = () => {
      if (month === 11) {
        setMonth(0);
        setYear(year + 1);
      } else {
        setMonth(month + 1);
      }
    };
    const months = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December"
    ];
    const dayNames = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
    return /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "div",
      {
        ref,
        className: cn(
          "p-3 space-y-4 bg-white dark:bg-gray-800 rounded-md shadow-sm",
          className
        ),
        ...props,
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "div",
            { className: "flex justify-between items-center", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "button",
                {
                  type: "button",
                  disabled,
                  className: cn(
                    "p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700",
                    disabled && "opacity-50 cursor-not-allowed"
                  ),
                  onClick: goToPreviousMonth,
                  children: /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronLeft, { className: "h-4 w-4" })
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "div",
                { className: "font-semibold text-sm", children: [
                  months[month],
                  " ",
                  year
                ] }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "button",
                {
                  type: "button",
                  disabled,
                  className: cn(
                    "p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700",
                    disabled && "opacity-50 cursor-not-allowed"
                  ),
                  onClick: goToNextMonth,
                  children: /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { className: "h-4 w-4" })
                }
              )
            ] }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "div",
            { className: "grid grid-cols-7 gap-1 text-center", children: dayNames.map(
              (day) => /* @__PURE__ */ jsxRuntimeExports.jsx(
                "div",
                {
                  className: "text-xs text-gray-500 dark:text-gray-400 font-medium",
                  children: day
                },
                day
              )
            ) }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-7 gap-1", children: renderCalendarDays() })
        ]
      }
    );
  }
);

const React$1 = await importShared('react');
const Input = React$1.forwardRef(
  ({ className, type, ...props }, ref) => {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      "input",
      {
        type,
        className: cn(
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          className
        ),
        ref,
        ...props
      }
    );
  }
);
Input.displayName = "Input";

const React = await importShared('react');
const Textarea = React.forwardRef(
  ({ className, ...props }, ref) => {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      "textarea",
      {
        className: cn(
          "flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          className
        ),
        ref,
        ...props
      }
    );
  }
);
Textarea.displayName = "Textarea";

export { Input as I, Textarea as T };

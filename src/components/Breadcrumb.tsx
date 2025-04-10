import { Link, useLocation } from "react-router-dom";
import { ChevronRight, Home } from "lucide-react";

const routeLabels: Record<string, string> = {
  app: "Dashboard",
  focus: "Focus Enhancement",
  physical: "Physical Energy",
  mental: "Mental Energy",
  sleep: "Sleep Optimization",
  tools: "Energy Tools",
  consultation: "Professional Support",
  recipes: "Energy Recipes",
  analytics: "Analytics",
};

export function Breadcrumb() {
  const location = useLocation();
  const pathSegments = location.pathname.split("/").filter(Boolean);

  return (
    <nav className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
      <Link
        to="/"
        className="flex items-center hover:text-gray-900 dark:hover:text-white"
      >
        <Home className="h-4 w-4" />
      </Link>
      {pathSegments.map((segment, index) => (
        <div key={segment} className="flex items-center">
          <ChevronRight className="h-4 w-4 mx-1" />
          <Link
            to={`/${pathSegments.slice(0, index + 1).join("/")}`}
            className="hover:text-gray-900 dark:hover:text-white"
          >
            {routeLabels[segment] || segment}
          </Link>
        </div>
      ))}
    </nav>
  );
}

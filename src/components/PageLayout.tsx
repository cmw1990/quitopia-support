import { ReactNode } from "react";
import { Breadcrumb } from "./Breadcrumb";
import { cn } from "@/lib/utils";

interface PageLayoutProps {
  children: ReactNode;
  title: string;
  description?: string;
  className?: string;
  actions?: ReactNode;
}

export function PageLayout({
  children,
  title,
  description,
  className,
  actions,
}: PageLayoutProps) {
  return (
    <div className="space-y-6">
      <div className="border-b border-gray-200 dark:border-gray-800 pb-4">
        <Breadcrumb />
        <div className="flex items-center justify-between mt-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              {title}
            </h1>
            {description && (
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                {description}
              </p>
            )}
          </div>
          {actions && <div className="flex items-center gap-4">{actions}</div>}
        </div>
      </div>
      <div className={cn("", className)}>{children}</div>
    </div>
  );
}

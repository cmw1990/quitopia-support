import React from "react";
import { cn } from "@/lib/utils";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue 
} from "./select";
import { Button } from "./button";
import { ArrowDownAZ, ArrowUpAZ, ChevronDown } from "lucide-react";

export type SortOption = 
  | "name_asc"
  | "name_desc"
  | "price_asc"
  | "price_desc"
  | "rating_desc"
  | "rating_asc"
  | "popularity_desc"
  | "newest";

interface SortOptionConfig {
  value: SortOption;
  label: string;
  icon?: React.ReactNode;
}

export interface ProductSortingProps {
  onSortChange: (option: SortOption) => void;
  currentSort: SortOption;
  className?: string;
  variant?: "select" | "buttons" | "responsive";
}

// Available sort options
const SORT_OPTIONS: SortOptionConfig[] = [
  { value: "popularity_desc", label: "Most Popular" },
  { value: "newest", label: "Newest First" },
  { value: "rating_desc", label: "Highest Rated" },
  { value: "rating_asc", label: "Lowest Rated" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
  { value: "name_asc", label: "Name: A to Z", icon: <ArrowDownAZ className="h-4 w-4" /> },
  { value: "name_desc", label: "Name: Z to A", icon: <ArrowUpAZ className="h-4 w-4" /> },
];

export function ProductSorting({
  onSortChange,
  currentSort,
  className,
  variant = "responsive"
}: ProductSortingProps) {
  // Function to get the label for the current sort option
  const getCurrentSortLabel = (): string => {
    return SORT_OPTIONS.find(option => option.value === currentSort)?.label || "Sort By";
  };

  // Render select variant
  const renderSelectVariant = () => (
    <Select
      value={currentSort}
      onValueChange={(value) => onSortChange(value as SortOption)}
    >
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Sort By" />
      </SelectTrigger>
      <SelectContent>
        {SORT_OPTIONS.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            <div className="flex items-center">
              {option.icon && <span className="mr-2">{option.icon}</span>}
              {option.label}
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );

  // Render buttons variant
  const renderButtonsVariant = () => (
    <div className="flex flex-wrap gap-2">
      {SORT_OPTIONS.map((option) => (
        <Button
          key={option.value}
          variant={currentSort === option.value ? "default" : "outline"}
          size="sm"
          onClick={() => onSortChange(option.value)}
          className="flex items-center"
        >
          {option.icon && <span className="mr-1">{option.icon}</span>}
          {option.label}
        </Button>
      ))}
    </div>
  );

  // Render responsive variant (dropdown on mobile, buttons on desktop)
  const renderResponsiveVariant = () => (
    <>
      <div className="md:hidden">
        {renderSelectVariant()}
      </div>
      <div className="hidden md:block">
        {renderButtonsVariant()}
      </div>
    </>
  );

  // Render variant based on prop
  const renderVariant = () => {
    switch (variant) {
      case "select":
        return renderSelectVariant();
      case "buttons":
        return renderButtonsVariant();
      case "responsive":
      default:
        return renderResponsiveVariant();
    }
  };

  // Render compact mobile dropdown
  const renderMobileDropdown = () => (
    <div className="relative inline-block md:hidden">
      <Button
        variant="outline"
        className="flex items-center"
        size="sm"
      >
        <span className="mr-1">Sort: {getCurrentSortLabel()}</span>
        <ChevronDown className="h-4 w-4" />
      </Button>
      <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-popover z-10 hidden">
        {SORT_OPTIONS.map((option) => (
          <button
            key={option.value}
            className={cn(
              "w-full px-4 py-2 text-left text-sm",
              currentSort === option.value ? "bg-accent text-accent-foreground" : "hover:bg-accent hover:text-accent-foreground"
            )}
            onClick={() => onSortChange(option.value)}
          >
            <div className="flex items-center">
              {option.icon && <span className="mr-2">{option.icon}</span>}
              {option.label}
            </div>
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div className={cn("", className)}>
      {renderVariant()}
    </div>
  );
} 
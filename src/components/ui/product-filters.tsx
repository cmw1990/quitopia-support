import React from "react";
import { cn } from "@/lib/utils";
import { Badge } from "./badge";
import { Button } from "./button";
import { Checkbox } from "./checkbox";
import { Label } from "./label";
import { Slider } from "./slider";
import { ProductCategory, ProductStrength } from "./smokeless-product-card";
import { 
  Filter, 
  SlidersHorizontal, 
  X, 
  Check, 
  ChevronDown, 
  ChevronUp 
} from "lucide-react";

interface FilterSection {
  id: string;
  title: string;
  expanded: boolean;
}

export interface ProductFiltersProps {
  onFilterChange: (filters: ProductFilters) => void;
  className?: string;
  initialFilters?: Partial<ProductFilters>;
  compact?: boolean;
}

export interface ProductFilters {
  categories: string[];
  strengths: string[];
  flavors: string[];
  brands: string[];
  nicotineRange: [number, number];
  priceRange: [number, number];
  naturalOnly: boolean;
  hideOutOfStock: boolean;
  country: string;
  showAffiliateOnly: boolean;
}

// Available options for filters
const CATEGORIES: { value: ProductCategory; label: string }[] = [
  { value: "nicotine_pouch", label: "Nicotine Pouch" },
  { value: "gum", label: "Gum" },
  { value: "lozenge", label: "Lozenge" },
  { value: "patch", label: "Patch" },
  { value: "inhaler", label: "Inhaler" },
  { value: "mouth_spray", label: "Mouth Spray" },
  { value: "toothpick", label: "Toothpick" },
  { value: "other", label: "Other" },
];

const STRENGTHS: { value: ProductStrength; label: string }[] = [
  { value: "very_low", label: "Very Low" },
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
  { value: "very_high", label: "Very High" },
];

const FLAVORS: string[] = [
  "Mint", "Wintergreen", "Cinnamon", "Coffee", "Citrus", 
  "Berry", "Tobacco", "Menthol", "Fruit", "Unflavored"
];

const BRANDS: string[] = [
  "ZYN", "On!", "Velo", "Nordic Spirit", "Nicorette", 
  "NicoDerm", "Nicotinell", "Habitrol", "White Fox"
];

const DEFAULT_FILTERS: ProductFilters = {
  categories: [],
  strengths: [],
  flavors: [],
  brands: [],
  nicotineRange: [0, 50],
  priceRange: [0, 100],
  naturalOnly: false,
  hideOutOfStock: false,
  country: "",
  showAffiliateOnly: false,
};

export function ProductFilters({
  onFilterChange,
  className,
  initialFilters,
  compact = false
}: ProductFiltersProps) {
  // Combine default filters with initial filters
  const mergedInitialFilters = { ...DEFAULT_FILTERS, ...initialFilters };
  
  // State for filters
  const [filters, setFilters] = React.useState<ProductFilters>(mergedInitialFilters);
  
  // State for mobile drawer
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  
  // State for expanded sections
  const [sections, setSections] = React.useState<FilterSection[]>([
    { id: "categories", title: "Product Type", expanded: true },
    { id: "strengths", title: "Strength", expanded: true },
    { id: "flavors", title: "Flavors", expanded: !compact },
    { id: "brands", title: "Brands", expanded: !compact },
    { id: "nicotine", title: "Nicotine Content", expanded: !compact },
    { id: "price", title: "Price Range", expanded: !compact },
    { id: "other", title: "Other Filters", expanded: !compact },
  ]);
  
  // Toggle a section's expanded state
  const toggleSection = (sectionId: string) => {
    setSections(
      sections.map(section => 
        section.id === sectionId 
          ? { ...section, expanded: !section.expanded } 
          : section
      )
    );
  };
  
  // Handle filter changes
  const handleFilterChange = <K extends keyof ProductFilters>(
    key: K,
    value: ProductFilters[K]
  ) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };
  
  // Handle checkbox changes for arrays (categories, strengths, flavors, brands)
  const handleCheckboxChange = <K extends "categories" | "strengths" | "flavors" | "brands">(
    key: K,
    value: ProductFilters[K][number],
    checked: boolean
  ) => {
    const currentValues = filters[key] as any[];
    const newValues = checked
      ? [...currentValues, value]
      : currentValues.filter(v => v !== value);
    
    handleFilterChange(key, newValues as ProductFilters[K]);
  };
  
  // Handle clearing all filters
  const handleClearFilters = () => {
    setFilters(DEFAULT_FILTERS);
    onFilterChange(DEFAULT_FILTERS);
  };
  
  // Check if any filters are applied
  const hasActiveFilters = 
    filters.categories.length > 0 ||
    filters.strengths.length > 0 ||
    filters.flavors.length > 0 ||
    filters.brands.length > 0 ||
    filters.nicotineRange[0] > DEFAULT_FILTERS.nicotineRange[0] ||
    filters.nicotineRange[1] < DEFAULT_FILTERS.nicotineRange[1] ||
    filters.priceRange[0] > DEFAULT_FILTERS.priceRange[0] ||
    filters.priceRange[1] < DEFAULT_FILTERS.priceRange[1] ||
    filters.naturalOnly ||
    filters.hideOutOfStock;
  
  // Get the number of active filters
  const getActiveFilterCount = (): number => {
    let count = 0;
    count += filters.categories.length;
    count += filters.strengths.length;
    count += filters.flavors.length;
    count += filters.brands.length;
    count += (filters.nicotineRange[0] > DEFAULT_FILTERS.nicotineRange[0] || 
              filters.nicotineRange[1] < DEFAULT_FILTERS.nicotineRange[1]) ? 1 : 0;
    count += (filters.priceRange[0] > DEFAULT_FILTERS.priceRange[0] || 
              filters.priceRange[1] < DEFAULT_FILTERS.priceRange[1]) ? 1 : 0;
    count += filters.naturalOnly ? 1 : 0;
    count += filters.hideOutOfStock ? 1 : 0;
    return count;
  };
  
  // Find if a section is expanded
  const isSectionExpanded = (sectionId: string): boolean => {
    return sections.find(section => section.id === sectionId)?.expanded || false;
  };
  
  // Render section header
  const renderSectionHeader = (section: FilterSection) => (
    <div 
      className="flex items-center justify-between py-2 cursor-pointer"
      onClick={() => toggleSection(section.id)}
    >
      <h3 className="text-sm font-medium">{section.title}</h3>
      {section.expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
    </div>
  );
  
  // Render filter content
  const renderFilterContent = () => (
    <div className="space-y-6">
      {/* Categories Section */}
      <div className="space-y-2">
        {renderSectionHeader(sections.find(s => s.id === "categories")!)}
        {isSectionExpanded("categories") && (
          <div className="space-y-2">
            {CATEGORIES.map((category) => (
              <div key={category.value} className="flex items-center space-x-2">
                <Checkbox 
                  id={`category-${category.value}`}
                  checked={filters.categories.includes(category.value)}
                  onCheckedChange={(checked) => 
                    handleCheckboxChange("categories", category.value, checked as boolean)
                  }
                />
                <Label 
                  htmlFor={`category-${category.value}`}
                  className="text-sm cursor-pointer"
                >
                  {category.label}
                </Label>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Strengths Section */}
      <div className="space-y-2">
        {renderSectionHeader(sections.find(s => s.id === "strengths")!)}
        {isSectionExpanded("strengths") && (
          <div className="space-y-2">
            {STRENGTHS.map((strength) => (
              <div key={strength.value} className="flex items-center space-x-2">
                <Checkbox 
                  id={`strength-${strength.value}`}
                  checked={filters.strengths.includes(strength.value)}
                  onCheckedChange={(checked) => 
                    handleCheckboxChange("strengths", strength.value, checked as boolean)
                  }
                />
                <Label 
                  htmlFor={`strength-${strength.value}`}
                  className="text-sm cursor-pointer"
                >
                  {strength.label}
                </Label>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Flavors Section */}
      <div className="space-y-2">
        {renderSectionHeader(sections.find(s => s.id === "flavors")!)}
        {isSectionExpanded("flavors") && (
          <div className="grid grid-cols-2 gap-2">
            {FLAVORS.map((flavor) => (
              <div key={flavor} className="flex items-center space-x-2">
                <Checkbox 
                  id={`flavor-${flavor}`}
                  checked={filters.flavors.includes(flavor)}
                  onCheckedChange={(checked) => 
                    handleCheckboxChange("flavors", flavor, checked as boolean)
                  }
                />
                <Label 
                  htmlFor={`flavor-${flavor}`}
                  className="text-sm cursor-pointer"
                >
                  {flavor}
                </Label>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Brands Section */}
      <div className="space-y-2">
        {renderSectionHeader(sections.find(s => s.id === "brands")!)}
        {isSectionExpanded("brands") && (
          <div className="grid grid-cols-2 gap-2">
            {BRANDS.map((brand) => (
              <div key={brand} className="flex items-center space-x-2">
                <Checkbox 
                  id={`brand-${brand}`}
                  checked={filters.brands.includes(brand)}
                  onCheckedChange={(checked) => 
                    handleCheckboxChange("brands", brand, checked as boolean)
                  }
                />
                <Label 
                  htmlFor={`brand-${brand}`}
                  className="text-sm cursor-pointer"
                >
                  {brand}
                </Label>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Nicotine Range Section */}
      <div className="space-y-2">
        {renderSectionHeader(sections.find(s => s.id === "nicotine")!)}
        {isSectionExpanded("nicotine") && (
          <div className="space-y-4 px-1">
            <div className="flex justify-between text-xs">
              <span>{filters.nicotineRange[0]} mg</span>
              <span>{filters.nicotineRange[1]} mg</span>
            </div>
            <Slider 
              value={filters.nicotineRange}
              min={0}
              max={50}
              step={1}
              onValueChange={(value) => handleFilterChange("nicotineRange", value as [number, number])}
            />
            <div className="text-xs text-center text-muted-foreground">
              {filters.nicotineRange[0]} - {filters.nicotineRange[1]} mg
            </div>
          </div>
        )}
      </div>
      
      {/* Price Range Section */}
      <div className="space-y-2">
        {renderSectionHeader(sections.find(s => s.id === "price")!)}
        {isSectionExpanded("price") && (
          <div className="space-y-4 px-1">
            <div className="flex justify-between text-xs">
              <span>${filters.priceRange[0]}</span>
              <span>${filters.priceRange[1]}</span>
            </div>
            <Slider 
              value={filters.priceRange}
              min={0}
              max={100}
              step={5}
              onValueChange={(value) => handleFilterChange("priceRange", value as [number, number])}
            />
            <div className="text-xs text-center text-muted-foreground">
              ${filters.priceRange[0]} - ${filters.priceRange[1]}
            </div>
          </div>
        )}
      </div>
      
      {/* Other Filters Section */}
      <div className="space-y-2">
        {renderSectionHeader(sections.find(s => s.id === "other")!)}
        {isSectionExpanded("other") && (
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="natural-only" 
                checked={filters.naturalOnly}
                onCheckedChange={(checked) => 
                  handleFilterChange("naturalOnly", checked as boolean)
                }
              />
              <Label 
                htmlFor="natural-only"
                className="text-sm cursor-pointer"
              >
                Natural ingredients only
              </Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="hide-out-of-stock" 
                checked={filters.hideOutOfStock}
                onCheckedChange={(checked) => 
                  handleFilterChange("hideOutOfStock", checked as boolean)
                }
              />
              <Label 
                htmlFor="hide-out-of-stock"
                className="text-sm cursor-pointer"
              >
                Hide out of stock
              </Label>
            </div>
          </div>
        )}
      </div>
      
      {/* Clear Filters */}
      {hasActiveFilters && (
        <div className="pt-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full"
            onClick={handleClearFilters}
          >
            <X className="h-4 w-4 mr-2" />
            Clear All Filters
          </Button>
        </div>
      )}
    </div>
  );
  
  // Mobile drawer for filters
  const renderMobileFilters = () => (
    <div className="md:hidden">
      <Button 
        variant="outline" 
        size="sm" 
        className="w-full"
        onClick={() => setDrawerOpen(true)}
      >
        <Filter className="h-4 w-4 mr-2" />
        Filters
        {getActiveFilterCount() > 0 && (
          <Badge className="ml-2 rounded-full px-1 py-0 h-5 min-w-5 flex items-center justify-center">
            {getActiveFilterCount()}
          </Badge>
        )}
      </Button>
      
      {drawerOpen && (
        <div className="fixed inset-0 z-50 bg-background flex flex-col overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b">
            <h2 className="text-lg font-medium">Filter Products</h2>
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => setDrawerOpen(false)}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
          
          <div className="flex-1 overflow-auto p-4">
            {renderFilterContent()}
          </div>
          
          <div className="p-4 border-t">
            <Button 
              className="w-full"
              onClick={() => setDrawerOpen(false)}
            >
              <Check className="h-4 w-4 mr-2" />
              Apply Filters
            </Button>
          </div>
        </div>
      )}
    </div>
  );
  
  return (
    <div className={cn("space-y-4", className)}>
      {/* Active Filter Badges */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2 mb-4">
          {filters.categories.map((category) => (
            <Badge 
              key={category} 
              variant="secondary"
              className="cursor-pointer"
              onClick={() => handleCheckboxChange("categories", category, false)}
            >
              {CATEGORIES.find(c => c.value === category)?.label}
              <X className="h-3 w-3 ml-1" />
            </Badge>
          ))}
          
          {filters.strengths.map((strength) => (
            <Badge 
              key={strength} 
              variant="secondary"
              className="cursor-pointer"
              onClick={() => handleCheckboxChange("strengths", strength, false)}
            >
              {STRENGTHS.find(s => s.value === strength)?.label}
              <X className="h-3 w-3 ml-1" />
            </Badge>
          ))}
          
          {filters.flavors.map((flavor) => (
            <Badge 
              key={flavor} 
              variant="secondary"
              className="cursor-pointer"
              onClick={() => handleCheckboxChange("flavors", flavor, false)}
            >
              {flavor}
              <X className="h-3 w-3 ml-1" />
            </Badge>
          ))}
          
          {filters.brands.map((brand) => (
            <Badge 
              key={brand} 
              variant="secondary"
              className="cursor-pointer"
              onClick={() => handleCheckboxChange("brands", brand, false)}
            >
              {brand}
              <X className="h-3 w-3 ml-1" />
            </Badge>
          ))}
          
          {(filters.nicotineRange[0] > DEFAULT_FILTERS.nicotineRange[0] || 
            filters.nicotineRange[1] < DEFAULT_FILTERS.nicotineRange[1]) && (
            <Badge 
              variant="secondary"
              className="cursor-pointer"
              onClick={() => handleFilterChange("nicotineRange", DEFAULT_FILTERS.nicotineRange)}
            >
              Nicotine: {filters.nicotineRange[0]}-{filters.nicotineRange[1]} mg
              <X className="h-3 w-3 ml-1" />
            </Badge>
          )}
          
          {(filters.priceRange[0] > DEFAULT_FILTERS.priceRange[0] || 
            filters.priceRange[1] < DEFAULT_FILTERS.priceRange[1]) && (
            <Badge 
              variant="secondary"
              className="cursor-pointer"
              onClick={() => handleFilterChange("priceRange", DEFAULT_FILTERS.priceRange)}
            >
              Price: ${filters.priceRange[0]}-${filters.priceRange[1]}
              <X className="h-3 w-3 ml-1" />
            </Badge>
          )}
          
          {filters.naturalOnly && (
            <Badge 
              variant="secondary"
              className="cursor-pointer"
              onClick={() => handleFilterChange("naturalOnly", false)}
            >
              Natural Only
              <X className="h-3 w-3 ml-1" />
            </Badge>
          )}
          
          {filters.hideOutOfStock && (
            <Badge 
              variant="secondary"
              className="cursor-pointer"
              onClick={() => handleFilterChange("hideOutOfStock", false)}
            >
              In Stock Only
              <X className="h-3 w-3 ml-1" />
            </Badge>
          )}
        </div>
      )}
      
      {/* Mobile Filters Button */}
      {renderMobileFilters()}
      
      {/* Desktop Filters */}
      <div className="hidden md:block">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-medium">Filters</h3>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => {
              // Toggle all sections
              const allExpanded = sections.every(section => section.expanded);
              setSections(
                sections.map(section => ({ ...section, expanded: !allExpanded }))
              );
            }}
          >
            <SlidersHorizontal className="h-4 w-4 mr-1" />
            {sections.every(section => section.expanded) ? "Collapse All" : "Expand All"}
          </Button>
        </div>
        
        {renderFilterContent()}
      </div>
    </div>
  );
} 
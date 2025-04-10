
import { Button } from "@/components/ui/button"
import { Moon, Zap, Filter, X } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { PlanCategory } from "@/types/energyPlans"

interface PlanFiltersProps {
  selectedCategory: PlanCategory | null
  onCategoryChange: (category: PlanCategory | null) => void
  energyLevel?: number | null
  onEnergyLevelChange?: (level: number | null) => void
  duration?: number | null 
  onDurationChange?: (minutes: number | null) => void
  activeFilters?: number
}

export const PlanFilters = ({ 
  selectedCategory, 
  onCategoryChange,
  energyLevel,
  onEnergyLevelChange,
  duration,
  onDurationChange,
  activeFilters = 0
}: PlanFiltersProps) => {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">Filters</span>
          {activeFilters > 0 && (
            <Badge variant="secondary" className="ml-2">
              {activeFilters}
            </Badge>
          )}
        </div>
        {activeFilters > 0 && (
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => {
              onCategoryChange(null);
              onEnergyLevelChange?.(null);
              onDurationChange?.(null);
            }}
            className="h-8 px-2"
          >
            <X className="h-4 w-4 mr-1" />
            Clear all
          </Button>
        )}
      </div>

      <div className="flex flex-wrap gap-4">
        <div className="flex gap-2">
          <Button
            variant={selectedCategory === 'charged' ? 'default' : 'outline'} 
            onClick={() => onCategoryChange(selectedCategory === 'charged' ? null : 'charged')}
            className="min-w-[120px]"
          >
            <Zap className="h-4 w-4 mr-2" />
            <span>Charged</span>
            {selectedCategory === 'charged' && (
              <Badge variant="secondary" className="ml-2 bg-white/20">Active</Badge>
            )}
          </Button>
          <Button
            variant={selectedCategory === 'recharged' ? 'default' : 'outline'}
            onClick={() => onCategoryChange(selectedCategory === 'recharged' ? null : 'recharged')}
            className="min-w-[120px]"
          >
            <Moon className="h-4 w-4 mr-2" />
            <span>Recharged</span>
            {selectedCategory === 'recharged' && (
              <Badge variant="secondary" className="ml-2 bg-white/20">Active</Badge>
            )}
          </Button>
        </div>

        <Select
          value={energyLevel?.toString() || ""}
          onValueChange={(value) => onEnergyLevelChange?.(value ? parseInt(value) : null)}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Energy Level Required" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Any Energy Level</SelectItem>
            {[1,2,3,4,5].map((level) => (
              <SelectItem key={level} value={level.toString()}>
                Level {level}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={duration?.toString() || ""}
          onValueChange={(value) => onDurationChange?.(value ? parseInt(value) : null)}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Duration" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Any Duration</SelectItem>
            <SelectItem value="15">15 minutes</SelectItem>
            <SelectItem value="30">30 minutes</SelectItem>
            <SelectItem value="45">45 minutes</SelectItem>
            <SelectItem value="60">60 minutes</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}

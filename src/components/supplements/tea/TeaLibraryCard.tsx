
import { Clock, Leaf, Thermometer } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TeaWarningBadge } from "./TeaWarningBadge"

interface TeaLibraryCardProps {
  tea: {
    id: string
    name: string
    category: string
    description: string
    optimal_temp_celsius: number
    steep_time_range_seconds: number[]
    benefits?: string[]
    caffeine_content_mg?: number | null
    warnings_and_interactions?: string[]
    water_quality_notes?: string
  }
}

export function TeaLibraryCard({ tea }: TeaLibraryCardProps) {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="p-4">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">{tea.name}</CardTitle>
            <Badge className="mt-1">{tea.category}</Badge>
          </div>
          {tea.caffeine_content_mg !== null && (
            <Badge variant="outline">
              {tea.caffeine_content_mg}mg caffeine
            </Badge>
          )}
          {tea.warnings_and_interactions?.length > 0 && (
            <TeaWarningBadge warnings={tea.warnings_and_interactions} />
          )}
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-0 space-y-4">
        <p className="text-sm text-muted-foreground">{tea.description}</p>
        
        {tea.benefits && tea.benefits.length > 0 && (
          <div>
            <p className="text-sm font-medium mb-1">Benefits:</p>
            <div className="flex flex-wrap gap-1">
              {tea.benefits.map((benefit, idx) => (
                <Badge key={idx} variant="secondary">
                  {benefit}
                </Badge>
              ))}
            </div>
          </div>
        )}

        <div className="pt-2 border-t space-y-2">
          <div className="flex items-center text-sm">
            <Thermometer className="w-4 h-4 mr-2" />
            <span>{tea.optimal_temp_celsius}°C</span>
          </div>
          <div className="flex items-center text-sm">
            <Clock className="w-4 h-4 mr-2" />
            <span>{tea.steep_time_range_seconds[0]/60}-{tea.steep_time_range_seconds[1]/60} min</span>
          </div>
          {tea.water_quality_notes && (
            <p className="text-sm text-muted-foreground">{tea.water_quality_notes}</p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

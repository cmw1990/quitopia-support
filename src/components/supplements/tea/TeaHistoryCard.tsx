
import { format } from "date-fns"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"

interface TeaHistoryCardProps {
  log: {
    id: string
    tea_name: string
    brewing_method: string
    rating: number
    amount_grams: number
    water_temperature?: number
    steep_time_seconds?: number
    effects?: string[]
    notes?: string
    consumed_at: string
  }
  getEffectivityBadgeColor: (rating: number) => "default" | "secondary" | "outline"
}

export function TeaHistoryCard({ log, getEffectivityBadgeColor }: TeaHistoryCardProps) {
  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex justify-between items-start">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <h3 className="font-medium">{log.tea_name}</h3>
              <Badge variant={getEffectivityBadgeColor(log.rating)}>
                Rating: {log.rating}/5
              </Badge>
            </div>
            
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>{log.amount_grams}g</span>
              <span>•</span>
              <span className="capitalize">{log.brewing_method.replace('_', ' ')}</span>
              {log.water_temperature && (
                <>
                  <span>•</span>
                  <Badge variant="outline">{log.water_temperature}°C</Badge>
                </>
              )}
              {log.steep_time_seconds && (
                <>
                  <span>•</span>
                  <Badge variant="outline">
                    {Math.floor(log.steep_time_seconds / 60)}:{(log.steep_time_seconds % 60).toString().padStart(2, '0')}
                  </Badge>
                </>
              )}
            </div>

            {log.effects && log.effects.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {log.effects.map((effect, index) => (
                  <Badge key={index} variant="secondary">{effect}</Badge>
                ))}
              </div>
            )}
            
            {log.notes && (
              <p className="text-sm text-muted-foreground mt-2">{log.notes}</p>
            )}
          </div>
          
          <time className="text-xs text-muted-foreground">
            {format(new Date(log.consumed_at), 'MMM d, yyyy h:mm a')}
          </time>
        </div>
      </CardContent>
    </Card>
  )
}

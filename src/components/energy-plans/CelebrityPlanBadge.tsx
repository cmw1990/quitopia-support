
import { Badge } from "@/components/ui/badge"
import { CircleUser } from "lucide-react"

interface CelebrityPlanBadgeProps {
  name: string
  profession?: string
}

export const CelebrityPlanBadge = ({ name, profession }: CelebrityPlanBadgeProps) => {
  return (
    <Badge variant="outline" className="gap-1 py-1 bg-primary/5">
      <CircleUser className="h-3 w-3" />
      <span>{name}</span>
      {profession && <span className="opacity-70">• {profession}</span>}
    </Badge>
  )
}

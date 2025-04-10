
import { AlertCircle } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface TeaWarningBadgeProps {
  warnings: string[]
}

export function TeaWarningBadge({ warnings }: TeaWarningBadgeProps) {
  if (!warnings?.length) return null

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger>
          <Badge variant="destructive" className="gap-1">
            <AlertCircle className="h-3 w-3" />
            Warning
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <ul className="list-disc pl-4 space-y-1">
            {warnings.map((warning, idx) => (
              <li key={idx} className="text-sm">{warning}</li>
            ))}
          </ul>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

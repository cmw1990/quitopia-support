
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Baby, Brain, Heart, Moon } from "lucide-react"
import type { UserLifeSituationRow } from "@/types/supabase"

interface LifeSituationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentSituation: UserLifeSituationRow['situation'] | null
  onUpdateSituation: (situation: UserLifeSituationRow['situation']) => void
}

export function LifeSituationDialog({
  open,
  onOpenChange,
  currentSituation,
  onUpdateSituation
}: LifeSituationDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Your Current Life Situation</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <RadioGroup 
            onValueChange={(value) => onUpdateSituation(value as UserLifeSituationRow['situation'])}
            defaultValue={currentSituation || "regular"}
            className="gap-4"
          >
            <div className="flex items-center space-x-2 rounded-lg border p-4 hover:bg-accent cursor-pointer">
              <RadioGroupItem value="regular" id="regular" />
              <Label htmlFor="regular" className="flex-1 cursor-pointer">
                <div className="font-semibold flex items-center gap-2">
                  <Brain className="h-4 w-4" />
                  Regular Energy Management
                </div>
                <div className="text-sm text-muted-foreground">
                  Standard energy and focus optimization for everyday life
                </div>
              </Label>
            </div>

            <div className="flex items-center space-x-2 rounded-lg border p-4 hover:bg-accent cursor-pointer">
              <RadioGroupItem value="pregnancy" id="pregnancy" />
              <Label htmlFor="pregnancy" className="flex-1 cursor-pointer">
                <div className="font-semibold flex items-center gap-2">
                  <Baby className="h-4 w-4" />
                  Pregnancy
                </div>
                <div className="text-sm text-muted-foreground">
                  Tailored energy plans and wellness support during pregnancy
                </div>
              </Label>
            </div>

            <div className="flex items-center space-x-2 rounded-lg border p-4 hover:bg-accent cursor-pointer">
              <RadioGroupItem value="postpartum" id="postpartum" />
              <Label htmlFor="postpartum" className="flex-1 cursor-pointer">
                <div className="font-semibold flex items-center gap-2">
                  <Heart className="h-4 w-4" />
                  Postpartum Recovery
                </div>
                <div className="text-sm text-muted-foreground">
                  Specialized support and energy management for the postpartum period
                </div>
              </Label>
            </div>

            <div className="flex items-center space-x-2 rounded-lg border p-4 hover:bg-accent cursor-pointer">
              <RadioGroupItem value="breastfeeding" id="breastfeeding" />
              <Label htmlFor="breastfeeding" className="flex-1 cursor-pointer">
                <div className="font-semibold flex items-center gap-2">
                  <Moon className="h-4 w-4" />
                  Breastfeeding
                </div>
                <div className="text-sm text-muted-foreground">
                  Energy support and wellness optimization during breastfeeding
                </div>
              </Label>
            </div>
          </RadioGroup>
        </div>
      </DialogContent>
    </Dialog>
  )
}

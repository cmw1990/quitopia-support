
import { useEffect, useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Info } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/integrations/supabase/supabase-client"
import { useAuth } from "@/components/AuthProvider"

interface AgeVerificationDialogProps {
  isOpen: boolean
  onClose: () => void
  onVerified: () => void
}

export function AgeVerificationDialog({ isOpen, onClose, onVerified }: AgeVerificationDialogProps) {
  const [agreed, setAgreed] = useState(false)
  const [hideWarnings, setHideWarnings] = useState(false)
  const { toast } = useToast()
  const { session } = useAuth()

  const handleVerify = async () => {
    if (!agreed) {
      toast({
        title: "Please confirm",
        description: "You must confirm that you meet the age requirements to continue.",
        variant: "destructive"
      })
      return
    }

    if (session?.user?.id) {
      try {
        const { error } = await supabase
          .from('user_content_preferences')
          .upsert({
            user_id: session.user.id,
            age_verified: true,
            age_verified_at: new Date().toISOString(),
            hide_nicotine_warnings: hideWarnings
          })

        if (error) throw error
      } catch (error) {
        console.error('Error saving preferences:', error)
      }
    }

    onVerified()
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Age Verification Required</DialogTitle>
          <DialogDescription>
            This section contains nicotine products which are age-restricted.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              You must be of legal age to purchase nicotine products in your country (21+ in the United States).
            </AlertDescription>
          </Alert>

          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="age-verification"
                checked={agreed}
                onCheckedChange={(checked) => setAgreed(checked as boolean)}
              />
              <label
                htmlFor="age-verification"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                I confirm that I am of legal age to purchase nicotine products in my country
              </label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="hide-warnings"
                checked={hideWarnings}
                onCheckedChange={(checked) => setHideWarnings(checked as boolean)}
              />
              <label
                htmlFor="hide-warnings"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                I understand the risks. Don't show warnings again.
              </label>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleVerify}>
            Verify Age
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

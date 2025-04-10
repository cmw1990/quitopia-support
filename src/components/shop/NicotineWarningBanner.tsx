
import { useState, useEffect } from 'react'
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { AlertTriangle } from "lucide-react"
import { Link } from "react-router-dom"
import { supabase } from "@/integrations/supabase/supabase-client"
import { useAuth } from "@/components/AuthProvider"

export function NicotineWarningBanner() {
  const [show, setShow] = useState(true)
  const { session } = useAuth()

  useEffect(() => {
    const checkPreferences = async () => {
      if (session?.user?.id) {
        const { data } = await supabase
          .from('user_content_preferences')
          .select('hide_nicotine_warnings')
          .eq('user_id', session.user.id)
          .single()

        if (data?.hide_nicotine_warnings) {
          setShow(false)
        }
      }
    }

    checkPreferences()
  }, [session?.user?.id])

  if (!show) return null

  return (
    <Alert>
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle>Important Health Information</AlertTitle>
      <AlertDescription className="space-y-4">
        <p>
          Nicotine is highly addictive and can harm your health. If you don't currently use nicotine products, 
          we strongly recommend exploring alternatives for your goals.
        </p>
        <div className="flex space-x-4">
          <Button variant="outline" asChild>
            <Link to="/nicotine-health-info">Learn More About Risks</Link>
          </Button>
          <Button variant="outline" onClick={() => setShow(false)}>
            Hide Warning
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  )
}

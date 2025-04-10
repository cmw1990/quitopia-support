
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { TopNav } from "@/components/layout/TopNav"
import { ToolAnalyticsWrapper } from "@/components/tools/ToolAnalyticsWrapper"

export default function BreathTraining() {
  return (
    <ToolAnalyticsWrapper 
      toolName="breath-training-devices"
      toolType="biohacking"
      toolSettings={{}}
    >
      <div className="min-h-screen bg-background">
        <TopNav />
        <div className="container mx-auto p-4">
          <Card>
            <CardHeader>
              <CardTitle>Breath Training Devices</CardTitle>
              <CardDescription>
                Compare and track your breathing training progress with devices like Relaxator, PowerBreathe, and Airofit.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Content coming soon. This guide will include detailed information about breathing training devices,
                their benefits, and how to track your progress.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </ToolAnalyticsWrapper>
  )
}


import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { TopNav } from "@/components/layout/TopNav"
import { ToolAnalyticsWrapper } from "@/components/tools/ToolAnalyticsWrapper"

export default function BlueLightBlockers() {
  return (
    <ToolAnalyticsWrapper 
      toolName="blue-light-blockers"
      toolType="biohacking"
      toolSettings={{}}
    >
      <div className="min-h-screen bg-background">
        <TopNav />
        <div className="container mx-auto p-4">
          <Card>
            <CardHeader>
              <CardTitle>Blue Light Blockers</CardTitle>
              <CardDescription>
                Compare different blue light blocking glasses and devices.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Content coming soon. This guide will include detailed information about blue light protection methods,
                product comparisons, and optimal usage timing.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </ToolAnalyticsWrapper>
  )
}

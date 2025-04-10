
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { TopNav } from "@/components/layout/TopNav"
import { ToolAnalyticsWrapper } from "@/components/tools/ToolAnalyticsWrapper"

export default function MouthTaping() {
  return (
    <ToolAnalyticsWrapper 
      toolName="mouth-taping-guide"
      toolType="biohacking"
      toolSettings={{}}
    >
      <div className="min-h-screen bg-background">
        <TopNav />
        <div className="container mx-auto p-4">
          <Card>
            <CardHeader>
              <CardTitle>Mouth Taping Guide</CardTitle>
              <CardDescription>
                Learn about the benefits of mouth taping for better sleep and nasal breathing.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Content coming soon. This guide will include detailed information about mouth taping techniques,
                product recommendations, and best practices for optimal results.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </ToolAnalyticsWrapper>
  )
}

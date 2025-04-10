
import React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { TopNav } from "@/components/layout/TopNav"
import { ToolAnalyticsWrapper } from "@/components/tools/ToolAnalyticsWrapper"

export default function NootropicsDatabase() {
  return (
    <ToolAnalyticsWrapper 
      toolName="nootropics-database"
      toolType="biohacking"
      toolSettings={{}}
    >
      <div className="min-h-screen bg-background">
        <TopNav />
        <div className="container mx-auto p-4">
          <Card>
            <CardHeader>
              <CardTitle>Nootropics Database</CardTitle>
              <CardDescription>
                Comprehensive database of nootropics with effects, dosages, and user experiences.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Content coming soon. This database will include detailed information about different nootropics,
                their effects, recommended dosages, user experiences, and safety information.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </ToolAnalyticsWrapper>
  )
}

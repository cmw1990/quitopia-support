
import React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { TopNav } from "@/components/layout/TopNav"
import { ToolAnalyticsWrapper } from "@/components/tools/ToolAnalyticsWrapper"
import { TeaTrackingDashboard } from "@/components/supplements/tea/TeaTrackingDashboard"

export default function HerbalTeaGuide() {
  return (
    <ToolAnalyticsWrapper 
      toolName="herbal-tea-guide"
      toolType="biohacking"
      toolSettings={{}}
    >
      <div className="min-h-screen bg-background">
        <TopNav />
        <div className="container mx-auto p-4">
          <TeaTrackingDashboard />
        </div>
      </div>
    </ToolAnalyticsWrapper>
  )
}

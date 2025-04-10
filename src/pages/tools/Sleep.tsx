
import React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { TopNav } from "@/components/layout/TopNav"
import { ToolAnalyticsWrapper } from "@/components/tools/ToolAnalyticsWrapper"

export default function Sleep() {
  const sleepOptimizationTips = [
    {
      category: "Environment",
      tips: [
        "Keep your bedroom cool (65-68°F/18-20°C)",
        "Use blackout curtains or an eye mask",
        "Minimize noise with earplugs or white noise",
        "Invest in a comfortable mattress and pillows"
      ]
    },
    {
      category: "Circadian Rhythm",
      tips: [
        "Maintain consistent sleep/wake times",
        "Get morning sunlight exposure",
        "Reduce blue light exposure 2-3 hours before bed",
        "Practice a relaxing bedtime routine"
      ]
    },
    {
      category: "Lifestyle",
      tips: [
        "Exercise regularly, but not close to bedtime",
        "Avoid caffeine after 2 PM",
        "Limit alcohol and large meals before bed",
        "Practice stress-management techniques"
      ]
    },
    {
      category: "Natural Sleep Aids",
      tips: [
        "Magnesium supplementation",
        "Herbal teas (chamomile, valerian root)",
        "Essential oils (lavender, cedarwood)",
        "Deep breathing exercises"
      ]
    }
  ]

  return (
    <ToolAnalyticsWrapper 
      toolName="sleep-optimization"
      toolType="biohacking"
      toolSettings={{}}
    >
      <div className="min-h-screen bg-background">
        <TopNav />
        <div className="container mx-auto p-4">
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Sleep Optimization</CardTitle>
              <CardDescription>
                Evidence-based methods for improving sleep quality and recovery.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {sleepOptimizationTips.map((section) => (
                  <Card key={section.category}>
                    <CardHeader>
                      <CardTitle className="text-lg">{section.category}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="list-disc list-inside space-y-2">
                        {section.tips.map((tip) => (
                          <li key={tip} className="text-sm text-muted-foreground">
                            {tip}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </ToolAnalyticsWrapper>
  )
}

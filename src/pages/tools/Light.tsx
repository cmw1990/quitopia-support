
import React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { TopNav } from "@/components/layout/TopNav"
import { ToolAnalyticsWrapper } from "@/components/tools/ToolAnalyticsWrapper"

export default function Light() {
  const lightProtocols = [
    {
      category: "Red Light Therapy",
      description: "Photobiomodulation using red and near-infrared light",
      protocols: [
        "Morning exposure: 5-10 minutes at 6-12 inches distance",
        "Target areas: Face, thyroid, or specific body parts",
        "Wavelengths: 630-670nm (red) and 810-850nm (near-infrared)",
        "Benefits: Skin health, collagen production, inflammation reduction"
      ]
    },
    {
      category: "Blue Light Management",
      description: "Optimizing exposure to blue light for circadian rhythm",
      protocols: [
        "Morning: Get bright blue light exposure",
        "Evening: Use blue light blocking glasses",
        "Screen management: Use night mode after sunset",
        "Light environment: Use amber/red lighting in evening"
      ]
    },
    {
      category: "Sunlight Optimization",
      description: "Strategic use of natural light exposure",
      protocols: [
        "Morning: 10-30 minutes of direct sunlight",
        "Midday: Short exposure for vitamin D",
        "Sunset: Viewing helps regulate melatonin",
        "Season adjustments: Longer exposure in winter"
      ]
    },
    {
      category: "Therapeutic Applications",
      description: "Specific light protocols for various benefits",
      protocols: [
        "SAD treatment: Bright light therapy in morning",
        "Focus enhancement: Blue-enriched light during work",
        "Recovery: Red light post-exercise",
        "Sleep preparation: Amber light in evening"
      ]
    }
  ]

  return (
    <ToolAnalyticsWrapper 
      toolName="light-optimization"
      toolType="biohacking"
      toolSettings={{}}
    >
      <div className="min-h-screen bg-background">
        <TopNav />
        <div className="container mx-auto p-4">
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Light Optimization</CardTitle>
              <CardDescription>
                Strategic light exposure protocols for circadian health and cellular function.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {lightProtocols.map((protocol) => (
                  <Card key={protocol.category}>
                    <CardHeader>
                      <CardTitle className="text-lg">{protocol.category}</CardTitle>
                      <CardDescription>{protocol.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ul className="list-disc list-inside space-y-2">
                        {protocol.protocols.map((item) => (
                          <li key={item} className="text-sm text-muted-foreground">
                            {item}
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

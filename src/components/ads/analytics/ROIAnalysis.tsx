
import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

interface ROIAnalysisProps {
  spent: number
  revenue: number
  target: number
}

export function ROIAnalysis({ spent, revenue, target }: ROIAnalysisProps) {
  const roi = ((revenue - spent) / spent * 100).toFixed(1)
  const progress = Math.min((revenue / target) * 100, 100)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Campaign ROI</CardTitle>
        <CardDescription>Return on investment analysis</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between mb-2">
              <span>Revenue Progress</span>
              <span>{progress.toFixed(1)}%</span>
            </div>
            <Progress value={progress} />
          </div>
          
          <div className="grid grid-cols-3 gap-4">
            <div>
              <div className="text-sm text-muted-foreground">Spent</div>
              <div className="text-2xl font-bold">${spent.toFixed(2)}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Revenue</div>
              <div className="text-2xl font-bold">${revenue.toFixed(2)}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">ROI</div>
              <div className="text-2xl font-bold">{roi}%</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

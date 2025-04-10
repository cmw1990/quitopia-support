
import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface AdPreviewProps {
  placementType: string;
  productName?: string;
}

export function AdPreview({ placementType, productName = "Your Product" }: AdPreviewProps) {
  const getPreviewContent = () => {
    switch (placementType) {
      case 'feed':
        return (
          <div className="p-4 border rounded-lg">
            <div className="flex items-center space-x-4">
              <div className="w-20 h-20 bg-muted rounded-lg" />
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Sponsored</p>
                <h3 className="font-medium">{productName}</h3>
                <p className="text-sm text-muted-foreground">Feed placement preview</p>
              </div>
            </div>
          </div>
        )
      case 'banner':
        return (
          <div className="p-4 border rounded-lg bg-muted">
            <div className="h-32 flex items-center justify-center">
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Sponsored Banner</p>
                <h3 className="font-medium">{productName}</h3>
              </div>
            </div>
          </div>
        )
      case 'sidebar':
        return (
          <div className="p-4 border rounded-lg">
            <div className="w-full space-y-2">
              <p className="text-sm text-muted-foreground">Sponsored</p>
              <div className="w-full h-40 bg-muted rounded-lg" />
              <h3 className="font-medium">{productName}</h3>
            </div>
          </div>
        )
      case 'openApp':
        return (
          <div className="p-4 border rounded-lg bg-background">
            <div className="h-48 flex items-center justify-center bg-muted rounded-lg">
              <div className="text-center space-y-2">
                <p className="text-sm text-muted-foreground">App Open Ad</p>
                <h3 className="font-medium">{productName}</h3>
                <p className="text-sm">Displayed when users open the app</p>
              </div>
            </div>
          </div>
        )
      default:
        return null
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ad Preview</CardTitle>
      </CardHeader>
      <CardContent>
        {getPreviewContent()}
      </CardContent>
    </Card>
  )
}

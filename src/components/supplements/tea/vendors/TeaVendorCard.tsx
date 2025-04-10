
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Globe, MapPin, Star, Store, Shield, ExternalLink, ThumbsUp } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface TeaVendorCardProps {
  vendor: {
    id: string
    name: string
    website: string
    description: string
    shipping_regions: string[]
    rating: number
    review_count: number
    verification_status: string
  }
}

export function TeaVendorCard({ vendor }: TeaVendorCardProps) {
  return (
    <Card className="hover:shadow-md transition-shadow relative">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-1.5">
            <CardTitle className="flex items-center gap-2">
              <Store className="h-5 w-5 text-muted-foreground" />
              {vendor.name}
            </CardTitle>
            <CardDescription className="line-clamp-2">{vendor.description}</CardDescription>
          </div>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                {vendor.verification_status === 'verified' ? (
                  <Badge variant="secondary" className="bg-green-100 text-green-800 hover:bg-green-200 flex items-center gap-1">
                    <Shield className="h-3 w-3" />
                    Verified
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-muted-foreground">
                    Pending Verification
                  </Badge>
                )}
              </TooltipTrigger>
              <TooltipContent>
                {vendor.verification_status === 'verified' 
                  ? "This vendor has been verified for quality and authenticity"
                  : "This vendor's verification is in progress"}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger className="flex items-center gap-2">
                  <Star className="h-4 w-4 text-yellow-400" />
                  <span className="font-medium">{vendor.rating.toFixed(1)}</span>
                  <span className="text-sm text-muted-foreground">
                    ({vendor.review_count} reviews)
                  </span>
                </TooltipTrigger>
                <TooltipContent>Average customer rating</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-start gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground mt-1" />
              <div className="flex flex-wrap gap-1">
                {vendor.shipping_regions.map((region) => (
                  <Badge 
                    key={region} 
                    variant="outline"
                    className="cursor-help"
                  >
                    Ships to {region}
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" asChild>
              <a 
                href={vendor.website} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-2"
              >
                <Globe className="h-4 w-4" />
                Visit Website
              </a>
            </Button>
            <Button variant="outline" size="icon" asChild>
              <a 
                href={`/vendors/${vendor.id}`}
                className="flex items-center justify-center"
                title="View Vendor Details"
              >
                <ExternalLink className="h-4 w-4" />
              </a>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
